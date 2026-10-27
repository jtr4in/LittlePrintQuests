// Builds the order preview gallery in docs/img/gallery/<theme>/: five real pages each from the hunt,
// the pretend play kit, the activity pack and the party pack (hunt-1..5, kit-1..5, activity-1..5,
// party-1..5.webp), shown when someone taps "What's in your order" on the website. Kits differ in
// length, so their toy pages are picked by position. Also writes the activity pack's card for the
// order stack (docs/img/pages/<theme>-activity.webp) and the theme picker's square thumbnail
// (docs/img/themes/<theme>.webp, cut from the play kit card made by site-images.js).
// The little-kids version (ages 3 to 5) of the kit and activity pack goes in gallery/<theme>/little/,
// with its order stack cards in docs/img/pages/<theme>-little-kit.webp and -little-activity.webp.
// Every picture with the child's name also gets a twin without it in docs/img/n/ (see name-slots.js).
// Usage: node scripts/gallery-images.js [theme ...]
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { renderPdf } = require('../src/generator/render');
const { buildHtml, pageRoles } = require('../src/generator/build');
const { renderKit, renderActivities } = require('../src/kits/render-kit');
const { renderParty } = require('../src/party/render-party');
const { kitForHunt, KITS, buildKitHtml } = require('../src/kits/engine');
const { origamiShift } = require('../src/kits/activities');
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
// The big picture pages (src/kits/bigpages.js): their page numbers, so the toy picks below skip
// over them. The first one is kit-4, which the hero scenes and pins use; the site shows the
// big-<n>.webp row from scripts/big-previews.js in its place. They sit among the toy pages, next to
// pages of the same kind. A kit without them gets another toy as kit-4 instead.
const bigPages = (kitId, ages) => {
  const html = buildKitHtml({ kit: kitId, childName: 'Maya', ages, subjects: [], lenient: true });
  return html.split('<section class="page').slice(1).map((s, i) => (s.startsWith(' bigpic"') ? i + 1 : 0)).filter(Boolean);
};
// A toy page picked by position (0 to 1) along the kit after its first toy, not counting the big pages.
const toyAt = (kitId, ages, start, kit, f) => {
  const big = bigPages(kitId, ages);
  const toys = [];
  for (let n = start; n <= kit; n++) if (!big.includes(n)) toys.push(n);
  return toys[Math.round(f * (toys.length - 1))];
};
const bigOrToy = (kitId, ages, start, kit) => bigPages(kitId, ages)[0] || toyAt(kitId, ages, start, kit, 0.55);
// Once a kit has its origami pictures, its activity pack opens with two origami pages (paper, then
// steps). Then the gallery leads with the cover and both origami pages, and the order stack's
// activity paper is the origami paper (Jason, 2026-10-26).
const actPicks = (kitId, list) => { const s = origamiShift(kitId); return s ? [1, 2, 3, list[1] + s, list[2] + s] : list; };
const actCard = (kitId, n) => (origamiShift(kitId) ? 2 : n);
const count = (dir) => fs.readdirSync(dir).filter((f) => /^page-\d+\.png$/.test(f)).length;

