// Turns a hunt config into a print-ready HTML document (rendered to PDF by render.js).
//
// Config shape:
//   { theme: 'dino', childName?: 'Maya', age?: 5, date?: 'June 3',
//     spots: ['couch', 'fridge', { label: 'Grandma’s Piano', riddle: [l1, l2], tip }],
//     promo?: 'footer line for the host guide' }
// The last spot is where the prize/cake goes. One clue card per spot:
// card 1 is handed to the kids after the briefing, card k is hidden at spot k-1.

const path = require('path');
const THEMES = require('./themes');
const SPOTS = require('./spots');

const FONT_DIR = path.join(__dirname, '..', '..', 'fonts');

// Simple drawings for spots that have no good emoji (see `pic` in spots.js).
const PICTOS = {
  fridge: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"><rect x="15" y="4" width="34" height="56" rx="5"/><path d="M15 24h34M21 11v7M21 30v12"/></svg>`,
  washer: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"><rect x="8" y="6" width="48" height="52" rx="5"/><path d="M8 18h48"/><circle cx="32" cy="38" r="13"/><circle cx="16" cy="12" r="1.5" fill="currentColor"/><circle cx="23" cy="12" r="1.5" fill="currentColor"/><path d="M24 40c4-4 12 4 16 0" stroke-width="3"/></svg>`,
  swing: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 60L16 6h32l10 54M16 6h32"/><path d="M24 8v34M40 8v34"/><rect x="20" y="42" width="24" height="6" rx="2" fill="currentColor"/></svg>`,
};

