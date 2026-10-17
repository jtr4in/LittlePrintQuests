// Usage: node src/crafts/render-craft.js <config.json> <out.pdf> [--png <dir>]
// Config: { "holiday": "halloween" | "christmas", "childName": "Maya", "age": 4, "year": 2026 }
const fs = require('fs');
const { buildCraftHtml } = require('./build');
const { renderHtml } = require('../generator/render');

const renderCraft = (cfg, out, opts) => renderHtml(buildCraftHtml(cfg), out, opts);
module.exports = { renderCraft };

if (require.main === module) {
  const [cfgPath, out, flag, pngDir] = process.argv.slice(2);
  if (!cfgPath || !out) {
    console.error('Usage: node src/crafts/render-craft.js <config.json> <out.pdf> [--png <dir>]');
    process.exit(1);
  }
  renderCraft(JSON.parse(fs.readFileSync(cfgPath, 'utf8')), out, { pngDir: flag === '--png' ? pngDir : undefined })
    .then((p) => console.log('Wrote', p))
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
}
