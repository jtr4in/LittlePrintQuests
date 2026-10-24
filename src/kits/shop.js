// Shop pieces for the play kits, made to set up around the room: a welcome poster, a menu
// board, a Today's Specials board with order slips, and play money. They are built from each
// kit's own menu and words, so every theme gets its own set.

const { em, pic, confetti, awning } = require('./art');
const { splitPlace } = require('./fit');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const coins = (M, n) => `${n} ${n === 1 ? M.coinWord : `${M.coinWord}s`}`;
const W = 816; const H = 1056; // a Letter page at 96 px per inch
const bg = (seed, avoid, n = 70) => `<svg class="shop-bg" viewBox="0 0 ${W} ${H}">${confetti(seed, W, H, n, avoid)}</svg>`;


function welcomePage(k) {
  const d = k.def;
  const [who, what] = splitPlace(k.placeName);
  const S = d.shop || {};
  const trio = S.hero || [d.menu.items[0][0], d.icon, d.menu.items[1][0]];
  return `<section class="page shop-page poster">
    ${bg(3, [120, 120, 576, 820])}
    <svg class="awning" viewBox="0 0 ${W} 80">${awning(W, 12)}</svg>
    <div class="poster-in">
      <div class="kicker">Welcome to</div>
      ${who ? `<div class="script p-who" data-lines="1">${esc(who)}</div>` : ''}
      <div class="script p-what${what.length > 12 ? ' long' : ''}" data-lines="2">${esc(what)}</div>
      <div class="tag-line">${esc(d.tagline)}</div>
      <svg class="trio" viewBox="0 0 600 330">
        <ellipse cx="300" cy="290" rx="270" ry="38" class="puddle"/>
        ${em(130, 190, 210, trio[0])}${em(470, 190, 210, trio[2])}${em(300, 160, 270, trio[1])}
      </svg>
      <div class="open-pill">${esc(S.open || 'Now open!')}</div>
    </div>
  </section>`;
}

function menuBoard(k) {
  const M = k.def.menu;
  const rows = M.items.map(([e, n, c]) => `<div class="mrow">${pic(e, '.72in')}<span class="mn">${esc(n)}</span><span class="dots"></span><span class="mp">${c}${pic(M.coinIcon, '.3in')}</span></div>`).join('');
  return `<section class="page shop-page menu-board">
    ${bg(7, [70, 40, 676, 980], 46)}
    <div class="board-head">${pic(M.icon, '.85in')}<h1 class="script">${esc(M.title)}</h1>${pic(M.items[0][0], '.85in')}</div>
    <div class="board">
      <div class="ribbon">On the menu</div>
      <div class="mrows">${rows}</div>
      <div class="board-foot">Prices in ${esc(M.coinWord)}s · ${pic(M.coinIcon, '.26in')} = 1</div>
    </div>
    <p class="board-tip">Tape it up where customers order. Wipe-clean idea: slip it into a sheet protector and use a dry-erase marker for today’s prices.</p>
  </section>`;
}

function specialsPage(k) {
  const M = k.def.menu;
  const S = k.def.shop || {};
  const picks = S.specials || [M.items[1], M.items[0], M.items[M.items.length - 1]].map(([e, n]) => [e, n]);
  const tags = S.specialTags || ['Yum!', 'Tasty!', 'Wow!'];
  const card = ([e, n], i) => `<div class="special">${pic(e, k.little ? '1in' : '1.45in')}<b>${esc(n)}</b><span class="pill">${tags[i]}</span></div>`;
  const slip = () => `<div class="slip">
    <div class="slip-head">${pic(M.icon, '.42in')}<div><small>${esc(k.placeName)}</small><b>${esc(S.slipTitle || 'Order slip')}</b></div><span class="no">No. ____</span></div>
    ${(S.slipFields || ['Customer', 'Order', 'Extras']).map((f) => `<div class="line"><span>${f}</span><i></i></div>`).join('')}
    <div class="line"><span>How many</span><span class="ticks">${[1, 2, 3, 4].map((n) => `<em>${n}</em>`).join('')}</span></div>
    <div class="line"><span>Total</span><i class="short"></i>${pic(M.coinIcon, '.3in')}</div>
    <div class="slip-foot">Thank you! Come again!</div>
  </div>`;
  // Little kids circle pictures instead of writing.
  const littleSlip = () => `<div class="slip">
    <div class="slip-head">${pic(M.icon, '.42in')}<div><small>${esc(k.placeName)}</small><b>${esc(S.slipTitle || 'Order slip')}</b></div></div>
    <div class="ls-pics">${M.items.slice(0, 6).map(([e]) => `<span>${pic(e, '.3in')}</span>`).join('')}</div>
    <div class="line"><span>How many</span><span class="ticks">${[1, 2, 3, 4].map((n) => `<em>${n}</em>`).join('')}</span></div>
    <div class="slip-foot">Circle what they want!</div>
  </div>`;
  return `<section class="page shop-page specials-page">
    ${bg(11, [60, 40, 696, 470], 34)}
    <h1 class="script center">Today’s Specials</h1>
    <div class="specials">${picks.map(card).join('')}</div>
    <div class="cut-h"></div>
    <div class="slips">${Array.from({ length: 4 }, k.little ? littleSlip : slip).join('')}</div>
  </section>`;
}

