// Builds the homepage banner scenes in docs/img/hero/<theme>.webp: each set's real pages laid out
// like a photo on a table that matches the theme (wood for dinos, sand for pirates, a starry desk
// for space...), with the kit's own pictures scattered around as props.
// Needs docs/img/gallery (scripts/gallery-images.js) and docs/img/host (scripts/site-images.js).
// Each scene also gets a twin in docs/img/n/hero/ made from the pages' nameless twins, so the website
// can write a parent's typed name over it (see src/generator/name-slots.js); run gallery-images.js first.
// Usage: node scripts/hero-scenes.js [theme ...]
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const THEMES = require('../src/generator/themes');
const { kitForHunt, KITS } = require('../src/kits/engine');
const art = require('../src/kits/art');
const { sheetLayers, blankLayers, saveIndex } = require('../src/generator/name-slots');

const IMG = path.join(__dirname, '..', 'docs', 'img');
const W = 1600;
const H = 700;

// Table: base color, grain (wood, sand, stars or felt) and the marker's color.
const TABLES = {
  dino: ['#b98552', 'wood', '#5a8a3a'], hero: ['#9c7048', 'wood', '#d8372e'], pirate: ['#e2c48f', 'sand', '#2f4a8a'],
  space: ['#1d2547', 'stars', '#f2b134'], royal: ['#6d4a8c', 'felt', '#e8b923'], unicorn: ['#f2c9dc', 'wood', '#9b6ad6'],
  mermaid: ['#bfe3df', 'sand', '#e0698c'], construction: ['#d3a96b', 'wood', '#f2a71b'], vet: ['#b98552', 'wood', '#2f9e8f'],
  easter: ['#cfe6b0', 'felt', '#e36fa5'], halloween: ['#4a3426', 'wood', '#f07f1d'], christmas: ['#8a5a3a', 'wood', '#c8323a'],
  valentine: ['#f4c4c9', 'felt', '#d8324f'], fire: ['#a46a40', 'wood', '#d8372e'], ice: ['#dcecf7', 'felt', '#3d7fc1'],
  racecar: ['#3b3f46', 'felt', '#e23b2e'],
  // shop play kits (no hunt or party, so their scene is all kit and activity pages)
  pizza: ['#b07a4a', 'wood', '#d8372e'], burger: ['#c9a06a', 'wood', '#e0892b'], grocery: ['#cfe1b8', 'felt', '#3f9a4a'],
  post: ['#a9c4e0', 'felt', '#2f5fa8'], library: ['#8a5a3a', 'wood', '#7a4fb0'], police: ['#2f3f63', 'felt', '#3d7fc1'],
  petshop: ['#f1d6a8', 'wood', '#e0698c'], dentist: ['#d6eef2', 'felt', '#2f9e8f'], coffee: ['#7a5236', 'wood', '#c88a4a'],
  italian: ['#c8a37a', 'wood', '#2f8a4a'], auto: ['#4a4f58', 'felt', '#f2a71b'],
  kitchen: ['#c9a06a', 'wood', '#e0573b'], doctor: ['#d9e8f7', 'felt', '#3a7bd5'], puppet: ['#7e1f3d', 'felt', '#f2b632'],
  agent: ['#2f3a44', 'felt', '#e8a33d'], dressup: ['#e6d5f6', 'felt', '#8c4fc4'], icecream: ['#fbd5df', 'felt', '#46b7c9'],
  airport: ['#cfe6f6', 'felt', '#1f78b4'],
};

