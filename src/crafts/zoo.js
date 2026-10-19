// My Handprint Zoo: a frameable handprint animal on every page, plus a cover. Pages work like the
// Memory Handprint Book's months (memory.js), with the animal as the big heading.

const {
  W, H, f, eye, dotEyes, smile, star, twinkles, leaf, panelBg, sky, cloud, heart, flower, stalk, grass, sunburst,
  maple, apple, bubble, seaweed, starfish, shell, sparkle, hand, finger, painted, tipOf, coverRing,
} = require('./scenery');

const sand = (y, c = '#f4dca6') => `<path d="M0,${y} Q1.8,${y - 0.2} 3.75,${y - 0.05} T7.5,${y - 0.1} V${H - 0.3} A0.3,0.3 0 0 1 ${W - 0.3},${H} H0.3 A0.3,0.3 0 0 1 0,${H - 0.3} Z" fill="${c}"/>`;
const palmTree = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0,0 C0.1,-0.6 0.05,-1.2 0.25,-1.8" fill="none" stroke="#a0703c" stroke-width="0.14" stroke-linecap="round"/>${[[-60, '#4f9a3c'], [-20, '#5fb04a'], [20, '#4f9a3c'], [60, '#5fb04a'], [100, '#4f9a3c']].map(([a, c]) => `<path d="M0.25,-1.8 q${f(0.5 * Math.cos((a - 90) * Math.PI / 180))},${f(0.5 * Math.sin((a - 90) * Math.PI / 180))} ${f(0.85 * Math.cos((a - 70) * Math.PI / 180))},${f(0.85 * Math.sin((a - 70) * Math.PI / 180) + 0.3)}" fill="none" stroke="${c}" stroke-width="0.16" stroke-linecap="round"/>`).join('')}</g>`;
const acacia = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0,0 L0.05,-0.9 L-0.4,-1.3 M0.05,-0.9 L0.45,-1.35" fill="none" stroke="#7a4b2a" stroke-width="0.09" stroke-linecap="round"/><ellipse cx="0" cy="-1.45" rx="1.0" ry="0.28" fill="#6b9a3c"/><ellipse cx="0.2" cy="-1.6" rx="0.6" ry="0.2" fill="#7fb04a"/></g>`;
const mushroom = (x, y, s = 1, c = '#e5383b') => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-0.08" y="-0.25" width="0.16" height="0.25" rx="0.04" fill="#fbf1dc"/><path d="M-0.3,-0.22 Q0,-0.6 0.3,-0.22 Z" fill="${c}"/><circle cx="-0.1" cy="-0.33" r="0.04" fill="#fff"/><circle cx="0.1" cy="-0.38" r="0.035" fill="#fff"/></g>`;
const volcano = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-1.2,0 L-0.3,-1.3 L0.3,-1.3 L1.2,0 Z" fill="#9c7a5b"/><path d="M-0.3,-1.3 L0.3,-1.3 L0.2,-1.1 L0.05,-1.2 L-0.1,-1.05 L-0.3,-1.3 Z" fill="#f28c28"/><circle cx="-0.1" cy="-1.6" r="0.18" fill="#c9bfb4"/><circle cx="0.15" cy="-1.85" r="0.22" fill="#d9d1c8"/><circle cx="0.4" cy="-2.15" r="0.16" fill="#e6e0d9"/></g>`;
const fern = (x, y, s = 1, flip = false) => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})"><path d="M0,0 Q0.2,-0.6 0.7,-0.9" fill="none" stroke="#3f8a2e" stroke-width="0.05"/>${[0.15, 0.3, 0.45, 0.6, 0.75].map((t) => `<path d="M${f(t * 0.8)},${f(-t * 1.1)} l0.18,-0.12 M${f(t * 0.8)},${f(-t * 1.1)} l-0.06,-0.2" stroke="#3f8a2e" stroke-width="0.05" stroke-linecap="round"/>`).join('')}</g>`;
const rainbowArc = (cx, cy, r, w = 0.16, o = 1) => ['#ff8a80', '#ffcc80', '#fff59d', '#a5d6a7', '#90caf9', '#ce93d8'].map((c, i) => `<path d="M${cx - r + i * w},${cy} A${r - i * w},${r - i * w} 0 0 1 ${cx + r - i * w},${cy}" fill="none" stroke="${c}" stroke-width="${w}" opacity="${o}"/>`).join('');
const carrot = (x, y, rot = 0, s = 1) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M-0.12,0 L0.12,0 L0,0.6 Z" fill="#f28c28"/><path d="M-0.06,0.15 h0.07 M0.0,0.3 h0.06" stroke="#d9741a" stroke-width="0.02"/><path d="M0,0 l-0.1,-0.22 M0,0 l0,-0.25 M0,0 l0.1,-0.22" stroke="#4f9a3c" stroke-width="0.05" stroke-linecap="round"/></g>`;
const footprints = (pts) => pts.map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})" fill="#e3c88f"><ellipse cx="-0.06" cy="0" rx="0.04" ry="0.06"/><ellipse cx="0.06" cy="0.03" rx="0.04" ry="0.06"/></g>`).join('');

