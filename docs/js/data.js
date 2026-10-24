// Shared storefront data: themes, kits, prices, page counts and gallery captions. Used by the home page,
// make/ (the order builder), play-kits/ and handprint-art/. Load before js/site.js.

// The order bot's checkout.
const CHECKOUT_URL = 'https://littleprintquests-production.up.railway.app/api/checkout'; // the order bot's /api/checkout endpoint

const THEMES = [
  { id: 'dino', name: 'Dino Fossil Recovery', ages: '3–6', header: 'Dino Ranger Expedition', badge: 'Field Note', colors: ['#4f6b3a', '#c98a2b', '#e3dcc2'],
    hook: 'The volcano is rumbling and the dinosaur eggs are scattered. Junior Rangers to the rescue!',
    opener: ['The ground gives a rumble, the lava is near,', 'But brave little rangers have nothing to fear!'] },
  { id: 'hero', name: 'Superhero HQ Trial', ages: '4–8', header: 'Hero Alliance Trial', badge: 'Top Secret', colors: ['#d62828', '#1d3f91', '#ffd60a'],
    hook: 'Crack the Hero Alliance’s secret clues to earn an official hero cape.',
    opener: ['Pow! Zap! Kaboom! You cracked the code,', 'Now use your super-speed, switch to turbo mode!'] },
  { id: 'pirate', name: 'Pirate’s Lost Ledger', ages: '3–7', header: 'Captain Barnaby’s Map', badge: 'Map Piece', colors: ['#1f2f4d', '#b8901f', '#e6d3a8'],
    hook: 'The captain’s parrot scrambled the treasure map into rhymes. Follow it to the chest!',
    opener: ['Yo ho ho, matey, you’re sharp as a hook!', 'The parrot squawks, “Here’s the next place to look!”'] },
  { id: 'space', name: 'Deep Space Expedition', ages: '4–8', header: 'Ground Control Telemetry', badge: 'Beacon', colors: ['#14245a', '#f26b1d', '#5fd3e6'],
    hook: 'Ground Control lost the signal. Track every radio beacon to fire the launch thrusters.',
    opener: ['Beep-boop! Beacon found! The signal is clear,', 'Now blast off again, the next one is near!'] },
  { id: 'royal', name: 'Royal Castle Quest', ages: '3–7', header: 'Royal Castle Quest', badge: 'Royal Decree', colors: ['#7d5ba6', '#b8901f', '#f3d3dc'],
    hook: 'A playful pet dragon scattered the Crown Jewels. Knights and princesses, restore the court!',
    opener: ['Huzzah! A jewel! The Queen will be glad,', 'Now on to the next one, the best quest we’ve had!'] },
  { id: 'unicorn', name: 'Unicorn Rainbow Quest', ages: '3–7', header: 'Rainbow Riders Quest', badge: 'Rainbow Gem', colors: ['#8e5cc4', '#e8558f', '#c9f0ef'],
    hook: 'Stardust the Unicorn sneezed the rainbow’s colors away. Find every gem to make it shine again!',
    opener: ['A gem! Hear it jingle! The rainbow can glow,', 'Now gallop along, there are more gems to go!'] },
  { id: 'mermaid', name: 'Mermaid Lagoon Treasure', ages: '3–7', header: 'Mermaid Lagoon', badge: 'Pearl', colors: ['#11798a', '#e8685b', '#bfe9e4'],
    hook: 'Ollie the Octopus juggled away the Mermaid Queen’s pearls. Swim the trail and bring them home!',
    opener: ['A pearl! What a beauty! It shines like the moon,', 'Now swim to the next one, we’ll find it real soon!'] },
  { id: 'construction', name: 'Construction Big Build', ages: '3–7', header: 'Big Build Work Order', badge: 'Blueprint', colors: ['#33373d', '#f2a900', '#ffd23f'],
    hook: 'The wind blew the blueprint to pieces. Find them all so the crew can start the Big Build!',
    opener: ['Beep, beep, beep! The truck backs up slow,', 'You found a piece, crew! Now off we go!'] },
  { id: 'vet', name: 'Pet Rescue Vet Quest', ages: '3–7', header: 'Pet Rescue Patrol', badge: 'Paw Print', colors: ['#2a9d8f', '#ef9d31', '#bfe9d6'],
    hook: 'Someone left the clinic gate open and the pets wandered off. Junior Vets, follow the paw prints!',
    opener: ['Woof! A paw print! You found a clue,', 'A puppy is waiting somewhere for you!'] },
  { id: 'racecar', name: 'Race Car Grand Prix', ages: '3–7', header: 'Grand Prix Pit Crew', badge: 'Checkpoint', colors: ['#d7261e', '#1b1b1f', '#ffd23f'],
    hook: 'A gust of wind blew the checkpoint flags off the track. Rookie Racers, find them all before the checkered flag!',
    opener: ['Red light, green light, ready, set, GO!', 'The next checkpoint flag is waiting, you know!'] },
  { id: 'fire', name: 'Fire Station Rescue Run', ages: '3–7', header: 'Fire Station Dispatch', badge: 'Rescue Call', colors: ['#c62828', '#ffb703', '#ffe08a'],
    hook: 'Pepper the dalmatian ran off with the rescue gear. Junior Firefighters, follow the spots and get the station ready!',
    opener: ['Wee-oo, wee-oo! The siren rings loud,', 'You found a clue! Pepper would be proud!'] },
  { id: 'ice', name: 'Ice Palace Snowflake Quest', ages: '3–7', header: 'Ice Palace Quest', badge: 'Snowflake', colors: ['#3f6fb5', '#7b68b8', '#d6e6f7'],
    hook: 'Pip the Snow Fox swished Queen Glacia’s crystal snowflakes away. Follow the trail and bring winter magic home!',
    opener: ['A snowflake! It sparkles and twinkles so bright,', 'Now tiptoe along to the next one in sight!'] },
  { id: 'pizza', name: 'Pizza Shop Topping Hunt', ages: '3–7', header: 'Pizza Shop Order Up', badge: 'Order Ticket', colors: ['#d9442f', '#3f9a4a', '#ffd9a8'],
    hook: 'Mozzie the Mouse ran off with every pizza topping. Junior Pizza Chefs, follow the Order Tickets and save the cheesiest pizza in town!',
    opener: ['Squeak, squeak! Was that Mozzie the Mouse?', 'He hid one more topping somewhere in the house!'] },
  { id: 'burger', name: 'Burger Shack Secret Sauce', ages: '3–7', header: 'Burger Shack Grill Crew', badge: 'Recipe Card', colors: ['#e2782a', '#d93a2f', '#ffe08a'],
    hook: 'Gus the Seagull swooped off with the Secret Sauce recipe. Grill Crew, collect every card before lunch!',
    opener: ['Squawk! goes Gus from up high in the sky,', 'He dropped one more card as he went flying by!'] },
  { id: 'grocery', name: 'Grocery Store Shopping List', ages: '3–7', header: 'Super Shopper List', badge: 'List Item', colors: ['#3a9d4f', '#f2a03d', '#cdeec0'],
    hook: 'Zippy the runaway cart scattered the Big Party Shopping List. Super Shoppers, find every piece!',
    opener: ['Beep! goes the scanner, the price is just right,', 'The next list item is hiding in sight!'] },
  { id: 'post', name: 'Post Office Special Delivery', ages: '3–7', header: 'Special Delivery', badge: 'Stamp', colors: ['#2f5fb3', '#e8513a', '#cfe0ff'],
    hook: 'Bertha the sorting machine sneezed and the special letters flew everywhere. Junior Mail Carriers, deliver them all!',
    opener: ['ACHOO! went Bertha, oh what a big sneeze!', 'The letters went flying like leaves in the breeze!'] },
  { id: 'library', name: 'Library Lost Pages Mystery', ages: '3–7', header: 'Book Detective Case', badge: 'Lost Page', colors: ['#6a4fb3', '#f2a93b', '#e3d8ff'],
    hook: 'Hoot the library owl flapped the Big Storybook’s pages away. Book Detectives, put the story back together!',
    opener: ['Hoo-hoo! says Hoot from the top of the stack,', 'You found a lost page! Let’s put the book back!'] },
  { id: 'police', name: 'Police Station Missing Teddy', ages: '3–7', header: 'Junior Officer Case', badge: 'Evidence', colors: ['#2c4f9e', '#f2c230', '#cfdcf7'],
    hook: 'Buttons the Teddy is missing from the station. Junior Officers, follow the evidence and crack the case!',
    opener: ['Wee-oo, wee-oo! You found the next clue,', 'Officers, Buttons is counting on you!'] },
  { id: 'dentist', name: 'Dentist Sparkle Smile Quest', ages: '3–6', header: 'Sparkle Smile Quest', badge: 'Sparkle Card', colors: ['#2a9fb4', '#f48aa8', '#c7eef3'],
    hook: 'The sneaky Sugar Bugs hid the Sparkle Toothbrushes. Smile Squad, find them all for Big Smile Day!',
    opener: ['Show me your smile, it’s sparkly and bright,', 'You’re chasing those Sugar Bugs out of sight!'] },
  { id: 'petshop', name: 'Pet Shop Adoption Day', ages: '3–7', header: 'Adoption Day Hunt', badge: 'Name Tag', colors: ['#8a56c2', '#f5b335', '#e5d4f7'],
    hook: 'Noodle the Kitten batted the name tags away on Adoption Day. Pet Pals, find them so every pet goes home!',
    opener: ['Puppies need cuddles and kittens need play,', 'Find the next tag and they’ll go home today!'] },
  { id: 'coffee', name: 'Café Magic Cocoa Beans', ages: '3–7', header: 'Café Cocoa Quest', badge: 'Cocoa Bean', colors: ['#9a6340', '#e8708a', '#f1dcc5'],
    hook: 'Mocha the Squirrel hid the Magic Cocoa Beans like acorns. Junior Baristas, find them for Magic Hot Cocoa!',
    opener: ['Stir it and swirl it, a marshmallow on top,', 'Another bean’s waiting, so hippity-hop!'] },
  { id: 'italian', name: 'Trattoria Runaway Meatballs', ages: '3–7', header: 'Nonna’s Trattoria', badge: 'Meatball', colors: ['#c8372d', '#2f8a4c', '#f9d6c8'],
    hook: 'Nonna sneezed and the meatballs rolled out of the pot. Little Chefs, bring them all home before dinner!',
    opener: ['On top of spaghetti, all covered with cheese,', 'Another lost meatball! Go find it, please!'] },
  { id: 'auto', name: 'Auto Shop Toolbox Rescue', ages: '3–7', header: 'Auto Shop Work Order', badge: 'Tool Tag', colors: ['#34618f', '#ec6a2c', '#ffdf7e'],
    hook: 'Tilly the Tow Truck bumped the toolbox and the tools rolled away. Junior Mechanics, find the Golden Wrench!',
    opener: ['Bang goes the hammer and buzz goes the drill,', 'Find the next tool with your mechanic skill!'] },
  { id: 'kitchen', name: 'Chef’s Kitchen Recipe Rescue', ages: '3–7', header: 'Chef’s Recipe Rescue', badge: 'Recipe Card', colors: ['#e0573b', '#2f9e8f', '#ffd9c9'],
    hook: 'Whisk the Kitten knocked the Big Cookbook off the shelf. Junior Chefs, find the recipes for the Big Birthday Feast!',
    opener: ['Stir it and whisk it, a pinch and a dash,', 'The next recipe card is hiding, so dash!'] },
  { id: 'doctor', name: 'Doctor’s Clinic Get Well Quest', ages: '3–7', header: 'Get Well Quest', badge: 'Medical Chart', colors: ['#3a7bd5', '#ef5b6b', '#cfe1fa'],
    hook: 'A big gust of wind blew the patient charts away. Junior Doctors, find them so every patient gets a check-up!',
    opener: ['Say “Ahh!” and say “Achoo!”,', 'A patient chart is waiting for you!'] },
  { id: 'puppet', name: 'Puppet Theater Lost Ticket Hunt', ages: '3–7', header: 'Showtime Ticket Hunt', badge: 'Show Ticket', colors: ['#b8325a', '#f2b632', '#f7d2de'],
    hook: 'Sockington the sock puppet hid every show ticket. Little Stars, find them so the Grand Opening show can begin!',
    opener: ['The curtains are red and the spotlight is bright,', 'Find the next ticket, the show is tonight!'] },
  { id: 'agent', name: 'Secret Agent Top Secret Mission', ages: '4–8', header: 'Top Secret Mission', badge: 'Clue', colors: ['#2f4858', '#e8a33d', '#d5e0e6'],
    hook: 'Someone took the Golden Cookie Crown from the HQ snack vault. Secret Agents, follow the clues and crack the case!',
    opener: ['Tiptoe, agents, quiet and sly,', 'The next secret clue is close by!'] },
  { id: 'dressup', name: 'Costume Shop Dress-Up Dash', ages: '3–7', header: 'Dress-Up Dash', badge: 'Costume Tag', colors: ['#8c4fc4', '#2fb8a6', '#e6d5f6'],
    hook: 'Twirl the Magpie carried off every sparkly costume tag. Super Stylists, find them in time for the fashion show!',
    opener: ['A hat and a cape and a sparkly crown,', 'The next costume tag is the best in town!'] },
  { id: 'icecream', name: 'Ice Cream Parlor Golden Scoop Hunt', ages: '3–7', header: 'Golden Scoop Hunt', badge: 'Scoop', colors: ['#e9708f', '#46b7c9', '#fbd5df'],
    hook: 'Sprinkles the Penguin slid off with the Golden Scoops. Super Scoopers, find them for the Biggest Sundae Ever!',
    opener: ['Chocolate, vanilla and strawberry pink,', 'The next golden scoop is closer than you think!'] },
  { id: 'airport', name: 'Airport Lost Boarding Pass Hunt', ages: '3–8', header: 'Flight Crew Hunt', badge: 'Boarding Pass', colors: ['#1f78b4', '#f5a623', '#cfe6f6'],
    hook: 'Gusty the Wind blew every boarding pass away. Junior Pilots, find them so the Birthday Flight can take off!',
    opener: ['Buckle your seatbelt and zoom through the sky,', 'The next boarding pass is waiting nearby!'] },
  { id: 'halloween', name: 'Not-So-Spooky Halloween Hunt', ages: '3–7', header: 'Halloween Treat Trail', badge: 'Boo Note', colors: ['#5e2f91', '#ec6f12', '#d6ef8f'],
    hook: 'Wispy the little ghost sneezed and blew the Halloween treats away. Find them all before the costume parade!',
    opener: ['A treat! You found it! Hip, hip, hooray!', 'The rest of the candy is not far away!'] },
  { id: 'christmas', name: 'Santa’s Jingle Bell Rescue', ages: '3–7', header: 'Santa’s Elf Mission', badge: 'Jingle Bell', colors: ['#b3202a', '#1f6b45', '#f6dfa0'],
    hook: 'Santa’s sleigh hit a bump and the magic jingle bells scattered. Elves-in-Training, find them before Christmas Eve!',
    opener: ['Jingle, jingle! A bell! You found it, hooray!', 'Now hurry, young elves, the next one’s this way!'] },
  { id: 'valentine', name: 'Valentine Friendship Delivery', ages: '3–7', header: 'Pip’s Valentine Mail', badge: 'Love Note', colors: ['#c2255c', '#e03131', '#ffd6e2'],
    hook: 'Pip the Love Bug’s mailbag went POP and the valentines flew away. Helpers, deliver the love!',
    opener: ['Roses are red and violets are blue,', 'The next little valentine’s waiting for you!'] },
  { id: 'easter', name: 'Golden Egg Easter Hunt', ages: '3–7', header: 'Golden Egg Trail', badge: 'Golden Egg', colors: ['#7a5fb0', '#d39a12', '#cdeedd'],
    hook: 'Clover the Bunny tripped and the golden eggs rolled away. Bunny Helpers, hop the trail and fill the basket!',
    opener: ['Hippity-hop! A golden egg clue!', 'Another egg’s hiding and waiting for you!'] },
];
const SPOTS = [
  ['couch', 'Couch'], ['fridge', 'Fridge'], ['bed', 'Bed'], ['bathtub', 'Bathtub'], ['bookshelf', 'Bookshelf'],
  ['front_door', 'Front Door'], ['toy_box', 'Toy Box'], ['kitchen_table', 'Kitchen Table'], ['coat_closet', 'Coat Closet'],
  ['shoe_rack', 'Shoe Rack'], ['mailbox', 'Mailbox'], ['washing_machine', 'Washer'], ['dryer', 'Dryer'], ['pantry', 'Pantry'],
  ['bathroom_sink', 'Bathroom Sink'], ['tv', 'TV'], ['stairs', 'Stairs'], ['pet_bed', 'Pet Bed'], ['plant', 'Plant'],
  ['desk', 'Desk'], ['mirror', 'Mirror'], ['doormat', 'Doormat'], ['stuffed_animals', 'Stuffed Animals'], ['backpack', 'Backpack'],
  ['swing', 'Swing'], ['slide', 'Slide'], ['sandbox', 'Sandbox'], ['tree', 'Big Tree'],
];
// Ready-made trails, the same as src/generator/spaces.js.
const SPACES = {
  apartment: ['Apartment', ['front_door', 'shoe_rack', 'couch', 'bookshelf', 'kitchen_table', 'fridge', 'bathtub', 'bed']],
  house: ['House', ['front_door', 'coat_closet', 'couch', 'stairs', 'pantry', 'dryer', 'bathtub', 'bed']],
  backyard: ['Backyard', ['front_door', 'doormat', 'mailbox', 'plant', 'swing', 'slide', 'sandbox', 'tree']],
};

