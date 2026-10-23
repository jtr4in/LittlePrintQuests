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
//   spot      spot the 5 differences between two pictures
//   odd       circle the one that's different in each row
//   words     a word search (5 and up only)
// Little kids (2 to 4) also get:
//   path      dotted paths to trace from one picture to another
//   dots      the first letter of their name in big dot-marker circles (paper)
//   shapes    match each colored shape to its twin
//   glue      cut out pictures and glue each one on its shadow (paper)
// Big kids (5 to 8) also get:
//   code      a secret message for them, written in picture code
//   roll      roll a die for each row and draw the silly creature it makes
// And both get:
//   color     color by number (color by dot for little kids), a kit picture as a grid of squares
//   me        draw yourself as the kit's boss
//   story     finish a story about their day (little kids circle pictures to choose)
// They're sold on their own as the Activity Pack (see activityPackHtml in engine.js).
const art = require('./art');
const MOSAICS = require('./mosaics.json');

const possessive = (name) => (/s$/i.test(name) ? `${name}’` : `${name}’s`);
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
  police: ['🚓', 'police car', 'mud'], petshop: ['🐶', 'puppy', 'mud'], dentist: ['🦷', 'tooth', 'sugar bugs'], coffee: ['☕', 'coffee mug', 'coffee stains'],
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

