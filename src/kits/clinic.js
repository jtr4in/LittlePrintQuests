// Pieces that came out of the vet kit review (Jason and his wife, 2026-11-07). Each is switched on
// by its own key in a kit def, so other kits can copy them once the vet kit is right:
//   doorSigns    [[title, emoji, color]]  big door signs, four to a page
//   fileSheet    {...}                    a sheet of picture cards with checklists drawn over it
//   wrapLabels   [[name, emoji, filler]]  long jar labels with pretend food on the end to cut off
//   bandages     { length, width }        wrap-around bandages for a stuffed animal's leg
//   tablet       { app, screens }         a clinic tablet, one full-page screen per button
//   checkup      {...}                    check-up cards sized to fit the file folder
//   training     {...}                    pet training certificates, two to a page
// The rule they asked for everywhere: instructions go in the white space around a piece, never on it.

const fs = require('fs');
const path = require('path');
const art = require('./art');
const { placeHtml } = require('./fit');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const head = (title, sub) => `<h2 class="pg-title">${esc(title)}</h2><p class="pg-sub">${esc(sub)}</p>`;
const chunk = (list, n) => Array.from({ length: Math.ceil(list.length / n) }, (_, i) => list.slice(i * n, i * n + n));
const artFile = (k, ...p) => path.join(__dirname, 'art', k.def.id, ...p);
const dataUrl = (f) => `data:image/${f.endsWith('.jpg') ? 'jpeg' : 'webp'};base64,${fs.readFileSync(f).toString('base64')}`;
const kindPic = (k, kind) => k.def.kinds[kind][0];
const kindName = (k, kind) => k.def.kinds[kind][1];

// ---------- door signs ----------

function doorSign(k, [title, e, color]) {
  return `<div class="ds-cut"><div class="ds" style="--ds:${color}">
    <div class="ds-paws">${art.pic('🐾', '.42in')}${art.pic('🐾', '.42in')}</div>
    <div class="ds-pic">${art.pic(e, '2.15in')}</div>
    <div class="ds-title" data-lines="2">${esc(title)}</div>
    <div class="ds-place">${esc(k.placeName)}</div>
  </div></div>`;
}

function doorSignPages(k) {
  const list = k.def.doorSigns;
  if (!list) return '';
  return chunk(list, 4).map((four, i) => `<section class="page ds-page">
    <p class="pg-sub">${i ? 'More door signs' : 'Door signs'}: cut along the dashed lines and tape one on each door or corner.</p>
    <div class="ds-grid">${four.map((x) => doorSign(k, x)).join('')}</div>
  </section>`).join('');
}

// ---------- sheet of clinic cards with checklists ----------

function fileSheetPage(k) {
  const F = k.def.fileSheet;
  if (!F) return '';
  const [W, H] = F.size;
  const pct = ([x, y, w, h]) => `left:${(x / W) * 100}%;top:${(y / H) * 100}%;width:${(w / W) * 100}%;height:${(h / H) * 100}%`;
  const visit = (box) => `<div class="fs-over fs-visit" style="${pct(box)};--fs:${box[4]}">
      <div class="fs-v-title">${esc(F.title)}</div>
      <div class="fs-v-line"><span></span>♥<span></span></div>
      <div class="fs-v-pet"><b>Pet</b><i></i></div>
      ${F.checklist.map(([e, n]) => `<div class="fs-v-row">${art.pic(e, '.21in')}<span>${esc(n)}</span><i class="box"></i></div>`).join('')}
    </div>`;
  const xray = (box) => `<div class="fs-over fs-xray" style="${pct(box)};--fs:${box[4]}">
      ${F.xrayChecks.map((t) => `<div><i class="box"></i>${esc(t)}</div>`).join('')}
    </div>`;
  return `<section class="page fs-page">
    <div class="fs-sheet" style="aspect-ratio:${W} / ${H}">
      <img src="${dataUrl(artFile(k, 'sheets', F.file))}" alt="">
      ${F.visits.map(visit).join('')}${F.xrays.map(xray).join('')}
    </div>
  </section>`;
}

// ---------- wrap-around jar labels ----------

