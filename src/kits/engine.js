// Pretend play kit engine. A kit definition (src/kits/defs/*.js) lists its signs, badges,
// forms and props; this file turns a definition plus one child's details into print HTML.
//
// Order config shape:
//   { kit: 'vet', childName: 'Maya', placeName?: 'Maya’s Pet Clinic',
//     subjects?: [{ name: 'Biscuit', kind: 'dog' }, ...],  // pets, crew, guests... up to 6
//     staff?: ['Leo', 'Grandpa'],                         // extra badge names, up to 7
//     lenient?: true,   // unknown subject kinds fall back to the kit's defaults instead of throwing
//     withHunt?: true,  // sold with the matching hunt: the guide explains how the two connect
//     age?: 3, ages?: 'little' | 'big' }  // the little-kids version (ages 3 to 5) has thicker cut
//                                         // lines, bigger pictures and picture-only order forms; it's
//                                         // picked by age unless ages says which
// Everything except kit and childName is optional; empty slots print as blanks to fill in.
//
// Pictures are Noto Color Emoji (SIL Open Font License), so they're free to use in a product.

const path = require('path');
const { toyPages, toyCss } = require('./toys');
const { welcomePage, menuBoard, specialsPage, moneyPage, shopCss } = require('./shop');
const art = require('./art');
const { SHOP_PROPS, shopkitCss } = require('./shopkit');
const { stationPages, counterPages, labelsPage, signageCss, signageCount } = require('./signage');
const { disguisePages, hasDisguises, disguiseCss, DISGUISES } = require('./disguises');
const { activityPages, activityTitles, activityCss, activityCount } = require('./activities');
const extras = require('./extras');
const { bigPages, bigLine, bigCss } = require('./bigpages');
const { bookCardPages, bookCardLine, bookCardCss } = require('./bookcards');
const rooms = require('./rooms');
const { fitScript, placeHtml } = require('./fit');
const { splitNames, joinNames } = require('../generator/kid-names');

const FONT_DIR = path.join(__dirname, '..', '..', 'fonts');
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const possessive = (name) => (/s$/i.test(name) ? `${name}’` : `${name}’s`);

function normalize(def, cfg) {
  // Two or more kids ("Jaxon and Jonah") share the kit: the words say "Jaxon & Jonah", and each kid
  // gets their own lead badge and certificate.
  const names = splitNames(cfg.childName);
  const childName = joinNames(names);
  if (!childName) throw new Error('childName is required');
  const lead = (n) => `${def.leadPrefix ? def.leadPrefix + ' ' : ''}${n}`;
  const aliases = def.kindAliases || {};
  const subjects = (cfg.subjects || cfg.pets || []).slice(0, 6).map((p, i) => {
    const key = String(p.kind || '').toLowerCase().replace(/\s+/g, '_');
    const kind = (def.kinds[key] ? key : aliases[key]) || (cfg.lenient ? def.defaultKinds[i % def.defaultKinds.length] : null);
    if (!kind) throw new Error(`Unknown ${def.subjectWord} kind "${p.kind}". Use one of: ${Object.keys(def.kinds).join(', ')}`);
    return { name: String(p.name || '').trim(), kind };
  });
  return {
    def,
    childName,
    names,
    lead: lead(childName),
    leads: names.map(lead),
    placeName: String(cfg.placeName || cfg.clinicName || def.placeName(possessive(childName))).trim(),
    subjects,
    withHunt: Boolean(cfg.withHunt),
    little: cfg.ages ? cfg.ages === 'little' : Number(cfg.age) > 0 && Number(cfg.age) <= 5, // little kids are 3 to 5 (was 2 to 4 before 2026-10-23)
    staff: (cfg.staff || []).slice(0, 7).map((s) => String(s).trim()).filter(Boolean),
  };
}

const pic = (k, s) => k.def.kinds[s.kind][0];
// An empty box to draw in, with its words underneath so they don't get drawn over.
const drawBox = (cls, label) => `<div class="draw-wrap"><div class="${cls} empty"></div><span class="draw-cap">${esc(label)}</span></div>`;
const kindName = (k, s) => k.def.kinds[s.kind][1];
const subjectsOrDefaults = (k) => (k.subjects.length ? k.subjects : k.def.defaultKinds.map((kind) => ({ name: '', kind })));

// ---------- pieces ----------

let signSeed = 0;
function sign(title, sub, icon, cls = '') {
  return `<div class="sign ${cls}"><div class="sign-in">
    <svg class="sign-deco" viewBox="0 0 700 440" preserveAspectRatio="none">${art.confetti(++signSeed, 700, 440, 26, [110, 40, 480, 360])}</svg>
    <div class="sign-icon">${art.pic(icon, '1.15in')}</div>
    <div class="sign-title"${cls.includes('hero') ? ` data-lines="2">${placeHtml(title)}` : `>${esc(title)}`}</div>
    ${sub ? `<div class="sign-sub">${esc(sub)}</div>` : ''}
  </div></div>`;
}

// Hand washing in pictures, for kids who can't read yet: wet, soap, scrub, rinse, dry.
const WASH = [['💧', 'Wet'], ['🧼', 'Soap'], ['👏', 'Scrub'], ['🚿', 'Rinse'], ['🧻', 'Dry']];
function washSign(title) {
  return `<div class="sign wash"><div class="sign-in">
    <div class="sign-title">${esc(title)}</div>
    <div class="wash-steps">${WASH.map(([e, w], i) => `<div class="wash-step"><b>${i + 1}</b>${art.pic(e, '1in')}<span>${w}</span></div>`).join('<i>›</i>')}</div>
  </div></div>`;
}

// A blank sign to write and draw on, so a page is never left half empty.
const ownSign = () => `<div class="sign own"><div class="sign-in"><div class="own-draw">Draw a picture</div><div class="own-line"></div><div class="sign-sub">Make your own sign</div></div></div>`;

function signsPages(k) {
  const d = k.def;
  const s = [sign(k.placeName, d.tagline, d.icon, 'hero'), ...d.signs.map(([t, sub, icon, cls]) => (cls === 'wash' ? washSign(t) : sign(t, sub, icon, cls)))];
  if (s.length % 2) s.push(ownSign());
  const out = [];
  for (let i = 0; i < s.length; i += 2) out.push(`<section class="page signs">${s[i]}<div class="cut-h"></div>${s[i + 1]}</section>`);
  return out.join('');
}

function badge(k, name, role, lead) {
  return `<div class="badge ${lead ? 'lead' : ''}">
    <div class="badge-top"><span>${k.def.badgeIcon} ${esc(lead ? k.def.leadRole : 'Crew')}</span><span>ID</span></div>
    <div class="badge-body">
      <div class="photo-col"><div class="photo"></div><span class="draw-cap">Draw yourself</span></div>
      <div class="badge-info">
        <div class="clinic">${esc(k.placeName)}</div>
        <div class="who"${name ? ' data-lines="2"' : ''}>${name ? esc(name) : '<span class="blank"></span>'}</div>
        <div class="role">${esc(role)}</div>
        <div class="barcode"></div>
      </div>
    </div>
  </div>`;
}