// Pages for paper (dot markers, scissors and glue) say Print & Play instead.
const head = (title, sub, badge = 'Wipe &amp; Play') => `<div class="wp-badge">${badge}</div><h2 class="pg-title">${esc(title)}</h2><p class="pg-sub">${esc(sub)}</p>`;
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
    <div class="wp-d-frame"></div><p class="wp-d-cap">Draw it here</p>
    <div class="wp-d-lines"><div><b>It’s called</b><span></span></div><div><b>It costs</b><span></span><em>${M.coinIcon} ${esc(M.coinWord)}s</em></div><div><b>Made by</b><span>${esc(k.childName)}</span></div></div>`);
}

// Two copies of the same scene; the second has 5 changes (2 missing, 3 swapped).
function spotPage(k) {
  const rand = rng(seedOf(k.def.id + 'spot'));
  const pool = shuffle(items(k), rand);
  const cols = 5; const rows = 3; const cells = shuffle(Array.from({ length: cols * rows }, (_, i) => i), rand).slice(0, 12);
  const scene = cells.map((cell, i) => ({ e: pool[i % pool.length][0], cell, r: Math.round(rand() * 30 - 15), dx: rand() * 0.3, dy: rand() * 0.25 }));
  const changed = shuffle(scene.map((_, i) => i), rand).slice(0, 5);
  const other = scene.map((p, i) => {
    const at = changed.indexOf(i);
    if (at === -1) return p;
    if (at < 2) return null;
    const swap = pool.find(([e]) => !scene.some((q) => q.e === e)) || pool.find(([e]) => e !== p.e);
    return { ...p, e: swap ? swap[0] : p.e, r: -p.r + 25 };
  });
  const field = (list) => `<div class="wp-sd-field">${list.filter(Boolean).map((p) => `<div class="wp-sd-pic" style="left:${(((p.cell % cols) + p.dx) * 100 / cols).toFixed(1)}%;top:${((Math.floor(p.cell / cols) + p.dy) * 100 / rows).toFixed(1)}%;transform:rotate(${p.r}deg)">${art.pic(p.e, '.8in')}</div>`).join('')}</div>`;
  return page('wp-spotdiff', `${head('Spot the Difference', 'The bottom picture has 5 changes. Circle each one you find!')}
    ${field(scene)}<div class="wp-sd-stars">${'<span>☆</span>'.repeat(5)}</div>${field(other)}`);
}

function oddPage(k) {
  const rand = rng(seedOf(k.def.id + 'odd'));
  const pool = shuffle(items(k), rand);
  const rows = Array.from({ length: 5 }, (_, i) => {
    const same = pool[i % pool.length][0]; const odd = pool[(i + 3) % pool.length][0];
    const at = Math.floor(rand() * 4);
    return Array.from({ length: 4 }, (_, j) => (j === at ? odd : same));
  });
  return page('wp-odd', `${head('Which One Is Different?', 'Look along each row and circle the picture that doesn’t belong.')}
    ${rows.map((r) => `<div class="wp-o-row">${r.map((e) => `<div class="wp-o-cell">${art.pic(e, '1.05in')}</div>`).join('')}</div>`).join('')}`);
}

// Words read across or down only, so it stays friendly for early readers.
function wordsPage(k) {
  const rand = rng(seedOf(k.def.id + 'words'));
  const N = 9;
  const words = [];
  for (const [e, n] of [...items(k), ...Object.values(k.def.kinds)]) {
    // the last word is the thing itself: "Ranger hat" is HAT, "Toy T-Rex" is TREX
    const w = n.split(/\s+/).at(-1).toUpperCase().replace(/[^A-Z]/g, '');
    if (w.length >= 3 && w.length <= N && !words.some((x) => x[1] === w || x[0] === e)) words.push([e, w]);
  }
  const grid = Array.from({ length: N }, () => Array(N).fill(''));
  const placed = [];
  for (const [e, w] of [...shuffle(words.slice(0, 8), rand), ...words.slice(8)]) {
    if (placed.length === 6) break;
    for (let tries = 0; tries < 60; tries++) {
      const down = rand() < 0.5; const x = Math.floor(rand() * (N - (down ? 0 : w.length - 1))); const y = Math.floor(rand() * (N - (down ? w.length - 1 : 0)));
      const at = (i) => (down ? [x, y + i] : [x + i, y]);
      if ([...w].every((c, i) => { const [cx, cy] = at(i); return !grid[cy][cx] || grid[cy][cx] === c; })) {
        [...w].forEach((c, i) => { const [cx, cy] = at(i); grid[cy][cx] = c; });
        placed.push([e, w]);
        break;
      }
    }
  }
  const ABC = 'ABCDEFGHIJKLMNOPRSTUVWY';
  const cells = grid.map((row) => row.map((c) => c || ABC[Math.floor(rand() * ABC.length)]));
  return page('wp-words', `${head('Word Search', 'Find each word. They go across or down. Circle them with your marker!')}
    <div class="wp-w-grid">${cells.flat().map((c) => `<span>${c}</span>`).join('')}</div>
    <div class="wp-w-list">${placed.map(([e, w]) => `<div>${art.pic(e, '.55in')}<b>${w}</b></div>`).join('')}</div>`);
}

// ---------- little kids (2 to 4) ----------

// Dotted paths from each helper to a treat: straight, wavy, zigzag and hilly.
const PATHS = [
  'M10,60 H490',
  'M10,60 C70,0 110,0 170,60 S270,120 330,60 S430,0 490,60',
  'M10,60 L70,15 L130,105 L190,15 L250,105 L310,15 L370,105 L430,15 L490,60',
  'M10,95 Q50,5 90,95 Q130,5 170,95 Q210,5 250,95 Q290,5 330,95 Q370,5 410,95 Q450,5 490,95',
];
function pathPage(k) {
  const rand = rng(seedOf(k.def.id + 'path'));
  const from = shuffle(Object.values(k.def.kinds), rand);
  const to = shuffle(items(k).filter(([e]) => !from.slice(0, 4).some(([f]) => f === e)), rand);
  return page('wp-path', `${head('Trace the Path', 'Follow the dots with a finger first, then with your marker, to take each one to its surprise.')}
    ${PATHS.map((d, i) => `<div class="wp-p-row"><div class="wp-p-pic">${art.pic(from[i % from.length][0], '.95in')}</div>
      <svg viewBox="0 0 500 120" class="wp-p-svg"><path d="${d}"/><circle cx="${d.match(/M(\d+),(\d+)/)[1]}" cy="${d.match(/M(\d+),(\d+)/)[2]}" r="9" class="go"/></svg>
      <div class="wp-p-pic">${art.pic(to[i % to.length][0], '.95in')}</div></div>`).join('')}`);
}

// Capital letters on a 5 x 7 grid of dots, for the dot-marker page.
const DOT_FONT = {
  A: '01110100011000111111100011000110001', B: '11110100011000111110100011000111110', C: '01110100011000010000100001000101110',
  D: '11110100011000110001100011000111110', E: '11111100001000011110100001000011111', F: '11111100001000011110100001000010000',
  G: '01110100011000010111100011000101111', H: '10001100011000111111100011000110001', I: '11111001000010000100001000010011111',
  J: '00111000100001000010000101001001100', K: '10001100101010011000101001001010001', L: '10000100001000010000100001000011111',
  M: '10001110111010110101100011000110001', N: '10001110011010110011100011000110001', O: '01110100011000110001100011000101110',
  P: '11110100011000111110100001000010000', Q: '01110100011000110001101011001001101', R: '11110100011000111110101001001010001',
  S: '01111100001000001110000010000111110', T: '11111001000010000100001000010000100', U: '10001100011000110001100011000101110',
  V: '10001100011000110001100010101000100', W: '10001100011000110101101011010101010', X: '10001100010101000100010101000110001',
  Y: '10001100010101000100001000010000100', Z: '11111000010001000100010001000011111',
};
function dotPage(k) {
  const letter = (k.childName.normalize('NFD').toUpperCase().match(/[A-Z]/) || ['A'])[0];
  const P = 92;
  const dots = [...DOT_FONT[letter]].map((c, i) => (c === '1' ? `<circle cx="${(i % 5) * P + P / 2}" cy="${Math.floor(i / 5) * P + P / 2}" r="40"/>` : '')).join('');
  const pics = shuffle(items(k), rng(seedOf(k.def.id + 'dots'))).slice(0, 5);
  return page('wp-dots', `${head(`Dot the Letter ${letter}`, `${letter} is for ${k.childName}! Dab every circle with a dot marker, a sticker or a painty fingertip.`, 'Print &amp; Play')}
    <svg class="wp-dot-letter" viewBox="0 0 ${5 * P} ${7 * P}">${dots}</svg>
    <div class="wp-dot-row">${pics.map(([e]) => `<div>${art.pic(e, '.7in')}<i></i></div>`).join('')}</div>`);
}

const SHAPES = [
  ['circle', '<circle cx="50" cy="50" r="42"/>', '#e53935'], ['square', '<rect x="10" y="10" width="80" height="80" rx="8"/>', '#1e88e5'],
  ['triangle', '<path d="M50,8 L94,88 L6,88Z"/>', '#fdd835'], ['star', '<path d="M50,5 L61,38 L96,38 L68,59 L79,93 L50,72 L21,93 L32,59 L4,38 L39,38Z"/>', '#43a047'],
  ['heart', '<path d="M50,90 C20,68 4,50 4,30 C4,14 16,6 28,6 C38,6 46,12 50,22 C54,12 62,6 72,6 C84,6 96,14 96,30 C96,50 80,68 50,90Z"/>', '#8e24aa'],
];
function shapesPage(k) {
  const right = shuffle(SHAPES, rng(seedOf(k.def.id + 'shapes')));
  const shape = ([, d, c], solid) => `<svg viewBox="0 0 100 100" class="wp-sh">${d.replace('/>', ` fill="${solid ? c : '#fff'}" stroke="${c}" stroke-width="${solid ? 0 : 7}" ${solid ? '' : 'stroke-dasharray="10 7"'}/>`)}</svg>`;
  return page('wp-shapes', `${head('Shapes and Colors', 'Draw a line from each shape to the one that matches. Say its shape and color out loud!')}
    <div class="wp-match-grid wp-sh-grid">
      <div>${SHAPES.map((s) => `<div class="wp-m-pic">${shape(s, true)}<i></i></div>`).join('')}</div>
      <div>${right.map((s) => `<div class="wp-m-word"><i></i>${shape(s, false)}</div>`).join('')}</div>
    </div>`);
}

// Six pictures to cut out and glue onto their shadows in the scene.
function gluePage(k) {
  const rand = rng(seedOf(k.def.id + 'glue'));
  const list = shuffle(items(k), rand).slice(0, 6);
  const spots = [[17, 30], [50, 24], [83, 30], [17, 74], [50, 68], [83, 74]];
  return page('wp-glue', `${head('Stick It On', 'Cut out the pictures at the bottom and glue each one on its shadow. Grown-ups can do the cutting!', 'Print &amp; Play')}
    <div class="wp-g-scene"><div class="wp-g-sign">${esc(k.placeName)}</div>
      ${list.map(([e], i) => `<div class="wp-g-spot" style="left:${spots[i][0]}%;top:${spots[i][1]}%">${art.pic(e, '.8in', 'wp-shadow')}</div>`).join('')}</div>
    <div class="wp-g-cut">✂</div>
    <div class="wp-g-stickers">${shuffle(list, rand).map(([e]) => `<div>${art.pic(e, '.8in')}</div>`).join('')}</div>`);
}

// ---------- big kids (5 to 8) ----------

// The secret message for each kit, in capital letters.
const SECRETS = {
  vet: 'YOU ARE A SUPER VET', space: 'YOU ARE READY TO BLAST OFF', dino: 'YOU FOUND A FOSSIL', hero: 'YOU SAVED THE DAY',
  pirate: 'YOU FOUND THE GOLD', royal: 'YOU RULE THE CASTLE', unicorn: 'YOU ARE MAGIC', mermaid: 'YOU FOUND THE PEARL',
  construction: 'YOU BUILT IT BIG', easter: 'YOU FOUND THE EGGS', halloween: 'YOU MADE MAGIC', christmas: 'YOU ARE ON THE NICE LIST',
  valentine: 'YOU ARE A GOOD FRIEND', fire: 'YOU ARE A FIRE HERO', ice: 'YOU RULE THE SNOW', racecar: 'YOU WON THE RACE',
  pizza: 'YOU MAKE THE BEST PIZZA', burger: 'YOU COOK THE BEST', grocery: 'YOU RUN THE STORE', post: 'YOU HAVE MAIL',
  library: 'YOU LOVE BOOKS', police: 'YOU KEEP US SAFE', petshop: 'YOU ARE A PET HERO', dentist: 'YOU HAVE SHINY TEETH',
  coffee: 'YOU MAKE THE BEST COCOA', italian: 'YOU COOK THE BEST PASTA', auto: 'YOU FIXED THE CAR',
};
function codePage(k) {
  const msg = SECRETS[k.def.id] || 'YOU ARE A STAR';
  const letters = [...new Set(msg.replace(/[^A-Z]/g, ''))].sort();
  const pool = [];
  // Menu and sign pictures first: the kinds can look alike (three cars, four puppies).
  for (const [e] of [...items(k), ...k.def.signs.map((s) => [s[2]]), ...Object.values(k.def.kinds)]) if (e && !pool.includes(e)) pool.push(e);
  const pics = shuffle(pool.slice(0, letters.length), rng(seedOf(k.def.id + 'code')));
  // Not enough pictures? Then it's a number code: A = 1, B = 2...
  const sym = (c) => (pics.length >= letters.length ? art.pic(pics[letters.indexOf(c)], '.68in') : `<b class="wp-k-num">${c.charCodeAt(0) - 64}</b>`);
  return page('wp-code', `${head('Secret Code', `A secret message for ${k.childName}! Find each picture in the code key and write its letter in the box below it.`)}
    <div class="wp-k-key">${letters.map((c) => `<div>${sym(c)}<span>${c}</span></div>`).join('')}</div>
    <div class="wp-k-msg">${msg.split(' ').map((w) => `<div class="wp-k-word">${[...w].map((c) => `<div>${sym(c)}<i></i></div>`).join('')}</div>`).join('')}</div>
    <div class="wp-d-lines wp-k-lines"><div><b>The message</b><span></span></div><div><b></b><span></span></div></div>
    <p class="wp-k-answer">Grown-ups, the answer: ${esc(msg.toLowerCase())}</p>`);
}

// Roll a die for each row and draw what you rolled. Little line drawings, 40 x 40.
const ROLL = [
  ['Body', [['Round', '<circle cx="20" cy="21" r="15"/>'], ['Tall', '<ellipse cx="20" cy="21" rx="10" ry="17"/>'], ['Square', '<rect x="6" y="7" width="28" height="28" rx="4"/>'],
    ['Triangle', '<path d="M20 4 L37 36 H3Z"/>'], ['Blobby', '<path d="M8 30 C1 22 7 8 17 10 C24 2 38 7 34 18 C40 28 31 38 20 33 C14 38 7 36 8 30Z"/>'], ['Long', '<rect x="2" y="13" width="36" height="16" rx="8"/>']]],
  ['Eyes', [['One eye', '<circle cx="20" cy="20" r="9"/><circle cx="20" cy="20" r="3.5" class="f"/>'], ['Two eyes', '<circle cx="12" cy="20" r="6"/><circle cx="28" cy="20" r="6"/><circle cx="12" cy="20" r="2.5" class="f"/><circle cx="28" cy="20" r="2.5" class="f"/>'],
    ['Three eyes', '<circle cx="8" cy="22" r="5"/><circle cx="20" cy="14" r="5"/><circle cx="32" cy="22" r="5"/><circle cx="8" cy="22" r="2" class="f"/><circle cx="20" cy="14" r="2" class="f"/><circle cx="32" cy="22" r="2" class="f"/>'],
    ['Sleepy', '<path d="M5 18 q7 7 13 0 M22 18 q7 7 13 0"/>'], ['Googly', '<circle cx="11" cy="20" r="9"/><circle cx="29" cy="20" r="9"/><circle cx="14" cy="24" r="3.5" class="f"/><circle cx="26" cy="15" r="3.5" class="f"/>'],
    ['On stalks', '<path d="M14 36 L10 14 M26 36 L30 14"/><circle cx="10" cy="10" r="5"/><circle cx="30" cy="10" r="5"/><circle cx="10" cy="10" r="2" class="f"/><circle cx="30" cy="10" r="2" class="f"/>']]],
  ['Mouth', [['Smile', '<path d="M7 15 Q20 34 33 15"/>'], ['Fangs', '<path d="M7 15 Q20 34 33 15 M12 20 l2 7 l3 -5 M23 22 l3 5 l2 -7"/>'], ['Big O', '<circle cx="20" cy="21" r="10"/>'],
    ['Tongue out', '<path d="M7 15 Q20 30 33 15 M15 22 q0 12 7 10 q5 -2 3 -10"/>'], ['Zigzag', '<path d="M4 20 l5 -6 l5 6 l5 -6 l5 6 l5 -6 l5 6 l5 -6"/>'], ['Beak', '<path d="M8 12 L35 20 L8 29 Z M8 20 H25"/>']]],
  ['Legs', [['Two legs', '<path d="M14 6 V32 h-5 M26 6 V32 h5"/>'], ['Four legs', '<path d="M7 6 V32 M16 6 V32 M24 6 V32 M33 6 V32"/>'], ['Six legs', '<path d="M5 8 l-3 24 M12 8 l-1 24 M19 8 v24 M21 8 v24 M28 8 l1 24 M35 8 l3 24"/>'],
    ['Wiggly arms', '<path d="M6 6 q8 6 0 12 q-8 6 0 12 M20 6 q8 6 0 12 q-8 6 0 12 M34 6 q8 6 0 12 q-8 6 0 12"/>'], ['Wheels', '<circle cx="11" cy="24" r="9"/><circle cx="29" cy="24" r="9"/><circle cx="11" cy="24" r="2" class="f"/><circle cx="29" cy="24" r="2" class="f"/>'],
    ['Springs', '<path d="M12 4 l-5 4 l10 4 l-10 4 l10 4 l-10 4 l10 4 l-5 4 M28 4 l-5 4 l10 4 l-10 4 l10 4 l-10 4 l10 4 l-5 4"/>']]],
  ['Extra', [['Horns', '<path d="M8 34 Q4 14 12 4 Q14 20 18 34 M32 34 Q36 14 28 4 Q26 20 22 34"/>'], ['Wings', '<path d="M20 20 Q8 0 2 12 Q6 26 20 20 Q32 0 38 12 Q34 26 20 20"/>'],
    ['Antennae', '<path d="M14 36 Q10 18 4 10 M26 36 Q30 18 36 10"/><circle cx="4" cy="8" r="3.5" class="f"/><circle cx="36" cy="8" r="3.5" class="f"/>'], ['Spikes', '<path d="M2 34 L8 14 L14 34 L20 8 L26 34 L32 14 L38 34"/>'],
    ['Crown', '<path d="M5 32 V12 L13 22 L20 8 L27 22 L35 12 V32 Z"/>'], ['Curly tail', '<path d="M4 30 Q20 30 26 20 Q32 8 22 8 Q14 10 20 18 Q24 22 28 16"/>']]],
  ['Pattern', [['Spots', '<circle cx="10" cy="10" r="4" class="f"/><circle cx="28" cy="12" r="5" class="f"/><circle cx="14" cy="28" r="5" class="f"/><circle cx="31" cy="30" r="3.5" class="f"/>'],
    ['Stripes', '<path d="M6 4 L14 36 M16 4 L24 36 M26 4 L34 36"/>'], ['Stars', '<path d="M12 4 l2 6 h6 l-5 4 l2 6 l-5 -4 l-5 4 l2 -6 l-5 -4 h6Z M29 18 l2 6 h6 l-5 4 l2 6 l-5 -4 l-5 4 l2 -6 l-5 -4 h6Z"/>'],
    ['Hearts', '<path d="M12 18 C4 12 6 4 12 8 C18 4 20 12 12 18Z M28 34 C20 28 22 20 28 24 C34 20 36 28 28 34Z"/>'], ['Zigzags', '<path d="M3 10 l6 6 l6 -6 l6 6 l6 -6 l6 6 l6 -6 M3 26 l6 6 l6 -6 l6 6 l6 -6 l6 6 l6 -6"/>'],
    ['Bubbles', '<circle cx="11" cy="12" r="7"/><circle cx="28" cy="10" r="5"/><circle cx="25" cy="28" r="8"/><circle cx="8" cy="31" r="3.5"/>']]],
];
const die = (n) => {
  const at = { 1: [[20, 20]], 2: [[10, 10], [30, 30]], 3: [[10, 10], [20, 20], [30, 30]], 4: [[10, 10], [30, 10], [10, 30], [30, 30]], 5: [[10, 10], [30, 10], [20, 20], [10, 30], [30, 30]], 6: [[10, 9], [30, 9], [10, 20], [30, 20], [10, 31], [30, 31]] }[n];
  return `<svg viewBox="0 0 40 40" class="wp-r-die"><rect x="1.5" y="1.5" width="37" height="37" rx="8"/>${at.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4"/>`).join('')}</svg>`;
};
function rollPage(k) {
  return page('wp-roll', `${head('Roll a Silly Creature', `Roll a die for each row and draw what you rolled. It’s a brand new ${k.def.subjectWord} for ${k.placeName}!`)}
    <table class="wp-r-table"><tr><th></th>${[1, 2, 3, 4, 5, 6].map((n) => `<th>${die(n)}</th>`).join('')}</tr>
      ${ROLL.map(([part, opts]) => `<tr><th>${part}</th>${opts.map(([label, d]) => `<td><svg viewBox="0 0 40 40" class="wp-r-pic">${d}</svg><span>${label}</span></td>`).join('')}</tr>`).join('')}</table>
    <div class="wp-r-draw"><span class="wp-r-pet">${art.pic(k.def.icon, '.6in')}</span></div>
    <div class="wp-d-lines wp-r-lines"><div><b>Its name is</b><span></span></div><div><b>Drawn by</b><span>${esc(k.childName)}</span></div></div>`);
}

