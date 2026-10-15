// Play Kit ideas for the Pit Stop Garage.
module.exports = {
  scenarios: [
    { title: 'Flat Tire on Lap 3', setup: 'Park a toy car at the Pit Stop sign and set out the Tire and Wrench Pit Stop Parts.', say: 'Crew Chief {name}! My race car has a flat tire. Can you fix it fast?', twist: 'Time the tire change by counting out loud. Can the crew beat its own record?' },
    { title: 'Repair Order Visit', setup: 'Bring a toy car and a blank Repair Order card to the garage counter.', say: 'Hello, mechanic! My car goes squeak squeak. Can you check it?', twist: 'The horn only plays silly sounds! Fix it until it says beep beep again.' },
    { title: 'Fuel Station Fill-Up', setup: 'Tape up the Fuel Station sign and hand over the Race Car Dashboard fuel gauge.', say: 'Fill it up, please! My fuel needle says Empty. How many race tokens?', twist: 'The fuel pump gets hiccups. Fill the tank in tiny hiccup squirts!' },
    { title: 'Scrub-a-Dub Car Wash', setup: 'Set out the Car Wash sign, a dry sponge and a line of muddy pretend cars.', say: 'Car Washer, my car drove through a giant mud puddle. Can you make it shiny?', twist: 'The car is ticklish! Every scrub makes it giggle and honk.' },
    { title: 'Race Day Start', setup: 'Lay the Race Track Map at the Starting Line and give {name} the Racing Steering Wheel.', say: 'Racers, line up! Driver {name}, which track is on your race ticket today?', twist: 'Halfway through, everyone has to drive in slow motion like a turbo turtle.' },
    { title: 'Pit Stop Shop', setup: 'Set out the Pit Stop Shop menu and the race tokens at the counter.', say: 'I’d like a driver’s pretzel and a juice box, please. How many tokens is that?', twist: 'A teddy racer only has three tokens. Help pick something that fits!' },
    { title: 'New Paint Job', setup: 'Use the Repair Order’s Draw the car box and some crayons at the garage counter.', say: 'Mechanic, I want my car painted with stripes and stars. Can you do it?', twist: 'The customer changes their mind three times! Pick the final color together.' },
    { title: 'Winner’s Circle', setup: 'Tape up the Winner’s Circle sign with the Racing Stickers and Racing Licenses.', say: 'What a race! Announcer, who crossed the finish line? Give them a cheer!', twist: 'Every racer gets a prize for something different: fastest, safest, kindest, silliest.' },
  ],
  lines: {
    kid: [
      'Welcome to the Pit Stop Garage! Honk twice and pull in!',
      'Let me check your tires. Looking good!',
      'A full tank is two race tokens.',
      'Your car is race ready!',
      'Start your engines! Ready, set, go!',
      'You finished the race! Here’s a sticker.',
    ],
    grownup: [
      'Crew Chief {name}, can you fill out a repair order for my car?',
      'How many race tokens for a new tire and an oil change?',
      'Can you wave the flag to start the race?',
      'My fuel gauge says Low. Can you fill me up?',
      'Which track should I race today? Can you pick my race ticket?',
      'Can you check my horn? Beep beep!',
    ],
  },
  games: [
    { title: 'Speedometer Says', how: 'Point the speedometer needle at Slow, Cruise, Fast or Turbo. Everyone drives around the room at that speed!', uses: 'Race Car Dashboard speedometer' },
    { title: 'Token Tune-Up', how: 'Pick two parts from the Pit Stop Shop menu. Count out the race tokens to pay for both.', uses: 'Pit Stop Shop menu and tokens' },
    { title: 'Checkpoint Rally', how: 'Drive a toy car along the Race Track Map. At each checkpoint, do a quick job like honking or washing.', uses: 'Race Track Map and toy cars' },
    { title: 'Repair Check', how: 'Fill out a Repair Order for a toy car. Check each part and tick Race ready or Needs a fix.', uses: 'Repair Order cards' },
    { title: 'License Laps', how: 'Pick a track on a Race Ticket and race the laps. Stamp the Racing License each time you finish.', uses: 'Race Tickets and Racing Licenses' },
  ],
};
