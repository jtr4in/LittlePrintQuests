// Origami pages for the activity pack (Jason, 2026-10-26): an easy fold-it model for each theme,
// sized for a 4-year-old. Two Print & Play pages:
//   1. a big square of themed origami paper to cut out (Gemini art: art/<kit>/origami-paper.jpg)
//   2. the fold steps, drawn here by simulating the real folds (so every diagram is right), a
//      "what shape is it?" question under some steps, and add-on pieces to cut out and glue on
//      (Gemini art: art/<kit>/origami-pieces.jpg), so nothing appears at the end unexplained.
// A kit without both pictures skips the pages. Prompts: project-files/activity-packs/origami/.
const fs = require('fs');
const path = require('path');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---- Paper folding -------------------------------------------------------------------------------
// The paper is a stack of flat convex pieces (layers), back to front. `front` is true when the
// pattern side faces the viewer. Units: the square is 100 wide, centered on 0,0, y points down.
const D = 50 * Math.SQRT2;
const START = {
  square: [[-50, -50], [50, -50], [50, 50], [-50, 50]],
  diamond: [[0, -D], [D, 0], [0, D], [-D, 0]],
};
const cross = (a, b, p) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
const area = (poly) => Math.abs(poly.reduce((s, p, i) => { const q = poly[(i + 1) % poly.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
function clip(poly, a, b, sign) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length];
    const sp = cross(a, b, p) * sign, sq = cross(a, b, q) * sign;
    if (sp >= 0) out.push(p);
    if ((sp >= 0) !== (sq >= 0)) { const t = sp / (sp - sq); out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]); }
  }
  return out.length >= 3 && area(out) > 0.5 ? out : null;
}
function reflect(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], len = dx * dx + dy * dy;
  const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len;
  const fx = a[0] + t * dx, fy = a[1] + t * dy;
  return [2 * fx - p[0], 2 * fy - p[1]];
}
const rot = (p, deg) => { const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };

// One fold. `move` is any point on the side that moves. Valley folds bring it to the front, mountain
// folds take it behind. `top: n` / `bottom: n` folds only the front or back n layers there.
function doFold(layers, op) {
  const [ax, ay, bx, by] = op.fold, a = [ax, ay], b = [bx, by];
  const sign = Math.sign(cross(a, b, op.move));
  const parts = layers.map((l) => ({ l, moving: clip(l.poly, a, b, sign), staying: clip(l.poly, a, b, -sign) }));
  let who = parts.map((p, i) => (p.moving ? i : -1)).filter((i) => i >= 0);
  if (op.top) who = who.slice(-op.top);
  if (op.bottom) who = who.slice(0, op.bottom);
  const keep = [], moved = [];
  parts.forEach((p, i) => {
    if (!who.includes(i)) return keep.push(p.l);
    if (p.staying) keep.push({ poly: p.staying, front: p.l.front });
    moved.push({ poly: p.moving.map((q) => reflect(q, a, b)).reverse(), front: !p.l.front });
  });
  moved.reverse();
  if (op.mode === 'mountain') return [...moved, ...keep];
  if (op.under) return [...keep.slice(0, keep.length - op.under), ...moved, ...keep.slice(keep.length - op.under)];
  return [...keep, ...moved];
}
const turnOver = (layers) => layers.map((l) => ({ poly: l.poly.map(([x, y]) => [-x, y]).reverse(), front: !l.front })).reverse();
const turn = (layers, deg) => layers.map((l) => ({ ...l, poly: l.poly.map((p) => rot(p, deg)) }));

// Runs a model's steps and returns one panel per step: the paper before the step, and the step.
function simulate(model) {
  let layers = [{ poly: START[model.start].map((p) => [...p]), front: model.side === 'color' }];
  const panels = [];
  for (const op of model.steps) {
    if (op.rotate) { layers = turn(layers, op.rotate); continue; }
    panels.push({ op, layers });
    if (op.fold) layers = doFold(layers, op);
    else if (op.turn) layers = turnOver(layers);
  }
  return { panels, final: layers };
}

// ---- The shape question --------------------------------------------------------------------------
function hull(pts) {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const half = (list) => { const h = []; for (const q of list) { while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], q) <= 1e-6) h.pop(); h.push(q); } h.pop(); return h; };
  return [...half(p), ...half([...p].reverse())];
}
const inside = (poly, q) => { let s = 0; for (let i = 0; i < poly.length; i++) { const c = Math.sign(cross(poly[i], poly[(i + 1) % poly.length], q)); if (c) { if (s && c !== s) return false; s = c; } } return true; };
// Names the outline when it's a plain triangle, square or rectangle (and fully filled in).
function shapeOf(layers) {
  const h = hull(layers.flatMap((l) => l.poly));
  const xs = h.map((p) => p[0]), ys = h.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  for (let i = 1; i < 12; i++) for (let j = 1; j < 12; j++) {
    const q = [x0 + (x1 - x0) * i / 12, y0 + (y1 - y0) * j / 12];
    if (inside(h, q) && !layers.some((l) => inside(l.poly, q))) return null;
  }
  if (h.length === 3) return 'triangle';
  if (h.length !== 4) return null;
  const axis = h.every((p) => [x0, x1].some((x) => Math.abs(p[0] - x) < 0.5) && [y0, y1].some((y) => Math.abs(p[1] - y) < 0.5));
  if (!axis) return null;
  return Math.abs((x1 - x0) - (y1 - y0)) < 1 ? 'square' : 'rectangle';
}
const SHAPES = {
  triangle: '<path d="M30,6 L56,50 L4,50 Z"/>',
  square: '<rect x="8" y="6" width="44" height="44"/>',
  rectangle: '<rect x="2" y="16" width="56" height="28"/>',
  circle: '<circle cx="30" cy="28" r="23"/>',
};
function shapeRow(shape, seed) {
  const others = Object.keys(SHAPES).filter((s) => s !== shape);
  const two = [others[seed % 3], others[(seed + 1) % 3]];
  const opts = [shape, ...two];
  const order = [opts[seed % 3], opts[(seed + 1) % 3], opts[(seed + 2) % 3]];
  return `<div class="og-q"><span>Circle the shape:</span>${order.map((s) => `<svg viewBox="0 0 60 56">${SHAPES[s]}</svg>`).join('')}</div>`;
}

