// Pretend play kit engine. A kit definition (src/kits/defs/*.js) lists its signs, badges,
// forms and props; this file turns a definition plus one child's details into print HTML.
//
// Order config shape:
//   { kit: 'vet', childName: 'Maya', placeName?: 'Maya’s Pet Clinic',
//     subjects?: [{ name: 'Biscuit', kind: 'dog' }, ...],  // pets, crew, guests... up to 6
//     staff?: ['Leo', 'Grandpa'] }                         // extra badge names, up to 7
// Everything except kit and childName is optional; empty slots print as blanks to fill in.
//
// Pictures are Noto Color Emoji (SIL Open Font License), so they're free to use in a product.

const path = require('path');

const FONT_DIR = path.join(__dirname, '..', '..', 'fonts');
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const possessive = (name) => (/s$/i.test(name) ? `${name}’` : `${name}’s`);

function normalize(def, cfg) {
  const childName = String(cfg.childName || '').trim();
  if (!childName) throw new Error('childName is required');
  const aliases = def.kindAliases || {};
  const subjects = (cfg.subjects || cfg.pets || []).slice(0, 6).map((p) => {
    const key = String(p.kind || '').toLowerCase().replace(/\s+/g, '_');
    const kind = def.kinds[key] ? key : aliases[key];
    if (!kind) throw new Error(`Unknown ${def.subjectWord} kind "${p.kind}". Use one of: ${Object.keys(def.kinds).join(', ')}`);
    return { name: String(p.name || '').trim(), kind };
  });
  return {
    def,
    childName,
    lead: `${def.leadPrefix ? def.leadPrefix + ' ' : ''}${childName}`,
    placeName: String(cfg.placeName || cfg.clinicName || def.placeName(possessive(childName))).trim(),
    subjects,
    staff: (cfg.staff || []).slice(0, 7).map((s) => String(s).trim()).filter(Boolean),
  };
}

const pic = (k, s) => k.def.kinds[s.kind][0];
const kindName = (k, s) => k.def.kinds[s.kind][1];
const subjectsOrDefaults = (k) => (k.subjects.length ? k.subjects : k.def.defaultKinds.map((kind) => ({ name: '', kind })));

// ---------- pieces ----------

function sign(title, sub, icon, cls = '') {
  return `<div class="sign ${cls}"><div class="sign-in">
    <div class="sign-icon">${icon}</div>
    <div class="sign-title">${esc(title)}</div>
    ${sub ? `<div class="sign-sub">${esc(sub)}</div>` : ''}
  </div></div>`;
}

function signsPages(k) {
  const d = k.def;
  const s = [sign(k.placeName, d.tagline, d.icon, 'hero'), ...d.signs.map(([t, sub, icon, cls]) => sign(t, sub, icon, cls))];
  if (s.length % 2) s.pop();
  const out = [];
  for (let i = 0; i < s.length; i += 2) out.push(`<section class="page signs">${s[i]}<div class="cut-h"></div>${s[i + 1]}</section>`);
  return out.join('');
}

function badge(k, name, role, lead) {
  return `<div class="badge ${lead ? 'lead' : ''}">
    <div class="badge-top"><span>${k.def.badgeIcon} ${esc(lead ? k.def.leadRole : 'Crew')}</span><span>ID</span></div>
    <div class="badge-body">
      <div class="photo">Draw<br>yourself</div>
      <div class="badge-info">
        <div class="clinic">${esc(k.placeName)}</div>
        <div class="who">${name ? esc(name) : '<span class="blank"></span>'}</div>
        <div class="role">${esc(role)}</div>
        <div class="barcode"></div>
      </div>
    </div>
  </div>`;
}

function badgesPage(k) {
  const d = k.def;
  const cards = [badge(k, k.lead, d.leadRole, true)];
  for (let i = 0; i < 7; i++) {
    const n = k.staff[i];
    const [role, prefix] = d.roles[i % d.roles.length];
    cards.push(badge(k, n ? `${prefix ? prefix + ' ' : ''}${n}` : '', role, false));
  }
  return `<section class="page badges">
    <h2 class="pg-title">${esc(d.badgeTitle || 'Staff ID Badges')}</h2>
    <p class="pg-sub">Cut out, draw your face, and clip or tape to your shirt.</p>
    <div class="badge-grid">${cards.join('')}</div>
  </section>`;
}

function formHead(k, title, icon) {
  return `<header class="form-head"><div><div class="clinic">${esc(k.placeName)}</div><h2>${esc(title)}</h2></div><div class="form-icon">${icon}</div></header>`;
}

function logPage(k) {
  const L = k.def.log;
  const subs = subjectsOrDefaults(k);
  const rows = L.times
    .map((t, i) => {
      const p = subs[i];
      return `<tr><td class="t">${t}</td>
        <td>${p ? `<span class="em">${pic(k, p)}</span> ${esc(p.name)}` : ''}</td>
        <td>${p ? esc(kindName(k, p)) : ''}</td>
        <td>${p ? esc(L.reasons[i % L.reasons.length]) : ''}</td>
        <td class="tick"><span class="box"></span></td></tr>`;
    })
    .join('');
  return `<section class="page form">
    ${formHead(k, L.title, L.icon)}
    <table class="appt"><thead><tr><th>Time</th>${L.cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>
    <div class="note">${esc(L.note)}</div>
  </section>`;
}

