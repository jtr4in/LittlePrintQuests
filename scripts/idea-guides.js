// The occasion and age guides for the ideas pages (built by scripts/idea-pages.js): birthday, Thanksgiving, Christmas Eve, New Year’s Eve and
// classroom hunts, and hunts for little and big kids. Clues are either ids from the riddle library
// (src/generator/spots.js) or written here as { label, riddle: [line, line], tip } when the spots are
// party, holiday or classroom ones the library doesn't have; pic is the picture hint on the free printable. Section bodies are HTML; links in them are written
// from a page in docs/ideas/<slug>/. Site copy says "kid", not "child".

const GUIDES = [
  {
    slug: 'birthday-scavenger-hunt',
    group: 'occasion',
    short: 'Birthday party hunt',
    title: 'Birthday Party Scavenger Hunt for Kids: Free Rhyming Clues and Tips',
    description: 'A birthday party scavenger hunt for ages 3 to 8: 8 free rhyming birthday clues with answers, how to run it with a group of kids, and printable party packs.',
    h1: 'Birthday party scavenger hunt for kids',
    lede: 'A treasure hunt is the party game that keeps a room full of 3 to 8 year olds busy, happy and moving for twenty minutes. Here are eight birthday clues you can use today, how to run a hunt with a whole group, and printable versions with the birthday kid’s name on every page.',
    cta: [{ pick: 'hunt+party' }, 'Make a personalized party hunt'],
    clueIntro: 'Hide each clue at the answer to the clue before it. Hand the first one to the birthday kid, and put the goodie bags at the end.',
    clues: [
      { label: 'Balloons', pic: '🎈', riddle: ['Look up, look up, where they bob and they sway,', 'The next clue is tied where the balloons like to play!'], tip: 'Tied to a balloon ribbon' },
      { label: 'Presents', pic: '🎁', riddle: ['Boxes in paper with ribbons so bright,', 'Look by the presents, but no peeking tonight!'], tip: 'Under the gift table' },
      { label: 'Party hats', pic: '🎉', riddle: ['Pointy and stripy, you wear it to cheer,', 'Look under a party hat, your clue is right here!'], tip: 'Under the stack of party hats' },
      { label: 'Freezer', pic: '🧊', riddle: ['Where does the ice cream stay frozen and cold?', 'Look by the freezer, be quick and be bold!'], tip: 'Taped to the freezer door' },
      { label: 'Paper plates', pic: '🍽️', riddle: ['Paper plates stacked by the forks and the cups,', 'Lift up the plates where the party sets up!'], tip: 'Under the bottom plate in the stack' },
      { label: 'Front door', pic: '🚪', riddle: ['You came through it smiling, all ready to play,', 'Go back to the door where you came in today!'], tip: 'Taped to the inside of the front door' },
      { label: 'Birthday chair', pic: '🪑', riddle: ['Who is the star with a crown on their head?', 'Look by the birthday kid’s chair, like I said!'], tip: 'On the seat of the birthday kid’s chair' },
      { label: 'Goodie bags', pic: '🛍️', riddle: ['You played and you searched and you found every clue,', 'The goodie bags wait, and there’s one just for you!'], tip: 'The treasure: the favor bags, one for each kid' },
    ],
    sections: [
      ['Running a hunt with a group', `<ul class="tips">
<li><b>Everybody finds one.</b> Count the clues against the guests. With eight kids and eight clues, each kid gets a turn to grab a card, so the fastest runner doesn’t find them all.</li>
<li><b>Take turns reading.</b> Readers read the rhyme out loud; little ones get to shout the answer or lead the group to the spot.</li>
<li><b>Two teams for big groups.</b> Over ten kids, make two teams with their own color of cards and start them at different clues. Both trails end at the same treasure.</li>
<li><b>A grown-up at the back.</b> One adult leads, one walks behind to collect stragglers and keep the youngest guests in the game.</li>
</ul>`],
      ['When to play it', '<p>Right after everyone arrives and before cake. Kids are fizzy at the start of a party, and a hunt gives that energy somewhere to go. It also covers late arrivals: a guest who walks in at clue three just joins the trail.</p>'],
      ['Match it to the party theme', '<p>Every themed hunt comes with its own story to read before the first clue, so a dinosaur party starts with a fossil emergency and a unicorn party with a missing rainbow. Pick the party’s theme:</p>{THEMES}'],
      ['Want the whole party printed?', '<p>A party pack has invitations, thank-you cards, cupcake toppers, favor tags and a birthday banner, all with the birthday kid’s name. Pair it with a personalized hunt for the main game. It arrives by email in minutes, so it works even for a party this weekend.</p>{CTA}'],
    ],
    faq: [
      ['How many clues should a birthday scavenger hunt have?', 'About one clue per guest, between six and ten. That gives every kid a find and takes 15 to 25 minutes.'],
      ['What do you put at the end of a birthday scavenger hunt?', 'The goodie bags work best, one per kid, so nobody feels the birthday kid won the prize. Small wrapped treats or the cake itself also make a good finish.'],
      ['Can I run a party scavenger hunt in a small apartment?', 'Yes. Use the apartment spots every home has, like the couch, the fridge and the bathtub, and zig-zag between rooms so the trail feels longer.'],
    ],
  },
  {
    slug: 'scavenger-hunt-for-preschoolers',
    group: 'age',
    short: 'Ages 3 to 5',
    title: 'Scavenger Hunt for Preschoolers: Picture Clues for 3, 4 and 5 Year Olds',
    description: 'How to run a scavenger hunt for 3, 4 and 5 year olds who can’t read yet: 6 easy rhyming clues, picture clue tips, a color hunt and how long it should last.',
    h1: 'Scavenger hunt for preschoolers (ages 3 to 5)',
    lede: 'Kids who can’t read yet still love a treasure hunt. The trick is picture clues, a short trail and a grown-up who reads the rhyme while the kid gets to do the finding. Here’s a six-clue hunt that works for 3, 4 and 5 year olds.',
    cta: [{ age: '4' }, 'Make a picture-clue hunt'],
    clueIntro: 'Read each rhyme out loud, then let your kid run to the spot. Add a little drawing of the answer to each card (a bed, a fridge) so they can “read” it themselves.',
    clues: ['bed', 'toy_box', 'fridge', 'couch', 'bathtub', 'stuffed_animals'],
    sections: [
      ['What works at this age', `<ul class="tips">
<li><b>Picture on every clue.</b> A drawing of the spot turns the card into something a pre-reader can solve alone, which is the whole thrill.</li>
<li><b>Five or six spots.</b> Fifteen minutes is a great hunt for a three year old. Stop while they still want more.</li>
<li><b>Hide in plain sight.</b> Clues should poke out of the hiding spot. Hot and cold hints are fine when they get stuck.</li>
<li><b>Same rooms first.</b> Start with spots in the room they’re in, then move to the next room. Long trips across the house lose little ones.</li>
<li><b>Everybody wins.</b> With siblings, take turns finding each clue so the older one doesn’t sweep the trail.</li>
</ul>`],
      ['A no-clue color hunt', '<p>For a quick game with no setup, call out a color and let them run to find something that color: something red, something blue, something soft, something round. Five finds and it’s done. Our printed hunts include a picture hunt and a look-around hunt like this for a second round on another day.</p>'],
      ['For the youngest (2 and 3 year olds)', '<p>Hide the clues in just one room and walk the trail together, holding hands. Let them pull each card out and hand it to you to read. The finding is the fun, not the solving.</p>'],
      ['Want it printed with pictures?', '<p>Our little kids version (ages 3 to 5) has a picture of the hiding spot on every clue card, big cut lines and your kid’s name on every page, plus a story to read before the first clue and a certificate at the end. It arrives by email in minutes.</p>{CTA}'],
    ],
    faq: [
      ['Can a 3 year old do a scavenger hunt?', 'Yes, with picture clues and a grown-up to read the rhymes. Keep it to five or six spots close together, about 10 to 15 minutes.'],
      ['How do you do a scavenger hunt for kids who can’t read?', 'Put a picture of the hiding spot on each clue card. The grown-up reads the rhyme for fun, and the kid matches the picture to the place.'],
      ['What prize works for preschoolers?', 'Something small they can use right away: stickers, a bath toy, a snack, or a new book to read together.'],
    ],
  },
  {
    slug: 'scavenger-hunt-for-6-to-8-year-olds',
    group: 'age',
    short: 'Ages 6 to 8',
    title: 'Scavenger Hunt for 6, 7 and 8 Year Olds: Harder Clues and Challenges',
    description: 'A scavenger hunt for 6, 7 and 8 year olds: 8 trickier rhyming clues, a challenge at every stop, secret code ideas and how to let them run it themselves.',
    h1: 'Scavenger hunt for 6, 7 and 8 year olds',
    lede: 'Early readers want clues they can solve without help, and something to prove at every stop. Here’s an eight-clue trail with trickier spots, challenges to add between clues and codes for the kids who finish too fast.',
    cta: [{ age: '7' }, 'Make a big-kid hunt'],
    clueIntro: 'Let them read each riddle on their own. These spots are a little harder to guess than the couch and the bed.',
    clues: ['clock', 'washing_machine', 'mirror', 'pantry', 'doormat', 'desk', 'coat_closet', 'dryer'],
    sections: [
      ['Add a challenge at every stop', `<p>Write a challenge on the back of each card. They have to do it before they can read the next clue:</p>
<ul class="tips">
<li>Hop on one foot ten times.</li>
<li>Spell your name backwards.</li>
<li>Find three things in this room that start with B.</li>
<li>Do your best dinosaur roar (or pirate laugh, or superhero pose).</li>
<li>Count backwards from 20 as fast as you can.</li>
</ul>`],
      ['Add a secret code', `<ul class="tips">
<li><b>Number code:</b> A is 1, B is 2. Write the hiding spot as numbers, like 2-5-4 for BED.</li>
<li><b>Mirror writing:</b> write the clue backwards so they need a mirror to read it.</li>
<li><b>Scrambled word:</b> write the answer with its letters mixed up, like GDRIEF for FRIDGE.</li>
<li><b>Puzzle finale:</b> put one puzzle piece with each clue; the finished puzzle shows where the treasure is.</li>
</ul>`],
      ['Hand them the job', '<p>Kids this age love running a hunt as much as playing one. Once they’ve done yours, let them write and hide clues for a younger sibling or for you. It’s writing practice they’ll actually want to do.</p>'],
      ['Want it printed?', '<p>Our big kids version (ages 6 to 8) has riddles for early readers, your kid’s name on every page, a puzzle finale and a certificate, and you can type in your own hiding spots, like “Grandma’s piano”. It arrives by email in minutes.</p>{CTA}'],
    ],
    faq: [
      ['How many clues for a 7 year old’s scavenger hunt?', 'Eight to ten clues, with a challenge at some of the stops, takes about 20 to 30 minutes.'],
      ['How do you make a scavenger hunt harder?', 'Use spots that are harder to guess, add a code they have to crack to read each clue, and add a challenge at each stop.'],
      ['Can older and younger kids do the same hunt?', 'Yes. Pair a reader with a pre-reader: the big kid reads the clue, the little one finds it.'],
    ],
  },
  {
    slug: 'thanksgiving-scavenger-hunt',
    group: 'occasion',
    short: 'Thanksgiving hunt',
    title: 'Thanksgiving Scavenger Hunt for Kids: Free Rhyming Clues and a Thankful Jar',
    description: 'A Thanksgiving scavenger hunt for kids ages 3 to 8: 8 free rhyming clues, a thankful twist for the dinner table and tips for a house full of cousins.',
    h1: 'Thanksgiving scavenger hunt for kids',
    lede: 'The turkey needs to rest for half an hour and the kids are bouncing off the walls. A Thanksgiving treasure hunt fills that gap, and the thankful twist below gives everyone something to share at the table.',
    cta: [{ theme: 'kitchen' }, 'Make a personalized hunt'],
    clueIntro: 'Hide each clue at the answer to the clue before it. The last one leads to a Thankful Jar.',
    clues: [
      { label: 'Coat hooks', pic: '🧥', riddle: ['Coats and hats hanging up by the door,', 'Look where the guests hung their jackets, there’s more!'], tip: 'In a coat pocket by the door' },
      { label: 'Pumpkin pie', pic: '🥧', riddle: ['It’s round and it’s spicy and baked in a dish,', 'Look by the pumpkin pie, then make a wish!'], tip: 'Next to (not on!) the pie plate' },
      { label: 'Dinner table', pic: '🍽️', riddle: ['Where will we gather to share the big meal?', 'Look under a plate, what will it reveal?'], tip: 'Under a plate at the dinner table' },
      { label: 'Fruit bowl', pic: '🍎', riddle: ['Apples and gourds and the corn in a heap,', 'Check the fruit bowl, the next clue is in deep!'], tip: 'Under the fruit in the centerpiece bowl' },
      { label: 'TV', pic: '📺', riddle: ['Where do the grown-ups all cheer for the game?', 'Check by the TV, the clue’s there all the same!'], tip: 'Under the TV remote' },
      { label: 'Grandma’s chair', pic: '🪑', riddle: ['Who tells the best stories and gives the best hugs?', 'Check by Grandma’s chair, then give her a snug!'], tip: 'Ask a grandparent to hold it' },
      { label: 'Kitchen cupboard', pic: '🚪', riddle: ['It smells like a feast and the oven is hot,', 'The clue’s on a cupboard, but not on the pot!'], tip: 'Taped to a cupboard away from the stove' },
      { label: 'Thankful Jar', pic: '🫙', riddle: ['You found every clue, now the best part is near,', 'Look in the Thankful Jar, what’s waiting in here?'], tip: 'The treasure: a jar with a small treat and blank slips' },
    ],
    sections: [
      ['The thankful twist', '<p>At every stop, the finder says one thing they’re thankful for, and a grown-up writes it on a slip. The slips go in the Thankful Jar at the end, and at dinner each kid pulls one out and reads it to the table. Little ones can draw theirs.</p>'],
      ['A house full of cousins', `<ul class="tips">
<li><b>Pair big with little.</b> An 8 year old reads, a 4 year old finds. Everyone gets a job.</li>
<li><b>Keep clues away from the kitchen rush.</b> Stick to rooms where the cooking isn’t happening, and never put a clue on the stove.</li>
<li><b>Run it while the turkey rests.</b> That half hour is the perfect length for an eight-clue hunt.</li>
</ul>`],
      ['Keep the holiday going', '<p>A pretend Chef’s Kitchen or Grocery Store keeps little cooks busy while the real cooking happens, and the Christmas hunt is ready for next month.</p>{LINKS:chefs-kitchen-pretend-play=Chef’s Kitchen pretend play,grocery-store-pretend-play=Grocery Store pretend play,christmas-scavenger-hunt=Christmas scavenger hunt}'],
    ],
    faq: [
      ['How long should a Thanksgiving scavenger hunt take?', 'About 20 minutes with eight clues, which fits neatly into the time the turkey rests before carving.'],
      ['What can I put at the end of a Thanksgiving hunt?', 'A Thankful Jar with a small treat for each kid and slips to write what they’re thankful for, to read at dinner.'],
    ],
  },
  {
    slug: 'classroom-scavenger-hunt',
    group: 'occasion',
    short: 'Classroom hunt',
    title: 'Classroom Scavenger Hunt: Free Rhyming Clues for Preschool to Grade 2',
    description: 'A classroom scavenger hunt for preschool, kindergarten and grades 1 to 2: 8 free rhyming clues for classroom spots, how to run it with 20 kids, and learning twists.',
    h1: 'Classroom scavenger hunt for preschool to grade 2',
    lede: 'A classroom hunt works for the first week of school, a class party, indoor recess or the last day before a break. Here are eight rhyming clues for spots every classroom has, and how to run it with twenty kids without chaos.',
    cta: [{ pick: 'hunt' }, 'Make a printable hunt'],
    clueIntro: 'Hide each clue at the answer to the clue before it. The treasure waits on the circle-time rug.',
    clues: [
      { label: 'Class library', pic: '📚', riddle: ['Where do the stories sit snug in a row?', 'Check the class library, the readers all know!'], tip: 'Between two picture books' },
      { label: 'Pencil sharpener', pic: '✏️', riddle: ['It grinds and it whirrs till your pencil is sharp,', 'Check by the sharpener, it hums like a harp!'], tip: 'Taped beside the sharpener' },
      { label: 'Calendar', pic: '📅', riddle: ['Monday and Tuesday, the days in a row,', 'Check the class calendar, it’s where they all go!'], tip: 'Pinned under today’s date' },
      { label: 'Cubbies', pic: '🎒', riddle: ['Where do your backpack and lunchbox all wait?', 'Look in the cubbies, but don’t be late!'], tip: 'In an empty cubby' },
      { label: 'Sink', pic: '🧼', riddle: ['Scrub away paint and the glue and the mud,', 'Check by the class sink with soap and with suds!'], tip: 'Taped above the sink' },
      { label: 'Whiteboard', pic: '🖍️', riddle: ['It’s big and it’s white and we write with a pen,', 'Check by the whiteboard, wipe clean, start again!'], tip: 'On the marker tray' },
      { label: 'Teacher’s desk', pic: '⭐', riddle: ['Who has the stickers, the stamps and gold stars?', 'Check by the teacher’s desk, look near the jars!'], tip: 'Next to the sticker jar' },
      { label: 'Circle-time rug', pic: '🏆', riddle: ['Great job, detectives, you worked as a crew,', 'Now sit on the rug, there’s a treasure for you!'], tip: 'The treasure: on the rug at circle time' },
    ],
    sections: [
      ['Running it with a whole class', `<ul class="tips">
<li><b>Teams of four.</b> Give each team a color and its own set of cards.</li>
<li><b>Staggered starts.</b> Each team starts at a different clue and loops around, so five teams are never at the sharpener at once. All the trails end on the rug.</li>
<li><b>One job each.</b> A reader, a finder, a card keeper and a leader. Swap jobs at every clue.</li>
</ul>`],
      ['Learning twists', `<ul class="tips">
<li><b>Sight words:</b> add a sight word to each card; the team reads it before moving on.</li>
<li><b>Letter hunt:</b> each clue holds a letter; at the end, teams unscramble them into a word.</li>
<li><b>Math lock:</b> the next spot only comes after solving a sum, like 3 + 2 = the cubby number.</li>
<li><b>New classroom tour:</b> in the first week, the trail doubles as a tour of where everything lives.</li>
</ul>`],
      ['Pretend play centers', '<p>The same printables make dramatic play centers: a class post office for writing letters, a library for checking out books, a grocery store for counting money, or a doctor’s clinic for caring for stuffed animals.</p>{LINKS:post-office-pretend-play=Post Office,library-pretend-play=Library,grocery-store-pretend-play=Grocery Store,doctors-clinic-pretend-play=Doctor’s Clinic}'],
    ],
    faq: [
      ['How do you do a scavenger hunt with a whole class?', 'Split the class into teams of four, give each team its own colored cards and start each team at a different clue so they don’t crowd the same spot. All trails end at the same treasure.'],
      ['How long does a classroom scavenger hunt take?', 'About 20 minutes with eight clues, plus five minutes to hide the cards before the kids come in.'],
    ],
  },
  {
    slug: 'christmas-eve-scavenger-hunt',
    group: 'occasion',
    short: 'Christmas Eve hunt',
    title: 'Christmas Eve Scavenger Hunt for Kids: Free Bedtime Clues and a Christmas Eve Box',
    description: 'A Christmas Eve scavenger hunt for ages 3 to 8: 8 free rhyming clues that get ready for Santa and end in bed, Christmas Eve box ideas and a free printable.',
    h1: 'Christmas Eve scavenger hunt for kids',
    lede: 'Christmas Eve is the longest night of the year for a 5 year old. This hunt turns the wait into a game: the first clues get the house ready for Santa, the last ones lead through bath, pajamas and into bed, where a Christmas Eve box is waiting.',
    cta: [{ theme: 'christmas' }, 'Make a personalized Christmas hunt'],
    clueIntro: 'Hide each clue at the answer to the clue before it, while the kids are busy after dinner. Hand them the first card and the trail ends on their pillow.',
    clues: [
      { label: 'Christmas tree', pic: '🎄', riddle: ['Twinkly lights and a star at the top,', 'Look under the tree, it’s your very first stop!'], tip: 'Under the tree skirt, beside the presents (no peeking!)' },
      { label: 'Stocking', pic: '🧦', riddle: ['It hangs nice and empty, it’s waiting for you,', 'Peek in your stocking, it’s holding a clue!'], tip: 'Tucked in the top of a stocking (never over a lit fire)' },
      { label: 'Cookie plate', pic: '🍪', riddle: ['Santa gets peckish from flying all night,', 'Look by his cookie plate, ready to bite!'], tip: 'Under the empty plate you’ll fill with cookies together' },
      { label: 'Reindeer carrots', pic: '🥕', riddle: ['The reindeer get hungry, they nibble and munch,', 'Look by the carrots, they love a good crunch!'], tip: 'In the fridge drawer, next to the carrots for the reindeer' },
      { label: 'Window', pic: '🪟', riddle: ['Is something up there, way up high in the sky?', 'Check by the window for sleighs flying by!'], tip: 'Taped low on a window that looks out at the sky' },
      { label: 'Bathtub', pic: '🛁', riddle: ['Bubbles and splashes to wash off the day,', 'Look by the bathtub where bath toys all play!'], tip: 'On the edge of the tub, before the water goes in' },
      { label: 'Pajamas', pic: '👕', riddle: ['Snuggly and soft for a long winter’s night,', 'Look where your pajamas are folded up tight!'], tip: 'On top of the pajamas (or the new Christmas Eve pair)' },
      { label: 'Pillow', pic: '🛏️', riddle: ['You found every clue, now it’s time for your bed,', 'Look on your pillow, there’s a gift by your head!'], tip: 'The treasure: a Christmas Eve box on the pillow' },
    ],
    sections: [
      ['A hunt that ends in bed', `<p>Most hunts wind kids up. This one winds them down. The first four clues are jobs for Santa’s arrival: check the tree, find the stockings, set out the cookie plate and the carrots for the reindeer. Then the trail turns toward bedtime, with a last look out the window for the sleigh, a bath, pajamas and a pillow.</p>
<ul class="tips">
<li><b>Start after dinner.</b> About an hour before bed gives you 20 minutes of hunt and a slow, happy bedtime.</li>
<li><b>Do each job at its stop.</b> Fill the cookie plate, put the carrots out, wave at the sky. The hunt does the Christmas Eve to-do list for you.</li>
<li><b>Dim the lights as you go.</b> Bright rooms for the Santa clues, soft lamps for the bedtime ones.</li>
</ul>`],
      ['What to put in a Christmas Eve box', `<p>A Christmas Eve box is a small gift opened the night before: something to wear to bed, something to read in it. Any shoebox works. A few ideas:</p>
<ul class="tips">
<li>New pajamas or cozy socks to wear tonight.</li>
<li>A Christmas book to read together in bed.</li>
<li>A hot cocoa packet and a special mug for tomorrow morning.</li>
<li>A small flashlight for spotting the sleigh from the window.</li>
<li>A note from the elves saying Santa is on his way.</li>
</ul>
<p>For kids under 3, skip anything small enough to fit in their mouth, and keep the box to pajamas and a book.</p>`],
      ['Keep it calm and safe', `<ul class="tips">
<li><b>Hide clues while they’re busy.</b> Five minutes during dinner cleanup is enough.</li>
<li><b>No clues near candles, a lit fire or the oven.</b> If the stockings hang over a fireplace you’re using, hide that clue in a stocking somewhere else.</li>
<li><b>Bigger kids read, little ones find.</b> With siblings, the reader reads the rhyme and the youngest gets to pull the card out.</li>
<li><b>Same night next year.</b> Keep the cards in the Christmas box. A hunt that happens every year becomes a family tradition.</li>
</ul>`],
      ['More Christmas play', '<p>Make the days before Christmas count too: a Christmas hunt with a story from Santa’s elves, a pretend Santa’s Workshop for wrapping and toy making, or a snowy Ice Kingdom hunt for a cold afternoon. Our printed Christmas hunt has your kid’s name on every page and arrives by email in minutes.</p>{LINKS:christmas-scavenger-hunt=Christmas scavenger hunt,santas-workshop-pretend-play=Santa’s Workshop pretend play,ice-kingdom-scavenger-hunt=Ice Kingdom scavenger hunt}{CTA}'],
    ],
    faq: [
      ['When should you do a Christmas Eve scavenger hunt?', 'After dinner, about an hour before bed. Eight clues take about 20 minutes, and because the last clues are the bath, pajamas and the pillow, the hunt ends right at bedtime.'],
      ['What goes in a Christmas Eve box?', 'Usually new pajamas, a Christmas book to read in bed and a small treat like a hot cocoa packet. Keep it small: the big presents are for the morning.'],
      ['Can a 3 year old do a Christmas Eve hunt?', 'Yes. Read the rhymes out loud and use the free printable, which has a picture of the hiding spot on every card so little ones can find it themselves.'],
    ],
  },
  {
    slug: 'new-years-eve-scavenger-hunt',
    group: 'occasion',
    short: 'New Year’s Eve hunt',
    title: 'New Year’s Eve Scavenger Hunt for Kids: Free Countdown Clues and a Countdown Box',
    description: 'A New Year’s Eve scavenger hunt for kids ages 3 to 8: 8 free rhyming clues that look back at the year, an early countdown kids can stay up for and a free printable.',
    h1: 'New Year’s Eve scavenger hunt for kids',
    lede: 'Midnight is a long way off when you’re 4. This hunt gives New Year’s Eve its own kid-sized countdown: eight clues that look back at the year, ending in a countdown box of hats and noisemakers, with the big cheer at a time little ones can actually stay up for.',
    cta: [{ theme: 'space' }, 'Make a personalized countdown hunt'],
    clueIntro: 'Hide each clue at the answer to the clue before it. Start about an hour before your countdown, and the last card leads to the countdown box.',
    clues: [
      { label: 'Calendar', pic: '📅', riddle: ['From January to December, the year’s almost through,', 'Check by the calendar, it’s hiding a clue!'], tip: 'Pinned to the last page of this year’s calendar' },
      { label: 'Clock', pic: '⏰', riddle: ['Tick-tock, tick-tock, it keeps counting the time,', 'Look by the clock for the next little rhyme!'], tip: 'Next to a wall clock or a clock on a shelf' },
      { label: 'Family photos', pic: '🖼️', riddle: ['Remember the beach and the snow and the zoo?', 'Look by our photos, a year full of you!'], tip: 'Under a fridge magnet holding a family photo' },
      { label: 'Shoes', pic: '👟', riddle: ['They walked you to school and the park every day,', 'Look in your shoes for the clue tucked away!'], tip: 'In a shoe by the front door' },
      { label: 'Bookshelf', pic: '📚', riddle: ['Which was the story you loved best this year?', 'Look on the bookshelf, the next clue is here!'], tip: 'Inside the favorite book of the year' },
      { label: 'Sparkling juice', pic: '🧃', riddle: ['It’s bubbly and fizzy, we’ll toast with a cheer,', 'Look by the juice for a clink at New Year!'], tip: 'In the fridge door, next to the sparkling juice for the toast' },
      { label: 'Window', pic: '🎆', riddle: ['Bang, pop and sparkle, the sky’s full of light,', 'Check by the window for fireworks tonight!'], tip: 'Taped low on a window' },
      { label: 'Countdown box', pic: '🎉', riddle: ['You found every clue and the countdown is near,', 'Look under the cushion and shout Happy New Year!'], tip: 'The treasure: a countdown box under a couch cushion' },
    ],
    sections: [
      ['An early countdown kids can stay up for', `<p>Most kids under 8 won’t make it to midnight, and they don’t need to. Pick a countdown time that fits bedtime, like 7 or 8 o’clock, and treat it as the real thing. Little kids can’t read a clock, so nobody will know.</p>
<ul class="tips">
<li><b>Start an hour before.</b> Twenty minutes of hunt, a few minutes to open the countdown box, then hats on for the countdown.</li>
<li><b>Count down out loud from 10.</b> Everyone shouts the numbers, then “Happy New Year!” with noisemakers and a juice toast.</li>
<li><b>Noon Year’s Eve.</b> For toddlers or a playdate, run the whole hunt in the morning and count down to lunch at 12.</li>
</ul>`],
      ['The look-back twist', '<p>Every clue on this trail is something from the year: the calendar, the clock, the family photos, the shoes that walked to school, the favorite book. At each stop, the finder says one favorite thing from the year, and a grown-up writes it on a slip. Put the slips in a jar or an envelope marked with next year’s date and open it next New Year’s Eve. Little ones can draw theirs.</p>'],
      ['What to put in the countdown box', `<p>Any shoebox works. Wrap it, write the new year on the lid and fill it with things for the countdown:</p>
<ul class="tips">
<li>Party hats and paper crowns for everyone.</li>
<li>Noisemakers or a pot and wooden spoon for each kid.</li>
<li>Paper confetti they make themselves with a hole punch (it vacuums up easily).</li>
<li>Sparkling juice and fancy plastic cups for the toast.</li>
<li>A new calendar to decorate with birthdays and big days for next year.</li>
</ul>
<p>Leave out balloons for kids under 8: popped or uninflated balloons are a choking risk. Skip glow sticks for kids who still chew things.</p>`],
      ['More winter play', '<p>A countdown is the start of every rocket launch, so an Outer Space hunt or a pretend Mission Control fits the night too. For the cold days after, try a snowy Ice Kingdom hunt. Our printed hunts have your kid’s name on every page and arrive by email in minutes.</p>{LINKS:outer-space-scavenger-hunt=Outer Space scavenger hunt,mission-control-pretend-play=Mission Control pretend play,ice-kingdom-scavenger-hunt=Ice Kingdom scavenger hunt,christmas-eve-scavenger-hunt=Christmas Eve scavenger hunt}{CTA}'],
    ],
    faq: [
      ['How do you celebrate New Year’s Eve with young kids?', 'Pick an early countdown time, like 7 or 8 o’clock, and treat it as midnight. A scavenger hunt an hour before fills the evening, ends with hats and noisemakers in a countdown box, and gets everyone to bed on time.'],
      ['What is a Noon Year’s Eve?', 'A New Year’s countdown held at 12 noon instead of midnight, so toddlers and preschoolers can join in. Run the hunt in the morning and count down to lunch.'],
      ['Can a 3 year old do a New Year’s Eve hunt?', 'Yes. Read the rhymes out loud and use the free printable, which has a picture of the hiding spot on every card so little ones can find it themselves.'],
    ],
  },
];

module.exports = { GUIDES };
