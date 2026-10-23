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
// With nameSlots (the child's name in the config), it also writes pngDir/blank/page-N.png with that
// name's text left out, and pngDir/blank/slots.json saying where to draw it back (see name-slots.js).
async function renderHtml(html, outPdf, { pngDir, nameSlots: name } = {}) {
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'hunt-')), 'hunt.html');
  fs.writeFileSync(tmp, html);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ deviceScaleFactor: pngDir ? 2 : 1 });
    await page.goto('file://' + tmp, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({ path: outPdf, format: 'Letter', printBackground: true, preferCSSPageSize: true });
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
