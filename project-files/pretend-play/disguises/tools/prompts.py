# Photo booth disguises: two props per play kit to cut out and tape onto a stick, held in
# front of the face for pretend play and photos. Made with gemini-3.1-flash-image (cheaper than
# Pro; flat props don't need Pro). id -> [(slot, aspect, prompt), ...]; slot 1 is worn on the
# head (hat, ears), slot 2 on the face (glasses, mustache, nose). Pale props go on chroma green.
STYLE = 'Children\'s storybook illustration in soft watercolor and colored pencil, warm and friendly, gentle dark outlines, bright cheerful colors, cute rounded shapes. A single cut-out photo booth prop, shown flat and straight from the front, life size for a child, '
END = ' Only the one prop, no stick or handle, no person, no face, no hands. Isolated on a pure white background with a wide white margin. No text, no letters, no numbers, no logos, no cast shadow.'
GREEN_END = ' Only the one prop, no stick or handle, no person, no face, no hands. Isolated on a solid flat pure chroma-key green (#00FF00) background with a wide margin. No green anywhere on the prop. No text, no letters, no numbers, no logos, no cast shadow.'
P = {
 'auto': [('1', '4:3', 'an orange mechanic\'s baseball cap with a little silver wrench patch on the front.'), ('2', '16:9', 'a thick brown handlebar mustache with curled tips and one small smudge of black grease.')],
 'burger': [('1', '16:9', 'a white folded paper diner hat (soda fountain style) with a red stripe along the bottom edge.'), ('2', '16:9', 'a big curly mustache colored mustard yellow, like it is made of mustard.')],
 'christmas': [('1', '4:3', 'a red Santa hat with fluffy white fur trim and a white pom-pom flopping to one side.'), ('2', '1:1', 'a big fluffy white Santa beard with a curly white mustache on top, with an open gap for the mouth.')],
 'coffee': [('1', '4:3', 'a soft black barista beret tilted to one side, with a tiny brown coffee bean pin.'), ('2', '16:9', 'a pair of round tortoiseshell glasses with clear lenses.')],
 'construction': [('1', '4:3', 'a shiny yellow construction hard hat with a raised ridge down the middle and a short brim.'), ('2', '16:9', 'a pair of bright orange safety goggles with clear lenses and a wide strap stub on each side.')],
 'dentist': [('1', '16:9', 'a dentist\'s head mirror: a round shiny silver mirror on a white headband.'), ('2', '16:9', 'a huge goofy smile showing a row of big sparkling white teeth between pink lips.')],
 'dino': [('1', '4:3', 'a khaki safari explorer hat with a brown band and a little green dinosaur footprint badge.'), ('2', '16:9', 'a green T-rex mouth with a big toothy grin, a row of pointy white teeth, cute not scary.')],
 'easter': [('1', '3:4', 'a pair of tall fluffy white bunny ears with pink insides, on a little pink headband.'), ('2', '16:9', 'a pink bunny nose with two buck teeth below it and long white whiskers on each side.')],
 'fire': [('1', '4:3', 'a red firefighter helmet seen from the front with a long back brim and a plain blank gold shield on the front.'), ('2', '16:9', 'a big bushy ginger walrus mustache.')],
 'grocery': [('1', '4:3', 'a green grocer\'s cap with a little carrot pin on the side.'), ('2', '16:9', 'a pair of funny glasses whose two lenses are juicy lemon slices.')],
 'halloween': [('1', '4:3', 'a tall purple witch hat with a crooked tip, an orange band and a little gold buckle.'), ('2', '16:9', 'a friendly vampire smile: red lips with two little white fangs, cute not scary.')],
 'hero': [('1', '16:9', 'a red superhero eye mask with two eye holes and pointed outer corners, with a small gold star in the middle.'), ('2', '16:9', 'a pair of silver super-scientist goggles with glowing blue lenses.')],
 'ice': [('1', '16:9', 'a sparkling icy blue tiara made of snowflakes and ice crystals.'), ('2', '16:9', 'a pair of glasses with icy blue frames shaped like two snowflakes.')],
 'italian': [('1', '3:4', 'a tall puffy white chef hat.'), ('2', '16:9', 'a black curly mustache with big round curls at the ends.')],
 'library': [('1', '4:3', 'a brown hair bun with two yellow pencils stuck through it.'), ('2', '16:9', 'a pair of big red cat-eye reading glasses with little sparkles on the corners.')],
 'mermaid': [('1', '16:9', 'a mermaid tiara made of pink and gold seashells and white pearls.'), ('2', '16:9', 'a pair of sunglasses with two orange starfish as frames and light blue lenses.')],
 'petshop': [('1', '16:9', 'a pair of floppy brown puppy ears on a brown headband.'), ('2', '16:9', 'a shiny black puppy nose with a pink tongue sticking out below it.')],
 'pirate': [('1', '16:9', 'a black pirate tricorn hat with gold trim and a small white skull and crossbones.'), ('2', '1:1', 'a bushy black pirate beard and mustache with an open gap for the mouth.')],
 'pizza': [('1', '4:3', 'a red pizza delivery cap with a little pizza slice patch on the front.'), ('2', '16:9', 'a pair of funny glasses whose two lenses are round pepperoni slices.')],
 'police': [('1', '4:3', 'a navy blue police cap with a shiny black brim and a plain blank gold badge on the front.'), ('2', '16:9', 'a pair of gold aviator sunglasses with dark lenses.')],
 'post': [('1', '4:3', 'a blue mail carrier cap with a little white envelope patch on the front.'), ('2', '16:9', 'a big grey walrus mustache.')],
 'racecar': [('1', '4:3', 'a red racing team baseball cap with a black and white checkered brim.'), ('2', '16:9', 'a pair of vintage brown leather racing goggles with round lenses.')],
 'royal': [('1', '4:3', 'a gold royal crown with red and blue jewels and white pearls on the points.'), ('2', '16:9', 'a gold masquerade eye mask with two eye holes and lilac swirls.')],
 'space': [('1', '4:3', 'a headband with two bouncy green alien antennae topped with glowing balls.'), ('2', '16:9', 'a pair of sunglasses with frames shaped like two yellow stars and dark blue lenses.')],
 'unicorn': [('1', '16:9', 'a flower crown of pastel roses and daisies with rainbow ribbons hanging down the sides.'), ('2', '16:9', 'a pair of sunglasses with pink heart-shaped frames and rainbow lenses.')],
 'valentine': [('1', '4:3', 'a red headband with two bouncy red hearts on springs.'), ('2', '16:9', 'a pair of big glossy red lips puckered for a kiss.')],
 'vet': [('1', '16:9', 'a teal surgical scrub cap with little white paw prints, a rounded cap shape seen from the front.'), ('2', '16:9', 'a pink kitty nose with a little smiling mouth and long black whiskers on each side.')],
}
# Pale props that melt into a white backdrop.
GREEN = {('burger', '1'), ('christmas', '1'), ('christmas', '2'), ('easter', '1'), ('italian', '1'), ('ice', '1'), ('dentist', '2'), ('unicorn', '1'), ('mermaid', '1'), ('easter', '2')}