function recordPage(k, p) {
  const R = k.def.record;
  return `<section class="page form">
    ${formHead(k, R.title, R.icon)}
    <div class="patient">
      <div class="pet-pic">${p ? pic(k, p) : `<span class="draw">${esc(R.drawLabel)}</span>`}</div>
      <div class="fields">
        ${R.fields.map((f, i) => `<div class="field"><b>${esc(f)}</b><span class="fill">${p && i === 0 ? esc(p.name) : p && i === 1 ? esc(kindName(k, p)) : ''}</span></div>`).join('')}
      </div>
    </div>
    <table class="check"><thead><tr><th>Check</th>${R.cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>
      ${R.checks.map(([e, n]) => `<tr><td><span class="em">${e}</span> ${esc(n)}</td>${R.cols.map(() => '<td><span class="box"></span></td>').join('')}</tr>`).join('')}
    </tbody></table>
    <div class="two">
      <div class="panel"><b>${esc(R.moodLabel)}</b><div class="faces">${R.moods.map((m) => `<span>${m}</span>`).join('')}</div><p class="hint">Circle one</p></div>
      <div class="panel"><b>${esc(R.notesLabel)}</b><div class="lines"><i></i><i></i><i></i></div></div>
    </div>
    <div class="sig">${esc(R.signer)}: <span class="fill">${esc(k.lead)}</span> Date: <span class="fill"></span></div>
  </section>`;
}

function ticketCard(k) {
  const T = k.def.ticket;
  return `<div class="rx">
    <div class="rx-top"><span class="rx-mark">${T.mark}</span><div><div class="clinic">${esc(k.placeName)}</div><b>${esc(T.title)}</b></div></div>
    <div class="field"><b>${esc(T.forLabel)}</b><span class="fill"></span></div>
    <div class="meds">${T.options.map(([e, n]) => `<span><i class="box"></i>${e} ${esc(n)}</span>`).join('')}</div>
    <div class="times"><b>${esc(T.countLabel)}</b> <span>1</span><span>2</span><span>3</span></div>
    <div class="lines rx-notes"><b>Notes</b><i></i><i></i><i></i></div>
    <div class="sig small">${esc(k.lead)} <span class="fill"></span></div>
  </div>`;
}

function ticketPage(k) {
  const c = ticketCard(k);
  return `<section class="page rxs"><div class="rx-grid">${c}${c}${c}${c}</div></section>`;
}

function passport(k, p) {
  const P = k.def.passport;
  return `<div class="passport">
    <div class="pp-cover"><div class="pp-emblem">${P.emblem}</div><div class="pp-word">${esc(P.word)}</div><div class="clinic">${esc(k.placeName)}</div></div>
    <div class="pp-inside">
      <div class="pp-photo">${p ? pic(k, p) : `<span class="draw">${esc(P.drawLabel)}</span>`}</div>
      <div class="pp-fields">
        ${P.fields.map((f, i) => `<div class="field"><b>${esc(f)}</b><span class="fill">${p && i === 0 ? esc(p.name) : p && i === 1 ? esc(kindName(k, p)) : ''}</span></div>`).join('')}
      </div>
      <div class="stamps"><b>${esc(P.stampsLabel)}</b><div>${'<span></span>'.repeat(4)}</div></div>
    </div>
  </div>`;
}

function passportsPages(k) {
  const P = k.def.passport;
  const list = [...k.subjects];
  while (list.length < 4 || list.length % 2) list.push(null);
  const out = [];
  for (let i = 0; i < list.length; i += 4) {
    out.push(`<section class="page passports">
      <h2 class="pg-title">${esc(P.pageTitle)}</h2>
      <p class="pg-sub">${esc(P.howTo)}</p>
      <div class="pp-grid">${list.slice(i, i + 4).map((p) => passport(k, p)).join('')}</div>
    </section>`);
  }
  return out.join('');
}

function menuPage(k) {
  const M = k.def.menu;
  const coins = Array.from({ length: 20 }, () => `<div class="coin"><span>${M.coinIcon}</span><b>1</b></div>`).join('');
  return `<section class="page menu">
    ${formHead(k, M.title, M.icon)}
    <div class="price-list">${M.items.map(([e, n, c]) => `<div class="price"><span class="em">${e}</span><span class="pn">${esc(n)}</span><span class="dots"></span><span class="pc">${c} ${c === 1 ? M.coinWord : M.coinWord + 's'}</span></div>`).join('')}</div>
    <h3 class="coins-title">${esc(M.coinsTitle)} <small>Cut out and use to pay</small></h3>
    <div class="coins">${coins}</div>
  </section>`;
}

function certificatePage(k) {
  const C = k.def.certificate;
  return `<section class="page cert">
    <div class="cert-in">
      <div class="cert-icon">${C.icon}</div>
      <div class="cert-kicker">${esc(k.placeName)}</div>
      <h1>${esc(C.title)}</h1>
      <p>This certifies that</p>
      <div class="cert-name">${esc(k.lead)}</div>
      <p>${esc(C.line)}</p>
      <div class="cert-row"><div><span class="fill"></span>Date</div><div class="seal">${C.seal}</div><div><span class="fill"></span>Signed</div></div>
    </div>
  </section>`;
}

