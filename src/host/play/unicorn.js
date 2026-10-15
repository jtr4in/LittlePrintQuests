// Play Kit ideas for the Unicorn Stable kit.
module.exports = {
  scenarios: [
    { title: 'Snack Time at the Treat Barn', setup: 'Set out the Treat Barn menu with play food and a pile of rainbow gems.', say: 'Neigh! Hello, {name}! My tummy is rumbly. Can I have a carrot and some rainbow oats?', twist: 'The baby dragon wants a cupcake but only has one gem. How can the stable keeper help?' },
    { title: 'Sparkle Check-up', setup: 'Line up toy unicorns with Sparkle Check-up cards and the Sparkle Scans.', say: 'Doctor {name}, my horn has stopped sparkling! Can you check me over?', twist: 'The sparkle scan says “needs a nap,” and the unicorn falls asleep right on the table!' },
    { title: 'Grooming Salon', setup: 'Tape up the Grooming Salon sign and set out a toy brush and hair bows from the Stable Supplies.', say: 'Hello! I’d like my mane braided with a pink bow, please.', twist: 'The unicorn sneezes and its mane turns all the colors of the rainbow!' },
    { title: 'Rainbow Trail Ride', setup: 'Lay the Rainbow Trail Map on the floor and fill in a Pony Ride Ticket.', say: 'All aboard! Which stop on the rainbow trail shall we gallop to first?', twist: 'A sleepy cloud is blocking Cloud Meadow. Everyone must blow hard to move it.' },
    { title: 'The Big Pony Show', setup: 'Clear a space for the Rainbow Paddock and set out the Rainbow Rosettes.', say: 'Judge {name}, my pony is ready to prance! Will you watch our show?', twist: 'Every pony wins a rosette, but each one must be for something different!' },
    { title: 'Spin Some Magic', setup: 'Put the Rainbow Maker spinner together and gather the stable crew.', say: 'The rainbow is fading! Spin the Rainbow Maker to bring the magic back.', twist: 'The spinner lands on Big hug, and the whole stable has to join one giant hug!' },
    { title: 'Puzzle Pieces Lost', setup: 'Hide the Unicorn Puzzle pieces around the room before play starts.', say: 'Oh no, my unicorn picture fell apart! Will you help me find every piece?', twist: 'The last piece is hiding under a sleepy toy pony. Shh, find it quietly!' },
    { title: 'Wishing Well Wishes', setup: 'Tape up the Wishing Well sign by a bowl and hand out rainbow gems.', say: 'Toss a gem in the wishing well and tell me your sparkliest wish!', twist: 'The well wishes back! It asks everyone to do one kind thing for a friend.' },
  ],
  lines: {
    kid: [
      'Welcome to my unicorn stable! Neigh!',
      'A carrot costs 1 rainbow gem, please.',
      'Let me brush your mane until it sparkles.',
      'Your horn looks extra shiny today!',
      'Hop on! The rainbow ride is about to start.',
      'Shh, it’s nap time. The unicorns are dreaming.',
    ],
    grownup: [
      'Can you count how many gems I need for oats?',
      'Will you braid my unicorn’s tail, please?',
      'Show me how a unicorn prances!',
      'My pony feels sleepy. Can you check her?',
      'Which rosette should my pony win?',
      'Can you make some magic with the Rainbow Maker?',
    ],
  },
  games: [
    { title: 'Rainbow Magic Spin', how: 'Spin the Rainbow Maker and do the magic it lands on. Flutter, hug or draw a rainbow in the air!', uses: 'Rainbow Maker spinner' },
    { title: 'Gem Shopping', how: 'Pick two treats from the Treat Barn menu and add up the gems. Pay the stable keeper and count your change.', uses: 'Treat Barn menu, rainbow gems' },
    { title: 'Follow the Rainbow', how: 'Hide the Unicorn Puzzle pieces around the room. Find them all, then put the unicorn back together.', uses: 'Unicorn Puzzle' },
    { title: 'Scan and Match', how: 'Deal out the Sparkle Scans face down. Flip one and act it out so the vet can guess which unicorn needs care.', uses: 'Sparkle Scans, Sparkle Check-up cards' },
    { title: 'Gallop Stop', how: 'Gallop along the Rainbow Trail Map and freeze when the music stops. Stamp a Unicorn Passport at each stop you land on.', uses: 'Rainbow Trail Map, Unicorn Passports' },
  ],
};
