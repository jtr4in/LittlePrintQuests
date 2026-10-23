// Draws the Pinterest pins (1000x1500) for every hunt theme, play kit, little-kids kit, activity pack,
// party pack and free-ideas page, into docs/pins/img/<id>.jpg, and lists them in docs/pins/pool.json
// with each pin's board feed, title, description and link. pin-feed.js then adds a few of them to the
// Pinterest RSS feeds each day (Pinterest's "Auto-publish" reads docs/pins/<feed>.xml).
//   node scripts/pins.js [pin-id ...]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const THEMES = require('../src/generator/themes');
const SPACES = require('../src/generator/spaces');
const { KITS, kitForHunt } = require('../src/kits/engine');

const SITE = 'https://littleprintquests.com/';
const IMG = path.join(__dirname, '..', 'docs', 'img');
const OUT = path.join(__dirname, '..', 'docs', 'pins');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const slug = (s) => s.toLowerCase().replace(/’s\b/g, 's').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const data = (f) => `data:image/${f.endsWith('png') ? 'png' : 'webp'};base64,${fs.readFileSync(path.join(IMG, f)).toString('base64')}`;
const link = (q) => `${SITE}make/?${new URLSearchParams({ ...q, utm_source: 'pinterest', utm_medium: 'pin' })}`;
// "Dinosaur" -> "dinosaur" mid-sentence, but holidays keep their capital.
const lower = (s) => (/^(Halloween|Christmas|Easter|Valentine)/.test(s) ? s : s.replace(/^[A-Z](?=[a-z])/, (c) => c.toLowerCase()));

// Three pages fanned out, the middle one on top.
const fan = (files) => `<div class="fan">${files.map((f, i) => `<img class="pg p${i}" src="${data(f)}">`).join('')}</div>`;
// Kits with a photo of the printed kit set up at home (docs/img/life/) show that on their pin instead of the page fan.
const LIFE = { pizza: 'stand', vet: 'stand', dino: 'stand', unicorn: 'stand', halloween: 'stand' };
const scene = (f) => `<div class="scene" style="background-image:url(${data(f)})"></div>`;

const PINS = [];
const shops = Object.values(KITS).filter((k) => !k.hunt);

for (const [id, t] of Object.entries(THEMES)) {
  const kit = kitForHunt(id);
  const c = t.colors;
  PINS.push({
    id: `hunt-${id}`, feed: 'scavenger-hunts', color: c.primary,
    kicker: 'Printable birthday game', head: `${t.label} Scavenger Hunt`, sub: 'Rhyming clue cards with your child’s name and your own hiding spots',
    tags: ['Ages 2 to 8', 'Print at home'], art: scene(`hero/${id}.webp`),
    title: `${t.label} Birthday Scavenger Hunt for Kids, Printable and Personalized`,
    description: `A ${lower(t.label)} treasure hunt made for your child: rhyming clue cards for the hiding spots in your own home, a mission briefing to read aloud and a finisher certificate. Print at home in minutes, great for birthday parties and rainy days. Ages 2 to 8.`,
    link: link({ theme: id }),
  });
  PINS.push({
    id: `ideas-${id}`, feed: 'scavenger-hunts', color: c.accent,
    kicker: 'Free ideas', head: `Free ${t.label} Scavenger Hunt Clues`, sub: 'Rhyming riddles for the couch, the fridge, the bathtub and more',
    tags: ['Use them today', 'No printer needed'], art: fan([`gallery/${id}/hunt-3.webp`, `gallery/${id}/hunt-2.webp`, `gallery/${id}/hunt-4.webp`]),
    title: `Free ${t.label} Scavenger Hunt Clues and Ideas for Kids`,
    description: `Free rhyming ${lower(t.label)} scavenger hunt clues for spots all over the house, plus tips for running the hunt at a birthday party. Use them today, or turn them into printable clue cards with your child’s name.`,
    link: `${SITE}ideas/${slug(t.label)}-scavenger-hunt/?utm_source=pinterest&utm_medium=pin`,
  });
  PINS.push({
    id: `party-${id}`, feed: 'party-printables', color: c.primary,
    kicker: 'Printable party pack', head: `${t.label} Birthday Party Printables`, sub: 'Invitations, cupcake toppers, favor tags and a banner with their name',
    tags: ['Personalized', 'Print at home'], art: fan([`gallery/${id}/party-1.webp`, `gallery/${id}/party-3.webp`, `gallery/${id}/party-5.webp`]),
    title: `${t.label} Birthday Party Printables: Invitations, Cupcake Toppers, Banner`,
    description: `Everything for a ${lower(t.label)} birthday party with your child’s name on it: invitations, thank-you cards, cupcake toppers, favor tags and a party banner. Print at home and cut out.`,
    link: link({ theme: id }),
  });
  kitPins(kit, { theme: id });
}
for (const k of shops) kitPins(k, { kit: k.id });

