// Play Kit ideas for the Santa’s Workshop kit (Host Mode).
module.exports = {
  scenarios: [
    { title: 'The First Toy Order', setup: 'Set out a Toy Order slip, building blocks, and crayons on the Toy Building table.', say: 'Head Elf {name}, a letter came in! Someone wishes for a toy train. Can you build one?', twist: 'The train comes out with square wheels. Back to the workshop to fix it!' },
    { title: 'Wrap It Up', setup: 'Make a Wrapping Station with paper, ribbon, empty boxes, and the Gift Tags.', say: 'Ho ho ho! These toys need wrapping before the sleigh leaves. Can you help, little elf?', twist: 'One present starts wiggling and jingling. What could be inside?' },
    { title: 'Snowstorm!', setup: 'Wear the Reindeer Antlers and use a laundry basket or box as the sleigh.', say: 'Pilot {name}, a big snowy cloud is in the way! Ring the bells and steer around it!', twist: 'Turn the Sleigh Speed needle to Rocket fast and everyone zooms around the room.' },
    { title: 'Cocoa Corner Break', setup: 'Set out the Cocoa Corner menu, the elf stars, and some cups.', say: 'Brrr! I’m a chilly snowman. Could I have a hot cocoa that won’t melt me?', twist: 'A penguin customer wants their cocoa extra cold. Can the cocoa maker invent it?' },
    { title: 'Toy Inspection', setup: 'Line up a few toys and grab the Toy Inspection record cards and a crayon.', say: 'Inspector, this teddy bear is going on the sleigh tonight. Does it pass the check?', twist: 'The toy robot will only pass inspection if someone teaches it a dance.' },
    { title: 'Nice List Office', setup: 'Tape up the Nice List posters and hand over the Nice-o-Meter.', say: 'Nice List Keeper, I shared my cookies today. Where does that put the Nice-o-Meter?', twist: 'The Nice-o-Meter goes all the way to NICEST and the whole workshop does a happy cheer.' },
    { title: 'Sleigh Loading Day', setup: 'Put wrapped boxes or toys near the Sleigh Launch sign and set out the Workshop Jobs board.', say: 'Sleigh Loader {name}, Santa leaves soon! Can you count the presents onto the sleigh?', twist: 'A reindeer is too hungry to fly. Find a reindeer carrot quick!' },
    { title: 'Supply Shop', setup: 'Lay out the Workshop Supplies cards and give each elf a few elf stars.', say: 'I want to make a jingly stocking. What supplies do I need, and how many stars?', twist: 'The workshop mouse borrowed all the ribbon. Make a bow from something silly instead.' },
  ],
  lines: {
    kid: [
      'Welcome to the workshop! What toy would you like?',
      'Your present is wrapped with a bow!',
      'That’s two elf stars for a hot cocoa.',
      'This toy passed inspection. Ready for the sleigh!',
      'You made the Nice List today!',
      'Antlers on, reindeer! Time to fly!',
    ],
    grownup: [
      'Head Elf {name}, what should I build first?',
      'Can you tie a bow on this present for me?',
      'How many presents are on the sleigh now?',
      'Can you check if my toy jingles?',
      'Could I have a cookie and a milk, please?',
      'Which Gift Tag should go on this present?',
    ],
  },
  games: [
    { title: 'Star Counting Cocoa', how: 'Order two treats from the Cocoa Corner menu. The child adds the prices and counts out elf stars.', uses: 'Cocoa Corner menu, elf stars' },
    { title: 'Reindeer Says', how: 'The Head Elf calls out sleigh moves like fly up, land or jingle. Reindeer act them out in their antlers.', uses: 'Reindeer Antlers, Sleigh Speed meter' },
    { title: 'Tag the Presents', how: 'Wrap a few boxes. Read each Gift Tag together and tape it on the present it fits best.', uses: 'Gift Tags, Toy Orders' },
    { title: 'Toy Order Build', how: 'Pick a Toy Order and build that toy from blocks or crafts. Inspect it and tick off each check.', uses: 'Toy Orders, Toy Inspection cards' },
    { title: 'Kindness Meter', how: 'Each player does one kind thing, like sharing or helping tidy. Turn the Nice-o-Meter up one step each time.', uses: 'Nice-o-Meter, Elf Passports' },
  ],
};