// ---- Drawing a panel -----------------------------------------------------------------------------
const W = 200, H = 150, PAD = 14;
function frameOf(states, cap = Infinity) {
  const pts = states.flatMap((ls) => ls.flatMap((l) => l.poly));
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const s = Math.min((W - 2 * PAD) / (x1 - x0), (H - 2 * PAD) / (y1 - y0), cap);
  const ox = W / 2 - s * (x0 + x1) / 2, oy = H / 2 - s * (y0 + y1) / 2;
  const f = (p) => [ox + s * p[0], oy + s * p[1]];
  f.s = s;
  return f;
}
const pts = (poly, f) => poly.map((p) => f(p).map((v) => v.toFixed(1)).join(',')).join(' ');
function paper(layers, f, color) {
  return layers.map((l) => `<polygon points="${pts(l.poly, f)}" fill="${l.front ? color : '#fff'}" stroke="#3f4a73" stroke-width="1.8" stroke-linejoin="round"/>`).join('');
}
// The fold line, clipped to a little past the paper.
function foldLine(layers, op, f, mountain) {
  const all = layers.flatMap((l) => l.poly);
  const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs) - 6, Math.max(...xs) + 6, Math.min(...ys) - 6, Math.max(...ys) + 6];
  const [ax, ay, bx, by] = op.fold, dx = bx - ax, dy = by - ay;
  let t0 = -1e9, t1 = 1e9;
  for (const [p, q] of [[-dx, ax - x0], [dx, x1 - ax], [-dy, ay - y0], [dy, y1 - ay]]) {
    if (Math.abs(p) < 1e-9) continue;
    const t = q / p;
    if (p < 0) t0 = Math.max(t0, t); else t1 = Math.min(t1, t);
  }
  const A = f([ax + t0 * dx, ay + t0 * dy]), B = f([ax + t1 * dx, ay + t1 * dy]);
  return `<line x1="${A[0].toFixed(1)}" y1="${A[1].toFixed(1)}" x2="${B[0].toFixed(1)}" y2="${B[1].toFixed(1)}" stroke="#e53935" stroke-width="2.6" stroke-dasharray="${mountain ? '9 4 2 4' : '7 5'}"/>`;
}
function arrow(from, to, f, { back = false, dashed = false } = {}) {
  const A = f(from), B = f(to), mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
  const dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy) || 1;
  const c = [mx - dy / len * len * 0.35, my + dx / len * len * 0.35];
  const head = (P, Q) => { const ux = (P[0] - Q[0]), uy = (P[1] - Q[1]), l = Math.hypot(ux, uy) || 1, x = ux / l, y = uy / l;
    return `<path d="M${P[0].toFixed(1)},${P[1].toFixed(1)} L${(P[0] - 9 * x - 5 * y).toFixed(1)},${(P[1] - 9 * y + 5 * x).toFixed(1)} L${(P[0] - 9 * x + 5 * y).toFixed(1)},${(P[1] - 9 * y - 5 * x).toFixed(1)} Z" fill="#3f4a73"/>`; };
  return `<path d="M${A[0].toFixed(1)},${A[1].toFixed(1)} Q${c[0].toFixed(1)},${c[1].toFixed(1)} ${B[0].toFixed(1)},${B[1].toFixed(1)}" fill="none" stroke="#3f4a73" stroke-width="2.4"${dashed ? ' stroke-dasharray="5 4"' : ''}/>${head(B, c)}${back ? head(A, c) : ''}`;
}
const centroid = (polys) => { const p = polys.flat(); return [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length]; };
const TURN_ICON = '<g transform="translate(176,22)" fill="none" stroke="#3f4a73" stroke-width="2.4"><path d="M-12,-2 A12,10 0 1,1 4,9"/><path d="M4,9 l-1,-8 m1,8 l-8,-1" /></g>';

