// Hiding-spot library. Each riddle is a rhyming couplet describing the spot the
// kids should go to next; the theme supplies the opening couplet.
// `tip` tells the host exactly where to tuck the card.

module.exports = {
  couch: {
    label: 'Couch',
    tip: 'Under a couch cushion',
    riddle: ['Where do we snuggle for movies and naps?', 'Check under the cushions, it’s there, perhaps!'],
  },
  fridge: {
    label: 'Fridge',
    tip: 'Taped to the fridge door (or on a shelf inside)',
    riddle: ['It’s big and it’s cold and it hums all day long,', 'It keeps the milk chilly, so you can’t go wrong!'],
  },
  bed: {
    label: 'Bed',
    tip: 'Under the pillow',
    riddle: ['Where do you sleep when the moon’s shining bright?', 'Look under the pillow where you snuggle at night!'],
  },
  bathtub: {
    label: 'Bathtub',
    tip: 'Inside the (dry!) bathtub',
    riddle: ['Where do you splash with your bubbles and boats?', 'Look in the place where your rubber duck floats!'],
  },
  bookshelf: {
    label: 'Bookshelf',
    tip: 'Tucked between two books',
    riddle: ['Where do the stories sit snug in a row?', 'Peek by the books, where the readers all go!'],
  },
  front_door: {
    label: 'Front Door',
    tip: 'Taped to the inside of the front door',
    riddle: ['You open it wide when a friend comes to play,', 'It says “hello” and “goodbye” every day!'],
  },
  toy_box: {
    label: 'Toy Box',
    tip: 'On top of the toys in the toy box',
    riddle: ['Where do your toys go when playtime is done?', 'Look in the place where you keep all the fun!'],
  },
  kitchen_table: {
    label: 'Kitchen Table',
    tip: 'On (or under) the kitchen table',
    riddle: ['Where do we gather for breakfast and treats?', 'Look by the table with all of the seats!'],
  },
  coat_closet: {
    label: 'Coat Closet',
    tip: 'In a coat pocket inside the closet',
    riddle: ['Where do the jackets hang out on a hook?', 'Open the closet and take a quick look!'],
  },
  shoe_rack: {
    label: 'Shoe Rack',
    tip: 'Inside a shoe on the shoe rack',
    riddle: ['Sneakers and boots standing all in a row,', 'Check where the shoes rest when they’re done on the go!'],
  },
  mailbox: {
    label: 'Mailbox',
    tip: 'Inside the mailbox',
    riddle: ['Where do the letters and birthday cards stay?', 'Check out the mailbox, it’s not far away!'],
  },
  washing_machine: {
    label: 'Washing Machine',
    tip: 'On top of the washing machine',
    riddle: ['It sloshes and splashes and swishes around,', 'It washes your clothes with a rumbly sound!'],
  },
  dryer: {
    label: 'Dryer',
    tip: 'Inside the dryer drum (door open)',
    riddle: ['Head to the spot where wet clothes become dry,', 'It spins and it tumbles, so give it a try!'],
  },
  pantry: {
    label: 'Pantry',
    tip: 'Next to the cereal in the pantry',
    riddle: ['Where are the crackers and cereal kept?', 'Peek in the pantry where snacks have all slept!'],
  },
  laundry_basket: {
    label: 'Laundry Basket',
    tip: 'On top of the laundry basket',
    riddle: ['Where do the socks go when they’re dirty and worn?', 'Dig through the laundry, from evening to morn!'],
  },
  bathroom_sink: {
    label: 'Bathroom Sink',
    tip: 'Next to the toothbrushes',
    riddle: ['Brush, brush, brush till your teeth are so bright,', 'Check by the sink where you brush every night!'],
  },
  tv: {
    label: 'TV',
    tip: 'Under the TV remote',
    riddle: ['Where do the cartoons and movies all play?', 'Check by the TV, but don’t watch today!'],
  },
  stairs: {
    label: 'Stairs',
    tip: 'On the bottom step',
    riddle: ['Up and down, step by step, one, two, three,', 'Check by the stairs, now what will you see?'],
  },
  pet_bed: {
    label: 'Pet Bed',
    tip: 'Tucked in the pet’s bed',
    riddle: ['Where does your furry friend curl up to snore?', 'Check the pet’s bed, then you’ll find something more!'],
  },
  plant: {
    label: 'Plant',
    tip: 'Leaning against a plant pot',
    riddle: ['It’s leafy and green and it grows toward the sun,', 'Check by the plant pot, this one’s lots of fun!'],
  },
  desk: {
    label: 'Desk',
    tip: 'Under the keyboard or a notebook',
    riddle: ['Where are the pencils, the paper, and pens?', 'Check by the desk, and then count to ten!'],
  },
  piano: {
    label: 'Piano',
    tip: 'On the piano keys (lid open)',
    riddle: ['Black keys and white keys that plink and that plonk,', 'Check by the piano and play a quick song!'],
  },
  mirror: {
    label: 'Mirror',
    tip: 'Taped to the corner of a mirror',
    riddle: ['Who’s that smiling right back at you?', 'Check by the mirror, you’ll see something new!'],
  },
  doormat: {
    label: 'Doormat',
    tip: 'Under the doormat',
    riddle: ['It says “Welcome!” and wipes muddy feet,', 'Look under the doormat, now isn’t that neat?'],
  },
  clock: {
    label: 'Clock',
    tip: 'Below a wall clock',
    riddle: ['Tick-tock, tick-tock, what time can it be?', 'Check by the clock, and then you will see!'],
  },
  stuffed_animals: {
    label: 'Stuffed Animals',
    tip: 'Held by a teddy bear',
    riddle: ['Where do your teddies and stuffies all sleep?', 'Check with your stuffies, they’re piled in a heap!'],
  },
  backpack: {
    label: 'Backpack',
    tip: 'In the front pocket of a backpack',
    riddle: ['What do you carry to school on your back?', 'Look in the backpack, you’re right on track!'],
  },
  garage: {
    label: 'Garage',
    tip: 'Just inside the garage door',
    riddle: ['Where does the car sleep when it’s done for the day?', 'Check in the garage, but don’t drive away!'],
  },
  swing: {
    label: 'Swing',
    tip: 'Taped under the swing seat',
    riddle: ['Back and forth, way up high in the air,', 'Check by the swing set, the clue’s waiting there!'],
  },
  slide: {
    label: 'Slide',
    tip: 'At the bottom of the slide',
    riddle: ['Climb up the ladder, then WHEEE, down you go!', 'Check by the slide, it’s the fastest I know!'],
  },
  sandbox: {
    label: 'Sandbox',
    tip: 'In a zip bag on the sandbox edge',
    riddle: ['Where can you build a big castle of sand?', 'Check by the sandbox, it’s ever so grand!'],
  },
  tree: {
    label: 'Big Tree',
    tip: 'At the base of the tree trunk',
    riddle: ['It’s tall and it’s leafy with branches up high,', 'Check by the big tree that reaches the sky!'],
  },
};
