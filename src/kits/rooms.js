// Room-changing pieces for the newer kits (2026-10-24): things that turn a play kitchen, a bookcase or
// a cabinet into the place itself, plus pretend paperwork that looks like the real thing.
//   appliances (def.appliances)
//     burners      four burners to cut out and lift off, and a knob panel with knobs that turn on brads
//     sink         a sink basin, and a stand-up faucet whose water pulls down through the spout
//     backsplash   two tiled wall panels: a utensil rail with the chef's name, a spice shelf and a specials board
//     stage        a stage front for a bookcase or doorway: a curtain top with the theater's name and two side curtains
//   folderPages (def.folders)  manila file folders with a tab, an intake form and file labels and stamps
//   props (def.props)
//     puppets      big round stick puppets
//     fingerprints fingerprint ID cards and the three kinds of print to match
//     hangtags     hanger price tags
//     scoops       ice cream scoops to stack on cones
//     stampsheet   passport stamps to cut out and tape in

const { em, pic } = require('./art');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const head = (title, sub) => `<h2 class="pg-title">${esc(title)}</h2><p class="pg-sub">${esc(sub)}</p>`;
const cardstock = '<div class="cardstock">Best on cardstock</div>';
const brad = (x, y) => `<circle cx="${x}" cy="${y}" r="9" class="rm-brad"/>`;

// ---------- burners ----------

function burnersPages(k) {
  const burner = (r, n) => `<svg viewBox="-${r + 12} -${r + 12} ${2 * r + 24} ${2 * r + 24}" class="rm-burner" style="width:${((2 * r + 24) / 100).toFixed(2)}in">
    <circle r="${r}" class="sv-ring"/>${[0.82, 0.62, 0.42, 0.22].map((f) => `<circle r="${(r * f).toFixed(1)}" class="sv-coil"/>`).join('')}
    <circle r="${(r * 0.1).toFixed(1)}" class="sv-hub"/><path d="M${-r * 0.7},${-r * 0.5} A${r * 0.86},${r * 0.86} 0 0 1 ${-r * 0.2},${-r * 0.84}" class="rm-shine"/>
    <circle r="${r + 6}" class="cut-dash" fill="none"/><text y="${r * 0.62}" class="rm-burner-n" text-anchor="middle">${n}</text></svg>`;
  const burners = `<section class="page props">${head('Lift-Off Burners', 'Cut out the burners and set them on the play kitchen, a box or the table. Lift them off and move them around while you cook!')}${cardstock}
    <div class="rm-burners">${burner(165, 1)}${burner(165, 2)}${burner(130, 3)}${burner(130, 4)}</div></section>`;
  const dial = (x, n) => `<circle cx="${x}" cy="150" r="96" class="rm-dial"/>
    ${['OFF', 'LOW', 'MED', 'HIGH'].map((w, i) => { const a = (-90 + i * 60) * Math.PI / 180; return `<text x="${(x + 120 * Math.cos(a)).toFixed(1)}" y="${(150 + 120 * Math.sin(a) + 7).toFixed(1)}" class="rm-dial-t" text-anchor="middle">${w}</text>`; }).join('')}
    ${brad(x, 150)}<text x="${x}" y="292" class="rm-dial-n" text-anchor="middle">Burner ${n}</text>`;
  const knob = (x) => `<g transform="translate(${x} 95)"><circle r="70" class="sv-knob"/><circle r="50" class="rm-knob-in"/><rect x="-9" y="-68" width="18" height="52" rx="9" class="sv-mark"/>${brad(0, 0)}<circle r="76" class="cut-dash" fill="none"/></g>`;
  const panel = `<section class="page props">${head('Stove Knobs', 'Cut out the panel and the four knobs. Push a paper fastener (brad) through each knob’s dot and the dot on the panel. Now they really turn!')}${cardstock}
    <svg viewBox="0 0 1000 320" class="rm-panel"><rect x="6" y="6" width="988" height="308" rx="30" class="sv-body"/>
      ${[130, 375, 625, 870].map((x, i) => dial(x, i + 1)).join('')}<rect x="2" y="2" width="996" height="316" rx="34" class="cut-dash" fill="none"/></svg>
    <div class="rm-knobs"><svg viewBox="0 0 1000 190">${[130, 375, 625, 870].map(knob).join('')}</svg></div>
    <div class="rm-oven-clock"><svg viewBox="0 0 1000 300"><rect x="6" y="6" width="988" height="288" rx="30" class="sv-top"/>
      <rect x="250" y="60" width="500" height="150" rx="18" class="rm-clock-face"/><text x="500" y="168" text-anchor="middle" class="rm-clock-t">12:00</text>
      <text x="500" y="262" text-anchor="middle" class="rm-clock-n" data-fit-w="560">${esc(k.lead)}</text>${em(130, 140, 140, '🔥')}${em(870, 140, 140, '⏲️')}
      <rect x="2" y="2" width="996" height="296" rx="34" class="cut-dash" fill="none"/></svg>
      <p class="ap-tip">Oven clock: tape it above the oven door. Write the timer in with a dry-erase marker.</p></div>
  </section>`;
  return burners + panel;
}

// ---------- sink and faucet ----------