function panelSvg(layers, op, f, color) {
  let marks = '';
  if (op.fold || op.crease) {
    const line = op.fold || op.crease;
    const [ax, ay, bx, by] = line, a = [ax, ay], b = [bx, by];
    const sign = Math.sign(cross(a, b, op.move));
    const moving = layers.map((l) => clip(l.poly, a, b, sign)).filter(Boolean);
    const sel = op.top ? moving.slice(-op.top) : op.bottom ? moving.slice(0, op.bottom) : moving;
    // The arrow starts at the moving point farthest from the fold line (usually the corner).
    const far = (sel.length ? sel : [layers[0].poly]).flat().reduce((best, q) => (Math.abs(cross(a, b, q)) > Math.abs(cross(a, b, best)) ? q : best));
    const c0 = centroid(sel.length ? sel : [layers[0].poly]);
    const from = op.at || [far[0] * 0.8 + c0[0] * 0.2, far[1] * 0.8 + c0[1] * 0.2];
    marks = foldLine(layers, { fold: line }, f, op.mode === 'mountain') + arrow(from, reflect(from, a, b), f, { back: Boolean(op.crease), dashed: op.mode === 'mountain' });
  }
  if (op.turn) marks = TURN_ICON;
  return `<svg viewBox="0 0 ${W} ${H}">${paper(layers, f, color)}${marks}</svg>`;
}
function finishSvg(layers, f, color, op) {
  if (op.draw) return `<svg viewBox="0 0 ${W} ${H}">${op.draw(color)}</svg>`;
  return `<svg viewBox="0 0 ${W} ${H}">${paper(layers, f, color)}</svg>`;
}

// ---- The models ----------------------------------------------------------------------------------
// Step words are short: a grown-up reads them, the pictures carry the kid.
const triDown = { say: 'Fold the top corner down to the bottom corner.', fold: [-D, 0, D, 0], move: [0, -1] };
const triUp = { say: 'Fold the bottom corner up to the top corner.', fold: [-D, 0, D, 0], move: [0, 1] };
const halfV = { say: 'Fold in half and open it again.', crease: [0, -D, 0, D], move: [-1, 0] };
const halfH = { say: 'Fold in half and open it again.', crease: [-D, 0, D, 0], move: [0, -1] };
// Kite folds: two edges to the middle line.
const edgeToMiddle = (from, to, side) => {
  // fold line: bisector at corner `from` between the edge toward `to` and the middle line
  const [fx, fy] = from, [tx, ty] = to;
  const e = [tx - fx, ty - fy], el = Math.hypot(...e), m = [0, fy < 0 ? 1 : -1];
  const dir = [e[0] / el + m[0], e[1] / el + m[1]];
  return { fold: [fx, fy, fx + dir[0] * 100, fy + dir[1] * 100], move: side };
};
const kiteUp = [
  halfV,
  { say: 'Fold the left edge to the middle line.', ...edgeToMiddle([0, -D], [-D, 0], [-D + 2, 0]) },
  { say: 'Fold the right edge to the middle line.', ...edgeToMiddle([0, -D], [D, 0], [D - 2, 0]) },
];
const kiteDown = [
  halfV,
  { say: 'Fold the left edge to the middle line.', ...edgeToMiddle([0, D], [-D, 0], [-D + 2, 0]) },
  { say: 'Fold the right edge to the middle line.', ...edgeToMiddle([0, D], [D, 0], [D - 2, 0]) },
];
// Animal faces start from the triangle pointing down.
const earsDown = [
  { say: 'Fold the left corner down to make an ear.', fold: [-0.3 * D, 0, -0.75 * D, 0.25 * D], move: [-D + 1, 0.2] },
  { say: 'Fold the right corner down the same way.', fold: [0.3 * D, 0, 0.75 * D, 0.25 * D], move: [D - 1, 0.2] },
];
// Ear folds run from a point on the slanted edge (t of the way down) to a point on the top edge.
const earsUp = (a, t = 1) => [
  { say: 'Fold the left corner up to make an ear.', fold: [-D + t * D, t * D, -a * D, 0], move: [-D + 1, 0.2] },
  { say: 'Fold the right corner up the same way.', fold: [D - t * D, t * D, a * D, 0], move: [D - 1, 0.2] },
];
const chinUp = (y = 0.72) => ({ say: 'Fold the bottom point up a little.', fold: [-D, y * D, D, y * D], move: [0, D] });
const chinBack = (y = 0.74) => ({ say: 'Fold the bottom point behind.', fold: [-D, y * D, D, y * D], move: [0, D], mode: 'mountain' });
const turnIt = { say: 'Turn it over.', turn: true };
const glue = (what) => ({ say: `Cut out the ${what} and glue them on.`, finish: 'glue' });
const drawFace = { say: 'Draw a face!', finish: 'draw' };

