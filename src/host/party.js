// The Party tab of Host Mode: a planning checklist from a few weeks out to the clean-up,
// built around the printables in the party pack and whatever else the order includes.

const { flavorFor } = require('../party/flavor');

function checklist(theme, { name, hunt, kit }) {
  const f = flavorFor(theme);
  const [food1, food2, food3] = f.foods;
  return [
    { when: '3 to 4 weeks before', items: [
      'Pick the date, time and place, and how long the party runs (90 minutes is plenty for little ones).',
      'Make the guest list. A good rule of thumb: one guest per year of age, plus one.',
      'Print the invitations on cardstock and fill in the date, time, place and RSVP.',
    ] },
    { when: '2 weeks before', items: [
      'Hand out or mail the invitations.',
      `Plan the menu around the food tent cards: ${food1}, ${food2} and ${food3}.`,
      'Order or plan the cake or cupcakes.',
      `Pick favors for the favor bags${kit ? ' (the play kit stickers and badges make great extras)' : ''}.`,
    ] },
    { when: '1 week before', items: [
      'Count your RSVPs and follow up with anyone you haven’t heard from.',
      'Ask about food allergies.',
      'Print the cupcake toppers, favor tags, banner, food tent cards and bottle labels.',
      'Cut everything out. It’s a great job for little helpers.',
      'Shop for plates, cups, napkins, balloons and favor-bag fillers.',
      ...(hunt ? ['Print the scavenger hunt and cut out the clue cards.'] : []),
      ...(kit ? ['Print the play kit and put the toys together (brads and glue).'] : []),
    ] },
    { when: '2 to 3 days before', items: [
      'Fill the favor bags and tie on the favor tags.',
      'String the banner on ribbon or twine.',
      'Plan the order of the party: arrive and play, activity, food, cake, presents, goodbyes.',
      'Charge your phone and clear space for photos.',
    ] },
    { when: 'The day before', items: [
      'Bake or pick up the cake or cupcakes.',
      'Tape the toppers to toothpicks.',
      'Wrap the bottle labels around the drinks.',
      ...(hunt ? ['Hide the clue cards (Host Mode’s Hunt tab walks you through it).'] : []),
      ...(kit ? [`Set up ${name}’s play kit station so it’s ready to open.`] : []),
    ] },
    { when: 'Party morning', items: [
      'Hang the banner and the balloons.',
      'Set out the food with its tent cards.',
      'Put the toppers on the cupcakes.',
      'Line up the favor bags by the door.',
      'Set out a bin or bag for presents and a pen to note who gave what.',
    ] },
    { when: 'During the party', items: [
      `Welcome guests and start the fun${kit ? ' at the play kit' : ''}.`,
      ...(hunt ? [`Run the scavenger hunt with ${name} leading the team.`] : []),
      'Cake and singing!',
      'Hand out favor bags as guests leave.',
    ] },
    { when: 'After the party', items: [
      'Write the thank-you cards (note the gift on each one).',
      'Hand out or mail the thank-you cards.',
      `Keep the banner for ${name}’s room. It makes a sweet keepsake.`,
    ] },
  ];
}

module.exports = { checklist };
