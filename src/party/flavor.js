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
