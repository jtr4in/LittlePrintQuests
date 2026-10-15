// Play Kit ideas for the Pet Shop kit.
module.exports = {
  scenarios: [
    { title: 'Adoption Day', setup: 'Line up stuffed animals under the Adopt a Pet sign and set out the Adoption Papers.', say: 'Hi, {name}! I’d love a new pet. Which one is the friendliest?', twist: 'Two customers want the same puppy. Can the shop owner help them find another pet they love just as much?' },
    { title: 'Muddy Puppy', setup: 'Tape up How to Give a Pet a Bath and grab a towel and an empty tub or box.', say: 'Oh no, my puppy jumped in a puddle! Can you give him a bath?', twist: 'The puppy shakes and splashes the groomer! Count to three and dry off together.' },
    { title: 'Grooming Appointment', setup: 'Open the Grooming Book and fill in a Grooming Ticket for the first pet.', say: 'My kitty needs a brush, a nail trim and a pretty bow, please.', twist: 'The kitty is ticklish and won’t sit still for the nail trim. How can the groomer help her calm down?' },
    { title: 'Shopping for Supplies', setup: 'Stock a shelf with the Pet Supplies cards and the Shelf Labels.', say: 'I just got a bunny! What does a bunny need to be happy?', twist: 'The customer wants a leash for a fish! Can the shop owner kindly suggest something better?' },
    { title: 'Pay at the Register', setup: 'Set up the Pet Shop Register with the play bank cards and Pet Shop Money.', say: 'A bone treat and a toy ball, please. How many coins is that?', twist: 'The customer has a gift card. Can the cashier ring it up on the Card button?' },
    { title: 'Feeding Time', setup: 'Give each pet a Pet Care Card and line up some bowls.', say: 'Manager {name}, the pets are hungry! Who gets fed first?', twist: 'The hamster ate the cat’s food! Tick the cards again and make sure everyone gets their own dinner.' },
    { title: 'Pet Check-In', setup: 'Fill in Adoption Papers for a pet that went home last week.', say: 'We’re back for a visit! Can you stamp our papers?', twist: 'The pet has learned a new trick. Can it show everyone in the shop?' },
    { title: 'Bath Time Show', setup: 'Cut out Bath Time and gather the clean, fluffy pets on a shelf.', say: 'Is my dog ready yet? I can’t wait to see him!', twist: 'Pull the tab slowly to show the bath, then put on a pet show for the owner.' },
  ],
  lines: {
    kid: [
      'Welcome to my pet shop! Would you like to meet the pets?',
      'Please be gentle. Pets love soft hands.',
      'This puppy needs a bath. Scrub-a-dub-dub!',
      'That will be three coins, please.',
      'Here are your adoption papers. Take good care of your new pet!',
      'Thanks for coming! Bring your pet back to visit!',
    ],
    grownup: [
      '{name}, which pet would be a good friend for me?',
      'What does a kitten like to eat?',
      'How many coins for a bath and a bow?',
      'Can my dog get a brand-new leash today?',
      'Can you show me how to brush a bunny?',
      'What’s the silliest name for a hamster?',
    ],
  },
  games: [
    { title: 'Pet Sort', how: 'Mix up the stuffed animals and stand up the Shelf Labels. Your child puts every pet by the right label.', uses: 'Shelf Labels' },
    { title: 'Coin Count Checkout', how: 'Pick two things from the price board. Count out the coins together and ring them up on the register.', uses: 'Pet Shop Prices, Pet Shop Register, Pet Shop Money' },
    { title: 'Bath Steps', how: 'Act out each step of the bath sign in order. Can you remember them all without looking?', uses: 'How to Give a Pet a Bath, Bath Time' },
    { title: 'Name That Pet', how: 'Give every new pet a name, then write it on its Adoption Papers and draw its picture.', uses: 'Adoption Papers' },
    { title: 'Supply Match', how: 'Hold up a supply card and ask which pet needs it: a carrot for the bunny, a yarn ball for the cat.', uses: 'Pet Supplies' },
  ],
};
