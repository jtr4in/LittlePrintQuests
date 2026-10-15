// Hands-on centerpieces for the play kits: things kids turn, pull, lift or put together.
// A kit's def.toys lists its pieces in order; each piece names a type below plus its own pictures
// and words, so two kits never print the same thing:
//   steering  a full-page steering wheel with a honk button and the child's name on the hub
//   gauges    two meters whose needles turn on a paper fastener (speedometer, Ghost-o-Meter...)
//   flaps     a big vessel (cauldron...) with doors to lift; a picture sits behind each door
//   slider    a card with a window and a strip to pull through it (an egg that hatches...)
//   puzzle    a big picture with the child's name, printed with jigsaw cut lines

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const possessive = (name) => (/s$/i.test(name) ? `${name}’` : `${name}’s`);
const fill = (s, k) => String(s).replace('{child}', k.childName).replace('{childs}', possessive(k.childName));
const head = (T, k) => `<h2 class="pg-title">${esc(fill(T.title, k))}</h2><p class="pg-sub">${esc(T.howTo)}</p><div class="cardstock">Best on cardstock</div>`;
const { em } = require('./art');
const pt = (cx, cy, r, deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy - r * Math.sin((deg * Math.PI) / 180)].map((v) => v.toFixed(1));

// ---------- steering wheel ----------
function steering(T, k) {
  const grips = Array.from({ length: 28 }, (_, i) => (i * 360) / 28).filter((a) => a < 55 || a > 125).map((a) => {
    const [x, y] = pt(0, 0, 342, a);
    return `<circle cx="${x}" cy="${y}" r="13" class="grip"/>`;
  }).join('');
  const btn = ([e, label], x, y) => `<g><circle cx="${x}" cy="${y}" r="52" class="wbtn"/>${em(x, y - 8, 50, e)}<text x="${x}" y="${y + 34}" class="wbtn-t" text-anchor="middle">${esc(label)}</text></g>`;
  const [b1, b2, b3, b4] = T.buttons;
  return `<section class="page toy">${head(T, k)}
    <svg class="wheel-big" viewBox="-400 -400 800 800">
      <circle r="385" class="rim"/>${grips}<circle r="300" class="rim-gap"/>
      <path d="M-300,-28 L300,-28 L300,28 L-300,28 Z" class="spoke"/><path d="M-34,0 L34,0 L60,300 L-60,300 Z" class="spoke"/>
      <circle r="150" class="hub"/><circle r="128" class="hub-in"/>
      ${em(0, -52, 84, T.horn[0])}
      <text y="30" class="hub-name" text-anchor="middle">${esc(k.childName.toUpperCase())}</text>
      <text y="70" class="hub-t" text-anchor="middle">${esc(T.horn[1])}</text>
      ${btn(b1, -230, -95)}${btn(b2, -230, 95)}${btn(b3, 230, -95)}${btn(b4, 230, 95)}
      <text y="-320" class="rim-t" text-anchor="middle">${esc(T.rimText)}</text>
    </svg>
    <p class="toy-tip">Cut around the outside, then glue it onto the side of a cereal box and cut again for a sturdy wheel.</p>
  </section>`;
}

// ---------- gauges ----------
function gauge(G, k) {
  const n = G.zones.length;
  const shades = ['var(--mint)', 'var(--gold)', 'var(--orange)', 'var(--teal)', 'var(--mint-l)', 'var(--teal-d)'];
  const zones = G.zones.map(([e, label], i) => {
    const a0 = 180 - (i * 180) / n;
    const a1 = 180 - ((i + 1) * 180) / n;
    const [x0, y0] = pt(300, 300, 280, a0); const [x1, y1] = pt(300, 300, 280, a1);
    const [x2, y2] = pt(300, 300, 120, a1); const [x3, y3] = pt(300, 300, 120, a0);
    const [ex, ey] = pt(300, 300, 235, (a0 + a1) / 2); const [lx, ly] = pt(300, 300, 168, (a0 + a1) / 2);
    const dark = i % 6 === 3 || i % 6 === 5;
    return `<path d="M${x0},${y0} A280,280 0 0 1 ${x1},${y1} L${x2},${y2} A120,120 0 0 0 ${x3},${y3} Z" fill="${shades[i % 6]}" class="zone"/>
      ${em(ex, ey, 46, e)}<text x="${lx}" y="${ly}" class="zone-t${dark ? ' light' : ''}" text-anchor="middle" dominant-baseline="central">${esc(label)}</text>`;
  }).join('');
  const ticks = Array.from({ length: 19 }, (_, i) => {
    const [a, b] = pt(300, 300, 292, i * 10); const [c, d] = pt(300, 300, 280 + (i % 3 ? 0 : -14) + 4, i * 10);
    return `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" class="tick"/>`;
  }).join('');
  return `<div class="gauge">
    <div class="gauge-h">${esc(fill(G.name, k))}</div>
    <div class="gauge-row">
      <svg class="dial" viewBox="0 0 600 330">
        <path d="M6,300 A294,294 0 0 1 594,300 L594,326 L6,326 Z" class="dial-bg"/>${zones}${ticks}
        <circle cx="300" cy="300" r="42" class="dial-hub"/><circle cx="300" cy="300" r="7" class="pin"/>
      </svg>
      <svg class="needle" viewBox="0 0 110 330">
        <path d="M55,6 L92,248 Q55,322 18,248 Z" class="needle-p"/><circle cx="55" cy="272" r="7" class="pin"/>
        ${em(55, 190, 52, G.needle)}
      </svg>
    </div>
  </div>`;
}

