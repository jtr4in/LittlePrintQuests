// Pieces for the shop-style play kits (grocery store, post office, burger and pizza shops):
// things a pretend shop needs that the theme kits don't, like a cash register, play food,
// shelf labels, a build-a-burger set and a mail counter.
//
// Toys (def.toys, next to the ones in toys.js):
//   register  a flat cash register with a keypad and cash drawer, plus play bank cards
//   burger    big burger layers to stack, plus order cards to build from
//   pizza     a big pizza base and a sheet of toppings, plus order cards to build from
//   teeth     a big wipe-clean smile to brush, plus a cut-out toothbrush
// Props (def.props, next to the ones in engine.js):
//   food      big play food with price tags, 9 to a page
//   labels    fold-in-half tent labels for shelves and bins, 6 to a page
//   recipe    a "How to make..." sign with picture steps
//   coupons   cut-out coupons, 8 to a page
//   stamps    a sheet of postage stamps with perforated edges
//   postcards four postcards to write and mail
//   letters   two letter sheets to write on

const { em, pic } = require('./art');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const possessive = (name) => (/s$/i.test(name) ? `${name}’` : `${name}’s`);
const fill = (s, k) => String(s).replace(/\{place\}/g, k.placeName).replace(/\{childs\}/g, possessive(k.childName)).replace(/\{child\}/g, k.childName);
const coins = (k, n) => `${n} ${n === 1 ? k.def.menu.coinWord : `${k.def.menu.coinWord}s`}`;
const toyHead = (T, k) => `<h2 class="pg-title">${esc(fill(T.title, k))}</h2><p class="pg-sub">${esc(fill(T.howTo, k))}</p><div class="cardstock">Best on cardstock</div>`;
const propHead = (P, k) => `<h2 class="pg-title">${esc(fill(P.title, k))}</h2><p class="pg-sub">${esc(fill(P.howTo, k))}</p>`;
const chunk = (list, n) => Array.from({ length: Math.ceil(list.length / n) }, (_, i) => list.slice(i * n, i * n + n));

// ---------- cash register ----------

function register(T, k) {
  const M = k.def.menu;
  const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', 'C', '0', '+'];
  const keypad = keys.map((n, i) => {
    const x = 90 + (i % 3) * 100; const y = 250 + Math.floor(i / 3) * 78;
    return `<rect x="${x}" y="${y}" width="84" height="64" rx="14" class="rg-key${/\d/.test(n) ? '' : ' alt'}"/><text x="${x + 42}" y="${y + 44}" text-anchor="middle" class="rg-key-t">${n}</text>`;
  }).join('');
  const big = (T.buttons || [['🧾', 'Receipt'], ['💳', 'Card'], ['🛍️', 'Bag']]).slice(0, 3).map(([e, label], i) => {
    const y = 250 + i * 104;
    return `<rect x="420" y="${y}" width="250" height="88" rx="18" class="rg-big"/>${em(468, y + 44, 56, e)}<text x="510" y="${y + 54}" class="rg-big-t">${esc(label)}</text>`;
  }).join('');
  const drawer = [1, 2, 5, 10].map((v, i) => {
    const x = 70 + i * 160;
    return `<rect x="${x}" y="612" width="140" height="96" rx="10" class="rg-slot"/>${em(x + 44, 660, 46, M.coinIcon)}<text x="${x + 96}" y="676" text-anchor="middle" class="rg-slot-t">${v}</text>`;
  }).join('');
  const card = (label, sub, i) => `<div class="pay-card${i === 1 ? ' alt' : ''}">
    <div class="pc-top"><span>${esc(label)}</span>${pic(M.coinIcon, '.36in')}</div>
    <div class="pc-chip"></div>
    <div class="pc-num">${['1234 5678 9012', '2468 1357 8642', '1111 2222 3333'][i]}</div>
    <div class="pc-name">${esc(sub)}</div>
  </div>`;
  return `<section class="page toy">${toyHead(T, k)}
    <svg class="register" viewBox="0 0 760 740">
      <path d="M40,190 L720,190 L740,560 L20,560 Z" class="rg-body"/>
      <rect x="20" y="560" width="720" height="170" rx="18" class="rg-drawer"/>
      <rect x="300" y="575" width="160" height="24" rx="12" class="rg-handle"/>
      ${drawer}
      <rect x="150" y="20" width="460" height="150" rx="22" class="rg-screen-frame"/>
      <rect x="172" y="40" width="416" height="110" rx="12" class="rg-screen"/>
      <text x="190" y="78" class="rg-screen-s">${esc(k.placeName.toUpperCase())}</text>
      <text x="190" y="132" class="rg-screen-t">${esc(T.screenWord || 'TOTAL')}</text>
      <text x="570" y="132" text-anchor="end" class="rg-screen-t">0 ${esc(M.coinWord.toUpperCase())}S</text>
      <rect x="350" y="170" width="60" height="22" class="rg-neck"/>
      ${keypad}${big}
    </svg>
    <div class="cut-h wide"></div>
    <div class="pay-cards">${card(k.placeName, k.childName, 0)}${card(T.giftCard || 'Gift card', T.giftLine || 'Happy shopping!', 1)}${card(k.placeName, '', 2)}</div>
    <p class="toy-tip">Glue the register onto a cereal box. Tap the keys to ring things up, and pay with play money or a card.</p>
  </section>`;
}