function sinkPages(k) {
  const faucet = `<svg viewBox="0 0 760 640" class="rm-faucet">
    <path d="M300,560 L300,250 Q300,90 450,90 Q600,90 600,240 L600,280 L540,280 L540,245 Q540,150 450,150 Q360,150 360,250 L360,560 Z" class="rm-chrome"/>
    <path d="M318,540 L318,252 Q318,112 450,108" class="rm-chrome-hi"/>
    <rect x="520" y="276" width="100" height="22" rx="6" class="rm-chrome-d"/>
    <line x1="532" y1="287" x2="608" y2="287" class="rm-slit"/><text x="570" y="330" class="rm-small" text-anchor="middle">cut this slit</text>
    <rect x="150" y="540" width="360" height="40" rx="16" class="rm-chrome-d"/>
    <circle cx="200" cy="470" r="44" class="rm-chrome"/><circle cx="460" cy="470" r="44" class="rm-chrome"/>${brad(200, 470)}${brad(460, 470)}
    <rect x="150" y="580" width="360" height="56" class="rm-tab"/><text x="330" y="616" class="rm-tab-t" text-anchor="middle">FOLD BACK · TAPE DOWN</text>
    <path d="M150,580 L150,560 Q150,540 170,540 L300,540 L300,250 Q300,80 450,80 Q610,80 610,240 L610,300 L530,300 L530,245 Q530,160 450,160 Q370,160 370,250 L370,540 L490,540 Q510,540 510,560 L510,636 L150,636 Z" class="cut-dash" fill="none"/>
  </svg>`;
  const handle = (x, word, cls) => `<g transform="translate(${x} 90)"><path d="M-80,-24 L80,-24 Q96,0 80,24 L-80,24 Q-96,0 -80,-24 Z" class="rm-chrome"/><circle r="40" class="rm-handle ${cls}"/>
    <text y="12" class="rm-handle-t" text-anchor="middle">${word}</text>${brad(0, -2)}<path d="M-90,-34 L90,-34 Q112,0 90,34 L-90,34 Q-112,0 -90,-34 Z" class="cut-dash" fill="none"/></g>`;
  const water = `<svg viewBox="0 0 160 700" class="rm-water"><rect x="40" y="0" width="80" height="560" rx="38" class="rm-water-b"/>
    ${[90, 200, 310, 420].map((y) => `<path d="M58,${y} Q80,${y + 26} 102,${y}" class="rm-water-l"/>`).join('')}
    <path d="M20,560 L140,560 L120,690 L40,690 Z" class="pull"/><text x="80" y="630" class="pull-t" text-anchor="middle">PULL</text>
    <rect x="34" y="-6" width="92" height="702" rx="40" class="cut-dash" fill="none"/></svg>`;
  const page1 = `<section class="page props">${head('Faucet That Turns On', 'Cut out the faucet, the two handles and the water strip. Cut the slit under the spout and slide the water in from the top. Pull it down: the water’s on!')}${cardstock}
    <div class="rm-faucet-row">${faucet}${water}</div>
    <svg viewBox="0 0 760 180" class="rm-handles">${handle(190, 'HOT', 'hot')}${handle(570, 'COLD', 'cold')}</svg>
    <p class="ap-tip">Push a paper fastener (brad) through each handle and a dot on the faucet so the handles turn. Fold the tab back and tape the faucet to the wall behind the sink.</p>
  </section>`;
  const basin = `<svg viewBox="0 0 760 640" class="rm-basin">
    <rect x="10" y="10" width="740" height="620" rx="40" class="rm-counter"/>
    <rect x="70" y="70" width="620" height="500" rx="70" class="rm-chrome"/><rect x="100" y="100" width="560" height="440" rx="56" class="rm-bowl"/>
    <path d="M140,140 Q260,120 380,140" class="rm-chrome-hi"/>
    <circle cx="380" cy="420" r="40" class="rm-drain"/>${[0, 45, 90, 135].map((a) => `<line x1="350" y1="420" x2="410" y2="420" class="rm-drain-l" transform="rotate(${a} 380 420)"/>`).join('')}
    ${em(190, 230, 90, '🫧')}${em(560, 260, 70, '🫧')}${em(470, 180, 50, '🫧')}
    <rect x="4" y="4" width="752" height="632" rx="44" class="cut-dash" fill="none"/></svg>`;
  const page2 = `<section class="page props">${head('Kitchen Sink', 'Cut out the sink and tape it onto the play kitchen counter or a box. Stand the faucet up behind it.')}
    ${basin}
    <div class="rm-sink-extras">${[['🧽', 'Sponge'], ['🧴', 'Soap'], ['🧼', 'Scrub'], ['🍽️', 'Dishes']].map(([e, n]) => `<div class="rm-sink-item">${pic(e, '.9in')}<b>${esc(n)}</b></div>`).join('')}</div>
    <p class="ap-tip">Cut out the sponge and soap cards too, and scrub every pot until it sparkles.</p>
  </section>`;
  return page1 + page2;
}

// ---------- backsplash ----------

function tiles(w, h) {
  const out = []; const tw = 100; const th = 50;
  for (let row = 0; row * th < h; row++) {
    const off = row % 2 ? tw / 2 : 0;
    for (let x = -off; x < w; x += tw) out.push(`<rect x="${x + 3}" y="${row * th + 3}" width="${tw - 6}" height="${th - 6}" rx="6" class="rm-tile${(row === 3 || row === 14) ? ' accent' : ''}"/>`);
  }
  return out.join('');
}

function backsplashPages(k) {
  const W = 760; const H = 980;
  const wall = (body) => `<svg viewBox="0 0 ${W} ${H}" class="rm-wall"><rect width="${W}" height="${H}" class="rm-grout"/>${tiles(W, H)}${body}</svg>`;
  const tools = [['🥄', 'Spoon'], ['🍳', 'Pan'], ['🍴', 'Fork'], ['🧤', 'Mitt']];
  const page1 = wall(`
    <rect x="130" y="230" width="500" height="200" rx="26" class="rm-plaque"/><rect x="146" y="246" width="468" height="168" rx="18" class="rm-plaque-in"/>
    <text x="380" y="330" text-anchor="middle" class="rm-plaque-t" style="font-size:${Math.min(64, Math.round(980 / k.placeName.length))}px" data-fit-w="430">${esc(k.placeName)}</text>
    <text x="380" y="388" text-anchor="middle" class="rm-plaque-s">${esc(k.def.tagline)}</text>
    <rect x="60" y="560" width="640" height="22" rx="11" class="rm-rail"/>
    ${tools.map(([e], i) => { const x = 140 + i * 160; return `<path d="M${x},582 L${x},620" class="rm-hook"/>${em(x, 700, 150, e)}`; }).join('')}`);
  const jars = (k.def.jars || []).slice(0, 4);
  const page2 = wall(`
    <rect x="60" y="200" width="640" height="24" rx="6" class="rm-shelf"/>
    ${jars.map(([e, n], i) => { const x = 140 + i * 160; return `<rect x="${x - 55}" y="70" width="110" height="130" rx="20" class="rm-jar"/><rect x="${x - 45}" y="56" width="90" height="26" rx="8" class="rm-jar-lid"/>${em(x, 132, 70, e)}<text x="${x}" y="190" text-anchor="middle" class="rm-jar-t">${esc(n)}</text>`; }).join('')}
    <circle cx="600" cy="390" r="100" class="rm-clock"/><circle cx="600" cy="390" r="84" class="rm-clock-in"/>
    ${Array.from({ length: 12 }, (_, i) => { const a = i * 30 * Math.PI / 180; return `<circle cx="${(600 + 70 * Math.sin(a)).toFixed(1)}" cy="${(390 - 70 * Math.cos(a)).toFixed(1)}" r="6" class="rm-clock-dot"/>`; }).join('')}
    <line x1="600" y1="390" x2="600" y2="330" class="rm-clock-h"/><line x1="600" y1="390" x2="648" y2="390" class="rm-clock-h"/>
    <rect x="70" y="300" width="400" height="560" rx="20" class="rm-board-frame"/><rect x="92" y="322" width="356" height="516" rx="10" class="rm-board"/>
    <text x="270" y="390" text-anchor="middle" class="rm-board-t">Today’s Special</text>
    ${[470, 550, 630, 710, 790].map((y) => `<line x1="122" y1="${y}" x2="418" y2="${y}" class="rm-board-l"/>`).join('')}
    ${em(600, 640, 150, k.def.menu.items[0][0])}${em(600, 820, 120, k.def.icon)}`);
  const page = (n, svg) => `<section class="page appliance"><div class="rm-wall-tip">${esc(`Backsplash, panel ${n} of 2 · Tape the panels side by side on the wall behind the play kitchen.`)}</div>${svg}</section>`;
  return page(1, page1) + page(2, page2);
}

