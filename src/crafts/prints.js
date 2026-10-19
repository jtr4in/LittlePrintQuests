// Paint prints for the handprint art packs, drawn in SVG inch units: a child's handprint,
// footprint and fingerprint. Each comes two ways: painted (the finished example) and as a
// faint dashed outline (where to press on the keepsake page).

let uid = 0;

// A small child's hand (about 4 in long), palm centered on (0, 0) with the fingers pointing up
// (-y). Fingers: [base x, base y, length, width, angle in degrees].
const FINGERS = [
  [-0.7, -0.5, 1.45, 0.54, -11], // index
  [-0.19, -0.62, 1.62, 0.56, -3], // middle
  [0.32, -0.56, 1.5, 0.54, 6], // ring
  [0.78, -0.32, 1.12, 0.5, 15], // pinky
];
const THUMB = [-0.9, 0.38, 1.2, 0.6, -52];

function capsule([x, y, len, w, deg]) {
  // A finger: a rounded bar from its base (x, y) out along the angle.
  return `<rect x="${(x - w / 2).toFixed(3)}" y="${(y - len).toFixed(3)}" width="${w}" height="${len + w / 2}" rx="${w / 2}" transform="rotate(${deg} ${x} ${y})"/>`;
}
const PALM = '<path d="M-1.02,-0.55 C-1.1,0.2 -1.0,0.95 -0.55,1.25 C-0.15,1.5 0.45,1.5 0.8,1.2 C1.12,0.9 1.12,0.1 1.0,-0.45 C0.8,-0.85 -0.8,-0.9 -1.02,-0.55 Z"/>';
const handShapes = (thumb = true, fingers = [0, 1, 2, 3], colors = null) => {
  const part = (i, shape) => (colors?.[i] ? `<g fill="${colors[i]}">${shape}</g>` : shape);
  return PALM + fingers.map((i) => part(i, capsule(FINGERS[i]))).join('') + (thumb ? part(4, capsule(THUMB)) : '');
};

// A foot (about 5 in long), heel at the bottom, toes up, centered on (0, 0); a left foot,
// big toe on the right (mirror for the other foot).
const SOLE = '<path d="M0.15,2.45 C-0.55,2.5 -0.8,1.9 -0.78,1.2 C-0.76,0.5 -1.0,-0.3 -0.98,-0.95 C-0.95,-1.65 -0.35,-1.95 0.25,-1.9 C0.9,-1.85 1.05,-1.35 0.95,-0.7 C0.85,-0.1 0.62,0.4 0.65,1.1 C0.68,1.85 0.75,2.4 0.15,2.45 Z"/>';
const TOES = [[0.62, -2.28, 0.34], [0.07, -2.42, 0.25], [-0.36, -2.33, 0.21], [-0.68, -2.12, 0.18], [-0.9, -1.83, 0.15]];
const footShapes = () => SOLE + TOES.map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.12}"/>`).join('');

// Painted look: soft wobbly edges and a little uneven paint, like a real print.
function paintFilter(id, seed) {
  return `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence type="fractalNoise" baseFrequency="2.2" numOctaves="2" seed="${seed}" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="0.06" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feTurbulence type="fractalNoise" baseFrequency="1.6 4" numOctaves="2" seed="${seed + 7}" result="t"/>
    <feColorMatrix in="t" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.7 0 0 0 -0.45" result="speck"/>
    <feComposite in="speck" in2="d" operator="in" result="s"/>
    <feMerge><feMergeNode in="d"/><feMergeNode in="s"/></feMerge>
  </filter>`;
}