// ---------- the twelve animals ----------
const lionMane = Array.from({ length: 8 }, (_, i) => {
  const a = (i * 45 * Math.PI) / 180;
  return hand({ x: f(3.75 + 1.5 * Math.sin(a)), y: f(2.9 - 1.5 * Math.cos(a)), rot: i * 45, s: 0.5, thumb: false, color: ['#f08a24', '#b5651d', '#f6a33a', '#c2702a'][i % 4] });
});
const elephant = hand({ x: 3.4, y: 3.0, rot: 180, s: 0.95, color: '#9aa5b1' });
const trunk = tipOf(elephant, 4, 0.05);
const peacock = [hand({ x: 3.1, y: 2.95, rot: -30, s: 0.82, thumb: false, flip: true, color: '#1e88e5', fingerColors: ['#26a69a', '#1e88e5', '#7cb342', '#8e5bd3'] }), hand({ x: 4.4, y: 2.95, rot: 30, s: 0.82, thumb: false, color: '#1e88e5', fingerColors: ['#26a69a', '#1e88e5', '#7cb342', '#8e5bd3'] })];
const fishPrint = hand({ x: 3.95, y: 3.35, rot: 90, s: 0.98, color: '#8e5bd3', fingerColors: ['#3a86ff', '#4caf50', '#f7c948', '#f28c28', '#e5383b'] });
const crab = [hand({ x: 2.9, y: 3.55, rot: -90, s: 0.78, flip: true, color: '#e5383b' }), hand({ x: 4.6, y: 3.55, rot: 90, s: 0.78, color: '#e5383b' })];
const crabClaws = crab.map((p) => tipOf(p, 4, 0.05));
const dino = hand({ x: 3.55, y: 3.65, s: 0.92, thumb: false, color: '#5fb04a', fingerColors: ['#f28c28', '#f7c948', '#f28c28', '#f7c948'] });
const turtle = hand({ x: 3.75, y: 3.75, s: 0.98, color: '#4caf50' });
const turtleHead = tipOf(turtle, 1, 0.2);
const hedgehog = hand({ x: 3.6, y: 3.6, rot: 52, s: 0.95, thumb: false, color: '#8b5a2b' });
const bunny = hand({ x: 3.75, y: 3.7, s: 1.0, thumb: false, fingers: [1, 2], color: '#ffffff' });
const bee = [hand({ x: 3.25, y: 2.55, rot: -32, s: 0.62, thumb: false, flip: true, color: '#bfe6fb' }), hand({ x: 4.25, y: 2.55, rot: 32, s: 0.62, thumb: false, color: '#bfe6fb' })];
const jelly = [hand({ x: 3.0, y: 2.55, rot: 180, s: 0.92, thumb: false, color: '#f06292', fingerColors: ['#ce93d8', '#f48fb1', '#b39ddb', '#80deea'] }), hand({ x: 5.55, y: 3.4, rot: 180, s: 0.55, thumb: false, color: '#80deea', fingerColors: ['#b39ddb', '#80deea', '#f48fb1', '#ce93d8'] })];

