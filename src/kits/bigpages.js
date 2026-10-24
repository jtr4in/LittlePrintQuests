// Big picture pages: full-page illustrated sheets (signs, labels, posters, wrap-around props),
// in the style of the Vet Clinic pages Jason's wife made. Each kit's pictures live in
// src/kits/art/<kit>/big/ with a pages.json listing [{ file, title }] in print order. They're the
// same for every kid, so they're made once (project-files/pretend-play/big-pages/tools) and
// stored portrait, already turned, so each one fills a Letter page. They're JPEGs because Chrome
// puts a JPEG into the PDF as is but re-encodes a WebP losslessly, which made each page 2.4 MB.

const fs = require('fs');
const path = require('path');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const dirOf = (id) => path.join(__dirname, 'art', id, 'big');

function bigList(id) {
  const f = path.join(dirOf(id), 'pages.json');
  if (!fs.existsSync(f)) return [];
  return JSON.parse(fs.readFileSync(f, 'utf8')).filter((p) => fs.existsSync(path.join(dirOf(id), p.file)));
}

// Each picture's kind comes from its file name (03-wear.jpg, 11-poster-bird.jpg). The engine
// places each kind next to the kit's own pages of the same sort, so a big sign sheet sits with the
// signs and big labels with the labels, instead of all the pictures in one block.
const kindOf = (file) => (file.match(/^\d+-([a-z]+)/) || [])[1];

function bigPages(k, kinds) {
  return bigList(k.def.id).filter((p) => !kinds || kinds.includes(kindOf(p.file))).map((p) => `<section class="page bigpic"><img src="data:image/jpeg;base64,${fs.readFileSync(path.join(dirOf(k.def.id), p.file)).toString('base64')}" alt="${esc(p.title)}"></section>`).join('');
}

// The guide's "What's inside" line. Kept short: the shop kits' lists only just fit on the page.
function bigLine(k) {
  const list = bigList(k.def.id);
  return list.length ? [`${list.length} big full-page pictures: signs, labels, wrap-around props and posters`] : [];
}

// The big pictures shown in the website's preview gallery (scripts/big-previews.js), best first:
// the kit's showpiece, its learning poster, the wearable, the tablet screen, then other kinds, one
// of each kind, up to `max`. Jason asked for more of them in the previews (2026-10-24).
const PREVIEW_KINDS = ['hero', 'poster', 'wear', 'screen', 'strips', 'signs', 'cards', 'rooms', 'forms', 'labels'];
function bigPicks(id, max = 4) {
  const list = bigList(id);
  return PREVIEW_KINDS.map((kind) => list.find((p) => kindOf(p.file) === kind)).filter(Boolean).slice(0, max);
}

const bigCss = `
.page.bigpic { padding:.25in; display:flex; align-items:center; justify-content:center; }
.page.bigpic img { max-width:100%; max-height:100%; object-fit:contain; display:block; }
`;

module.exports = { bigPages, bigLine, bigList, bigPicks, bigCss };
