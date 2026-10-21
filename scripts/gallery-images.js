// Builds the order preview gallery in docs/img/gallery/<theme>/: five real pages each from the hunt,
// the pretend play kit, the activity pack and the party pack (hunt-1..5, kit-1..5, activity-1..5,
// party-1..5.webp), shown when someone taps "What's in your order" on the website. Kits differ in
// length, so their toy pages are picked by position. Also writes the activity pack's card for the
// order stack (docs/img/pages/<theme>-activity.webp).
// Usage: node scripts/gallery-images.js [theme ...]
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { renderPdf } = require('../src/generator/render');
const { renderKit, renderActivities } = require('../src/kits/render-kit');
const { renderParty } = require('../src/party/render-party');
const { kitForHunt } = require('../src/kits/engine');
const THEMES = require('../src/generator/themes');

const OUT = path.join(__dirname, '..', 'docs', 'img', 'gallery');
const SPOTS = ['front_door', 'shoe_rack', 'couch', 'dryer', 'bathtub', 'bookshelf', 'pet_bed', 'kitchen_table'];
const PARTY = { date: 'Saturday, June 3', time: '2 to 4 pm', place: 'Our house', rsvp: 'Text Sam' };
const count = (dir) => fs.readdirSync(dir).filter((f) => /^page-\d+\.png$/.test(f)).length;

(async () => {
  const only = process.argv.slice(2);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gallery-'));
  const jobs = [];
  for (const id of Object.keys(THEMES).filter((k) => !only.length || only.includes(k))) {
    const dir = (k) => path.join(tmp, `${id}-${k}`);
    await renderPdf({ theme: id, childName: 'Maya', age: 6, spots: SPOTS, pictures: true }, `${dir('hunt')}.pdf`, { pngDir: dir('hunt') });
    await renderParty({ theme: id, childName: 'Maya', age: 6, party: PARTY }, `${dir('party')}.pdf`, { pngDir: dir('party') });
    await renderKit({ kit: kitForHunt(id).id, childName: 'Maya', subjects: [], lenient: true }, `${dir('kit')}.pdf`, { pngDir: dir('kit') });
    await renderActivities({ kit: kitForHunt(id).id, childName: 'Maya', lenient: true }, `${dir('activity')}.pdf`, { pngDir: dir('activity') });
    const hunt = count(dir('hunt'));
    const kit = count(dir('kit'));
    const picks = {
      hunt: [1, 2, 3, 4, hunt], // host guide, briefing, two clue card sheets, certificate
      activity: [1, 6, 7, 9, 10], // cover, I spy, spot the difference, maze, word search
      party: [2, 3, 4, 5, 6], // invitations, thank-you cards, toppers, favor tags, banner
      kit: [2, 3, ...[0.35, 0.55, 0.75].map((f) => Math.round(4 + f * (kit - 4)))], // welcome poster, sign, three toys
    };
    fs.mkdirSync(path.join(OUT, id), { recursive: true });
    for (const [k, pages] of Object.entries(picks)) {
      pages.forEach((n, i) => jobs.push([path.join(dir(k), `page-${n}.png`), path.join(OUT, id, `${k}-${i + 1}.webp`)]));
    }
    jobs.push([path.join(dir('activity'), 'page-6.png'), path.join(OUT, '..', 'pages', `${id}-activity.webp`), 400]);
    console.log('Rendered', id);
  }
  const list = path.join(tmp, 'jobs.json');
  fs.writeFileSync(list, JSON.stringify(jobs));
  execFileSync('python3', ['-c', `
import sys, json
from PIL import Image
for job in json.load(open(sys.argv[1])):
    src, out, w = (job + [640])[:3]
    im = Image.open(src).convert('RGB')
    im.resize((w, round(w * im.height / im.width)), Image.LANCZOS).save(out, 'WEBP', quality=72 if w == 640 else 80)
`, list]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('Wrote docs/img/gallery for', only.length ? only.join(', ') : 'every theme');
})();
