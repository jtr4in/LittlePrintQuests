// Play Kit ideas for the Pirate Ship kit.
module.exports = {
  scenarios: [
    { title: 'Hungry Pirates in the Galley', setup: 'Set out the Ship’s Galley menu and a pile of gold doubloons, with a toy parrot and monkey as hungry crew.', say: 'Ahoy, Cook {name}! Me tummy’s rumbling. What’s good in the galley today?', twist: 'The parrot only has one doubloon but wants the Captain’s cookie. Can the cook find a kind way to help?' },
    { title: 'Spy Land Ho!', setup: 'Roll up the Captain’s Spyglass and use its Spot It! list while the couch becomes the ship.', say: 'Lookout {name}, climb up to the crow’s nest and tell me what you spy!', twist: 'A sneaky shark keeps popping up in a new spot every time the lookout blinks.' },
    { title: 'X Marks the Spot', setup: 'Hide the Treasure Chest at the X on the Treasure Map and lay the map on the floor.', say: 'Captain, the old map says the loot is past Skull Rock. Which way do we sail?', twist: 'Fire Mountain rumbles! The crew must tiptoe past it so it doesn’t wake up.' },
    { title: 'Catch the Scallywags', setup: 'Tape the Wanted Posters to a “mast” and hide the matching toys around the room.', say: 'Captain, Crabby Pete has been pinching biscuits again! Will you track him down?', twist: 'Crabby Pete says sorry and asks to join the crew. What job can he have?' },
    { title: 'Voyage to an Island', setup: 'Fill in a Voyage Ticket and a set of Pirate Papers for each toy pirate.', say: 'Ahoy, I’d like a ticket to Mermaid Cove, please. Do I need my Pirate Papers?', twist: 'A giant wave spins the ship around and you land on a different island instead.' },
    { title: 'Crew Inspection Day', setup: 'Line up toy pirates with Crew Inspection record cards and a crayon.', say: 'Captain {name}, is this sea dog ready to sail? Check his sea legs and knot tying!', twist: 'One pirate is too seasick to stand up straight. What does the captain do to help?' },
    { title: 'Share the Treasure', setup: 'Open the Treasure Chest flaps and spread out the Pirate Treasure cards.', say: 'Treasure Keeper, we found the loot! How do we share it fair and square?', twist: 'There is one gold coin left over. The crew must vote on what to do with it.' },
    { title: 'Sea Monster Attack', setup: 'Pin on the Crew Badges and eye patches, and grab a toy octopus.', say: 'Uh oh, Captain! An octopus is tickling the ship! What do we do?', twist: 'The octopus only stops tickling when the whole crew sings a silly sea shanty.' },
  ],
  lines: {
    kid: [
      'Ahoy, matey! Welcome aboard my pirate ship!',
      'That fish stew costs 2 gold doubloons, please.',
      'Show me your Pirate Papers before you board!',
      'All hands on deck! Time to raise the sails!',
      'Land ho! I spy an island through my spyglass!',
      'Fair winds, matey! Come back at high tide!',
    ],
    grownup: [
      'Captain, can you count my doubloons for me?',
      'Which island should we sail to next?',
      'Arr, my parrot wants a banana. Can you feed him?',
      'Show me how a brave pirate walks the plank!',
      'Can you stamp my Pirate Papers, please?',
      'What job do I get on your ship, Captain?',
    ],
  },
  games: [
    { title: 'Spyglass Hunt', how: 'Call out a picture from the Spot It! list. The lookout races to find something like it through the spyglass.', uses: 'Captain’s Spyglass, Spot It! list' },
    { title: 'Buried Treasure', how: 'Hide the treasure cards around the room. Each card found adds its value in doubloons to the crew’s chest.', uses: 'Pirate Treasure cards, gold doubloons' },
    { title: 'Island Hopping', how: 'Lay the Treasure Map on the floor and hop from island to island. Do a pirate move at each stop before you stamp your papers.', uses: 'Treasure Map, Pirate Papers' },
    { title: 'Wanted Match', how: 'Hold up a Wanted Poster and act out the scallywag. The crew guesses who it is and earns a doubloon reward.', uses: 'Wanted Posters, gold doubloons' },
    { title: 'Chest Count', how: 'Lift one Treasure Chest flap at a time and count the loot found so far. Guess which treasure is behind the last flap!', uses: 'Treasure Chest' },
  ],
};