// Theme cards: everyday themes and holidays. The holiday coming up goes first with a "Now" badge.
const KITS = {"dino":{"name":"Dino Dig Lab","blurb":"A T-Rex puzzle with your child’s name to dig up and put back together, a dino egg that hatches when you pull the tab, plus a whole shop to set up.","alt":"Dino Dig Lab kit pages: a welcome poster and two hands-on toys"},"hero":{"name":"Hero HQ","blurb":"A Super Power Spinner to pick today’s power, a Hero Power Meter and a Villain Alarm with needles that spin, plus a whole shop to set up.","alt":"Hero HQ kit pages: a welcome poster and two hands-on toys"},"pirate":{"name":"Pirate Ship","blurb":"A pirate spyglass to roll up, with a Spot It! list, a lift-the-flap treasure chest with six treasures, plus a whole shop to set up.","alt":"Pirate Ship kit pages: a welcome poster and two hands-on toys"},"space":{"name":"Mission Control","blurb":"A Planet Picker spinner to choose where to fly next, a launch pad card: pull the tab and the rocket blasts off, plus a whole shop to set up.","alt":"Mission Control kit pages: a welcome poster and two hands-on toys"},"royal":{"name":"Royal Castle","blurb":"A lift-the-flap castle with someone behind every window, a Royal Wish Wheel to spin for a royal wish, plus a whole shop to set up.","alt":"Royal Castle kit pages: a welcome poster and two hands-on toys"},"unicorn":{"name":"Unicorn Stable","blurb":"A Rainbow Maker spinner with six magic surprises, a unicorn puzzle with your child’s name, plus a whole shop to set up.","alt":"Unicorn Stable kit pages: a welcome poster and two hands-on toys"},"mermaid":{"name":"Mermaid Lagoon","blurb":"A seashell tiara with your child’s name, an under-the-sea puzzle with your child’s name, plus a whole shop to set up.","alt":"Mermaid Lagoon kit pages: a welcome poster and two hands-on toys"},"construction":{"name":"Construction Site","blurb":"A hard hat to wear, with your child’s name, a lift-the-flap toolbox with six tools, plus a whole shop to set up.","alt":"Construction Site kit pages: a welcome poster and two hands-on toys"},"vet":{"name":"Vet Clinic","blurb":"A lift-the-flap doctor’s bag with six tools to find, an X-ray machine: pull the tab to see inside a patient, plus a whole shop to set up.","alt":"Vet Clinic kit pages: a welcome poster and two hands-on toys"},"racecar":{"name":"Pit Stop Garage","blurb":"A full-size steering wheel with your child’s name on the horn, a speedometer and fuel gauge with needles that really spin, plus a whole shop to set up.","alt":"Pit Stop Garage kit pages: a welcome poster and two hands-on toys"},"fire":{"name":"Fire Station","blurb":"A firefighter helmet shield with your child’s name, a rescue card: pull the tab to put out the fire, plus a whole shop to set up.","alt":"Fire Station kit pages: a welcome poster and two hands-on toys"},"ice":{"name":"Ice Palace","blurb":"A Snowflake Spell spinner with six frosty spells, an ice palace puzzle with your child’s name, plus a whole shop to set up.","alt":"Ice Palace kit pages: a welcome poster and two hands-on toys"},"halloween":{"name":"Potion Shop","blurb":"A lift-the-flap potion cauldron with six secret ingredients, a Ghost-o-Meter and a Spell-o-Meter with needles that spin, plus a whole shop to set up.","alt":"Potion Shop kit pages: a welcome poster and two hands-on toys"},"christmas":{"name":"Santa’s Workshop","blurb":"Reindeer antlers to wear, with your child’s name, a Nice-o-Meter and a Sleigh Speed meter with needles that spin, plus a whole shop to set up.","alt":"Santa’s Workshop kit pages: a welcome poster and two hands-on toys"},"valentine":{"name":"Valentine Post Office","blurb":"A lift-the-flap Love Mailbox with six sweet surprises, a Kindness Spinner full of kind things to do, plus a whole shop to set up.","alt":"Valentine Post Office kit pages: a welcome poster and two hands-on toys"},"easter":{"name":"Bunny Egg Factory","blurb":"Bunny ears to wear, with your child’s name, a lift-the-flap egg basket with six surprises, plus a whole shop to set up.","alt":"Bunny Egg Factory kit pages: a welcome poster and two hands-on toys"},"pizza":{"name":"Pizza Shop","blurb":"A big pizza to top and slice with order cards, a cash register and a pizza menu.","alt":"Pizza Shop kit pages: a welcome poster, a shop sign and hands-on toys"},"burger":{"name":"Burger Shop","blurb":"Burger layers to stack to order, a drive-thru, a cash register and a burger menu.","alt":"Burger Shop kit pages: a welcome poster, a shop sign and hands-on toys"},"grocery":{"name":"Grocery Store","blurb":"Play food with price tags, aisle signs, coupons, a basket game and a checkout register.","alt":"Grocery Store kit pages: a welcome poster, a shop sign and hands-on toys"},"post":{"name":"Post Office","blurb":"Stamps, postcards and letters to mail, a parcel card with a pull tab and a post office till.","alt":"Post Office kit pages: a welcome poster, a shop sign and hands-on toys"},"library":{"name":"Library","blurb":"Library cards, a checkout desk, a Story Spinner and Quiet Please and Story Time signs.","alt":"Library kit pages: a welcome poster, a shop sign and hands-on toys"},"police":{"name":"Police Station","blurb":"A patrol car steering wheel with your child’s name, a lost teddy to find and report slips.","alt":"Police Station kit pages: a welcome poster, a shop sign and hands-on toys"},"dentist":{"name":"Dentist Office","blurb":"A big wipe-clean smile to brush, a lift-the-flap dentist bag, tooth charts and a front desk register.","alt":"Dentist Office kit pages: a welcome poster, a shop sign and hands-on toys"},"petshop":{"name":"Pet Shop","blurb":"Adoption papers for stuffed animals, a bubble-bath grooming card and a cash register.","alt":"Pet Shop kit pages: a welcome poster, a shop sign and hands-on toys"},"coffee":{"name":"Coffee Shop","blurb":"A café menu, a Drink Spinner for the barista, a tip jar sign and a cash register.","alt":"Coffee Shop kit pages: a welcome poster, a shop sign and hands-on toys"},"italian":{"name":"Italian Restaurant","blurb":"A pasta pot with a pull tab, a waiter’s order pad, table labels and a trattoria menu.","alt":"Italian Restaurant kit pages: a welcome poster, a shop sign and hands-on toys"},"auto":{"name":"Auto Repair Shop","blurb":"A lift-the-flap toolbox, work orders, car check-up forms, a car wash sign and a cash register.","alt":"Auto Repair Shop kit pages: a welcome poster, a shop sign and hands-on toys"},"kitchen":{"name":"Chef’s Kitchen","blurb":"A real-looking glowing oven window, stove burners, a sink and backsplash, a lift-the-flap fridge and a Recipe Spinner, plus a whole kitchen to set up.","alt":"Chef’s Kitchen kit pages: a welcome poster, a shop sign and hands-on toys"},"doctor":{"name":"Doctor’s Clinic","blurb":"A real-looking patient monitor, manila file folders with patient charts and intake forms, a lift-the-flap doctor’s bag and X-ray scans, plus a whole clinic to set up.","alt":"Doctor’s Clinic kit pages: a welcome poster, a shop sign and hands-on toys"},"puppet":{"name":"Puppet Theater","blurb":"Real-looking velvet stage curtains for a bookcase or doorway, stick puppets, a ticket booth and a Story Spinner, plus a whole theater to set up.","alt":"Puppet Theater kit pages: a welcome poster, a shop sign and hands-on toys"},"agent":{"name":"Secret Agent HQ","blurb":"A real-looking handprint scanner, Top Secret case file folders, a code decoder, fingerprint cards and a spy mask, plus a whole HQ to set up.","alt":"Secret Agent HQ kit pages: a welcome poster, a shop sign and hands-on toys"},"dressup":{"name":"Costume Shop","blurb":"Light-bulb dressing room mirror lights, a lift-the-flap wardrobe, hanger tags, a star crown and a Who Will I Be? spinner, plus a whole shop to set up.","alt":"Costume Shop kit pages: a welcome poster, a shop sign and hands-on toys"},"icecream":{"name":"Ice Cream Parlor","blurb":"A real-looking soft serve machine, scoops to stack on cones, topping jars, a Flavor Spinner and a cash register, plus a whole parlor to set up.","alt":"Ice Cream Parlor kit pages: a welcome poster, a shop sign and hands-on toys"},"airport":{"name":"Airport","blurb":"A real-looking airplane window, a check-in desk, a security scanner with a pull tab, boarding passes and passport stamps, plus a whole airport to set up.","alt":"Airport kit pages: a welcome poster, a shop sign and hands-on toys"}};
const HOLIDAYS = {
  halloween: { from: [9, 1], to: [10, 31] },
  christmas: { from: [11, 1], to: [12, 25] },
  valentine: { from: [1, 10], to: [2, 14] },
  easter: { from: [3, 1], to: [4, 20] },
};
const today = new Date();
const md = (m, d) => m * 100 + d;
const now = md(today.getMonth() + 1, today.getDate());
const seasonal = Object.keys(HOLIDAYS).find((id) => { const h = HOLIDAYS[id]; return now >= md(...h.from) && now <= md(...h.to); });
const ordered = seasonal ? [THEMES.find((t) => t.id === seasonal), ...THEMES.filter((t) => t.id !== seasonal)] : THEMES;