// The cup (also a hat, a fries box, a finger puppet and a cupcake case).
// The right corner goes to the left edge with the flap's top edge level; solved once here.
const cupFold = (() => {
  const R = [D, 0], T = [0, -D], L = [-D, 0];
  let best = null;
  for (let t = 0.2; t < 0.8; t += 0.0005) {
    const P = [L[0] + t * (T[0] - L[0]), L[1] + t * (T[1] - L[1])];
    const mid = [(R[0] + P[0]) / 2, (R[1] + P[1]) / 2], n = [P[1] - R[1], -(P[0] - R[0])];
    const a = mid, b = [mid[0] + n[0], mid[1] + n[1]];
    const T2 = reflect(T, a, b), R2 = reflect(R, a, b);
    const slope = Math.abs(T2[1] - R2[1]);
    if (!best || slope < best.slope) best = { slope, a, b, P };
  }
  return best;
})();
const cupSteps = [
  triUp,
  { say: 'Fold the right corner across to touch the left edge.', fold: [...cupFold.a, ...cupFold.b], move: [D - 1, -0.3] },
  { say: 'Fold the left corner across to touch the right edge.', fold: [-cupFold.a[0], cupFold.a[1], -cupFold.b[0], cupFold.b[1]], move: [-D + 1, -0.3] },
  { say: 'Fold the front top flap down.', fold: [-D, cupFold.P[1], D, cupFold.P[1]], move: [0, -D + 1], top: 1 },
  { say: 'Fold the back flap down behind.', fold: [-D, cupFold.P[1], D, cupFold.P[1]], move: [0, -D + 1], bottom: 1, mode: 'mountain' },
];

// Simple drawn finishes for the pinched models.
const fanDraw = (c) => `<g stroke="#3f4a73" stroke-width="1.8" stroke-linejoin="round">${Array.from({ length: 8 }, (_, i) => {
  const a0 = (-150 + i * 15) * Math.PI / 180, a1 = (-150 + (i + 1) * 15) * Math.PI / 180, r = 105, cx = 100, cy = 138;
  return `<polygon points="${cx},${cy} ${(cx + r * Math.cos(a0)).toFixed(1)},${(cy + r * Math.sin(a0)).toFixed(1)} ${(cx + r * Math.cos(a1)).toFixed(1)},${(cy + r * Math.sin(a1)).toFixed(1)}" fill="${i % 2 ? c : '#fff'}"/>`;
}).join('')}</g>`;
const bowDraw = (c) => `<g stroke="#3f4a73" stroke-width="1.8" stroke-linejoin="round">
  ${[0, 1, 2, 3].map((i) => `<polygon points="100,75 ${30 + i * 4},${35 + i * 13} ${30 + i * 4},${48 + i * 13}" fill="${i % 2 ? c : '#fff'}"/><polygon points="100,75 ${170 - i * 4},${35 + i * 13} ${170 - i * 4},${48 + i * 13}" fill="${i % 2 ? c : '#fff'}"/>`).join('')}
  <polygon points="100,75 30,35 30,115" fill="none"/><polygon points="100,75 170,35 170,115" fill="none"/>
  <rect x="90" y="62" width="20" height="26" rx="5" fill="${c}"/></g>`;
const zigDraw = (c) => `<g stroke="#3f4a73" stroke-width="1.8" stroke-linejoin="round">${Array.from({ length: 8 }, (_, i) => {
  const x = 30 + i * 18;
  return `<polygon points="${x},45 ${x + 18},${i % 2 ? 45 : 35} ${x + 18},${i % 2 ? 115 : 105} ${x},115" fill="${i % 2 ? '#fff' : c}" transform="translate(0,${i % 2 ? 0 : 0})"/>`;
}).join('')}</g>`;
const pleats = (n) => {
  const out = [{ say: 'Fold a thin strip over.', fold: [-50, -50 + 100 / n, 50, -50 + 100 / n], move: [0, -50] }];
  out.push(turnIt, { say: 'Fold the strip over again, the same size.', fold: [-50, -50 + 200 / n, 50, -50 + 200 / n], move: [0, -50] });
  out.push({ say: 'Keep turning and folding, back and forth, all the way.', finish: 'zig', draw: zigDraw });
  return out;
};