// 6.75 inches goes round a play jar or bottle about 2 inches across, with a little overlap to tape.
function wrapLabel(k, [name, e, filler], i) {
  const f = artFile(k, 'fill', `${filler}.jpg`);
  const food = fs.existsSync(f) ? `<div class="wl-food" style="background-image:url('${dataUrl(f)}')"></div>` : `<div class="wl-food plain">${Array.from({ length: 12 }, () => art.pic(e, '.5in')).join('')}</div>`;
  return `<div class="wl s${i % 4}">
    <div class="wl-name">${art.pic(e, '.72in')}<b data-lines="2">${esc(name)}</b><span class="wl-paws">${art.pic('🐾', '.22in')}${art.pic('🐾', '.22in')}${art.pic('🐾', '.22in')}</span></div>
    <div class="wl-snip"></div>${food}
  </div>`;
}

function wrapLabelPages(k) {
  const list = k.def.wrapLabels;
  if (!list) return '';
  return chunk(list, 4).map((four, i) => `<section class="page wl-page">
    ${head(i ? 'Food and Treat Jar Labels (more)' : 'Food and Treat Jar Labels', 'Cut out a label and wrap it round a play jar or bottle, about 2 inches across, then tape the end. The food on the end makes the jar look full. Filling the jar with pompoms instead? Cut the food off on the dotted line.')}
    <div class="wl-list">${four.map((x, j) => wrapLabel(k, x, i * 4 + j)).join('')}</div>
  </section>`).join('');
}

// ---------- bandages ----------

const PATTERNS = [
  ['#fde3ea', '#f39ab2', '♥'], ['#e3f3ff', '#6aa7e8', '✚'], ['#eaf7f0', '#2a9d8f', '🐾'], ['#fff3d6', '#ef9d31', '★'], ['#f1e8fb', '#9b7fd1', '●'],
];

function bandagePages(k) {
  const B = k.def.bandages;
  if (!B) return '';
  const strip = ([bg, ink, mark], i) => {
    const marks = Array.from({ length: Math.round(B.length * 1.6) }, (_, j) => `<span style="top:${(j / (B.length * 1.6)) * 100 + 2}%;left:${j % 2 ? 58 : 18}%">${mark === '🐾' ? art.pic('🐾', '.26in') : mark}</span>`).join('');
    return `<div class="bd-cut"><div class="bd" style="width:${B.width}in;height:${B.length}in;background:${bg};color:${ink}">${marks}<div class="bd-pad" style="border-color:${ink}"></div></div></div>`;
  };
  return `<section class="page bd-page">
    ${head('Pretend Bandages', `Each one is ${B.length} inches long: enough to wrap round a teddy’s arm or leg and tape the end. Put the soft middle on the sore spot. Cut a bit off for a small paw.`)}
    <div class="bd-row">${PATTERNS.map(strip).join('')}</div>
    <p class="bd-tip">Print at Actual size (100%) so the bandages come out the right length.</p>
  </section>`;
}

// ---------- the clinic tablet ----------

const NAV = [['appointments', '📅', 'Appointments'], ['patient', '🐶', 'Patients'], ['monitor', '❤️', 'Monitor'], ['xray', '🦴', 'X-Rays'], ['pharmacy', '🧪', 'Pharmacy']];
const pets = (k) => (k.subjects.length ? k.subjects.map((s, i) => [s.name || kindName(k, s.kind), s.kind, ...(k.def.checkup.pretend[i] || []).slice(2)]) : k.def.checkup.pretend);

