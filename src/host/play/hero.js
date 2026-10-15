// Play Kit ideas for Hero HQ.
module.exports = {
  scenarios: [
    { title: 'Catch the Cookie Bandit', setup: 'Tape up The Cookie Bandit wanted poster and hide a stuffed animal villain near the kitchen.', say: 'Hero {name}, the Cookie Bandit took the last cookie! Can you track them down?', twist: 'The Cookie Bandit says sorry and asks to share the cookies instead. Can heroes forgive?' },
    { title: 'Power Spin Rescue', setup: 'Use the Super Power Spinner and put a teddy on a high shelf or pillow pile.', say: 'Help! My teddy is stuck up high! Spin for a power and save him!', twist: 'The power wears off halfway, so the hero must spin again for a new one.' },
    { title: 'Hero Training Day', setup: 'Set up the Training Zone with pillows and a line to balance on, plus a Hero Training Check card.', say: 'Welcome, rookie! Show me your super speed and your super strength.', twist: 'The trainer announces a new power to practice: super slow motion!' },
    { title: 'Gadget Shop', setup: 'Set out the Gadget Shop menu, hero coins and the Hero Gear cards.', say: 'I need gear for my mission. How many hero coins for a new cape and a mask?', twist: 'The super magnet is switched on and everything in the shop sticks to the hero!' },
    { title: 'Villain Alarm!', setup: 'Use the Hero HQ Meters and point the Villain Alarm needle at “Alert!”', say: 'The Villain Alarm is ringing! Heroes, check your power meters and assemble!', twist: 'The villain is Doctor Tickle, and anyone tagged has to giggle for five seconds.' },
    { title: 'Secret Hideout Password', setup: 'Hang the Secret Hideout sign on a blanket fort and pin on the Hero ID Badges.', say: 'Halt! What is the secret password, Agent {name}?', twist: 'The password changes every time and must be said in a funny voice.' },
    { title: 'Kindness Mission', setup: 'Write “Cheer someone up” on a Mission Card and pick a sad stuffed animal.', say: 'My bunny feels sad today. Can a hero help cheer her up?', twist: 'Cheering up works so well that the bunny gets super powers too!' },
    { title: 'Tidy the City', setup: 'Tape up the Robo-Mess wanted poster near some scattered toys.', say: 'Robo-Mess left toys everywhere! Can our heroes clean up the city?', twist: 'Every toy put away gives the hero one power bolt. Count them at the end!' },
  ],
  lines: {
    kid: [
      'Hero HQ, how can we help?',
      'Don’t worry, a hero is on the way!',
      'Check your power meter. Are you ready?',
      'A secret mask costs one hero coin.',
      'Villain caught! Off to Villain Jail.',
      'Mission complete! Here is a star for your Hero Passport.',
    ],
    grownup: [
      'Captain {name}, my kitten is stuck in a tree! Can you help?',
      'What super power should I use? Can you spin for me?',
      'How many hero coins for speed shoes and power juice?',
      'Can you teach me your best hero pose?',
      'I saw the Cookie Bandit run that way! Can you follow the clues?',
      'Which two pieces of hero gear should I take?',
    ],
  },
  games: [
    { title: 'Spin and Do', how: 'Spin the Super Power Spinner and act out the power. Fly around the room, run super fast, or freeze like ice!', uses: 'Super Power Spinner' },
    { title: 'Villain Round-Up', how: 'Hide stuffed animal villains around the house. Match each one to a wanted poster and bring it to Villain Jail.', uses: 'Villain Wanted Posters, Villain Jail sign' },
    { title: 'Gear Up Count', how: 'Pick two Hero Gear cards and add up their numbers. Highest total gets to choose the next mission.', uses: 'Hero Gear cards' },
    { title: 'Power Meter Workout', how: 'Do ten jumping jacks and move the needle up one zone. Keep going until you reach MAX POWER!', uses: 'Hero HQ Meters' },
    { title: 'Mission Board Day', how: 'Write three missions on the Mission Board, like helping a neighbor. Tick each one off and stamp a passport box.', uses: 'Mission Board, Hero Passports, Mission Cards' },
  ],
};