// ---------- burger ----------

// Each layer is drawn 600 wide, centered on x = 0, from y = 0 down to its height.
const LAYERS = {
  bunTop: { h: 150, label: 'Top bun', draw: () => `<path d="M-300,150 C-300,20 -160,0 0,0 C160,0 300,20 300,150 Z" class="bg-bun"/>${[[-150, 60], [-60, 40], [40, 55], [140, 70], [-210, 100], [210, 105], [-20, 95], [90, 105]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="12" ry="6" class="bg-seed"/>`).join('')}` },
  lettuce: { h: 70, label: 'Lettuce', draw: () => `<path d="M-300,25 ${Array.from({ length: 12 }, (_, i) => `Q${-275 + i * 50},${i % 2 ? -10 : 60} ${-250 + i * 50},25`).join(' ')} L300,45 ${Array.from({ length: 12 }, (_, i) => `Q${275 - i * 50},${i % 2 ? 80 : 40} ${250 - i * 50},55`).join(' ')} Z" class="bg-lettuce"/>` },
  tomato: { h: 60, label: 'Tomato', draw: () => [-150, 150].map((x) => `<ellipse cx="${x}" cy="30" rx="145" ry="28" class="bg-tomato"/><ellipse cx="${x}" cy="30" rx="105" ry="16" class="bg-tomato-in"/>`).join('') },
  cheese: { h: 70, label: 'Cheese', draw: () => `<path d="M-290,0 L290,0 L290,20 Q250,20 240,60 Q230,20 140,20 Q120,20 110,50 Q100,20 -60,20 Q-80,20 -90,66 Q-100,20 -210,20 Q-230,20 -240,48 Q-250,20 -290,20 Z" class="bg-cheese"/>` },
  patty: { h: 90, label: 'Burger', draw: () => `<rect x="-295" y="0" width="590" height="90" rx="40" class="bg-patty"/>${[[-200, 30], [-90, 55], [30, 28], [150, 52], [240, 35]].map(([x, y]) => `<path d="M${x - 22},${y} l44,10" class="bg-grill"/>`).join('')}` },
  onion: { h: 50, label: 'Onion', draw: () => [-200, -70, 60, 190].map((x) => `<ellipse cx="${x}" cy="25" rx="70" ry="22" class="bg-onion"/>`).join('') },
  pickles: { h: 54, label: 'Pickles', draw: () => [-210, -70, 70, 210].map((x) => `<circle cx="${x}" cy="27" r="27" class="bg-pickle"/><circle cx="${x}" cy="27" r="16" class="bg-pickle-in"/>`).join('') },
  bunBottom: { h: 80, label: 'Bottom bun', draw: () => `<path d="M-300,0 L300,0 L300,30 C300,70 260,80 200,80 L-200,80 C-260,80 -300,70 -300,30 Z" class="bg-bun"/>` },
};

function burgerLayersPage(T, k) {
  const list = T.layers.map((key) => LAYERS[key]);
  let y = 10;
  const parts = list.map((L) => {
    const out = `<g transform="translate(320 ${y})">${L.draw()}<text x="330" y="${L.h / 2 + 10}" class="bg-label">${esc(L.label)}</text></g>`;
    y += L.h + 34;
    return out;
  }).join('');
  return `<section class="page toy">${toyHead(T, k)}
    <svg class="burger" viewBox="0 0 900 ${y}">${parts}</svg>
    <p class="toy-tip">Cut out each layer, then stack them to make the burger on the order card.</p>
  </section>`;
}

function miniBurger(keys) {
  let y = 0;
  const g = keys.map((key) => {
    const L = LAYERS[key];
    const out = `<g transform="translate(0 ${y})">${L.draw()}</g>`;
    y += L.h - 8;
    return out;
  }).join('');
  return `<svg class="ord-pic" viewBox="-320 -10 640 ${y + 30}">${g}</svg>`;
}

// ---------- pizza ----------

function pizzaBasePage(T, k) {
  const cuts = Array.from({ length: 4 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    return `<line x1="${(-330 * Math.cos(a)).toFixed(1)}" y1="${(-330 * Math.sin(a)).toFixed(1)}" x2="${(330 * Math.cos(a)).toFixed(1)}" y2="${(330 * Math.sin(a)).toFixed(1)}" class="pz-slice"/>`;
  }).join('');
  const melt = [[-150, -120, 70], [120, -160, 60], [180, 90, 75], [-90, 160, 66], [-220, 40, 50], [30, 20, 80], [60, 230, 50], [230, -60, 45]]
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" class="pz-cheese"/>`).join('');
  return `<section class="page toy">${toyHead(T, k)}
    <svg class="pizza" viewBox="-400 -400 800 800">
      <circle r="385" class="pz-crust"/><circle r="330" class="pz-sauce"/>${melt}${cuts}
      <circle r="385" class="cut-dash" fill="none"/>
    </svg>
    <p class="toy-tip">Cut out the pizza. Add toppings from the next page, then cut along the slice lines to share it.</p>
  </section>`;
}