function badgesPage(k) {
  const d = k.def;
  const cards = k.leads.slice(0, 4).map((n) => badge(k, n, d.leadRole, true));
  const crew = 8 - cards.length;
  for (let i = 0; i < crew; i++) {
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
      ${p ? `<div class="pet-pic">${pic(k, p)}</div>` : drawBox('pet-pic', R.drawLabel)}
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

function ticketCardLittle(k) {
  const T = k.def.ticket;
  return `<div class="rx little-rx">
    <div class="rx-top"><span class="rx-mark">${T.mark}</span><div><div class="clinic">${esc(k.placeName)}</div><b>${esc(T.title)}</b></div></div>
    <div class="lx-grid">${T.options.slice(0, 8).map(([e, n]) => `<div class="lr-tile">${art.pic(e, '.5in')}<span>${esc(n)}</span></div>`).join('')}</div>
    <div class="times"><b>${esc(T.countLabel)}</b> <span>1</span><span>2</span><span>3</span><span>4</span></div>
    <div class="lx-coins"><b>Pay</b>${Array.from({ length: 5 }, () => art.pic(k.def.menu.coinIcon, '.36in')).join('')}</div>
  </div>`;
}

function ticketPage(k) {
  const c = k.little ? ticketCardLittle(k) : ticketCard(k);
  return `<section class="page rxs"><div class="rx-grid">${c}${c}${c}${c}</div></section>`;
}

function passport(k, p) {
  const P = k.def.passport;
  return `<div class="passport">
    <div class="pp-cover"><div class="pp-emblem">${P.emblem}</div><div class="pp-word">${esc(P.word)}</div><div class="clinic">${esc(k.placeName)}</div></div>
    <div class="pp-inside">
      ${p ? `<div class="pp-photo">${pic(k, p)}</div>` : drawBox('pp-photo', P.drawLabel)}
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

// The child's own certificate (one each when the kit is for two kids), then a blank copy to print
// for guests and siblings.
function certificatePage(k, blank = false) {
  if (!blank && k.leads.length > 1) return k.leads.map((who) => certificatePage({ ...k, lead: who, leads: [who] })).join('');
  const C = k.def.certificate;
  return `<section class="page cert${blank ? ' blank' : ''}">
    <div class="cert-in">
      <div class="cert-icon">${C.icon}</div>
      <div class="cert-kicker">${placeHtml(k.placeName)}</div>
      <h1>${esc(C.title)}</h1>
      <p>This certifies that</p>
      <div class="cert-name"${blank ? '' : ' data-lines="1"'}>${blank ? '&nbsp;' : esc(k.lead)}</div>
      <p>${esc(C.line)}</p>
      <div class="cert-row"><div><span class="fill"></span>Date</div><div class="seal">${C.seal}</div><div><span class="fill"></span>Signed</div></div>
    </div>
  </section>`;
}

// The grown-up guide's line for the wall pieces: the old pizza oven and stovetop, and the newer room pieces.
function appliancesLines(list) {
  const NAMES = { oven: 'a pizza oven', stove: 'a stovetop', ...rooms.APPLIANCE_NAMES };
  const kitchen = list.filter((a) => a !== 'stage').map((a) => NAMES[a]);
  const and = (xs) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}` : xs[0]);
  const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1);
  return [...(kitchen.length ? [`${cap(and(kitchen))} to tape onto a box or a play kitchen`] : []), ...(list.includes('stage') ? [cap(NAMES.stage)] : [])];
}

function guidePage(k) {
  const G = k.def.guide;
  const d = k.def;
  const signCount = d.signs.length + 1;
  const inside = [
    ...(d.hunt && !d.bigSign ? [] : ['A big shop sign: two pages that glue into one 20 inch banner']),
    `${signCount} signs for doors and walls${signCount % 2 ? ' (and a blank one)' : ''}, plus ${signageCount(d) ? `${signageCount(d)} big station ${signageCount(d) === 1 ? 'sign' : 'signs'}, ` : ''}7 counter signs (a fold-over Open/Closed sign, pay here, our hours and more) and 15 shelf and bin labels`,
    ...(d.appliances ? appliancesLines(d.appliances) : []),
    ...(extras.hasWow(k) ? [d.wow.inside] : []),
    ...bigLine(k),
    ...(d.jars ? [`${d.jars.length} wrap-around jar labels`] : []),
    ...(d.toys ? d.toys.map((t) => t.inside) : [`${['laptop', 'console'].includes(d.dashboard.device) ? 'A fold-up' : 'A cut-out'} ${d.dashboard.gadget} with 3 screens`]),
    '8 ID badges',
    ...(d.chefHat ? [`A chef hat with ${k.lead} on the band`] : []),
    ...(hasDisguises(k) ? [`Photo booth disguises on a stick: a ${DISGUISES[d.id][0].toLowerCase()}, ${DISGUISES[d.id][1].toLowerCase()} and speech bubbles`] : []),
    ...(d.peel ? ['A pizza peel and two draw-your-own wipe-off pizzas'] : []),
    ...(d.props ? [`Props to cut out: ${Object.values(d.props).map((x) => x.title).join(', ')}`] : []),
    ...(d.folders ? [`${d.folders.title}: manila folders with a tab to fold up, a ${d.folders.intake.title}, plus file labels and stamps`] : []),
    `${d.record.title} forms, two to a page, for ${k.subjects.length ? `each of your ${d.subjectPlural}` : `four ${d.subjectPlural}`} plus a blank one`,
    `${d.ticket.title} cards`,
    d.passport.pageTitle,
    ...bookCardLine(k),
    'Morning paperwork: a Good Morning checklist and a Supply Order form',
    `Shop set: welcome poster, ${d.menu.fold ? `a ${d.menu.title} that folds like a book` : `${d.menu.title} board`}, Today’s Specials, order slips, ${d.menu.coinsTitle.toLowerCase()} and a pull-tab money machine`,
    `${d.certificate.title} (named + blank)`,
  ];
  // A long list (the shop kits with lots of extra pieces) gets a smaller type size so the play ideas still fit.
  const len = inside.join('').length;
  const dense = len > 980 ? ' dense denser' : len > 850 ? ' dense' : '';
  return `<section class="page guide${k.withHunt && G.afterHunt ? ' with-hunt' : ''}${dense}">
    <div class="guide-head"><div class="guide-icon">${d.icon}</div><div><div class="clinic">Grown-up guide${k.little ? ' · little kids version, ages 3 to 5' : ''}</div><h1>Welcome to ${esc(k.placeName)}!</h1></div></div>
    <p class="lead">${esc(G.intro.replace('{child}', k.childName))}</p>
    <div class="guide-cols">
      <div><h3>What’s inside</h3><ul>${inside.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div><h3>Set up in 10 minutes</h3><ol>${[G.setup[0], 'Hang the welcome poster; tape up the menu and specials.', ...G.setup.slice(1)].map((x) => `<li>${esc(x)}</li>`).join('')}</ol></div>
    </div>
    ${k.withHunt && G.afterHunt ? `<div class="after-hunt"><b>After the hunt</b>${esc(G.afterHunt.replace('{place}', k.placeName).replace('{child}', k.childName))}</div>` : ''}
    <div class="play"><h3>Play ideas</h3><div class="play-grid">
      ${G.play.map(([t, x]) => `<div><b>${esc(t)}</b>${esc(x)}</div>`).join('')}
    </div></div>
    <footer class="foot">Printable Party Games &amp; Quests · LittlePrintQuests</footer>
  </section>`;
}

// ---------- pretend gadget ----------
// One page holds the kit's pretend gadget and a second page two more screens to cut out
// and lay over the first. dashboard.device picks the shape:
//   laptop, console  a screen that folds up behind a keyboard or control desk
//   scanner, communicator  a handheld gadget with buttons under the screen
//   helm     a sea chart plus a ship's wheel to cut out
//   mirror   a standing magic mirror with a fold-back stand

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
    <div class="toggles">${['A', 'B', 'C', 'D', 'E', 'F'].map((x) => `<span><i></i>${x}</span>`).join('')}</div>
    <div class="panel-decor">${S.decor}</div>
    <div class="big-keys">${S.keys.map(([e, n]) => `<span><b class="em">${e}</b>${esc(n)}</span>`).join('')}</div>
    <div class="dials"><span></span><span></span><span></span></div>
    <div class="panel-name">${S.appIcon} ${esc(S.appName)}</div>
  </div>`;
}

const roundKeys = (S) => `<div class="round-keys">${S.keys.map(([e, n]) => `<span><b class="em">${e}</b><small>${esc(n)}</small></span>`).join('')}</div>`;

function foldPage(k) {
  const S = k.def.dashboard;
  return `<section class="page gadget fold">
    <div class="fold-top">${screen(k, 'schedule')}</div>
    <div class="fold-line"><span>Fold here, then stand the screen up</span></div>
    <div class="fold-bottom">${S.device === 'console' ? controlPanel(k) : keyboard(k)}</div>
  </section>`;
}

// A handheld gadget in one piece: lens or antenna on top, screen, then buttons.
function handheldPage(k) {
  const S = k.def.dashboard;
  const top = S.device === 'communicator'
    ? `<div class="antenna"></div><div class="grille">${'<i></i>'.repeat(7)}</div>`
    : `<div class="lens"><i></i></div><div class="beam">SCAN</div>`;
  return `<section class="page gadget">
    <p class="pg-sub">Cut around the ${esc(S.gadget)}. Glue it onto cardboard to make it sturdy.</p>
    <div class="handheld dev-${S.device}">
      <div class="hh-top">${top}<span class="hh-name">${S.appIcon} ${esc(S.appName)}</span><span class="led"></span></div>
      ${screen(k, 'schedule')}
      <div class="hh-bottom"><div class="dpad"><i></i><i></i><i></i><i></i></div>${roundKeys(S)}</div>
    </div>
  </section>`;
}

// The sea chart stands up like a map board; the wheel is cut out and spins on a pencil.
function helmPage(k) {
  const S = k.def.dashboard;
  const spokes = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    const [x1, y1, x2, y2] = [26 * Math.cos(a), 26 * Math.sin(a), 104 * Math.cos(a), 104 * Math.sin(a)];
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/><circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="9"/>`;
  }).join('');
  return `<section class="page gadget">
    <p class="pg-sub">Cut out the sea chart and the ship’s wheel. Push a pencil through the middle of the wheel so it spins.</p>
    <div class="chart">${screen(k, 'schedule')}</div>
    <div class="cut-h"></div>
    <div class="wheel-row">
      <div class="wheel"><svg viewBox="-116 -116 232 232"><g class="spokes">${spokes}</g><circle class="rim" r="74"/><circle class="rim-in" r="66"/><circle class="hub" r="26"/></svg><span class="em">${S.decor}</span></div>
      <div class="orders"><div class="orders-h">Captain’s orders</div>${roundKeys(S)}</div>
    </div>
  </section>`;
}

