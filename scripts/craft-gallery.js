// Builds the preview gallery for the handprint art packs in docs/img/gallery/crafts/: six or seven real
// pages of each pack (<id>-1.webp...), shown when someone taps a pack under "Handprint art" on the website.
// The page numbers here line up with CRAFT_PAGES in docs/js/data.js, which holds the captions.
// Pages with the child's name also get a twin without it in docs/img/n/ (see src/generator/name-slots.js).
// Usage: node scripts/craft-gallery.js [halloween christmas memory zoo fingerprint]
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { renderCraft } = require('../src/crafts/render-craft');
const { blankJob, saveIndex } = require('../src/generator/name-slots');

const OUT = path.join(__dirname, '..', 'docs', 'img', 'gallery', 'crafts');
const PAGES = {
  halloween: [2, 3, 5, 9, 10, 11, 12], // ghosts, spider, bat, pumpkin patch, cards, add-ons, poem
  christmas: [2, 3, 4, 8, 10, 11, 12], // tree, reindeer, Santa, lights, cards, add-ons, poem
  memory: [2, 3, 5, 9, 14, 17], // cover, how-to, January, May, October, look how I've grown
  zoo: [2, 3, 5, 10, 11, 15], // cover, how-to, lion, dinosaur, unicorn, bumblebee
  fingerprint: [2, 3, 5, 7, 9, 15], // cover, how-to, ladybugs, balloons, fishbowl, fireflies
};

(async () => {
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PAGES);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'craft-gallery-'));
  const jobs = [];
  fs.mkdirSync(OUT, { recursive: true });
  for (const id of ids) {
    const dir = path.join(tmp, id);
    await renderCraft({ holiday: id, childName: 'Maya', age: 4, year: 2026 }, `${dir}.pdf`, { pngDir: dir, nameSlots: 'Maya' });
    PAGES[id].forEach((n, i) => jobs.push([path.join(dir, `page-${n}.png`), path.join(OUT, `${id}-${i + 1}.webp`)]));
    console.log('Rendered', id);
  }
  // Twins with the name left out, for the website to write the typed name over (docs/js/names.js).
  const index = {};
  for (const [src, out] of [...jobs]) {
    const twin = blankJob(index, src, out);
    if (twin) jobs.push(twin);
  }
  saveIndex(index);
  const list = path.join(tmp, 'jobs.json');
  fs.writeFileSync(list, JSON.stringify(jobs));
  execFileSync('python3', ['-c', `
import sys, json
from PIL import Image
for src, out in json.load(open(sys.argv[1])):
    im = Image.open(src).convert('RGB')
    im.resize((640, round(640 * im.height / im.width)), Image.LANCZOS).save(out, 'WEBP', quality=72)
`, list]);
  fs.rmSync(tmp, { recursive: true, force: true });
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
