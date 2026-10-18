// More pieces for the play kits, from a family's play test:
//   bigSignPages    the shop sign as two whole pages that glue into one 20 inch banner
//   atmPage         a pull-tab ATM: pull the strip to put in the card, type the number and get cash
//   morningPages    pretend paperwork to start the day: a morning checklist and a supply order
//   appliancePages  wall pieces that look like the thing itself, no words: a pizza oven, a stove
//   jarPages        wrap-around labels for jars, cups and tubs (def.jars)
//   peelPages       a pizza peel and two plain pizzas to glue onto cardboard and draw toppings on
//   chefHatPage     a tall chef hat with the child's name on the band
//   foldMenuPages   a menu that folds like a book: covers on one page, the food inside on the next
// Kits pick the optional ones in their def: jars, appliances, peel, chefHat, menu.fold.

const { em, pic } = require('./art');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const coins = (k, n) => `${n} ${n === 1 ? k.def.menu.coinWord : `${k.def.menu.coinWord}s`}`;
const head = (title, sub) => `<h2 class="pg-title">${esc(title)}</h2><p class="pg-sub">${esc(sub)}</p>`;
const chunk = (list, n) => Array.from({ length: Math.ceil(list.length / n) }, (_, i) => list.slice(i * n, i * n + n));

// ---------- big sign ----------

// The same art as the old one-page kitchen sign, but each half fills a whole page (turned on
// its side), so the finished sign is about 20 inches long.
function bigSignPages(k) {
  const d = k.def;
  const trio = (d.shop && d.shop.hero) || [d.menu.items[0][0], d.icon, d.menu.items[1][0]];
  const W = 1520; const H = 430; const lap = 40;
  const stripes = 24; const sw = W / stripes;
  const awn = Array.from({ length: stripes }, (_, i) => `<path d="M${i * sw},0 L${(i + 1) * sw},0 L${(i + 1) * sw},56 A${sw / 2},${sw / 2.4} 0 0 1 ${i * sw},56 Z" fill="${i % 2 ? '#fff' : 'var(--teal-d)'}" stroke="var(--teal-d)" stroke-width="2"/>`).join('');
  const art = `<rect x="0" y="0" width="${W}" height="${H}" rx="28" fill="var(--teal)"/>${awn}
    <rect x="22" y="92" width="${W - 44}" height="${H - 114}" rx="22" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="2 14" stroke-linecap="round"/>
    ${em(150, 255, 190, trio[0])}${em(W - 150, 255, 190, trio[2])}
    <text x="${W / 2}" y="268" text-anchor="middle" class="ks-name" style="font-size:${Math.min(120, Math.round(1700 / k.placeName.length))}px">${esc(k.placeName)}</text>
    <text x="${W / 2}" y="345" text-anchor="middle" class="ks-sub">${esc(d.tagline)}</text>`;
  // The right half starts a little early: that strip goes under the left page when gluing.
  const half = (x, w, glue) => `<div class="bs-turn" style="--ratio:${(H / w).toFixed(4)}"><svg viewBox="${x} 0 ${w} ${H}">${art}${glue
    ? `<rect x="${x}" y="0" width="${lap}" height="${H}" fill="#fff" opacity=".55"/><text x="${x + lap / 2}" y="${H / 2}" class="bs-glue" text-anchor="middle" transform="rotate(-90 ${x + lap / 2} ${H / 2})">GLUE UNDER</text>` : ''}</svg></div>`;
  const page = (n, body, tip) => `<section class="page big-sign"><div class="bs-tip">${esc(`Big sign, page ${n} of 2 · ${tip}`)}</div>${body}</section>`;
  return page(1, half(0, W / 2, false), 'Cut along the edge of the sign, then glue page 2 underneath.')
    + page(2, half(W / 2 - lap, W / 2 + lap, true), 'Slide the GLUE UNDER strip beneath page 1 and glue. Tape it above a play kitchen or doorway.');
}

// ---------- ATM ----------

