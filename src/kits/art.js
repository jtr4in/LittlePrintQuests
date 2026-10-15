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
  const svg = emojiSvg(e);
  if (!svg) return `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" dominant-baseline="central" class="toy-em" ${extra}>${e}</text>`;
  const { viewBox, body } = inner(svg);
  return `<g ${extra}><svg x="${(x - size / 2).toFixed(1)}" y="${(y - size / 2).toFixed(1)}" width="${size}" height="${size}" viewBox="${viewBox}">${body}</svg></g>`;
}

// An emoji as an inline HTML element, `size` in any CSS unit.
function pic(e, size, cls = '') {
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
