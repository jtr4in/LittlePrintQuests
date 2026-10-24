// Party Pack wording per theme id: invite tagline, short party name and three
// food tent cards. Themes missing here (new ones in src/generator/themes.js)
// get the generic fallback, so every theme still renders.

const FLAVOR = {
  dino: { party: 'Dino Party', tagline: 'Join the dino dig!', foods: ['Dino Eggs', 'Volcano Punch', 'Fossil Bones'] },
  hero: { party: 'Superhero Party', tagline: 'Suit up for a super party!', foods: ['Power Punch', 'Hero Fuel', 'Super Bites'] },
  pirate: { party: 'Pirate Party', tagline: 'Ahoy! Set sail for treasure!', foods: ['Pirate Gold', 'Sea Water', 'Cannon Balls'] },
  space: { party: 'Space Party', tagline: 'Blast off to the stars!', foods: ['Moon Rocks', 'Rocket Fuel', 'Asteroid Bites'] },
  royal: { party: 'Royal Party', tagline: 'Join the royal celebration!', foods: ['Crown Jewels', 'Royal Tea', 'Dragon Eggs'] },
  unicorn: { party: 'Unicorn Party', tagline: 'Join the magical celebration!', foods: ['Unicorn Horns', 'Rainbow Punch', 'Magic Clouds'] },
  mermaid: { party: 'Mermaid Party', tagline: 'Make a splash under the sea!', foods: ['Mermaid Tails', 'Ocean Water', 'Seashell Snacks'] },
  vet: { party: 'Pet Vet Party', tagline: 'Paws up, it’s party time!', foods: ['Puppy Chow', 'Kitty Milk', 'Bunny Bites'] },
  construction: { party: 'Construction Party', tagline: 'Hard hats on, let’s build fun!', foods: ['Dump Truck Dirt', 'Traffic Cones', 'Rocks & Rubble'] },
  easter: { party: 'Easter Party', tagline: 'Hop on over for spring fun!', foods: ['Bunny Bait', 'Carrot Juice', 'Golden Eggs'] },
  halloween: { party: 'Halloween Party', tagline: 'Boo! Come party in costume!', foods: ['Pumpkin Bites', 'Bubbling Brew', 'Ghost Puffs'] },
  christmas: { party: 'Christmas Party', tagline: 'Ho ho ho, let’s celebrate!', foods: ['Reindeer Food', 'Hot Cocoa', 'Snowball Bites'] },
  valentine: { party: 'Valentine’s Party', tagline: 'Come share the love!', foods: ['Sweetheart Snacks', 'Cupid’s Punch', 'Love Bug Bites'] },
  fire: { party: 'Firefighter Party', tagline: 'Sirens on, it’s party time!', foods: ['Hydrant Punch', 'Ladder Pretzels', 'Dalmatian Bites'] },
  ice: { party: 'Winter Wonderland Party', tagline: 'Bundle up for a snowy celebration!', foods: ['Snowballs', 'Snowflake Punch', 'Icicle Sticks'] },
  racecar: { party: 'Race Car Party', tagline: 'Start your engines, it’s party time!', foods: ['Racing Fuel', 'Spare Tires', 'Stoplight Bites'] },
  pizza: { party: 'Pizza Party', tagline: 'Grab a slice, it’s party time!', foods: ['Pizza Slices', 'Tomato Punch', 'Cheesy Bites'] },
  burger: { party: 'Burger Party', tagline: 'Order up! It’s party time!', foods: ['Mini Burgers', 'Milkshake Punch', 'Crispy Fries'] },
  grocery: { party: 'Grocery Store Party', tagline: 'Fill your cart with party fun!', foods: ['Fresh Fruit', 'Aisle 5 Punch', 'Checkout Snacks'] },
  post: { party: 'Post Office Party', tagline: 'Special delivery: you’re invited!', foods: ['Stamp Cookies', 'Mailbag Mix', 'Postage Punch'] },
  library: { party: 'Book Party', tagline: 'Turn the page to a party!', foods: ['Bookworm Bites', 'Story Time Punch', 'Bookmark Cookies'] },
  police: { party: 'Police Party', tagline: 'Calling all officers to the party!', foods: ['Donut Patrol', 'Siren Punch', 'Badge Cookies'] },
  dentist: { party: 'Sparkle Smile Party', tagline: 'Flash a smile, it’s party time!', foods: ['Crunchy Apples', 'Sparkle Water', 'Cheese Smiles'] },
  petshop: { party: 'Pet Shop Party', tagline: 'Paws and party hats on!', foods: ['Doggy Bones', 'Fishbowl Punch', 'Kitty Crunch'] },
  coffee: { party: 'Café Party', tagline: 'Join us for cocoa and cake!', foods: ['Hot Cocoa', 'Mini Muffins', 'Marshmallow Clouds'] },
  italian: { party: 'Pasta Party', tagline: 'Mangia! Come party with us!', foods: ['Meatball Bites', 'Garlic Bread', 'Gelato Cups'] },
  auto: { party: 'Car Party', tagline: 'Rev your engines for a party!', foods: ['Motor Oil Punch', 'Spare Tire Donuts', 'Lug Nut Snacks'] },
  kitchen: { party: 'Little Chef Party', tagline: 'Put on your apron and cook up some fun!', foods: ['Chef’s Special', 'Mini Pizzas', 'Kitchen Cookies'] },
  doctor: { party: 'Doctor Party', tagline: 'The clinic is open for party check-ups!', foods: ['Get Well Juice', 'Bandage Bites', 'Apple a Day'] },
  puppet: { party: 'Puppet Show Party', tagline: 'Grab a ticket, the show is about to start!', foods: ['Show Popcorn', 'Ticket Treats', 'Curtain Call Punch'] },
  agent: { party: 'Secret Agent Party', tagline: 'Top secret: you are invited!', foods: ['Clue Cookies', 'Mystery Punch', 'Spy Snacks'] },
  dressup: { party: 'Dress-Up Party', tagline: 'Come in costume and walk the runway!', foods: ['Runway Bites', 'Sparkle Punch', 'Crown Cookies'] },
  icecream: { party: 'Ice Cream Party', tagline: 'Come get the scoop on all the fun!', foods: ['Sundae Bar', 'Sprinkle Punch', 'Cone Cookies'] },
  airport: { party: 'Birthday Flight Party', tagline: 'Fasten your seatbelts for a birthday flight!', foods: ['Airplane Snacks', 'Cloud Puffs', 'Jet Fuel Juice'] },
};

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function flavorFor(theme) {
  const f = FLAVOR[theme.id] || {};
  const word = cap(String(theme.id || 'Birthday').replace(/[-_]+/g, ' '));
  return {
    party: f.party || `${word} Party`,
    tagline: f.tagline || 'Come celebrate with us!',
    foods: f.foods || ['Party Snacks', 'Fruit Punch', 'Birthday Cake'],
  };
}

module.exports = { FLAVOR, flavorFor };
