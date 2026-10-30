// Builds every Etsy listing's download files into output/etsy-files/ (each PDF once, split into parts
// where it's over Etsy's 20 MB limit) and checks each listing fits Etsy's 5 files.
// Usage: node scripts/etsy-files.js [listing-key-prefix]
const fs = require('fs');
const path = require('path');
const { CATALOG, splitPdf, MAX_FILES } = require('../src/bot/listings');

const OUT = path.join(__dirname, '..', 'output', 'etsy-files');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const only = process.argv[2] || '';
  const parts = {};
  let bad = 0;
  for (const l of CATALOG.filter((c) => c.key.startsWith(only))) {
    let count = 0;
    for (const f of l.files) {
      if (!parts[f.name]) {
        const out = path.join(OUT, f.name);
        await f.build(out);
        parts[f.name] = await splitPdf(f.name, fs.readFileSync(out));
        if (parts[f.name].length > 1) for (const p of parts[f.name]) fs.writeFileSync(path.join(OUT, p.name), p.data);
        console.log(`${f.name}: ${(fs.statSync(out).size / 1e6).toFixed(1)} MB${parts[f.name].length > 1 ? `, ${parts[f.name].length} parts` : ''}`);
      }
      count += parts[f.name].length;
    }
    if (count > MAX_FILES) bad++;
    console.log(`  ${l.key}: ${count} file${count === 1 ? '' : 's'}${count > MAX_FILES ? ' (TOO MANY)' : ''}`);
  }
  if (bad) process.exit(1);
})();
