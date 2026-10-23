# Scavenger hunt generator

Makes print-ready birthday scavenger hunt PDFs: host guide, mission briefing, 4x6 clue cards (two per page) and a certificate.

## Make a custom order
1. Copy `configs/example-custom.json` and fill in `theme`, `childName`, `age` and `spots` (in hiding order; the last spot is where the prize goes).
   - Spot ids come from `src/spots.js` (couch, fridge, mailbox, dryer, pet_bed, ...).
   - For a spot not in the library, use `{ "label": "...", "tip": "...", "riddle": ["line one,", "line two!"] }`.
2. `NODE_PATH=/opt/node-tools/node_modules node src/render.js configs/<file>.json output/<name>.pdf`

## Rebuild the Etsy standard packs and photos
```
NODE_PATH=/opt/node-tools/node_modules node src/standard.js /tmp/png
python3 src/listing_images.py /tmp/png output/listing-photos
```

Themes live in `src/themes.js`; fonts in `fonts/` are SIL Open Font License (Google Fonts), fine for commercial use.
