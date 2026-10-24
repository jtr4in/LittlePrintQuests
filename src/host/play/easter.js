// Play Kit ideas for the Bunny Egg Factory kit (Field Kit).
module.exports = {
  scenarios: [
    { title: 'First Egg Order', setup: 'Set out the Egg Order Forms, crayons, and the Plain egg cards in the Paint Studio.', say: 'Hello, egg painter {name}! I’d love three spotty eggs in my favorite color, purple!', twist: 'The customer changes their mind and wants every egg to have a tiny smiley face.' },
    { title: 'Rush Order!', setup: 'Grab a yellow crayon, a few Painted Eggs cards, and a Delivery Slip.', say: 'Peep peep! I’m a little chick and I need sunny yellow eggs before lunch!', twist: 'The chick falls asleep while waiting, so the delivery bunny must tiptoe in super quietly.' },
    { title: 'Egg Shop Day', setup: 'Set out the Egg Shop Prices menu, the carrot coins, and the Painted Eggs cards.', say: 'Good morning! How many carrot coins for a golden egg and a chocolate egg?', twist: 'A squirrel customer tries to pay with acorns. Can the shop think of a fair trade?' },
    { title: 'Hoppy Delivery Day', setup: 'Lay the Bunny Delivery Map on the floor and fill a basket with egg cards.', say: 'Delivery Bunny {name}, the Duck Pond is waiting for a full basket. Hop it over!', twist: 'Every stop on the map, the bunny has to hop a different way: tiny hops, giant hops or sideways hops!' },
    { title: 'Missing Golden Egg', setup: 'Hide one golden egg card somewhere in the room and wear the Bunny Ears.', say: 'Oh no! The golden egg rolled off the Drying Rack. Can you find it?', twist: 'The golden egg left a trail of jelly bean clues, and each clue says to do a silly dance.' },
    { title: 'Surprise Basket', setup: 'Hand over the Surprise Egg Basket flap toy and a stuffed bunny as the customer.', say: 'I heard there are six surprises in this basket. Will you show me one?', twist: 'Each surprise you find, act it out: peep like a chick, munch like a carrot muncher!' },
    { title: 'Hiring Helpers', setup: 'Tape the Help Wanted posters around the factory and set out the Bunny Helper Badges.', say: 'Hello! I saw the HIRING poster. Can a lamb like me tie ribbons?', twist: 'The new helper ties every bow way too big. Can the team help them practice?' },
    { title: 'Carrot Café Break', setup: 'Set up a little table as the Carrot Café with play food and carrot coins.', say: 'Head Egg Painter {name}, the helpers are hungry! Is the Carrot Café open?', twist: 'The café runs out of carrots, so the chef invents a brand new rainbow snack.' },
  ],
  lines: {
    kid: [
      'Hop in! Eggs painted fresh today!',
      'What color eggs would you like?',
      'That’s two carrot coins, please.',
      'Careful, wet paint on the Drying Rack!',
      'Your basket is packed with care!',
      'Hop, hop, hop! Delivery is on the way!',
    ],
    grownup: [
      'Can you paint me a rainbow egg, {name}?',
      'How many eggs fit in one basket?',
      'Which delivery spot is closest on the map?',
      'Could you tie a bouncy bow on my basket, please?',
      'Can you show me your best bunny hop?',
      'May I have an Egg-cellent Sticker for helping?',
    ],
  },
  games: [
    { title: 'Count the Carrots', how: 'Pick two eggs from the Egg Shop menu. The child adds up the price and counts out carrot coins.', uses: 'Egg Shop Prices, carrot coins' },
    { title: 'Match the Pattern', how: 'Point to a pattern on an Egg Order Form, like stripes or stars. The child finds an egg card or colors one to match.', uses: 'Egg Order Forms, Painted Eggs cards' },
    { title: 'Bunny Hop Map', how: 'Name a stop on the Bunny Delivery Map. Hop that many times to get there, then deliver an egg.', uses: 'Bunny Delivery Map, Bunny Ears' },
    { title: 'Basket Fill-Up', how: 'Read a number on a Delivery Slip. The child packs that many egg cards into the basket.', uses: 'Delivery Slips, Painted Eggs cards' },
    { title: 'Peekaboo Basket', how: 'Name a surprise, like a baby chick. The child guesses which flap it hides under and lifts to check.', uses: 'Surprise Egg Basket' },
  ],
};