// Short names for the theme strip.
const THEME_LABELS = { dino: 'Dinosaur', hero: 'Superhero', pirate: 'Pirate', space: 'Outer Space', royal: 'Princess & Knights', unicorn: 'Unicorn', mermaid: 'Mermaid', construction: 'Construction', vet: 'Pet Vet', easter: 'Easter', halloween: 'Halloween', christmas: 'Christmas', valentine: 'Valentine’s', fire: 'Firefighter', ice: 'Ice Kingdom', racecar: 'Race Car', pizza: 'Pizza Shop', burger: 'Burger Shop', grocery: 'Grocery Store', post: 'Post Office', library: 'Library', police: 'Police', dentist: 'Dentist', petshop: 'Pet Shop', coffee: 'Café', italian: 'Italian', auto: 'Auto Shop', kitchen: 'Play Kitchen', doctor: 'Doctor', puppet: 'Puppet Theater', agent: 'Secret Agent', dressup: 'Dress-Up', icecream: 'Ice Cream', airport: 'Airport' };

// Theme groups for the filter chips above the theme tiles. Every theme sits in exactly one group;
// a new theme missing from these lists still shows under All (test/smoke.js checks they all appear).
const THEME_GROUPS = [
  { id: 'adventure', label: 'Adventure', ids: ['dino', 'hero', 'pirate', 'space', 'racecar', 'agent'] },
  { id: 'magic', label: 'Make-believe', ids: ['royal', 'unicorn', 'mermaid', 'ice', 'puppet', 'dressup'] },
  { id: 'helpers', label: 'Helpers', ids: ['fire', 'police', 'doctor', 'dentist', 'vet', 'construction', 'auto', 'post', 'library', 'airport'] },
  { id: 'shops', label: 'Food & shops', ids: ['pizza', 'burger', 'italian', 'coffee', 'icecream', 'kitchen', 'grocery', 'petshop'] },
  { id: 'holidays', label: 'Holidays', ids: ['halloween', 'christmas', 'valentine', 'easter'] },
];

