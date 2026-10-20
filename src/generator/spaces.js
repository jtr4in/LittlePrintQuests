// Ready-made hiding-spot trails for common kinds of homes. The website builder offers these as
// one-tap presets (docs/index.html keeps a copy of the spot lists), and the idea pages use them.
// Every spot is in the library, so these orders never need Claude. The last spot holds the prize.

module.exports = {
  apartment: {
    id: 'apartment',
    label: 'Apartment',
    title: 'Apartment Scavenger Hunt',
    lede: 'No stairs, no yard, no problem. Eight hiding spots that every apartment has, so the hunt fits in one floor and still feels like a big adventure.',
    spots: ['front_door', 'shoe_rack', 'couch', 'bookshelf', 'kitchen_table', 'fridge', 'bathtub', 'bed'],
    tips: [
      'Zig-zag between rooms instead of going in a line. Kids walk farther and the trail feels longer.',
      'Keep it quiet for the neighbors: swap the “stomp” challenges for tiptoe ones.',
      'Use the bathtub (dry!) and the bed for the last spots. They are big, easy to search and safe.',
      'If space is really tight, run the trail twice with two teams and different prizes.',
    ],
  },
  house: {
    id: 'house',
    label: 'House',
    title: 'Indoor Scavenger Hunt for a House',
    lede: 'A trail that sends kids up and down the whole house, from the front door to the laundry and back to bed, with the prize hiding at the end.',
    spots: ['front_door', 'coat_closet', 'couch', 'stairs', 'pantry', 'dryer', 'bathtub', 'bed'],
    tips: [
      'Spread the clues across floors. A trip up the stairs and back is half the fun.',
      'Walk the route once before the party and tuck each card where a small child can reach it.',
      'Close doors to rooms that are off limits so nobody wanders off the trail.',
      'Put a grown-up near the stairs if your hunters are 3 or 4.',
    ],
  },
  backyard: {
    id: 'backyard',
    label: 'Backyard',
    title: 'Backyard Scavenger Hunt',
    lede: 'Start at the door, head outside to the swing, the slide and the sandbox, and finish at the big tree. Great for a sunny party with lots of kids.',
    spots: ['front_door', 'doormat', 'mailbox', 'plant', 'swing', 'slide', 'sandbox', 'tree'],
    tips: [
      'Tape cards inside zip bags or clear sleeves in case of dew or a sprinkler.',
      'Walk the yard first and pick spots away from the street, the pool and the grill.',
      'Weigh cards down with a small rock so the wind doesn’t take them.',
      'Hide the prize in a bag or a box at the tree, out of the sun.',
    ],
  },
};
