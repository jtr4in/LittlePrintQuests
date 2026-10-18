// Extra wall signage for every kit, so the printed pieces can turn a play kitchen or a corner
// into the place itself:
//   station signs  4 big framed "marquee" signs for the areas of the place, 2 to a page
//   counter signs  8 small signs (open, closed, pay here, wait here, staff only, back soon,
//                  thank you, our hours), 4 to a page
//   bin labels     15 picture labels for shelves, bins and baskets, 1 page
const art = require('./art');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Four areas for each kit, on top of the signs in its def.
const STATIONS = {
  auto: [['Oil Change', '🛢️'], ['Tool Bench', '🔧'], ['Parts Counter', '⚙️'], ['Paint Shop', '🎨']],
  burger: [['Fry Station', '🍟'], ['Shake Bar', '🥤'], ['Order Here', '📝'], ['Sauces', '🍅']],
  christmas: [['Elf Break Room', '🍪'], ['Reindeer Barn', '🦌'], ['Letters to Santa', '✉️'], ['Ribbon Shop', '🎀']],
  coffee: [['Barista Bar', '☕'], ['Bakery Case', '🥐'], ['Milk and Sugar', '🥛'], ['Tea Corner', '🫖']],
  construction: [['Crane Zone', '🏗️'], ['Brick Yard', '🧱'], ['Safety First', '⚠️'], ['Blueprint Office', '📐']],
  dino: [['Bone Yard', '🦴'], ['Egg Nest', '🥚'], ['Dig Tools', '⛏️'], ['Gift Shop', '🎁']],
  easter: [['Chick Nursery', '🐣'], ['Ribbon Shop', '🎀'], ['Egg Wash', '🫧'], ['Jelly Bean Bar', '🍬']],
  fire: [['Ambulance Bay', '🚑'], ['Hose Room', '🧯'], ['Training Yard', '🪜'], ['Front Desk', '📞']],
  grocery: [['Meat and Deli', '🥩'], ['Snacks', '🍿'], ['Drinks', '🧃'], ['Pantry', '🥫']],
  halloween: [['Bat Cave', '🦇'], ['Pumpkin Patch', '🎃'], ['Spider Shelf', '🕷️'], ['Spooky Treats', '🍬']],
  hero: [['Mission Room', '🗺️'], ['Cape Closet', '🦸'], ['Hero Gym', '💪'], ['Signal Tower', '🔦']],
  ice: [['Snowman Garden', '⛄'], ['Sled Hill', '🛷'], ['Ice Cream Bar', '🍦'], ['Crystal Room', '💎']],
  italian: [['Pasta Station', '🍝'], ['Pizza Oven', '🍕'], ['Gelato Bar', '🍨'], ['Bread Basket', '🥖']],
  library: [['Picture Books', '🖍️'], ['Chapter Books', '📖'], ['Library Cards', '💳'], ['Book Drop', '📥']],
  mermaid: [['Treasure Cave', '💎'], ['Turtle Beach', '🐢'], ['Bubble Spa', '🫧'], ['Dolphin Show', '🐬']],
  dentist: [['Exam Room', '🦷'], ['X-Ray Room', '📸'], ['Prize Box', '🎁'], ['Brushing Station', '🪥']],
  petshop: [['Fish Tanks', '🐠'], ['Bird Cages', '🐦'], ['Pet Toys', '🎾'], ['Puppy Corner', '🐶']],
  pirate: [['Map Room', '🗺️'], ['Anchor Bay', '⚓'], ['Parrot Perch', '🦜'], ['Lookout', '🔭']],
  pizza: [['Toppings Bar', '🍄'], ['Dough Station', '🫓'], ['Delivery Station', '🛵'], ['Sides and Drinks', '🥤']],
  police: [['Detective Office', '🔍'], ['Dispatch', '📞'], ['Police Cars', '🚓'], ['K-9 Unit', '🐕']],
  post: [['Stamps for Sale', '✉️'], ['Mailboxes', '📬'], ['Packing Station', '📦'], ['Delivery Trucks', '🚚']],
  racecar: [['Pit Crew Only', '🔧'], ['Race Shop', '🏁'], ['Trophy Room', '🏆'], ['Grandstand', '🎟️']],
  royal: [['Crown Room', '👑'], ['Royal Garden', '🌹'], ['Knight School', '🛡️'], ['Royal Library', '📜']],
  space: [['Rocket Hangar', '🚀'], ['Star Lab', '🔭'], ['Space Food', '🥫'], ['Alien Zoo', '👽']],
  unicorn: [['Hay Loft', '🌾'], ['Glitter Bath', '🫧'], ['Rainbow Snacks', '🍭'], ['Ribbon Room', '🎀']],
  valentine: [['Heart Shop', '💝'], ['Wrapping Table', '🎁'], ['Flower Shop', '🌹'], ['Love Notes', '💌']],
  vet: [['Check-In Desk', '📋'], ['Pet Grooming', '🛁'], ['Pet Food', '🦴'], ['Recovery Room', '🛏️']],
};