function mirrorPage(k) {
  const S = k.def.dashboard;
  return `<section class="page gadget">
    <p class="pg-sub">Cut around the mirror and its stand. Fold the tab back so the mirror stands up.</p>
    <div class="mirror">
      <div class="mirror-crown em">👑</div>
      <div class="mirror-frame"><div class="mirror-arch">✨ Mirror, mirror, what’s on today? ✨</div>${screen(k, 'schedule')}</div>
      <div class="mirror-stand">${roundKeys(S)}</div>
      <div class="stand-tab">Fold back to stand</div>
    </div>
  </section>`;
}

function gadgetPages(k) {
  if (k.def.toys) return toyPages(k);
  const device = k.def.dashboard.device || 'laptop';
  const main = { laptop: foldPage, console: foldPage, scanner: handheldPage, communicator: handheldPage, helm: helmPage, mirror: mirrorPage }[device];
  if (!main) throw new Error(`Unknown gadget device "${device}"`);
  return `${main(k)}
    <section class="page gadget extra">
      <p class="pg-sub">More screens: cut out and lay over the ${esc(k.def.dashboard.appName)} screen.</p>
      <div class="swap">${screen(k, 'monitor')}</div>
      <div class="cut-h"></div>
      <div class="swap">${screen(k, 'alert')}</div>
    </section>`;
}

// ---------- flat props ----------
// def.props picks which of these a kit gets: scans, map, wanted, cards, patches, wearable.

const coins = (k, n) => `${n} ${n === 1 ? k.def.menu.coinWord : `${k.def.menu.coinWord}s`}`;
const propHead = (k, title, howTo) => `<h2 class="pg-title">${esc(title)}</h2><p class="pg-sub">${esc(howTo)}</p>`;

// Six scan cards: each subject as a glowing silhouette, with findings to tick.
function scansPage(k) {
  const S = k.def.props.scans;
  const subs = [...subjectsOrDefaults(k)];
  for (const kind of [...k.def.defaultKinds, ...Object.keys(k.def.kinds)]) if (subs.length < 6 && !subs.some((s) => s.kind === kind)) subs.push({ name: '', kind });
  const cards = subs.slice(0, 6).map((p, i) => {
    const f = S.findings;
    const ticks = [f[i % f.length], f[(i + 2) % f.length], 'All healthy'];
    return `<div class="scan">
      <div class="scan-top"><span>${esc(S.label)}</span><span>${esc(p.name || kindName(k, p))}</span></div>
      <div class="scan-body"><div class="scan-pic em">${pic(k, p)}</div>
        <ul>${ticks.map((t) => `<li><i class="box"></i>${esc(t)}</li>`).join('')}</ul></div>
    </div>`;
  }).join('');
  return `<section class="page props">${propHead(k, S.title, S.howTo)}<div class="scan-grid">${cards}</div></section>`;
}

// A floor map: a dotted trail from the start through five places to the end.
function mapPage(k) {
  const M = k.def.props.map;
  const pts = [[12, 88], [42, 80], [78, 70], [60, 52], [22, 45], [40, 26], [80, 14]];
  const stops = [M.start, ...M.places, M.end];
  const d = pts.map(([x, y], i) => (i ? `L${x * 7.7},${y * 9.4}` : `M${x * 7.7},${y * 9.4}`)).join(' ');
  const decor = { sea: ['🐳', '🌊', '🐠', '🌊'], land: ['🌲', '🌳', '🪨', '🌼'], space: ['⭐', '✨', '🛸', '⭐'] }[M.theme] || [];
  const spots = [[85, 40], [8, 64], [62, 90], [30, 10]];
  return `<section class="page props">${propHead(k, M.title, M.howTo)}
    <div class="map map-${M.theme}">
      <svg viewBox="0 0 770 940" preserveAspectRatio="none"><path d="${d}"/></svg>
      ${decor.map((e, i) => `<span class="map-decor em" style="left:${spots[i][0]}%;top:${spots[i][1]}%">${e}</span>`).join('')}
      <span class="map-rose em">🧭</span>
      ${stops.map(([e, n], i) => `<div class="map-stop${i === 0 ? ' start' : i === stops.length - 1 ? ' end' : ''}" style="left:${pts[i][0]}%;top:${pts[i][1]}%"><b class="em">${e}</b><span>${esc(n)}</span></div>`).join('')}
    </div>
  </section>`;
}

function wantedPage(k) {
  const W = k.def.props.wanted;
  const posters = W.list.map(([e, name, why], i) => `<div class="wanted">
      <div class="wanted-word">${esc(W.word)}</div>
      <div class="wanted-pic em">${e}</div>
      <div class="wanted-name">${esc(name)}</div>
      <p>For ${esc(why.charAt(0).toLowerCase() + why.slice(1))}</p>
      <div class="wanted-reward">Reward: ${esc(coins(k, 5 + i * 5))}</div>
    </div>`).join('');
  return `<section class="page props">${propHead(k, W.title, W.howTo)}<div class="wanted-grid">${posters}</div></section>`;
}

function cardsPage(k) {
  const C = k.def.props.cards;
  const cards = C.items.map(([e, n, c]) => `<div class="item"><b class="em">${e}</b><span>${esc(n)}</span><small>${esc(coins(k, c))}</small></div>`).join('');
  return `<section class="page props">${propHead(k, C.title, C.howTo)}<div class="item-grid">${cards}</div></section>`;
}

function patchesPage(k) {
  const P = k.def.props.patches;
  const patches = P.items.map(([e, t]) => `<div class="patch"><b class="em">${e}</b><span>${esc(t)}</span></div>`).join('');
  return `<section class="page props">${propHead(k, P.title, P.howTo)}<div class="patch-grid">${patches}</div></section>`;
}

function wearablePage(k) {
  const W = k.def.props.wearable;
  const hole = (x, y) => `<circle class="hole" cx="${x}" cy="${y}" r="9"/>`;
  let body = '';
  if (W.type === 'mask') {
    const fills = ['var(--teal)', 'var(--orange)', 'var(--teal-d)'];
    body = fills.map((f) => `<svg class="mask" viewBox="0 0 600 190"><path fill="${f}" d="M10,70 C30,15 150,5 300,35 C450,5 570,15 590,70 C585,140 520,180 420,160 C360,150 330,128 300,128 C270,128 240,150 180,160 C80,180 15,140 10,70 Z"/>
      <ellipse class="eye" cx="170" cy="88" rx="68" ry="38"/><ellipse class="eye" cx="430" cy="88" rx="68" ry="38"/>${hole(32, 70)}${hole(568, 70)}
      <text x="300" y="78" text-anchor="middle" class="emoji-svg">⚡</text></svg>`).join('');
  } else if (W.type === 'eyepatch') {
    body = `<div class="patch-row">${Array.from({ length: 6 }, () => `<svg class="eyepatch" viewBox="0 0 300 230"><path d="M28,48 Q150,12 272,48 Q292,150 150,215 Q8,150 28,48 Z"/>${hole(44, 52)}${hole(256, 52)}<text x="150" y="140" text-anchor="middle" class="emoji-svg">💀</text></svg>`).join('')}</div>`;
  } else if (W.type === 'crown') {
    const piece = (first) => `<svg class="crown" viewBox="0 0 760 300">
      <path d="M${first ? 0 : 40},290 L${first ? 0 : 40},170 L70,40 L180,170 L290,40 L400,170 L510,40 L620,170 L730,40 L760,170 L760,290 Z" class="crown-gold"/>
      ${first ? '' : '<rect x="0" y="170" width="40" height="120" class="tab"/><text x="20" y="235" text-anchor="middle" class="tab-t" transform="rotate(-90 20 235)">TAPE</text>'}
      <rect x="${first ? 0 : 40}" y="200" width="${first ? 760 : 720}" height="70" class="crown-band"/>
      ${[70, 290, 510, 730].map((x) => `<text x="${x}" y="105" text-anchor="middle" class="emoji-svg small">💎</text>`).join('')}
      <text x="400" y="248" text-anchor="middle" class="crown-name">${first ? esc(k.lead) : '★ ★ ★'}</text></svg>`;
    body = `${piece(true)}<div class="cut-h"></div>${piece(false)}`;
  }
  return `<section class="page props wear">${propHead(k, W.title, W.howTo)}<div class="cardstock">Best on cardstock</div><div class="wear-body wear-${W.type}">${body}</div></section>`;
}

