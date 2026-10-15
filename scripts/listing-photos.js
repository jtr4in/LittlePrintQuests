// Builds the Etsy photos for the Party Bundle and Play Kit listings (2400x1800 JPGs in listing-assets/).
// Usage: node scripts/listing-photos.js <dir with hunt-1.png, hunt-3.png, hunt-7.png and kit-<id>.png fans>
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { KITS } = require('../src/kits/engine');

const SRC = process.argv[2];
const OUT = path.join(__dirname, '..', 'listing-assets');
const FONTS = path.join(__dirname, '..', 'fonts');
const img = (f) => `data:image/png;base64,${fs.readFileSync(path.join(SRC, f)).toString('base64')}`;
const font = (f) => `data:font/ttf;base64,${fs.readFileSync(path.join(FONTS, f)).toString('base64')}`;

const css = `
@font-face { font-family: Fredoka; src: url(${font('Fredoka.ttf')}); font-weight: 300 700; }
@font-face { font-family: Nunito; src: url(${font('Nunito.ttf')}); font-weight: 200 1000; }
html, body { margin: 0; width: 1200px; height: 900px; background: #fbf8f1; color: #3f4a73; font-family: Nunito; overflow: hidden; }
h1 { font: 700 70px/1 Fredoka; margin: 0; letter-spacing: -.01em; }
.sub { font: 600 30px/1.2 Nunito; color: #5d6790; margin-top: 12px; }
.pill { display: inline-block; background: #ef9d31; color: #2b1d06; font: 600 24px/1 Fredoka; padding: 14px 24px; border-radius: 99px; }
.page { position: absolute; background: #fff; box-shadow: 0 14px 36px rgba(40,50,90,.22); }
.page img { width: 100%; display: block; }
.top { position: absolute; left: 70px; top: 60px; right: 70px; }
.plus { position: absolute; font: 700 90px/1 Fredoka; color: #ef9d31; }
.label { font: 600 26px/1 Fredoka; text-align: center; margin-top: 4px; }
.grid { position: absolute; left: 40px; right: 40px; top: 230px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px 20px; }
.grid img { width: 100%; display: block; }
.mint { position: absolute; left: 0; right: 0; bottom: 0; height: 120px; background: #89dcb0; opacity: .25; }`;

const pages = {
  'bundle-main': `<div class="mint"></div><div class="top"><h1>Custom Party Bundle</h1>
    <div class="sub">A scavenger hunt for your home + a matching pretend play kit</div></div>
    <div class="page" style="left:70px;top:290px;width:300px;transform:rotate(-7deg)"><img src="${img('hunt-1.png')}"></div>
    <div class="page" style="left:250px;top:270px;width:300px;transform:rotate(4deg)"><img src="${img('hunt-3.png')}"></div>
    <div class="plus" style="left:585px;top:470px">+</div>
    <img src="${img('kit-space.png')}" style="position:absolute;left:640px;top:250px;width:540px">
    <div style="position:absolute;left:70px;bottom:40px;right:70px;display:flex;gap:16px">
      <span class="pill">Your child’s name on every page</span><span class="pill" style="background:#3f4a73;color:#fff">Printable PDF</span></div>`,
  'kits-main': `<div class="top" style="text-align:center"><h1>Pretend Play Kits</h1>
    <div class="sub">9 kits with signs, props and a pretend gadget, all with your child’s name</div></div>
    <div class="grid">${['vet', 'unicorn', 'dino', 'mermaid', 'construction', 'pirate']
      .map((k) => `<div><img src="${img(`kit-${k}.png`)}"><div class="label">${KITS[k].name}</div></div>`)
      .join('')}</div>`,
};
for (const k of Object.keys(KITS)) {
  pages[`kit-${k}`] = `<div class="mint"></div><div class="top" style="text-align:center"><h1>${KITS[k].name} Play Kit</h1>
    <div class="sub">With a ${KITS[k].dashboard.gadget}, plus props to cut out</div></div>
    <img src="${img(`kit-${k}.png`)}" style="position:absolute;left:170px;top:200px;width:860px">`;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
  for (const [name, html] of Object.entries(pages)) {
    await page.setContent(`<style>${css}</style>${html}`);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, `${name}.jpg`), type: 'jpeg', quality: 85 });
    console.log('Wrote', name);
  }
  await browser.close();
})();
