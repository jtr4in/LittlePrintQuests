// Wipe & Play: activity pages for every kit, made to slip into a sheet protector (or laminate)
// and use again and again with a dry-erase marker. Everything comes from the kit's own menu,
// so a pizza kit traces "Pasta" and a dino kit counts fossils.
//   clean-up  a big picture to mess up with the marker and wipe clean
//   trace     dotted words to trace
//   match     draw a line from each picture to its word
//   count     how many? write the number
//   i spy     find and count each thing in a busy page
//   maze      help the helper reach the customer
//   design    invent something new for the menu, with a name and a price
const art = require('./art');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// What each kit gets to clean: [picture, what it is, what makes it dirty].
const CLEAN = {
  vet: ['🐶', 'muddy puppy', 'mud'], space: ['🚀', 'rocket', 'space dust'], dino: ['🦴', 'fossil', 'dirt'],
  hero: ['🛡️', 'hero shield', 'smudges'], pirate: ['⚓', 'ship’s anchor', 'seaweed'], royal: ['👑', 'royal crown', 'smudges'],
  unicorn: ['🦄', 'unicorn', 'mud'], mermaid: ['🐚', 'seashell', 'sand'], construction: ['🚜', 'digger', 'mud'],
  easter: ['🥚', 'egg', 'paint drips'], halloween: ['🧪', 'potion bottle', 'goo'], christmas: ['🛷', 'sleigh', 'snow and soot'],
  valentine: ['📬', 'mailbox', 'smudges'], fire: ['🚒', 'fire engine', 'soot'], ice: ['⛸️', 'ice skate', 'slush'],
  racecar: ['🏎️', 'race car', 'mud'], pizza: ['🍽️', 'plate', 'sauce and crumbs'], burger: ['🍳', 'grill pan', 'grease'],
  grocery: ['🍎', 'apple', 'dirt'], post: ['📦', 'parcel', 'muddy footprints'], library: ['📖', 'book', 'crayon scribbles'],
  police: ['🚓', 'police car', 'mud'], petshop: ['🐶', 'puppy', 'mud'], coffee: ['☕', 'coffee mug', 'coffee stains'],
  italian: ['🍽️', 'plate', 'sauce and crumbs'], auto: ['🚗', 'car', 'mud and oil'],
};

// The same "random" every time for the same seed, so a kit always prints the same.
function rng(seed) {
  let s = seed % 2147483647 || 1;
  return () => (s = (s * 48271) % 2147483647) / 2147483647;
}
const seedOf = (str) => [...str].reduce((a, c) => (a * 31 + c.codePointAt(0)) % 2147483647, 7);
function shuffle(list, rand) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

const head = (title, sub) => `<div class="wp-badge">Wipe &amp; Play</div><h2 class="pg-title">${esc(title)}</h2><p class="pg-sub">${esc(sub)}</p>`;
const page = (cls, body) => `<section class="page wp ${cls}">${body}</section>`;
const items = (k) => k.def.menu.items.map(([e, n]) => [e, n]);

function cleanPage(k) {
  const [icon, what, mess] = CLEAN[k.def.id] || [k.def.icon, k.def.name, 'smudges'];
  return page('wp-clean', `${head(`Clean the ${what}!`, `Grown-ups: draw ${mess} all over it with a dry-erase marker. ${k.childName}: grab a tissue and wipe it sparkly clean!`)}
    <div class="wp-clean-pic">${art.pic(icon, '5.6in')}</div>
    <div class="wp-steps"><span>1 · Make a mess</span><span>2 · Wipe it clean</span><span>3 · Do it again!</span></div>`);
}

function tracePage(k) {
  const words = items(k).filter(([, n]) => n.length <= 13).sort((a, b) => a[1].length - b[1].length).slice(0, 5);
  const row = ([e, n]) => {
    const size = Math.min(84, Math.floor(540 / (0.6 * n.length)));
    return `<div class="wp-trace"><div class="wp-trace-pic">${art.pic(e, '.95in')}</div>
      <svg viewBox="0 0 560 110" class="wp-trace-svg"><line x1="0" y1="92" x2="560" y2="92" class="base"/><line x1="0" y1="${92 - Math.round(size * 0.5)}" x2="560" y2="${92 - Math.round(size * 0.5)}" class="mid"/>
      <text x="8" y="92" font-size="${size}">${esc(n)}</text></svg></div>`;
  };
  return page('wp-trace-page', `${head('Trace the Words', 'Follow the dots with your marker, then wipe and try again.')}<div class="wp-trace-list">${words.map(row).join('')}</div>`);
}