const animals = [
  {
    heading: 'Lion',
    title: 'Roar-some!',
    titleColors: ['#e76f1c', '#b5651d', '#f6a33a', '#c2702a'],
    border: '#f6a33a',
    icon: (x, y, s) => sunburst(x, y, s * 0.12, '#ffd99a', '#ffd99a'),
    poem: ['A mighty lion, big and proud,', 'with a mane so fluffy and a roar so loud!', 'But this little lion is gentle and kind,', 'the sweetest king that you could find.'],
    paints: [['#f08a24', 'Orange'], ['#b5651d', 'Brown'], ['#f6a33a', 'Gold']], uses: 'one hand, eight times',
    steps: ['Paint {name}’s hand orange, leaving the thumb clean.', 'Press it on each outline around the lion’s face, fingers pointing out. Switch colors as you go.', 'Repaint every two or three prints. What a fluffy mane!'],
    scene: `${sky('lionSky', '#ffe0b2', '#fff6e8')}${sunburst(6.5, 0.85, 0.42, '#ffd23f', '#ffc04d')}${acacia(1.0, 4.9, 1.0)}${acacia(6.6, 4.8, 0.8)}
      ${grass(5.2, '#e3c06a', '#c9a24a')}<path d="M0.4,5.6 l0.1,-0.25 l0.1,0.25 M6.8,5.7 l0.1,-0.25 l0.1,0.25 M2.0,6.0 l0.08,-0.2 l0.08,0.2" stroke="#b08a3a" stroke-width="0.03" fill="none"/>
      <path d="M0.5,2.0 q0.12,-0.1 0.24,0 q0.12,-0.1 0.24,0 M6.0,2.1 q0.1,-0.08 0.2,0 q0.1,-0.08 0.2,0" fill="none" stroke="#7a5a3a" stroke-width="0.03" stroke-linecap="round"/>`,
    prints: lionMane,
    decor: `<circle cx="3.25" cy="2.05" r="0.28" fill="#f6c453"/><circle cx="4.25" cy="2.05" r="0.28" fill="#f6c453"/><circle cx="3.25" cy="2.05" r="0.14" fill="#e9a03a"/><circle cx="4.25" cy="2.05" r="0.14" fill="#e9a03a"/>
      <circle cx="3.75" cy="2.9" r="1.0" fill="#f6c453"/><ellipse cx="3.75" cy="3.3" rx="0.5" ry="0.36" fill="#fde8b8"/>
      ${dotEyes(3.75, 2.65, 0.32, 0.09)}<path d="M3.6,3.05 L3.9,3.05 L3.75,3.22 Z" fill="#6b3a1e"/><path d="M3.75,3.22 v0.12 M3.75,3.34 q-0.15,0.12 -0.28,0 M3.75,3.34 q0.15,0.12 0.28,0" fill="none" stroke="#6b3a1e" stroke-width="0.035" stroke-linecap="round"/>
      <path d="M3.25,3.2 h-0.4 M3.25,3.32 l-0.38,0.08 M4.25,3.2 h0.4 M4.25,3.32 l0.38,0.08" stroke="#b5651d" stroke-width="0.02"/><circle cx="3.2" cy="3.0" r="0.1" fill="#f4a3a3" opacity=".6"/><circle cx="4.3" cy="3.0" r="0.1" fill="#f4a3a3" opacity=".6"/>`,
    finish: '',
  },
  {
    heading: 'Elephant',
    title: 'Big Ears, Big Heart',
    titleColors: ['#6b7d93', '#5aa9e6', '#6b7d93', '#5aa9e6'],
    border: '#9aa5b1',
    icon: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s * 0.32})"><path d="M0,-0.3 C0.08,-0.15 0.1,-0.05 0.1,0.05 A0.1,0.1 0 0 1 -0.1,0.05 C-0.1,-0.05 -0.08,-0.15 0,-0.3 Z" fill="#9bd0f2"/></g>`,
    poem: ['Stomp, stomp, stomp, the elephant goes,', 'swinging her trunk from her head to her toes.', 'Big floppy ears and a heart that is true,', '{name}’s elephant never forgets you!'],
    paints: [['#9aa5b1', 'Gray'], ['#f7a8c0', 'Pink']], uses: 'one hand',
    steps: ['Paint {name}’s whole hand gray.', 'Press it with the fingers pointing down for legs. The thumb is the trunk!', 'Once dry, add a big pink ear, an eye and a little tusk.'],
    scene: `${sky('eleSky', '#cdeefd', '#effaff')}${sunburst(0.85, 0.85, 0.4, '#ffe082', '#ffd54f')}${cloud(5.6, 0.8, 0.65)}${cloud(3.0, 0.55, 0.45)}
      ${palmTree(6.6, 5.3, 1.05)}${grass(5.1, '#9bd17f', '#5aa04a')}
      <ellipse cx="1.3" cy="5.75" rx="0.95" ry="0.28" fill="#7cc8f0"/><ellipse cx="1.1" cy="5.7" rx="0.4" ry="0.08" fill="#fff" opacity=".5"/>
      ${flower(2.6, 5.9, 0.8, '#f48fb1')}${flower(5.0, 6.1, 0.8, '#ffd23f')}`,
    prints: [elephant],
    decor: '<path d="M2.38,2.3 q-0.25,0.15 -0.2,0.45" fill="none" stroke="#7d8896" stroke-width="0.05" stroke-linecap="round"/><circle cx="2.17" cy="2.78" r="0.06" fill="#7d8896"/>',
    finish: `<path d="M3.95,1.75 C3.2,1.75 3.15,3.05 3.95,3.2 C4.25,3.2 4.25,1.8 3.95,1.75 Z" fill="#8c97a4"/><path d="M3.9,1.95 C3.45,2.0 3.45,2.9 3.9,2.98 C4.05,2.95 4.05,2.0 3.9,1.95 Z" fill="#f7a8c0"/>${eye(4.45, 2.4, 0.12)}<path d="M4.75,3.0 q0.15,0.15 0.32,0.08" fill="none" stroke="#fff" stroke-width="0.08" stroke-linecap="round"/>${[[0.25, -0.25], [0.45, -0.5], [0.6, -0.2]].map(([dx, dy]) => `<path transform="translate(${trunk[0] + dx} ${trunk[1] + dy})" d="M0,-0.12 C0.05,-0.04 0.07,0 0.07,0.04 A0.07,0.07 0 0 1 -0.07,0.04 C-0.07,0 -0.05,-0.04 0,-0.12 Z" fill="#6bb7ec"/>`).join('')}`,
  },
  {
    heading: 'Peacock',
    title: 'Show Your Colors',
    titleColors: ['#1e88e5', '#26a69a', '#7cb342', '#8e5bd3'],
    border: '#26a69a',
    icon: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s * 0.35})"><ellipse rx="0.3" ry="0.4" fill="#a5d6a7"/><ellipse rx="0.16" ry="0.22" fill="#90caf9"/><circle r="0.08" fill="#5c6bc0"/></g>`,
    poem: ['Look at me, I’m bright and bold,', 'with feathers of blue and green and gold!', 'I fan my tail for all to see,', 'a peacock made by {name} and me.'],
    paints: [['#26a69a', 'Teal'], ['#1e88e5', 'Blue'], ['#7cb342', 'Green'], ['#8e5bd3', 'Purple']], uses: 'both hands, no thumbs',
    steps: ['Paint the fingers of both hands teal, blue, green and purple, and the palms blue.', 'Press the hands side by side, fingers fanned out wide, for a big tail.', 'Once dry, draw the peacock’s body and head in the middle and dot a “feather eye” on every fingertip.'],
    scene: `${panelBg('#f4f1fb')}${[[0.7, 0.8], [6.8, 1.0], [0.5, 3.4], [7.0, 3.6]].map(([x, y]) => `<g transform="translate(${x} ${y})"><ellipse rx="0.22" ry="0.3" fill="#d9ead7"/><ellipse rx="0.11" ry="0.16" fill="#d3e4f7"/><circle r="0.05" fill="#c5cae9"/></g>`).join('')}
      ${grass(5.15, '#a5d68f', '#6fb35a')}${[[0.7, 4.9, 5.9, '#f48fb1'], [1.6, 5.0, 6.0, '#ffd23f'], [5.9, 5.0, 6.0, '#b39ddb'], [6.8, 4.85, 5.95, '#f48fb1']].map(([x, y, y1, c]) => `${stalk(x, y, y1)}${flower(x, y, 1.05, c)}`).join('')}`,
    prints: peacock,
    decor: '',
    finish: `${peacock.flatMap((p) => [0, 1, 2, 3].map((i) => tipOf(p, i, 0.25))).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="0.13" fill="#f7c948"/><circle cx="${x}" cy="${y}" r="0.07" fill="#3949ab"/>`).join('')}
      <path d="M3.75,2.55 C4.25,3.2 4.3,4.3 3.75,4.75 C3.2,4.3 3.25,3.2 3.75,2.55 Z" fill="#1565c0"/><circle cx="3.75" cy="2.45" r="0.3" fill="#1565c0"/>
      ${[-0.12, 0, 0.12].map((dx) => `<path d="M${3.75 + dx},2.17 l${dx},-0.25" stroke="#1565c0" stroke-width="0.03"/><circle cx="${3.75 + dx * 2}" cy="1.9" r="0.05" fill="#1565c0"/>`).join('')}
      <circle cx="3.84" cy="2.4" r="0.06" fill="#fff"/><circle cx="3.86" cy="2.41" r="0.03" fill="#222"/><path d="M4.02,2.48 l0.15,0.04 l-0.15,0.05 Z" fill="#f2b134"/>
      <path d="M3.6,4.7 v0.3 M3.9,4.7 v0.3" stroke="#f2b134" stroke-width="0.05" stroke-linecap="round"/>`,
  },
  {
    heading: 'Rainbow Fish',
    title: 'Swim, Little Fish',
    titleColors: ['#e5383b', '#f28c28', '#e9b200', '#4caf50', '#3a86ff', '#8e5bd3'],
    border: '#4fc3f7',
    icon: (x, y, s) => `<circle cx="${x}" cy="${y}" r="${s * 0.11}" fill="none" stroke="#81d4fa" stroke-width="0.025"/>`,
    poem: ['Swish, swish, swish, my tail goes round,', 'the brightest fish that can be found!', 'Every color, every hue,', 'from {name}’s little hand to you.'],
    paints: [['#e5383b', 'Red'], ['#f28c28', 'Orange'], ['#f7c948', 'Yellow'], ['#4caf50', 'Green'], ['#3a86ff', 'Blue'], ['#8e5bd3', 'Purple']], uses: 'one hand',
    steps: ['Paint each finger a different color, red on the thumb through blue on the pinky, and the palm purple.', 'Press the hand sideways with the fingers pointing right. The fingers are the tail and the thumb is the top fin!', 'Once dry, add a big eye, a smile and some scales.'],
    scene: `${sky('fishSea', '#9be1f9', '#3aa2dc')}<g fill="#fff" opacity=".12"><path d="M1.0,0 L1.8,0 L0.6,5 L0,5 Z"/><path d="M5.6,0 L6.3,0 L7.2,4.8 L6.5,4.8 Z"/></g>
      ${bubble(1.2, 1.0, 0.16)}${bubble(1.5, 1.6, 0.1)}${bubble(6.4, 1.0, 0.14)}${bubble(6.8, 1.6, 0.09)}
      ${sand(5.85)}<g><path d="M0.9,5.9 C0.6,5.2 0.9,4.9 1.0,4.5 M0.9,5.9 C1.2,5.3 1.5,5.2 1.6,4.8 M0.9,5.9 C0.9,5.5 0.4,5.2 0.35,4.95" fill="none" stroke="#ff8a80" stroke-width="0.14" stroke-linecap="round"/></g>
      ${seaweed(6.9, 6.3, 2.0, '#2e9d6a')}${seaweed(6.5, 6.3, 1.3, '#3fbf80')}${seaweed(2.2, 6.3, 1.0, '#3fbf80')}${starfish(5.5, 6.15, 0.85)}${shell(3.2, 6.2, 0.8)}`,
    prints: [fishPrint],
    decor: '',
    finish: `${eye(2.85, 3.15, 0.2)}${smile(2.6, 3.6, 0.15, '#3d2a5c', 0.045)}${[[3.35, 2.95], [3.6, 3.35], [3.35, 3.75], [3.85, 2.95], [3.85, 3.75]].map(([x, y]) => `<path d="M${x},${y} q0.15,0.12 0,0.24" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="0.035"/>`).join('')}${bubble(2.1, 2.7, 0.12)}${bubble(1.85, 2.3, 0.08)}`,
  },
  {
    heading: 'Crab',
    title: 'Sideways Shuffle',
    titleColors: ['#e5383b', '#f28c28', '#e5383b', '#f28c28'],
    border: '#ff8a80',
    icon: (x, y, s) => shell(x, y, s * 0.55),
    poem: ['Scuttle, scuttle, side to side,', 'a little crab is out with the tide.', 'Two snappy claws go click, click, clack,', '{name}’s crab will wave right back!'],
    paints: [['#e5383b', 'Red']], uses: 'both hands',
    steps: ['Paint both of {name}’s hands red.', 'Press them with the fingers pointing out to the sides and the thumbs up, palms touching in the middle. The thumbs are the claws!', 'Once dry, add eyes on stalks, a smile and a little pinch on each claw.'],
    scene: `${sky('crabSky', '#bfe9fb', '#e9f8ff')}${sunburst(6.4, 0.8, 0.42)}${cloud(1.2, 0.75, 0.6)}
      <path d="M0,2.1 Q1.9,1.95 3.75,2.1 T7.5,2.05 V2.9 H0 Z" fill="#4fb3e8"/><path d="M0,2.5 q0.4,-0.08 0.8,0 t0.8,0 t0.8,0 t0.8,0 t0.8,0 t0.8,0 t0.8,0 t0.8,0 t0.8,0 t0.8,0" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="0.03"/>
      ${sand(2.85)}
      <g transform="translate(6.3 5.8)"><rect x="-0.55" y="-0.5" width="1.1" height="0.55" fill="#e8c784"/><rect x="-0.35" y="-0.95" width="0.7" height="0.45" fill="#ecd093"/>${[-0.55, -0.25, 0.05, 0.35].map((x) => `<rect x="${x}" y="-0.62" width="0.18" height="0.12" fill="#ecd093"/>`).join('')}<rect x="-0.1" y="-0.25" width="0.2" height="0.3" rx="0.1" fill="#c9a35a"/><path d="M0,-0.95 V-1.35 L0.3,-1.25 L0,-1.15" fill="#e5383b" stroke="#a0703c" stroke-width="0.02"/></g>
      ${shell(1.0, 5.9, 0.9)}${starfish(2.0, 6.2, 0.75)}${shell(4.9, 6.25, 0.7, '#fbe3d8')}${footprints([[0.6, 4.6, 70], [0.9, 4.75, 75], [1.2, 4.88, 80]])}`,
    prints: crab,
    decor: '',
    finish: `${[[3.45, 2.3], [4.05, 2.3]].map(([x, y]) => `<path d="M${x},${y + 0.6} V${y + 0.15}" stroke="#c62828" stroke-width="0.06"/>${eye(x, y, 0.15)}`).join('')}${smile(3.75, 3.5, 0.25, '#7a1414', 0.05)}
      ${crabClaws.map(([x, y]) => `<path d="M${x - 0.12},${y - 0.05} L${x},${y - 0.3} L${x + 0.12},${y - 0.05}" fill="none" stroke="#fff" stroke-width="0.05" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}`,
  },
  {
    heading: 'Dinosaur',
    title: 'Stomp, Stomp, Roar!',
    titleColors: ['#3f8a2e', '#f28c28', '#3f8a2e', '#f28c28'],
    border: '#7cb342',
    icon: (x, y, s) => leaf(x - 0.2, y, -20, '#b7dca2'),
    poem: ['Long, long ago, in a land of green,', 'lived the friendliest dino you’ve ever seen.', 'With spikes on his back and a stomp on the ground,', '{name}’s dino is the best one around!'],
    paints: [['#5fb04a', 'Green'], ['#f28c28', 'Orange'], ['#f7c948', 'Yellow']], uses: 'one hand, no thumb',
    steps: ['Paint {name}’s palm green and the fingers orange and yellow. Keep the thumb clean.', 'Press the hand fingers up between the dino’s head and tail. The fingers are the spikes on its back!', 'Once dry, add spots on the body and a smile on the face.'],
    scene: `${sky('dinoSky', '#ffe6c7', '#fff8ee')}${volcano(1.3, 3.4, 1.1)}${cloud(6.2, 0.8, 0.6)}
      ${grass(5.25, '#a5d68f', '#5aa04a')}${fern(0.3, 5.5, 1.1)}${fern(7.2, 5.6, 1.1, true)}${palmTree(6.9, 5.3, 0.85)}
      <g transform="translate(1.3 6.0)"><ellipse rx="0.22" ry="0.28" fill="#fff8e6" stroke="#e8d9b5" stroke-width="0.02"/><circle cx="-0.06" cy="-0.08" r="0.04" fill="#b7dca2"/><circle cx="0.08" cy="0.06" r="0.05" fill="#b7dca2"/></g>`,
    prints: [dino],
    decor: `<path d="M4.55,4.3 C5.0,4.1 5.2,3.6 5.4,3.35 C5.55,3.15 6.05,3.15 6.15,3.45 C6.25,3.75 5.9,3.85 5.6,3.85 C5.4,4.0 5.25,4.4 4.75,4.85 Z" fill="#5fb04a"/><circle cx="5.75" cy="3.38" r="0.05" fill="#222"/><path d="M5.85,3.68 q0.15,0.05 0.25,-0.05" fill="none" stroke="#222" stroke-width="0.025" stroke-linecap="round"/>
      <path d="M2.7,4.4 C2.2,4.6 1.7,4.9 1.15,4.85 C1.6,5.05 2.3,5.0 2.75,4.9 Z" fill="#5fb04a"/>
      ${[2.95, 3.35, 3.85, 4.25].map((x) => `<rect x="${x}" y="4.95" width="0.26" height="0.45" rx="0.08" fill="#4f9a3c"/>`).join('')}`,
    finish: `${[[3.2, 4.2, 0.12], [3.7, 4.55, 0.1], [4.1, 4.15, 0.13], [3.55, 3.95, 0.08]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#3f8a2e" opacity=".55"/>`).join('')}<circle cx="5.95" cy="3.55" r="0.07" fill="#f4a3a3" opacity=".8"/>`,
  },
  {
    heading: 'Unicorn',
    title: 'Believe in Magic',
    titleColors: ['#f06292', '#9575cd', '#4fc3f7', '#ffb74d'],
    border: '#ce93d8',
    icon: (x, y, s) => star(x, y, s * 0.16, '#f8c8e0'),
    poem: ['Over the rainbow, past the stars,', 'a unicorn dances near and far.', 'With a sparkly horn and a mane so bright,', '{name}’s unicorn brings magic tonight!'],
    paints: [['#ffffff', 'White']], uses: 'one hand, no thumb',
    steps: ['Paint {name}’s palm and four fingers white. Skip the thumb.', 'Press it under the unicorn’s head with the fingers pointing down. The fingers are the legs!', 'Once dry, add little pink hooves and some sparkles.'],
    scene: `${sky('uniSky', '#d9c8f5', '#fbe7f3')}${rainbowArc(3.75, 5.2, 3.2, 0.2, 0.75)}${cloud(1.0, 4.9, 0.9)}${cloud(6.5, 4.95, 0.9)}
      ${twinkles([[0.6, 0.6], [1.6, 1.2, 0.7], [5.9, 0.7], [6.9, 1.5, 0.8], [0.5, 2.6, 0.6], [7.0, 3.0, 0.7]], '#fff', 0.06)}${sparkle(1.2, 1.9, 0.8)}${sparkle(6.3, 2.2, 0.7)}
      ${grass(5.25, '#c5e8b7', '#8fcf7c')}${flower(1.2, 5.8, 0.9, '#f8bbd0')}${flower(5.9, 6.0, 0.9, '#b39ddb')}${flower(2.4, 6.15, 0.7, '#fff59d')}`,
    prints: [hand({ x: 3.45, y: 3.2, rot: 180, s: 0.9, thumb: false, color: '#ffffff' })],
    decor: `<path d="M4.3,2.35 C4.4,1.95 4.5,1.7 4.85,1.6 C5.3,1.5 5.75,1.85 5.75,2.3 C5.75,2.55 5.6,2.7 5.4,2.7 C5.2,2.7 5.0,2.55 4.85,2.6 C4.7,2.7 4.55,2.85 4.4,2.9 Z" fill="#fff" stroke="#d9c8e6" stroke-width="0.025"/>
      <path d="M4.95,1.62 L5.15,0.95 L5.25,1.65 Z" fill="#ffd54f" stroke="#f2b134" stroke-width="0.02"/><path d="M5.02,1.45 l0.17,-0.04 M5.06,1.28 l0.14,-0.03" stroke="#f2b134" stroke-width="0.02"/>
      <path d="M4.8,1.65 l-0.1,-0.25 l0.25,0.12 Z" fill="#fff" stroke="#d9c8e6" stroke-width="0.02"/>
      <path d="M5.05,2.05 q0.1,0.08 0.2,0" fill="none" stroke="#3d2a5c" stroke-width="0.03" stroke-linecap="round"/><path d="M5.1,2.03 l-0.03,-0.07 M5.17,2.04 l0,-0.08 M5.24,2.03 l0.03,-0.07" stroke="#3d2a5c" stroke-width="0.015"/>
      <circle cx="5.3" cy="2.3" r="0.08" fill="#f8bbd0"/><circle cx="5.62" cy="2.42" r="0.025" fill="#c9b6d9"/>
      ${['#f48fb1', '#ffcc80', '#fff59d', '#a5d6a7', '#90caf9'].map((c, i) => `<path d="M${4.75 - i * 0.06},${1.7 + i * 0.16} q-0.35,0.08 -0.4,0.35" fill="none" stroke="${c}" stroke-width="0.11" stroke-linecap="round"/>`).join('')}
      ${['#f48fb1', '#fff59d', '#90caf9'].map((c, i) => `<path d="M2.45,${2.2 + i * 0.1} q-0.4,0.2 -0.35,0.75" fill="none" stroke="${c}" stroke-width="0.1" stroke-linecap="round"/>`).join('')}`,
    finish: `${[[2.75, 5.1], [3.2, 5.25], [3.75, 5.15], [4.15, 4.85]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="0.13" ry="0.07" fill="#f48fb1"/>`).join('')}${sparkle(2.7, 2.3, 0.6, '#ffd54f')}${sparkle(4.0, 3.4, 0.5, '#f48fb1')}`,
  },
  {
    heading: 'Bunny',
    title: 'Hop, Hop, Hooray',
    titleColors: ['#f06292', '#8bc34a', '#f06292', '#8bc34a'],
    border: '#f8bbd0',
    icon: (x, y, s) => carrot(x, y - 0.18, 0, s * 0.45),
    poem: ['Hop, hop, hop, through the garden I go,', 'nibbling carrots all in a row.', 'Two floppy ears and a fluffy white tail,', '{name}’s bunny hops the whole trail!'],
    paints: [['#ffffff', 'White'], ['#f7a8c0', 'Pink']], uses: 'one hand, two fingers',
    steps: ['Paint {name}’s palm and the middle two fingers white.', 'Fold the thumb, pointer and pinky down and press. The two fingers are the ears!', 'Once dry, add pink inside the ears, a face, whiskers and a little bow tie.'],
    scene: `${sky('bunSky', '#d6f0fb', '#f3fbff')}${sunburst(6.45, 0.85, 0.42)}${cloud(1.1, 0.8, 0.7)}${cloud(2.9, 1.3, 0.4)}
      ${grass(5.0, '#9bd17f', '#5aa04a')}${[1.0, 1.7, 5.9, 6.6].map((x, i) => carrot(x, 5.25 + (i % 2) * 0.15, (i % 2 ? 1 : -1) * 8, 1.1)).join('')}
      ${flower(0.5, 6.1, 0.85, '#f48fb1')}${flower(2.5, 6.2, 0.75, '#fff59d')}${flower(5.0, 6.15, 0.85, '#b39ddb')}${flower(7.0, 6.15, 0.75, '#f48fb1')}`,
    prints: [bunny],
    decor: '',
    finish: `${[tipOf(bunny, 1, 0.55), tipOf(bunny, 2, 0.55)].map(([x, y]) => `<ellipse cx="${x}" cy="${y + 0.1}" rx="0.11" ry="0.45" fill="#f8bbd0"/>`).join('')}
      ${dotEyes(3.75, 3.55, 0.32, 0.09)}<path d="M3.65,3.85 L3.85,3.85 L3.75,3.98 Z" fill="#f06292"/><path d="M3.75,3.98 v0.1 M3.75,4.08 q-0.13,0.1 -0.24,0 M3.75,4.08 q0.13,0.1 0.24,0" fill="none" stroke="#5c4a6a" stroke-width="0.03" stroke-linecap="round"/>
      <rect x="3.66" y="4.12" width="0.18" height="0.14" rx="0.02" fill="#fff" stroke="#c9b6d9" stroke-width="0.015"/>
      <path d="M3.35,3.95 h-0.45 M3.35,4.05 l-0.42,0.1 M4.15,3.95 h0.45 M4.15,4.05 l0.42,0.1" stroke="#9e8fb0" stroke-width="0.018"/><circle cx="3.25" cy="3.8" r="0.12" fill="#f8bbd0" opacity=".8"/><circle cx="4.25" cy="3.8" r="0.12" fill="#f8bbd0" opacity=".8"/>
      <path d="M3.75,4.85 L3.4,4.65 L3.4,5.05 Z M3.75,4.85 L4.1,4.65 L4.1,5.05 Z" fill="#3a86ff"/><circle cx="3.75" cy="4.85" r="0.07" fill="#2a64c0"/>`,
  },
  {
    heading: 'Sea Turtle',
    title: 'Slow and Steady',
    titleColors: ['#2e7d32', '#26a69a', '#2e7d32', '#26a69a'],
    border: '#80cbc4',
    icon: (x, y, s) => shell(x, y, s * 0.55, '#b2dfdb'),
    poem: ['Slow and steady, off I go,', 'down to the ocean, nice and slow.', 'My shell is green, my heart is true,', 'a turtle hug from {name} to you!'],
    paints: [['#4caf50', 'Green']], uses: 'one hand',
    steps: ['Paint {name}’s whole hand green.', 'Press it on the sand with the fingers spread. The middle finger is the head and the others are flippers!', 'Once dry, draw a shell pattern on the palm and give the turtle a happy face.'],
    scene: `${panelBg('#f4dca6')}<path d="M0.3,0 H7.2 A0.3,0.3 0 0 1 7.5,0.3 V1.15 Q5.6,1.35 3.75,1.15 T0,1.2 V0.3 A0.3,0.3 0 0 1 0.3,0 Z" fill="#4fb3e8"/>
      <path d="M0,1.2 Q1.9,1.4 3.75,1.15 T7.5,1.15" fill="none" stroke="#fff" stroke-width="0.09" stroke-linecap="round" opacity=".85"/>
      ${footprints([[3.35, 6.3, 0], [4.15, 6.15, 0], [3.4, 5.9, 0], [4.1, 5.75, 0]])}
      ${shell(0.8, 2.4, 1.0)}${starfish(6.7, 2.2, 0.95)}${shell(6.4, 5.7, 0.85, '#fbe3d8')}${starfish(1.0, 5.6, 0.8, '#ffb74d')}
      <g fill="#e8c784">${[[1.8, 3.6], [5.9, 4.0], [2.2, 4.8], [5.5, 3.0], [1.2, 1.9]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="0.04"/>`).join('')}</g>`,
    prints: [turtle],
    decor: '',
    finish: `<g fill="none" stroke="#2e7d32" stroke-width="0.05"><path d="M3.75,3.35 l0.35,0.2 v0.4 l-0.35,0.2 l-0.35,-0.2 v-0.4 Z"/><path d="M3.75,3.35 V2.95 M4.1,3.55 l0.4,-0.2 M4.1,3.95 l0.4,0.2 M3.75,4.15 v0.4 M3.4,3.95 l-0.4,0.2 M3.4,3.55 l-0.4,-0.2"/></g>
      ${dotEyes(turtleHead[0], turtleHead[1] - 0.05, 0.1, 0.045)}${smile(turtleHead[0], turtleHead[1] + 0.08, 0.08, '#1b5e20', 0.03)}`,
  },
  {
    heading: 'Hedgehog',
    title: 'Prickly and Sweet',
    titleColors: ['#8b5a2b', '#e76f1c', '#8b5a2b', '#e76f1c'],
    border: '#d7a86e',
    icon: (x, y, s) => maple(x, y, s * 0.4, 20, '#f3c69a'),
    poem: ['Snuffle, snuffle, through the leaves,', 'a hedgehog hides beneath the trees.', 'Prickly spikes and a button nose,', '{name}’s hedgehog curls up in a doze.'],
    paints: [['#8b5a2b', 'Brown']], uses: 'one hand, no thumb',
    steps: ['Paint {name}’s palm and four fingers brown. Skip the thumb.', 'Press it behind the hedgehog’s face with the fingers pointing up and back. They’re the spikes!', 'Once dry, add some red apples or leaves on the spikes.'],
    scene: `${panelBg('#fdf2e0')}${[[0.7, 0.8, 0.7, 20, '#e76f1c'], [6.8, 0.9, 0.6, -30, '#d62828'], [1.6, 1.6, 0.5, -10, '#f2b134'], [6.0, 1.9, 0.5, 40, '#e76f1c'], [0.6, 3.2, 0.5, 50, '#7cb342']].map(([x, y, s, r, c]) => maple(x, y, s, r, c)).join('')}
      ${grass(5.25, '#c9a87a')}${mushroom(6.3, 5.4, 1.4)}${mushroom(6.85, 5.5, 1.0, '#f28c28')}${maple(1.2, 5.6, 0.6, 30, '#d62828')}${maple(2.1, 5.85, 0.5, -20, '#f2b134')}${maple(5.2, 5.9, 0.55, 60, '#e76f1c')}`,
    prints: [hedgehog],
    decor: `<path d="M2.95,4.05 C2.6,4.05 2.15,4.4 1.85,4.7 C2.1,4.85 2.5,5.0 3.0,4.95 Z" fill="#f2d4a7"/><circle cx="1.85" cy="4.7" r="0.08" fill="#3a2a1e"/><circle cx="2.45" cy="4.45" r="0.05" fill="#3a2a1e"/><circle cx="2.35" cy="4.68" r="0.08" fill="#f4a3a3" opacity=".7"/>
      <path d="M2.7,4.95 v0.3 M3.4,4.95 v0.3 M4.0,4.85 v0.35" stroke="#a0703c" stroke-width="0.09" stroke-linecap="round"/>`,
    finish: `${[tipOf(hedgehog, 0, 0.35), tipOf(hedgehog, 2, 0.45)].map(([x, y]) => `<g transform="translate(${x} ${y + 0.05}) scale(0.9)">${apple(0, 0, 1)}</g>`).join('')}${maple(...tipOf(hedgehog, 1, 0.5), 0.45, 15, '#f2b134')}`,
  },
  {
    heading: 'Bumblebee',
    title: 'Bee Happy',
    titleColors: ['#e9b200', '#3d2a1e', '#e9b200', '#3d2a1e'],
    border: '#ffd23f',
    icon: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s * 0.35})"><path d="M0,-0.3 L0.26,-0.15 V0.15 L0,0.3 L-0.26,0.15 V-0.15 Z" fill="#ffe082"/></g>`,
    poem: ['Buzz, buzz, buzz, from flower to flower,', 'a busy bee works hour after hour.', 'With wings that flutter and stripes so bright,', '{name}’s bumblebee is a happy sight!'],
    paints: [['#bfe6fb', 'Light blue'], ['#ffffff', 'White']], uses: 'both hands, no thumbs',
    steps: ['Paint both of {name}’s hands light blue (or white), leaving the thumbs clean.', 'Press them on top of the bee, fingers tilted up and out. Those are the wings!', 'Once dry, add a dotted flight path and a few more flowers.'],
    scene: `${panelBg('#fffbe8')}
      <g transform="translate(6.3 1.3)"><path d="M0,-0.85 C0.15,-0.85 0.3,-0.8 0.3,-0.7" stroke="#8b5a2b" stroke-width="0.05" fill="none"/>${[0, 1, 2, 3].map((i) => `<ellipse cx="0" cy="${-0.45 + i * 0.32}" rx="${0.45 + (i === 1 || i === 2 ? 0.12 : 0)}" ry="0.2" fill="${i % 2 ? '#f7b733' : '#ffcf4d'}"/>`).join('')}<ellipse cx="0" cy="0.35" rx="0.12" ry="0.15" fill="#5c3b1e"/><path d="M-0.3,0.65 q0.05,0.25 0.1,0 q0.05,0.3 0.12,0" fill="#f7b733"/></g>
      ${grass(5.25, '#a5d68f', '#6fb35a')}${[[0.7, 4.7, 5.9, '#f48fb1', 1.4], [1.7, 5.0, 6.0, '#ffd23f', 1.1], [5.6, 4.9, 6.0, '#b39ddb', 1.2], [6.6, 4.6, 5.9, '#f48fb1', 1.4]].map(([x, y, y1, c, s]) => `${stalk(x, y, y1)}${flower(x, y, s, c)}`).join('')}
      <path d="M0.6,2.5 C1.2,1.8 2.0,3.0 2.4,2.2" fill="none" stroke="#c9b37a" stroke-width="0.03" stroke-dasharray="0.06 0.08"/>
      <ellipse cx="3.75" cy="3.6" rx="1.05" ry="0.75" fill="#ffd23f"/><path d="M3.35,2.9 Q3.2,3.6 3.35,4.3 L3.65,4.35 Q3.5,3.6 3.65,2.85 Z M3.95,2.85 Q4.1,3.6 3.95,4.35 L4.25,4.3 Q4.4,3.6 4.25,2.9 Z" fill="#3d2a1e"/>
      <path d="M4.8,3.6 L5.1,3.6 L4.78,3.72 Z" fill="#3d2a1e"/><circle cx="2.65" cy="3.5" r="0.5" fill="#3d2a1e"/>
      ${dotEyes(2.6, 3.4, 0.17, 0.08, '#fff')}<circle cx="2.63" cy="3.42" r="0.035" fill="#3d2a1e"/><circle cx="2.8" cy="3.42" r="0.035" fill="#3d2a1e"/>${smile(2.62, 3.62, 0.15, '#fff', 0.035)}
      <path d="M2.45,3.05 C2.35,2.7 2.15,2.6 2.0,2.65 M2.8,3.05 C2.85,2.7 3.05,2.6 3.2,2.62" fill="none" stroke="#3d2a1e" stroke-width="0.04" stroke-linecap="round"/><circle cx="2.0" cy="2.65" r="0.06" fill="#3d2a1e"/><circle cx="3.2" cy="2.62" r="0.06" fill="#3d2a1e"/>`,
    prints: bee,
    decor: '',
    finish: `<path d="M4.0,1.0 C4.8,0.6 5.2,1.4 5.8,1.1" fill="none" stroke="#c9b37a" stroke-width="0.03" stroke-dasharray="0.06 0.08"/>${heart(4.9, 4.6, 0.4, '#f48fb1')}${sparkle(2.6, 1.3, 0.6, '#ffd23f')}`,
  },
  {
    heading: 'Jellyfish',
    title: 'Glow and Go',
    titleColors: ['#f06292', '#8e5bd3', '#26c6da', '#f06292'],
    border: '#ce93d8',
    icon: (x, y, s) => `<circle cx="${x}" cy="${y}" r="${s * 0.1}" fill="#e1bee7"/>`,
    guide: '#b9c8e6',
    poem: ['Glowing softly, drifting slow,', 'jellyfish dance in the deep below.', 'Pink and purple, blue and bright,', '{name}’s jellies light up the night!'],
    paints: [['#f06292', 'Pink'], ['#ce93d8', 'Lilac'], ['#80deea', 'Aqua'], ['#b39ddb', 'Purple']], uses: 'one hand, twice',
    steps: ['Paint {name}’s palm pink and the fingers lilac, pink, purple and aqua. Keep the thumb clean.', 'Press it fingers down for the big jellyfish. Repaint in aqua and press the little one.', 'Once dry, add sleepy smiles and draw wavy lines under the tentacles.'],
    scene: `${sky('jelSea', '#26407a', '#0f1c40')}<g fill="#fff" opacity=".07"><path d="M1.0,0 L1.8,0 L0.8,6.6 L0,6.6 Z"/><path d="M4.4,0 L5.0,0 L5.6,6.6 L4.8,6.6 Z"/></g>
      ${twinkles([[0.5, 0.7], [1.6, 1.5, 0.7], [6.8, 0.8], [6.2, 1.9, 0.6], [0.7, 4.2, 0.6], [7.0, 5.0, 0.7], [2.2, 5.6, 0.6], [4.6, 6.1, 0.5]], '#b3e5fc', 0.05)}
      ${bubble(6.5, 2.6, 0.12)}${bubble(6.8, 2.2, 0.08)}${bubble(1.2, 2.6, 0.1)}
      <path d="M0,6.2 Q1.8,5.95 3.75,6.15 T7.5,6.1 V6.3 A0.3,0.3 0 0 1 7.2,6.6 H0.3 A0.3,0.3 0 0 1 0,6.3 Z" fill="#1a2a50"/>
      ${seaweed(0.4, 6.4, 1.6, '#2e7d6a')}${seaweed(7.1, 6.4, 1.8, '#2e7d6a')}`,
    prints: jelly,
    decor: '',
    finish: `${dotEyes(3.0, 1.6, 0.22, 0.07, '#5c2a4a')}${smile(3.0, 1.78, 0.15, '#5c2a4a', 0.04)}<circle cx="2.65" cy="1.8" r="0.09" fill="#fff" opacity=".5"/><circle cx="3.35" cy="1.8" r="0.09" fill="#fff" opacity=".5"/>
      ${dotEyes(5.55, 2.85, 0.14, 0.05, '#1a4a5a')}${smile(5.55, 2.97, 0.09, '#1a4a5a', 0.03)}
      ${[2.3, 2.75, 3.25, 3.7].map((x) => `<path d="M${x},4.6 q0.1,0.2 0,0.4 t0,0.4" fill="none" stroke="#f8bbd0" stroke-width="0.035" stroke-linecap="round"/>`).join('')}
      ${[5.15, 5.45, 5.75, 6.0].map((x) => `<path d="M${x},4.6 q0.07,0.15 0,0.3 t0,0.3" fill="none" stroke="#b2ebf2" stroke-width="0.03" stroke-linecap="round"/>`).join('')}${sparkle(4.4, 1.2, 0.6, '#fff')}`,
  },
];

