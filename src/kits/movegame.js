// Move & Play: a get-up-and-move card game at the end of every activity pack (both ages).
// Two sheets of 9 cut-out cards (12 themed moves plus 6 special cards) and a board with
// stand-up pieces. Flip a card, everyone does the move, then the flipper moves their piece
// one space for each star on the card. First to reach the kit's place wins.
// Grown-ups can skip the board and just flip and move. Added 2026-10-23.
const art = require('./art');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const possessive = (name) => (/s$/i.test(name) ? `${name}’` : `${name}’s`);
function rng(seed) {
  let s = seed % 2147483647 || 1;
  return () => (s = (s * 48271) % 2147483647) / 2147483647;
}
const seedOf = (str) => [...str].reduce((a, c) => (a * 31 + c.codePointAt(0)) % 2147483647, 7);
function shuffle(list, rand) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// Stick-figure pictures of each move, 60 x 64. Plain lines are the kid, class "m" is teal motion
// marks and props, class "f" is filled. Little kids can't read the card, so the picture has to say it.
const HEAD = (x, y, r = 5.5) => `<circle cx="${x}" cy="${y}" r="${r}"/>`;
const POSES = {
  reach: `${HEAD(30, 12)}<path d="M30 18 V38 M30 21 L22 3 M30 21 L38 3 M30 38 L25 58 M30 38 L35 58"/><path class="m" d="M16 6 l-4 -2 M44 6 l4 -2 M30 -1 v-2"/>`,
  jump: `${HEAD(30, 9)}<path d="M30 15 V33 M30 19 L18 5 M30 19 L42 5 M30 33 L23 41 L27 50 M30 33 L37 41 L33 50"/><path class="m" d="M20 56 h6 M34 56 h6 M14 47 q-3 4 0 8 M46 47 q3 4 0 8"/>`,
  hop: `${HEAD(30, 9)}<path d="M30 15 V36 M30 20 L17 25 M30 20 L43 25 M30 36 L30 54 M30 36 L38 44 L43 39"/><path class="m" d="M23 60 q7 -6 14 0 M24 50 h-6"/>`,
  stomp: `${HEAD(30, 12)}<path d="M30 18 V36 M30 22 L20 27 L17 19 M30 22 L40 27 L43 19 M30 36 L21 45 L19 57 M30 36 L39 45 L41 57"/><path class="m" d="M13 59 l-5 -3 M12 54 l-5 -1 M47 59 l5 -3 M48 54 l5 -1"/>`,
  tiptoe: `${HEAD(30, 9)}<path d="M30 15 V36 M30 20 L22 14 M30 20 L38 14 M30 36 L28 53 L30 58 M30 36 L32 53 L34 58"/><path class="m" d="M18 58 h-6 M42 58 h6 M44 8 q3 3 0 6"/>`,
  spin: `${HEAD(30, 9)}<path d="M30 15 V36 M30 21 L13 21 M30 21 L47 21 M30 36 L26 58 M30 36 L34 58"/><path class="m" d="M8 32 A22 8 0 1 0 52 32 M52 32 l-6 -2 M52 32 l1 -6"/>`,
  flap: `${HEAD(30, 10)}<path d="M30 16 V37 M30 21 L15 12 M30 21 L45 12 M30 37 L25 58 M30 37 L35 58"/><path class="m" d="M30 23 L16 31 M30 23 L44 31 M10 8 q-3 4 0 8 M50 8 q3 4 0 8"/>`,
  crawl: `${HEAD(12, 27)}<path d="M18 30 L42 33 M21 31 L18 47 M26 32 L28 47 M42 33 L40 47 L52 47"/><path class="m" d="M4 50 H58 M50 24 q4 -6 8 -2"/>`,
  squat: `${HEAD(31, 16)}<path d="M30 22 L25 40 M29 27 L45 31 M29 28 L44 35 M25 40 L37 43 L36 57 M25 40 L30 47 L26 57"/><path class="m" d="M48 28 l4 -3 M49 36 l5 0 M18 58 h26"/>`,
  wiggle: `${HEAD(30, 9)}<path d="M30 15 q-5 6 0 11 q5 6 0 11 M30 20 q-6 1 -8 6 q-2 5 -8 5 M30 20 q6 -1 8 -6 q2 -5 8 -5 M30 37 L25 58 M30 37 L35 58"/><path class="m" d="M10 40 q-4 5 0 10 M50 40 q4 5 0 10 M14 12 q-4 5 0 10 M46 22 q4 5 0 10"/>`,
  shake: `${HEAD(30, 12)}<path d="M30 18 V38 M30 22 q-6 -2 -8 -8 q-2 -6 -6 -7 M30 22 q6 -2 8 -8 q2 -6 6 -7 M30 38 L25 58 M30 38 L35 58"/><path class="m" d="M8 22 q-4 5 0 10 M4 18 q-5 9 0 18 M52 22 q4 5 0 10 M56 18 q5 9 0 18"/>`,
  march: `${HEAD(30, 9)}<path d="M30 15 V36 M30 20 L38 27 L41 19 M30 20 L23 30 M30 36 L41 38 L41 49 M30 36 L28 58"/><path class="m" d="M47 42 h6 M47 48 h5"/>`,
  roar: `${HEAD(30, 11, 6.5)}<circle class="f" cx="30" cy="13" r="2.4"/><path d="M30 18 V37 M30 22 L19 18 L17 10 M30 22 L41 18 L43 10 M30 37 L24 58 M30 37 L36 58"/><path class="m" d="M48 6 q4 5 0 10 M53 3 q6 8 0 16 M12 6 q-4 5 0 10 M7 3 q-6 8 0 16"/>`,
  swim: `${HEAD(13, 21)}<path d="M19 24 L42 28 M20 24 L6 16 M23 25 L35 15 M42 28 L55 23 M42 28 L55 33"/><path class="m" d="M4 44 q5 -4 10 0 t10 0 t10 0 t10 0 t10 0 M10 54 q5 -4 10 0 t10 0 t10 0 t10 0"/>`,
  balance: `${HEAD(30, 9)}<path d="M30 15 V36 M30 21 L12 21 M30 21 L48 21 M30 36 L30 58 M30 36 L39 42 L31 47"/><path class="m" d="M8 18 v6 M52 18 v6 M24 61 h12"/>`,
  run: `${HEAD(35, 9)}<path d="M34 15 L29 34 M32 20 L40 27 L47 23 M32 20 L24 25 L20 18 M29 34 L38 44 L36 56 M29 34 L22 44 L13 45"/><path class="m" d="M4 20 h9 M2 28 h9 M4 36 h9"/>`,
  star: `${HEAD(30, 9)}<path d="M30 15 V36 M30 20 L10 6 M30 20 L50 6 M30 36 L15 58 M30 36 L45 58"/><path class="m" d="M5 2 l2 2 M55 2 l-2 2 M8 62 h4 M48 62 h4"/>`,
  freeze: `${HEAD(30, 9)}<path d="M30 15 V36 M30 20 L10 6 M30 20 L50 6 M30 36 L15 58 M30 36 L45 58"/><path class="m" d="M2 36 h12 M8 30 v12 M4 32 l8 8 M12 32 l-8 8 M46 36 h12 M52 30 v12 M48 32 l8 8 M56 32 l-8 8"/>`,
  stir: `${HEAD(24, 9)}<path d="M24 15 V36 M24 20 L16 27 L22 33 M24 20 L35 27 L41 33 M24 36 L20 58 M24 36 L28 58"/><path class="m" d="M34 44 h22 q0 12 -11 12 q-11 0 -11 -12 M37 38 a8 4 0 1 0 14 -2 M51 36 l-4 -2"/>`,
  drive: `${HEAD(30, 9)}<path d="M30 15 V36 M30 20 L21 29 M30 20 L39 29 M30 36 L25 58 M30 36 L35 58"/><circle class="m" cx="30" cy="30" r="10"/><path class="m" d="M30 30 v-10 M30 30 l-8 6 M30 30 l8 6 M6 26 h7 M47 26 h7"/>`,
  row: `${HEAD(22, 14)}<path d="M22 20 L20 40 M21 25 L32 31 L40 28 M20 40 L38 36 L46 46"/><path class="m" d="M34 20 L56 52 M4 48 q6 -4 12 0 t12 0 t12 0 M10 40 h12"/>`,
  clap: `${HEAD(30, 14)}<path d="M30 20 V40 M30 24 L23 13 L29 4 M30 24 L37 13 L31 4 M30 40 L25 60 M30 40 L35 60"/><path class="m" d="M20 3 l-5 -2 M40 3 l5 -2 M22 9 l-5 1 M38 9 l5 1"/>`,
  push: `${HEAD(31, 13)}<path d="M28 18 L20 37 M27 22 L42 22 M26 26 L42 28 M20 37 L9 57 M20 37 L27 47 L25 58"/><rect class="m" x="43" y="10" width="14" height="36" rx="2"/><path class="m" d="M2 60 h56"/>`,
  hips: `${HEAD(30, 9)}<path d="M30 15 V36 M30 20 L20 26 L25 33 M30 20 L40 26 L35 33 M30 36 L22 58 M30 36 L38 58"/><path class="m" d="M12 8 l3 3 M48 8 l-3 3 M30 -2 v4"/>`,
  bow: `${HEAD(13, 25)}<path d="M19 22 L33 36 M20 24 L17 38 M21 23 L33 30 M33 36 L31 58 M33 36 L37 58"/><path class="m" d="M8 12 q6 -6 12 0 M40 10 l3 -3 M44 16 h4"/>`,
  hug: `${HEAD(30, 10)}<path d="M30 16 V37 M30 21 L19 27 L37 30 M30 21 L41 27 L23 30 M30 37 L25 58 M30 37 L35 58"/><path class="m" d="M48 10 c-3 -4 -8 -1 -5 3 l5 5 l5 -5 c3 -4 -2 -7 -5 -3Z"/>`,
  climb: `${HEAD(30, 13)}<path d="M30 19 V38 M30 22 L22 15 L22 8 M30 22 L38 26 L42 22 M30 38 L40 40 L40 49 M30 38 L28 58"/><path class="m" d="M16 0 V62 M44 0 V62 M16 8 H44 M16 22 H44 M16 36 H44 M16 50 H44"/>`,
  dance: `${HEAD(30, 9)}<path d="M30 15 V36 M30 20 L40 11 L44 3 M30 20 L21 26 L26 32 M30 36 L24 58 M30 36 L40 46 L47 50"/><path class="m" d="M8 20 V8 L16 6 V18 M5 21 a3 2 0 1 0 6 -1 M13 19 a3 2 0 1 0 6 -1"/>`,
  mirror: `${HEAD(15, 12, 4.5)}${HEAD(45, 12, 4.5)}<path d="M15 17 V37 M15 22 L24 13 M15 22 L8 30 M15 37 L11 58 M15 37 L19 58 M45 17 V37 M45 22 L36 13 M45 22 L52 30 M45 37 L41 58 M45 37 L49 58"/><path class="m" d="M30 2 V62" stroke-dasharray="3 4"/>`,
};
const pose = (name) => `<svg viewBox="-4 -4 68 70" class="mv-pose">${POSES[name] || POSES.star}</svg>`;