const topping = (e, size) => (e === 'pepperoni'
  ? `<svg class="pic" style="width:${size};height:${size}" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#c0392b"/><circle cx="34" cy="38" r="7" fill="#e7a091"/><circle cx="62" cy="30" r="5" fill="#e7a091"/><circle cx="60" cy="64" r="8" fill="#e7a091"/><circle cx="32" cy="66" r="5" fill="#e7a091"/></svg>`
  : pic(e, size));

function pizzaToppingsPage(T, k) {
  const rows = T.toppings.map(([e, name]) => `<div class="tp-row"><b>${esc(name)}</b><div class="tp-pieces">${Array.from({ length: 7 }, () => `<span>${topping(e, '.7in')}</span>`).join('')}</div></div>`).join('');
  return `<section class="page toy"><h2 class="pg-title">Pizza Toppings</h2><p class="pg-sub">Cut out the toppings and keep each kind in its own cup, like a real pizza shop.</p>
    <div class="tp-rows">${rows}</div>
  </section>`;
}

function miniPizza(T, names) {
  const spots = [[-38, -30], [30, -40], [42, 18], [-20, 34], [-44, 8], [10, 0], [20, 44], [-10, -50]];
  const byName = Object.fromEntries(T.toppings.map(([e, n]) => [n, e]));
  const list = names.flatMap((n) => [n, n, n]).slice(0, 8);
  const pieces = list.map((n, i) => {
    const e = byName[n];
    const [x, y] = spots[i];
    return e === 'pepperoni' ? `<circle cx="${x}" cy="${y}" r="14" fill="#c0392b"/>` : em(x, y, 34, e);
  }).join('');
  return `<svg class="ord-pic" viewBox="-80 -80 160 160"><circle r="76" class="pz-crust"/><circle r="64" class="pz-sauce"/><circle r="50" class="pz-cheese"/>${pieces}</svg>`;
}

// ---------- order cards (burger and pizza) ----------

function orderCardsPage(T, k, draw) {
  const cards = T.orders.slice(0, 6).map(([name, parts]) => `<div class="ord">
    <div class="ord-head">${pic(k.def.menu.icon, '.4in')}<div><small>${esc(k.placeName)}</small><b>${esc(name)}</b></div></div>
    ${draw(parts)}
    <div class="ord-foot">Order for <i></i></div>
  </div>`).join('');
  return `<section class="page props"><h2 class="pg-title">${esc(T.ordersTitle || 'Order Cards')}</h2><p class="pg-sub">${esc(T.ordersHowTo || 'A customer picks a card, and the cook makes it to match. Can you make it just right?')}</p>
    <div class="ord-grid">${cards}</div></section>`;
}

