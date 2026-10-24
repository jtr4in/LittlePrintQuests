// Which site previews a change needs rebuilt, for .github/workflows/previews.yml. Reads changed file
// paths on stdin, one a line, and prints the themes and shop kits to re-render (space separated),
// "all" for a change to shared print code, or nothing when no preview depends on what changed.
// A kit's own files (src/kits/defs/<kit>.js, src/kits/art/<kit>/) map to that kit and the hunt
// theme it belongs to; anything else under src/ that prints pages could change every preview.
const fs = require('fs');
const { KITS } = require('../src/kits/engine');
const THEMES = require('../src/generator/themes');

const files = fs.readFileSync(0, 'utf8').split('\n').map((f) => f.trim()).filter(Boolean);
const out = new Set();
let all = false;
for (const f of files) {
  const own = f.match(/^src\/kits\/(?:defs\/([a-z]+)\.js|art\/([a-z]+)\/)/);
  const id = own && (own[1] || own[2]);
  if (id && KITS[id]) {
    const kit = KITS[id];
    out.add(kit.hunt && THEMES[kit.hunt] ? kit.hunt : id);
  } else if (/^src\/(kits|generator|party|crafts|host)\//.test(f) || /^scripts\/(gallery-images|site-images|hero-scenes|craft-gallery)\.js$/.test(f)) {
    all = true;
  }
}
console.log(all ? 'all' : [...out].join(' '));
