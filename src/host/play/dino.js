// Play Kit ideas for the Dino Dig Lab.
module.exports = {
  scenarios: [
    { title: 'The Big Dig', setup: 'Bury the Rebuild the T-Rex puzzle pieces in a bin of rice or under pillows and hand out a brush.', say: 'Dr. {name}, we heard there’s a T-Rex buried here! Can you dig up all nine pieces?', twist: 'The last puzzle piece is missing, and a sneaky lab cat is sitting right on top of it.' },
    { title: 'Egg Is Hatching', setup: 'Use the Hatch a Dino Egg card and a basket of sock “eggs” under the Hatchery sign.', say: 'Shh, I think the egg is wobbling! Can you help it hatch, very gently?', twist: 'The baby dino thinks the scientist is its mommy and follows them everywhere.' },
    { title: 'Volcano Rumble', setup: 'Tape up the Volcano Lookout sign and put the dino eggs on the other side of the room.', say: 'Rumble, rumble! The volcano is waking up! Save the eggs, quick!', twist: 'The floor is hot lava now. Rescue the eggs by stepping only on pillows!' },
    { title: 'Museum Tour', setup: 'Line up toy dinos under the Dino Museum sign and fill in Museum Tickets for the visitors.', say: 'Hello, Museum Guide! Here’s my ticket. Which dinosaur is the biggest?', twist: 'One of the museum dinosaurs comes to life and wants to join the tour.' },
    { title: 'Gift Shop Day', setup: 'Set out the Museum Gift Shop menu, fossil coins and some Fossil Finds cards.', say: 'I’d love a toy T-Rex and a shiny rock. How many fossil coins is that?', twist: 'A visitor tries to pay with a real dinosaur egg. Is that enough coins?' },
    { title: 'Fossil Lab Match', setup: 'Spread out the Fossil Scans and a few toy dinosaurs on the Fossil Lab table.', say: 'Lab Scientist, we found this scan! Which dinosaur does it belong to?', twist: 'The lab finds a brand new species. Give it a silly name and draw it!' },
    { title: 'Sick Little Dino', setup: 'Set out a Dino Check-Up record card and a toy dinosaur that needs care.', say: 'Dr. {name}, my long-neck has a sore tail. Can you check him over?', twist: 'The dino’s big roar is stuck and only comes out as a tiny squeak.' },
    { title: 'Map Adventure', setup: 'Lay out the Dig Site Map and hide a toy dinosaur at each spot.', say: 'Map Maker {name}, we start at base camp. Which way to the Bone Bed?', twist: 'A big T-Rex footprint trail appears. Follow the stomps to find who made it!' },
  ],
  lines: {
    kid: [
      'Welcome to the Dino Dig Lab! Grab a brush.',
      'Dig gently, these bones are very old!',
      'Look with your eyes, not your claws, please.',
      'A museum ticket costs one fossil coin.',
      'This scan shows big sharp teeth. It must be a T-Rex!',
      'Keep the eggs warm. Shh, the babies are sleeping.',
    ],
    grownup: [
      'Dr. {name}, I found a bone! What dinosaur is it from?',
      'Can you show me how a T-Rex stomps?',
      'How many fossil coins for a magnifier and a bone puzzle?',
      'Can you measure this dinosaur? How long is it?',
      'Oh no, the volcano is rumbling! Where should I take the eggs?',
      'Will you give me a tour of the museum, please?',
    ],
  },
  games: [
    { title: 'Puzzle Dig', how: 'Hide the nine T-Rex puzzle pieces and dig them up one by one. Count each piece, then build the T-Rex.', uses: 'Rebuild the T-Rex puzzle' },
    { title: 'Scan Match', how: 'Lay out the Fossil Scans and the toy dinosaurs. Match each scan to a dino and tick what the lab found.', uses: 'Fossil Scans' },
    { title: 'Dino Moves', how: 'Call out a dinosaur, and your child moves like it: stomp like a T-Rex, stretch like a long-neck. Freeze when the volcano rumbles!', uses: 'Dig Team Badges, Volcano Lookout sign' },
    { title: 'Fossil Coin Shop', how: 'Pick two gift shop items and add up the fossil coins. Pay together and count the change.', uses: 'Museum Gift Shop menu, fossil coins' },
    { title: 'Map Treasure Hunt', how: 'Hide a Fossil Finds card at each place on the map. Follow the map from base camp to the nest to find them all.', uses: 'Dig Site Map, Fossil Finds cards' },
  ],
};
