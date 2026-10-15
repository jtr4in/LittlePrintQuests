// Play Kit ideas for the Italian Restaurant kit.
module.exports = {
  scenarios: [
    { title: 'Table for Four', setup: 'Stand the Please Wait to Be Seated sign by the door and set a Table Card on each table.', say: 'Buonasera, Chef {name}! Do you have a table for four hungry friends?', twist: 'Two guests want to sit by the window. Can the host find a table that makes everyone happy?' },
    { title: 'Take the Order', setup: 'Seat two stuffed animals with the Dinner Menu and grab a Waiter’s Order Pad.', say: 'Hmm, it all looks so yummy! What do you think I should order?', twist: 'The guest changes their mind three times. The waiter has to cross out and start again!' },
    { title: 'Spaghetti Time', setup: 'Tape up How to Make Spaghetti and cut out Cook the Spaghetti.', say: 'Chef {name}, table two wants spaghetti and meatballs, please!', twist: 'The noodles are SO long they reach the floor. Can the chef twirl them up on a fork?' },
    { title: 'Bring the Bill', setup: 'Fill in The Bill for a table and set up the Cash Register with trattoria coins.', say: 'That was delicious! Can I have the bill, please?', twist: 'The guest leaves a tip! Can the cashier ring it up on the Tip button?' },
    { title: 'Birthday Dinner', setup: 'Pick a toy with a birthday today and put the Reserved table card on its table.', say: 'It’s my birthday! Is there a special dessert for me?', twist: 'The whole restaurant sings Happy Birthday while the waiter carries out the gelato.' },
    { title: 'Today’s Specials', setup: 'Tape up the Today’s Specials board and pass out some order slips.', say: 'What are today’s specials, Chef {name}? I can’t decide!', twist: 'The kitchen runs out of garlic bread! The waiter has to suggest something else.' },
    { title: 'Busy Kitchen', setup: 'Tape the Kitchen sign on the play kitchen and lay out the Pasta and Desserts food.', say: 'Order up! Three spaghetti, two salads and one tiramisu!', twist: 'All the orders come in at once. The chef must make them in the right order.' },
    { title: 'Pasta Club Night', setup: 'Fill in Pasta Club Cards for each guest and grab a crayon to stamp them.', say: 'This is my fourth dinner! Do I get my free gelato?', twist: 'Every Pasta Club member wants a different gelato flavor. Can the waiter remember them all?' },
  ],
  lines: {
    kid: [
      'Buonasera! Welcome to my restaurant!',
      'Please wait to be seated. Follow me!',
      'Here’s your menu. What would you like?',
      'One spaghetti and meatballs, coming up!',
      'Buon appetito! Enjoy your meal!',
      'Here’s your bill. Grazie, come again!',
    ],
    grownup: [
      'Do you have a table for two, please?',
      'Waiter {name}, what’s the best thing on the menu?',
      'Could I have extra cheese on my pasta?',
      'May I have some more garlic bread, please?',
      'Is there room for dessert? I’d love some tiramisu!',
      'Could we have the bill, please?',
    ],
  },
  games: [
    { title: 'Table Hop', how: 'Call out a table number. Your child carries a dish from the Pasta and Desserts cards to the right Table Card as fast as they can.', uses: 'Table Cards, Pasta and Desserts food' },
    { title: 'Count the Bill', how: 'Tick two or three things on The Bill. Add up the prices from the Dinner Menu and pay with trattoria coins.', uses: 'The Bill, Dinner Menu, trattoria coins' },
    { title: 'Recipe Order', how: 'Point to a step on How to Make Spaghetti and ask what comes next. Act out each step together.', uses: 'How to Make Spaghetti' },
    { title: 'Waiter Memory', how: 'Order two or three dishes without writing them down. Can the waiter bring the right food from memory?', uses: 'Dinner Menu, Pasta and Desserts food' },
    { title: 'Pull and Cook', how: 'Pull the tab on Cook the Spaghetti one picture at a time. Count to five while the water boils.', uses: 'Cook the Spaghetti' },
  ],
};
