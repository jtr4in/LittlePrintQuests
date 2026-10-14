// Builds the five Etsy standard packs (universal home spots, no child name).
const path = require('path');
const { renderPdf } = require('../src/generator/render');

const SPOTS = ['couch', 'fridge', 'bed', 'bathtub', 'bookshelf', 'front_door', 'toy_box', 'kitchen_table'];
const PROMO = 'Want a hunt with your child’s name and your own hiding spots? Order a Custom Hunt from our Etsy shop.';
const OUT = path.join(__dirname, '..', 'output', 'standard');

(async () => {
  const pngRoot = process.argv[2];
  for (const theme of ['dino', 'hero', 'pirate', 'space', 'royal']) {
    const out = path.join(OUT, `${theme}-standard-pack.pdf`);
    require('fs').mkdirSync(OUT, { recursive: true });
    await renderPdf({ theme, spots: SPOTS, promo: PROMO }, out, { pngDir: pngRoot && path.join(pngRoot, theme) });
    console.log('Wrote', out);
  }
})();