const MODELS = {
  puppy: { name: 'Puppy', start: 'diamond', side: 'white', steps: [triDown, ...earsDown, chinUp(), glue('collar and nose'), drawFace] },
  dalmatian: { name: 'Dalmatian Puppy', start: 'diamond', side: 'white', steps: [triDown, ...earsDown, chinUp(), glue('spots and collar'), drawFace] },
  beaver: { name: 'Beaver', start: 'diamond', side: 'white', steps: [triDown, ...earsDown, chinUp(), glue('big teeth and tail'), drawFace] },
  cat: { name: 'Black Cat', start: 'diamond', side: 'white', steps: [triDown, ...earsUp(0.55), chinBack(), glue('witch hat and whiskers'), drawFace] },
  fox: { name: 'Arctic Fox', start: 'diamond', side: 'white', steps: [triDown, ...earsUp(0.62), turnIt, glue('earmuffs and scarf'), drawFace] },
  dragon: { name: 'Pet Dragon', start: 'diamond', side: 'white', steps: [triDown, ...earsUp(0.62), turnIt, glue('wings and crown'), drawFace] },
  unicorn: { name: 'Unicorn', start: 'diamond', side: 'white', steps: [triDown, ...earsUp(0.62), turnIt, glue('horn and mane'), drawFace] },
  bear: { name: 'Teddy Bear', start: 'diamond', side: 'white', steps: [triDown, ...earsUp(0.75), chinUp(0.7), glue('bandage and nose'), drawFace] },
  bunny: { name: 'Bunny', start: 'diamond', side: 'white', steps: [triDown, ...earsUp(0.5), turnIt, glue('pink inner ears, bow and egg'), drawFace] },
  volcano: { name: 'Volcano', start: 'diamond', side: 'white', steps: [triUp, { say: 'Fold the top point down.', fold: [-D, -0.55 * D, D, -0.55 * D], move: [0, -D] }, glue('lava and baby dino')] },
  cape: { name: 'Hero Cape', start: 'diamond', side: 'white', steps: [triDown, { say: 'Fold the top edge down to make a collar.', fold: [-D, 0.16 * D, D, 0.16 * D], move: [0, -1] }, glue('hero badge and string')] },
  pizza: { name: 'Pizza Slice', start: 'diamond', side: 'white', steps: [triDown, { say: 'Fold the top edge down to make the crust.', fold: [-D, 0.14 * D, D, 0.14 * D], move: [0, -1] }, glue('toppings')] },
  sailboat: { name: 'Pirate Ship', start: 'diamond', side: 'white', steps: [triUp, { say: 'Fold it in half again.', fold: [0, -D, 0, 0], move: [D - 1, -0.3] }, glue('ship, mast and flag')] },
  rocket: { name: 'Rocket', start: 'diamond', side: 'white', steps: [...kiteUp, { say: 'Fold the bottom point up.', fold: [-D, 0.35 * D, D, 0.35 * D], move: [0, D] }, glue('flames and window')] },
  tree: { name: 'Christmas Tree', start: 'diamond', side: 'white', steps: [...kiteUp, { say: 'Fold the bottom point up.', fold: [-D, 0.35 * D, D, 0.35 * D], move: [0, D] }, glue('star, trunk and ornaments')] },
  cone: { name: 'Traffic Cone', start: 'diamond', side: 'white', steps: [...kiteUp, { say: 'Fold the bottom point up.', fold: [-D, 0.35 * D, D, 0.35 * D], move: [0, D] }, glue('white stripes and base')] },
  plane: { name: 'Airplane', start: 'diamond', side: 'white', steps: [...kiteUp, { say: 'Fold the bottom point up.', fold: [-D, 0.35 * D, D, 0.35 * D], move: [0, D] }, glue('wings and tail')] },
  icecream: { name: 'Ice Cream Cone', start: 'diamond', side: 'white', steps: [...kiteDown, { say: 'Fold the top point down.', fold: [-D, -0.45 * D, D, -0.45 * D], move: [0, -D] }, glue('scoop and cherry')] },
  carrot: { name: 'Carrot', start: 'diamond', side: 'white', steps: [...kiteDown, { say: 'Fold the top point down.', fold: [-D, -0.4 * D, D, -0.4 * D], move: [0, -D] }, glue('green leaves')] },
  tail: { name: 'Mermaid Tail', start: 'diamond', side: 'white', steps: [...kiteDown, { say: 'Fold the top point down.', fold: [-D, -0.4 * D, D, -0.4 * D], move: [0, -D] }, glue('tail fin and shell')] },
  fish: { name: 'Goldfish', start: 'diamond', side: 'white', steps: [...kiteDown, { say: 'Fold the top point down.', fold: [-D, -0.45 * D, D, -0.45 * D], move: [0, -D] }, { rotate: -90 }, { say: 'Lay it on its side. Cut out the tail fin and bubbles and glue them on.', finish: 'glue' }, { say: 'Draw an eye!', finish: 'draw' }] },
  cup: { name: 'Coffee Cup', start: 'diamond', side: 'white', steps: [...cupSteps, glue('handle and steam')] },
  carton: { name: 'Fries Box', start: 'diamond', side: 'white', steps: [...cupSteps, glue('fries')] },
  cupcake: { name: 'Cupcake', start: 'diamond', side: 'white', steps: [...cupSteps, glue('frosting and cherry')] },
  puppet: { name: 'Finger Puppet', start: 'diamond', side: 'white', steps: [...cupSteps, { say: 'Slip it on your finger!', finish: 'glue' }, glue('crown and bow tie'), drawFace] },
  hardhat: { name: 'Hard Hat', start: 'diamond', side: 'white', steps: [...cupSteps, { rotate: 180 }, { say: 'Turn it upside down: it’s a hat!', finish: 'glue' }, glue('lamp and stripe')] },
  envelope: { name: 'Envelope', start: 'diamond', side: 'white', steps: [
    { say: 'Fold the left corner to the middle.', fold: [-D / 2, -D, -D / 2, D], move: [-D, 0] },
    { say: 'Fold the right corner to the middle.', fold: [D / 2, -D, D / 2, D], move: [D, 0] },
    { say: 'Fold the bottom corner up.', fold: [-D, 0.3 * D, D, 0.3 * D], move: [0, D] },
    { say: 'Fold the top corner down.', fold: [-D, -0.28 * D, D, -0.28 * D], move: [0, -D] },
    glue('stamp and heart seal')] },
  badge: { name: 'Police Badge', start: 'square', side: 'white', steps: [
    { say: 'Fold one corner to the middle.', fold: [-50, 0, 0, -50], move: [-50, -50] },
    { say: 'Fold the next corner to the middle.', fold: [0, -50, 50, 0], move: [50, -50] },
    { say: 'Fold the next corner to the middle.', fold: [50, 0, 0, 50], move: [50, 50] },
    { say: 'Fold the last corner to the middle.', fold: [0, 50, -50, 0], move: [-50, 50] },
    glue('star')] },
  note: { name: 'Secret Note', start: 'square', side: 'white', steps: [
    { say: 'Draw a secret picture on the white side. Then fold in half.', fold: [-50, 0, 50, 0], move: [0, -50] },
    { say: 'Fold in half again.', fold: [0, -50, 0, 50], move: [-50, 0] },
    { say: 'Fold in half one more time.', fold: [0, 25, 50, 25], move: [25, 50] },
    glue('magnifying glass and seal')] },
  car: { name: 'Race Car', start: 'square', side: 'white', steps: [
    { say: 'Fold the top edge down to the bottom edge.', fold: [-50, 0, 50, 0], move: [0, -50] },
    { say: 'Fold the top left corner down a little.', fold: [-30, 0, -50, 20], move: [-50, 0] },
    { say: 'Fold the top right corner down a little.', fold: [30, 0, 50, 20], move: [50, 0] },
    glue('wheels and number')] },
  towtruck: { name: 'Car', start: 'square', side: 'white', steps: [
    { say: 'Fold the top edge down to the bottom edge.', fold: [-50, 0, 50, 0], move: [0, -50] },
    { say: 'Fold the top left corner down a little.', fold: [-30, 0, -50, 20], move: [-50, 0] },
    { say: 'Fold the top right corner down a little.', fold: [30, 0, 50, 20], move: [50, 0] },
    glue('wheels and windows')] },
  bookmark: { name: 'Corner Bookmark', start: 'diamond', side: 'white', steps: [
    triUp,
    { say: 'Fold only the front top point down to the bottom edge.', fold: [-D, -D / 2, D, -D / 2], move: [0, -D], top: 1 },
    { say: 'Fold the left corner up to the top point.', fold: [0, 0, -D / 2, -D / 2], move: [-D + 1, -0.3], under: 1 },
    { say: 'Fold the right corner up and tuck it in too.', fold: [0, 0, D / 2, -D / 2], move: [D - 1, -0.3], under: 2 },
    glue('stars')] },
  tulip: { name: 'Tulip', start: 'diamond', side: 'white', steps: [triUp,
    { say: 'Fold the left corner up past the top.', fold: [0.17 * D, 0, -0.675 * D, -0.525 * D], move: [-D + 1, -0.2] },
    { say: 'Fold the right corner up the same way.', fold: [-0.17 * D, 0, 0.675 * D, -0.525 * D], move: [D - 1, -0.2] },
    glue('stem and leaves')] },
  fan: { name: 'Paper Fan', start: 'square', side: 'color', steps: [...pleats(8), { say: 'Pinch one end and open the other.', finish: 'glue', draw: fanDraw }, glue('bow and gems')] },
  bowtie: { name: 'Bow Tie', start: 'square', side: 'color', steps: [...pleats(8), { say: 'Pinch the middle and open both ends.', finish: 'glue', draw: bowDraw }, glue('middle knot')] },
};

