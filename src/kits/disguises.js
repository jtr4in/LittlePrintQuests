// Photo booth disguises on a stick, for every kit: two pictures (a hat or ears for the head and
// a mustache, glasses or nose for the face) and a speech bubble with the kit's catchphrase and
// the kid's name, plus a blank bubble to write in. Tape each one to a straw, a paint stirrer or
// a pencil and hold it up for pretend play or photos.
//
// The pictures are src/kits/art/<kit>/disguise-1.webp (head) and disguise-2.webp (face), made by
// scripts/disguise-cutout.py from project-files/pretend-play/disguises/tools/ prompts. A kit
// without both pictures skips the pages.
const fs = require('fs');
const path = require('path');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// [head prop, face prop, catchphrase]
const DISGUISES = {
  auto: ['Mechanic cap', 'Handlebar mustache', 'Vroom! All fixed!'],
  burger: ['Paper diner hat', 'Mustard mustache', 'Order up!'],
  christmas: ['Santa hat', 'Santa beard', 'Ho ho ho!'],
  coffee: ['Barista beret', 'Round glasses', 'One cocoa, coming up!'],
  construction: ['Hard hat', 'Safety goggles', 'Let’s build it!'],
  dentist: ['Head mirror', 'Big sparkly smile', 'Open wide!'],
  dino: ['Explorer hat', 'T-rex grin', 'ROAR!'],
  easter: ['Bunny ears', 'Bunny nose', 'Hop hop hooray!'],
  fire: ['Fire helmet', 'Firefighter mustache', 'To the rescue!'],
  grocery: ['Grocer’s cap', 'Lemon glasses', 'Clean up on aisle 3!'],
  halloween: ['Witch hat', 'Vampire smile', 'Boo!'],
  hero: ['Hero mask', 'Super goggles', 'Power up!'],
  ice: ['Snowflake tiara', 'Snowflake glasses', 'Let it snow!'],
  italian: ['Chef hat', 'Curly mustache', 'Mamma mia!'],
  library: ['Pencil bun', 'Reading glasses', 'Shhh! Story time!'],
  mermaid: ['Seashell tiara', 'Starfish sunglasses', 'Under the sea!'],
  petshop: ['Puppy ears', 'Puppy nose', 'Woof woof!'],
  pirate: ['Pirate hat', 'Pirate beard', 'Arrr, matey!'],
  pizza: ['Delivery cap', 'Pepperoni glasses', 'Pizza time!'],
  police: ['Police cap', 'Aviator shades', 'Stop right there!'],
  post: ['Mail carrier cap', 'Walrus mustache', 'Special delivery!'],
  racecar: ['Racing cap', 'Racing goggles', 'Ready, set, GO!'],
  royal: ['Royal crown', 'Masquerade mask', 'Bow to the crown!'],
  space: ['Alien antennae', 'Star sunglasses', '3, 2, 1, blast off!'],
  unicorn: ['Flower crown', 'Rainbow heart glasses', 'Sparkle on!'],
  valentine: ['Heart boppers', 'Kissy lips', 'Be mine!'],
  vet: ['Scrub cap', 'Kitty nose', 'Next patient, please!'],
};

const artFile = (k, n) => path.join(__dirname, 'art', k.def.id, `disguise-${n}.webp`);
const hasDisguises = (k) => Boolean(DISGUISES[k.def.id]) && [1, 2].every((n) => fs.existsSync(artFile(k, n)));
const img = (k, n) => `<img class="dg-art" src="data:image/webp;base64,${fs.readFileSync(artFile(k, n)).toString('base64')}" alt="">`;

// A round speech bubble with its tail at the bottom left, inside a grey cut line.
function bubble(words, who) {
  const shape = 'M60,250 C20,160 70,40 300,30 C530,40 580,160 540,250 C510,330 400,360 260,350 L150,420 L170,340 C110,320 80,290 60,250 Z';
  const size = Math.min(62, Math.floor(620 / Math.max(8, words.length * 0.62)));
  return `<svg class="dg-bubble" viewBox="0 0 600 450">
    <path d="${shape}" fill="#fff" stroke="#9aa5b8" stroke-width="16"/>
    <path d="${shape}" fill="#fff" stroke="var(--teal)" stroke-width="9"/>
    ${words ? `<foreignObject x="85" y="70" width="430" height="${who ? 190 : 250}"><div xmlns="http://www.w3.org/1999/xhtml" class="dg-words" style="font-size:${size}px">${esc(words)}</div></foreignObject>` : ''}
    ${who ? `<text x="300" y="300" text-anchor="middle" class="dg-who">${esc(who)}</text>` : [130, 205, 280].map((y, i) => `<line x1="${i === 2 ? 170 : 110}" y1="${y}" x2="${i === 2 ? 430 : 490}" y2="${y}" stroke="#d5dbe6" stroke-width="3" stroke-dasharray="10 10"/>`).join('')}
  </svg>`;
}

function disguisePages(k) {
  if (!hasDisguises(k)) return '';
  const [head, face, says] = DISGUISES[k.def.id];
  const howTo = 'Cut out each disguise, tape it to a straw, a paint stirrer or a pencil, and hold it up. Say cheese!';
  return `<section class="page props dg">
      <h2 class="pg-title">Photo Booth Disguises</h2><p class="pg-sub">${esc(howTo)}</p>
      <div class="cardstock">Best on cardstock</div>
      <div class="dg-slot dg-head">${img(k, 1)}<span class="dg-cap">${esc(head)}</span></div>
      <div class="dg-slot dg-face">${img(k, 2)}<span class="dg-cap">${esc(face)}</span></div>
    </section>
    <section class="page props dg">
      <h2 class="pg-title">Speech Bubbles</h2><p class="pg-sub">Hold one up next to your disguise. Write your own words in the empty one!</p>
      <div class="dg-slot">${bubble(says, `– ${k.lead}`)}</div>
      <div class="dg-slot">${bubble('', '')}</div>
    </section>`;
}

const disguiseCss = `
.dg { display:flex; flex-direction:column; align-items:center; }
.dg-slot { flex:1; min-height:0; width:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; }
.dg-art { max-width:7.2in; max-height:3.9in; width:auto; height:auto; flex:1; min-height:0; object-fit:contain; }
.dg-face .dg-art { max-width:6.4in; }
.dg-cap { font:600 11pt 'Fredoka'; color:#9aa3b8; margin-top:.04in; }
.dg-bubble { width:6.6in; height:4.4in; }
.dg-words { height:100%; display:flex; align-items:center; justify-content:center; text-align:center; font-family:'Fredoka'; font-weight:700; line-height:1.05; color:var(--navy); }
.dg-who { font:600 34px 'Fredoka'; fill:var(--teal-d); }
`;

module.exports = { disguisePages, hasDisguises, disguiseCss, DISGUISES };
