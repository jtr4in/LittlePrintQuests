// Handprint Art Packs: printable holiday handprint and footprint keepsakes, personalized with
// the child's name, age and the year.
//
// cfg = { holiday: 'halloween' | 'christmas', childName: 'Maya', age?: 4, year?: 2026 }
// Returns one Letter-size HTML document of `.page` sections (rendered by src/generator/render.js).
// Each craft page has a faint dashed outline where to press, a poem, and a small finished example.

const fs = require('fs');
const path = require('path');
const { painted, outline } = require('./prints');
const HOLIDAYS = require('./holidays');

const FONT_DIR = path.join(__dirname, '..', '..', 'fonts');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PANEL = { w: 7.5, h: 6 };

function fontFaces() {
  return fs.readdirSync(FONT_DIR).filter((f) => /\.(ttf|otf|woff2?)$/i.test(f)).map((file) => {
    const [base, style = ''] = file.replace(/\.\w+$/, '').split('-');
    const family = base.replace(/([a-z])([A-Z])/g, '$1 $2');
    const weight = /bold/i.test(style) ? '700' : /regular/i.test(style) ? '400' : '100 900';
    return `@font-face{font-family:'${family}';src:url('file://${FONT_DIR}/${file}');font-weight:${weight};}`;
  }).join('\n');
}

const fill = (s, ctx) => String(s).replace(/\{(\w+)\}/g, (_, k) => esc(ctx[k] ?? ''));

// The art panel: the scene, then either the dashed outlines (the page to press on) or the painted
// prints with their finishing touches (the example).
function panel(craft, mode) {
  const prints = craft.prints.map((p) => (mode === 'example' ? painted(p) : outline(p, craft.bg))).join('');
  return `<svg class="art" viewBox="0 0 ${PANEL.w} ${PANEL.h}">
    <rect width="${PANEL.w}" height="${PANEL.h}" rx="0.25" fill="${craft.bg}"/>
    ${craft.scene || ''}${prints}${craft.decor || ''}${mode === 'example' ? craft.finish || '' : ''}
  </svg>`;
}

function keepsakeLine(ctx) {
  return [esc(ctx.name), ctx.age ? `age ${esc(ctx.age)}` : '', esc(ctx.when)].filter(Boolean).join(' <i>·</i> ');
}

function craftPage(h, craft, ctx) {
  const swatches = craft.paints.map(([c, label]) => `<span class="sw"><i style="background:${c}"></i>${esc(label)}</span>`).join('');
  return `<section class="page craft">
    <div class="kicker">${esc(h.kicker)}</div>
    <h1>${esc(craft.title)}</h1>
    <p class="poem">${craft.poem.map((l) => fill(l, ctx)).join('<br>')}</p>
    <div class="panel">${panel(craft, 'page')}</div>
    <div class="keep">${keepsakeLine(ctx)}</div>
    <div class="how">
      <div class="steps">
        <div class="paints"><b>Paint:</b> ${swatches} <span class="uses">${esc(craft.uses)}</span></div>
        <ol>${craft.steps.map((s) => `<li>${fill(s, ctx)}</li>`).join('')}</ol>
      </div>
      <figure class="example">${panel(craft, 'example')}<figcaption>Finished look</figcaption></figure>
    </div>
  </section>`;
}

function guidePage(h, ctx) {
  return `<section class="page guide">
    <div class="g-head"><div class="kicker">Grown-up guide</div>
      <h1>${esc(ctx.name)}’s ${esc(h.name)} Handprint Art</h1>
      <p class="lead">${h.crafts.length} handprint and footprint keepsakes to make together, plus cards, cut-out add-ons and a poem page. Every page is ready with ${esc(ctx.name)}’s name and the date.</p>
    </div>
    <div class="cols">
      <div class="col"><h2>You’ll need</h2><ul>
        <li>Washable, kid-safe paint in ${esc(h.paintList)}</li>
        <li>A soft paintbrush and a paper plate for the paint</li>
        <li>Wipes or a damp cloth for little hands</li>
        <li>Markers or paint pens for faces and details</li>
        <li>White cardstock for printing (it won’t curl when wet)</li>
        <li>Optional: googly eyes, glitter and glue</li>
      </ul>
      <h2>What’s inside</h2><ul class="inside">${h.crafts.map((c) => `<li>${esc(c.title)}</li>`).join('')}
        <li>Handprint cards to send to family</li><li>Cut-out add-ons: eyes, hats and more</li><li>“These Little Hands” poem keepsake</li></ul></div>
      <div class="col"><h2>How to get a great print</h2><ol class="tips">
        <li><b>Brush, don’t dip.</b> Paint a thin, even coat on the hand or foot with the brush.</li>
        <li><b>Press flat.</b> Lay the hand on the outline and press each finger down gently.</li>
        <li><b>Lift straight up</b> so the print doesn’t smudge.</li>
        <li><b>Let it dry</b> for about 20 minutes before adding faces and details.</li>
        <li><b>Practice first</b> on scrap paper. Wiggly prints are part of the charm!</li>
        <li><b>Little ones:</b> print the foot while they’re sitting or sleepy, and have a wipe ready.</li>
      </ol>
      <div class="note">The dashed outlines are just a guide. Every hand is different, so press where it fits best. Frame your favorites, or laminate them to keep year after year.</div></div>
    </div>
  </section>`;
}