// The cart is a stack of papers: the hunt, its play kit, the activity pack and the party pack.
// Pick any mix; two together cost less.
const LAYERS = [
  { id: 'hunt', name: 'Scavenger Hunts', note: 'Clue cards, host guide, puzzle finale, certificate and two bonus games', price: 9.99 },
  { id: 'kit', name: 'Pretend play', note: 'Hands-on toys, a shop set and signs with their name', price: 7.99 },
  { id: 'activity', name: 'Activity pack', note: 'Mazes, I spy, color by number and a get-up-and-move card game', price: 4.99 },
  { id: 'party', name: 'Party pack', note: 'Invitations, toppers, banner, favor tags and more', price: 6.99 },
];
// Must match PRICES in the order bot (src/bot/products.js).
const PRICES = { hunt: 9.99, kit: 7.99, party: 6.99, 'hunt+kit': 14.99, 'hunt+party': 13.99, 'kit+party': 12.99, bundle: 16.99, activity: 4.99, activityAdd: 3 };
// Real page counts from scripts/page-counts.js (re-run it after adding pages). A hunt is 7 pages plus
// one sheet per two clue cards, so it follows the spots picked.
const PAGES = {"kit":{"dino":44,"hero":44,"pirate":44,"space":44,"royal":44,"unicorn":45,"mermaid":45,"construction":45,"vet":53,"easter":45,"halloween":41,"christmas":40,"valentine":43,"fire":40,"ice":41,"racecar":39,"pizza":54,"burger":45,"grocery":45,"post":44,"library":45,"police":44,"dentist":49,"petshop":45,"coffee":47,"italian":54,"auto":46,"kitchen":57,"doctor":51,"puppet":49,"agent":54,"dressup":48,"icecream":49,"airport":49},"activity":{"big":16,"little":17},"party":15,"craft":{"halloween":20,"christmas":20,"memory":29,"zoo":28,"fingerprint":28}};
function pagesOf(k, theme, spots = 6, ages = 'big') {
  return { hunt: 7 + Math.ceil(Math.min(10, Math.max(6, spots)) / 2), kit: PAGES.kit[theme], activity: PAGES.activity[ages], party: PAGES.party }[k] || 0;
}
const LABELS = { hunt: 'Scavenger Hunts', kit: 'Play kit', activity: 'Activity pack', party: 'Party pack' };
// Same names as productFor in the order bot: "bundle" is hunt + kit + party, the activity pack adds "+activity".
function productOf(gets) {
  const rest = gets.filter((k) => k !== 'activity');
  const base = rest.length === 3 ? 'bundle' : rest.join('+');
  return gets.includes('activity') ? (base ? `${base}+activity` : 'activity') : base || null;
}
const priceOf = (p) => (p && p !== 'activity' && p.endsWith('+activity') ? priceOf(p.slice(0, -9)) + PRICES.activityAdd : PRICES[p] || 0);