// ---------- stage front ----------

function stagePages(k) {
  const scallops = Array.from({ length: 8 }, (_, i) => `<path d="M${i * 95},250 Q${i * 95 + 47.5},330 ${(i + 1) * 95},250" class="rm-velvet"/>`).join('');
  const fringe = Array.from({ length: 38 }, (_, i) => `<line x1="${i * 20 + 10}" y1="252" x2="${i * 20 + 10}" y2="276" class="rm-fringe"/>`).join('');
  const bulbs = Array.from({ length: 14 }, (_, i) => `<circle cx="${80 + i * 46}" cy="62" r="11" class="rm-bulb"/><circle cx="${80 + i * 46}" cy="196" r="11" class="rm-bulb"/>`).join('');
  const top = `<svg viewBox="0 0 760 340" class="rm-valance"><rect x="0" y="0" width="760" height="250" class="rm-velvet"/>${scallops}${fringe}
    <rect x="50" y="40" width="660" height="178" rx="20" class="rm-marquee"/>${bulbs}
    <text x="380" y="148" text-anchor="middle" class="rm-marquee-t" style="font-size:${Math.min(62, Math.round(1120 / k.placeName.length))}px" data-fit-w="640">${esc(k.placeName)}</text>
    <path d="M0,0 L760,0 L760,250 ${Array.from({ length: 8 }, (_, i) => `Q${760 - i * 95 - 47.5},330 ${760 - (i + 1) * 95},250`).join(' ')} Z" class="cut-dash" fill="none"/></svg>`;
  const lights = `<svg viewBox="0 0 760 170" class="rm-footlights"><rect x="0" y="40" width="760" height="130" rx="10" class="rm-boards"/>
    ${Array.from({ length: 6 }, (_, i) => `<line x1="0" y1="${62 + i * 20}" x2="760" y2="${62 + i * 20}" class="rm-board-line"/>`).join('')}
    ${Array.from({ length: 7 }, (_, i) => `<path d="M${55 + i * 110},40 L${30 + i * 110},40 Q${55 + i * 110},-6 ${80 + i * 110},40 Z" class="rm-gold"/><circle cx="${55 + i * 110}" cy="24" r="10" class="rm-bulb"/>`).join('')}
    <rect x="0" y="0" width="760" height="170" class="cut-dash" fill="none"/></svg>`;
  const poster = `<div class="rm-poster"><div class="rm-poster-k">Now Showing</div><div class="rm-poster-line"></div><div class="rm-poster-draw">Draw the show</div>
    <div class="rm-poster-row"><b>Starring</b><i></i></div><div class="rm-poster-row"><b>Show time</b><i></i></div></div>`;
  const page1 = `<section class="page props">${head('Stage Front', 'Tape the curtain top across the top of the stage opening and the stage edge along the bottom. Fill in the poster and hang it by the Ticket Booth.')}
    ${top}<div class="cut-h"></div>${lights}<div class="cut-h"></div>${poster}</section>`;
  const curtain = (flip) => `<svg viewBox="0 0 360 960" class="rm-curtain" style="${flip ? 'transform:scaleX(-1)' : ''}">
    <path d="M0,0 L360,0 Q300,420 210,560 Q330,780 300,960 L0,960 Z" class="rm-velvet"/>
    ${[50, 110, 170, 230].map((x, i) => `<path d="M${x},0 Q${x - 10 + i * 6},${300 + i * 40} ${x + 20},${560 + i * 10} Q${x - 10},${780} ${x + 10},960" class="rm-fold"/>`).join('')}
    <path d="M150,520 Q210,560 270,540 L280,600 Q210,620 140,580 Z" class="rm-gold"/><circle cx="276" cy="610" r="18" class="rm-gold"/>
    <path d="M0,0 L360,0 Q300,420 210,560 Q330,780 300,960 L0,960 Z" class="cut-dash" fill="none"/></svg>`;
  const page2 = `<section class="page props">${head('Side Curtains', 'Cut out both curtains and tape one down each side of the stage opening, gold tie-backs on the inside.')}
    <div class="rm-curtains">${curtain(false)}${curtain(true)}</div></section>`;
  return page1 + page2;
}

const APPLIANCES = { burners: burnersPages, sink: sinkPages, backsplash: backsplashPages, stage: stagePages };
// How the grown-up guide lists each one.
const APPLIANCE_NAMES = { burners: 'lift-off burners with knobs that turn', sink: 'a sink with a faucet that turns on', backsplash: 'two tiled backsplash panels', stage: 'a stage front with curtains for a bookcase or doorway' };

// ---------- manila file folders ----------

const TAB_COLORS = ['#e8574b', '#3a7bd5', '#2f9e6b', '#f2b632', '#8c4fc4', '#ef8a3a'];

