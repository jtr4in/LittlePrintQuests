// Builds the "ideas" pages for search: one page per hunt theme and one per kind of home, plus a
// hub and sitemap.xml (submit it in Google Search Console; a project site can't have its own robots.txt). Everything comes from the real riddle library and theme stories,
// so each page gives parents free clues they can use today and a link into the builder.
//   node scripts/idea-pages.js

const fs = require('fs');
const path = require('path');
const THEMES = require('../src/generator/themes');
const SPOTS = require('../src/generator/spots');
const SPACES = require('../src/generator/spaces');
const { KITS } = require('../src/kits/engine');

const SITE = 'https://littleprintquests.com/';
const DOCS = path.join(__dirname, '..', 'docs');
const OUT = path.join(DOCS, 'ideas');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const slug = (s) => s.toLowerCase().replace(/’s\b/g, 's').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const themeSlug = (t) => `${slug(t.label)}-scavenger-hunt`;
const spaceSlug = (s) => slug(s.title);
const kitSlug = (k) => `${slug(k.name)}-pretend-play`;
// The order page, with the theme, trail or kit already picked.
const builder = (q) => `../../make/?${new URLSearchParams(q)}`;
const lines = (couplet) => couplet.map(esc).join('<br>');
// Kits with photos of the printed kit at home (docs/img/life/): the play stand leads the page, the flat lay of
// everything in the kit sits with the printable, and a play shot sits with the games.
const LIFE = { pizza: 'b', vet: 'b', dino: 'a', unicorn: 'a', halloween: 'b' };
// A styled shot of the cut-out kit in use replaces the play stand at the top where we have one.
const STYLED = { dino: 'The printed Dino Dig Lab kit set up for play: shop sign, open sign, fossil puzzle, dig map and badges' };
// Hunt themes with a photo of the printed hunt being played, shown with the printable.
const HUNT_LIFE = { dino: 'A child by the bookshelf holding up a Dino Ranger Field Note clue card, with another clue taped to the shelf and the Urgent Field Report letter on the rug' };
// Step-by-step cardboard box builds that use the kit's own signs and props (docs/img/howto/, 1200x1800).
const HOWTO = {"auto": "Make a Car Wash", "burger": "Make a Drive-Thru", "christmas": "Make a Sleigh", "coffee": "Make a Coffee Machine", "construction": "Make Cardboard Bricks", "dentist": "Make a Prize Box", "dino": "Make a Dino Dig Pit", "easter": "Make an Egg Drying Rack", "fire": "Make a Fire Truck", "grocery": "Make a Store Shelf", "halloween": "Make a Potion Counter", "hero": "Make a Cape Closet", "ice": "Make an Igloo Den", "italian": "Make a Play Stove", "library": "Make a Book Drop", "mermaid": "Make a Treasure Chest", "petshop": "Make a Puppy House", "pirate": "Make a Pirate Ship", "pizza": "Make a Pizza Oven", "police": "Make a Police Car", "post": "Make a Mailbox", "racecar": "Make a Race Car", "royal": "Make a Castle", "space": "Make a Rocket", "unicorn": "Make a Unicorn Stable", "valentine": "Make a Valentine Mailbox", "vet": "Make an X-Ray Machine"};
const howto = (k) => (HOWTO[k.id] ? `<h2>Build it from a box</h2>
<p>${esc(HOWTO[k.id])} from a cardboard box and the pieces in your kit. Grown-ups do the cutting, kids paint, glue and play.</p>
<a href="../../img/howto/${k.id}.webp"><img class="photo howto" src="../../img/howto/${k.id}-sm.webp" srcset="../../img/howto/${k.id}-sm.webp 640w, ../../img/howto/${k.id}.webp 1200w" sizes="(max-width: 760px) 100vw, 560px" width="1200" height="1800" alt="${esc(HOWTO[k.id])}: six illustrated steps to build it from a cardboard box with the printed ${esc(k.name)} kit" loading="lazy"></a>` : '');
const lifePhoto = (k, v, alt, lazy = true) => (LIFE[k.id] ? `<img class="photo" src="../../img/life/${k.id}-${v}.webp" srcset="../../img/life/${k.id}-${v}-sm.webp 640w, ../../img/life/${k.id}-${v}.webp 1200w" sizes="(max-width: 760px) 100vw, 720px" width="1200" height="896" alt="${esc(alt)}"${lazy ? ' loading="lazy"' : ''}>` : '');

