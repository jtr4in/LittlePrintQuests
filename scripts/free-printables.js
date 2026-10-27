// The free printables on the ideas pages: for every page with a hunt on it (theme, home and guide pages),
// a Letter PDF of that page's clues as cut-out cards with picture hints and a grown-up answer key, led by the
// theme's story letter where there is one. A small "make it personalized" line points to the shop.
//   docs/printables/<page slug>.pdf          the download
//   docs/printables/img/<page slug>.webp     a 600px picture of the card sheet (shown on the page and used on pins)
// Run it after adding or changing a guide or theme, then `node scripts/idea-pages.js` (which only links a
// printable that exists):
//   node scripts/free-printables.js [slug ...]
// Needs Chromium (see the playwright note in notes/PROJECT-NOTES.md) and python3 with Pillow for the WebP.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const { clueSets } = require('./idea-pages');
const { picHtml } = require('../src/generator/build');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'printables');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const font = (family, file, weight) => `@font-face{font-family:'${family}';font-weight:${weight};src:url(data:font/${file.endsWith('ttf') ? 'ttf' : 'woff2'};base64,${fs.readFileSync(path.join(ROOT, 'fonts', file)).toString('base64')})}`;
const FONTS = font('Fredoka', 'Fredoka.ttf', '600 700') + font('Atkinson Hyperlegible', 'AtkinsonHyperlegible-400.woff2', 400) + font('Atkinson Hyperlegible', 'AtkinsonHyperlegible-700.woff2', 700);
// The logo mark, shrunk to 120px first: at full size it was most of each PDF's weight.
const MARK = `data:image/png;base64,${execFileSync('python3', ['-c', 'import sys,io;from PIL import Image;im=Image.open(sys.argv[1]).convert("RGBA");im.thumbnail((120,120));b=io.BytesIO();im.save(b,"PNG",optimize=True);sys.stdout.buffer.write(b.getvalue())', path.join(ROOT, 'docs', 'img', 'mark.png')]).toString('base64')}`;

const css = (c) => `${FONTS}
@page { size: Letter; margin: 0; }
* { box-sizing: border-box; }
body { margin: 0; font-family: 'Atkinson Hyperlegible', sans-serif; color: ${c.ink || '#3f4a73'}; }
.sheet { width: 8.5in; height: 11in; padding: .4in .45in .35in; display: flex; flex-direction: column; page-break-after: always; overflow: hidden; background: #fff; }
.sheet:last-child { page-break-after: auto; }
.head { border-bottom: 3px solid ${c.primary}; padding-bottom: .12in; margin-bottom: .16in; }
.head h1 { font: 700 26pt/1.05 Fredoka, sans-serif; margin: 0; color: ${c.primary}; }
.head p { margin: .06in 0 0; font-size: 10.5pt; color: #5b6488; }
.cards { flex: 1; display: grid; grid-template-columns: 1fr 1fr; grid-auto-rows: 1fr; gap: 0; border: 1.5px dashed #b8b2a4; }
.card { border: 1.5px dashed #b8b2a4; padding: .16in .2in; display: flex; gap: .16in; align-items: center; position: relative; }
.card .n { position: absolute; top: .1in; left: .2in; font: 700 10pt Fredoka, sans-serif; letter-spacing: .06em; text-transform: uppercase; color: ${c.accent}; }
.card .riddle { flex: 1; font-size: 12.5pt; line-height: 1.38; padding-top: .14in; }
.card .look { flex: none; width: .95in; text-align: center; font: 600 8pt Fredoka, sans-serif; color: ${c.primary}; text-transform: uppercase; letter-spacing: .05em; }
.card .bubble { width: .82in; height: .82in; margin: 0 auto .04in; border-radius: 50%; border: 2px dashed ${c.primary}; display: flex; align-items: center; justify-content: center; }
.card .emoji { font-size: 32pt; line-height: 1; font-family: 'Noto Color Emoji', sans-serif; }
.card .picto svg { width: .5in; height: .5in; color: ${c.primary}; }
.card.prize { background: ${c.soft || '#f2f0ea'}; justify-content: center; text-align: center; }
.card.prize .riddle { font: 700 17pt/1.2 Fredoka, sans-serif; color: ${c.primary}; padding: 0; }
.key { margin-top: .14in; font-size: 8.5pt; line-height: 1.45; color: #5b6488; }
.key b { color: ${c.ink || '#3f4a73'}; }
.foot { margin-top: .12in; display: flex; align-items: center; justify-content: space-between; font-size: 9.5pt; color: #5b6488; border-top: 1px solid #e4dfd2; padding-top: .1in; }
.brand { display: flex; align-items: center; gap: .06in; font: 700 12pt Fredoka, sans-serif; }
.brand img { width: .3in; }
.l { color: #2f9a6b; } .p { color: #ef9d31; } .q { color: #475379; }
.letter { flex: 1; border: 3px double ${c.primary}; border-radius: .12in; padding: .5in .6in; display: flex; flex-direction: column; background: #fff; }
.letter .tag { font: 700 10pt Fredoka, sans-serif; letter-spacing: .1em; text-transform: uppercase; color: ${c.accent}; text-align: center; }
.letter h2 { font: 700 30pt/1.1 Fredoka, sans-serif; color: ${c.primary}; text-align: center; margin: .1in 0 .3in; }
.letter p { font-size: 14pt; line-height: 1.55; margin: 0 0 .18in; }
.letter .sign { margin-top: auto; text-align: right; font-size: 13pt; }
.letter .sign b { display: block; font: 700 15pt Fredoka, sans-serif; color: ${c.primary}; }
`;

