// Builds the Etsy photos and website pictures for the handprint art packs.
// Usage: node scripts/craft-photos.js [halloween christmas]
// Renders each pack for a sample child, then writes listing-assets/craft-<id>.jpg (main),
// craft-<id>-inside.jpg (all 8 crafts), craft-<id>-p01.jpg... (one per page) and docs/img/craft-<id>.png
// (save that as a 1000x750 WebP, q82, for the website).
// The Memory Handprint Book gets a grid of all its pages instead, shown with the prints painted in.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { chromium } = require('playwright');
const { buildCraftHtml, HOLIDAYS } = require('../src/crafts/build');
const { renderHtml } = require('../src/generator/render');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'listing-assets');
const FONTS = path.join(ROOT, 'fonts');
const font = (f) => `data:font/ttf;base64,${fs.readFileSync(path.join(FONTS, f)).toString('base64')}`;
const png = (f) => `data:image/png;base64,${fs.readFileSync(f).toString('base64')}`;

const css = (h) => `
@font-face { font-family: Fredoka; src: url(${font('Fredoka.ttf')}); font-weight: 300 700; }
@font-face { font-family: Nunito; src: url(${font('Nunito.ttf')}); font-weight: 200 1000; }
html, body { margin: 0; width: 1000px; height: 750px; background: ${h.colors.soft}; color: ${h.colors.ink}; font-family: Nunito; overflow: hidden; position: relative; }
h1 { font: 700 58px/1 Fredoka; margin: 0; letter-spacing: -.01em; }
.sub { font: 600 25px/1.25 Nunito; opacity: .85; margin-top: 10px; }
.pill { display: inline-block; background: ${h.colors.primary}; color: #fff; font: 600 21px/1 Fredoka; padding: 12px 20px; border-radius: 99px; }
.page { position: absolute; background: #fff; box-shadow: 0 12px 30px rgba(40,30,60,.25); }
.page img { width: 100%; display: block; }
.top { position: absolute; left: 56px; top: 46px; right: 56px; }
.grid { position: absolute; left: 140px; right: 140px; top: 165px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px 22px; }
.grid .page { position: static; }
.cap { font: 600 17px/1.15 Fredoka; text-align: center; margin-top: 7px; }`;

// The three craft pages fanned out on the main photo, the middle one in front.
const FAN = { halloween: [2, 5, 9], christmas: [2, 3, 5] };

function shots(h, dir) {
  const p = (n) => png(path.join(dir, `page-${n}.png`));
  const [left, middle, right] = FAN[h.id] || [2, 3, 5];
  const main = `<div class="top"><h1>${h.name} Handprint Art</h1>
      <div class="sub">8 handprint &amp; footprint keepsake crafts, personalized with your child’s name and age</div></div>
    <div class="page" style="left:60px;top:205px;width:330px;transform:rotate(-6deg)"><img src="${p(left)}"></div>
    <div class="page" style="left:610px;top:205px;width:330px;transform:rotate(6deg)"><img src="${p(right)}"></div>
    <div class="page" style="left:330px;top:180px;width:350px;z-index:2"><img src="${p(middle)}"></div>
    <div style="position:absolute;left:56px;bottom:30px;right:56px;display:flex;gap:12px;z-index:3">
      <span class="pill">Child’s name on every page</span><span class="pill" style="background:${h.colors.ink}">Printable PDF</span><span class="pill" style="background:#fff;color:${h.colors.ink}">Toddler friendly</span></div>`;
  const inside = `<div class="top" style="top:34px;text-align:center"><h1 style="font-size:46px">8 crafts + cards + poem page</h1>
      <div class="sub" style="font-size:21px">Each page shows where to press, a little poem and a finished example</div></div>
    <div class="grid">${h.crafts.map((c, i) => `<div><div class="page"><img src="${p(i + 2)}"></div><div class="cap">${c.title}</div></div>`).join('')}</div>`;
  const pages = Array.from({ length: 12 }, (_, i) =>
    `<div class="page" style="left:280px;top:20px;width:440px;transform:rotate(${i % 2 ? 1.5 : -1.5}deg)"><img src="${p(i + 1)}"></div>`);
  return { [`craft-${h.id}`]: main, [`craft-${h.id}-inside`]: inside, ...Object.fromEntries(pages.map((html, i) => [`craft-${h.id}-p${String(i + 1).padStart(2, '0')}`, html])) };
}