// ---------- both ages ----------

// The picture each kit colors in by number (scripts/color-mosaics.js turns it into src/kits/mosaics.json).
const MOSAIC_PICS = {
  vet: '🐰', space: '🚀', dino: '🌋', hero: '🎭', pirate: '🦜', royal: '🍰', unicorn: '🌈', mermaid: '🏝️', construction: '🚜',
  easter: '🐣', halloween: '🎃', christmas: '🎅', valentine: '🧁', fire: '🚒', ice: '⛄', racecar: '🏁', pizza: '🍕', burger: '🍔',
  grocery: '🍎', post: '📮', library: '🦉', police: '🚓', petshop: '🐶', dentist: '😁', coffee: '🧋', italian: '🍝', auto: '🚕',
};
const CRAYONS = {
  r: ['Red', '#e53935'], o: ['Orange', '#fb8c00'], y: ['Yellow', '#fdd835'], g: ['Green', '#43a047'], b: ['Blue', '#1e88e5'], v: ['Purple', '#8e24aa'],
  p: ['Pink', '#f48fb1'], n: ['Brown', '#8d6e63'], a: ['Gray', '#9e9e9e'], k: ['Black', '#424242'], w: ['White', '#ffffff'],
};
// Color by number for big kids, color by dot for little kids, who can't read the numbers yet.
function colorPage(k) {
  const m = MOSAICS[k.def.id];
  if (!m) throw new Error(`No color-by-number picture for ${k.def.id}: run node scripts/color-mosaics.js ${k.def.id}`);
  const rows = m[k.little ? 'little' : 'big']; const cols = rows[0].length; const C = 40;
  const cell = Math.min(6.9 / cols, 6.6 / rows.length); // inches, so it fits the page either way up
  const tally = {};
  for (const c of rows.join('')) if (c !== '.') tally[c] = (tally[c] || 0) + 1;
  // White comes last: it's the one you leave alone.
  const used = Object.keys(tally).sort((a, b) => (a === 'w') - (b === 'w') || tally[b] - tally[a]);
  const cells = rows.flatMap((row, y) => [...row].map((c, x) => {
    if (c === '.') return '';
    const X = x * C; const Y = y * C;
    return `<rect x="${X}" y="${Y}" width="${C}" height="${C}"/>${k.little
      ? `<circle cx="${X + C / 2}" cy="${Y + C / 2}" r="9" fill="${CRAYONS[c][1]}" class="${c === 'w' ? 'w' : ''}"/>`
      : `<text x="${X + C / 2}" y="${Y + C / 2}">${used.indexOf(c) + 1}</text>`}`;
  })).join('');
  const swatch = (c) => `<i style="background:${CRAYONS[c][1]}" class="${k.little ? 'dot' : ''}"></i>`;
  return page('wp-color', `${head(k.little ? 'Color by Dot' : 'Color by Number', k.little
    ? `Color each square the same color as its dot. What’s hiding at ${k.placeName}?`
    : `Color each square to match its number. What’s hiding at ${k.placeName}?`)}
    <svg viewBox="-3 -3 ${cols * C + 6} ${rows.length * C + 6}" class="wp-cb-grid" style="width:${(cell * cols).toFixed(2)}in;height:${(cell * rows.length).toFixed(2)}in">${cells}</svg>
    <div class="wp-cb-key">${used.map((c, i) => `<div>${k.little ? '' : `<b>${i + 1}</b>`}${swatch(c)}${CRAYONS[c][0]}${c === 'w' ? ' (leave it)' : ''}</div>`).join('')}</div>`);
}