function propsPages(k) {
  const P = k.def.props || {};
  const order = [['recipe', () => ''], ...SHOP_PROPS.filter(([key]) => key !== 'recipe'), ...rooms.PROPS, ['scans', scansPage], ['map', mapPage], ['wanted', wantedPage], ['cards', cardsPage], ['patches', patchesPage], ['wearable', wearablePage]];
  return order.filter(([key]) => P[key]).map(([, fn]) => fn(k)).join('');
}

// Check-up forms, two to a page: one per subject plus a blank one.
function recordHalf(k, p) {
  const R = k.def.record;
  const half = Math.ceil(R.checks.length / 2);
  const col = (list) => `<table class="check mini"><thead><tr><th></th>${R.cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>
    ${list.map(([e, n]) => `<tr><td><span class="em">${e}</span> ${esc(n)}</td>${R.cols.map(() => '<td><span class="box"></span></td>').join('')}</tr>`).join('')}</tbody></table>`;
  return `<div class="rec">
    <header class="rec-head"><span class="em">${R.icon}</span><h2>${esc(R.title)}</h2><span class="clinic">${esc(k.placeName)}</span></header>
    <div class="rec-top">
      ${p ? `<div class="pet-pic small">${pic(k, p)}</div>` : drawBox('pet-pic small', R.drawLabel)}
      <div class="rec-fields">${R.fields.map((f, i) => `<div class="field"><b>${esc(f)}</b><span class="fill">${p && i === 0 ? esc(p.name) : p && i === 1 ? esc(kindName(k, p)) : ''}</span></div>`).join('')}</div>
    </div>
    <div class="rec-checks">${col(R.checks.slice(0, half))}${col(R.checks.slice(half))}</div>
    <div class="rec-foot"><b>${esc(R.moodLabel)}</b><div class="faces">${R.moods.map((m) => `<span>${m}</span>`).join('')}</div></div>
  </div>`;
}

// The little-kids version: no writing, just big pictures to circle.
function recordHalfLittle(k, p) {
  const R = k.def.record;
  return `<div class="rec little-rec">
    <header class="rec-head"><span class="em">${R.icon}</span><h2>${esc(R.title)}</h2><span class="clinic">${esc(k.placeName)}</span></header>
    <div class="rec-top">
      ${p ? `<div class="pet-pic small">${pic(k, p)}</div>` : drawBox('pet-pic small', R.drawLabel)}
      <div class="lr-table"><b>${esc(R.fields[2] || 'Table')}</b><div class="lr-nums">${[1, 2, 3, 4, 5].map((n) => `<span>${n}</span>`).join('')}</div><small>Circle one</small></div>
    </div>
    <div class="lr-grid">${R.checks.slice(0, 8).map(([e, n]) => `<div class="lr-tile">${art.pic(e, '.62in')}<span>${esc(n)}</span></div>`).join('')}</div>
    <div class="rec-foot"><b>${esc(R.moodLabel)}</b><div class="faces">${R.moods.map((m) => `<span>${m}</span>`).join('')}</div></div>
  </div>`;
}

// A waiter's guest check, tall and narrow like a real order pad, two to a page: the menu's food
// down the side to fill in how many (little kids circle 1, 2 or 3), the prices, a total and a
// tear-off stub for the guest.
function guestCheck(k, p, n) {
  const R = k.def.record;
  const M = k.def.menu;
  const price = (name) => (M.items.find(([, x]) => x === name) || (k.def.props?.food?.items || []).find(([, x]) => x === name) || [])[2];
  const no = String(4101 + n).padStart(4, '0');
  const rows = R.checks.map(([e, name]) => `<div class="gc-row">${art.pic(e, k.little ? '.5in' : '.38in')}<span class="gc-item">${esc(name)}</span>
    ${k.little ? `<span class="gc-circ">${[1, 2, 3].map((x) => `<i>${x}</i>`).join('')}</span>` : '<span class="gc-qty"></span>'}
    <span class="gc-price">${price(name) ?? ''}</span></div>`).join('');
  return `<div class="gc">
    <div class="gc-head"><b>Guest Check</b><span>${esc(k.placeName)}</span><em>No. ${no}</em></div>
    <div class="gc-boxes"><div><small>Table</small><i></i></div><div><small>Guests</small><i></i></div><div><small>Server</small><i></i></div></div>
    <div class="gc-guest"><small>Guest</small><span>${p ? esc(p.name || kindName(k, p)) : ''}</span></div>
    <div class="gc-cols"><span>Food</span><span>${k.little ? 'How many' : 'Qty'}</span><span>${esc(M.coinWord)}s</span></div>
    <div class="gc-rows">${rows}</div>
    <div class="gc-total"><b>Total</b><span></span>${art.pic(M.coinIcon, '.3in')}</div>
    <div class="gc-stub"><b>Thank you! Grazie!</b><span>Table <i></i></span><em>No. ${no}</em></div>
  </div>`;
}

function recordsPages(k) {
  if (k.def.record.style === 'check') {
    const list = [...subjectsOrDefaults(k), null];
    if (list.length % 2) list.push(null);
    const out = [];
    for (let i = 0; i < list.length; i += 2) out.push(`<section class="page gcs">${guestCheck(k, list[i], i)}<div class="cut-v"></div>${guestCheck(k, list[i + 1], i + 1)}</section>`);
    return out.join('');
  }
  const list = [...subjectsOrDefaults(k), null];
  if (list.length % 2) list.push(null);
  const out = [];
  const half = k.little ? recordHalfLittle : recordHalf;
  for (let i = 0; i < list.length; i += 2) out.push(`<section class="page recs">${half(k, list[i])}<div class="cut-h"></div>${half(k, list[i + 1])}</section>`);
  return out.join('');
}

// ---------- document ----------

const KITS = {
  vet: require('./defs/vet'),
  space: require('./defs/space'),
  dino: require('./defs/dino'),
  hero: require('./defs/hero'),
  pirate: require('./defs/pirate'),
  royal: require('./defs/royal'),
  unicorn: require('./defs/unicorn'),
  mermaid: require('./defs/mermaid'),
  construction: require('./defs/construction'),
  easter: require('./defs/easter'),
  halloween: require('./defs/halloween'),
  christmas: require('./defs/christmas'),
  valentine: require('./defs/valentine'),
  fire: require('./defs/fire'),
  ice: require('./defs/ice'),
  racecar: require('./defs/racecar'),
  pizza: require('./defs/pizza'),
  burger: require('./defs/burger'),
  grocery: require('./defs/grocery'),
  post: require('./defs/post'),
  library: require('./defs/library'),
  police: require('./defs/police'),
  petshop: require('./defs/petshop'),
  dentist: require('./defs/dentist'),
  coffee: require('./defs/coffee'),
  italian: require('./defs/italian'),
  auto: require('./defs/auto'),
  kitchen: require('./defs/kitchen'),
  doctor: require('./defs/doctor'),
  puppet: require('./defs/puppet'),
  agent: require('./defs/agent'),
  dressup: require('./defs/dressup'),
  icecream: require('./defs/icecream'),
  airport: require('./defs/airport'),
};

