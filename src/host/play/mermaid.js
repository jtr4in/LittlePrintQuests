// Play Kit ideas for the Mermaid Lagoon kit.
module.exports = {
  scenarios: [
    { title: 'Shopping at the Shell Shop', setup: 'Set up the Shell Shop menu on a table with the Shell Shop Treasures and seashell money.', say: 'Hello, shopkeeper {name}! How many shells for a shiny pearl?', twist: 'A crab friend pays with sand instead of shells. Can the shopkeeper think of a fair trade?' },
    { title: 'Sea Rescue Call', setup: 'Bring out the Sea Rescue Check-up cards and the Sonar Scans with a toy sea turtle.', say: 'Sea Vet {name}, come quick! This turtle is all tangled in seaweed!', twist: 'The turtle has the hiccups, and every hiccup makes a giant bubble float away.' },
    { title: 'Boat Tour of the Lagoon', setup: 'Lay out the Lagoon Map and give each toy a Boat Tour Ticket.', say: 'Ahoy, captain! I have my ticket. Can we sail to Dolphin Bay first?', twist: 'A friendly whale gives the boat a ride on its back for the next stop.' },
    { title: 'Octopus Mix-up', setup: 'Hide the Shell Shop Treasures around the room with a toy octopus nearby.', say: 'Oh no, Ollie the Octopus juggled the pearls away! Can you swim and find them?', twist: 'Ollie hid one pearl in each of his eight arms. Count them as you find them!' },
    { title: 'Kelp Café Snacks', setup: 'Tape up the Kelp Café sign and set out play food with seashell money.', say: 'Hello! One kelp bubble tea and a watermelon slice, please.', twist: 'The bubble tea is so bubbly it makes everyone float up and swim in slow motion!' },
    { title: 'Mermaid Queen for a Day', setup: 'Wear the Seashell Tiara or Mermaid Crown and set a throne by the blue blanket.', say: 'Your Highness {name}, the sea creatures are waiting. What is your first royal wish?', twist: 'A shy little fish wants to be queen too. How can you share the tiara?' },
    { title: 'Dive for Puzzle Pieces', setup: 'Hide the Lagoon Puzzle pieces under a blue blanket or in a bowl of water toys.', say: 'Pearl Diver, take a big breath and dive down to find the lost lagoon pieces!', twist: 'Each time you find a piece, you must swim back with your best mermaid tail flip.' },
    { title: 'Lock the Pearl Vault', setup: 'Tape up the Pearl Vault sign by a box and fill in the Tide Table.', say: 'Lagoon Keeper, these pearls need to be counted and locked away safe!', twist: 'High tide washes in and everyone must climb onto the couch island until it goes out.' },
  ],
  lines: {
    kid: [
      'Welcome to my lagoon! Splash right in!',
      'A starfish costs 2 seashells, please.',
      'Let me check your fins and tail.',
      'Show me your Sea Pass so I can stamp it!',
      'Hold on tight! The dolphin ride is starting.',
      'Swim home safe, sea friend! Come back soon.',
    ],
    grownup: [
      'Can you count out three shells for my pearl?',
      'My fish has a sore flipper. Can you help it?',
      'Where should our boat tour go next?',
      'Show me how a mermaid swims!',
      'Can you stamp my Sea Pass, please?',
      'Which treasure should I buy for my friend?',
    ],
  },
  games: [
    { title: 'Pearl Diving', how: 'Hide the Shell Shop Treasures under a blue blanket. Dive in and add up the shell value of each one you find.', uses: 'Shell Shop Treasures, seashell money' },
    { title: 'Shell Shop Math', how: 'Pick an item from the Shell Shop menu and pay with seashell money. The shopkeeper counts the shells back.', uses: 'Shell Shop menu, seashell money' },
    { title: 'Sonar Match', how: 'Flip a Sonar Scan and act out the problem. The sea vet guesses and fills in a check-up card.', uses: 'Sonar Scans, Sea Rescue Check-up cards' },
    { title: 'Swim the Map', how: 'Swim from spot to spot on the Lagoon Map, moving like the creature at each stop. Stamp your Sea Pass when you arrive.', uses: 'Lagoon Map, Sea Passports' },
    { title: 'Lagoon Puzzle Race', how: 'Mix up the Lagoon Puzzle pieces. Put the lagoon back together and name each sea creature you see.', uses: 'Lagoon Puzzle' },
  ],
};