for (const s of Object.values(SPACES)) {
  PINS.push({
    id: `ideas-${slug(s.title)}`, feed: 'scavenger-hunts', color: '#2f9a6b',
    kicker: 'Free ideas', head: s.title, sub: 'Free rhyming clues for the spots you really have',
    tags: ['Use them today', 'Ages 2 to 8'], art: fan(['gallery/dino/hunt-3.webp', 'gallery/unicorn/hunt-3.webp', 'gallery/pirate/hunt-3.webp']),
    title: `${s.title} for Kids: Free Clues and Ideas`,
    description: `Free rhyming scavenger hunt clues for kids, picked for the spots you really have, plus easy tips for setting up a hunt at home.`,
    link: `${SITE}ideas/${slug(s.title)}/?utm_source=pinterest&utm_medium=pin`,
  });
}

// A play kit, its little-kids version and its activity pack.
function kitPins(k, q) {
  const g = (n) => `gallery/${q.theme || k.id}/${n}.webp`;
  const color = k.colors?.main || k.colors?.primary || '#ef9d31';
  PINS.push({
    id: `kit-${k.id}`, feed: 'pretend-play', color,
    kicker: 'Pretend play printable', head: `${k.name} Pretend Play Kit`, sub: 'Signs, menus, money and props with your child’s name on them',
    tags: ['Ages 2 to 8', 'Print at home'], art: LIFE[k.id] ? scene(`life/${k.id}-${LIFE[k.id]}.webp`) : `<div class="wide"><img src="${data(`kit-${k.id}.webp`)}"></div>`,
    title: `${k.name} Pretend Play Printable Kit for Kids, Personalized`,
    description: `Turn the living room into your child’s own ${lower(k.name)}: shop signs, order forms, play money, props and a grown-up guide full of play ideas, all with their name on it. A screen-free dramatic play set to print at home.`,
    link: link(q),
  });
  PINS.push({
    id: `little-${k.id}`, feed: 'pretend-play', color,
    kicker: 'For toddlers and preschoolers', head: `${k.name} Play Kit for Ages 2 to 4`, sub: 'Big pictures, thick cut lines and order forms they fill in by circling',
    tags: ['No reading needed', 'Print at home'], art: fan([g('little/kit-3'), g('little/kit-1'), g('little/kit-4')]),
    title: `Toddler Pretend Play Printable: ${k.name} for Ages 2 to 4`,
    description: `A ${lower(k.name)} dramatic play kit made for little hands: big pictures, thick cut lines and picture order forms toddlers and preschoolers fill in by circling. Personalized with your child’s name.`,
    link: link({ ...q, age: 3 }),
  });
  PINS.push({
    id: `activity-${k.id}`, feed: 'activity-pages', color,
    kicker: 'Wipe and play pages', head: `${k.name} Activity Pages`, sub: 'I spy, mazes, spot the difference and counting to use again and again',
    tags: ['Ages 2 to 8', 'Dry-erase friendly'], art: fan([g('activity-2'), g('activity-1'), g('activity-4')]),
    title: `${k.name} Activity Pages for Kids: I Spy, Mazes, Spot the Difference`,
    description: `Printable ${lower(k.name)} activity pages: I spy, a maze, spot the difference, counting and more. Slip them in a sheet protector and use a dry-erase marker again and again. Great for quiet time and travel.`,
    link: link(q),
  });
}

