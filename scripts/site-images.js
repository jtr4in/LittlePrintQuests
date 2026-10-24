// Builds the website's per-theme pictures in docs/img/: the theme card pages (pages/<id>-hunt|kit|party.webp:
// a clue card sheet, the invitation and the kit's first hands-on toy),
// the hunt pages for "What's in the box" (pages/<id>-guide|briefing|cards|puzzle|cert|bonus.webp; bonus is the picture hunt checklist),
// the play kit card (kit-<id>.webp) and the Field Kit phones (host/<id>-hide|play|sidekick.webp).
// Each picture with the child's name also gets a twin without it in docs/img/n/ (see name-slots.js).
// Usage: node scripts/site-images.js [theme ...]
// HOST_ONLY=1 redoes just the phone screenshots (fast: no PDFs).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { chromium } = require('playwright');
const { renderPdf } = require('../src/generator/render');
const { buildHtml, pageRoles } = require('../src/generator/build');
const { renderKit } = require('../src/kits/render-kit');
const { renderParty } = require('../src/party/render-party');
const { kitForHunt } = require('../src/kits/engine');
const { plan, hostPage, sidekickPage } = require('../src/host/host');
const THEMES = require('../src/generator/themes');
const { nameSlots, sheetLayers, blankJob, blankLayers, pageSlots, saveIndex } = require('../src/generator/name-slots');

const IMG = path.join(__dirname, '..', 'docs', 'img');
const SPOTS = ['front_door', 'shoe_rack', 'couch', 'dryer', 'bathtub', 'bookshelf', 'pet_bed', 'kitchen_table'];
const PARTY = { date: 'Saturday, June 3', time: '2 to 4 pm', place: 'Our house', rsvp: 'Text Sam' };
const HOST_SIZE = [540, 1080]; // the saved Field Kit phone screenshots (captured at 720x1440)
const dataUrl = (f) => `data:image/png;base64,${fs.readFileSync(f).toString('base64')}`;