function buildKitHtml(cfg) {
  const def = KITS[cfg.kit];
  if (!def) throw new Error(`Unknown kit "${cfg.kit}". Use one of: ${Object.keys(KITS).join(', ')}`);
  const k = normalize(def, cfg);
  signSeed = 0;
  art.setKit(def);
  art.setPicScale(k.little ? 1.3 : 1);
  const pages = [
    guidePage(k),
    welcomePage(k),
    def.hunt && !def.bigSign ? '' : extras.bigSignPages(k),
    signsPages(k),
    extras.appliancePages(k),
    extras.wowPage(k),
    bigPages(k, ['hero', 'poster']),
    stationPages(k),
    bigPages(k, ['signs', 'rooms']),
    counterPages(k),
    labelsPage(k),
    extras.jarPages(k),
    bigPages(k, ['labels', 'strips']),
    gadgetPages(k),
    bigPages(k, ['screen']),
    badgesPage(k),
    extras.chefHatPage(k),
    bigPages(k, ['wear', 'cards']),
    disguisePages(k),
    propsPages(k),
    extras.peelPages(k),
    extras.morningPages(k),
    recordsPages(k),
    bigPages(k, ['forms']),
    rooms.folderPages(k),
    ticketPage(k),
    passportsPages(k),
    bookCardPages(k),
    def.menu.fold ? extras.foldMenuPages(k) : menuBoard(k),
    k.def.props?.recipe ? SHOP_PROPS.find(([key]) => key === 'recipe')[1](k) : '',
    specialsPage(k),
    moneyPage(k),
    extras.atmPage(k),
    certificatePage(k),
    certificatePage(k, true),
  ].join('');
  art.setPicScale(1);
  return `<!doctype html><html><head><meta charset="utf-8"><style>${k.little ? thicker(css(def.colors)) : css(def.colors)}</style></head><body class="${k.little ? 'little' : 'big'}">${pages}${fitScript}</body></html>`;
}

// The Activity Pack: Wipe & Play pages made from a kit's own pictures, sold on its own
// or next to the pretend play kit. Same config as buildKitHtml.
function activityPackHtml(cfg) {
  const def = KITS[cfg.kit];
  if (!def) throw new Error(`Unknown kit "${cfg.kit}". Use one of: ${Object.keys(KITS).join(', ')}`);
  const k = normalize(def, cfg);
  art.setKit(def);
  art.setPicScale(k.little ? 1.3 : 1);
  const list = activityTitles(k);
  const cover = `<section class="page guide act-cover">
    <div class="guide-head"><div class="guide-icon">${def.icon}</div><div><div class="clinic">${esc(def.name)} · Wipe &amp; Play${k.little ? ' · little kids version, ages 3 to 5' : ''}</div><h1>${esc(possessive(k.childName))} Activity Pack</h1></div></div>
    <p class="lead">${activityCount(k)} activity pages, made from the same pictures as ${esc(k.placeName)}. Use the Wipe &amp; Play pages again and again: slip each one into a sheet protector (or laminate it) and use a dry-erase marker, then wipe clean with a tissue.${k.little ? ' The two Print &amp; Play pages are for paper, with dot markers (or stickers), scissors and glue.' : ''}</p>
    <div class="act-list">${list.map((x, i) => `<div><span>${i + 1}</span>${esc(x)}<i class="box"></i></div>`).join('')}</div>
    <div class="act-pics">${def.menu.items.slice(0, 5).map(([e]) => art.pic(e, '.85in')).join('')}</div>
    <p class="act-tip"><b>Grown-up tip:</b> keep the pages in a binder with a marker clipped on for car rides, waiting rooms and quiet time.</p>
    <footer class="foot">Printable Party Games &amp; Quests · LittlePrintQuests</footer>
  </section>`;
  const html = cover + activityPages(k);
  art.setPicScale(1);
  return `<!doctype html><html><head><meta charset="utf-8"><style>${k.little ? thicker(css(def.colors)) : css(def.colors)}
.act-list { display:grid; grid-template-columns:1fr 1fr; gap:.1in .3in; margin:.2in 0; }
.act-list div { display:flex; align-items:center; gap:.14in; border:2px solid var(--line); border-radius:14px; padding:.07in .18in; font:600 13pt 'Fredoka'; }
.act-list span { width:.36in; height:.36in; border-radius:50%; background:var(--teal); color:#fff; display:grid; place-items:center; flex:none; }
.act-list .box { margin-left:auto; }
.act-pics { display:flex; justify-content:space-around; margin:.2in 0 .2in; }
.act-tip { background:var(--mint-l); border-radius:14px; padding:.16in .22in; font-size:12pt; }
</style></head><body class="${k.little ? 'little' : 'big'}">${html}${fitScript}</body></html>`;
}

// The little-kids version doubles every cut line and border, so they're easy to see and follow.
function thicker(styles) {
  return styles.replace(/(\d*\.?\d+)px (dashed|solid|dotted)/g, (m, n, kind) => `${Math.min(+n * 2, 8)}px ${kind}`);
}