// Each theme: its model, the paper's main color (diagrams match the printed paper), and the
// paper and pieces for the Gemini prompts.
const THEMES = {
  dino: ['volcano', '#8a5a3c', 'warm brown rock texture with small dinosaur footprints and tiny fern leaves', 'a red-orange lava splash shaped to sit on a flat volcano top, a small grey smoke cloud, and a small cute baby dinosaur'],
  hero: ['cape', '#d62828', 'bold red with small yellow lightning bolts and blue stars', 'a round yellow hero emblem with a lightning bolt, and a short piece of blue string'],
  pirate: ['sailboat', '#c9a96e', 'old map parchment color with tiny compass roses, dotted trails and small gold coins', 'a brown wooden pirate ship hull seen from the side, a tall wooden mast, and a small black pirate flag with crossed bones (no skull face)'],
  space: ['rocket', '#2a3f8f', 'deep navy with tiny white stars, small orange planets and little moons', 'orange and yellow rocket flames, a round porthole window, and two red rocket fins'],
  royal: ['dragon', '#4f9a5a', 'soft green dragon scales with tiny gold crowns', 'a pair of small purple dragon wings and a little gold crown'],
  unicorn: ['unicorn', '#c9a7e8', 'pale lavender with small pastel rainbows, tiny stars and little gems', 'a gold spiral unicorn horn and a rainbow mane tuft'],
  mermaid: ['tail', '#2bb0a5', 'shimmering teal fish scales with tiny pink pearls', 'a big teal mermaid tail fin and a small pink seashell'],
  construction: ['hardhat', '#f2b705', 'bright safety yellow with small bolts, nuts and tiny wrenches', 'a small round headlamp and a reflective orange safety stripe'],
  vet: ['puppy', '#c98d4e', 'soft golden-brown fur color with light fur texture and a few tiny paw prints', 'a red collar with a gold tag and a round black dog nose'],
  racecar: ['car', '#d7261e', 'bright red with thin white racing stripes and tiny checkered flags', 'two black car wheels and a round white number badge with a big 1'],
  fire: ['dalmatian', '#ffffff', 'white with round black dalmatian spots and a few tiny red fire helmets', 'a few loose black spots, a red collar and a small red fire helmet'],
  agent: ['note', '#4a4f5a', 'dark charcoal grey with tiny magnifying glasses, footprints and fingerprint swirls in light grey', 'a magnifying glass and a round red wax seal'],
  ice: ['fox', '#bfe3f5', 'icy pale blue with small white snowflakes and soft frost sparkles', 'fluffy white earmuffs and a short striped scarf'],
  puppet: ['puppet', '#a3202f', 'deep red velvet curtain color with tiny gold stars', 'a tiny gold crown and a small yellow bow tie'],
  dressup: ['fan', '#ef8fb5', 'pink with small gold sequins, tiny bows and little stars', 'a pink satin bow and three sparkly gems'],
  police: ['badge', '#1f3f8a', 'navy blue with small gold stars and thin light-blue stripes', 'a shiny gold star'],
  doctor: ['bear', '#c79458', 'soft honey-brown fur color with tiny bandages and small hearts', 'a crossed pair of bandages and a round brown bear nose'],
  dentist: ['beaver', '#9a6a3f', 'warm brown fur color with tiny sparkly toothbrushes and small bubbles', 'two big white beaver front teeth (as one piece) and a flat brown beaver tail with a criss-cross pattern'],
  auto: ['towtruck', '#2f7de1', 'bright blue with small wrenches, gears and tiny tires', 'two black car wheels and two light blue car windows'],
  post: ['envelope', '#d9b98c', 'light kraft-paper brown with tiny postage stamps, small hearts and airmail stripes', 'a postage stamp with a flower on it and a round red heart seal'],
  library: ['bookmark', '#f2e3c6', 'soft cream with small books, tiny stars and little reading glasses', 'three small gold stars'],
  airport: ['plane', '#7cc4ef', 'sky blue with small white clouds and tiny dotted flight paths', 'a pair of long white airplane wings (as one piece) and a small white tail fin'],
  pizza: ['pizza', '#f6c945', 'golden cheese yellow with small pepperoni circles, olive rings and basil leaves', 'six pepperoni slices, three mushroom slices and two green basil leaves'],
  burger: ['carton', '#d7261e', 'bright red with small yellow stars', 'a bunch of golden french fries (as one piece, to stick out of a box)'],
  italian: ['bowtie', '#d7261e', 'red and white checkered tablecloth pattern', 'a small round red knot for the middle of a bow tie'],
  coffee: ['cup', '#e9d8bf', 'warm cream with tiny coffee beans, small steam swirls and little hearts', 'a cup handle shaped like a C and three wavy steam swirls'],
  icecream: ['icecream', '#d9a35a', 'golden waffle cone pattern', 'a round pink strawberry ice cream scoop with sprinkles and a red cherry'],
  kitchen: ['cupcake', '#7cc4ef', 'light blue with small white polka dots', 'a swirl of pink cupcake frosting with sprinkles and a red cherry'],
  grocery: ['carrot', '#f08a24', 'bright orange with light line texture like a carrot', 'a bunch of green carrot leaves'],
  petshop: ['fish', '#f28c28', 'bright orange goldfish scales with tiny bubbles', 'an orange goldfish tail fin and three small bubbles'],
  halloween: ['cat', '#2b2b33', 'black with small orange pumpkins, tiny purple bats and little stars', 'a small purple witch hat and white whiskers (as one piece)'],
  christmas: ['tree', '#2f7a43', 'deep green with small white snowflakes, tiny red ornaments and gold stars', 'a gold star, a brown tree trunk and four round ornaments'],
  valentine: ['tulip', '#e0405a', 'bright red with tiny pink and white hearts', 'a long green stem with two leaves'],
  easter: ['bunny', '#f7e27a', 'soft pastel yellow with small pastel eggs and tiny flowers', 'a pink bow and a small decorated easter egg'],
};

