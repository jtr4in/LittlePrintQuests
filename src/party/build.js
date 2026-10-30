// Party Pack: matching birthday printables for any theme in src/generator/themes.js.
//
// cfg = { theme: 'dino', childName: 'Maya', age?: 5,
//         party?: { date?, time?, place?, rsvp? } }
// Returns one Letter-size HTML document (pages are `.page`, rendered by
// src/generator/render.js renderHtml). Items are absolutely placed in inches;
// cut and fold lines are one SVG layer per page so shared edges line up.

const fs = require('fs');
const path = require('path');
const THEMES = require('../generator/themes');
const { flavorFor } = require('./flavor');
const { BLANK_NAME } = require('../generator/blank-name');

const FONT_DIR = path.join(__dirname, '..', '..', 'fonts');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const IN = (v) => `${+v.toFixed(4)}in`;
const at = (x, y, w, h) => `left:${IN(x)};top:${IN(y)};width:${IN(w)};height:${IN(h)}`;

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const possessive = (name) => `${name}’s`;

// Every font in fonts/, named from its file: PirataOne-Regular.ttf -> 'Pirata One'.
function fontFaces() {
  let files = [];
  try {
    files = fs.readdirSync(FONT_DIR).filter((f) => /\.(ttf|otf|woff2?)$/i.test(f));
  } catch {
    return '';
  }
  return files
    .map((file) => {
      const [base, style = ''] = file.replace(/\.\w+$/, '').split('-');
      const family = base.replace(/([a-z])([A-Z])/g, '$1 $2');
      const weight = /bold/i.test(style) ? '700' : /regular/i.test(style) ? '400' : '100 900';
      return `@font-face{font-family:'${family}';src:url('file://${FONT_DIR}/${file}');font-weight:${weight};}`;
    })
    .join('\n');
}