// A row of light bulbs around the frame, like a theater marquee.
function bulbs(w, h, inset, gap) {
  const out = [];
  const nx = Math.round((w - 2 * inset) / gap); const ny = Math.round((h - 2 * inset) / gap);
  const sx = (w - 2 * inset) / nx; const sy = (h - 2 * inset) / ny;
  for (let i = 0; i <= nx; i++) out.push([inset + i * sx, inset], [inset + i * sx, h - inset]);
  for (let j = 1; j < ny; j++) out.push([inset, inset + j * sy], [w - inset, inset + j * sy]);
  return out.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="var(--gold)" stroke="#fff" stroke-width="2"/>`).join('');
}

function stationSign(k, title, icon, n) {
  const W = 1000; const H = 620;
  return `<div class="st-sign"><svg class="st-frame" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
      <rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="26" fill="${n % 2 ? 'var(--orange)' : 'var(--teal)'}"/>
      ${bulbs(W, H, 30, 52)}
      <rect x="62" y="62" width="${W - 124}" height="${H - 124}" rx="14" fill="#fff"/>
    </svg>
    <div class="st-body">
      <div class="st-words"><div class="st-place">${k.def.icon} ${esc(k.placeName)}</div><div class="st-title" style="font-size:${Math.min(56, Math.floor(400 / Math.max(...title.split(' ').map((w) => w.length))))}pt">${esc(title)}</div></div>
      <div class="st-pic">${art.pic(icon, '2.1in')}</div>
    </div></div>`;
}

function stationPages(k) {
  const list = k.def.stations || STATIONS[k.def.id] || [];
  const out = [];
  for (let i = 0; i < list.length; i += 2) {
    const pair = list.slice(i, i + 2).map(([t, ic], j) => stationSign(k, t, ic, i + j));
    out.push(`<section class="page signs st-page">${pair.join('<div class="cut-h"></div>')}</section>`);
  }
  return out.join('');
}

const COUNTER = [
  ['come in, we’re', 'OPEN', '✅', 'go'],
  ['sorry, we’re', 'CLOSED', '🌙', 'stop'],
  ['please', 'PAY HERE', '🪙'],
  ['please', 'WAIT HERE', '🪑'],
  ['staff', 'ONLY', '🔒', 'alt'],
  ['back in', '5 MINUTES', '⏰', 'alt'],
  ['thank you,', 'COME AGAIN!', '💛'],
];

function counterCard([lead, word, icon, cls = ''], k) {
  return `<div class="ct-card ${cls}"><div class="ct-in">
    <div class="ct-pic">${art.pic(icon, '1.1in')}</div>
    <div class="ct-lead">${esc(lead)}</div>
    <div class="ct-word">${esc(word)}</div>
    <div class="ct-foot">${k.def.icon} ${esc(k.placeName)}</div>
  </div></div>`;
}

function hoursCard(k) {
  const rows = ['Open', 'Lunch', 'Snack', 'Close'].map((r) => `<div class="hr-row"><span>${r}</span><span class="hr-clock"></span><span class="hr-fill"></span></div>`).join('');
  return `<div class="ct-card hours"><div class="ct-in">
    <div class="ct-lead">${esc(k.placeName)}</div>
    <div class="ct-word">HOURS</div>
    <div class="hr-rows">${rows}</div>
    <div class="ct-foot">Draw the hands or write the times</div>
  </div></div>`;
}

// Open on one half and Closed upside down on the other: fold it in half (or hang it) and turn
// it round to open or close the shop.
function openClosedCard(k) {
  return `<div class="ct-card flip-sign"><div class="fs-half">${counterCard(COUNTER[0], k)}</div>
    <div class="fs-fold">fold here</div><div class="fs-half upside">${counterCard(COUNTER[1], k)}</div></div>`;
}

function counterPages(k) {
  const cards = [openClosedCard(k), ...COUNTER.slice(2).map((c) => counterCard(c, k)), hoursCard(k)];
  const out = [];
  // The fold-over sign takes the left column of the first page.
  for (let i = 0; i < cards.length; i += i ? 4 : 3) out.push(`<section class="page ct-page"><div class="ct-grid">${cards.slice(i, i + (i ? 4 : 3)).join('')}</div></section>`);
  return out.join('');
}

function labelItems(k) {
  const d = k.def;
  const all = [...(d.props?.labels?.items || []), ...d.menu.items.map(([e, n]) => [e, n]), ...(d.props?.food?.items || []).map(([e, n]) => [e, n]), ...d.ticket.options];
  const seen = new Set();
  return all.filter(([, n]) => { const key = n.toLowerCase(); if (seen.has(key)) return false; seen.add(key); return true; }).slice(0, 15);
}

function labelsPage(k) {
  const items = labelItems(k);
  return `<section class="page props">
    <h2 class="pg-title">Shelf and Bin Labels</h2>
    <p class="pg-sub">Cut out and tape onto shelves, bins, baskets and drawers around ${esc(k.placeName)}.</p>
    <div class="bin-grid">${items.map(([e, n], i) => `<div class="bin ${i % 2 ? 'b2' : ''}"><div class="bin-pic">${art.pic(e, '.8in')}</div><div class="bin-name">${esc(n)}</div></div>`).join('')}</div>
  </section>`;
}

const signageCss = `
/* station signs: marquee frame */
.st-sign { flex:1; position:relative; margin:.08in 0; }
.st-frame { position:absolute; inset:0; width:100%; height:100%; }
.st-body { position:absolute; inset:.62in .7in; display:flex; align-items:center; gap:.2in; }
.st-words { flex:1; min-width:0; }
.st-place { font:600 13pt 'Fredoka'; color:var(--teal); text-transform:uppercase; letter-spacing:.08em; margin-bottom:.08in; }
.st-title { font:700 50pt/1.02 'Fredoka'; color:var(--navy); text-transform:uppercase; overflow-wrap:break-word; }
.st-pic { flex:none; }
/* counter signs: 4 to a page */
.ct-page { padding:.35in; }
.ct-grid { height:100%; display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr; gap:0; }
.ct-card { padding:.12in; border:1.5px dashed #b7c0cc; margin:-.75px; }
.ct-card.flip-sign { grid-row:span 2; padding:0; display:flex; flex-direction:column; }
.fs-half { flex:1; display:flex; } .fs-half > .ct-card { flex:1; border:0; margin:0; } .fs-half.upside { transform:rotate(180deg); }
.fs-fold { border-top:2px dotted #9aa5b8; text-align:center; font:600 8pt 'Fredoka'; color:#9aa5b8; margin-top:-1px; height:0; overflow:visible; line-height:0; }
.ct-in { height:100%; border:4px solid var(--teal); border-radius:16px; outline:2px solid var(--teal); outline-offset:-12px; background:#fff; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:.25in .2in; }
.ct-lead { font:400 25pt/1.3 'Pacifico', 'Fredoka'; color:var(--navy); margin-top:.1in; }
.ct-word { font:700 40pt/1.05 'Fredoka'; color:var(--teal-d); }
.ct-foot { margin-top:.25in; font:500 11pt 'Fredoka'; color:#7d86a3; }
.ct-card.go .ct-in { border-color:#3aa35b; outline-color:#3aa35b; } .ct-card.go .ct-word { color:#2b7a44; font-size:58pt; }
.ct-card.stop .ct-in { border-color:#d0574a; outline-color:#d0574a; } .ct-card.stop .ct-word { color:#b8463a; font-size:50pt; }
.ct-card.alt .ct-in { border-color:var(--orange); outline-color:var(--orange); }
.hr-rows { width:100%; margin-top:.2in; display:flex; flex-direction:column; gap:.16in; }
.hr-row { display:flex; align-items:center; gap:.12in; font:600 15pt 'Fredoka'; }
.hr-row span:first-child { width:.85in; text-align:left; }
.hr-clock { width:.55in; height:.55in; border-radius:50%; border:2.5px solid var(--teal); flex:none; background:radial-gradient(circle, var(--teal) 0 3px, transparent 4px); }
.hr-fill { flex:1; border-bottom:2px solid var(--navy); height:.4in; }
/* shelf and bin labels: 15 to a page */
.bin-grid { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); grid-auto-rows:1.68in; gap:.14in; margin-top:.15in; }
.bin { border:3px solid var(--teal); border-radius:14px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.06in; padding:.08in .1in; background:var(--mint-l); text-align:center; }
.bin.b2 { border-color:var(--orange); background:#fff; }
.bin-pic { flex:none; }
.bin-name { font:700 16pt/1.1 'Fredoka'; color:var(--navy); max-width:100%; }
`;

const signageCount = (d) => (d.stations || STATIONS[d.id] || []).length;

module.exports = { stationPages, counterPages, labelsPage, signageCss, signageCount, STATIONS };