const foot = `<div class="foot"><span>Want your kid’s name on every card and clues for your own hiding spots? <b>littleprintquests.com</b></span>
<span class="brand"><img src="${MARK}"><span><span class="l">Little</span><span class="p">Print</span><span class="q">Quests</span></span></span></div>`;

function html(set) {
  const cards = set.clues.map((c, i) => `<div class="card"><span class="n">Clue ${i + 1}</span><div class="riddle">${c.riddle.map(esc).join('<br>')}</div>
<div class="look"><div class="bubble">${picHtml(c)}</div>Look here</div></div>`);
  // An odd number of clues leaves a gap in the grid: fill it with the finish card.
  if (cards.length % 2) cards.push(`<div class="card prize"><div class="riddle">You found every clue!<br>The ${esc(set.treasure)} is yours!</div></div>`);
  const letter = set.story ? `<section class="sheet"><div class="letter"><div class="tag">Read aloud to start the hunt</div><h2>${esc(set.story.title)}</h2>
${set.story.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}<div class="sign">${esc(set.story.signoff)}<b>${esc(set.story.from)}</b></div></div>${foot}</section>` : '';
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css(set.colors)}</style></head><body>
${letter}<section class="sheet" id="cards"><div class="head"><h1>${esc(set.name)}</h1>
<p>Free printable clue cards. Cut on the dashed lines. Hand over clue 1, then hide each card at the answer to the card before it. The picture shows where to look next.</p></div>
<div class="cards">${cards.join('')}</div>
<div class="key"><b>Answer key for the grown-up:</b> ${set.clues.map((c, i) => `${i + 1}. ${esc(c.label)} (${esc(c.tip.replace(/^./, (x) => x.toLowerCase()))})`).join(' · ')}.${/^the treasure/i.test(set.clues.at(-1).tip) ? '' : ` Put the ${esc(set.treasure)} at the last answer.`}</div>
${foot}</section></body></html>`;
}

(async () => {
  const only = process.argv.slice(2);
  const sets = clueSets().filter((s) => !only.length || only.includes(s.slug));
  fs.mkdirSync(path.join(OUT, 'img'), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 816, height: 1056 } });
  for (const set of sets) {
    await page.setContent(html(set), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({ path: path.join(OUT, `${set.slug}.pdf`), format: 'Letter', printBackground: true, preferCSSPageSize: true });
    const png = path.join(OUT, 'img', `${set.slug}.png`);
    await page.locator('#cards').screenshot({ path: png });
    execFileSync('python3', ['-c', 'import sys;from PIL import Image;im=Image.open(sys.argv[1]).convert("RGB");im=im.resize((600,round(600*im.height/im.width)),Image.LANCZOS);im.save(sys.argv[2],"WEBP",quality=80)', png, png.replace(/\.png$/, '.webp')]);
    fs.unlinkSync(png);
  }
  await browser.close();
  console.log(`Wrote ${sets.length} free printables to docs/printables/`);
})();