const burger = (T, k) => burgerLayersPage(T, k) + orderCardsPage(T, k, miniBurger);
const pizza = (T, k) => pizzaBasePage(T, k) + pizzaToppingsPage(T, k) + orderCardsPage(T, k, (names) => miniPizza(T, names));

// ---------- props ----------

function foodPages(k) {
  const P = k.def.props.food;
  const M = k.def.menu;
  return chunk(P.items, 9).map((items, i) => `<section class="page props">${i ? `<h2 class="pg-title">${esc(fill(P.title, k))} <small>(more)</small></h2><p class="pg-sub">&nbsp;</p>` : propHead(P, k)}
    <div class="food-grid">${items.map(([e, n, c]) => `<div class="food">${pic(e, '1.25in')}<span>${esc(n)}</span><small>${esc(coins(k, c))} ${pic(M.coinIcon, '.22in')}</small></div>`).join('')}</div>
  </section>`).join('');
}

function labelsPages(k) {
  const P = k.def.props.labels;
  const half = ([e, w]) => `<div class="tent-half">${pic(e, '.85in')}<b>${esc(w)}</b></div>`;
  return chunk(P.items, 6).map((items, i) => `<section class="page props">${i ? '' : propHead(P, k)}
    <div class="tent-grid${i ? ' full' : ''}">${items.map((it) => `<div class="tent"><div class="flip">${half(it)}</div><div class="fold"></div>${half(it)}</div>`).join('')}</div>
  </section>`).join('');
}

function recipePage(k) {
  const P = k.def.props.recipe;
  return `<section class="page shop-page recipe">
    <h1 class="script center">${esc(fill(P.title, k))}</h1>
    <ol class="steps">${P.steps.map(([e, t], i) => `<li><span class="num">${i + 1}</span>${pic(e, P.steps.length > 6 ? '.75in' : '.95in')}<span class="st">${esc(fill(t, k))}</span></li>`).join('')}</ol>
    ${P.tip ? `<p class="board-tip">${esc(fill(P.tip, k))}</p>` : ''}
  </section>`;
}

function couponsPage(k) {
  const P = k.def.props.coupons;
  return `<section class="page props">${propHead(P, k)}
    <div class="coupon-grid">${P.items.slice(0, 8).map(([e, what, deal]) => `<div class="coupon">${pic(e, '.95in')}<div><small>${esc(k.placeName)}</small><b>${esc(deal)}</b><span>${esc(what)}</span></div></div>`).join('')}</div>
  </section>`;
}

function stampsPage(k) {
  const P = k.def.props.stamps;
  const list = Array.from({ length: 20 }, (_, i) => P.items[i % P.items.length]);
  return `<section class="page props">${propHead(P, k)}
    <div class="stamp-grid">${list.map(([e, v], i) => `<div class="stamp s${i % 4}"><div class="stamp-in">${pic(e, '.8in')}<b>${esc(v)}</b><small>${esc(P.country || 'Play Post')}</small></div></div>`).join('')}</div>
  </section>`;
}

function postcardsPage(k) {
  const P = k.def.props.postcards;
  return `<section class="page props">${propHead(P, k)}
    <div class="pcards">${P.items.slice(0, 4).map(([e, greet]) => `<div class="pcard">
      <div class="pc-front">${pic(e, '1.15in')}<b class="script">${esc(fill(greet, k))}</b></div>
      <div class="pc-back"><div class="pc-stamp">Stamp</div><i></i><i></i><i></i><small>To</small></div>
    </div>`).join('')}</div>
  </section>`;
}

function lettersPage(k) {
  const P = k.def.props.letters;
  const sheet = () => `<div class="letter">
    <div class="lt-head">${pic(P.icon || k.def.icon, '.55in')}<b class="script">${esc(fill(P.heading || 'A letter from {place}', k))}</b></div>
    <div class="lt-line"><span>Dear</span><i></i></div>
    ${Array.from({ length: 5 }, () => '<div class="lt-line"><i></i></div>').join('')}
    <div class="lt-line sign"><span>Love,</span><i></i></div>
  </div>`;
  return `<section class="page props">${propHead(P, k)}${sheet()}<div class="cut-h"></div>${sheet()}</section>`;
}

