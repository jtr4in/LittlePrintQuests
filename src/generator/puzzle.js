// The collect-the-pieces finale: one printed page with a themed picture cut into one jigsaw
// piece per clue card. Piece k is tucked behind clue card k, so the kids collect a piece at every
// stop, and at the last clue they put the picture together to see where the prize is hidden.
//
// The picture uses the theme's play kit illustrations (src/kits/art/<theme>/<slug>.webp), or another
// kit's with 'other-kit/slug'.

const fs = require('fs');
const path = require('path');

const ART_DIR = path.join(__dirname, '..', 'kits', 'art');

// Per theme: the picture's title, the line above the prize spot, and its illustrations
// (the first one is the big one at the top).
const PUZZLES = {
  dino: { title: 'Lost Fossil Map', reveal: 'Mama Dino’s treasure is hidden at the', art: ['t-rex', 'dino-egg', 'volcano-show', 'long-neck', 'fern-forest'] },
  hero: { title: 'Top Secret Hero File', reveal: 'Your hero reward is hidden at the', art: ['superhero', 'shield', 'mask', 'robo-hero', 'captain-kitty'] },
  pirate: { title: 'Captain Barnaby’s Treasure Map', reveal: 'X marks the spot! The treasure is at the', art: ['treasure-island', 'a-ship', 'parrot', 'gold-coin', 'spyglass'] },
  space: { title: 'Launch Pad Blueprint', reveal: 'Ground Control says the rewards are at the', art: ['liftoff', 'astronaut', 'saturn', 'friendly-alien', 'the-moon'] },
  royal: { title: 'Royal Garden Map', reveal: 'The Royal Crown Prize is waiting at the', art: ['castle-tour', 'pet-dragon', 'crown', 'princess', 'prince'] },
  unicorn: { title: 'Rainbow Trail Map', reveal: 'The last rainbow gem is glowing at the', art: ['unicorn', 'rainbow-gem', 'cloud-meadow', 'rainbow-butterfly', 'star-falls'] },
  mermaid: { title: 'Queen Coralie’s Sea Chart', reveal: 'The Queen’s treasure is hidden at the', art: ['mermaid', 'dolphin', 'octopus', 'starfish', 'tropical-fish'] },
  construction: { title: 'Big Build Blueprint', reveal: 'The crew’s well-earned treat is at the', art: ['digger', 'crane', 'builder', 'barrier', 'stack-bricks'] },
  vet: { title: 'Pet Rescue Map', reveal: 'The very last pet is waiting at the', art: ['dog', 'check-up', 'bandage', 'paws', 'vet-clinic-logo'] },
  easter: { title: 'Golden Egg Map', reveal: 'The most golden egg is hidden at the', art: ['bunny', 'golden-egg', 'chick', 'full-basket', 'painted-egg'] },
  halloween: { title: 'Wispy’s Treat Map', reveal: 'The sweetest treat is hiding at the', art: ['friendly-ghost', 'pumpkin', 'bat', 'candy-drop', 'lollipop'] },
  christmas: { title: 'Santa’s Sleigh Route', reveal: 'The most magical bell is waiting at the', art: ['santa', 'reindeer', 'presents', 'tree-star', 'cookie'] },
  valentine: { title: 'Pip’s Love Note Map', reveal: 'The biggest note of all is waiting at the', art: ['hearts', 'teddy-bear', 'balloon', 'candy-heart', 'rose'] },
  fire: { title: 'Rescue Route Map', reveal: 'The rescue reward is waiting at the', art: ['fire-truck', '1f9d1-200d-1f692', 'extinguisher', 'boots', 'rescue-star'] },
  ice: { title: 'Ice Palace Map', reveal: 'The Queen’s Winter Star is shining at the', art: ['ice-palace', 'snowman', 'penguin', 'ice-gem', 'tiara'] },
  racecar: { title: 'Grand Prix Track Map', reveal: 'The Golden Trophy is waiting at the', art: ['race-car', 'starting-line', 'tires', 'turbo-turtle', 'fuel-tank'] },
  pizza: { title: 'Chef Sal’s Secret Recipe', reveal: 'The hot, cheesy treat is waiting at the', art: ['delivery', 'extra-cheese', 'peppers', 'mushrooms', 'garlic-bread'] },
  burger: { title: 'Cook Patty’s Secret Sauce', reveal: 'The burger-iest fun is waiting at the', art: ['burger', 'fries', 'cheese', 'tomato', 'pickles'] },
  grocery: { title: 'Big Party Shopping List', reveal: 'The last thing on the list is at the', art: ['cart-champ', 'veggies', 'cheese', 'grapes', 'croissants'] },
  post: { title: 'Special Delivery Route', reveal: 'The letter with the golden seal is at the', art: ['parcel', 'letter', 'postcard', 'air-mail', '1f682'] },
  library: { title: 'The Lost Last Page', reveal: 'The very last page is waiting at the', art: ['owl', 'story-book', 'fairy-tale', 'bookmark', 'chapter-book'] },
  police: { title: 'Case File: Where’s Buttons?', reveal: 'Buttons the teddy is hiding at the', art: ['oh-no-teddy-is-lost', 'police-station', '1f415', 'car-keys', 'bike-licence'] },
  dentist: { title: 'Sparkle Smile Map', reveal: 'The sparkliest toothbrush is at the', art: ['tooth-mirror', 'gloves', 'x-ray', 'flossed', 'next-visit'] },
  petshop: { title: 'Adoption Day Map', reveal: 'The very last pet is waiting at the', art: ['hamster', 'bird', 'yarn-ball', 'playtime', 'walk'] },
  coffee: { title: 'Barista Bea’s Cocoa Recipe', reveal: 'The Big Cocoa Pot is waiting at the', art: ['pot-of-tea', 'waffle', 'bagel', 'honey', 'lemonade'] },
  italian: { title: 'Nonna’s Secret Recipe', reveal: 'The biggest meatball is waiting at the', art: ['meatballs', '1f468-200d-1f373', 'boil-the-water', '1f34b', 'table-5'] },
  auto: { title: 'Mechanic Max’s Repair Plan', reveal: 'The Golden Wrench is waiting at the', art: ['1f9f0', 'keys', 'battery', 'wipers', 'brakes'] },
  kitchen: { title: 'Chef Rosa’s Secret Recipe', reveal: 'Chef Rosa’s surprise is waiting at the', art: ['chefs-kitchen-logo', 'pancakes', 'tacos', 'avocado', 'garlic'] },
  doctor: { title: 'Dr. Penny’s Patient Chart', reveal: 'The Get Well Prize is waiting at the', art: ['doctor-bag', 'vet/bandage', 'vet/pills', 'vet/temperature', 'wheelchair-ride'] },
  puppet: { title: 'Madame Velvet’s Show Poster', reveal: 'The Golden Ticket is waiting at the', art: ['puppet-stage', 'puppets', 'fox', 'grocery/1f37f', 'royal/crown'] },
  agent: { title: 'Agent Zero’s Top Secret File', reveal: 'The Golden Cookie Crown is hidden at the', art: ['hq', 'crack-a-code', 'fingerprints-match', 'spy-shades', 'wear-a-disguise'] },
  dressup: { title: 'Madame Bobbin’s Style Sketch', reveal: 'The Star of the Show prize is waiting at the', art: ['costume-wardrobe', 'a-hat', 'dresses', 'masks', 'goggles'] },
  icecream: { title: 'Scoop Sally’s Sundae Recipe', reveal: 'The Golden Scoop is waiting at the', art: ['sundae', 'a-cherry', 'snow-cone', 'ice-pop', 'blueberries'] },
  airport: { title: 'Captain Skye’s Flight Map', reveal: 'Your first class prize is waiting at the', art: ['airport-scene', 'passport', 'suitcase', 'carry-on', 'headphones'] },
};

