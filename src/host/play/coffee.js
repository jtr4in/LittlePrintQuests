// Play Kit ideas for the Coffee Shop kit.
module.exports = {
  scenarios: [
    { title: 'Morning Rush', setup: 'Line up four stuffed animals by the Order Here sign and set out the Café Menu and café coins.', say: 'Good morning, Barista {name}! We all need a warm drink, please!', twist: 'Everyone orders at once. The barista must write each one on a Cup Ticket so nobody gets mixed up.' },
    { title: 'Cozy Cocoa', setup: 'Tape up How to Make a Hot Cocoa by the play kitchen and grab a mug and spoon.', say: 'It’s so cold outside! Can I have a hot cocoa with whipped cream?', twist: 'The customer wants extra sprinkles. Then more! Then even more! How many is too many?' },
    { title: 'Spin and Serve', setup: 'Cut out the Drink Spinner and put it by the register.', say: 'Surprise me! I’ll have whatever the spinner says.', twist: 'It lands on lemonade, but the customer is freezing. Can the barista make it a warm drink instead?' },
    { title: 'Name on the Cup', setup: 'Set out the Drink order slips and a crayon.', say: 'One babyccino for Bunny, please. Can you call my name when it’s ready?', twist: 'The barista calls the wrong name! Who does the drink really belong to?' },
    { title: 'Pay at the Register', setup: 'Set up the Café Register with the play bank cards and a pile of café coins.', say: 'A muffin and a tea, please. How many coins is that?', twist: 'The customer puts a coin in the Tip Jar. Say thank you!' },
    { title: 'Bake Sale', setup: 'Spread out the Drinks and Treats cards on the counter and stand up the Counter Labels.', say: 'What treats do you have today, Barista {name}?', twist: 'The croissants are all gone! Can the baker suggest something else yummy?' },
    { title: 'Café Club', setup: 'Fill in Loyalty Cards for each toy and grab a crayon to stamp the circles.', say: 'Is this my last circle? Do I get my free cocoa today?', twist: 'Every Café Club member fills a card at once. Can the barista make all the free cocoas?' },
    { title: 'Quiet Café', setup: 'Tape up the Free Wi-Fi sign and seat a toy with a pretend laptop or book.', say: 'I’m working on a big drawing. Can I have a tea and stay for a while?', twist: 'The customer spills the tea! Grab a napkin and clean up together.' },
  ],
  lines: {
    kid: [
      'Welcome to my café! What can I get you?',
      'Would you like whipped cream on that?',
      'Hot or iced?',
      'That will be two coins, please.',
      'One hot cocoa for Teddy! Your drink is ready!',
      'Thanks for coming! Have a cozy day!',
    ],
    grownup: [
      'Barista {name}, what’s your favorite drink on the menu?',
      'Can I have a small smoothie, please?',
      'How many coins for a cocoa and a cookie?',
      'Can you stamp my loyalty card, please?',
      'What’s the Wi-Fi password?',
      'What’s the silliest drink you can make?',
    ],
  },
  games: [
    { title: 'Cocoa Steps', how: 'Make a pretend hot cocoa, following the steps on the sign in order. Can you remember them all without looking?', uses: 'How to Make a Hot Cocoa' },
    { title: 'Coin Count Checkout', how: 'Pick a drink and a treat from the menu. Count out the café coins together and ring them up on the register.', uses: 'Café Menu, Café Register, Café Coins' },
    { title: 'Spin and Make', how: 'Spin the Drink Spinner and make that drink as fast as you can, then serve it to a toy.', uses: 'Drink Spinner, Cup Ticket cards' },
    { title: 'Counter Sort', how: 'Mix up cups, spoons and napkins. Your child puts each thing by the right Counter Label.', uses: 'Counter Labels' },
    { title: 'Treat Tray', how: 'Lay out the treat cards. A grown-up orders three things, and your child puts them on a tray and adds up the coins.', uses: 'Drinks and Treats, Café Menu' },
  ],
};