// Captions for the preview gallery's real pages, made by scripts/gallery-images.js (img/gallery/<theme>/<item>-<n>.webp).
const GALLERY = {
  hunt: ['Host guide and hiding checklist', 'Mission briefing to read aloud', 'Clue cards', 'More clue cards', 'Certificate'],
  party: ['Invitations', 'Thank-you cards', 'Cupcake toppers', 'Favor tags', 'Birthday banner'],
  kit: ['Welcome poster', 'Shop signs', 'Wow piece', 'Big picture page', 'Hands-on play page'],
  activity: ['Activity pack checklist', 'I spy', 'Secret code', 'Color by number', 'Roll a silly creature'],
  activityLittle: ['Activity pack checklist', 'Trace the path', 'Stick it on (cut and glue)', 'Color by dot', 'I spy'],
};
// Cardboard box builds that use the kit's signs and props (docs/img/howto/), shown after the kit pages.
const HOWTO = {"auto": "Make a Car Wash", "burger": "Make a Drive-Thru", "christmas": "Make a Sleigh", "coffee": "Make a Coffee Machine", "construction": "Make Cardboard Bricks", "dentist": "Make a Prize Box", "dino": "Make a Dino Dig Pit", "easter": "Make an Egg Drying Rack", "fire": "Make a Fire Truck", "grocery": "Make a Store Shelf", "halloween": "Make a Potion Counter", "hero": "Make a Cape Closet", "ice": "Make an Igloo Den", "italian": "Make a Play Stove", "library": "Make a Book Drop", "mermaid": "Make a Treasure Chest", "petshop": "Make a Puppy House", "pirate": "Make a Pirate Ship", "pizza": "Make a Pizza Oven", "police": "Make a Police Car", "post": "Make a Mailbox", "racecar": "Make a Race Car", "royal": "Make a Castle", "space": "Make a Rocket", "unicorn": "Make a Unicorn Stable", "valentine": "Make a Valentine Mailbox", "vet": "Make an X-Ray Machine"};