// How many pieces sit in each row, top to bottom, for 3 to 12 pieces (roughly square pieces).
const ROWS = { 3: [1, 2], 4: [2, 2], 5: [2, 3], 6: [2, 2, 2], 7: [2, 3, 2], 8: [3, 2, 3], 9: [3, 3, 3], 10: [3, 4, 3], 11: [4, 3, 4], 12: [3, 3, 3, 3] };

// Picture size in inches; the SVG cut lines use 100 units per inch.
const W = 7.5;
const H = 9.35;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function artUrl(themeId, slug) {
  const f = path.join(ART_DIR, slug.includes('/') ? slug : `${themeId}/${slug}`) + '.webp';
  return fs.existsSync(f) ? `file://${f}` : null;
}

// Deterministic coin flips, so the same order always gets the same cut.
function flips(seedStr) {
  let h = 2166136261;
  for (const c of seedStr) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) % 2 ? 1 : -1;
  };
}

// One cut from (x0,y0) to (x1,y1) with a round jigsaw knob in the middle, bulging to `side`.
function edge(x0, y0, x1, y1, side, k) {
  const len = Math.hypot(x1 - x0, y1 - y0);
  const ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
  const m = len / 2;
  const n = (v) => v.toFixed(1);
  // Neck where the knob's circle (radius .5k, centred .8k out) is .35k out.
  const dx = 0.218 * k;
  const d = `M0,0 H${n(m - 0.36 * k)} C${n(m - 0.3 * k)},${n(-0.12 * k)} ${n(m - dx - 0.04 * k)},${n(-0.24 * k)} ${n(m - dx)},${n(-0.35 * k)}`
    + ` A${n(0.5 * k)},${n(0.5 * k)} 0 1 1 ${n(m + dx)},${n(-0.35 * k)}`
    + ` C${n(m + dx + 0.04 * k)},${n(-0.24 * k)} ${n(m + 0.3 * k)},${n(-0.12 * k)} ${n(m + 0.36 * k)},0 H${n(len)}`;
  return `<path transform="translate(${n(x0)} ${n(y0)}) rotate(${n(ang)}) scale(1 ${side})" d="${d}"/>`;
}