// Play money that looks like the real thing: engraved-looking bills with corner numbers, a seal,
// serial numbers and a signature, sized like the bills in a toy cash register drawer, plus
// metal-look coins. Two pages of four bills and ten coins.
const BILL = { w: 4.75, h: 2 }; // inches
const WORDS = { 1: 'ONE', 2: 'TWO', 5: 'FIVE', 10: 'TEN' };
const TINTS = { 1: ['#e4efdc', '#3d6b3a'], 2: ['#dde8f3', '#2f5683'], 5: ['#ebe0f0', '#5d3f78'], 10: ['#f6e6d4', '#8a4b1c'] };

function bill(k, v, n) {
  const M = k.def.menu;
  const [paper, ink] = TINTS[v];
  const w = BILL.w * 100; const h = BILL.h * 100;
  // fine wavy lines like the engraving on real money
  const waves = Array.from({ length: 16 }, (_, i) => {
    const y = 18 + i * 10.5;
    let d = `M14,${y}`;
    for (let x = 14; x <= w - 14; x += 12) d += ` Q${x + 6},${y + (i % 2 ? 4 : -4)} ${x + 12},${y}`;
    return `<path d="${d}" fill="none" stroke="${ink}" stroke-width=".5" opacity=".22"/>`;
  }).join('');
  const rosette = (cx, cy) => `<g transform="translate(${cx} ${cy})">${Array.from({ length: 12 }, (_, i) => `<ellipse rx="20" ry="7" transform="rotate(${i * 15})" fill="none" stroke="${ink}" stroke-width=".7" opacity=".55"/>`).join('')}
    <circle r="15" fill="${paper}" stroke="${ink}" stroke-width="1.4"/><text y="6" text-anchor="middle" class="bn-num" fill="${ink}">${v}</text></g>`;
  const serial = `${k.placeName.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() || 'LP'} ${String(1000000 + ((v * 7919 + n * 104729) % 9000000)).padStart(8, '0')} ${'ABCDEFGH'[n % 8]}`;
  const seal = `<g transform="translate(92 102)">${Array.from({ length: 24 }, (_, i) => `<path d="M0,-33 L3,-27 L-3,-27 Z" transform="rotate(${i * 15})" fill="${ink}" opacity=".7"/>`).join('')}
    <circle r="27" fill="none" stroke="${ink}" stroke-width="1.6"/><circle r="21" fill="none" stroke="${ink}" stroke-width=".8"/>
    <text y="-6" text-anchor="middle" class="bn-tiny" fill="${ink}">BANK OF</text><text y="4" text-anchor="middle" class="bn-tiny" fill="${ink}">${esc(k.childName.toUpperCase().slice(0, 10))}</text>
    <text y="14" text-anchor="middle" class="bn-tiny" fill="${ink}">★ ★ ★</text></g>`;
  return `<svg class="bill2" viewBox="0 0 ${w} ${h}" style="width:${BILL.w}in;height:${BILL.h}in">
    <rect x="1" y="1" width="${w - 2}" height="${h - 2}" fill="${paper}"/>${waves}
    <rect x="8" y="8" width="${w - 16}" height="${h - 16}" fill="none" stroke="${ink}" stroke-width="2.2"/>
    <rect x="13" y="13" width="${w - 26}" height="${h - 26}" fill="none" stroke="${ink}" stroke-width=".8" stroke-dasharray="1.5 2"/>
    ${rosette(36, 36)}${rosette(w - 36, 36)}${rosette(36, h - 36)}${rosette(w - 36, h - 36)}
    <text x="${w / 2}" y="34" text-anchor="middle" class="bn-bank" fill="${ink}">${esc(`BANK OF ${k.placeName}`.toUpperCase())}</text>
    <text x="70" y="62" class="bn-serial" fill="${ink}">${serial}</text>
    <text x="${w - 70}" y="${h - 50}" text-anchor="end" class="bn-serial" fill="${ink}">${serial}</text>
    ${seal}
    <ellipse cx="${w / 2}" cy="${h / 2 + 4}" rx="58" ry="66" fill="#fffdf6" stroke="${ink}" stroke-width="2"/>
    <ellipse cx="${w / 2}" cy="${h / 2 + 4}" rx="52" ry="60" fill="none" stroke="${ink}" stroke-width=".7" stroke-dasharray="2 2"/>
    ${em(w / 2, h / 2 + 4, 74, k.def.icon)}
    <text x="${w - 92}" y="${h / 2 + 4}" text-anchor="middle" class="bn-big" fill="${ink}">${v}</text>
    <path d="M${w / 2 - 90},${h - 30} L${w / 2 + 90},${h - 30} L${w / 2 + 80},${h - 14} L${w / 2 - 80},${h - 14} Z" fill="${ink}"/>
    <text x="${w / 2}" y="${h - 18}" text-anchor="middle" class="bn-word">${WORDS[v]} ${esc((v === 1 ? M.coinWord : `${M.coinWord}s`).toUpperCase())}</text>
    <text x="${w - 92}" y="${h / 2 + 34}" text-anchor="middle" class="bn-sign" fill="${ink}">${esc(k.lead)}</text>
    <line x1="${w - 140}" y1="${h / 2 + 38}" x2="${w - 44}" y2="${h / 2 + 38}" stroke="${ink}" stroke-width=".8"/>
  </svg>`;
}