// Readable text on a background color.
function lum(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return 1;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const textOn = (bg, ink) => (lum(bg) > 0.4 ? ink : '#fff');

// ---------- cut and fold lines ----------

// shapes: { rect: [x, y, w, h] } | { circle: [cx, cy, r] } | { poly: [[x, y], ...] } | { fold: [x1, y1, x2, y2] }
function guides(shapes) {
  const segs = new Map();
  const out = [];
  const addSeg = (a, b) => {
    const k = [a, b].map((p) => p.map((v) => v.toFixed(3)).join(',')).sort().join(' ');
    if (!segs.has(k)) segs.set(k, `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`);
  };
  for (const s of shapes) {
    if (s.rect) {
      const [x, y, w, h] = s.rect;
      const p = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
      p.forEach((pt, i) => addSeg(pt, p[(i + 1) % 4]));
    } else if (s.poly) {
      s.poly.forEach((pt, i) => addSeg(pt, s.poly[(i + 1) % s.poly.length]));
    } else if (s.circle) {
      const [cx, cy, r] = s.circle;
      out.push(`<circle cx="${cx}" cy="${cy}" r="${r}"/>`);
    } else if (s.fold) {
      const [x1, y1, x2, y2] = s.fold;
      out.push(`<line class="fold" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`);
    }
  }
  return `<svg class="guides" viewBox="0 0 8.5 11" preserveAspectRatio="none">${[...segs.values(), ...out].join('')}</svg>`;
}

const scissors = (x, y) => `<span class="scissors" style="left:${IN(x)};top:${IN(y)}">✂</span>`;

// ---------- pieces ----------

function whenLine(party) {
  return [party.date, party.time].filter(Boolean).join(' · ');
}

function detailRow(label, value) {
  return `<div class="row"><span class="lbl">${label}</span><span class="val fit-h">${value ? esc(value) : ''}</span></div>`;
}

function invitation(ctx, x, y) {
  const { theme, name, age, party, flavor } = ctx;
  const side = age
    ? `<div class="side-k">turning</div><div class="age fit">${age}</div><div class="side-k">years old</div>`
    : `<div class="icon side-icon">${theme.icon}</div><div class="side-k">let’s party!</div>`;
  return `<div class="item invite" style="${at(x, y, 7, 5)}">
    <div class="inset">
      <div class="inv-side">
        ${age ? `<div class="icon side-top">${theme.icon}</div>` : ''}
        ${side}
        <div class="confetti"></div>
      </div>
      <div class="inv-main">
        <div class="inv-head">
        <div class="kicker">You’re invited to</div>
        <div class="big-name fit">${esc(possessive(name))}</div>
        <div class="nth fit">${age ? `${ordinal(age)} Birthday!` : 'Birthday Party!'}</div>
        <div class="tagline"><span>${esc(flavor.tagline)}</span></div>
        </div>
        <div class="divider"><i></i><span class="icon">${theme.icon}</span><i></i></div>
        <div class="details">
          ${detailRow('When', whenLine(party))}
          ${detailRow('Where', party.place)}
          ${detailRow('RSVP', party.rsvp)}
        </div>
      </div>
    </div>
  </div>`;
}

function thankYou(ctx, x, y) {
  const { theme, name } = ctx;
  return `<div class="item thanks" style="${at(x, y, 7, 5)}">
    <div class="inset">
      <div class="ty-head">
        <span class="icon ty-icon">${theme.icon}</span>
        <div class="ty-title fit">Thank You!</div>
        <span class="icon ty-icon">${theme.icon}</span>
      </div>
      <div class="ty-sub fit">for coming to ${esc(possessive(name))} party!</div>
      <div class="ty-body">
        <div class="dear"><span>Dear</span><i></i></div>
        <div class="wl"></div><div class="wl"></div><div class="wl"></div><div class="wl"></div>
      </div>
      <div class="ty-love"><span>Love,</span> <b class="fit">${esc(name)}</b></div>
    </div>
  </div>`;
}

function topper(ctx, kind, cx, cy) {
  const { theme, name, age } = ctx;
  const c = theme.colors;
  const looks = {
    name: { bg: c.primary, html: `<span class="icon t-icon">${theme.icon}</span><span class="t-name fit-h${name.length <= 5 ? ' short' : ''}">${esc(name)}</span><span class="t-small">is turning ${age || ''}</span>` },
    age: { bg: c.accent, html: `<span class="t-age fit">${age}</span><span class="t-small">today!</span>` },
    hb: { bg: c.soft, html: `<span class="t-hb fit" data-group="hb">Happy</span><span class="t-hb fit" data-group="hb">Birthday</span>` },
    icon: { bg: c.paper, html: `<span class="icon t-big-icon">${theme.icon}</span>` },
  };
  if (kind === 'name' && !age) looks.name.html = looks.name.html.replace(/<span class="t-small">.*?<\/span>/, '<span class="t-small">Happy Birthday</span>');
  const l = looks[kind];
  return `<div class="item topper topper-${kind}" style="${at(cx - 1, cy - 1, 2, 2)};--bg:${l.bg};--fg:${textOn(l.bg, c.ink)}">
    <div class="disc"><div class="ring"></div>${l.html}</div>
  </div>`;
}

const TAG_CUT = 0.32;
function favorTag(ctx, x, y, w, h) {
  const { theme, name } = ctx;
  const k = TAG_CUT;
  return `<div class="item tag" style="${at(x, y, w, h)};clip-path:polygon(${IN(k)} 0,100% 0,100% 100%,${IN(k)} 100%,0 ${IN(h - k)},0 ${IN(k)})">
    <svg class="tag-frame" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polygon points="${[[k + 0.04, 0.09], [w - 0.09, 0.09], [w - 0.09, h - 0.09], [k + 0.04, h - 0.09], [0.09, h - k - 0.04], [0.09, k + 0.04]].map((p) => p.join(',')).join(' ')}"/></svg>
    <span class="hole"></span>
    <div class="tag-text">
      <div class="tag-thanks">Thanks for celebrating with me!</div>
      <div class="tag-love"><span>Love,</span> <b class="fit">${esc(name)}</b></div>
    </div>
    <span class="icon tag-icon">${theme.icon}</span>
  </div>`;
}

const FLAG = { w: 3.7, strip: 0.55, h: 7.4 };
function pennant(ctx, flag, x, y, i, total, flip = false) {
  const { theme } = ctx;
  const { w, strip, h } = FLAG;
  const ins = 0.13;
  const tri = `0,${strip} ${w},${strip} ${w / 2},${strip + h}`;
  // Inner outline: the triangle scaled about its incenter, so it sits ins from every edge.
  const r = (w * h) / (w + 2 * Math.hypot(w / 2, h));
  const kk = (r - ins) / r;
  const inner = [[0, strip], [w, strip], [w / 2, strip + h]]
    .map(([px, py]) => `${(w / 2 + (px - w / 2) * kk).toFixed(4)},${(strip + r + (py - strip - r) * kk).toFixed(4)}`)
    .join(' ');
  const face = flag.letter
    ? `<div class="flag-letter fit" data-group="banner" style="color:${flag.fg}">${esc(flag.letter)}</div>`
    : flag.blank ? '<div class="flag-letter"></div>'
    : `<div class="icon flag-icon" style="color:${flag.fg}">${theme.icon}</div>`;
  return `<div class="item flag${flip ? ' flip' : ''}" style="${at(x, y, w, strip + h)}">
    <svg class="flag-bg" viewBox="0 0 ${w} ${strip + h}">
      <rect x="0" y="0" width="${w}" height="${strip}" class="strip"/>
      <polygon points="${tri}" fill="${flag.bg}"/>
      <polygon points="${inner}" fill="none" stroke="${flag.fg}" stroke-opacity=".55" stroke-width=".025" stroke-dasharray=".1 .07"/>
    </svg>
    <div class="strip-text">fold back · string here</div>
    ${face}
    ${flag.letter ? `<div class="icon flag-tip" style="color:${flag.fg}">${theme.icon}</div>` : ''}
    <div class="flag-num">${i + 1} of ${total}</div>
  </div>`;
}

function tentPanel(ctx, label, flip) {
  const { theme } = ctx;
  return `<div class="panel${flip ? ' flip' : ''}">
    <div class="panel-in">
      <span class="icon panel-icon">${theme.icon}</span>
      ${label ? `<div class="food fit-h">${esc(label)}</div>` : '<div class="food-blank"><i></i><i></i></div>'}
    </div>
  </div>`;
}

function tent(ctx, label, x, y, w, h) {
  return `<div class="item tent" style="${at(x, y, w, h)}">${tentPanel(ctx, label, true)}${tentPanel(ctx, label, false)}</div>`;
}

function bottleLabel(ctx, x, y, w, h) {
  const { theme, name, flavor } = ctx;
  const icons = (n) => Array.from({ length: n }, () => `<span class="icon">${theme.icon}</span>`).join('');
  return `<div class="item bottle" style="${at(x, y, w, h)}">
    <div class="b-side">${icons(3)}</div>
    <div class="b-mid">
      <div class="b-name fit">${esc(possessive(name))}</div>
      <div class="b-party fit">${esc(flavor.party)}</div>
    </div>
    <div class="b-side">${icons(3)}</div>
  </div>`;
}

// ---------- pages ----------

// `title` names the page in the Field Kit's page picker.
const page = (cls, inner, title = '') => `<section class="page ${cls}"${title ? ` data-title="${title}"` : ''}>${inner}</section>`;

function guidePage(ctx, contents) {
  const { theme, name, age, flavor } = ctx;
  const rows = contents
    .map((c) => `<tr><td class="pg">p.${c.page}</td><td><b>${c.title}</b><span>${c.how}</span></td><td class="paper">${c.paper}</td></tr>`)
    .join('');
  return page('guide', `
    <header class="g-head">
      <span class="icon g-icon">${theme.icon}</span>
      <div>
        <div class="kicker">Party Pack · Grown-up page</div>
        <h1>${esc(possessive(name))} ${esc(flavor.party)}</h1>
        <div class="g-sub">${age ? `${ordinal(age)} birthday · ` : ''}matching invitations, decorations and table cards</div>
      </div>
    </header>
    <div class="note">
      <b>Before you print:</b> print at <b>100% / Actual Size</b> (turn off “Fit to page”).
      Use <b>white cardstock</b> for the invitations, cupcake toppers and banner; regular paper is fine for the rest.
      Cut along the dashed lines <span class="sc">✂</span> and fold along the dotted lines. Print as many copies of any page as you need.
    </div>
    <table class="contents">
      <thead><tr><th></th><th>What’s inside</th><th>Paper</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="g-foot"><span class="icon">${theme.icon}</span> Have a wonderful party!</div>`);
}

function buildPartyHtml(cfg = {}) {
  const theme = THEMES[cfg.theme];
  if (!theme) throw new Error(`Unknown theme "${cfg.theme}". Known: ${Object.keys(THEMES).join(', ')}`);
  const name = String(cfg.childName || '').trim();
  if (!name) throw new Error('childName is required');
  const age = cfg.age ? Number(cfg.age) : null;
  if (age !== null && !(Number.isInteger(age) && age > 0 && age < 100)) throw new Error(`Bad age "${cfg.age}"`);
  const party = cfg.party || {};
  const flavor = flavorFor(theme);
  const ctx = { theme, name, age, party, flavor };
  const c = { paper: '#ffffff', ink: '#222222', primary: '#444444', accent: '#888888', soft: '#eeeeee', ...theme.colors };
  ctx.theme = { ...theme, colors: c };

  const pages = [];
  const contents = [];
  const add = (title, how, paper, html) => {
    contents.push({ page: pages.length + 2, title, how, paper });
    pages.push(...[].concat(html));
  };

  // 1. Invitations, 7x5 landscape (5x7), two per page.
  const two = [0.5, 5.5];
  add('Invitations', '5×7 in, 2 per page. Fill in any blank lines by hand.', 'Cardstock',
    page('sheet', two.map((y) => invitation(ctx, 0.75, y)).join('') + guides(two.map((y) => ({ rect: [0.75, y, 7, 5] }))) + scissors(1.1, 0.5), 'Invitations'));

  // 2. Thank-you cards, 5x7, two per page.
  add('Thank-you cards', '5×7 in, 2 per page. Write a note to each guest.', 'Cardstock or paper',
    page('sheet', two.map((y) => thankYou(ctx, 0.75, y)).join('') + guides(two.map((y) => ({ rect: [0.75, y, 7, 5] }))) + scissors(1.1, 0.5), 'Thank-you cards'));

  // 3. Cupcake toppers, 2 in circles, 12 per page.
  // Each row of three differs from the one above, so the mix looks even.
  const kinds = age ? ['name', 'age', 'hb', 'icon'] : ['name', 'hb', 'icon'];
  const order = Array.from({ length: 12 }, (_, i) => kinds[(i + (age ? 0 : Math.floor(i / 3))) % kinds.length]);
  const tops = [];
  const circles = [];
  for (let r = 0; r < 4; r++) {
    for (let col = 0; col < 3; col++) {
      const cx = 0.8 + 1 + col * 2.45;
      const cy = 0.9 + 1 + r * 2.4;
      tops.push(topper(ctx, order[r * 3 + col], cx, cy));
      circles.push({ circle: [cx, cy, 1] });
    }
  }
  add('Cupcake toppers', '2 in circles. Tape to a toothpick, or glue two back to back.', 'Cardstock',
    page('sheet', tops.join('') + guides(circles), 'Cupcake toppers'));

  // 4. Favor tags, 10 per page.
  const tw = 3.6, th = 1.85, k = TAG_CUT;
  const tags = [];
  const tagCuts = [];
  for (let r = 0; r < 5; r++) {
    for (let col = 0; col < 2; col++) {
      const x = 0.55 + col * (tw + 0.2);
      const y = 0.475 + r * (th + 0.2);
      tags.push(favorTag(ctx, x, y, tw, th));
      tagCuts.push({ poly: [[x + k, y], [x + tw, y], [x + tw, y + th], [x + k, y + th], [x, y + th - k], [x, y + k]] });
    }
  }
  add('Favor tags', '10 per page. Punch the dot and tie to favor bags with ribbon.', 'Cardstock or paper',
    page('sheet', tags.join('') + guides(tagCuts), 'Favor tags'));

  // 5. Banner: HAPPY [icon] BIRTHDAY [icon] NAME, 3 pennants per page.
  const colors = [c.primary, c.accent, c.soft];
  // Letters, digits and a few marks get a flag; spaces, hyphens and the like become icon spacers.
  // A name-free pack (the static Etsy download) ends with blank flags to write the name on instead.
  const blank = name === BLANK_NAME;
  const seq = [...'HAPPY', null, ...'BIRTHDAY', null, ...(blank ? [] : name.toUpperCase())]
    .map((ch) => (ch && /[\p{L}\p{N}'’!&]/u.test(ch) ? ch : null))
    .filter((ch, i, a) => ch || (i > 0 && a[i - 1]));
  let n = 0;
  const flags = seq.map((ch) => {
    if (!ch) return { letter: null, bg: c.ink, fg: '#fff' };
    const bg = colors[n++ % colors.length];
    return { letter: ch, bg, fg: textOn(bg, c.ink) };
  });
  if (blank) for (let i = 0; i < 8; i++) flags.push({ letter: null, blank: true, bg: colors[n++ % colors.length] });
  const bannerPages = [];
  // Three flags nest on each page: the middle one prints upside down between the other two,
  // sharing their slanted edges, so one cut frees both.
  const { w: FW, strip: FS, h: FH } = FLAG;
  const fy = (11 - (2 * FS + FH)) / 2;
  const fx = (8.5 - 2 * FW) / 2;
  for (let i = 0; i < flags.length; i += 3) {
    const trio = flags.slice(i, i + 3);
    const cuts = [];
    const items = trio.map((f, j) => {
      const x = fx + (j * FW) / 2;
      if (j === 1) {
        const y = fy + FS;
        cuts.push({ poly: [[x, y + FH + FS], [x + FW, y + FH + FS], [x + FW, y + FH], [x + FW / 2, y], [x, y + FH]] });
        cuts.push({ fold: [x, y + FH, x + FW, y + FH] });
        return pennant(ctx, f, x, y, i + j, flags.length, true);
      }
      cuts.push({ poly: [[x, fy], [x + FW, fy], [x + FW, fy + FS], [x + FW / 2, fy + FS + FH], [x, fy + FS]] });
      cuts.push({ fold: [x, fy + FS, x + FW, fy + FS] });
      return pennant(ctx, f, x, fy, i + j, flags.length);
    });
    bannerPages.push(page('sheet', items.join('') + guides(cuts), 'Name banner'));
  }
  add('Birthday banner', `${flags.length} flags spelling HAPPY BIRTHDAY ${blank ? 'plus 8 blank ones to write the name on' : esc(name.toUpperCase())}, 3 per page (the middle one prints upside down). Fold the top strip over string and tape.`, 'Cardstock', bannerPages);

  // 6. Food tent cards, 4 per page: 3 themed + 5 blank.
  const foods = [...flavor.foods.slice(0, 3), '', '', '', '', ''];
  const fw = 3.75, fh = 4.75;
  const tentPages = [];
  for (let p = 0; p < foods.length; p += 4) {
    const items = [];
    const cuts = [];
    foods.slice(p, p + 4).forEach((label, i) => {
      const x = 0.35 + (i % 2) * (fw + 0.3);
      const y = 0.6 + Math.floor(i / 2) * (fh + 0.3);
      items.push(tent(ctx, label, x, y, fw, fh));
      cuts.push({ rect: [x, y, fw, fh] }, { fold: [x, y + fh / 2, x + fw, y + fh / 2] });
    });
    tentPages.push(page('sheet', items.join('') + guides(cuts), 'Food tent cards'));
  }
  add('Food tent cards', '8 cards, 3 already named. Write in the rest, fold on the dotted line.', 'Cardstock or paper', tentPages);

  // 7. Water bottle labels, 8.25 x 2 in, 4 per page.
  const ys = [0, 1, 2, 3].map((i) => 0.975 + i * 2.35);
  add('Water bottle labels', '8.25×2 in, 4 per page. Wrap around a bottle and tape the ends.', 'Paper',
    page('sheet', ys.map((y) => bottleLabel(ctx, 0.125, y, 8.25, 2)).join('') + guides(ys.map((y) => ({ rect: [0.125, y, 8.25, 2] }))), 'Water bottle labels'));

  const body = [guidePage(ctx, contents), ...pages].join('\n');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(possessive(name))} ${esc(flavor.party)} Pack</title><style>${css(ctx.theme)}</style></head><body>${body}<script>${FIT_JS}</script></body></html>`;
}

// Shrinks `.fit` (one line, width only) and `.fit-h` (wrapping, width and height) text until it fits its box.
// The height check allows for tall glyphs poking past the line box (decorative fonts).
// Elements sharing data-group get the smallest size in the group.
const FIT_JS = `
(function () {
  function fitAll() {
    var groups = {};
    document.querySelectorAll('.fit, .fit-h').forEach(function (el) {
      el.style.fontSize = '';
      var s = parseFloat(getComputedStyle(el).fontSize), min = s * 0.25, tall = el.classList.contains('fit-h');
      while ((el.scrollWidth > el.clientWidth + 0.5 || (tall && el.scrollHeight > el.clientHeight + s * 0.35)) && s > min) {
        s *= 0.96;
        el.style.fontSize = s + 'px';
      }
      var g = el.getAttribute('data-group');
      if (g) (groups[g] = groups[g] || []).push(s);
    });
    Object.keys(groups).forEach(function (g) {
      var m = Math.min.apply(null, groups[g]);
      document.querySelectorAll('[data-group="' + g + '"]').forEach(function (el) { el.style.fontSize = m + 'px'; });
    });
  }
  fitAll();
  document.fonts.ready.then(fitAll);
})();`;

// ---------- styles ----------

function css(theme) {
  const c = theme.colors;
  const f = theme.fonts || {};
  const display = `'${f.display || 'Fredoka'}', 'Fredoka', sans-serif`;
  const dw = f.displayWeight || 700;
  const dt = f.displayTransform || 'none';
  return `
${fontFaces()}
@page { size: letter; margin: 0; }
:root { --paper:${c.paper}; --ink:${c.ink}; --primary:${c.primary}; --accent:${c.accent}; --soft:${c.soft};
  --on-primary:${textOn(c.primary, c.ink)}; --on-accent:${textOn(c.accent, c.ink)}; --on-soft:${textOn(c.soft, c.ink)}; }
* { box-sizing: border-box; }
html, body { margin:0; padding:0; }
body { font-family:'Fredoka', sans-serif; color:var(--ink); -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.page { width:8.5in; height:11in; position:relative; overflow:hidden; page-break-after:always; break-after:page; background:#fff; }
.page:last-child { page-break-after:auto; break-after:auto; }
.disp, h1, .kicker, .big-name, .nth, .lbl, .ty-title, .ty-love b, .t-name, .t-age, .t-hb, .tag-love b, .flag-letter, .food, .b-name, .b-party {
  font-family:${display}; font-weight:${dw}; text-transform:${dt}; }
.icon { display:inline-block; }
.icon svg { width:100%; height:100%; display:block; }
.item { position:absolute; overflow:hidden; }
.fit { white-space:nowrap; display:block; overflow:hidden; max-width:100%; }
.guides { position:absolute; inset:0; width:8.5in; height:11in; pointer-events:none; z-index:5; }
.guides line, .guides circle { fill:none; stroke:#8d8d8d; stroke-width:.011; stroke-dasharray:.09 .06; }
.guides .fold { stroke:#9a9a9a; stroke-dasharray:.012 .05; stroke-linecap:round; stroke-width:.018; }
.scissors { position:absolute; z-index:6; transform:translate(0,-55%); background:#fff; padding:0 .04in; font:13pt 'DejaVu Sans', sans-serif; color:#777; line-height:1; }

/* grown-up page */
.guide { padding:.7in .8in; }
.g-head { display:flex; gap:.25in; align-items:center; border-bottom:3px solid var(--primary); padding-bottom:.18in; }
.g-icon { width:.85in; height:.85in; flex:none; color:var(--primary); }
.kicker { font-size:10pt; letter-spacing:.06em; color:var(--accent); text-transform:uppercase; }
.guide h1 { font-size:26pt; margin:.03in 0; color:var(--primary); line-height:1.1; }
.g-sub { font-size:12pt; color:#666; }
.note { margin:.25in 0 .2in; background:var(--paper); border:2px solid var(--soft); border-left:6px solid var(--accent); border-radius:6px; padding:.16in .2in; font-size:11.5pt; line-height:1.5; }
.note .sc { font-family:'DejaVu Sans'; }
.contents { width:100%; border-collapse:collapse; font-size:11pt; }
.contents th { text-align:left; background:var(--primary); color:var(--on-primary); padding:.07in .1in; font-weight:600; font-size:10pt; }
.contents td { padding:.09in .1in; border-bottom:1px solid #e2e2e2; vertical-align:top; }
.contents td span { display:block; font-size:9.5pt; color:#777; margin-top:.02in; }
.contents .pg { color:var(--primary); font-weight:700; width:.55in; }
.contents .paper { width:1.5in; font-size:10pt; color:#555; }
.g-foot { position:absolute; left:0; right:0; bottom:.7in; text-align:center; font-size:13pt; color:var(--primary); font-weight:600; display:flex; justify-content:center; align-items:center; gap:.1in; }
.g-foot .icon { width:.3in; height:.3in; color:var(--accent); }

/* shared card inset: a white margin inside the cut line hides small cutting errors */
.inset { position:absolute; inset:.14in; border-radius:.12in; overflow:hidden; }

/* invitation */
.invite { background:#fff; }
.invite .inset { display:flex; background:var(--paper); border:2px solid var(--primary); }
.inv-side { width:2.2in; flex:none; background:var(--primary); color:var(--on-primary); display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; text-align:center; }
.side-top { width:.6in; height:.6in; color:var(--soft); margin-bottom:.06in; }
.side-k { font-size:13pt; font-weight:600; letter-spacing:.12em; text-transform:uppercase; opacity:.92; }
.age { width:1.85in; text-align:center; font-family:${display}; font-weight:${dw}; font-size:118pt; line-height:1; margin:.04in 0 .06in; color:var(--on-primary); text-shadow:.04in .04in 0 var(--accent); }
.side-icon { width:1.3in; height:1.3in; color:var(--soft); margin-bottom:.15in; }
.confetti { position:absolute; inset:0; pointer-events:none; opacity:.35;
  background: radial-gradient(circle, var(--soft) 2.2px, transparent 2.6px) 0 0/.32in .32in, radial-gradient(circle, var(--accent) 1.6px, transparent 2px) .16in .16in/.32in .32in;
  -webkit-mask: linear-gradient(180deg, #000 0, transparent 22%, transparent 78%, #000 100%); }
.inv-main { flex:1; min-width:0; padding:.3in .32in .24in; display:flex; flex-direction:column; align-items:center; justify-content:space-between; text-align:center; }
.inv-head { width:100%; display:flex; flex-direction:column; align-items:center; }
.inv-main .kicker { font-size:13pt; color:var(--accent); }
.big-name { width:100%; font-size:50pt; line-height:1.15; color:var(--primary); margin-top:.02in; }
.nth { width:100%; font-size:28pt; line-height:1.15; color:var(--ink); }
.tagline { margin:.14in 0 0; }
.tagline span { display:inline-block; background:var(--accent); color:var(--on-accent); font-weight:600; font-size:14pt; padding:.05in .22in; border-radius:2in; }
.details { width:100%; display:grid; gap:.04in; }
.divider { width:70%; display:flex; align-items:center; gap:.12in; color:var(--accent); }
.divider i { flex:1; border-top:2px dotted var(--accent); opacity:.7; }
.divider .icon { width:.3in; height:.3in; }
.row { display:flex; align-items:flex-end; gap:.12in; height:.42in; }
.lbl { width:.78in; flex:none; text-align:left; font-size:13pt; color:var(--primary); line-height:1.3; }
.val { flex:1; height:100%; border-bottom:1.5px solid var(--ink); font-size:13pt; line-height:1.15; text-align:left; display:flex; align-items:flex-end; padding-bottom:.03in; overflow:hidden; }

/* thank-you card */
.thanks { background:#fff; }
.thanks .inset { background:var(--paper); border:2px solid var(--accent); display:flex; flex-direction:column; align-items:center; padding:.24in .45in .22in; }
.ty-head { display:flex; align-items:center; gap:.2in; width:100%; justify-content:center; }
.ty-icon { width:.5in; height:.5in; color:var(--accent); flex:none; }
.ty-title { flex:0 1 auto; min-width:0; font-size:52pt; line-height:1.1; color:var(--primary); text-align:center; }
.ty-sub { font-size:17pt; font-weight:500; color:var(--ink); margin-top:.02in; width:100%; text-align:center; }
.ty-body { width:100%; margin-top:.18in; display:grid; gap:.0in; }
.dear { display:flex; align-items:flex-end; gap:.1in; height:.42in; font-size:15pt; }
.dear i { flex:1; border-bottom:1.5px solid var(--ink); height:100%; }
.dear span { padding-bottom:.02in; color:var(--primary); font-weight:600; }
.wl { height:.42in; border-bottom:1.5px solid #b9b9b9; }
.ty-love { align-self:flex-end; margin-top:auto; display:flex; align-items:baseline; gap:.1in; font-size:14pt; max-width:4.5in; }
.ty-love b { font-size:24pt; color:var(--accent); font-weight:${dw}; }

/* cupcake toppers */
.topper { border-radius:50%; background:#fff; }
.disc { position:absolute; inset:.07in; border-radius:50%; background:var(--bg); color:var(--fg); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
.ring { position:absolute; inset:.08in; border-radius:50%; border:2px dashed currentColor; opacity:.45; }
.t-icon { width:.36in; height:.36in; color:var(--fg); opacity:.85; }
.t-name { font-size:26pt; line-height:1.1; width:1.45in; max-height:.82in; overflow:hidden; overflow-wrap:normal; }
.t-small { font-size:9pt; font-weight:600; letter-spacing:.1em; text-transform:uppercase; opacity:.9; }
.t-age { font-size:72pt; line-height:1; width:1.45in; }
.t-age + .t-small { margin-top:.02in; }
.t-hb { font-size:20pt; line-height:1.12; width:1.4in; }
.t-big-icon { width:1.05in; height:1.05in; color:var(--primary); }
.t-icon + .t-name { margin-top:.02in; }
.t-name.short { font-size:36pt; }

/* favor tags */
.tag { background:var(--paper); }
.tag-frame { position:absolute; inset:0; width:100%; height:100%; }
.tag-frame polygon { fill:none; stroke:var(--primary); stroke-width:.02; }
.hole { position:absolute; left:.3in; top:50%; width:.2in; height:.2in; margin-top:-.1in; border-radius:50%; background:#fff; border:2px solid var(--primary); }
.tag-text { position:absolute; left:.66in; right:.74in; top:0; bottom:0; display:flex; flex-direction:column; justify-content:center; text-align:center; }
.tag-thanks { font-size:11pt; font-weight:500; line-height:1.25; color:var(--ink); text-wrap:balance; }
.tag-love { display:flex; justify-content:center; align-items:baseline; gap:.07in; margin-top:.08in; font-size:11pt; color:#666; }
.tag-love b { font-size:21pt; color:var(--primary); line-height:1.15; min-width:0; }
.tag-icon { position:absolute; right:.2in; top:50%; width:.42in; height:.42in; margin-top:-.21in; color:var(--accent); }

/* banner */
.flag { overflow:visible; } .flag.flip { transform:rotate(180deg); } .flag.flip .flag-num { display:none; }
.flag-bg { position:absolute; left:0; top:0; width:${IN(FLAG.w)}; height:${IN(FLAG.strip + FLAG.h)}; }
.flag-bg .strip { fill:#f6f6f6; }
.strip-text { position:absolute; left:0; right:0; top:0; height:${IN(FLAG.strip)}; display:flex; align-items:center; justify-content:center; font-size:9pt; letter-spacing:.14em; text-transform:uppercase; color:#999; }
.flag-letter { position:absolute; left:.45in; right:.45in; top:${IN(FLAG.strip + 0.3)}; text-align:center; font-size:190pt; line-height:1.1; height:2.9in; display:flex; align-items:center; justify-content:center; }
.flag-icon { position:absolute; left:50%; top:${IN(FLAG.strip + 0.9)}; width:1.7in; height:1.7in; margin-left:-.85in; }
.flag-tip { position:absolute; left:50%; top:${IN(FLAG.strip + FLAG.h * 0.62)}; width:.5in; height:.5in; margin-left:-.25in; opacity:.75; }
.flag-num { position:absolute; left:0; right:0; top:${IN(FLAG.strip + FLAG.h + 0.12)}; text-align:center; font-size:8.5pt; color:#aaa; letter-spacing:.08em; }

/* food tent cards */
.tent { background:#fff; display:flex; flex-direction:column; }
.panel { flex:1; position:relative; }
.panel.flip { transform:rotate(180deg); }
.panel-in { position:absolute; inset:.16in .16in .14in; border:2px solid var(--primary); border-radius:.1in; background:var(--paper); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:.1in .2in; }
.panel-icon { width:.42in; height:.42in; color:var(--accent); flex:none; }
.food { font-size:27pt; line-height:1.15; color:var(--primary); text-align:center; width:100%; height:1.1in; margin-top:.08in; display:flex; align-items:center; justify-content:center; overflow:hidden; }
.food-blank { width:88%; margin-top:.12in; }
.food-blank i { display:block; height:.42in; border-bottom:1.5px solid #a9a9a9; }

/* water bottle labels */
.bottle { display:flex; align-items:stretch; background:var(--primary); color:var(--on-primary); }
.b-side { width:2in; flex:none; display:flex; align-items:center; justify-content:space-evenly; padding:0 .15in; }
.b-side .icon { width:.42in; height:.42in; color:var(--soft); opacity:.9; }
.b-side .icon:nth-child(2) { color:var(--accent); width:.5in; height:.5in; }
.b-mid { flex:1; min-width:0; margin:.2in 0; background:var(--paper); border:3px solid var(--accent); border-radius:1in; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:0 .35in; }
.b-name { font-size:34pt; line-height:1.1; color:var(--primary); max-width:100%; }
.b-party { font-size:17pt; line-height:1.2; color:var(--accent); letter-spacing:.06em; max-width:100%; }

${themeTouches(theme)}
`;
}

// Small optional flourishes keyed off theme flags, not ids, so new themes inherit them.
function themeTouches(theme) {
  let out = '';
  if (theme.halftone) out += `.invite .inset, .thanks .inset { background: radial-gradient(circle, rgba(0,0,0,.06) 1.2px, transparent 1.6px) 0 0/9px 9px, var(--paper); }`;
  if (theme.grid) out += `.invite .inset, .thanks .inset, .panel-in { background: linear-gradient(rgba(0,0,0,.045) 1px, transparent 1px) 0 0/14px 14px, linear-gradient(90deg, rgba(0,0,0,.045) 1px, transparent 1px) 0 0/14px 14px, var(--paper); }`;
  return out;
}

module.exports = { buildPartyHtml };