const CSS = `
:root { --paper:#fbf8f1; --sheet:#fff; --ink:#3f4a73; --soft:#646d8f; --line:#e4dfd2; --orange:#ef9d31; --orange-ink:#2b1d06; --mint:#2f9a6b; --tint:#f2f8f2;
  --display:'Fredoka','Trebuchet MS',system-ui,sans-serif; --body:'Atkinson Hyperlegible','Segoe UI',system-ui,sans-serif; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --paper:#151a2e; --sheet:#1e2541; --ink:#f4f0e6; --soft:#b4bad4; --line:#343c63; --orange:#f2a640; --mint:#89dcb0; --tint:#1d2c3a; color-scheme:dark; } }
:root[data-theme="dark"] { --paper:#151a2e; --sheet:#1e2541; --ink:#f4f0e6; --soft:#b4bad4; --line:#343c63; --orange:#f2a640; --mint:#89dcb0; --tint:#1d2c3a; color-scheme:dark; }
* { box-sizing:border-box; }
body { margin:0; background:var(--paper); color:var(--ink); font:17px/1.6 var(--body); }
a { color:inherit; }
.wrap { max-width:880px; margin:0 auto; padding:0 16px; }
header { padding:18px 0; border-bottom:1px solid var(--line); }
header a { font:700 20px var(--display); text-decoration:none; }
header a span:nth-child(1) { color:#2f9a6b; } header a span:nth-child(2) { color:var(--orange); }
h1, h2, h3 { font-family:var(--display); line-height:1.15; text-wrap:balance; }
h1 { font-size:clamp(32px,6vw,48px); margin:36px 0 12px; }
h2 { font-size:clamp(24px,4vw,32px); margin:44px 0 12px; }
h3 { font-size:19px; margin:0 0 6px; }
.lede { font-size:19px; color:var(--soft); max-width:62ch; }
.btn { display:inline-block; font:600 17px/1 var(--body); text-decoration:none; padding:15px 22px; border-radius:999px; background:var(--orange); color:var(--orange-ink); margin:8px 8px 0 0; }
.btn.ghost { background:transparent; color:var(--ink); border:1.5px solid var(--line); }
.clues { display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:14px; padding:0; list-style:none; }
.clue { background:var(--sheet); border:2px dashed var(--line); border-radius:14px; padding:16px 18px; }
.clue p { margin:0 0 10px; font-size:18px; }
.clue small { display:block; color:var(--soft); font-size:14px; }
.clue small b { color:var(--mint); }
.story { background:var(--tint); border-radius:14px; padding:20px 22px; }
.story p { margin:0 0 10px; }
.photo.howto { max-width:560px; display:block; margin-left:auto; margin-right:auto; }
.pages { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
.pages img { width:100%; height:auto; border-radius:6px; box-shadow:0 2px 10px rgba(0,0,0,.12); background:#fff; }
.photo { display:block; width:100%; height:auto; border-radius:14px; margin:22px 0 4px; }
.links { display:flex; flex-wrap:wrap; gap:8px; padding:0; list-style:none; }
.links a { display:inline-block; padding:8px 14px; border:1.5px solid var(--line); border-radius:999px; text-decoration:none; font-size:15px; background:var(--sheet); }
ul.tips li { margin-bottom:6px; }
details { border-bottom:1px solid var(--line); padding:12px 0; } summary { font-weight:700; cursor:pointer; }
footer { margin-top:56px; padding:28px 0 40px; border-top:1px solid var(--line); color:var(--soft); font-size:15px; }
@media (max-width:600px) { .pages { grid-template-columns:repeat(2,1fr); } }
`;