function coin(v) {
  const ticks = Array.from({ length: 60 }, (_, i) => `<line x1="0" y1="-46" x2="0" y2="-41" transform="rotate(${i * 6})"/>`).join('');
  return `<svg class="coin3" viewBox="-50 -50 100 100"><defs><radialGradient id="cg" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff4cf"/><stop offset=".55" stop-color="#e7bd52"/><stop offset="1" stop-color="#b8862a"/></radialGradient></defs>
    <circle r="48" fill="url(#cg)" stroke="#8a6215" stroke-width="2"/><g stroke="#9a7020" stroke-width="1.2">${ticks}</g>
    <circle r="36" fill="none" stroke="#9a7020" stroke-width="1.2"/><text y="13" text-anchor="middle" class="cn-num">${v}</text></svg>`;
}

function moneyPage(k) {
  const M = k.def.menu;
  const page = (values, n) => `<section class="page shop-page money-page">
    <h1 class="script center">${esc(M.coinsTitle)}${n ? ' <small>(more)</small>' : ''}</h1>
    <p class="pg-sub">Cut out the money along the dashed lines and share it out before the shop opens.</p>
    <div class="money-cols"><div class="bills2">${values.map((v, i) => `<div class="cut">${bill(k, v, n * 4 + i)}</div>`).join('')}</div>
    <div class="coins3">${Array.from({ length: 10 }, () => `<div class="cut round">${coin(1)}</div>`).join('')}</div></div>
  </section>`;
  return page([1, 1, 2, 5], 0) + page([2, 5, 10, 10], 1);
}