// Seven themed moves per kit: [picture of the move, kit picture, what to do, how many times (0 = no count)].
const MOVES = {
  dino: ['Dino Stomp', [['stomp', '🦖', 'Stomp like a T-Rex', 5], ['roar', '🦖', 'Roar your biggest dino roar', 3], ['reach', '🦕', 'Stretch up tall like a long-neck', 0], ['flap', '🐦', 'Flap like a pterodactyl', 10], ['crawl', '🐊', 'Creep low like a swamp croc', 0], ['squat', '🦴', 'Dig, dig, dig for fossils', 5], ['tiptoe', '🥚', 'Tiptoe past the dino eggs', 0]]],
  hero: ['Hero Training', [['run', '👟', 'Run in place at super speed', 10], ['reach', '🦸', 'Fly! One fist up to the sky', 0], ['push', '🛡️', 'Push the giant boulder away', 0], ['hips', '🦸', 'Strike your best hero pose', 0], ['jump', '🚁', 'Leap over a tall building', 3], ['tiptoe', '🎭', 'Sneak like a secret hero', 0], ['squat', '🧸', 'Super lift! Squat and lift', 3]]],
  pirate: ['Pirate Ahoy', [['row', '🛶', 'Row the boat, pull hard!', 10], ['hop', '🦜', 'Hop on one peg leg', 5], ['balance', '⚓', 'Balance on the wobbly deck', 0], ['swim', '🦈', 'Swim away from the shark!', 0], ['flap', '🦜', 'Flap like the ship’s parrot', 10], ['squat', '💎', 'Dig for buried treasure', 5], ['march', '⚓', 'March like the captain', 10]]],
  space: ['Rocket Moves', [['squat', '🚀', 'Crouch down… 3, 2, 1, blast off!', 0], ['tiptoe', '🧑‍🚀', 'Moonwalk in slow motion', 0], ['spin', '🪐', 'Spin like a planet', 3], ['star', '⭐', 'Be a star! Arms and legs out wide', 0], ['wiggle', '👽', 'Do a wiggly alien dance', 0], ['reach', '☄️', 'Reach up and catch a comet', 5], ['march', '🤖', 'Walk like a robot', 10]]],
  royal: ['Royal Court', [['march', '👑', 'March like a royal guard', 10], ['bow', '👑', 'Take a royal bow', 3], ['tiptoe', '🍵', 'Tiptoe to the royal tea party', 0], ['run', '🐴', 'Gallop like a royal horse', 10], ['flap', '🐉', 'Fly like the pet dragon', 10], ['roar', '🐉', 'Roar like a dragon', 3], ['spin', '👑', 'Twirl at the royal ball', 3]]],
  unicorn: ['Unicorn Magic', [['run', '🦄', 'Gallop like a unicorn', 10], ['spin', '🌈', 'Twirl into a rainbow', 3], ['tiptoe', '✨', 'Tiptoe on a fluffy cloud', 0], ['march', '🐴', 'Prance with high knees', 10], ['reach', '🌈', 'Reach up and touch a rainbow', 5], ['flap', '🐉', 'Flap like a baby dragon', 10], ['shake', '🎀', 'Shake your sparkly mane', 0]]],
  mermaid: ['Under the Sea', [['swim', '🐠', 'Swim like a fish', 10], ['wiggle', '🧜‍♀️', 'Swish your mermaid tail', 0], ['crawl', '🦀', 'Crab walk sideways', 0], ['jump', '🐬', 'Jump like a dolphin', 3], ['shake', '🐙', 'Wiggle your arms like an octopus', 0], ['tiptoe', '🐚', 'Tiptoe on the hot sand', 0], ['star', '⭐', 'Be a starfish! Arms and legs out', 0]]],
  construction: ['Build It Up', [['squat', '🚜', 'Scoop like a digger', 5], ['push', '🧱', 'Push the heavy wheelbarrow', 0], ['reach', '🏗️', 'Lift up high like a crane', 5], ['jump', '🔨', 'Bounce like a jackhammer', 10], ['drive', '🚛', 'Drive the dump truck: beep beep!', 0], ['stomp', '🧱', 'Stomp the dirt flat', 5], ['shake', '🚛', 'Tip and dump it out!', 0]]],
  vet: ['Vet Visit', [['hop', '🐰', 'Hop like a bunny', 5], ['crawl', '🐶', 'Crawl like a puppy and wag your tail', 0], ['reach', '🐱', 'Stretch like a sleepy cat', 0], ['flap', '🐦', 'Flap like a little bird', 10], ['swim', '🐠', 'Swim like a fish', 0], ['run', '🐹', 'Run on the hamster wheel', 10], ['shake', '🛁', 'Shake off like a wet dog', 0]]],
  easter: ['Egg Hunt Hop', [['hop', '🐰', 'Bunny hop!', 5], ['flap', '🐣', 'Flap like a baby chick', 10], ['march', '🦆', 'Waddle like a duckling', 10], ['squat', '🥚', 'Squat and lay an egg: cluck!', 3], ['tiptoe', '🧺', 'Tiptoe with your egg basket', 0], ['jump', '🌟', 'Jump for the golden egg', 3], ['spin', '🎀', 'Spin like a basket ribbon', 3]]],
  halloween: ['Monster Mash', [['stomp', '🎃', 'Monster stomp!', 5], ['flap', '🦇', 'Flap like a bat', 10], ['tiptoe', '👻', 'Float like a friendly ghost', 0], ['stir', '🧪', 'Stir the bubbling potion', 5], ['crawl', '🕷️', 'Creep like a spider', 0], ['roar', '👻', 'Shout “Boo!”', 3], ['run', '🧹', 'Ride your broom around the room', 0]]],
  christmas: ['Holiday Hustle', [['march', '🧝', 'March like a busy elf', 10], ['run', '🦌', 'Prance like a reindeer', 10], ['squat', '🎁', 'Lift the heavy present', 3], ['shake', '🎅', 'Ho ho ho! Shake like Santa', 3], ['star', '⭐', 'Be the star on top of the tree', 0], ['tiptoe', '🎅', 'Tiptoe so Santa doesn’t hear', 0], ['spin', '⛄', 'Spin like a snowflake', 3]]],
  valentine: ['Love Bug Boogie', [['clap', '💌', 'Clap for a friend', 10], ['hug', '🧸', 'Give yourself a big hug', 0], ['jump', '🧁', 'Jump for joy', 5], ['tiptoe', '💌', 'Tiptoe to the mailbox', 0], ['dance', '🧸', 'Do a happy dance', 0], ['spin', '🌹', 'Twirl like a rose petal', 3], ['flap', '🐦', 'Flap like a love bird', 10]]],
  fire: ['Fire Drill', [['run', '🚒', 'Rush to the fire engine', 10], ['climb', '🚒', 'Climb the tall ladder', 10], ['push', '🚒', 'Spray the hose: whoosh!', 5], ['crawl', '🚒', 'Stay low and crawl', 0], ['squat', '🚒', 'Stop, drop and roll!', 0], ['spin', '🚒', 'Spin like the siren: wee-oo!', 3], ['jump', '🐱', 'Jump up to save the kitten', 3]]],
  ice: ['Snowy Shuffle', [['spin', '⛸️', 'Skate and spin', 3], ['march', '🐧', 'Waddle like a penguin', 10], ['shake', '⛄', 'Brrr! Shiver and shake', 0], ['stomp', '🐻‍❄️', 'Stomp like a polar bear', 5], ['push', '⛄', 'Roll a giant snowball', 0], ['flap', '🦉', 'Fly like a snowy owl', 10], ['hop', '🐰', 'Hop like a snow bunny', 5]]],
  racecar: ['Race Day', [['drive', '🏎️', 'Drive the race car: vroom!', 0], ['run', '🏁', 'Race in place!', 10], ['squat', '🛞', 'Change the tire, quick!', 5], ['spin', '🏎️', 'Spin out!', 3], ['jump', '🏆', 'Jump on the winner’s stand', 3], ['shake', '🧽', 'Shake dry after the car wash', 0], ['march', '🏁', 'Victory lap march', 10]]],
  pizza: ['Pizza Party', [['spin', '🍕', 'Spin the pizza dough', 5], ['push', '🧀', 'Knead the dough: push, push!', 10], ['stir', '🍝', 'Stir the pasta pot', 5], ['reach', '🍕', 'Toss the pizza up high', 3], ['tiptoe', '🥤', 'Carry the drinks on tiptoe', 0], ['wiggle', '🧀', 'Wiggle like melty cheese', 0], ['run', '🍕', 'Deliver it fast!', 10]]],
  burger: ['Burger Shake', [['spin', '🍔', 'Flip like a burger: jump and turn!', 3], ['squat', '🍔', 'Stack it tall: squat, then stand', 3], ['wiggle', '🥤', 'Shake like a milkshake', 0], ['stir', '🍟', 'Shake the fries basket', 5], ['tiptoe', '🍦', 'Carry the ice cream on tiptoe', 0], ['run', '🌭', 'Hot dog dash!', 10], ['reach', '🧀', 'Stretch like melty cheese', 0]]],
  grocery: ['Shop Hop', [['push', '🍎', 'Push the shopping cart', 0], ['reach', '🍎', 'Reach for the top shelf', 5], ['squat', '🍞', 'Squat for the bottom shelf', 5], ['hop', '🥚', 'Hop gently, don’t crack the eggs!', 5], ['tiptoe', '🍦', 'Tiptoe to the freezer', 0], ['shake', '🍦', 'Brrr! Shiver in the freezer aisle', 0], ['march', '🍞', 'March to the checkout', 10]]],
  post: ['Mail Run', [['march', '📮', 'March to the mailbox', 10], ['run', '📦', 'Rush the express parcel', 10], ['flap', '✈️', 'Fly like air mail', 0], ['squat', '🎁', 'Lift the big parcel', 3], ['stomp', '📮', 'Stamp, stamp, stamp the letters', 5], ['tiptoe', '✉️', 'Tiptoe the letter to the door', 0], ['spin', '✉️', 'Spin and drop it in the slot', 3]]],
  library: ['Story Stretch', [['tiptoe', '📖', 'Tiptoe, shhh, it’s the library', 0], ['reach', '📕', 'Reach the top shelf', 5], ['flap', '🦉', 'Flap like a wise owl', 10], ['roar', '🦁', 'Roar like a storybook lion', 3], ['stomp', '🐉', 'Stomp like a storybook dragon', 5], ['spin', '📖', 'Turn the page: spin around', 3], ['bow', '📖', 'The end! Take a bow', 0]]],
  police: ['Safety Patrol', [['march', '🚓', 'March on patrol', 10], ['drive', '🚓', 'Drive the police car: wee-oo!', 0], ['push', '🛑', 'Stop! Hands out', 3], ['tiptoe', '🔦', 'Tiptoe on the night shift', 0], ['run', '🚲', 'Pedal your bike in place', 10], ['squat', '🗺️', 'Squat down and look for clues', 3], ['star', '🦺', 'Safety star! Arms out wide', 0]]],
  dentist: ['Brush Dance', [['stir', '🪥', 'Brush your teeth: round and round', 10], ['shake', '🦷', 'Wiggle like a wiggly tooth', 0], ['jump', '✨', 'Sparkly smile jump', 3], ['roar', '🦷', 'Open wide and say “Ahhh!”', 3], ['dance', '🧵', 'Do the floss dance', 5], ['march', '🦷', 'March and chomp, chomp!', 10], ['clap', '🎁', 'Clap for clean teeth', 10]]],
  petshop: ['Pet Parade', [['hop', '🐰', 'Hop like a bunny', 5], ['crawl', '🐶', 'Crawl like a puppy', 0], ['run', '🐹', 'Run on the hamster wheel', 10], ['flap', '🦜', 'Flap like a parrot', 10], ['shake', '🛁', 'Shake off after the bubble bath', 0], ['reach', '🐱', 'Stretch like a cat', 0], ['jump', '⚽', 'Jump for the toy ball', 5]]],
  coffee: ['Café Shuffle', [['stir', '☕', 'Stir the hot cocoa', 10], ['wiggle', '🥤', 'Shake the smoothie', 0], ['tiptoe', '☕', 'Carry the hot cup on tiptoe', 0], ['reach', '🍋', 'Pick lemons from up high', 5], ['spin', '🍵', 'Swirl like a tea bag', 3], ['march', '🍪', 'Cookie delivery march', 10], ['bow', '🧁', 'Bow to your customers', 3]]],
  italian: ['Pasta Party', [['wiggle', '🍝', 'Wiggle like a noodle', 0], ['stir', '🍲', 'Stir the big soup pot', 10], ['spin', '🍕', 'Spin the pizza dough', 5], ['reach', '🥖', 'Stretch tall like a long bread', 0], ['hop', '🧆', 'Bounce like a meatball', 5], ['tiptoe', '🍨', 'Tiptoe the gelato to the table', 0], ['clap', '🍰', 'Bravo! Clap for the chef', 10]]],
  agent: ['Spy Moves', [['tiptoe', '🕵️', 'Sneak past without a sound', 0], ['crawl', '🔦', 'Crawl under the laser beams', 0], ['squat', '🔍', 'Squat down and look for clues', 3], ['push', '🗝️', 'Push open the secret door', 0], ['spin', '🗝️', 'Spin around to check behind you', 3], ['climb', '🗝️', 'Climb the secret ladder', 10], ['run', '📻', 'Run to the getaway car', 10]]],
  airport: ['Take Off!', [['flap', '✈️', 'Arms out! Fly like a plane', 0], ['squat', '🧳', 'Lift your heavy suitcase', 3], ['march', '🧳', 'March to the gate', 10], ['spin', '✈️', 'Turn the propeller', 3], ['star', '✈️', 'Arms up for the scanner', 0], ['run', '🏖️', 'Run, don’t miss your flight!', 10], ['shake', '🌙', 'Bumpy ride! Wobble and shake', 0]]],
  doctor: ['Check-Up Moves', [['jump', '❤️', 'Jump to make your heart beat fast', 10], ['reach', '🌡️', 'Stretch up tall to be measured', 0], ['roar', '🩺', 'Open wide and say “Ahhh!”', 3], ['balance', '🦴', 'Hop on one foot', 5], ['crawl', '🦽', 'Crawl to the waiting room', 0], ['wiggle', '💊', 'Wiggle your fingers and toes', 0], ['hug', '🩹', 'Give your teddy a get-well hug', 0]]],
  dressup: ['Costume Parade', [['march', '👑', 'March like a king or queen', 10], ['flap', '🦸', 'Swoosh your hero cape', 5], ['spin', '👗', 'Twirl in your fancy outfit', 3], ['bow', '🎩', 'Tip your top hat and bow', 3], ['hips', '🕶️', 'Strike a cool pose', 0], ['stir', '🪄', 'Wave your magic wand', 5], ['stomp', '👢', 'Stomp in your fancy boots', 5]]],
  icecream: ['Sundae Shuffle', [['stir', '🍦', 'Scoop the ice cream', 5], ['shake', '🧊', 'Brrr! Shiver like ice cream', 0], ['wiggle', '🍨', 'Wiggle like jiggly jelly', 0], ['jump', '🍌', 'Jump on a banana split', 3], ['squat', '🍨', 'Stack a tall sundae: squat, then stand', 3], ['tiptoe', '🍦', 'Carry the cone, don’t drip!', 0], ['spin', '🥤', 'Swirl like a milkshake', 3]]],
  kitchen: ['Chef Shuffle', [['stir', '🍲', 'Stir the soup pot', 10], ['spin', '🥞', 'Flip a pancake: jump and turn!', 3], ['push', '🍪', 'Roll the dough: push, push!', 10], ['reach', '🧑‍🍳', 'Reach for the top shelf', 5], ['wiggle', '🍝', 'Wiggle like a noodle', 0], ['tiptoe', '🥗', 'Carry the plates on tiptoe', 0], ['clap', '🧑‍🍳', 'Yum! Clap for the chef', 10]]],
  puppet: ['Puppet Show', [['bow', '🎭', 'Take a bow for the crowd', 3], ['clap', '🎟️', 'Clap for the show', 10], ['wiggle', '🎭', 'Floppy puppet! Wiggle all over', 0], ['march', '🎭', 'Walk like a puppet on strings', 10], ['jump', '🎈', 'Jump up and pop the balloon', 3], ['tiptoe', '🎟️', 'Tiptoe to your seat, shhh!', 0], ['dance', '🍿', 'Do a puppet dance', 0]]],
  auto: ['Garage Groove', [['drive', '🚗', 'Drive the car: beep beep!', 0], ['squat', '🛞', 'Change the tire', 5], ['push', '🚗', 'Push the car into the garage', 0], ['stir', '🧽', 'Wash the car: scrub, scrub', 10], ['reach', '💡', 'Check the lights up high', 5], ['spin', '🛞', 'Roll like a tire', 3], ['march', '⛽', 'March to the gas pump', 10]]],
};
// Everyday moves that fill out the deck (5 of these per kit), shown with the kit's own icon.
const EVERYDAY = [
  ['reach', 'Touch your toes, then reach the sky', 5], ['spin', 'Spin around and around', 3], ['jump', 'Big frog jumps', 5],
  ['wiggle', 'Wiggle your whole body', 0], ['balance', 'Stand on one foot like a flamingo', 0], ['clap', 'Clap high, clap low', 10],
  ['march', 'March like a marching band', 10], ['hop', 'Hop on one foot', 5], ['star', 'Star jumps!', 5],
  ['run', 'Run in place, fast feet!', 10], ['stomp', 'Stomp your feet like thunder', 5],
];
// The six special cards: [kind, pose, picture, title, what to do, stars].
const specials = (k) => [
  ['freeze', 'freeze', '🧊', 'Freeze!', 'Everyone freeze like a statue until a grown-up says go!', 1],
  ['choice', 'hips', '⭐', `${possessive(k.childName)} Move`, `${k.childName} makes up a move. Everyone copies!`, 2],
  ['slow', 'tiptoe', '🐢', 'Super Slow', 'Do the last move again in super slow motion', 1],
  ['fast', 'run', '⚡', 'Super Fast', 'Do the last move again, super fast!', 2],
  ['dance', 'dance', '🎶', 'Dance Party', 'Dance until a grown-up counts to 10', 3],
  ['mirror', 'mirror', '🐱', 'Copy Cat', 'Pair up and copy everything your partner does', 1],
];

