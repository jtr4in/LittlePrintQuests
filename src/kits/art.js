// Drawing helpers shared by the play kit pages: sharp emoji pictures and party confetti.
//
// Big pictures come from vendored Noto emoji SVGs (src/kits/emoji, see scripts/vendor-emoji.py)
// so they stay crisp at any size; an emoji without a file falls back to the color emoji font.

const fs = require('fs');
const path = require('path');

const EMOJI_DIR = path.join(__dirname, 'emoji');
const cache = {};
let uid = 0;

const codeOf = (e) => [...e].map((c) => c.codePointAt(0).toString(16).toUpperCase()).filter((c) => c !== 'FE0F').join('-');

function emojiSvg(e) {
  const code = codeOf(e);
  if (!(code in cache)) {
    const f = path.join(EMOJI_DIR, `${code}.svg`);
    cache[code] = fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim() : null;
  }
  return cache[code];
}

// The picture's inner markup with its ids made unique, so one page can hold many copies.
function inner(svg) {
  const n = ++uid;
  const [, viewBox, body] = svg.match(/viewBox="([^"]+)"[^>]*>([\s\S]*)<\/svg>$/);
  return { viewBox, body: body.replace(/id="([^"]+)"/g, `id="$1_${n}"`).replace(/url\(#([^)]+)\)/g, `url(#$1_${n})`).replace(/href="#([^"]+)"/g, `href="#$1_${n}"`) };
}

// An emoji centered on (x, y) inside an SVG.
function em(x, y, size, e, extra = '') {
  note(e);
  const png = illustration(e);
  if (png) return `<g ${extra}><image href="${png}" x="${(x - size / 2).toFixed(1)}" y="${(y - size / 2).toFixed(1)}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet"/></g>`;
  const svg = emojiSvg(e);
  if (!svg) return `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" dominant-baseline="central" class="toy-em" ${extra}>${e}</text>`;
  const { viewBox, body } = inner(svg);
  return `<g ${extra}><svg x="${(x - size / 2).toFixed(1)}" y="${(y - size / 2).toFixed(1)}" width="${size}" height="${size}" viewBox="${viewBox}">${body}</svg></g>`;
}

// An emoji as an inline HTML element, `size` in any CSS unit.
function pic(e, size, cls = '') {
  note(e);
  const png = illustration(e);
  if (png) return `<img class="pic ${cls}" src="${png}" style="width:${size};height:${size};object-fit:contain;vertical-align:middle">`;
  const svg = emojiSvg(e);
  if (!svg) return `<span class="em pic ${cls}" style="font-size:${size};line-height:1">${e}</span>`;
  const { viewBox, body } = inner(svg);
  return `<svg class="pic ${cls}" style="width:${size};height:${size}" viewBox="${viewBox}">${body}</svg>`;
}

// Sprinkles and dots scattered over a w x h box, the same every time for the same seed.
function confetti(seed, w, h, n = 40, avoid = null) {
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const fills = ['var(--teal)', 'var(--orange)', 'var(--gold)', 'var(--mint)'];
  const out = [];
  for (let i = 0; out.length < n && i < n * 6; i++) {
    const x = rnd() * w; const y = rnd() * h;
    if (avoid && x > avoid[0] && x < avoid[0] + avoid[2] && y > avoid[1] && y < avoid[1] + avoid[3]) continue;
    const f = fills[Math.floor(rnd() * fills.length)];
    out.push(rnd() < 0.55
      ? `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="22" height="7" rx="3.5" fill="${f}" transform="rotate(${(rnd() * 180).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`
      : `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(4 + rnd() * 4).toFixed(1)}" fill="${f}"/>`);
  }
  return out.join('');
}

// A striped shop awning with a scalloped edge, `w` wide.
function awning(w, stripes = 12) {
  const sw = w / stripes;
  return Array.from({ length: stripes }, (_, i) => {
    const x = i * sw;
    return `<path d="M${x},0 L${x + sw},0 L${x + sw},60 A${sw / 2},${sw / 2.4} 0 0 1 ${x},60 Z" fill="${i % 2 ? '#fff' : 'var(--teal)'}" stroke="var(--teal-d)" stroke-width="2"/>`;
  }).join('');
}

module.exports = { em, pic, confetti, awning, emojiSvg };

// ---------- illustrations ----------
// A kit can swap any emoji for a real illustration: drop a picture (WebP) named after the picture's slug
// into src/kits/art/<kit id>/ (scripts/art-list.js lists every slug with a drawing prompt, and
// scripts/art-import.py cleans up and names uploaded images). Missing files keep the emoji.

const ART_DIR = path.join(__dirname, 'art');
const slug = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').slice(0, 40);
const isEmoji = (v) => typeof v === 'string' && v.length <= 8 && /^\p{Extended_Pictographic}/u.test(v);

// Every picture a kit uses, with a name to describe it: [{ e, name, slug }].
function kitPictures(def) {
  const seen = new Map();
  const add = (e, name) => { if (!seen.has(e) || (!seen.get(e).named && name)) seen.set(e, { e, name: name || '', named: Boolean(name) }); };
  const walk = (v, key) => {
    if (isEmoji(v)) return add(v, '');
    if (Array.isArray(v)) {
      if (isEmoji(v[0]) && typeof v[1] === 'string' && !isEmoji(v[1])) add(v[0], v[1]);
      return v.forEach((x) => walk(x, key));
    }
    if (v && typeof v === 'object') {
      if (isEmoji(v.e) && typeof v.text === 'string') add(v.e, v.text);
      for (const [kk, x] of Object.entries(v)) walk(x, kk);
    }
  };
  walk(def);
  if (seen.has(def.icon)) seen.get(def.icon).name ||= `${def.name} logo`;
  if (seen.has(def.menu.coinIcon)) seen.get(def.menu.coinIcon).name ||= def.menu.coinWord;
  return [...seen.values()].map((p) => ({ e: p.e, name: p.name, slug: slug(p.name || codeOf(p.e)) }));
}

// Pictures drawn while building the current kit, in first-use order (for scripts/art-list.js).
let used = [];
function note(e) { if (current && !used.includes(e)) used.push(e); }

let current = null; // { dir, files: { emoji: path } } for the kit being built
function setKit(def) {
  const dir = path.join(ART_DIR, def.id);
  const files = {};
  if (fs.existsSync(dir)) {
    for (const p of kitPictures(def)) {
      const f = path.join(dir, `${p.slug}.webp`);
      if (fs.existsSync(f)) files[p.e] = f;
    }
  }
  current = { files };
  used = [];
}
const pngCache = {};
function illustration(e) {
  const f = current && current.files[e];
  if (!f) return null;
  return (pngCache[f] ||= `data:image/webp;base64,${fs.readFileSync(f).toString('base64')}`);
}

module.exports.kitPictures = kitPictures;
module.exports.setKit = setKit;
module.exports.slug = slug;
module.exports.usedPictures = () => used.slice();
