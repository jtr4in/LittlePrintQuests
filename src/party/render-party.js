// Usage: node src/party/render-party.js <config.json> <out.pdf> [--png <dir>]
// Config: { "theme": "dino", "childName": "Maya", "age": 5,
//           "party": { "date": "Saturday, June 3", "time": "2–4 pm", "place": "...", "rsvp": "..." } }
const fs = require('fs');
const { buildPartyHtml } = require('./build');
const { renderHtml } = require('../generator/render');

const renderParty = (cfg, out, opts) => renderHtml(buildPartyHtml(cfg), out, opts);
module.exports = { renderParty };

if (require.main === module) {
  const [cfgPath, out, flag, pngDir] = process.argv.slice(2);
  if (!cfgPath || !out) {
    console.error('Usage: node src/party/render-party.js <config.json> <out.pdf> [--png <dir>]');
    process.exit(1);
  }
  renderParty(JSON.parse(fs.readFileSync(cfgPath, 'utf8')), out, { pngDir: flag === '--png' ? pngDir : undefined })
    .then((p) => console.log('Wrote', p))
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
}
