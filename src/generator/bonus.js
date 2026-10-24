// Two bonus games at the back of every hunt, for replay on another day:
//
// - Picture hunt (two pages): twelve small picture cards to cut out and hide, plus a sheet with two
//   matching checklists (one per kid, or two teams) to tick off as each picture turns up.
// - Look-around hunt (one page): twelve themed things to spot outside or around the neighborhood,
//   like decorations for the holidays and outdoor finds that fit the other themes.
//
// Pictures are the play kit illustrations (src/kits/art/<theme>/<slug>.webp). An entry is
// 'slug|Label' for the theme's own art, 'other-theme/slug|Label' to borrow another kit's art,
// 'svg:<name>|Label' for a drawing in SVGS below, or '<emoji>|Label' when no illustration fits.

const fs = require('fs');
const path = require('path');

const ART_DIR = path.join(__dirname, '..', 'kits', 'art');

// Simple drawings for things with no illustration or emoji.
const SVGS = {
  wreath: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="21" fill="none" stroke="#3c8d4f" stroke-width="12"/><circle cx="32" cy="32" r="21" fill="none" stroke="#5fb36f" stroke-width="4" stroke-dasharray="3 6"/><circle cx="16" cy="22" r="3" fill="#d63a3a"/><circle cx="48" cy="24" r="3" fill="#d63a3a"/><circle cx="20" cy="46" r="3" fill="#d63a3a"/><circle cx="46" cy="44" r="3" fill="#d63a3a"/><path d="M32 52l-9 8 2-11zM32 52l9 8-2-11z" fill="#d63a3a"/><circle cx="32" cy="52" r="4" fill="#b22a2a"/></svg>`,
  hydrant: `<svg viewBox="0 0 64 64"><rect x="20" y="16" width="24" height="40" rx="4" fill="#d63a3a"/><path d="M18 16a14 10 0 0 1 28 0z" fill="#d63a3a"/><rect x="29" y="2" width="6" height="7" rx="2" fill="#b22a2a"/><rect x="10" y="28" width="10" height="10" rx="2" fill="#b22a2a"/><rect x="44" y="28" width="10" height="10" rx="2" fill="#b22a2a"/><circle cx="32" cy="34" r="5" fill="#b22a2a"/><rect x="14" y="54" width="36" height="6" rx="2" fill="#8a1f1f"/></svg>`,
};

// The picture hunt: twelve pictures per theme.
const PICTURES = {
  dino: ['t-rex|T. rex', 'long-neck|Long-neck', 'dino-egg|Dino egg', 'volcano-show|Volcano', 'bone-pit|Bone', 'fern-forest|Palm tree', 'pickaxe|Pickaxe', 'magnifier|Magnifier', 'ranger-hat|Ranger hat', 'shiny-rock|Shiny rock', '1f33f|Little plant', 'lab-tour|Microscope'],
  hero: ['superhero|Superhero', 'shield|Shield', 'mask|Masks', 'robo-hero|Robot', 'captain-kitty|Captain Kitty', 'heli-ride|Helicopter', 'speed-shoes|Speed shoes', 'super-torch|Flashlight', 'hero-radio|Hero radio', 'alert|Alarm light', 'freeze-ray|Snowflake', '1f512|Lock'],
  pirate: ['parrot|Parrot', 'a-ship|Ship', 'treasure-island|Island', 'gold-coin|Gold coin', 'spyglass|Spyglass', 'drop-anchor|Anchor', 'friendly-shark|Shark', 'old-key|Old key', 'map-reading|Map', 'heading|Compass', 'octopus|Octopus', 'gold|Bag of gold'],
  space: ['astronaut|Astronaut', '3-2-1|Rocket', 'saturn|Saturn', 'friendly-alien|Alien', 'the-moon|Moon', 'a-comet|Comet', 'space-station|Satellite', 'sun|Sun', 'mars|Mars', 'the-stars|Star', 'back-to-earth|Earth', 'freeze-dried-pizza|Space pizza'],
  royal: ['castle-tour|Castle', 'pet-dragon|Dragon', 'crown|Crown', 'princess|Princess', 'prince|Prince', 'unicorn|Unicorn', 'wizard|Wizard', 'horse-ride|Horse', 'jewels|Jewel', 'frog-prince|Frog', 'ring-bells|Bell', 'a-gift|Gift'],
  unicorn: ['unicorn|Unicorn', 'rainbow-gem|Gem', 'rainbow-glow|Rainbow', 'rainbow-butterfly|Butterfly', 'cloud-meadow|Cloud', 'star-falls|Star', 'cupcake|Cupcake', 'candy-hills|Lollipop', 'mane-tail|Ribbon', '1f337|Tulip', 'blossom-trail|Blossom', 'apple|Apple'],
  mermaid: ['mermaid|Mermaid', 'dolphin|Dolphin', 'octopus|Octopus', 'starfish|Starfish', 'tropical-fish|Fish', 'puffer-fish|Puffer fish', 'shell-or-scales|Shell', 'pearl-bed|Pearl', 'sea-glass|Sea glass', 'swimming|Wave', '1f33f|Seaweed', 'pirate/whale|Whale'],
  construction: ['digger|Digger', 'crane|Crane', 'builder|Builder', 'barrier|Barrier', 'stack-bricks|Bricks', 'hammer|Hammer', 'saw|Saw', 'wrench|Wrench', 'screwdriver|Screwdriver', 'ruler|Ruler', 'bolts|Nut and bolt', 'safety-star|Safety vest'],
  vet: ['dog|Puppy', 'check-up|Stethoscope', 'bandage|Bandage', 'paws|Paw prints', 'vet-clinic-logo|Animal hospital', 'temperature|Thermometer', 'toothbrush|Toothbrush', 'bubble-bath|Bathtub', 'flashlight|Flashlight', 'x-ray|Bone', 'teeth|Tooth', '1f4cb|Clipboard'],
  easter: ['bunny|Bunny', 'golden-egg|Golden star', 'chick|Chick', 'full-basket|Basket', 'painted-egg|Paint palette', 'plain-egg|Egg', 'carrot-patch|Carrot', 'tulip-garden|Tulip', 'flowers|Blossom', 'chocolate-egg|Chocolate', 'basket-ribbon|Bow', '1f33c|Flower'],
  halloween: ['friendly-ghost|Ghost', 'pumpkin|Pumpkin', 'bat|Bat', 'candy-drop|Candy', 'lollipop|Lollipop', 'broom-ride|Broom', '1fa84|Magic wand', 'frog|Frog', 'moonbeam|Moon', '2697|Potion', '1f4da|Spell books', 'star-dust|Star'],
  christmas: ['santa|Santa', 'reindeer|Reindeer', 'presents|Present', 'merry-christmas|Christmas tree', 'cookie|Cookie', 'jingle|Bell', 'hot-cocoa|Hot cocoa', 'peppermint|Peppermint', 'sleigh-ride|Sled', 'teddy-bear|Teddy bear', 'milk|Milk', 'reindeer-carrot|Carrot'],
  valentine: ['hearts|Heart', 'teddy-bear|Teddy bear', 'balloon|Balloon', 'candy-heart|Candy', 'rose|Rose', 'chocolate|Chocolate', 'cupcake|Cupcake', 'sent-a-valentine|Love note', 'send|Mailbox', 'crayons|Crayon', 'a-song|Music', '1f6cd|Gift bags'],
  fire: ['fire-truck|Fire truck', '1f9d1-200d-1f692|Firefighter', 'extinguisher|Extinguisher', 'boots|Boots', 'rescue-star|Star', 'call-base|Radio', 'smoke-alarm|Alarm bell', 'fire-grab-the-hose|Flame', 'dog-treat|Bone', 'fires-out-hooray|Trophy', 'hot-dog|Hot dog', 'vet/dog|Fire pup'],
  ice: ['ice-palace|Ice palace', 'snowman|Snowman', 'penguin|Penguin', 'ice-gem|Ice gem', 'tiara|Tiara', 'catching-flakes|Snowflake', 'skating|Ice skate', 'sleigh-ride|Sled', 'frosty-forest|Pine tree', 'cocoa-sipping|Cocoa', 'crystal-ball|Crystal ball', 'ice-cream|Ice cream'],
  racecar: ['race-car|Race car', 'starting-line|Traffic light', 'tires|Tire', 'turbo-turtle|Turbo Turtle', 'fuel-tank|Fuel pump', 'grand-prix|Flag', 'trophy-polish|Trophy', 'headlights|Light bulb', 'clean-and-shiny|Sponge', 'honk-honk|Horn', 'quick-fix|Wrench', 'oil-change|Oil can'],
  pizza: ['delivery|Scooter', 'extra-cheese|Cheese', 'peppers|Pepper', 'mushrooms|Mushroom', 'garlic-bread|Garlic bread', 'olives|Olives', 'pineapple|Pineapple', 'pasta|Pasta', 'ice-cream|Ice cream', 'chicken-wings|Wings', 'salad|Salad', 'spread-on-the-tomato-sauce|Tomato'],
  burger: ['burger|Burger', 'fries|Fries', 'cheese|Cheese', 'tomato|Tomato', 'pickles|Pickle', 'lettuce|Lettuce', 'bacon|Bacon', 'corn-cob|Corn', 'chicken-bites|Drumstick', 'salad|Salad', 'space/rocket-fuel-shake|Milkshake', 'pizza/ice-cream|Ice cream'],
  grocery: ['cart-champ|Cart', 'veggies|Broccoli', 'cheese|Cheese', 'grapes|Grapes', 'croissants|Croissant', 'corn|Corn', 'butter|Butter', 'pasta|Pasta', 'tomato|Tomato', 'soup|Soup can', '1f37f|Popcorn', 'unicorn/apple|Apple'],
  post: ['parcel|Package', 'letter|Letter', 'postcard|Postcard', 'air-mail|Airplane', '1f682|Train', 'pop-it-in-the-mail-box|Mailbox', 'weigh|Scale', '1f33b|Sunflower', 'lion|Lion stamp', '1f433|Whale stamp', 'hello-from-the-beach|Beach', 'greetings-from-the-hills|Mountain'],
  library: ['owl|Owl', 'story-book|Story book', 'fairy-tale|Fairy', 'bookmark|Bookmark', 'chapter-book|Chapter book', 'pencil|Pencil', '1f6cb|Reading chair', 'due-in-1-week|Calendar', 'take-it-and-your-library-card-to-the-des|Library card', 'dino/magnifier|Magnifier', 'valentine/crayons|Crayon', 'halloween/1f4da|Book stack'],
  police: ['police-station|Police car', '1f415|Police dog', 'bike-licence|Bike', 'car-keys|Keys', '1f4de|Phone', 'front-desk|Desk bell', 'parking-ticket|Ticket', 'missed-stop|Stop sign', '1f6b8|Crossing sign', 'hero/super-torch|Flashlight', 'christmas/teddy-bear|Teddy', 'hero/alert|Siren'],
  dentist: ['vet/teeth|Tooth', 'vet/toothbrush|Toothbrush', 'tooth-mirror|Mirror', 'flossed|Floss', 'rinsed|Water drop', 'gloves|Gloves', 'x-ray|Camera', 'next-visit|Calendar', 'unicorn/apple|Apple', 'christmas/smile|Big smile', 'vet/1f4cb|Clipboard', 'hero/super-torch|Flashlight'],
  petshop: ['hamster|Hamster', 'bird|Bird', 'yarn-ball|Yarn ball', 'playtime|Ball', 'walk|Dog', 'brushed|Comb', 'fresh-water|Water', '1f3be|Tennis ball', 'hero/captain-kitty|Kitty', 'mermaid/tropical-fish|Fish', 'vet/paws|Paw prints', 'fire/dog-treat|Dog bone'],
  coffee: ['pot-of-tea|Teapot', 'waffle|Waffle', 'bagel|Bagel', 'honey|Honey', 'lemonade|Lemon', 'napkins|Napkins', 'christmas/hot-cocoa|Cocoa', 'christmas/cookie|Cookie', 'christmas/cupcake|Cupcake', 'christmas/donut|Donut', 'christmas/milk|Milk', 'grocery/croissants|Croissant'],
  italian: ['meatballs|Meatball', '1f468-200d-1f373|Chef', '1f34b|Lemon', 'table-5|Candle', '1f4d6|Menu', 'pizza/pasta|Spaghetti', 'pizza/garlic-bread|Bread', 'pizza/extra-cheese|Cheese', 'pizza/spread-on-the-tomato-sauce|Tomato', 'pizza/olives|Olives', 'pizza/ice-cream|Gelato', 'grocery/grapes|Grapes'],
  auto: ['1f9f0|Toolbox', 'battery|Battery', 'brakes|Stop sign', 'keys|Keys', 'wipers|Rain cloud', 'fill-a-bucket-with-warm-soapy-water|Bucket', 'racecar/car|Car', 'racecar/tires|Tire', 'racecar/fuel-tank|Fuel pump', 'racecar/oil-change|Oil can', 'construction/wrench|Wrench', 'racecar/clean-and-shiny|Sponge'],
  kitchen: ['pancakes|Pancakes', 'tacos|Taco', 'avocado|Avocado', 'garlic|Garlic', 'rice|Rice', 'beans|Beans', 'potatoes|Potato', 'a-pinch-of-salt|Salt', 'forks|Fork and knife', '23f2|Timer', 'grocery/cheese|Cheese', 'burger/tomato|Tomato'],
  doctor: ['doctor-bag|Doctor’s bag', 'vet/bandage|Bandage', 'vet/pills|Medicine', 'vet/temperature|Thermometer', 'vet/x-ray|X-ray', 'vet/check-up|Check-up', 'vet/vaccine|Shot', 'vet/1f4cb|Chart', 'vet/flashlight|Flashlight', 'wheelchair-ride|Wheelchair', 'dentist/gloves|Gloves', 'christmas/teddy-bear|Teddy patient'],
  puppet: ['puppet-stage|Stage', 'puppets|Sock puppets', 'fox|Fox puppet', 'a-birthday|Cake', 'grocery/1f37f|Popcorn', 'royal/crown|Crown', 'royal/pet-dragon|Dragon', 'valentine/balloon|Balloon', 'row-a|Row A', 'row-b|Row B', 'valentine/rose|Flowers', 'royal/castle-tour|Castle'],
  agent: ['hq|Detective', 'crack-a-code|Lock and key', 'fingerprints-match|Fingerprints', 'footprints-match|Footprints', 'spy-shades|Spy shades', 'wear-a-disguise|Disguise', 'notebook|Notebook', 'found-it|Bullseye', 'dino/magnifier|Magnifier', 'pirate/old-key|Old key', 'construction/cookie|Cookie', 'royal/crown|Crown'],
  dressup: ['costume-wardrobe|Wardrobe', 'a-hat|Top hat', 'dresses|Gown', 'masks|Mask', 'goggles|Goggles', 'cool-shades|Shades', 'scarves|Scarf', 'royal/crown|Crown', 'hero/mask|Hero mask', 'fire/boots|Boots', 'royal/wizard|Wizard', 'royal/jewels|Jewels'],
  icecream: ['sundae|Sundae', 'a-cherry|Cherries', 'snow-cone|Snow cone', 'ice-pop|Ice pop', 'blueberries|Blueberries', 'nuts|Nuts', 'freezer|Freezer', 'pizza/ice-cream|Ice cream', 'ice/penguin|Penguin', 'royal/strawberries|Strawberries', 'christmas/milk|Milk', 'christmas/cupcake|Cupcake'],
  airport: ['airport-scene|Airport', 'passport|Passport', 'suitcase|Suitcase', 'carry-on|Backpack', 'headphones|Headphones', 'arrivals|Airplane', '1f6c3|Customs', 'paris|Eiffel Tower', 'big-city|Statue', 'grandmas|Grandma’s house', 'fun-fair-city|Ferris wheel', 'desert-dunes|Camel'],
};

// The look-around hunt: a title, where to play it, twelve things to spot, and a super-spotter challenge.
const OUTSIDE = 'Take it on a walk, to the park or out in the yard.';
const LOOK = {
  dino: { title: 'Dino Ranger Field Walk', where: OUTSIDE, extra: 'Super spotter: find a rock, a leaf and a stick that are all bigger than your hand.',
    items: ['🪨|A rock bigger than your hand', 'dino-egg|A stone shaped like an egg', 'bone-pit|A stick shaped like a bone', '1f33f|A leafy plant (dino lunch!)', 'fern-forest|A tree taller than a long-neck', '🍁|A leaf bigger than your hand', '🐦|A bird (dinosaurs’ cousin!)', '🐞|A bug on the move', '👣|A footprint in mud, sand or snow', 'volcano-show|A hill to stomp up', '🌼|A wildflower', '🐿️|A squirrel'] },
  hero: { title: 'Hero Patrol Walk', where: OUTSIDE, extra: 'Hero challenge: do one good deed on your walk, like holding a door or saying hi.',
    items: ['save-the-park|A tree to protect', 'fly|A bird flying high', '🚦|A traffic light', 'speed-shoes|Someone running fast', '🚩|A flag', '🏢|A building taller than a house', '🐶|A dog (wave from far away)', 'shield|A circle shape', '📫|A mailbox', 'super-speed|Something super fast', '🦸|Someone being helpful', '⭐|A star shape'] },
  pirate: { title: 'Pirate Lookout Walk', where: OUTSIDE, extra: 'Captain’s challenge: walk ten big pirate steps and say “Arrr!” at the end.',
    items: ['mermaid/swimming|Water: a puddle, pond or stream', 'parrot|A bird', 'shell-beach|A shell or a smooth stone', '🚩|A flag waving in the wind', 'a-ship|A boat (a picture counts)', '❌|An X shape', '🌳|A tree tall enough for a lookout', 'gold-coin|Something gold or shiny', 'heading|A sign with an arrow', 'drop-anchor|Something heavy and metal', '☁️|A cloud shaped like a ship', '🦀|A crab or a crawly bug'] },
  space: { title: 'Star Spotter Walk', where: OUTSIDE, extra: 'Astronaut challenge: count down 10, 9, 8 … and blast off with a big jump!',
    items: ['the-moon|The moon (it’s out in the day too!)', 'sun|The sun (don’t look right at it)', '✈️|An airplane in the sky', 'unicorn/cloud-meadow|A fluffy cloud', 'saturn|Something round like a planet', 'space-station|A satellite dish or antenna', '🛸|Something shaped like a UFO', 'mars|Something red like Mars', '🪨|A moon rock', '🌑|Your own shadow', '🕳️|A crater (a dip in the ground)', 'the-stars|A star (on a sign, or in the night sky)'] },
  royal: { title: 'Royal Garden Walk', where: OUTSIDE, extra: 'Royal challenge: bow or curtsy to the biggest tree you see.',
    items: ['🌹|A rose or other flower', 'castle-tour|A building that looks like a castle', '1f6a9|A flag', 'horse-ride|A horse (a picture counts)', 'frog-prince|A frog or a toad', 'crown|Something gold or shiny', '🌳|A tree as tall as a tower', 'unicorn/rainbow-butterfly|A butterfly', 'strawberries|Berries on a bush', '⛲|A fountain or birdbath', '🚪|A big door or gate', 'pet-dragon|A cloud shaped like a dragon'] },
  unicorn: { title: 'Rainbow Walk', where: OUTSIDE, extra: 'Magic challenge: find all six rainbow colors in one spot.',
    items: ['🔴|Something red', '🟠|Something orange', '🟡|Something yellow', '🟢|Something green', '🔵|Something blue', '🟣|Something purple', 'rainbow-glow|A rainbow (or rainbow colors)', 'rainbow-butterfly|A butterfly', 'cloud-meadow|A fluffy cloud', 'blossom-trail|A pink flower', 'star-falls|Something sparkly', 'mane-tail|Something with a long tail'] },
  mermaid: { title: 'Sea Seeker Walk', where: OUTSIDE, extra: 'Mermaid challenge: swim your arms like a mermaid all the way home.',
    items: ['💧|A puddle', 'shell-or-scales|A shell or a swirly stone', 'fins-tail|A fish (a pond or a picture)', '🦆|A duck or water bird', 'swimming|Something wavy', '🫧|Bubbles', 'sea-glass|Something shiny like sea glass', '🔵|Something sea blue', '🟢|Something sea green', 'starfish|Something star-shaped', '1f33f|A plant that looks like seaweed', '🌧️|Rain or a sprinkler'] },
  construction: { title: 'Build Site Spotter', where: OUTSIDE, extra: 'Crew challenge: count the windows on the next house you see.',
    items: ['digger|A digger or tractor', 'crane|A crane', 'barrier|An orange cone or barrier', 'safety-star|Someone in a safety vest', 'stack-bricks|A brick wall', '🚚|A dump truck or big truck', 'build-a-house|A house being built or fixed', 'fix-the-road|Fresh lines on a road', 'dig-a-hole|A hole or a pile of dirt', '🪜|A ladder', 'auto/brakes|A stop sign', 'hammer|Someone using a tool'] },
  vet: { title: 'Animal Spotter Walk', where: OUTSIDE, extra: 'Vet’s rule: look with your eyes and ask a grown-up before petting.',
    items: ['dog|A dog', '🐈|A cat', 'petshop/bird|A bird', '🐿️|A squirrel', '🐛|A bug or a worm', 'paws|Paw prints', '🦆|A duck', '🐝|A bee (look, don’t touch!)', '🐌|A snail', '🪺|A nest', '🐴|A horse or farm animal', 'unicorn/rainbow-butterfly|A butterfly'] },
  easter: { title: 'Spring Spotter Walk', where: OUTSIDE, extra: 'Bunny challenge: hop like a bunny to the next tree.',
    items: ['plain-egg|An egg decoration', 'bunny|A bunny', '🐦|A bird', 'tulip-garden|Tulips', 'flowers|A tree with blossoms', '1f33c|A yellow flower', 'unicorn/rainbow-butterfly|A butterfly', '🐛|A caterpillar or worm', '🐝|A bee (look, don’t touch!)', 'full-basket|An Easter basket', 'carrot-patch|A garden or veggie patch', '☁️|A cloud shaped like an animal'] },
  halloween: { title: 'Spooky Decoration Spotter', where: 'Take it on a walk, a trick-or-treat route or a trip to the pumpkin patch.', extra: 'Super spotter: find something orange, something purple and something black.',
    items: ['pumpkin|A jack-o’-lantern', 'bat|A bat', 'friendly-ghost|A ghost decoration', '🕸️|A spider web', '🕷️|A spider', '🐈‍⬛|A black cat', '💀|A skeleton', 'broom-ride|A witch’s broom', '🍂|A pile of fall leaves', '🌾|A hay bale or corn stalks', '💡|Orange or purple lights', 'moonbeam|The moon'] },
  christmas: { title: 'Holiday Lights Spotter', where: 'Take it on a walk, a drive to see the lights or a trip to the store.', extra: 'Super spotter: count how many reindeer you can find!',
    items: ['merry-christmas|A decorated tree', 'svg:wreath|A wreath on a door', '💡|Twinkly lights', 'santa|Santa', 'reindeer|A reindeer', 'ice/snowman|A snowman', 'presents|A wrapped present', 'jingle|A bell', 'tree-star|A star on top of a tree', 'peppermint|A candy cane', '🕯️|A candle in a window', 'ice/catching-flakes|A snowflake'] },
  valentine: { title: 'Heart Hunter Walk', where: 'Take it on a walk, to the store or around the house.', extra: 'Friendship challenge: give someone a high five or a hug.',
    items: ['hearts|Something heart-shaped', 'rose|A flower', '🔴|Something red', '🩷|Something pink', 'balloon|A balloon', 'teddy-bear|A teddy bear', 'send|A mailbox', 'candy-heart|A sweet treat', '🐦|Two birds together', 'made-them-smile|Someone smiling', 'sent-a-valentine|A card or letter', '🌳|A tree you could hug'] },
  fire: { title: 'Safety Spotter Walk', where: OUTSIDE, extra: 'Firefighter challenge: show a grown-up how you stop, drop and roll.',
    items: ['fire-truck|A fire truck or fire station', 'svg:hydrant|A fire hydrant', 'smoke-alarm|A smoke alarm (at home)', 'extinguisher|A fire extinguisher', '🚪|An EXIT sign', '🪜|A ladder', '🔴|Something red', 'hero/alert|Flashing lights', 'racecar/starting-line|A traffic light', '🚑|An ambulance', '1f9d1-200d-1f692|A helper in a uniform', 'boots|Boots'] },
  ice: { title: 'Frosty Walk', where: 'Take it on a walk or out in the yard. No snow? Look for the cool-weather finds.', extra: 'Frosty challenge: freeze like a statue for ten seconds.',
    items: ['snowman|A snowman', 'catching-flakes|A snowflake or frost', 'freeze|Ice or a frozen puddle', 'frosty-forest|A pine tree', 'big-wind|Wind blowing the trees', '🧤|Mittens or gloves', '⚪|Something white as snow', '🔵|Something icy blue', 'penguin|A bird that waddles', '1f319|The moon', 'ice-gem|Something sparkly', 'cocoa-sipping|Something warm to drink'] },
  racecar: { title: 'Car Spotter Walk', where: OUTSIDE, extra: 'Racer challenge: count every red car you see.',
    items: ['car|A red car', '🚙|A blue car', '🚕|A yellow car', '🚚|A truck', '🚌|A bus', 'starting-line|A traffic light', 'grand-prix|A checkered pattern', 'tires|A wheel or tire', 'auto/brakes|A stop sign', '🏍️|A motorcycle', 'fuel-tank|A gas station', '🚲|A bike'] },
  pizza: { title: 'Pizza Shop Spotter', where: 'Take it on a walk around town, or look in the kitchen.', extra: 'Chef challenge: name three toppings you would put on your pizza.',
    items: ['delivery|A scooter or delivery car', '🔺|Something shaped like a slice', '⭕|Something round like a pizza', 'mushrooms|A mushroom (look, don’t touch!)', 'dino/1f33f|A green herb or leaf', '🔴|Something red like sauce', '🟡|Something yellow like cheese', 'peppers|Something green like peppers', '🏪|A restaurant sign', '📦|A delivery box', 'olives|Something small and round', '🌳|A tree with fruit'] },
  burger: { title: 'Burger Shack Spotter', where: 'Take it on a walk around town, or look in the kitchen.', extra: 'Grill challenge: stack three things on top of each other like a burger.',
    items: ['burger|Something stacked like a burger', '🟤|Something brown', 'lettuce|A big green leaf', 'tomato|Something red and round', 'cheese|Something yellow and square', 'fries|Something long and thin like a fry', '🐄|A cow (a picture counts)', '🚗|A drive-through', '🏪|A restaurant sign', '🔥|A grill or barbecue', 'corn-cob|A garden', 'pickles|Something bumpy and green'] },
  grocery: { title: 'Shopping Spotter', where: 'Take it to the grocery store, or look in your own kitchen.', extra: 'Shopper challenge: find something for every color of the rainbow.',
    items: ['veggies|Something green to eat', 'unicorn/apple|A red fruit', '🍌|Something yellow to eat', 'cart-champ|A shopping cart', '🏷️|A price tag', 'soup|A can', '📦|A box of food', '🥚|An egg carton', '1f9fe|A receipt', '🍞|A loaf of bread', 'construction/milk|A milk jug', '🛍️|A shopping bag'] },
  post: { title: 'Mail Route Walk', where: OUTSIDE, extra: 'Mail carrier challenge: find house numbers from 1 to 5.',
    items: ['pop-it-in-the-mail-box|A mailbox', 'letter|An envelope', 'parcel|A package on a porch', '🔢|A house number', 'easter/1f69a|A mail or delivery truck', '🏠|A red door', 'air-mail|An airplane', '🪧|A street sign', '🏳️|A flag', '1f33b|A garden', '📰|A newspaper', '🐕|A dog in a yard'] },
  library: { title: 'Word Spotter Walk', where: OUTSIDE, extra: 'Book detective challenge: find every letter in your name.',
    items: ['🅰️|The letter A', '🔤|The first letter of your name', 'police/missed-stop|A sign with a word on it', 'story-book|A book', '🔢|A number', 'owl|A bird in a tree', '🪧|A sign with a picture', '1f6cb|A cozy spot to read', '🐛|A bookworm (any worm!)', 'post/pop-it-in-the-mail-box|A mailbox', 'pencil|Something long and thin like a pencil', 'bookmark|Something with a tassel or ribbon'] },
  police: { title: 'Safety Patrol Walk', where: OUTSIDE, extra: 'Officer challenge: show a grown-up how you look both ways.',
    items: ['police-station|A police car', '1f6b8|A crossing sign', 'missed-stop|A stop sign', 'racecar/starting-line|A traffic light', 'walk-across-dont-run|A crosswalk', '1f415|A dog on a leash', 'bike-licence|Someone riding a bike', '🦺|Someone in a safety vest', '💡|A street light', '🔢|A house number', 'construction/barrier|An orange cone', 'car-keys|Something that locks'] },
  dentist: { title: 'Smile Spotter Walk', where: 'Take it on a walk, or around the house.', extra: 'Smile challenge: give your biggest smile to three people.',
    items: ['christmas/smile|Someone smiling', '⚪|Something white and shiny like a tooth', 'tooth-mirror|A mirror or a shiny window', 'rinsed|A water fountain or tap', 'unicorn/apple|A crunchy snack', '🥕|A carrot or a veggie', '🐊|An animal with lots of teeth (a picture counts)', 'vet/toothbrush|Something with bristles like a brush', '🌸|Something pink like gums', '🧽|Something squeaky clean', 'hero/super-torch|A bright light', '🥛|Something to drink that’s good for teeth'] },
  petshop: { title: 'Pet Spotter Walk', where: OUTSIDE, extra: 'Pet pal’s rule: ask a grown-up and the owner before petting.',
    items: ['walk|A dog on a walk', '🐈|A cat in a window', 'bird|A bird', '🐿️|A squirrel', 'mermaid/tropical-fish|A fish (a pond or a tank)', '🐇|A bunny', '1f3be|A ball', 'fire/dog-treat|A stick a dog would love', 'vet/paws|Paw prints', '🥣|A pet bowl', '🏠|A doghouse or birdhouse', '🐞|A bug'] },
  coffee: { title: 'Café Spotter Walk', where: 'Take it on a walk around town.', extra: 'Barista challenge: pretend to pour a cocoa without spilling!',
    items: ['christmas/hot-cocoa|Someone holding a mug', 'lemonade|Something yellow like a lemon', '🐝|A bee (look, don’t touch!)', 'bagel|Something round with a hole', 'waffle|Something with a grid pattern', '🪑|An outdoor café table', '1f4f6|A Wi-Fi sign', 'christmas/cookie|A bakery or snack shop', '🟤|Something brown like cocoa', '☂️|An umbrella', '📰|Someone reading', '🌸|Flowers in a pot'] },
  italian: { title: 'Little Italy Walk', where: 'Take it on a walk, or out in the garden.', extra: 'Chef challenge: say “Mamma mia!” when you find the last one.',
    items: ['🔴|Something red', '⚪|Something white', '🟢|Something green', 'pizza/spread-on-the-tomato-sauce|A tomato plant', '1f34b|Something yellow like a lemon', 'dino/1f33f|A herb plant like basil', 'table-5|A candle or a lantern', '🪱|Something long and wiggly like spaghetti', '🛵|A scooter', '🏛️|Columns on a building', '⛲|A fountain', 'grocery/grapes|Grapes on a vine'] },
  auto: { title: 'Car Care Spotter', where: OUTSIDE, extra: 'Mechanic challenge: count the wheels on the biggest truck you see.',
    items: ['racecar/car|A car getting washed', 'racecar/tires|A big tire', 'construction/wrench|Someone using a tool', 'racecar/fuel-tank|A gas station', 'wipers|Windshield wipers moving', 'racecar/headlights|Headlights on', '🛻|A tow truck or pickup', 'brakes|A stop sign', 'keys|Car keys', 'fill-a-bucket-with-warm-soapy-water|A bucket', '🔵|A blue car', '🅿️|A parking sign'] },
  kitchen: { title: 'Kitchen Spotter', where: 'Look around the kitchen and the garden.', extra: 'Chef challenge: name three foods that are red.',
    items: ['🍳|A frying pan', '23f2|A timer or a clock', 'forks|A fork', '🥄|A big spoon', 'burger/tomato|Something red you can eat', 'avocado|Something green you can eat', 'rice|A bag or jar of rice', 'garlic|Something that smells strong', '🧂|A salt shaker', '🧊|Something cold from the fridge', 'pancakes|Something round and flat', 'dino/1f33f|A herb or a plant'] },
  doctor: { title: 'Healthy Helper Hunt', where: 'Take it on a walk, or around the house.', extra: 'Doctor challenge: count your heartbeats while you jump 10 times.',
    items: ['vet/bandage|A bandage', '🧼|Soap for clean hands', 'unicorn/apple|A healthy snack', '🚑|An ambulance (a picture counts)', '🏥|A hospital or clinic sign', 'wheelchair-ride|A ramp or a wheelchair sign', '💧|A glass of water', 'christmas/teddy-bear|A teddy who needs a check-up', 'vet/flashlight|A flashlight', 'dentist/gloves|A pair of gloves', '🛏️|A cozy bed for resting', '🚲|Someone getting exercise'] },
  puppet: { title: 'Show Spotter', where: 'Take it on a walk, or around the house.', extra: 'Puppet challenge: make a sock talk in a silly voice.',
    items: ['puppets|A sock', 'fox|A stuffed animal', '🪑|A row of chairs', '🔦|A flashlight for a spotlight', '🪟|Curtains', 'grocery/1f37f|A snack to share', '🎶|Something that makes music', 'royal/crown|Something gold', '🔴|Something red like a curtain', '🎟️|A ticket or a receipt', '📦|A box to hide behind', '👏|Someone clapping'] },
  agent: { title: 'Secret Agent Stakeout', where: OUTSIDE, extra: 'Agent challenge: walk to the end of the street as quietly as you can.',
    items: ['footprints-match|Footprints', 'fingerprints-match|A fingerprint on a window', 'crack-a-code|A lock', '🔢|A secret code (a house number)', 'spy-shades|Someone wearing sunglasses', '🕵️|Someone in a hat', '🐈|A cat on a stakeout', '🌳|A good hiding spot', '🚗|A black car', 'notebook|Something to write on', 'police/1f4de|A phone', 'post/pop-it-in-the-mail-box|A mailbox (secret message drop!)'] },
  dressup: { title: 'Style Spotter Walk', where: 'Take it on a walk, or around the house.', extra: 'Fashion challenge: strike your best pose at the last one.',
    items: ['a-hat|A hat', 'scarves|A scarf', 'cool-shades|Someone in sunglasses', 'fire/boots|Boots', '🌈|Something rainbow', '✨|Something sparkly', '🟣|Something purple', '🎀|A bow', 'dresses|Something with stars or spots', '🧥|A coat with big buttons', 'hero/mask|A costume or a mask (a picture counts)', '🪞|A mirror'] },
  icecream: { title: 'Ice Cream Spotter', where: OUTSIDE, extra: 'Scooper challenge: name your dream three-scoop cone.',
    items: ['pizza/ice-cream|Someone eating ice cream', '🚚|An ice cream truck (or any truck!)', '🍦|An ice cream sign', 'a-cherry|Something red like a cherry', '🟤|Something brown like chocolate', '🌸|Something pink like strawberry', 'ice/penguin|A bird', '☀️|A sunny spot', '🌈|Something with lots of colors like sprinkles', 'snow-cone|Something cone shaped', '🍃|Something minty green', '🧊|Something cold'] },
  airport: { title: 'Sky Spotter', where: OUTSIDE, extra: 'Pilot challenge: hold out your wings and zoom to the front door.',
    items: ['arrivals|An airplane in the sky', '☁️|A fluffy cloud', '🐦|A bird flying', 'suitcase|A suitcase or a bag with wheels', '🚌|A bus', '🚕|A taxi', 'carry-on|A backpack', '🗺️|A map', '🏳️|A flag', '🌬️|Something blowing in the wind', 'headphones|Someone wearing headphones', '🧭|Something pointing north'] },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Splits 'pic|Label' and resolves the picture to an illustration file, a drawing or an emoji.
function entry(themeId, s) {
  const [pic, label] = s.split('|');
  if (pic.startsWith('svg:')) return { label, html: `<span class="bx-svg">${SVGS[pic.slice(4)]}</span>` };
  if (/^[a-z0-9/-]+$/.test(pic)) {
    const file = path.join(ART_DIR, pic.includes('/') ? pic : `${themeId}/${pic}`) + '.webp';
    if (!fs.existsSync(file)) throw new Error(`Missing bonus game art ${file}`);
    return { label, file, html: `<img class="bx-art" src="file://${file}">` };
  }
  return { label, html: `<span class="bx-emoji">${pic}</span>` };
}

// Picture hunt, page 1: twelve picture cards to cut out and hide.
function pictureCards(theme) {
  const items = PICTURES[theme.id].map((s) => entry(theme.id, s));
  return `<section class="page bonus pic-cards">
    <div class="bx-head">
      <div class="bx-kicker">Bonus game · Picture Hunt · Grown-ups</div>
      <div>Cut out the 12 picture cards and hide them around a room, the house or the yard. Hand out the checklists from the next page and let the ${esc(theme.hunters)} find them all. Hide them again for round two!</div>
    </div>
    <div class="pc-grid">${items.map((it) => `<div class="pc"><div class="pc-pic">${it.html}</div><div class="pc-label">${esc(it.label)}</div><div class="pc-icon">${theme.icon}</div></div>`).join('')}</div>
  </section>`;
}

// Picture hunt, page 2: two matching checklists, one per kid (or team).
function pictureChecklists(theme) {
  const items = PICTURES[theme.id].map((s) => entry(theme.id, s));
  const list = `<div class="pl">
      <div class="pl-head"><div class="icon">${theme.icon}</div><div><div class="bx-kicker">Bonus game</div><h2>${esc(theme.label)} Picture Hunt</h2></div></div>
      <div class="pl-sub"><span>12 pictures are hiding nearby. When you find one, check it off!</span><div class="pl-name">Hunter: <span></span></div></div>
      <div class="pl-grid">${items.map((it) => `<div class="pl-item"><div class="pl-pic">${it.html}</div><div class="pl-label">${esc(it.label)}</div><span class="bx-box"></span></div>`).join('')}</div>
      <div class="pl-foot">Found all 12? You’re ${/^[AEIOU]/.test(theme.label) ? 'an' : 'a'} ${esc(theme.label)} Picture Pro! ★</div>
    </div>`;
  return `<section class="page bonus pic-lists">${list}<div class="pl-cut"><span>✂</span></div>${list}</section>`;
}

// Look-around hunt: twelve things to spot outside or around the neighborhood.
function lookAround(theme) {
  const l = LOOK[theme.id];
  const items = l.items.map((s) => entry(theme.id, s));
  return `<section class="page bonus look">
    <header class="page-head">
      <div class="icon">${theme.icon}</div>
      <div>
        <div class="kicker">Bonus game · Look-around hunt</div>
        <h1>${esc(l.title)}</h1>
        <div class="sub">${esc(l.where)} Check off each one you spot.</div>
      </div>
    </header>
    <div class="lk-grid">${items.map((it) => `<div class="lk-item"><div class="lk-pic">${it.html}</div><div class="lk-label">${esc(it.label)}</div><span class="bx-box"></span></div>`).join('')}</div>
    <div class="lk-extra">★ ${esc(l.extra)}</div>
    <div class="lk-foot"><div>Spotter: <span></span></div><div>Date: <span></span></div><div>I found <span class="short"></span> of 12!</div></div>
  </section>`;
}

function bonusPages(plan) {
  const { theme } = plan;
  if (!PICTURES[theme.id] || !LOOK[theme.id]) throw new Error(`No bonus games for theme "${theme.id}"`);
  return [pictureCards(theme), pictureChecklists(theme), lookAround(theme)].join('\n');
}

const bonusCss = (theme) => `
.bonus .bx-kicker { font-size:9.5pt; letter-spacing:.06em; color:var(--accent); text-transform:uppercase; font-weight:600; }
.bx-art { width:100%; height:100%; object-fit:contain; display:block; }
.bx-emoji { font-family:'Noto Color Emoji', sans-serif; line-height:1; display:block; text-align:center; }
.bx-svg svg { width:100%; height:100%; display:block; }
.bx-box { width:.26in; height:.26in; border:2.5px solid var(--primary); border-radius:5px; background:#fff; flex:none; display:inline-block; }

/* picture cards */
.pic-cards { padding:.4in .5in; }
.pic-cards .bx-head { height:.8in; font-size:10pt; line-height:1.35; color:#555; }
.pc-grid { display:grid; grid-template-columns:repeat(3, 2.5in); grid-auto-rows:2.35in; }
.pc { position:relative; border:1.5px dashed #9a9a9a; margin:-.75px; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:.12in;
  background:radial-gradient(circle at 50% 42%, #fff 0 .8in, var(--paper) 1.4in); }
.pc-pic { width:1.6in; height:1.6in; display:grid; place-items:center; }
.pc-pic .bx-emoji { font-size:92pt; }
.pc-label { margin-top:.06in; font-weight:600; font-size:12.5pt; color:var(--primary); text-align:center; line-height:1.1; }
.pc-icon { position:absolute; top:.08in; left:.08in; width:.24in; height:.24in; color:var(--accent); opacity:.6; }
.pc-icon svg { width:100%; height:100%; }

/* picture checklists, two per page */
.pic-lists { padding:.35in .5in; display:flex; flex-direction:column; }
.pl { height:4.95in; display:flex; flex-direction:column; border:3px solid var(--primary); border-radius:.18in; padding:.16in .22in .12in; background:linear-gradient(180deg, #fff, var(--paper)); }
.pl-head { display:flex; align-items:center; gap:.14in; }
.pl-head .icon { width:.5in; height:.5in; flex:none; }
.pl-head h2 { margin:0; font-family:'${theme.fonts.display}', 'Fredoka', sans-serif; font-weight:${theme.fonts.displayWeight}; text-transform:${theme.fonts.displayTransform};
  color:var(--primary); font-size:20pt; line-height:1.05; }
.pl-name { margin-left:auto; flex:none; font-size:11pt; color:#555; display:flex; align-items:flex-end; gap:.06in; }
.pl-name span { display:inline-block; width:1.6in; border-bottom:1.5px solid var(--ink); height:.25in; }
.pl-sub { font-size:11pt; color:#555; margin:.06in 0 .08in; display:flex; align-items:flex-end; gap:.2in; }
.pl-grid { flex:1; display:grid; grid-template-columns:repeat(6, 1fr); grid-template-rows:1fr 1fr; gap:.07in; }
.pl-item { display:flex; flex-direction:column; align-items:center; justify-content:space-between; border-radius:.1in; background:#fff; border:1.5px solid var(--soft); padding:.06in .03in .07in; }
.pl-pic { width:.82in; height:.82in; display:grid; place-items:center; }
.pl-pic .bx-emoji { font-size:46pt; }
.pl-label { font-size:9.5pt; font-weight:600; text-align:center; line-height:1.1; color:var(--ink); }
.pl-foot { text-align:center; font-size:11pt; color:var(--primary); font-weight:600; margin-top:.07in; }
.pl-cut { height:.4in; position:relative; flex:none; }
.pl-cut::before { content:''; position:absolute; left:-.5in; right:-.5in; top:50%; border-top:1.5px dashed #9a9a9a; }
.pl-cut span { position:absolute; left:.1in; top:50%; transform:translateY(-55%); background:#fff; padding:0 .05in; font-size:14pt; color:#777; }

/* look-around hunt */
.look { padding:.55in .65in; }
.lk-grid { display:grid; grid-template-columns:1fr 1fr; gap:.1in .16in; margin-top:.2in; }
.lk-item { display:flex; align-items:center; gap:.14in; height:1.08in; padding:.06in .14in .06in .08in; border-radius:.14in; border:1.5px solid var(--soft); background:linear-gradient(90deg, var(--paper), #fff); }
.lk-pic { width:.92in; height:.92in; flex:none; display:grid; place-items:center; }
.lk-pic .bx-emoji { font-size:52pt; }
.lk-label { flex:1; font-size:13pt; font-weight:500; line-height:1.2; }
.lk-extra { margin-top:.18in; text-align:center; font-size:12pt; font-weight:600; color:var(--primary); background:var(--soft); border-radius:99px; padding:.08in .2in; }
.lk-foot { display:flex; gap:.3in; margin-top:.22in; font-size:11pt; color:#555; }
.lk-foot div { flex:1; display:flex; align-items:flex-end; gap:.06in; white-space:nowrap; }
.lk-foot span { flex:1; border-bottom:1.5px solid var(--ink); height:.25in; }
.lk-foot span.short { flex:none; width:.45in; }
`;

module.exports = { bonusPages, bonusCss, PICTURES, LOOK, entry };