function gauges(T, k) {
  return `<section class="page toy">${head(T, k)}
    ${T.gauges.map((g) => gauge(g, k)).join('<div class="cut-h"></div>')}
    <p class="toy-tip">Push a paper fastener (brad) through the dot on the needle, then through the dot in the middle of the meter. Now the needle spins!</p>
  </section>`;
}

// ---------- lift-the-flap vessel ----------
const VESSELS = {
  cauldron: {
    box: [120, 150, 460, 250], // where the doors go: x, y, width, height
    art: () => `<ellipse cx="350" cy="140" rx="300" ry="46" class="v-rim"/>
      <path d="M70,150 Q40,330 150,410 L150,450 L200,450 L215,425 Q350,450 485,425 L500,450 L550,450 L550,410 Q660,330 630,150 Z" class="v-body"/>
      <ellipse cx="350" cy="132" rx="270" ry="30" class="v-brew"/>
      ${em(230, 72, 50, '🫧')}${em(360, 40, 60, '🫧')}${em(480, 78, 44, '🫧')}`,
  },
};

function flapsLayer(T, k, front) {
  const V = VESSELS[T.vessel];
  const [bx, by, bw, bh] = V.box;
  const cols = 3; const rows = Math.ceil(T.items.length / cols);
  const w = bw / cols; const h = bh / rows;
  const doors = T.items.map(([e, label], i) => {
    const x = bx + (i % cols) * w + 8; const y = by + Math.floor(i / cols) * h + 8;
    const dw = w - 16; const dh = h - 16;
    if (!front) return `<rect x="${x}" y="${y}" width="${dw}" height="${dh}" rx="10" class="door-in"/>${em(x + dw / 2, y + dh / 2 - 12, 50, e)}<text x="${x + dw / 2}" y="${y + dh - 14}" class="door-t" text-anchor="middle">${esc(label)}</text>`;
    return `<rect x="${x}" y="${y}" width="${dw}" height="${dh}" rx="10" class="door"/>
      <path d="M${x},${y} L${x},${y + dh} L${x + dw},${y + dh} L${x + dw},${y}" class="cut-dash" fill="none"/>
      <line x1="${x}" y1="${y}" x2="${x + dw}" y2="${y}" class="fold-dot"/>
      <text x="${x + dw / 2}" y="${y + dh / 2}" class="door-q" text-anchor="middle" dominant-baseline="central">${i + 1}</text>`;
  }).join('');
  return `<svg class="vessel" viewBox="0 0 700 470">${V.art(k)}${doors}
    <rect x="200" y="${by + bh + 6}" width="300" height="46" rx="23" class="v-label"/>
    <text x="350" y="${by + bh + 30}" class="v-label-t" text-anchor="middle" dominant-baseline="central">${esc(fill(T.label, k))}</text></svg>`;
}

function flaps(T, k) {
  return `<section class="page toy">${head(T, k)}
    <div class="layer-h">Front: cut the dashed lines, fold each door up on the dotted line</div>
    ${flapsLayer(T, k, true)}
    <div class="cut-h"></div>
    <div class="layer-h">Back: glue this behind the front so a picture hides behind every door</div>
    ${flapsLayer(T, k, false)}
  </section>`;
}

// ---------- pull-tab slider ----------
const SHAPES = {
  // A cracked egg: the shell splits on a zigzag and the baby peeks out.
  crack: (e) => `<path d="M60,180 Q60,40 150,40 Q240,40 240,180 Q240,260 150,262 Q60,260 60,180 Z" class="egg"/>
    <path d="M70,150 L100,125 L125,155 L150,120 L175,155 L200,125 L230,150" class="crack" fill="none"/>${em(150, 105, 60, e, 'opacity=".9"')}`,
  hatch: (e) => `${em(150, 120, 150, e)}<path d="M55,190 L85,165 L110,195 L150,160 L190,195 L215,165 L245,190 Q245,262 150,262 Q55,262 55,190 Z" class="egg"/>`,
};