const CSS = `
body{margin:0;width:1000px;height:1500px;overflow:hidden;background:#fbf8f1;font-family:'Atkinson Hyperlegible';color:#2f3760;position:relative}
.top{position:absolute;left:0;right:0;top:0;height:560px;padding:64px 70px 0;box-sizing:border-box}
.kicker{display:inline-block;font:700 26px Atkinson Hyperlegible;letter-spacing:.08em;text-transform:uppercase;color:#fff;padding:10px 20px;border-radius:999px}
h1{margin:26px 0 0;font:700 86px/1.02 Fredoka;color:#2f3760;text-wrap:balance}
.sub{margin-top:22px;font-size:34px;line-height:1.3;color:#5b6488;text-wrap:balance}
.art{position:absolute;left:0;right:0;top:540px;height:780px}
.scene{position:absolute;inset:0 0 0 0;background-size:cover;background-position:center}
.fan{position:absolute;inset:0}
.pg{position:absolute;width:440px;top:60px;border-radius:10px;box-shadow:0 18px 40px rgba(40,40,70,.25);background:#fff}
.p0{left:40px;transform:rotate(-8deg);top:100px}.p2{left:520px;transform:rotate(7deg);top:100px}.p1{left:270px;top:30px;width:460px;z-index:2}
.wide{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}.wide img{width:960px;filter:drop-shadow(0 18px 30px rgba(40,40,70,.22))}
.foot{position:absolute;left:0;right:0;bottom:0;height:180px;display:flex;align-items:center;justify-content:space-between;padding:0 70px;box-sizing:border-box;background:#fff}
.tags{display:flex;gap:14px}.tags span{font:700 26px Atkinson Hyperlegible;padding:12px 20px;border-radius:999px;background:#f2f0ea;color:#3f4a73}
.brand{display:flex;align-items:center;gap:12px;font:700 32px Fredoka}.brand img{width:58px}
.l{color:#2f9a6b}.p{color:#ef9d31}.q{color:#475379}
`;

(async () => {
  const only = process.argv.slice(2);
  fs.mkdirSync(path.join(OUT, 'img'), { recursive: true });
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1000, height: 1500 } });
  const mark = data('mark.png');
  for (const p of PINS.filter((x) => !only.length || only.includes(x.id))) {
    await page.setContent(`<!doctype html><html><head>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Atkinson+Hyperlegible:wght@400;700&display=swap">
<style>${CSS}</style></head><body>
<div class="top"><span class="kicker" style="background:${p.color}">${esc(p.kicker)}</span><h1>${esc(p.head)}</h1><div class="sub">${esc(p.sub)}</div></div>
<div class="art">${p.art}</div>
<div class="foot"><div class="tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
<div class="brand"><img src="${mark}"><span><span class="l">Little</span><span class="p">Print</span><span class="q">Quests</span></span></div></div>
</body></html>`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(OUT, 'img', `${p.id}.jpg`), type: 'jpeg', quality: 82 });
  }
  await b.close();
  const pool = PINS.map(({ id, feed, title, description, link: url }) => ({ id, feed, title, description, link: url, image: `${SITE}pins/img/${id}.jpg` }));
  fs.writeFileSync(path.join(OUT, 'pool.json'), JSON.stringify(pool, null, 1) + '\n');
  console.log(`Drew ${only.length || PINS.length} pins; ${PINS.length} in docs/pins/pool.json`);
})();
