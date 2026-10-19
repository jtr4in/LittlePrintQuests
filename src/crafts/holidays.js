// The crafts in each Handprint Art Pack. Coordinates are inches inside the 7.5 x 6 in art panel.
// prints: where the hands, feet and fingers go (see prints.js); scene and decor print on the page;
// finish is what the grown-up or child adds after the paint dries (shown on the example only).

// ---------- little drawing helpers ----------
const eye = (x, y, r = 0.16) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#222" stroke-width="0.03"/><circle cx="${x + r * 0.2}" cy="${y + r * 0.15}" r="${r * 0.5}" fill="#222"/>`;
const dotEyes = (x, y, gap, r = 0.07, c = '#222') => `<circle cx="${x - gap}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x + gap}" cy="${y}" r="${r}" fill="${c}"/>`;
const smile = (x, y, w, c = '#222', sw = 0.05) => `<path d="M${x - w},${y} Q${x},${y + w * 0.9} ${x + w},${y}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>`;
const star = (cx, cy, r, c = '#f6c443') => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${(cx + rr * Math.cos(a)).toFixed(3)},${(cy + rr * Math.sin(a)).toFixed(3)}`;
  });
  return `<polygon points="${pts.join(' ')}" fill="${c}" stroke="#0002" stroke-width="0.02" stroke-linejoin="round"/>`;
};
const twinkles = (pts, c = '#fff', r = 0.05) => pts.map(([x, y, s = 1]) => `<circle cx="${x}" cy="${y}" r="${r * s}" fill="${c}"/>`).join('');
const snow = (pts) => pts.map(([x, y, s = 1]) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="#fff" stroke-width="0.035" stroke-linecap="round">${[0, 60, 120].map((a) => `<line x1="0" y1="-0.12" x2="0" y2="0.12" transform="rotate(${a})"/>`).join('')}</g>`).join('');
const web = (x, y, flipX, flipY) => {
  const sx = flipX ? -1 : 1;
  const sy = flipY ? -1 : 1;
  const spokes = [0, 22, 45, 68, 90].map((a) => {
    const r = (a * Math.PI) / 180;
    return `<line x1="0" y1="0" x2="${(1.5 * Math.cos(r)).toFixed(3)}" y2="${(1.5 * Math.sin(r)).toFixed(3)}"/>`;
  }).join('');
  const rings = [0.45, 0.85, 1.25].map((rr) => {
    const p = [0, 22, 45, 68, 90].map((a) => [rr * Math.cos((a * Math.PI) / 180), rr * Math.sin((a * Math.PI) / 180)]);
    return `<path d="M${p.map(([px, py]) => `${px.toFixed(3)},${py.toFixed(3)}`).join(' Q')}" fill="none"/>`.replace(/ Q/g, ' L');
  }).join('');
  return `<g transform="translate(${x} ${y}) scale(${sx} ${sy})" stroke="#8c86a8" stroke-width="0.025" fill="none">${spokes}${rings}</g>`;
};
const leaf = (x, y, rot, c = '#4f9a3c') => `<path d="M0,0 C0.2,-0.25 0.55,-0.25 0.7,0 C0.55,0.25 0.2,0.25 0,0 Z" fill="${c}" transform="translate(${x} ${y}) rotate(${rot})"/>`;
const stem = (x, y, c = '#5b8a2e') => `<path d="M${x - 0.09},${y} L${x - 0.05},${y - 0.38} Q${x + 0.05},${y - 0.48} ${x + 0.12},${y - 0.36} L${x + 0.09},${y} Z" fill="${c}"/>`;
const jackFace = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#2a1c12"><polygon points="-0.42,-0.15 -0.18,-0.15 -0.3,-0.38"/><polygon points="0.18,-0.15 0.42,-0.15 0.3,-0.38"/><path d="M-0.5,0.1 Q0,0.55 0.5,0.1 L0.3,0.18 L0.18,0.08 L0.05,0.2 L-0.08,0.08 L-0.2,0.2 L-0.32,0.1 Z"/></g>`;
const ghostFace = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#222"><ellipse cx="-0.28" cy="0" rx="0.1" ry="0.15"/><ellipse cx="0.28" cy="0" rx="0.1" ry="0.15"/><ellipse cx="0" cy="0.4" rx="0.13" ry="0.17"/></g>`;
const bow = (x, y, s = 1, c = '#d33b3b') => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><path d="M0,0 C-0.5,-0.45 -0.75,-0.05 -0.6,0.2 C-0.45,0.4 -0.2,0.2 0,0 Z"/><path d="M0,0 C0.5,-0.45 0.75,-0.05 0.6,0.2 C0.45,0.4 0.2,0.2 0,0 Z"/><path d="M-0.05,0 L-0.3,0.7 L-0.12,0.62 L0,0.78 L0.05,0.05 Z"/><path d="M0.05,0 L0.3,0.7 L0.12,0.62 L0,0.78 L-0.05,0.05 Z"/><circle r="0.12"/></g>`;
const santaHat = (x, y, w) => `<g><path d="M${x - w / 2},${y} Q${x - w * 0.1},${y - w * 0.9} ${x + w * 0.55},${y - w * 0.55} L${x + w / 2},${y} Z" fill="#d62f2f"/><rect x="${x - w / 2 - 0.08}" y="${y - 0.1}" width="${w + 0.16}" height="0.3" rx="0.15" fill="#fff" stroke="#0001" stroke-width="0.02"/><circle cx="${x + w * 0.58}" cy="${y - w * 0.55}" r="0.17" fill="#fff" stroke="#0001" stroke-width="0.02"/></g>`;
const topHat = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-0.2" y="-0.32" width="0.4" height="0.3" fill="#222"/><rect x="-0.3" y="-0.04" width="0.6" height="0.07" fill="#222"/><rect x="-0.2" y="-0.12" width="0.4" height="0.06" fill="#d33b3b"/></g>`;
const carrot = (x, y, s = 1) => `<polygon points="${x},${y - 0.04 * s} ${x + 0.22 * s},${y} ${x},${y + 0.04 * s}" fill="#f08a24"/>`;
const ground = (y, c) => `<path d="M0,${y} Q1.9,${y - 0.25} 3.75,${y} T7.5,${y} V6 H0 Z" fill="${c}"/>`;