function page({ file, title, description, body, jsonLd }) {
  const url = SITE + path.relative(DOCS, path.dirname(file)).split(path.sep).join('/') + '/';
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="LittlePrintQuests">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}img/share.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="${SITE}img/favicon.png">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Atkinson+Hyperlegible:wght@400;700&display=swap">
<style>${CSS}</style>
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
</head>
<body>
<header><div class="wrap"><a href="../../"><span>Little</span><span>Print</span><span>Quests</span></a></div></header>
<main class="wrap">
${body}
</main>
<footer><div class="wrap">Printable party games and quests for kids ages 3 to 8 · <a href="../">More party and hunt ideas</a> · <a href="../../">LittlePrintQuests</a></div></footer>
</body>
</html>
`;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  return url;
}

const clueCard = (id, n) => {
  const s = SPOTS[id];
  return `<li class="clue"><h3>Clue ${n}</h3><p>${lines(s.riddle)}</p><small><b>Answer:</b> ${esc(s.label)}. <b>Hide it:</b> ${esc(s.tip)}.</small></li>`;
};

const faq = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});
const faqHtml = (items) => items.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n');

function themePage(t, i, all) {
  const ids = Object.keys(SPOTS);
  // A different run of the riddle library on each theme page, so no two pages share their clues.
  const picks = Array.from({ length: 5 }, (_, k) => ids[(i * 2 + k * 7) % ids.length]);
  const story = t.briefing.paragraphs.map((p) => p.replace(/\{kids\}/g, t.hunters).replace(/\{count\}/g, 'eight'));
  const young = t.ages.split('–')[0];
  const questions = [
    [`What age is a ${t.label.toLowerCase()} scavenger hunt for?`, `This hunt is written for ages ${t.ages}. Younger kids follow the picture on each card while a grown-up reads the rhyme; older kids can read the clues on their own.`],
    ['How many clues should a scavenger hunt have?', 'Six to ten clues is the sweet spot for ages 3 to 8. It takes about 15 to 25 minutes, long enough to feel like a quest and short enough that nobody loses interest.'],
    ['Can I do this hunt in a small apartment?', 'Yes. Pick spots in every room and zig-zag between them. The apartment trail below uses eight spots every apartment has.'],
  ];
  const body = `
<h1>${esc(t.label)} scavenger hunt for kids</h1>
<p class="lede">A rhyming ${esc(t.label.toLowerCase())} treasure hunt for ages ${esc(t.ages)}. Read the story, hide the clues around the house and let the ${esc(t.hunters.toLowerCase())} follow the trail to the ${esc(t.treasureWord)}. Here are free clues to start with, and a printable version with your child’s name and your own hiding spots.</p>
<a class="btn" href="${builder({ theme: t.id })}">Make a personalized ${esc(t.label)} hunt</a>

<h2>Start with the story</h2>
<p>Read this out loud before the first clue. It turns “go find some cards” into a mission.</p>
<div class="story"><h3>${esc(t.briefing.title)}</h3>${story.map((p) => `<p>${esc(p)}</p>`).join('')}<p><i>${esc(t.briefing.signoff)}<br>${esc(t.briefing.from)}</i></p></div>

<h2>5 free rhyming clues</h2>
<p>Write each riddle on a card and hide it at the answer to the clue before it. The first clue goes in the kids’ hands after the story.</p>
<ol class="clues">${picks.map((id, k) => clueCard(id, k + 1)).join('')}</ol>
<p>Between clues, read a ${esc(t.label.toLowerCase())} rhyme to keep the story going:</p>
<div class="story"><p>${lines(t.openers.start)}</p><p>${lines(t.openers.middle[0])}</p><p>${lines(t.openers.last)}</p></div>

