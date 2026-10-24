// Usage:
//   node src/generator/render.js <config.json> <out.pdf> [--png <dir>]
// Renders a hunt config to a Letter-size PDF with headless Chromium.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { chromium } = require('playwright');
const { buildHtml } = require('./build');
const { nameSlots } = require('./name-slots');

async function renderPdf(cfg, outPdf, opts) {
  return renderHtml(buildHtml(cfg), outPdf, opts);
}

// Renders any print HTML whose pages are `.page` elements (hunts and kits alike).
// With `thumbs` (a folder), it also saves a small picture of every page (page-N.jpg) and index.json
// with each page's title, for the Field Kit's page picker. outPdf can be null to make only those.
// With nameSlots (the child's name in the config), it also writes pngDir/blank/page-N.png with that
// name's text left out, and pngDir/blank/slots.json saying where to draw it back (see name-slots.js).
async function renderHtml(html, outPdf, { pngDir, nameSlots: name, thumbs } = {}) {
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'hunt-')), 'hunt.html');
  fs.writeFileSync(tmp, html);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ deviceScaleFactor: pngDir ? 2 : 1 });
    await page.goto('file://' + tmp, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    if (outPdf) await page.pdf({ path: outPdf, format: 'Letter', printBackground: true, preferCSSPageSize: true });
    // Thumbnails never stop the PDF from being delivered.
    if (thumbs) await writeThumbs(page, thumbs).catch((err) => console.error('Page thumbnails failed:', err.message));
    if (pngDir) {
      fs.mkdirSync(pngDir, { recursive: true });
      await page.setViewportSize({ width: 816, height: 1056 });
      const shoot = async (dir) => {
        const pages = await page.$$('.page');
        for (let i = 0; i < pages.length; i++) await pages[i].screenshot({ path: path.join(dir, `page-${i + 1}.png`) });
      };
      await shoot(pngDir);
      if (name) {
        const blank = path.join(pngDir, 'blank');
        fs.mkdirSync(blank, { recursive: true });
        const slots = await page.evaluate(`(${nameSlots})(${JSON.stringify(name)})`);
        fs.writeFileSync(path.join(blank, 'slots.json'), JSON.stringify(slots));
        await shoot(blank);
      }
    }
  } finally {
    await browser.close();
  }
  return outPdf;
}

// A small picture and a title for every page. The title is the page's heading, else its first line of
// text, else a name for its kind of page.
const KIND = { host: 'Host guide and hiding checklist', briefing: 'Mission briefing', puzzle: 'Puzzle page', bigpic: 'Picture page', poster: 'Welcome poster', 'ct-page': 'Cut-out page', 'mf-page': 'File folder', rxs: 'Prescriptions', 'pic-cards': 'Picture cards', 'st-page': 'Shelf tags' };
async function writeThumbs(page, dir) {
  fs.mkdirSync(dir, { recursive: true });
  await page.setViewportSize({ width: 816, height: 1056 });
  const titles = await page.$$eval('.page', (ps, KIND) => ps.map((e, i) => {
    const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();
    const named = clean(e.dataset.title);
    const kindName = Object.keys(KIND).filter((k) => KIND[k]).find((k) => e.classList.contains(k) && ['host', 'briefing', 'puzzle', 'pic-cards'].includes(k));
    const head = clean(e.querySelector('h1,h2,h3,.title,[class*="title"]')?.textContent);
    const line = clean((e.innerText || '').split('\n').find((l) => clean(l).length > 2));
    const kind = Object.keys(KIND).find((k) => e.classList.contains(k));
    return (named || (kindName && KIND[kindName]) || head || line || (kind && KIND[kind]) || `Page ${i + 1}`).slice(0, 48);
  }), KIND);
  await page.evaluate(() => { document.documentElement.style.zoom = '0.3'; });
  const pages = await page.$$('.page');
  for (let i = 0; i < pages.length; i++) await pages[i].screenshot({ path: path.join(dir, `page-${i + 1}.jpg`), type: 'jpeg', quality: 72 });
  await page.evaluate(() => { document.documentElement.style.zoom = ''; });
  fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(titles.map((title) => ({ title }))));
}

module.exports = { renderPdf, renderHtml };

if (require.main === module) {
  const [cfgPath, out, flag, pngDir] = process.argv.slice(2);
  if (!cfgPath || !out) {
    console.error('Usage: node src/generator/render.js <config.json> <out.pdf> [--png <dir>]');
    process.exit(1);
  }
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  renderPdf(cfg, out, { pngDir: flag === '--png' ? pngDir : undefined })
    .then((p) => console.log('Wrote', p))
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
}