// A pull-tab card like the toys' slider: the strip shows through the ATM screen.
function atmPage(k) {
  const M = k.def.menu;
  const frames = [['💳', 'Put in your card'], ['🔢', 'Type your secret number'], [M.coinIcon, 'Take your money!']];
  const frame = ([e, text], i) => `<g transform="translate(0 ${i * 300})"><rect x="0" y="0" width="300" height="300" class="frame"/>
    ${em(150, 130, 160, e)}<text x="150" y="276" class="frame-t" text-anchor="middle">${esc(text)}</text></g>`;
  const len = frames.length * 300;
  const keys = Array.from({ length: 12 }, (_, i) => {
    const x = 52 + (i % 4) * 66; const y = 400 + Math.floor(i / 4) * 34;
    return `<rect x="${x}" y="${y}" width="56" height="26" rx="7" class="atm-key${i % 4 === 3 ? ' go' : ''}"/>`;
  }).join('');
  return `<section class="page toy">${head('Money Machine', 'Pull the tab to put your card in, type your number and take out your money.')}<div class="cardstock">Best on cardstock</div>
    <div class="slide-row">
      <div class="slide-left">
        <svg class="slide-card" viewBox="0 0 360 520">
          <rect x="4" y="4" width="352" height="512" rx="30" class="card-bg"/>
          <text x="180" y="50" class="card-t atm-t" text-anchor="middle">ATM</text>
          <text x="180" y="78" class="atm-bank" text-anchor="middle">${esc(`Bank of ${k.placeName}`)}</text>
          <rect x="40" y="96" width="280" height="280" rx="16" class="window"/>
          <text x="180" y="240" class="window-t" text-anchor="middle">cut out this window</text>
          ${keys}
          <rect x="70" y="496" width="220" height="10" rx="5" class="atm-slot"/>
        </svg>
        <div class="sleeves"><div class="sleeve">sleeve: tape across the back</div><div class="sleeve">sleeve: tape across the back</div></div>
        <p class="toy-tip left">Cut out the machine, its window and the strip. Lay the strip behind the window and tape the sleeves across the back. Use it with the play money and the bank cards from the cash register.</p>
      </div>
      <svg class="strip" viewBox="0 0 300 ${len + 70}">${frames.map(frame).join('')}
        <path d="M30,${len} L270,${len} L240,${len + 66} L60,${len + 66} Z" class="pull"/><text x="150" y="${len + 40}" class="pull-t" text-anchor="middle">PULL ▼</text></svg>
    </div>
  </section>`;
}

// ---------- morning paperwork ----------

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEATHER = [['☀️', 'Sunny'], ['⛅', 'Cloudy'], ['🌧️', 'Rainy'], ['❄️', 'Snowy']];
const JOBS = [['🧼', 'Wash hands'], ['💡', 'Lights on'], ['✅', 'Flip the sign to Open'], ['🪙', 'Count the money'], ['🧹', 'Sweep up']];

function morningPages(k) {
  const d = k.def;
  const M = d.menu;
  const jobs = d.morningJobs || JOBS;
  const morning = `<section class="page props morning">
    ${head(`Good Morning, ${k.placeName}!`, 'Fill this in before you open. Circle, tick and count!')}
    <div class="mo-box"><b>Today is</b><div class="mo-days">${DAYS.map((x) => `<span>${x}</span>`).join('')}</div></div>
    <div class="mo-box"><b>The weather</b><div class="mo-weather">${WEATHER.map(([e, n]) => `<span>${pic(e, '.6in')}<small>${n}</small></span>`).join('')}</div></div>
    <div class="mo-box"><b>Opening jobs</b><div class="mo-jobs">${jobs.map(([e, n]) => `<span><i class="box"></i>${pic(e, '.42in')}${esc(n)}</span>`).join('')}</div></div>
    <div class="mo-box"><b>Today we’re making</b><div class="mo-menu">${M.items.slice(0, 6).map(([e, n]) => `<span>${pic(e, '.6in')}<small>${esc(n)}</small></span>`).join('')}</div></div>
    <div class="mo-box mo-row"><b>How many ${esc(d.subjectPlural)} today?</b><span class="mo-count"></span><b>Chef on duty</b><span class="mo-name">${esc(k.lead)}</span></div>
  </section>`;
  const supplies = (d.props?.food?.items || M.items).slice(0, 9);
  const order = `<section class="page props morning">
    ${head('Supply Order', `What does ${k.placeName} need? Circle how many, then give the order to the delivery driver.`)}
    <div class="so-grid">${supplies.map(([e, n]) => `<div class="so-item">${pic(e, '.75in')}<b>${esc(n)}</b><div class="so-nums">${[1, 2, 3, 4, 5].map((x) => `<span>${x}</span>`).join('')}</div></div>`).join('')}</div>
    <div class="mo-box mo-row"><b>Ordered by</b><span class="mo-name">${esc(k.lead)}</span><b>Delivered</b><i class="box"></i></div>
  </section>`;
  return morning + order;
}

