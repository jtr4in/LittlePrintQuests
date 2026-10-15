// Builds the extra Etsy photos for the per-theme play kit and party pack listings
// (2400x1800 JPGs in listing-assets/): what's inside, and a close-up of the best pages.
// The main photos (kit-<id>.jpg, party-<theme>.jpg) come from listing-photos.js and party_photos.py.
// Usage: node scripts/theme-photos.js [theme ...]
const fs = require('fs');
const os = require('os');
const path = require('path');
const { chromium } = require('playwright');
const { renderKit } = require('../src/kits/render-kit');
const { renderParty } = require('../src/party/render-party');
const { KITS } = require('../src/kits/engine');
const THEMES = require('../src/generator/themes');

const OUT = path.join(__dirname, '..', 'listing-assets');
const FONTS = path.join(__dirname, '..', 'fonts');
const font = (f) => `data:font/ttf;base64,${fs.readFileSync(path.join(FONTS, f)).toString('base64')}`;
const dataUrl = (f) => `data:image/png;base64,${fs.readFileSync(f).toString('base64')}`;
const SAMPLE = { childName: 'Maya', age: 6 };

const css = (t) => `
@font-face { font-family: Fredoka; src: url(${font('Fredoka.ttf')}); font-weight: 300 700; }
@font-face { font-family: Nunito; src: url(${font('Nunito.ttf')}); font-weight: 200 1000; }
html, body { margin: 0; width: 1200px; height: 900px; background: color-mix(in srgb, ${t.colors.soft} 45%, #fbf8f1); color: ${t.colors.ink}; font-family: Nunito; overflow: hidden; }
h1 { font: 700 62px/1.05 Fredoka; margin: 0; letter-spacing: -.01em; }
.sub { font: 600 28px/1.25 Nunito; opacity: .85; margin-top: 10px; }
.top { position: absolute; left: 70px; top: 54px; right: 70px; text-align: center; }
.page { position: absolute; background: #fff; box-shadow: 0 14px 36px rgba(40,50,90,.22); }
.page img { width: 100%; display: block; }
.grid { position: absolute; left: 50%; transform: translateX(-50%); width: 1000px; top: 190px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px 28px; }
.grid figure { margin: 0; }
.grid img { width: 100%; display: block; background: #fff; box-shadow: 0 8px 20px rgba(40,50,90,.18); }
.grid figcaption { font: 600 21px/1.1 Fredoka; text-align: center; margin-top: 8px; }
.bar { position: absolute; left: 0; right: 0; bottom: 0; height: 74px; background: ${t.colors.primary}; color: #fff; font: 600 24px/74px Fredoka; text-align: center; letter-spacing: .08em; }`;

const grid = (items) => `<div class="grid">${items.map(([src, label]) => `<figure><img src="${src}">${label ? `<figcaption>${label}</figcaption>` : ''}</figure>`).join('')}</div>`;

function kitPhotos(k, p, n) {
  // Page 1 is the grown-up guide, 2 the welcome poster, 3–6 the signs, 7–8 the hands-on toys;
  // the shop set (menu, specials, money) sits just before the two certificates at the end.
  const pick = [2, 7, 8, 3, 9, n - 4, n - 3, n - 2].filter((i, j, a) => i > 1 && i <= n && a.indexOf(i) === j);
  return {
    inside: `<div class="top"><h1>What’s Inside</h1><div class="sub">${n}-page printable ${k.name} play kit · US Letter</div></div>${grid(pick.map((i) => [p(i)]))}`,
    feature: `<div class="top"><h1>Your Child’s Name All Over the Shop</h1></div>
      <div class="page" style="left:150px;top:170px;width:440px;transform:rotate(-4deg)"><img src="${p(2)}"></div>
      <div class="page" style="left:620px;top:180px;width:440px;transform:rotate(3deg)"><img src="${p(7)}"></div>
      <div class="bar">${k.toys.map((t) => t.title.toUpperCase()).join(' · ')} · MENU · PLAY MONEY</div>`,
  };
}

function partyPhotos(t, p, n) {
  const items = [[2, 'Invitations'], [3, 'Thank-you cards'], [4, 'Cupcake toppers'], [5, 'Favor tags'], [6, 'Name banner'], [7, 'Banner letters'], [n - 2, 'Food tent cards'], [n, 'Bottle labels']];
  return {
    inside: `<div class="top"><h1>What’s Inside</h1><div class="sub">${t.label} party printables · US Letter</div></div>${grid(items.map(([i, label]) => [p(i), label]))}`,
    feature: `<div class="top"><h1>Made With Your Child’s Name</h1></div>
      <div class="page" style="left:150px;top:170px;width:440px;transform:rotate(-4deg)"><img src="${p(2)}"></div>
      <div class="page" style="left:620px;top:180px;width:440px;transform:rotate(3deg)"><img src="${p(4)}"></div>
      <div class="bar">INVITATIONS · TOPPERS · BANNER · FAVOR TAGS · THANK-YOU CARDS</div>`,
  };
}

(async () => {
  const only = process.argv.slice(2);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'theme-photos-'));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
  const shoot = async (t, prefix, photos) => {
    for (const [name, html] of Object.entries(photos)) {
      await page.setContent(`<style>${css(t)}</style>${html}`);
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(OUT, `${prefix}-${name}.jpg`), type: 'jpeg', quality: 82 });
    }
  };
  const pages = (dir) => {
    const n = fs.readdirSync(dir).filter((f) => f.startsWith('page-')).length;
    return [(i) => dataUrl(path.join(dir, `page-${i}.png`)), n];
  };
  for (const id of Object.keys(THEMES).filter((k) => !only.length || only.includes(k))) {
    const t = THEMES[id];
    const kit = Object.values(KITS).find((k) => k.hunt === id);
    if (kit) {
      const dir = path.join(tmp, `kit-${id}`);
      await renderKit({ kit: kit.id, ...SAMPLE, subjects: [], lenient: true }, `${dir}.pdf`, { pngDir: dir });
      await shoot(t, `kit-${kit.id}`, kitPhotos(kit, ...pages(dir)));
    }
    const dir = path.join(tmp, `party-${id}`);
    await renderParty({ theme: id, ...SAMPLE }, `${dir}.pdf`, { pngDir: dir });
    await shoot(t, `party-${id}`, partyPhotos(t, ...pages(dir)));
    console.log('Wrote', id);
  }
  await browser.close();
})();