// The cut lines and piece numbers for `count` pieces over a W x H picture.
function cuts(count, seed) {
  const rows = ROWS[count];
  const flip = flips(seed);
  const w = W * 100;
  const h = H * 100;
  const rh = h / rows.length;
  const xs = rows.map((cols) => Array.from({ length: cols + 1 }, (_, i) => (i * w) / cols));
  const paths = [];
  const knob = (span, cross) => Math.min(span, cross) * 0.2;
  rows.forEach((cols, r) => {
    for (let i = 1; i < cols; i++) paths.push(edge(xs[r][i], r * rh, xs[r][i], (r + 1) * rh, flip(), knob(rh, w / cols)));
    if (r === rows.length - 1) return;
    // Between two rows, split the seam wherever either row has a cut, and give each stretch a knob.
    const stops = [...new Set([...xs[r], ...xs[r + 1]].map((x) => Math.round(x)))].sort((a, b) => a - b);
    const y = (r + 1) * rh;
    for (let i = 0; i < stops.length - 1; i++) {
      const span = stops[i + 1] - stops[i];
      if (span < 90) paths.push(`<path d="M${stops[i]},${y.toFixed(1)} H${stops[i + 1]}"/>`);
      else paths.push(edge(stops[i], y, stops[i + 1], y, flip(), knob(span, rh)));
    }
  });
  let n = 0;
  const numbers = rows.flatMap((cols, r) => Array.from({ length: cols }, (_, i) => {
    n++;
    const x = xs[r][i] + 30;
    const y = r * rh + 30;
    return `<g class="num"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="17"/><text x="${x.toFixed(1)}" y="${(y + 6.5).toFixed(1)}">${n}</text></g>`;
  }));
  return `<svg class="cuts" viewBox="0 0 ${w} ${h}">
    <g class="halo">${paths.join('')}</g><g class="line">${paths.join('')}</g>
    <rect class="halo" x="1" y="1" width="${w - 2}" height="${h - 2}"/><rect class="line" x="1" y="1" width="${w - 2}" height="${h - 2}"/>
    ${numbers.join('')}
  </svg>`;
}