const gameOf = (k) => MOVES[k.def.id] || ['Move & Play', []];

// The 18 cards in print order: moves and specials mixed, the same every time for a kit.
function deck(k) {
  const rand = rng(seedOf(k.def.id + 'move'));
  const [, themed] = gameOf(k);
  // Prefer everyday moves whose picture isn't already in the themed ones (no two wiggle cards).
  const used = new Set(themed.map(([p]) => p));
  const mixed = shuffle(EVERYDAY, rand);
  const fill = [...mixed.filter(([p]) => !used.has(p)), ...mixed.filter(([p]) => used.has(p))].slice(0, 12 - themed.length).map(([p, t, n]) => [p, k.def.icon, t, n]);
  const stars = shuffle([1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3], rand);
  const moves = [...themed, ...fill].map(([p, e, t, n], i) => ({ kind: 'move', pose: p, pic: e, text: t, times: n, stars: stars[i] }));
  const special = specials(k).map(([kind, p, e, title, text, s]) => ({ kind, pose: p, pic: e, title, text, stars: s }));
  // Two specials per row of three on the first sheet would be too many: one in each row of each sheet.
  const out = [];
  const m = shuffle(moves, rand); const sp = shuffle(special, rand);
  for (let row = 0; row < 6; row++) {
    const at = Math.floor(rand() * 3);
    for (let col = 0; col < 3; col++) out.push(col === at ? sp[row] : m.pop());
  }
  return out;
}

