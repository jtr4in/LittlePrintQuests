// Play Kit ideas for the Burger Shop kit.
module.exports = {
  scenarios: [
    { title: 'The Lunch Rush', setup: 'Line up four stuffed animals by the Please Pay Here sign and set out the Burger Menu and burger coins.', say: 'Hi, Chef {name}! We are SO hungry. What burgers do you have today?', twist: 'All four customers order at the same time. The cook must write them on order slips so nobody gets mixed up.' },
    { title: 'Build It Right', setup: 'Cut out the Build a Burger layers and pick a card from the Burger Order Cards.', say: 'I’d like The Works, please. Can you put on every single layer?', twist: 'The customer changes their mind halfway: “No onions, please!” Can the cook fix the stack?' },
    { title: 'Drive-Thru Window', setup: 'Tape up the Drive-Thru sign, make a window from a chair, and grab the Drive-Thru Tickets.', say: 'Beep beep! Hello, I’d like a cheeseburger and fries, please!', twist: 'The car is so big it gets stuck in the drive-thru. Push it through with a big heave!' },
    { title: 'Pay at the Register', setup: 'Set up the register with the play bank cards and a pile of burger coins.', say: 'A hamburger and a milkshake, please. How many coins is that?', twist: 'The customer only has a gift card. Can the cashier ring it up on the Card button?' },
    { title: 'The Picky Customer', setup: 'Use a blank Burger Order form and the Sauce Labels by some cups.', say: 'I want cheese, but no tomato, and lots of pickles. Can you write that down?', twist: 'The picky customer wants ketchup AND mustard, in a smiley face on top.' },
    { title: 'Snack Time Sides', setup: 'Spread out the Fries and Shakes food cards and Today’s Specials board.', say: 'What’s today’s special, Chef {name}? Does it come with fries?', twist: 'The milkshake machine goes wobbly and only makes very, very tiny shakes.' },
    { title: 'New Cook Training', setup: 'Tape up How to Make a Burger and pin on the Staff ID Badges.', say: 'It’s my first day, Head Cook {name}! Can you teach me how to make a burger?', twist: 'The new cook keeps putting the top bun on the bottom. Uh oh, upside-down burger!' },
    { title: 'Burger Club Party', setup: 'Fill in Burger Club Cards for each toy and get a crayon to tick the boxes.', say: 'Is this my last box? Do I get my free fries today?', twist: 'Every Burger Club member arrives at once for free fries. Quick, fry cook!' },
  ],
  lines: {
    kid: [
      'Welcome to my Burger Shack! What can I get you?',
      'Would you like cheese on your burger?',
      'That will be four coins, please.',
      'Please collect your order over here!',
      'Do you want fries with that?',
      'Thanks for coming! Enjoy your burger!',
    ],
    grownup: [
      'Chef {name}, can I have a burger with extra pickles?',
      'How many coins for a hamburger and fries?',
      'Can I stamp my Burger Club card, please?',
      'Which sauce do you like best, ketchup or mustard?',
      'Is the grill hot? How long will my burger take?',
      'Can you make me the tallest burger ever?',
    ],
  },
  games: [
    { title: 'Stack Match', how: 'Pick an order card and race to stack the burger layers to match it. Check each layer from the top bun down.', uses: 'Build a Burger layers, Burger Order Cards' },
    { title: 'Coin Count Checkout', how: 'Pick two things from the menu. Count out the burger coins together and ring them up on the register.', uses: 'Burger Menu, register, burger coins' },
    { title: 'Memory Order', how: 'Say an order out loud, like “cheese, lettuce, pickles”. The cook builds it from memory, then checks the Burger Order form.', uses: 'Build a Burger layers, Burger Order forms' },
    { title: 'Sauce Sort', how: 'Mix up the Sauce Labels and call out a sauce. Your child finds the label and stands it by the right cup.', uses: 'Sauce Labels' },
    { title: 'Drive-Thru Dash', how: 'Drive up and order from a Drive-Thru Ticket. Can the cook get the food out the window before you count to ten?', uses: 'Drive-Thru Tickets, Fries and Shakes food cards' },
  ],
};