// The puzzle page. `picHtml` draws the prize spot's picture the same way the clue cards do.
function puzzlePage(plan, cfg, picHtml) {
  const { theme, cards, prize } = plan;
  const p = PUZZLES[theme.id];
  if (!p) throw new Error(`No puzzle picture for theme "${theme.id}"`);
  const art = p.art.map((s) => artUrl(theme.id, s));
  const img = (i, cls) => (art[i] ? `<img class="art ${cls}" src="${art[i]}">` : `<div class="art ${cls} icon">${theme.icon}</div>`);
  const label = prize.label;
  const size = Math.min(46, 520 / (0.6 * Math.max(label.length, 6)));
  const seed = `${theme.id}|${cfg.childName || ''}|${cards.length}`;
  return `<section class="page puzzle">
    <div class="puzzle-head">
      <div><b>Puzzle pieces</b> · Cut along the solid lines. Tuck <b>piece 1 behind Card 1</b>, piece 2 behind Card 2, and so on.</div>
      <div class="puzzle-sub">At the last clue, the kids put all ${cards.length} pieces together to see where the prize is. Cardstock makes sturdier pieces.</div>
    </div>
    <div class="picture">
      <div class="pz-title"><span>${esc(p.title)}</span></div>
      ${img(0, 'main')}${img(1, 'tl')}${img(2, 'tr')}${img(3, 'bl')}${img(4, 'br')}
      <div class="reveal-line">${esc(p.reveal)}</div>
      <div class="spot-ring"><div class="spot-pic">${picHtml(prize)}</div></div>
      <div class="spot-label" style="font-size:${size.toFixed(1)}pt">${esc(label)}</div>
      <div class="pz-foot">${theme.icon}${theme.icon}${theme.icon}</div>
      ${cuts(cards.length, seed)}
    </div>
  </section>`;
}

const puzzleCss = (theme) => `
.puzzle { padding:.45in .5in; }
.puzzle-head { height:.62in; font-size:10.5pt; line-height:1.35; color:#555; }
.puzzle-head b { color:var(--primary); }
.puzzle-sub { font-size:9pt; color:#888; }
.picture { position:relative; width:${W}in; height:${H}in; overflow:hidden; border-radius:2px;
  background: radial-gradient(ellipse at 50% 55%, #fff 0%, var(--paper) 55%, var(--soft) 140%); }
.picture > * { position:absolute; }
.pz-title { left:0; right:0; top:.55in; text-align:center; }
.pz-title span { display:inline-block; max-width:6.6in; background:var(--primary); color:#fff; padding:.1in .35in; border-radius:.12in;
  font-family:'${theme.fonts.display}', 'Fredoka', sans-serif; font-size:24pt; line-height:1.1; box-shadow:0 .05in 0 var(--accent); }
.art { object-fit:contain; }
.art.icon { color:var(--accent); opacity:.5; }
.art.main { width:2.5in; height:2.5in; left:2.5in; top:1.3in; }
.art.tl, .art.tr { width:1.75in; height:1.75in; top:1.7in; }
.art.tl { left:.3in; } .art.tr { right:.3in; }
.art.bl, .art.br { width:1.6in; height:1.6in; top:5.15in; }
.art.bl { left:.2in; } .art.br { right:.2in; }
.reveal-line { left:.6in; right:.6in; top:4.02in; text-align:center; font-size:19pt; font-weight:600; line-height:1.2; color:var(--ink); }
.spot-ring { left:2.45in; top:4.75in; width:2.6in; height:2.6in; border-radius:50%; background:#fff; border:.07in dashed var(--accent);
  box-shadow:0 0 0 .1in var(--soft); display:grid; place-items:center; }
.spot-pic .emoji { font-family:'Noto Color Emoji', sans-serif; font-size:100pt; line-height:1; }
.spot-pic .picto { width:1.5in; height:1.5in; color:var(--primary); display:block; }
.spot-pic .picto svg { width:100%; height:100%; display:block; }
.spot-label { left:.3in; right:.3in; top:7.55in; text-align:center; font-weight:700; text-transform:uppercase; color:var(--primary);
  line-height:1.05; letter-spacing:.02em; text-shadow:2px 2px 0 var(--soft); }
.pz-foot { left:0; right:0; bottom:.3in; display:flex; justify-content:center; gap:.35in; color:var(--accent); opacity:.55; }
.pz-foot svg { width:.4in; height:.4in; }
.cuts { left:0; top:0; width:${W}in; height:${H}in; }
.cuts path, .cuts rect { fill:none; stroke-linejoin:round; }
.cuts .halo, .cuts .halo path { stroke:#fff; stroke-width:6; }
.cuts .line, .cuts .line path { stroke:#4a4a4a; stroke-width:2.2; }
.cuts .num circle { fill:#fff; stroke:var(--primary); stroke-width:2.5; }
.cuts .num text { font-family:'Fredoka', sans-serif; font-weight:700; font-size:19px; fill:var(--primary); text-anchor:middle; }
`;

module.exports = { puzzlePage, puzzleCss, PUZZLES, ROWS };