// One folder per page: the top half (with the tab) is the front, the bottom half folds back
// behind it, printed side out, so half-page forms slip inside.
function folderPage(k, subject, n) {
  const F = k.def.folders;
  const name = subject ? (subject.name || k.def.kinds[subject.kind][1]) : '';
  const tabX = n % 2 ? 420 : 40;
  const letters = (name || '').replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase().padEnd(2, ' ').split('');
  const front = `
    <path d="M10,60 Q10,46 24,46 L${tabX},46 L${tabX + 22},6 L${tabX + 310},6 L${tabX + 332},46 L766,46 Q780,46 780,60 L780,520 L10,520 Z" class="mf-manila"/>
    <rect x="${tabX + 40}" y="14" width="250" height="30" rx="5" class="mf-tablabel"/>
    <text x="${tabX + 52}" y="36" class="mf-tab-t">${esc(F.tab)}:</text><text x="${tabX + 150}" y="37" class="mf-tab-name">${esc(name)}</text>
    ${letters.map((c, i) => `<rect x="${704}" y="${80 + i * 72}" width="58" height="64" rx="6" fill="${TAB_COLORS[(c.charCodeAt(0) + i) % TAB_COLORS.length]}"/><text x="733" y="${125 + i * 72}" class="mf-letter" text-anchor="middle">${esc(c.trim())}</text>`).join('')}
    <rect x="704" y="224" width="58" height="64" rx="6" fill="${TAB_COLORS[(n + 3) % TAB_COLORS.length]}"/><text x="733" y="268" class="mf-letter" text-anchor="middle">${n + 1}</text>
    <rect x="60" y="88" width="420" height="150" rx="10" class="mf-label"/>
    <text x="80" y="128" class="mf-kicker" data-fit-w="380">${esc(k.placeName)}</text>
    <text x="80" y="180" class="mf-big">${esc(F.label)}</text>
    <text x="80" y="220" class="mf-no">File no. ${String(1000 + n * 137).slice(-4)}</text>
    ${subject ? `<circle cx="580" cy="165" r="78" class="mf-photo"/>${em(580, 165, 110, k.def.kinds[subject.kind][0])}` : `<circle cx="580" cy="165" r="78" class="mf-photo"/><text x="580" y="172" class="mf-small" text-anchor="middle">photo</text>`}
    <g transform="rotate(-9 560 330)"><rect x="420" y="290" width="300" height="78" rx="8" class="mf-stamp"/><rect x="428" y="298" width="284" height="62" rx="5" class="mf-stamp thin"/>
      <text x="570" y="342" class="mf-stamp-t" text-anchor="middle" style="font-size:${Math.min(34, Math.round(520 / F.stamp.length))}px">${esc(F.stamp)}</text></g>
    <text x="60" y="300" class="mf-in">In this file:</text>
    ${F.inside.map(([e, t], i) => { const y = 340 + i * 44; return `<rect x="62" y="${y - 24}" width="28" height="28" rx="5" class="mf-box"/>${em(122, y - 10, 34, e)}<text x="150" y="${y}" class="mf-item">${esc(t)}</text>`; }).join('')}
    <text x="420" y="430" class="mf-in">${esc(k.def.leadRole)}</text><line x1="420" y1="480" x2="740" y2="480" class="mf-line"/><text x="420" y="472" class="mf-sign" data-fit-w="320">${esc(k.lead)}</text>`;
  // The back panel prints upside down so it reads the right way once folded behind.
  const back = `<g transform="rotate(180 395 760)">
    <rect x="10" y="520" width="770" height="480" class="mf-manila back"/>
    <text x="395" y="600" class="mf-kicker" text-anchor="middle">${esc(k.placeName)}</text>
    <text x="395" y="650" class="mf-back-t" text-anchor="middle">Please return this file to the front desk</text>
    ${[720, 780, 840, 900].map((y) => `<line x1="80" y1="${y}" x2="710" y2="${y}" class="mf-line soft"/>`).join('')}
    <text x="80" y="705" class="mf-small">Notes</text>
    ${Array.from({ length: 28 }, (_, i) => `<rect x="${520 + i * 7}" y="930" width="${i % 3 ? 3 : 5}" height="44" fill="#5a4630"/>`).join('')}
  </g>`;
  const cut = `<path d="M10,1000 L10,60 Q10,46 24,46 L${tabX},46 L${tabX + 22},6 L${tabX + 310},6 L${tabX + 332},46 L766,46 Q780,46 780,60 L780,1000 Z" class="cut-dash" fill="none"/>
    <line x1="10" y1="520" x2="780" y2="520" class="fold-dot"/><text x="395" y="540" class="mf-fold" text-anchor="middle">fold back here</text>`;
  return `<section class="page props mf-page"><div class="mf-tip">${esc(`${F.title} · Cut along the dashed line, fold back on the dotted line (printed side out) and slip the forms inside.`)}</div>
    <svg viewBox="0 0 790 1004" class="mf-art">${front}${back}${cut}</svg></section>`;
}

function intakeHalf(k, subject) {
  const I = k.def.folders.intake;
  const val = (i) => (!subject || I.prefill === false ? '' : i === 0 ? subject.name : i === 1 ? k.def.kinds[subject.kind][1] : '');
  const FIGURES = {
    person: '<circle cx="100" cy="42" r="32"/><path d="M62,84 Q100,74 138,84 L176,150 Q182,164 168,168 L140,128 L144,196 L156,268 Q156,278 144,278 L112,278 L100,206 L88,278 L56,278 Q44,278 44,268 L56,196 L60,128 L32,168 Q18,164 24,150 Z"/>',
    teeth: Array.from({ length: 10 }, (_, i) => { const a = Math.PI * (0.1 + i * 0.0889); return `<rect x="${(100 - 80 * Math.cos(a) - 13).toFixed(1)}" y="${(118 - 80 * Math.sin(a) - 16).toFixed(1)}" width="26" height="32" rx="10"/><rect x="${(100 - 80 * Math.cos(a) - 13).toFixed(1)}" y="${(162 + 80 * Math.sin(a) - 16).toFixed(1)}" width="26" height="32" rx="10"/>`; }).join(''),
  };
  // 'pet' shows the patient's own picture to mark up; 'scene' is an empty box to draw in.
  const kind = (subject || { kind: k.def.defaultKinds[0] }).kind;
  const body = I.figure === 'scene' ? '<div class="mf-scene"></div>' : I.figure === 'pet' ? `<div class="mf-pet">${pic(k.def.kinds[kind][0], '1.7in')}</div>` : `<svg viewBox="0 0 200 280" class="mf-body">${FIGURES[I.figure || 'person']}</svg>`;
  return `<div class="mf-intake">
    <header class="rec-head"><span class="em">📝</span><h2>${esc(I.title)}</h2><span class="clinic">${esc(k.placeName)}</span></header>
    <div class="mf-in-cols"><div class="mf-in-left">
      <div class="mf-fields">${I.fields.map((f, i) => `<div class="field"><b>${esc(f)}:</b><span class="fill">${esc(val(i))}</span></div>`).join('')}</div>
      <div class="mf-q">${esc(I.reasonsLabel || 'What brings you in today?')}</div>
      <div class="mf-opts">${I.reasons.map(([e, t]) => `<span><i class="box"></i>${pic(e, '.46in')}${esc(t)}</span>`).join('')}</div>
      <div class="mf-q">${esc(I.allergiesLabel || 'Allergies')}</div>
      <div class="mf-opts">${I.allergies.map(([e, t]) => `<span><i class="box"></i>${pic(e, '.42in')}${esc(t)}</span>`).join('')}</div>
    </div><div class="mf-in-right">${body}<span class="draw-cap">${esc(I.body)}</span></div></div>
    <div class="field mf-signed"><b>Grown-up’s signature:</b><span class="fill"></span><b>Date:</b><span class="fill short"></span></div>
  </div>`;
}

// A hospital-style ID band: name, birthday, the clinic and a barcode, with a tab to tape.
function wristband(k, i) {
  const sub = k.subjects[i];
  const name = sub ? sub.name || k.def.kinds[sub.kind][1] : '';
  const bars = Array.from({ length: 22 }, (_, j) => `<i style="width:${j % 3 ? 1.5 : 3}px"></i>`).join('');
  return `<div class="mf-wb"><span class="mf-wb-tab">TAPE</span><b>${esc(k.def.folders.tab)}</b><span class="mf-wb-name">${esc(name)}</span><small>${esc(k.placeName)}</small><span class="mf-wb-bars">${bars}</span><span class="mf-wb-dot" style="background:${TAB_COLORS[i % TAB_COLORS.length]}"></span></div>`;
}

