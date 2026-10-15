// Builds the website's per-theme pictures in docs/img/: the theme card pages (pages/<id>-hunt|kit|party.webp:
// a clue card sheet, the invitation and the kit's gadget),
// the four hunt pages for "What's in the box" (pages/<id>-guide|briefing|cards|cert.webp),
// the play kit card (kit-<id>.webp) and the Host Mode phones (host/<id>-hide|play|sidekick.webp).
// Usage: node scripts/site-images.js [theme ...]
const fs = require('fs');
const os = require('os');
const path = require('path');
const { chromium } = require('playwright');
const { renderPdf } = require('../src/generator/render');
const { renderKit } = require('../src/kits/render-kit');
const { renderParty } = require('../src/party/render-party');
const { kitForHunt } = require('../src/kits/engine');
const { plan, hostPage, sidekickPage } = require('../src/host/host');
const THEMES = require('../src/generator/themes');

const IMG = path.join(__dirname, '..', 'docs', 'img');
const SPOTS = ['front_door', 'shoe_rack', 'couch', 'dryer', 'bathtub', 'bookshelf', 'pet_bed', 'kitchen_table'];
const PARTY = { date: 'Saturday, June 3', time: '2 to 4 pm', place: 'Our house', rsvp: 'Text Sam' };
const dataUrl = (f) => `data:image/png;base64,${fs.readFileSync(f).toString('base64')}`;

(async () => {
  const only = process.argv.slice(2);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'site-images-'));
  const browser = await chromium.launch();
  for (const id of Object.keys(THEMES).filter((k) => !only.length || only.includes(k))) {
    const dir = (k) => path.join(tmp, `${id}-${k}`);
    const kit = kitForHunt(id);
    await renderPdf({ theme: id, childName: 'Maya', age: 6, spots: SPOTS, pictures: true }, `${dir('hunt')}.pdf`, { pngDir: dir('hunt') });
    await renderParty({ theme: id, childName: 'Maya', age: 6, party: PARTY }, `${dir('party')}.pdf`, { pngDir: dir('party') });
    if (kit) await renderKit({ kit: kit.id, childName: 'Maya', subjects: [], lenient: true }, `${dir('kit')}.pdf`, { pngDir: dir('kit') });
    const pg = (k, n) => path.join(dir(k), `page-${n}.png`);

    // Play kit card: three kit pages fanned out on a transparent background.
    if (kit) {
      const fan = await browser.newPage({ viewport: { width: 677, height: 497 }, deviceScaleFactor: 2 });
      const sheet = (n, x, y, r, w = 340) => `<img src="${dataUrl(pg('kit', n))}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;transform:rotate(${r}deg);box-shadow:0 10px 28px rgba(40,50,90,.25)">`;
      await fan.setContent(`<body style="margin:0;background:transparent">${sheet(2, 0, 40, -8)}${sheet(9, 330, 30, 7)}${sheet(6, 150, 4, 0, 380)}</body>`);
      await fan.screenshot({ path: path.join(tmp, `kit-${id}.png`), omitBackground: true });
      if (process.env.FAN_DIR) fs.copyFileSync(path.join(tmp, `kit-${id}.png`), path.join(process.env.FAN_DIR, `kit-${id}.png`));
      await fan.close();
    }

    // Host Mode phones: hiding Card 3, then "They found Card 3" for the host and the sidekick, at 240x480.
    const order = { config: { theme: id, childName: 'Maya', age: 6, spots: SPOTS } };
    const steps = plan(order, null).steps;
    const hide = steps.findIndex((s) => /Card 3/.test(s.title) && s.phase === 'setup');
    const play = steps.findIndex((s) => /Card 3/.test(s.title) && s.phase === 'play');
    const screens = [
      ['hide', hostPage(order, { stateUrl: '/s', sidekickUrl: null, downloads: [] }), hide],
      ['play', hostPage(order, { stateUrl: '/s', sidekickUrl: null, downloads: [] }), play],
      ['sidekick', sidekickPage(order, { stateUrl: '/s' }), play],
    ];
    for (const [name, html, step] of screens) {
      const phone = await browser.newPage({ viewport: { width: 360, height: 720 }, deviceScaleFactor: 1 });
      await phone.route('http://host.test/**', (route) => route.request().url().endsWith('/h')
        ? route.fulfill({ contentType: 'text/html', body: html })
        : route.fulfill({ contentType: 'application/json', body: JSON.stringify({ step }) }));
      await phone.goto('http://host.test/h');
      await phone.waitForTimeout(400);
      await phone.screenshot({ path: path.join(tmp, `host-${id}-${name}.png`) });
      await phone.close();
    }
    console.log('Rendered', id);
  }
  await browser.close();
  // Playwright writes PNG; convert everything to WebP with Pillow.
  const { execFileSync } = require('child_process');
  execFileSync('python3', ['-c', `
import sys, os
from PIL import Image
tmp, img = sys.argv[1], sys.argv[2]
for f in os.listdir(tmp):
    p = os.path.join(tmp, f)
    if f.startswith('kit-') and f.endswith('.png'):
        Image.open(p).save(os.path.join(img, f[:-4] + '.webp'), 'WEBP', quality=82)
    elif f.startswith('host-') and f.endswith('.png'):
        Image.open(p).convert('RGB').resize((240, 480), Image.LANCZOS).save(os.path.join(img, 'host', f[5:-4] + '.webp'), 'WEBP', quality=85)
    elif os.path.isdir(p):
        theme, kind = f.rsplit('-', 1)
        n = {'hunt': 3, 'party': 2, 'kit': 6}[kind]
        Image.open(os.path.join(p, f'page-{n}.png')).convert('RGB').resize((400, 518), Image.LANCZOS).save(os.path.join(img, 'pages', f'{theme}-{kind}.webp'), 'WEBP', quality=80)
        if kind == 'hunt':
            pages = sorted(os.listdir(p), key=lambda x: int(x[5:-4]))
            for part, page in (('guide', pages[0]), ('briefing', pages[1]), ('cards', pages[2]), ('cert', pages[-1])):
                Image.open(os.path.join(p, page)).convert('RGB').resize((480, 621), Image.LANCZOS).save(os.path.join(img, 'pages', f'{theme}-{part}.webp'), 'WEBP', quality=80)
`, tmp, IMG]);
  console.log('Wrote docs/img for', only.length ? only.join(', ') : 'every theme');
})();
