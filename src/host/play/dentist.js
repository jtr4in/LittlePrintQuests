// Play Kit ideas for the Dentist Office kit.
module.exports = {
  scenarios: [
    { title: 'Sugar Bug Attack', setup: 'Slip Brush the Teeth into a sheet protector and draw lots of sugar bugs on the teeth.', say: 'Dr. {name}, my teeth feel fuzzy! I ate SO much candy.', twist: 'One sugar bug is extra stubborn! Brush in tiny circles and count to ten to get it.' },
    { title: 'First Check-Up', setup: 'Fill in a Tooth Chart for a nervous stuffed animal and set out the Dentist Bag.', say: 'I’ve never been to the dentist before. Will it tickle?', twist: 'The patient is shy. Can the dentist show them each tool first, so they know there’s nothing to worry about?' },
    { title: 'Wiggly Tooth', setup: 'Open the Appointment Book and write in a patient with a wiggly tooth.', say: 'My tooth is SO wiggly! Is it going to fall out?', twist: 'It pops out! Wrap it up for the Tooth Fairy and stamp the patient’s Smile Club card.' },
    { title: 'Crocodile Cleaning', setup: 'Pick the biggest-mouthed stuffed animal and grab the toothbrush cut-out.', say: 'I’m a crocodile and I have LOTS of teeth. Can you count them all?', twist: 'The crocodile keeps snapping shut! How can the dentist help it open wide and stay still?' },
    { title: 'Busy Front Desk', setup: 'Set up the Front Desk Register with Appointment Cards and Tooth coins.', say: 'Hi! I’d like a cleaning and a polish, please. How many coins is that?', twist: 'Three patients arrive at once! Write them in the Appointment Book in the right order.' },
    { title: 'Snack Detective', setup: 'Spread out the Tooth-Friendly Snacks cards on the table.', say: 'Doctor, which snacks make my teeth happy?', twist: 'The patient sneaks a lollipop! Sort the snacks into teeth-happy and once-in-a-while piles.' },
    { title: 'Brushing Class', setup: 'Tape up How to Brush Your Teeth where everyone can see it.', say: 'Can you teach my class how to brush our teeth the right way?', twist: 'Everyone brushes along to a two-minute song. Who can keep going the whole time?' },
    { title: 'Prize Box Day', setup: 'Fill a box with small toys or stickers under the Prize Box sign.', say: 'I was SO brave today. Do I get a prize?', twist: 'There’s only one sticker left and two brave patients! What fair way can the dentist share?' },
  ],
  lines: {
    kid: [
      'Welcome to my dental office! Please take a seat.',
      'Open wide, please. Say “ahhh!”',
      'Let me count your teeth. One, two, three…',
      'I see a sugar bug! Time to brush it away.',
      'All done! Your smile is so sparkly!',
      'Remember to brush twice a day. See you at your next check-up!',
    ],
    grownup: [
      'Dr. {name}, how many teeth do I have?',
      'Will the toothbrush tickle?',
      'Which snack is best for my teeth?',
      'Can I have a new toothbrush, please?',
      'What color is the toothpaste today?',
      'Do I get to pick from the prize box?',
    ],
  },
  games: [
    { title: 'Sugar Bug Race', how: 'Draw ten sugar bugs on Brush the Teeth. Time how fast your child can brush them all away, then try to beat it.', uses: 'Brush the Teeth' },
    { title: 'Snack Sort', how: 'Mix up the snack cards. Your child sorts them into teeth-happy snacks and once-in-a-while treats.', uses: 'Tooth-Friendly Snacks' },
    { title: 'Count the Teeth', how: 'Count every tooth on the big smile, then count the teeth on a stuffed animal patient. Who has more?', uses: 'Brush the Teeth, Tooth Chart' },
    { title: 'Brushing Steps', how: 'Act out each step of the brushing sign in order. Can you remember them all without looking?', uses: 'How to Brush Your Teeth' },
    { title: 'Coin Count Checkout', how: 'Pick two services from the board. Count out the coins together and ring them up at the front desk.', uses: 'Dental Services, Front Desk Register, Tooth coins' },
  ],
};