// ---- Pages ---------------------------------------------------------------------------------------
const artFile = (k, which) => path.join(__dirname, 'art', k.def.id, `origami-${which}.jpg`);
const hasOrigami = (k) => Boolean(THEMES[k.def.id]) && ['paper', 'pieces'].every((w) => fs.existsSync(artFile(k, w)));
const img = (k, which, cls) => `<img class="${cls}" src="data:image/jpeg;base64,${fs.readFileSync(artFile(k, which)).toString('base64')}" alt="">`;

// The step panels for a model, ready to place on the page.
function stepPanels(id, color) {
  const model = MODELS[id];
  const { panels, final } = simulate(model);
  const folds = panels.filter((p) => !p.op.finish);
  const states = [...folds.map((p) => p.layers), ...folds.filter((p) => p.op.fold).map((p) => doFold(p.layers, p.op)), final];
  const f = frameOf(states);
  let asked = 0, lastDraw = null;
  const seen = new Set();
  return panels.map((p, i) => {
    if (p.op.draw && p.op.finish !== 'zig') lastDraw = p.op.draw;
    else if (p.op.finish && lastDraw && !p.op.draw) p = { ...p, op: { ...p.op, draw: lastDraw } };
    const shape = !p.op.finish && asked < 3 ? shapeOf(p.layers) : null;
    const ask = shape && !seen.has(shape + p.layers.length);
    if (ask) { asked++; seen.add(shape + p.layers.length); }
    // Each panel zooms in on its own paper, but no more than 1.6x the first panel, so the paper
    // still looks like it's getting smaller as it's folded.
    const after = p.op.fold ? doFold(p.layers, p.op) : p.layers;
    const fp = frameOf(p.op.finish ? [final] : [p.layers, after], f.s * 1.6);
    const pic = p.op.finish ? finishSvg(final, fp, color, p.op) : panelSvg(p.layers, p.op, fp, color);
    const icon = p.op.finish === 'draw' ? '<i class="og-icon">✏️</i>' : p.op.finish === 'glue' && /glue/.test(p.op.say) ? '<i class="og-icon">✂️</i>' : '';
    return `<div class="og-step"><b>${i + 1}</b>${icon}${pic}<p>${esc(p.op.say)}</p>${ask ? shapeRow(shape, i + id.length) : ''}</div>`;
  });
}

