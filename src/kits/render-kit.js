// Usage: node src/kits/render-kit.js <config.json> <out.pdf> [--png <dir>]
const fs = require('fs');
const { buildKitHtml, activityPackHtml } = require('./engine');
const { renderHtml } = require('../generator/render');

const renderKit = (cfg, out, opts) => renderHtml(buildKitHtml(cfg), out, opts);
const renderActivities = (cfg, out, opts) => renderHtml(activityPackHtml(cfg), out, opts);
module.exports = { renderKit, renderActivities };

if (require.main === module) {
  const [cfgPath, out, flag, pngDir] = process.argv.slice(2);
  if (!cfgPath || !out) {
    console.error('Usage: node src/kits/render-kit.js <config.json> <out.pdf> [--png <dir>]');
    process.exit(1);
  }
  renderKit(JSON.parse(fs.readFileSync(cfgPath, 'utf8')), out, { pngDir: flag === '--png' ? pngDir : undefined })
    .then((p) => console.log('Wrote', p))
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
}