module.exports = {
  id: 'zoo',
  name: 'Handprint Zoo',
  gridTitle: 'Handprint Zoo Book',
  book: true,
  kicker: 'My Handprint Zoo',
  month: 'all year',
  paintList: 'orange, brown, gray, green, red, blue, purple, pink, yellow and white',
  colors: { primary: '#e76f1c', accent: '#26a69a', ink: '#2b2540', paper: '#fffaf0', soft: '#fff1dc' },
  crafts: animals,
  coverArt: (ctx) => coverRing(['#f08a24', '#9aa5b1', '#1e88e5', '#8e5bd3', '#e5383b', '#5fb04a', '#f48fb1', '#ffd23f', '#4caf50', '#8b5a2b', '#80deea', '#f06292'], ctx, '#f6a33a', '#a5d6a7', '#e76f1c'),
  cover: { top: 'My Handprint', title: 'Zoo Book', sub: '12 animals made from little hands', colors: ['#e76f1c', '#26a69a', '#e9b200', '#8e5bd3'], subColor: '#26a69a', border: '#f6a33a' },
  grown: false,
  guide: {
    lead: 'Twelve animals to make from {name}’s handprints, from a roaring lion to a glowing jellyfish. Make one on a rainy afternoon, or a new animal every week.',
    pages: 'animal pages',
    note: 'Write the age and date on each page. Hang your favorites on the fridge, or punch holes and tie the pages with ribbon to make a real zoo book.',
  },
  etsySection: 24,
  shopBlurb: 'Twelve handprint animals: a lion, an elephant, a peacock, a crab, a dinosaur, a unicorn and more.',
  checkoutLine: '12 handprint animal pages, a cover and how-to sheets',
  cards: [],
};