// ---------- wall pieces that look like the real thing ----------

function ovenPage() {
  const bricks = [];
  for (let row = 0; row < 9; row++) {
    const y = 200 + row * 52; const off = row % 2 ? 0 : 45;
    for (let x = -off; x < 760; x += 90) bricks.push(`<rect x="${x + 4}" y="${y + 4}" width="82" height="44" rx="6" class="ov-brick${(row + x) % 3 ? '' : ' d'}"/>`);
  }
  return `<section class="page appliance">
    <svg viewBox="0 0 760 980" class="ap-art">
      <defs><clipPath id="dome"><path d="M40,700 L40,420 Q40,140 380,130 Q720,140 720,420 L720,700 Z"/></clipPath></defs>
      <rect x="320" y="0" width="120" height="170" class="ov-chimney"/><rect x="300" y="0" width="160" height="30" rx="8" class="ov-cap"/>
      <path d="M40,700 L40,420 Q40,140 380,130 Q720,140 720,420 L720,700 Z" class="ov-dome"/>
      <g clip-path="url(#dome)">${bricks.join('')}</g>
      <path d="M40,700 L40,420 Q40,140 380,130 Q720,140 720,420 L720,700 Z" class="ov-edge"/>
      <path d="M170,700 L170,500 Q170,330 380,325 Q590,330 590,500 L590,700 Z" class="ov-arch"/>
      <path d="M200,700 L200,505 Q200,360 380,355 Q560,360 560,505 L560,700 Z" class="ov-mouth"/>
      ${em(300, 600, 150, '🔥')}${em(400, 580, 180, '🔥')}${em(480, 615, 120, '🔥')}
      <rect x="240" y="650" width="280" height="34" rx="17" class="ov-log"/><rect x="270" y="620" width="230" height="34" rx="17" class="ov-log d"/>
      <rect x="10" y="700" width="740" height="60" rx="10" class="ov-ledge"/>
      <rect x="40" y="760" width="680" height="210" class="ov-base"/>
      ${[110, 280, 450, 620].map((x) => `<rect x="${x - 60}" y="800" width="120" height="130" rx="10" class="ov-wood"/>`).join('')}
    </svg>
    <p class="ap-tip">Tape onto a box or the front of a play kitchen. Slide the pizzas in on the peel!</p>
  </section>`;
}

function stovePage() {
  const burner = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" class="sv-ring"/>${[0.8, 0.58, 0.36].map((f) => `<circle cx="${cx}" cy="${cy}" r="${(r * f).toFixed(1)}" class="sv-coil"/>`).join('')}`;
  const knob = (cx) => `<circle cx="${cx}" cy="415" r="38" class="sv-knob"/><rect x="${cx - 6}" y="382" width="12" height="34" rx="6" class="sv-mark"/>`;
  return `<section class="page appliance">
    <svg viewBox="0 0 760 980" class="ap-art">
      <rect x="20" y="20" width="720" height="940" rx="36" class="sv-body"/>
      <rect x="50" y="50" width="660" height="310" rx="22" class="sv-top"/>
      ${burner(210, 135, 70)}${burner(550, 135, 70)}${burner(210, 285, 55)}${burner(550, 285, 55)}
      <rect x="50" y="370" width="660" height="90" rx="18" class="sv-panel"/>
      ${[140, 280, 480, 620].map(knob).join('')}<rect x="345" y="395" width="70" height="40" rx="8" class="sv-clock"/>
      <rect x="120" y="500" width="520" height="40" rx="20" class="sv-handle"/>
      <rect x="70" y="565" width="620" height="360" rx="24" class="sv-door"/>
      <rect x="130" y="620" width="500" height="250" rx="18" class="sv-glass"/>
      <path d="M170,650 L260,650 L170,740 Z" class="sv-shine"/>
    </svg>
    <p class="ap-tip">Tape onto a box or the front of a play kitchen. Put a pot on a burner and turn the knobs!</p>
  </section>`;
}