// Two half-page cards to send to family: a greeting and a spot for a small handprint.
function cardsPage(h, ctx) {
  const card = (greet, i) => `<div class="card">
    <div class="c-art"><svg viewBox="0 0 3.2 3.6">${outline({ kind: 'hand', x: 1.6, y: 2, s: 0.68 }, '#fff')}</svg></div>
    <div class="c-text"><div class="c-greet">${fill(greet, ctx)}</div><div class="c-from">Love, <b>${esc(ctx.name)}</b></div><div class="c-small">${esc(ctx.when)}</div>
      <div class="c-to"><span>To:</span><i></i></div></div>
    <div class="c-icon">${h.cardIcons[i]}</div>
  </div>`;
  return `<section class="page cards"><div class="kicker">${esc(h.kicker)}</div><h1>Handprint Cards</h1>
    <p class="sub">Add a handprint to each card, cut along the dashed line and give them to someone special.</p>
    ${h.cards.map(card).join('<div class="cut"><span>✂</span></div>')}</section>`;
}

function addonsPage(h) {
  return `<section class="page addons"><div class="kicker">${esc(h.kicker)}</div><h1>Cut-out Add-ons</h1>
    <p class="sub">No googly eyes? Cut these out and glue them onto the dry prints.</p>
    <svg class="addon-sheet" viewBox="0 0 7.5 7.8">${h.addons}</svg></section>`;
}

function poemPage(h, ctx) {
  const lines = ['Here are my little handprints,', 'so tiny and so new.', 'One day when I am big and tall,', 'I’ll still make art with you.'];
  return `<section class="page poem-page"><div class="frame">${h.frame}</div>
    <div class="pp-inner"><h1>These Little Hands</h1><p class="poem">${lines.join('<br>')}</p>
    <div class="pp-hands"><svg viewBox="0 0 6.4 4.6">${outline({ kind: 'hand', x: 1.85, y: 2.4, s: 0.95 }, '#fff')}${outline({ kind: 'hand', x: 4.55, y: 2.4, s: 0.95, flip: true }, '#fff')}</svg></div>
    <div class="pp-name">${esc(ctx.name)}</div><div class="keep">${[ctx.age ? `age ${esc(ctx.age)}` : '', esc(ctx.when)].filter(Boolean).join(' · ')}</div></div></section>`;
}