function labelsPageFor(k) {
  const F = k.def.folders;
  const tab = (i) => `<div class="mf-tl" style="border-color:${TAB_COLORS[i % TAB_COLORS.length]}"><b style="background:${TAB_COLORS[i % TAB_COLORS.length]}">${esc(F.tab)}</b><i></i></div>`;
  const divider = (t, i) => `<div class="mf-div" style="background:${TAB_COLORS[(i + 2) % TAB_COLORS.length]}">${esc(t)}</div>`;
  const stamp = (t, i) => `<div class="mf-rs" style="transform:rotate(${i % 2 ? 4 : -5}deg)"><span>${esc(t)}</span></div>`;
  return `<section class="page props">${head('File Labels and Stamps', 'Cut out and tape on. Tab labels go on new folders, the dividers go inside, and the stamps go on the front when a file is done.')}
    <div class="mf-sec">Tab labels</div><div class="mf-tls">${Array.from({ length: 8 }, (_, i) => tab(i)).join('')}</div>
    <div class="mf-sec">Dividers</div><div class="mf-divs">${F.tags.map(divider).join('')}</div>
    ${F.wristbands ? `<div class="mf-sec">Patient wristbands: wrap round a paw or an arm and tape the ends</div><div class="mf-wbs">${Array.from({ length: 4 }, (_, i) => wristband(k, i)).join('')}</div>` : ''}
    <div class="mf-sec">Stamps</div><div class="mf-rss">${[...F.stamps, F.stamp].slice(0, 6).map(stamp).join('')}</div>
  </section>`;
}

function folderPages(k) {
  const F = k.def.folders;
  if (!F) return '';
  const subs = k.subjects.length ? k.subjects : k.def.defaultKinds.map((kind) => ({ name: '', kind }));
  const folders = [folderPage(k, k.subjects.length ? subs[0] : null, 0), folderPage(k, k.subjects.length > 1 ? subs[1] : null, 1)].join('');
  const intake = `<section class="page recs">${intakeHalf(k, k.subjects[0] || null)}<div class="cut-h"></div>${intakeHalf(k, k.subjects[1] || null)}</section>`;
  return folders + intake + labelsPageFor(k);
}

// ---------- props ----------

function puppetsPage(k) {
  const P = k.def.props.puppets;
  const one = ([e, n], i) => `<div class="rm-puppet"><svg viewBox="0 0 240 330">
      <circle cx="120" cy="120" r="112" class="rm-puppet-bg${i % 2 ? ' alt' : ''}"/>${em(120, 112, 170, e)}
      <rect x="20" y="186" width="200" height="44" rx="22" class="rm-puppet-name"/><text x="120" y="216" class="rm-puppet-t" text-anchor="middle" style="font-size:${Math.min(26, Math.round(330 / n.length))}px">${esc(n)}</text>
      <rect x="95" y="232" width="50" height="92" rx="6" class="rm-tab"/><text x="120" y="282" class="rm-tab-t" text-anchor="middle" transform="rotate(-90 120 280)">STICK</text>
      <path d="M120,4 A116,116 0 1 1 119.9,4 Z" class="cut-dash" fill="none"/></svg></div>`;
  return `<section class="page props">${head(P.title, P.howTo)}${cardstock}<div class="rm-puppets">${P.list.map(one).join('')}</div></section>`;
}

function fingerprintsPage(k) {
  const P = k.def.props.fingerprints;
  const fingers = ['Thumb', 'Pointer', 'Middle', 'Ring', 'Pinky'];
  const card = (who) => `<div class="fp-card"><header class="rec-head"><span class="em">🖐️</span><h2>Fingerprint Card</h2><span class="clinic">${esc(k.placeName)} · Top secret</span></header>
    <div class="fp-top"><div class="draw-wrap"><div class="pp-photo"></div><span class="draw-cap">Draw yourself</span></div>
      <div class="fp-fields"><div class="field"><b>Name:</b><span class="fill">${esc(who)}</span></div><div class="field"><b>Code name:</b><span class="fill"></span></div><div class="field"><b>Date:</b><span class="fill"></span></div></div></div>
    ${['Left hand', 'Right hand'].map((h) => `<div class="fp-row"><b>${h}</b>${fingers.map((f) => `<div class="fp-box"><span>${f}</span></div>`).join('')}</div>`).join('')}</div>`;
  const kinds = [
    ['Loop', Array.from({ length: 6 }, (_, i) => `<path d="M${30 + i * 8},110 L${30 + i * 8},${60 + i * 4} Q${30 + i * 8},${20 + i * 6} 60,${20 + i * 6} Q${90 - i * 8},${20 + i * 6} ${90 - i * 8},${60 + i * 4} L${90 - i * 8},110"/>`).join('')],
    ['Whorl', Array.from({ length: 6 }, (_, i) => `<ellipse cx="60" cy="65" rx="${8 + i * 9}" ry="${10 + i * 9}"/>`).join('')],
    ['Arch', Array.from({ length: 7 }, (_, i) => `<path d="M8,${108 - i * 12} Q60,${70 - i * 14} 112,${108 - i * 12}"/>`).join('')],
  ];
  return `<section class="page props">${head(P.title, P.howTo)}
    <div class="fp-cards">${card(k.lead)}<div class="cut-h"></div>${card('')}</div>
    <div class="fp-kinds"><b>Which kind are yours?</b>${kinds.map(([n, d]) => `<span><svg viewBox="0 0 120 120" class="fp-kind">${d}</svg>${n}</span>`).join('')}</div>
  </section>`;
}

function hangtagsPage(k) {
  const P = k.def.props.hangtags;
  const tag = (i) => `<div class="ht-tag ${i % 3 === 1 ? 'alt' : ''}"><i class="ht-hole"></i>${pic(k.def.icon, '.75in')}
    <div class="ht-place">${esc(k.placeName)}</div><div class="ht-price">Price <span></span> coins</div>
    <div class="ht-sizes">${['S', 'M', 'L'].map((s) => `<b>${s}</b>`).join('')}</div></div>`;
  return `<section class="page props">${head(P.title, P.howTo)}<div class="ht-grid">${Array.from({ length: 12 }, (_, i) => tag(i)).join('')}</div></section>`;
}

