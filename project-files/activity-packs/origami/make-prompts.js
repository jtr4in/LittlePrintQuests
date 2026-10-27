// Builds the Gemini-app prompts for the origami activity page, one per theme.
// Run: node project-files/activity-packs/origami/make-prompts.js
// Writes prompts.json and prompts.md next to this file.
const fs = require('fs');
const path = require('path');

// Easy models for ages 3 to 5: three or four folds, big shapes, the kid draws the details.
const MODELS = {
  dog: ['puppy face', [
    'A square turned like a diamond, being folded in half from the top corner down to the bottom corner to make a triangle pointing down',
    'The triangle with its left and right corners being folded down to make two floppy ears',
    'The small bottom point being folded up a little to make the chin',
    'The finished puppy face shape, with the face area left blank for the child to draw on'] ],
  dalmatian: ['dalmatian puppy face', null], // same folds as dog
  beaver: ['beaver face', null],             // same folds as dog, kid draws two big front teeth
  cat: ['cat face', [
    'A square turned like a diamond, being folded in half from the bottom corner up to the top corner to make a triangle pointing down',
    'The triangle with its left and right corners being folded up to make two pointy ears',
    'The top edge between the ears being folded down a little behind the head to flatten it',
    'The finished cat face shape, with the face area left blank for the child to draw on'] ],
  fox: ['fox face', [
    'A square turned like a diamond, being folded in half from the bottom corner up to the top corner to make a triangle pointing down',
    'The triangle with its left and right corners being folded up past the top edge to make tall pointy ears',
    'The paper turned over, showing the head shape with a pointy chin at the bottom',
    'The finished fox face shape, with the face area left blank for the child to draw on'] ],
  bear: ['teddy bear face', [
    'A square turned like a diamond, being folded in half from the bottom corner up to the top corner to make a triangle pointing down',
    'The triangle with its left and right corners being folded up just a little to make two small round ears',
    'The small bottom point being folded up to make a flat chin',
    'The finished teddy bear face shape, with the face area left blank for the child to draw on'] ],
  bunny: ['bunny face', [
    'A square turned like a diamond, being folded in half from the bottom corner up to the top corner to make a triangle pointing down',
    'The triangle with its left and right corners being folded straight up, standing tall above the top edge, to make two long ears',
    'The small bottom point being folded up a little to make the chin',
    'The finished bunny face shape, with the face area left blank for the child to draw on'] ],
  tulip: ['tulip flower', [
    'A square turned like a diamond, being folded in half from the top corner down to the bottom corner to make a triangle pointing down',
    'The left corner of the triangle being folded up at a slant so it sticks up above the top edge',
    'The right corner being folded up the same way, making the tulip shape',
    'The finished tulip, laid on a simple drawn green stem with two leaves'] ],
  volcano: ['volcano', [
    'A square turned like a diamond, being folded in half from the top corner down to the bottom corner, then turned so the triangle points up',
    'The top point of the triangle being folded down to make a flat volcano top',
    'The finished volcano shape, flat on top and wide at the bottom',
    'The finished volcano with simple drawn lava running down from the top'] ],
  cape: ['hero cape', [
    'A square turned like a diamond, being folded in half from the top corner down to the bottom corner to make a triangle pointing down',
    'The long top edge of the triangle being folded down a little to make a collar strip',
    'The finished cape shape, a triangle with a folded collar along the top',
    'The finished cape tied around a small toy figure with a piece of string through the collar'] ],
  sailboat: ['sailboat', [
    'A square turned like a diamond, being folded in half from the top corner down to the bottom corner, then turned so the triangle points up',
    'The bottom edge of the triangle being folded up a little to make the boat’s hull',
    'The finished sailboat shape: a tall triangle sail sitting on a flat hull',
    'The finished sailboat floating on simple drawn waves'] ],
  rocket: ['rocket', [
    'A square turned like a diamond, with a dashed line down the middle from the top corner to the bottom corner',
    'The left and right top edges being folded in to meet at the middle line, making a long pointy shape',
    'The bottom point being folded up to make a flat bottom',
    'The finished rocket, pointy top and flat bottom, with simple drawn flames under it'] ],
  dragon: ['pet dragon face', null], // fox folds
  unicorn: ['unicorn face', null],   // fox folds, kid draws the horn
  fish: ['fish', [
    'A square turned like a diamond, with a dashed line down the middle from the left corner to the right corner',
    'The top and bottom edges on the right side being folded in to meet at the middle line, making a long pointy shape',
    'The narrow pointy end being folded back outward a little to make a tail fin',
    'The finished fish shape, round body on the left and tail fin on the right'] ],
  tail: ['mermaid tail', null], // fish folds, held upright
  hat: ['hat', [
    'A square turned like a diamond, being folded in half from the top corner down to the bottom corner, then turned so the triangle points up',
    'The left corner being folded across to touch the right edge',
    'The right corner being folded across to touch the left edge, on top',
    'The top flap folded down on the front and the back, making the finished hat'] ],
  cup: ['cup', null],   // hat folds, shown upright as a cup
  carton: ['fries carton', null],
  puppet: ['finger puppet', null],
  note: ['secret note', [
    'A square being folded in half to make a rectangle',
    'The rectangle being folded in half again to make a smaller square',
    'The small square being folded in half once more to make a tiny rectangle',
    'The tiny folded secret note, ready to hide'] ],
  fan: ['paper fan', [
    'A square with one edge being folded over a finger-wide strip',
    'The paper being turned over and folded back the same width, starting a zig-zag',
    'The zig-zag folds continuing all the way across the paper',
    'The folded strip pinched at one end and opened out into a finished fan'] ],
  bowtie: ['bow tie', null], // fan folds pinched in the middle
  badge: ['badge', [
    'A square with dashed lines from corner to corner, crossing in the middle',
    'All four corners being folded in to touch the center point',
    'The smaller square turned so it sits like a diamond',
    'The finished diamond badge with a simple drawn star in the middle'] ],
  envelope: ['envelope', [
    'A square turned like a diamond, with the left and right corners being folded in to the center',
    'The bottom corner being folded up past the center',
    'The top corner being folded down over the others like a flap',
    'The finished envelope with a small drawn heart sticker holding the flap'] ],
  bookmark: ['corner bookmark', [
    'A square turned like a diamond, being folded in half from the top corner down to the bottom corner, then turned so the triangle points up',
    'Only the top layer of the top point being folded down to the bottom edge',
    'The left and right corners being folded up and tucked into the pocket in front',
    'The finished corner bookmark slipped over the corner of a book page'] ],
  car: ['car', [
    'A square being folded in half from top to bottom to make a long rectangle',
    'The top left corner being folded down a little at a slant to make the windshield',
    'The top right corner being folded down a little the same way to make the back window',
    'The finished car shape with two simple drawn wheels'] ],
  plane: ['airplane', [
    'A square turned like a diamond, with a dashed line down the middle from the top corner to the bottom corner',
    'The left and right top edges being folded in to meet at the middle line, making a pointy nose',
    'The shape being folded in half along the middle line',
    'Each side being folded down to make the wings, the finished airplane'] ],
  slice: ['pizza slice', [
    'A square turned like a diamond, being folded in half from the top corner down to the bottom corner to make a triangle pointing down',
    'The long top edge of the triangle being folded down a little to make the crust',
    'The finished pizza slice shape: a triangle with a thick crust along the top',
    'The finished pizza slice with simple drawn toppings'] ],
  cone: ['ice cream cone', [
    'A square turned like a diamond, with a dashed line down the middle from the top corner to the bottom corner',
    'The left and right bottom edges being folded in to meet at the middle line, making a long cone point at the bottom',
    'The top point being folded down a little to make a round-looking scoop top',
    'The finished ice cream cone with simple drawn sprinkles on the scoop'] ],
  carrot: ['carrot', null], // cone folds, kid draws green leaves
  tree: ['Christmas tree', null], // rocket folds
  pennant: ['racing flag', null], // slice folds, crust is the pole strip
};
const SAME = { dalmatian: 'dog', beaver: 'dog', dragon: 'fox', unicorn: 'fox', tail: 'fish', cup: 'hat', carton: 'hat', puppet: 'hat',
  bowtie: 'fan', carrot: 'cone', tree: 'rocket', pennant: 'slice' };