function css(h) {
  const c = h.colors;
  return `${fontFaces()}
  @page { size: Letter; margin: 0 }
  * { box-sizing: border-box } body { margin: 0; font-family: Nunito; color: ${c.ink} }
  .page { width: 8.5in; height: 11in; position: relative; overflow: hidden; page-break-after: always; background: #fff; padding: .45in .5in }
  .kicker { text-align: center; font: 800 9.5pt Nunito; letter-spacing: .14em; text-transform: uppercase; color: ${c.accent} }
  h1 { text-align: center; font: 700 30pt/1.05 Fredoka; margin: .04in 0 .06in; color: ${c.primary} }
  .poem { text-align: center; font: italic 600 12.5pt/1.35 Nunito; margin: 0 0 .14in; color: ${c.ink} }
  .panel { width: 7.5in; height: 6in; margin: 0 auto } .panel svg, .example svg { width: 100%; height: 100%; display: block }
  .keep { text-align: center; font: 400 20pt Pacifico; color: ${c.primary}; margin: .1in 0 .08in } .keep i { font-style: normal; color: ${c.accent} }
  .how { display: flex; gap: .25in; align-items: flex-start }
  .steps { flex: 1; font-size: 10.5pt; line-height: 1.35 } .steps ol { margin: .06in 0 0; padding-left: .22in } .steps li { margin-bottom: .03in }
  .paints { font-size: 10pt } .sw { display: inline-flex; align-items: center; gap: .05in; margin-right: .1in; font-weight: 700 }
  .sw i { width: .17in; height: .17in; border-radius: 50%; border: 1px solid #0003; display: inline-block } .uses { color: #6b6f86 }
  .example { margin: 0; width: 1.95in } .example svg { height: 1.56in; border-radius: .08in; box-shadow: 0 1px 4px #0003 }
  .example figcaption { text-align: center; font: 700 8.5pt Nunito; color: #6b6f86; margin-top: .03in; text-transform: uppercase; letter-spacing: .1em }
  .guide { background: ${c.paper} } .g-head h1 { font-size: 27pt } .lead { text-align: center; font-size: 12pt; margin: 0 .3in .2in }
  .cols { display: flex; gap: .35in } .col { flex: 1; font-size: 11pt; line-height: 1.4 } .col h2 { font: 700 15pt Fredoka; color: ${c.primary}; margin: .12in 0 .05in }
  .col ul, .col ol { margin: 0; padding-left: .22in } .col li { margin-bottom: .05in } .inside li { margin-bottom: .02in }
  .note { margin-top: .18in; background: #fff; border: 2px dashed ${c.accent}; border-radius: .14in; padding: .14in .18in; font-size: 10.5pt }
  .sub { text-align: center; margin: 0 0 .12in; font-size: 11pt }
  .card { position: relative; height: 4.45in; border: 2px solid ${c.primary}; border-radius: .2in; display: flex; overflow: hidden; background: ${c.paper} }
  .c-art { width: 3.2in; background: #fff; border-right: 2px dashed ${c.soft} } .c-art svg { width: 100%; height: 100% }
  .c-text { flex: 1; padding: .35in .3in; display: flex; flex-direction: column; justify-content: center; text-align: center }
  .c-greet { font: 700 26pt/1.1 Fredoka; color: ${c.primary} } .c-from { font-size: 14pt; margin-top: .14in } .c-from b { font: 400 20pt Pacifico; color: ${c.accent} }
  .c-small { font-size: 10pt; color: #6b6f86 } .c-to { display: flex; gap: .08in; align-items: flex-end; margin-top: .3in; font-weight: 700 } .c-to i { flex: 1; border-bottom: 1.5px solid #9aa0b4 }
  .c-icon { position: absolute; right: .14in; top: .1in; width: .7in; height: .7in } .c-icon svg { width: 100%; height: 100% }
  .cut { height: .5in; border-top: 0; position: relative } .cut::before { content: ''; position: absolute; left: -.5in; right: -.5in; top: .25in; border-top: 1.5px dashed #9aa0b4 }
  .cut span { position: absolute; left: .1in; top: .1in; font-size: 14pt; color: #9aa0b4; background: #fff }
  .addon-sheet { width: 7.5in; height: 7.8in; display: block; margin: .1in auto 0 }
  .poem-page { padding: 0 } .frame, .frame svg { position: absolute; inset: 0; width: 100%; height: 100% }
  .pp-inner { position: absolute; inset: 1.15in 1in; text-align: center } .pp-inner h1 { font-size: 36pt; margin-top: .2in }
  .pp-inner .poem { font-size: 16pt } .pp-hands { width: 6.4in; height: 4.6in; margin: .1in auto 0 } .pp-hands svg { width: 100%; height: 100% }
  .pp-name { font: 400 40pt/1.2 Pacifico; color: ${c.primary}; margin-top: .05in }`;
}

function buildCraftHtml(cfg) {
  const h = HOLIDAYS[cfg.holiday];
  if (!h) throw new Error(`Unknown holiday "${cfg.holiday}"`);
  const name = String(cfg.childName || '').trim() || 'Me';
  const year = cfg.year || new Date().getFullYear();
  const ctx = { name, age: cfg.age || '', when: `${h.month} ${year}`, year };
  const pages = [guidePage(h, ctx), ...h.crafts.map((c) => craftPage(h, c, ctx)), cardsPage(h, ctx), addonsPage(h), poemPage(h, ctx)];
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css(h)}</style></head><body>${pages.join('')}</body></html>`;
}

module.exports = { buildCraftHtml, HOLIDAYS };