// Draw yourself as the kit's boss, in a frame of the kit's pictures.
function mePage(k) {
  const pics = shuffle(items(k), rng(seedOf(k.def.id + 'me')));
  const corners = [['left:-.2in;top:-.2in', -12], ['right:-.2in;top:-.2in', 12], ['left:-.2in;bottom:-.2in', 10], ['right:-.2in;bottom:-.2in', -10]];
  const choose = Object.values(k.def.kinds).slice(0, 3);
  return page('wp-me', `${head('Draw Yourself', `Draw ${k.childName} at work as the ${k.def.leadRole}!`)}
    <div class="wp-me-frame">${corners.map(([at, r], i) => `<div class="wp-me-pic" style="${at};transform:rotate(${r}deg)">${art.pic(pics[i][0], '.75in')}</div>`).join('')}</div>
    <div class="wp-me-plate">${esc(k.lead)}<small>${esc(k.def.leadRole)}</small></div>
    ${k.little
    ? `<div class="wp-me-pick"><b>Circle your helper:</b>${choose.map(([e]) => `<span>${art.pic(e, '.6in')}</span>`).join('')}</div>`
    : '<div class="wp-d-lines wp-me-lines"><div><b>My job today</b><span></span></div><div><b>My best tool</b><span></span></div></div>'}`);
}