function heartLine(color, y0, amp, seed) {
  let d = `M0,${y0}`;
  for (let x = 0; x < 1000; x += 100) {
    const a = amp * (0.8 + ((seed * (x + 7)) % 5) / 10);
    d += ` L${x + 30},${y0} L${x + 40},${y0 - a * 0.3} L${x + 48},${y0} L${x + 56},${y0 + a * 0.25} L${x + 62},${y0 - a} L${x + 70},${y0 + a * 0.5} L${x + 76},${y0} L${x + 100},${y0}`;
  }
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="5" stroke-linejoin="round"/>`;
}

const SCREENS = {
  appointments(k) {
    const times = ['9:00', '9:30', '10:00', '11:00', '1:30', '2:00'];
    const why = ['Check-up', 'Sore paw', 'Vaccine', 'Teeth clean', 'Grooming', 'Training'];
    const list = pets(k);
    const days = Array.from({ length: 35 }, (_, i) => i - 2).map((d) => (d < 1 || d > 30 ? '<span></span>' : `<span class="${d === 14 ? 'today' : [3, 8, 12, 19, 22, 27].includes(d) ? 'busy' : ''}">${d}</span>`)).join('');
    return `<div class="tb-cols"><div class="tb-card"><h4>📅 November</h4><div class="tb-cal-h">${'SMTWTFS'.split('').map((x) => `<i>${x}</i>`).join('')}</div><div class="tb-cal">${days}</div></div>
      <div class="tb-card grow"><h4>Today’s patients</h4>${times.map((t, i) => { const p = list[i % list.length]; return `<div class="tb-appt"><time>${t}</time>${art.pic(kindPic(k, p[1]), '.5in')}<div><b>${esc(p[0])}</b><small>${esc(why[i])}</small></div><i class="box"></i></div>`; }).join('')}</div></div>
      <div class="tb-buttons"><span>+ New appointment</span><span>Call owner</span><span class="alt">Print list</span></div>`;
  },
  patient(k) {
    const [name, kind, age, owner] = pets(k)[0];
    return `<div class="tb-cols"><div class="tb-card tb-who">${art.pic(kindPic(k, kind), '2in')}<b>${esc(name)}</b><small>${esc(kindName(k, kind))}</small></div>
      <div class="tb-card grow"><h4>Patient file</h4>${[['Species', kindName(k, kind)], ['Age', age ? `${age} years` : ''], ['Owner', owner], ['Weight', '12 lb'], ['Last visit', 'Oct 3']].map(([a, b]) => `<div class="tb-field"><span>${a}</span><b>${esc(b || '')}</b></div>`).join('')}</div></div>
      <div class="tb-card"><h4>Vaccines</h4><div class="tb-vax">${['Rabies', 'Distemper', 'Parvo', 'Bordetella'].map((v, i) => `<span class="${i < 2 ? 'done' : ''}">${i < 2 ? '✓' : '○'} ${v}</span>`).join('')}</div></div>
      <div class="tb-card"><h4>Vet’s notes</h4><div class="tb-lines"><i></i><i></i></div></div>`;
  },
  monitor(k) {
    const [name, kind] = pets(k)[0];
    return `<div class="tb-card tb-dark"><div class="tb-mon-top">${art.pic(kindPic(k, kind), '.6in')}<b>${esc(name)}</b><span>Heart rate <em>92</em></span><span>Temp <em>101°F</em></span></div>
      <svg viewBox="0 0 1000 420" class="tb-wave"><g stroke="#24304d" stroke-width="1">${Array.from({ length: 11 }, (_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="420"/>`).join('')}${Array.from({ length: 5 }, (_, i) => `<line x1="0" y1="${i * 105}" x2="1000" y2="${i * 105}"/>`).join('')}</g>
        ${heartLine('#ff5d73', 120, 90, 3)}${heartLine('#7be08a', 300, 60, 7)}<path d="M620,85 c-20,-35 -70,-20 -55,15 c10,25 55,45 55,45 c0,0 45,-20 55,-45 c15,-35 -35,-50 -55,-15z" fill="none" stroke="#ff5d73" stroke-width="5"/></svg>
      <div class="tb-mon-keys"><span class="g"></span><span class="o"></span><span class="r"></span><span class="b"></span><span class="w"></span></div></div>
      <div class="tb-stats">${[['❤️', 'Heartbeat', 'Strong'], ['🫁', 'Breathing', 'Calm'], ['🌡️', 'Temperature', 'Normal']].map(([e, a, b]) => `<div class="tb-card">${art.pic(e, '.5in')}<small>${a}</small><b>${b}</b></div>`).join('')}</div>`;
  },
  xray(k) {
    const f = artFile(k, 'wow.webp');
    const film = fs.existsSync(f) ? `<img src="${dataUrl(f)}" alt="">` : art.pic('🦴', '3in');
    return `<div class="tb-card tb-dark tb-xray">${film}</div>
      <div class="tb-buttons"><span>🔍 Zoom</span><span>☀️ Brighter</span><span class="alt">SCAN</span><span>🖨️ Print</span></div>
      <div class="tb-card"><h4>What does the vet see?</h4><div class="tb-checks">${['Healthy bones', 'A swallowed toy', 'A sore paw', 'All better'].map((t) => `<span><i class="box"></i>${t}</span>`).join('')}</div></div>`;
  },
  pharmacy(k) {
    const meds = [['🧪', 'Tummy medicine'], ['🧴', 'Paw cream'], ['💉', 'Vaccine'], ['🩹', 'Bandages'], ['🥕', 'Healthy snacks'], ['🥣', 'Pet food']];
    return `<div class="tb-card grow"><h4>Order medicine</h4><div class="tb-meds">${meds.map(([e, n]) => `<div>${art.pic(e, '.75in')}<b>${esc(n)}</b><span class="tb-qty"><i>−</i>1<i>+</i></span></div>`).join('')}</div></div>
      <div class="tb-buttons"><span class="alt">Send order</span><span>Cancel</span></div>`;
  },
};

function tabletPage(k, which) {
  const T = k.def.tablet;
  const [, , label] = NAV.find(([id]) => id === which);
  return `<section class="page tb-page">
    <p class="pg-sub">${esc(`Clinic tablet: ${label} screen. Each page is the tablet after tapping a different button. Stand it up or lay it on the desk.`)}</p>
    <div class="tb"><div class="tb-screen">
      <div class="tb-bar"><span class="tb-app">${art.pic('🐾', '.3in')} ${esc(T.app)}</span><span>${esc(label)}</span><span class="tb-user">${esc(k.lead)}</span></div>
      <div class="tb-main"><nav class="tb-nav">${NAV.map(([id, e, n]) => `<span class="${id === which ? 'on' : ''}">${art.pic(e, '.42in')}<small>${n}</small></span>`).join('')}</nav>
        <div class="tb-body">${SCREENS[which](k)}</div></div>
    </div><div class="tb-home"></div></div>
  </section>`;
}

const tabletPages = (k) => (k.def.tablet ? k.def.tablet.screens.map((s) => tabletPage(k, s)).join('') : '');

// ---------- check-up cards for the file folder ----------

// 7.2 x 4.4 inches: two to a page, and they slip inside the file folder (7.7 x 4.7 inches inside).
function checkupCard(k, p) {
  const R = { ...k.def.record, ...k.def.checkup };
  const vals = p ? [p[0], kindName(k, p[1]), p[2] ? `${p[2]} years` : '', p[3] || ''] : [];
  return `<div class="fc">
    <header class="fc-head"><span class="em">${art.pic(R.icon, '.36in')}</span><h2>${esc(R.title)}</h2><span class="clinic">${esc(k.placeName)}</span></header>
    <div class="fc-cols">
      <div class="fc-left">
        <div class="fc-photo${p ? '' : ' empty'}">${p ? art.pic(kindPic(k, p[1]), '1.25in') : ''}</div>
        ${R.info.map((f, i) => `<div class="field"><b>${esc(f)}</b><span class="fill">${esc(vals[i] || '')}</span></div>`).join('')}
      </div>
      <div class="fc-right">
        <div class="fc-q">Services today: tick what the pet needs</div>
        <div class="fc-svc">${R.services.map(([e, n]) => `<span><i class="box"></i>${art.pic(e, '.36in')}${esc(n)}</span>`).join('')}</div>
        <div class="fc-q">${esc(R.stampsLabel)}</div>
        <div class="fc-stamps">${'<span></span>'.repeat(5)}</div>
        <div class="fc-feel"><b>${esc(R.moodLabel)}</b>${R.moods.map((m) => `<span>${m}</span>`).join('')}</div>
      </div>
    </div>
  </div>`;
}

// Pretend patients first (filled in, with pictures), then blank cards to fill in.
function checkupPages(k) {
  const filled = pets(k).slice(0, 4);
  const list = [...filled, null, null];
  return chunk(list, 2).map((two, i) => `<section class="page fc-page">
    <p class="pg-sub">${i < 2 ? 'Pet check-up cards, filled in for pretend patients.' : 'Blank check-up cards: write in your patient and draw them in the box.'} Cut on the dashed lines; each card fits inside the file folder.</p>
    ${two.map((p) => `<div class="fc-cut">${checkupCard(k, p)}</div>`).join('')}
  </section>`).join('');
}

// ---------- training certificates ----------

function trainingCert(k) {
  const T = k.def.training;
  return `<div class="tc"><div class="tc-in">
    <div class="tc-top">${art.pic(T.icon, '.7in')}<div><div class="clinic">${placeHtml(k.placeName)}</div><h2>${esc(T.title)}</h2></div>${art.pic('🐾', '.55in')}</div>
    <div class="tc-name"><span class="fill"></span><small>pet’s name</small></div>
    <p>${esc(T.line)}</p>
    <div class="tc-tricks">${T.tricks.map((t) => `<span><i class="box"></i>${esc(t)}</span>`).join('')}</div>
    <div class="tc-sign"><div><span class="fill"></span><small>Date</small></div><div class="tc-seal">${art.pic('🏅', '.6in')}</div><div><span class="fill">${esc(k.lead)}</span><small>${esc(k.def.leadRole)}</small></div></div>
  </div></div>`;
}

const trainingPage = (k) => (k.def.training ? `<section class="page tc-page"><p class="pg-sub">Pet training certificates: one for each pet that learns its tricks. Tick what they learned.</p>${trainingCert(k)}<div class="cut-h"></div>${trainingCert(k)}</section>` : '');

const clinicCss = `
/* door signs */
.ds-page { padding:.35in .4in; display:flex; flex-direction:column; } .ds-page .pg-sub { margin:0 0 .12in; }
.ds-grid { flex:1; display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr; }
.ds-cut { border:1.5px dashed #b7c0cc; margin:-.75px; padding:.14in; display:flex; }
.ds { flex:1; border:6px solid var(--ds); border-radius:24px; background:#fff; position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.14in; padding:.3in .25in; text-align:center; box-shadow:inset 0 0 0 .1in color-mix(in srgb, var(--ds) 14%, #fff); }
.ds-paws { position:absolute; top:.22in; left:.24in; right:.24in; display:flex; justify-content:space-between; opacity:.85; }
.ds-title { font:700 30pt/1.05 'Fredoka'; color:var(--navy); text-transform:uppercase; width:100%; }
.ds-place { font:600 10pt 'Fredoka'; color:var(--ds); text-transform:uppercase; letter-spacing:.08em; }
/* sheet of clinic cards */
.fs-page { padding:.25in; display:flex; align-items:center; justify-content:center; }
.fs-sheet { position:relative; height:10.5in; } .fs-sheet > img { width:100%; height:100%; display:block; }
.fs-over { position:absolute; background:#fff; }
.fs-visit { border-radius:14px; display:flex; flex-direction:column; align-items:stretch; padding:.12in .14in .06in; gap:.01in; overflow:hidden; }
.fs-v-paw { text-align:center; line-height:0; }
.fs-v-title { font:700 15pt/1.1 'Fredoka'; white-space:nowrap; color:var(--fs); text-transform:uppercase; text-align:center; }
.fs-v-line { display:flex; align-items:center; gap:.06in; color:var(--fs); font-size:13pt; margin-bottom:.04in; } .fs-v-line span { flex:1; border-top:2.5px solid var(--fs); }
.fs-v-pet { display:flex; align-items:flex-end; gap:.06in; font:700 10.5pt 'Fredoka'; color:var(--navy); margin-bottom:.04in; } .fs-v-pet i { flex:1; border-bottom:1.5px solid var(--navy); height:.2in; }
.fs-v-row { display:flex; align-items:center; gap:.08in; font:700 10.5pt 'Fredoka'; color:var(--navy); text-transform:uppercase; border-bottom:1.5px dashed color-mix(in srgb, var(--fs) 45%, #fff); padding:.01in 0; font-size:8.5pt; line-height:1.1; }
.fs-v-row span { flex:1; } .fs-v-row .box { width:.19in; height:.19in; }
.fs-xray { border-radius:8px; display:flex; flex-direction:column; justify-content:center; gap:.03in; padding:.02in .1in; font:600 8.5pt 'Fredoka'; color:var(--navy); }
.fs-xray div { display:flex; align-items:center; gap:.06in; } .fs-xray .box { width:.14in; height:.14in; border-width:1.5px; }
/* wrap-around jar labels */
.wl-page { padding:.4in .5in; display:flex; flex-direction:column; } .wl-page .pg-sub { margin-bottom:.15in; }
.wl-list { display:flex; flex-direction:column; align-items:center; gap:.22in; }
.wl { width:6.75in; height:2.1in; display:flex; outline:2px dashed #b7c0cc; outline-offset:2px; border-radius:6px; overflow:hidden; flex:none; }
.wl-name { width:2.6in; flex:none; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.03in; background:#fff; border:5px solid var(--wl); border-right:0; border-radius:6px 0 0 6px; padding:.06in; text-align:center; }
.wl-name b { font:700 18pt/1 'Fredoka'; color:var(--wl); text-transform:uppercase; width:100%; }
.wl-paws { display:flex; gap:.08in; opacity:.8; }
.wl-snip { width:0; border-left:2.5px dotted #6d7792; flex:none; position:relative; }
.wl-snip::before { content:'✂'; position:absolute; top:-.04in; left:-.1in; font-size:13pt; color:#6d7792; background:#fff; line-height:1; }
.wl-food { flex:1; background-size:cover; background-position:center; border:5px solid var(--wl); border-left:0; border-radius:0 6px 6px 0; }
.wl-food.plain { display:flex; flex-wrap:wrap; align-content:center; justify-content:center; gap:.05in; background:#fff; }
.wl.s0 { --wl:#2a9d8f; } .wl.s1 { --wl:#e2879b; } .wl.s2 { --wl:#4f7fc4; } .wl.s3 { --wl:#9b7fd1; }
/* bandages */
.bd-page { padding:.4in .45in; display:flex; flex-direction:column; align-items:center; }
.bd-row { display:flex; gap:.18in; justify-content:center; margin-top:.05in; }
.bd-cut { outline:2px dashed #b7c0cc; outline-offset:3px; border-radius:.3in; }
.bd { position:relative; border-radius:.3in; overflow:hidden; font:700 15pt 'Fredoka'; }
.bd > span { position:absolute; line-height:1; opacity:.7; }
.bd-pad { position:absolute; left:14%; right:14%; top:42%; height:16%; border-radius:.12in; background:#fffaf2; border:2px dashed; }
.bd-tip { font:600 10pt 'Fredoka'; color:#66708f; margin-top:.14in; }
/* clinic tablet */
.tb-page { padding:.35in .4in; display:flex; flex-direction:column; } .tb-page .pg-sub { margin:0 0 .12in; }
.tb { flex:1; background:#2b3344; border-radius:.45in; padding:.32in .3in .2in; display:flex; flex-direction:column; align-items:center; gap:.1in; }
.tb-screen { align-self:stretch; flex:1; background:#f2f7f6; border-radius:.16in; overflow:hidden; display:flex; flex-direction:column; }
.tb-home { width:.42in; height:.42in; border-radius:50%; border:3px solid #6a7590; flex:none; }
.tb-bar { display:flex; align-items:center; justify-content:space-between; background:var(--teal); color:#fff; font:700 12pt 'Fredoka'; padding:.1in .2in; }
.tb-app { display:flex; align-items:center; gap:.06in; font-size:14pt; } .tb-user { font-weight:500; }
.tb-main { flex:1; display:flex; min-height:0; }
.tb-nav { width:1.05in; background:#fff; border-right:2px solid var(--line); display:flex; flex-direction:column; gap:.06in; padding:.12in .06in; }
.tb-nav span { display:flex; flex-direction:column; align-items:center; gap:.02in; padding:.08in 0; border-radius:12px; font:600 8.5pt 'Fredoka'; color:#66708f; }
.tb-nav span.on { background:var(--mint-l); color:var(--teal-d); outline:2px solid var(--teal); }
.tb-body { flex:1; padding:.16in; display:flex; flex-direction:column; gap:.14in; min-width:0; }
.tb-card { background:#fff; border-radius:14px; padding:.12in .16in; box-shadow:0 1px 0 var(--line); border:1.5px solid var(--line); }
.tb-card h4 { margin:0 0 .08in; font:700 13pt 'Fredoka'; color:var(--teal-d); }
.tb-card.grow { flex:1; }
.tb-cols { display:flex; gap:.14in; } .tb-cols > .tb-card { flex:none; } .tb-cols > .tb-card.grow { flex:1; }
.tb-cal-h, .tb-cal { display:grid; grid-template-columns:repeat(7, .3in); gap:.04in; text-align:center; font:600 9pt 'Fredoka'; }
.tb-cal-h i { font-style:normal; color:#8a93ab; } .tb-cal span { height:.28in; line-height:.28in; border-radius:50%; }
.tb-cal .busy { background:var(--mint); } .tb-cal .today { background:var(--orange); color:#fff; }
.tb-appt { display:flex; align-items:center; gap:.1in; padding:.05in 0; border-bottom:1.5px dashed var(--line); font:600 11pt 'Fredoka'; }
.tb-appt time { width:.55in; color:var(--teal-d); } .tb-appt div { flex:1; display:flex; flex-direction:column; } .tb-appt small { font-weight:500; color:#66708f; }
.tb-buttons { display:flex; gap:.12in; flex-wrap:wrap; } .tb-buttons span { background:var(--teal); color:#fff; font:700 12pt 'Fredoka'; padding:.1in .2in; border-radius:99px; } .tb-buttons span.alt { background:var(--orange); color:var(--accent-ink); }
.tb-who { width:2.3in; display:flex; flex-direction:column; align-items:center; text-align:center; } .tb-who b { font:700 18pt 'Fredoka'; } .tb-who small { color:#66708f; font:600 11pt 'Fredoka'; }
.tb-field { display:flex; justify-content:space-between; gap:.1in; padding:.07in 0; border-bottom:1.5px dashed var(--line); font:600 11pt 'Fredoka'; } .tb-field span { color:#66708f; } .tb-field b { min-width:1.4in; border-bottom:1.5px solid var(--navy); text-align:right; }
.tb-vax { display:grid; grid-template-columns:1fr 1fr; gap:.06in; font:600 11pt 'Fredoka'; } .tb-vax span { padding:.05in .1in; border-radius:10px; background:#f4f6fa; } .tb-vax .done { background:var(--mint-l); color:var(--teal-d); }
.tb-lines i { display:block; border-bottom:1.5px solid var(--line); height:.32in; }
.tb-dark { background:#111a2e; border-color:#111a2e; color:#e8f0ff; flex:1; display:flex; flex-direction:column; }
.tb-mon-top { display:flex; align-items:center; gap:.14in; font:600 12pt 'Fredoka'; } .tb-mon-top b { flex:1; font-size:15pt; } .tb-mon-top em { font-style:normal; color:#7be08a; font-size:16pt; margin-left:.04in; }
.tb-wave { flex:1; width:100%; min-height:0; }
.tb-mon-keys { display:flex; justify-content:center; gap:.22in; } .tb-mon-keys span { width:.3in; height:.3in; border-radius:50%; border:2px solid #fff3; }
.tb-mon-keys .g { background:#3fbf6a; } .tb-mon-keys .o { background:#f28c3a; } .tb-mon-keys .r { background:#e84a5f; } .tb-mon-keys .b { background:#2b3344; } .tb-mon-keys .w { background:#4f7fc4; }
.tb-stats { display:flex; gap:.14in; } .tb-stats .tb-card { flex:1; display:flex; flex-direction:column; align-items:center; font:600 10pt 'Fredoka'; } .tb-stats b { font-size:14pt; color:var(--teal-d); }
.tb-xray { align-items:center; justify-content:center; padding:.1in; } .tb-xray img { max-width:100%; max-height:4.6in; object-fit:contain; }
.tb-checks { display:grid; grid-template-columns:1fr 1fr; gap:.08in; font:600 11pt 'Fredoka'; } .tb-checks span { display:flex; align-items:center; gap:.08in; }
.tb-meds { display:grid; grid-template-columns:1fr 1fr; gap:.14in; } .tb-meds div { display:flex; align-items:center; gap:.1in; border:1.5px solid var(--line); border-radius:12px; padding:.08in; font:600 11pt 'Fredoka'; } .tb-meds b { flex:1; }
.tb-qty { display:flex; align-items:center; gap:.06in; } .tb-qty i { font-style:normal; width:.26in; height:.26in; border-radius:50%; background:var(--mint-l); display:grid; place-items:center; color:var(--teal-d); font-weight:700; }
/* check-up cards: they fit inside the file folder */
.fc-page { padding:.35in; display:flex; flex-direction:column; align-items:center; gap:.3in; } .fc-page .pg-sub { margin:0; }
.fc-cut { outline:2px dashed #b7c0cc; outline-offset:4px; }
.fc { width:7.2in; height:4.4in; border:3px solid var(--teal); border-radius:16px; padding:.14in .2in; display:flex; flex-direction:column; gap:.08in; background:#fff; }
.fc-head { display:flex; align-items:center; gap:.1in; border-bottom:3px solid var(--teal); padding-bottom:.05in; } .fc-head h2 { font-size:17pt; flex:1; } .fc-head .em { line-height:0; }
.fc-cols { flex:1; display:flex; gap:.2in; min-height:0; }
.fc-left { width:2.5in; flex:none; display:flex; flex-direction:column; } .fc-left .field { margin:.03in 0; font-size:10pt; } .fc-left .fill { font-size:11pt; min-width:.6in; }
.fc-photo { height:1.45in; border:2.5px solid var(--mint); border-radius:14px; display:grid; place-items:center; background:var(--mint-l); margin-bottom:.04in; } .fc-photo.empty { background:#fff; border-style:dashed; }
.fc-right { flex:1; display:flex; flex-direction:column; gap:.05in; min-width:0; }
.fc-q { font:700 10pt 'Fredoka'; color:var(--teal-d); }
.fc-svc { display:grid; grid-template-columns:1fr 1fr; gap:.04in .1in; } .fc-svc span { display:flex; align-items:center; gap:.06in; font:600 10.5pt 'Fredoka'; } .fc-svc .box { width:.18in; height:.18in; }
.fc-stamps { display:flex; gap:.1in; } .fc-stamps span { width:.5in; height:.5in; border-radius:50%; border:2px dashed var(--teal); }
.fc-feel { display:flex; align-items:center; gap:.08in; font:600 9pt 'Fredoka'; margin-top:auto; } .fc-feel b { flex:1; } .fc-feel span { font-family:'Noto Color Emoji'; font-size:15pt; }
/* training certificates */
.tc-page { padding:.4in .45in; display:flex; flex-direction:column; } .tc-page .pg-sub { margin:0 0 .12in; } .tc-page .cut-h { margin:.14in -.45in; }
.tc { flex:1; display:flex; } .tc-in { flex:1; border:4px solid var(--orange); outline:2px solid var(--orange); outline-offset:-12px; border-radius:20px; background:var(--cream); padding:.3in .4in; display:flex; flex-direction:column; align-items:center; text-align:center; gap:.08in; }
.tc-top { display:flex; align-items:center; gap:.2in; } .tc-top h2 { font-size:24pt; color:var(--teal-d); } .tc-top .clinic { text-align:center; }
.tc-name { width:5in; display:flex; flex-direction:column; align-items:center; } .tc-name .fill { width:100%; min-height:.45in; } .tc-name small, .tc-sign small { font:600 9pt 'Fredoka'; color:#7a849f; }
.tc-in p { margin:.02in 0; font:600 13pt 'Fredoka'; }
.tc-tricks { display:grid; grid-template-columns:repeat(3, auto); gap:.1in .3in; font:600 13pt 'Fredoka'; } .tc-tricks span { display:flex; align-items:center; gap:.08in; }
.tc-sign { margin-top:auto; width:100%; display:flex; align-items:flex-end; justify-content:space-between; } .tc-sign > div { display:flex; flex-direction:column; align-items:center; width:2.2in; } .tc-sign .fill { width:100%; text-align:center; }
.tc-seal { width:auto !important; }
`;

module.exports = { doorSignPages, fileSheetPage, wrapLabelPages, bandagePages, tabletPages, checkupPages, trainingPage, clinicCss };
