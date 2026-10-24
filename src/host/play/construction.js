// Play Kit ideas for the Construction Site kit (Field Kit).
module.exports = {
  scenarios: [
    { title: 'The Big Build', setup: 'Pick a Work Order, set out building blocks, and tape the Site Open sign by the door.', say: 'Good morning, Boss {name}! The town needs a brand new house. Can your crew build it today?', twist: 'Halfway through, the town calls back: they want a slide on the roof too!' },
    { title: 'Mud Alert!', setup: 'Scatter blocks or pillows in the Dig Zone and line up the toy diggers and dump trucks.', say: 'Uh oh, Site Boss! The rain made a giant muddy mess. Who can scoop it up?', twist: 'A rubber duck is stuck in the mud and needs a gentle crane rescue.' },
    { title: 'Lunch Wagon Rush', setup: 'Set out the Lunch Wagon menu, the golden bolts, and some play food.', say: 'I’m one hungry builder! What’s on the menu at the Lunch Wagon today?', twist: 'A whole crew of teddy builders shows up at once, each wanting a different snack.' },
    { title: 'Safety Inspection Day', setup: 'Line up the toy trucks and grab the Safety Inspection record cards and a crayon.', say: 'Inspector {name}, my dump truck sounds funny. Can you check it from wheels to horn?', twist: 'The truck’s horn only says “moo” now. What tool fixes a mooing horn?' },
    { title: 'Help Wanted', setup: 'Tape the Help Wanted posters around the room and lay out the Crew ID Badges.', say: 'Hello! I saw your HIRING poster. I’d love a job. What can I do here?', twist: 'The new worker is a Site dog who only knows how to dig. Find the perfect job for them!' },
    { title: 'Supply Delivery Run', setup: 'Lay the Building Site Map on the floor and load Building Supplies cards into a toy truck.', say: 'Driver {name}, the New Bridge needs bricks and a ladder. Can you deliver them?', twist: 'A road is blocked by a sleepy dino digger. Find a way around!' },
    { title: 'Tool Box Fix-It', setup: 'Hand over the Tool Box flap toy and the Builder’s Hard Hat.', say: 'Fix-it crew, my chair is wobbly! Which tool from your Tool Box can help?', twist: 'Every time a tool is used, the fixer has to make its sound: bang, buzz or twist!' },
    { title: 'Robot Helper Day', setup: 'Pick a toy robot or stuffed animal as the robot helper and set out the Job Board.', say: 'Beep boop. I am Robot Helper. Please give me a job, Boss!', twist: 'The robot does every job backwards until someone teaches it the right way.' },
  ],
  lines: {
    kid: [
      'Hard hats on, crew! Time to build!',
      'Welcome to the Lunch Wagon. What can I get you?',
      'That will be two golden bolts, please.',
      'Beep beep! Dump truck coming through!',
      'Your machine passed the safety check!',
      'Great job, team. Stamp your Builder License!',
    ],
    grownup: [
      'Boss {name}, which job should I do first?',
      'Can you show me how the crane lifts the beams?',
      'I’d like a sandwich and a cookie. How many bolts is that?',
      'My digger needs a fix. Can you check its wheels?',
      'How tall can your crew build this tower?',
      'Can I have a Safety Sticker for my hard work?',
    ],
  },
  games: [
    { title: 'Count the Bolts', how: 'Order two things from the Lunch Wagon menu. The child counts out the right number of golden bolts.', uses: 'Lunch Wagon menu, golden bolts' },
    { title: 'Tower Challenge', how: 'Pick a Work Order and build the tallest tower you can. Count the blocks out loud together.', uses: 'Work Orders, Job Board' },
    { title: 'Crane Says', how: 'The Site Boss calls out crane moves like lift up or swing. Everyone moves their arms like a crane.', uses: 'Builder’s Hard Hat, Crew ID Badges' },
    { title: 'Delivery Race', how: 'Load a supply card into a toy truck and drive it to each stop on the map. Say each place name when you get there.', uses: 'Building Site Map, Building Supplies cards' },
    { title: 'Find the Tool', how: 'Name a job, like fix the wobbly table. The child lifts the Tool Box flaps to find the best tool.', uses: 'Tool Box, Safety Stickers' },
  ],
};
