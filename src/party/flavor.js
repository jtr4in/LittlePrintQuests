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
  construction: { party: 'Construction Party', tagline: 'Hard hats on, let’s build fun!', foods: ['Dump Truck Dirt', 'Traffic Cones', 'Rocks & Rubble'] },
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