// ---------- play kitchen sign ----------
// A long shop sign for the back of a play kitchen or a shelf: two halves on one page that
// tape together into a 15 inch banner. Shop kits only (kits with no matching hunt).

function kitchenSignPage(k) {
  const d = k.def;
  const trio = (d.shop && d.shop.hero) || [d.menu.items[0][0], d.icon, d.menu.items[1][0]];
  const W = 1520; const H = 430;
  const stripes = 24; const sw = W / stripes;
  const awn = Array.from({ length: stripes }, (_, i) => `<path d="M${i * sw},0 L${(i + 1) * sw},0 L${(i + 1) * sw},56 A${sw / 2},${sw / 2.4} 0 0 1 ${i * sw},56 Z" fill="${i % 2 ? '#fff' : 'var(--teal-d)'}" stroke="var(--teal-d)" stroke-width="2"/>`).join('');
  const art = `<rect x="0" y="0" width="${W}" height="${H}" rx="28" fill="var(--teal)"/>${awn}
    <rect x="22" y="92" width="${W - 44}" height="${H - 114}" rx="22" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="2 14" stroke-linecap="round"/>
    ${em(150, 255, 190, trio[0])}${em(W - 150, 255, 190, trio[2])}
    <text x="${W / 2}" y="268" text-anchor="middle" class="ks-name" style="font-size:${Math.min(120, Math.round(1700 / k.placeName.length))}px">${esc(k.placeName)}</text>
    <text x="${W / 2}" y="345" text-anchor="middle" class="ks-sub">${esc(d.tagline)}</text>`;
  const half = (x) => `<svg class="ks-half" viewBox="${x} 0 ${W / 2} ${H}">${art}</svg>`;
  return `<section class="page props kitchen-sign"><h2 class="pg-title">Play Kitchen Sign</h2>
    <p class="pg-sub">Cut out both halves and tape them together into one long sign for the back of a play kitchen, a shelf or a doorway.</p>
    <div class="ks-label">Left half</div>${half(0)}<div class="cut-h"></div><div class="ks-label">Right half: tape the left edge behind the left half</div>${half(W / 2)}
  </section>`;
}


// ---------- wipe-clean teeth ----------

