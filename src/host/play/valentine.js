// Play Kit ideas for the Valentine Post Office.
module.exports = {
  scenarios: [
    { title: 'Mail Drop-Off', setup: 'Tape up the Open sign, set the shoebox Mailbox by the door, and hand {name} a pile of Special Delivery slips.', say: 'Hello, Postmaster! I have a valentine for Teddy. Can you help me send it?', twist: 'The valentine has no name on it! Ask the Kindness Spinner who should get it.' },
    { title: 'Post Office Shop', setup: 'Set out the Post Office Shop menu, the heart coins and the Mini Valentines to buy.', say: 'I’d like an envelope and a candy heart, please. How many heart coins is that?', twist: 'Pay with way too many heart coins and see if the shopkeeper counts back your change.' },
    { title: 'Stamp Counter Rush', setup: 'Put the Heart Stamps at the Stamp Counter sign with a stack of cards that need stamping.', say: 'Quick, Stamp Keeper! These cards need a stamp before the truck leaves!', twist: 'One card is extra big and needs three stamps. Count them out together!' },
    { title: 'Sorting Room Mix-Up', setup: 'Fill the Mailbox with valentines for different stuffed animal friends and open the Sorting Room.', say: 'Oh no, the mail got all mixed up! Can you sort it into piles for each friend?', twist: 'A sneaky love bug hid one card under a pillow. Can you find it?' },
    { title: 'Mail Route Delivery', setup: 'Lay the Mail Route Map on the floor and load the Delivery Truck with stamped valentines.', say: 'Delivery Driver {name}, the Bakery is waiting for a special delivery!', twist: 'The truck has a bumpy road! Hop like a bunny all the way to the next stop.' },
    { title: 'Card Making Table', setup: 'Set out paper, crayons and the Card Making Table sign, plus a Friendship File for each friend.', say: 'Card Maker, my friend Bunny loves the color purple. Can you make her a card?', twist: 'The customer asks for a card with a dinosaur AND a rainbow on it. Draw it together!' },
    { title: 'Love Mailbox Surprise', setup: 'Bring out the Love Mailbox toy and seat a stuffed animal friend next to it.', say: 'Knock knock! Puppy is waiting for mail. What’s behind the first little door?', twist: 'Whatever is behind the door, act it out: hug the teddy, sniff the rose, pop the balloon!' },
    { title: 'Kindness Helper Visit', setup: 'Use the Kindness Spinner and a Friend Pass for each stuffed animal on the route.', say: 'Kindness Helper, Kitty is feeling a little sad today. What kind thing can we do?', twist: 'Spin twice and do both kind things at once, like a song AND a high five!' },
  ],
  lines: {
    kid: [
      'Welcome to the Valentine Post Office! Who is your card for?',
      'That will be two heart coins, please.',
      'Let me stamp it for you. Thump!',
      'Special delivery on the way!',
      'Would you like to add a hug to your mail?',
      'Your friend is going to smile so big!',
    ],
    grownup: [
      'Postmaster {name}, can you help me write a kind note?',
      'How many heart coins for a rose and a cupcake?',
      'Can you spin the Kindness Spinner for me?',
      'I think this card needs a heart stamp. Which one should I pick?',
      'Could you drive this valentine to the Flower Shop?',
      'What’s your friend’s favorite color? Let’s use it on the card!',
    ],
  },
  games: [
    { title: 'Heart Coin Count', how: 'Pick two things from the Post Office Shop menu. Add up the heart coins and pay the exact amount.', uses: 'Shop menu and heart coins' },
    { title: 'Sort It Fast', how: 'Mix the Mini Valentines in the Mailbox. Sort them into piles by picture before the song ends.', uses: 'Mini Valentines and the Mailbox' },
    { title: 'Kindness Spin', how: 'Take turns spinning the Kindness Spinner. Do the kind thing, then tick it on the Friendship File.', uses: 'Kindness Spinner and Friendship File' },
    { title: 'Route Hop', how: 'Hop from stop to stop on the Mail Route Map. Leave one stamped valentine at each house.', uses: 'Mail Route Map and Heart Stamps' },
    { title: 'Stamp the Pass', how: 'Deliver a valentine to a stuffed friend. Stamp a heart on their Friend Pass and count who has the most.', uses: 'Friend Passes and Mini Valentines' },
  ],
};
