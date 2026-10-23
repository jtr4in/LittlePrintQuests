// Builds the order preview gallery in docs/img/gallery/<theme>/: five real pages each from the hunt,
// the pretend play kit, the activity pack and the party pack (hunt-1..5, kit-1..5, activity-1..5,
// party-1..5.webp), shown when someone taps "What's in your order" on the website. Kits differ in
// length, so their toy pages are picked by position. Also writes the activity pack's card for the
// order stack (docs/img/pages/<theme>-activity.webp) and the theme picker's square thumbnail
// (docs/img/themes/<theme>.webp, cut from the play kit card made by site-images.js).
// The little-kids version (ages 2 to 4) of the kit and activity pack goes in gallery/<theme>/little/,
// with its order stack cards in docs/img/pages/<theme>-little-kit.webp and -little-activity.webp.
// Every picture with the child's name also gets a twin without it in docs/img/n/ (see name-slots.js).
// Usage: node scripts/gallery-images.js [theme ...]
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { renderPdf } = require('../src/generator/render');
const { renderKit, renderActivities } = require('../src/kits/render-kit');
const { renderParty } = require('../src/party/render-party');
const { kitForHunt, KITS, buildKitHtml } = require('../src/kits/engine');
const THEMES = require('../src/generator/themes');
const { blankJob, saveIndex } = require('../src/generator/name-slots');

const OUT = path.join(__dirname, '..', 'docs', 'img', 'gallery');
const SPOTS = ['front_door', 'shoe_rack', 'couch', 'dryer', 'bathtub', 'bookshelf', 'pet_bed', 'kitchen_table'];
const PARTY = { date: 'Saturday, June 3', time: '2 to 4 pm', place: 'Our house', rsvp: 'Text Sam' };
// The page the hands-on toys start after: shop-style kits have a big shop sign first.
const firstToy = (kitId) => (KITS[kitId].hunt && !KITS[kitId].bigSign ? 4 : 5);
// The kit's wow prop page (def.wow), shown as the third kit sample.
const wowPage = (kitId, ages) => {
  const html = buildKitHtml({ kit: kitId, childName: 'Maya', ages, subjects: [], lenient: true });
  const at = html.indexOf('<section class="page props wow"');
  if (at < 0) throw new Error(`${kitId} has no wow page`);
  return html.slice(0, at).split('<section class="page').length;
};
const count = (dir) => fs.readdirSync(dir).filter((f) => /^page-\d+\.png$/.test(f)).length;

