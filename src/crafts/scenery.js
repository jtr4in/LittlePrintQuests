// Drawing helpers for the handprint books' scenes, in SVG inch units inside the 7.5 x 6.6 in art panel.
const { draw } = require('./holidays');
const { painted } = require('./prints');

const { eye, dotEyes, smile, star, twinkles, snow, leaf, stem, ground, bow } = draw;
const W = 7.5;
const H = 6.6;
const f = (n) => +n.toFixed(3);

// ---------- drawing helpers ----------
const panelBg = (c, rx = 0.3) => `<rect width="${W}" height="${H}" rx="${rx}" fill="${c}"/>`;
const sky = (id, top, bottom) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="${W}" height="${H}" rx="0.3" fill="url(#${id})"/>`;
const cloud = (x, y, s = 1, c = '#fff', o = 1) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}" opacity="${o}"><ellipse cx="0" cy="0" rx="0.62" ry="0.3"/><circle cx="-0.25" cy="-0.15" r="0.3"/><circle cx="0.18" cy="-0.25" r="0.36"/><circle cx="0.48" cy="-0.05" r="0.24"/></g>`;
const heart = (x, y, s = 1, c = '#e23a4f', extra = '') => `<path transform="translate(${x} ${y}) scale(${s})" d="M0,0.32 C-0.5,-0.02 -0.42,-0.42 -0.2,-0.42 C-0.08,-0.42 0,-0.32 0,-0.24 C0,-0.32 0.08,-0.42 0.2,-0.42 C0.42,-0.42 0.5,-0.02 0,0.32 Z" fill="${c}" ${extra}/>`;
const drop = (x, y, s = 1, c = '#6bb7ec') => `<path transform="translate(${x} ${y}) scale(${s})" d="M0,-0.18 C0.08,-0.05 0.12,0.02 0.12,0.07 A0.12,0.12 0 0 1 -0.12,0.07 C-0.12,0.02 -0.08,-0.05 0,-0.18 Z" fill="${c}"/>`;
const flower = (x, y, s = 1, petal = '#f48fb1', mid = '#ffd23f') => `<g transform="translate(${x} ${y}) scale(${s})">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-0.17" rx="0.12" ry="0.17" fill="${petal}" transform="rotate(${a})"/>`).join('')}<circle r="0.1" fill="${mid}"/></g>`;
const stalk = (x, y0, y1, c = '#5aa04a') => `<path d="M${x},${y0} Q${x + 0.08},${(y0 + y1) / 2} ${x},${y1}" fill="none" stroke="${c}" stroke-width="0.05" stroke-linecap="round"/>${leaf(x, (y0 + y1) / 2 + 0.05, -30, c).replace('0.7,0', '0.4,0').replace(/0\.55/g, '0.32').replace(/0\.2,/g, '0.1,')}`;
const grass = (y, c, c2) => `<path d="M0,${y} Q0.9,${y - 0.2} 1.9,${y - 0.05} T3.75,${y - 0.08} T5.6,${y - 0.04} T7.5,${y - 0.12} V${H - 0.3} A0.3,0.3 0 0 1 ${W - 0.3},${H} H0.3 A0.3,0.3 0 0 1 0,${H - 0.3} Z" fill="${c}"/>${c2 ? Array.from({ length: 18 }, (_, i) => { const gx = 0.25 + i * 0.41; return `<path d="M${gx},${y + 0.12} l0.05,-0.18 l0.05,0.18 M${gx + 0.12},${y + 0.14} l0.04,-0.14 l0.04,0.14" fill="none" stroke="${c2}" stroke-width="0.025" stroke-linecap="round"/>`; }).join('') : ''}`;
const sunburst = (x, y, r, c = '#ffd23f', ray = '#ffb703') => `<g>${Array.from({ length: 12 }, (_, i) => `<path d="M${x},${y} L${f(x + (r + 0.32) * Math.cos((i * 30 - 6) * Math.PI / 180))},${f(y + (r + 0.32) * Math.sin((i * 30 - 6) * Math.PI / 180))} L${f(x + (r + 0.32) * Math.cos((i * 30 + 6) * Math.PI / 180))},${f(y + (r + 0.32) * Math.sin((i * 30 + 6) * Math.PI / 180))} Z" fill="${ray}"/>`).join('')}<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/></g>`;
const maple = (x, y, s, rot, c) => `<path transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" d="M0,-0.5 L0.09,-0.24 L0.26,-0.34 L0.22,-0.1 L0.46,-0.14 L0.32,0.04 L0.42,0.14 L0.14,0.12 L0.05,0.3 L0.02,0.5 L-0.02,0.5 L-0.05,0.3 L-0.14,0.12 L-0.42,0.14 L-0.32,0.04 L-0.46,-0.14 L-0.22,-0.1 L-0.26,-0.34 L-0.09,-0.24 Z" fill="${c}"/>`;
const pumpkin = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="-0.2" cy="0" rx="0.3" ry="0.33" fill="#f08a24"/><ellipse cx="0.2" cy="0" rx="0.3" ry="0.33" fill="#f08a24"/><ellipse cx="0" cy="0" rx="0.28" ry="0.35" fill="#f59a3a"/><path d="M-0.03,-0.33 q0.02,-0.18 0.12,-0.22" fill="none" stroke="#5b8a2e" stroke-width="0.06" stroke-linecap="round"/></g>`;
const apple = (x, y, s = 1, c = '#e2373f') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0,-0.16 C-0.12,-0.26 -0.34,-0.22 -0.34,0.02 C-0.34,0.24 -0.16,0.36 0,0.3 C0.16,0.36 0.34,0.24 0.34,0.02 C0.34,-0.22 0.12,-0.26 0,-0.16 Z" fill="${c}"/><path d="M0,-0.16 L0.02,-0.32" stroke="#6b4423" stroke-width="0.04" stroke-linecap="round"/><path d="M0.03,-0.27 C0.12,-0.36 0.24,-0.32 0.26,-0.28 C0.18,-0.2 0.08,-0.22 0.03,-0.27 Z" fill="#5aa04a"/><ellipse cx="-0.16" cy="-0.04" rx="0.05" ry="0.09" fill="#fff" opacity=".45"/></g>`;
const present = (x, y, w, h, c, ribbon) => `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="0.04" fill="${c}"/><rect x="${x + w / 2 - 0.06}" y="${y}" width="0.12" height="${h}" fill="${ribbon}"/><rect x="${x}" y="${y + h * 0.38}" width="${w}" height="0.1" fill="${ribbon}"/><path d="M${x + w / 2},${y} c-0.3,-0.3 -0.42,0 -0.08,0.02 M${x + w / 2},${y} c0.3,-0.3 0.42,0 0.08,0.02" fill="none" stroke="${ribbon}" stroke-width="0.06" stroke-linecap="round"/></g>`;
const bubble = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" fill-opacity=".25" stroke="#fff" stroke-opacity=".8" stroke-width="0.025"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.22}" fill="#fff" opacity=".8"/>`;
const seaweed = (x, y, h, c) => `<path d="M${x},${y} C${x - 0.25},${y - h * 0.25} ${x + 0.25},${y - h * 0.5} ${x},${y - h * 0.72} S${x + 0.12},${y - h} ${x - 0.05},${y - h}" fill="none" stroke="${c}" stroke-width="0.16" stroke-linecap="round"/>`;
const starfish = (x, y, s, c = '#ff8c69') => `<g transform="translate(${x} ${y}) scale(${s})">${star(0, 0, 0.32, c).replace('stroke="#0002"', 'stroke="#0000"')}${[0, 72, 144, 216, 288].map((a) => `<circle cx="0" cy="-0.14" r="0.025" fill="#fff" transform="rotate(${a})"/>`).join('')}</g>`;
const fish = (x, y, s, c, flip = false) => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})"><path d="M0.32,0 L0.55,-0.18 L0.55,0.18 Z" fill="${c}"/><ellipse cx="0" cy="0" rx="0.36" ry="0.22" fill="${c}"/><circle cx="-0.18" cy="-0.04" r="0.05" fill="#222"/><path d="M0,-0.2 Q0.1,0 0,0.2" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="0.03"/></g>`;
const shell = (x, y, s, c = '#f7c6b5') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-0.25,0.1 Q-0.3,-0.25 0,-0.28 Q0.3,-0.25 0.25,0.1 Z" fill="${c}"/><path d="M0,0.1 L0,-0.26 M-0.12,0.1 L-0.15,-0.22 M0.12,0.1 L0.15,-0.22" stroke="#d99883" stroke-width="0.02"/><rect x="-0.08" y="0.08" width="0.16" height="0.06" rx="0.02" fill="${c}"/></g>`;
const moon = (x, y, r, c = '#fff3c4') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.2}" r="${r * 0.14}" fill="#000" opacity=".05"/><circle cx="${x + r * 0.35}" cy="${y + r * 0.25}" r="${r * 0.1}" fill="#000" opacity=".05"/>`;
const sparkle = (x, y, s = 1, c = '#fff') => `<path transform="translate(${x} ${y}) scale(${s})" d="M0,-0.16 Q0.02,-0.02 0.16,0 Q0.02,0.02 0,0.16 Q-0.02,0.02 -0.16,0 Q-0.02,-0.02 0,-0.16 Z" fill="${c}"/>`;
const ribbon = (cx, y, w, c, text, ink = '#fff') => `<g><path d="M${cx - w / 2 - 0.35},${y + 0.1} l0.35,-0.05 v0.42 l-0.35,0.05 l0.14,-0.21 Z M${cx + w / 2 + 0.35},${y + 0.1} l-0.35,-0.05 v0.42 l0.35,0.05 l-0.14,-0.21 Z" fill="${c}" opacity=".75"/><rect x="${cx - w / 2}" y="${y - 0.04}" width="${w}" height="0.46" rx="0.06" fill="${c}"/><text x="${cx}" y="${y + 0.28}" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="0.27" fill="${ink}">${text}</text></g>`;
const hand = (o) => ({ kind: 'hand', ...o });
const finger = (x, y, color, s = 1.25) => ({ kind: 'finger', x, y, s, color });
// Three hands with their palms together and the fingers pointing out, like a firework.
const burst = (x, y, s, color, turn = 0) => [0, 120, 240].map((a) => {
  const r = ((a + turn) * Math.PI) / 180;
  return hand({ x: f(x + 0.85 * s * Math.sin(r)), y: f(y - 0.85 * s * Math.cos(r)), rot: a + turn, s, thumb: false, color });
});


