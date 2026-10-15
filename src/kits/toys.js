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
const fill = (s, k) => String(s).replace(/\{place\}/g, k.placeName).replace(/\{childs\}/g, possessive(k.childName)).replace(/\{child\}/g, k.childName);
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
    const ink = i % 6 === 3 || i % 6 === 5 ? ' light' : i % 6 === 2 ? ' on-accent' : '';
    return `<path d="M${x0},${y0} A280,280 0 0 1 ${x1},${y1} L${x2},${y2} A120,120 0 0 0 ${x3},${y3} Z" fill="${shades[i % 6]}" class="zone"/>
      ${em(ex, ey, 46, e)}<text x="${lx}" y="${ly}" class="zone-t${ink}" text-anchor="middle" dominant-baseline="central">${esc(label)}</text>`;
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
  // A doctor's bag with a handle and a gold clasp.
  bag: {
    box: [130, 175, 440, 210],
    art: () => `<path d="M260,118 Q260,40 350,40 Q440,40 440,118" fill="none" stroke="var(--teal-d)" stroke-width="30" stroke-linecap="round"/>
      <rect x="70" y="110" width="560" height="345" rx="46" class="v-body"/><rect x="70" y="110" width="560" height="52" rx="26" class="v-lid"/>
      <rect x="318" y="96" width="64" height="40" rx="8" class="v-gold"/>`,
  },
  // A treasure chest with a curved lid, metal bands and a lock.
  chest: {
    box: [130, 190, 440, 200],
    art: () => `<path d="M70,180 L70,130 Q350,10 630,130 L630,180 Z" class="v-lid"/>
      <rect x="70" y="170" width="560" height="285" rx="14" class="v-body"/>
      <rect x="110" y="40" width="34" height="415" class="v-gold" opacity=".85"/><rect x="556" y="40" width="34" height="415" class="v-gold" opacity=".85"/>
      <circle cx="350" cy="168" r="28" class="v-gold"/><rect x="342" y="160" width="16" height="22" rx="4" fill="var(--teal-d)"/>
      ${em(200, 26, 50, '💎')}${em(500, 26, 50, '🪙')}`,
  },
  // A castle wall between two towers, with a window behind every door.
  castle: {
    box: [150, 190, 400, 200],
    art: () => {
      const crenel = (x0, x1, y) => Array.from({ length: Math.floor((x1 - x0) / 40) }, (_, i) => (i % 2 ? '' : `<rect x="${x0 + i * 40}" y="${y - 30}" width="40" height="32" class="v-body"/>`)).join('');
      return `<rect x="40" y="90" width="130" height="365" class="v-body"/>${crenel(40, 170, 90)}<rect x="530" y="90" width="130" height="365" class="v-body"/>${crenel(530, 660, 90)}
        <rect x="140" y="150" width="420" height="305" class="v-lid"/>${crenel(140, 560, 150)}
        ${em(105, 30, 60, '🚩')}${em(595, 30, 60, '🚩')}`;
    },
  },
  // A toolbox with a handle on top.
  toolbox: {
    box: [140, 190, 420, 200],
    art: () => `<rect x="250" y="70" width="200" height="70" rx="20" fill="none" stroke="var(--teal-d)" stroke-width="26"/>
      <path d="M70,140 L630,140 L605,455 L95,455 Z" class="v-body"/><rect x="70" y="140" width="560" height="44" class="v-lid"/>
      <rect x="160" y="152" width="40" height="20" rx="4" class="v-gold"/><rect x="500" y="152" width="40" height="20" rx="4" class="v-gold"/>`,
  },
  // A woven basket with a big handle.
  basket: {
    box: [140, 205, 420, 185],
    art: () => `<path d="M110,190 Q110,20 350,20 Q590,20 590,190" fill="none" stroke="var(--teal-d)" stroke-width="28"/>
      <path d="M60,175 L640,175 L590,455 L110,455 Z" class="v-body"/>
      ${Array.from({ length: 6 }, (_, i) => `<line x1="80" y1="${215 + i * 42}" x2="620" y2="${215 + i * 42}" stroke="var(--teal)" stroke-width="5" opacity=".5"/>`).join('')}
      <rect x="50" y="160" width="600" height="40" rx="20" class="v-lid"/>
      ${em(150, 150, 56, '🌷')}${em(550, 150, 56, '🌼')}`,
  },
  // A little mailbox house with a heart flag.
  mailbox: {
    box: [140, 205, 420, 185],
    art: () => `<path d="M60,190 L350,40 L640,190 Z" class="v-lid"/>
      <rect x="80" y="180" width="540" height="275" rx="12" class="v-body"/>
      <rect x="628" y="120" width="14" height="190" fill="var(--teal-d)"/><path d="M642,120 L690,120 L690,170 L642,170 Z" fill="var(--orange)"/>
      ${em(350, 125, 70, '💌')}`,
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


// ---------- spinner ----------
// Two discs on one paper fastener: spin the bottom one and a picture shows through the window.
function spinner(T, k) {
  const n = T.items.length;
  const C = 220; const R = 212;
  const seg = 360 / n;
  const shades = ['var(--mint-l)', 'var(--gold)', 'var(--mint)', '#ffffff', 'var(--orange)', 'var(--mint-l)'];
  const base = T.items.map(([e, label], i) => {
    const a0 = 90 + seg / 2 - i * seg; const a1 = a0 - seg; const mid = a0 - seg / 2;
    const [x0, y0] = pt(C, C, R, a0); const [x1, y1] = pt(C, C, R, a1);
    const [ex, ey] = pt(C, C, 140, mid); const [lx, ly] = pt(C, C, 78, mid);
    return `<path d="M${C},${C} L${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1} Z" fill="${shades[i % 6]}" stroke="var(--teal-d)" stroke-width="3"/>
      ${em(ex, ey, 82, e)}<text x="${lx}" y="${ly}" class="spin-t" text-anchor="middle" dominant-baseline="central" transform="rotate(${90 - mid} ${lx} ${ly})">${esc(label)}</text>`;
  }).join('');
  const [wx0, wy0] = pt(C, C, 205, 90 + seg / 2 - 2); const [wx1, wy1] = pt(C, C, 205, 90 - seg / 2 + 2);
  const [wx2, wy2] = pt(C, C, 48, 90 - seg / 2 + 2); const [wx3, wy3] = pt(C, C, 48, 90 + seg / 2 - 2);
  return `<section class="page toy">${head(T, k)}
    <div class="spin-row">
      <div class="spin-col"><div class="layer-h">Top</div>
      <svg class="disc" viewBox="0 0 440 440">
        <circle cx="${C}" cy="${C}" r="${R}" class="disc-top"/><circle cx="${C}" cy="${C}" r="${R - 14}" fill="none" stroke="var(--gold)" stroke-width="5" stroke-dasharray="2 14" stroke-linecap="round"/>
        <path d="M${wx0},${wy0} A205,205 0 0 1 ${wx1},${wy1} L${wx2},${wy2} A48,48 0 0 0 ${wx3},${wy3} Z" class="window"/>
        <text x="${C}" y="${C + 62}" class="disc-name" text-anchor="middle">${esc(fill(T.label, k))}</text>
        <text x="${C}" y="${C + 100}" class="disc-sub" text-anchor="middle">${esc(T.sub)}</text>
        ${em(C - 120, C + 150, 54, T.decor[0])}${em(C, C + 162, 54, T.decor[1])}${em(C + 120, C + 150, 54, T.decor[2])}
        <circle cx="${C}" cy="${C}" r="9" class="pin"/>
      </svg></div>
      <div class="spin-col"><div class="layer-h">Bottom</div>
      <svg class="disc" viewBox="0 0 440 440">${base}<circle cx="${C}" cy="${C}" r="9" class="pin"/></svg></div>
    </div>
    <p class="toy-tip">Cut out both circles and the window in the top one. Push a paper fastener (brad) through both middle dots, top circle on top. Spin it!</p>
    ${T.game ? `<div class="spin-game"><b>${esc(T.game[0])}</b> ${esc(T.game[1])}</div>` : ''}
  </section>`;
}

// ---------- headband ----------
const ORNAMENTS = {
  antlers: () => {
    const antler = (m) => `<g transform="translate(${m ? 700 : 0},0) scale(${m ? -1 : 1},1)" fill="none" stroke="#8a5a2b" stroke-width="30" stroke-linecap="round" stroke-linejoin="round">
      <path d="M250,400 Q240,260 170,170 Q130,110 150,40"/><path d="M215,250 Q140,240 90,170"/><path d="M180,190 Q200,120 250,90"/><path d="M110,190 Q60,170 50,110"/></g>`;
    return `<svg class="orn" viewBox="0 0 700 420">${antler(false)}${antler(true)}${em(350, 330, 110, '🎄')}${em(270, 380, 60, '🔔')}${em(430, 380, 60, '🔔')}</svg>`;
  },
  ears: () => `<svg class="orn" viewBox="0 0 700 420">
      <g transform="rotate(-10 250 400)"><ellipse cx="250" cy="215" rx="95" ry="200" fill="#fff" stroke="var(--teal-d)" stroke-width="8"/><ellipse cx="250" cy="230" rx="52" ry="150" fill="#ffc9d9"/></g>
      <g transform="rotate(10 450 400)"><ellipse cx="450" cy="215" rx="95" ry="200" fill="#fff" stroke="var(--teal-d)" stroke-width="8"/><ellipse cx="450" cy="230" rx="52" ry="150" fill="#ffc9d9"/></g>
      ${em(350, 375, 80, '🌸')}</svg>`,
  shield: (k, T) => `<svg class="orn" viewBox="0 0 700 420">
      <path d="M350,10 L560,60 Q600,230 350,410 Q100,230 140,60 Z" fill="var(--teal)" stroke="var(--gold)" stroke-width="14"/>
      <path d="M350,45 L530,88 Q560,225 350,372 Q140,225 170,88 Z" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="4 10"/>
      <text x="350" y="110" class="shield-t" text-anchor="middle">${esc(T.shieldTop)}</text>
      ${em(350, 205, 120, T.shieldIcon)}
      <text x="350" y="318" class="shield-name" text-anchor="middle">${esc(k.childName.toUpperCase())}</text></svg>`,
  snowcrown: () => {
    const pts = Array.from({ length: 9 }, (_, i) => `${40 + i * 77.5},${i % 2 ? 260 : 60}`).join(' L');
    return `<svg class="orn" viewBox="0 0 700 420"><path d="M40,400 L${pts} L660,400 Z" fill="#e8f3ff" stroke="var(--teal-d)" stroke-width="8" stroke-linejoin="round"/>
      ${[0, 2, 4, 6, 8].map((i) => em(40 + i * 77.5, 110, 64, '❄️')).join('')}${em(350, 330, 90, '💎')}</svg>`;
  },
  shells: () => `<svg class="orn" viewBox="0 0 700 420"><path d="M40,400 Q350,250 660,400 Z" fill="var(--mint)" stroke="var(--teal-d)" stroke-width="6"/>
      ${em(160, 300, 110, '🐚')}${em(540, 300, 110, '🐚')}${em(350, 170, 190, '🐚')}${em(255, 250, 70, '⭐')}${em(445, 250, 70, '⭐')}</svg>`,
  hardhat: (k) => `<svg class="orn" viewBox="0 0 700 420"><path d="M100,330 Q100,60 350,60 Q600,60 600,330 Z" fill="var(--gold)" stroke="var(--teal-d)" stroke-width="10"/>
      <rect x="320" y="60" width="60" height="270" fill="#f0c23a" opacity=".9"/><rect x="40" y="320" width="620" height="60" rx="30" fill="var(--orange)" stroke="var(--teal-d)" stroke-width="8"/>
      <text x="350" y="364" class="shield-name dark" text-anchor="middle">${esc(k.childName.toUpperCase())}</text>${em(210, 210, 90, '🚧')}${em(490, 210, 90, '🔨')}</svg>`,
};

function headband(T, k) {
  const band = (first) => `<svg class="band" viewBox="0 0 760 140">
    <rect x="${first ? 0 : 40}" y="0" width="${first ? 760 : 720}" height="140" rx="16" class="band-p"/>
    ${first ? '' : '<rect x="0" y="0" width="40" height="140" class="tab"/><text x="20" y="70" text-anchor="middle" class="tab-t" transform="rotate(-90 20 70)">TAPE</text>'}
    ${(first ? [110, 650] : [150, 300, 460, 610]).map((x, i) => em(x, 70, 70, T.bandIcons[i % T.bandIcons.length])).join('')}
    ${first ? `<text x="380" y="80" class="band-t" text-anchor="middle" dominant-baseline="central">${esc(k.childName)}</text>` : ''}</svg>`;
  return `<section class="page toy">${head(T, k)}
    ${ORNAMENTS[T.ornament](k, T)}
    <div class="cut-h wide"></div>
    ${band(true)}${band(false)}
    <p class="toy-tip">Cut out the ${esc(T.piece)} and both strips. Tape the strips into a ring that fits the head, then glue the ${esc(T.piece)} to the front.</p>
  </section>`;
}

// ---------- spyglass ----------
function spyglass(T, k) {
  const rings = [30, 363, 696].map((x) => `<rect x="${x}" y="0" width="34" height="400" class="v-gold"/>`).join('');
  return `<section class="page toy">${head(T, k)}
    <svg class="tube" viewBox="0 0 760 400">
      <rect width="760" height="400" rx="12" class="tube-p"/>${rings}
      ${em(200, 120, 100, T.decor[0])}${em(530, 280, 100, T.decor[1])}${em(630, 90, 60, T.decor[2])}
      <text x="200" y="290" class="tube-t" text-anchor="middle">${esc(fill(T.label, k))}</text>
      <text x="530" y="120" class="tube-sub" text-anchor="middle">${esc(T.sub)}</text>
    </svg>
    <p class="toy-tip">Cut out the rectangle, roll it into a tube with the picture outside and tape it closed.</p>
    <div class="spot"><div class="spot-h">${esc(T.spotTitle)}</div>
      <div class="spot-grid">${T.spot.map(([e, n]) => `<div><svg viewBox="0 0 100 100" class="spot-pic">${em(50, 50, 84, e)}</svg><span>${esc(n)}</span><i class="box"></i></div>`).join('')}</div></div>
  </section>`;
}

const { SHOP_TOYS } = require('./shopkit');
const TYPES = { steering, gauges, flaps, slider, puzzle, spinner, headband, spyglass, ...SHOP_TOYS };

function toyPages(k) {
  return k.def.toys.map((t) => {
    if (!TYPES[t.type]) throw new Error(`Unknown toy type "${t.type}"`);
    return TYPES[t.type](t, k);
  }).join('');
}

const toyCss = `
.v-lid { fill:var(--teal); } .v-gold { fill:var(--gold); }
.spin-row { display:flex; gap:.3in; } .spin-col { display:flex; flex-direction:column; align-items:center; }
.disc { width:3.55in; height:3.55in; }
.disc-top { fill:var(--teal); stroke:var(--teal-d); stroke-width:6; }
.spin-t { font:700 17px 'Fredoka'; fill:var(--navy); }
.disc-name { font:400 34px 'Pacifico', 'Fredoka'; fill:#fff; } .disc-sub { font:600 19px 'Fredoka'; fill:#fff; opacity:.9; }
.spin-game { margin-top:.25in; background:var(--mint-l); border:3px solid var(--mint); border-radius:18px; padding:.18in .3in; font:500 13pt/1.4 'Nunito'; max-width:6.6in; }
.spin-game b { font-family:'Fredoka'; color:var(--teal-d); }
.orn { width:6.4in; height:3.85in; }
.cut-h.wide { align-self:stretch; margin:.12in -.4in; }
.band { width:7.4in; margin-top:.15in; } .band-p { fill:var(--teal); stroke:var(--teal-d); stroke-width:4; }
.band-t { font:400 54px 'Pacifico', 'Fredoka'; fill:#fff; }
.shield-t { font:700 34px 'Fredoka'; fill:#fff; letter-spacing:4px; } .shield-name { font:700 44px 'Fredoka'; fill:#fff; letter-spacing:3px; } .shield-name.dark { fill:var(--accent-ink); }
.tube { width:7.4in; } .tube-p { fill:var(--teal); stroke:var(--teal-d); stroke-width:6; }
.tube-t { font:400 40px 'Pacifico', 'Fredoka'; fill:#fff; } .tube-sub { font:700 24px 'Fredoka'; fill:#fff; letter-spacing:3px; }
.spot { width:100%; margin-top:.25in; border:4px solid var(--teal); border-radius:22px; padding:.18in .25in; }
.spot-h { font:400 26pt 'Pacifico', 'Fredoka'; color:var(--orange); text-align:center; }
.spot-grid { display:grid; grid-template-columns:repeat(4, 1fr); gap:.12in .2in; margin-top:.08in; }
.spot-grid > div { display:flex; flex-direction:column; align-items:center; gap:3px; font:600 11pt 'Fredoka'; text-align:center; }
.spot-pic { width:.8in; height:.8in; }

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
.zone-t { font:700 18px 'Fredoka'; fill:var(--navy); } .zone-t.light { fill:#fff; } .zone-t.on-accent { fill:var(--accent-ink); }
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
