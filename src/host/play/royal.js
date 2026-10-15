// Play Kit ideas for the Royal Castle kit.
module.exports = {
  scenarios: [
    { title: 'Tea at the Royal Bakery', setup: 'Set out the Royal Bakery menu, a teapot and a pile of crown jewels for paying.', say: 'Good morning, Your Majesty {name}! May I have a pot of tea and a crown cookie?', twist: 'The pet dragon sneezes and cools all the tea. Now it is royal iced tea!' },
    { title: 'Crowning Day', setup: 'Put on the Royal Crown and give each toy guest a Royal Guest Card.', say: 'Your Majesty, this little frog wishes to be knighted. Will you give him a royal title?', twist: 'The frog prince is too shy to kneel. How can the ruler make him feel brave?' },
    { title: 'The Grand Ball', setup: 'Hand out Royal Invitations for the Grand Ball and tape up the Grand Ballroom sign.', say: 'I have my invitation! Will you teach me the royal dance, {name}?', twist: 'The music keeps stopping. Everyone must freeze like a statue until it starts again!' },
    { title: 'Spin a Royal Wish', setup: 'Put the Royal Wish Wheel together and gather the royal court around the throne.', say: 'Your Majesty {name}, the court is ready! Spin the wheel and tell us your royal wish.', twist: 'The wheel lands on horse ride, but the royal horse is asleep. Who will be the horse?' },
    { title: 'Dragon on the Loose', setup: 'Hide the Royal Treasures crown jewels around the castle and send a toy dragon after them.', say: 'Oh no, Your Majesty! The dragon ran off with the crown jewels! Knights, follow me!', twist: 'The dragon only took the jewels because it was lonely. Invite it to the feast!' },
    { title: 'Who Lives Here?', setup: 'Stand up the Castle Windows toy by the throne with all the flaps closed.', say: 'Knock knock! Royal guard {name}, who lives behind the tallest window?', twist: 'The wizard casts a spell and everyone swaps places. Now the frog is the ruler!' },
    { title: 'Royal Parade Tour', setup: 'Lay the Map of the Kingdom on the floor and stamp Royal Passes along the way.', say: 'Your Majesty, the guests want a tour of the kingdom. Where shall we go first?', twist: 'The Royal Bridge is wobbly! Everyone must tiptoe across very carefully.' },
    { title: 'Castle Guest Check-in', setup: 'Open the Royal Calendar and greet toy guests at the Gates Open sign.', say: 'Hello, I’m here for the 10 o’clock dance lesson. Is my name on your calendar?', twist: 'A surprise guest arrives with no invitation. Can the castle find room for one more?' },
  ],
  lines: {
    kid: [
      'Welcome to my castle! Please bow or curtsy.',
      'A cupcake costs 1 crown jewel, please.',
      'I now name you Sir Knight of the castle!',
      'May I see your royal invitation?',
      'Hear ye, hear ye! The royal ball begins!',
      'Thank you for visiting. Gates are closing!',
    ],
    grownup: [
      'Your Majesty, how many jewels for the castle cake?',
      'Will you crown me and give me a royal title?',
      'Can you show me how to bow like a royal?',
      'Your Majesty, what is your royal decree today?',
      'Could you spin the wish wheel for me, please?',
      'The dragon looks sad. How can we cheer him up?',
    ],
  },
  games: [
    { title: 'Royal Wish Charades', how: 'Spin the Royal Wish Wheel and act out what it lands on. The court guesses the wish before the next spin.', uses: 'Royal Wish Wheel' },
    { title: 'Jewel Counting', how: 'Pick a treat from the Royal Bakery menu and count out the right number of jewels. The baker checks the count.', uses: 'Royal Bakery menu, crown jewels' },
    { title: 'Window Peekaboo', how: 'Close all the Castle Windows and say a clue about who is inside. Lift the flap to see if your guess was right.', uses: 'Castle Windows' },
    { title: 'Kingdom Tour', how: 'Hop from place to place on the Map of the Kingdom. Stamp a Royal Pass at each stop until you reach the Jewel Tower.', uses: 'Map of the Kingdom, Royal Passes' },
    { title: 'Treasure Vault Hunt', how: 'Hide the Royal Treasures cards around the room. Knights bring them back and add up the jewels for the vault.', uses: 'Royal Treasures cards, Treasure Vault sign' },
  ],
};