<h2>Make it right for their age</h2>
<ul class="tips">
<li><b>Ages ${esc(young)} to 5:</b> add a picture of the hiding spot to every card so pre-readers can solve it, and keep the trail to 6 spots.</li>
<li><b>Ages 6 and up:</b> let the kids read the riddles themselves, use 8 to 10 spots and add a silly challenge at each stop.</li>
<li><b>A big group:</b> give each child a turn to read a clue or find a card so everyone gets a win.</li>
</ul>

<h2>Want it printed and personalized?</h2>
<p>The printable ${esc(t.name)} has your child’s name on every page and a rhyming clue for each spot in your home, including ones you type in, like “Grandma’s piano”. You get a host guide, the story briefing, clue cards with pictures for little ones and a finisher certificate, plus Field Kit on your phone for party day. It’s $9.99, or $17.99 with its matching pretend play kit and activity pack, and arrives by email in minutes.</p>
${HUNT_LIFE[t.id] ? `<img class="photo" src="../../img/life/hunt-${t.id}.webp" srcset="../../img/life/hunt-${t.id}-sm.webp 640w, ../../img/life/hunt-${t.id}.webp 1200w" sizes="(max-width: 760px) 100vw, 720px" width="1200" height="896" alt="${esc(HUNT_LIFE[t.id])}" loading="lazy">\n` : ''}<div class="pages">${['hunt', 'briefing', 'cards', 'cert'].map((k) => `<img src="../../img/pages/${t.id}-${k}.webp" alt="${esc(t.name)} printable ${k} page" width="400" height="518" loading="lazy">`).join('')}</div>
<p>
<a class="btn" href="${builder({ theme: t.id })}">Build my ${esc(t.label)} hunt</a>
${Object.values(SPACES).map((s) => `<a class="btn ghost" href="${builder({ theme: t.id, space: s.id })}">${esc(s.label)} trail</a>`).join('')}
</p>

<h2>Questions</h2>
${faqHtml(questions)}

<h2>More hunt ideas</h2>
<ul class="links">${all.filter((o) => o.id !== t.id).map((o) => `<li><a href="../${themeSlug(o)}/">${esc(o.label)} hunt</a></li>`).join('')}
${Object.values(SPACES).map((s) => `<li><a href="../${spaceSlug(s)}/">${esc(s.title)}</a></li>`).join('')}</ul>`;
  return page({
    file: path.join(OUT, themeSlug(t), 'index.html'),
    title: `${t.label} Scavenger Hunt for Kids: Free Rhyming Clues and Printable`,
    description: `A ${t.label.toLowerCase()} scavenger hunt for ages ${t.ages}: a read-aloud story, 5 free rhyming clues with answers, age tips and a printable personalized with your child’s name.`,
    body,
    jsonLd: faq(questions),
  });
}

function spacePage(s, themes) {
  const questions = [
    [`How long does a ${s.label.toLowerCase()} scavenger hunt take?`, 'With eight clues, about 15 to 25 minutes for kids ages 3 to 8, plus a few minutes beforehand to hide the cards.'],
    ['Where should the prize go?', `At the last spot on the trail. On this trail that’s the ${SPOTS[s.spots[s.spots.length - 1]].label.toLowerCase()}.`],
  ];
  const body = `
<h1>${esc(s.title)}: 8 rhyming clues for kids</h1>
<p class="lede">${esc(s.lede)}</p>
<a class="btn" href="${builder({ space: s.id })}">Make this trail with my child’s name</a>

<h2>The trail, clue by clue</h2>
<p>Hide each card at the answer to the clue before it. The first clue goes in the kids’ hands, and the prize waits at the last answer.</p>
<ol class="clues">${s.spots.map((id, k) => clueCard(id, k + 1)).join('')}</ol>

<h2>Tips for a ${esc(s.label.toLowerCase())} hunt</h2>
<ul class="tips">${s.tips.map((tip) => `<li>${esc(tip)}</li>`).join('')}</ul>