// The book: every page in a grid under a big title, then a printable page beside its finished look.
function bookShots(h, dir, plain) {
  const p = (n, d = dir) => png(path.join(d, `page-${n}.png`));
  const first = 3 + Math.ceil(h.crafts.length / 6); // pages: guide, cover, how-to sheets, then the crafts
  const crafts = h.crafts.map((_, i) => first + i);
  const order = [2, ...crafts, h.grown ? first + h.crafts.length : 3, h.grown ? 3 : 4]; // cover, crafts, grown page, how-to
  const main = `<div style="position:absolute;left:0;right:0;top:20px;text-align:center">
      <h1 style="font:700 58px/1 Fredoka;letter-spacing:.01em;color:#231a33">${(h.gridTitle || h.name).toUpperCase()}</h1>
      <div style="margin:10px auto 0;width:860px;height:5px;border-radius:3px;background:linear-gradient(90deg,#e5383b,#f28c28,#e9b200,#4caf50,#3a86ff,#8e5bd3)"></div></div>
    <div style="position:absolute;left:70px;right:70px;top:108px;display:grid;grid-template-columns:repeat(5,156px);justify-content:space-between;gap:10px 0">
      ${order.map((n) => `<div class="page" style="position:static;border-radius:4px;overflow:hidden"><img src="${p(n)}"></div>`).join('')}</div>`;
  const inside = `<div class="top" style="top:34px;text-align:center"><h1 style="font-size:46px">${h.inside?.title || 'Print it, press a hand, keep it forever'}</h1>
      <div class="sub" style="font-size:21px">${h.inside?.sub || 'A light dotted outline shows where to press, or use the set with no outlines.'}</div></div>
    <div class="page" style="left:120px;top:170px;width:330px;transform:rotate(-3deg)"><img src="${p(first, plain)}"></div>
    <div style="position:absolute;left:470px;top:370px;font:700 70px Fredoka;color:${h.colors.accent}">→</div>
    <div class="page" style="left:560px;top:160px;width:330px;transform:rotate(3deg)"><img src="${p(first)}"></div>
    <div style="position:absolute;left:120px;width:330px;top:620px;text-align:center" class="cap">The printed page</div>
    <div style="position:absolute;left:560px;width:330px;top:620px;text-align:center" class="cap">${h.inside?.cap || 'Finished with a handprint'}</div>`;
  const pages = [3, ...order.slice(0, 14)].map((n, i) => [`craft-${h.id}-p${String(i + 1).padStart(2, '0')}`,
    `<div class="page" style="left:280px;top:20px;width:440px;transform:rotate(${i % 2 ? 1.5 : -1.5}deg)"><img src="${p(n)}"></div>`]);
  return { [`craft-${h.id}`]: main, [`craft-${h.id}-inside`]: inside, ...Object.fromEntries(pages) };
}

(async () => {
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(HOLIDAYS);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 750 }, deviceScaleFactor: 2 });
  for (const id of ids) {
    const h = HOLIDAYS[id];
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), `craft-${id}-`));
    await renderHtml(buildCraftHtml({ holiday: id, childName: 'Maya', age: 4, year: 2026, preview: h.book }), path.join(dir, 'pack.pdf'), { pngDir: dir });
    let plain = null;
    if (h.book) {
      plain = fs.mkdtempSync(path.join(os.tmpdir(), `craft-${id}-plain-`));
      await renderHtml(buildCraftHtml({ holiday: id, childName: 'Maya', age: 4, year: 2026 }), path.join(plain, 'pack.pdf'), { pngDir: plain });
    }
    for (const [name, html] of Object.entries(h.book ? bookShots(h, dir, plain) : shots(h, dir))) {
      await page.setContent(`<!doctype html><meta charset="utf-8"><style>${css(h)}</style>${html}`);
      await page.waitForTimeout(150);
      await page.screenshot({ path: path.join(OUT, `${name}.jpg`), type: 'jpeg', quality: 80 });
      if (name === `craft-${id}`) {
        // The website card: a smaller WebP of the main photo.
        const buf = await page.screenshot({ type: 'png' });
        fs.writeFileSync(path.join(dir, 'site.png'), buf);
      }
      console.log('Wrote', name);
    }
    fs.copyFileSync(path.join(dir, 'site.png'), path.join(ROOT, 'docs', 'img', `craft-${id}.png`));
    fs.rmSync(dir, { recursive: true, force: true });
    if (plain) fs.rmSync(plain, { recursive: true, force: true });
  }
  await browser.close();
})();
