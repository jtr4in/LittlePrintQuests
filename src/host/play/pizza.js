// Play Kit ideas for the Pizza Shop kit.
module.exports = {
  scenarios: [
    { title: 'Pizza Night Rush', setup: 'Line up four stuffed animals by the Order Here sign and set out the Pizza Menu and pizza coins.', say: 'Hi, Chef {name}! We’re starving. What pizzas do you have tonight?', twist: 'Everyone orders at once. The chef must write each one on a Pizza Order form so nobody gets mixed up.' },
    { title: 'Make It Match', setup: 'Cut out the pizza and toppings from Make a Pizza and pick one of the order cards.', say: 'I’d like the Super Supreme, please. With all the toppings!', twist: 'The customer spots one olive missing. Can the chef find it and add it on?' },
    { title: 'Special Delivery', setup: 'Fill in a Delivery Ticket and put a hungry customer in another room.', say: 'Ring ring! Hello, can I get a pepperoni pizza delivered to my house?', twist: 'The delivery driver gets lost and has to ask three toys for directions.' },
    { title: 'Pay at the Register', setup: 'Set up the register with the play bank cards and a pile of pizza coins.', say: 'A cheese pizza and a drink, please. How many coins is that?', twist: 'The customer pays with a gift card. Can the cashier ring it up on the Card button?' },
    { title: 'Topping Trouble', setup: 'Put the toppings in cups beside the Topping Labels.', say: 'I want mushrooms and pineapple, but no peppers, please!', twist: 'The labels got mixed up! The chef must put every topping back by the right label.' },
    { title: 'Side Order Snack', setup: 'Spread out the Sides and Drinks food cards and the Today’s Specials board.', say: 'What’s today’s special, Chef {name}? Can I get garlic bread too?', twist: 'The customer wants ice cream on top of the pizza. Does the chef say yes?' },
    { title: 'Chef School', setup: 'Tape up How to Make a Pizza and pin on the Staff ID Badges.', say: 'It’s my first day, Head Chef {name}! Can you show me how to toss the dough?', twist: 'The new chef forgets the cheese. Oops, a very plain pizza!' },
    { title: 'Pizza Club Party', setup: 'Fill in Pizza Club Cards for each toy and grab a crayon to tick the boxes.', say: 'Is this my last box? Do I get my free slice today?', twist: 'Every Pizza Club member wants a free slice at once. Can the chef cut enough slices?' },
  ],
  lines: {
    kid: [
      'Welcome to my pizzeria! What would you like?',
      'Would you like extra cheese on that?',
      'That will be four coins, please.',
      'Your pizza is in the oven. Count to ten!',
      'Please pick up your pizza over here!',
      'Thanks for coming! Enjoy your pizza!',
    ],
    grownup: [
      'Chef {name}, can I have a pizza with mushrooms?',
      'How many coins for a pizza and a drink?',
      'Can you deliver a pizza to my house, please?',
      'Can I stamp my Pizza Club card, please?',
      'How many slices can you cut my pizza into?',
      'What’s the silliest pizza you can make?',
    ],
  },
  games: [
    { title: 'Topping Match', how: 'Pick an order card and add the cut-out toppings to the big pizza to match it. Check every topping when you’re done.', uses: 'Make a Pizza, order cards' },
    { title: 'Coin Count Checkout', how: 'Pick two things from the menu. Count out the pizza coins together and ring them up on the register.', uses: 'Pizza Menu, register, pizza coins' },
    { title: 'Slice and Share', how: 'Cut the big pizza along the slice lines. Share the slices out so every toy gets the same number.', uses: 'Make a Pizza' },
    { title: 'Topping Sort', how: 'Mix up the toppings and call out a label. Your child puts every matching topping in the right cup.', uses: 'Topping Labels, Make a Pizza toppings' },
    { title: 'Delivery Dash', how: 'Fill in a Delivery Ticket and race the pizza to the right room before the grown-up counts to ten.', uses: 'Delivery Tickets, Sides and Drinks food cards' },
  ],
};