function scoopsPage(k) {
  const P = k.def.props.scoops;
  const scoop = ([n, c]) => `<svg viewBox="0 0 240 220" class="sc-scoop"><path d="M20,150 Q10,30 120,22 Q230,30 220,150 Q205,160 190,150 Q178,190 160,152 Q140,168 120,150 Q100,190 82,152 Q64,166 50,150 Q34,170 20,150 Z" fill="${c}" class="sc-cream"/>
    <path d="M60,70 Q90,44 130,46" class="sc-shine"/><text x="120" y="120" class="sc-t" text-anchor="middle" fill="${parseInt(c.slice(1, 3), 16) < 150 ? '#fff' : '#3f4a73'}">${esc(n)}</text>
    <path d="M12,156 Q0,22 120,12 Q240,22 228,156 L228,170 L12,170 Z" class="cut-dash" fill="none"/></svg>`;
  const cone = () => `<svg viewBox="0 0 240 300" class="sc-cone"><path d="M24,20 L216,20 L120,290 Z" class="sc-waffle"/>
    ${Array.from({ length: 7 }, (_, i) => `<line x1="${24 + i * 32}" y1="20" x2="${120 + (i - 3) * 6}" y2="290" class="sc-grid"/><line x1="${216 - i * 32}" y1="20" x2="${120 - (i - 3) * 6}" y2="290" class="sc-grid"/>`).join('')}
    <rect x="16" y="8" width="208" height="30" rx="14" class="sc-rim"/><path d="M10,2 L230,2 L120,298 Z" class="cut-dash" fill="none"/></svg>`;
  return `<section class="page props">${head(P.title, P.howTo)}${cardstock}
    <div class="sc-scoops">${P.flavors.map(scoop).join('')}</div><div class="sc-cones">${cone()}${cone()}${cone()}</div></section>`;
}

function stampsheetPage(k) {
  const P = k.def.props.stampsheet;
  const inks = ['#d6455d', '#3a6fc4', '#2f9e6b', '#8c4fc4'];
  const stamp = ([e, n], i) => {
    const ink = inks[i % inks.length];
    const round = i % 3 !== 1;
    const shape = round ? `<circle cx="120" cy="100" r="92" class="ps-ring" stroke="${ink}"/><circle cx="120" cy="100" r="80" class="ps-ring thin" stroke="${ink}"/>`
      : `<rect x="16" y="14" width="208" height="172" rx="22" class="ps-ring" stroke="${ink}"/><rect x="28" y="26" width="184" height="148" rx="14" class="ps-ring thin" stroke="${ink}"/>`;
    return `<div class="ps-stamp" style="transform:rotate(${[-8, 5, -3, 7][i % 4]}deg)"><svg viewBox="0 0 240 200">${shape}
      <g opacity=".85">${em(120, 84, 74, e)}</g>
      <text x="120" y="${round ? 152 : 156}" class="ps-name" fill="${ink}" text-anchor="middle" style="font-size:${Math.min(20, Math.round((round ? 200 : 260) / n.length))}px">${esc(n.toUpperCase())}</text>
      <text x="120" y="${round ? 40 : 46}" class="ps-ok" fill="${ink}" text-anchor="middle">★ ARRIVED ★</text></svg></div>`;
  };
  return `<section class="page props">${head(P.title, P.howTo)}<div class="ps-grid">${P.places.map(stamp).join('')}</div></section>`;
}

const PROPS = [['puppets', puppetsPage], ['fingerprints', fingerprintsPage], ['hangtags', hangtagsPage], ['scoops', scoopsPage], ['stampsheet', stampsheetPage]];