<h2>Pick a theme</h2>
<p>Every theme comes with a story, matching clue cards with pictures for little ones, your child’s name on every page and a certificate at the end, plus a picture hunt and a look-around hunt to play again another day. Tap one to start with this trail already filled in.</p>
<ul class="links">${themes.map((t) => `<li><a href="${builder({ theme: t.id, space: s.id })}">${esc(t.label)}</a></li>`).join('')}</ul>

<h2>Questions</h2>
${faqHtml(questions)}

<h2>More ideas</h2>
<ul class="links">${Object.values(SPACES).filter((o) => o.id !== s.id).map((o) => `<li><a href="../${spaceSlug(o)}/">${esc(o.title)}</a></li>`).join('')}
${themes.map((t) => `<li><a href="../${themeSlug(t)}/">${esc(t.label)} hunt</a></li>`).join('')}</ul>`;
  return page({
    file: path.join(OUT, spaceSlug(s), 'index.html'),
    title: `${s.title} for Kids: 8 Free Rhyming Clues`,
    description: `A ready-to-use ${s.label.toLowerCase()} scavenger hunt for ages 3 to 8: eight rhyming clues with answers, where to hide each one, and tips.`,
    body,
    jsonLd: faq(questions),
  });
}


// One page per pretend play kit: how to set it up, games to play, who's who, and the little-kids version.
function kitPage(k, kits) {
  const fill = (str) => str.replace(/\{child\}/g, 'your child').replace(/\{place\}/g, `the ${k.name.toLowerCase()}`);
  const g = k.guide;
  const q = k.hunt ? { theme: k.hunt } : { kit: k.id };
  const name = k.name.toLowerCase();
  const questions = [
    [`What age is ${name} pretend play for?`, 'Ages 3 to 8. The little kids version (ages 3 to 5) has big pictures, thick cut lines and order forms they fill in by circling, so no reading or writing is needed. Ages 5 and up get the writing version.'],
    ['Do I need anything special to print it?', 'Regular Letter paper works for everything. Cardstock makes the money, menus and props last longer, and sheet protectors turn the activity pages into wipe-clean pages.'],
    [`How do I set up a pretend ${name} at home?`, `${g.setup.map(fill).join(' ')}`],
  ];
  const body = `
<h1>${esc(k.name)} pretend play for kids</h1>
<p class="lede">${esc(fill(g.intro))} Here’s how to set it up, games to play and a printable kit with your child’s name on every page.</p>
<a class="btn" href="${builder(q)}">Make a personalized ${esc(k.name)} kit</a>
${STYLED[k.id] ? lifePhoto(k, 'styled', STYLED[k.id], false) : lifePhoto(k, 'stand', `The printed ${k.name} kit set up on a play stand: shop sign, open sign, price list, poster and labels`, false)}
<h2>How to set it up</h2>
<ol class="tips">${g.setup.map((x) => `<li>${esc(fill(x))}</li>`).join('')}</ol>
${howto(k)}

<h2>Games to play</h2>
<ul class="clues">${g.play.map(([t, d]) => `<li class="clue"><h3>${esc(t)}</h3><p>${esc(fill(d))}</p></li>`).join('')}</ul>
${lifePhoto(k, LIFE[k.id], `Playing ${name} at home with the printed kit`)}

<h2>Who’s who</h2>
<p>Hand out the jobs so everyone gets a turn, grown-ups and stuffed animals included:</p>
<ul class="links">${k.roles.map((r) => `<li><span>${esc(r[0])}</span></li>`).join('')}</ul>

<h2>For toddlers and preschoolers</h2>
<p>Little ones love pretend play before they can read. Give them the job with the most doing, like ${esc(k.roles[0][0].toLowerCase())}, keep the money to a few big coins and let them circle pictures on the order forms. Five to ten minutes of play is a win at this age.</p>

