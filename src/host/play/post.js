// Play Kit ideas for the Post Office.
module.exports = {
  scenarios: [
    { title: 'First Customer', setup: 'Tape up the Open sign, set the Till on the counter and lay out the Postage Stamps.', say: 'Hello, Postmaster! I want to send a letter to my grandma. Can you help me?', twist: 'The customer forgot to write the address! Help them write it on the front.' },
    { title: 'Weigh the Parcel', setup: 'Put a wrapped toy by the Weigh Your Parcels Here sign with a Parcel Form and the Till.', say: 'Clerk {name}, is this parcel heavy? How many coins to send it?', twist: 'The parcel is SO heavy it needs two people to lift it. Grunt and lift together!' },
    { title: 'Fragile Gift', setup: 'Wrap something soft and set out the Parcel Stickers and a Parcel Label.', say: 'Please be careful! There’s a teacup inside for my friend’s birthday.', twist: 'The mail carrier trips! Did the Fragile sticker save the gift? Peek inside and check.' },
    { title: 'Express Rush', setup: 'Put the Express Mail sign up and a stack of letters by the Mail box.', say: 'Quick! This letter has to get there today! Can you send it express?', twist: 'The express pick-up is in one minute. Count down from 10 and race to the truck!' },
    { title: 'Sorting Room Mix-Up', setup: 'Fill the Mail box with letters and parcels for different stuffed animals and open the Sorting Room.', say: 'Uh oh, the mail is all mixed up! Can you sort it before the truck comes?', twist: 'One parcel has no name on it. Read the clues on the Parcel Label to find who it’s for.' },
    { title: 'Postcard Holiday', setup: 'Set out the Postcards, crayons and a stamp for each one.', say: 'I just got back from the beach! Can I send a postcard to Bunny?', twist: 'The customer wants a postcard with a shark AND a sandcastle. Draw it together!' },
    { title: 'Parcel on Its Way', setup: 'Use the Parcel on Its Way slider and seat a stuffed animal waiting at home.', say: 'Teddy is waiting for a parcel. Where is it now? Can you check?', twist: 'Each time you pull the tab, act it out: pack it, drive the truck, knock on the door!' },
    { title: 'Mail Carrier Route', setup: 'Give each helper a Mail Carrier Licence and seat stuffed animals around the room as houses.', say: 'Mail Carrier {name}, here is your bag. Five letters to deliver today!', twist: 'A dog on the route barks! Deliver its letter super quietly so it stays asleep.' },
  ],
  lines: {
    kid: [
      'Welcome to the post office! What are you sending today?',
      'Let me weigh that for you. Hmm, it’s heavy!',
      'One stamp, please. That’s one coin.',
      'Do you want express or regular mail?',
      'Is it fragile? I’ll put a sticker on it.',
      'Your parcel is on its way!',
    ],
    grownup: [
      'Clerk {name}, how much is it to send a postcard?',
      'Can you help me fill in a Parcel Label?',
      'Which sticker should go on my parcel?',
      'Could you sell me three stamps, please?',
      'Is there any mail for me today?',
      'Can I have a receipt from the Till, please?',
    ],
  },
  games: [
    { title: 'Coin Counter', how: 'Pick two things from the Postage Prices board. Add up the coins and pay the exact amount at the Till.', uses: 'Postage Prices and post coins' },
    { title: 'Sort It Fast', how: 'Mix letters and parcels in the Mail box. Sort them into piles by sticker before the song ends.', uses: 'Parcel Stickers and the Mail box' },
    { title: 'Stamp Match', how: 'Lay out the Postage Stamps. Find two that match and stick one on a letter for each pair.', uses: 'Postage Stamps' },
    { title: 'Write and Post', how: 'Write a short letter on the Letter Paper. Follow every step on the How to Post a Letter sign.', uses: 'Letter Paper and How to Post a Letter' },
    { title: 'Delivery Count', how: 'Deliver a letter to a stuffed friend, then tick a box on your Mail Carrier Licence. Who gets ten first?', uses: 'Mail Carrier Licences and Parcel Labels' },
  ],
};
