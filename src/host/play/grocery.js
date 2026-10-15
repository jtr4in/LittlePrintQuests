// Play Kit ideas for the Grocery Store.
module.exports = {
  scenarios: [
    { title: 'The Big Shopping Trip', setup: 'Fill in a Shopping List for a teddy bear shopper and stock a shelf with the Play Food.', say: 'Hello! I need everything on my list, but I can’t find the bananas. Can you help me, {name}?', twist: 'The teddy keeps adding silly things to the list, like “a cookie as big as a car.”' },
    { title: 'Busy Checkout', setup: 'Set up the Checkout register with the Grocery Money, and line up three shoppers with full baskets.', say: 'Excuse me, Cashier {name}! Can you scan my milk and bread, please?', twist: 'The scanner goes “beep beep BOOP!” and the cashier has to fix it with a silly dance.' },
    { title: 'Coupon Day', setup: 'Hand a shopper two Coupons and set out the Weekly Specials board.', say: 'I have a coupon for Buy 1 Get 1 bananas! How many bananas do I get?', twist: 'The shopper finds one more coupon in a pocket. Is the bread free now too?' },
    { title: 'Restock the Shelves', setup: 'Stand up the Aisle Labels and mix all the Play Food into one big pile.', say: 'Oh no, the delivery truck is here! Shelf Stocker {name}, can you put everything in the right aisle?', twist: 'A sneaky carrot keeps hiding in the Frozen aisle. Brrr, find it and move it back!' },
    { title: 'What’s in My Basket?', setup: 'Use the Shopping Basket flaps and the matching Play Food.', say: 'I already put six things in my basket. Lift a flap and guess what’s next!', twist: 'Behind every flap, the shopper has to find that same food in the store before checking out.' },
    { title: 'Rewards Card Treat', setup: 'Give a shopper a Rewards Card and keep a stamp or marker at the Checkout.', say: 'I shop here every day! Can you stamp my Rewards Card, please?', twist: 'Today the card is full! The manager picks a special treat from Today’s Specials.' },
    { title: 'The Bakery Rush', setup: 'Put the Bakery sign on a table with the bread and croissant Play Food cards.', say: 'Good morning, Baker {name}! Do you have warm bread today? I’m having a picnic!', twist: 'A hungry bunny buys all the croissants. The baker has to “bake” more, fast!' },
    { title: 'Closing Time', setup: 'Tape up the Closed sign and give out Store Stickers to the crew.', say: 'Wait, wait! I just need one carton of milk before you close!', twist: 'The manager says yes, but the shopper must hop to the Dairy aisle like a bunny.' },
  ],
  lines: {
    kid: [
      'Welcome to the store! Do you need a cart?',
      'The apples are in Produce, right over there.',
      'Beep! Beep! Let me scan your food.',
      'That will be three coins, please.',
      'Would you like a bag for that?',
      'Here is your receipt. Have a nice day!',
    ],
    grownup: [
      'Excuse me, where can I find the eggs, {name}?',
      'How many coins for milk and bread?',
      'Can I use my coupon today, please?',
      'Is the ice cream on sale this week?',
      'Can you help me tick off my shopping list?',
      'Can you stamp my Rewards Card, please?',
    ],
  },
  games: [
    { title: 'Shopping List Hunt', how: 'Tick four things on a Shopping List. Your child races around the store to find each one and put it in the basket.', uses: 'Shopping List, Play Food' },
    { title: 'Coin Count Checkout', how: 'Pick two foods with price tags. Count out the coins together and pay at the register.', uses: 'Play Food, Grocery Money, Checkout register' },
    { title: 'Aisle Sort', how: 'Mix up the Play Food and ask your child to put each one by the right Aisle Label. How fast can you sort them all?', uses: 'Aisle Labels, Play Food' },
    { title: 'Lift and Find', how: 'Lift a flap on the Shopping Basket and name the food. Your child finds that food in the store before the next flap.', uses: 'Shopping Basket, Play Food' },
    { title: 'Coupon Math', how: 'Hand over a coupon at checkout. Work out the new price together: is it free, half price or one coin off?', uses: 'Coupons, Weekly Specials board' },
  ],
};