function matchPage(k) {
  const list = items(k).slice(0, 6);
  const right = shuffle(list, rng(seedOf(k.def.id + 'match')));
  return page('wp-match', `${head('Match It Up', 'Draw a line from each picture to its name.')}
    <div class="wp-match-grid">
      <div>${list.map(([e]) => `<div class="wp-m-pic">${art.pic(e, '1.05in')}<i></i></div>`).join('')}</div>
      <div>${right.map(([, n]) => `<div class="wp-m-word"><i></i>${esc(n)}</div>`).join('')}</div>
    </div>`);
}

function countPage(k) {
  const rand = rng(seedOf(k.def.id + 'count'));
  const list = shuffle(items(k), rand).slice(0, 6);
  const nums = shuffle([1, 2, 3, 4, 5, 6, 7], rand).slice(0, 6);
  return page('wp-count', `${head('How Many?', 'Count the pictures in each row and write the number in the box.')}
    ${list.map(([e], i) => `<div class="wp-c-row"><div class="wp-c-pics">${Array.from({ length: nums[i] }, () => art.pic(e, '.68in')).join('')}</div><div class="wp-c-box"></div></div>`).join('')}`);
}

function spyPage(k) {
  const rand = rng(seedOf(k.def.id + 'spy'));
  const kinds = shuffle(items(k), rand).slice(0, 4);
  const counts = [3, 4, 5, 6];
  const spots = [];
  // place pictures on a loose grid, nudged a little so it looks scattered
  const cols = 6; const rows = 5; const cells = shuffle(Array.from({ length: cols * rows }, (_, i) => i), rand);
  let c = 0;
  kinds.forEach(([e], i) => { for (let n = 0; n < counts[i]; n++) spots.push([e, cells[c++]]); });
  const W = 100 / cols; const H = 100 / rows;
  const pics = spots.map(([e, cell]) => {
    const x = (cell % cols) * W + rand() * W * 0.25; const y = Math.floor(cell / cols) * H + rand() * H * 0.2;
    return `<div class="wp-s-pic" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;transform:rotate(${Math.round(rand() * 40 - 20)}deg)">${art.pic(e, '.88in')}</div>`;
  }).join('');
  return page('wp-spy', `${head('I Spy', `Find every picture in ${k.placeName}. Circle them, then write how many.`)}
    <div class="wp-s-field">${pics}</div>
    <div class="wp-s-tally">${kinds.map(([e]) => `<div>${art.pic(e, '.6in')}<span class="wp-c-box sm"></span></div>`).join('')}</div>`);
}

// A perfect maze (one way through), carved with a seeded depth-first walk.
function maze(cols, rows, rand) {
  const walls = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ n: 1, e: 1, s: 1, w: 1 })));
  const seen = new Set(['0,0']); const stack = [[0, 0]];
  const dirs = [[0, -1, 'n', 's'], [1, 0, 'e', 'w'], [0, 1, 's', 'n'], [-1, 0, 'w', 'e']];
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const next = shuffle(dirs, rand).find(([dx, dy]) => { const nx = x + dx; const ny = y + dy; return nx >= 0 && ny >= 0 && nx < cols && ny < rows && !seen.has(`${nx},${ny}`); });
    if (!next) { stack.pop(); continue; }
    const [dx, dy, a, b] = next; const nx = x + dx; const ny = y + dy;
    walls[y][x][a] = 0; walls[ny][nx][b] = 0; seen.add(`${nx},${ny}`); stack.push([nx, ny]);
  }
  return walls;
}

function mazePage(k) {
  const cols = 9; const rows = 11; const S = 60;
  const w = maze(cols, rows, rng(seedOf(k.def.id + 'maze')));
  const lines = [];
  w.forEach((row, y) => row.forEach((c, x) => {
    const X = x * S; const Y = y * S;
    if (c.n && !(x === 0 && y === 0)) lines.push(`M${X},${Y}h${S}`);
    if (c.w) lines.push(`M${X},${Y}v${S}`);
    if (y === rows - 1 && !(x === cols - 1)) lines.push(`M${X},${Y + S}h${S}`);
    if (x === cols - 1) lines.push(`M${X + S},${Y}v${S}`);
  }));
  const subject = k.def.kinds[k.def.defaultKinds[0]][0];
  return page('wp-maze', `${head('Find the Way', `Draw a path from the start to the ${k.def.subjectWord} waiting at the finish. Wipe it off and try again!`)}
    <div class="wp-maze-wrap">
      <div class="wp-mz-start">${art.pic(k.def.icon, '.9in')}<b>Start</b></div>
      <svg viewBox="-4 -4 ${cols * S + 8} ${rows * S + 8}" class="wp-mz"><path d="${lines.join('')}"/></svg>
      <div class="wp-mz-end">${art.pic(subject, '.9in')}<b>Finish</b></div>
    </div>`);
}

