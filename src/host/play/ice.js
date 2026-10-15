// Play Kit ideas for the Ice Palace.
module.exports = {
  scenarios: [
    { title: 'The Winter Ball', setup: 'Fill out Snow Invitations for the stuffed animal guests and put the tiara on {name}.', say: 'Your Majesty, I got your snow invitation! May I come to the winter ball?', twist: 'The music gets faster and faster. Everyone has to twirl until it stops!' },
    { title: 'Cocoa Corner Café', setup: 'Set out the Cocoa Corner menu, the crystal snowflakes and the Winter Treasures cards.', say: 'Brrr, I’m so cold! One hot cocoa and a snow cookie, please. How many snowflakes?', twist: 'The cocoa is too hot! Blow on it together, then it turns into ice cream by magic.' },
    { title: 'Fox on the Loose', setup: 'Hide the Ice Palace Puzzle pieces under white pillows and blankets around the room.', say: 'Oh no! Pip the Snow Fox swished the palace away! Can you find all the pieces?', twist: 'Pip left fox tracks. Tiptoe like a fox to follow them!' },
    { title: 'Snowflake Spells', setup: 'Bring out the Snowflake Spells spinner and gather the guests in the Throne Room.', say: 'Snow Wizard {name}, please cast a spell on me! I’m ready!', twist: 'Spin Freeze and everyone must stay still until someone spins Melt it.' },
    { title: 'Throne Room Visit', setup: 'Make a throne with a blanket, and have a Snow Guest Card ready for each visitor.', say: 'Hello, Ruler of the Ice Palace! I’m a polar bear. May I ask a royal favor?', twist: 'The polar bear forgot how to bow. Show three different royal bows!' },
    { title: 'Skating Rink Show', setup: 'Tape up the Skating Rink sign and give everyone socks for sliding on the floor.', say: 'Star Skater, can you show me how to glide and spin on the ice?', twist: 'The ice gets wobbly! Skate like a penguin with tiny waddle steps.' },
    { title: 'Kingdom Sleigh Tour', setup: 'Lay out the Map of the Ice Kingdom and sell Sleigh ride tickets for crystal snowflakes.', say: 'One sleigh ride, please! Can you take me to Penguin Point?', twist: 'A big snowstorm blows in. Huddle together like penguins until it passes!' },
    { title: 'Snowflake Vault Guard', setup: 'Put the Palace Passes and the Winter Treasures gems by the Snowflake Vault sign.', say: 'Palace Guard {name}, may I peek in the Snowflake Vault? Here’s my Palace Pass.', twist: 'The guest forgot the password! Make up a frosty password together.' },
  ],
  lines: {
    kid: [
      'Welcome to the Ice Palace! Please wipe your snowy boots.',
      'Hot cocoa is two crystal snowflakes.',
      'Would you like to come to the winter ball?',
      'Let me stamp your Palace Pass!',
      'Abracadabra, snowflake spell!',
      'Bundle up, it’s chilly outside!',
    ],
    grownup: [
      'Your Majesty {name}, what spell will you cast today?',
      'Can you count my crystal snowflakes for a frosty cupcake?',
      'Will you teach me to skate like a swan?',
      'I’d like to be a guest at the ball. Can you write my invitation?',
      'Pip the fox is hiding! Can you help me find the puzzle pieces?',
      'What snowy title should I have on my guest card?',
    ],
  },
  games: [
    { title: 'Freeze and Melt', how: 'Spin the Snowflake Spells spinner and act out each spell. On Freeze, stay still until someone spins Melt it!', uses: 'Snowflake Spells spinner' },
    { title: 'Snowy Puzzle Hunt', how: 'Hide the nine puzzle pieces under white pillows. Find them all and rebuild the palace!', uses: 'Ice Palace Puzzle' },
    { title: 'Cocoa Counting', how: 'Pick two treats from the Cocoa Corner menu. Add up the crystal snowflakes and pay.', uses: 'Cocoa Corner menu and snowflakes' },
    { title: 'Kingdom Tour', how: 'Walk a guest along the Map of the Ice Kingdom. Stamp their Palace Pass at every place you visit.', uses: 'Ice Kingdom map and Palace Passes' },
    { title: 'Treasure Trade', how: 'Each guest gets five crystal snowflakes. Choose Winter Treasures to buy without going over five!', uses: 'Winter Treasures and snowflakes' },
  ],
};
