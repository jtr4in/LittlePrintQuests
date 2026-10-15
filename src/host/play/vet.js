// Play Kit ideas for the Vet Clinic.
module.exports = {
  scenarios: [
    { title: 'The Sneezy Bunny', setup: 'Set out the Pet Check-Up record card, a bunny patient and the Vet’s Doctor Bag.', say: 'Dr. {name}, my bunny keeps going achoo! Can you check her nose and ears?', twist: 'Every time the vet says “bless you,” the bunny sneezes again, louder and sillier.' },
    { title: 'Mystery X-Ray', setup: 'Use the Pet X-Rays and the X-Ray Machine. Hide one X-ray in an envelope.', say: 'My puppy ate something funny. Can you take an X-ray and find out what it is?', twist: 'The X-ray shows the puppy swallowed a sock, and now the vet has to find its matching sock!' },
    { title: 'Busy Waiting Room', setup: 'Line up four stuffed animals in the Waiting Room and use Today’s Appointments sheet.', say: 'Hello, Receptionist! We all have appointments. Who goes first?', twist: 'A surprise patient waddles in without an appointment: a penguin with a very cold flipper.' },
    { title: 'Pay at the Desk', setup: 'Set out the Treatment Prices menu and the paw coins.', say: 'My cat needs a check-up and a claw trim. How many paw coins is that, please?', twist: 'The owner pays with one coin too many. Can the receptionist give the extra coin back?' },
    { title: 'Ambulance Emergency', setup: 'Put a patient across the room and the Exam Room sign on a table. Grab a bandage from the Clinic Supplies.', say: 'Emergency, Dr. {name}! A puppy has a sore paw. Drive the ambulance over, quick!', twist: 'The ambulance can only drive backward today. Beep beep beep!' },
    { title: 'Bubble Bath Day', setup: 'Use the bubble bath and soap Clinic Supplies cards and a towel for the Pet Groomer.', say: 'My dog rolled in mud! Can the groomer give him a bath and brush?', twist: 'The dog shakes off and splashes everyone. Groomer, dry us all off!' },
    { title: 'Vaccine Day', setup: 'Hand out Pet Passports and set out the vaccine card from the Clinic Supplies.', say: 'My kitten needs her vaccine. Can you be extra gentle and stamp her passport?', twist: 'The kitten is scared, so the vet must sing a little song first to keep her calm.' },
    { title: 'The Unicorn Patient', setup: 'Bring a unicorn or any toy as a magical patient and use a blank Pet Check-Up card.', say: 'Dr. {name}, my unicorn’s horn has lost its sparkle! Can you help?', twist: 'The only cure is a Prescription for extra cuddles and three twirls, three times a day.' },
  ],
  lines: {
    kid: [
      'Welcome to the clinic! Who is our patient today?',
      'Please sit in the Waiting Room. The vet will see you soon.',
      'Open wide! Let me look at those teeth.',
      'Hold still, I need to listen to the heartbeat.',
      'That will be two paw coins, please.',
      'Here is a Brave Patient sticker. You did great!',
    ],
    grownup: [
      'My teddy has a tummy ache. Can you check him, Dr. {name}?',
      'How many paw coins for a bath and brush?',
      'Can you write a prescription for my sneezy dog?',
      'Is my pet healthy? Can you tick the boxes on the check-up card?',
      'Oh no, my bird has a broken wing! What should we do?',
      'Can you show me how to give my puppy gentle pets?',
    ],
  },
  games: [
    { title: 'Find the Tool', how: 'Call out a tool like “flashlight!” Your child lifts flaps on the Vet’s Doctor Bag to find it fast.', uses: 'Vet’s Doctor Bag' },
    { title: 'Coin Count Checkout', how: 'Pick two treatments from the menu. Count out the paw coins together to pay.', uses: 'Treatment Prices menu, paw coins' },
    { title: 'Check-Up Race', how: 'Give a patient a full check-up, ticking eyes, ears, nose and paws. Can you tick all eight boxes before a song ends?', uses: 'Pet Check-Up record cards' },
    { title: 'X-Ray Guessing', how: 'Hold an X-ray up to the window and describe it. Your child guesses what the pet swallowed.', uses: 'Pet X-Rays' },
    { title: 'Sticker Parade', how: 'Patients march past while the vet hands out stickers. Each pet must do a silly animal walk to earn one.', uses: 'Brave Patient Stickers' },
  ],
};