// A story about their day: big kids write in the blanks, little kids circle pictures.
function storyPage(k) {
  const title = `${possessive(k.childName)} Adventure`;
  const blank = (cls = '') => `<span class="wp-st-blank ${cls}"></span>`;
  if (k.little) {
    const rand = rng(seedOf(k.def.id + 'story'));
    const circle = (list) => `<div class="wp-st-pick">${list.map((e) => `<span>${art.pic(e, '.62in')}</span>`).join('')}</div>`;
    return page('wp-story little', `${head(title, 'Grown-ups read it out loud. Kids circle a picture to choose what happens next!')}
      <div class="wp-st-line"><p>${esc(k.childName)} went to ${esc(k.placeName)}.</p><span>${art.pic(k.def.icon, '.62in')}</span></div>
      <div class="wp-st-line"><p>There, ${esc(k.childName)} met a…</p>${circle(shuffle(Object.values(k.def.kinds), rand).slice(0, 3).map(([e]) => e))}</div>
      <div class="wp-st-line"><p>They shared a…</p>${circle(shuffle(items(k), rand).slice(0, 3).map(([e]) => e))}</div>
      <div class="wp-st-line"><p>And everyone felt…</p>${circle(['😀', '😮', '😴'])}</div>
      <div class="wp-st-draw"><span>Draw the end of the story</span></div>`);
  }
  return page('wp-story', `${head(title, 'Finish the story with your own words, then draw the best part.')}
    <div class="wp-st-text">
      <p>One morning, <b>${esc(k.lead)}</b> opened the doors of <b>${esc(k.placeName)}</b>.</p>
      <p>The first ${esc(k.def.subjectWord)} to arrive was called ${blank()}.</p>
      <p>They wanted ${blank()} and ${blank()}.</p>
      <p>Then, all of a sudden, ${blank('long')}</p><p>${blank('full')}</p>
      <p>${esc(k.childName)} saved the day by ${blank('long')}</p><p>${blank('full')}</p>
      <p>At the end of the day, everyone felt ${blank()}. The End!</p>
    </div>
    <div class="wp-st-draw"><span>Draw the best part</span></div>`);
}