function guidePage(k) {
  const G = k.def.guide;
  const d = k.def;
  const signCount = d.signs.length + 1 - ((d.signs.length + 1) % 2);
  const inside = [
    `${signCount} signs for doors and walls`,
    `A fold-up ${d.dashboard.gadget} with 3 screens`,
    '8 ID badges',
    d.log.title,
    `${d.record.title} forms for ${k.subjects.length ? `each of your ${d.subjectPlural}` : `four ${d.subjectPlural}`}, plus a blank one`,
    `${d.ticket.title} cards`,
    d.passport.pageTitle,
    `${d.menu.title} and ${d.menu.coinsTitle.toLowerCase()}`,
    d.certificate.title,
  ];
  return `<section class="page guide">
    <div class="guide-head"><div class="guide-icon">${d.icon}</div><div><div class="clinic">Grown-up guide</div><h1>Welcome to ${esc(k.placeName)}!</h1></div></div>
    <p class="lead">${esc(G.intro.replace('{child}', k.childName))}</p>
    <div class="guide-cols">
      <div><h3>What’s inside</h3><ul>${inside.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div><h3>Set up in 10 minutes</h3><ol>${G.setup.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></div>
    </div>
    <div class="play"><h3>Play ideas</h3><div class="play-grid">
      ${G.play.map(([t, x]) => `<div><b>${esc(t)}</b>${esc(x)}</div>`).join('')}
    </div></div>
    <footer class="foot">Printable Party Games &amp; Quests · LittlePrintQuests</footer>
  </section>`;
}

// ---------- pretend gadget ----------
// One page folds into the kit's gadget: a screen on top, controls below (a keyboard for
// the laptop, big buttons for everything else). A second page holds two more screens
// to cut out and lay over the first. dashboard.device picks the look:
// laptop, console, tablet, helm or mirror.

function screenSchedule(k, S) {
  const subs = subjectsOrDefaults(k);
  const days = Array.from({ length: 35 }, (_, i) => i - 2);
  const busy = new Set([3, 7, 8, 12, 15, 19, 22, 26]);
  const cal = days
    .map((d) => (d < 1 || d > 30 ? '<span></span>' : `<span class="${d === 14 ? 'today' : busy.has(d) ? 'busy' : ''}">${d}</span>`))
    .join('');
  const extra = k.def.defaultKinds.map((kind) => ({ name: '', kind })).filter((d) => !subs.some((x) => x.kind === d.kind));
  const next = [...subs, ...extra].slice(0, 5)
    .map((p, i) => `<li><span class="em">${pic(k, p)}</span><div><b>${esc(p.name || kindName(k, p))}</b><small>${esc(k.def.log.reasons[i % k.def.log.reasons.length])}</small></div><time>${esc(k.def.log.times[i])}</time></li>`)
    .join('');
  return `<div class="app-body two-col">
    <div class="tile"><div class="tile-h">📅 ${esc(S.calendarLabel)}</div><div class="cal-head">${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((x) => `<i>${x}</i>`).join('')}</div><div class="cal">${cal}</div></div>
    <div class="tile"><div class="tile-h">${esc(S.nextLabel)}</div><ol class="next">${next}</ol></div>
  </div>`;
}

function screenMonitor(k, S) {
  const p = subjectsOrDefaults(k)[0];
  return `<div class="app-body monitor">
    <div class="tile who-tile"><div class="big-em">${pic(k, p)}</div><b>${esc(p.name || kindName(k, p))}</b><small>${esc(kindName(k, p))}</small></div>
    <div class="tile wave-tile"><div class="tile-h">${esc(S.waveLabel)}</div>
      <svg viewBox="0 0 300 70" class="wave"><polyline points="0,40 40,40 55,40 62,15 70,62 78,28 86,40 130,40 145,40 152,12 160,64 168,30 176,40 220,40 235,40 242,14 250,63 258,29 266,40 300,40"/></svg>
      <div class="stats">${S.stats.map(([e, label, val]) => `<div><span class="em">${e}</span><small>${esc(label)}</small><b>${esc(val)}</b></div>`).join('')}</div>
      <div class="acts">${S.keys.map(([e, n]) => `<span><b class="em">${e}</b>${esc(n)}</span>`).join('')}</div>
    </div>
  </div>`;
}

function screenAlert(k, S) {
  return `<div class="app-body alert">
    <div class="alert-icon">${S.alertIcon}</div>
    <div class="alert-title">${esc(S.alertTitle)}</div>
    <p>${esc(S.alertText)}</p>
    <div class="alert-btns"><span class="ok">${esc(S.alertButtons[0])}</span><span>${esc(S.alertButtons[1])}</span></div>
  </div>`;
}

