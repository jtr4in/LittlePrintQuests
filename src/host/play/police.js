// Play Kit ideas for the Police Station kit.
module.exports = {
  scenarios: [
    { title: 'The Lost Teddy', setup: 'Hide a teddy somewhere in the room and set out a Lost and Found Report at the Front Desk.', say: 'Officer {name}, I’ve lost my teddy! Can you help me find him?', twist: 'The clues say “soft” and “brown”, but there are two teddies hiding. Which one is the right one?' },
    { title: 'On Patrol', setup: 'Lay out the Town Patrol Map and grab the Patrol Car Wheel.', say: 'Calling all officers! Someone at the park needs help!', twist: 'The patrol car meets a Stop sign on the way. Can you remember to stop and look?' },
    { title: 'Silly Parking', setup: 'Park some toy cars in silly spots, like on the sofa, and hand out Parking Tickets.', say: 'Excuse me, Officer {name}, is that my car parked on the cushion?', twist: 'One car has parked perfectly. Give it a Super Parking ticket instead!' },
    { title: 'Crossing the Street', setup: 'Tape the Stop and Crosswalk signs along a hallway and tape up How to Cross the Street.', say: 'Can you help me and my ducklings cross the road, please?', twist: 'One duckling wants to run across! Can the traffic helper remind them to walk?' },
    { title: 'Front Desk Bell', setup: 'Set up the Front Desk sign with a bell and the Desk Labels.', say: 'Ding ding! Hello? I found a shiny key on the sidewalk.', twist: 'Who lost the key? Put it in Lost and Found and see who comes looking.' },
    { title: 'Wanted: Silly Sock', setup: 'Tape up the Wanted Posters and hide a single sock.', say: 'Officer, the Sock Sneaker took one of my socks again!', twist: 'The sock is found inside a shoe. Case closed! Who gets the reward coins?' },
    { title: 'New Officer Training', setup: 'Pin on the Officer ID Badges and fill in an Officer Licence.', say: 'Chief {name}, it’s my first day. What does a police officer do?', twist: 'The new officer forgets to switch on the Lights button. Nee-naw!' },
    { title: 'Bike Licence Day', setup: 'Tape up the Front Desk Fees board and share out the Town Coins.', say: 'I want a licence for my new bike. How many coins is that?', twist: 'The bike needs a safety check first. Is the bell working?' },
  ],
  lines: {
    kid: [
      'Welcome to the police station! How can I help?',
      'Don’t worry, we’ll find it together.',
      'Stop, look and listen before you cross.',
      'Calling all officers! Over.',
      'Here is your parking ticket. That’s two coins!',
      'Case closed! Have a safe day!',
    ],
    grownup: [
      'Officer {name}, I lost my favorite toy. Can you help?',
      'Can you help me cross the street, please?',
      'Is it okay to park my car here?',
      'What does your siren sound like?',
      'Can I get a licence for my bike, please?',
      'What’s the best thing about being a police officer?',
    ],
  },
  games: [
    { title: 'Lost and Found Hunt', how: 'Hide a few toys. Fill in a Lost and Found Report for each, then follow the clues to find them all.', uses: 'Lost and Found Report, Lost Teddy Found' },
    { title: 'Stop and Go', how: 'Walk or drive along the hallway road. Freeze at the Stop sign and only go when the grown-up says “Go!”', uses: 'Stop sign, Crosswalk sign, Patrol Car Wheel' },
    { title: 'Patrol Route', how: 'Drive the patrol car from stop to stop on the map and say how you helped at each one.', uses: 'Town Patrol Map, Patrol Car Wheel' },
    { title: 'Ticket Counting', how: 'Hand out Parking Tickets, then count out the town coins to pay each one at the front desk.', uses: 'Parking Ticket cards, Town Coins, Front Desk Fees' },
    { title: 'Wanted Search', how: 'Hide the silly troublemakers from the Wanted Posters. Find each one to earn its reward.', uses: 'Wanted Posters, Town Coins' },
  ],
};