// ---------- Halloween ----------
const NIGHT = '#2c2350';
const halloween = {
  id: 'halloween',
  name: 'Halloween',
  kicker: 'Halloween Handprint Art',
  month: 'October',
  paintList: 'white, black, orange, green and yellow',
  colors: { primary: '#5e2f91', accent: '#ec6f12', ink: '#2e1d40', paper: '#fff6ea', soft: '#e7d8f3' },
  crafts: [
    {
      title: 'Handprint Ghosts',
      poem: ['Two little ghosts came out to play,', 'they said “BOO!” and flew away.', 'Made by {name}, so spooky and sweet,', 'they only come for trick-or-treat!'],
      bg: NIGHT,
      paints: [['#ffffff', 'White']], uses: 'one hand, twice',
      steps: ['Paint {name}’s whole hand white.', 'Press it on an outline with the fingers pointing down. Do it again for ghost number two.', 'Once dry, draw two eyes and a big “O” mouth on each palm.'],
      scene: `<circle cx="6.3" cy="1" r="0.62" fill="#f6e9b2"/><circle cx="6.05" cy="0.85" r="0.12" fill="#e9d98f"/>${twinkles([[0.6, 0.6], [1.5, 1.2, 0.7], [3.4, 0.45], [4.6, 1, 0.8], [0.9, 2.4, 0.6], [5.6, 2.2, 0.7]], '#f6e9b2')}${ground(5.35, '#1c1535')}`,
      prints: [{ kind: 'hand', x: 2.3, y: 3.25, rot: 180, s: 0.95, flip: true, color: '#ffffff' }, { kind: 'hand', x: 5.2, y: 3.45, rot: 180, s: 0.85, color: '#ffffff' }],
      finish: ghostFace(2.3, 2.2, 1) + ghostFace(5.2, 2.5, 0.9),
    },
    {
      title: 'Itsy Bitsy Spider',
      poem: ['Eight wiggly legs and two big eyes,', 'this little spider is quite a surprise!', 'Made with {name}’s two hands,', 'the friendliest spider in all the land.'],
      bg: '#f3ecf8',
      paints: [['#2b2b2b', 'Black']], uses: 'both hands, no thumbs',
      steps: ['Paint both of {name}’s hands black, leaving the thumbs clean.', 'Press one hand with the fingers pointing left, then the other pointing right, palms overlapping in the middle.', 'Add two googly eyes (or the cut-outs) and a smile.'],
      scene: web(0, 0, false, false) + web(7.5, 0, true, false) + '<line x1="3.75" y1="0" x2="3.75" y2="2.75" stroke="#8c86a8" stroke-width="0.025"/>',
      prints: [{ kind: 'hand', x: 3.25, y: 3.55, rot: -90, s: 0.9, thumb: false, color: '#2b2b2b' }, { kind: 'hand', x: 4.25, y: 3.55, rot: 90, s: 0.9, thumb: false, flip: true, color: '#2b2b2b' }],
      finish: eye(3.5, 3.35, 0.22) + eye(4.0, 3.35, 0.22) + smile(3.75, 3.8, 0.22, '#fff'),
    },
    {
      title: 'Jack-o’-Lantern Hands',
      poem: ['Here’s a pumpkin, round and bright,', 'it glows and grins on Halloween night.', 'Two little hands from {name} made', 'the happiest pumpkin in the parade!'],
      bg: '#fff1df',
      paints: [['#f0841f', 'Orange']], uses: 'both hands, no thumbs',
      steps: ['Paint both hands orange, leaving the thumbs clean.', 'Press them side by side with the fingers pointing down, so the palms touch at the top.', 'Once dry, draw a jack-o’-lantern face. The stem and leaf are already there!'],
      scene: `${ground(5.3, '#e9d2b0')}${leaf(3.95, 1.95, -25)}<path d="M4.0,1.85 q.4,-.5 .9,-.2 q-.3,.1 -.4,.4" fill="none" stroke="#5b8a2e" stroke-width="0.05"/>`,
      decor: stem(3.75, 2.2),
      prints: [{ kind: 'hand', x: 2.95, y: 3.55, rot: 180, s: 0.92, thumb: false, flip: true, color: '#f0841f' }, { kind: 'hand', x: 4.55, y: 3.55, rot: 180, s: 0.92, thumb: false, color: '#f0841f' }],
      finish: jackFace(3.75, 2.9, 1.3),
    },
    {
      title: 'Batty for You',
      poem: ['Flap, flap, flap across the moon,', 'a little bat will see you soon!', '{name}’s hands are the wings you see,', 'as batty as a bat can be!'],
      bg: '#2b2f5a',
      paints: [['#2b2b2b', 'Black']], uses: 'both hands',
      steps: ['Paint both hands black.', 'Press them on each side of the body, fingers pointing out and thumbs up.', 'Add white eyes and two little fangs with a paint pen.'],
      scene: `<circle cx="3.75" cy="3" r="2.35" fill="#f6dc7a"/><circle cx="3.75" cy="3" r="2.05" fill="#f9e69a"/>${twinkles([[0.5, 0.5], [1, 1.6, 0.7], [6.8, 0.8], [6.3, 1.9, 0.7], [0.7, 4.6, 0.6], [6.9, 4.9, 0.8]], '#f9e69a')}`,
      decor: '<g fill="#2b2b2b"><ellipse cx="3.75" cy="3.25" rx="0.55" ry="0.7"/><circle cx="3.75" cy="2.45" r="0.45"/><polygon points="3.42,2.25 3.5,1.85 3.68,2.15"/><polygon points="4.08,2.25 4.0,1.85 3.82,2.15"/></g>',
      prints: [{ kind: 'hand', x: 2.25, y: 3.2, rot: -90, s: 0.85, flip: true, color: '#2b2b2b' }, { kind: 'hand', x: 5.25, y: 3.2, rot: 90, s: 0.85, color: '#2b2b2b' }],
      finish: `${dotEyes(3.75, 2.4, 0.16, 0.08, '#fff')}<polygon points="3.62,2.68 3.7,2.68 3.66,2.82" fill="#fff"/><polygon points="3.8,2.68 3.88,2.68 3.84,2.82" fill="#fff"/>`,
    },
    {
      title: 'Little Monster',
      poem: ['There’s a monster on this page,', 'but don’t you worry, don’t you fear!', 'It’s just {name}’s hand, all green,', 'the cutest monster ever seen!'],
      bg: '#eef7e3',
      paints: [['#6cc24a', 'Green']], uses: 'one hand',
      steps: ['Paint {name}’s hand green.', 'Press it on the outline with the fingers pointing up for wild monster hair.', 'Add one big eye (or three!) and a toothy grin.'],
      scene: `${twinkles([[0.7, 0.8, 1.4], [6.6, 1.1, 1.8], [1.2, 4.9, 1.2], [6.2, 4.6, 1.5], [0.5, 2.8], [7, 3]], '#cfe9b8', 0.08)}`,
      prints: [{ kind: 'hand', x: 3.75, y: 3.45, s: 1.05, color: '#6cc24a' }],
      finish: `${eye(3.85, 3.4, 0.38)}<path d="M3.2,4.25 Q3.85,4.75 4.5,4.25 Z" fill="#3a1d1d"/><polygon points="3.45,4.3 3.6,4.3 3.52,4.45" fill="#fff"/><polygon points="4.1,4.3 4.25,4.3 4.17,4.45" fill="#fff"/>`,
    },
    {
      title: 'Candy Corn Feet',
      poem: ['Yellow, orange, white on top,', 'candy corn feet that go hop, hop, hop!', 'These sweet little feet belong to {name},', 'Halloween’s tastiest treat of the season!'],
      bg: '#fde6cc',
      paints: [['#f6c443', 'Yellow'], ['#f0841f', 'Orange'], ['#ffffff', 'White']], uses: 'both feet',
      steps: ['Paint each foot in three stripes: yellow toes, orange middle, white heel.', 'Press the feet on the outlines with the toes pointing down.', 'Once dry, draw a happy face on the orange stripe.'],
      scene: twinkles([[0.6, 0.7, 1.5], [6.9, 0.8, 1.3], [0.6, 5.2, 1.2], [6.9, 5.3, 1.5]], '#f8d3a8', 0.08),
      prints: [{ kind: 'foot', x: 2.5, y: 3.0, rot: 180, s: 0.92, color: '#f6c443', bands: [['#f0841f', -1.05, 0.75], ['#ffffff', 0.75, 3]] }, { kind: 'foot', x: 5.0, y: 3.0, rot: 180, s: 0.92, flip: true, color: '#f6c443', bands: [['#f0841f', -1.05, 0.75], ['#ffffff', 0.75, 3]] }],
      finish: `${dotEyes(2.5, 2.8, 0.18)}${smile(2.5, 3.05, 0.17)}${dotEyes(5.0, 2.8, 0.18)}${smile(5.0, 3.05, 0.17)}`,
    },
    {
      title: 'Boo Feet',
      poem: ['Tiptoe, tiptoe, down the hall,', 'two little ghosts come to call.', '{name}’s feet went BOO tonight,', 'and gave us all a giggly fright!'],
      bg: '#3a2a5c',
      paints: [['#ffffff', 'White']], uses: 'both feet',
      steps: ['Paint the bottom of each foot white.', 'Press them on the outlines with the toes pointing down. The toes make the wavy ghost tails!', 'Once dry, give each ghost a spooky face near the heel.'],
      scene: `${twinkles([[0.6, 0.6], [1.8, 1.1, 0.7], [5.6, 0.5], [6.9, 1.4, 0.8], [0.8, 3.9, 0.6], [6.8, 4.2, 0.7]], '#cfc4ee')}${ground(5.4, '#271c40')}`,
      prints: [{ kind: 'foot', x: 2.6, y: 3.05, rot: 180, s: 0.95, color: '#ffffff' }, { kind: 'foot', x: 4.9, y: 3.05, rot: 180, s: 0.95, flip: true, color: '#ffffff' }],
      finish: ghostFace(2.6, 1.55, 0.85) + ghostFace(4.9, 1.55, 0.85),
    },
    {
      title: 'Fingerprint Pumpkin Patch',
      poem: ['One little pumpkin, two, then three,', 'growing in the patch for you and me.', 'Every pumpkin, round and fat,', 'is a fingerprint {name} made, imagine that!'],
      bg: '#fff3e1',
      paints: [['#f0841f', 'Orange']], uses: 'fingertips',
      steps: ['Dip a fingertip in orange paint.', 'Press a pumpkin on each dot along the vine. Press twice side by side for a big one!', 'Once dry, add little stems and faces with a marker.'],
      scene: `${ground(4.9, '#ead5b4')}<path d="M0.3,4.2 C1.2,3.4 2,4.6 3,3.9 S4.8,3.3 5.6,4 S6.9,4.4 7.3,3.7" fill="none" stroke="#5b8a2e" stroke-width="0.06"/>${leaf(1.4, 3.8, -40)}${leaf(3.9, 3.6, 200)}${leaf(5.2, 3.75, -30)}${leaf(6.6, 4.05, 210)}`,
      prints: [[0.9, 3.75], [2.1, 4.05], [3.0, 3.55], [4.4, 3.5], [5.95, 3.95], [6.95, 3.6]].map(([x, y]) => ({ kind: 'finger', x, y, s: 1.35, rot: 90, color: '#f0841f' })),
      finish: [[0.9, 3.75], [2.1, 4.05], [3.0, 3.55], [4.4, 3.5], [5.95, 3.95], [6.95, 3.6]].map(([x, y]) => `<rect x="${x - 0.03}" y="${y - 0.4}" width="0.06" height="0.14" fill="#5b8a2e"/>${dotEyes(x, y - 0.05, 0.08, 0.03)}${smile(x, y + 0.07, 0.08, '#222', 0.025)}`).join(''),
    },
  ],
  cards: ['Happy Halloween!', 'Boo! I love you!'],
  cardIcons: [
    `<svg viewBox="0 0 1 1"><circle cx=".5" cy=".55" r=".38" fill="#f0841f"/>${stem(0.5, 0.22).replace(/#5b8a2e/, '#5b8a2e')}${jackFace(0.5, 0.55, 0.45)}</svg>`,
    `<svg viewBox="0 0 1 1"><path d="M.2,.9 V.45 A.3,.3 0 0 1 .8,.45 V.9 L.7,.8 L.6,.9 L.5,.8 L.4,.9 L.3,.8 Z" fill="#fff" stroke="#5e2f91" stroke-width=".03"/>${ghostFace(0.5, 0.45, 0.45)}</svg>`,
  ],
  addons: addonSheet('halloween'),
  frame: `<svg viewBox="0 0 8.5 11"><rect x=".35" y=".35" width="7.8" height="10.3" rx=".3" fill="none" stroke="#5e2f91" stroke-width=".08"/><rect x=".5" y=".5" width="7.5" height="10" rx=".22" fill="none" stroke="#ec6f12" stroke-width=".03" stroke-dasharray=".12 .08"/>${web(0.35, 0.35, false, false)}${web(8.15, 0.35, true, false)}<g transform="translate(.95 10.05)"><circle r=".45" fill="#f0841f"/>${jackFace(0, 0.02, 0.5)}</g><g transform="translate(7.55 10.05)"><circle r=".45" fill="#f0841f"/>${jackFace(0, 0.02, 0.5)}</g></svg>`,
};