const shopCss = (font) => `
${font('Pacifico', 'Pacifico-latin.woff2', 400)}
${font('Pacifico', 'Pacifico-latin-ext.woff2', 400)}
.script { font-family:'Pacifico', 'Fredoka', cursive; font-weight:400; color:var(--orange); line-height:1.15; }
svg.pic { display:inline-block; vertical-align:middle; flex:none; }
.shop-page { background:#fffdf8; }
.shop-bg { position:absolute; inset:0; width:100%; height:100%; z-index:0; }
.shop-page > *:not(.shop-bg) { position:relative; z-index:1; }
.poster { padding:0; }
.awning { position:absolute !important; top:0; left:0; width:100%; }
.poster-in { position:absolute !important; inset:1.2in .6in .55in; display:flex; flex-direction:column; align-items:center; text-align:center; border:5px solid var(--teal); border-radius:36px; background:rgba(255,255,255,.82); padding:.35in .3in .3in; outline:3px solid var(--mint); outline-offset:7px; }
.kicker { font:700 20pt 'Fredoka'; letter-spacing:.18em; text-transform:uppercase; color:var(--teal); }
.p-who { font-size:40pt; color:var(--teal-d); margin-top:.1in; }
.p-what { font-size:60pt; line-height:1.3; margin-top:-.08in; max-width:6.6in; } .p-what.long { font-size:46pt; }
.tag-line { font:600 15pt 'Fredoka'; color:var(--navy); margin-top:.08in; }
.trio { width:6in; margin:auto 0; }
.puddle { fill:var(--mint); opacity:.7; }
.ls-pics { display:grid; grid-template-columns:repeat(3, 1fr); justify-items:center; gap:.05in; margin:.04in 0; } .ls-pics span { width:.6in; height:.6in; border:2px solid var(--mint); border-radius:50%; display:grid; place-items:center; }
.open-pill { margin-top:.12in; background:var(--teal); color:#fff; font:700 20pt 'Fredoka'; padding:.08in .4in; border-radius:99px; letter-spacing:.04em; }
.menu-board { padding:.45in .55in; }
.board-head { display:flex; align-items:center; justify-content:center; gap:.2in; }
.board-head h1 { font-size:44pt; text-align:center; }
.board { margin-top:.2in; padding-bottom:.4in !important; border:5px solid var(--teal); border-radius:30px; background:#fff; padding:.5in .45in .3in; position:relative; outline:3px solid var(--mint); outline-offset:6px; }
.ribbon { position:absolute; top:-.28in; left:50%; transform:translateX(-50%); background:var(--teal); color:#fff; font:700 17pt 'Fredoka'; letter-spacing:.14em; text-transform:uppercase; padding:.07in .5in; border-radius:10px; white-space:nowrap; }
.mrows { display:flex; flex-direction:column; gap:.21in; }
.mrow { display:flex; align-items:center; gap:.16in; font:600 21pt 'Fredoka'; color:var(--navy); }
.mrow .mn { white-space:nowrap; }
.mrow .dots { flex:1; border-bottom:3px dotted var(--line); transform:translateY(.08in); }
.mrow .mp { display:flex; align-items:center; gap:5px; background:var(--mint-l); border:2px solid var(--mint); border-radius:99px; padding:.03in .14in; color:var(--teal-d); font-weight:700; }
.board-foot { text-align:center; margin-top:.22in; font:600 12pt 'Fredoka'; color:#66708f; display:flex; align-items:center; justify-content:center; gap:6px; }
.board-tip { text-align:center; font-size:10.5pt; color:#66708f; margin:.18in .3in 0; }
.specials-page { padding:.4in .45in; }
.center { text-align:center; }
.specials-page h1 { font-size:40pt; }
.specials { display:grid; grid-template-columns:repeat(3, 1fr); gap:.2in; margin:.15in 0 .2in; }
.special { background:#fff; border:4px solid var(--teal); border-radius:24px; padding:.18in .1in .16in; display:flex; flex-direction:column; align-items:center; gap:.06in; text-align:center; }
.special b { font:700 15pt/1.15 'Fredoka'; color:var(--navy); min-height:.5in; display:flex; align-items:center; }
.special .pill { background:var(--orange); color:var(--accent-ink); font:700 12pt 'Fredoka'; border-radius:99px; padding:.03in .22in; }
.slips { display:grid; grid-template-columns:1fr 1fr; gap:.18in .3in; margin-top:.16in; }
.slip { border:2.5px dashed #b7c0cc; border-radius:14px; padding:.14in .2in .12in; background:#fff; }
.slip-head { display:flex; align-items:center; gap:.1in; border-bottom:3px solid var(--teal); padding-bottom:.08in; margin-bottom:.06in; }
.slip-head small { display:block; font:600 8.5pt 'Fredoka'; color:#66708f; text-transform:uppercase; letter-spacing:.06em; }
.slip-head b { font:700 16pt 'Fredoka'; color:var(--teal-d); } .slip-head .no { margin-left:auto; font:600 10pt 'Fredoka'; color:#66708f; }
.slip .line { display:flex; align-items:flex-end; gap:.08in; font:600 11pt 'Fredoka'; margin-top:.13in; }
.slip .line i { flex:1; border-bottom:2px solid var(--line); height:1px; } .slip .line i.short { flex:0 0 1in; }
.slip .ticks { display:flex; gap:.1in; } .slip .ticks em { font-style:normal; width:.3in; height:.3in; border:2px solid var(--teal); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10pt; }
.slip-foot { text-align:center; margin-top:.12in; font:600 11pt 'Fredoka'; color:var(--orange); }
.money-page { padding:.4in .45in; }
.money-page h1 { font-size:36pt; line-height:1.35; } .money-page h1 small { font-size:18pt; }
.money-page .pg-sub { margin:.02in 0 .18in; }
.money-cols { display:flex; justify-content:space-between; gap:.2in; }
.bills2 { display:flex; flex-direction:column; gap:.22in; }
.cut { outline:2px dashed #b7c0cc; outline-offset:3px; line-height:0; } .cut.round { border-radius:50%; }
.bill2 { display:block; }
.bn-bank { font:700 11px 'Fredoka'; letter-spacing:1.5px; } .bn-serial { font:600 9px 'Courier New', monospace; letter-spacing:1px; }
.bn-num { font:700 17px 'Fredoka'; } .bn-big { font:700 52px 'Fredoka'; } .bn-tiny { font:700 5.5px 'Fredoka'; letter-spacing:.5px; }
.bn-word { font:700 11px 'Fredoka'; fill:#fff; letter-spacing:2px; } .bn-sign { font:400 13px 'Pacifico', 'Fredoka'; }
.coins3 { display:grid; grid-template-columns:repeat(2, 1in); gap:.25in .3in; align-content:start; }
.coin3 { width:1in; height:1in; display:block; } .cn-num { font:700 36px 'Fredoka'; fill:#6b4a0c; }
`;

module.exports = { welcomePage, menuBoard, specialsPage, moneyPage, shopCss };
