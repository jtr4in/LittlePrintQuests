// Builds the extra Etsy photos for each theme pack (2400x1800 JPGs in listing-assets/):
// what's inside, a clue card close-up, how it works, and the briefing + certificate.
// The main photo (hunt-<theme>.jpg) comes from listing_images.py.
// Usage: node scripts/pack-photos.js [theme ...]
const fs = require('fs');
const os = require('os');
const path = require('path');
const { chromium } = require('playwright');
const { renderPdf } = require('../src/generator/render');
const THEMES = require('../src/generator/themes');

const OUT = path.join(__dirname, '..', 'listing-assets');
const FONTS = path.join(__dirname, '..', 'fonts');
const SPOTS = ['couch', 'fridge', 'bed', 'bathtub', 'bookshelf', 'front_door', 'toy_box', 'kitchen_table'];
const font = (f) => `data:font/ttf;base64,${fs.readFileSync(path.join(FONTS, f)).toString('base64')}`;

const css = (t) => `
@font-face { font-family: Fredoka; src: url(${font('Fredoka.ttf')}); font-weight: 300 700; }
@font-face { font-family: Nunito; src: url(${font('Nunito.ttf')}); font-weight: 200 1000; }
html, body { margin: 0; width: 1200px; height: 900px; background: color-mix(in srgb, ${t.colors.soft} 45%, #fbf8f1); color: ${t.colors.ink}; font-family: Nunito; overflow: hidden; }
h1 { font: 700 62px/1.05 Fredoka; margin: 0; letter-spacing: -.01em; }
.sub { font: 600 28px/1.25 Nunito; opacity: .85; margin-top: 10px; }
.top { position: absolute; left: 70px; top: 54px; right: 70px; }
.center { text-align: center; }
.page { position: absolute; background: #fff; box-shadow: 0 14px 36px rgba(40,50,90,.22); }
.page img { width: 100%; display: block; }
.grid { position: absolute; left: 50%; transform: translateX(-50%); width: 1000px; top: 190px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px 28px; }
.grid figure { margin: 0; }
.grid img { width: 100%; display: block; background: #fff; box-shadow: 0 8px 20px rgba(40,50,90,.18); }
.grid figcaption { font: 600 21px/1.1 Fredoka; text-align: center; margin-top: 8px; }
.call { position: absolute; display: flex; gap: 14px; align-items: flex-start; width: 420px; }
.call b { flex: none; width: 46px; height: 46px; border-radius: 50%; background: ${t.colors.primary}; color: #fff; font: 700 24px/46px Fredoka; text-align: center; }
.call div { font: 500 25px/1.3 Nunito; } .call div strong { display: block; font: 700 28px/1.15 Fredoka; }
.bar { position: absolute; left: 0; right: 0; bottom: 0; height: 74px; background: ${t.colors.primary}; color: #fff; font: 600 24px/74px Fredoka; text-align: center; letter-spacing: .08em; }
.steps { position: absolute; left: 640px; top: 220px; right: 60px; display: grid; gap: 20px; }`;

const dataUrl = (f) => `data:image/png;base64,${fs.readFileSync(f).toString('base64')}`;

function photos(t, png, n) {
  const p = (i) => dataUrl(path.join(png, `page-${i}.png`));
  const cardPages = Array.from({ length: n - 3 }, (_, i) => i + 3);
  const inside = [[1, 'Host Guide'], [2, 'Mission Briefing'], ...cardPages.map((i, k) => [i, `Clue Cards ${k * 2 + 1}–${k * 2 + 2}`]), [n, 'Certificate']];
  return {
    inside: `<div class="top center"><h1>What’s Inside</h1><div class="sub">${n}-page printable PDF · US Letter · ${t.name}</div></div>
      <div class="grid">${inside.map(([i, label]) => `<figure><img src="${p(i)}"><figcaption>${label}</figcaption></figure>`).join('')}</div>`,
    cards: `<div class="top"><h1>8 Rhyming Clue Cards</h1><div class="sub">4" x 6", two per page, with cut lines</div></div>
      <div class="page" style="left:70px;top:210px;width:500px;transform:rotate(-2deg)"><img src="${p(3)}"></div>
      <div class="call" style="left:650px;top:250px"><b>1</b><div><strong>Big rhyming riddles</strong>Read aloud, and each one leads to the next hiding spot</div></div>
      <div class="call" style="left:650px;top:430px"><b>2</b><div><strong>Picture clues</strong>A picture of the next spot, so kids who can’t read yet can play too</div></div>
      <div class="call" style="left:650px;top:610px"><b>3</b><div><strong>Parent check</strong>A tiny footer says where each card hides, so you never mix them up</div></div>`,
    how: `<div class="top"><h1>Ready in 10 Minutes</h1><div class="sub">Print at home on regular paper</div></div>
      <div class="page" style="left:90px;top:215px;width:470px;transform:rotate(-3deg)"><img src="${p(1)}"></div>
      <div class="steps">
        ${[['Print', 'Download and print at “Actual Size / 100%”'], ['Cut', 'Cut out the clue cards along the dashed lines'], ['Hide', 'The Host Guide shows exactly where each card goes'], ['Play', 'Read the briefing aloud and hand over Clue #1']]
          .map(([h, d], i) => `<div class="call" style="position:static;width:auto"><b>${i + 1}</b><div><strong>${h}</strong>${d}</div></div>`).join('')}
      </div>
      <div class="bar">AGES ${t.ages} · 20–40 MINUTES OF FUN · INDOORS OR OUT</div>`,
    finish: `<div class="top center"><h1 style="font-size:52px">A Story to Start, a Certificate to Finish</h1></div>
      <div class="page" style="left:170px;top:170px;width:420px;transform:rotate(-4deg)"><img src="${p(2)}"></div>
      <div class="page" style="left:620px;top:180px;width:420px;transform:rotate(3deg)"><img src="${p(n)}"></div>
      <div class="bar">READ-ALOUD ${t.briefing.title.toUpperCase()} · “${t.certificate.title.toUpperCase()}” CERTIFICATE</div>`,
  };
}

(async () => {
  const only = process.argv.slice(2);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pack-photos-'));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
  for (const id of Object.keys(THEMES).filter((k) => !only.length || only.includes(k))) {
    const t = THEMES[id];
    const png = path.join(tmp, id);
    await renderPdf({ theme: id, spots: SPOTS, pictures: true }, path.join(tmp, `${id}.pdf`), { pngDir: png });
    const n = fs.readdirSync(png).filter((f) => f.startsWith('page-')).length;
    for (const [name, html] of Object.entries(photos(t, png, n))) {
      await page.setContent(`<style>${css(t)}</style>${html}`);
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(OUT, `pack-${id}-${name}.jpg`), type: 'jpeg', quality: 82 });
    }
    console.log('Wrote', id);
  }
  await browser.close();
})();