function table([base, grain]) {
  const freq = { wood: '0.0035 0.09', sand: '0.6', stars: '0.9', felt: '0.25' }[grain];
  const alpha = { wood: '-1.4 1.25', sand: '-1.2 1.1', stars: '-1 1', felt: '-1.3 1.15' }[grain];
  const tone = grain === 'stars' ? '.9 .9 1' : grain === 'wood' ? '.45 .28 .12' : '.35 .3 .25';
  const [r, g, b] = tone.split(' ');
  const stars = grain === 'stars'
    ? Array.from({ length: 140 }, (_, i) => `<circle cx="${(i * 733) % W}" cy="${(i * 397) % H}" r="${(i % 5) / 3 + 0.4}" fill="#fff" opacity="${0.25 + (i % 7) / 10}"/>`).join('')
    : '';
  const planks = grain === 'wood' ? [1, 2].map((i) => `<rect x="0" y="${i * 233}" width="${W}" height="3" fill="rgba(40,20,8,.35)"/>`).join('') : '';
  return `<svg class="wood" width="${W}" height="${H}"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="4" seed="7"/>
    <feColorMatrix values="0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  0 0 0 ${alpha}"/></filter>
    <rect width="${W}" height="${H}" fill="${base}"/><rect width="${W}" height="${H}" filter="url(#g)" opacity="${grain === 'wood' ? 0.55 : 0.35}"/>${planks}${stars}</svg>`;
}

// Things scattered on top for each theme (vendored Noto pictures, or the kit's own art).
const DECOR = {
  dino: '🦴🌿🥚🦕🌋', hero: '⭐🛡️⚡🦸⭐', pirate: '🐚⚓🪙🦀🐚', space: '⭐🪐🌙🚀☄️', royal: '👑💎🌹🏰🪄',
  unicorn: '🌈✨⭐🦄🧁', mermaid: '🐚🐠🐬⭐🐚', construction: '🔩🧱🚧🔨🦺', vet: '🐾🦴🩹🐶🐱',
  easter: '🥚🌷🐣🐰🥚', halloween: '🎃🍂🍬🕸️🦇', christmas: '🎄❄️🍪🎁⭐', valentine: '❤️💌🌹💖🍫',
  fire: '🚒🧯⛑️🔥🚨', ice: '❄️⛄🧊💎✨', racecar: '🏁🏎️🏆🔧⭐',
  pizza: '🍕🧀🍅🫑🍄', burger: '🍔🍟🥤🧀🍅', grocery: '🍎🛒🥕🍌🥛', post: '✉️📦📮🏷️💌',
  library: '📚🔖✏️📖⭐', police: '🚓⭐🚨🔦🚔', petshop: '🐾🐶🐱🦴🐟', dentist: '🪥🦷✨🪞⭐',
  coffee: '☕🥐🍪🧁🍩', italian: '🍝🥖🍅🧀🍕', auto: '🔧🚗🛞🔩🚙',
  kitchen: '🍳🥄🥕🧁🍅', doctor: '🩺🩹💊🌡️🧸', puppet: '🎟️🍿🧦⭐🎭', agent: '🔍🕶️🗝️📁🍪',
  dressup: '👑🎩🎀✨👢', icecream: '🍦🍒🍨🧁🍓', airport: '✈️🧳🛂🎫☁️',
};
const SHOPS = Object.values(KITS).filter((k) => !k.hunt).map((k) => k.id);
const pics = (s) => [...new Intl.Segmenter().segment(s)].map((x) => x.segment);

const url = (f) => 'file://' + path.join(IMG, f);
const sheet = (f, x, y, w, r, extra = '') => `<div class="p" data-key="img/${f}" style="left:${x}px;top:${y}px;width:${w}px;transform:rotate(${r}deg)"><div class="inner"><img src="${url(f)}">${extra}</div></div>`;
// One clue card, cut out along its dashed line (two cards to a page).
const card = (f, second, x, y, w, r) => `<div class="p card" data-occ style="left:${x}px;top:${y}px;width:${w}px;height:${Math.round(w * 0.6)}px;transform:rotate(${r}deg)"><img src="${url(f)}" style="width:${Math.round(w * 1.12)}px;margin-left:${-Math.round(w * 0.06)}px;margin-top:${-Math.round(w * (second ? 0.8 : 0.075))}px"></div>`;