(async () => {
  const only = process.argv.slice(2);
  const hostOnly = Boolean(process.env.HOST_ONLY);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'site-images-'));
  const browser = await chromium.launch();
  const index = {};
  const huntParts = {};
  const blanks = []; // [png, out webp, width, height] (no size: keep it, with transparency)
  fs.mkdirSync(path.join(IMG, 'n', 'host'), { recursive: true });
  for (const id of Object.keys(THEMES).filter((k) => !only.length || only.includes(k))) {
    const dir = (k) => path.join(tmp, `${id}-${k}`);
    if (!hostOnly) {
    // Shop-style kits (pizza, library...) keep the kit card and page theme-photos.js and gallery-images.js made.
    const kit = kitForHunt(id)?.bigSign ? null : kitForHunt(id);
    const huntCfg = { theme: id, childName: 'Maya', age: 6, spots: SPOTS, pictures: true };
    await renderPdf(huntCfg, `${dir('hunt')}.pdf`, { pngDir: dir('hunt'), nameSlots: 'Maya' });
    const roles = pageRoles(buildHtml(huntCfg));
    // The "What's in the box" hunt pages, by role: guide, briefing, first clue sheet, puzzle, certificate, picture hunt checklist.
    huntParts[id] = { guide: roles.host, briefing: roles.briefing, cards: roles.sheet, puzzle: roles.puzzle, cert: roles.cert, bonus: roles['pic-lists'] };
    await renderParty({ theme: id, childName: 'Maya', age: 6, party: PARTY }, `${dir('party')}.pdf`, { pngDir: dir('party'), nameSlots: 'Maya' });
    if (kit) await renderKit({ kit: kit.id, childName: 'Maya', subjects: [], lenient: true }, `${dir('kit')}.pdf`, { pngDir: dir('kit'), nameSlots: 'Maya' });
    const pg = (k, n) => path.join(dir(k), `page-${n}.png`);

    // Play kit card: three kit pages fanned out on a transparent background.
    if (kit) {
      const fan = await browser.newPage({ viewport: { width: 677, height: 497 }, deviceScaleFactor: 2 });
      const sheet = (n, x, y, r, w, blank) => `<img data-key="${n}" src="${dataUrl(blank ? path.join(dir('kit'), 'blank', `page-${n}.png`) : pg('kit', n))}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;transform:rotate(${r}deg);box-shadow:0 10px 28px rgba(40,50,90,.25)">`;
      const fanned = (blank) => `<body style="margin:0;background:transparent">${sheet(2, 0, 40, -8, 340, blank)}${sheet(8, 330, 30, 7, 340, blank)}${sheet(7, 150, 4, 0, 380, blank)}</body>`;
      await fan.setContent(fanned(false));
      await fan.screenshot({ path: path.join(tmp, `kit-${id}.png`), omitBackground: true });
      if (process.env.FAN_DIR) fs.copyFileSync(path.join(tmp, `kit-${id}.png`), path.join(process.env.FAN_DIR, `kit-${id}.png`));
      const layers = await fan.evaluate(sheetLayers);
      const twin = blankLayers(index, path.join(IMG, `kit-${id}.webp`), 677, 497, layers, (n) => pageSlots(pg('kit', n)));
      if (twin) {
        await fan.setContent(fanned(true));
        await fan.screenshot({ path: path.join(tmp, `blank-kit-${id}.png`), omitBackground: true });
        blanks.push([path.join(tmp, `blank-kit-${id}.png`), twin]);
      }
      await fan.close();
    }
    }

    // Field Kit phones: hiding Card 3, then "They found Card 3" for the host and the sidekick. Captured
    // at 2x and saved at 540x1080: the 240x480 they used to be looked blurry blown up in the gallery.
    const order = { config: { theme: id, childName: 'Maya', age: 6, spots: SPOTS } };
    const steps = plan(order, null).steps;
    const hide = steps.findIndex((s) => /Card 3/.test(s.title) && s.phase === 'setup');
    const play = steps.findIndex((s) => /Card 3/.test(s.title) && s.phase === 'play');
    const screens = [
      // as for an everything bundle, so the Play Kit and Party tabs show as included, not greyed out
      ['hide', hostPage(order, { stateUrl: '/s', sidekickUrl: null, downloads: [], items: ['hunt', 'kit', 'party'] }), hide],
      ['play', hostPage(order, { stateUrl: '/s', sidekickUrl: null, downloads: [], items: ['hunt', 'kit', 'party'] }), play],
      ['sidekick', sidekickPage(order, { stateUrl: '/s' }), play],
    ];
    for (const [name, html, step] of screens) {
      const phone = await browser.newPage({ viewport: { width: 360, height: 720 }, deviceScaleFactor: 2 });
      await phone.route('http://host.test/**', (route) => route.request().url().endsWith('/h')
        ? route.fulfill({ contentType: 'text/html', body: html })
        : route.fulfill({ contentType: 'application/json', body: JSON.stringify({ step }) }));
      await phone.goto('http://host.test/h');
      await phone.waitForTimeout(400);
      await phone.screenshot({ path: path.join(tmp, `host-${id}-${name}.png`) });
      // and its twin without the name, saved at the same size
      const [screen] = await phone.evaluate(`(${nameSlots})('Maya', 'html')`);
      if (screen.slots.length) {
        await phone.screenshot({ path: path.join(tmp, `blank-host-${id}-${name}.png`) });
        const key = `img/host/${id}-${name}.webp`;
        index[key] = { w: 360, h: 720, s: screen.slots };
        blanks.push([path.join(tmp, `blank-host-${id}-${name}.png`), path.join(IMG, 'n', 'host', `${id}-${name}.webp`), ...HOST_SIZE]);
      }
      await phone.close();
    }
    if (hostOnly) { console.log('Rendered phones for', id); continue; }
    // Twins of the order stack and "What's in the box" pages.
    const P = huntParts[id];
    const twins = [['hunt', 3, 'hunt', 400], ['party', 2, 'party', 400], ['hunt', P.guide, 'guide', 480], ['hunt', P.briefing, 'briefing', 480],
      ['hunt', P.cards, 'cards', 480], ['hunt', P.cert, 'cert', 480], ...(kit ? [['kit', 7, 'kit', 400]] : [])];
    for (const [k, n, part, w] of twins) {
      const twin = blankJob(index, pg(k, n), path.join(IMG, 'pages', `${id}-${part}.webp`));
      if (twin) blanks.push([...twin, w, Math.round((w * 1056) / 816)]);
    }
    console.log('Rendered', id);
  }
  await browser.close();
  saveIndex(index);
  // Playwright writes PNG; convert everything to WebP with Pillow.
  const { execFileSync } = require('child_process');
  execFileSync('python3', ['-c', `
import sys, os
from PIL import Image
import json
tmp, img, parts = sys.argv[1], sys.argv[2], json.loads(sys.argv[3])
for f in os.listdir(tmp):
    p = os.path.join(tmp, f)
    if f.startswith('kit-') and f.endswith('.png'):
        Image.open(p).save(os.path.join(img, f[:-4] + '.webp'), 'WEBP', quality=82)
    elif f.startswith('host-') and f.endswith('.png'):
        Image.open(p).convert('RGB').resize((540, 1080), Image.LANCZOS).save(os.path.join(img, 'host', f[5:-4] + '.webp'), 'WEBP', quality=84)
    elif os.path.isdir(p):
        theme, kind = f.rsplit('-', 1)
        n = {'hunt': 3, 'party': 2, 'kit': 7}[kind]
        Image.open(os.path.join(p, f'page-{n}.png')).convert('RGB').resize((400, 518), Image.LANCZOS).save(os.path.join(img, 'pages', f'{theme}-{kind}.webp'), 'WEBP', quality=80)
        if kind == 'hunt':
            for part, n in parts[theme].items():
                if n is None: continue
                Image.open(os.path.join(p, f'page-{n}.png')).convert('RGB').resize((480, 621), Image.LANCZOS).save(os.path.join(img, 'pages', f'{theme}-{part}.webp'), 'WEBP', quality=80)
`, tmp, IMG, JSON.stringify(huntParts)]);
  fs.writeFileSync(path.join(tmp, 'blanks.json'), JSON.stringify(blanks));
  execFileSync('python3', ['-c', `
import sys, json
from PIL import Image
for src, out, *size in json.load(open(sys.argv[1])):
    im = Image.open(src)
    if size: im.convert('RGB').resize(tuple(size), Image.LANCZOS).save(out, 'WEBP', quality=80)
    else: im.save(out, 'WEBP', quality=82)
`, path.join(tmp, 'blanks.json')]);
  console.log('Wrote docs/img for', only.length ? only.join(', ') : 'every theme');
})();