function slider(T, k) {
  const frame = (f, i) => {
    const y = i * 300;
    const art = f.shape ? SHAPES[f.shape](f.e) : em(150, y ? 140 : 140, 170, f.e);
    return `<g transform="translate(0 ${y})"><rect x="0" y="0" width="300" height="300" class="frame"/>
      <g transform="translate(0 -5)">${art}</g><text x="150" y="282" class="frame-t" text-anchor="middle">${esc(fill(f.text, k))}</text></g>`;
  };
  const len = T.frames.length * 300;
  return `<section class="page toy">${head(T, k)}
    <div class="slide-row">
      <div class="slide-left">
        <svg class="slide-card" viewBox="0 0 360 520">
          <rect x="4" y="4" width="352" height="512" rx="30" class="card-bg"/>
          <text x="180" y="62" class="card-t" text-anchor="middle">${esc(fill(T.cardTitle, k))}</text>
          <rect x="40" y="100" width="280" height="280" rx="16" class="window"/>
          <text x="180" y="240" class="window-t" text-anchor="middle">cut out this window</text>
          ${em(70, 440, 44, T.cardIcons[0])}${em(180, 440, 44, T.cardIcons[1])}${em(290, 440, 44, T.cardIcons[2])}
          <text x="180" y="496" class="card-sub" text-anchor="middle">${esc(T.cardHint)}</text>
        </svg>
        <div class="sleeves"><div class="sleeve">sleeve: tape across the back</div><div class="sleeve">sleeve: tape across the back</div></div>
        <p class="toy-tip left">Cut out the card, the window and the strip. Lay the strip behind the window, then tape the two sleeves across the back so the strip slides. Pull the tab!</p>
      </div>
      <svg class="strip" viewBox="0 0 300 ${len + 70}">${T.frames.map(frame).join('')}
        <path d="M30,${len} L270,${len} L240,${len + 66} L60,${len + 66} Z" class="pull"/><text x="150" y="${len + 40}" class="pull-t" text-anchor="middle">PULL ▼</text></svg>
    </div>
  </section>`;
}

// ---------- jigsaw puzzle ----------
function jigsaw(n, size) {
  const c = size / n;
  const lines = [];
  for (let a = 1; a < n; a++) {
    for (let b = 0; b < n; b++) {
      const s = (a + b) % 2 ? 1 : -1;
      const [p, q] = [a * c, b * c];
      const tab = (x, y, dx, dy, nx, ny) => `L${x + dx * 0.38},${y + dy * 0.38} C${x + dx * 0.3 + nx * 0.28},${y + dy * 0.3 + ny * 0.28} ${x + dx * 0.7 + nx * 0.28},${y + dy * 0.7 + ny * 0.28} ${x + dx * 0.62},${y + dy * 0.62}`;
      lines.push(`M${p},${q} ${tab(p, q, 0, c, s * c, 0)} L${p},${q + c}`);
      lines.push(`M${q},${p} ${tab(q, p, c, 0, 0, s * c)} L${q + c},${p}`);
    }
  }
  return lines.join(' ');
}

function puzzle(T, k) {
  const size = 720;
  return `<section class="page toy">${head(T, k)}
    <svg class="puzzle" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" class="pz-sky"/>
      <circle cx="610" cy="110" r="62" class="pz-sun"/>
      ${T.scenery.map(([e, x, y, s]) => em(x, y, s, e)).join('')}
      <path d="M0,560 Q180,500 360,545 Q540,590 720,520 L720,720 L0,720 Z" class="pz-ground"/>
      ${em(360, 380, 430, T.hero)}
      <rect x="150" y="610" width="420" height="78" rx="39" class="pz-banner"/>
      <text x="360" y="650" class="pz-name" text-anchor="middle" dominant-baseline="central">${esc(fill(T.banner, k))}</text>
      <path d="${jigsaw(T.pieces || 3, size)}" class="pz-cut" fill="none"/>
      <rect width="${size}" height="${size}" class="pz-edge" fill="none"/>
    </svg>
    <p class="toy-tip">${esc(T.tip)}</p>
  </section>`;
}

const TYPES = { steering, gauges, flaps, slider, puzzle };

function toyPages(k) {
  return k.def.toys.map((t) => {
    if (!TYPES[t.type]) throw new Error(`Unknown toy type "${t.type}"`);
    return TYPES[t.type](t, k);
  }).join('');
}