function screen(k, which) {
  const S = k.def.dashboard;
  const body = { schedule: screenSchedule, monitor: screenMonitor, alert: screenAlert }[which](k, S);
  const title = { schedule: S.scheduleTitle, monitor: S.monitorTitle, alert: S.alertHeader }[which];
  return `<div class="bezel dev-${S.device || 'laptop'}"><div class="display">
    <div class="app-bar"><span class="app-name">${S.appIcon} ${esc(S.appName)}</span><span class="app-title">${esc(title)}</span><span class="app-user">${esc(k.lead)} ▾</span></div>
    ${body}
    <div class="dock">${S.dock.map((d) => `<span>${d}</span>`).join('')}</div>
  </div><div class="cam"></div></div>`;
}

function keyboard(k) {
  const S = k.def.dashboard;
  const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
  return `<div class="deck-base">
    <div class="keys">
      <div class="krow fn">${S.keys.map(([e, n]) => `<span class="fkey"><b class="em">${e}</b>${esc(n)}</span>`).join('')}</div>
      ${rows.map((r) => `<div class="krow">${[...r].map((c) => `<span>${c}</span>`).join('')}</div>`).join('')}
      <div class="krow"><span class="wide">Shift</span><span class="space">${esc(S.appName)}</span><span class="wide">Enter ⏎</span></div>
    </div>
    <div class="pad"></div>
  </div>`;
}

function controlPanel(k) {
  const S = k.def.dashboard;
  return `<div class="deck-base panel-base dev-${S.device}">
    <div class="panel-decor">${S.decor}</div>
    <div class="big-keys">${S.keys.map(([e, n]) => `<span><b class="em">${e}</b>${esc(n)}</span>`).join('')}</div>
    <div class="panel-name">${S.appIcon} ${esc(S.appName)}</div>
  </div>`;
}

function laptopPages(k) {
  return `<section class="page laptop">
      <div class="fold-top">${screen(k, 'schedule')}</div>
      <div class="fold-line"><span>Fold here, then stand the screen up</span></div>
      <div class="fold-bottom">${(k.def.dashboard.device || 'laptop') === 'laptop' ? keyboard(k) : controlPanel(k)}</div>
    </section>
    <section class="page laptop extra">
      <p class="pg-sub">More screens: cut out and lay over the ${esc(k.def.dashboard.appName)} screen.</p>
      <div class="swap">${screen(k, 'monitor')}</div>
      <div class="cut-h"></div>
      <div class="swap">${screen(k, 'alert')}</div>
    </section>`;
}

// ---------- document ----------

const KITS = {
  vet: require('./defs/vet'),
  space: require('./defs/space'),
  dino: require('./defs/dino'),
  hero: require('./defs/hero'),
  pirate: require('./defs/pirate'),
  royal: require('./defs/royal'),
};

function buildKitHtml(cfg) {
  const def = KITS[cfg.kit];
  if (!def) throw new Error(`Unknown kit "${cfg.kit}". Use one of: ${Object.keys(KITS).join(', ')}`);
  const k = normalize(def, cfg);
  const pages = [
    guidePage(k),
    signsPages(k),
    laptopPages(k),
    badgesPage(k),
    logPage(k),
    ...subjectsOrDefaults(k).map((p) => recordPage(k, p)),
    recordPage(k, null),
    ticketPage(k),
    passportsPages(k),
    menuPage(k),
    certificatePage(k),
  ].join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css(def.colors)}</style></head><body>${pages}</body></html>`;
}

function css(c) {
  const font = (family, file, weight) => `@font-face{font-family:'${family}';src:url('file://${FONT_DIR}/${file}');font-weight:${weight};}`;
  return `