// Where a print's fingertip lands on the page: i = 0 index, 1 middle, 2 ring, 3 pinky, 4 thumb.
// inset pulls the point back from the very tip.
const TIPS = [[-0.7, -0.5, 1.45, -11], [-0.19, -0.62, 1.62, -3], [0.32, -0.56, 1.5, 6], [0.78, -0.32, 1.12, 15], [-0.9, 0.38, 1.2, -52]];
function tipOf(p, i, inset = 0.2) {
  const [bx, by, len, deg] = TIPS[i];
  const a = (deg * Math.PI) / 180;
  const s = p.s || 1;
  let lx = (bx + (len - inset) * Math.sin(a)) * (p.flip ? -1 : 1);
  let ly = by - (len - inset) * Math.cos(a);
  const r = ((p.rot || 0) * Math.PI) / 180;
  return [f(p.x + s * (lx * Math.cos(r) - ly * Math.sin(r))), f(p.y + s * (lx * Math.sin(r) + ly * Math.cos(r)))];
}

// A cover ring of small painted hands in the given colors, around "This book belongs to".
function coverRing(colors, ctx, ring = '#ffd23f', dash = '#f7a8c0', ink = '#e23a4f') {
  const n = colors.length;
  const prints = colors.map((c, i) => {
    const a = ((-165 + i * (360 / n)) * Math.PI) / 180;
    return painted({ kind: 'hand', x: f(3.75 + 2.55 * Math.cos(a)), y: f(3.55 + 2.55 * Math.sin(a)), rot: -75 + i * (163 / (n - 1)), s: 0.36, flip: i % 2 === 1, color: c });
  }).join('');
  return `<svg viewBox="0 0 7.5 6.6">${prints}
    <circle cx="3.75" cy="3.55" r="1.75" fill="#fff" stroke="${ring}" stroke-width="0.06"/>
    <circle cx="3.75" cy="3.55" r="1.6" fill="none" stroke="${dash}" stroke-width="0.03" stroke-dasharray="0.08 0.08"/>
    <text x="3.75" y="3.25" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="0.3" fill="#7a6f8f">This book belongs to</text>
    <text x="3.75" y="3.95" text-anchor="middle" font-family="Pacifico" font-size="${ctx.name.length > 8 ? 0.5 : 0.66}" fill="${ink}">${ctx.nameSvg}</text>
    <text x="3.75" y="4.45" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="0.32" fill="#2b59c3">${ctx.year}</text>
  </svg>`;
}

module.exports = { tipOf, coverRing, W, H, f, eye, dotEyes, smile, star, twinkles, snow, leaf, panelBg, sky, cloud, heart, drop, flower, stalk, grass, sunburst, maple, pumpkin, apple, present, bubble, seaweed, starfish, fish, shell, moon, sparkle, ribbon, hand, finger, burst, painted, stem, ground, bow };