const starRow = (n) => `<span class="mv-stars">${'★'.repeat(n)}<i>${'★'.repeat(3 - n)}</i></span>`;
// How many times: a big number, plus dots to count along for little kids.
const times = (k, n) => (n ? `<div class="mv-times"><b>${n}×</b>${k.little && n <= 10 ? `<span>${'<i></i>'.repeat(n)}</span>` : ''}</div>` : '');

function card(k, c) {
  const special = c.kind !== 'move';
  return `<div class="mv-card ${special ? 'sp' : ''}">
    <div class="mv-top"><span>${special ? 'Special' : 'Everyone'}</span>${starRow(c.stars)}</div>
    ${special ? `<div class="mv-title">${esc(c.title)}</div>` : ''}
    <div class="mv-art">${pose(c.pose)}<span class="mv-pic">${art.pic(c.pic, special ? '.55in' : '.62in')}</span>${times(k, c.times)}</div>
    <div class="mv-text">${esc(c.text)}</div>
  </div>`;
}

function head(title, sub) {
  return `<div class="wp-badge">Print &amp; Play</div><h2 class="pg-title">${esc(title)}</h2><p class="pg-sub">${esc(sub)}</p>`;
}

function cardPage(k, sheet) {
  const [name] = gameOf(k);
  const cards = deck(k).slice(sheet * 9, sheet * 9 + 9);
  return `<section class="page wp wp-move">${head(`${name} Cards ${sheet + 1}`, sheet
    ? 'More cards! Cut on the dashed lines. The game board is on the next page.'
    : 'A get-up-and-move game! Cut out the cards on the dashed lines. Card stock makes them last.')}
    <div class="mv-grid">${cards.map((c) => card(k, c)).join('')}</div></section>`;
}