// A big open smile with 16 teeth to brush, and a cut-out toothbrush. In a sheet protector,
// a grown-up draws sugar bugs on the teeth with a dry-erase marker and the dentist brushes them away.
function teeth(T, k) {
  const tooth = (cx, cy, ang, w, h, molar) => `<g transform="translate(${cx.toFixed(1)},${cy.toFixed(1)}) rotate(${ang.toFixed(1)})">
      <path d="M${-w / 2},${-h / 2} Q${-w / 2},${-h / 2 - 8} ${-w / 4},${-h / 2 - 6} Q0,${-h / 2 + 4} ${w / 4},${-h / 2 - 6} Q${w / 2},${-h / 2 - 8} ${w / 2},${-h / 2}
        L${w / 2 - 4},${h / 2 - 10} Q${w / 2 - 6},${h / 2} ${w / 2 - 18},${h / 2} L${-w / 2 + 18},${h / 2} Q${-w / 2 + 6},${h / 2} ${-w / 2 + 4},${h / 2 - 10} Z"
        fill="#fff" stroke="#9aa3b8" stroke-width="4" stroke-linejoin="round"/>
      ${molar ? `<path d="M${-w / 4},${-h / 2 + 14} q${w / 4},10 ${w / 2},0" fill="none" stroke="#d5dae6" stroke-width="4" stroke-linecap="round"/>` : ''}
    </g>`;
  const arch = (cy, ry, from, to, flip) => Array.from({ length: 8 }, (_, i) => {
    const a = (from + ((to - from) * (i + 0.5)) / 8) * Math.PI / 180;
    const x = 380 + 255 * Math.cos(a); const y = cy + ry * Math.sin(a);
    const edge = i === 0 || i === 7 || i === 1 || i === 6;
    const ang = (Math.atan2(ry * Math.cos(a), -255 * Math.sin(a)) * 180) / Math.PI + (flip ? 180 : 0);
    return tooth(x, y, ang, edge ? 60 : 56, edge ? 66 : 84, edge);
  }).join('');
  // the gums: a thick pink band along each arch, under the teeth
  const gum = (cy, ry, from, to) => {
    const pt = (d) => [380 + 255 * Math.cos((d * Math.PI) / 180), cy + ry * Math.sin((d * Math.PI) / 180)].map((v) => v.toFixed(1)).join(',');
    return `<path d="M${pt(from)} A255,${ry} 0 0 ${to > from ? 1 : 0} ${pt(to)}" fill="none" stroke="#f4a3b2" stroke-width="64" stroke-linecap="round"/>`;
  };
  const brush = `<g transform="translate(70,0)">
      <rect x="0" y="40" width="430" height="46" rx="23" fill="var(--teal)" stroke="var(--teal-d)" stroke-width="4"/>
      <text x="215" y="72" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="26" fill="#fff">${esc(fill(T.brushLabel || 'Dr. {child}', k))}</text>
      <rect x="430" y="48" width="70" height="30" rx="10" fill="var(--teal-d)"/>
      <rect x="500" y="34" width="120" height="58" rx="12" fill="#fff" stroke="var(--teal-d)" stroke-width="4"/>
      ${Array.from({ length: 9 }, (_, i) => `<rect x="${506 + i * 12.5}" y="2" width="9" height="36" rx="4" fill="${i % 2 ? '#8fd3ff' : '#ffffff'}" stroke="#7d86a3" stroke-width="2"/>`).join('')}
    </g>`;
  return `<section class="page toy">${toyHead(T, k)}
    <svg viewBox="0 0 760 640" style="width:100%;display:block;margin-top:.15in">
      <path d="M40,320 Q40,40 380,40 Q720,40 720,320 Q720,610 380,610 Q40,610 40,320 Z" fill="#e85d75" stroke="#b83a52" stroke-width="8"/>
      <path d="M95,320 Q95,95 380,95 Q665,95 665,320 Q665,555 380,555 Q95,555 95,320 Z" fill="#7a2335"/>
      <ellipse cx="380" cy="430" rx="190" ry="95" fill="#f28a9b"/>
      <path d="M380,360 L380,470" stroke="#d96479" stroke-width="6" stroke-linecap="round"/>
      ${gum(330, 200, 198, 342)}${gum(320, 200, 18, 162)}
      ${arch(330, 185, 200, 340, false)}
      ${arch(320, 185, 20, 160, true)}
    </svg>
    <div class="cut-h" style="margin:.15in -.45in .1in"></div>
    <svg viewBox="0 0 760 100" style="width:88%;display:block;margin:0 auto">${brush}</svg>
    <p class="toy-tip">${esc(fill(T.tip || 'Grown-ups: draw sugar bugs on the teeth with a dry-erase marker. Dentist: wrap a tissue round the toothbrush and brush them all away!', k))}</p>
  </section>`;
}

const SHOP_TOYS = { register, burger, pizza, teeth };
const SHOP_PROPS = [['food', foodPages], ['labels', labelsPages], ['recipe', recipePage], ['coupons', couponsPage], ['stamps', stampsPage], ['postcards', postcardsPage], ['letters', lettersPage]];

