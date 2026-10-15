// Play Kit ideas for the Auto Repair Shop kit.
module.exports = {
  scenarios: [
    { title: 'Flat Tire!', setup: 'Park a toy car under the Drive In Here sign and grab a Work Order.', say: 'Help, Mechanic {name}! My tire went flat on the way here!', twist: 'The spare tire is missing! Can the mechanic find it in the Mechanic’s Toolbox?' },
    { title: 'Big Check-Up', setup: 'Fill in a Car Check-Up form for a truck and lay out some play tools.', say: 'My truck is making a funny noise. Can you check it?', twist: 'The funny noise was a teddy bear hiding in the back!' },
    { title: 'Car Wash Day', setup: 'Tape up the Car Wash sign and How to Wash a Car, and grab a sponge and a towel.', say: 'My car is SO muddy. Can you make it shiny again?', twist: 'The car gets dirty again as soon as it leaves. Back to the car wash!' },
    { title: 'Oil Change', setup: 'Put the Oil Shelf Label by a cup and set out the Car Stickers.', say: 'My car needs new oil, please. How long will it take?', twist: 'The customer has to wait. Can they find something fun to do in the Waiting Room?' },
    { title: 'Pay and Go', setup: 'Tape up the Price List and set the Cash Register by the Please Pay Here sign.', say: 'I had a car wash and a new tire. How many coins is that?', twist: 'The customer can’t find their car keys! Who has them?' },
    { title: 'Fire Truck Emergency', setup: 'Bring a fire truck or a red toy car to the shop and fill in a Work Order.', say: 'Quick, Mechanic {name}! The fire truck needs to be fixed fast!', twist: 'The siren is stuck on! Can the mechanic make it stop?' },
    { title: 'Parts Shopping', setup: 'Put the Car Parts on a shelf with the Shelf Labels.', say: 'I need a new battery and two headlights, please.', twist: 'The Parts Runner mixed up the shelves. Can you put every part back by the right label?' },
    { title: 'Club Wash', setup: 'Fill in Car Wash Club Cards for each toy car and grab a crayon to stamp them.', say: 'Is this my fourth wash? Do I get a free one?', twist: 'Every car in town wants a free wash at once. Line them up!' },
  ],
  lines: {
    kid: [
      'Welcome to my auto shop! What’s wrong with your car?',
      'Please drive in here and turn off the engine.',
      'Let me check the tires, lights and brakes.',
      'All fixed! Your car is ready to go.',
      'That will be four coins, please.',
      'Here are your keys. Drive safely!',
    ],
    grownup: [
      'Mechanic {name}, my car goes “clunk, clunk”!',
      'Can you wash my car too, please?',
      'How long will the fix take?',
      'How many coins for a new tire?',
      'Can I have a sticker for my car?',
      'Can I wait in the Waiting Room?',
    ],
  },
  games: [
    { title: 'Toolbox Peek', how: 'Name a tool and ask which door it’s behind. Lift the flap to check!', uses: 'Mechanic’s Toolbox' },
    { title: 'Check It Off', how: 'Go down a Car Check-Up form together and tick Good or Fix it for each part of a toy car.', uses: 'Car Check-Up forms' },
    { title: 'Coin Count Repair', how: 'Pick two jobs from the Price List. Count out the garage coins together and ring them up on the register.', uses: 'Price List, Cash Register, garage coins' },
    { title: 'Car Wash Steps', how: 'Point to a step on How to Wash a Car and act it out with a toy car, a sponge and a towel.', uses: 'How to Wash a Car' },
    { title: 'Sort the Parts', how: 'Mix up the Car Parts and call out a Shelf Label. Your child finds every part that goes there.', uses: 'Car Parts, Shelf Labels' },
  ],
};
