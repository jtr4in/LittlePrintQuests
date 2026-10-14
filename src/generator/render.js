// Usage:
//   node src/generator/render.js <config.json> <out.pdf> [--png <dir>]
// Renders a hunt config to a Letter-size PDF with headless Chromium.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { chromium } = require('playwright');
const { buildHtml } = require('./build');

async function renderPdf(cfg, outPdf, { pngDir } = {}) {
  const html = buildHtml(cfg);
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
      const pages = await page.$$('.page');
      for (let i = 0; i < pages.length; i++) {
        await pages[i].screenshot({ path: path.join(pngDir, `page-${i + 1}.png`) });
      }
    }
  } finally {
    await browser.close();
  }
  return outPdf;
}

module.exports = { renderPdf };

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
