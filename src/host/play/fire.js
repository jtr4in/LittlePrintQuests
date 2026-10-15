// Play Kit ideas for the Fire Station.
module.exports = {
  scenarios: [
    { title: 'Kitten Up a Tree', setup: 'Put a stuffed kitten on a shelf, pin up the Mittens rescue call, and lean a pretend ladder nearby.', say: 'Chief {name}! Mittens is stuck in the tall oak tree and she’s meowing for help!', twist: 'Mittens is too scared to come down until the firefighter sings her a little song.' },
    { title: 'Dispatch Desk Call', setup: 'Tape the Rescue Calls at the Dispatch Desk and set out the Rescue Call Log and a pencil.', say: 'Ring ring! Hello, Fire Station? A balloon is stuck on my roof!', twist: 'Call back right away with a second emergency: the ducks need to cross the road too!' },
    { title: 'Gear Up Race', setup: 'Spread the Rescue Equipment cards in the Gear Room and grab the Fire Helmet Shield.', say: 'Firefighter, the bell is ringing! Pick two pieces of gear and let’s roll!', twist: 'The boots are on the wrong feet! Stomp around to fix them before you go.' },
    { title: 'Put Out the Fire', setup: 'Hand over the Put Out the Fire! slider card and a pretend hose, like a jump rope.', say: 'Hose Holder {name}, there’s a fire at the pretend barbecue! Grab the hose!', twist: 'The hose wiggles like a noodle! Spray with big wobbly arms until the fire is out.' },
    { title: 'Duck Crossing', setup: 'Line up toy or stuffed ducks and use the Duck Family rescue call from the posters.', say: 'Please help! My ducklings want to cross the road to the pond!', twist: 'One duckling waddles the wrong way. Quack together to call it back!' },
    { title: 'Home Safety Check', setup: 'Bring a Home Safety Check record card and a Safety Passport to a stuffed neighbor’s house.', say: 'Hello, firefighter! Can you check if my house is safe today?', twist: 'The neighbor’s floor is full of toys! Tidy up fast so nobody trips.' },
    { title: 'Station Kitchen Lunch', setup: 'Set out the Station Kitchen menu and the golden bells for a hungry crew.', say: 'Phew, what a busy day! May I have Chief’s chili and a juice box, please?', twist: 'The alarm rings in the middle of lunch! Everyone slides down the pole and back.' },
    { title: 'Around Town Patrol', setup: 'Lay the Town Rescue Map on the floor and park a toy fire truck at the Fire Station.', say: 'Engine Driver {name}, let’s drive around town and see who needs help today!', twist: 'At every stop, the siren has a new sound. Make it silly, then make it loud!' },
  ],
  lines: {
    kid: [
      'Fire Station, what’s your emergency?',
      'Don’t worry, we’re on our way!',
      'Put on your helmet, crew!',
      'Ding ding! Rescue complete!',
      'That will be one golden bell for the apple.',
      'You were so brave. Here’s a rescue sticker!',
    ],
    grownup: [
      'Chief {name}, which two pieces of gear should I take?',
      'Can you write my rescue call in the log?',
      'My kitten is stuck! Can you bring the big ladder?',
      'How many golden bells for a hot dog and milk?',
      'Is my house safe? Can you check the smoke alarm?',
      'Let’s slide down the fire pole on the count of three!',
    ],
  },
  games: [
    { title: 'Pick Two Gear', how: 'Draw a rescue call, then choose two Rescue Equipment cards that would help. Explain why each one fits.', uses: 'Rescue Calls and Rescue Equipment' },
    { title: 'Golden Bell Lunch', how: 'Order two things from the Station Kitchen menu. Count out the golden bells to pay.', uses: 'Station Kitchen menu and bells' },
    { title: 'Siren Stop and Go', how: 'When the grown-up makes a siren sound, run in place. When it stops, freeze like a fire hydrant!', uses: 'Fire Helmet Shield' },
    { title: 'Rescue Map Race', how: 'Drive the engine to each stop on the Town Rescue Map. Do a quick rescue at every stop and earn a sticker.', uses: 'Town Rescue Map and Rescue Stickers' },
    { title: 'Safety Check Hunt', how: 'Walk through the house with a Home Safety Check card. Find each item and tick its box.', uses: 'Home Safety Check cards' },
  ],
};
