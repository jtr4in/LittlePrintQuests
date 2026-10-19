// The Memory Handprint Book: one frameable handprint page for every month of the year, plus a cover
// and a "look how I've grown" page. Coordinates are inches inside the 7.5 x 6.6 in art panel.
// Each month works like a holiday craft (see holidays.js): scene and decor print on the page, prints
// are where the hands go, and finish is what gets added once the paint is dry (examples only).
// scene, decor and finish can be functions of the page's context ({ name, year, ... }).

const { draw } = require('./holidays');
const { painted } = require('./prints');

const { eye, dotEyes, smile, star, twinkles, snow, leaf } = draw;
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

// ---------- the twelve months ----------
const months = [
  {
    month: 'January',
    title: 'Polar Bear Hug',
    titleColors: ['#2f6fb5', '#5aa9e6', '#2f6fb5', '#5aa9e6'],
    border: '#5aa9e6',
    icon: (x, y, s) => snow([[x, y, s * 1.6]]).replace(/#fff/g, '#8fc3ea'),
    poem: ['Snowflakes falling, soft and slow,', 'a polar bear plays in the snow.', 'Little paws from {name}’s hand,', 'the coziest bear in winter land!'],
    paints: [['#ffffff', 'White']], uses: 'one hand, no thumb',
    steps: ['Paint {name}’s palm and four fingers white. Skip the thumb.', 'Press it under the bear’s head with the fingers pointing down. The fingers are the legs!', 'Once dry, add a red scarf with a marker or a strip of paper.'],
    scene: `${sky('janSky', '#16305e', '#2f5a98')}
      <path d="M0,1.5 C1.5,0.6 3,1.6 4.4,0.9 S6.6,0.7 7.5,0.4 V1.1 C6.4,1.4 5.6,1.1 4.4,1.6 S1.6,1.5 0,2.2 Z" fill="#7ee0b8" opacity=".28"/>
      <path d="M0,2.1 C1.6,1.4 3.2,2.2 4.6,1.5 S6.6,1.3 7.5,1.1 V1.5 C6.4,1.7 5.5,1.7 4.6,2.1 S1.8,2.3 0,2.6 Z" fill="#9ad7f5" opacity=".22"/>
      ${moon(6.4, 0.85, 0.5)}${twinkles([[0.5, 0.5], [1.4, 0.95, 0.7], [2.6, 0.45], [3.6, 0.8, 0.6], [4.8, 0.4, 0.8], [5.5, 1.5, 0.6], [0.8, 2.9, 0.6], [6.9, 2.6, 0.7]], '#fff')}
      ${snow([[0.7, 1.9, 0.9], [1.9, 3.3, 0.8], [6.6, 3.6, 0.9], [6.2, 2.3, 0.7], [1.2, 4.3, 0.7]])}
      <path d="M0,5.3 Q1.8,5.05 3.75,5.25 T7.5,5.2 V6.3 A0.3,0.3 0 0 1 7.2,6.6 H0.3 A0.3,0.3 0 0 1 0,6.3 Z" fill="#eaf5fd"/>
      <path d="M0,5.3 Q1.8,5.05 3.75,5.25 T7.5,5.2" fill="none" stroke="#bfe0f5" stroke-width="0.06"/>
      <g transform="translate(1.05 5.32)"><path d="M-0.75,0 A0.75,0.7 0 0 1 0.75,0 Z" fill="#fff" stroke="#bfe0f5" stroke-width="0.03"/><path d="M-0.22,0 A0.22,0.26 0 0 1 0.22,0 Z" fill="#2f5a98"/><path d="M-0.7,-0.22 H0.7 M-0.55,-0.45 H0.55 M-0.3,-0.62 H0.3 M0,0 V-0.22 M-0.4,-0.22 V-0.45 M0.4,-0.22 V-0.45 M-0.15,-0.45 V-0.62 M0.2,-0.45 V-0.62" stroke="#cfe6f7" stroke-width="0.025"/></g>
      ${snow([[5.6, 5.8, 0.6], [3, 6.1, 0.5]]).replace(/#fff/g, '#bfe0f5')}`,
    prints: [hand({ x: 3.6, y: 3.3, rot: 180, s: 0.92, thumb: false, color: '#ffffff' })],
    decor: `<g><circle cx="5.0" cy="2.15" r="0.56" fill="#fff" stroke="#c9d6e6" stroke-width="0.025"/><circle cx="4.68" cy="1.66" r="0.18" fill="#fff" stroke="#c9d6e6" stroke-width="0.025"/><circle cx="5.3" cy="1.64" r="0.18" fill="#fff" stroke="#c9d6e6" stroke-width="0.025"/><circle cx="4.68" cy="1.66" r="0.09" fill="#f6c7cf"/><circle cx="5.3" cy="1.64" r="0.09" fill="#f6c7cf"/><ellipse cx="5.32" cy="2.32" rx="0.3" ry="0.22" fill="#f2f6fb"/><ellipse cx="5.46" cy="2.24" rx="0.1" ry="0.075" fill="#222"/><circle cx="4.98" cy="2.02" r="0.06" fill="#222"/><path d="M5.25,2.42 q0.1,0.08 0.2,0" fill="none" stroke="#222" stroke-width="0.025" stroke-linecap="round"/><circle cx="2.48" cy="2.15" r="0.13" fill="#fff" stroke="#c9d6e6" stroke-width="0.025"/></g>`,
    finish: '<path d="M4.5,2.55 Q4.95,2.85 5.45,2.6 L5.5,2.82 Q4.95,3.08 4.45,2.78 Z" fill="#d6363e"/><path d="M4.55,2.72 L4.35,3.35 L4.6,3.38 L4.75,2.82 Z" fill="#c22b33"/><path d="M4.4,3.3 l0.04,0.12 M4.5,3.32 l0.03,0.12" stroke="#c22b33" stroke-width="0.03"/>',
  },
  {
    month: 'February',
    title: 'Love You to Pieces',
    titleColors: ['#e23a4f', '#f27aa0', '#e23a4f', '#f27aa0'],
    border: '#f27aa0',
    icon: (x, y, s) => heart(x, y, s * 0.55, '#f7a8c0'),
    poem: ['Two little hands, a heart so true,', 'I made this red one just for you.', 'Hold it close and keep it near,', 'love from {name}, all through the year!'],
    paints: [['#e23a4f', 'Red'], ['#f27aa0', 'Pink']], uses: 'both hands, no thumbs',
    steps: ['Paint one of {name}’s hands red and the other pink. Keep the thumbs clean.', 'Press them on the outlines with the fingers tilted out and the palms meeting at the bottom.', 'That’s your heart! Once dry, dot on white sparkles if you like.'],
    scene: `${panelBg('#fff3f6')}
      <g fill="#ffdbe6">${Array.from({ length: 16 }, (_, i) => { const a = (i * 22.5 * Math.PI) / 180; return `<circle cx="${f(3.75 + 2.55 * Math.cos(a))}" cy="${f(3.15 + 2.55 * Math.sin(a))}" r="0.5"/>`; }).join('')}<circle cx="3.75" cy="3.15" r="2.6"/></g>
      <circle cx="3.75" cy="3.15" r="2.35" fill="none" stroke="#fff" stroke-width="0.04" stroke-dasharray="0.08 0.08"/>
      ${heart(0.75, 0.75, 0.9, '#f27aa0')}${heart(6.7, 0.8, 0.7, '#e23a4f')}${heart(0.6, 4.9, 0.6, '#e23a4f')}${heart(6.85, 4.7, 0.95, '#f7a8c0')}${heart(1.2, 2.6, 0.45, '#f7a8c0')}${heart(6.4, 2.6, 0.5, '#f27aa0')}
      <g transform="translate(0.9 5.85) rotate(-10)"><rect x="-0.42" y="-0.27" width="0.84" height="0.54" rx="0.05" fill="#fff" stroke="#f27aa0" stroke-width="0.03"/><path d="M-0.42,-0.27 L0,0.06 L0.42,-0.27" fill="none" stroke="#f27aa0" stroke-width="0.03"/>${heart(0, 0.06, 0.32, '#e23a4f')}</g>
      <g transform="translate(6.6 5.85) rotate(8)"><rect x="-0.42" y="-0.27" width="0.84" height="0.54" rx="0.05" fill="#fff" stroke="#f27aa0" stroke-width="0.03"/><path d="M-0.42,-0.27 L0,0.06 L0.42,-0.27" fill="none" stroke="#f27aa0" stroke-width="0.03"/>${heart(0, 0.06, 0.32, '#e23a4f')}</g>`,
    oneShape: true,
    prints: [hand({ x: 3.0, y: 3.25, rot: -40, s: 0.86, thumb: false, flip: true, color: '#e23a4f' }), hand({ x: 4.5, y: 3.25, rot: 40, s: 0.86, thumb: false, color: '#f27aa0' })],
    decor: ribbon(3.75, 5.75, 2.9, '#e23a4f', 'I love you to pieces!'),
    finish: `${sparkle(3.0, 2.6, 0.9)}${sparkle(4.6, 2.3, 0.7)}${sparkle(3.85, 3.7, 0.6)}${sparkle(2.4, 1.8, 0.5)}`,
  },
  {
    month: 'March',
    title: 'Over the Rainbow',
    titleColors: ['#e5383b', '#f28c28', '#e9b200', '#4caf50', '#3a86ff', '#8e5bd3'],
    border: '#7ccf6b',
    icon: (x, y, s) => drop(x, y, s * 1.4, '#9bd0f2'),
    poem: ['Rain on the window, sun in the sky,', 'a rainbow is waving its colors hi!', 'Five little fingers, every hue,', 'from {name}’s hand to brighten you.'],
    paints: [['#e5383b', 'Red'], ['#f28c28', 'Orange'], ['#f7c948', 'Yellow'], ['#4caf50', 'Green'], ['#3a86ff', 'Blue'], ['#ffffff', 'White']], uses: 'one hand',
    steps: ['Paint each finger a rainbow color: red thumb, then orange, yellow, green and a blue pinky.', 'Paint the palm white and press the hand with the fingers spread and pointing up.', 'Once dry, give the cloud a happy face. Glue on cotton balls for a fluffy cloud!'],
    scene: `${sky('marSky', '#d9f0fd', '#f4fbff')}${sunburst(6.45, 0.95, 0.55)}${dotEyes(6.45, 0.9, 0.17, 0.05)}${smile(6.45, 1.05, 0.15, '#222', 0.035)}
      ${cloud(1.1, 0.9, 0.9)}${cloud(5.0, 0.55, 0.55)}${cloud(0.9, 3.0, 0.6)}
      ${[[1.0, 3.6], [1.3, 4.1], [0.7, 4.3]].map(([x, y]) => drop(x, y, 0.9)).join('')}
      ${grass(5.65, '#8fd27c', '#5aa04a')}${[[0.6, 5.85, '#f48fb1'], [1.5, 6.15, '#ffd23f'], [5.8, 5.95, '#b39ddb'], [6.8, 6.2, '#f48fb1'], [2.4, 6.25, '#fff']].map(([x, y, c]) => flower(x, y, 0.9, c)).join('')}
      ${[[6.5, 5.3], [0.4, 5.3]].map(([x, y]) => `<g transform="translate(${x} ${y})" fill="#4caf50">${[0, 120, 240].map((a) => `<circle cx="0" cy="-0.13" r="0.12" transform="rotate(${a})"/>`).join('')}<path d="M0,0.02 q0.04,0.2 0.12,0.3" stroke="#4caf50" stroke-width="0.04" fill="none"/></g>`).join('')}`,
    prints: [hand({ x: 3.85, y: 3.25, s: 1.05, color: '#ffffff', fingerColors: ['#f28c28', '#f7c948', '#4caf50', '#3a86ff', '#e5383b'] })],
    decor: '',
    finish: `<g fill="#fff" stroke="#dfeaf3" stroke-width="0.02"><circle cx="2.9" cy="4.35" r="0.48"/><circle cx="3.55" cy="4.05" r="0.62"/><circle cx="4.3" cy="4.1" r="0.6"/><circle cx="4.9" cy="4.45" r="0.45"/><rect x="2.6" y="4.35" width="2.6" height="0.55" rx="0.27"/></g>${dotEyes(3.9, 4.3, 0.25, 0.07)}${smile(3.9, 4.48, 0.18, '#222', 0.04)}<circle cx="3.45" cy="4.5" r="0.1" fill="#f7a8c0"/><circle cx="4.35" cy="4.5" r="0.1" fill="#f7a8c0"/>${[[3.2, 5.15], [3.8, 5.3], [4.5, 5.15]].map(([x, y]) => drop(x, y, 0.85)).join('')}`,
  },
  {
    month: 'April',
    title: 'Flutter By',
    titleColors: ['#8e5bd3', '#f06292', '#26a69a', '#f28c28'],
    border: '#b39ddb',
    icon: (x, y, s) => flower(x, y, s * 0.75, '#f8bbd0', '#ffe082'),
    poem: ['Flutter by, butterfly, up so high,', 'painting colors across the sky.', '{name}’s hands became the wings,', 'the prettiest of springtime things!'],
    paints: [['#f06292', 'Pink'], ['#9b6ee0', 'Purple'], ['#4fc3f7', 'Blue'], ['#26a69a', 'Teal']], uses: 'both hands, no thumbs',
    steps: ['Paint the fingers of both hands pink, purple, blue and teal, and the palms purple.', 'Press one hand pointing left and the other pointing right, palms touching in the middle.', 'Once dry, draw the body and curly antennae, then dot on white spots.'],
    scene: `${panelBg('#f3faea')}${sunburst(0.85, 0.85, 0.42, '#ffe082', '#ffd54f')}
      ${cloud(6.3, 0.75, 0.6)}${cloud(5.4, 1.2, 0.4)}
      <path d="M0.8,3.6 C1.2,2.8 0.2,2.4 0.6,1.8" fill="none" stroke="#c5b3e6" stroke-width="0.03" stroke-dasharray="0.06 0.08"/>
      ${grass(5.25, '#a5d68f', '#6fb35a')}
      ${[[0.6, 5.0, 5.9, '#f48fb1'], [1.4, 4.7, 5.9, '#ffd23f'], [2.3, 5.1, 6.0, '#b39ddb'], [5.2, 5.05, 6.0, '#4fc3f7'], [6.1, 4.65, 5.95, '#f48fb1'], [6.9, 5.0, 6.0, '#ffd23f']].map(([x, y, y1, c]) => `${stalk(x, y, y1)}${flower(x, y, 1.1, c)}`).join('')}
      <g transform="translate(6.6 3.3)"><ellipse cx="0" cy="0" rx="0.2" ry="0.16" fill="#e53935"/><path d="M0,-0.16 V0.16" stroke="#222" stroke-width="0.02"/><circle cx="-0.08" cy="-0.02" r="0.03" fill="#222"/><circle cx="0.08" cy="0.06" r="0.03" fill="#222"/><circle cx="-0.2" cy="0" r="0.07" fill="#222"/></g>`,
    prints: [hand({ x: 2.72, y: 3.0, rot: -90, s: 0.84, thumb: false, color: '#9b6ee0', fingerColors: ['#f06292', '#9b6ee0', '#4fc3f7', '#26a69a'] }), hand({ x: 4.78, y: 3.0, rot: 90, s: 0.84, thumb: false, flip: true, color: '#9b6ee0', fingerColors: ['#f06292', '#9b6ee0', '#4fc3f7', '#26a69a'] })],
    decor: '',
    finish: `<rect x="3.6" y="2.15" width="0.3" height="1.75" rx="0.15" fill="#3d2a5c"/><circle cx="3.75" cy="1.98" r="0.24" fill="#3d2a5c"/><path d="M3.66,1.8 C3.55,1.4 3.3,1.3 3.2,1.42 M3.84,1.8 C3.95,1.4 4.2,1.3 4.3,1.42" fill="none" stroke="#3d2a5c" stroke-width="0.04" stroke-linecap="round"/><circle cx="3.2" cy="1.42" r="0.06" fill="#3d2a5c"/><circle cx="4.3" cy="1.42" r="0.06" fill="#3d2a5c"/>${dotEyes(3.75, 1.95, 0.08, 0.035, '#fff')}${smile(3.75, 2.05, 0.07, '#fff', 0.025)}${[[2.2, 2.5], [1.6, 3.1], [2.5, 3.5], [5.3, 2.5], [5.9, 3.1], [5.0, 3.5], [2.0, 2.9], [5.5, 2.9]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="0.09" fill="#fff" opacity=".9"/>`).join('')}`,
  },
  {
    month: 'May',
    title: 'Blooming with Love',
    titleColors: ['#f06292', '#f59e3b', '#a46be0', '#f06292'],
    border: '#f8bbd0',
    icon: (x, y, s) => flower(x, y, s * 0.75, '#ffcc80', '#f06292'),
    poem: ['In my garden, flowers grow,', 'pink and orange, row by row.', 'These blooms will never fade away,', 'with love from {name}, this May!'],
    paints: [['#f06292', 'Pink'], ['#f59e3b', 'Orange'], ['#a46be0', 'Purple'], ['#ffd23f', 'Yellow']], uses: 'one hand, three times',
    steps: ['Paint {name}’s hand pink, leaving the thumb clean, and press it on the left flower.', 'Wipe, then do the middle flower in orange and the right one in purple.', 'Once dry, press a yellow fingerprint in the middle of each palm.'],
    scene: (ctx) => `${panelBg('#fff8ee')}
      <g fill="#ffe9d1">${Array.from({ length: 30 }, (_, i) => `<circle cx="${f(0.4 + (i % 6) * 1.34)}" cy="${f(0.4 + Math.floor(i / 6) * 1.25 + (i % 2) * 0.6)}" r="0.07"/>`).join('')}</g>
      <path d="M2.15,2.95 C2.4,3.6 2.9,4.1 3.3,4.75" fill="none" stroke="#5aa04a" stroke-width="0.09" stroke-linecap="round"/>
      <path d="M3.75,2.75 V4.75" fill="none" stroke="#5aa04a" stroke-width="0.09" stroke-linecap="round"/>
      <path d="M5.35,2.95 C5.1,3.6 4.6,4.1 4.2,4.75" fill="none" stroke="#5aa04a" stroke-width="0.09" stroke-linecap="round"/>
      ${leaf(2.65, 3.75, 200, '#6fb35a')}${leaf(3.75, 3.95, -35, '#6fb35a')}${leaf(4.85, 3.75, -20, '#6fb35a')}${leaf(3.75, 3.6, 215, '#5aa04a')}
      <g transform="translate(0.85 1.4)">${[0, 1].map((i) => `<ellipse cx="${i ? 0.17 : -0.17}" cy="-0.12" rx="0.16" ry="0.12" fill="#fff" stroke="#c9d6e6" stroke-width="0.02" opacity=".9"/>`).join('')}<ellipse cx="0" cy="0" rx="0.2" ry="0.14" fill="#ffd23f"/><path d="M-0.06,-0.13 V0.13 M0.06,-0.13 V0.13" stroke="#222" stroke-width="0.045"/><circle cx="-0.2" cy="-0.02" r="0.025" fill="#222"/></g>
      <path d="M1.15,1.45 c0.4,0.2 0.6,-0.3 1,-0.1" fill="none" stroke="#ccb" stroke-width="0.025" stroke-dasharray="0.05 0.06"/>
      ${flower(6.7, 0.8, 1.1, '#b39ddb')}${flower(0.6, 4.3, 1.0, '#f48fb1')}${flower(6.95, 4.0, 0.9, '#ffcc80', '#f06292')}`,
    prints: [hand({ x: 2.05, y: 2.0, rot: -16, s: 0.6, thumb: false, color: '#f06292' }), hand({ x: 3.75, y: 1.7, s: 0.63, thumb: false, color: '#f59e3b' }), hand({ x: 5.45, y: 2.0, rot: 16, s: 0.6, thumb: false, color: '#a46be0' })],
    decor: (ctx) => `<path d="M2.45,4.6 H5.05 L4.75,6.35 H2.75 Z" fill="#d9774b"/><rect x="2.3" y="4.45" width="2.9" height="0.45" rx="0.08" fill="#e8895c"/><text x="3.75" y="5.6" text-anchor="middle" font-family="Pacifico" font-size="${ctx.name.length > 8 ? 0.28 : 0.36}" fill="#fff">${ctx.nameSvg}</text>${heart(3.75, 6.0, 0.4, '#fff')}`,
    finish: `${[[2.05, 2.35], [3.75, 2.05], [5.45, 2.35]].map(([x, y]) => painted(finger(x, y, '#ffd23f', 1.4))).join('')}${[[1.4, 0.9, '#f06292'], [6.1, 1.6, '#a46be0']].map(([x, y, c]) => heart(x, y, 0.4, c)).join('')}`,
  },
  {
    month: 'June',
    title: 'Hello, Sunshine',
    titleColors: ['#f59e0b', '#ef6c00', '#f59e0b', '#ef6c00'],
    border: '#ffd23f',
    icon: (x, y, s) => sunburst(x, y, s * 0.13, '#ffe082', '#ffe082'),
    poem: ['Hello, summer! Hello, sun!', 'Time for splashing, time for fun.', 'Every ray of golden light', 'is {name}’s hand, so warm and bright!'],
    paints: [['#ffd23f', 'Yellow'], ['#ff9f1c', 'Orange']], uses: 'one hand, eight times',
    steps: ['Paint {name}’s hand yellow, leaving the thumb clean.', 'Press it on each outline around the sun, fingers pointing out. Switch to orange every other print.', 'Repaint every two or three prints. The sun’s face is already there!'],
    scene: `${sky('junSky', '#bfe6fb', '#eaf7fe')}${cloud(0.95, 0.75, 0.75)}${cloud(6.5, 1.1, 0.6)}${cloud(6.8, 3.4, 0.45)}
      <path d="M0.6,2.2 q0.12,-0.1 0.24,0 q0.12,-0.1 0.24,0 M6.1,2.3 q0.1,-0.08 0.2,0 q0.1,-0.08 0.2,0" fill="none" stroke="#3d4a63" stroke-width="0.03" stroke-linecap="round"/>
      <path d="M0,5.15 Q1,5.0 1.9,5.12 T3.75,5.1 T5.6,5.12 T7.5,5.05 V5.75 H0 Z" fill="#4fb3e8"/><path d="M0,5.4 q0.4,-0.08 0.8,0 t0.8,0 t0.8,0 t0.8,0 t0.8,0 t0.8,0 t0.8,0 t0.8,0 t0.8,0 t0.8,0" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="0.03"/>
      <path d="M0,5.65 Q2,5.5 3.75,5.65 T7.5,5.6 V6.3 A0.3,0.3 0 0 1 7.2,6.6 H0.3 A0.3,0.3 0 0 1 0,6.3 Z" fill="#f7deb0"/>
      <g transform="translate(6.3 4.9)"><path d="M-0.4,0.15 H0.4 L0.3,0.3 H-0.3 Z" fill="#e5383b"/><path d="M0.02,0.12 V-0.6 L0.4,0.08 Z" fill="#fff" stroke="#c9d6e6" stroke-width="0.02"/><path d="M-0.04,0.08 V-0.45 L-0.32,0.08 Z" fill="#ffd23f"/></g>
      <g transform="translate(1.15 5.95)"><circle r="0.3" fill="#fff"/><path d="M0,-0.3 A0.3,0.3 0 0 1 0.3,0 L0,0 Z" fill="#e5383b"/><path d="M0,0.3 A0.3,0.3 0 0 1 -0.3,0 L0,0 Z" fill="#3a86ff"/><path d="M-0.3,0 A0.3,0.3 0 0 1 0,-0.3 L0,0 Z" fill="#ffd23f"/></g>
      ${shell(2.4, 6.15, 0.9)}${starfish(5.4, 6.1, 0.8)}`,
    prints: Array.from({ length: 8 }, (_, i) => {
      const a = (i * 45 * Math.PI) / 180;
      return hand({ x: f(3.75 + 1.58 * Math.sin(a)), y: f(2.75 - 1.58 * Math.cos(a)), rot: i * 45, s: 0.5, thumb: false, color: i % 2 ? '#ff9f1c' : '#ffd23f' });
    }),
    decor: `<circle cx="3.75" cy="2.75" r="1.05" fill="#ffd23f" stroke="#ffb703" stroke-width="0.06"/><path d="M3.15,2.55 h1.2" stroke="#222" stroke-width="0.05"/><rect x="3.1" y="2.45" width="0.5" height="0.3" rx="0.12" fill="#222"/><rect x="3.9" y="2.45" width="0.5" height="0.3" rx="0.12" fill="#222"/><path d="M3.2,2.5 l0.12,0.08" stroke="#fff" stroke-width="0.03"/><path d="M4.0,2.5 l0.12,0.08" stroke="#fff" stroke-width="0.03"/>${smile(3.75, 3.05, 0.32, '#222', 0.055)}<circle cx="3.15" cy="3.05" r="0.13" fill="#ff9f1c" opacity=".7"/><circle cx="4.35" cy="3.05" r="0.13" fill="#ff9f1c" opacity=".7"/>`,
    finish: '',
  },
  {
    month: 'July',
    title: 'Sparkle and Shine',
    titleColors: ['#e63946', '#2b59c3', '#e63946', '#2b59c3'],
    border: '#e63946',
    icon: (x, y, s) => star(x, y, s * 0.17, '#9db7e8'),
    poem: ['Boom! Pop! Sparkle and glow,', 'lighting up the sky below.', 'Red and gold, a dazzling sight,', '{name}’s hands lit up the night!'],
    paints: [['#e63946', 'Red'], ['#ffd166', 'Gold'], ['#ffffff', 'White'], ['#7fd3ff', 'Light blue']], uses: 'both hands and fingertips',
    steps: ['Paint {name}’s hand red, no thumb, and press it on the three outlines of the first firework, palms meeting in the middle.', 'Wipe, and do the second firework in gold.', 'Finish the small firework with white and light blue fingerprints around the circle.'],
    scene: `${sky('julSky', '#0f1c40', '#26407a')}${twinkles([[0.4, 0.5], [1.2, 1.4, 0.7], [3.6, 0.35, 0.8], [6.9, 0.5], [6.6, 2.9, 0.7], [0.5, 3.0, 0.6], [3.2, 2.9, 0.5], [7.0, 4.0, 0.5]], '#fff')}
      <path d="M2.35,5.2 Q2.25,4.2 2.35,3.3 M5.15,5.2 Q5.3,4 5.15,2.9 M3.9,5.2 Q3.8,4.9 3.85,4.55" fill="none" stroke="#ffd166" stroke-width="0.03" stroke-dasharray="0.05 0.09" stroke-linecap="round" opacity=".8"/>
      <g fill="#0b1430">${[[0, 4.9, 0.7], [0.7, 4.6, 0.6], [1.3, 5.0, 0.8], [2.1, 4.75, 0.5], [2.6, 5.15, 0.9], [3.5, 4.85, 0.6], [4.1, 5.1, 0.7], [4.8, 4.7, 0.55], [5.35, 5.0, 0.8], [6.15, 4.8, 0.6], [6.75, 5.05, 0.75]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${H - y}"/>`).join('')}<path d="M0,6.3 V6.6 H0.3 Z M7.5,6.3 V6.6 H7.2 Z" fill="#26407a"/></g>
      <g fill="#ffd166" opacity=".85">${[[0.15, 5.1], [0.4, 5.4], [0.9, 4.8], [1.0, 5.3], [1.55, 5.25], [1.85, 5.6], [2.8, 5.4], [3.15, 5.75], [3.7, 5.1], [4.3, 5.35], [4.95, 4.95], [5.6, 5.3], [5.9, 5.7], [6.35, 5.05], [6.95, 5.3], [7.2, 5.7]].map(([x, y]) => `<rect x="${x}" y="${y}" width="0.1" height="0.12"/>`).join('')}</g>`,
    prints: [
      ...burst(2.35, 2.15, 0.46, '#e63946', 10), ...burst(5.15, 1.75, 0.48, '#ffd166', 40),
      ...Array.from({ length: 10 }, (_, i) => { const a = (i * 36 * Math.PI) / 180; return finger(f(3.85 + 0.62 * Math.cos(a)), f(3.95 + 0.62 * Math.sin(a)), i % 2 ? '#7fd3ff' : '#ffffff', 1.0); }),
    ],
    decor: '',
    finish: `${[[1.4, 1.1], [3.3, 1.3], [1.5, 3.1], [3.2, 2.9], [4.2, 0.8], [6.2, 0.8], [6.1, 2.7], [4.3, 2.6]].map(([x, y], i) => sparkle(x, y, 0.7, i % 2 ? '#ffd166' : '#fff')).join('')}${[[3.85, 3.95]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="0.09" fill="#fff"/>`).join('')}`,
  },
  {
    month: 'August',
    title: 'Under the Sea',
    titleColors: ['#0288d1', '#26a69a', '#0288d1', '#26a69a'],
    border: '#4fc3f7',
    icon: (x, y, s) => `<circle cx="${x}" cy="${y}" r="${s * 0.11}" fill="none" stroke="#81d4fa" stroke-width="0.025"/>`,
    poem: ['Down in the ocean, deep and blue,', 'an octopus waves hello to you.', 'Eight wiggly arms, so silly and free,', 'made by {name}’s hands for me!'],
    paints: [['#9b6ee0', 'Purple'], ['#b58df0', 'Lilac']], uses: 'both hands, no thumbs',
    steps: ['Paint {name}’s hands purple and lilac, leaving the thumbs clean.', 'Press them side by side with the fingers pointing down, palms overlapping a little. Eight arms!', 'Once dry, add two big eyes and a smile (googly eyes are extra fun).'],
    scene: `${sky('augSky', '#8fd8f7', '#2b8fcf')}
      <g fill="#fff" opacity=".12"><path d="M1.2,0 L2.0,0 L0.8,5.2 L0.2,5.2 Z"/><path d="M3.6,0 L4.3,0 L3.8,5.2 L3.1,5.2 Z"/><path d="M5.8,0 L6.5,0 L7.3,5 L6.6,5 Z"/></g>
      ${bubble(0.8, 1.0, 0.16)}${bubble(1.1, 1.6, 0.1)}${bubble(6.6, 0.9, 0.18)}${bubble(6.3, 1.5, 0.11)}${bubble(6.9, 2.0, 0.08)}${bubble(0.6, 2.4, 0.09)}
      ${fish(1.2, 3.3, 0.85, '#ffb74d')}${fish(6.4, 3.0, 0.75, '#f06292', true)}${fish(5.9, 4.4, 0.55, '#fff176', true)}
      ${seaweed(0.35, 6.3, 2.2, '#2e9d6a')}${seaweed(0.75, 6.3, 1.5, '#3fbf80')}${seaweed(7.15, 6.3, 2.4, '#2e9d6a')}${seaweed(6.8, 6.3, 1.4, '#3fbf80')}
      <path d="M0,5.75 Q1.8,5.55 3.75,5.7 T7.5,5.65 V6.3 A0.3,0.3 0 0 1 7.2,6.6 H0.3 A0.3,0.3 0 0 1 0,6.3 Z" fill="#f4dca6"/>
      ${starfish(1.6, 6.05, 0.9)}${shell(5.3, 6.1, 0.9)}${shell(2.9, 6.25, 0.7, '#fbe3d8')}
      <g fill="#ff7f7f"><path d="M6.0,5.9 v-0.45 m0,0.15 l-0.18,-0.2 m0.18,0.1 l0.16,-0.22" stroke="#ff7f7f" stroke-width="0.07" stroke-linecap="round" fill="none"/></g>`,
    prints: [hand({ x: 3.32, y: 2.85, rot: 180, s: 0.8, thumb: false, flip: true, color: '#9b6ee0' }), hand({ x: 4.18, y: 2.85, rot: 180, s: 0.8, thumb: false, color: '#b58df0' })],
    decor: '',
    finish: `${eye(3.45, 2.2, 0.26)}${eye(4.05, 2.2, 0.26)}${smile(3.75, 2.6, 0.22, '#3d2a5c', 0.05)}<circle cx="3.15" cy="2.65" r="0.12" fill="#f48fb1" opacity=".8"/><circle cx="4.35" cy="2.65" r="0.12" fill="#f48fb1" opacity=".8"/>${bubble(4.7, 1.5, 0.12)}${bubble(4.95, 1.1, 0.08)}`,
  },
  {
    month: 'September',
    title: 'Apple of My Eye',
    titleColors: ['#d62828', '#4f9a3c', '#d62828', '#4f9a3c'],
    border: '#e2373f',
    icon: (x, y, s) => apple(x, y, s * 0.42, '#f4a3a3'),
    poem: ['Way up high in the apple tree,', 'red apples smiling down at me.', 'A brand new school year starts today,', 'and {name} is growing every day!'],
    paints: [['#8b5a2b', 'Brown'], ['#e2373f', 'Red']], uses: 'one hand and fingertips',
    steps: ['Paint {name}’s whole hand brown and press it fingers up. That’s the trunk and branches!', 'Dip a fingertip in red and press an apple on each spot in the leaves.', 'Once dry, add little stems and leaves to the apples with a marker.'],
    scene: `${panelBg('#f2f9fd')}${sunburst(0.8, 0.75, 0.38, '#ffe082', '#ffd54f')}${cloud(6.5, 0.6, 0.55)}
      <g fill="#6cbf4f">${[[3.75, 1.5, 1.35], [2.4, 1.9, 1.05], [5.1, 1.9, 1.05], [3.0, 0.8, 0.85], [4.5, 0.8, 0.85], [1.8, 2.7, 0.7], [5.7, 2.7, 0.7], [3.75, 2.55, 1.0]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>
      <g fill="#84cc63">${[[3.3, 1.0, 0.45], [4.6, 1.45, 0.4], [2.4, 2.1, 0.35], [5.2, 2.5, 0.35]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>
      ${grass(5.35, '#9bd17f', '#5aa04a')}
      <g transform="translate(6.25 5.45)"><path d="M-0.55,-0.05 H0.55 L0.42,0.55 H-0.42 Z" fill="#c48a4a"/><path d="M-0.5,0.15 H0.5 M-0.47,0.35 H0.47" stroke="#a06d36" stroke-width="0.03"/><path d="M-0.5,-0.05 C-0.5,-0.6 0.5,-0.6 0.5,-0.05" fill="none" stroke="#a06d36" stroke-width="0.06"/>${apple(-0.2, -0.12, 0.7)}${apple(0.2, -0.15, 0.7, '#d62828')}</g>
      ${apple(1.3, 5.9, 0.75)}${apple(5.2, 6.15, 0.6, '#d62828')}`,
    prints: [hand({ x: 3.75, y: 3.85, s: 1.0, color: '#8b5a2b' }), ...[[1.85, 1.6], [2.55, 0.75], [4.95, 0.7], [5.75, 1.55], [1.45, 2.7], [6.1, 2.65], [3.75, 0.45], [5.35, 2.3], [2.2, 2.25]].map(([x, y]) => finger(x, y, '#e2373f', 1.35))],
    decor: '',
    finish: [[1.85, 1.6], [2.55, 0.75], [4.95, 0.7], [5.75, 1.55], [1.45, 2.7], [6.1, 2.65], [3.75, 0.45], [5.35, 2.3], [2.2, 2.25]].map(([x, y]) => `<path d="M${x},${y - 0.3} l0.03,-0.12" stroke="#6b4423" stroke-width="0.035" stroke-linecap="round"/><path d="M${x + 0.03},${y - 0.38} c0.08,-0.08 0.18,-0.05 0.2,-0.02 c-0.07,0.07 -0.15,0.06 -0.2,0.02 Z" fill="#3f8a2e"/>`).join('') + `<g transform="translate(5.75 1.55)"><path d="M0.12,0.05 c0.12,-0.12 0.25,0.05 0.35,-0.05" fill="none" stroke="#f48fb1" stroke-width="0.09" stroke-linecap="round"/><circle cx="0.47" cy="-0.06" r="0.06" fill="#f48fb1"/><circle cx="0.49" cy="-0.08" r="0.015" fill="#222"/></g>`,
  },
  {
    month: 'October',
    title: 'Whooo Loves You',
    titleColors: ['#e76f1c', '#7a4a1e', '#e76f1c', '#7a4a1e'],
    border: '#f4a259',
    icon: (x, y, s) => maple(x, y, s * 0.42, 15, '#f7c08a'),
    poem: ['Hoo, hoo, who is in the tree?', 'A little owl looking at me!', 'Leaves of orange, red and brown,', '{name}’s owl is the wisest in town!'],
    paints: [['#9c6b3c', 'Brown'], ['#b8834e', 'Light brown']], uses: 'both hands, no thumbs',
    steps: ['Paint {name}’s hands brown and light brown, leaving the thumbs clean.', 'Press them side by side with the fingers pointing down, under the ear tufts. The fingers are the feathers!', 'Once dry, add big eyes, an orange beak and little feet on the branch.'],
    scene: `${sky('octSky', '#ffe2bd', '#fff4e4')}${moon(3.75, 2.6, 2.1, '#fff8dc')}
      ${twinkles([[0.5, 0.5], [7.0, 0.6], [6.7, 1.6, 0.7], [0.8, 1.7, 0.7]], '#f6c27a', 0.06)}
      <path d="M0,4.75 C1.5,4.55 2.5,4.85 3.75,4.7 S6.3,4.55 7.5,4.75" fill="none" stroke="#7a4a1e" stroke-width="0.24" stroke-linecap="round"/>
      <path d="M1.0,4.66 C0.9,4.3 0.6,4.15 0.4,4.15 M6.2,4.66 C6.4,4.3 6.7,4.2 6.95,4.25" fill="none" stroke="#7a4a1e" stroke-width="0.1" stroke-linecap="round"/>
      ${maple(0.45, 4.05, 0.7, -20, '#e76f1c')}${maple(6.95, 4.15, 0.65, 30, '#d62828')}${maple(1.4, 4.35, 0.55, 10, '#f2b134')}
      ${maple(0.9, 1.0, 0.6, 35, '#e76f1c')}${maple(6.4, 0.9, 0.55, -25, '#f2b134')}${maple(0.6, 3.0, 0.5, 60, '#d62828')}${maple(6.9, 3.2, 0.5, -40, '#e76f1c')}
      ${grass(5.7, '#e8c48f')}${pumpkin(1.0, 5.95, 0.9)}${pumpkin(1.7, 6.1, 0.65)}${pumpkin(6.3, 6.0, 0.85)}`,
    prints: [hand({ x: 3.33, y: 2.75, rot: 180, s: 0.82, thumb: false, flip: true, color: '#9c6b3c' }), hand({ x: 4.17, y: 2.75, rot: 180, s: 0.82, thumb: false, color: '#b8834e' })],
    decor: '<path d="M2.6,1.75 L2.75,1.1 L3.15,1.6 Z" fill="#7a4a1e"/><path d="M4.9,1.75 L4.75,1.1 L4.35,1.6 Z" fill="#7a4a1e"/>',
    finish: `${[3.35, 4.15].map((x) => `<circle cx="${x}" cy="2.2" r="0.4" fill="#fff"/><circle cx="${x}" cy="2.2" r="0.4" fill="none" stroke="#f2b134" stroke-width="0.08"/><circle cx="${x + 0.05}" cy="2.25" r="0.18" fill="#222"/><circle cx="${x + 0.1}" cy="2.18" r="0.05" fill="#fff"/>`).join('')}<path d="M3.62,2.55 L3.88,2.55 L3.75,2.85 Z" fill="#f08a24"/>${[[3.3, 3.2], [3.75, 3.35], [4.2, 3.2], [3.5, 3.6], [4.0, 3.6]].map(([x, y]) => `<path d="M${x - 0.1},${y} q0.1,0.12 0.2,0" fill="none" stroke="#6b4423" stroke-width="0.035" stroke-linecap="round"/>`).join('')}${[3.4, 4.1].map((x) => `<path d="M${x - 0.1},4.62 v0.12 M${x},4.6 v0.15 M${x + 0.1},4.62 v0.12" stroke="#f08a24" stroke-width="0.05" stroke-linecap="round"/>`).join('')}`,
  },
  {
    month: 'November',
    title: 'Thankful for You',
    titleColors: ['#c2410c', '#d97706', '#65a30d', '#c2410c'],
    border: '#e9a15a',
    icon: (x, y, s) => maple(x, y, s * 0.42, -15, '#f3c69a'),
    poem: ['Gobble, gobble, here I stand,', 'a turkey made from {name}’s hand.', 'For family, friends and pumpkin pie,', 'we’re thankful, you and I!'],
    paints: [['#8b5a2b', 'Brown'], ['#e04f3a', 'Red'], ['#f28c28', 'Orange'], ['#f5c242', 'Yellow'], ['#7cb342', 'Green']], uses: 'one hand',
    steps: ['Paint {name}’s palm and thumb brown, then each finger a feather color: red, orange, yellow and green.', 'Press the hand on the outline with the fingers up and the thumb out to the side.', 'Once dry, add an eye, a beak and a red wattle on the thumb. That’s the head!'],
    scene: `${panelBg('#fff6e6')}
      ${[[0.6, 0.7, 0.7, 20, '#e76f1c'], [6.8, 0.8, 0.65, -30, '#d62828'], [1.4, 1.6, 0.5, -10, '#f2b134'], [6.2, 2.0, 0.55, 40, '#e76f1c'], [0.5, 3.4, 0.55, 50, '#7cb342'], [7.0, 3.5, 0.6, -20, '#f2b134']].map(([x, y, s, r, c]) => maple(x, y, s, r, c)).join('')}
      ${grass(5.45, '#e8c48f')}
      <g transform="translate(6.2 5.55)"><rect x="-0.7" y="-0.35" width="1.4" height="0.75" rx="0.12" fill="#f2c84b"/><path d="M-0.6,-0.15 H0.6 M-0.6,0.05 H0.6 M-0.6,0.25 H0.6" stroke="#d9a92b" stroke-width="0.03"/><path d="M-0.45,-0.35 V0.4 M0.45,-0.35 V0.4" stroke="#c0392b" stroke-width="0.05"/></g>
      ${pumpkin(5.85, 4.95, 0.75)}${pumpkin(1.0, 5.75, 0.9)}${pumpkin(1.75, 5.95, 0.6)}
      <g transform="translate(6.8 4.95) rotate(20)"><ellipse rx="0.12" ry="0.32" fill="#f5c242"/><path d="M0,0.3 C-0.2,0.5 -0.3,0.2 -0.15,0 M0,0.3 C0.2,0.5 0.3,0.2 0.15,0" fill="#c9b37a"/></g>`,
    prints: [hand({ x: 3.95, y: 3.25, s: 1.02, color: '#8b5a2b', fingerColors: ['#e04f3a', '#f28c28', '#f5c242', '#7cb342', '#8b5a2b'] })],
    decor: '<path d="M3.55,4.75 V5.35 M3.45,5.4 L3.55,5.3 L3.65,5.4 M4.25,4.75 V5.35 M4.15,5.4 L4.25,5.3 L4.35,5.4" stroke="#f08a24" stroke-width="0.06" stroke-linecap="round" fill="none"/>',
    finish: `${eye(2.12, 2.7, 0.13)}<path d="M1.95,2.88 L1.68,2.98 L1.95,3.06 Z" fill="#f2b134"/><path d="M1.98,3.02 C1.85,3.15 1.86,3.35 1.98,3.38 C2.08,3.35 2.08,3.15 1.98,3.02 Z" fill="#d62828"/>`,
  },
  {
    month: 'December',
    title: 'Merry and Bright',
    titleColors: ['#c62828', '#2e7d32', '#c62828', '#2e7d32'],
    border: '#66bb6a',
    icon: (x, y, s) => snow([[x, y, s * 1.6]]).replace(/#fff/g, '#a5d6a7'),
    poem: ['Twinkle lights and a shining star,', 'wishes near and wishes far.', 'Six little handprints, stacked up high,', '{name}’s tree lights up the sky!'],
    paints: [['#2e9d4f', 'Green'], ['#d62828', 'Red'], ['#f7c948', 'Yellow'], ['#3a86ff', 'Blue']], uses: 'one hand, six times',
    steps: ['Paint {name}’s hand green, leaving the thumb clean.', 'Press it fingers down on the top outline, then the two in the middle and the three at the bottom. Repaint as you go.', 'Once dry, add colorful fingerprint ornaments all over the tree.'],
    scene: `${sky('decSky', '#dcebf7', '#f5f9fd')}${snow([[0.6, 0.6], [1.5, 1.4, 0.8], [6.8, 0.7], [6.0, 1.6, 0.7], [0.7, 3.0, 0.9], [6.9, 3.2], [1.3, 4.3, 0.7], [6.3, 4.4, 0.8]]).replace(/#fff/g, '#a9c9e3')}
      <path d="M0,5.95 Q1.8,5.75 3.75,5.9 T7.5,5.85 V6.3 A0.3,0.3 0 0 1 7.2,6.6 H0.3 A0.3,0.3 0 0 1 0,6.3 Z" fill="#fff"/>
      <g transform="translate(0.95 5.4)"><circle cy="0.25" r="0.38" fill="#fff" stroke="#c9d6e6" stroke-width="0.025"/><circle cy="-0.25" r="0.27" fill="#fff" stroke="#c9d6e6" stroke-width="0.025"/>${dotEyes(0, -0.3, 0.08, 0.03)}<path d="M0,-0.22 l0.18,0.03 l-0.18,0.03 Z" fill="#f08a24"/><path d="M-0.27,-0.05 Q0,0.05 0.27,-0.05 L0.25,0.05 Q0,0.15 -0.25,0.05 Z" fill="#d62828"/></g>`,
    prints: [[3.75, 1.55, 0.5, 180], [3.22, 2.6, 0.56, 160], [4.28, 2.6, 0.56, 200], [2.62, 3.75, 0.62, 152], [3.75, 3.8, 0.62, 180], [4.88, 3.75, 0.62, 208]]
      .map(([x, y, s, rot]) => hand({ x, y, rot, s, thumb: false, color: '#2e9d4f' })),
    decor: `<rect x="3.52" y="5.2" width="0.46" height="0.5" rx="0.05" fill="#7a4b2a"/>${star(3.75, 0.68, 0.38)}${present(4.55, 5.5, 0.75, 0.55, '#d62828', '#f7c948')}${present(5.45, 5.65, 0.55, 0.42, '#3a86ff', '#fff')}${present(2.3, 5.55, 0.65, 0.5, '#f7c948', '#d62828')}`,
    finish: [[3.55, 2.05, '#d62828'], [3.95, 1.85, '#f7c948'], [2.9, 3.05, '#3a86ff'], [3.75, 3.0, '#d62828'], [4.6, 3.05, '#f7c948'], [2.3, 4.4, '#f7c948'], [3.0, 4.6, '#3a86ff'], [3.75, 4.4, '#d62828'], [4.5, 4.6, '#3a86ff'], [5.2, 4.4, '#d62828'], [3.75, 5.0, '#f7c948'], [2.6, 5.0, '#d62828'], [4.9, 5.0, '#f7c948']].map(([x, y, c]) => painted(finger(x, y, c, 0.9))).join(''),
  },
];

// A ring of small painted hands in every month's color, for the cover.
function coverArt(ctx) {
  const colors = ['#5aa9e6', '#e23a4f', '#4caf50', '#9b6ee0', '#f06292', '#ffd23f', '#2b59c3', '#26a69a', '#e2373f', '#e76f1c', '#8b5a2b', '#2e9d4f'];
  const prints = colors.map((c, i) => {
    const a = ((-165 + i * 30) * Math.PI) / 180;
    return painted({ kind: 'hand', x: f(3.75 + 2.55 * Math.cos(a)), y: f(3.55 + 2.55 * Math.sin(a)), rot: -75 + i * 13.6, s: 0.36, flip: i % 2 === 1, color: c });
  }).join('');
  return `<svg viewBox="0 0 7.5 6.6">${prints}
    <circle cx="3.75" cy="3.55" r="1.75" fill="#fff" stroke="#ffd23f" stroke-width="0.06"/>
    <circle cx="3.75" cy="3.55" r="1.6" fill="none" stroke="#f7a8c0" stroke-width="0.03" stroke-dasharray="0.08 0.08"/>
    <text x="3.75" y="3.25" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="0.3" fill="#7a6f8f">This book belongs to</text>
    <text x="3.75" y="3.95" text-anchor="middle" font-family="Pacifico" font-size="${ctx.name.length > 8 ? 0.5 : 0.66}" fill="#e23a4f">${ctx.nameSvg}</text>
    <text x="3.75" y="4.45" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="0.32" fill="#2b59c3">${ctx.year}</text>
  </svg>`;
}

module.exports = {
  id: 'memory',
  name: 'Memory Handprint Book',
  book: true,
  kicker: 'My Memory Handprint Book',
  month: 'January to December',
  paintList: 'red, pink, orange, yellow, green, blue, purple, brown and white',
  colors: { primary: '#2b59c3', accent: '#e23a4f', ink: '#2b2540', paper: '#fffaf0', soft: '#fde7ef' },
  crafts: months,
  coverArt,
  cards: [],
};
