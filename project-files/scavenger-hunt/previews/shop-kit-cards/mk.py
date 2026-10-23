import json
HEAD = ("Create a photorealistic lifestyle photo for a product card, landscape 4:3: a perfectly styled pretend {shop} that a creative "
"Instagram mom set up for her child in a bright, airy Scandinavian home, soft natural window light, warm neutral palette, light oak "
"and white surfaces, styled like a premium Etsy listing photo. Close, slightly overhead three-quarter view. The star of the photo is "
"{star}, large and centered, filling about half the frame so it reads clearly even as a small thumbnail.\n\n"
"The printed paper pieces in the images above were printed on cardstock, cut out neatly along their outlines with scissors and used as "
"real parts of the play. Reproduce each one exactly as given (same artwork, colors and words), cut to its own shape, flat paper with a "
"subtle paper edge. Leave out any instruction text, 'best on cardstock' badges and page titles; show only the cut-out artwork:\n")
TAIL = ("\nNo cash register, no real money. No faces (a child's hands and sleeves only). No other text or logos anywhere. "
"Every printed piece must be sharp, uncovered and facing the camera as much as possible. Uncluttered, airy composition with soft shadows.")
K = {
 'pizza': ('pizzeria', 'a big round paper pizza on a wooden peel being topped with felt toppings', ['pizza','sign','oven'], [
  "Image 1 (round pizza, already cut along the dashed slice lines): lying on a real wooden pizza peel on the counter, the slices pulled slightly apart, with felt pepperoni, felt basil and felt cheese being placed on top.",
  "Image 2 (shop sign, a 3:2 card NOT a long strip): standing in a small wooden easel frame behind the pizza.",
  "Image 3 (brick oven): glued onto the front of a cardboard box in the soft-focus background, with a real arched opening cut where the oven mouth is."],
  "Props: small wooden bowls of felt toppings, a linen tea towel, a rolling pin, a small plant. A small child's hands in a striped sleeve add a felt pepperoni."),
 'burger': ('burger shack', 'a tall stacked burger made from the cut-out paper layers', ['stack','orders','sign','open'], [
  "Image 1 (burger layers, each layer cut out separately: top bun, lettuce, tomato, cheese, patty, onion, pickles, bottom bun): stacked into one tall cheerful burger on a small wooden board, layers slightly offset like a real burger, with a paper flag pick on top.",
  "Image 2 (burger order cards, cut apart into separate cards): two or three cards fanned out on the counter next to the burger.",
  "Image 3 (shop sign, a 3:2 card NOT a long strip): standing in a small wooden frame in the background.",
  "Image 4 (Open sign): hanging from twine on a hook in the background."],
  "Props: a paper fries cone, a kids' paper milkshake cup with a striped straw, a small spatula. A child's hand in a striped sleeve places the top bun."),
 'grocery': ('grocery store', 'a woven basket full of the cut-out play food cards, each with its little price tag', ['food','basket','produce','sign'], [
  "Image 1 (play food cards, cut apart: apple, banana, strawberries, grapes, watermelon, carrot, broccoli, corn, tomato, each with its price tag): about eight of them standing and leaning in a shallow wooden produce crate and spilling into a small woven basket.",
  "Image 2 (green shopping basket card, front piece only): held up by a child's hand next to the crate.",
  "Image 3 (Produce sign): clipped with a mini wooden peg to the front of the crate.",
  "Image 4 (store sign, a 3:2 card NOT a long strip): in a small wooden frame in the soft-focus background."],
  "Props: a few real apples and a carrot, a linen tote bag, a little chalkboard. A child's hand in a striped sleeve reaches for a card."),
 'post': ('post office', 'a little cardboard mailbox with a postcard, stamped and addressed, being posted through its slot', ['postcards','stamps','mail','sign'], [
  "Image 1 (postcards, cut apart into separate postcards): one postcard being pushed into the slot of a red-painted cardboard box mailbox by a child's hand; two more lying on the counter.",
  "Image 2 (sheet of play stamps, cut apart): a few stamps stuck in the corners of the postcards, the rest in a small dish.",
  "Image 3 (Mail sign): taped onto the front of the cardboard mailbox.",
  "Image 4 (post office sign, a 3:2 card NOT a long strip): in a small wooden frame behind."],
  "Props: kraft envelopes tied with twine, a rubber stamp and ink pad, a small parcel. A child's hand in a striped sleeve posts the card."),
 'library': ('library', 'a cozy reading nook where library cards and a story spinner sit on a stack of real picture books', ['cards','spinner','checkout','sign'], [
  "Image 1 (library cards, cut apart into separate cards): two or three cards tucked into kraft pockets inside the front covers of picture books.",
  "Image 2 (Story Spinner, the two circles assembled with a brass split pin into one spinner wheel): lying on top of a neat stack of colorful picture books, large and clear.",
  "Image 3 (Check Out Here sign): folded into a tent card on a small wooden desk.",
  "Image 4 (library sign, a 3:2 card NOT a long strip): in a small wooden frame on the shelf behind."],
  "Props: a low wooden bookshelf with face-out picture books, a small floor cushion, a rubber date stamp. A child's hand in a striped sleeve spins the wheel."),
 'police': ('police station', 'a cardboard box police car with the round Police Patrol steering wheel mounted on its front', ['wheel','teddy','sign'], [
  "Image 1 (round Police Patrol steering wheel with the name MAYA): glued onto a circle of cardboard and fixed with a split pin to the front panel of a big cardboard box car, so it can turn; the wheel is large and faces the camera. Do NOT glue anything else flat onto the box.",
  "Image 2 (Lost and Found card with the pull strip): lying on the seat of the box car next to a small teddy bear.",
  "Image 3 (police station sign, a 3:2 card NOT a long strip): in a small wooden frame on the wall behind."],
  "Props: paper-plate headlights on the box, a toy walkie-talkie, a navy kids' cap. A child's hands in a navy sleeve hold the wheel."),
 'dentist': ('dental office', 'the big open smile mat being brushed with a real toothbrush', ['smile','bag','brush','sign'], [
  "Image 1 (big open smile with white teeth): lying flat on a white table in a clear sheet protector, with a few little dry-erase 'sugar bug' dots on the teeth, large and centered.",
  "Image 2 (Dr. Maya's bag, front piece only): standing at the side of the smile.",
  "Image 3 (Brush Twice a Day sign): taped to the wall behind.",
  "Image 4 (dental office sign, a 3:2 card NOT a long strip): in a small wooden frame in the background."],
  "Props: a big kids' toothbrush, a small mirror, a glass with toothbrushes, a white hand towel. A child's hand in a striped sleeve brushes the paper teeth with the big toothbrush."),
 'petshop': ('pet shop', 'a fluffy stuffed puppy sitting next to its filled-in adoption papers', ['adoption','bath','adopt','sign'], [
  "Image 1 (adoption papers, cut apart into separate cards): one card, folded in half like a little booklet, standing open in front of a fluffy stuffed puppy, another on a clipboard.",
  "Image 2 (Bath Time card with the pull strip): lying beside a small tin tub with bubbles and a toy rubber duck.",
  "Image 3 (Adopt a Pet sign): clipped with a peg to the front of a woven pet basket.",
  "Image 4 (pet shop sign, a 3:2 card NOT a long strip): in a small wooden frame behind."],
  "Props: a woven pet basket with a knitted blanket, a soft brush, a small bow, a stuffed kitten. A child's hand in a striped sleeve pets the puppy."),
 'coffee': ('cafe', 'a barista counter with the Drink Spinner and a tip jar wearing its sign', ['spinner','menu','tipjar','sign'], [
  "Image 1 (Drink Spinner, both circles assembled with a brass split pin into one wheel): standing upright on a little wooden easel on the counter, large and clear.",
  "Image 2 (cafe menu): in a slim wooden clipboard leaning against the wall.",
  "Image 3 (Tip Jar sign, cut to a small label): taped onto a real glass mason jar with a few wooden coins inside.",
  "Image 4 (cafe sign, a 3:2 card NOT a long strip): in a small wooden frame in the background."],
  "Props: small ceramic mugs, a toy milk jug, wooden play cupcakes and a gingerbread cookie on a cake stand. A child's hand in a striped sleeve spins the drink wheel."),
 'italian': ('Italian trattoria', 'the paper stovetop with a real little pot of yarn spaghetti on one burner', ['stove','pot','check','sign'], [
  "Image 1 (black four-burner stovetop): glued onto the top of a low cardboard box so the box becomes a play stove, large and centered; a small real metal kids' pot full of yellow yarn spaghetti sits on one burner.",
  "Image 2 (Pasta Time card with the pull strip): lying beside the stove.",
  "Image 3 (guest check order pad, cut into one guest check): on a small clipboard on a red checked tablecloth.",
  "Image 4 (trattoria sign, a 3:2 card NOT a long strip): in a small wooden frame on the wall behind."],
  "Props: a red checked napkin, a wooden spoon, a toy baguette, a little bowl of yarn spaghetti with felt meatballs. A child's hand in a striped sleeve stirs the pot."),
 'auto': ('auto repair shop', 'a toy car getting washed at a cardboard car wash with the Car Wash sign', ['carwash','toolbox','checkup','sign'], [
  "Image 1 (Car Wash sign): mounted on the top of a cardboard box car wash tunnel with strips of blue tissue paper hanging at the entrance, large and clear.",
  "Image 2 (Mechanic's Toolbox, front piece only): standing at the side on the workbench.",
  "Image 3 (car check-up form, cut into one form): on a small clipboard with a pencil.",
  "Image 4 (auto shop sign, a 3:2 card NOT a long strip): in a small wooden frame on the wall behind."],
  "Props: a wooden toy car with soap bubbles on it, a small sponge, a toy wrench, a bucket. A child's hand in a striped sleeve scrubs the toy car with the sponge."),
}
json.dump({k: v[2] for k, v in K.items()}, open('refs.json', 'w'))
for k, (shop, star, refs, lines, props) in K.items():
    open(f'prompts/{k}.txt', 'w').write(HEAD.format(shop=shop, star=star) + '\n'.join('- ' + l for l in lines) + '\n\n' + props + TAIL)