const shopkitCss = `
.kitchen-sign .ks-half { width:100%; display:block; }
.ks-label { font:600 10pt 'Fredoka'; color:#66708f; margin:.06in 0; }
.ks-name { font:400 120px 'Pacifico', 'Fredoka'; fill:#fff; } .ks-sub { font:700 38px 'Fredoka'; fill:var(--mint-l); letter-spacing:2px; }
.register { width:7.2in; }
.rg-body { fill:var(--teal); } .rg-drawer { fill:var(--teal-d); } .rg-handle { fill:var(--gold); } .rg-neck { fill:var(--teal-d); }
.rg-slot { fill:#fff; } .rg-slot-t { font:700 34px 'Fredoka'; fill:var(--navy); }
.rg-screen-frame { fill:var(--teal-d); } .rg-screen { fill:#e8fbe9; }
.rg-screen-s { font:700 22px 'Fredoka'; fill:#2f6b3a; letter-spacing:2px; } .rg-screen-t { font:700 38px 'Fredoka'; fill:#2f6b3a; letter-spacing:3px; }
.rg-key { fill:#fff; } .rg-key.alt { fill:var(--orange); } .rg-key-t { font:700 34px 'Fredoka'; fill:var(--navy); }
.rg-big { fill:var(--mint-l); } .rg-big-t { font:700 30px 'Fredoka'; fill:var(--teal-d); }
.pay-cards { display:flex; gap:.18in; margin-top:.05in; }
.pay-card { width:2.35in; height:1.5in; border-radius:.14in; background:linear-gradient(135deg, var(--teal), var(--teal-d)); color:#fff; padding:.1in .14in; display:flex; flex-direction:column; outline:2px dashed #b7c0cc; outline-offset:.06in; }
.pay-card.alt { background:linear-gradient(135deg, var(--orange), #e0a83a); color:var(--accent-ink); }
.pc-top { display:flex; justify-content:space-between; align-items:center; font:700 9.5pt 'Fredoka'; }
.pc-chip { width:.42in; height:.3in; border-radius:5px; background:var(--gold); margin:.08in 0 .06in; }
.pc-num { font:700 12pt 'Fredoka'; letter-spacing:.06em; } .pc-name { margin-top:auto; font:600 11pt 'Fredoka'; text-transform:uppercase; letter-spacing:.06em; min-height:1em; }
.burger { width:7.6in; flex:1; min-height:0; }
.bg-bun { fill:#e9a54b; stroke:#b9762a; stroke-width:5; } .bg-seed { fill:#fff6dc; }
.bg-lettuce { fill:#7cc95a; stroke:#4f9a35; stroke-width:5; } .bg-tomato { fill:#e2483d; stroke:#b2312a; stroke-width:5; } .bg-tomato-in { fill:#f07a6c; }
.bg-cheese { fill:#ffd23f; stroke:#e0a800; stroke-width:5; } .bg-patty { fill:#7a4a2a; stroke:#5a3218; stroke-width:5; } .bg-grill { stroke:#4a2812; stroke-width:9; stroke-linecap:round; }
.bg-onion { fill:#fff; stroke:#c9a3d6; stroke-width:9; } .bg-pickle { fill:#6b9a3a; stroke:#4c7426; stroke-width:4; } .bg-pickle-in { fill:#a6c96a; }
.bg-label { font:700 30px 'Fredoka'; fill:var(--navy); }
.pizza { width:7.2in; height:7.2in; }
.pz-crust { fill:#e9b56b; stroke:#b9823a; stroke-width:6; } .pz-sauce { fill:#d9442f; } .pz-cheese { fill:#ffe08a; opacity:.92; }
.pz-slice { stroke:#fff; stroke-width:5; stroke-dasharray:14 10; }
.tp-rows { width:100%; display:flex; flex-direction:column; gap:.14in; }
.tp-row b { font:700 14pt 'Fredoka'; color:var(--teal-d); }
.tp-pieces { display:flex; justify-content:space-between; margin-top:.04in; }
.tp-pieces span { width:.95in; height:.95in; border:2px dashed #b7c0cc; border-radius:50%; display:grid; place-items:center; }
.ord-grid { flex:1; display:grid; grid-template-columns:1fr 1fr; grid-template-rows:repeat(3, 1fr); gap:.16in; }
.ord { border:2px dashed #b7c0cc; border-radius:.16in; background:var(--mint-l); padding:.12in .16in; display:flex; flex-direction:column; align-items:center; }
.ord-head { display:flex; gap:.1in; align-items:center; align-self:stretch; }
.ord-head small { display:block; font:600 8.5pt 'Fredoka'; letter-spacing:.06em; text-transform:uppercase; color:var(--teal); }
.ord-head b { font:700 15pt/1.1 'Fredoka'; }
.ord-pic { height:1.75in; width:100%; margin:.06in 0; }
.ord-foot { align-self:stretch; display:flex; gap:6px; font:600 10.5pt 'Fredoka'; } .ord-foot i { flex:1; border-bottom:1.5px solid var(--navy); }
.food-grid { flex:1; display:grid; grid-template-columns:repeat(3, 1fr); grid-template-rows:repeat(3, 1fr); gap:.14in; }
.food { border:2px dashed #b7c0cc; border-radius:.2in; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.05in; text-align:center; background:#fff; }
.food span { font:700 13.5pt/1.1 'Fredoka'; } .food small { font:700 10pt 'Fredoka'; color:var(--accent-ink); background:var(--orange); border-radius:99px; padding:2px 10px; display:flex; align-items:center; gap:4px; }
.tent-grid { flex:1; display:grid; grid-template-columns:1fr 1fr; grid-template-rows:repeat(3, 1fr); gap:.16in; }
.tent { border:2px dashed #b7c0cc; border-radius:.1in; display:flex; flex-direction:column; overflow:hidden; }
.tent-half { flex:1; display:flex; align-items:center; justify-content:center; gap:.12in; background:var(--mint-l); }
.tent-half b { font:700 19pt 'Fredoka'; color:var(--teal-d); }
.flip { flex:1; display:flex; transform:rotate(180deg); } .flip .tent-half { background:var(--mint); }
.fold { border-top:2px dotted #9aa5b8; }
.recipe { padding:.6in .55in; display:flex; flex-direction:column; }
.recipe h1 { font-size:38pt; text-align:center; }
.steps { list-style:none; padding:0; margin:.25in 0 0; display:flex; flex-direction:column; justify-content:space-evenly; gap:.12in; flex:1; }
.steps li { display:flex; align-items:center; gap:.2in; background:#fff; border:3px solid var(--mint); border-radius:.22in; padding:.08in .22in; }
.num { width:.6in; height:.6in; border-radius:50%; background:var(--teal); color:#fff; display:grid; place-items:center; font:700 22pt 'Fredoka'; flex:none; }
.st { font:600 17pt/1.25 'Fredoka'; }
.coupon-grid { flex:1; display:grid; grid-template-columns:1fr 1fr; grid-template-rows:repeat(4, 1fr); gap:.16in; }
.coupon { border:3px dashed var(--teal); border-radius:.12in; background:var(--mint-l); display:flex; align-items:center; gap:.14in; padding:.1in .18in; }
.coupon small { display:block; font:600 8.5pt 'Fredoka'; letter-spacing:.06em; text-transform:uppercase; color:var(--teal); }
.coupon b { display:block; font:700 19pt/1.1 'Fredoka'; color:var(--orange); } .coupon span { font:600 11.5pt 'Fredoka'; }
.stamp-grid { flex:1; display:grid; grid-template-columns:repeat(4, 1fr); grid-template-rows:repeat(5, 1fr); gap:.14in; }
.stamp { background:#fff; padding:.07in; border:5px dotted #c9d0dc; }
.stamp-in { height:100%; border-radius:4px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:var(--mint-l); }
.s1 .stamp-in { background:#fde9d2; } .s2 .stamp-in { background:#e4ecfb; } .s3 .stamp-in { background:#f9e1ea; }
.stamp-in b { font:700 13pt 'Fredoka'; } .stamp-in small { font:600 7.5pt 'Fredoka'; letter-spacing:.08em; text-transform:uppercase; color:#66708f; }
.pcards { flex:1; display:grid; grid-template-rows:repeat(4, 1fr); gap:.16in; }
.pcard { border:2px dashed #b7c0cc; border-radius:.1in; display:grid; grid-template-columns:1fr 1fr; overflow:hidden; }
.pc-front { background:var(--mint-l); display:flex; align-items:center; justify-content:center; gap:.12in; padding:.1in; }
.pc-front b { font-size:17pt; color:var(--teal-d); max-width:2in; text-align:center; }
.pc-back { position:relative; padding:.12in .18in; display:flex; flex-direction:column; justify-content:flex-end; gap:.18in; border-left:2px solid var(--line); }
.pc-back i { border-bottom:1.5px solid var(--navy); } .pc-back small { position:absolute; left:.18in; top:.5in; font:600 10pt 'Fredoka'; color:#66708f; }
.pc-stamp { position:absolute; right:.14in; top:.12in; width:.7in; height:.8in; border:2px dashed #9aa5b8; display:grid; place-items:center; font:600 8pt 'Fredoka'; color:#9aa5b8; }
.letter { flex:1; display:flex; flex-direction:column; gap:.06in; padding:.1in .2in; }
.lt-head { display:flex; align-items:center; gap:.12in; margin-bottom:.08in; } .lt-head b { font-size:20pt; }
.lt-line { display:flex; align-items:flex-end; gap:8px; flex:1; font:600 12pt 'Fredoka'; } .lt-line i { flex:1; border-bottom:1.5px solid #9aa5b8; }
.lt-line.sign { justify-content:flex-end; } .lt-line.sign i { flex:none; width:2.4in; }
`;

module.exports = { SHOP_TOYS, SHOP_PROPS, shopkitCss, kitchenSignPage };
