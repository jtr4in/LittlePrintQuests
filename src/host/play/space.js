// Play Kit ideas for Mission Control.
module.exports = {
  scenarios: [
    { title: 'Countdown to the Moon', setup: 'Tape up the Countdown and Launch Pad signs and grab the Blast Off! launch card.', say: 'Commander {name}, the crew is buckled in. Start the countdown from ten!', twist: 'Halfway through, the rocket gets the hiccups. Start the countdown over, hiccuping each number!' },
    { title: 'Spin and Fly', setup: 'Use the Planet Picker spinner and lay the Star Map on the floor.', say: 'Where are we flying today, Captain? Give it a spin!', twist: 'On this planet, the gravity is so light that everyone must move in slow motion.' },
    { title: 'Pre-Flight Check', setup: 'Set out an Astronaut Health Check card and a toy astronaut.', say: 'Flight doctor, is my helmet on tight? Can you check me before launch?', twist: 'Uh oh, the astronaut forgot their moon boots. Find something silly to wear instead!' },
    { title: 'Space Snack Bar', setup: 'Set out the Space Snack Bar menu, star credits and the Space Supplies cards.', say: 'I’m so hungry after my space walk! What snacks do you have, Space Chef?', twist: 'In zero gravity the snacks float away. Catch them before they drift off!' },
    { title: 'Meteor Shower', setup: 'Put the rocket (a box or couch) near the Star Map and toss some pillows nearby as space rocks.', say: 'Mission Control, space rocks ahead! Tell us which way to steer!', twist: 'One of the space rocks is actually a friendly alien who wants a ride.' },
    { title: 'Boarding Pass Line', setup: 'Fill in Boarding Passes for toy passengers and line them up at the Airlock.', say: 'Here is my boarding pass. Am I going to Mars or Saturn today?', twist: 'A passenger’s pass says “Alien planet,” and nobody knows the way. Better make up a map!' },
    { title: 'Alien Welcome', setup: 'Set up Moon Base across the room with a friendly alien toy and the Mission Patches.', say: 'Welcome, astronaut {name}! I’m from a faraway planet. Can you teach me to say hello?', twist: 'The alien only talks in beeps. Make up an alien language together!' },
    { title: 'Fix the Satellite', setup: 'Use the rocket wrench and satellite cards from the Space Supplies.', say: 'Mission Control, our satellite is broken! Can our Robot Technician fix it?', twist: 'The satellite starts playing music when it’s fixed. Everyone has a space dance party!' },
  ],
  lines: {
    kid: [
      'Welcome to Mission Control! Where are you flying today?',
      'Helmets on! Launch in ten, nine, eight...',
      'May I see your boarding pass, please?',
      'Rocket fuel shake is two star credits.',
      'Mission Control to rocket, do you read me?',
      'You landed safely! Here is your mission patch.',
    ],
    grownup: [
      'Commander {name}, can you count down for my launch?',
      'Which planet should I visit? Can you spin for me?',
      'How many star credits for moon juice and a comet cookie?',
      'Can you check my oxygen tank and gloves before I go?',
      'Mission Control, I see a comet! Should I steer left or right?',
      'Can you stamp my Space Passport for visiting Mars?',
    ],
  },
  games: [
    { title: 'Blast Off Countdown', how: 'Count down from ten together, crouching lower each number. On zero, pull the tab and jump up high!', uses: 'Blast Off! launch card' },
    { title: 'Planet Hop', how: 'Spin the Planet Picker and fly to that planet on the Star Map. Do the move it says, like hopping to the Moon.', uses: 'Planet Picker, Star Map' },
    { title: 'Star Credit Shop', how: 'Choose two snacks from the menu and add up the star credits. Pay with the right number of credits.', uses: 'Space Snack Bar menu, star credits' },
    { title: 'Pack the Rocket', how: 'Call out three supplies to pack before launch. Your child finds the right cards and loads them in the rocket.', uses: 'Space Supplies cards' },
    { title: 'Passport Stamp Tour', how: 'Visit each planet on the Star Map and do one space job there. Stamp the passport after every stop.', uses: 'Space Passports, Star Map, Mission Patches' },
  ],
};
