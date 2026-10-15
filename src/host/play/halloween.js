// Play Kit ideas for the Potion Shop kit (Host Mode).
module.exports = {
  scenarios: [
    { title: 'The Giggle Potion', setup: 'Put a big bowl and spoon on the Mixing Station with the Ingredient Cards next to it.', say: 'Hello, Wizard {name}! I feel a bit grumpy today. Do you have a giggle potion?', twist: 'The potion works too well and the customer can’t stop giggling. Mix a calm-down potion!' },
    { title: 'Oops, Hiccups!', setup: 'Pick a toy frog as the customer and grab a Potion Recipe card.', say: 'Hic! I drank a hiccup potion by mistake. Hic! Can you help me? Hic!', twist: 'Every time the frog hiccups, everyone in the shop has to hop once.' },
    { title: 'Catch the Runaways', setup: 'Tape the Runaway Ingredients wanted posters around the room and hide a few ingredient cards.', say: 'Potion makers! Hoppy the Frog jumped out of the cauldron. Can you catch him?', twist: 'Slowpoke Snail is so slow that you must tiptoe in slow motion to catch him.' },
    { title: 'Ghost Hunt', setup: 'Hand over the Ghost-o-Meter from the Spooky Meters and tuck a friendly ghost toy somewhere.', say: 'Psst, {name}! I think a friendly ghost is hiding in here. Can your Ghost-o-Meter find it?', twist: 'The ghost is shy and only comes out if everyone whispers a joke.' },
    { title: 'Potion Counter Rush', setup: 'Set out the Potion Prices menu, the pumpkin coins, and some cups for potions.', say: 'Good evening! I’d like a sparkle potion and a lollipop. How many pumpkin coins is that?', twist: 'A bat customer only pays in whispers. How many whispers is one coin?' },
    { title: 'Secret Ingredient', setup: 'Hand over the Bubbling Potion Cauldron flap toy and a wooden spoon.', say: 'My potion needs one secret ingredient. Lift a door and tell me what’s inside!', twist: 'Each ingredient makes the potion do something silly: moonbeam makes everyone glow and spin.' },
    { title: 'Potion Check-Up', setup: 'Give a stuffed animal a pretend potion and grab a Potion Check-Up record card.', say: 'Doctor Potion {name}, I drank a rainbow potion. Is my hair turning colors?', twist: 'The Spell-o-Meter says Pumpkin power! The customer suddenly turns into a pumpkin.' },
    { title: 'Costume Party Shop', setup: 'Put on the Costume Masks and set out the Potion Club Cards.', say: 'Who’s that behind the mask? I’m a little dragon and I want to join the Potion Club!', twist: 'Everyone swaps masks and must talk like their new costume while ordering.' },
  ],
  lines: {
    kid: [
      'Bubbling potions, step right in!',
      'What kind of silly potion do you need?',
      'Stir, swirl and bubble! Your potion is ready.',
      'That will be three pumpkin coins, please.',
      'Please park your broomstick over there.',
      'Here’s a Potion Sticker for being brave!',
    ],
    grownup: [
      'Wizard {name}, what’s the silliest potion you make?',
      'Can you pick three ingredients for my potion?',
      'How many times should I stir the cauldron?',
      'My Ghost-o-Meter says Boo! Can you help me look?',
      'Can you stamp my Potion Club Card, please?',
      'What does a moonbeam taste like, do you think?',
    ],
  },
  games: [
    { title: 'Three-Stir Potion', how: 'Pick three Ingredient Cards and drop them in the cauldron. Stir once for each card while counting out loud.', uses: 'Ingredient Cards, Potion Recipe' },
    { title: 'Pumpkin Coin Shop', how: 'Choose a potion from the menu. The child counts out the right number of pumpkin coins to pay.', uses: 'Potion Prices menu, pumpkin coins' },
    { title: 'Ghost-o-Meter Hot Cold', how: 'Hide a ghost toy. Turn the Ghost-o-Meter needle toward Boo! as the child gets closer.', uses: 'Spooky Meters' },
    { title: 'Wanted Round-Up', how: 'Hide the four runaway ingredients around the room. Find each one and match it to its Wanted poster.', uses: 'Runaway Ingredients posters, Ingredient Cards' },
    { title: 'Potion Freeze Dance', how: 'Dance while someone stirs the cauldron. When they shout Poof, freeze like a statue!', uses: 'Potion Maker Badges, Costume Masks' },
  ],
};