// The little-kids kit and activity pack: thicker cut lines, bigger pictures, dot, path and cut-and-glue pages.
async function little(id, kitId, tmp, jobs) {
  const dir = (k) => path.join(tmp, `${id}-little-${k}`);
  await renderKit({ kit: kitId, childName: 'Maya', ages: 'little', subjects: [], lenient: true }, `${dir('kit')}.pdf`, { pngDir: dir('kit'), nameSlots: 'Maya' });
  await renderActivities({ kit: kitId, childName: 'Maya', ages: 'little', lenient: true }, `${dir('activity')}.pdf`, { pngDir: dir('activity'), nameSlots: 'Maya' });
  const kit = count(dir('kit'));
  const start = firstToy(kitId);
  const toys = [0.35, 0.55, 0.75].map((f) => toyAt(kitId, 'little', start, kit, f));
  const picks = {
    kit: [2, start - 1, wowPage(kitId, 'little'), bigOrToy(kitId, 'little', start, kit), toys[2]],
    activity: actPicks(kitId, [1, 4, 12, 14, 9]), // cover, trace the path, stick it on, color by dot, I spy
  };
  fs.mkdirSync(path.join(OUT, id, 'little'), { recursive: true });
  for (const [k, pages] of Object.entries(picks)) {
    pages.forEach((n, i) => jobs.push([path.join(dir(k), `page-${n}.png`), path.join(OUT, id, 'little', `${k}-${i + 1}.webp`)]));
  }
  jobs.push([path.join(dir('kit'), `page-${toys[0]}.png`), path.join(OUT, '..', 'pages', `${id}-little-kit.webp`), 400]);
  jobs.push([path.join(dir('activity'), `page-${actCard(kitId, 9)}.png`), path.join(OUT, '..', 'pages', `${id}-little-activity.webp`), 400]);
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
        kit: [2, 4, wowPage(id), bigOrToy(id, undefined, 5, kit), toyAt(id, undefined, 5, kit, 0.75)], // welcome poster, shop sign, wow prop, big picture page, a toy
        activity: actPicks(id, [1, 6, 11, 12, 13]), // cover, I spy, secret code, color by number, roll a creature
      };
      fs.mkdirSync(path.join(OUT, id), { recursive: true });
      for (const [k, pages] of Object.entries(picks)) {
        pages.forEach((n, i) => jobs.push([path.join(dir(k), `page-${n}.png`), path.join(OUT, id, `${k}-${i + 1}.webp`)]));
      }
      jobs.push([path.join(dir('kit'), `page-${toyAt(id, undefined, 5, kit, 0.35)}.png`), path.join(OUT, '..', 'pages', `${id}-kit.webp`), 400]);
      jobs.push([path.join(dir('activity'), `page-${actCard(id, 6)}.png`), path.join(OUT, '..', 'pages', `${id}-activity.webp`), 400]);
      await little(id, id, tmp, jobs);
      console.log('Rendered', id);
      continue;
    }
    const huntCfg = { theme: id, childName: 'Maya', age: 6, spots: SPOTS, pictures: true };
    await renderPdf(huntCfg, `${dir('hunt')}.pdf`, { pngDir: dir('hunt'), nameSlots: 'Maya' });
    const roles = pageRoles(buildHtml(huntCfg));
    await renderParty({ theme: id, childName: 'Maya', age: 6, party: PARTY }, `${dir('party')}.pdf`, { pngDir: dir('party'), nameSlots: 'Maya' });
    await renderKit({ kit: kitForHunt(id).id, childName: 'Maya', subjects: [], lenient: true }, `${dir('kit')}.pdf`, { pngDir: dir('kit'), nameSlots: 'Maya' });
    await renderActivities({ kit: kitForHunt(id).id, childName: 'Maya', lenient: true }, `${dir('activity')}.pdf`, { pngDir: dir('activity'), nameSlots: 'Maya' });
    const kit = count(dir('kit'));
    const start = firstToy(kitForHunt(id).id);
    const picks = {
      hunt: [roles.host, roles.briefing, roles.sheet, roles.sheet + 1, roles.cert], // host guide, briefing, two clue card sheets, certificate
      activity: actPicks(kitForHunt(id).id, [1, 6, 11, 12, 13]), // cover, I spy, secret code, color by number, roll a creature
      party: [2, 3, 4, 5, 6], // invitations, thank-you cards, toppers, favor tags, banner
      kit: [2, start - 1, wowPage(kitForHunt(id).id), bigOrToy(kitForHunt(id).id, undefined, start, kit), toyAt(kitForHunt(id).id, undefined, start, kit, 0.75)], // welcome poster, sign, wow prop, big picture page, a toy
    };
    fs.mkdirSync(path.join(OUT, id), { recursive: true });
    for (const [k, pages] of Object.entries(picks)) {
      pages.forEach((n, i) => jobs.push([path.join(dir(k), `page-${n}.png`), path.join(OUT, id, `${k}-${i + 1}.webp`)]));
    }
    jobs.push([path.join(dir('activity'), `page-${actCard(kitForHunt(id).id, 6)}.png`), path.join(OUT, '..', 'pages', `${id}-activity.webp`), 400]);
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
  // The big picture pages shown after the wow piece (big-<n>.webp), cut from the kits' own pictures.
  require('./big-previews').writeImages(only);
  console.log('Wrote docs/img/gallery for', only.length ? only.join(', ') : 'every theme');
})();