function designPage(k) {
  const M = k.def.menu;
  return page('wp-design', `${head(`Invent Something New`, `Dream up a brand new treat for the ${M.title.toLowerCase()}. Draw it, name it and set the price.`)}
    <div class="wp-d-frame"><span>Draw it here</span></div>
    <div class="wp-d-lines"><div><b>It’s called</b><span></span></div><div><b>It costs</b><span></span><em>${M.coinIcon} ${esc(M.coinWord)}s</em></div><div><b>Made by</b><span>${esc(k.childName)}</span></div></div>`);
}

function activityPages(k) {
  return [cleanPage, tracePage, matchPage, countPage, spyPage, mazePage, designPage].map((f) => f(k)).join('');
}
const ACTIVITY_COUNT = 7;

const activityCss = `
.wp .wp-badge { position:absolute; top:.32in; right:.4in; font:700 10pt 'Fredoka'; letter-spacing:.08em; text-transform:uppercase; background:var(--orange); color:var(--accent-ink); padding:.05in .14in; border-radius:99px; }
.wp-clean-pic { margin:.3in auto 0; width:7.2in; height:7.5in; display:grid; place-items:center; border:4px dashed var(--mint); border-radius:30px; background:var(--mint-l); }
.wp-steps { display:flex; justify-content:center; gap:.3in; margin-top:.3in; font:600 15pt 'Fredoka'; color:var(--teal-d); }
.wp-trace-list { display:flex; flex-direction:column; gap:.22in; margin-top:.3in; }
.wp-trace { display:flex; align-items:center; gap:.2in; border:2px solid var(--line); border-radius:16px; padding:.12in .2in; }
.wp-trace-svg { flex:1; height:1.25in; }
.wp-trace-svg .base { stroke:var(--teal); stroke-width:2.5; } .wp-trace-svg .mid { stroke:var(--mint); stroke-width:1.5; stroke-dasharray:8 8; }
.wp-trace-svg text { font-family:'Fredoka'; font-weight:600; fill:none; stroke:#7d86a3; stroke-width:2.6; stroke-dasharray:4 5; stroke-linecap:round; }
.wp-match-grid { display:flex; justify-content:space-between; margin-top:.35in; padding:0 .3in; }
.wp-match-grid > div { display:flex; flex-direction:column; gap:.22in; }
.wp-m-pic, .wp-m-word { height:1.2in; display:flex; align-items:center; gap:.18in; }
.wp-m-word { font:700 22pt 'Fredoka'; color:var(--navy); }
.wp-match-grid i { width:.24in; height:.24in; border-radius:50%; background:var(--teal); flex:none; }
.wp-c-row { display:flex; align-items:center; gap:.25in; border-bottom:2px dashed var(--line); padding:.2in 0; }
.wp-c-pics { flex:1; display:flex; gap:.05in; }
.wp-c-box { width:1.1in; height:1.1in; border:3px solid var(--teal); border-radius:16px; flex:none; display:inline-block; }
.wp-c-box.sm { width:.75in; height:.75in; border-radius:12px; }
.wp-s-field { position:relative; height:7.4in; margin-top:.2in; border:3px solid var(--mint); border-radius:24px; background:var(--mint-l); }
.wp-s-pic { position:absolute; width:16.6%; display:grid; place-items:center; padding-top:.15in; }
.wp-s-tally { display:flex; justify-content:space-around; margin-top:.25in; }
.wp-s-tally > div { display:flex; align-items:center; gap:.12in; }
.wp-maze-wrap { position:relative; margin:.25in auto 0; width:6.3in; }
.wp-mz { width:100%; display:block; }
.wp-mz path { fill:none; stroke:var(--teal-d); stroke-width:7; stroke-linecap:round; }
.wp-mz-start, .wp-mz-end { position:absolute; display:flex; flex-direction:column; align-items:center; font:700 11pt 'Fredoka'; color:var(--teal-d); }
.wp-mz-start { left:-1.05in; top:-.1in; } .wp-mz-end { right:-1.05in; bottom:-.1in; }
.wp-d-frame { margin-top:.3in; height:5.6in; border:4px dashed var(--teal); border-radius:26px; display:grid; place-items:center; font:500 16pt 'Fredoka'; color:#b4bccf; }
.wp-d-lines { margin-top:.3in; display:flex; flex-direction:column; gap:.22in; font-size:16pt; }
.wp-d-lines div { display:flex; align-items:flex-end; gap:.15in; }
.wp-d-lines b { font:600 16pt 'Fredoka'; width:1.4in; }
.wp-d-lines span { flex:1; border-bottom:2px solid var(--navy); min-height:.45in; font:600 18pt 'Fredoka'; color:var(--teal-d); }
.wp-d-lines em { font-style:normal; font:600 14pt 'Fredoka'; }
`;

module.exports = { activityPages, activityCss, ACTIVITY_COUNT, CLEAN };
