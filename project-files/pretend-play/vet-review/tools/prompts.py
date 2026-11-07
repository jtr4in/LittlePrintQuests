# Jobs for gen.py: (name, aspect ratio, prompt, reference picture or None).
STYLE = "Children's storybook illustration in soft watercolor and colored pencil, warm and friendly, gentle dark outlines, bright cheerful colors, cute rounded shapes, matching the style of the reference picture if one is given. "
END = " One picture only, centered, isolated on a pure white background with a wide white margin. No text, no letters, no numbers, no logos, no cast shadow. Absolutely no faces, eyes, smiles or blushing cheeks on any object (animals may have their normal faces)."
A = 'src/kits/art/vet/'
EDIT = 'Redraw the object in the reference picture in exactly the same style, colors and shape, but as a plain object with no face: no eyes, no mouth, no smile, no cheeks. '
FILL_END = " No text, no letters, no numbers, no logos. No faces on any food."
JOBS = [
 ('check-up', '1:1', EDIT + 'A doctor stethoscope with grey-blue tubing and a shiny round silver chest piece.', A + 'check-up.webp'),
 ('x-ray', '1:1', EDIT + 'A cream colored dog bone.', A + 'x-ray.webp'),
 ('teeth', '1:1', EDIT + 'A clean white tooth with a few little sparkles around it.', A + 'teeth.webp'),
 ('claw-trim', '1:1', 'A pair of small pet nail clippers with teal handles, the kind a vet uses to trim a dog\'s claws.', A + 'claw-trim.webp'),
 ('moon', '1:1', EDIT + 'A pale yellow crescent moon wearing a blue sleeping cap, with a few little stars.', A + '1f319.webp'),
 ('surgery', '1:1', 'A vet surgery tray: a shiny silver tray holding a folded blue surgical mask, a blue surgical cap, small rounded scissors and a roll of white gauze.', A + 'bubble-bath.webp'),
 ('pet-food', '1:1', 'A round blue pet food bowl heaped with brown dog kibble, with a little white paw print on the side of the bowl.', A + 'bubble-bath.webp'),
 ('x-ray-machine', '1:1', 'A cute vet X-ray light box on a short stand: a dark blue glowing screen showing a white dog skeleton X-ray, with a row of three round colored buttons (green, yellow, red) under the screen.', A + 'bubble-bath.webp'),
 ('medicine', '1:1', 'Three pet medicine bottles side by side: a brown glass bottle with a white label showing a red cross, a white pill bottle with a teal cap, and a small dropper bottle.', A + 'bubble-bath.webp'),
 ('cleaning', '1:1', 'A blue cleaning bucket with a yellow sponge, a spray bottle and a little mop, with soap bubbles.', A + 'bubble-bath.webp'),
 ('recovery', '1:1', 'A sleepy golden puppy curled up asleep in a soft round purple pet bed with a little blanket.', A + 'dog.webp'),
 ('adoption', '1:1', 'A cozy pet adoption scene: a cute puppy and a cute kitten sitting side by side in an open cardboard box, with a big red heart floating above them.', None),
 ('check-tools', '1:1', 'An open teal vet doctor bag with a stethoscope, a thermometer and an ear-check otoscope peeking out of the top.', A + 'bubble-bath.webp'),
 ('first-aid', '1:1', 'A white first aid kit box with a red cross on the front and a handle on top, with a rolled bandage beside it.', A + 'bubble-bath.webp'),
 ('training', '1:1', 'Dog training things lying together on the ground: a coiled blue leash, a red rubber ball, a small silver whistle and a little pouch of treats. No bathtub, no water.', None),
 ('grooming', '1:1', 'A pet grooming set: a teal pet brush, a wide-tooth comb and a plain blank bottle of pet shampoo with a few soap bubbles. Blank labels, no writing.', None),
 ('exam', '1:1', 'A small padded vet exam table with a soft towel on top and a stethoscope lying on it.', A + 'bubble-bath.webp'),
 # Fillers for the wrap-around jar labels: a wide band of food packed together, as seen through a jar.
 ('fill-kibble', '21:9', 'A wide strip completely filled edge to edge with brown dog kibble pieces packed tightly together, seen from the side as if through a glass jar. The food fills the whole picture, no background showing.', None),
 ('fill-bones', '21:9', 'A wide strip completely filled edge to edge with small cream colored bone-shaped dog biscuits piled together. The food fills the whole picture, no background showing.', None),
 ('fill-fish', '21:9', 'A wide strip completely filled edge to edge with small orange fish-shaped cat crackers piled together. The food fills the whole picture, no background showing.', None),
 ('fill-veggies', '21:9', 'A wide strip completely filled edge to edge with small chopped carrot pieces, green peas and broccoli florets piled together. The food fills the whole picture, no background showing.', None),
 ('fill-seeds', '21:9', 'A wide strip completely filled edge to edge with bird seed mix: sunflower seeds, millet and little grains piled together. The food fills the whole picture, no background showing.', None),
 ('fill-pellets', '21:9', 'A wide strip completely filled edge to edge with small round green and brown turtle food pellets piled together. The food fills the whole picture, no background showing.', None),
 ('fill-chews', '21:9', 'A wide strip completely filled edge to edge with short red-brown chewy dog treat sticks piled together. The food fills the whole picture, no background showing.', None),
 ('fill-catkibble', '21:9', 'A wide strip completely filled edge to edge with small triangle and star shaped cat kibble in brown and orange piled together. The food fills the whole picture, no background showing.', None),
]