// p = { kind: 'hand' | 'foot' | 'finger', x, y, rot = 0, s = 1, flip = false, color, thumb, fingers, bands, fingerColors }
// bands: [[color, fromY, toY], ...] paints parts of the print in other colors (candy corn, Santa).
// fingerColors: [index, middle, ring, pinky, thumb] paints each finger its own color (rainbow, turkey).
function painted(p) {
  const id = `pf${++uid}`;
  const clip = `pc${uid}`;
  const shapes = p.kind === 'hand' ? handShapes(p.thumb !== false, p.fingers, p.fingerColors) : p.kind === 'foot' ? footShapes() : '<ellipse cx="0" cy="0" rx="0.2" ry="0.26"/>';
  const bands = (p.bands || []).map(([c, y0, y1]) => `<rect x="-3" y="${y0}" width="6" height="${y1 - y0}" fill="${c}"/>`).join('');
  const ridges = p.kind === 'finger'
    ? `<g fill="none" stroke="#000" stroke-opacity=".13" stroke-width=".018">${[0.05, 0.1, 0.15].map((r) => `<ellipse cx="0" cy="0.02" rx="${r}" ry="${r * 1.3}"/>`).join('')}</g>`
    : '';
  return `<g transform="translate(${p.x} ${p.y}) rotate(${p.rot || 0}) scale(${(p.flip ? -1 : 1) * (p.s || 1)} ${p.s || 1})">
    <defs>${paintFilter(id, uid)}<clipPath id="${clip}">${shapes}</clipPath></defs>
    <g filter="url(#${id})"><g fill="${p.color}">${shapes}</g>${bands ? `<g clip-path="url(#${clip})">${bands}</g>` : ''}${ridges}</g>
  </g>`;
}

// The same print as a dashed outline: the shapes stroked, then filled over with the page color
// so only the outer edge of the union shows. With no page color (a picture behind the print), the
// inside of the print is masked off instead, which leaves the outer half of a thicker stroke.
function outline(p, bg) {
  const shapes = p.kind === 'hand' ? handShapes(p.thumb !== false, p.fingers) : p.kind === 'foot' ? footShapes() : '<ellipse cx="0" cy="0" rx="0.2" ry="0.26"/>';
  const s = p.s || 1;
  if (!bg) {
    const id = `om${++uid}`;
    return `<g transform="translate(${p.x} ${p.y}) rotate(${p.rot || 0}) scale(${(p.flip ? -1 : 1) * s} ${s})">
    <mask id="${id}" maskUnits="userSpaceOnUse" x="-6" y="-6" width="12" height="12"><rect x="-6" y="-6" width="12" height="12" fill="#fff"/><g fill="#000">${shapes}</g></mask>
    <g fill="#fff" opacity=".35">${shapes}</g>
    <g mask="url(#${id})" fill="none" stroke="${p.guide || '#7d8499'}" stroke-width="${0.09 / s}" stroke-dasharray="${0.08 / s} ${0.07 / s}">${shapes}</g>
  </g>`;
  }
  return `<g transform="translate(${p.x} ${p.y}) rotate(${p.rot || 0}) scale(${(p.flip ? -1 : 1) * s} ${s})">
    <g fill="none" stroke="#9aa0b4" stroke-width="${0.05 / s}" stroke-dasharray="${0.07 / s} ${0.07 / s}">${shapes}</g>
    <g fill="${bg}">${shapes}</g>
  </g>`;
}

// Several prints' outlines over a picture, masked together so prints that overlap (a heart of two
// hands) show one outer edge between them.
function outlines(prints, guide = '#7d8499') {
  const id = `om${++uid}`;
  const place = (p, inner) => `<g transform="translate(${p.x} ${p.y}) rotate(${p.rot || 0}) scale(${(p.flip ? -1 : 1) * (p.s || 1)} ${p.s || 1})">${inner(p.s || 1)}</g>`;
  const shapesOf = (p) => (p.kind === 'hand' ? handShapes(p.thumb !== false, p.fingers) : p.kind === 'foot' ? footShapes() : '<ellipse cx="0" cy="0" rx="0.2" ry="0.26"/>');
  const all = prints.map((p) => place(p, () => shapesOf(p))).join('');
  return `<mask id="${id}" maskUnits="userSpaceOnUse" x="-2" y="-2" width="14" height="14"><rect x="-2" y="-2" width="14" height="14" fill="#fff"/><g fill="#000">${all}</g></mask>
    <g fill="#fff" opacity=".35">${all}</g>
    <g mask="url(#${id})" fill="none" stroke="${guide}">${prints.map((p) => place(p, (s) => `<g stroke-width="${0.09 / s}" stroke-dasharray="${0.08 / s} ${0.07 / s}">${shapesOf(p)}</g>`)).join('')}</g>`;
}

module.exports = { painted, outline, outlines };
