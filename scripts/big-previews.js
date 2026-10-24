// The big picture pages in the website's preview gallery: up to four per kit (bigPicks in
// src/kits/bigpages.js), cut straight from the kit's own JPEGs into docs/img/gallery/<theme>/big-<n>.webp.
// Landscape pictures are turned back upright. They're the same for every kid and both ages, so
// there's no rendering and no name twin. Also writes their captions into BIGPICS in docs/js/data.js
// (always for every theme) and re-stamps the storefront's assets when that changes.
// gallery-images.js runs this for the themes it renders; npm test fails if BIGPICS is out of date
// with the kits' pages.json, so after importing big pictures run: node scripts/big-previews.js <theme>
// Usage: node scripts/big-previews.js [theme ...]   (pictures for those themes, or every theme)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { KITS, kitForHunt } = require('../src/kits/engine');
const THEMES = require('../src/generator/themes');
const { bigPicks } = require('../src/kits/bigpages');

const DOCS = path.join(__dirname, '..', 'docs');
const ART = path.join(__dirname, '..', 'src', 'kits', 'art');
const MAX = 4;
// Kinds drawn landscape (4:3) and stored turned a quarter turn clockwise for printing
// (project-files/pretend-play/big-pages/tools/import.py); the preview turns them back upright.
const LANDSCAPE = ['hero', 'cards', 'labels', 'screen', 'rooms', 'poster'];
const kindOf = (file) => (file.match(/^\d+-([a-z]+)/) || [])[1];

// Every gallery theme (hunt themes, then shop kits) with the kit its play kit pages come from.
function themes() {
  const shops = Object.values(KITS).filter((k) => !k.hunt).map((k) => k.id);
  return [...Object.keys(THEMES).map((id) => [id, kitForHunt(id)?.id]), ...shops.map((id) => [id, id])].filter(([, kit]) => kit);
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
// { theme: [caption, ...] } in the order the previews show them.
function captions() {
  const out = {};
  for (const [id, kit] of themes()) {
    const picks = bigPicks(kit, MAX);
    if (picks.length) out[id] = picks.map((p) => cap(p.title));
  }
  return out;
}
const line = (map) => `const BIGPICS = ${JSON.stringify(map)};`;
const LINE = /^const BIGPICS = .*;$/m;

function writeImages(only = []) {
  const jobs = [];
  for (const [id, kit] of themes().filter(([id]) => !only.length || only.includes(id))) {
    const dir = path.join(DOCS, 'img', 'gallery', id);
    fs.mkdirSync(dir, { recursive: true });
    const picks = bigPicks(kit, MAX);
    picks.forEach((p, i) => jobs.push([path.join(ART, kit, 'big', p.file), path.join(dir, `big-${i + 1}.webp`), LANDSCAPE.includes(kindOf(p.file))]));
    for (let i = picks.length + 1; fs.existsSync(path.join(dir, `big-${i}.webp`)); i++) fs.rmSync(path.join(dir, `big-${i}.webp`));
  }
  if (!jobs.length) return;
  execFileSync('python3', ['-c', `
import sys, json
from PIL import Image
for src, out, turn in json.loads(sys.argv[1]):
    im = Image.open(src).convert('RGB')
    if turn: im = im.transpose(Image.Transpose.ROTATE_90)
    im.resize((640, round(640 * im.height / im.width)), Image.LANCZOS).save(out, 'WEBP', quality=72)
`, JSON.stringify(jobs)]);
}

function writeCaptions() {
  const f = path.join(DOCS, 'js', 'data.js');
  const js = fs.readFileSync(f, 'utf8');
  if (!LINE.test(js)) throw new Error('docs/js/data.js has no BIGPICS line');
  const out = js.replace(LINE, line(captions()));
  if (out !== js) {
    fs.writeFileSync(f, out);
    require('./stamp-assets').run();
  }
}

if (require.main === module) {
  const only = process.argv.slice(2);
  writeImages(only);
  writeCaptions();
  console.log('Big picture previews for', only.length ? only.join(', ') : 'every theme');
}
module.exports = { captions, line, writeImages, writeCaptions, MAX };