// ---------- Christmas ----------
const christmas = {
  id: 'christmas',
  name: 'Christmas',
  kicker: 'Christmas Handprint Art',
  month: 'December',
  paintList: 'green, brown, red, white, black and yellow',
  colors: { primary: '#b3202a', accent: '#1f6b45', ink: '#2b1d17', paper: '#fdf8ef', soft: '#f3d9c4' },
  crafts: [
    {
      title: 'Handprint Christmas Tree',
      poem: ['Six little handprints, green and bright,', 'make a Christmas tree just right.', 'Hang the ornaments, light the star,', '{name}, what a helper you are!'],
      bg: '#eaf5ef',
      paints: [['#3c9a4e', 'Green'], ['#d33b3b', 'Red'], ['#f6c443', 'Yellow']], uses: 'one hand, six times',
      steps: ['Paint {name}’s hand green and press it with the fingers pointing down: one at the top, two in the middle, three at the bottom.', 'Repaint as needed. Let it dry.', 'Dot on fingerprint ornaments in red and yellow.'],
      scene: snow([[0.6, 0.7], [1.4, 1.8, 0.8], [6.6, 0.9], [6.1, 2.2, 0.7], [0.7, 4, 0.9], [6.9, 4.3]]).replace(/#fff/g, '#b9d8c8'),
      decor: `<rect x="3.47" y="5.05" width="0.56" height="0.6" rx="0.06" fill="#7a4b2a"/>${star(3.75, 0.5, 0.42)}`,
      prints: [[3.75, 1.75, 0.62], [3.1, 2.85, 0.66], [4.4, 2.85, 0.66], [2.45, 3.95, 0.7], [3.75, 3.95, 0.7], [5.05, 3.95, 0.7]].map(([x, y, s], i) => ({ kind: 'hand', x, y, s, rot: 180, thumb: false, flip: i % 2 === 1, color: '#3c9a4e' })),
      finish: [[3.4, 1.4, '#d33b3b'], [4.1, 1.6, '#f6c443'], [2.8, 2.6, '#f6c443'], [3.75, 2.75, '#d33b3b'], [4.7, 2.55, '#4a8fd6'], [2.2, 3.8, '#d33b3b'], [3.2, 3.95, '#4a8fd6'], [4.3, 3.7, '#f6c443'], [5.3, 3.9, '#d33b3b'], [3.75, 4.5, '#f6c443']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="0.13" fill="${c}"/><circle cx="${x - 0.04}" cy="${y - 0.04}" r="0.035" fill="#fff8"/>`).join(''),
    },
    {
      title: 'Reindeer Footprint',
      poem: ['A little foot, two little hands,', 'the best reindeer in all the lands!', 'With a nose that glows so warm and bright,', '{name} will guide Santa’s sleigh tonight!'],
      bg: '#fdf1e4',
      paints: [['#8a5a3b', 'Brown'], ['#5b3a29', 'Dark brown'], ['#d33b3b', 'Red']], uses: 'one foot and both hands',
      steps: ['Paint {name}’s foot brown and press it toes up in the middle. That’s the reindeer’s face!', 'Paint both hands dark brown and press them above the toes for antlers.', 'Once dry, add eyes and a big red nose on the heel (a red fingerprint works great).'],
      scene: snow([[0.6, 0.6], [6.8, 0.7], [0.5, 3.8, 0.8], [7, 4.3, 0.9], [1.1, 5.4], [6.4, 5.5, 0.8]]).replace(/#fff/g, '#e3cdb4'),
      prints: [{ kind: 'hand', x: 1.65, y: 1.75, rot: -38, s: 0.62, flip: true, color: '#5b3a29' }, { kind: 'hand', x: 5.85, y: 1.75, rot: 38, s: 0.62, color: '#5b3a29' }, { kind: 'foot', x: 3.75, y: 3.4, s: 0.9, color: '#8a5a3b' }],
      finish: `${eye(3.45, 3.0, 0.19)}${eye(4.05, 3.0, 0.19)}<circle cx="3.83" cy="5.25" r="0.34" fill="#d33b3b"/><circle cx="3.73" cy="5.15" r="0.09" fill="#fff9"/>${smile(3.8, 4.5, 0.25)}`,
    },
    {
      title: 'Ho Ho Ho Santa',
      poem: ['Who has a beard so soft and white?', 'Who visits every house tonight?', 'Ho ho ho! It’s Santa, see?', 'Made by {name}’s hand for me!'],
      bg: '#e8f1fa',
      paints: [['#f4c7a5', 'Peach'], ['#ffffff', 'White']], uses: 'one hand, no thumb',
      steps: ['Paint {name}’s palm peach and the fingers white.', 'Press the hand under the hat with the fingers pointing down for the beard.', 'Once dry, add eyes, rosy cheeks and a nose.'],
      scene: snow([[0.6, 0.8], [1.6, 2], [6.7, 0.9], [6, 2.4, 0.8], [0.8, 4.6, 0.9], [6.8, 4.8]]).replace(/#fff/g, '#bcd2e8'),
      decor: santaHat(3.75, 1.95, 2.1),
      prints: [{ kind: 'hand', x: 3.75, y: 3.4, rot: 180, s: 1.0, thumb: false, color: '#ffffff', bands: [['#f4c7a5', -0.42, 3]] }],
      finish: `${dotEyes(3.75, 2.75, 0.28, 0.08)}<circle cx="3.75" cy="3.05" r="0.12" fill="#e98e78"/><circle cx="3.25" cy="3.12" r="0.15" fill="#f2a1a1" opacity=".7"/><circle cx="4.25" cy="3.12" r="0.15" fill="#f2a1a1" opacity=".7"/>`,
    },
    {
      title: 'Five Little Snowmen',
      poem: ['Five little snowmen, fat and round,', 'standing on the snowy ground.', 'Each one has a carrot nose,', 'made by {name}, from fingers to toes!'],
      bg: '#3b6b9c',
      paints: [['#ffffff', 'White']], uses: 'one hand',
      steps: ['Paint {name}’s whole hand white.', 'Press it with the fingers spread and pointing up.', 'Once dry, give every fingertip a hat, two eyes and a carrot nose.'],
      scene: `${snow([[0.6, 0.6], [1.5, 1.6, 0.8], [6.7, 0.7], [6.1, 1.8, 0.7], [0.6, 3.2, 0.9], [6.9, 3.5]])}${ground(5.15, '#f4f8fc')}`,
      prints: [{ kind: 'hand', x: 3.75, y: 3.5, s: 1.08, color: '#ffffff' }],
      finish: (() => {
        const tips = [[-0.7, -0.5, 1.45, -11], [-0.19, -0.62, 1.62, -3], [0.32, -0.56, 1.5, 6], [0.78, -0.32, 1.12, 15], [-0.9, 0.38, 1.2, -52]];
        return tips.map(([bx, by, len, deg]) => {
          const r = (deg * Math.PI) / 180;
          const s = 1.08;
          const x = 3.75 + s * (bx + (len - 0.15) * Math.sin(r));
          const y = 3.5 + s * (by - (len - 0.15) * Math.cos(r));
          return `<g transform="rotate(${deg} ${x} ${y})">${topHat(x, y - 0.12, 0.6)}${dotEyes(x, y + 0.04, 0.07, 0.03)}${carrot(x, y + 0.13, 0.9)}</g>`;
        }).join('');
      })(),
    },
    {
      title: 'Handprint Wreath',
      poem: ['Round and round the hands all go,', 'a wreath of green with a big red bow.', 'Hang it up for all to see,', 'love from {name}, the year {year}!'],
      bg: '#fbf3ea',
      paints: [['#3c9a4e', 'Green'], ['#d33b3b', 'Red']], uses: 'one hand, eight times',
      steps: ['Paint {name}’s hand green, leaving the thumb clean.', 'Press it on each outline around the circle, fingers pointing out. Repaint every two or three prints.', 'Once dry, add red fingerprint berries.'],
      scene: '',
      decor: bow(3.75, 5.05, 1.05),
      prints: Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45 * Math.PI) / 180;
        return { kind: 'hand', x: 3.75 + 1.4 * Math.sin(a), y: 3.0 - 1.4 * Math.cos(a), rot: i * 45, s: 0.5, thumb: false, color: i % 2 ? '#3c9a4e' : '#4fae5f' };
      }),
      finish: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = ((i * 45 + 22) * Math.PI) / 180;
        return `<circle cx="${3.75 + 1.05 * Math.sin(a)}" cy="${3.0 - 1.05 * Math.cos(a)}" r="0.11" fill="#d33b3b"/><circle cx="${3.75 + 1.25 * Math.sin(a + 0.12)}" cy="${3.0 - 1.25 * Math.cos(a + 0.12)}" r="0.09" fill="#d33b3b"/>`;
      }).join(''),
    },
    {
      title: 'Little Angel',
      poem: ['A little angel, sweet and small,', 'the dearest angel of them all.', 'With golden wings and a shining glow,', 'it’s {name}’s foot, just so you know!'],
      bg: '#e4ebf8',
      paints: [['#ffffff', 'White'], ['#f6c443', 'Gold']], uses: 'one foot and both hands',
      steps: ['Paint {name}’s foot white and press it with the toes pointing down for the angel’s dress.', 'Paint both hands gold and press them on each side for wings.', 'Once dry, draw a happy face on the head and color the halo.'],
      scene: twinkles([[0.7, 0.7, 1.3], [6.7, 0.8, 1.2], [1.0, 4.9], [6.5, 5.1, 1.2], [0.5, 2.6], [7.0, 2.9]], '#f6dd8c', 0.07),
      decor: '<circle cx="3.75" cy="1.05" r="0.47" fill="#f4c7a5"/><ellipse cx="3.75" cy="0.42" rx="0.45" ry="0.12" fill="none" stroke="#f6c443" stroke-width="0.09"/>',
      prints: [{ kind: 'hand', x: 2.2, y: 2.7, rot: -62, s: 0.66, flip: true, color: '#f6c443' }, { kind: 'hand', x: 5.3, y: 2.7, rot: 62, s: 0.66, color: '#f6c443' }, { kind: 'foot', x: 3.75, y: 3.55, rot: 180, s: 0.84, color: '#ffffff' }],
      finish: `${dotEyes(3.75, 1.0, 0.15, 0.05)}${smile(3.75, 1.17, 0.14, '#222', 0.035)}`,
    },
    {
      title: 'Fingerprint Christmas Lights',
      poem: ['Red and green and gold and blue,', 'twinkle lights I made for you!', 'Every bulb, so shiny and bright,', 'is one of {name}’s fingerprints of light!'],
      bg: '#fbf6ee',
      paints: [['#d33b3b', 'Red'], ['#3c9a4e', 'Green'], ['#f6c443', 'Yellow'], ['#4a8fd6', 'Blue']], uses: 'fingertips',
      steps: ['Dip a fingertip in one color of paint.', 'Press a bulb under each little socket on the string. Change colors as you go!', 'Wipe the finger between colors. Done!'],
      scene: '<path d="M0.2,1.4 Q1.9,2.6 3.75,1.4 T7.3,1.4" fill="none" stroke="#2d5a3a" stroke-width="0.05"/><path d="M0.2,3.4 Q1.9,4.6 3.75,3.4 T7.3,3.4" fill="none" stroke="#2d5a3a" stroke-width="0.05"/>',
      decor: (() => {
        const pts = [];
        for (const row of [1.4, 3.4]) for (let i = 0; i < 7; i++) {
          const t = (i + 0.5) / 7;
          const x = 0.2 + 7.1 * t;
          const y = row + 0.6 * Math.sin(Math.PI * 2 * t) * -1 + (t < 0.5 ? 0.6 * 4 * t * (1 - 2 * t) : 0) * 0;
          pts.push([x, row + 0.6 * Math.sin(2 * Math.PI * t)]);
        }
        return pts.map(([x, y]) => `<rect x="${x - 0.07}" y="${y - 0.02}" width="0.14" height="0.16" rx="0.03" fill="#2d5a3a"/>`).join('');
      })(),
      prints: (() => {
        const colors = ['#d33b3b', '#3c9a4e', '#f6c443', '#4a8fd6'];
        const out = [];
        for (const row of [1.4, 3.4]) for (let i = 0; i < 7; i++) {
          const t = (i + 0.5) / 7;
          out.push({ kind: 'finger', x: 0.2 + 7.1 * t, y: row + 0.6 * Math.sin(2 * Math.PI * t) + 0.38, s: 1.1, color: colors[(out.length) % 4] });
        }
        return out;
      })(),
      finish: '',
    },
    {
      title: 'Penguin Pals',
      poem: ['Waddle, waddle, slip and slide,', 'two little penguins side by side.', 'Made from {name}’s two small feet,', 'the chilliest friends you’ll ever meet!'],
      bg: '#e2f0fa',
      paints: [['#2b2b2b', 'Black']], uses: 'both feet',
      steps: ['Paint the bottom of each foot black.', 'Press them on the outlines with the toes pointing down.', 'Once dry, paint a white tummy, then add eyes, an orange beak and orange feet.'],
      scene: `${snow([[0.6, 0.6], [1.6, 1.4, 0.8], [6.6, 0.7], [5.9, 1.5, 0.7], [0.6, 3.4, 0.9], [6.9, 3.6]]).replace(/#fff/g, '#a9cbe6')}${ground(5.35, '#ffffff')}`,
      prints: [{ kind: 'foot', x: 2.6, y: 3.05, rot: 180, s: 0.95, color: '#2b2b2b' }, { kind: 'foot', x: 4.9, y: 3.05, rot: 180, s: 0.95, flip: true, color: '#2b2b2b' }],
      finish: [2.6, 4.9].map((x) => `<ellipse cx="${x}" cy="3.35" rx="0.48" ry="0.95" fill="#fff"/>${eye(x - 0.18, 1.45, 0.11)}${eye(x + 0.18, 1.45, 0.11)}<polygon points="${x - 0.12},1.7 ${x + 0.12},1.7 ${x},1.92" fill="#f08a24"/><ellipse cx="${x - 0.3}" cy="5.25" rx="0.22" ry="0.09" fill="#f08a24"/><ellipse cx="${x + 0.3}" cy="5.25" rx="0.22" ry="0.09" fill="#f08a24"/>`).join(''),
    },
  ],
  cards: ['Merry Christmas!', 'Love you to the North Pole!'],
  cardIcons: [
    `<svg viewBox="0 0 1 1"><polygon points=".5,.08 .85,.8 .15,.8" fill="#3c9a4e"/><rect x=".44" y=".8" width=".12" height=".12" fill="#7a4b2a"/>${star(0.5, 0.1, 0.1)}</svg>`,
    `<svg viewBox="0 0 1 1">${star(0.5, 0.5, 0.42)}</svg>`,
  ],
  addons: addonSheet('christmas'),
  frame: `<svg viewBox="0 0 8.5 11"><rect x=".35" y=".35" width="7.8" height="10.3" rx=".3" fill="none" stroke="#b3202a" stroke-width=".08"/><rect x=".5" y=".5" width="7.5" height="10" rx=".22" fill="none" stroke="#1f6b45" stroke-width=".03" stroke-dasharray=".12 .08"/>${[[0.9, 0.9], [7.6, 0.9], [0.9, 10.1], [7.6, 10.1]].map(([x, y]) => `<g transform="translate(${x} ${y})">${leaf(-0.05, 0, 200, '#1f6b45')}${leaf(0.05, 0, -20, '#2f8a55')}<circle cx="-0.08" cy="-0.06" r=".1" fill="#d33b3b"/><circle cx=".08" cy="-0.04" r=".1" fill="#d33b3b"/></g>`).join('')}</svg>`,
};

// Cut-out add-ons: googly eyes in three sizes, plus each holiday's hats and extras.
function addonSheet(id) {
  const out = [];
  const eyes = [[0.3, 10], [0.22, 12], [0.15, 16]];
  let y = 0.45;
  for (const [r, n] of eyes) {
    const per = Math.floor(7.2 / (r * 2 + 0.22));
    for (let i = 0; i < Math.min(n, per); i++) {
      const x = 0.35 + r + i * (r * 2 + 0.22);
      out.push(`<circle cx="${x}" cy="${y + r}" r="${r}" fill="#fff" stroke="#999" stroke-width="0.02" stroke-dasharray="0.05 0.04"/><circle cx="${x + r * 0.2}" cy="${y + r * 1.15}" r="${r * 0.5}" fill="#222"/><circle cx="${x + r * 0.05}" cy="${y + r * 0.95}" r="${r * 0.14}" fill="#fff"/>`);
    }
    y += r * 2 + 0.3;
  }
  const cut = 'stroke="#999" stroke-width="0.02" stroke-dasharray="0.05 0.04"';
  if (id === 'halloween') {
    for (let i = 0; i < 4; i++) {
      const x = 1 + i * 1.8;
      out.push(`<g transform="translate(${x} ${y + 1})"><path d="M-0.7,0.3 L0.7,0.3 L0.3,0.15 L0.05,-0.85 Q-0.05,-0.95 -0.15,-0.8 L-0.3,0.15 Z" fill="#3b2a55" ${cut}/><rect x="-0.32" y="0.02" width="0.64" height="0.14" fill="#ec6f12"/></g>`);
    }
    y += 1.6;
    for (let i = 0; i < 6; i++) out.push(`<g transform="translate(${0.7 + i * 1.2} ${y + 0.4})">${jackFace(0, 0, 0.9)}</g>`);
    y += 1.0;
    for (let i = 0; i < 6; i++) out.push(`<g transform="translate(${0.7 + i * 1.2} ${y + 0.2})"><path d="M-0.4,0 Q0,0.5 0.4,0 Z" fill="#3a1d1d" ${cut}/><polygon points="-0.22,0.02 -0.1,0.02 -0.16,0.14" fill="#fff"/><polygon points="0.1,0.02 0.22,0.02 0.16,0.14" fill="#fff"/></g>`);
    y += 0.9;
    for (let i = 0; i < 8; i++) out.push(`<g transform="translate(${0.6 + i * 0.9} ${y + 0.3})"><path d="M-0.06,0.25 L-0.03,-0.15 Q0.05,-0.25 0.1,-0.12 L0.06,0.25 Z" fill="#5b8a2e" ${cut}/></g>`);
  } else {
    for (let i = 0; i < 4; i++) out.push(`<g transform="translate(${0.95 + i * 1.8} ${y + 1})">${santaHat(0, 0.3, 1.3).replace(/fill="#d62f2f"/, `fill="#d62f2f" ${cut}`)}</g>`);
    y += 1.7;
    for (let i = 0; i < 10; i++) out.push(`<circle cx="${0.6 + i * 0.72}" cy="${y + 0.3}" r="0.25" fill="#d33b3b" ${cut}/>`);
    y += 0.85;
    for (let i = 0; i < 6; i++) out.push(`<g transform="translate(${0.8 + i * 1.2} ${y + 0.4})">${star(0, 0, 0.42).replace('/>', ` ${cut}/>`)}</g>`);
    y += 1.05;
    for (let i = 0; i < 6; i++) out.push(`<g transform="translate(${0.8 + i * 1.2} ${y + 0.3})">${bow(0, 0, 0.55)}</g>`);
  }
  return out.join('');
}

module.exports = { halloween, christmas };
// The drawing helpers, for the Memory Handprint Book (memory.js).
module.exports.draw = { eye, dotEyes, smile, star, twinkles, snow, leaf, stem, ground, bow };