function scene(id) {
  const shop = SHOPS.includes(id);
  const kit = shop ? KITS[id] : kitForHunt(id);
  art.setKit(kit);
  const [, , ink] = TABLES[id];
  const props = [...kit.menu.items.map(([e]) => e), ...kit.defaultKinds.map((k) => kit.kinds[k][0])];
  const spots = [[1490, 600, 120, 14], [700, 615, 110, -10], [1015, 40, 95, 18], [40, 610, 105, -16], [640, 25, 90, 10], [1560, 330, 95, -12], [880, 330, 80, 8]];
  const scatter = spots.map(([x, y, s, r], i) => `<div class="prop" data-occ style="left:${x - s / 2}px;top:${y - s / 2}px;width:${s}px;transform:rotate(${r}deg)">${art.pic(props[i % props.length], `${s}px`)}</div>`).join('');
  // along the edges and in the gaps, on top of the paper like things set down on it
  const edge = [[30, 380, 92, -14], [655, 40, 84, 12], [660, 640, 96, -8], [1100, 660, 88, 16], [1560, 70, 90, 10], [1110, 250, 70, -12], [255, 30, 70, 20], [1560, 650, 84, -10], [1020, 520, 66, 6]];
  const d = pics(DECOR[id]);
  const decor = edge.map(([x, y, s, r], i) => `<div class="prop" data-occ style="left:${x - s / 2}px;top:${y - s / 2}px;width:${s}px;transform:rotate(${r}deg)">${art.pic(d[i % d.length], `${s}px`)}</div>`).join('');
  const circles = `<svg style="position:absolute;inset:0" viewBox="0 0 640 828"><g fill="none" stroke="${ink}" stroke-width="7" stroke-linecap="round" opacity=".85"><ellipse cx="420" cy="300" rx="50" ry="45" transform="rotate(-12 420 300)"/><ellipse cx="200" cy="520" rx="48" ry="44"/></g></svg><div class="gloss"></div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;width:${W}px;height:${H}px;overflow:hidden;position:relative}
.wood{position:absolute;inset:0}
.p{position:absolute;background:#fff;box-shadow:0 22px 34px -10px rgba(30,16,6,.55),0 3px 6px rgba(30,16,6,.3)}
.p img{display:block;width:100%}
.p::after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,rgba(255,255,255,.10),rgba(0,0,0,.05) 60%,rgba(0,0,0,.09));pointer-events:none}
.card{overflow:hidden;border-radius:2px}
.inner{position:relative}
.gloss{position:absolute;inset:-6px;border-radius:6px;background:linear-gradient(120deg,rgba(255,255,255,0) 30%,rgba(255,255,255,.38) 42%,rgba(255,255,255,0) 52%),linear-gradient(0deg,rgba(255,255,255,.08),rgba(255,255,255,.08));border:1px solid rgba(255,255,255,.5)}
.phone{position:absolute;width:200px;padding:9px;border-radius:32px;background:#1c1f2b;box-shadow:0 30px 40px -12px rgba(20,10,4,.6),inset 0 0 0 2px #3a3f52}
.phone img{display:block;width:100%;border-radius:24px}
.marker{position:absolute;width:260px;height:30px;border-radius:15px 6px 6px 15px;background:${ink};box-shadow:0 14px 18px -6px rgba(20,10,4,.55),inset 0 -6px 8px rgba(0,0,0,.18),inset 0 5px 6px rgba(255,255,255,.25)}
.marker::before{content:"";position:absolute;right:-42px;top:3px;width:48px;height:24px;border-radius:4px 12px 12px 4px;background:linear-gradient(#f4f4f4,#cfcfcf)}
.marker::after{content:"";position:absolute;left:-6px;top:8px;width:14px;height:14px;border-radius:7px 3px 3px 7px;background:#2a2a2a}
.prop{position:absolute;filter:drop-shadow(0 10px 8px rgba(20,10,4,.4))}
.prop > *{width:100% !important;height:auto !important;display:block}
.light{position:absolute;inset:0;background:radial-gradient(ellipse at 30% 20%,rgba(255,240,215,.2),rgba(0,0,0,0) 55%),radial-gradient(ellipse at center,rgba(0,0,0,0) 55%,rgba(20,10,4,.35))}
</style></head><body>${table(TABLES[id])}
${scatter}
${shop ? `${sheet(`gallery/${id}/kit-2.webp`, 30, 40, 340, -8)}
${sheet(`gallery/${id}/kit-3.webp`, 300, 80, 340, 5)}
${sheet(`gallery/${id}/kit-4.webp`, 120, 400, 330, -4)}
${sheet(`gallery/${id}/kit-1.webp`, 700, 70, 320, -4)}
${sheet(`gallery/${id}/activity-3.webp`, 900, 300, 290, 9)}
${sheet(`gallery/${id}/activity-2.webp`, 1150, 40, 330, 4, circles)}
${sheet(`gallery/${id}/kit-5.webp`, 1270, 390, 260, -10)}
` : `${sheet(`gallery/${id}/hunt-1.webp`, 30, 40, 340, -8)}
${sheet(`gallery/${id}/hunt-2.webp`, 300, 80, 340, 5)}
${card(`gallery/${id}/hunt-3.webp`, false, 110, 470, 330, -12)}
${card(`gallery/${id}/hunt-3.webp`, true, 390, 500, 330, 8)}
${sheet(`gallery/${id}/kit-1.webp`, 700, 70, 320, -4)}
${sheet(`gallery/${id}/party-1.webp`, 900, 300, 290, 9)}
${sheet(`gallery/${id}/activity-2.webp`, 1150, 40, 330, 4, circles)}
<div class="phone" data-key="img/host/${id}-play.webp" style="left:1290px;top:400px;transform:rotate(-10deg)"><img src="${url(`host/${id}-play.webp`)}"></div>
`}<div class="marker" data-occ style="left:820px;top:620px;transform:rotate(-18deg)"></div>
${decor}
<div class="light"></div></body></html>`;
}