${font('Fredoka', 'Fredoka.ttf', '300 700')}
${font('Nunito', 'Nunito.ttf', '200 1000')}
@page { size: letter; margin: 0; }
:root { --teal:${c.main}; --teal-d:${c.dark}; --mint:${c.soft}; --mint-l:${c.light}; --orange:${c.accent}; --accent-ink:${c.accentInk || '#2b1d06'}; --navy:#3f4a73; --cream:#fbf8f1; --line:#c9d6d0; --gold:${c.gold || '#f1d48f'}; }
* { box-sizing:border-box; }
html, body { margin:0; padding:0; }
body { font-family:'Nunito', sans-serif; color:var(--navy); -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.page { width:8.5in; height:11in; position:relative; overflow:hidden; page-break-after:always; background:#fff; padding:.45in; }
.page:last-child { page-break-after:auto; }
h1, h2, h3 { font-family:'Fredoka', sans-serif; margin:0; line-height:1.1; }
.em, .sign-icon, .form-icon, .pet-pic, .pp-photo, .pp-emblem, .cert-icon, .seal, .guide-icon, .faces span, .coin span, .paw { font-family:'Noto Color Emoji', sans-serif; font-weight:400; }
.clinic { font:600 9pt/1.2 'Fredoka'; letter-spacing:.08em; text-transform:uppercase; color:var(--teal); }
.box { display:inline-block; width:.2in; height:.2in; border:2px solid var(--navy); border-radius:4px; vertical-align:middle; }
.fill { display:inline-block; flex:1; min-width:1in; border-bottom:1.5px solid var(--navy); padding:0 4px 1px; font:500 13pt/1.2 'Fredoka'; min-height:1.3em; }
.field { display:flex; align-items:flex-end; gap:8px; margin:.09in 0; font-size:11pt; }
.field b { white-space:nowrap; }
.hint { font-size:9pt; color:#7a849f; margin:2px 0 0; text-align:center; }
.draw { font:500 10pt 'Fredoka'; color:#9aa3b8; }
.pg-title { font-size:24pt; text-align:center; }
.pg-sub { text-align:center; margin:.05in 0 .2in; font-size:11pt; color:#66708f; }
.foot { position:absolute; bottom:.35in; left:0; right:0; text-align:center; font:500 9pt 'Fredoka'; color:#9aa3b8; }

/* guide */
.guide { background:var(--cream); }
.guide-head { display:flex; gap:.2in; align-items:center; }
.guide-icon { font-size:46pt; background:var(--mint); border-radius:50%; width:1.1in; height:1.1in; display:grid; place-items:center; flex:none; }
.guide h1 { font-size:30pt; }
.lead { font-size:15pt; line-height:1.55; margin:.35in 0; }
.guide-cols { display:grid; grid-template-columns:1fr 1fr; gap:.3in; }
.guide h3 { font-size:18pt; color:var(--teal-d); margin-bottom:.08in; }
.guide ul, .guide ol { margin:0; padding-left:.25in; font-size:13.5pt; line-height:1.7; }
.play { margin-top:.45in; }
.play-grid { display:grid; grid-template-columns:1fr 1fr; gap:.15in; }
.play-grid div { background:#fff; border:1.5px solid var(--line); border-radius:12px; padding:.18in .2in; font-size:13pt; line-height:1.45; }
.play-grid b { display:block; font:600 14.5pt 'Fredoka'; margin-bottom:3px; }

/* signs: two landscape signs per page */
.signs { padding:.3in; display:flex; flex-direction:column; }
.sign { flex:1; padding:.12in; }
.cut-h { border-top:2px dashed #b7c0cc; margin:.06in -.3in; }
.sign-in { height:100%; border-radius:22px; background:var(--mint-l); border:5px solid var(--teal); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; position:relative; padding:.2in; }
.sign-icon { font-size:68pt; line-height:1; }
.sign-title { font:700 54pt/1.05 'Fredoka'; color:var(--teal-d); margin-top:.1in; }
.sign-sub { font:500 16pt 'Fredoka'; margin-top:.1in; color:var(--navy); }
.sign.hero .sign-in { background:var(--teal); border-color:var(--teal-d); }
.sign.hero .sign-title { color:#fff; font-size:46pt; }
.sign.hero .sign-sub { color:var(--mint); }
/* status signs */
.sign.go .sign-in { background:#e6f6ea; border-color:#3aa35b; } .sign.go .sign-title { color:#2b7a44; font-size:80pt; }
.sign.stop .sign-in { background:#fdecea; border-color:#e0675a; } .sign.stop .sign-title { color:#b8463a; font-size:80pt; }

/* badges: 8 per page, 3.5 x 2.2 in */
.badge-grid { display:grid; grid-template-columns:repeat(2, 3.55in); grid-auto-rows:2.25in; gap:.15in .25in; justify-content:center; }
.badge { border:1.5px dashed #b7c0cc; border-radius:14px; overflow:hidden; display:flex; flex-direction:column; background:#fff; }
.badge-top { background:var(--teal); color:#fff; font:600 11pt 'Fredoka'; display:flex; justify-content:space-between; padding:.06in .14in; letter-spacing:.06em; text-transform:uppercase; }
.badge.lead .badge-top { background:var(--orange); color:var(--accent-ink); }
.badge-body { flex:1; display:flex; gap:.12in; padding:.12in .14in; }
.photo { width:1.05in; flex:none; border:2px dashed var(--line); border-radius:10px; display:grid; place-items:center; text-align:center; font:500 9pt 'Fredoka'; color:#9aa3b8; background:var(--mint-l); }
.badge-info { flex:1; display:flex; flex-direction:column; justify-content:center; gap:4px; min-width:0; }
.badge-info .clinic { font-size:7.5pt; }
.who { font:700 17pt/1.1 'Fredoka'; }
.who .blank { display:block; border-bottom:1.5px solid var(--navy); height:.3in; }
.role { font:600 11pt 'Fredoka'; color:var(--teal-d); }
.barcode { height:.26in; margin-top:4px; background:repeating-linear-gradient(90deg, var(--navy) 0 2px, transparent 2px 4px, var(--navy) 4px 5px, transparent 5px 8px, var(--navy) 8px 11px, transparent 11px 13px); }

/* forms */
.form-head { display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid var(--teal); padding-bottom:.1in; margin-bottom:.2in; }
.form-head h2 { font-size:26pt; }
.form-icon { font-size:40pt; }
.appt { width:100%; border-collapse:collapse; font-size:12pt; }
.appt th { background:var(--teal); color:#fff; font:600 11.5pt 'Fredoka'; text-align:left; padding:.08in .1in; }
.appt td { border-bottom:1.5px solid var(--line); height:.55in; padding:0 .1in; }
.appt td.t { font:600 12pt 'Fredoka'; color:var(--teal-d); width:.8in; }
.appt td.tick { width:.6in; text-align:center; }
.appt .em { font-size:18pt; vertical-align:middle; }
.note { margin-top:.2in; font-size:10.5pt; color:#66708f; text-align:center; }
.patient { display:flex; gap:.25in; align-items:center; }
.pet-pic { width:1.7in; height:1.7in; border-radius:50%; background:var(--mint-l); border:3px solid var(--mint); display:grid; place-items:center; font-size:72pt; flex:none; text-align:center; }
.fields { flex:1; }
.field.half .fill { min-width:.8in; }
.check { width:100%; border-collapse:collapse; margin-top:.2in; font-size:12.5pt; }
.check th { background:var(--mint); font:600 11.5pt 'Fredoka'; padding:.07in .1in; text-align:left; }
.check td { border-bottom:1.5px solid var(--line); height:.44in; padding:0 .1in; }
.check td:not(:first-child) { text-align:center; width:1.6in; }
.check .em { font-size:15pt; vertical-align:middle; margin-right:4px; }
.two { display:grid; grid-template-columns:1fr 1fr; gap:.2in; margin-top:.22in; }
.panel { border:1.5px solid var(--line); border-radius:12px; padding:.12in .15in; font-size:12pt; }
.faces { display:flex; justify-content:space-around; font-size:26pt; margin-top:.08in; }
.lines i { display:block; border-bottom:1.5px solid var(--line); height:.36in; }
.sig { display:flex; align-items:flex-end; gap:8px; margin-top:.22in; font:600 12pt 'Fredoka'; }

/* prescriptions: 4 per page */
.rxs { padding:.3in; }
.rx-grid { display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr; height:100%; }
.rx { border:1.5px dashed #b7c0cc; margin:-.75px; padding:.25in; display:flex; flex-direction:column; gap:.06in; }
.rx-top { display:flex; align-items:center; gap:.12in; border-bottom:2.5px solid var(--teal); padding-bottom:.08in; }
.rx-top b { font:700 18pt 'Fredoka'; }
.rx-mark { font:700 34pt/1 'Fredoka', 'Noto Color Emoji'; color:var(--orange); }
.meds { display:grid; grid-template-columns:1fr 1fr; gap:.1in .08in; font-size:11pt; margin:.08in 0; }
.meds span { display:flex; align-items:center; gap:6px; font-family:'Nunito', 'Noto Color Emoji'; }
.meds .box { width:.18in; height:.18in; flex:none; }
.times { display:flex; align-items:center; gap:.12in; font-size:11pt; }
.times span { width:.32in; height:.32in; border:2px solid var(--navy); border-radius:50%; display:grid; place-items:center; font:600 12pt 'Fredoka'; }
.sig.small { margin-top:auto; font-size:11pt; }
.rx-notes { margin-top:.1in; font-size:11pt; } .rx-notes i { height:.34in; }

/* passports: 4 per page, each folds in half */
.pp-grid { display:grid; grid-template-columns:1fr; gap:.18in; }
.passport { display:grid; grid-template-columns:2.9in 1fr; height:2.05in; border:1.5px dashed #b7c0cc; border-radius:12px; overflow:hidden; }
.pp-cover { background:var(--teal-d); color:#fff; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; border-right:1.5px dashed rgba(255,255,255,.6); }
.pp-cover .clinic { color:var(--mint); font-size:8pt; }
.pp-emblem { font-size:30pt; width:.75in; height:.75in; border:3px solid var(--gold); border-radius:50%; display:grid; place-items:center; }
.pp-word { font:700 19pt 'Fredoka'; letter-spacing:.06em; text-transform:uppercase; color:var(--gold); }
.pp-inside { display:grid; grid-template-columns:1.25in 1fr .9in; gap:.12in; padding:.14in; background:var(--cream); align-items:center; }
.pp-photo { height:1.5in; border:2px solid var(--line); border-radius:8px; background:#fff; display:grid; place-items:center; font-size:48pt; text-align:center; }
.pp-fields .field { margin:.05in 0; font-size:9.5pt; } .pp-fields .fill { min-width:.6in; font-size:11pt; }
.stamps { font:600 9pt 'Fredoka'; text-align:center; }
.stamps div { display:grid; grid-template-columns:1fr 1fr; gap:.06in; margin-top:.05in; }
.stamps span { height:.38in; border:1.5px dashed var(--teal); border-radius:50%; }

/* price list and coins */
.price-list { display:grid; grid-template-columns:1fr 1fr; gap:.12in .4in; }
.price { display:flex; align-items:baseline; gap:8px; font:600 14pt 'Fredoka'; }
.price .em { font-size:18pt; }
.price .dots { flex:1; border-bottom:2px dotted var(--line); }
.price .pc { color:var(--teal-d); }
.coins-title { margin:.35in 0 .12in; font-size:17pt; } .coins-title small { font:400 10.5pt 'Nunito'; color:#66708f; margin-left:6px; }
.coins { display:grid; grid-template-columns:repeat(5, 1fr); gap:.14in; justify-items:center; }
.coin { width:1.15in; height:1.15in; border-radius:50%; background:radial-gradient(circle at 35% 30%, #ffe3a6, #f2b347 60%, #d98f1f); border:2px dashed #b77818; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#5a3a06; }
.coin span { font-size:20pt; line-height:1; } .coin b { font:700 22pt/1 'Fredoka'; }

/* certificate */
.cert { padding:.5in; background:var(--cream); }
.cert-in { height:100%; border:6px double var(--teal); border-radius:24px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:.5in; gap:.12in; }
.cert-icon { font-size:70pt; }
.cert-kicker { font:600 13pt 'Fredoka'; letter-spacing:.12em; text-transform:uppercase; color:var(--teal); }
.cert h1 { font-size:40pt; color:var(--teal-d); }
.cert p { font-size:15pt; max-width:5.5in; margin:0; }
.cert-name { font:700 46pt 'Fredoka'; color:var(--orange); border-bottom:3px solid var(--orange); padding:0 .3in .05in; margin:.05in 0 .1in; }
.cert-row { display:flex; align-items:center; gap:.5in; margin-top:.5in; font:600 11pt 'Fredoka'; }
.cert-row > div:not(.seal) { display:flex; flex-direction:column; gap:4px; width:2in; } .cert-row .fill { min-width:2in; }
.seal { font-size:34pt; width:1.1in; height:1.1in; border-radius:50%; background:var(--orange); display:grid; place-items:center; box-shadow:0 0 0 5px #fff, 0 0 0 8px var(--orange); }

/* pretend laptop */
.laptop { padding:.35in .4in; display:flex; flex-direction:column; }
.fold-top, .fold-bottom { flex:1; display:flex; align-items:center; justify-content:center; }
.fold-top { align-items:flex-end; padding-bottom:.12in; } .fold-bottom { align-items:flex-start; padding-top:.12in; }
.fold-line { border-top:2px dashed #b7c0cc; position:relative; height:0; margin:0 -.4in; }
.fold-line span { position:absolute; left:50%; top:-.09in; transform:translateX(-50%); background:#fff; padding:0 .1in; font:500 8pt 'Fredoka'; color:#9aa3b8; white-space:nowrap; }
.bezel { width:7.4in; height:4.6in; background:#2d3550; border-radius:.22in; padding:.2in .2in .26in; position:relative; }
.cam { position:absolute; top:.07in; left:50%; width:.07in; height:.07in; margin-left:-.035in; border-radius:50%; background:#55607f; }
.display { height:100%; background:#f4f8fb; border-radius:.06in; overflow:hidden; display:flex; flex-direction:column; }
.app-bar { display:flex; align-items:center; gap:.15in; background:var(--teal); color:#fff; padding:.07in .14in; font:600 10pt 'Fredoka', 'Noto Color Emoji'; }
.app-name { font-weight:700; } .app-title { flex:1; opacity:.85; } .app-user { background:rgba(255,255,255,.18); border-radius:99px; padding:2px 10px; font-size:9pt; }
.app-body { flex:1; padding:.12in; min-height:0; }
.dock { display:flex; justify-content:center; gap:.12in; padding:.05in; background:#e3e9f0; font-family:'Noto Color Emoji'; font-size:14pt; }
.tile { background:#fff; border-radius:.08in; border:1px solid #dbe3ec; padding:.08in .1in; min-width:0; }
.tile-h { font:600 9.5pt 'Fredoka', 'Noto Color Emoji'; color:var(--teal-d); margin-bottom:.05in; }
.two-col { display:grid; grid-template-columns:1fr 1.1fr; gap:.12in; }
.cal-head, .cal { display:grid; grid-template-columns:repeat(7, 1fr); text-align:center; }
.cal-head i { font:600 7.5pt 'Fredoka'; color:#9aa3b8; font-style:normal; }
.cal span { font:500 8.5pt/1 'Fredoka'; height:.33in; display:grid; place-items:center; border-radius:50%; margin:1px; }
.cal .busy { background:var(--mint-l); color:var(--teal-d); }
.cal .today { background:var(--orange); color:var(--accent-ink); font-weight:700; }
.next { list-style:none; margin:0; padding:0; display:grid; gap:.06in; }
.next li { display:flex; align-items:center; gap:.08in; background:var(--mint-l); border-radius:.06in; padding:.05in .08in; }
.next .em { font-size:17pt; } .next div { flex:1; min-width:0; } .next b { display:block; font:600 10pt/1.1 'Fredoka'; } .next small { font-size:8pt; color:#66708f; }
.next time { font:600 9pt 'Fredoka'; color:var(--teal-d); }
.monitor { display:grid; grid-template-columns:1.5in 1fr; gap:.12in; }
.who-tile { display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
.big-em { font-family:'Noto Color Emoji'; font-size:46pt; } .who-tile b { font:700 13pt 'Fredoka'; } .who-tile small { color:#66708f; }
.wave { width:100%; height:.85in; background:#11203a; border-radius:.06in; }
.wave polyline { fill:none; stroke:#5cf0a2; stroke-width:2.5; stroke-linejoin:round; }
.stats { display:grid; grid-template-columns:repeat(3, 1fr); gap:.08in; margin-top:.08in; }
.stats div { background:var(--mint-l); border-radius:.06in; padding:.05in .07in; display:grid; }
.stats .em { font-size:12pt; } .stats small { font-size:7.5pt; color:#66708f; } .stats b { font:700 13pt 'Fredoka'; color:var(--teal-d); }
.acts { display:grid; grid-template-columns:repeat(2, 1fr); gap:.06in; margin-top:.08in; }
.acts span { border:1.5px solid var(--teal); border-radius:99px; padding:.04in .08in; font:600 9pt 'Fredoka'; color:var(--teal-d); display:flex; align-items:center; gap:5px; } .acts .em { font-size:11pt; }
.alert { display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; background:linear-gradient(#fff4f0, #fff); }
.alert-icon { font-family:'Noto Color Emoji'; font-size:40pt; }
.alert-title { font:700 22pt 'Fredoka'; color:#c0392b; margin-top:.04in; }
.alert p { font-size:11pt; margin:.06in 0 .12in; max-width:5in; }
.alert-btns { display:flex; gap:.15in; } .alert-btns span { font:600 11pt 'Fredoka'; border:2px solid var(--navy); border-radius:99px; padding:.05in .25in; }
.alert-btns .ok { background:var(--teal); border-color:var(--teal); color:#fff; }
.deck-base { width:7.4in; height:4.5in; background:#d9dee8; border-radius:.2in .2in .28in .28in; padding:.2in .25in; display:flex; flex-direction:column; align-items:center; gap:.16in; }
.keys { width:100%; display:grid; gap:.06in; }
.krow { display:flex; gap:.05in; justify-content:center; }
.krow span { flex:1; max-width:.58in; height:.42in; background:#fff; border-radius:.05in; box-shadow:0 2px 0 #aab3c4; display:grid; place-items:center; font:600 10pt 'Fredoka'; color:var(--navy); }
.krow .wide { max-width:1.1in; font-size:9pt; } .krow .space { max-width:3.6in; font-size:8pt; color:#9aa3b8; }
.krow.fn .fkey { max-width:1.4in; height:.5in; background:var(--mint-l); display:flex; gap:4px; font-size:8.5pt; padding:0 .06in; }
.fkey .em { font-size:13pt; }
.pad { width:2.4in; height:1.05in; border-radius:.1in; background:#c5ccd8; box-shadow:inset 0 1px 3px rgba(0,0,0,.15); }
/* gadget looks */
.panel-base { flex-direction:row; flex-wrap:wrap; justify-content:center; align-content:center; gap:.2in .3in; }
.panel-decor { font-family:'Noto Color Emoji'; font-size:64pt; line-height:1; }
.big-keys { display:grid; grid-template-columns:1fr 1fr; gap:.14in; }
.big-keys span { width:1.7in; height:.75in; border-radius:.16in; background:#fff; box-shadow:0 4px 0 #aab3c4; display:flex; align-items:center; gap:.08in; padding:0 .14in; font:600 12pt 'Fredoka'; color:var(--navy); }
.big-keys .em { font-size:20pt; }
.panel-name { width:100%; text-align:center; font:700 12pt 'Fredoka', 'Noto Color Emoji'; color:var(--teal-d); letter-spacing:.05em; }
.bezel.dev-console { background:#1b2440; border-radius:.1in; box-shadow:inset 0 0 0 4px #33406a; }
.panel-base.dev-console { background:#2a3558; } .dev-console .big-keys span { background:#3b4a7a; color:#fff; box-shadow:0 4px 0 #141b33; }
.dev-console .big-keys span:nth-child(1) { background:#e2483d; } .dev-console .big-keys span:nth-child(2) { background:#f2a640; color:#2b1d06; }
.dev-console .panel-name { color:#c9d8f5; }
.bezel.dev-tablet { background:var(--teal-d); border-radius:.38in; padding:.3in; }
.panel-base.dev-tablet { background:var(--teal); border-radius:.38in; } .dev-tablet .panel-name { color:#fff; }
.bezel.dev-helm { background:linear-gradient(135deg, #8a5a2b, #5e3a17); border-radius:.14in; padding:.26in; box-shadow:inset 0 0 0 5px #b8901f; }
.panel-base.dev-helm { background:linear-gradient(135deg, #9b6a36, #6b431c); box-shadow:inset 0 0 0 5px #b8901f; border-radius:.14in; }
.dev-helm .big-keys span { background:#f1d48f; box-shadow:0 4px 0 #8a6a1f; color:#3b2a10; } .dev-helm .panel-name { color:#f1d48f; }
.bezel.dev-mirror { background:linear-gradient(135deg, #e6c56b, #b8901f); border-radius:1.5in 1.5in .3in .3in; padding:.42in .32in .3in; }
.dev-mirror .display { border-radius:1.3in 1.3in .1in .1in; }
.dev-mirror .app-bar { padding:.3in 1.1in .08in; }
.panel-base.dev-mirror { background:var(--mint-l); border:5px solid #d4af4a; border-radius:.3in; } .dev-mirror .big-keys span { box-shadow:0 4px 0 #d4af4a; }
.extra { justify-content:space-evenly; align-items:center; }
.extra .pg-sub { margin:0; } .extra .cut-h { width:calc(100% + .8in); }
.swap .bezel { background:transparent; padding:0; border:1.5px dashed #b7c0cc; height:4.3in; box-shadow:none; } .swap .cam { display:none; }
`;
}

module.exports = { buildKitHtml, KITS };