// Shop play kits: each one is a theme too, with its own hunt and party pack. "Get the kit" opens
// make/?kit=<id> with just the play kit ticked, so the rest of the set can be added there.
const SHOP_KITS = [
  ['pizza', 'Pizza Shop', 'A big pizza to top and slice with order cards, a cash register and a pizza menu.'],
  ['burger', 'Burger Shop', 'Burger layers to stack to order, a drive-thru, a cash register and a burger menu.'],
  ['grocery', 'Grocery Store', 'Play food with price tags, aisle signs, coupons, a basket game and a checkout register.'],
  ['post', 'Post Office', 'Stamps, postcards and letters to mail, a parcel card with a pull tab and a post office till.'],
  ['library', 'Library', 'Library cards, a checkout desk, a Story Spinner and Quiet Please and Story Time signs.'],
  ['police', 'Police Station', 'A patrol car steering wheel with your child’s name, a lost teddy to find and report slips.'],
  ['dentist', 'Dentist Office', 'A big wipe-clean smile to brush, a lift-the-flap dentist bag, tooth charts and a front desk register.'],
  ['petshop', 'Pet Shop', 'Adoption papers for stuffed animals, a bubble-bath grooming card and a cash register.'],
  ['coffee', 'Coffee Shop', 'A café menu, a Drink Spinner for the barista, a tip jar sign and a cash register.'],
  ['italian', 'Italian Restaurant', 'A pasta pot with a pull tab, a waiter’s order pad, table labels and a trattoria menu.'],
  ['auto', 'Auto Repair Shop', 'A lift-the-flap toolbox, work orders, car check-up forms, a car wash sign and a cash register.'],
  ['kitchen', 'Chef’s Kitchen', 'A glowing oven window, stove burners, a sink, a lift-the-flap fridge and a Recipe Spinner for any play kitchen.'],
  ['doctor', 'Doctor’s Clinic', 'A patient monitor, manila folders with patient charts and intake forms, a doctor’s bag and X-ray scans.'],
  ['puppet', 'Puppet Theater', 'Velvet stage curtains for a bookcase or doorway, stick puppets, a ticket booth and seat signs.'],
  ['agent', 'Secret Agent HQ', 'A handprint scanner, Top Secret case files, a code decoder, fingerprint cards and a spy mask.'],
  ['dressup', 'Costume Shop', 'Dressing room mirror lights, a lift-the-flap wardrobe, hanger tags, bin labels and a star crown.'],
  ['icecream', 'Ice Cream Parlor', 'A soft serve machine, scoops to stack on cones, topping jars, a Flavor Spinner and a register.'],
  ['airport', 'Airport', 'An airplane window, a check-in desk, a security scanner, boarding passes and passport stamps.'],
];