(async () => {
  const only = process.argv.slice(2);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hero-'));
  fs.mkdirSync(path.join(IMG, 'hero'), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const index = {};
  const twins = [];
  const ids = [...Object.keys(THEMES), ...SHOPS].filter((k) => !only.length || only.includes(k));
  for (const id of ids) {
    const file = path.join(tmp, `${id}.html`);
    fs.writeFileSync(file, scene(id));
    await page.goto('file://' + file);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(tmp, `${id}.png`) });
    // The twin: the same scene from the nameless pages, and where each page landed.
    const shard = path.join(IMG, 'n', `${id}.json`);
    const slots = fs.existsSync(shard) ? JSON.parse(fs.readFileSync(shard, 'utf8')) : {};
    const layers = await page.evaluate(sheetLayers);
    if (blankLayers(index, path.join(IMG, 'hero', `${id}.webp`), W, H, layers, (k) => slots[k] || null)) {
      await page.evaluate((keys) => document.querySelectorAll('[data-key]').forEach((el) => {
        if (keys.includes(el.dataset.key)) el.querySelector('img').src = el.querySelector('img').src.replace('/img/', '/img/n/');
      }), Object.keys(slots));
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(tmp, `blank-${id}.png`) });
      twins.push(id);
    }
    console.log('Rendered', id);
  }
  await browser.close();
  saveIndex(index);
  execFileSync('python3', ['-c', `
import sys, os
from PIL import Image
tmp, out = sys.argv[1], sys.argv[2]
for t in sys.argv[3:]:
    im = Image.open(os.path.join(tmp, t + '.png')).convert('RGB')
    im.save(os.path.join(out, t + '.webp'), 'WEBP', quality=76)
    im.resize((800, 350), Image.LANCZOS).save(os.path.join(out, t + '-sm.webp'), 'WEBP', quality=76)
`, tmp, path.join(IMG, 'hero'), ...ids]);
  if (twins.length) execFileSync('python3', ['-c', `
import sys, os
from PIL import Image
tmp, out = sys.argv[1], sys.argv[2]
for t in sys.argv[3:]:
    im = Image.open(os.path.join(tmp, 'blank-' + t + '.png')).convert('RGB')
    im.save(os.path.join(out, t + '.webp'), 'WEBP', quality=76)
    im.resize((800, 350), Image.LANCZOS).save(os.path.join(out, t + '-sm.webp'), 'WEBP', quality=76)
`, tmp, path.join(IMG, 'n', 'hero'), ...twins]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('Wrote docs/img/hero for', only.length ? only.join(', ') : 'every theme and shop kit');
})();