function origamiPages(k) {
  if (!hasOrigami(k)) return '';
  const [id, color] = THEMES[k.def.id];
  const model = MODELS[id];
  const steps = stepPanels(id, color);
  const startSide = model.side === 'white' ? 'Start with the white side up.' : 'Start with the pattern side up.';
  return `<section class="page wp og og-paper">
      <div class="wp-badge">Print &amp; Play</div>
      <h2 class="pg-title">${esc(possessive(k.childName))} Origami Paper</h2>
      <p class="pg-sub">Grown-ups: cut on the dashed line. ${k.childName} folds it into ${aOrAn(model.name)} ${esc(model.name.toLowerCase())} on the next page!</p>
      <div class="og-square">${img(k, 'paper', 'og-paper-art')}<span class="og-scissors">✂️</span></div>
    </section>
    <section class="page wp og og-how">
      <div class="wp-badge">Print &amp; Play</div>
      <h2 class="pg-title">Fold ${aOrAn(model.name)} ${esc(model.name)}!</h2>
      <p class="pg-sub">${startSide} Follow the red dashed line and the arrow.</p>
      <div class="og-grid n${steps.length}">${steps.join('')}</div>
      <div class="og-pieces"><div class="og-pieces-cap">✂️ Cut out your pieces</div>${img(k, 'pieces', 'og-pieces-art')}</div>
    </section>`;
}
const origamiTitles = (k) => { if (!hasOrigami(k)) return []; const n = MODELS[THEMES[k.def.id][0]].name; return ['Origami paper', `Fold ${aOrAn(n)} ${n.toLowerCase()}`]; };
// "an" before a vowel sound: an arctic fox, but a unicorn.
const aOrAn = (word) => (/^(?!uni|use|eu)[aeiou]/i.test(word) ? 'an' : 'a');
function possessive(name) { return /s$/i.test(name) ? `${name}’` : `${name}’s`; }

const origamiCss = `
.og-square { position:relative; width:7.55in; height:7.55in; margin:.25in auto 0; border:3px dashed #3f4a73; padding:.06in; }
.og-paper-art { width:100%; height:100%; object-fit:cover; display:block; }
.og-scissors { position:absolute; top:-.24in; left:-.26in; font:26pt 'Noto Color Emoji'; background:#fff; line-height:1; }
.og-how { display:flex; flex-direction:column; }
.og-grid { display:grid; grid-template-columns:repeat(3, 1fr); grid-auto-rows:1fr; gap:.12in; flex:1; min-height:0; }
.og-grid.n2, .og-grid.n4 { grid-template-columns:repeat(2, 1fr); }
.og-step { position:relative; border:2px solid var(--line); border-radius:14px; padding:.06in .08in .08in; display:flex; flex-direction:column; align-items:center; }
.og-step > b { position:absolute; top:.05in; left:.07in; width:.32in; height:.32in; border-radius:50%; background:var(--teal); color:#fff; display:grid; place-items:center; font:700 13pt 'Fredoka'; }
.og-step .og-icon { position:absolute; top:.04in; right:.08in; font:16pt 'Noto Color Emoji'; font-style:normal; }
.og-step svg { width:100%; flex:1; min-height:1.2in; }
.og-step p { margin:.02in 0 0; font:600 10.5pt/1.2 'Fredoka'; text-align:center; color:var(--navy); }
.og-q { display:flex; align-items:center; gap:.08in; margin-top:.05in; font:500 9pt 'Fredoka'; color:#66708f; }
.og-q svg { width:.42in; height:.38in; fill:none; stroke:var(--navy); stroke-width:3; }
.og-pieces { margin-top:.12in; border:3px dashed #9aa5b8; border-radius:16px; padding:.06in .1in .1in; display:flex; flex-direction:column; align-items:center; height:2.3in; flex:none; }
.og-pieces-cap { font:600 12pt 'Fredoka'; color:var(--teal-d); }
.og-pieces-art { flex:1; min-height:0; max-width:100%; object-fit:contain; }
`;

module.exports = { origamiPages, origamiTitles, hasOrigami, origamiCss, MODELS, THEMES, simulate, stepPanels, artFile };