// Small wording tweaks for models that borrow another's folds (last step only).
const LAST = {
  dalmatian: 'The finished dalmatian puppy face shape, with the face area left blank for the child to draw on',
  beaver: 'The finished beaver face shape, with the face area left blank for the child to draw on',
  dragon: 'The finished dragon face shape, with the face area left blank for the child to draw on',
  unicorn: 'The finished unicorn face shape, with the face area left blank and a simple drawn horn between the ears',
  tail: 'The finished mermaid tail, standing upright with the fin at the top',
  cup: 'The top flap folded down on the front and the back, making the finished cup, shown upright',
  carton: 'The top flap folded down on the front and the back, making a finished fries carton with simple drawn fries sticking out',
  puppet: 'The top flap folded down on the front and the back, making a finished finger puppet, shown on a child’s fingertip',
  bowtie: 'The folded strip pinched in the middle and opened out on both sides into a finished bow tie',
  carrot: 'The finished carrot shape, pointy at the bottom, with simple drawn green leaves at the top',
  tree: 'The finished Christmas tree, pointy top and flat bottom, with a simple drawn star on top',
  pennant: 'The finished racing flag, taped to a straw along its folded edge',
};
function stepsOf(m) {
  const base = MODELS[SAME[m] || m][1].slice();
  if (LAST[m]) base[3] = LAST[m];
  return base;
}