const APPLIANCES = { oven: ovenPage, stove: stovePage };
const appliancePages = (k) => (k.def.appliances || []).map((a) => APPLIANCES[a](k)).join('');

// ---------- jar labels ----------

function jarPages(k) {
  const strip = ([e, n], i) => `<div class="jar s${i % 3}">${[0, 1, 2].map((j) => (j === 1 ? `<span class="jar-mid">${pic(e, '.75in')}<b>${esc(n)}</b>${pic(e, '.75in')}</span>` : `<span>${pic(e, '.5in')}</span>`)).join('')}</div>`;
  return chunk(k.def.jars || [], 6).map((list, i) => `<section class="page props">
    ${head(i ? 'Jar Labels (more)' : 'Jar Labels', 'Cut out a strip, wrap it around a jar, cup or tub and tape the ends together.')}
    <div class="jars">${list.map((it, j) => strip(it, j)).join('')}</div>
  </section>`).join('');
}

// ---------- pizza peel and wipe-off pizzas ----------

function peelPages(k) {
  const grain = [0, 1, 2, 3, 4, 5].map((i) => `<path d="M${180 + i * 75},${120 + (i % 2) * 30} Q${200 + i * 75},380 ${170 + i * 75},${640 - (i % 3) * 20}" class="pl-grain"/>`).join('');
  const peel = `<section class="page props">
    ${head('Pizza Peel', 'Glue onto cardboard (a cereal box works) and cut it out. Slide the pizzas into the oven with it.')}
    <svg viewBox="0 0 760 900" class="pl-art">
      <rect x="320" y="600" width="120" height="290" rx="40" class="pl-wood d"/>
      <circle cx="380" cy="880" r="0" />
      <path d="M380,40 C620,40 720,200 720,360 C720,560 560,650 440,660 L320,660 C200,650 40,560 40,360 C40,200 140,40 380,40 Z" class="pl-wood"/>
      ${grain}
      <circle cx="380" cy="840" r="18" class="pl-hole"/>
      <path d="M380,40 C620,40 720,200 720,360 C720,560 560,650 440,660 L440,890 L320,890 L320,660 C200,650 40,560 40,360 C40,200 140,40 380,40 Z" class="pl-cut"/>
    </svg>
  </section>`;
  const melt = [[-80, -60, 42], [70, -90, 36], [100, 50, 44], [-50, 90, 40], [-120, 20, 30], [20, 10, 48]]
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" class="pz-cheese"/>`).join('');
  const plain = `<svg viewBox="-220 -220 440 440" class="wp-pizza"><circle r="212" class="pz-crust"/><circle r="180" class="pz-sauce"/>${melt}<circle r="212" class="cut-dash" fill="none"/></svg>`;
  const toppings = (k.def.jars || []).slice(0, 6).map(([e, n]) => `<span>${pic(e, '.45in')}<small>${esc(n)}</small></span>`).join('');
  const pizzas = `<section class="page props">
    ${head('Draw Your Own Pizza', 'Glue onto cardboard and cut out. Slip into a sheet protector, draw the toppings with a dry-erase marker, then wipe and make another!')}
    <div class="wp-pizzas">${plain}${plain}</div>
    ${toppings ? `<div class="wp-ideas"><b>Topping ideas</b>${toppings}</div>` : ''}
  </section>`;
  return k.def.peel ? peel + pizzas : '';
}

// ---------- chef hat ----------

