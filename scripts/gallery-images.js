// Builds the order preview gallery in docs/img/gallery/<theme>/: five real pages each from the hunt,
// the pretend play kit, the activity pack and the party pack (hunt-1..5, kit-1..5, activity-1..5,
// party-1..5.webp), shown when someone taps "What's in your order" on the website. Kits differ in
// length, so their toy pages are picked by position. Also writes the activity pack's card for the
// order stack (docs/img/pages/<theme>-activity.webp) and the theme picker's square thumbnail
// (docs/img/themes/<theme>.webp, cut from the play kit card made by site-images.js).
// Usage: node scripts/gallery-images.js [theme ...]
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { renderPdf } = require('../src/generator/render');
const { renderKit, renderActivities } = require('../src/kits/render-kit');
const { renderParty } = require('../src/party/render-party');
const { kitForHunt, KITS } = require('../src/kits/engine');
const THEMES = require('../src/generator/themes');

const OUT = path.join(__dirname, '..', 'docs', 'img', 'gallery');
const SPOTS = ['front_door', 'shoe_rack', 'couch', 'dryer', 'bathtub', 'bookshelf', 'pet_bed', 'kitchen_table'];
const PARTY = { date: 'Saturday, June 3', time: '2 to 4 pm', place: 'Our house', rsvp: 'Text Sam' };
const count = (dir) => fs.readdirSync(dir).filter((f) => /^page-\d+\.png$/.test(f)).length;

(async () => {
  const only = process.argv.slice(2);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gallery-'));
  const jobs = [];
  // Shop kits (pizza, library...) have no hunt or party, just the play kit and its activity pack.
  const shops = Object.values(KITS).filter((k) => !k.hunt).map((k) => k.id);
  for (const id of [...Object.keys(THEMES), ...shops].filter((k) => !only.length || only.includes(k))) {
    const dir = (k) => path.join(tmp, `${id}-${k}`);
    const shop = shops.includes(id);
    if (shop) {
      await renderKit({ kit: id, childName: 'Maya', subjects: [], lenient: true }, `${dir('kit')}.pdf`, { pngDir: dir('kit') });
      await renderActivities({ kit: id, childName: 'Maya', lenient: true }, `${dir('activity')}.pdf`, { pngDir: dir('activity') });
      const kit = count(dir('kit'));
      const picks = {
        kit: [2, 4, ...[0.35, 0.55, 0.75].map((f) => Math.round(5 + f * (kit - 5)))], // welcome poster, shop sign, three toys
        activity: [1, 6, 7, 9, 10],
      };
      fs.mkdirSync(path.join(OUT, id), { recursive: true });
      for (const [k, pages] of Object.entries(picks)) {
        pages.forEach((n, i) => jobs.push([path.join(dir(k), `page-${n}.png`), path.join(OUT, id, `${k}-${i + 1}.webp`)]));
      }
      jobs.push([path.join(dir('kit'), `page-${picks.kit[2]}.png`), path.join(OUT, '..', 'pages', `${id}-kit.webp`), 400]);
      jobs.push([path.join(dir('activity'), 'page-6.png'), path.join(OUT, '..', 'pages', `${id}-activity.webp`), 400]);
      console.log('Rendered', id);
      continue;
    }
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
  fs.mkdirSync(path.join(OUT, '..', 'themes'), { recursive: true });
  execFileSync('python3', ['-c', `
import sys, os
from PIL import Image
img = sys.argv[1]
for t in sys.argv[2:]:
    im = Image.open(os.path.join(img, f'kit-{t}.webp')).convert('RGBA')
    bg = Image.new('RGBA', im.size, (255, 255, 255, 255)); bg.alpha_composite(im)
    # the middle sheet of the fan (a hands-on toy), a little below its title
    k = bg.width / 677; left, top, side = int(165 * k), int(40 * k), int(350 * k)
    bg.crop((left, top, left + side, top + side)).convert('RGB').resize((220, 220), Image.LANCZOS).save(os.path.join(img, 'themes', f'{t}.webp'), 'WEBP', quality=80)
`, path.join(OUT, '..'), ...[...Object.keys(THEMES), ...shops].filter((k) => !only.length || only.includes(k))]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('Wrote docs/img/gallery for', only.length ? only.join(', ') : 'every theme');
})();
