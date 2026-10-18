// Shop pieces for the play kits, made to set up around the room: a welcome poster, a menu
// board, a Today's Specials board with order slips, and play money. They are built from each
// kit's own menu and words, so every theme gets its own set.

const { em, pic, confetti, awning } = require('./art');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const coins = (M, n) => `${n} ${n === 1 ? M.coinWord : `${M.coinWord}s`}`;
const W = 816; const H = 1056; // a Letter page at 96 px per inch
const bg = (seed, avoid, n = 70) => `<svg class="shop-bg" viewBox="0 0 ${W} ${H}">${confetti(seed, W, H, n, avoid)}</svg>`;

// "Maya’s Potion Shop" → ["Maya’s", "Potion Shop"], so the name can sit on its own line.
function splitPlace(place) {
  const i = place.indexOf('’ ') >= 0 && place.indexOf('’ ') < place.indexOf('’s ') ? place.indexOf('’ ') + 1 : place.indexOf('’s ') + 2;
  return i > 1 ? [place.slice(0, i), place.slice(i + 1)] : ['', place];
}

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
      ${who ? `<div class="script p-who">${esc(who)}</div>` : ''}
      <div class="script p-what${what.length > 12 ? ' long' : ''}">${esc(what)}</div>
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

function moneyPage(k) {
  const M = k.def.menu;
  const bill = (v) => `<div class="bill">
    <span class="corner tl">${v}</span><span class="corner tr">${v}</span><span class="corner bl">${v}</span><span class="corner br">${v}</span>
    <div class="bill-mid">${pic(M.coinIcon, '.7in')}</div>
    <div class="bill-txt"><small>Bank of ${esc(k.placeName)}</small><b>${esc(coins(M, v))}</b></div>
  </div>`;
  const coin = () => `<div class="coin2">${pic(M.coinIcon, '.46in')}<b>1</b></div>`;
  return `<section class="page shop-page money-page">
    <h1 class="script center">${esc(M.coinsTitle)}</h1>
    <p class="pg-sub">Cut out the money and share it out before the shop opens.</p>
    <div class="bills">${[1, 1, 2, 2, 5, 5, 10, 10].map(bill).join('')}</div>
    <div class="coins2">${Array.from({ length: 12 }, coin).join('')}</div>
  </section>`;
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
.money-page h1 { font-size:36pt; line-height:1.35; }
.money-page .pg-sub { margin:.02in 0 .18in; }
.bills { display:grid; grid-template-columns:1fr 1fr; gap:.16in .22in; }
.bill { position:relative; height:1.55in; border-radius:12px; background:var(--mint-l); border:3px solid var(--teal); outline:2px dashed #b7c0cc; outline-offset:5px; display:flex; align-items:center; gap:.15in; padding:0 .45in; overflow:hidden; }
.bill::before { content:''; position:absolute; inset:6px; border:2px solid var(--mint); border-radius:8px; }
.corner { position:absolute; font:700 17pt 'Fredoka'; color:var(--teal-d); } .tl { top:.05in; left:.14in; } .tr { top:.05in; right:.14in; } .bl { bottom:.05in; left:.14in; } .br { bottom:.05in; right:.14in; }
.bill-mid { width:1in; height:1in; border-radius:50%; background:#fff; border:3px solid var(--gold); display:flex; align-items:center; justify-content:center; flex:none; }
.bill-txt small { display:block; font:600 8pt 'Fredoka'; text-transform:uppercase; letter-spacing:.04em; line-height:1.15; color:#66708f; }
.bill-txt b { font:700 19pt/1.1 'Fredoka'; color:var(--teal-d); }
.coins2 { display:grid; grid-template-columns:repeat(6, 1fr); gap:.12in; margin-top:.3in; justify-items:center; }
.coin2 { width:1.05in; height:1.05in; border-radius:50%; background:radial-gradient(circle at 35% 30%, #fff3cf, var(--gold) 65%); border:2px dashed #b77818; display:flex; flex-direction:column; align-items:center; justify-content:center; }
.coin2 b { font:700 15pt/1 'Fredoka'; color:#5a3a06; }
`;

module.exports = { welcomePage, menuBoard, specialsPage, moneyPage, shopCss };