function chefHatPage(k) {
  if (!k.def.chefHat) return '';
  const puff = `<svg viewBox="0 0 760 470" class="ch-art">
    <path d="M60,330 C0,300 0,170 90,150 C80,60 200,20 260,80 C290,0 470,0 500,80 C560,20 690,60 670,150 C760,170 760,300 700,330 Z" class="ch-puff"/>
    <path d="M150,300 Q180,200 200,140 M300,310 Q320,200 330,120 M450,310 Q440,200 430,120 M600,300 Q580,200 560,140" class="ch-fold"/>
    <rect x="40" y="320" width="680" height="130" rx="14" class="ch-band"/>
    <text x="380" y="405" text-anchor="middle" class="ch-name">${esc(k.lead)}</text>
  </svg>`;
  const band = (n) => `<svg viewBox="0 0 760 140" class="ch-art"><rect x="40" y="5" width="680" height="130" rx="14" class="ch-band"/><rect x="0" y="5" width="40" height="130" class="ch-tab"/>
    <text x="20" y="70" text-anchor="middle" class="ch-tab-t" transform="rotate(-90 20 70)">TAPE</text><text x="380" y="88" text-anchor="middle" class="ch-dots">${n}</text></svg>`;
  return `<section class="page props">
    ${head('Chef Hat', 'Cut out the three pieces. Tape the bands to the hat, wrap it round your head to fit, and tape the ends.')}<div class="cardstock">Best on cardstock</div>
    ${puff}<div class="cut-h"></div>${band('★ ★ ★')}<div class="cut-h"></div>${band('★ ★ ★')}
  </section>`;
}

// ---------- folding menu ----------

function foldMenuPages(k) {
  const M = k.def.menu;
  const half = Math.ceil(M.items.length / 2);
  const rows = (list) => list.map(([e, n, c]) => `<div class="fm-row">${pic(e, '.7in')}<span class="fm-n">${esc(n)}</span><span class="dots"></span><span class="fm-p">${c} ${pic(M.coinIcon, '.28in')}</span></div>`).join('');
  const trio = (k.def.shop && k.def.shop.hero) || [M.items[0][0], M.icon, M.items[1][0]];
  const sheet = (n, left, right, tip) => `<section class="page fold-menu"><div class="fm-tip">${esc(`Menu, page ${n} of 2 · ${tip}`)}</div>
    <div class="fm-turn"><div class="fm-panel">${left}</div><div class="fm-fold"></div><div class="fm-panel">${right}</div></div></section>`;
  const back = `<div class="fm-back">${pic(k.def.icon, '1.1in')}<b class="script">${esc(k.def.shop?.open || 'Thank you!')}</b><p>${esc(k.placeName)}</p><div class="fm-hours">Open today <i></i></div></div>`;
  const front = `<div class="fm-front"><div class="fm-kicker">${esc(k.placeName)}</div><h1 class="script">Menu</h1>
    <div class="fm-trio">${trio.map((e, i) => pic(e, i === 1 ? '1.5in' : '1.05in')).join('')}</div><div class="fm-tag">${esc(k.def.tagline)}</div></div>`;
  return sheet(1, back, front, 'The outside. Glue page 2 to the back of this page, then fold in half like a book.')
    + sheet(2, `<h2 class="fm-h script">${esc(M.title)}</h2>${rows(M.items.slice(0, half))}`, `<h2 class="fm-h script">More to try</h2>${rows(M.items.slice(half))}<div class="fm-foot">Prices in ${esc(M.coinWord)}s</div>`, 'The inside. Glue its back to page 1, right way up.');
}

