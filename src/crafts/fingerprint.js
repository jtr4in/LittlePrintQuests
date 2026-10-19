// Fingerprint Friends: a frameable page of fingerprint art on every page, plus a cover. Pages work
// like the Memory Handprint Book's months (memory.js), with the picture as the big heading.

const {
  W, H, f, eye, dotEyes, smile, star, twinkles, snow, leaf, panelBg, sky, cloud, heart, flower, grass, sunburst,
  apple, bubble, sparkle, moon, finger, painted,
} = require('./scenery');

const print = (x, y, color, s = 1.25, rot = 0) => ({ ...finger(x, y, color, s), rot });
const bigLeaf = (x, y, s, rot, c = '#7cc35a', vein = '#5aa04a') => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0,0 C0.6,-0.7 1.8,-0.7 2.4,0 C1.8,0.7 0.6,0.7 0,0 Z" fill="${c}"/><path d="M0.1,0 H2.2 M0.7,0 l0.3,-0.25 M0.7,0 l0.3,0.25 M1.3,0 l0.3,-0.25 M1.3,0 l0.3,0.25" stroke="${vein}" stroke-width="0.04" fill="none" stroke-linecap="round"/></g>`;

// Little faces drawn on dry prints.
const bugFace = ([x, y], s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="-0.27" r="0.13" fill="#222"/><path d="M0,-0.18 V0.3" stroke="#222" stroke-width="0.025"/>${[[-0.1, -0.05], [0.1, -0.02], [-0.11, 0.14], [0.1, 0.17]].map(([dx, dy]) => `<circle cx="${dx}" cy="${dy}" r="0.04" fill="#222"/>`).join('')}<path d="M-0.05,-0.38 q-0.06,-0.12 -0.14,-0.12 M0.05,-0.38 q0.06,-0.12 0.14,-0.12" fill="none" stroke="#222" stroke-width="0.02"/><circle cx="-0.04" cy="-0.29" r="0.02" fill="#fff"/><circle cx="0.04" cy="-0.29" r="0.02" fill="#fff"/></g>`;

const ladybugs = [[1.6, 2.2, -20], [2.6, 3.1, 15], [4.4, 2.3, -10], [5.6, 3.3, 25], [3.4, 4.5, -30], [5.2, 4.9, 10]];
const caterpillar = Array.from({ length: 8 }, (_, i) => [f(1.05 + i * 0.66), f(3.55 - 0.3 * Math.sin(i * 0.9)), ['#7cb342', '#9ccc65'][i % 2]]);
const balloons = [[1.5, 1.6, '#e5383b'], [2.5, 1.1, '#f7c948'], [3.4, 1.7, '#3a86ff'], [4.3, 1.05, '#4caf50'], [5.2, 1.65, '#f06292'], [6.1, 1.15, '#8e5bd3'], [2.0, 2.45, '#f28c28'], [5.6, 2.5, '#26c6da']];
const sheepSpots = [[1.5, 4.0], [3.75, 3.4], [5.95, 4.1]];
const sheepWool = sheepSpots.flatMap(([x, y]) => [[-0.28, -0.12], [0, -0.22], [0.28, -0.12], [-0.16, 0.12], [0.16, 0.12]].map(([dx, dy]) => print(f(x + dx), f(y + dy), '#ffffff', 1.1)));
const fishes = [[2.85, 2.9, '#f28c28'], [4.55, 2.6, '#f7c948'], [3.4, 3.9, '#e5383b'], [4.75, 4.1, '#f06292'], [2.9, 4.95, '#f7c948']];
const blooms = [[1.5, 2.6, '#f06292'], [3.75, 2.0, '#8e5bd3'], [6.0, 2.6, '#f28c28']];
const petals = blooms.flatMap(([x, y, c]) => [0, 72, 144, 216, 288].map((a) => print(f(x + 0.42 * Math.sin((a * Math.PI) / 180)), f(y - 0.42 * Math.cos((a * Math.PI) / 180)), c, 1.15, a)));
const penguins = [[1.5, 3.55], [3.0, 3.75], [4.5, 3.55], [6.0, 3.75]];
const snowmen = [[1.65, 4.3], [3.75, 4.1], [5.85, 4.3]];
const hearts = [[2.0, 1.4, '#e23a4f'], [3.3, 0.95, '#f27aa0'], [4.6, 1.1, '#e23a4f'], [5.7, 1.7, '#f27aa0'], [1.4, 2.6, '#f27aa0'], [2.8, 2.2, '#e23a4f'], [4.3, 2.3, '#f27aa0'], [6.2, 2.9, '#e23a4f'], [5.2, 2.75, '#e23a4f']];
const owls = [[2.0, 3.25, '#c47a3a'], [3.75, 3.05, '#a0703c'], [5.5, 3.25, '#d08b4a']];
const flies = [[3.2, 3.2], [4.2, 3.0], [3.6, 3.9], [4.4, 4.2], [3.1, 4.6], [3.9, 4.95], [1.6, 1.4], [5.8, 1.1], [6.4, 2.3]];
const scoops = [[1.75, 2.95, '#f8bbd0'], [1.75, 2.35, '#8d6e63'], [3.75, 2.55, '#a5d6a7'], [3.75, 1.95, '#fff59d'], [3.75, 1.35, '#f48fb1'], [5.75, 2.95, '#ffcc80'], [5.75, 2.35, '#b39ddb']];

const pages = [
  {
    heading: 'Ladybugs',
    title: 'Lucky Little Bugs',
    titleColors: ['#e5383b', '#3d2a1e', '#e5383b', '#3d2a1e'],
    border: '#ff8a80',
    icon: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s * 0.45})"><ellipse rx="0.2" ry="0.25" fill="#ffb3ad"/><circle cy="-0.22" r="0.1" fill="#f3c6c2"/></g>`,
    poem: ['Little ladybugs, red and round,', 'crawling on leaves without a sound.', 'Count their spots, one, two, three,', '{name}’s ladybugs, as cute as can be!'],
    paints: [['#e5383b', 'Red']], uses: 'one fingertip, six times',
    steps: ['Dip {name}’s fingertip in red paint.', 'Press a ladybug on each dotted spot on the leaves.', 'Once dry, add a black head, a line down the middle, spots and antennae.'],
    scene: `${sky('ladySky', '#e3f4fb', '#f6fbff')}${sunburst(6.6, 0.75, 0.38)}
      ${bigLeaf(0.3, 2.6, 1.2, -15)}${bigLeaf(3.5, 2.8, 1.25, 20, '#8bcf6a')}${bigLeaf(1.6, 4.7, 1.4, -12, '#6fb35a', '#4f9a3c')}
      ${grass(5.75, '#9bd17f', '#5aa04a')}${flower(6.7, 5.9, 0.9, '#f48fb1')}${flower(0.6, 6.1, 0.8, '#fff59d')}`,
    prints: ladybugs.map(([x, y, r]) => print(x, y, '#e5383b', 1.3, r)),
    decor: '',
    finish: ladybugs.map(([x, y, r]) => `<g transform="rotate(${r} ${x} ${y})">${bugFace([x, y], 1.3)}</g>`).join(''),
  },
  {
    heading: 'Caterpillar',
    title: 'Munch, Munch, Munch',
    titleColors: ['#7cb342', '#e5383b', '#7cb342', '#f7c948'],
    border: '#aed581',
    icon: (x, y, s) => apple(x, y, s * 0.4, '#f4a3a3'),
    poem: ['A hungry caterpillar, long and green,', 'the wiggliest bug you’ve ever seen!', 'One day soon she’ll fly up high,', 'with {name}, a butterfly!'],
    paints: [['#7cb342', 'Green'], ['#9ccc65', 'Light green']], uses: 'fingertips, eight times',
    steps: ['Dip {name}’s fingertip in green and press the first spot on the left.', 'Keep going along the row, switching between green and light green.', 'Once dry, give the last one a face and antennae, and add tiny legs under the body.'],
    scene: `${panelBg('#fffbea')}${cloud(1.0, 0.8, 0.6, '#e8f4fb')}${cloud(6.2, 1.0, 0.55, '#e8f4fb')}
      <path d="M0,4.25 C1.5,4.0 3.5,4.5 5.0,4.15 S6.8,4.0 7.5,4.2" fill="none" stroke="#8b5a2b" stroke-width="0.16" stroke-linecap="round"/>
      ${bigLeaf(5.4, 4.2, 0.6, 30)}${bigLeaf(1.0, 4.2, 0.55, 150)}
      <g transform="translate(6.3 2.2)">${apple(0, 0, 1.8)}<path d="M0.42,-0.15 a0.16,0.2 0 0 0 0,0.4 a0.16,0.2 0 0 0 0.2,-0.2 Z" fill="#fffbea"/></g>
      ${grass(5.6, '#c5e1a5', '#8bc34a')}${flower(1.2, 6.0, 0.9, '#f48fb1')}${flower(3.0, 6.15, 0.8, '#b39ddb')}${flower(5.4, 6.0, 0.9, '#fff59d')}`,
    prints: caterpillar.map(([x, y, c]) => print(x, y, c, 1.25, 90)),
    decor: '',
    finish: (() => {
      const [hx, hy] = caterpillar[caterpillar.length - 1];
      return `${caterpillar.slice(0, -1).map(([x, y]) => `<path d="M${x - 0.08},${y + 0.22} v0.12 M${x + 0.08},${y + 0.22} v0.12" stroke="#3f6b22" stroke-width="0.035" stroke-linecap="round"/>`).join('')}${dotEyes(hx + 0.04, hy - 0.06, 0.09, 0.04)}${smile(hx + 0.05, hy + 0.08, 0.08, '#222', 0.025)}<path d="M${hx - 0.05},${hy - 0.22} q-0.05,-0.25 -0.2,-0.3 M${hx + 0.1},${hy - 0.22} q0.05,-0.25 0.2,-0.3" fill="none" stroke="#3f6b22" stroke-width="0.03"/><circle cx="${hx - 0.25}" cy="${hy - 0.52}" r="0.045" fill="#e5383b"/><circle cx="${hx + 0.3}" cy="${hy - 0.52}" r="0.045" fill="#e5383b"/>`;
    })(),
  },
  {
    heading: 'Balloons',
    title: 'Up, Up and Away',
    titleColors: ['#e5383b', '#3a86ff', '#f7c948', '#4caf50', '#f06292', '#8e5bd3'],
    border: '#90caf9',
    icon: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s * 0.4})"><ellipse rx="0.22" ry="0.28" fill="#f8bbd0"/><path d="M0,0.28 q0.05,0.15 0,0.3" stroke="#f8bbd0" stroke-width="0.04" fill="none"/></g>`,
    poem: ['Red and yellow, green and blue,', 'balloons are floating up to you!', 'Hold on tight and don’t let go,', '{name}’s balloons put on a show!'],
    paints: [['#e5383b', 'Red'], ['#f7c948', 'Yellow'], ['#3a86ff', 'Blue'], ['#4caf50', 'Green'], ['#f06292', 'Pink'], ['#8e5bd3', 'Purple']], uses: 'fingertips, eight times',
    steps: ['Dip {name}’s fingertip in one color and press a balloon at the top of a string.', 'Wipe the finger and use a new color for each balloon.', 'Once dry, add a little white shine to each balloon.'],
    scene: (ctx) => `${sky('balSky', '#cdeefd', '#f2fbff')}${cloud(0.9, 3.8, 0.8)}${cloud(6.6, 3.6, 0.7)}${cloud(6.8, 0.6, 0.45)}
      ${balloons.map(([x, y]) => `<path d="M${x},${y + 0.36} C${x + 0.1},${y + 1.4} ${3.75 - 0.2},4.4 3.75,5.05" fill="none" stroke="#7d8499" stroke-width="0.02"/>`).join('')}
      ${grass(5.45, '#9bd17f', '#5aa04a')}<path d="M3.55,5.0 L3.95,5.0 L3.75,5.25 Z" fill="#e5383b"/><path d="M3.75,5.1 c-0.3,-0.25 -0.4,0.1 -0.08,0.08 M3.75,5.1 c0.3,-0.25 0.4,0.1 0.08,0.08" fill="none" stroke="#e5383b" stroke-width="0.05"/>
      <text x="3.75" y="6.15" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="0.36" fill="#3a86ff">Hooray for ${ctx.nameSvg}!</text>`,
    prints: balloons.map(([x, y, c]) => print(x, y, c, 1.45)),
    decor: '',
    finish: balloons.map(([x, y]) => `<ellipse cx="${x - 0.09}" cy="${y - 0.12}" rx="0.05" ry="0.1" fill="#fff" opacity=".75" transform="rotate(20 ${x - 0.09} ${y - 0.12})"/><path d="M${x - 0.05},${y + 0.36} L${x + 0.05},${y + 0.36} L${x},${y + 0.44} Z" fill="#7d8499"/>`).join(''),
  },
  {
    heading: 'Sheep',
    title: 'Counting Sheep',
    titleColors: ['#5c6bc0', '#7cb342', '#5c6bc0', '#7cb342'],
    border: '#aed581',
    icon: (x, y, s) => cloud(x, y, s * 0.3, '#dce8f5'),
    poem: ['One fluffy sheep, then two, then three,', 'grazing in the meadow, happy and free.', 'Soft white wool and a sleepy “baa,”', 'goodnight from {name}, ooh la la!'],
    paints: [['#ffffff', 'White']], uses: 'fingertips, fifteen times',
    steps: ['Dip {name}’s fingertip in white paint.', 'Press five prints around each sheep’s head, close together, for a fluffy coat.', 'Once dry, add a little curl of wool on top of each head with a gray marker.'],
    scene: `${sky('sheepSky', '#cdeefd', '#f2fbff')}${sunburst(6.5, 0.8, 0.4)}${cloud(1.2, 0.8, 0.65)}${cloud(3.6, 0.6, 0.45)}
      <path d="M0,3.1 Q2,2.5 4,3.0 T7.5,2.8 V6.3 A0.3,0.3 0 0 1 7.2,6.6 H0.3 A0.3,0.3 0 0 1 0,6.3 Z" fill="#a5d68f"/>
      <path d="M0,4.6 Q2.5,4.2 5,4.6 T7.5,4.5 V6.3 A0.3,0.3 0 0 1 7.2,6.6 H0.3 A0.3,0.3 0 0 1 0,6.3 Z" fill="#8bc97a"/>
      <g stroke="#a0703c" stroke-width="0.06">${[0.4, 1.6, 2.8, 4.0, 5.2, 6.4].map((x) => `<path d="M${x},5.4 V6.1"/>`).join('')}<path d="M0.3,5.6 H6.7 M0.3,5.9 H6.7"/></g>
      ${sheepSpots.map(([x, y]) => `<rect x="${x - 0.22}" y="${y + 0.2}" width="0.07" height="0.4" rx="0.03" fill="#3d3d4a"/><rect x="${x + 0.15}" y="${y + 0.2}" width="0.07" height="0.4" rx="0.03" fill="#3d3d4a"/>
        <ellipse cx="${x + 0.55}" cy="${y - 0.12}" rx="0.2" ry="0.25" fill="#3d3d4a"/><ellipse cx="${x + 0.38}" cy="${y - 0.27}" rx="0.12" ry="0.05" fill="#3d3d4a" transform="rotate(-30 ${x + 0.38} ${y - 0.27})"/>
        <circle cx="${x + 0.5}" cy="${y - 0.15}" r="0.03" fill="#fff"/><circle cx="${x + 0.62}" cy="${y - 0.15}" r="0.03" fill="#fff"/>`).join('')}
      ${flower(0.6, 3.6, 0.6, '#fff59d')}${flower(2.6, 5.0, 0.6, '#f48fb1')}${flower(6.9, 3.5, 0.6, '#b39ddb')}`,
    prints: sheepWool,
    decor: '',
    finish: sheepSpots.map(([x, y]) => `<path d="M${x + 0.45},${y - 0.36} q0.1,-0.12 0.2,0" fill="none" stroke="#9aa0b4" stroke-width="0.04" stroke-linecap="round"/>`).join('') + '<path d="M5.0,1.3 l0.15,-0.1 M5.2,1.15 l0.1,0.05" stroke="#fff" stroke-width="0.03"/>',
  },
  {
    heading: 'Fishbowl',
    title: 'Bubbles and Fins',
    titleColors: ['#f28c28', '#3a86ff', '#f28c28', '#3a86ff'],
    border: '#81d4fa',
    icon: (x, y, s) => `<circle cx="${x}" cy="${y}" r="${s * 0.11}" fill="none" stroke="#81d4fa" stroke-width="0.025"/>`,
    poem: ['Round and round the fishies go,', 'swimming fast and swimming slow.', 'Blowing bubbles, one, two, three,', '{name}’s fish are as happy as can be!'],
    paints: [['#f28c28', 'Orange'], ['#f7c948', 'Yellow'], ['#e5383b', 'Red'], ['#f06292', 'Pink']], uses: 'fingertips, five times',
    steps: ['Dip {name}’s fingertip in orange and press a fish sideways on a dotted spot in the bowl.', 'Use a new color for each fish.', 'Once dry, add a tail, a fin and an eye to every fish.'],
    scene: `${panelBg('#fff6ec')}<rect x="0" y="5.7" width="7.5" height="0.9" rx="0.3" fill="#d7b48a"/><rect x="0" y="5.7" width="7.5" height="0.12" fill="#c49a6c"/>
      <path d="M2.2,1.5 H5.3 C6.6,2.4 6.8,4.6 5.6,5.7 H1.9 C0.7,4.6 0.9,2.4 2.2,1.5 Z" fill="#bfe6fb" stroke="#90caf9" stroke-width="0.05"/>
      <path d="M1.4,2.6 H6.1 C6.45,3.6 6.3,4.9 5.6,5.7 H1.9 C1.2,4.9 1.05,3.6 1.4,2.6 Z" fill="#8fd3f5"/><rect x="2.0" y="1.38" width="3.5" height="0.18" rx="0.09" fill="#90caf9"/>
      <path d="M1.9,5.7 C2.1,5.4 2.5,5.35 2.9,5.45 C3.4,5.3 4.4,5.35 5.0,5.45 C5.3,5.4 5.5,5.5 5.6,5.7 Z" fill="#f4dca6"/><circle cx="2.4" cy="5.55" r="0.07" fill="#e5383b"/><circle cx="4.6" cy="5.58" r="0.06" fill="#3a86ff"/><circle cx="3.6" cy="5.6" r="0.06" fill="#f7c948"/>
      <path d="M5.0,5.45 C4.8,5.0 5.1,4.6 4.9,4.2 M5.15,5.45 C5.35,5.0 5.15,4.7 5.3,4.4" fill="none" stroke="#3fbf80" stroke-width="0.09" stroke-linecap="round"/>
      ${bubble(3.6, 3.15, 0.09)}${bubble(3.8, 2.85, 0.06)}${bubble(5.2, 3.3, 0.08)}${bubble(2.3, 3.6, 0.07)}<path d="M1.65,3.0 C1.55,3.6 1.6,4.2 1.85,4.7" fill="none" stroke="#fff" stroke-width="0.07" stroke-linecap="round" opacity=".6"/>
      <g transform="translate(6.6 5.3)"><rect x="-0.25" y="0" width="0.5" height="0.4" rx="0.05" fill="#e5383b"/><path d="M-0.1,0 V-0.5 M0.1,0 V-0.4" stroke="#5aa04a" stroke-width="0.06"/>${leaf(-0.1, -0.5, -60, '#5aa04a').replace('0.7,0', '0.4,0')}</g>`,
    prints: fishes.map(([x, y, c]) => print(x, y, c, 1.25, 90)),
    decor: '',
    finish: fishes.map(([x, y, c]) => `<path d="M${x + 0.3},${y} L${x + 0.55},${y - 0.17} L${x + 0.55},${y + 0.17} Z" fill="${c}"/><path d="M${x - 0.05},${y - 0.2} q0.1,-0.12 0.22,0" fill="${c}"/><circle cx="${x - 0.17}" cy="${y - 0.04}" r="0.045" fill="#222"/><circle cx="${x - 0.16}" cy="${y - 0.055}" r="0.015" fill="#fff"/>`).join(''),
  },
  {
    heading: 'Flower Garden',
    title: 'Bloom, Bloom, Bloom',
    titleColors: ['#f06292', '#8e5bd3', '#f28c28', '#4caf50'],
    border: '#f8bbd0',
    icon: (x, y, s) => flower(x, y, s * 0.7, '#f8bbd0', '#ffe082'),
    poem: ['I planted a garden, row by row,', 'and watched my fingerprint flowers grow.', 'Pink and purple, orange too,', '{name} picked these blooms for you!'],
    paints: [['#f06292', 'Pink'], ['#8e5bd3', 'Purple'], ['#f28c28', 'Orange']], uses: 'fingertips, fifteen times',
    steps: ['Dip {name}’s fingertip in pink and press five petals around the first yellow center.', 'Wipe the finger, then make a purple flower and an orange one.', 'Once dry, add a smiling face to each flower’s center if you like.'],
    scene: `${sky('gardenSky', '#e3f4fb', '#fdfcf4')}${sunburst(0.8, 0.75, 0.36)}${cloud(6.4, 0.7, 0.55)}
      ${blooms.map(([x, y]) => `<path d="M${x},${y + 0.45} C${x + 0.15},${y + 1.4} ${x - 0.1},${y + 2.2} ${x},5.5" fill="none" stroke="#5aa04a" stroke-width="0.09" stroke-linecap="round"/>${leaf(x, y + 1.6, -30, '#6fb35a')}${leaf(x, y + 2.2, 200, '#6fb35a')}`).join('')}
      ${grass(5.35, '#9bd17f', '#5aa04a')}${blooms.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="0.23" fill="#ffd23f"/>`).join('')}
      <g transform="translate(5.0 4.5)"><ellipse cx="-0.12" cy="-0.1" rx="0.16" ry="0.1" fill="#fff" opacity=".9"/><ellipse cx="0.12" cy="-0.1" rx="0.16" ry="0.1" fill="#fff" opacity=".9"/><ellipse rx="0.17" ry="0.11" fill="#ffd23f"/><path d="M-0.05,-0.1 V0.1 M0.05,-0.1 V0.1" stroke="#222" stroke-width="0.04"/></g>
      <g transform="translate(2.6 5.95)"><path d="M-0.4,0.2 L-0.3,-0.2 H0.3 L0.4,0.2 Z" fill="#d9774b"/><path d="M-0.15,-0.2 L-0.25,-0.5 M0.05,-0.2 L0.1,-0.55" stroke="#8b8b8b" stroke-width="0.05"/></g>`,
    prints: petals,
    decor: '',
    finish: blooms.map(([x, y]) => `${dotEyes(x, y - 0.03, 0.07, 0.03)}${smile(x, y + 0.06, 0.07, '#222', 0.022)}`).join(''),
  },
  {
    heading: 'Penguins',
    title: 'Waddle, Waddle',
    titleColors: ['#2b3a55', '#3a86ff', '#2b3a55', '#f28c28'],
    border: '#90caf9',
    icon: (x, y, s) => snow([[x, y, s * 1.6]]).replace(/#fff/g, '#9ec9ea'),
    poem: ['Waddle, waddle, slip and slide,', 'four little penguins side by side.', 'Black and white from head to toes,', 'they love {name}, everybody knows!'],
    paints: [['#2b2b2b', 'Black']], uses: 'one fingertip, four times',
    steps: ['Dip {name}’s thumb or finger in black paint (a thumb makes a chubbier penguin!).', 'Press a penguin on each dotted spot on the ice.', 'Once dry, paint a white tummy and add eyes, an orange beak and orange feet.'],
    scene: `${sky('pengSky', '#cfe8f9', '#f4faff')}${snow([[0.6, 0.6], [1.6, 1.4, 0.8], [6.8, 0.8], [6.0, 1.6, 0.7], [0.7, 2.7, 0.8], [6.9, 2.8, 0.9], [3.6, 1.0, 0.7]]).replace(/#fff/g, '#a9c9e3')}
      <path d="M5.2,2.6 L5.9,1.4 L6.6,2.6 Z" fill="#e3f1fb"/><path d="M5.9,1.4 L6.6,2.6 L6.1,2.6 Z" fill="#c7e0f2"/>
      <path d="M0,4.25 Q1.8,4.05 3.75,4.2 T7.5,4.15 V6.3 A0.3,0.3 0 0 1 7.2,6.6 H0.3 A0.3,0.3 0 0 1 0,6.3 Z" fill="#fff"/><path d="M0,4.25 Q1.8,4.05 3.75,4.2 T7.5,4.15" fill="none" stroke="#bfe0f5" stroke-width="0.06"/>
      <path d="M0.4,5.6 Q2,5.3 3.4,5.55 Q2.1,5.9 0.4,5.6 Z M4.4,5.2 Q5.6,5.0 6.9,5.3 Q5.6,5.55 4.4,5.2 Z" fill="#9fd0ef" opacity=".6"/>
      <g transform="translate(5.6 6.0)"><ellipse rx="0.3" ry="0.12" fill="#bfe0f5"/><path d="M-0.18,-0.04 Q0,-0.24 0.2,-0.05" fill="none" stroke="#7aa7c7" stroke-width="0.04"/></g>`,
    prints: penguins.map(([x, y]) => print(x, y, '#2b2b2b', 1.7)),
    decor: '',
    finish: penguins.map(([x, y]) => `<ellipse cx="${x}" cy="${y + 0.08}" rx="0.21" ry="0.3" fill="#fff"/>${dotEyes(x, y - 0.22, 0.08, 0.035, '#fff')}<circle cx="${x - 0.08}" cy="${y - 0.22}" r="0.018" fill="#222"/><circle cx="${x + 0.08}" cy="${y - 0.22}" r="0.018" fill="#222"/><path d="M${x - 0.06},${y - 0.14} L${x + 0.06},${y - 0.14} L${x},${y - 0.05} Z" fill="#f28c28"/><path d="M${x - 0.18},${y + 0.43} h0.14 M${x + 0.04},${y + 0.43} h0.14" stroke="#f28c28" stroke-width="0.06" stroke-linecap="round"/>`).join(''),
  },
  {
    heading: 'Snowmen',
    title: 'Snowy Day Friends',
    titleColors: ['#3a86ff', '#e5383b', '#3a86ff', '#e5383b'],
    border: '#90caf9',
    icon: (x, y, s) => snow([[x, y, s * 1.6]]).replace(/#fff/g, '#9ec9ea'),
    guide: '#b9c8e6',
    poem: ['Roll a snowball, one, two, three,', 'a family of snowmen just for me!', 'Carrot noses and hats so neat,', '{name}’s snowmen can’t be beat!'],
    paints: [['#ffffff', 'White']], uses: 'fingertips, six times',
    steps: ['Dip {name}’s thumb in white and press the big bottom of each snowman.', 'Use a fingertip to press a smaller head on top.', 'Once dry, add hats, scarves, carrot noses and stick arms.'],
    scene: `${sky('snowSky', '#3b6b9c', '#6f9fcc')}${snow([[0.6, 0.6], [1.5, 1.5, 0.8], [3.0, 0.7], [4.6, 1.3, 0.7], [6.7, 0.7], [6.1, 1.8, 0.8], [0.8, 3.2, 0.9], [6.9, 3.3]])}${moon(5.6, 0.9, 0.38)}
      <path d="M0,4.75 Q1.8,4.5 3.75,4.7 T7.5,4.65 V6.3 A0.3,0.3 0 0 1 7.2,6.6 H0.3 A0.3,0.3 0 0 1 0,6.3 Z" fill="#f4f8fc"/>
      <g transform="translate(0.75 4.75)"><path d="M0,0 L0.35,-0.9 L0.7,0 Z" fill="#2e7d4f"/><path d="M0.05,-0.35 L0.35,-1.2 L0.65,-0.35 Z" fill="#3a9a5f"/><path d="M0.2,-0.4 h0.3 M0.12,-0.05 h0.46" stroke="#fff" stroke-width="0.05"/></g>
      <g transform="translate(6.75 4.7)"><path d="M0,0 L0.3,-0.75 L0.6,0 Z" fill="#2e7d4f"/><path d="M0.05,-0.3 L0.3,-1.0 L0.55,-0.3 Z" fill="#3a9a5f"/><path d="M0.15,-0.33 h0.3" stroke="#fff" stroke-width="0.05"/></g>`,
    prints: snowmen.flatMap(([x, y]) => [print(x, y, '#ffffff', 1.65), print(x, f(y - 0.68), '#ffffff', 1.2)]),
    decor: '',
    finish: snowmen.map(([x, y], i) => {
      const hy = y - 0.68;
      const c = ['#e5383b', '#3a86ff', '#8e5bd3'][i];
      return `<rect x="${x - 0.17}" y="${hy - 0.52}" width="0.34" height="0.24" fill="#222"/><rect x="${x - 0.26}" y="${hy - 0.3}" width="0.52" height="0.06" fill="#222"/><rect x="${x - 0.17}" y="${hy - 0.36}" width="0.34" height="0.05" fill="${c}"/>${dotEyes(x, hy - 0.05, 0.08, 0.03)}<path d="M${x},${hy + 0.04} l0.18,0.03 l-0.18,0.04 Z" fill="#f28c28"/><path d="M${x - 0.24},${y - 0.36} Q${x},${y - 0.25} ${x + 0.24},${y - 0.36} L${x + 0.22},${y - 0.27} Q${x},${y - 0.16} ${x - 0.22},${y - 0.27} Z" fill="${c}"/><path d="M${x - 0.3},${y} l-0.35,-0.25 M${x + 0.3},${y} l0.35,-0.25" stroke="#7a4b2a" stroke-width="0.04" stroke-linecap="round"/>${[-0.08, 0.08].map((d) => `<circle cx="${x}" cy="${y + d}" r="0.03" fill="#222"/>`).join('')}`;
    }).join(''),
  },
  {
    heading: 'Love Tree',
    title: 'Love Grows Here',
    titleColors: ['#e23a4f', '#8b5a2b', '#f27aa0', '#8b5a2b'],
    border: '#f27aa0',
    icon: (x, y, s) => heart(x, y, s * 0.55, '#f7a8c0'),
    poem: ['A little tree with branches wide,', 'with hearts and love on every side.', 'Every heart is a hug from me,', 'love from {name} on this little tree!'],
    paints: [['#e23a4f', 'Red'], ['#f27aa0', 'Pink']], uses: 'fingertips, two per heart',
    steps: ['Dip {name}’s fingertip in red and press it tilted on one side of a dotted heart.', 'Press again tilted the other way so the bottoms touch. That’s a heart!', 'Fill the tree with red and pink hearts. Let a few fall to the ground.'],
    scene: `${panelBg('#fff6f8')}
      <g fill="none" stroke="#8b5a2b" stroke-linecap="round"><path d="M3.75,6.1 C3.7,5.0 3.8,4.2 3.75,3.4" stroke-width="0.4"/><path d="M3.75,3.6 C3.2,3.0 2.6,2.6 1.6,2.4 M3.75,3.5 C4.4,3.0 5.0,2.6 6.0,2.7 M3.75,3.4 C3.6,2.6 3.4,1.8 3.3,1.0 M3.75,3.3 C4.0,2.5 4.4,1.8 4.7,1.1" stroke-width="0.16"/><path d="M2.4,2.6 C2.2,2.2 2.0,1.9 1.9,1.4 M5.1,2.7 C5.4,2.3 5.6,2.0 5.6,1.6 M3.4,1.6 C3.0,1.4 2.7,1.2 2.5,0.95" stroke-width="0.08"/></g>
      ${grass(6.0, '#c5e1a5', '#8bc34a')}${heart(1.2, 5.7, 0.5, '#f7a8c0')}${heart(6.3, 5.8, 0.45, '#f27aa0')}${heart(5.6, 5.3, 0.35, '#e23a4f')}`,
    prints: hearts.flatMap(([x, y, c]) => [print(f(x - 0.12), y, c, 1.05, -32), print(f(x + 0.12), y, c, 1.05, 32)]),
    decor: '',
    finish: `${sparkle(1.0, 1.0, 0.6, '#f7a8c0')}${sparkle(6.6, 1.2, 0.5, '#f7a8c0')}${heart(2.2, 4.6, 0.35, '#f27aa0')}${heart(5.0, 4.4, 0.3, '#e23a4f')}`,
  },
  {
    heading: 'Owls',
    title: 'Owl Always Love You',
    titleColors: ['#8e5bd3', '#e76f1c', '#8e5bd3', '#e76f1c'],
    border: '#b39ddb',
    icon: (x, y, s) => star(x, y, s * 0.16, '#d7c6f2'),
    poem: ['Three little owls up in a tree,', 'they blink their eyes and look at me.', 'Hoo, hoo, hoo, they sing all night,', '{name}, sleep tight, the owls are in sight!'],
    paints: [['#c47a3a', 'Orange-brown'], ['#a0703c', 'Brown'], ['#d08b4a', 'Tan']], uses: 'thumbs, three times',
    steps: ['Paint {name}’s thumb brown and press an owl on each dotted spot on the branch.', 'Use a new shade for each owl.', 'Once dry, add big round eyes, a beak, ear tufts and little wings.'],
    scene: `${sky('owlSky', '#d9cdf3', '#f4eefc')}${moon(5.9, 1.1, 0.55, '#fff6d0')}${twinkles([[0.6, 0.6], [1.6, 1.3, 0.7], [3.4, 0.6], [4.5, 1.4, 0.6], [6.9, 2.2, 0.7], [0.7, 2.6, 0.6]], '#fff', 0.06)}
      <path d="M0,3.95 C1.5,3.8 3,4.05 4.5,3.9 S6.6,3.8 7.5,3.95" fill="none" stroke="#7a4a1e" stroke-width="0.22" stroke-linecap="round"/>
      ${leaf(0.8, 3.85, 200, '#6fb35a')}${leaf(6.7, 3.9, -20, '#6fb35a')}${leaf(4.6, 3.95, 20, '#5aa04a')}
      ${grass(5.6, '#b9a6d9')}<path d="M1.2,5.55 C1.4,5.2 1.6,5.2 1.8,5.55 M5.8,5.6 C6.0,5.3 6.2,5.3 6.4,5.6" fill="#a090c7"/>`,
    prints: owls.map(([x, y, c]) => print(x, y, c, 1.9)),
    decor: '',
    finish: owls.map(([x, y]) => `${[-0.14, 0.14].map((d) => `<circle cx="${x + d}" cy="${y - 0.12}" r="0.13" fill="#fff"/><circle cx="${x + d}" cy="${y - 0.11}" r="0.06" fill="#222"/>`).join('')}<path d="M${x - 0.05},${y + 0.02} L${x + 0.05},${y + 0.02} L${x},${y + 0.12} Z" fill="#f2b134"/><path d="M${x - 0.28},${y - 0.38} L${x - 0.2},${y - 0.55} L${x - 0.1},${y - 0.42} M${x + 0.28},${y - 0.38} L${x + 0.2},${y - 0.55} L${x + 0.1},${y - 0.42}" fill="#7a4a1e"/>${[[-0.1, 0.25], [0.1, 0.25], [0, 0.35]].map(([dx, dy]) => `<path d="M${x + dx - 0.05},${y + dy} q0.05,0.06 0.1,0" fill="none" stroke="#7a4a1e" stroke-width="0.025"/>`).join('')}<path d="M${x - 0.07},${y + 0.5} v0.08 M${x + 0.07},${y + 0.5} v0.08" stroke="#f2b134" stroke-width="0.04" stroke-linecap="round"/>`).join(''),
  },
  {
    heading: 'Fireflies',
    title: 'Glow, Little Firefly',
    titleColors: ['#e9b200', '#26407a', '#e9b200', '#26407a'],
    border: '#ffe082',
    icon: (x, y, s) => star(x, y, s * 0.16, '#fff1b3'),
    guide: '#b9c8e6',
    poem: ['Twinkle, twinkle, little light,', 'fireflies dancing in the night.', 'We caught a jar full, glowing bright,', 'to keep {name} company tonight!'],
    paints: [['#f7e35a', 'Yellow']], uses: 'fingertips, nine times',
    steps: ['Dip {name}’s fingertip in bright yellow paint.', 'Press a firefly on each dotted spot, in the jar and out in the night.', 'Once dry, add tiny wings and a little face. Glow-in-the-dark paint is extra fun!'],
    scene: `${sky('flySky', '#0f1c40', '#26407a')}${moon(1.0, 0.9, 0.42)}${twinkles([[2.5, 0.5], [3.6, 1.1, 0.7], [4.8, 0.4], [6.9, 0.6, 0.8], [0.6, 2.4, 0.6], [7.0, 3.5, 0.6]], '#fff', 0.05)}
      <path d="M0,5.4 Q1.5,5.2 3.75,5.35 T7.5,5.3 V6.3 A0.3,0.3 0 0 1 7.2,6.6 H0.3 A0.3,0.3 0 0 1 0,6.3 Z" fill="#14351f"/>
      ${[0.4, 0.8, 6.6, 7.0, 1.4, 5.9].map((x, i) => `<path d="M${x},5.4 q0.05,-0.4 0.12,-0.6 M${x + 0.1},5.4 q0.02,-0.3 -0.08,-0.5" fill="none" stroke="#2a5a3a" stroke-width="0.05" stroke-linecap="round"/>`).join('')}
      <path d="M2.55,2.5 H4.95 C5.1,3.0 5.15,4.6 4.95,5.4 H2.55 C2.35,4.6 2.4,3.0 2.55,2.5 Z" fill="#fff" fill-opacity=".14" stroke="#cfe0ff" stroke-width="0.05"/>
      <rect x="2.45" y="2.15" width="2.6" height="0.38" rx="0.06" fill="#a0703c"/><path d="M2.6,2.2 h2.3" stroke="#7a4a1e" stroke-width="0.03"/>
      <path d="M2.7,3.0 C2.65,3.7 2.65,4.4 2.75,5.0" fill="none" stroke="#fff" stroke-width="0.06" stroke-linecap="round" opacity=".4"/>
      <text x="3.75" y="6.15" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="0.3" fill="#ffe082" opacity=".9">sweet dreams</text>`,
    prints: flies.map(([x, y]) => print(x, y, '#f7e35a', 1.0, 0)),
    decor: '',
    finish: flies.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="0.4" fill="#fff59d" opacity=".18"/><ellipse cx="${x - 0.12}" cy="${y - 0.2}" rx="0.12" ry="0.07" fill="#fff" opacity=".7" transform="rotate(-30 ${x - 0.12} ${y - 0.2})"/><ellipse cx="${x + 0.12}" cy="${y - 0.2}" rx="0.12" ry="0.07" fill="#fff" opacity=".7" transform="rotate(30 ${x + 0.12} ${y - 0.2})"/>${dotEyes(x, y - 0.04, 0.05, 0.02)}`).join(''),
  },
  {
    heading: 'Ice Cream',
    title: 'Scoops of Fun',
    titleColors: ['#f06292', '#8d6e63', '#26a69a', '#f28c28'],
    border: '#f8bbd0',
    icon: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s * 0.4})"><path d="M-0.15,0 L0.15,0 L0,0.35 Z" fill="#f3d3a6"/><circle cy="-0.05" r="0.17" fill="#f8bbd0"/></g>`,
    poem: ['One scoop, two scoops, three scoops high,', 'an ice cream tower to the sky!', 'Strawberry, mint and chocolate too,', '{name} made a cone for you!'],
    paints: [['#f8bbd0', 'Pink'], ['#8d6e63', 'Brown'], ['#a5d6a7', 'Mint'], ['#fff59d', 'Yellow'], ['#ffcc80', 'Peach'], ['#b39ddb', 'Lilac']], uses: 'thumbs, seven times',
    steps: ['Paint {name}’s thumb in an ice cream color and press the bottom scoop on a cone.', 'Wipe, pick a new flavor and press the next scoop on top.', 'Once dry, add sprinkles and a red cherry on top of each cone.'],
    scene: `${panelBg('#fff4f7')}<g fill="#ffe1ea">${Array.from({ length: 24 }, (_, i) => `<circle cx="${f(0.45 + (i % 6) * 1.32)}" cy="${f(0.45 + Math.floor(i / 6) * 1.3 + (i % 2) * 0.6)}" r="0.08"/>`).join('')}</g>
      <rect x="0" y="5.55" width="7.5" height="1.05" rx="0.3" fill="#ffd1dc"/><path d="M0,5.55 h7.5" stroke="#f8a5bd" stroke-width="0.05"/>${Array.from({ length: 12 }, (_, i) => `<path d="M${0.3 + i * 0.62},5.55 v1.05" stroke="#ffe1ea" stroke-width="0.25"/>`).join('')}
      ${[1.75, 3.75, 5.75].map((x) => `<path d="M${x - 0.34},3.3 L${x + 0.34},3.3 L${x},4.95 Z" fill="#f3c58a"/><path d="M${x - 0.25},3.55 L${x + 0.1},4.2 M${x - 0.05},3.35 L${x + 0.22},3.85 M${x + 0.25},3.55 L${x - 0.1},4.2 M${x + 0.05},3.35 L${x - 0.22},3.85" stroke="#d9a35f" stroke-width="0.03"/>`).join('')}`,
    prints: scoops.map(([x, y, c]) => print(x, y, c, 1.75, 90)),
    decor: '',
    finish: [[1.75, 2.0], [3.75, 1.0], [5.75, 2.0]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="0.12" fill="#e5383b"/><path d="M${x},${y - 0.12} q0.05,-0.15 0.15,-0.2" fill="none" stroke="#5aa04a" stroke-width="0.03"/><circle cx="${x - 0.04}" cy="${y - 0.04}" r="0.03" fill="#fff" opacity=".7"/>`).join('') + scoops.map(([x, y], i) => [[-0.15, -0.05, 30], [0.12, -0.12, -20], [0.05, 0.1, 70], [-0.05, -0.18, 0]].map(([dx, dy, r], j) => `<rect x="${x + dx - 0.04}" y="${y + dy - 0.012}" width="0.08" height="0.024" rx="0.012" fill="${['#e5383b', '#3a86ff', '#f7c948', '#4caf50', '#fff'][(i + j) % 5]}" transform="rotate(${r} ${x + dx} ${y + dy})"/>`).join('')).join(''),
  },
];

// The cover: a ring of fingerprint friends around "This book belongs to".
function coverArt(ctx) {
  const colors = ['#e5383b', '#7cb342', '#f7c948', '#3a86ff', '#f06292', '#8e5bd3', '#f28c28', '#26c6da', '#c47a3a', '#e23a4f', '#4caf50', '#ffcc80', '#5c6bc0', '#f48fb1'];
  const ring = colors.map((c, i) => {
    const a = ((i * 360) / colors.length) * (Math.PI / 180);
    const x = f(3.75 + 2.45 * Math.cos(a));
    const y = f(3.45 + 2.35 * Math.sin(a));
    return painted(print(x, y, c, 1.6, 0)) + `${dotEyes(x, y - 0.08, 0.09, 0.035)}${smile(x, y + 0.06, 0.09, '#222', 0.025)}`;
  }).join('');
  return `<svg viewBox="0 0 7.5 6.6">${ring}
    <circle cx="3.75" cy="3.45" r="1.7" fill="#fff" stroke="#f7c948" stroke-width="0.06"/>
    <circle cx="3.75" cy="3.45" r="1.55" fill="none" stroke="#9bd0f2" stroke-width="0.03" stroke-dasharray="0.08 0.08"/>
    <text x="3.75" y="3.15" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="0.3" fill="#7a6f8f">This book belongs to</text>
    <text x="3.75" y="3.85" text-anchor="middle" font-family="Pacifico" font-size="${ctx.name.length > 8 ? 0.5 : 0.66}" fill="#3a86ff">${ctx.nameSvg}</text>
    <text x="3.75" y="4.35" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="0.32" fill="#f06292">${ctx.year}</text>
  </svg>`;
}

module.exports = {
  id: 'fingerprint',
  name: 'Fingerprint Friends',
  book: true,
  kicker: 'My Fingerprint Friends',
  month: 'all year',
  paintList: 'red, green, yellow, blue, pink, purple, orange, brown, black and white',
  colors: { primary: '#3a86ff', accent: '#f06292', ink: '#2b2540', paper: '#fffaf0', soft: '#e8f3ff' },
  crafts: pages,
  coverArt,
  cover: { top: 'My Fingerprint', title: 'Friends', sub: '12 pages of fingerprint art', colors: ['#e5383b', '#3a86ff', '#f7c948', '#4caf50', '#f06292', '#8e5bd3'], subColor: '#3a86ff', border: '#9bd0f2' },
  grown: false,
  guide: {
    lead: 'Twelve pictures to fill with {name}’s fingerprints: ladybugs, balloons, penguins, fireflies and more. Little fingers, big art, and almost no mess.',
    pages: 'fingerprint pages',
    tipsTitle: 'How to get a great fingerprint',
    tips: [
      '<b>Dab, don’t dip.</b> Brush a little paint on the fingertip, or press it on a paint-soaked paper towel.',
      '<b>Press and lift.</b> Press the fingertip on the dotted spot, then lift straight up. Thumbs make bigger prints!',
      '<b>Wipe between colors</b> with a baby wipe so the colors stay bright.',
      '<b>Let it dry</b> for about 10 minutes, then add faces and details with a fine black marker.',
      '<b>Little ones:</b> hold their finger and press together. Smudgy prints are part of the charm!',
    ],
    note: 'Write the age and date on each page. Hang your favorites on the fridge, or punch holes and tie the pages with ribbon to make a real book.',
  },
  etsySection: 25,
  shopBlurb: 'Twelve fingerprint pictures: ladybugs, balloons, sheep, penguins, snowmen, fireflies and more.',
  checkoutLine: '12 fingerprint art pages, a cover and how-to sheets',
  inside: { title: 'Print it, press a finger, keep it forever', sub: 'A light dotted spot shows where to press, or use the set with no dots.', cap: 'Finished with fingerprints' },
  cards: [],
};