// A winding board of 24 spaces from Start to the kit's place, plus four stand-up pieces.
function boardPage(k) {
  const [name] = gameOf(k);
  const W = 760; const xs = [70, 194, 318, 442, 566, 690]; const ys = [62, 172, 282, 392];
  const spots = [];
  ys.forEach((y, r) => (r % 2 ? [...xs].reverse() : xs).forEach((x) => spots.push([x, y])));
  const pics = k.def.menu.items.map(([e]) => e);
  const bonus = new Set([4, 9, 14, 19]);
  const road = `M${spots.map(([x, y]) => `${x} ${y}`).join(' L')}`;
  const spaces = spots.map(([x, y], i) => {
    if (i === 0) return `<circle cx="${x}" cy="${y}" r="48" class="mv-start"/><text x="${x}" y="${y}" class="mv-go">START</text>`;
    if (i === spots.length - 1) return `<circle cx="${x}" cy="${y}" r="52" class="mv-end"/>${art.em(x, y - 4, 64, k.def.icon)}`;
    if (bonus.has(i)) return `<circle cx="${x}" cy="${y}" r="40" class="mv-bonus"/>${art.em(x, y, 50, pics[[...bonus].indexOf(i) % pics.length])}`;
    return `<circle cx="${x}" cy="${y}" r="34" class="mv-space"/><text x="${x}" y="${y}" class="mv-num">${i}</text>`;
  }).join('');
  // The kid's own pets or customers when the order named some, then the kit's usual ones.
  const kinds = [...new Set([...k.subjects.map((s) => s.kind), ...k.def.defaultKinds, ...Object.keys(k.def.kinds)])].slice(0, 4);
  const piece = (kind) => {
    const [e, label] = k.def.kinds[kind];
    return `<div class="mv-piece"><div class="mv-half flip">${art.pic(e, '.75in')}</div><div class="mv-half">${art.pic(e, '.75in')}<span>${esc(label)}</span></div><div class="mv-tab">fold</div></div>`;
  };
  const step = (n, text) => `<div><b>${n}</b><span>${text}</span></div>`;
  return `<section class="page wp wp-move wp-move-board">${head(`${name} Race`, `Who will get to ${k.placeName} first?`)}
    <div class="mv-rules">
      ${step(1, 'Shuffle the cards face down. Everyone picks a piece and puts it on Start.')}
      ${step(2, 'Take turns flipping a card. <em>Everyone</em> does the move!')}
      ${step(3, 'Whoever flipped it moves their piece one space for each ★.')}
      ${step(4, `Land on a picture? Everyone cheers! First to ${esc(k.placeName)} wins.`)}
    </div>
    <svg viewBox="0 0 ${W} 454" class="mv-board"><path d="${road}" class="mv-road"/>${spaces}</svg>
    <div class="mv-finish">${esc(k.placeName)}</div>
    <div class="mv-cut">✂ Cut out, fold on the line and stand them up</div>
    <div class="mv-pieces">${kinds.map(piece).join('')}</div>
    <p class="mv-tip"><b>No time for the board?</b> Just flip a card and move! Grown-ups can call “Freeze!” any time.</p>
  </section>`;
}