const roomsCss = `
.rm-brad { fill:#fff; stroke:var(--navy); stroke-width:3; }
.rm-burners { flex:1; display:grid; grid-template-columns:1fr 1fr; align-items:center; justify-items:center; }
.rm-burner { height:auto; } .rm-shine { fill:none; stroke:#fff; stroke-width:10; opacity:.18; stroke-linecap:round; }
.rm-burner-n { font:700 26px 'Fredoka'; fill:#fff; opacity:.6; }
.rm-panel { width:100%; display:block; } .rm-knobs svg { width:100%; display:block; margin:.15in 0; }
.rm-dial { fill:#fff; stroke:#9aa3b8; stroke-width:5; } .rm-dial-t { font:700 22px 'Fredoka'; fill:var(--navy); } .rm-dial-n { font:700 22px 'Fredoka'; fill:#66708f; }
.rm-knob-in { fill:#eef1f6; }
.rm-oven-clock svg { width:100%; display:block; } .rm-clock-face { fill:#16301f; } .rm-clock-t { font:700 92px 'Fredoka'; fill:#7cf29a; letter-spacing:6px; }
.rm-clock-n { font:600 34px 'Fredoka'; fill:#fff; }
.rm-faucet-row { display:flex; align-items:flex-start; gap:.2in; } .rm-faucet { width:5.6in; } .rm-water { width:1.2in; }
.rm-chrome { fill:#c9d1dc; stroke:#7d8798; stroke-width:5; } .rm-chrome-d { fill:#9aa5b5; stroke:#6c7686; stroke-width:4; }
.rm-chrome-hi { fill:none; stroke:#fff; stroke-width:10; stroke-linecap:round; opacity:.8; }
.rm-slit { stroke:var(--navy); stroke-width:5; } .rm-small { font:600 20px 'Fredoka'; fill:#66708f; }
.rm-tab { fill:#eef1f6; stroke:#9aa3b8; stroke-width:3; stroke-dasharray:8 6; } .rm-tab-t { font:700 20px 'Fredoka'; fill:#7d86a3; letter-spacing:2px; }
.rm-handles { width:100%; display:block; } .rm-handle { stroke-width:5; } .rm-handle.hot { fill:#e8574b; stroke:#a8362c; } .rm-handle.cold { fill:#3a8de0; stroke:#245d99; }
.rm-handle-t { font:700 22px 'Fredoka'; fill:#fff; }
.rm-water-b { fill:#8fd3f4; } .rm-water-l { fill:none; stroke:#fff; stroke-width:7; stroke-linecap:round; }
.rm-basin { width:100%; flex:1; min-height:0; } .rm-counter { fill:#f3ece0; stroke:#c9bba3; stroke-width:5; } .rm-bowl { fill:#e3e8ef; stroke:#aab3c2; stroke-width:4; }
.rm-drain { fill:#9aa5b5; stroke:#6c7686; stroke-width:4; } .rm-drain-l { stroke:#5d6676; stroke-width:5; }
.rm-sink-extras { display:flex; justify-content:space-around; margin-top:.15in; } .rm-sink-item { border:2px dashed #b7c0cc; border-radius:.16in; padding:.08in .2in; display:flex; flex-direction:column; align-items:center; font:700 12pt 'Fredoka'; }
.rm-wall-tip { font:600 10pt 'Fredoka'; color:#66708f; margin-bottom:.1in; text-align:center; }
.rm-wall { width:100%; flex:1; min-height:0; outline:2px dashed #b7c0cc; }
.rm-grout { fill:#d9dee6; } .rm-tile { fill:#fff; } .rm-tile.accent { fill:var(--mint); }
.rm-plaque { fill:var(--teal); } .rm-plaque-in { fill:none; stroke:#fff; stroke-width:4; stroke-dasharray:2 12; stroke-linecap:round; }
.rm-plaque-t { font:400 64px 'Pacifico', 'Fredoka'; fill:#fff; } .rm-plaque-s { font:700 28px 'Fredoka'; fill:var(--mint-l); }
.rm-rail { fill:#a0a9b8; stroke:#6c7686; stroke-width:4; } .rm-hook { stroke:#6c7686; stroke-width:8; fill:none; stroke-linecap:round; }
.rm-shelf { fill:#b98a56; } .rm-jar { fill:#eaf4f8; stroke:#a9bfcb; stroke-width:4; } .rm-jar-lid { fill:var(--teal); } .rm-jar-t { font:700 19px 'Fredoka'; fill:var(--navy); }
.rm-clock { fill:var(--teal); } .rm-clock-in { fill:#fff; } .rm-clock-dot { fill:var(--navy); } .rm-clock-h { stroke:var(--navy); stroke-width:9; stroke-linecap:round; }
.rm-board-frame { fill:#a87b4f; } .rm-board { fill:#2f3a36; } .rm-board-t { font:400 40px 'Pacifico', 'Fredoka'; fill:#fff; } .rm-board-l { stroke:#fff; stroke-width:2; opacity:.35; stroke-dasharray:6 8; }
.rm-valance, .rm-footlights { width:100%; display:block; }
.rm-velvet { fill:#b3203a; } .rm-fringe { stroke:#e9b949; stroke-width:6; } .rm-marquee { fill:#2b1d2e; stroke:#e9b949; stroke-width:6; }
.rm-marquee-t { font:400 62px 'Pacifico', 'Fredoka'; fill:#fff4d6; } .rm-bulb { fill:#ffe48a; stroke:#e9b949; stroke-width:3; }
.rm-boards { fill:#b98a56; } .rm-board-line { stroke:#8f6438; stroke-width:3; } .rm-gold { fill:#e9b949; stroke:#b98a1e; stroke-width:3; }
.rm-fold { fill:none; stroke:#7e1424; stroke-width:8; opacity:.5; stroke-linecap:round; }
.rm-poster { flex:1; border:4px solid var(--teal); border-radius:.2in; margin-top:.1in; padding:.15in .25in; display:flex; flex-direction:column; gap:.08in; background:var(--mint-l); }
.rm-poster-k { font:400 30pt 'Pacifico', 'Fredoka'; color:var(--teal-d); text-align:center; } .rm-poster-line { border-bottom:2px solid var(--navy); height:.45in; }
.rm-poster-draw { flex:1; border:2px dashed #b7c0cc; border-radius:.14in; display:grid; place-items:center; font:600 11pt 'Fredoka'; color:#9aa3b8; background:#fff; }
.rm-poster-row { display:flex; gap:.1in; font:600 12pt 'Fredoka'; } .rm-poster-row i { flex:1; border-bottom:1.5px solid var(--navy); }
.rm-curtains { flex:1; display:flex; justify-content:center; gap:.3in; min-height:0; } .rm-curtain { height:100%; }
.mf-page { padding:.25in .3in; } .mf-tip { font:600 10pt 'Fredoka'; color:#66708f; text-align:center; margin-bottom:.06in; }
.mf-art { width:100%; flex:1; min-height:0; }
.mf-manila { fill:#f2d79b; stroke:#c9a75c; stroke-width:3; } .mf-manila.back { fill:#efd193; }
.mf-tablabel { fill:#fff; stroke:#c9a75c; stroke-width:2; } .mf-tab-t { font:700 18px 'Fredoka'; fill:#8a6a2c; letter-spacing:1px; text-transform:uppercase; } .mf-tab-name { font:600 22px 'Fredoka'; fill:var(--navy); }
.mf-letter { font:700 40px 'Fredoka'; fill:#fff; }
.mf-label { fill:#fffdf6; stroke:#c9a75c; stroke-width:2; } .mf-kicker { font:700 18px 'Fredoka'; fill:var(--teal); letter-spacing:2px; text-transform:uppercase; }
.mf-big { font:700 42px 'Fredoka'; fill:var(--navy); letter-spacing:1px; } .mf-no { font:600 20px 'Fredoka'; fill:#8a6a2c; }
.mf-photo { fill:#fffdf6; stroke:#c9a75c; stroke-width:3; stroke-dasharray:6 6; } .mf-small { font:600 18px 'Fredoka'; fill:#9a8a6a; }
.mf-stamp { fill:none; stroke:#d0343f; stroke-width:6; opacity:.85; } .mf-stamp.thin { stroke-width:2; } .mf-stamp-t { font:700 34px 'Fredoka'; fill:#d0343f; letter-spacing:3px; opacity:.88; }
.mf-in { font:700 22px 'Fredoka'; fill:#8a6a2c; } .mf-box { fill:#fff; stroke:var(--navy); stroke-width:3; } .mf-item { font:600 22px 'Fredoka'; fill:var(--navy); }
.mf-line { stroke:var(--navy); stroke-width:2; } .mf-line.soft { stroke:#b89a5a; } .mf-sign { font:400 30px 'Pacifico', 'Fredoka'; fill:var(--navy); }
.mf-back-t { font:600 22px 'Fredoka'; fill:#8a6a2c; } .mf-fold { font:600 15px 'Fredoka'; fill:#8a6a2c; }
.mf-intake { flex:1; display:flex; flex-direction:column; padding:.05in 0; }
.mf-in-cols { flex:1; display:flex; gap:.2in; } .mf-in-left { flex:1; display:flex; flex-direction:column; justify-content:space-around; } .mf-in-right { width:1.9in; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; }
.mf-fields { display:grid; grid-template-columns:1fr 1fr; gap:0 .2in; }
.mf-q { font:700 13pt 'Fredoka'; color:var(--teal-d); margin:.06in 0 .03in; }
.mf-opts { display:grid; grid-template-columns:repeat(3, 1fr); gap:.06in .1in; } .mf-opts span { display:flex; align-items:center; gap:.06in; font:600 12pt 'Fredoka'; }
.mf-body { width:1.7in; height:2.5in; fill:#fff; stroke:var(--navy); stroke-width:4; }
.mf-pet { width:1.9in; height:2.3in; display:grid; place-items:center; border:2px dashed #b7c0cc; border-radius:.14in; }
.mf-scene { width:1.8in; height:2.5in; border:2px dashed #b7c0cc; border-radius:.14in; }
.mf-signed { margin-top:.06in; } .fill.short { flex:none; width:1.3in; }
.mf-sec { font:700 13pt 'Fredoka'; color:var(--teal-d); margin:.1in 0 .06in; }
.mf-tls { display:grid; grid-template-columns:repeat(4, 1fr); gap:.12in; }
.mf-tl { border:3px solid; border-radius:.1in; height:.8in; display:flex; flex-direction:column; outline:2px dashed #b7c0cc; outline-offset:4px; }
.mf-tl b { color:#fff; font:700 11pt 'Fredoka'; text-transform:uppercase; letter-spacing:.06em; padding:.03in .1in; } .mf-tl i { flex:1; margin:.08in .1in; border-bottom:1.5px solid var(--navy); }
.mf-divs { display:grid; grid-template-columns:1fr 1fr; gap:.14in; } .mf-div { color:#fff; font:700 20pt 'Fredoka'; letter-spacing:.08em; text-align:center; padding:.14in; border-radius:.14in .14in .04in .04in; outline:2px dashed #b7c0cc; outline-offset:4px; }
.mf-rss { display:grid; grid-template-columns:repeat(3, 1fr); gap:.25in; padding:.1in .1in 0; }
.mf-wbs { display:flex; flex-direction:column; gap:.1in; }
.mf-wb { height:.5in; border:2px solid #9fb3cc; border-radius:.25in; background:#f4f8fd; display:flex; align-items:center; gap:.12in; padding:0 .2in 0 0; outline:2px dashed #b7c0cc; outline-offset:3px; overflow:hidden; }
.mf-wb-tab { align-self:stretch; width:.55in; background:#e2e9f2; display:grid; place-items:center; font:700 8pt 'Fredoka'; color:#7d86a3; letter-spacing:.06em; }
.mf-wb b { font:700 10pt 'Fredoka'; color:var(--teal); text-transform:uppercase; } .mf-wb-name { flex:1; border-bottom:1.5px solid var(--navy); font:600 13pt 'Fredoka'; min-height:1.2em; }
.mf-wb small { font:600 9pt 'Fredoka'; color:#66708f; } .mf-wb-bars { display:flex; gap:1.5px; height:.3in; } .mf-wb-bars i { background:var(--navy); display:block; }
.mf-wb-dot { width:.22in; height:.22in; border-radius:50%; flex:none; }
.mf-rs { border:5px solid #d0343f; border-radius:.1in; padding:.05in; outline:2px dashed #b7c0cc; outline-offset:8px; }
.mf-rs span { display:block; border:2px solid #d0343f; border-radius:.06in; text-align:center; font:700 17pt 'Fredoka'; color:#d0343f; letter-spacing:.08em; padding:.14in .04in; }
.rm-puppets { flex:1; display:grid; grid-template-columns:repeat(3, 1fr); align-items:center; justify-items:center; }
.rm-puppet svg { width:2.35in; } .rm-puppet-bg { fill:var(--mint-l); stroke:var(--teal); stroke-width:8; } .rm-puppet-bg.alt { fill:#fff6dd; stroke:var(--orange); }
.rm-puppet-name { fill:var(--teal); } .rm-puppet-t { font:700 26px 'Fredoka'; fill:#fff; }
.fp-cards { display:flex; flex-direction:column; }
.fp-card { padding:.05in 0 .1in; } .fp-top { display:flex; gap:.2in; align-items:center; } .fp-top .pp-photo { width:1.1in; height:1.1in; border:2px dashed #b7c0cc; border-radius:.1in; }
.fp-fields { flex:1; } .fp-row { display:flex; align-items:center; gap:.08in; margin-top:.08in; } .fp-row > b { width:.95in; font:700 11pt 'Fredoka'; color:var(--teal-d); }
.fp-box { flex:1; height:.85in; border:2.5px solid var(--navy); border-radius:.08in; position:relative; } .fp-box span { position:absolute; bottom:2px; left:0; right:0; text-align:center; font:600 9pt 'Fredoka'; color:#8a93ab; }
.fp-kinds { margin-top:auto; display:flex; align-items:center; justify-content:space-around; border:2px solid var(--mint); background:var(--mint-l); border-radius:.16in; padding:.08in .2in; font:700 13pt 'Fredoka'; }
.fp-kinds span { display:flex; flex-direction:column; align-items:center; font:600 11pt 'Fredoka'; } .fp-kind { width:.9in; height:.9in; fill:none; stroke:var(--navy); stroke-width:3.5; stroke-linecap:round; }
.ht-grid { flex:1; display:grid; grid-template-columns:repeat(3, 1fr); grid-template-rows:repeat(4, 1fr); gap:.16in; }
.ht-tag { border:3px solid var(--teal); background:var(--mint-l); clip-path:polygon(18% 0, 82% 0, 100% 14%, 100% 100%, 0 100%, 0 14%); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.03in; position:relative; padding-top:.25in; }
.ht-tag.alt { border-color:var(--orange); background:#fff6dd; } .ht-hole { position:absolute; top:.1in; width:.2in; height:.2in; border-radius:50%; border:2.5px solid var(--navy); background:#fff; }
.ht-place { font:700 10.5pt 'Fredoka'; color:var(--teal-d); text-align:center; } .ht-price { font:600 11pt 'Fredoka'; display:flex; gap:4px; align-items:flex-end; } .ht-price span { width:.5in; border-bottom:1.5px solid var(--navy); }
.ht-sizes { display:flex; gap:.08in; } .ht-sizes b { width:.3in; height:.3in; border:2px solid var(--navy); border-radius:50%; display:grid; place-items:center; font:700 10pt 'Fredoka'; }
.sc-scoops { display:grid; grid-template-columns:repeat(3, 1fr); gap:.1in; justify-items:center; } .sc-scoop { width:2.3in; }
.sc-cream { stroke:rgba(0,0,0,.18); stroke-width:4; } .sc-shine { fill:none; stroke:#fff; stroke-width:9; stroke-linecap:round; opacity:.6; } .sc-t { font:700 24px 'Fredoka'; }
.sc-cones { flex:1; display:flex; justify-content:space-around; align-items:center; } .sc-cone { width:2in; }
.sc-waffle { fill:#e7b467; stroke:#b98232; stroke-width:4; } .sc-grid { stroke:#c4903f; stroke-width:3; } .sc-rim { fill:#d79f4f; stroke:#b98232; stroke-width:3; }
.ps-grid { flex:1; display:grid; grid-template-columns:repeat(3, 1fr); grid-template-rows:repeat(4, 1fr); gap:.12in; align-items:center; justify-items:center; }
.ps-stamp { width:2.25in; outline:2px dashed #b7c0cc; outline-offset:4px; } .ps-ring { fill:none; stroke-width:6; opacity:.85; } .ps-ring.thin { stroke-width:2.5; }
.ps-name { font:700 22px 'Fredoka'; letter-spacing:1px; } .ps-ok { font:700 15px 'Fredoka'; letter-spacing:2px; }
`;

module.exports = { APPLIANCES, APPLIANCE_NAMES, folderPages, PROPS, roomsCss };