// theme id -> [model, paper look]
const THEMES = {
  dino: ['volcano', 'warm brown rock texture with small scattered dinosaur footprints and tiny fern leaves'],
  hero: ['cape', 'bold red with small scattered yellow lightning bolts and blue stars'],
  pirate: ['sailboat', 'old map parchment color with tiny compass roses, dotted trails and small gold coins'],
  space: ['rocket', 'deep navy with tiny white stars, small orange planets and little moons'],
  royal: ['dragon', 'soft green dragon scales with tiny gold crowns scattered on top'],
  unicorn: ['unicorn', 'pale lavender with small pastel rainbows, tiny stars and little gems'],
  mermaid: ['tail', 'shimmering teal fish scales with tiny pink pearls'],
  construction: ['hat', 'bright safety yellow with small scattered bolts, nuts and tiny wrenches'],
  vet: ['dog', 'soft golden-brown fur color with very light fur texture and a few tiny paw prints'],
  racecar: ['car', 'bright red with thin white racing stripes and tiny checkered flags'],
  fire: ['dalmatian', 'white with round black dalmatian spots and a few tiny red fire helmets'],
  agent: ['note', 'dark charcoal grey with tiny magnifying glasses, footprints and fingerprint swirls in light grey'],
  ice: ['fox', 'icy pale blue with small white snowflakes and soft frost sparkles'],
  puppet: ['puppet', 'deep red velvet curtain color with tiny gold stars'],
  dressup: ['fan', 'pink with small gold sequins, tiny bows and little stars'],
  police: ['badge', 'navy blue with small gold stars and thin light-blue stripes'],
  doctor: ['bear', 'soft honey-brown fur color with tiny bandages and small hearts'],
  dentist: ['beaver', 'warm brown fur color with tiny sparkly toothbrushes and small bubbles'],
  auto: ['car', 'bright blue with small scattered wrenches, gears and tiny tires'],
  post: ['envelope', 'light kraft-paper brown with tiny postage stamps, small hearts and airmail stripes along the edges'],
  library: ['bookmark', 'soft cream with small scattered books, tiny stars and little reading glasses'],
  airport: ['plane', 'sky blue with small white clouds and tiny dotted flight paths'],
  pizza: ['slice', 'golden cheese yellow with small pepperoni circles, olive rings and basil leaves'],
  burger: ['carton', 'bright red with small yellow stars and tiny french fries'],
  italian: ['bowtie', 'red and white checkered tablecloth pattern'],
  coffee: ['cup', 'warm cream with tiny coffee beans, small steam swirls and little hearts'],
  icecream: ['cone', 'soft pink with tiny rainbow sprinkles scattered all over'],
  kitchen: ['hat', 'crisp white with small light-grey kitchen spoons, whisks and tiny wheat stalks'],
  grocery: ['carrot', 'bright orange with small scattered fruits and vegetables in light outline'],
  petshop: ['fish', 'bright orange goldfish scales with tiny bubbles'],
  halloween: ['cat', 'black with small orange pumpkins, tiny purple bats and little stars'],
  christmas: ['tree', 'deep green with small white snowflakes, tiny red ornaments and gold stars'],
  valentine: ['tulip', 'bright red with tiny pink and white hearts'],
  easter: ['bunny', 'soft pastel yellow with small pastel eggs and tiny flowers'],
};
const NAMES = { hat: { construction: 'hard hat', kitchen: 'chef’s hat' } };

function prompt(theme, model, look) {
  const name = (NAMES[model] && NAMES[model][theme]) || MODELS[model][0];
  const steps = stepsOf(model);
  return `Create a printable activity page for a 4-year-old, portrait, 8.5x11 inches, white background, high resolution for print.

TOP: A large square of origami paper, about 7 inches wide, centered, with a thick dashed "cut here" line around it and a small scissors icon at one corner. The square is filled edge to edge with an all-over pattern: ${look}. The pattern has no up or down side and no central picture.

BOTTOM: A very simple origami diagram for a ${name}, shown as 4 large numbered panels in one row, read left to right:
1. ${steps[0]}
2. ${steps[1]}
3. ${steps[2]}
4. ${steps[3]}
Each panel shows the paper in a flat color matching the pattern, with a thick dashed line where to fold and a big curved arrow for the fold direction. Extra large, simple, friendly shapes, like a preschool picture book.

No faces on objects: no smiley faces on stars, food, hearts, planets or anything else. Animal faces stay blank for the child to draw.

Only text allowed: the numbers 1 to 4. No other words, titles, labels or logos.`;
}

const out = Object.entries(THEMES).map(([theme, [model, look]], i) => ({
  n: i + 1, theme, model: (NAMES[model] && NAMES[model][theme]) || MODELS[model][0], file: `${theme}.jpg`, prompt: prompt(theme, model, look),
}));
const dir = __dirname;
fs.writeFileSync(path.join(dir, 'prompts.json'), JSON.stringify(out, null, 2) + '\n');
fs.writeFileSync(path.join(dir, 'prompts.md'), '# Origami page prompts (Gemini app)\n\nOne per theme. Save each result as the file name shown.\n\n' +
  out.map((p) => `## ${p.n}. ${p.theme}: ${p.model} (save as \`${p.file}\`)\n\n\`\`\`\n${p.prompt}\n\`\`\`\n`).join('\n'));
console.log(out.length, 'prompts');
