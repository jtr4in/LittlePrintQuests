// Play Kit ideas for the Library kit.
module.exports = {
  scenarios: [
    { title: 'Busy Borrowing Day', setup: 'Line up four stuffed animals by the Check Out Here sign with a pile of real books and the Checkout Desk.', say: 'Hello, Librarian {name}! Can I borrow this book, please?', twist: 'Everyone wants the same dinosaur book. Who gets it first, and when is it due back?' },
    { title: 'Story Time on the Rug', setup: 'Tape up the Story Time sign and sit the toys on a rug in front of the Reading Corner.', say: 'Is it story time yet? Can you read us a funny one?', twist: 'The Story Spinner lands on Pirates, but there’s no pirate book! Can you make one up instead?' },
    { title: 'Shh! Quiet Please', setup: 'Tape up the Quiet Please sign and give a noisy toy a book to read.', say: 'ROAR! Oops… I mean, roar. Is this the quiet part of the library?', twist: 'The noisy toy starts snoring! How does the librarian wake them up very quietly?' },
    { title: 'Missing Book Mystery', setup: 'Hide a book somewhere in the room and tape up the Missing Book Posters.', say: 'Librarian {name}, I can’t find The Dragon Book anywhere! Can you help?', twist: 'The missing book turns up in a very silly place. Where was it hiding?' },
    { title: 'Return It on Time', setup: 'Make a returns box with the Return Books Here sign and fill in some Checkout Slips.', say: 'I’m bringing my book back. Am I on time?', twist: 'The book is a tiny bit late. Is there a one-coin late fee, or does the librarian let it go?' },
    { title: 'New Library Card', setup: 'Cut out the Library Cards and grab a crayon or stamp.', say: 'I’ve never been here before. Can I get my very own library card?', twist: 'The reader can’t spell their name. Can the librarian help write it?' },
    { title: 'Book Review Time', setup: 'Give each toy a book and a Book Review form.', say: 'I finished my book! It had magic AND a hero. Can I write a review?', twist: 'Two toys read the same book and disagree. One loved it and one was bored!' },
    { title: 'Book Fair Shopping', setup: 'Tape up the Book Fair board and share out the Book Fair Coins.', say: 'How many coins for a bookmark and a picture book, please?', twist: 'The reader only has three coins. What can they buy?' },
  ],
  lines: {
    kid: [
      'Welcome to my library! What do you like to read?',
      'Can I see your library card, please?',
      'This book is due back next week.',
      'Shh! Quiet voices in the library, please.',
      'Story time starts in five minutes!',
      'Happy reading! Come back soon!',
    ],
    grownup: [
      'Librarian {name}, do you have any books about dinosaurs?',
      'Can I borrow three books today?',
      'Oops, my book is late. What do I do?',
      'Can you stamp my library card, please?',
      'What’s your favorite book in the whole library?',
      'Can you read me a story before I go?',
    ],
  },
  games: [
    { title: 'Shelf Sort', how: 'Mix up a pile of books. Your child sorts each one onto the shelf with the right Shelf Label.', uses: 'Shelf Labels, real books' },
    { title: 'Spin a Story', how: 'Spin the Story Spinner, then find a book of that kind or make up a story about it together.', uses: 'Story Spinner, Reading Corner sign' },
    { title: 'Due Date Count', how: 'Fill in a Checkout Slip and count the days on a calendar until the book is due back.', uses: 'Checkout Slip cards, Checkout Desk' },
    { title: 'Book Hunt', how: 'Hide the missing books from the posters around the room. Find them all and return them to the returns box.', uses: 'Missing Book Posters, Return Books Here sign' },
    { title: 'Book Fair Shop', how: 'Pick two things from the Book Fair board. Count out the coins together and ring them up.', uses: 'Book Fair board, Book Fair Coins, Checkout Desk' },
  ],
};