function picHtml(spot) {
  const pic = spot.pic || '🔍';
  return pic.startsWith('svg:') ? `<span class="picto">${PICTOS[pic.slice(4)] || '🔍'}</span>` : `<span class="emoji">${esc(pic)}</span>`;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Small deterministic PRNG so the same order always produces the same pack.
function seededShuffle(arr, seedStr) {
  let h = 2166136261;
  for (const c of seedStr) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    const j = ((h ^= h >>> 16) >>> 0) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function resolveSpot(s) {
  if (typeof s === 'string') {
    const spot = SPOTS[s];
    if (!spot) throw new Error(`Unknown spot "${s}". Known: ${Object.keys(SPOTS).join(', ')}`);
    return spot;
  }
  if (!s.label || !s.riddle) throw new Error('Custom spots need a label and a two-line riddle');
  return { tip: s.label, ...s };
}

function planHunt(cfg) {
  const theme = THEMES[cfg.theme];
  if (!theme) throw new Error(`Unknown theme "${cfg.theme}"`);
  const spots = cfg.spots.map(resolveSpot);
  if (spots.length < 3 || spots.length > 12) throw new Error('Use between 3 and 12 spots');

  const middles = seededShuffle(theme.openers.middle, `${cfg.theme}|${cfg.childName || ''}|${spots.map((s) => s.label).join()}`);
  const cards = spots.map((target, i) => {
    const n = i + 1;
    const opener = n === 1 ? theme.openers.start : n === spots.length ? theme.openers.last : middles[(i - 1) % middles.length];
    return {
      n,
      total: spots.length,
      hiddenAt: i === 0 ? null : spots[i - 1],
      leadsTo: target,
      lines: [...opener, ...target.riddle],
    };
  });
  // Picture clues: on for ages 3 to 5 unless the order says otherwise.
  const pictures = cfg.pictures !== undefined ? Boolean(cfg.pictures) : Boolean(cfg.age && cfg.age <= 5);
  return { theme, spots, cards, prize: spots[spots.length - 1], pictures };
}

function fill(text, ctx) {
  return text.replace(/\{(\w+)\}/g, (_, k) => (ctx[k] !== undefined ? ctx[k] : `{${k}}`));
}

// ---------- page builders ----------

function hostGuide(plan, cfg) {
  const { theme, cards, prize } = plan;
  const forLine = cfg.childName
    ? `Made for ${esc(cfg.childName)}${cfg.age ? `’s ${ordinal(cfg.age)} birthday` : ''}`
    : `Ages ${theme.ages} · ${cards.length} clues`;
  const rows = cards
    .map(
      (c) => `<tr>
        <td class="num">${c.n}</td>
        <td>${c.hiddenAt ? `<b>${esc(c.hiddenAt.label)}</b><span class="tip">${esc(c.hiddenAt.tip)}</span>` : '<b>Keep with you</b><span class="tip">Read it right after the Mission Briefing</span>'}</td>
        <td>${esc(c.leadsTo.label)}</td>
        <td class="check"><span class="box"></span></td>
      </tr>`
    )
    .join('');
  return `<section class="page host">
    <header class="page-head">
      <div class="icon">${theme.icon}</div>
      <div>
        <div class="kicker">Host Guide · Keep this page secret!</div>
        <h1>${esc(theme.name)}</h1>
        <div class="sub">${forLine}</div>
      </div>
    </header>
    <ol class="steps">
      <li><b>Print</b> every page at <b>Actual Size / 100%</b>, then cut the clue cards along the dashed lines.</li>
      <li><b>Hide</b> cards 2 to ${cards.length} using the checklist below. Tick each box as you go.</li>
      <li><b>Put the prize</b> (cake, favor bags or treasure) at the <b>${esc(prize.label)}</b>.</li>
      <li><b>Start the hunt:</b> read the Mission Briefing out loud, then read Clue #1.</li>
    </ol>
    <table class="checklist">
      <thead><tr><th>Clue</th><th>Hide it at</th><th>Its riddle leads to</th><th>Done</th></tr></thead>
      <tbody>${rows}
        <tr class="prize-row"><td class="num">★</td><td><b>${esc(prize.label)}</b><span class="tip">Prize, cake or treasure goes here</span></td><td>The end! Hand out certificates</td><td class="check"><span class="box"></span></td></tr>
      </tbody>
    </table>
    <div class="tips">
      ${plan.pictures
        ? '<div><b>Picture clues:</b> every card shows a picture of the next spot, so kids who can’t read yet can solve it themselves. Read the riddle aloud for extra fun.</div>'
        : '<div><b>Ages 3–4:</b> read each riddle aloud and give little hints. <b>Ages 6–8:</b> let the kids take turns reading.</div>'}
      <div><b>Bonus fun:</b> tuck a sticker or small treat (like a toy ${esc(theme.treasureWord)}) with each card.</div>
      <div><b>Safety:</b> only hide cards in spots that are safe for little hands to open.</div>
    </div>
    ${cfg.promo ? `<div class="promo">${esc(cfg.promo)}</div>` : ''}
  </section>`;
}

function briefing(plan, cfg) {
  const { theme, cards, prize } = plan;
  const kids = cfg.childName ? `${esc(cfg.childName)} and the ${theme.hunters}` : `brave ${theme.hunters}`;
  const ctx = { kids, name: esc(cfg.childName || ''), age: cfg.age || '', count: cards.length, prize: esc(prize.label) };
  const paras = theme.briefing.paragraphs.map((p, i) => `<p class="${i === 0 ? 'greet' : ''}">${fill(p, ctx)}</p>`).join('');
  return `<section class="page briefing">
    <div class="frame">
      <div class="brief-head">
        <div class="icon big">${theme.icon}</div>
        <div class="kicker">Read aloud to start the adventure</div>
        <h1>${esc(theme.briefing.title)}</h1>
        ${cfg.childName && cfg.age ? `<div class="sub">For ${esc(cfg.childName)}’s ${ordinal(cfg.age)} birthday mission</div>` : ''}
      </div>
      <div class="letter">${paras}</div>
      <div class="sign">
        <div>${esc(theme.briefing.signoff)}</div>
        <div class="signer">${esc(theme.briefing.from)}</div>
      </div>
    </div>
  </section>`;
}

function card(c, theme, pictures) {
  const footerLeft = c.hiddenAt
    ? `Parent check: hidden at <b>${esc(c.hiddenAt.label)}</b> · leads to <b>${esc(c.leadsTo.label)}</b>`
    : `Parent check: read after the briefing · leads to <b>${esc(c.leadsTo.label)}</b>`;
  return `<div class="cut">
    <span class="scissors">✂</span>
    <div class="card">
      <div class="card-head">
        <span class="icon sm">${theme.icon}</span>
        <span class="card-title">${esc(theme.cardHeader)}</span>
        <span class="badge">${esc(theme.badge)} #${c.n}</span>
      </div>
      <div class="body${pictures ? ' with-pic' : ''}">
        <div class="riddle">
          <p>${esc(c.lines[0])}<br>${esc(c.lines[1])}</p>
          <p>${esc(c.lines[2])}<br>${esc(c.lines[3])}</p>
        </div>
        ${pictures ? `<div class="pic-hint"><div class="pic">${picHtml(c.leadsTo)}</div><span>Look here!</span></div>` : ''}
      </div>
      <div class="card-foot">
        <span>${footerLeft}</span>
        <span class="progress">${theme.grid ? `<span class="gauge">${'<i class="on"></i>'.repeat(c.n)}${'<i></i>'.repeat(c.total - c.n)}</span>` : ''}Mission ${c.n} of ${c.total}</span>
      </div>
    </div>
  </div>`;
}

function cardSheets(plan) {
  const out = [];
  for (let i = 0; i < plan.cards.length; i += 2) {
    const pair = plan.cards.slice(i, i + 2);
    out.push(`<section class="page sheet">${pair.map((c) => card(c, plan.theme, plan.pictures)).join('<div class="gap"></div>')}</section>`);
  }
  return out.join('');
}

function certificate(plan, cfg) {
  const { theme } = plan;
  const c = theme.certificate;
  return `<section class="page cert">
    <div class="frame">
      <div class="icon big">${theme.icon}</div>
      <div class="kicker">${esc(c.subtitle)}</div>
      <h1 class="cert-title">${esc(c.title)}</h1>
      <div class="certify">This certifies that</div>
      <div class="name-line">${cfg.childName ? esc(cfg.childName) : '&nbsp;'}</div>
      <p class="cert-body">${esc(c.body)}</p>
      <div class="award">${esc(c.award)}</div>
      <div class="sig-row">
        <div><div class="line">${cfg.date ? esc(cfg.date) : '&nbsp;'}</div>Date</div>
        <div class="seal">${theme.icon}</div>
        <div><div class="line signer">${esc(c.signer)}</div>Signed</div>
      </div>
    </div>
  </section>`;
}

// ---------- styles ----------

function css(theme) {
  const c = theme.colors;
  const f = theme.fonts;
  const font = (family, file, weight = 'normal') =>
    `@font-face{font-family:'${family}';src:url('file://${FONT_DIR}/${file}');font-weight:${weight};}`;
  return `
${font('Fredoka', 'Fredoka.ttf', '300 700')}
${font('Bangers', 'Bangers-Regular.ttf')}
${font('Pirata One', 'PirataOne-Regular.ttf')}
${font('Orbitron', 'Orbitron.ttf', '400 900')}
${font('Cinzel Decorative', 'CinzelDecorative-Bold.ttf', '700')}
@page { size: letter; margin: 0; }
:root { --paper:${c.paper}; --ink:${c.ink}; --primary:${c.primary}; --accent:${c.accent}; --soft:${c.soft}; }
* { box-sizing: border-box; }
html, body { margin:0; padding:0; }
body { font-family: 'Fredoka', sans-serif; color: var(--ink); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { width:8.5in; height:11in; position:relative; overflow:hidden; page-break-after:always; background:#fff; }
.page:last-child { page-break-after:auto; }
h1, .card-title, .badge, .cert-title, .award, .signer, .kicker {
  font-family: '${f.display}', 'Fredoka', sans-serif; font-weight:${f.displayWeight}; text-transform:${f.displayTransform};
}
.icon svg { width:100%; height:100%; display:block; }
.icon { color: var(--primary); }
.icon.big { width:.9in; height:.9in; margin:0 auto .12in; color: var(--accent); }
.icon.sm { width:.3in; height:.3in; flex:none; }

/* host guide */
.host { padding:.6in .7in; }
.page-head { display:flex; gap:.22in; align-items:center; border-bottom:3px solid var(--primary); padding-bottom:.16in; }
.page-head .icon { width:.75in; height:.75in; flex:none; }
.kicker { font-size:10pt; letter-spacing:.06em; color:var(--accent); text-transform:uppercase; }
.host h1 { font-size:24pt; margin:.02in 0; color:var(--primary); line-height:1.1; }
.sub { font-size:12pt; color:#555; }
.steps { font-size:11.5pt; line-height:1.5; margin:.2in 0 .16in; padding-left:.25in; }
.checklist { width:100%; border-collapse:collapse; font-size:11pt; }
.checklist th { text-align:left; background:var(--primary); color:#fff; padding:.07in .1in; font-weight:600; font-size:10pt; }
.checklist td { padding:.06in .1in; border-bottom:1px solid #ddd; vertical-align:middle; }
.checklist tr:nth-child(even) td { background:#faf8f4; }
.checklist .num { font-weight:700; color:var(--primary); width:.5in; text-align:center; font-size:13pt; }
.checklist .tip { display:block; font-size:9pt; color:#777; }
.checklist .check { width:.55in; text-align:center; }
.box { display:inline-block; width:.2in; height:.2in; border:2px solid var(--primary); border-radius:3px; }
.prize-row td { background: var(--soft) !important; }
.tips { margin-top:.18in; font-size:10.5pt; line-height:1.45; display:grid; gap:.05in; }
.promo { position:absolute; left:.7in; right:.7in; bottom:.45in; text-align:center; font-size:10pt; color:#666; border-top:1px dashed #bbb; padding-top:.1in; }

/* briefing + certificate frame */
.briefing, .cert { background: var(--paper); padding:.45in; }
.frame { height:100%; border:3px solid var(--primary); outline:1.5px solid var(--accent); outline-offset:-10px; border-radius:10px; padding:.5in .65in; position:relative; display:flex; flex-direction:column; }
.brief-head { text-align:center; }
.briefing h1 { font-size:32pt; margin:.04in 0 .04in; color:var(--primary); line-height:1.05; }
.letter { font-size:15pt; line-height:1.6; margin-top:.2in; }
.letter p { margin:0 0 .14in; }
.letter .greet { font-weight:600; font-size:17pt; color:var(--primary); }
.sign { margin-top:auto; text-align:right; font-size:14pt; }
.sign .signer { font-size:20pt; color:var(--primary); }

/* clue card sheets */
.sheet { display:flex; flex-direction:column; align-items:center; justify-content:center; }
.gap { height:.9in; }
.cut { width:6in; height:4in; border:1.5px dashed #9a9a9a; position:relative; padding:.12in; }
.scissors { position:absolute; top:-.13in; left:.25in; background:#fff; padding:0 .05in; font-size:13pt; color:#777; line-height:1; font-family: 'DejaVu Sans', sans-serif; }
.card { width:100%; height:100%; background:var(--paper); border:2.5px solid var(--primary); border-radius:8px; display:flex; flex-direction:column; padding:.13in .2in .1in; position:relative; overflow:hidden; }
.card-head { display:flex; align-items:center; gap:.1in; border-bottom:2px solid var(--primary); padding-bottom:.07in; }
.card-title { font-size:13pt; color:var(--primary); flex:1; letter-spacing:.02em; white-space:nowrap; }
.badge { font-size:10.5pt; background:var(--accent); color:#fff; padding:.03in .12in; border-radius:20px; white-space:nowrap; }
.riddle { flex:1; display:flex; flex-direction:column; justify-content:center; text-align:center; font-size:15.5pt; line-height:1.48; font-weight:500; }
.riddle p { margin:.05in 0; }
.body { flex:1; display:flex; align-items:center; gap:.1in; min-height:0; }
.body .riddle { align-self:stretch; }
.body.with-pic .riddle { font-size:12.5pt; line-height:1.4; }
.body.with-pic .riddle p { white-space:nowrap; }
.pic-hint { flex:none; width:1.2in; text-align:center; font-family:'Fredoka', sans-serif; font-weight:600; font-size:10pt; color:var(--primary); text-transform:uppercase; letter-spacing:.04em; }
.pic { width:1.1in; height:1.1in; margin:0 auto .05in; border-radius:50%; background:#fff; border:3px dashed var(--accent); display:grid; place-items:center; }
.pic .emoji { font-family:'Noto Color Emoji', sans-serif; font-size:42pt; line-height:1; }
.pic .picto { width:.7in; height:.7in; color:var(--primary); display:block; }
.pic .picto svg { width:100%; height:100%; display:block; }
.card-foot { display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--soft); padding-top:.05in; font-size:7.5pt; color:#7a7a7a; gap:.1in; }
.progress { white-space:nowrap; display:flex; align-items:center; gap:.06in; font-weight:600; }
.gauge { display:inline-flex; gap:2px; }
.gauge i { width:6px; height:9px; border:1px solid var(--primary); border-radius:1px; }
.gauge i.on { background:var(--soft); }

/* certificate */
.cert .frame { text-align:center; align-items:center; justify-content:center; border-width:5px; }
.cert-title { font-size:46pt; color:var(--primary); margin:.05in 0 .2in; line-height:1; }
.certify { font-size:15pt; color:#666; }
.name-line { font-size:36pt; font-weight:600; color:var(--ink); border-bottom:2px solid var(--ink); min-width:5in; margin:.1in 0 .25in; padding-bottom:.04in; }
.cert-body { font-size:15pt; line-height:1.55; max-width:5.6in; margin:0; }
.award { font-size:28pt; color:var(--accent); margin:.2in 0 .5in; }
.sig-row { display:flex; justify-content:space-between; align-items:flex-end; width:100%; font-size:11pt; color:#666; gap:.3in; }
.sig-row > div:not(.seal) { flex:1; }
.sig-row .line { border-bottom:1.5px solid var(--ink); font-size:14pt; white-space:nowrap; color:var(--ink); padding-bottom:.04in; margin-bottom:.05in; min-height:.35in; }
.sig-row .line.signer { color:var(--primary); }
.seal { width:1.05in; height:1.05in; border-radius:50%; background:var(--accent); color:#fff; padding:.2in; border:4px double #fff; outline:3px solid var(--accent); }
.seal svg { width:100%; height:100%; }

${themeCss(theme)}
`;
}

function themeCss(theme) {
  switch (theme.id) {
    case 'dino':
      return `
.card { border-style:double; border-width:5px; }
.card::after { content:''; position:absolute; inset:5px; border:1px dashed var(--accent); border-radius:5px; pointer-events:none; opacity:.6; }
.badge { transform:rotate(-3deg); border:1.5px dashed #fff; outline:2px solid var(--accent); }
.frame { border-style:double; border-width:7px; }`;
    case 'hero':
      return `
.card, .frame { border:3px solid #111; border-radius:4px; box-shadow:5px 5px 0 #111; }
.card { background:
  radial-gradient(circle, rgba(29,63,145,.16) 1.2px, transparent 1.6px) 0 0/9px 9px, #fff; }
.card-head { background:var(--primary); margin:-.13in -.2in .02in; padding:.08in .2in; border-bottom:3px solid #111; }
.card-head .icon, .card-title { color:var(--soft); }
.card-title { font-size:16pt; letter-spacing:.05em; }
.badge { background:var(--soft); color:#111; border:2px solid #111; border-radius:3px; font-size:13pt; transform:rotate(3deg); }
.riddle { font-weight:600; }
.riddle p { background:#fff; border:2px solid #111; border-radius:18px; padding:.04in .14in; margin:.05in auto; }
.briefing, .cert { background: radial-gradient(circle, rgba(214,40,40,.12) 1.4px, transparent 1.8px) 0 0/11px 11px, #fff; }
.frame { background:#fff; outline:none; }
.briefing h1, .cert-title { color:var(--primary); text-shadow:3px 3px 0 var(--soft); letter-spacing:.03em; }
.cert-title { font-size:60pt; }
.award { color:var(--accent); font-size:34pt; }
.kicker { color:var(--accent); }
.seal { background:var(--primary); outline-color:#111; }`;
    case 'pirate':
      return `
.card { border-style:double; border-width:5px; border-radius:2px; background:
  radial-gradient(ellipse at center, transparent 55%, rgba(120,80,20,.13) 100%), var(--paper); }
.card::before { content:''; position:absolute; right:-.35in; bottom:-.4in; width:1.6in; height:1.6in; opacity:.08;
  background:currentColor; -webkit-mask:url("data:image/svg+xml,${encodeURIComponent(theme.icon.replace('fill="#fff"', 'fill="#000"'))}") center/contain no-repeat; color:var(--primary); }
.card-title { font-size:17pt; }
.badge { background:var(--primary); color:var(--soft); font-family:'Fredoka'; font-weight:600; font-size:9.5pt; letter-spacing:.06em; text-transform:uppercase; }
.briefing h1 { font-size:38pt; }
.cert-title { font-size:58pt; }
.award { font-size:32pt; }
.frame { border-style:double; border-width:7px; border-radius:2px; background: radial-gradient(ellipse at center, transparent 60%, rgba(120,80,20,.12) 100%); }`;
    case 'space':
      return `
.card { border-radius:4px; background:
  linear-gradient(rgba(20,36,90,.07) 1px, transparent 1px) 0 0/14px 14px,
  linear-gradient(90deg, rgba(20,36,90,.07) 1px, transparent 1px) 0 0/14px 14px, var(--paper); }
.card-head { background:var(--primary); margin:-.13in -.2in .02in; padding:.08in .2in; border-bottom:none; }
.card-head .icon { color:var(--accent); }
.card-title { color:var(--soft); font-size:10.5pt; letter-spacing:.08em; }
.badge { background:var(--accent); font-size:9pt; border-radius:2px; letter-spacing:.06em; }
.card::after { content:''; position:absolute; right:-.3in; top:.25in; width:1in; height:1in; border-radius:50%; border:1px solid rgba(95,211,230,.35); box-shadow:0 0 0 .15in rgba(95,211,230,.05), 0 0 0 .16in rgba(95,211,230,.25); pointer-events:none; z-index:0; }
.briefing, .cert { background:
  linear-gradient(rgba(20,36,90,.06) 1px, transparent 1px) 0 0/18px 18px,
  linear-gradient(90deg, rgba(20,36,90,.06) 1px, transparent 1px) 0 0/18px 18px, var(--paper); }
.frame { border-radius:4px; outline-color:var(--soft); }
.briefing h1 { font-size:26pt; letter-spacing:.04em; }
.cert-title { font-size:36pt; letter-spacing:.03em; }
.award { font-size:22pt; }
.kicker { color:var(--accent); }`;
    case 'royal':
      return `
.card { border-color:var(--accent); border-width:2px; outline:1px solid var(--accent); outline-offset:-6px;
  border-radius:1.4in 1.4in 10px 10px / .42in .42in 10px 10px; background: linear-gradient(180deg, #fff 0%, var(--paper) 40%, var(--soft) 140%); }
.card { padding-top:.36in; }
.card-head { border-bottom:1px solid var(--accent); }
.card-head .icon { color:var(--accent); }
.card-title { font-size:12.5pt; }
.badge { background:transparent; color:var(--accent); border:1px solid var(--accent); font-size:8.5pt; }
.frame { border-color:var(--accent); border-width:3px; outline-color:var(--primary); border-radius:2.5in 2.5in 14px 14px / .9in .9in 14px 14px; padding-top:.7in;
  background: linear-gradient(180deg, #fff, var(--paper) 50%, var(--soft) 160%); }
.briefing h1 { font-size:30pt; }
.cert-title { font-size:42pt; }
.award { font-size:26pt; }
.seal { background:var(--accent); }`;
    case 'unicorn':
      return `
.card { border-radius:20px; padding-top:.2in; background:
  radial-gradient(circle at 97% 62%, rgba(232,85,143,.09) 0 .5in, transparent .51in),
  radial-gradient(circle at 4% 10%, rgba(142,92,196,.08) 0 .4in, transparent .41in), linear-gradient(180deg, #fff, var(--paper)); }
.card::before, .frame::before { content:''; position:absolute; left:0; right:0; top:0; height:.08in;
  background:linear-gradient(90deg, #ff6b6b, #ffa94d, #ffd43b, #69db7c, #4dabf7, #9775fa); }
.frame::before { left:.3in; right:.3in; top:.22in; border-radius:99px; }
.card-head { border-bottom:2px dotted var(--primary); }
.card-head .icon { color:var(--accent); }
.card-title { font-size:15pt; }
.badge { background:linear-gradient(90deg, var(--accent), var(--primary)); border-radius:99px; }
.frame { border-radius:30px; border-color:var(--primary); outline-color:var(--accent); overflow:hidden;
  background:radial-gradient(circle at 50% 108%, rgba(201,240,239,.9) 0 2.2in, transparent 2.21in), linear-gradient(180deg, #fff, var(--paper)); }
.briefing h1 { font-size:34pt; }
.cert-title { font-size:50pt; }
.award { font-size:30pt; }
.seal { background:linear-gradient(135deg, var(--accent), var(--primary)); outline-color:var(--primary); }`;
    case 'mermaid':
      return `
@font-face{font-family:'Comic Neue';src:url('file://${FONT_DIR}/ComicNeue-Bold.ttf');font-weight:700;}
.card { border-radius:16px; background:
  radial-gradient(circle at 93% 30%, rgba(17,121,138,.13) 0 6px, transparent 7px),
  radial-gradient(circle at 96% 42%, rgba(17,121,138,.13) 0 4px, transparent 5px),
  radial-gradient(circle at 91% 52%, rgba(17,121,138,.13) 0 3px, transparent 4px),
  radial-gradient(circle at 5% 70%, rgba(17,121,138,.10) 0 5px, transparent 6px),
  linear-gradient(180deg, #fff 0%, var(--paper) 55%, var(--soft) 160%); }
.card-head { border-bottom:2px dotted var(--primary); }
.card-head .icon { color:var(--accent); }
.card-title { font-size:17pt; }
.badge { border-radius:16px 16px 16px 3px; font-size:12pt; }
.riddle { font-family:'Comic Neue', 'Fredoka', sans-serif; font-weight:700; font-size:16.5pt; }
.frame { border-radius:26px; outline-color:var(--accent); overflow:hidden;
  background:linear-gradient(180deg, #fff 0%, var(--paper) 60%, var(--soft) 150%); }
.frame::after { content:''; position:absolute; left:0; right:0; bottom:0; height:.32in; opacity:.5;
  background:radial-gradient(circle at 50% 100%, var(--soft) 0 .2in, transparent .21in) 0 0/.5in .32in repeat-x; }
.briefing h1 { font-size:36pt; }
.cert-title { font-size:52pt; }
.award { font-size:28pt; }
.seal { background:var(--primary); outline-color:var(--primary); }`;
    case 'construction':
      return `
.card { border:.09in solid transparent; border-radius:6px; background:
  linear-gradient(var(--paper), var(--paper)) padding-box,
  repeating-linear-gradient(-45deg, #f2a900 0 12px, #2b2b2b 12px 24px) border-box; }
.card-head { border-bottom:2.5px solid var(--ink); }
.card-head .icon { color:#e09a00; }
.card-title { font-size:18pt; color:var(--ink); letter-spacing:.04em; }
.badge { background:var(--ink); color:var(--soft); border-radius:3px; font-size:13pt; letter-spacing:.04em; }
.card-foot { border-top-color:#e8dcb8; }
.kicker { color:#b86a00; }
.frame { border:.17in solid transparent; outline:none; border-radius:8px; background:
  linear-gradient(var(--paper), var(--paper)) padding-box,
  repeating-linear-gradient(-45deg, #f2a900 0 18px, #2b2b2b 18px 36px) border-box; }
.briefing h1 { font-size:36pt; letter-spacing:.03em; }
.cert-title { font-size:66pt; letter-spacing:.03em; }
.award { font-size:38pt; color:#d98a00; text-shadow:2px 2px 0 var(--ink); letter-spacing:.04em; }
.seal { background:var(--soft); color:var(--ink); outline-color:var(--ink); }`;
    default:
      return '';
  }
}

function buildHtml(cfg) {
  const plan = planHunt(cfg);
  const body = [hostGuide(plan, cfg), briefing(plan, cfg), cardSheets(plan), certificate(plan, cfg)].join('\n');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(plan.theme.name)}</title><style>${css(plan.theme)}</style></head><body>${body}</body></html>`;
}

module.exports = { buildHtml, planHunt };