const extrasCss = `
.big-sign { padding:.3in; display:flex; flex-direction:column; align-items:center; justify-content:center; }
.bs-tip { position:absolute; top:.22in; left:0; right:0; text-align:center; font:600 10pt 'Fredoka'; color:#66708f; }
.bs-turn { width:9.9in; height:calc(9.9in * var(--ratio)); transform:rotate(90deg); flex:none; }
.bs-turn svg { width:100%; height:100%; display:block; outline:2px dashed #b7c0cc; outline-offset:4px; }
.bs-glue { font:700 22px 'Fredoka'; fill:var(--navy); letter-spacing:4px; }
.atm-t { font-size:38px; letter-spacing:6px; } .atm-bank { font:600 17px 'Fredoka'; fill:#fff; opacity:.9; }
.atm-key { fill:#fff; } .atm-key.go { fill:var(--orange); } .atm-slot { fill:var(--teal-d); }
.morning { gap:.14in; }
.mo-box { border:2px solid var(--mint); border-radius:.18in; background:var(--mint-l); padding:.12in .18in; }
.mo-box > b { display:block; font:700 14pt 'Fredoka'; color:var(--teal-d); margin-bottom:.06in; }
.mo-days { display:flex; gap:.08in; } .mo-days span { flex:1; text-align:center; border:2px solid var(--teal); border-radius:99px; padding:.06in 0; font:700 13pt 'Fredoka'; background:#fff; }
.mo-weather, .mo-menu { display:flex; justify-content:space-around; } .mo-weather span, .mo-menu span { display:flex; flex-direction:column; align-items:center; gap:2px; } .mo-weather small, .mo-menu small { font:600 10pt 'Fredoka'; }
.mo-jobs { display:grid; grid-template-columns:1fr 1fr; gap:.06in .2in; } .mo-jobs span { display:flex; align-items:center; gap:.08in; font:600 12.5pt 'Fredoka'; }
.mo-jobs .box, .mo-row .box { width:.32in; height:.32in; border:2.5px solid var(--teal); border-radius:6px; background:#fff; display:inline-block; flex:none; }
.mo-row { display:flex; align-items:center; gap:.15in; } .mo-row > b { margin:0; font-size:12.5pt; white-space:nowrap; }
.mo-count { width:1.1in; height:.6in; border:2.5px solid var(--teal); border-radius:10px; background:#fff; flex:none; }
.mo-name { flex:1; border-bottom:2px solid var(--navy); font:700 13pt 'Fredoka'; padding-bottom:2px; }
.so-grid { flex:1; display:grid; grid-template-columns:repeat(3, 1fr); grid-template-rows:repeat(3, 1fr); gap:.14in; margin-bottom:.14in; }
.so-item { border:2px solid var(--mint); border-radius:.18in; background:#fff; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.05in; text-align:center; }
.so-item b { font:700 12.5pt/1.1 'Fredoka'; }
.so-nums { display:flex; gap:.05in; } .so-nums span { width:.34in; height:.34in; border:2px solid var(--teal); border-radius:50%; display:grid; place-items:center; font:700 11pt 'Fredoka'; }
.appliance { padding:.35in; display:flex; flex-direction:column; align-items:center; }
.ap-art { width:100%; flex:1; min-height:0; }
.ap-tip { font-size:10pt; color:#66708f; margin:.08in 0 0; text-align:center; }
.ov-chimney { fill:#8a8f98; } .ov-cap { fill:#5d626b; }
.ov-dome { fill:#c8643c; } .ov-brick { fill:#d9784d; stroke:#a9502c; stroke-width:3; } .ov-brick.d { fill:#c66a43; }
.ov-edge { fill:none; stroke:#8e3f22; stroke-width:10; }
.ov-arch { fill:#e9d3b0; stroke:#a58a62; stroke-width:6; } .ov-mouth { fill:#2b1d16; }
.ov-log { fill:#8a5a34; } .ov-log.d { fill:#6e4426; }
.ov-ledge { fill:#b9b2a6; stroke:#8f897e; stroke-width:4; } .ov-base { fill:#a99f90; } .ov-wood { fill:#7a5536; stroke:#5c3e26; stroke-width:4; }
.sv-body { fill:#f1f3f6; stroke:#9aa3b8; stroke-width:6; } .sv-top { fill:#2f3440; }
.sv-ring { fill:#1d2029; stroke:#596072; stroke-width:6; } .sv-coil { fill:none; stroke:#e4572e; stroke-width:9; }
.sv-panel { fill:#d9dde6; } .sv-knob { fill:#fff; stroke:#7d86a3; stroke-width:6; } .sv-mark { fill:var(--orange); } .sv-clock { fill:#2f3440; }
.sv-handle { fill:#b7bfcc; stroke:#7d86a3; stroke-width:4; } .sv-door { fill:#e3e7ee; stroke:#9aa3b8; stroke-width:5; }
.sv-glass { fill:#3b4252; } .sv-shine { fill:#fff; opacity:.18; }
.jars { flex:1; display:flex; flex-direction:column; justify-content:space-between; }
.jar { height:1.45in; border:2px dashed #b7c0cc; border-radius:.08in; display:flex; align-items:center; justify-content:space-around; background:var(--mint-l); border-top:.16in solid var(--teal); border-bottom:.16in solid var(--teal); }
.jar.s1 { border-top-color:var(--orange); border-bottom-color:var(--orange); } .jar.s2 { background:#fff; }
.jar-mid { display:flex; align-items:center; gap:.18in; } .jar-mid b { font:700 26pt 'Fredoka'; color:var(--teal-d); }
.pl-art { width:100%; flex:1; min-height:0; }
.pl-wood { fill:#e6c48f; stroke:#b98f55; stroke-width:6; } .pl-wood.d { fill:#d4ab6e; } .pl-grain { fill:none; stroke:#c9a46b; stroke-width:5; stroke-linecap:round; }
.pl-hole { fill:#fff; stroke:#b98f55; stroke-width:4; } .pl-cut { fill:none; stroke:#9aa5b8; stroke-width:4; stroke-dasharray:14 10; }
.wp-pizzas { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:space-around; }
.wp-pizza { width:4.3in; height:4.3in; }
.wp-ideas { display:flex; align-items:center; justify-content:center; gap:.18in; font:700 12pt 'Fredoka'; color:var(--teal-d); }
.wp-ideas span { display:flex; flex-direction:column; align-items:center; } .wp-ideas small { font:600 8.5pt 'Fredoka'; color:var(--navy); }
.ch-art { width:100%; display:block; }
.ch-puff { fill:#fff; stroke:#9aa3b8; stroke-width:6; } .ch-fold { fill:none; stroke:#d5dae6; stroke-width:6; stroke-linecap:round; }
.ch-band { fill:var(--teal); stroke:var(--teal-d); stroke-width:5; } .ch-tab { fill:#eef1f6; stroke:#9aa3b8; stroke-width:3; stroke-dasharray:8 6; }
.ch-tab-t { font:700 16px 'Fredoka'; fill:#7d86a3; } .ch-name { font:400 64px 'Pacifico', 'Fredoka'; fill:#fff; } .ch-dots { font:700 40px 'Fredoka'; fill:#fff; letter-spacing:12px; }
.fold-menu { padding:.3in; display:flex; align-items:center; justify-content:center; }
.fm-tip { position:absolute; top:.2in; left:0; right:0; text-align:center; font:600 10pt 'Fredoka'; color:#66708f; }
.fm-turn { width:10.2in; height:7.6in; flex:none; transform:rotate(90deg); display:flex; border:3px solid var(--teal); border-radius:.22in; background:#fffdf8; outline:2px dashed #b7c0cc; outline-offset:6px; }
.fm-panel { flex:1; padding:.35in .4in; display:flex; flex-direction:column; }
.fm-fold { border-left:2px dotted #9aa5b8; }
.fm-front, .fm-back { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:.12in; }
.fm-kicker { font:700 15pt 'Fredoka'; letter-spacing:.12em; text-transform:uppercase; color:var(--teal); }
.fm-front h1 { font-size:66pt; margin:0; } .fm-trio { display:flex; align-items:flex-end; gap:.1in; } .fm-tag { font:600 13pt 'Fredoka'; }
.fm-back b { font-size:30pt; } .fm-back p { font:600 13pt 'Fredoka'; margin:0; }
.fm-hours { display:flex; gap:8px; font:600 12pt 'Fredoka'; width:3in; } .fm-hours i { flex:1; border-bottom:1.5px solid var(--navy); }
.fm-h { font-size:28pt; text-align:center; margin:0 0 .12in; }
.fm-row { display:flex; align-items:center; gap:.12in; padding:.08in 0; border-bottom:2px solid var(--mint); }
.fm-n { font:700 16pt 'Fredoka'; } .fm-row .dots { flex:1; border-bottom:2px dotted #b7c0cc; } .fm-p { font:700 15pt 'Fredoka'; color:var(--teal-d); display:flex; align-items:center; gap:4px; }
.fm-foot { margin-top:auto; text-align:center; font:600 10.5pt 'Fredoka'; color:#66708f; }
`;

module.exports = { bigSignPages, atmPage, morningPages, appliancePages, jarPages, peelPages, chefHatPage, foldMenuPages, extrasCss };
