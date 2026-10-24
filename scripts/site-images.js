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
const { kitForHunt, buildKitHtml } = require('../src/kits/engine');
const { plan, hostPage, sidekickPage, stickers } = require('../src/host/host');
const THEMES = require('../src/generator/themes');
const { nameSlots, sheetLayers, blankJob, blankLayers, pageSlots, saveIndex } = require('../src/generator/name-slots');

const IMG = path.join(__dirname, '..', 'docs', 'img');
const SPOTS = ['front_door', 'shoe_rack', 'couch', 'dryer', 'bathtub', 'bookshelf', 'pet_bed', 'kitchen_table'];
const PARTY = { date: 'Saturday, June 3', time: '2 to 4 pm', place: 'Our house', rsvp: 'Text Sam' };
const HOST_SIZE = [540, 1080]; // the saved Field Kit phone screenshots (captured at 720x1440)
const dataUrl = (f) => `data:image/png;base64,${fs.readFileSync(f).toString('base64')}`;
// Stand-ins for the family's photos on the Field Kit photo screen: crops of the theme's printed set
// (the hero scene and the box build), [url, label, [file, left, top, right, bottom as fractions]].
function fieldKitPhotos(id) {
  const hero = path.join(IMG, 'hero', `${id}.webp`), howto = path.join(IMG, 'howto', `${id}.webp`);
  const list = [[hero, 0.04, 0.6, 0.42, 1], [hero, 0.71, 0.02, 0.97, 0.62], [hero, 0.17, 0.06, 0.42, 0.62]];
  if (fs.existsSync(howto)) list.push([howto, 0.02, 0.2, 0.5, 0.48]);
  const labels = ['Ready for the mission', 'Card 3 found', 'Puzzle time', 'Treasure found'];
  return list.map((c, k) => [`/photo/${k}`, labels[k], c]);
}
function photoJpg([file, l, t, r, b]) {
  const { execFileSync } = require('child_process');
  return execFileSync('python3', ['-c', `
import sys, io
from PIL import Image
im = Image.open(sys.argv[1]).convert('RGB'); W, H = im.size
l, t, r, b = map(float, sys.argv[2:6])
c = im.crop((int(l * W), int(t * H), int(r * W), int(b * H))); c.thumbnail((1200, 1200))
o = io.BytesIO(); c.save(o, 'JPEG', quality=88); sys.stdout.buffer.write(o.getvalue())`, file, String(l), String(t), String(r), String(b)]);
}
// The kit page with the wow prop, counted from 1.
const wowPage = (kitId) => {
  const html = buildKitHtml({ kit: kitId, childName: 'Maya', subjects: [], lenient: true });
  return html.slice(0, html.indexOf('<section class="page props wow"')).split('<section class="page').length;
};

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
    // Shop-style kits (pizza, library...) keep their styled card photo and the page gallery-images.js made;
    // a new one without a card photo yet gets the page fan like the other themes.
    const kit = kitForHunt(id)?.bigSign && fs.existsSync(path.join(IMG, `kit-${id}.webp`)) ? null : kitForHunt(id);
    const pg = (k, n) => path.join(dir(k), `page-${n}.png`);
    if (!hostOnly) {
    const huntCfg = { theme: id, childName: 'Maya', age: 6, spots: SPOTS, pictures: true };
    await renderPdf(huntCfg, `${dir('hunt')}.pdf`, { pngDir: dir('hunt'), nameSlots: 'Maya' });
    const roles = pageRoles(buildHtml(huntCfg));
    // The "What's in the box" hunt pages, by role: guide, briefing, first clue sheet, puzzle, certificate, picture hunt checklist.
    huntParts[id] = { guide: roles.host, briefing: roles.briefing, cards: roles.sheet, puzzle: roles.puzzle, cert: roles.cert, bonus: roles['pic-lists'] };
    await renderParty({ theme: id, childName: 'Maya', age: 6, party: PARTY }, `${dir('party')}.pdf`, { pngDir: dir('party'), nameSlots: 'Maya' });
    if (kit) await renderKit({ kit: kit.id, childName: 'Maya', subjects: [], lenient: true }, `${dir('kit')}.pdf`, { pngDir: dir('kit'), nameSlots: 'Maya' });

    // Play kit card: three kit pages fanned out on a transparent background.
    if (kit) {
      const fan = await browser.newPage({ viewport: { width: 677, height: 497 }, deviceScaleFactor: 2 });
      const sheet = (n, x, y, r, w, blank) => `<img data-key="${n}" src="${dataUrl(blank ? path.join(dir('kit'), 'blank', `page-${n}.png`) : pg('kit', n))}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;transform:rotate(${r}deg);box-shadow:0 10px 28px rgba(40,50,90,.25)">`;
      // Shop-style kits fan out the welcome poster, the shop sign and the wow prop; the others two toys.
      const [left, right, middle] = kit.bigSign ? [2, 4, wowPage(kit.id)] : [2, 8, 7];
      const fanned = (blank) => `<body style="margin:0;background:transparent">${sheet(left, 0, 40, -8, 340, blank)}${sheet(right, 330, 30, 7, 340, blank)}${sheet(middle, 150, 4, 0, 380, blank)}</body>`;
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
    const order = { hostToken: 'x'.repeat(24), config: { theme: id, childName: 'Maya', age: 6, spots: SPOTS } };
    const steps = plan(order, null).steps;
    const hide = steps.findIndex((s) => /Card 3/.test(s.title) && s.phase === 'setup');
    const play = steps.findIndex((s) => /Card 3/.test(s.title) && s.phase === 'play');
    // as for an everything bundle, so the Play Kit and Party tabs show as included, not greyed out
    const fk = () => hostPage(order, { stateUrl: '/h/state', sidekickUrl: null, downloads: [], items: ['hunt', 'kit', 'party'] });
    const photos = fieldKitPhotos(id);
    const screens = [
      ['hide', fk(), hide, (ph) => ph.click('[data-sec="hunt"]')],
      ['play', fk(), play, (ph) => ph.click('[data-sec="hunt"]')],
      ['sidekick', sidekickPage(order, { stateUrl: '/s' }), play],
      // Shop day (Clinic day for doctor, dentist and vet): a customer at the counter.
      ['shop', fk(), 0, async (ph) => { await ph.click('[data-sec="kit"]'); await ph.click('#shopOpen'); // No scrolling (the name swap's spots are measured from the top): hide what comes before the Shop day box instead.
        await ph.evaluate(() => { const box = document.querySelector('.fk-shop'); for (let e = box.previousElementSibling; e; e = e.previousElementSibling) e.style.display = 'none'; scrollTo(0, 0); }); }],
      // The photo sheet, with crops of the printed set standing in for the family's photos.
      ['photos', fk(), 0, async (ph) => {
        await ph.evaluate(async (list) => {
          const db = await new Promise((res) => { const r = indexedDB.open('lpq-fieldkit', 1); r.onupgradeneeded = () => r.result.createObjectStore('photos', { keyPath: 'id' }); r.onsuccess = () => res(r.result); });
          for (const [k, [url, label]] of list.entries()) {
            const blob = await (await fetch(url)).blob();
            await new Promise((res) => { const t = db.transaction('photos', 'readwrite'); t.objectStore('photos').put({ id: `p${k}`, key: FKCFG.key, at: k, label, blob }); t.oncomplete = res; });
          }
        }, photos);
        await ph.click('.fk-cam');
        // only the sheet shows, so the name swap doesn't pick up text hidden behind it
        await ph.evaluate(() => document.querySelectorAll('section[id^="sec-"], .sections').forEach((x) => { x.style.display = 'none'; }));
      }],
    ];
    for (const [name, html, step, act] of screens) {
      const phone = await browser.newPage({ viewport: { width: 360, height: 720 }, deviceScaleFactor: 2 });
      // the same customer and lines on every run
      await phone.addInitScript(() => { let a = 7; Math.random = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; });
      const art = stickers(order);
      await phone.route('http://host.test/**', (route) => {
        const u = new URL(route.request().url()).pathname;
        if (u === '/h') return route.fulfill({ contentType: 'text/html', body: html });
        const a = u.match(/\/art\/(\d+)\.webp$/);
        if (a && art[+a[1]]) return route.fulfill({ contentType: 'image/webp', body: fs.readFileSync(art[+a[1]]) });
        const f = u.match(/^\/photo\/(\d+)$/);
        if (f) return route.fulfill({ contentType: 'image/jpeg', body: photoJpg(photos[+f[1]][2]) });
        return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ step }) });
      });
      await phone.goto('http://host.test/h');
      await phone.waitForTimeout(400);
      if (act) { await act(phone); await phone.waitForTimeout(700); }
      await phone.screenshot({ path: path.join(tmp, `host-${id}-${name}.png`) });
      // The printed photo page that the sheet makes, for the Field Kit gallery.
      if (name === 'photos') {
        const png = await phone.evaluate(async () => {
          const list = await new Promise((res) => { const r = indexedDB.open('lpq-fieldkit', 1); r.onsuccess = () => { const out = []; const c = r.result.transaction('photos').objectStore('photos').openCursor(); c.onsuccess = () => { if (c.result) { out.push(c.result.value); c.result.continue(); } else res(out.sort((a, b) => a.at - b.at)); }; }; });
          return (await FK.photoPage(list)).toDataURL('image/png');
        });
        fs.writeFileSync(path.join(tmp, `print-${id}.png`), Buffer.from(png.split(',')[1], 'base64'));
      }
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
    elif f.startswith('print-') and f.endswith('.png'):
        Image.open(p).convert('RGB').resize((640, 828), Image.LANCZOS).save(os.path.join(img, 'host', f[6:-4] + '-print.webp'), 'WEBP', quality=84)
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
