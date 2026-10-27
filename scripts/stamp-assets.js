// Stamps the storefront's shared scripts and stylesheet with a fingerprint of their content
// (js/data.js?v=1a2b3c4d), so a phone never mixes a fresh page script with an old cached copy of
// another one. Run after changing anything in docs/js or docs/css: node scripts/stamp-assets.js
// test/smoke.js fails if a stamp is out of date.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const DOCS = path.join(__dirname, '..', 'docs');
const PAGES = ['index.html', 'make/index.html', 'play-kits/index.html', 'handprint-art/index.html', 'activity-pages/index.html'];
const REF = /((?:src|href)=")((?:js|css)\/[\w.-]+\.(?:js|css))(?:\?v=[0-9a-f]+)?"/g;
const stamp = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(DOCS, file))).digest('hex').slice(0, 8);
function stamped(html) { return html.replace(REF, (m, attr, file) => `${attr}${file}?v=${stamp(file)}"`); }
function run({ check = false } = {}) {
  const stale = [];
  for (const p of PAGES) {
    const f = path.join(DOCS, p);
    const html = fs.readFileSync(f, 'utf8');
    const out = stamped(html);
    if (out !== html) { stale.push(p); if (!check) fs.writeFileSync(f, out); }
  }
  return stale;
}
if (require.main === module) console.log(`Stamped: ${run().join(', ') || 'nothing to change'}`);
module.exports = { run, PAGES };