// Handprint art packs: one per holiday, ordered on their own.
const CRAFTS = [
  ['halloween', 'Halloween', 'Ghosts, a spider, a bat, candy corn feet and a fingerprint pumpkin patch.', 'Halloween handprint art', 'Halloween pack', '5.99'],
  ['christmas', 'Christmas', 'A handprint tree, a reindeer footprint, Santa, snowmen, a wreath and penguins.', 'Christmas handprint art', 'Christmas pack', '5.99'],
  ['memory', 'Memory Handprint Book', 'A page for every month: a polar bear, a heart, a butterfly, an octopus, a turkey and more.', 'Memory Handprint Book', 'book', '7.99'],
  ['zoo', 'Handprint Zoo', 'Twelve handprint animals: a lion, an elephant, a peacock, a crab, a dinosaur, a unicorn and more.', 'Handprint Zoo', 'book', '7.99'],
  ['fingerprint', 'Fingerprint Friends', 'Twelve fingerprint pictures: ladybugs, balloons, sheep, penguins, snowmen, fireflies and more.', 'Fingerprint Friends', 'book', '7.99'],
];
// Real pages of each pack, made by scripts/craft-gallery.js (docs/img/gallery/crafts/<id>-1.webp...).
const CRAFT_PAGES = {
  halloween: ['Handprint Ghosts', 'Itsy Bitsy Spider', 'Batty for You', 'Fingerprint Pumpkin Patch', 'Handprint cards', 'Cut-out add-ons', 'These Little Hands poem'],
  christmas: ['Handprint Christmas Tree', 'Reindeer Footprint', 'Ho Ho Ho Santa', 'Fingerprint Christmas Lights', 'Handprint cards', 'Cut-out add-ons', 'These Little Hands poem'],
  memory: ['Cover', 'How to make each page', 'January', 'May', 'October', 'Look how I’ve grown'],
  zoo: ['Cover', 'How to make each page', 'Lion', 'Dinosaur', 'Unicorn', 'Bumblebee'],
  fingerprint: ['Cover', 'How to make each page', 'Ladybugs', 'Balloons', 'Fishbowl', 'Fireflies'],
};
