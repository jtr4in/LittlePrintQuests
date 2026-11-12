// Vet Clinic: the play kit for the Pet Rescue Vet Quest hunt.
module.exports = {
  id: 'vet',
  name: 'Vet Clinic',
  hunt: 'vet',
  bigSign: true, // a shop-style kit: it keeps the big shop sign (missed when the sign came in on 2026-10-18)
  signs: [
    ['Open', 'Come on in! The vet will see you soon.', '☀️', 'go'],
    ['Closed', 'The vets are resting. Please come back later!', '🌙', 'stop'],
    ['Waiting Room', 'Please sit quietly with your pet', '🪑'],
    ['Exam Room', 'Check-ups this way', '🩺'],
    ['X-Ray Room', 'Hold still for the picture!', '🩻'],
    ['Pet Pharmacy', 'Medicine, bandages and treats', '💊'],
    ['Surgery', 'Doctors only past this door', '😷'],
  ],
  badgeIcon: '🐾',
  leadPrefix: 'Dr.',
  leadRole: 'Head Vet',
  roles: [['Vet', 'Dr.'], ['Vet Nurse'], ['Receptionist'], ['Pet Groomer'], ['Vet', 'Dr.'], ['Vet Nurse'], ['Ambulance Driver']],
  log: {
    title: 'Today’s Appointments', icon: '📅', cols: ['Patient', 'Animal', 'Reason', 'Seen'],
    times: ['9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '1:00', '1:30', '2:00', '2:30', '3:00'],
    reasons: ['Check-up', 'Sore paw', 'Tummy ache', 'Bath time', 'Vaccines', 'Broken wing', 'Teeth clean', 'Sneezing'],
    note: 'Receptionist: write new patients in the empty rows and tick them off when the vet is done.',
  },
  record: {
    title: 'Pet Check-Up', icon: '🩺', drawLabel: 'Draw the patient',
    fields: ['Patient name', 'Animal', 'Owner', 'Weight'],
    cols: ['Healthy 😊', 'Needs care 🤕'],
    checks: [['👀', 'Eyes'], ['👂', 'Ears'], ['👃', 'Nose'], ['🦷', 'Teeth'], ['🐾', 'Paws'], ['🪮', 'Fur'], ['❤️', 'Heartbeat'], ['🌡️', 'Temperature']],
    moodLabel: 'How is the patient feeling?', moods: ['😀', '🙂', '😐', '😟', '😢'],
    notesLabel: 'Vet’s notes', signer: 'Vet',
  },
  ticket: {
    title: 'Prescription', mark: '℞', forLabel: 'Patient', countLabel: 'Times a day',
    options: [['💊', 'Pills'], ['🧴', 'Cream'], ['🩹', 'Bandage'], ['💉', 'Vaccine'], ['🥕', 'Healthy snack'], ['🛁', 'Bubble bath'], ['😴', 'Lots of rest'], ['🤗', 'Extra cuddles']],
  },
  passport: {
    pageTitle: 'Pet Passports', word: 'Pet Passport', emblem: '🐾', drawLabel: 'Draw your pet',
    fields: ['Name', 'Animal', 'Birthday', 'Owner'], stampsLabel: 'Vaccines',
    howTo: 'Cut along the dashed line and fold in the middle. Stamp or tick a box for each vaccine.',
  },
  // Prices in dollars, paid with Thank You Bucks (paper money that doesn't name the clinic).
  menu: {
    title: 'Treatment Prices', icon: '💵', coinIcon: '💵', coinWord: 'dollar', coinsTitle: 'Thank You Bucks', dollars: true, bucks: true,
    items: [['🩺', 'Check-up', 2], ['🩹', 'Bandage', 1], ['💉', 'Vaccine', 3], ['🦴', 'X-ray', 5], ['🦷', 'Teeth clean', 3], ['🛁', 'Bath & brush', 4], ['💅', 'Claw trim', 1], ['😷', 'Surgery', 10]],
  },
  toys: [], // the doctor bag moved to the activity pack and the X-ray machine went (2026-11-07 review)
  activityToys: [
    { type: 'flaps', inside: 'A lift-the-flap doctor’s bag with six tools to find', title: 'Vet’s Doctor Bag', howTo: 'Lift a flap to find a tool, then use it on a patient. Can you find all six?',
      vessel: 'bag', label: 'Dr. {child}’s Bag',
      items: [['🩺', 'Stethoscope'], ['🌡️', 'Thermometer'], ['🩹', 'Bandage'], ['🦴', 'Yummy treat'], ['🪥', 'Toothbrush'], ['🔦', 'Flashlight']] },
  ],
  dashboard: {
    gadget: 'clinic laptop', device: 'laptop', decor: '🩺',
    appName: 'PawCare', appIcon: '🐾', scheduleTitle: 'Today at the clinic', monitorTitle: 'Patient monitor', alertHeader: 'New message',
    calendarLabel: 'Appointments', nextLabel: '🩺 Next patients',
    waveLabel: '❤️ Heartbeat', stats: [['🌡️', 'Temperature', '101°F'], ['⚖️', 'Weight', '12 lb'], ['😊', 'Mood', 'Happy']],
    alertIcon: '🚑', alertTitle: 'Emergency!', alertText: 'A puppy with a sore paw is on the way. Please get the Exam Room ready!', alertButtons: ['On my way', 'Call the owner'],
    dock: ['📅', '🩺', '💊', '🦴', '📞', '💬'],
    keys: [['🚨', 'Emergency'], ['💊', 'Pharmacy'], ['📞', 'Call owner'], ['🖨️', 'Print']],
  },
  // Manila file folders for patient charts, intake forms and records (src/kits/rooms.js).
  folders: {
    title: 'Patient File Folders', label: 'PET RECORDS', tab: 'Patient', stamp: 'CONFIDENTIAL', wristbands: true,
    inside: [['📝', 'New pet form'], ['🩺', 'Check-up'], ['🦴', 'X-rays']],
    count: 1, // one folder: print it again for more pets
    tags: ['X-RAYS', 'VACCINES', 'ALLERGIES', 'GROOMING'], stamps: ['URGENT', 'ALL BETTER', 'GOOD PET!', 'FOLLOW UP'],
    intake: {
      title: 'New Patient Form', fields: ['Pet’s name', 'Species', 'Age', 'Owner'], card: true,
      reasonsLabel: 'Why is your pet visiting today?',
      reasons: [['🐾', 'Sore paw'], ['🤧', 'Sneezing'], ['😣', 'Tummy ache'], ['🦷', 'Teeth'], ['🪮', 'Grooming'], ['🩺', 'Check-up']],
      allergiesLabel: 'Is your pet allergic to anything?',
      allergies: [['🥜', 'Nuts'], ['🌸', 'Pollen'], ['🐝', 'Bees'], ['🚫', 'None']],
      body: 'Mark an X where it hurts', figure: 'pet',
    },
  },
  // Flat props to cut out and play with (see propsPages in engine.js).
  props: {
    // The Pet X-Rays page (teddy, bunny, dog, cat, hamster, bird) went in the 2026-11-11 review.
    patches: { title: 'Brave Patient Stickers', howTo: 'Cut out and tape one on every brave patient.',
      items: [['🏅', 'Brave patient'], ['⭐', 'Super pet'], ['💖', 'Get well soon'], ['🐾', 'Good boy'], ['🐾', 'Good girl'], ['🌈', 'All better'], ['🦷', 'Clean teeth'], ['💉', 'I had my vaccine'], ['😊', 'Happy & healthy']] },
  },
  certificate: { title: 'Junior Vet Certificate', icon: '🏅', seal: '🐾', line: 'cared for every patient with kindness, gentle hands and a big heart.' },
  // Two to a page, for each pet that learns its tricks.
  training: { title: 'Pet Training Certificate', icon: '🎾', line: 'has finished training and learned to:', tricks: ['Sit', 'Stay', 'Shake a paw', 'Come when called', 'Roll over', 'Walk on a leash'] },
  guide: {
    afterHunt: 'Every lost pet is found! Set up {place} at the end of the trail and give each rescued pet a check-up. Super Pet Rescuer {child} is the head vet today.',
    intro: 'Everything {child} needs to run a pretend vet clinic. Print on regular Letter paper, cut along the dashed lines, and gather some stuffed animals to be patients.',
    setup: [
      'Tape the clinic sign and Open sign by the “front door”.', 'Line up chairs for the Waiting Room.',
      'Make an Exam Room on a table or bed with a towel.', 'Fill a box with “medicine”: tissues for bandages, empty bottles, cotton balls.',
      'Pin on the badges and open the clinic!',
    ],
    play: [
      ['🩺 Full check-up', 'Go down the check-up form: eyes, ears, teeth, paws. Tick each box.'],
      ['🦴 X-ray time', 'Hold an X-ray up to the window and find out what’s wrong. Then treat it with the clinic supplies.'],
      ['🚑 Emergency!', 'A patient has a sore paw. Bandage it fast and write a prescription.'],
      ['💵 Pay at the desk', 'Owners pay with Thank You Bucks from the Treatment Prices board. Great for early counting.'],
    ],
  },
  colors: { main: '#2a9d8f', dark: '#1f6f66', soft: '#bfe9d6', light: '#eaf7f0', accent: '#ef9d31' },
  icon: '🏥',
  placeName: (who) => `${who} Pet Clinic`,
  tagline: 'Caring for animals big and small',
  subjectWord: 'pet',
  subjectPlural: 'pets',
  kinds: {
    dog: ['🐶', 'Dog'], cat: ['🐱', 'Cat'], bunny: ['🐰', 'Bunny'], hamster: ['🐹', 'Hamster'],
    bird: ['🐦', 'Bird'], fish: ['🐠', 'Fish'], turtle: ['🐢', 'Turtle'], horse: ['🐴', 'Horse'],
    unicorn: ['🦄', 'Unicorn'], bear: ['🧸', 'Teddy bear'], dino: ['🦕', 'Dinosaur'], pig: ['🐷', 'Pig'],
    fox: ['🦊', 'Fox'], lion: ['🦁', 'Lion'], frog: ['🐸', 'Frog'], monkey: ['🐵', 'Monkey'],
    koala: ['🐨', 'Koala'], panda: ['🐼', 'Panda'], mouse: ['🐭', 'Mouse'], penguin: ['🐧', 'Penguin'],
  },
  kindAliases: { puppy: 'dog', kitten: 'cat', rabbit: 'bunny', teddy: 'bear', dinosaur: 'dino', pony: 'horse', guinea_pig: 'hamster' },
  defaultKinds: ['bear', 'bunny', 'dog', 'cat'],
  // The vet kit was gone over page by page by Jason and his wife on 2026-11-07 (notes/PROJECT-NOTES.md,
  // "Vet kit review"). These switches turn on what came out of it, so other kits can copy them:
  bigWhat: 'X-ray pictures and labelled X-ray posters',
  bannerExtender: true, // a blank middle strip for the big sign, to print as many times as you like
  signFold: true, // the big Open and Closed signs share a page, one upside down, to fold and flip
  cleanCuts: true, // no instructions inside the cut lines (badges, hours sign, file folder)
  skip: ['ticket', 'passport', 'specials', 'atm', 'morning'],
  counterIcons: { OPEN: '☀️' },
  counterSkip: ['PAY HERE', 'COME AGAIN!'],
  stations: [['Check-In Desk', '📋'], ['Pet Grooming', '🛁'], ['Pet Food', '🥣'], ['Recovery Room', '🛏️']],
  binLabels: [['🧰', 'Check-Up Tools'], ['🩹', 'Bandages & Tape'], ['🌡️', 'Pet Thermometers'], ['🩺', 'Stethoscopes'], ['🦴', 'X-Rays'], ['⛑️', 'First Aid'],
    ['🧪', 'Medicine'], ['💉', 'Vaccines'], ['🦷', 'Dental Care'], ['🛁', 'Baths & Brushes'], ['💅', 'Claw Trimmers'], ['😷', 'Surgery Tools'],
    ['🧴', 'Creams'], ['🥕', 'Healthy Snacks'], ['🥣', 'Pet Food']],
  // Door signs, four to a page (clinic.js), bigger than the twelve on Jason's wife's sheet.
  doorSigns: [['Examination Room', '🩺', '#e2879b'], ['Treatment Room', '⛑️', '#2a9d8f'], ['X-Ray Room', '🩻', '#4f7fc4'], ['Medicine Storage', '🧪', '#ef9d31'],
    ['Cleaning Supplies', '🧽', '#e9b949'], ['Check-In Desk', '📋', '#5bb4a6'], ['Recovery Kennel', '🛌', '#9b7fd1'], ['Adoption Agency', '💞', '#e2879b']],
  // The sheet of clinic picture cards with visit checklists (fileSheet) went in the 2026-11-11 review.
  // Long, narrow labels that wrap round a play jar, with pretend food on both ends to trim to fit
  // (clinic.js). Fillers are src/kits/art/vet/fill/<name>.jpg.
  wrapLabels: [['Yummy Kibble', '🥣', 'kibble'], ['Tasty Treats', '🦴', 'bones'], ['Fishy Nibbles', '🐟', 'fish'], ['Kitty Kibble', '🐱', 'catkibble'],
    ['Chewy Bites', '🥩', 'chews'], ['Healthy Veggies', '🥕', 'veggies'], ['Seed Mix', '🐦', 'seeds'], ['Turtle Pellets', '🐢', 'pellets']],
  // Wrap-around bandages, sized to go round a stuffed animal's leg or paw with room to tape.
  bandages: { length: 9, width: 1.3 },
  // The clinic tablet: one screen per page, as if the vet tapped a different button (clinic.js).
  tablet: { app: 'PawCare', screens: ['appointments', 'patient', 'monitor', 'xray'] },
  // File-folder size check-up cards (clinic.js): the pet's details and picture, the services it
  // needs, and stamps or stickers for each vaccine. Some come filled in with pretend patients.
  checkup: {
    services: [['🩺', 'Examination'], ['💈', 'Grooming'], ['🎾', 'Training'], ['🦴', 'X-ray'], ['💉', 'Vaccine'], ['🦷', 'Teeth clean'], ['🛁', 'Bath'], ['🧪', 'Medicine']],
    info: ['Name', 'Species', 'Age', 'Owner'],
    pretend: [['Biscuit', 'dog', '3', 'Jaxon'], ['Mittens', 'cat', '5', 'Jonah'], ['Clover', 'bunny', '2', 'Mom'], ['Shelly', 'turtle', '10', 'Dad']],
    stampsLabel: 'Vaccine stamps: add a sticker or stamp for each vaccine',
  },
};