const movePages = { cards1: (k) => cardPage(k, 0), cards2: (k) => cardPage(k, 1), board: boardPage };

const moveCss = `
.wp-move .pg-sub { margin-bottom:.12in; }
.mv-grid { display:grid; grid-template-columns:repeat(3, 1fr); grid-auto-rows:2.95in; border:2px dashed #9aa3b8; margin-top:.05in; }
.mv-card { position:relative; border:2px dashed #9aa3b8; padding:.1in .12in; display:flex; flex-direction:column; align-items:center; overflow:hidden; }
.mv-card::before { content:''; position:absolute; inset:.07in; border:3px solid var(--teal); border-radius:16px; pointer-events:none; }
.mv-card.sp::before { border-color:var(--orange); background:var(--mint-l); z-index:0; }
.mv-card > * { position:relative; z-index:1; }
.mv-top { width:100%; display:flex; justify-content:space-between; align-items:center; padding:.04in .1in 0; font:700 9pt 'Fredoka'; letter-spacing:.08em; text-transform:uppercase; color:var(--teal-d); }
.mv-card.sp .mv-top span:first-child { color:var(--orange); }
.mv-stars { font-size:15pt; color:var(--gold); -webkit-text-stroke:1px #b8892a; letter-spacing:.02em; }
.mv-stars i { font-style:normal; color:#fff; -webkit-text-stroke:1px #d3d8e3; }
.mv-title { font:700 17pt/1 'Fredoka'; color:var(--navy); margin-top:.02in; }
.mv-art { position:relative; flex:1; width:100%; display:flex; align-items:center; justify-content:center; min-height:0; }
.mv-pose { height:1.35in; width:1.3in; fill:none; stroke:var(--navy); stroke-width:3.4; stroke-linecap:round; stroke-linejoin:round; }
.mv-pose .m { stroke:var(--teal); stroke-width:2.6; }
.mv-pose .f { fill:var(--navy); stroke:none; }
.mv-card.sp .mv-pose .m { stroke:var(--orange); }
.mv-pic { position:absolute; right:.05in; bottom:.02in; }
.mv-times { position:absolute; left:.04in; bottom:.02in; display:flex; flex-direction:column; align-items:center; }
.mv-times b { width:.5in; height:.5in; border-radius:50%; background:var(--teal); color:#fff; display:grid; place-items:center; font:700 15pt 'Fredoka'; }
.mv-times span { display:grid; grid-template-columns:repeat(5, .09in); gap:.03in; margin-top:.04in; }
.mv-times i { width:.09in; height:.09in; border-radius:50%; background:var(--teal-d); }
.mv-text { font:600 13.5pt/1.15 'Fredoka'; text-align:center; color:var(--navy); min-height:.66in; display:flex; align-items:center; padding:0 .06in .06in; }
.little .mv-text { font-size:14.5pt; }
.mv-rules { display:grid; grid-template-columns:1fr 1fr; gap:.08in .25in; margin-top:.02in; }
.mv-rules div { display:flex; align-items:center; gap:.12in; font-size:12pt; line-height:1.25; }
.mv-rules b { width:.38in; height:.38in; flex:none; border-radius:50%; background:var(--teal); color:#fff; display:grid; place-items:center; font:700 14pt 'Fredoka'; }
.mv-rules em { font-style:normal; font-weight:800; color:var(--teal-d); }
.mv-board { display:block; width:100%; margin-top:.15in; }
.mv-road { fill:none; stroke:var(--mint); stroke-width:44; stroke-linecap:round; stroke-linejoin:round; }
.mv-space { fill:#fff; stroke:var(--teal); stroke-width:4; }
.mv-bonus { fill:var(--gold); stroke:var(--orange); stroke-width:4; }
.mv-start { fill:var(--teal); stroke:var(--teal-d); stroke-width:4; }
.mv-end { fill:#fff; stroke:var(--orange); stroke-width:7; stroke-dasharray:14 8; }
.mv-num { font:600 22px 'Fredoka'; fill:#9aa3b8; text-anchor:middle; dominant-baseline:central; }
.mv-go { font:700 22px 'Fredoka'; fill:#fff; text-anchor:middle; dominant-baseline:central; }
.mv-finish { font:700 12pt 'Fredoka'; color:var(--orange); margin:-.12in 0 0 .02in; }
.mv-cut { margin-top:.12in; border-top:3px dashed #b7c0cc; padding-top:.06in; font:600 11pt 'Fredoka'; color:#8a93ab; }
.mv-pieces { display:flex; justify-content:space-around; margin-top:.08in; }
.mv-piece { width:1.45in; border:2px dashed #9aa3b8; }
.mv-half { height:1.1in; display:flex; flex-direction:column; align-items:center; justify-content:center; border-top:2px dashed var(--teal); border-bottom:2px dashed var(--teal); }
.mv-half span { font:600 9pt 'Fredoka'; }
.mv-half.flip { transform:rotate(180deg); border:0; }
.mv-tab { height:.3in; display:grid; place-items:center; font:600 8pt 'Fredoka'; color:#9aa3b8; background:var(--mint-l); }
.mv-tip { margin:.12in 0 0; background:var(--mint-l); border-radius:12px; padding:.08in .18in; font-size:11pt; }
`;

module.exports = { movePages, moveCss, MOVES, POSES, deck };