function css(c) {
  const font = (family, file, weight) => `@font-face{font-family:'${family}';src:url('file://${FONT_DIR}/${file}');font-weight:${weight};}`;
  return `
${font('Fredoka', 'Fredoka.ttf', '300 700')}
${font('Nunito', 'Nunito.ttf', '200 1000')}
@page { size: letter; margin: 0; }
${toyCss}
${shopkitCss}
${signageCss}
${activityCss}
${extras.extrasCss}
${disguiseCss}
${rooms.roomsCss}
${bigCss}
${bookCardCss}
${shopCss(font)}
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
.draw-wrap { display:flex; flex-direction:column; align-items:center; gap:3px; flex:none; }
.draw-cap { font:600 9pt 'Fredoka'; color:#8a93ab; text-align:center; white-space:nowrap; }
.draw-wrap .pp-photo { align-self:stretch; height:1.3in; }
.photo-col { width:1.05in; flex:none; display:flex; flex-direction:column; gap:3px; } .photo-col .photo { flex:1; width:auto; }
.pg-title { font-size:24pt; text-align:center; }
.pg-sub { text-align:center; margin:.05in 0 .2in; font-size:11pt; color:#66708f; }
.foot { position:absolute; bottom:.35in; left:0; right:0; text-align:center; font:500 9pt 'Fredoka'; color:#9aa3b8; }

/* guide */
.guide { background:var(--cream); }
.guide-head { display:flex; gap:.2in; align-items:center; }
.guide-icon { font-size:46pt; background:var(--mint); border-radius:50%; width:1.1in; height:1.1in; display:grid; place-items:center; flex:none; }
.guide h1 { font-size:30pt; }
p.lead { font-size:13.5pt; line-height:1.45; margin:.2in 0; }
.guide-cols { display:grid; grid-template-columns:1fr 1fr; gap:.3in; }
.guide h3 { font-size:18pt; color:var(--teal-d); margin-bottom:.08in; }
.guide ul, .guide ol { margin:0; padding-left:.25in; font-size:12.5pt; line-height:1.42; }
.guide.dense ul, .guide.dense ol { font-size:10.5pt; line-height:1.3; } .guide.dense p.lead { font-size:12pt; margin:.14in 0; } .guide.dense .play { margin-top:.14in; }
.guide.dense .play-grid div { padding:.1in .16in; font-size:11pt; line-height:1.35; }
.guide.denser ul, .guide.denser ol { font-size:10pt; line-height:1.24; } .guide.denser .guide-head h1 { font-size:26pt; } .guide.denser .play-grid { gap:.1in; }
.guide.densest ul, .guide.densest ol { font-size:9.3pt; line-height:1.18; } .guide.densest p.lead { font-size:11pt; margin:.1in 0; } .guide.densest .play-grid div { padding:.07in .14in; font-size:10pt; line-height:1.28; }
.play { margin-top:.22in; }
.with-hunt .lead { margin:.16in 0; font-size:13.5pt; } .with-hunt ul, .with-hunt ol { font-size:11.5pt; line-height:1.36; }
.with-hunt .play { margin-top:.18in; } .with-hunt .play-grid div { padding:.12in .16in; font-size:12pt; }
.play-grid { display:grid; grid-template-columns:1fr 1fr; gap:.15in; }
.play-grid div { background:#fff; border:1.5px solid var(--line); border-radius:12px; padding:.18in .2in; font-size:13pt; line-height:1.45; }
.play-grid b { display:block; font:600 14.5pt 'Fredoka'; margin-bottom:3px; }

/* signs: two landscape signs per page */
.signs { padding:.3in; display:flex; flex-direction:column; }
.sign { flex:1; padding:.12in; }
.cut-h { border-top:2px dashed #b7c0cc; margin:.06in -.3in; }
.sign-in { height:100%; border-radius:22px; background:var(--mint-l); border:5px solid var(--teal); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; position:relative; padding:.2in; }
.sign-icon { font-size:68pt; line-height:1; position:relative; } .sign-title, .sign-sub { position:relative; }
.sign-deco { position:absolute; inset:0; width:100%; height:100%; border-radius:18px; }
.sign.hero .sign-title { font-family:'Pacifico', 'Fredoka'; font-weight:400; }
.sign-title { font:700 54pt/1.05 'Fredoka'; color:var(--teal-d); margin-top:.1in; }
.sign-sub { font:500 16pt 'Fredoka'; margin-top:.1in; color:var(--navy); }
.sign.hero .sign-in { background:var(--teal); border-color:var(--teal-d); }
.sign.wash .sign-title { font-size:44pt; margin:0 0 .2in; }
.wash-steps { display:flex; align-items:center; gap:.06in; } .wash-steps > i { font:700 30pt 'Fredoka'; color:var(--teal); font-style:normal; }
.wash-step { display:flex; flex-direction:column; align-items:center; gap:.05in; width:1.15in; }
.wash-step b { width:.36in; height:.36in; border-radius:50%; background:var(--teal); color:#fff; display:grid; place-items:center; font:700 13pt 'Fredoka'; }
.wash-step span { font:700 17pt 'Fredoka'; color:var(--teal-d); }
.sign.own .sign-in { background:#fff; border-style:dashed; justify-content:space-between; padding:.35in .6in; }
.own-draw { width:2.6in; height:1.5in; border:2px dashed #b7c0cc; border-radius:14px; display:grid; place-items:center; font:600 11pt 'Fredoka'; color:#9aa5b8; }
.own-line { align-self:stretch; border-bottom:3px solid var(--navy); height:.6in; }
.sign.hero .sign-title { color:#fff; font-size:46pt; line-height:1.3; }
.sign.hero .sign-sub { color:var(--mint); margin-top:.12in; }
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
.cert.blank .cert-name { min-width:5in; }
.cert-name { max-width:100%; box-sizing:border-box; font:700 46pt 'Fredoka'; color:var(--orange); border-bottom:3px solid var(--orange); padding:0 .3in .05in; margin:.05in 0 .1in; }
.cert-row { display:flex; align-items:center; gap:.5in; margin-top:.5in; font:600 11pt 'Fredoka'; }
.cert-row > div:not(.seal) { display:flex; flex-direction:column; gap:4px; width:2in; } .cert-row .fill { min-width:2in; }
.seal { font-size:34pt; width:1.1in; height:1.1in; border-radius:50%; background:var(--orange); display:grid; place-items:center; box-shadow:0 0 0 5px #fff, 0 0 0 8px var(--orange); }

/* pretend gadgets */
.gadget { padding:.35in .4in; display:flex; flex-direction:column; align-items:center; }
.gadget > .pg-sub { margin:0 0 .15in; }
.fold { align-items:stretch; }
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
.panel-base { flex-direction:row; flex-wrap:wrap; justify-content:center; align-content:center; gap:.16in .3in; }
.panel-decor { font-family:'Noto Color Emoji'; font-size:52pt; line-height:1; }
.big-keys { display:grid; grid-template-columns:1fr 1fr; gap:.14in; }
.big-keys span { width:1.7in; height:.7in; border-radius:.16in; background:#fff; box-shadow:0 4px 0 #aab3c4; display:flex; align-items:center; gap:.08in; padding:0 .14in; font:600 12pt 'Fredoka'; color:var(--navy); }
.big-keys .em { font-size:20pt; }
.panel-name { width:100%; text-align:center; font:700 12pt 'Fredoka', 'Noto Color Emoji'; color:#c9d8f5; letter-spacing:.05em; }
.bezel.dev-console { background:#1b2440; border-radius:.1in; box-shadow:inset 0 0 0 4px #33406a; }
.panel-base.dev-console { background:linear-gradient(#34406a, #222b4a); border-radius:.1in .1in .5in .5in; }
.dev-console .big-keys span { background:#3b4a7a; color:#fff; box-shadow:0 4px 0 #141b33; }
.dev-console .big-keys span:nth-child(1) { background:#e2483d; } .dev-console .big-keys span:nth-child(2) { background:#f2a640; color:#2b1d06; }
.toggles { width:100%; display:flex; justify-content:center; gap:.22in; }
.toggles span { display:flex; flex-direction:column; align-items:center; gap:3px; font:600 8pt 'Fredoka'; color:#c9d8f5; }
.toggles i { width:.2in; height:.4in; border-radius:.1in; background:#141b33; position:relative; }
.toggles i::after { content:''; position:absolute; left:.03in; top:.04in; width:.14in; height:.14in; border-radius:50%; background:#5cf0a2; }
.toggles span:nth-child(even) i::after { top:auto; bottom:.04in; background:#f2a640; }
.dials { display:flex; flex-direction:column; gap:.12in; }
.dials span { width:.5in; height:.5in; border-radius:50%; background:conic-gradient(#5cf0a2 0 35%, #141b33 0); box-shadow:0 0 0 4px #3b4a7a; }

.round-keys { display:grid; grid-template-columns:repeat(2, 1fr); gap:.12in .2in; }
.round-keys span { display:flex; flex-direction:column; align-items:center; gap:3px; }
.round-keys b { width:.85in; height:.85in; border-radius:50%; display:grid; place-items:center; font-size:24pt; background:#fff; box-shadow:0 5px 0 rgba(0,0,0,.25); }
.round-keys small { font:600 10pt 'Fredoka'; }

.handheld { width:7.7in; padding:.18in; border-radius:.5in .5in .9in .9in; background:var(--teal-d); position:relative; display:flex; flex-direction:column; gap:.16in; box-shadow:inset 0 0 0 .07in var(--teal); }
.handheld .bezel { width:7.34in; height:4.5in; background:#141a2b; border-radius:.2in; padding:.16in; }
.handheld .cam { display:none; }
.hh-top { height:.8in; display:flex; align-items:center; gap:.2in; padding:0 .25in; }
.hh-name { flex:1; text-align:center; font:700 15pt 'Fredoka', 'Noto Color Emoji'; color:#fff; letter-spacing:.06em; }
.led { width:.22in; height:.22in; border-radius:50%; background:#ff5a4f; box-shadow:0 0 0 4px rgba(255,255,255,.25); }
.lens { width:.62in; height:.62in; border-radius:50%; background:#0c2a1a; display:grid; place-items:center; box-shadow:0 0 0 5px var(--gold); }
.lens i { width:.3in; height:.3in; border-radius:50%; background:radial-gradient(circle at 35% 35%, #c9ffe0, #2bd17a 55%, #0c5a32); }
.beam { font:700 10pt 'Fredoka'; letter-spacing:.2em; color:var(--gold); }
.antenna { position:absolute; left:.6in; top:-.55in; width:.16in; height:.75in; background:var(--teal-d); border-radius:.08in .08in 0 0; }
.antenna::before { content:''; position:absolute; left:-.07in; top:-.16in; width:.3in; height:.3in; border-radius:50%; background:var(--orange); }
.handheld.dev-communicator { margin-top:.5in; border-radius:.9in .9in .5in .5in; }
.grille { display:grid; grid-template-columns:repeat(7, .07in); gap:.06in; } .grille i { height:.42in; border-radius:.04in; background:rgba(255,255,255,.3); }
.hh-bottom { display:flex; align-items:center; justify-content:space-around; padding:.1in .2in .3in; }
.handheld .round-keys small { color:#fff; }
.handheld .round-keys b { background:var(--mint-l); box-shadow:0 5px 0 var(--orange); }
.dpad { width:1.5in; height:1.5in; position:relative; }
.dpad i { position:absolute; width:.5in; height:.5in; background:var(--mint); border-radius:.08in; }
.dpad i:nth-child(1) { left:.5in; top:0; } .dpad i:nth-child(2) { left:.5in; bottom:0; } .dpad i:nth-child(3) { left:0; top:.5in; } .dpad i:nth-child(4) { right:0; top:.5in; }
.dpad::after { content:''; position:absolute; left:.5in; top:.5in; width:.5in; height:.5in; background:var(--mint); }

.chart { position:relative; padding:.22in 0; }
.chart::before, .chart::after { content:''; position:absolute; left:-.15in; right:-.15in; height:.32in; border-radius:.16in; background:linear-gradient(#a8743c, #6b431c); }
.chart::before { top:0; } .chart::after { bottom:0; }
.chart .bezel { background:#e8d3a2; border-radius:0; padding:.14in .2in; height:4.4in; }
.chart .display { background:#fbf3df; } .chart .cam { display:none; }
.wheel-row { flex:1; width:100%; display:flex; align-items:center; justify-content:space-around; }
.wheel { position:relative; width:4.3in; height:4.3in; }
.wheel svg { width:100%; height:100%; }
.wheel .spokes line { stroke:#7a4d22; stroke-width:12; stroke-linecap:round; } .wheel .spokes circle { fill:#9b6a36; stroke:#5e3a17; stroke-width:3; }
.wheel .rim { fill:none; stroke:#8a5a2b; stroke-width:16; } .wheel .rim-in { fill:none; stroke:#b8901f; stroke-width:3; }
.wheel .hub { fill:#e6c56b; stroke:#8a6a1f; stroke-width:4; }
.wheel .em { position:absolute; left:50%; top:50%; transform:translate(-50%, -50%); font-size:30pt; }
.orders { display:flex; flex-direction:column; align-items:center; gap:.14in; }
.orders-h { font:700 14pt 'Fredoka'; color:#6b431c; }
.orders .round-keys b { background:#f1d48f; box-shadow:0 5px 0 #8a6a1f; }

.mirror { display:flex; flex-direction:column; align-items:center; }
.mirror-crown { font-size:40pt; line-height:1; margin-bottom:-.12in; position:relative; z-index:1; }
.mirror-frame { width:7.7in; padding:1.05in .22in .26in; border-radius:3.85in 3.85in .5in .5in; background:linear-gradient(135deg, #f0d47e, #b8901f 55%, #e6c56b); box-shadow:inset 0 0 0 .08in #fff3c4, inset 0 0 0 .14in #b8901f; position:relative; }
.mirror-arch { position:absolute; left:0; right:0; top:.55in; text-align:center; font:700 13pt 'Fredoka', 'Noto Color Emoji'; color:#5b3f08; }
.mirror .bezel { width:7.26in; height:4.4in; background:#fff6dc; border-radius:.3in; padding:.12in; }
.mirror .display { border-radius:.2in; } .mirror .cam { display:none; }
.mirror-stand { width:5.6in; padding:.2in .3in .25in; background:linear-gradient(#e6c56b, #b8901f); clip-path:polygon(8% 0, 92% 0, 100% 100%, 0 100%); display:flex; justify-content:center; }
.mirror-stand .round-keys { grid-template-columns:repeat(4, 1fr); }
.mirror-stand .round-keys b { width:.7in; height:.7in; font-size:19pt; background:#fdf3d6; box-shadow:0 4px 0 #8a6a1f; }
.mirror-stand .round-keys small { color:#3b2a10; font-size:8.5pt; text-align:center; }
.stand-tab { width:3in; height:.75in; border:2px dashed #b8901f; border-top-style:dotted; display:grid; place-items:center; font:600 9pt 'Fredoka'; color:#8a6a1f; background:#fdf3d6; }
/* flat props */
.props { padding:.4in .45in; display:flex; flex-direction:column; }
.props .pg-sub { margin-bottom:.18in; }
.scan-grid { flex:1; display:grid; grid-template-columns:1fr 1fr; gap:.16in; }
.scan { background:#0f1b2d; background-image:linear-gradient(rgba(120,180,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(120,180,255,.08) 1px, transparent 1px); background-size:.25in .25in; border-radius:.14in; padding:.12in .16in; color:#dbe9ff; display:flex; flex-direction:column; border:2px dashed #b7c0cc; }
.scan-top { display:flex; justify-content:space-between; font:600 10pt 'Fredoka'; letter-spacing:.08em; color:#8fc4ff; }
.scan-top span:last-child { color:#fff; letter-spacing:0; font-size:12pt; }
.scan-body { flex:1; display:flex; align-items:center; gap:.12in; }
.scan-pic { font-size:70pt; line-height:1; filter:brightness(0) invert(1) drop-shadow(0 0 8px #7fc4ff) drop-shadow(0 0 2px #fff); opacity:.88; flex:none; width:1.45in; text-align:center; }
.scan ul { list-style:none; margin:0; padding:0; display:grid; gap:.08in; font:500 10.5pt/1.2 'Fredoka'; }
.scan li { display:flex; align-items:center; gap:.08in; } .scan .box { border-color:#dbe9ff; flex:none; }

.map { flex:1; position:relative; border-radius:.2in; overflow:hidden; border:.08in solid #c9a96a; }
.map svg { position:absolute; inset:0; width:100%; height:100%; }
.map path { fill:none; stroke:#8a5a2b; stroke-width:7; stroke-dasharray:4 18; stroke-linecap:round; }
.map-sea { background:radial-gradient(ellipse at 30% 30%, #f1e2b8 0 16%, transparent 17%), radial-gradient(ellipse at 75% 65%, #f1e2b8 0 14%, transparent 15%), radial-gradient(ellipse at 20% 85%, #f1e2b8 0 12%, transparent 13%), #bfe2ee; }
.map-land { background:radial-gradient(circle at 70% 30%, #d5e8b8 0 18%, transparent 19%), radial-gradient(circle at 25% 70%, #d5e8b8 0 15%, transparent 16%), #efe2c2; }
.map-space { background:radial-gradient(circle, #fff 1px, transparent 1.5px) 0 0 / .45in .45in, radial-gradient(circle, rgba(255,255,255,.6) 1px, transparent 1.5px) .2in .3in / .6in .6in, #1b2440; border-color:#33406a; }
.map-space path { stroke:#ffd166; }
.map-stop { position:absolute; transform:translate(-50%, -50%); display:flex; flex-direction:column; align-items:center; gap:3px; }
.map-stop b { width:.95in; height:.95in; border-radius:50%; background:#fff; display:grid; place-items:center; font-size:38pt; box-shadow:0 0 0 5px var(--teal), 0 4px 10px rgba(0,0,0,.2); }
.map-stop span { font:700 12pt 'Fredoka'; background:#fff; padding:2px 10px; border-radius:99px; color:var(--navy); white-space:nowrap; }
.map-stop.start b { box-shadow:0 0 0 5px var(--orange), 0 4px 10px rgba(0,0,0,.2); }
.map-stop.end b { width:1.2in; height:1.2in; font-size:50pt; box-shadow:0 0 0 6px var(--orange), 0 0 0 11px #fff, 0 4px 14px rgba(0,0,0,.25); }
.map-decor { position:absolute; font-size:30pt; opacity:.75; }
.map-rose { position:absolute; right:.15in; bottom:.15in; font-size:44pt; }

.wanted-grid { flex:1; display:grid; grid-template-columns:1fr 1fr; gap:.18in; }
.wanted { background:#f3e3bd; border:2px dashed #8a6a1f; border-radius:.06in; padding:.15in; display:flex; flex-direction:column; align-items:center; text-align:center; box-shadow:inset 0 0 0 .07in #e6cf98; }
.wanted-word { font:700 34pt/1 'Fredoka'; letter-spacing:.06em; color:#5e3a17; }
.wanted-pic { width:1.75in; height:1.6in; border:4px solid #5e3a17; background:#fbf3df; display:grid; place-items:center; font-size:72pt; margin:.08in 0; }
.wanted-name { font:700 15pt 'Fredoka'; color:#3b2a10; }
.wanted p { margin:.04in 0 .08in; font-size:10.5pt; color:#5e3a17; }
.wanted-reward { margin-top:auto; font:700 12pt 'Fredoka'; background:#5e3a17; color:#f3e3bd; padding:.04in .16in; border-radius:99px; }

.item-grid { flex:1; display:grid; grid-template-columns:repeat(3, 1fr); grid-template-rows:repeat(4, 1fr); gap:.12in; }
.item { border:2px dashed #b7c0cc; border-radius:.16in; background:var(--mint-l); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.04in; text-align:center; padding:.06in; }
.item b { font-size:50pt; line-height:1.1; } .item span { font:700 13pt/1.1 'Fredoka'; } .item small { font:600 9.5pt 'Fredoka'; color:var(--teal-d); background:#fff; border-radius:99px; padding:1px 9px; }

.patch-grid { flex:1; display:grid; grid-template-columns:repeat(3, 1fr); gap:.2in; align-content:center; justify-items:center; }
.patch { width:2.2in; height:2.2in; border-radius:50%; background:var(--teal); box-shadow:0 0 0 .08in #fff, 0 0 0 .14in var(--orange); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; color:#fff; padding:.2in; outline:2px dashed #b7c0cc; outline-offset:.2in; }
.patch b { font-size:50pt; line-height:1.1; } .patch span { font:700 12.5pt/1.1 'Fredoka'; }
.patch:nth-child(even) { background:var(--teal-d); }

.cardstock { align-self:center; font:700 10pt 'Fredoka'; letter-spacing:.08em; text-transform:uppercase; background:var(--orange); color:var(--accent-ink); padding:.04in .16in; border-radius:99px; margin-bottom:.15in; }
.wear-body { flex:1; display:flex; flex-direction:column; justify-content:space-evenly; align-items:center; }
.emoji-svg { font-family:'Noto Color Emoji'; font-size:46px; } .emoji-svg.small { font-size:52px; }
.mask { width:6.6in; } .mask path { stroke:#2b1d06; stroke-width:3; } .mask .eye { fill:#fff; stroke:#2b1d06; stroke-width:3; stroke-dasharray:8 6; }
.hole { fill:#fff; stroke:#2b1d06; stroke-width:3; }
.patch-row { display:grid; grid-template-columns:1fr 1fr; gap:.2in .4in; }
.eyepatch { width:3.2in; } .eyepatch path { fill:#1f2433; stroke:#000; stroke-width:3; } .eyepatch text { font-size:64px; }
.crown { width:7.6in; } .crown-gold { fill:#f0c94a; stroke:#8a6a1f; stroke-width:4; } .crown-band { fill:#e2b33c; }
.tab { fill:#fff; stroke:#8a6a1f; stroke-width:3; stroke-dasharray:8 6; } .tab-t { font:700 16px 'Fredoka'; fill:#8a6a1f; }
.crown-name { font:700 44px 'Fredoka'; fill:#5b3f08; }
.wear .cut-h { align-self:stretch; }

/* check-up forms, two per page */
.recs { padding:.35in .45in; display:flex; flex-direction:column; }
.gcs { padding:.35in .4in; display:flex; gap:.25in; }
.cut-v { border-left:2px dashed #b7c0cc; }
.gc { flex:1; display:flex; flex-direction:column; background:#fbfdf6; border:2px solid #7f9a7a; border-radius:6px; padding:.14in .16in; font-family:'Fredoka'; }
.gc-head { text-align:center; border-bottom:2px solid #7f9a7a; padding-bottom:.08in; position:relative; }
.gc-head b { display:block; font:700 21pt 'Fredoka'; color:#3f5f3b; letter-spacing:.06em; text-transform:uppercase; }
.gc-head span { font:600 10pt 'Fredoka'; color:#66708f; } .gc-head em, .gc-stub em { font:700 10pt 'Courier New', monospace; color:#c0392b; font-style:normal; }
.gc-head em { position:absolute; top:-.02in; right:0; }
.gc-boxes { display:grid; grid-template-columns:1fr 1fr 1.4fr; border-bottom:1.5px solid #7f9a7a; }
.gc-boxes div { padding:.05in .06in .1in; border-right:1.5px solid #7f9a7a; } .gc-boxes div:last-child { border-right:0; }
.gc-boxes small, .gc-guest small, .gc-cols { font:700 8pt 'Fredoka'; text-transform:uppercase; letter-spacing:.06em; color:#3f5f3b; }
.gc-boxes i { display:block; height:.3in; }
.gc-guest { display:flex; align-items:flex-end; gap:.08in; padding:.08in 0; border-bottom:1.5px solid #7f9a7a; } .gc-guest span { flex:1; font:600 13pt 'Fredoka'; border-bottom:1px dotted #9aa5b8; min-height:.26in; }
.gc-cols { display:grid; grid-template-columns:1fr .9in .55in; padding:.05in 0; border-bottom:1.5px solid #7f9a7a; } .gc-cols span:not(:first-child) { text-align:center; }
.gc-rows { flex:1; display:flex; flex-direction:column; }
.gc-row { flex:1; display:grid; grid-template-columns:auto 1fr .9in .55in; align-items:center; gap:.06in; border-bottom:1px solid #b9cbb5; }
.gc-item { font:600 12pt 'Fredoka'; } .gc-qty { height:.3in; border-left:1px solid #b9cbb5; border-right:1px solid #b9cbb5; align-self:stretch; }
.gc-price { text-align:center; font:700 12pt 'Fredoka'; color:#3f5f3b; }
.gc-circ { display:flex; justify-content:center; gap:.04in; } .gc-circ i { width:.26in; height:.26in; border:2px solid #7f9a7a; border-radius:50%; display:grid; place-items:center; font:700 10pt 'Fredoka'; font-style:normal; }
.gc-total { display:flex; align-items:center; gap:.08in; padding:.1in 0; border-bottom:2px solid #7f9a7a; } .gc-total b { font:700 14pt 'Fredoka'; color:#3f5f3b; } .gc-total span { flex:1; height:.32in; border:1.5px solid #7f9a7a; border-radius:4px; background:#fff; }
.gc-stub { margin-top:.12in; padding-top:.1in; border-top:2px dashed #9aa5b8; display:flex; align-items:center; justify-content:space-between; gap:.08in; font:600 10pt 'Fredoka'; }
.gc-stub b { font:700 11pt 'Fredoka'; color:var(--teal-d); } .gc-stub span { display:flex; align-items:flex-end; gap:4px; } .gc-stub span i { width:.4in; border-bottom:1px solid var(--navy); height:1px; }
.rec { flex:1; display:flex; flex-direction:column; gap:.1in; }
.rec-head { display:flex; align-items:center; gap:.1in; border-bottom:3px solid var(--teal); padding-bottom:.06in; }
.rec-head .em { font-size:22pt; } .rec-head h2 { font-size:20pt; flex:1; }
.rec-top { display:flex; gap:.2in; align-items:center; }
.pet-pic.small { width:1.15in; height:1.15in; font-size:46pt; } .pet-pic.small .draw { font-size:8.5pt; }
.rec-fields { flex:1; display:grid; grid-template-columns:1fr 1fr; gap:0 .2in; } .rec-fields .field { margin:.05in 0; font-size:10.5pt; }
.rec-checks { display:grid; grid-template-columns:1fr 1fr; gap:.2in; }
.check.mini { margin-top:0; font-size:10.5pt; } .check.mini th { font-size:9pt; padding:.04in .06in; text-align:center; } .check.mini td { height:.34in; } .check.mini td:not(:first-child) { width:.85in; }
.check.mini .em { font-size:12pt; }
.rec-foot { display:flex; align-items:center; gap:.2in; font-size:11pt; } .rec-foot .faces { flex:1; margin:0; font-size:22pt; }
.recs .cut-h { margin:.12in -.45in; }
.lr-table { flex:1; display:flex; flex-direction:column; align-items:center; gap:.05in; font-size:13pt; } .lr-table small { color:#8a93ab; font:600 9pt 'Fredoka'; }
.lr-nums { display:flex; gap:.14in; } .lr-nums span { width:.55in; height:.55in; border:3px solid var(--teal); border-radius:50%; display:grid; place-items:center; font:700 19pt 'Fredoka'; color:var(--teal-d); }
.lr-grid { flex:1; display:grid; grid-template-columns:repeat(4, 1fr); gap:.1in; }
.lr-tile { border:3px solid var(--mint); border-radius:.16in; background:var(--mint-l); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; text-align:center; font:700 10.5pt/1.1 'Fredoka'; padding:.04in; }
.lx-grid { display:grid; grid-template-columns:repeat(4, 1fr); gap:.08in; margin:.06in 0; } .lx-grid .lr-tile { font-size:8.5pt; }
.lx-coins { display:flex; align-items:center; gap:.06in; margin-top:auto; font-size:11pt; }
.after-hunt { background:var(--mint-l); border-left:5px solid var(--orange); border-radius:.08in; padding:.12in .16in; margin:.15in 0 0; font-size:11pt; }
.after-hunt b { display:block; font:700 12pt 'Fredoka'; color:var(--teal-d); margin-bottom:2px; }
.extra { justify-content:space-evenly; align-items:center; }
.extra .pg-sub { margin:0; } .extra .cut-h { width:calc(100% + .8in); }
.swap .bezel { background:transparent; padding:0; border:1.5px dashed #b7c0cc; height:4.3in; box-shadow:none; } .swap .cam { display:none; }
`;
}

// The kit that goes with a hunt theme (dino -> Dino Dig Lab, ...).
const kitForHunt = (theme) => Object.values(KITS).find((k) => k.hunt === theme) || null;

module.exports = { buildKitHtml, activityPackHtml, KITS, kitForHunt };
