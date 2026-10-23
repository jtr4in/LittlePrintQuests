// Theme definitions: short label (for menus), story, rhyming openers, palette, fonts and icon.
// Placeholders in story text: {kids} (who the letter is addressed to),
// {name}, {age}, {count} (number of clues), {prize} (final spot label).

const ICONS = {
  footprint: `<svg viewBox="0 0 64 64" fill="currentColor"><path d="M32 3c4 9 6 18 6 28H26c0-10 2-19 6-28z"/><path d="M6 13c9 4 16 12 20 21l-8 7C13 32 8 24 6 13z"/><path d="M58 13c-9 4-16 12-20 21l8 7c5-9 10-17 12-28z"/><path d="M19 39c5-7 21-7 26 0 4 9-4 20-13 22-9-2-17-13-13-22z"/></svg>`,
  bolt: `<svg viewBox="0 0 64 64" fill="currentColor"><polygon points="38,2 12,36 29,36 22,62 52,24 35,24 44,2"/></svg>`,
  compass: `<svg viewBox="0 0 64 64" fill="currentColor"><circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" stroke-width="3"/><polygon points="32,2 37,27 62,32 37,37 32,62 27,37 2,32 27,27"/><circle cx="32" cy="32" r="4" fill="#fff"/></svg>`,
  rocket: `<svg viewBox="0 0 64 64" fill="currentColor"><path d="M32 3c11 9 14 25 10 41H22C18 28 21 12 32 3z"/><circle cx="32" cy="22" r="5.5" fill="#fff"/><path d="M22 34l-9 12 10-2zM42 34l9 12-10-2z"/><path d="M26 47h12l-6 14z" opacity=".75"/></svg>`,
  crown: `<svg viewBox="0 0 64 64" fill="currentColor"><polygon points="6,46 9,16 22,30 32,8 42,30 55,16 58,46"/><rect x="6" y="49" width="52" height="7" rx="2"/><circle cx="9" cy="14" r="4"/><circle cx="32" cy="7" r="4"/><circle cx="55" cy="14" r="4"/></svg>`,
  unicorn: `<svg viewBox="0 0 64 64" fill="currentColor"><path d="M33 62c-1-8-4-12-8-15l-12 2c-5 1-8-3-6-7l12-16c2-4 5-6 8-7l4-9 3 9c12 3 20 14 22 28v15z"/><polygon points="18,24 7,2 26,19"/><path d="M14.5 16.5l5-3.5M11.5 10.5l4-3" stroke="#fff" stroke-width="2"/><circle cx="23" cy="31" r="2.6" fill="#fff"/><path d="M40 23c5 6 3 11 8 16M46 26c4 6 3 10 7 14" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M54 4l1.5 3.5L59 9l-3.5 1.5L54 14l-1.5-3.5L49 9l3.5-1.5z"/></svg>`,
  shell: `<svg viewBox="0 0 64 64" fill="currentColor"><path d="M32 54L8 34Q3 27 7 20Q10 13 17 12Q22 5 28 7Q32 3 36 7Q42 5 47 12Q54 13 57 20Q61 27 56 34z"/><path d="M19 49l13 6 13-6-2 10H21z"/><path d="M32 51V10M32 51L19 13M32 51L45 13M32 51L10 22M32 51L54 22" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  paw: `<svg viewBox="0 0 64 64" fill="currentColor"><ellipse cx="14" cy="27" rx="6.5" ry="8.5" transform="rotate(-20 14 27)"/><ellipse cx="25" cy="15" rx="6.5" ry="9"/><ellipse cx="39" cy="15" rx="6.5" ry="9"/><ellipse cx="50" cy="27" rx="6.5" ry="8.5" transform="rotate(20 50 27)"/><path d="M32 32c-9 0-18 10-18 18 0 6 5 9 10 8 3-1 5-2 8-2s5 1 8 2c5 1 10-2 10-8 0-8-9-18-18-18z"/></svg>`,
  hardhat: `<svg viewBox="0 0 64 64" fill="currentColor"><path d="M8 44C8 26 18 14 32 14s24 12 24 30z"/><path d="M2 43h60q0 9-8 9H10q-8 0-8-9z"/><path d="M27 17v26M37 17v26" stroke="#fff" stroke-width="2.6"/><path d="M15 30c1-5 3-8 6-11" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg>`,
  easter: `<svg viewBox="0 0 64 64" fill="currentColor"><path d="M32 3C19 3 9 24 9 39c0 13 10 22 23 22s23-9 23-22C55 24 45 3 32 3z"/><path d="M12 34l6.7-6 6.6 6 6.7-6 6.7 6 6.6-6 6.7 6" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><circle cx="22" cy="46" r="3" fill="#fff"/><circle cx="32" cy="50" r="3" fill="#fff"/><circle cx="42" cy="46" r="3" fill="#fff"/><circle cx="32" cy="16" r="3" fill="#fff"/></svg>`,
  halloween: `<svg viewBox="0 0 64 64" fill="currentColor"><path d="M30 15c0-5 1-9 4-12l4 2c-2 3-3 6-3 10z"/><path d="M36 9c5-5 12-5 15-1-5 4-10 4-15 1z"/><ellipse cx="20" cy="38" rx="15" ry="20"/><ellipse cx="44" cy="38" rx="15" ry="20"/><ellipse cx="32" cy="38" rx="15" ry="23"/><polygon points="17,33 26,33 21.5,25" fill="#fff"/><polygon points="38,33 47,33 42.5,25" fill="#fff"/><path d="M18 42c4 8 24 8 28 0-6 3-22 3-28 0z" fill="#fff"/></svg>`,
  christmas: `<svg viewBox="0 0 64 64" fill="currentColor"><circle cx="32" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="3.5"/><path d="M32 12c-11 0-18 9-18 20v10l-6 8h48l-6-8V32c0-11-7-20-18-20z"/><circle cx="32" cy="56" r="6"/><path d="M22 31c1-6 4-10 9-11" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg>`,
  valentine: `<svg viewBox="0 0 64 64" fill="currentColor"><path d="M32 59C14 45 3 35 3 21 3 11 11 4 20 4c5 0 9 3 12 7 3-4 7-7 12-7 9 0 17 7 17 17 0 14-11 24-29 38z"/><rect x="17" y="20" width="30" height="20" rx="2.5" fill="none" stroke="#fff" stroke-width="3"/><path d="M18 22l14 10 14-10" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>`,
  fire: `<svg viewBox="0 0 64 64" fill="currentColor"><path d="M9 41C9 23 19 11 33 11c13 0 22 11 22 28z"/><path d="M2 40h59c2 0 3 7-1 7H9c-5 0-7-3-7-7z"/><path d="M23 16h16v14l-8 6-8-6z" fill="#fff"/><circle cx="31" cy="24" r="4"/><path d="M46 20c3 4 4 8 4 13" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg>`,
  ice: `<svg viewBox="0 0 64 64" fill="currentColor"><g stroke="currentColor" stroke-width="5" stroke-linecap="round" fill="none"><path d="M32 4v56M7.8 18l48.4 28M7.8 46l48.4-28"/><path d="M24 7l8 8 8-8M24 57l8-8 8 8M5 28l11-3-3-11M59 36l-11 3 3 11M5 36l11 3-3 11M59 28l-11-3 3-11"/></g><polygon points="32,23 39.8,27.5 39.8,36.5 32,41 24.2,36.5 24.2,27.5"/><circle cx="32" cy="32" r="3.2" fill="#fff"/></svg>`,
  racecar: `<svg viewBox="0 0 64 64" fill="currentColor"><path d="M2 25h13v4h-4v6H8v-6H2z"/><path d="M4 43c0-5 3-8 7-9l9-2 7-9c1-1 2-2 4-2h11c2 0 3 1 4 2l5 8 6 1c3 1 5 3 5 6v5c0 1-1 2-2 2H6c-1 0-2-1-2-2z"/><path d="M30 25h6v7h-11zM39 25h5l5 7H39z" fill="#fff"/><circle cx="18" cy="46" r="9" stroke="#fff" stroke-width="2.5"/><circle cx="18" cy="46" r="3.2" fill="#fff"/><circle cx="48" cy="46" r="9" stroke="#fff" stroke-width="2.5"/><circle cx="48" cy="46" r="3.2" fill="#fff"/></svg>`,
  pizza: `<svg viewBox="0 0 64 64" fill="currentColor"><path d="M32 61L5 15c17-9 37-9 54 0z"/><path d="M8 16c15-7 33-7 48 0" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><circle cx="25" cy="28" r="5" fill="#fff"/><circle cx="39" cy="30" r="4.5" fill="#fff"/><circle cx="32" cy="44" r="4" fill="#fff"/></svg>`,
  burger: `<svg viewBox="0 0 64 64" fill="currentColor"><path d="M6 27C6 14 18 6 32 6s26 8 26 21z"/><rect x="3" y="31" width="58" height="9" rx="4.5"/><path d="M6 44h52v3c0 6-4 10-10 10H16C10 57 6 53 6 47z"/><g fill="#fff"><ellipse cx="22" cy="16" rx="2.4" ry="1.4" transform="rotate(-20 22 16)"/><ellipse cx="33" cy="12" rx="2.4" ry="1.4"/><ellipse cx="43" cy="17" rx="2.4" ry="1.4" transform="rotate(20 43 17)"/><ellipse cx="30" cy="21" rx="2.4" ry="1.4"/></g></svg>`,
  cart: `<svg viewBox="0 0 64 64" fill="currentColor"><path d="M3 8h9l7 32h33l6-22H16" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><path d="M16 18h42l-6 22H20z"/><path d="M27 22v14M37 22v14M47 22v14" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><circle cx="23" cy="53" r="5.5"/><circle cx="47" cy="53" r="5.5"/></svg>`,
  envelope: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round"><rect x="4" y="13" width="56" height="40" rx="5"/><path d="M7 17l25 19 25-19"/><path d="M7 49l17-13M57 49L40 36" stroke-width="4"/></svg>`,
  book: `<svg viewBox="0 0 64 64" fill="currentColor"><path d="M31 15C23 9 13 8 3 10v42c10-2 20-1 28 5z"/><path d="M33 15c8-6 18-7 28-5v42c-10-2-20-1-28 5z"/><path d="M9 19c6-1 12 0 16 2M9 27c6-1 12 0 16 2M9 35c6-1 12 0 16 2M39 21c4-2 10-3 16-2M39 29c4-2 10-3 16-2M39 37c4-2 10-3 16-2" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>`,
  shield: `<svg viewBox="0 0 64 64" fill="currentColor"><path d="M32 3l24 8v18c0 16-10 27-24 32C18 56 8 45 8 29V11z"/><polygon points="32,17 36.4,26.6 46.8,27.6 39,34.6 41.2,44.8 32,39.6 22.8,44.8 25,34.6 17.2,27.6 27.6,26.6" fill="#fff"/></svg>`,
  tooth: `<svg viewBox="0 0 64 64" fill="currentColor"><path d="M18 6C10 6 5 13 5 21c0 7 3 11 5 17 2 7 3 20 9 20 5 0 5-14 13-14s8 14 13 14c6 0 7-13 9-20 2-6 5-10 5-17 0-8-5-15-13-15-6 0-9 3-14 3S24 6 18 6z"/><path d="M15 15c-3 1-5 4-5 8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M50 3l1.5 3.5L55 8l-3.5 1.5L50 13l-1.5-3.5L45 8l3.5-1.5z"/></svg>`,
  tag: `<svg viewBox="0 0 64 64" fill="currentColor"><circle cx="32" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="4"/><path d="M32 61C16 49 6 40 6 28c0-8 6-14 14-14 5 0 9 3 12 7 3-4 7-7 12-7 8 0 14 6 14 14 0 12-10 21-26 33z"/><g fill="#fff"><ellipse cx="32" cy="40" rx="6" ry="5"/><circle cx="23.5" cy="31" r="2.8"/><circle cx="28.5" cy="26.5" r="2.8"/><circle cx="35.5" cy="26.5" r="2.8"/><circle cx="40.5" cy="31" r="2.8"/></g></svg>`,
  mug: `<svg viewBox="0 0 64 64" fill="currentColor"><path d="M7 23h39v19c0 9-7 16-16 16h-7C14 58 7 51 7 42z"/><path d="M46 28h4c5 0 8 3 8 8s-3 8-8 8h-4" fill="none" stroke="currentColor" stroke-width="5"/><path d="M17 17c-3-4 3-6 0-11M27 17c-3-4 3-6 0-11M37 17c-3-4 3-6 0-11" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M26.5 49c-6-4-8.5-7-8.5-10 0-2.2 1.8-4 4-4 2 0 3.5 1.2 4.5 3 1-1.8 2.5-3 4.5-3 2.2 0 4 1.8 4 4 0 3-2.5 6-8.5 10z" fill="#fff"/></svg>`,
  pasta: `<svg viewBox="0 0 64 64" fill="currentColor"><path d="M3 34h58c0 14-12 24-29 24S3 48 3 34z"/><path d="M9 31c2-11 12-17 23-17s21 6 23 17z"/><path d="M15 29c4-7 10-9 17-9M23 30c4-4 9-5 14-4M36 30c3-3 8-4 12-2" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M46 3v10M50 3v10M54 3v10M46 11c0 4 8 4 8 0M50 14v10" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  wrench: `<svg viewBox="0 0 64 64" fill="currentColor"><path d="M45 3a15 15 0 0 0-14 20L6 48a6.4 6.4 0 0 0 0 9l1 1a6.4 6.4 0 0 0 9 0l25-25a15 15 0 0 0 20-14l-10 10-9-2-2-9 10-10z"/><circle cx="11.5" cy="52.5" r="2.8" fill="#fff"/></svg>`,
};

module.exports = {
  dino: {
    id: 'dino',
    name: 'Dino Fossil Recovery Mission',
    label: 'Dinosaur',
    ages: '3–6',
    cardHeader: 'Dino Ranger Expedition',
    badge: 'Field Note',
    hunters: 'Junior Rangers',
    treasureWord: 'dinosaur egg',
    icon: ICONS.footprint,
    colors: { paper: '#f6f1e3', ink: '#3b3222', primary: '#4f6b3a', accent: '#c98a2b', soft: '#e3dcc2' },
    fonts: { display: 'Fredoka', displayWeight: 700, displayTransform: 'uppercase' },
    openers: {
      start: ['The volcano is rumbling, there’s no time to wait,', 'Grab your field hats, rangers, let’s not be late!'],
      middle: [
        ['You found an egg, ranger! You’re doing just great,', 'But more eggs are hiding, so don’t hesitate!'],
        ['Stomp like a T-Rex and roar nice and loud,', 'Your Head Paleontologist is terribly proud!'],
        ['A footprint! A fossil! You’re on the right track,', 'Now follow the trail and don’t you look back!'],
        ['The ground gives a rumble, the lava is near,', 'But brave little rangers have nothing to fear!'],
        ['Dig, dig, little rangers, your eyes are so keen,', 'The best fossil hunters this land’s ever seen!'],
        ['Shh! Did you hear that? A dino-sized snore!', 'Tiptoe on by to find one egg more!'],
        ['T-Rex has big teeth and Brachio’s so tall,', 'But YOU are the bravest explorers of all!'],
        ['Those dinosaur eggs are starting to crack,', 'So hurry, brave rangers, and bring them all back!'],
      ],
      last: ['One egg is still missing, the biggest of all,', 'Mama Dino’s treasure! So answer the call!'],
    },
    briefing: {
      title: 'Urgent Field Report',
      from: 'The Head Paleontologist',
      paragraphs: [
        'Attention, {kids}!',
        'This is your Head Paleontologist reporting from base camp. We have an emergency! The old volcano has started to rumble, and the dinosaur eggs from our dig site have been scattered all over this territory.',
        'We need brave, sharp-eyed rangers to track them down before the volcano erupts. I have hidden {count} secret Field Notes along the trail. Each one has a rhyming riddle that tells you where to search next.',
        'Work together, listen carefully, and stomp like a dinosaur when you find each clue. If you follow the trail all the way to the end, you’ll discover Mama Dino’s greatest treasure!',
        'Your first Field Note is attached. Good luck, rangers!',
      ],
      signoff: 'Roaring regards,',
    },
    certificate: {
      title: 'Mission Accomplished',
      subtitle: 'Official Junior Ranger',
      body: 'has bravely recovered every lost dinosaur egg, outrun the rumbling volcano, and earned the title of',
      award: 'Master Fossil Hunter',
      signer: 'Head Paleontologist',
    },
  },

  hero: {
    id: 'hero',
    name: 'Superhero Secret HQ Trial',
    label: 'Superhero',
    ages: '4–8',
    cardHeader: 'Hero Alliance Trial',
    badge: 'Top Secret',
    hunters: 'Rookie Heroes',
    treasureWord: 'secret clue',
    icon: ICONS.bolt,
    colors: { paper: '#ffffff', ink: '#16181d', primary: '#d62828', accent: '#1d3f91', soft: '#ffd60a' },
    fonts: { display: 'Bangers', displayWeight: 400, displayTransform: 'uppercase' },
    halftone: true,
    openers: {
      start: ['Attention, rookies! Your training starts now,', 'Use your super-smart brains and I’ll show you how!'],
      middle: [
        ['Great work, hero! Your powers are strong,', 'Now zoom to the next spot, it won’t take you long!'],
        ['Pow! Zap! Kaboom! You cracked the code,', 'Now use your super-speed, switch to turbo mode!'],
        ['Your hero senses are tingling, I know,', 'So follow this clue, team: ready, set, GO!'],
        ['Super-speed, super-smarts, super-strong too,', 'The Hero Alliance is counting on you!'],
        ['Strike a hero pose and shout out “Hooray!”', 'The next secret clue is not far away!'],
        ['No villain can stop you, you’re clever and brave,', 'Now find the next spot, there’s a city to save!'],
        ['Capes on, heroes! Get ready for flight,', 'Your next mission clue is hiding out of sight!'],
      ],
      last: ['One final mission, then capes for the crew!', 'Your hero reward is waiting for you!'],
    },
    briefing: {
      title: 'Classified Transmission',
      from: 'The Chief of the Hero Alliance',
      paragraphs: [
        'Attention, {kids}!',
        'This is the Chief of the Hero Alliance. This message is TOP SECRET, so listen closely. Every great hero must pass the Secret HQ Trial before they can earn their official hero cape.',
        'I have hidden {count} encrypted clues around this base. Each clue is a rhyming riddle. Crack the code, use your super-speed, and you’ll find the next one.',
        'Remember the hero rules: work as a team, help your friends, and never give up. Only the bravest rookies will make it all the way to the end of the trial!',
        'Your first clue is attached. The Alliance is counting on you!',
      ],
      signoff: 'Stay super,',
    },
    certificate: {
      title: 'Mission Accomplished',
      subtitle: 'Hero Alliance Certificate',
      body: 'has passed the Secret HQ Trial with super-speed, super-smarts, and super-teamwork, and is now an official',
      award: 'Hero Alliance Member',
      signer: 'Chief of the Hero Alliance',
    },
  },

  pirate: {
    id: 'pirate',
    name: 'Pirate Captain’s Lost Ledger',
    label: 'Pirate',
    ages: '3–7',
    cardHeader: 'Captain Barnaby’s Map',
    badge: 'Map Piece',
    hunters: 'Pirate Crew',
    treasureWord: 'map piece',
    icon: ICONS.compass,
    colors: { paper: '#f5e8cc', ink: '#2a2418', primary: '#1f2f4d', accent: '#b8901f', soft: '#e6d3a8' },
    fonts: { display: 'Pirata One', displayWeight: 400, displayTransform: 'none' },
    openers: {
      start: ['Ahoy, little mateys! Now gather around,', 'Captain Barnaby’s treasure is waiting to be found!'],
      middle: [
        ['Yo ho ho, matey, you’re sharp as a hook!', 'The parrot squawks, “Here’s the next place to look!”'],
        ['Shiver me timbers, you found it, me crew!', 'Now hoist up the sails, here’s the next clue for you!'],
        ['The compass is spinning, it’s pointing just so,', 'Follow the riddle, me hearties, let’s go!'],
        ['Walk like a pirate and give a big “ARRR!”', 'The treasure is close now, it can’t be too far!'],
        ['Polly wants a cracker, but YOU want the gold,', 'So read the next riddle, me pirates so bold!'],
        ['X marks the spot, but we’re not there just yet,', 'There’s more map to follow, so don’t you fret!'],
        ['Arrr! You be clever as any old salt,', 'On to the next spot, and don’t come to a halt!'],
      ],
      last: ['Batten the hatches, the end is in sight,', 'Captain Barnaby’s treasure is hidden just right!'],
    },
    briefing: {
      title: 'A Letter from the Captain',
      from: 'Captain Barnaby',
      paragraphs: [
        'Ahoy, {kids}!',
        'Captain Barnaby here, the most famous pirate on the seven seas. I buried my treasure chest somewhere close by, but that silly parrot of mine got into my ledger and scrambled the map into rhymes!',
        'Now there are {count} pieces of the map hidden around this ship. Each piece has a riddle that points to where the next one is hiding.',
        'A good pirate crew sticks together, so take turns, share the clues, and give a big “ARRR!” every time you find one. Follow the map to the very end and the treasure is yours to keep!',
        'Here be the first piece of the map. Fair winds, mateys!',
      ],
      signoff: 'Yer Captain,',
    },
    certificate: {
      title: 'Treasure Found!',
      subtitle: 'Official Pirate Crew Member',
      body: 'has followed Captain Barnaby’s scrambled map, solved every riddle, and found the buried treasure, earning the rank of',
      award: 'First Mate',
      signer: 'Captain Barnaby',
    },
  },

  space: {
    id: 'space',
    name: 'Deep Space Rover Expedition',
    label: 'Outer Space',
    ages: '4–8',
    cardHeader: 'Ground Control Telemetry',
    badge: 'Beacon',
    hunters: 'Astronauts',
    treasureWord: 'radio beacon',
    icon: ICONS.rocket,
    colors: { paper: '#eef4fa', ink: '#0f1a3a', primary: '#14245a', accent: '#f26b1d', soft: '#5fd3e6' },
    fonts: { display: 'Orbitron', displayWeight: 800, displayTransform: 'uppercase' },
    grid: true,
    openers: {
      start: ['Ground Control calling! The signal went dark,', 'Find every beacon to give us a spark!'],
      middle: [
        ['Beep-boop! Beacon found! The signal is clear,', 'Now blast off again, the next one is near!'],
        ['Three, two, one, liftoff! You’re doing so well,', 'Where’s the next beacon? This riddle will tell!'],
        ['Your rocket boots zoom and the radar goes PING,', 'Now follow this clue to the very next thing!'],
        ['Float like an astronaut, slow as can be,', 'Then zoom to the place in this riddle, you’ll see!'],
        ['Mission Control says, “Great job, crew!”', 'The thrusters are warming, here’s your next clue!'],
        ['The stars are all twinkling, the moon gives a wink,', 'Now use your space brain and think, think, think!'],
        ['Houston, no problem! You’re on the right track,', 'Find the next beacon and bring the signal back!'],
      ],
      last: ['One beacon left, then the thrusters will roar,', 'Find the launch pad where rewards are in store!'],
    },
    briefing: {
      title: 'Incoming Transmission',
      from: 'Ground Control',
      paragraphs: [
        'Calling {kids}!',
        'This is Ground Control. We have a problem! Our satellite lost its signal, and the launch thrusters on the space station won’t start without it.',
        'Our engineers have placed {count} radio beacons around the station. Each beacon holds a rhyming riddle that points to the next one. Track them all down to reboot the system.',
        'Remember your astronaut training: stay with your crew, move carefully, and count down out loud every time you find a beacon. Reach the final beacon and the thrusters will fire!',
        'Your first beacon is attached. Ground Control out!',
      ],
      signoff: 'Over and out,',
    },
    certificate: {
      title: 'Mission Accomplished',
      subtitle: 'Deep Space Expedition',
      body: 'has tracked every radio beacon, rebooted the launch thrusters, and saved the space station, earning the rank of',
      award: 'Mission Commander',
      signer: 'Ground Control',
    },
  },

  royal: {
    id: 'royal',
    name: 'Royal Castle Garden Quest',
    label: 'Princess & Knights',
    ages: '3–7',
    cardHeader: 'Royal Castle Quest',
    badge: 'Royal Decree',
    hunters: 'Knights & Princesses',
    treasureWord: 'crown jewel',
    icon: ICONS.crown,
    colors: { paper: '#fdf6f8', ink: '#3a2c40', primary: '#7d5ba6', accent: '#b8901f', soft: '#f3d3dc' },
    fonts: { display: 'Cinzel Decorative', displayWeight: 700, displayTransform: 'none' },
    openers: {
      start: ['Hear ye, hear ye, brave knights of the land!', 'The Crown Jewels are scattered, we need a hand!'],
      middle: [
        ['Huzzah! A jewel! The Queen will be glad,', 'Now on to the next one, the best quest we’ve had!'],
        ['The dragon flew by with a swish of its tail,', 'And dropped a new jewel along the trail!'],
        ['Curtsy or bow, and then off you go,', 'The next shiny jewel is waiting, you know!'],
        ['The castle bells ring, ding-dong, ding-dong,', 'Follow this clue, it won’t take you long!'],
        ['Brave knights and princesses, clever and kind,', 'Another bright jewel is waiting to find!'],
        ['The little dragon giggled and hid it with care,', 'Now think very hard and you’ll find it right there!'],
        ['Your crown is shining, your cape’s flowing free,', 'Now read the next riddle, where will you be?'],
      ],
      last: ['The very last jewel, the Royal Crown Prize,', 'Is waiting to give you a happy surprise!'],
    },
    briefing: {
      title: 'A Royal Proclamation',
      from: 'The King and Queen',
      paragraphs: [
        'Hear ye, hear ye, {kids}!',
        'By order of the King and Queen, a royal quest has begun! Our playful pet dragon, Sparkle, flew through the castle this morning and scattered the Crown Jewels all over the kingdom.',
        'Sparkle left behind {count} royal decrees. Each one has a rhyming riddle that tells you where the next jewel is hiding.',
        'A true knight or princess is brave, kind, and helps their friends. Work together, follow every clue, and restore the Crown Jewels to the royal court!',
        'The first royal decree is attached. Long live the quest!',
      ],
      signoff: 'By royal decree,',
    },
    certificate: {
      title: 'Quest Complete',
      subtitle: 'By Order of the Royal Court',
      body: 'has bravely followed the dragon’s trail, restored every Crown Jewel, and is hereby named',
      award: 'Hero of the Realm',
      signer: 'The King & Queen',
    },
  },

  unicorn: {
    id: 'unicorn',
    name: 'Unicorn Rainbow Quest',
    label: 'Unicorn',
    ages: '3–7',
    cardHeader: 'Rainbow Riders Quest',
    badge: 'Rainbow Gem',
    hunters: 'Rainbow Riders',
    treasureWord: 'rainbow gem',
    icon: ICONS.unicorn,
    colors: { paper: '#fdf7ff', ink: '#3d2a52', primary: '#8e5cc4', accent: '#e8558f', soft: '#c9f0ef' },
    fonts: { display: 'Fredoka', displayWeight: 600, displayTransform: 'none' },
    openers: {
      start: ['Oh no, Rainbow Riders, our rainbow’s gone gray!', 'Find every gem and we’ll color the day!'],
      middle: [
        ['A gem! Hear it jingle! The rainbow can glow,', 'Now gallop along, there are more gems to go!'],
        ['Toss up your mane and give a big neigh,', 'The next shiny gem is not far away!'],
        ['Sprinkle some stardust and twirl all around,', 'Another bright gem is just waiting to be found!'],
        ['Hooray! Some more colors are back in the sky,', 'So clip-clop along, there are more gems nearby!'],
        ['Your horn is a-twinkle, your hooves are so quick,', 'Finding these gems is your magical trick!'],
        ['Clip-clop, clip-clop, you’re doing just great!', 'A rainbow gem’s waiting, so don’t make it wait!'],
        ['Make a wish on a star, give your tail a big swish,', 'The next gem is close, if you wish, wish, wish!'],
        ['Purple and blue are still hiding away,', 'So follow this riddle, hip-hip-hooray!'],
      ],
      last: ['One gem is left, and it’s glowing so bright,', 'Find it, and the rainbow will shine with delight!'],
    },
    briefing: {
      title: 'A Rainbow Message',
      from: 'Stardust the Unicorn',
      paragraphs: [
        'Hello, {kids}!',
        'It’s me, Stardust the Unicorn! This morning I was sliding down the rainbow when I sneezed a great big sparkly sneeze. Whoosh! All of the rainbow’s colors popped off as shiny gems and bounced away in every direction.',
        'Now the rainbow is gray, and the whole sky looks sad. I followed the sparkles and left {count} Rainbow Gem cards along the way. Each one has a rhyming riddle that tells you where to look next.',
        'Rainbow Riders are kind, gentle, and great at taking turns. Work together, give a happy neigh every time you find a card, and follow the trail to the very end, where a magical surprise is waiting!',
        'Your first Rainbow Gem card is attached. Giddy-up, riders!',
      ],
      signoff: 'Sparkles and neighs,',
    },
    certificate: {
      title: 'Rainbow Restored!',
      subtitle: 'Official Rainbow Rider',
      body: 'has followed the sparkly trail, found every rainbow gem, and painted the sky bright again, earning the title of',
      award: 'Rainbow Guardian',
      signer: 'Stardust the Unicorn',
    },
  },

  mermaid: {
    id: 'mermaid',
    name: 'Mermaid Lagoon Treasure',
    label: 'Mermaid',
    ages: '3–7',
    cardHeader: 'Mermaid Lagoon',
    badge: 'Pearl',
    hunters: 'Lagoon Explorers',
    treasureWord: 'sea pearl',
    icon: ICONS.shell,
    colors: { paper: '#eefaf8', ink: '#123a4a', primary: '#11798a', accent: '#e8685b', soft: '#bfe9e4' },
    fonts: { display: 'Comic Neue', displayWeight: 700, displayTransform: 'none' },
    openers: {
      start: ['Splish! Splash! Explorers, come dive in with me,', 'The pearls are all scattered across the blue sea!'],
      middle: [
        ['A pearl! What a beauty! It shines like the moon,', 'Now swim to the next one, we’ll find it real soon!'],
        ['Wiggle your tail and blow bubbles, blub-blub,', 'Then swim to the next spot, you’re in the pearl club!'],
        ['The dolphins are cheering, they leap and they spin,', 'Another pearl’s waiting, so let’s dive back in!'],
        ['Ollie the Octopus giggled with glee,', 'He hid the next pearl where it’s tricky to see!'],
        ['Swish through the seaweed and swirl past a shell,', 'Where’s the next pearl? This riddle will tell!'],
        ['The crabs click their claws and the starfish all wave,', 'You’re the best pearl finders, so clever and brave!'],
        ['Hop on a sea turtle, nice and slow,', 'Then off to the next spot, away we go!'],
        ['The tide’s rolling in with a whoosh and a roar,', 'So hurry, explorers, and find one pearl more!'],
      ],
      last: ['The very last pearl is the shiniest one,', 'Find the Queen’s treasure, and the quest is all done!'],
    },
    briefing: {
      title: 'A Message in a Bottle',
      from: 'Queen Coralie of the Lagoon',
      paragraphs: [
        'Hello from under the sea, {kids}!',
        'This is Queen Coralie, ruler of Mermaid Lagoon. Last night a big, bubbly storm swirled through the lagoon, and my playful friend Ollie the Octopus tried to catch my sea pearls with all eight arms. Oops! He juggled them right out of my treasure chest, and they floated away.',
        'The pearls have washed up all around this place. I sent {count} Pearl cards on the waves to help you. Each one has a rhyming riddle that tells you where to swim next.',
        'Lagoon explorers stick together like a school of fish. Take turns, help your friends, and wiggle your mermaid tails every time you find a card. Follow the trail to the very end and the Mermaid Queen’s treasure is yours!',
        'Your first Pearl card is attached. Happy swimming!',
      ],
      signoff: 'With bubbles and love,',
    },
    certificate: {
      title: 'Pearls Rescued!',
      subtitle: 'Mermaid Lagoon Honor',
      body: 'has swum through the lagoon, found every scattered pearl, and filled the Mermaid Queen’s treasure chest again, earning the title of',
      award: 'Pearl Keeper of the Lagoon',
      signer: 'Queen Coralie',
    },
  },

  construction: {
    id: 'construction',
    name: 'Construction Crew Big Build',
    label: 'Construction',
    ages: '3–7',
    cardHeader: 'Big Build Work Order',
    badge: 'Blueprint',
    hunters: 'Construction Crew',
    treasureWord: 'golden bolt',
    icon: ICONS.hardhat,
    colors: { paper: '#fff8e6', ink: '#2b2b2b', primary: '#33373d', accent: '#f2a900', soft: '#ffd23f' },
    fonts: { display: 'Bangers', displayWeight: 400, displayTransform: 'uppercase' },
    openers: {
      start: ['Hard hats on, crew! The Big Build starts today,', 'But the blueprint is missing, it blew right away!'],
      middle: [
        ['Beep, beep, beep! The truck backs up slow,', 'You found a piece, crew! Now off we go!'],
        ['Scoop like a digger and lift like a crane,', 'Then follow this riddle and search once again!'],
        ['Hammer and nail go bang, bang, bang!', 'Great work today from the whole building gang!'],
        ['The cement mixer’s spinning around and around,', 'Another blueprint piece is waiting to be found!'],
        ['Measure it twice and then build it just right,', 'The next piece is hiding, but not out of sight!'],
        ['Rumble, rumble! The bulldozer’s here,', 'The next blueprint piece is hiding quite near!'],
        ['Stack up the blocks so steady and tall,', 'You are the very best builders of all!'],
      ],
      last: ['One piece is left, then the plan is complete,', 'Find the Big Build site for a well-earned treat!'],
    },
    briefing: {
      title: 'Work Order from the Boss',
      from: 'Foreman Fran',
      paragraphs: [
        'Listen up, {kids}!',
        'This is Foreman Fran, boss of the building site. Today is the day of the Big Build! But this morning a gust of wind whooshed through the site, and our blueprint blew into pieces. Without it, the diggers don’t know where to dig and the cranes don’t know what to lift!',
        'My crew tracked down {count} blueprint pieces and marked each one with a rhyming riddle. Every riddle tells you where the next piece is hiding.',
        'Good builders follow the safety rules: walk, don’t run, work as a team, and shout “Beep beep!” every time you find a piece. Put the whole blueprint back together and the Big Build can begin!',
        'Your first blueprint piece is attached. Hard hats on, crew!',
      ],
      signoff: 'Build it strong,',
    },
    certificate: {
      title: 'Job Well Done!',
      subtitle: 'Official Construction Crew',
      body: 'has found every missing blueprint piece, followed the safety rules, and helped finish the Big Build, earning the rank of',
      award: 'Master Builder',
      signer: 'Foreman Fran',
    },
  },
  vet: {
    id: 'vet',
    name: 'Pet Rescue Vet Quest',
    label: 'Pet Vet',
    ages: '3–7',
    cardHeader: 'Pet Rescue Patrol',
    badge: 'Paw Print',
    hunters: 'Junior Vets',
    treasureWord: 'lost pet',
    icon: ICONS.paw,
    colors: { paper: '#f3fbf7', ink: '#1f3a37', primary: '#2a9d8f', accent: '#ef9d31', soft: '#bfe9d6' },
    fonts: { display: 'Fredoka', displayWeight: 700, displayTransform: 'none' },
    openers: {
      start: ['Oh no, Junior Vets, the clinic gate’s wide!', 'The pets wandered off, so let’s look far and wide!'],
      middle: [
        ['Woof! A paw print! You found a clue,', 'A puppy is waiting somewhere for you!'],
        ['Grab your stethoscope, give a big meow,', 'The next little pet needs a vet right now!'],
        ['Hop like a bunny and wiggle your nose,', 'Another clue’s hiding, so off the vet goes!'],
        ['Tweet, tweet! The birdie is singing so sweet,', 'Follow these paw prints on tippy-toe feet!'],
        ['You’re gentle and kind and you’re quick as can be,', 'The best little vets that the world’s ever seen!'],
        ['A wag and a purr and a squeak and a cheep,', 'More pets are hiding, so take a big peek!'],
        ['Check every corner and listen real near,', 'A tiny pet whisper says, “Help me, I’m here!”'],
        ['Great job, Junior Vets, the pets feel so glad,', 'Let’s find the rest so that no one is sad!'],
      ],
      last: ['One pet is left, and it’s waiting for you,', 'Find it and the whole clinic will cheer, woo-hoo!'],
    },
    briefing: {
      title: 'Clinic Emergency',
      from: 'Dr. Whiskers, Head Vet',
      paragraphs: [
        'Calling all {kids}!',
        'This is Dr. Whiskers at the Pet Rescue Clinic. This morning someone left the clinic gate open, and all of our patients wandered off! The puppies, kittens, bunnies and even the hamster are hiding somewhere nearby.',
        'Every pet left a trail of paw prints, and I have tucked {count} Paw Print cards along the way. Each one has a rhyming riddle that tells you where to search next.',
        'Vets are gentle, kind and great at working together. Use quiet feet, check every corner, and give a happy bark every time you find a card. Follow the trail to the very end, where a big surprise is waiting!',
        'Your first Paw Print card is attached. Grab your stethoscopes, vets!',
      ],
      signoff: 'Wags and purrs,',
    },
    certificate: {
      title: 'Every Pet Is Safe!',
      subtitle: 'Official Junior Vet',
      body: 'has followed every paw print, found every lost pet and brought them safely home, earning the title of',
      award: 'Super Pet Rescuer',
      signer: 'Dr. Whiskers, Head Vet',
    },
  },
  easter: {
    id: 'easter',
    name: 'Golden Egg Easter Hunt',
    label: 'Easter',
    ages: '3–7',
    cardHeader: 'Golden Egg Trail',
    badge: 'Golden Egg',
    hunters: 'Bunny Helpers',
    treasureWord: 'golden egg',
    icon: ICONS.easter,
    colors: { paper: '#fdfbef', ink: '#3a2f5a', primary: '#7a5fb0', accent: '#d39a12', soft: '#cdeedd' },
    fonts: { display: 'Fredoka', displayWeight: 600, displayTransform: 'none' },
    openers: {
      start: ['Oh no, Bunny Helpers, the basket went flop!', 'The golden eggs rolled with a hippity-hop!'],
      middle: [
        ['Hippity-hop! A golden egg clue!', 'Another egg’s hiding and waiting for you!'],
        ['Wiggle your nose and give a big hop,', 'The eggs are still rolling, so don’t you stop!'],
        ['Peep, peep, peep! The little chicks cheer,', 'A shiny gold egg is hiding somewhere near!'],
        ['Fluff up your tail and hop on your toes,', 'Follow the clue wherever it goes!'],
        ['Spotty and stripy and shiny with gold,', 'The next egg is close, or so we are told!'],
        ['The tulips are giggling, the sunshine is bright,', 'Another egg’s tucked somewhere just out of sight!'],
        ['Count all your eggs and give a big cheer,', 'The basket is filling, the next one is near!'],
        ['Hop like a bunny, as quick as can be,', 'Where is the next egg? Let’s hop and see!'],
      ],
      last: ['One egg is left, the most golden of all,', 'Find it and the bunnies will hop down the hall!'],
    },
    briefing: {
      title: 'A Bunny Message',
      from: 'Clover the Bunny',
      paragraphs: [
        'Hello, {kids}!',
        'It’s me, Clover, the Easter Bunny’s littlest helper! This morning I was hopping the basket of golden eggs to the Easter Bunny when I tripped over a carrot. Boing! The basket flipped, and the eggs rolled away in every direction.',
        'The Easter Bunny needs every golden egg back before the big Easter parade. I hopped after them and left {count} Golden Egg cards along the way. Each one has a rhyming riddle that tells you where to look next.',
        'Bunny Helpers are gentle, quick and great at sharing. Work together, give a happy hop every time you find a card, and follow the trail to the very end, where a sweet surprise is waiting!',
        'Your first Golden Egg card is attached. Ready, set, hop!',
      ],
      signoff: 'Hoppy hugs,',
    },
    certificate: {
      title: 'Every Egg Is Found!',
      subtitle: 'Official Bunny Helper',
      body: 'has followed the bunny trail, found every golden egg and filled the Easter basket, earning the title of',
      award: 'Golden Egg Champion',
      signer: 'Clover the Bunny',
    },
    css: `
.card { border-radius:22px 22px 18px 18px; background:
  radial-gradient(circle at 94% 68%, rgba(122,95,176,.10) 0 .3in, transparent .31in),
  radial-gradient(circle at 6% 14%, rgba(211,154,18,.12) 0 .24in, transparent .25in), linear-gradient(180deg, #fff, var(--paper)); }
.card::before, .frame::before { content:''; position:absolute; left:0; right:0; top:0; height:.08in;
  background:linear-gradient(90deg, #c9b6ec, #bfe8d4, #ffe58a, #f7c6d9, #c9b6ec); }
.frame::before { left:.3in; right:.3in; top:.22in; border-radius:99px; }
.card-head { border-bottom:2px dotted var(--primary); }
.card-head .icon { color:var(--accent); }
.card-title { font-size:15pt; }
.badge { background:var(--accent); color:#3a2f5a; border-radius:50% 50% 46% 46% / 60% 60% 40% 40%; }
.frame { border-radius:28px; border-color:var(--primary); outline-color:var(--accent); overflow:hidden;
  background:radial-gradient(circle at 50% 108%, rgba(205,238,221,.9) 0 2.2in, transparent 2.21in), linear-gradient(180deg, #fff, var(--paper)); }
.briefing h1 { font-size:34pt; }
.cert-title { font-size:48pt; }
.award { font-size:30pt; }
.seal { background:var(--primary); outline-color:var(--accent); }`,
  },
  halloween: {
    id: 'halloween',
    name: 'Not-So-Spooky Halloween Hunt',
    label: 'Halloween',
    ages: '3–7',
    cardHeader: 'Halloween Treat Trail',
    badge: 'Boo Note',
    hunters: 'Pumpkin Patrol',
    treasureWord: 'pumpkin',
    icon: ICONS.halloween,
    colors: { paper: '#fff6ea', ink: '#2e1d40', primary: '#5e2f91', accent: '#ec6f12', soft: '#d6ef8f' },
    fonts: { display: 'Fredoka', displayWeight: 700, displayTransform: 'none' },
    openers: {
      start: ['Oh no, Pumpkin Patrol, the treats blew away!', 'Let’s find every one for the big parade day!'],
      middle: [
        ['A treat! You found it! Hip, hip, hooray!', 'The rest of the candy is not far away!'],
        ['Flap like a bat and go swoop through the air,', 'The next little treat could be hiding right there!'],
        ['Wobble like jelly from head down to toes,', 'Another treat’s hiding, so follow your nose!'],
        ['Stir like a wizard with a giggle and grin,', 'The next clue is ready, so let’s jump right in!'],
        ['Tiptoe like kitties on soft, quiet feet,', 'Somewhere nearby is a yummy lost treat!'],
        ['Twirl in your costume, so fancy and bright,', 'A treat is close by, it’s just out of sight!'],
        ['“Hoo-hoo!” says the owl from high in a tree,', '“There’s more treats to find, so come follow me!”'],
        ['Your treat bags are filling, you’re doing just great,', 'Now hurry along, the parade will not wait!'],
      ],
      last: ['One treat is still missing, the sweetest by far,', 'Find it and you’ll be the Halloween star!'],
    },
    briefing: {
      title: 'Halloween Treat Alert',
      from: 'Wispy the Little Ghost',
      paragraphs: [
        'Boo! Hello, {kids}!',
        'It’s me, Wispy, the littlest ghost on Pumpkin Lane. I was practicing my very first “BOO!”, but it came out as a giant “ACHOO!” instead. My sneeze blew the Halloween treats right out of the big pumpkin bucket, and now they’re hiding all over!',
        'The costume parade starts soon, and nobody can march without treats. I floated around and tucked {count} Boo Notes along the way. Each one has a rhyming riddle that tells you where to look next.',
        'Work together, peek in every corner, and give a friendly “Boo!” each time you find a note. Follow the trail all the way to the end, where the biggest treat of all is waiting!',
        'Your first Boo Note is attached. Grab your treat bags, Pumpkin Patrol!',
      ],
      signoff: 'Giggles and boos,',
    },
    certificate: {
      title: 'Halloween Is Saved!',
      subtitle: 'Official Pumpkin Patrol',
      body: 'has followed every Boo Note, found every lost treat and saved the costume parade, earning the title of',
      award: 'Super Treat Finder',
      signer: 'Wispy the Little Ghost',
    },
    css: `
.card { border-radius:18px; background:
  radial-gradient(circle at 94% 72%, rgba(236,111,18,.12) 0 .32in, transparent .33in),
  radial-gradient(circle at 6% 14%, rgba(94,47,145,.10) 0 .26in, transparent .27in), linear-gradient(180deg, #fff, var(--paper)); }
.card-head { border-bottom:2px dashed var(--accent); }
.card-head .icon { color:var(--accent); }
.card-title { font-size:15pt; }
.badge { border-radius:99px; background:var(--primary); }
.card-foot { border-top-color:#e9ddf3; }
.frame { border-radius:24px; outline-color:var(--accent); background:
  radial-gradient(circle at 50% 106%, rgba(214,239,143,.55) 0 1.4in, transparent 1.41in), var(--paper); }
.briefing h1 { font-size:32pt; }
.cert-title { font-size:50pt; }
.award { font-size:30pt; }
.seal { background:var(--accent); outline-color:var(--primary); }`,
  },
  christmas: {
    id: 'christmas',
    name: 'Santa’s Jingle Bell Rescue',
    label: 'Christmas',
    ages: '3–7',
    cardHeader: 'Santa’s Elf Mission',
    badge: 'Jingle Bell',
    hunters: 'Elves-in-Training',
    treasureWord: 'jingle bell',
    icon: ICONS.christmas,
    colors: { paper: '#fdf8ef', ink: '#2b1d17', primary: '#b3202a', accent: '#1f6b45', soft: '#f6dfa0' },
    fonts: { display: 'Fredoka', displayWeight: 700, displayTransform: 'none' },
    openers: {
      start: ['Ho ho, oh no! The sleigh hit a bump,', 'And the jingle bells scattered with one great big THUMP!'],
      middle: [
        ['Jingle, jingle! A bell! You found it, hooray!', 'Now hurry, young elves, the next one’s this way!'],
        ['Stamp like a reindeer and give a big cheer,', 'Santa is smiling, the next bell is near!'],
        ['Wrap it and bow it and tie it up tight,', 'You elves are so speedy, you’re doing it right!'],
        ['Shh! Do you hear it? A jingle-jing-jing!', 'Follow that sound to the next shiny thing!'],
        ['Hot cocoa and cookies are waiting for you,', 'But first find the bell, and the next riddle too!'],
        ['You’re clever and quick and as kind as can be,', 'The best little helpers that Santa could see!'],
        ['Snowflakes are falling all sparkly and white,', 'Another bell’s hiding just out of your sight!'],
        ['Every bell that you find makes the sleigh start to glow,', 'Keep going, young elves, there are more bells to go!'],
      ],
      last: ['One bell is left, the most magical one,', 'Find it and Santa can fly, oh what fun!'],
    },
    briefing: {
      title: 'A Letter from Santa',
      from: 'Santa Claus, North Pole',
      paragraphs: [
        'Ho ho ho, {kids}!',
        'This is Santa Claus writing from the North Pole. Last night my sleigh hit a big bump right over your house, and my magic jingle bells went flying! They tumbled down the chimney and are hiding all around your home.',
        'Without its jingle bells, my sleigh can’t fly on Christmas Eve. So I am making you official Elves-in-Training! I have tucked {count} Jingle Bell cards along the trail. Each one has a rhyming riddle that tells you where to search next.',
        'Elves work together, take turns and use their sharpest eyes. Give a merry “Ho ho ho!” every time you find a card. Follow the trail to the very end, where a special surprise is waiting!',
        'Your first Jingle Bell card is attached. Off you go, little elves!',
      ],
      signoff: 'Merry wishes,',
    },
    certificate: {
      title: 'Christmas Is Saved!',
      subtitle: 'Official Elf-in-Training',
      body: 'has found every magic jingle bell, helped Santa’s sleigh fly again on Christmas Eve, and earned the title of',
      award: 'Santa’s Super Elf',
      signer: 'Santa Claus, North Pole',
    },
    css: `
.card { border-radius:14px; padding-top:.2in; background:
  radial-gradient(circle at 94% 70%, rgba(31,107,69,.09) 0 .32in, transparent .33in),
  radial-gradient(circle at 6% 16%, rgba(179,32,42,.08) 0 .26in, transparent .27in), linear-gradient(180deg, #fff, var(--paper)); }
.card::before, .frame::before { content:''; position:absolute; left:0; right:0; top:0; height:.08in;
  background:repeating-linear-gradient(135deg, var(--primary) 0 .1in, #fff .1in .2in); }
.frame::before { left:.3in; right:.3in; top:.22in; border-radius:99px; }
.card-head { border-bottom:2px dashed var(--accent); }
.card-head .icon { color:var(--accent); }
.card-title { font-size:15pt; }
.badge { border-radius:99px; }
.frame { border-radius:22px; outline-color:var(--accent); overflow:hidden; }
.briefing h1 { font-size:32pt; }
.cert-title { font-size:46pt; }
.award { font-size:30pt; }
.seal { background:var(--accent); }`,
  },
  valentine: {
    id: 'valentine',
    name: 'Valentine Friendship Delivery',
    label: 'Valentine’s',
    ages: '3–7',
    cardHeader: 'Pip’s Valentine Mail',
    badge: 'Love Note',
    hunters: 'Valentine Helpers',
    treasureWord: 'paper heart',
    icon: ICONS.valentine,
    colors: { paper: '#fff5f8', ink: '#3f1a2b', primary: '#c2255c', accent: '#e03131', soft: '#ffd6e2' },
    fonts: { display: 'Fredoka', displayWeight: 700, displayTransform: 'none' },
    openers: {
      start: ['Uh-oh, Valentine Helpers, my mailbag went POP!', 'The love notes flew out and they just wouldn’t stop!'],
      middle: [
        ['A love note, hooray! It’s rosy and red,', 'Now flutter along to the next spot ahead!'],
        ['Give a big hug to the friend next to you,', 'Kindness is magic, and here’s your next clue!'],
        ['Buzz like a love bug and flap your small wings,', 'Then fly to the next note of friendly things!'],
        ['Roses are red and violets are blue,', 'The next little valentine’s waiting for you!'],
        ['Hearts in the hallway and hearts on the chair,', 'Look high and look low, there are hearts everywhere!'],
        ['You share and you care and you help when you can,', 'Pip says you’re the best, and he’s your biggest fan!'],
        ['Smile at a friend and say something sweet,', 'Then tiptoe along on your valentine feet!'],
        ['The mailbag is filling, we’re nearly all done,', 'Delivering kindness is so much fun!'],
      ],
      last: ['One note is left, and it’s the biggest of all,', 'Find it and share it with friends big and small!'],
    },
    briefing: {
      title: 'A Letter from Pip',
      from: 'Pip the Love Bug, Cupid’s Helper',
      paragraphs: [
        'Hello, {kids}!',
        'It’s me, Pip the Love Bug, Cupid’s littlest helper! Every Valentine’s Day I fly around delivering friendship notes, but this morning my mailbag snagged on a rosebush. Pop! The valentines fluttered out and floated all over this place.',
        'I followed the trail of paper hearts and tucked {count} Love Note cards along the way. Each one has a rhyming riddle that tells you where to look next.',
        'Valentine Helpers are kind, gentle and great at sharing. Work together, take turns, and shout “Buzz-buzz, hooray!” every time you find a card. Follow the trail to the very end, where a sweet surprise is waiting!',
        'Your first Love Note card is attached. Happy Valentine’s Day, helpers!',
      ],
      signoff: 'Hugs and buzzes,',
    },
    certificate: {
      title: 'Love Delivered!',
      subtitle: 'Official Valentine Helper',
      body: 'has found every scattered valentine, shared kindness with every friend, and helped Pip deliver the love, earning the title of',
      award: 'Kindness Champion',
      signer: 'Pip the Love Bug',
    },
    css: `
.card { border-radius:18px; background:
  url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath fill='%23c2255c' fill-opacity='0.08' d='M32 58C14 44 4 34 4 21 4 12 11 5 20 5c5 0 9 3 12 7 3-4 7-7 12-7 9 0 16 7 16 16 0 13-10 23-28 37z'/%3E%3C/svg%3E") 3% 72%/.6in .6in no-repeat,
  url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath fill='%23e03131' fill-opacity='0.07' d='M32 58C14 44 4 34 4 21 4 12 11 5 20 5c5 0 9 3 12 7 3-4 7-7 12-7 9 0 16 7 16 16 0 13-10 23-28 37z'/%3E%3C/svg%3E") 9% 34%/.35in .35in no-repeat, linear-gradient(180deg, #fff, var(--paper)); }
.card-head { border-bottom:2px dashed var(--primary); }
.card-head .icon { color:var(--accent); }
.card-title { font-size:15pt; }
.badge { border-radius:99px; background:linear-gradient(90deg, var(--primary), var(--accent)); }
.frame { border-radius:24px; outline:2px dashed var(--accent); outline-offset:-12px;
  background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath fill='%23ffd6e2' fill-opacity='0.7' d='M32 58C14 44 4 34 4 21 4 12 11 5 20 5c5 0 9 3 12 7 3-4 7-7 12-7 9 0 16 7 16 16 0 13-10 23-28 37z'/%3E%3C/svg%3E") 0 100%/.42in .42in repeat-x, linear-gradient(180deg, #fff, var(--paper)); }
.briefing h1 { font-size:34pt; }
.cert-title { font-size:52pt; }
.award { font-size:30pt; }
.seal { background:linear-gradient(135deg, var(--accent), var(--primary)); outline-color:var(--primary); }`,
  },
  fire: {
    id: 'fire',
    name: 'Fire Station Rescue Run',
    label: 'Firefighter',
    ages: '3–7',
    cardHeader: 'Fire Station Dispatch',
    badge: 'Rescue Call',
    hunters: 'Junior Firefighters',
    treasureWord: 'fire truck',
    icon: ICONS.fire,
    colors: { paper: '#fff8ef', ink: '#2b2b2b', primary: '#c62828', accent: '#ffb703', soft: '#ffe08a' },
    fonts: { display: 'Bangers', displayWeight: 400, displayTransform: 'uppercase' },
    openers: {
      start: ['Ding-a-ling! Firefighters, gear up and go,', 'Pepper ran off with the rescue gear, oh no!'],
      middle: [
        ['Wee-oo, wee-oo! The siren rings loud,', 'You found a clue! Pepper would be proud!'],
        ['Slide down the pole and jump in your boots,', 'Then hurry along in your firefighter suits!'],
        ['Climb up the ladder, one rung at a time,', 'A kitten is waiting! Let’s read the next rhyme!'],
        ['Spots on the floor and a wag of a tail,', 'Pepper the pup left a spotty-dog trail!'],
        ['Hold the hose steady and spray it just so,', 'A splash for the garden, and off we all go!'],
        ['Shine up the engine so red and so bright,', 'The next piece of gear is hiding from sight!'],
        ['Firefighters help and they work as a crew,', 'Another clue’s hiding and waiting for you!'],
        ['Pepper is wagging, she thinks it’s a game,', 'Let’s find her next hiding spot, call out her name!'],
      ],
      last: ['One piece is left, then the station is set,', 'Find it, then give Pepper a hug and a pet!'],
    },
    briefing: {
      title: 'Calling All Firefighters',
      from: 'Chief Rosie, Fire Chief',
      paragraphs: [
        'Calling all {kids}!',
        'This is Chief Rosie at the Fire Station. This morning our station dog, Pepper the Dalmatian, decided to play fetch with our rescue gear! She trotted off with the helmets, the boots, the hose nozzle and even the station bell, and hid them all around.',
        'Pepper left a trail of spots, and I have tucked {count} Rescue Call cards along the way. Each one has a rhyming riddle that tells you where to search next.',
        'Firefighters are brave, careful and great at working as a team. Walk, don’t run, help each other, and shout “Ding-a-ling!” every time you find a card. Follow the trail to the very end, where a big surprise is waiting!',
        'Your first Rescue Call card is attached. Boots on, firefighters!',
      ],
      signoff: 'Stay safe and have fun,',
    },
    certificate: {
      title: 'Station Ready!',
      subtitle: 'Official Junior Firefighter',
      body: 'has followed every Rescue Call, found all of Pepper’s hidden gear and got the fire station ready to roll, earning the rank of',
      award: 'Junior Fire Chief',
      signer: 'Chief Rosie, Fire Chief',
    },
    css: `
.card { border:3px solid var(--primary); border-radius:10px; background:linear-gradient(180deg, #fff, var(--paper)); }
.card-head { background:var(--primary); margin:-.13in -.2in .02in; padding:.08in .2in; border-bottom:.06in solid var(--accent); }
.card-head .icon { color:var(--soft); }
.card-title { color:#fff; font-size:17pt; letter-spacing:.04em; }
.badge { background:var(--ink); color:var(--soft); border-radius:4px; font-size:13pt; letter-spacing:.04em; }
.kicker { color:#b3261e; }
.icon.big { color:var(--primary); }
.frame { border:.14in solid var(--primary); outline:3px solid var(--accent); outline-offset:-.26in; border-radius:12px; }
.briefing h1 { font-size:36pt; letter-spacing:.03em; }
.cert-title { font-size:62pt; letter-spacing:.03em; }
.award { font-size:38pt; color:var(--primary); text-shadow:2px 2px 0 var(--accent); letter-spacing:.04em; }
.seal { background:var(--primary); color:#fff; outline-color:var(--primary); }`,
  },
  ice: {
    id: 'ice',
    name: 'Ice Palace Snowflake Quest',
    label: 'Ice Kingdom',
    ages: '3–7',
    cardHeader: 'Ice Palace Quest',
    badge: 'Snowflake',
    hunters: 'Snowflake Seekers',
    treasureWord: 'crystal snowflake',
    icon: ICONS.ice,
    colors: { paper: '#f3f8fd', ink: '#1b2a4a', primary: '#3f6fb5', accent: '#7b68b8', soft: '#d6e6f7' },
    fonts: { display: 'Fredoka', displayWeight: 600, displayTransform: 'none' },
    openers: {
      start: ['Bundle up, Seekers, and come out to play!', 'Pip the Snow Fox swished the snowflakes away!'],
      middle: [
        ['A snowflake! It sparkles and twinkles so bright,', 'Now tiptoe along to the next one in sight!'],
        ['Shiver and shake and go brrr, brrr, brrr!', 'Then follow the tracks of the fox’s white fur!'],
        ['Twirl like a snowflake and float to the ground,', 'Another bright crystal is waiting to be found!'],
        ['Pip the Snow Fox did a flip in the snow,', 'He hid the next snowflake, so off you all go!'],
        ['The icicles tinkle, ting-a-ling-ling,', 'Now follow this clue and see what it brings!'],
        ['Hooray! The Ice Palace is starting to glow,', 'So stomp in your boots, there are more flakes to go!'],
        ['Waddle like penguins, one, two, three,', 'The next shiny snowflake is waiting, you’ll see!'],
        ['Your cheeks are all rosy, your mittens are snug,', 'Find the next snowflake and give it a hug!'],
      ],
      last: ['The very last snowflake shines brightest by far,', 'Find it and bring back the Queen’s Winter Star!'],
    },
    briefing: {
      title: 'A Frosty Message',
      from: 'Queen Glacia of the Ice Palace',
      paragraphs: [
        'Greetings from the Ice Palace, {kids}!',
        'This is Queen Glacia, ruler of the Ice Kingdom. Every winter, my crystal snowflakes hang on the palace towers and fill the whole kingdom with snowy magic. But this morning my playful friend Pip the Snow Fox chased his tail around the towers and swished every snowflake right off with his big fluffy tail!',
        'Now the palace has lost its sparkle. Pip feels terribly sorry, so he followed the snowflakes and left {count} Snowflake cards along the way. Each one has a rhyming riddle that tells you where to look next.',
        'Snowflake Seekers are gentle, kind and great at taking turns. Work together, give a big shiver every time you find a card, and follow the trail to the very end, where a magical winter surprise is waiting!',
        'Your first Snowflake card is attached. Bundle up, Seekers!',
      ],
      signoff: 'With frosty hugs,',
    },
    certificate: {
      title: 'Winter Restored!',
      subtitle: 'Ice Palace Honor',
      body: 'has followed the snowy trail, found every crystal snowflake, and brought winter magic back to the Ice Palace, earning the title of',
      award: 'Snowflake Guardian',
      signer: 'Queen Glacia',
    },
    css: `
.card { border-radius:18px; border-color:var(--primary); background:
  radial-gradient(circle at 94% 68%, rgba(63,111,181,.10) 0 .32in, transparent .33in),
  radial-gradient(circle at 6% 14%, rgba(123,104,184,.10) 0 .26in, transparent .27in), linear-gradient(180deg, #fff 0%, var(--paper) 55%, var(--soft) 160%); }
.card-head { border-bottom:2px dotted var(--primary); }
.card-head .icon { color:var(--accent); }
.card-title { font-size:15pt; }
.badge { background:linear-gradient(90deg, var(--primary), var(--accent)); border-radius:99px; }
.frame { border-radius:26px; border-color:var(--primary); outline-color:var(--accent); overflow:hidden;
  background:radial-gradient(circle at 50% 108%, rgba(214,230,247,.95) 0 2.2in, transparent 2.21in), linear-gradient(180deg, #fff, var(--paper)); }
.briefing h1 { font-size:34pt; }
.cert-title { font-size:50pt; }
.award { font-size:30pt; color:var(--accent); }
.seal { background:linear-gradient(135deg, var(--primary), var(--accent)); outline-color:var(--primary); }`,
  },
  racecar: {
    id: 'racecar',
    name: 'Race Car Grand Prix Chase',
    label: 'Race Car',
    ages: '3–7',
    cardHeader: 'Grand Prix Pit Crew',
    badge: 'Checkpoint',
    hunters: 'Rookie Racers',
    treasureWord: 'checkpoint flag',
    icon: ICONS.racecar,
    colors: { paper: '#fffdf6', ink: '#1b1b1f', primary: '#d7261e', accent: '#1b1b1f', soft: '#ffd23f' },
    fonts: { display: 'Bangers', displayWeight: 400, displayTransform: 'uppercase' },
    openers: {
      start: ['Start your engines, racers, it’s Grand Prix day!', 'But the wind came along and blew the flags away!'],
      middle: [
        ['Vroom, vroom! A flag! You’re zooming so fast,', 'Now shift into high gear, you won’t finish last!'],
        ['Red light, green light, ready, set, GO!', 'The next checkpoint flag is waiting, you know!'],
        ['Pit stop! The crew fills the tank to the top,', 'Then off to the next flag, and don’t you dare stop!'],
        ['Honk, honk! Beep, beep! Make way on the track,', 'Another flag’s waiting, so go bring it back!'],
        ['Grip your steering wheel and lean round the bend,', 'Another flag’s waiting, so race on, my friend!'],
        ['The crowd in the stands gives a cheer and a clap,', 'Now follow this clue for your very next lap!'],
        ['Zoom, zoom! Your tires are spinning around,', 'Another checkpoint flag is waiting to be found!'],
        ['Buckle up tight and check every gear,', 'The next flag is waiting, the finish is near!'],
      ],
      last: ['One lap is left and the finish is in sight,', 'The Golden Trophy is waiting, shining so bright!'],
    },
    briefing: {
      title: 'Live from the Racetrack',
      from: 'Turbo Tess, Race Announcer',
      paragraphs: [
        'Calling all {kids}!',
        'This is Turbo Tess, your Grand Prix race announcer, live from the track! Today is the big race, but this morning a giant gust of wind went whoosh down the racetrack and blew all of our checkpoint flags away. Without them, the racers don’t know which way to drive!',
        'My pit crew tracked down {count} checkpoint flags and tucked a rhyming riddle onto each one. Every riddle tells you where the next flag is waiting.',
        'Good racers drive safely: walk, don’t run, take turns, and give a big “Vroom, vroom!” every time you find a flag. Follow the course all the way to the finish line, where the Golden Trophy is waiting for the winners!',
        'Your first checkpoint flag is attached. Start your engines!',
      ],
      signoff: 'See you at the finish line,',
    },
    certificate: {
      title: 'Checkered Flag!',
      subtitle: 'Official Grand Prix Racer',
      body: 'has found every checkpoint flag, raced safely around the whole course, and crossed the finish line, earning the title of',
      award: 'Grand Prix Champion',
      signer: 'Turbo Tess, Race Announcer',
    },
    css: `
.card { border:.125in solid transparent; border-radius:6px; background:
  linear-gradient(var(--paper), var(--paper)) padding-box,
  repeating-conic-gradient(#1b1b1f 0 25%, #fff 0 50%) 0 0/12px 12px border-box; }
.card-head { border-bottom:2.5px solid var(--primary); }
.card-head .icon { color:var(--primary); }
.card-title { font-size:18pt; color:var(--ink); letter-spacing:.04em; }
.badge { background:var(--primary); color:#fff; border-radius:3px; font-size:13pt; letter-spacing:.04em; transform:skewX(-10deg); }
.card-foot { border-top-color:#f1e3b0; }
.kicker { color:var(--primary); }
.icon.big { color:var(--primary); }
.frame { border:.25in solid transparent; outline:none; border-radius:8px; background:
  linear-gradient(var(--paper), var(--paper)) padding-box,
  repeating-conic-gradient(#1b1b1f 0 25%, #fff 0 50%) 0 0/24px 24px border-box; }
.cert .frame { border-width:.25in; }
.briefing h1 { font-size:38pt; letter-spacing:.03em; }
.cert-title { font-size:68pt; letter-spacing:.03em; }
.award { font-size:38pt; color:var(--primary); text-shadow:2px 2px 0 var(--soft); letter-spacing:.04em; }
.seal { background:var(--primary); color:#fff; outline-color:var(--ink); }`,
  },
  // The shop play kits' hunts: each one's trail ends where the kit's shop opens.
  pizza: {
    id: 'pizza',
    name: 'Pizza Shop Topping Hunt',
    label: 'Pizza Shop',
    ages: '3–7',
    cardHeader: 'Pizza Shop Order Up',
    badge: 'Order Ticket',
    hunters: 'Junior Pizza Chefs',
    treasureWord: 'pizza slice',
    icon: ICONS.pizza,
    colors: { paper: '#fff8ec', ink: '#3a2114', primary: '#d9442f', accent: '#3f9a4a', soft: '#ffd9a8' },
    fonts: { display: 'Fredoka', displayWeight: 700, displayTransform: 'uppercase' },
    openers: {
      start: ['The oven is hot and the dough’s ready to go,', 'But Mozzie the Mouse took the toppings! Oh no!'],
      middle: [
        ['Squeak, squeak! Was that Mozzie the Mouse?', 'He hid one more topping somewhere in the house!'],
        ['Knead it and roll it and spin it up high,', 'The next order ticket is close by, oh my!'],
        ['Pepperoni, peppers and olives so round,', 'Another lost topping is waiting to be found!'],
        ['Ding! goes the oven, the timer is done,', 'Hunting for toppings is so much fun!'],
        ['Sauce in a swirl and cheese in a pile,', 'Keep up the good work, you chefs have such style!'],
        ['A slice for you and a slice for me,', 'The next clue is waiting, so go and see!'],
        ['Mozzie left crumbs in a long, twisty line,', 'Follow this riddle, you’re doing just fine!'],
        ['You found a topping, now give a big cheer,', 'The very next ticket is hiding quite near!'],
      ],
      last: ['Just one topping left, then the pizza’s complete,', 'Find the last ticket for a hot, cheesy treat!'],
    },
    briefing: {
      title: 'Order Up!',
      from: 'Chef Sal, Head Pizza Chef',
      paragraphs: [
        'Calling all {kids}!',
        'This is Chef Sal at the Pizza Shop. Today we have a very special order: the biggest, cheesiest pizza in town! But while I was stretching the dough, Mozzie the Mouse scurried in and carried off all of our toppings. The pepperoni, the mushrooms, the peppers and even the cheese are hiding somewhere nearby!',
        'Mozzie left a trail of crumbs, and I have tucked {count} Order Tickets along the way. Each one has a rhyming riddle that tells you where to search next.',
        'Good chefs work as a team, keep their hands clean and never run in the kitchen. Walk, don’t run, take turns, and shout “Order up!” every time you find a ticket. Follow the trail to the very end, where a hot, cheesy surprise is waiting!',
        'Your first Order Ticket is attached. Aprons on, chefs!',
      ],
      signoff: 'Extra cheese and big smiles,',
    },
    certificate: {
      title: 'Pizza Perfect!',
      subtitle: 'Official Junior Pizza Chef',
      body: 'has found every topping Mozzie the Mouse carried off, followed every Order Ticket and made the cheesiest pizza in town, earning the title of',
      award: 'Master Pizza Chef',
      signer: 'Chef Sal, Head Pizza Chef',
    },
    css: `
.card { border:.11in solid transparent; border-radius:8px; background:
  linear-gradient(var(--paper), var(--paper)) padding-box,
  repeating-conic-gradient(#d9442f 0 25%, #fff 0 50%) 0 0/14px 14px border-box; }
.card-head { border-bottom:2.5px dashed var(--primary); }
.card-head .icon { color:var(--primary); }
.card-title { font-size:16pt; }
.badge { background:var(--accent); border-radius:4px; transform:rotate(-2deg); }
.kicker { color:var(--accent); }
.frame { border:.22in solid transparent; outline:none; border-radius:10px; background:
  linear-gradient(var(--paper), var(--paper)) padding-box,
  repeating-conic-gradient(#d9442f 0 25%, #fff 0 50%) 0 0/26px 26px border-box; }
.briefing h1 { font-size:36pt; }
.cert-title { font-size:56pt; }
.award { font-size:32pt; color:var(--primary); }
.seal { background:var(--primary); outline-color:var(--accent); }`,
  },
  burger: {
    id: 'burger',
    name: 'Burger Shack Secret Sauce Hunt',
    label: 'Burger Shop',
    ages: '3–7',
    cardHeader: 'Burger Shack Grill Crew',
    badge: 'Recipe Card',
    hunters: 'Grill Crew',
    treasureWord: 'french fry',
    icon: ICONS.burger,
    colors: { paper: '#fff8e6', ink: '#3a2410', primary: '#e2782a', accent: '#d93a2f', soft: '#ffe08a' },
    fonts: { display: 'Bangers', displayWeight: 400, displayTransform: 'uppercase' },
    openers: {
      start: ['The grill’s sizzling hot and the buns are just right,', 'But Gus took the Secret Sauce and flew out of sight!'],
      middle: [
        ['Sizzle and flip and then sizzle some more,', 'The next recipe card is close, that’s for sure!'],
        ['Bun on the bottom and cheese on the top,', 'Keep hunting, Grill Crew, and don’t you stop!'],
        ['Squawk! goes Gus from up high in the sky,', 'He dropped one more card as he went flying by!'],
        ['Pickles and lettuce and tomatoes so red,', 'Another card’s waiting, so hurry ahead!'],
        ['Ketchup and mustard, a squirt and a squeeze,', 'Go find the next card as quick as you please!'],
        ['Stack it up tall like a big burger tower,', 'You’re finding these clues with real burger power!'],
        ['Ding, ding! An order! The bell gives a ring,', 'You found it, Grill Crew! You can do anything!'],
        ['Crispy fries crunching, munch, munch, munch,', 'You’re the best crew to make burgers for lunch!'],
      ],
      last: ['Just one card left and the sauce will be done,', 'Find the last spot for the burger-iest fun!'],
    },
    briefing: {
      title: 'Grill Crew Alert',
      from: 'Cook Patty, Grill Boss',
      paragraphs: [
        'Calling all {kids}!',
        'This is Cook Patty at the Burger Shack. Today we are making the most famous burgers in town, with our Secret Sauce on top. But this morning Gus the Seagull swooped through the window, grabbed the Secret Sauce recipe cards and flew off, dropping them all around!',
        'I followed Gus and tucked {count} Recipe Cards along his flight path. Each one has a rhyming riddle that tells you where to search next.',
        'Great grill crews work together, wait their turn and keep the kitchen safe. Walk, don’t run, help each other, and shout “Order up!” every time you find a card. Collect every card and the Secret Sauce can be made again!',
        'Your first Recipe Card is attached. Spatulas ready, crew!',
      ],
      signoff: 'Stay saucy,',
    },
    certificate: {
      title: 'Order Up!',
      subtitle: 'Official Burger Shack Grill Crew',
      body: 'has found every Secret Sauce recipe card Gus the Seagull dropped, followed the trail all the way and saved the Burger Shack’s famous burgers, earning the title of',
      award: 'Burger Boss',
      signer: 'Cook Patty, Grill Boss',
    },
    css: `
.card { border:3px solid var(--ink); border-radius:12px; padding-top:.3in; background:linear-gradient(180deg, #fff, var(--paper)); }
.card::before { content:''; position:absolute; left:0; right:0; top:0; height:.16in; border-bottom:2px solid var(--ink);
  background:repeating-linear-gradient(90deg, var(--accent) 0 .3in, #fff .3in .6in); }
.card-head { border-bottom:3px solid var(--soft); }
.card-head .icon { color:var(--primary); }
.card-title { font-size:18pt; color:var(--accent); letter-spacing:.04em; }
.badge { background:var(--soft); color:var(--ink); border:2px solid var(--ink); border-radius:6px; font-size:13pt; letter-spacing:.04em; }
.kicker { color:var(--accent); }
.frame { border:3px solid var(--ink); outline:none; border-radius:16px; padding-top:.7in; overflow:hidden; background:linear-gradient(180deg, #fff, var(--paper)); }
.frame::before { content:''; position:absolute; left:0; right:0; top:0; height:.34in; border-bottom:3px solid var(--ink);
  background:repeating-linear-gradient(90deg, var(--accent) 0 .55in, #fff .55in 1.1in); }
.briefing h1 { font-size:40pt; letter-spacing:.03em; color:var(--accent); }
.cert-title { font-size:66pt; letter-spacing:.03em; color:var(--accent); }
.award { font-size:38pt; color:var(--primary); text-shadow:2px 2px 0 var(--ink); letter-spacing:.04em; }
.seal { background:var(--accent); outline-color:var(--ink); }`,
  },
  grocery: {
    id: 'grocery',
    name: 'Grocery Store Shopping List Hunt',
    label: 'Grocery Store',
    ages: '3–7',
    cardHeader: 'Super Shopper List',
    badge: 'List Item',
    hunters: 'Super Shoppers',
    treasureWord: 'apple',
    icon: ICONS.cart,
    colors: { paper: '#f6fcf2', ink: '#1f3a22', primary: '#3a9d4f', accent: '#f2a03d', soft: '#cdeec0' },
    fonts: { display: 'Fredoka', displayWeight: 700, displayTransform: 'none' },
    openers: {
      start: ['Grab a cart, shoppers, the store’s open today,', 'But Zippy the Cart scattered our list on the way!'],
      middle: [
        ['Apples and bananas and carrots that crunch,', 'Find the next item for our party lunch!'],
        ['Beep! goes the scanner, the price is just right,', 'The next list item is hiding in sight!'],
        ['Wheel your cart slowly and look left and right,', 'You’re the best shoppers, so clever and bright!'],
        ['Milk in the fridge and bread on the shelf,', 'Zippy the Cart has been rolling himself!'],
        ['Squeak, squeak! go the wheels as they roll down the aisle,', 'You found an item! Now give a big smile!'],
        ['Coupons and stickers and price tags so neat,', 'You’re shopping so well, you just can’t be beat!'],
        ['Clean-up on aisle three! Oh, what a mess!', 'Zippy was here! Where’s the next clue? Let’s guess!'],
        ['Into the basket, one, two and three,', 'The next list item is waiting, let’s see!'],
      ],
      last: ['One item is left on the Big Party List,', 'Find it, and nothing at all will be missed!'],
    },
    briefing: {
      title: 'Store Announcement',
      from: 'Manager Mo, Store Manager',
      paragraphs: [
        'Attention, {kids}!',
        'This is Manager Mo at the Grocery Store. Today we are shopping for the biggest party of the year! But this morning Zippy, our runaway shopping cart, went zooming down every aisle all by itself, and the Big Party Shopping List flew out in pieces!',
        'Zippy left a trail of squeaky wheel marks, and I have tucked {count} List Items along the way. Each one has a rhyming riddle that tells you where to search next.',
        'Super shoppers are careful, kind and great at working as a team. Walk, don’t run, push your carts slowly, and say “Beep!” like a checkout scanner every time you find an item. Find every piece of the list, and a party surprise is waiting at the end!',
        'Your first List Item is attached. Happy shopping!',
      ],
      signoff: 'See you at the checkout,',
    },
    certificate: {
      title: 'List Complete!',
      subtitle: 'Official Super Shopper',
      body: 'has found every piece of the Big Party Shopping List, shopped every aisle with care and filled the cart for the party, earning the title of',
      award: 'Shopper of the Year',
      signer: 'Manager Mo, Store Manager',
    },
    css: `
.card { border-radius:14px; background:linear-gradient(180deg, #fff, var(--paper)); }
.card-head { border-bottom:2px dashed var(--primary); }
.card-head .icon { color:var(--primary); }
.card-title { font-size:15pt; }
.badge { position:relative; background:var(--accent); color:#3a2405; border-radius:4px 14px 14px 4px; padding-left:.22in; }
.badge::before { content:''; position:absolute; left:.08in; top:50%; width:.07in; height:.07in; margin-top:-.035in; border-radius:50%; background:#fff; }
.card-foot { border-top:1.5px dashed var(--soft); }
.frame { border-radius:20px; outline:2px dashed var(--accent); outline-offset:-12px; }
.briefing h1 { font-size:32pt; }
.award { color:var(--primary); }
.seal { background:var(--primary); outline-color:var(--accent); }`,
  },
  post: {
    id: 'post',
    name: 'Post Office Special Delivery',
    label: 'Post Office',
    ages: '3–7',
    cardHeader: 'Special Delivery',
    badge: 'Stamp',
    hunters: 'Junior Mail Carriers',
    treasureWord: 'letter',
    icon: ICONS.envelope,
    colors: { paper: '#f6f9ff', ink: '#1b2b4d', primary: '#2f5fb3', accent: '#e8513a', soft: '#cfe0ff' },
    fonts: { display: 'Fredoka', displayWeight: 700, displayTransform: 'uppercase' },
    openers: {
      start: ['Bags on your shoulders, it’s mail day today!', 'But Bertha went “ACHOO!” and the letters flew away!'],
      middle: [
        ['Stamp it and sort it and send it with care,', 'The next special letter is hiding somewhere!'],
        ['Knock, knock! Who’s there? It’s the mail on its way!', 'You’re the best mail carriers working today!'],
        ['ACHOO! went Bertha, oh what a big sneeze!', 'The letters went flying like leaves in the breeze!'],
        ['Through rain and through snow, the mail gets there fast,', 'You found one more letter, you’re having a blast!'],
        ['Big boxes, small parcels and postcards to send,', 'The next one is waiting just around the bend!'],
        ['Ring-a-ding-ding goes the post office bell,', 'You’re sorting the mail so incredibly well!'],
        ['A letter for Grandma, a card for a friend,', 'Keep up the good work right up to the end!'],
        ['Sort by the colors and sort by the size,', 'The next special letter will be a surprise!'],
      ],
      last: ['One letter is left, with a big golden seal,', 'Find it and see what the end will reveal!'],
    },
    briefing: {
      title: 'Special Delivery Alert',
      from: 'Postmaster Polly',
      paragraphs: [
        'Calling all {kids}!',
        'This is Postmaster Polly at the Post Office. Today we have a very important Special Delivery to make! But this morning Bertha, our big sorting machine, gave the most enormous sneeze. ACHOO! All of the special letters flew out of their mailbags and landed all over the place.',
        'I gathered up {count} Special Delivery cards and stamped a rhyming riddle on each one. Every riddle tells you where to look for the next letter.',
        'Mail carriers are careful, friendly and always on time. Walk, don’t run, take turns, and shout “Special delivery!” every time you find a card. Follow the trail to the very end, where a surprise package is waiting just for you!',
        'Your first Special Delivery card is attached. Mailbags on, carriers!',
      ],
      signoff: 'Signed, sealed and delivered,',
    },
    certificate: {
      title: 'Delivered!',
      subtitle: 'Official Junior Mail Carrier',
      body: 'has found every letter Bertha sneezed away, followed every Special Delivery card and brought the mail home on time, earning the title of',
      award: 'Star Mail Carrier',
      signer: 'Postmaster Polly',
    },
    css: `
.card { border:.09in solid transparent; border-radius:4px; background:
  linear-gradient(var(--paper), var(--paper)) padding-box,
  repeating-linear-gradient(-45deg, #e8513a 0 10px, #fff 10px 18px, #2f5fb3 18px 28px, #fff 28px 36px) border-box; }
.card-head .icon { color:var(--primary); }
.card-title { font-size:16pt; letter-spacing:.03em; }
.badge { background:var(--accent); border-radius:0; outline:2px dashed #fff; outline-offset:-4px; padding:.05in .16in; }
.kicker { color:var(--accent); }
.frame { border:.17in solid transparent; outline:none; border-radius:6px; background:
  linear-gradient(var(--paper), var(--paper)) padding-box,
  repeating-linear-gradient(-45deg, #e8513a 0 16px, #fff 16px 28px, #2f5fb3 28px 44px, #fff 44px 56px) border-box; }
.briefing h1 { font-size:34pt; }
.cert-title { font-size:60pt; }
.award { font-size:30pt; color:var(--accent); }
.seal { background:var(--primary); outline-color:var(--accent); }`,
  },
  library: {
    id: 'library',
    name: 'Library Lost Pages Mystery',
    label: 'Library',
    ages: '3–7',
    cardHeader: 'Book Detective Case',
    badge: 'Lost Page',
    hunters: 'Book Detectives',
    treasureWord: 'bookmark',
    icon: ICONS.book,
    colors: { paper: '#fbf9ff', ink: '#2b1d4d', primary: '#6a4fb3', accent: '#f2a93b', soft: '#e3d8ff' },
    fonts: { display: 'Fredoka', displayWeight: 600, displayTransform: 'none' },
    openers: {
      start: ['Shh! Book Detectives, come quick, take a look,', 'The pages flew out of our Big Storybook!'],
      middle: [
        ['Hoo-hoo! says Hoot from the top of the stack,', 'You found a lost page! Let’s put the book back!'],
        ['Turn the page slowly and read every word,', 'The next clue is hiding, or so I have heard!'],
        ['Once upon a time, in a land far away,', 'Some Book Detectives found pages today!'],
        ['Fairy tales, dragons and fish in the sea,', 'The next page is waiting, so where could it be?'],
        ['A page! What a story! Now don’t make a peep,', 'Tiptoe so quietly, the books are asleep!'],
        ['Tick-tock goes the clock, it’s nearly story time,', 'Let’s find the next page with this little rhyme!'],
        ['Big books, small books, books old and new,', 'The next missing page is waiting for you!'],
        ['Put on your thinking cap, look high and low,', 'One more lost page, and then off we go!'],
      ],
      last: ['The very last page is the one that says “The End,”', 'Find it and finish the story, my friend!'],
    },
    briefing: {
      title: 'A Library Mystery',
      from: 'Librarian Lou',
      paragraphs: [
        'Psst, {kids}!',
        'This is Librarian Lou at the Library. Today was supposed to be the biggest Story Time of the year! But just as I opened the Big Storybook, Hoot the library owl stretched his wings and gave a giant flap. WHOOSH! The pages flew out of the book and fluttered all around.',
        'Hoot feels terrible, so he helped me tuck {count} Lost Page cards along the way. Each one has a rhyming riddle that tells you where to search next.',
        'Book detectives are clever, careful and very good listeners. Use quiet feet, look closely, and whisper “Hoo-hoo!” every time you find a page. Put the whole story back together, and a happily-ever-after surprise is waiting at the end!',
        'Your first Lost Page is attached. Happy hunting, detectives!',
      ],
      signoff: 'Your friend in the stacks,',
    },
    certificate: {
      title: 'The End!',
      subtitle: 'Official Book Detective',
      body: 'has found every page Hoot the Owl flapped away, solved the Library Mystery and put the Big Storybook back together, earning the title of',
      award: 'Master Book Detective',
      signer: 'Librarian Lou',
    },
    css: `
.card { border-radius:6px 14px 14px 6px; border-left:.16in solid var(--primary); background:
  repeating-linear-gradient(180deg, transparent 0 .31in, rgba(106,79,179,.09) .31in .325in),
  linear-gradient(90deg, rgba(43,29,77,.06), transparent .3in), #fff; }
.card-head .icon { color:var(--accent); }
.card-title { font-size:15pt; }
.badge { background:var(--accent); color:#2b1d06; border-radius:0; padding-right:.2in; clip-path:polygon(0 0, 100% 0, 88% 50%, 100% 100%, 0 100%); }
.frame { border-radius:8px; border-left-width:.3in; outline-color:var(--accent); }
.briefing h1 { font-size:34pt; }
.award { color:var(--primary); }
.seal { background:var(--primary); outline-color:var(--accent); }`,
  },
  police: {
    id: 'police',
    name: 'Police Station Missing Teddy Case',
    label: 'Police Station',
    ages: '3–7',
    cardHeader: 'Junior Officer Case',
    badge: 'Evidence',
    hunters: 'Junior Officers',
    treasureWord: 'police badge',
    icon: ICONS.shield,
    colors: { paper: '#f5f8fe', ink: '#16244a', primary: '#2c4f9e', accent: '#f2c230', soft: '#cfdcf7' },
    fonts: { display: 'Fredoka', displayWeight: 700, displayTransform: 'uppercase' },
    openers: {
      start: ['Calling all officers, we’ve got a big case,', 'Buttons the Teddy is lost! Search the place!'],
      middle: [
        ['Wee-oo, wee-oo! You found the next clue,', 'Officers, Buttons is counting on you!'],
        ['Grab your magnifier, look high and low,', 'Follow the buttons wherever they go!'],
        ['A shiny round button, right here on the floor!', 'Buttons came this way, of that I am sure!'],
        ['Officers help and officers care,', 'Buttons is hiding, but where, oh where?'],
        ['Put on your hat and stand straight and tall,', 'You are the bravest officers of all!'],
        ['Stop, look and listen, then go with care,', 'The next little clue is waiting right there!'],
        ['Beep-beep! goes the radio, “Over and out!”', 'The next clue is near, there isn’t a doubt!'],
        ['Ten-four, officers, the case is going great,', 'Buttons is close now, so don’t be late!'],
      ],
      last: ['The very last clue will crack the case wide,', 'Go find out where Buttons decided to hide!'],
    },
    briefing: {
      title: 'Missing Teddy Report',
      from: 'Sergeant Sunny',
      paragraphs: [
        'Attention, {kids}!',
        'This is Sergeant Sunny at the Police Station. We have a brand new case, and it’s a big one! Buttons the Teddy, our station’s cuddliest helper, was sitting at the front desk this morning. Now he’s gone! All he left behind is a trail of his shiny buttons.',
        'My officers followed the trail and tucked {count} Evidence cards along the way. Each one has a rhyming riddle that tells you where to look next.',
        'Good officers are helpful, kind and great at working as a team. Walk, don’t run, look closely with your detective eyes, and say “Ten-four!” every time you find a card. Follow the evidence to the very end to find out where Buttons went!',
        'Your first Evidence card is attached. Good luck, officers!',
      ],
      signoff: 'Over and out,',
    },
    certificate: {
      title: 'Case Closed!',
      subtitle: 'Official Junior Police Officer',
      body: 'has followed every clue, found Buttons the Teddy and solved the Case of the Missing Teddy, earning the rank of',
      award: 'Super Detective',
      signer: 'Sergeant Sunny',
    },
    css: `
.card { border:3px solid var(--primary); border-radius:8px; padding-top:.26in; background:linear-gradient(180deg, #fff, var(--paper)); }
.card::before { content:''; position:absolute; left:0; right:0; top:0; height:.14in;
  background:repeating-conic-gradient(var(--primary) 0 25%, #fff 0 50%) 0 0/.14in .14in; }
.card-head { border-bottom:2px solid var(--primary); }
.card-title { font-size:15pt; letter-spacing:.03em; }
.badge { background:var(--primary); color:var(--accent); border:2px solid var(--accent); border-radius:4px; }
.kicker { color:var(--primary); }
.frame { border:4px solid var(--primary); outline:none; border-radius:10px; padding-top:.75in; overflow:hidden; }
.frame::before { content:''; position:absolute; left:0; right:0; top:0; height:.3in;
  background:repeating-conic-gradient(var(--primary) 0 25%, #fff 0 50%) 0 0/.3in .3in; }
.briefing h1 { font-size:32pt; }
.cert-title { font-size:54pt; }
.award { font-size:32pt; color:var(--primary); }
.seal { background:var(--primary); color:var(--accent); outline-color:var(--accent); }`,
  },
  dentist: {
    id: 'dentist',
    name: 'Dentist Office Sparkle Smile Quest',
    label: 'Dentist',
    ages: '3–6',
    cardHeader: 'Sparkle Smile Quest',
    badge: 'Sparkle Card',
    hunters: 'Smile Squad',
    treasureWord: 'toothbrush',
    icon: ICONS.tooth,
    colors: { paper: '#f2fbfd', ink: '#123c46', primary: '#2a9fb4', accent: '#f48aa8', soft: '#c7eef3' },
    fonts: { display: 'Fredoka', displayWeight: 600, displayTransform: 'none' },
    openers: {
      start: ['Smile Squad, hurry, there’s trouble today,', 'The Sugar Bugs carried the toothbrushes away!'],
      middle: [
        ['Brush up and down and then round and round,', 'Another lost toothbrush is waiting to be found!'],
        ['Swish, swish, swish, then spit in the sink,', 'The next clue is closer than you might think!'],
        ['Show me your smile, it’s sparkly and bright,', 'You’re chasing those Sugar Bugs out of sight!'],
        ['Count all your teeth, one, two, three, four,', 'A toothbrush is hiding, let’s look for one more!'],
        ['Crunchy red apples and carrots so sweet,', 'Healthy teeth love them, now that is a treat!'],
        ['Brush in the morning and brush before bed,', 'Then follow this riddle to find what’s ahead!'],
        ['Wiggle a tooth, wiggle it free,', 'The Tooth Fairy’s watching and smiling with glee!'],
        ['Sugar Bugs giggle and run off to hide,', 'But nothing can stop the Smile Squad’s stride!'],
      ],
      last: ['One brush is left, the sparkliest one,', 'Find it, and all of the Sugar Bugs run!'],
    },
    briefing: {
      title: 'Smile Emergency',
      from: 'Dr. Molar, Head Dentist',
      paragraphs: [
        'Calling all {kids}!',
        'This is Dr. Molar at the Dentist Office. Today is Big Smile Day, when everybody gets a sparkly clean smile! But last night the sneaky Sugar Bugs crept into the office and carried off all of our Sparkle Toothbrushes. Without them, nobody’s teeth will shine!',
        'The Sugar Bugs left a trail of sticky footprints, and I have tucked {count} Sparkle Cards along the way. Each one has a rhyming riddle that tells you where to search next.',
        'The Smile Squad is gentle, helpful and great at working together. Walk, don’t run, take turns, and flash your biggest smile every time you find a card. Follow the trail to the very end, where a sparkly surprise is waiting!',
        'Your first Sparkle Card is attached. Brushes up, Smile Squad!',
      ],
      signoff: 'Keep smiling,',
    },
    certificate: {
      title: 'Sparkling Smiles!',
      subtitle: 'Official Smile Squad Member',
      body: 'has found every Sparkle Toothbrush, chased away the sneaky Sugar Bugs and made every smile shine, earning the title of',
      award: 'Super Smile Hero',
      signer: 'Dr. Molar, Head Dentist',
    },
    css: `
.card { border-radius:22px; background:
  radial-gradient(circle at 92% 24%, rgba(42,159,180,.14) 0 9px, transparent 10px),
  radial-gradient(circle at 96% 36%, rgba(42,159,180,.12) 0 5px, transparent 6px),
  radial-gradient(circle at 6% 78%, rgba(244,138,168,.16) 0 8px, transparent 9px),
  radial-gradient(circle at 10% 88%, rgba(244,138,168,.14) 0 4px, transparent 5px), linear-gradient(180deg, #fff, var(--paper)); }
.card-head { border-bottom:2px dotted var(--primary); }
.card-head .icon { color:var(--primary); }
.card-title { font-size:15pt; }
.badge { background:var(--accent); color:#4a1325; border-radius:99px; }
.frame { border-radius:30px; outline:2px dotted var(--accent); outline-offset:-12px; }
.briefing h1 { font-size:34pt; }
.cert-title { font-size:50pt; }
.award { color:#e0607f; }
.seal { background:var(--primary); outline-color:var(--accent); }`,
  },
  petshop: {
    id: 'petshop',
    name: 'Pet Shop Adoption Day Hunt',
    label: 'Pet Shop',
    ages: '3–7',
    cardHeader: 'Adoption Day Hunt',
    badge: 'Name Tag',
    hunters: 'Pet Pals',
    treasureWord: 'dog bone',
    icon: ICONS.tag,
    colors: { paper: '#faf6ff', ink: '#2d1a45', primary: '#8a56c2', accent: '#f5b335', soft: '#e5d4f7' },
    fonts: { display: 'Fredoka', displayWeight: 700, displayTransform: 'none' },
    openers: {
      start: ['It’s Adoption Day, Pet Pals, hip, hip, hooray!', 'But Noodle the Kitten batted the name tags away!'],
      middle: [
        ['“Meow,” says Noodle, “I’m sorry, it’s true,', 'I hid the next name tag, I’ll give you a clue!”'],
        ['Puppies need cuddles and kittens need play,', 'Find the next tag and they’ll go home today!'],
        ['Hop like a bunny and flap like a bird,', 'You found a name tag! The best news I’ve heard!'],
        ['Fishy goes swish in a bowl full of blue,', 'Another name tag is waiting for you!'],
        ['Bark like a puppy and purr like a cat,', 'Then find the next tag, just like that!'],
        ['Squeak! goes the hamster, he spins on his wheel,', 'Pet Pals, you’re helping, and that’s a big deal!'],
        ['Every pet needs a name and a home,', 'Follow this riddle wherever you roam!'],
        ['Gentle hands, happy hearts, you’re doing it right,', 'Keep hunting for tags, the end is in sight!'],
      ],
      last: ['One tag is left for the very last pet,', 'Find it, the happiest Adoption Day yet!'],
    },
    briefing: {
      title: 'Adoption Day News',
      from: 'Miss Biscuit, Pet Shop Owner',
      paragraphs: [
        'Calling all {kids}!',
        'This is Miss Biscuit at the Pet Shop. Today is Adoption Day, when our puppies, kittens, bunnies and fish find their forever homes! But this morning Noodle the Kitten got very playful. She batted every single name tag off the pet beds, and they skidded and slid all over the place.',
        'Without their name tags, the pets can’t go home! Noodle feels a little bit sorry, so she helped me tuck {count} Name Tag cards along the way. Each one has a rhyming riddle that tells you where to search next.',
        'Pet Pals are gentle, kind and great at working together. Walk, don’t run, use soft voices so you don’t scare the pets, and give a happy “Meow!” every time you find a card. Follow the trail to the very end, where a furry surprise is waiting!',
        'Your first Name Tag card is attached. Let’s go, Pet Pals!',
      ],
      signoff: 'Purrs and tail wags,',
    },
    certificate: {
      title: 'Happy Adoption Day!',
      subtitle: 'Official Pet Pal',
      body: 'has found every name tag Noodle the Kitten batted away and helped every pet find a forever home, earning the title of',
      award: 'Pet Shop Superstar',
      signer: 'Miss Biscuit, Pet Shop Owner',
    },
    css: `
.card { border-radius:18px; background:
  radial-gradient(circle at 6% 84%, rgba(245,179,53,.16) 0 .28in, transparent .29in),
  radial-gradient(circle at 5% 12%, rgba(138,86,194,.09) 0 .24in, transparent .25in), linear-gradient(180deg, #fff, var(--paper)); }
.card-head { border-bottom:2px dashed var(--accent); }
.card-head .icon { color:var(--accent); }
.card-title { font-size:16pt; }
.badge { position:relative; background:var(--accent); color:#3a2405; border-radius:99px 6px 6px 99px; padding-left:.22in; }
.badge::before { content:''; position:absolute; left:.08in; top:50%; width:.08in; height:.08in; margin-top:-.04in; border-radius:50%; background:#fff; }
.frame { border-radius:26px; border-width:4px; outline:2px dashed var(--accent); outline-offset:-12px; }
.briefing h1 { font-size:34pt; }
.cert-title { font-size:44pt; }
.award { color:var(--primary); }
.seal { background:var(--primary); outline-color:var(--accent); }`,
  },
  coffee: {
    id: 'coffee',
    name: 'Café Magic Cocoa Bean Hunt',
    label: 'Coffee Shop',
    ages: '3–7',
    cardHeader: 'Café Cocoa Quest',
    badge: 'Cocoa Bean',
    hunters: 'Junior Baristas',
    treasureWord: 'cookie',
    icon: ICONS.mug,
    colors: { paper: '#fcf4eb', ink: '#3d2416', primary: '#9a6340', accent: '#e8708a', soft: '#f1dcc5' },
    fonts: { display: 'Pacifico', displayWeight: 400, displayTransform: 'none' },
    openers: {
      start: ['Good morning, baristas, the mugs are all out,', 'But Mocha the Squirrel hid the beans all about!'],
      middle: [
        ['Stir it and swirl it, a marshmallow on top,', 'Another bean’s waiting, so hippity-hop!'],
        ['Whirr! goes the blender, a smoothie for you,', 'Now sip it and find the next cocoa bean clue!'],
        ['Chitter-chatter! Mocha’s tail gives a flick,', 'He hid one more bean, so go find it quick!'],
        ['Muffins and cookies and croissants so sweet,', 'Finding these beans is a marvelous treat!'],
        ['Pour it in slowly and don’t let it spill,', 'You’re finding these beans with such super skill!'],
        ['Hot cocoa, warm milk, a babyccino too,', 'The next cocoa bean is hiding from you!'],
        ['Ding! goes the bell as a customer comes in,', 'Find the next bean with a great big grin!'],
        ['Steam goes a-swirling, so cozy and warm,', 'You’re hunting for beans in fantastic form!'],
      ],
      last: ['One bean is left for the Big Cocoa Pot,', 'Find it and sip something yummy and hot!'],
    },
    briefing: {
      title: 'A Note from the Café',
      from: 'Barista Bea',
      paragraphs: [
        'Good morning, {kids}!',
        'This is Barista Bea at the Café. Today we are making our famous Magic Hot Cocoa for the whole town! But this morning Mocha, the little squirrel who lives in the café garden, sneaked in and carried off our Magic Cocoa Beans. He hid them all around, just like acorns!',
        'Mocha left a trail of crumbs and tiny paw prints, and I have tucked {count} Cocoa Bean cards along the way. Each one has a rhyming riddle that tells you where to search next.',
        'Great baristas are friendly, careful and always say please and thank you. Walk, don’t run, take turns, and say a happy “Mmm!” every time you find a card. Find every bean and the Magic Hot Cocoa can be made, with a cozy surprise waiting at the end!',
        'Your first Cocoa Bean card is attached. Grab your mugs, baristas!',
      ],
      signoff: 'Warm wishes,',
    },
    certificate: {
      title: 'Cocoa Time!',
      subtitle: 'Official Junior Barista',
      body: 'has found every Magic Cocoa Bean that Mocha the Squirrel hid and helped make Magic Hot Cocoa for the whole town, earning the title of',
      award: 'Barista of the Day',
      signer: 'Barista Bea',
    },
    css: `
.card { border:2.5px solid var(--primary); border-radius:12px; background:
  radial-gradient(circle at 5% 84%, rgba(154,99,64,.10) 0 .3in, transparent .31in), linear-gradient(180deg, #fff, var(--paper)); }
.card-head { border-bottom:2px solid var(--soft); padding-bottom:.04in; }
.card-head .icon { color:var(--primary); }
.card-title { font-size:17pt; line-height:1.15; }
.host h1 { line-height:1.4; }
.badge { background:var(--accent); font-family:'Fredoka'; font-weight:600; font-size:9.5pt; letter-spacing:.06em; text-transform:uppercase; }
.kicker { font-family:'Fredoka'; font-weight:600; text-transform:uppercase; color:var(--accent); }
.frame { border-radius:18px; outline-color:var(--accent); }
.briefing h1 { font-size:36pt; line-height:1.3; }
.cert-title { font-size:54pt; line-height:1.3; }
.award { font-size:30pt; color:var(--accent); }
.sign .signer { font-size:22pt; }
.seal { background:var(--primary); outline-color:var(--accent); }`,
  },
  italian: {
    id: 'italian',
    name: 'Trattoria Runaway Meatball Hunt',
    label: 'Italian Restaurant',
    ages: '3–7',
    cardHeader: 'Nonna’s Trattoria',
    badge: 'Meatball',
    hunters: 'Little Chefs',
    treasureWord: 'meatball',
    icon: ICONS.pasta,
    colors: { paper: '#fff8f2', ink: '#3a1a14', primary: '#c8372d', accent: '#2f8a4c', soft: '#f9d6c8' },
    fonts: { display: 'Fredoka', displayWeight: 700, displayTransform: 'none' },
    openers: {
      start: ['Mamma mia! The meatballs rolled out of the pot!', 'Little Chefs, let’s go find them, we need the whole lot!'],
      middle: [
        ['On top of spaghetti, all covered with cheese,', 'Another lost meatball! Go find it, please!'],
        ['Twirl your fork round with a twirl, twirl, twirl,', 'The next meatball rolled off to give it a whirl!'],
        ['Basil and garlic and tomato sauce,', 'Nonna says, “Bravo! You’re the boss!”'],
        ['A meatball! Delizioso! Give it a cheer,', 'The next one rolled off, but it’s probably near!'],
        ['Noodles go slurp and the sauce goes plop,', 'The meatballs keep rolling, they just won’t stop!'],
        ['Gelato for dessert, so creamy and cold,', 'You’re the best chefs, so clever and bold!'],
        ['Ciao, little meatball, where did you go?', 'Follow this riddle, now nice and slow!'],
        ['Roll it and roll it around and around,', 'Another lost meatball is there to be found!'],
      ],
      last: ['One meatball is left, the biggest one yet,', 'Find it, the yummiest dinner you’ll get!'],
    },
    briefing: {
      title: 'Kitchen Catastrophe!',
      from: 'Nonna Lucia, Head Chef',
      paragraphs: [
        'Buongiorno, {kids}!',
        'This is Nonna Lucia at the Trattoria. Tonight we are serving my famous spaghetti and meatballs! But while I was stirring the sauce, I gave the biggest sneeze in all of Italy. ACHOO! The meatballs jumped right out of the pot and rolled away in every direction.',
        'I chased them as fast as my little legs could go, and I tucked {count} Meatball cards along the way. Each one has a rhyming riddle that tells you where to search next.',
        'Good chefs are careful, kind and great at working as a team. Walk, don’t run, take turns, and shout “Mamma mia!” every time you find a card. Bring every meatball home, and a delicious surprise is waiting at the end!',
        'Your first Meatball card is attached. Buon appetito, Little Chefs!',
      ],
      signoff: 'With love from the kitchen,',
    },
    certificate: {
      title: 'Bravissimo!',
      subtitle: 'Official Little Chef',
      body: 'has found every runaway meatball, saved Nonna’s famous spaghetti dinner and made the whole Trattoria proud, earning the title of',
      award: 'Master Chef',
      signer: 'Nonna Lucia, Head Chef',
    },
    css: `
.card { border:.1in solid transparent; border-radius:6px; background:
  linear-gradient(var(--paper), var(--paper)) padding-box,
  repeating-linear-gradient(0deg, rgba(200,55,45,.5) 0 7px, transparent 7px 14px) border-box,
  repeating-linear-gradient(90deg, rgba(200,55,45,.5) 0 7px, #fff 7px 14px) border-box; }
.card-head { border-bottom:3px solid; border-image:linear-gradient(90deg, #2f8a4c 0 33.3%, #e9e4dc 33.3% 66.6%, #c8372d 66.6%) 1; }
.card-head .icon { color:var(--primary); }
.card-title { font-size:17pt; }
.badge { background:var(--accent); border-radius:4px; }
.kicker { color:var(--accent); }
.frame { border:.22in solid transparent; outline:none; border-radius:10px; background:
  linear-gradient(var(--paper), var(--paper)) padding-box,
  repeating-linear-gradient(0deg, rgba(200,55,45,.5) 0 12px, transparent 12px 24px) border-box,
  repeating-linear-gradient(90deg, rgba(200,55,45,.5) 0 12px, #fff 12px 24px) border-box; }
.briefing h1 { font-size:36pt; }
.cert-title { font-size:60pt; }
.award { font-size:34pt; color:var(--accent); }
.seal { background:var(--primary); outline-color:var(--accent); }`,
  },
  auto: {
    id: 'auto',
    name: 'Auto Shop Toolbox Rescue',
    label: 'Auto Shop',
    ages: '3–7',
    cardHeader: 'Auto Shop Work Order',
    badge: 'Tool Tag',
    hunters: 'Junior Mechanics',
    treasureWord: 'wrench',
    icon: ICONS.wrench,
    colors: { paper: '#fffbea', ink: '#1a2a3d', primary: '#34618f', accent: '#ec6a2c', soft: '#ffdf7e' },
    fonts: { display: 'Fredoka', displayWeight: 700, displayTransform: 'uppercase' },
    openers: {
      start: ['Honk, honk! Mechanics, the cars need a fix,', 'But the tools rolled away from a tow truck’s tricks!'],
      middle: [
        ['A wrench! You found it! Now give it a twist,', 'There are more tools to find on the work order list!'],
        ['Check the tires, check the oil, check the lights,', 'You’re the best mechanics, you get it just right!'],
        ['Beep, beep! Honk, honk! The cars wait in line,', 'You found a tool, crew, you’re doing just fine!'],
        ['Bang goes the hammer and buzz goes the drill,', 'Find the next tool with your mechanic skill!'],
        ['Scrub-a-dub-dub at the bubbly car wash,', 'The next tool is hiding! Oh my gosh!'],
        ['Tighten the bolts and pump up the tires,', 'You’re the best mechanics a garage ever hires!'],
        ['Toot! goes Tilly, “I’m sorry, my friends,', 'I’ll help you find tools till the trail ends!”'],
        ['Grease on your hands and a smile on your face,', 'The next tool is hiding in some tricky place!'],
      ],
      last: ['One tool is left, the Golden Wrench, wow!', 'Find it and the cars can all be fixed now!'],
    },
    briefing: {
      title: 'Garage Emergency',
      from: 'Mechanic Max, Head Mechanic',
      paragraphs: [
        'Calling all {kids}!',
        'This is Mechanic Max at the Auto Repair Shop. Today is our busiest day ever, with a long line of cars waiting for tune-ups and car washes! But this morning Tilly the Tow Truck backed up a little too fast and bumped our big red toolbox. CRASH! The wrenches, the screwdrivers and even the Golden Wrench rolled away.',
        'Tilly feels terrible, so she helped me tuck {count} Tool Tag cards along the way. Each one has a rhyming riddle that tells you where to search next.',
        'Good mechanics are careful, helpful and great at working as a team. Walk, don’t run, take turns, and honk “Beep, beep!” every time you find a card. Find every tool, and a shiny surprise is waiting at the end!',
        'Your first Tool Tag card is attached. Grab your toolboxes, mechanics!',
      ],
      signoff: 'Keep on rolling,',
    },
    certificate: {
      title: 'All Fixed!',
      subtitle: 'Official Junior Mechanic',
      body: 'has found every tool Tilly the Tow Truck bumped away, rescued the Golden Wrench and fixed every car in the shop, earning the title of',
      award: 'Master Mechanic',
      signer: 'Mechanic Max, Head Mechanic',
    },
    css: `
.card { border:.1in solid transparent; border-radius:8px; background:
  linear-gradient(180deg, #fff, var(--paper)) padding-box,
  repeating-linear-gradient(45deg, rgba(255,255,255,.4) 0 2px, transparent 2px 9px) border-box,
  repeating-linear-gradient(-45deg, rgba(255,255,255,.4) 0 2px, transparent 2px 9px) border-box,
  linear-gradient(#7d8fa5, #56687e) border-box; }
.card-head { border-bottom:2.5px solid var(--accent); }
.card-head .icon { color:var(--primary); }
.card-title { font-size:15pt; letter-spacing:.03em; }
.badge { background:var(--accent); border-radius:3px; letter-spacing:.03em; }
.kicker { color:var(--accent); }
.frame { border:.2in solid transparent; outline:none; border-radius:10px; background:
  linear-gradient(var(--paper), var(--paper)) padding-box,
  repeating-linear-gradient(45deg, rgba(255,255,255,.4) 0 3px, transparent 3px 14px) border-box,
  repeating-linear-gradient(-45deg, rgba(255,255,255,.4) 0 3px, transparent 3px 14px) border-box,
  linear-gradient(#7d8fa5, #56687e) border-box; }
.briefing h1 { font-size:34pt; }
.cert-title { font-size:58pt; }
.award { font-size:32pt; color:var(--accent); }
.seal { background:var(--primary); color:var(--soft); outline-color:var(--accent); }`,
  },
};