const toyCss = `
.toy { padding:.35in .4in; display:flex; flex-direction:column; align-items:center; }
.toy .pg-sub { margin:0 0 .08in; }
.toy .cardstock { margin-bottom:.12in; }
.toy-em { font-family:'Noto Color Emoji'; }
.toy-tip { font-size:10.5pt; color:#66708f; text-align:center; margin:.12in .3in 0; } .toy-tip.left { text-align:left; margin:.12in 0 0; }
.cut-dash { stroke:#9aa5b8; stroke-width:3; stroke-dasharray:12 9; }
.fold-dot { stroke:#9aa5b8; stroke-width:3; stroke-dasharray:3 7; stroke-linecap:round; }
.wheel-big { width:7.3in; height:7.3in; }
.rim { fill:var(--teal-d); } .grip { fill:rgba(255,255,255,.18); } .rim-gap { fill:var(--mint-l); }
.spoke { fill:var(--teal-d); } .hub { fill:var(--orange); } .hub-in { fill:var(--teal); }
.hub-name { font:700 52px 'Fredoka'; fill:#fff; letter-spacing:2px; } .hub-t { font:600 26px 'Fredoka'; fill:#fff; opacity:.9; }
.rim-t { font:700 30px 'Fredoka'; fill:#fff; letter-spacing:6px; }
.wbtn { fill:#fff; stroke:var(--gold); stroke-width:8; } .wbtn-t { font:700 17px 'Fredoka'; fill:var(--teal-d); }
.gauge { width:100%; display:flex; flex-direction:column; align-items:center; margin:.04in 0; }
.gauge-h { font:700 20pt 'Fredoka'; color:var(--teal-d); margin-bottom:.04in; }
.gauge-row { display:flex; align-items:flex-end; gap:.35in; }
.dial { width:5.9in; } .needle { width:.95in; }
.dial-bg { fill:var(--teal-d); } .zone { stroke:#fff; stroke-width:4; }
.zone-t { font:700 18px 'Fredoka'; fill:var(--navy); } .zone-t.light { fill:#fff; }
.tick { stroke:#fff; stroke-width:4; } .dial-hub { fill:var(--teal-d); } .pin { fill:#fff; stroke:var(--navy); stroke-width:3; }
.needle-p { fill:var(--orange); stroke:var(--teal-d); stroke-width:5; }
.layer-h { font:600 12pt 'Fredoka'; color:var(--teal-d); margin:.02in 0; }
.vessel { width:6.4in; }
.v-rim { fill:var(--teal-d); } .v-body { fill:var(--teal-d); } .v-brew { fill:var(--mint); }
.door { fill:var(--teal); } .door-q { font:700 56px 'Fredoka'; fill:#fff; opacity:.85; }
.door-in { fill:#fff; } .door-t { font:700 18px 'Fredoka'; fill:var(--navy); }
.v-label { fill:var(--orange); } .v-label-t { font:700 26px 'Fredoka'; fill:var(--accent-ink); }
.slide-row { display:flex; gap:.4in; align-items:flex-start; }
.slide-left { width:3.5in; display:flex; flex-direction:column; align-items:center; }
.slide-card { width:3.5in; }
.card-bg { fill:var(--teal); } .card-t { font:700 34px 'Fredoka'; fill:#fff; }
.window { fill:#fff; stroke:#9aa5b8; stroke-width:4; stroke-dasharray:12 9; } .window-t { font:600 20px 'Nunito'; fill:#9aa5b8; }
.card-sub { font:600 20px 'Fredoka'; fill:#fff; opacity:.9; }
.sleeves { display:flex; flex-direction:column; gap:.12in; margin-top:.18in; width:3.2in; }
.sleeve { border:2px dashed #9aa5b8; height:.42in; display:flex; align-items:center; justify-content:center; font:600 9pt 'Nunito'; color:#9aa5b8; }
.strip { height:9.05in; }
.frame { fill:var(--mint-l); stroke:#9aa5b8; stroke-width:3; stroke-dasharray:12 9; }
.frame-t { font:700 22px 'Fredoka'; fill:var(--teal-d); }
.egg { fill:#fffaf0; stroke:var(--teal-d); stroke-width:6; } .crack { stroke:var(--teal-d); stroke-width:6; stroke-linejoin:round; }
.pull { fill:var(--orange); } .pull-t { font:700 24px 'Fredoka'; fill:var(--accent-ink); }
.puzzle { width:7.3in; height:7.3in; }
.pz-sky { fill:var(--mint-l); } .pz-sun { fill:var(--gold); } .pz-ground { fill:var(--mint); }
.pz-banner { fill:var(--orange); } .pz-name { font:700 40px 'Fredoka'; fill:var(--accent-ink); }
.pz-cut { stroke:#ffffff; stroke-width:5; } .pz-edge { stroke:var(--teal-d); stroke-width:6; }
`;

// Every emoji the kits draw (toys, shop pieces, signs...), for scripts/vendor-emoji.py.
function toyEmoji() {
  const { KITS } = require('./engine');
  const out = new Set(['🫧']);
  const walk = (v) => {
    if (typeof v === 'string' && v.length <= 8 && /^\p{Extended_Pictographic}/u.test(v)) out.add(v);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  Object.values(KITS).forEach(walk);
  return [...out];
}

module.exports = { toyPages, toyCss, toyEmoji };
