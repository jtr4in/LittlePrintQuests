// Builds the Gemini-app prompts for the origami pages, two per theme, from the same table the
// pages use (THEMES in src/kits/origami.js). Gemini only draws art: the paper pattern and the
// add-on pieces. The fold steps are drawn by src/kits/origami.js, so they're always right.
// Run: node project-files/activity-packs/origami/make-prompts.js  (writes prompts.json and prompts.md)
const fs = require('fs');
const path = require('path');
const { THEMES, MODELS } = require('../../../src/kits/origami');

const NO_FACES = 'No faces on objects: no smiley faces on stars, food, hearts, planets, clouds or anything else.';

const paper = (look) => `Create a seamless, all-over pattern for a square sheet of origami paper: ${look}.

The pattern must look good from every direction (no up or down side) and run evenly to all four edges, because the sheet will be cut out and folded. Keep every motif small, under about 1/12 of the sheet width, so folds don't cut through details. Bright, saturated colors that print well on a home inkjet printer.

Perfectly square image, high resolution, edge to edge, no border or margin, no central picture.

${NO_FACES} No text, letters, numbers or logos.`;

const pieces = (model, list) => `Create a sheet of cut-out paper craft pieces for a child to glue onto a folded paper ${model}: ${list}.

Lay the pieces out in one row from left to right, well spaced, on a plain white background. Draw each piece as a bold, simple, flat cartoon shape with a thick dark outline, big enough for a 4-year-old to cut around (each piece at least 1 inch on the printed sheet). Bright colors that print well on a home inkjet printer.

Wide landscape image, about 3 times as wide as it is tall. Nothing else on the sheet: no folded ${model}, no hands, no scissors, no glue, no shadows.

${NO_FACES} No text, letters, numbers or logos, except where a piece above asks for one.`;

const out = Object.entries(THEMES).map(([theme, [model, , look, list]], i) => {
  const name = MODELS[model].name;
  return { n: i + 1, theme, model: name, paper: { file: `${theme}-paper.jpg`, prompt: paper(look) }, pieces: { file: `${theme}-pieces.jpg`, prompt: pieces(name.toLowerCase(), list) } };
});
fs.writeFileSync(path.join(__dirname, 'prompts.json'), JSON.stringify(out, null, 2) + '\n');
fs.writeFileSync(path.join(__dirname, 'prompts.md'), `# Origami page prompts (Gemini app)

Two per theme: the paper pattern and the add-on pieces. Save each picture with the file name shown,
then import with \`python3 scripts/origami-import.py <folder>\`.

` + out.map((p) => `## ${p.n}. ${p.theme}: ${p.model}

Paper, save as \`${p.paper.file}\`:

\`\`\`
${p.paper.prompt}
\`\`\`

Pieces, save as \`${p.pieces.file}\`:

\`\`\`
${p.pieces.prompt}
\`\`\`
`).join('\n'));
console.log(out.length, 'themes,', out.length * 2, 'prompts');
