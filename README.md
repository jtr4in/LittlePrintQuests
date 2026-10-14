# LittlePrintQuests

Personalized, print-ready birthday scavenger hunts for kids ages 3 to 8.

Each hunt is a PDF with a host guide (where to hide every card), a read-aloud mission briefing, 4x6 rhyming clue cards (two per page with cut lines), and a certificate. Five themes: Dino, Superhero, Pirate, Space and Royal Castle.

## Make a hunt

1. `npm install`
2. Copy `examples/example-custom.json` and fill in `theme`, `childName`, `age` and `spots` in hiding order. The last spot is where the prize goes.
   - Spot ids come from `src/generator/spots.js` (`couch`, `fridge`, `mailbox`, `dryer`, `pet_bed`, ...).
   - For a spot not in the library, use `{ "label": "...", "tip": "...", "riddle": ["line one,", "line two!"] }`.
3. `npm run hunt -- my-order.json output/my-order.pdf`

## Etsy standard packs

`npm run standard-packs` writes the five non-personalized packs to `output/standard/`. `python3 scripts/listing_images.py <png_dir> output/listing-photos` builds the listing photos from page screenshots (`node scripts/standard-packs.js <png_dir>`). Listing titles, descriptions and tags are in `etsy-listings.md`.

Fonts in `fonts/` are from Google Fonts under the SIL Open Font License, which allows commercial use.