// The little-kids kit and activity pack: thicker cut lines, bigger pictures, dot, path and cut-and-glue pages.
async function little(id, kitId, tmp, jobs) {
  const dir = (k) => path.join(tmp, `${id}-little-${k}`);
  await renderKit({ kit: kitId, childName: 'Maya', ages: 'little', subjects: [], lenient: true }, `${dir('kit')}.pdf`, { pngDir: dir('kit'), nameSlots: 'Maya' });
  await renderActivities({ kit: kitId, childName: 'Maya', ages: 'little', lenient: true }, `${dir('activity')}.pdf`, { pngDir: dir('activity'), nameSlots: 'Maya' });
  const kit = count(dir('kit'));
  const start = firstToy(kitId);
  const toys = [0.35, 0.55, 0.75].map((f) => Math.round(start + f * (kit - start)));
  const picks = {
    kit: [2, start - 1, wowPage(kitId, 'little'), toys[1], toys[2]],
    activity: [1, 4, 12, 14, 9], // cover, trace the path, stick it on, color by dot, I spy
  };
  fs.mkdirSync(path.join(OUT, id, 'little'), { recursive: true });
  for (const [k, pages] of Object.entries(picks)) {
    pages.forEach((n, i) => jobs.push([path.join(dir(k), `page-${n}.png`), path.join(OUT, id, 'little', `${k}-${i + 1}.webp`)]));
  }
  jobs.push([path.join(dir('kit'), `page-${toys[0]}.png`), path.join(OUT, '..', 'pages', `${id}-little-kit.webp`), 400]);
  jobs.push([path.join(dir('activity'), 'page-9.png'), path.join(OUT, '..', 'pages', `${id}-little-activity.webp`), 400]);
}

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
      await renderKit({ kit: id, childName: 'Maya', subjects: [], lenient: true }, `${dir('kit')}.pdf`, { pngDir: dir('kit'), nameSlots: 'Maya' });
      await renderActivities({ kit: id, childName: 'Maya', lenient: true }, `${dir('activity')}.pdf`, { pngDir: dir('activity'), nameSlots: 'Maya' });
      const kit = count(dir('kit'));
      const picks = {
        kit: [2, 4, wowPage(id), ...[0.55, 0.75].map((f) => Math.round(5 + f * (kit - 5)))], // welcome poster, shop sign, wow prop, two toys
        activity: [1, 6, 11, 12, 13], // cover, I spy, secret code, color by number, roll a creature
      };
      fs.mkdirSync(path.join(OUT, id), { recursive: true });
      for (const [k, pages] of Object.entries(picks)) {
        pages.forEach((n, i) => jobs.push([path.join(dir(k), `page-${n}.png`), path.join(OUT, id, `${k}-${i + 1}.webp`)]));
      }
      jobs.push([path.join(dir('kit'), `page-${Math.round(5 + 0.35 * (kit - 5))}.png`), path.join(OUT, '..', 'pages', `${id}-kit.webp`), 400]);
      jobs.push([path.join(dir('activity'), 'page-6.png'), path.join(OUT, '..', 'pages', `${id}-activity.webp`), 400]);
      await little(id, id, tmp, jobs);
      console.log('Rendered', id);
      continue;
    }
    await renderPdf({ theme: id, childName: 'Maya', age: 6, spots: SPOTS, pictures: true }, `${dir('hunt')}.pdf`, { pngDir: dir('hunt'), nameSlots: 'Maya' });
    await renderParty({ theme: id, childName: 'Maya', age: 6, party: PARTY }, `${dir('party')}.pdf`, { pngDir: dir('party'), nameSlots: 'Maya' });
    await renderKit({ kit: kitForHunt(id).id, childName: 'Maya', subjects: [], lenient: true }, `${dir('kit')}.pdf`, { pngDir: dir('kit'), nameSlots: 'Maya' });
    await renderActivities({ kit: kitForHunt(id).id, childName: 'Maya', lenient: true }, `${dir('activity')}.pdf`, { pngDir: dir('activity'), nameSlots: 'Maya' });
    const hunt = count(dir('hunt'));
    const kit = count(dir('kit'));
    const start = firstToy(kitForHunt(id).id);
    const picks = {
      hunt: [1, 2, 3, 4, hunt], // host guide, briefing, two clue card sheets, certificate
      activity: [1, 6, 11, 12, 13], // cover, I spy, secret code, color by number, roll a creature
      party: [2, 3, 4, 5, 6], // invitations, thank-you cards, toppers, favor tags, banner
      kit: [2, start - 1, wowPage(kitForHunt(id).id), ...[0.55, 0.75].map((f) => Math.round(start + f * (kit - start)))], // welcome poster, sign, wow prop, two toys
    };
    fs.mkdirSync(path.join(OUT, id), { recursive: true });
    for (const [k, pages] of Object.entries(picks)) {
      pages.forEach((n, i) => jobs.push([path.join(dir(k), `page-${n}.png`), path.join(OUT, id, `${k}-${i + 1}.webp`)]));
    }
    jobs.push([path.join(dir('activity'), 'page-6.png'), path.join(OUT, '..', 'pages', `${id}-activity.webp`), 400]);
    await little(id, kitForHunt(id).id, tmp, jobs);
    console.log('Rendered', id);
  }
  // Twins with the name left out, for the website to write the typed name over (docs/js/names.js).
  const index = {};
  for (const [src, out, w] of [...jobs]) {
    const twin = blankJob(index, src, out);
    if (twin) jobs.push(w ? [...twin, w] : twin);
  }
  saveIndex(index);
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