<h2>Want it printed and personalized?</h2>
<p>The printable ${esc(k.name)} kit has your child’s name on the signs, badges and certificate, plus play money, order forms, props and a grown-up guide full of ideas. Pick the little kids version (ages 3 to 5) or the big kids version (6 to 8), and add the activity pack of wipe-and-play pages if you like. It arrives by email in minutes.</p>
${lifePhoto(k, 'flat', `Everything in the ${k.name} kit printed out: poster, price list, shop sign, cards, play money and badges`)}
<div class="pages">${[`${k.hunt || k.id}-kit`, `${k.hunt || k.id}-little-kit`, `${k.hunt || k.id}-activity`, `${k.hunt || k.id}-little-activity`].filter((f) => fs.existsSync(path.join(DOCS, 'img', 'pages', `${f}.webp`))).map((f) => `<img src="../../img/pages/${f}.webp" alt="${esc(k.name)} printable page" width="400" height="518" loading="lazy">`).join('')}</div>
<p><a class="btn" href="${builder(q)}">Build my ${esc(k.name)} kit</a></p>

<h2>Questions</h2>
${faqHtml(questions)}

<h2>More pretend play ideas</h2>
<ul class="links">${kits.filter((o) => o.id !== k.id).map((o) => `<li><a href="../${kitSlug(o)}/">${esc(o.name)}</a></li>`).join('')}</ul>`;
  return page({
    file: path.join(OUT, kitSlug(k), 'index.html'),
    title: `${k.name} Pretend Play for Kids: Setup Ideas, Games and Printable`,
    description: `How to set up a pretend ${name} at home for ages 3 to 8: setup steps, games to play, roles, tips for toddlers and a printable kit personalized with your child’s name.`,
    body,
    jsonLd: faq(questions),
  });
}

function hub(themes, kits) {
  const body = `
<h1>Scavenger hunt, party and pretend play ideas for kids</h1>
<p class="lede">Free rhyming clues, read-aloud stories, hiding tips and pretend play setups for kids ages 3 to 8, sorted by theme, by the kind of home you have and by play kit.</p>
<h2>By home</h2>
<ul class="links">${Object.values(SPACES).map((s) => `<li><a href="../ideas/${spaceSlug(s)}/">${esc(s.title)}</a></li>`).join('')}</ul>
<h2>By theme</h2>
<ul class="links">${themes.map((t) => `<li><a href="../ideas/${themeSlug(t)}/">${esc(t.label)} scavenger hunt</a></li>`).join('')}</ul>
<h2>Pretend play</h2>
<ul class="links">${kits.map((k) => `<li><a href="../ideas/${kitSlug(k)}/">${esc(k.name)}</a></li>`).join('')}</ul>
<p><a class="btn" href="../make/">Make a personalized hunt</a></p>`;
  // The hub sits one level up from the other pages, so its links are written from docs/ideas/.
  return page({
    file: path.join(OUT, 'index.html'),
    title: 'Scavenger Hunt and Party Ideas for Kids',
    description: 'Free rhyming scavenger hunt clues, stories and tips for kids ages 3 to 8, by theme and by home: apartment, house or backyard.',
    body,
  });
}

function build() {
  fs.rmSync(OUT, { recursive: true, force: true });
  const themes = Object.values(THEMES);
  const kits = Object.values(KITS);
  const urls = [SITE, `${SITE}make/`, `${SITE}play-kits/`, `${SITE}handprint-art/`, hub(themes, kits), ...Object.values(SPACES).map((s) => spacePage(s, themes)), ...themes.map((t, i) => themePage(t, i, themes)), ...kits.map((k) => kitPage(k, kits))];
  // The hub lives one folder higher than the other pages, so its links back to the shop go up one level.
  const hubFile = path.join(OUT, 'index.html');
  fs.writeFileSync(hubFile, fs.readFileSync(hubFile, 'utf8').replaceAll('href="../../"', 'href="../"').replace('<a href="../">More party and hunt ideas</a> · ', ''));
  fs.writeFileSync(path.join(DOCS, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`);
  return urls;
}

if (require.main === module) console.log(`Wrote ${build().length - 1} idea pages and the sitemap.`);
module.exports = { build, themeSlug, spaceSlug, kitSlug };