// Every page in order: [title for the cover checklist, page, which version gets it (both when left out)].
const PAGES = [
  ['Clean-up time', cleanPage], ['Trace the words', tracePage], ['Trace the path', pathPage, 'little'], ['Dot the letter', dotPage, 'little'],
  ['Match it up', matchPage], ['Shapes and colors', shapesPage, 'little'], ['How many?', countPage], ['I spy', spyPage],
  ['Spot the difference', spotPage], ['Which one is different?', oddPage], ['Stick it on', gluePage, 'little'], ['Find the way', mazePage],
  ['Word search', wordsPage, 'big'], ['Secret code', codePage, 'big'], ['Color by dot', colorPage, 'little'], ['Color by number', colorPage, 'big'],
  ['Roll a silly creature', rollPage, 'big'], ['Draw yourself', mePage], ['My adventure story', storyPage], ['Invent something new', designPage],
];
const pagesFor = (k) => PAGES.filter(([, , who]) => !who || who === (k.little ? 'little' : 'big'));
const activityTitles = (k) => pagesFor(k).map(([t]) => t);
function activityPages(k) {
  return pagesFor(k).map(([, f]) => f(k)).join('');
}
const activityCount = (k) => pagesFor(k).length;

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
.wp-sd-field { position:relative; height:3.75in; border:3px solid var(--mint); border-radius:22px; background:var(--mint-l); margin-top:.12in; }
.wp-sd-pic { position:absolute; width:20%; display:grid; place-items:center; padding-top:.12in; }
.wp-sd-stars { text-align:center; font:600 26pt 'Fredoka'; color:var(--teal); letter-spacing:.12in; margin:.06in 0 -.04in; }
.wp-o-row { display:flex; justify-content:space-around; align-items:center; border-bottom:2px dashed var(--line); padding:.16in 0; }
.wp-o-cell { width:1.45in; height:1.4in; display:grid; place-items:center; }
.wp-w-grid { display:grid; grid-template-columns:repeat(9, .68in); justify-content:center; gap:.04in; margin-top:.2in; }
.wp-w-grid span { height:.68in; display:grid; place-items:center; font:600 26pt 'Fredoka'; color:var(--navy); border:1.5px solid var(--line); border-radius:8px; }
.wp-w-list { display:grid; grid-template-columns:repeat(3, 1fr); gap:.14in .3in; margin:.35in .2in 0; }
.wp-w-list div { display:flex; align-items:center; gap:.12in; font:700 17pt 'Fredoka'; letter-spacing:.06em; }
.wp-d-cap { text-align:center; font:600 13pt 'Fredoka'; color:#8a93ab; margin:.06in 0 0; }
.wp-d-frame { margin-top:.3in; height:5.3in; border:4px dashed var(--teal); border-radius:26px; display:grid; place-items:center; font:500 16pt 'Fredoka'; color:#b4bccf; }
.wp-d-lines { margin-top:.3in; display:flex; flex-direction:column; gap:.22in; font-size:16pt; }
.wp-d-lines div { display:flex; align-items:flex-end; gap:.15in; }
.wp-d-lines b { font:600 16pt 'Fredoka'; width:1.4in; }
.wp-d-lines span { flex:1; border-bottom:2px solid var(--navy); min-height:.45in; font:600 18pt 'Fredoka'; color:var(--teal-d); }
.wp-d-lines em { font-style:normal; font:600 14pt 'Fredoka'; }
.wp-p-row { display:flex; align-items:center; gap:.1in; border-bottom:2px dashed var(--line); padding:.2in 0; }
.wp-p-pic { flex:none; }
.wp-p-svg { flex:1; min-width:0; height:auto; overflow:visible; }
.wp-p-svg path { fill:none; stroke:#8a93ab; stroke-width:9; stroke-linecap:round; stroke-dasharray:.1 18; }
.wp-p-svg .go { fill:var(--teal); }
.wp-dot-letter { display:block; height:6.5in; margin:.25in auto 0; }
.wp-dot-letter circle { fill:#fff; stroke:var(--teal); stroke-width:6; }
.wp-dot-row { display:flex; justify-content:space-around; margin-top:.35in; }
.wp-dot-row div { display:flex; flex-direction:column; align-items:center; gap:.1in; }
.wp-dot-row i { width:.75in; height:.75in; border-radius:50%; border:4px solid var(--teal); }
.wp-sh-grid .wp-m-pic, .wp-sh-grid .wp-m-word { height:1.4in; }
.wp-sh { width:1.25in; height:1.25in; }
.wp-g-scene { position:relative; height:5.7in; margin-top:.15in; border:3px solid var(--teal); border-radius:24px; overflow:hidden; background:linear-gradient(var(--mint-l) 0 55%, var(--mint) 55%); }
.wp-g-sign { position:absolute; left:50%; top:.15in; transform:translateX(-50%); background:var(--teal); color:#fff; font:700 15pt 'Fredoka'; padding:.06in .25in; border-radius:99px; white-space:nowrap; }
.wp-g-spot { position:absolute; width:1.55in; height:1.55in; transform:translate(-50%, -50%); border:3px dashed var(--teal-d); border-radius:50%; background:#fff; display:grid; place-items:center; }
.wp-shadow { filter:brightness(0) opacity(.2); }
.wp-g-cut { margin:.15in 0 -.05in; font-size:18pt; color:#8a93ab; border-top:3px dashed #b7c0cc; line-height:0; padding-top:0; }
.wp-g-stickers { display:grid; grid-template-columns:repeat(3, 1fr); margin-top:.2in; border:3px dashed #b7c0cc; }
.wp-g-stickers div { height:1.25in; display:grid; place-items:center; border:3px dashed #b7c0cc; }
.wp-k-key { display:grid; grid-template-columns:repeat(7, 1fr); gap:.08in; margin:.1in 0 .25in; padding:.12in; border:3px solid var(--mint); border-radius:18px; background:var(--mint-l); }
.wp-k-key div { display:flex; flex-direction:column; align-items:center; font:700 18pt 'Fredoka'; color:var(--teal-d); }
.wp-k-num { font:700 18pt 'Fredoka'; color:var(--navy); height:.5in; display:grid; place-items:center; }
.wp-k-msg { display:flex; flex-wrap:wrap; justify-content:center; gap:.35in .45in; margin-top:.15in; }
.wp-k-word { display:flex; gap:.06in; }
.wp-k-word > div { display:flex; flex-direction:column; align-items:center; gap:.05in; }
.wp-k-word i { width:.7in; height:.76in; border:2.5px solid var(--teal); border-radius:8px; }
.wp-k-lines { position:absolute; left:.45in; right:.45in; bottom:.85in; }
.wp-k-answer { position:absolute; left:0; right:0; bottom:.3in; text-align:center; font-size:8.5pt; color:#9aa3b8; transform:rotate(180deg); margin:0; }
.wp-r-table { width:100%; border-collapse:separate; border-spacing:.04in; margin-top:.05in; }
.wp-r-table th { font:700 11pt 'Fredoka'; color:var(--teal-d); text-align:left; width:.8in; }
.wp-r-table td { border:2px solid var(--line); border-radius:10px; text-align:center; padding:.03in 0 .02in; }
.wp-r-table td span { display:block; font:600 8.5pt 'Fredoka'; }
.wp-r-pic { width:.5in; height:.5in; fill:none; stroke:var(--navy); stroke-width:2.6; stroke-linecap:round; stroke-linejoin:round; }
.wp-r-pic .f { fill:var(--navy); stroke:none; }
.wp-r-die { width:.42in; height:.42in; display:block; margin:0 auto; }
.wp-r-die rect { fill:#fff; stroke:var(--teal-d); stroke-width:3; } .wp-r-die circle { fill:var(--teal-d); }
.wp-r-draw { position:relative; height:2.55in; margin-top:.12in; border:4px dashed var(--teal); border-radius:24px; }
.wp-r-pet { position:absolute; right:.12in; bottom:.08in; opacity:.9; }
.wp-r-lines { margin-top:.15in; gap:.12in; }
.wp-cb-grid { display:block; margin:.15in auto 0; }
.wp-cb-grid rect { fill:#fff; stroke:#8a93ab; stroke-width:1.6; }
.wp-cb-grid text { font:600 17px 'Fredoka'; fill:#5b6584; text-anchor:middle; dominant-baseline:central; }
.wp-cb-grid circle.w { stroke:#8a93ab; stroke-width:2; }
.wp-cb-key { display:flex; flex-wrap:wrap; justify-content:center; gap:.14in .3in; margin-top:.3in; font:600 14pt 'Fredoka'; }
.wp-cb-key div { display:flex; align-items:center; gap:.08in; }
.wp-cb-key b { width:.38in; height:.38in; border-radius:50%; background:var(--navy); color:#fff; display:grid; place-items:center; font-size:13pt; }
.wp-cb-key i { width:.38in; height:.38in; border-radius:8px; border:2px solid #8a93ab; } .wp-cb-key i.dot { border-radius:50%; }
.wp-me-frame { position:relative; height:6.2in; margin:.3in .35in 0; border:5px dashed var(--teal); border-radius:30px; background:var(--mint-l); }
.wp-me-pic { position:absolute; background:#fff; border:3px solid var(--teal); border-radius:50%; padding:.08in; }
.wp-me-plate { margin:.3in auto 0; width:fit-content; min-width:4in; text-align:center; background:var(--teal); color:#fff; font:700 24pt 'Fredoka'; border-radius:18px; padding:.1in .4in; }
.wp-me-plate small { display:block; font:600 12pt 'Fredoka'; letter-spacing:.06em; text-transform:uppercase; opacity:.9; }
.wp-me-lines { margin-top:.25in; }
.wp-me-pick { display:flex; align-items:center; justify-content:center; gap:.35in; margin-top:.3in; font:600 15pt 'Fredoka'; }
.wp-st-text { font-size:15pt; line-height:1.5; margin-top:.15in; }
.wp-st-text p { margin:0 0 .16in; }
.wp-st-blank { display:inline-block; width:2.1in; border-bottom:2px solid var(--navy); height:1.1em; vertical-align:bottom; }
.wp-st-blank.long { width:3.2in; } .wp-st-blank.full { width:100%; }
.wp-st-draw { position:relative; height:3.3in; margin-top:.15in; border:4px dashed var(--teal); border-radius:24px; }
.wp-st-draw span { position:absolute; left:.2in; top:.12in; font:600 12pt 'Fredoka'; color:#9aa3b8; }
.wp-story.little .wp-st-draw { height:2.6in; }
.wp-st-line { display:flex; align-items:center; justify-content:space-between; gap:.2in; border-bottom:2px dashed var(--line); padding:.16in 0; }
.wp-st-line p { margin:0; font:600 17pt 'Fredoka'; flex:1; }
.wp-st-pick { display:flex; gap:.2in; }
.wp-st-pick span { border:3px solid var(--line); border-radius:50%; padding:.08in; }
`;

module.exports = { activityPages, activityTitles, activityCss, activityCount, CLEAN, MOSAIC_PICS, CRAYONS };
