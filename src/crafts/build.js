// Handprint Art Packs: printable holiday handprint and footprint keepsakes, personalized with
// the child's name, age and the year.
//
// cfg = { holiday: 'halloween' | 'christmas' | 'memory', childName: 'Maya', age?: 4, year?: 2026, preview?: true }
// The Memory Handprint Book (memory.js) is a frameable page for each month instead. preview shows
// every page with the prints already painted, for listing photos.
// Returns one Letter-size HTML document of `.page` sections (rendered by src/generator/render.js).
// Each craft page has a faint dashed outline where to press, a poem, and a small finished example.

const fs = require('fs');
const path = require('path');
const { painted, outline, outlines } = require('./prints');
const { draw, ...seasonal } = require('./holidays');
const memory = require('./memory');

const HOLIDAYS = { ...seasonal, memory };

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


// ---------- the Memory Handprint Book ----------
const BOOK = { w: 7.5, h: 6.6 };
const val = (x, ctx) => (typeof x === 'function' ? x(ctx) : x || '');

function bookArt(m, ctx, mode) {
  // Each print gets its own outline, so the child can see where every press goes, unless the
  // prints make one shape together (the heart).
  const prints = mode === 'example' ? m.prints.map(painted).join('')
    : m.oneShape ? outlines(m.prints, m.guide) : m.prints.map((p) => outlines([p], m.guide)).join('');
  return `<svg viewBox="0 0 ${BOOK.w} ${BOOK.h}">${val(m.scene, ctx)}${prints}${val(m.decor, ctx)}${mode === 'example' ? val(m.finish, ctx) : ''}</svg>`;
}

// Big bubble letters, each its own color and a little tilt.
const bubbleTitle = (text, colors) => [...text].map((ch, i) => (ch === ' ' ? ' '
  : `<span style="color:${colors[i % colors.length]};transform:rotate(${i % 2 ? 3 : -3}deg) translateY(${i % 3 === 1 ? -0.03 : 0}in)">${esc(ch)}</span>`)).join('');

// The page border, with the month's little picture sitting on it here and there.
function bookFrame(m) {
  const spots = [[0.42, 0.42], [8.08, 0.42], [0.42, 10.58], [8.08, 10.58], [0.42, 3.9], [8.08, 3.9], [0.42, 7.2], [8.08, 7.2], [2.9, 10.58], [5.6, 10.58]];
  return `<svg class="bframe" viewBox="0 0 8.5 11"><rect x=".42" y=".42" width="7.66" height="10.16" rx=".3" fill="none" stroke="${m.border}" stroke-width=".06"/>
    <rect x=".56" y=".56" width="7.38" height="9.88" rx=".2" fill="none" stroke="${m.border}" stroke-width=".02" stroke-dasharray=".06 .08" opacity=".7"/>
    ${spots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".3" fill="#fff"/>${m.icon(x, y, 1.6)}`).join('')}</svg>`;
}

function monthPage(h, m, ctx) {
  return `<section class="page book">${bookFrame(m)}
    <h1 class="mtitle">${bubbleTitle(m.month, m.titleColors)}</h1>
    <div class="msub" style="color:${m.titleColors[0]}">${esc(m.title)}</div>
    <div class="bpanel">${bookArt(m, ctx, ctx.preview ? 'example' : 'page')}</div>
    <p class="bpoem">${m.poem.map((l) => fill(l, ctx)).join('<br>')}</p>
    <div class="bkeep"><b>${esc(ctx.name)}</b><span>Age: <i></i></span><span>Date: <i class="long"></i></span></div>
  </section>`;
}

function coverPage(h, ctx) {
  const rainbow = ['#e5383b', '#f28c28', '#e9b200', '#4caf50', '#3a86ff', '#8e5bd3'];
  const m = { border: '#ffd23f', icon: (x, y, s) => draw.star(x, y, s * 0.15, ['#f7a8c0', '#9bd0f2', '#b7e4a8'][Math.round(x + y) % 3]) };
  return `<section class="page book cover">${bookFrame(m)}
    <div class="ctop">My Memory</div>
    <h1 class="mtitle ctitle">${bubbleTitle('Handprint Book', rainbow)}</h1>
    <div class="msub" style="color:#8e5bd3">A year of little hands, from January to December</div>
    <div class="carts">${h.coverArt(ctx)}</div>
  </section>`;
}

// How to make each month, six to a page, each with its finished look.
function howToPages(h, ctx) {
  const pages = [];
  for (let i = 0; i < h.crafts.length; i += 6) {
    pages.push(`<section class="page howto"><div class="kicker">${esc(h.kicker)}</div><h1>How to Make Each Page</h1>
      <div class="ht-grid">${h.crafts.slice(i, i + 6).map((m) => `<div class="ht">
        <div class="ht-art">${bookArt(m, ctx, 'example')}</div>
        <div class="ht-text"><div class="ht-m" style="color:${m.titleColors[0]}">${esc(m.month)}</div><div class="ht-t">${esc(m.title)}</div>
          <div class="paints">${m.paints.map(([c, label]) => `<span class="sw"><i style="background:${c}"></i>${esc(label)}</span>`).join('')}</div>
          <div class="uses">${esc(m.uses)}</div>
          <ol>${m.steps.map((st) => `<li>${fill(st, ctx)}</li>`).join('')}</ol></div></div>`).join('')}</div></section>`);
  }
  return pages;
}

function grownPage(h, ctx) {
  const m = { border: '#8e5bd3', icon: (x, y, s) => draw.star(x, y, s * 0.15, '#d7c6f2') };
  const spot = (label, flip) => `<div class="gp"><svg viewBox="0 0 3.4 4.6">${outlines([{ kind: 'hand', x: flip ? 1.5 : 1.9, y: 2.5, s: 0.95, flip }])}</svg>
    <div class="gp-l">${label}</div><div class="bkeep"><span>Age: <i></i></span><span>Date: <i class="long"></i></span></div></div>`;
  return `<section class="page book grown">${bookFrame(m)}
    <h1 class="mtitle" style="font-size:44pt">${bubbleTitle('Look How I’ve Grown!', ['#8e5bd3', '#f06292', '#3a86ff', '#f28c28'])}</h1>
    <p class="bpoem">Press a handprint here at the start of the year and another at the end.<br>Then hold them side by side and see how much ${esc(ctx.name)} has grown!</p>
    <div class="gps">${spot('My hand in January', false)}${spot('My hand in December', true)}</div>
    <p class="bpoem">Here are my little handprints, so tiny and so new.<br>One day when I am big and tall, I’ll still make art with you.</p>
    <div class="bkeep" style="margin-top:.1in"><b style="font-size:30pt">${esc(ctx.name)}</b></div>
  </section>`;
}

function bookGuide(h, ctx) {
  return `<section class="page guide">
    <div class="g-head"><div class="kicker">Grown-up guide</div>
      <h1>${esc(ctx.name)}’s Memory Handprint Book</h1>
      <p class="lead">One handprint page for every month of the year. Make a page each month, and by December you’ll have a whole book of ${esc(ctx.name)}’s little hands.</p>
    </div>
    <div class="cols">
      <div class="col"><h2>You’ll need</h2><ul>
        <li>Washable, kid-safe paint in ${esc(h.paintList)}</li>
        <li>A soft paintbrush and a paper plate for the paint</li>
        <li>Wipes or a damp cloth for little hands</li>
        <li>Markers or paint pens for faces and details</li>
        <li>White cardstock for printing (it won’t curl when wet)</li>
        <li>Optional: googly eyes, cotton balls and glue</li>
      </ul>
      <h2>What’s inside</h2><ul class="inside"><li>A cover with ${esc(ctx.name)}’s name</li><li>12 month pages: ${h.crafts.map((m) => esc(m.title)).join(', ')}</li>
        <li>“How to make each page” with the finished look of every month</li><li>“Look how I’ve grown” page for a January and a December handprint</li></ul></div>
      <div class="col"><h2>How to get a great print</h2><ol class="tips">
        <li><b>Brush, don’t dip.</b> Paint a thin, even coat on the hand with the brush.</li>
        <li><b>Press flat.</b> Lay the hand on the dashed outline and press each finger down gently.</li>
        <li><b>Lift straight up</b> so the print doesn’t smudge.</li>
        <li><b>Let it dry</b> for about 20 minutes before adding faces and details.</li>
        <li><b>Practice first</b> on scrap paper. Wiggly prints are part of the charm!</li>
      </ol>
      <div class="note">Write the age and date on each page as you go. Keep the pages in a binder or folder, or punch holes and tie them with ribbon to make a real book at the end of the year.</div></div>
    </div>
  </section>`;
}

function bookCss() {
  return `
  .book { padding: .7in .75in .6in; text-align: center }
  .bframe { position: absolute; inset: 0; width: 100%; height: 100% }
  .mtitle { position: relative; font: 700 62pt/1 Fredoka; margin: .02in 0 0; letter-spacing: .01em }
  .mtitle span { display: inline-block; -webkit-text-stroke: .07in #fff; paint-order: stroke fill; text-shadow: 0 .035in 0 rgba(40,30,60,.18) }
  .msub { position: relative; font: 700 13pt Fredoka; letter-spacing: .14em; text-transform: uppercase; margin: .02in 0 .1in }
  .bpanel { position: relative; width: 7in; height: 6.16in; margin: 0 auto } .bpanel svg { width: 100%; height: 100%; display: block }
  .bpoem { position: relative; font: 700 14pt/1.38 'Comic Neue'; margin: .16in 0 .1in; color: #3a3350 }
  .bkeep { position: relative; display: flex; justify-content: center; align-items: baseline; gap: .3in; font: 700 12pt Nunito; color: #5c5670 }
  .bkeep b { font: 400 22pt Pacifico; color: #2b59c3 } .bkeep i { display: inline-block; width: .7in; border-bottom: 1.5px solid #9aa0b4; margin-left: .05in } .bkeep i.long { width: 1.4in }
  .cover .ctop { position: relative; font: 400 40pt Pacifico; color: #2b59c3; margin-top: .25in }
  .cover .ctitle { font-size: 58pt } .carts { position: relative; width: 7in; height: 6.16in; margin: .2in auto 0 } .carts svg { width: 100%; height: 100% }
  .howto .ht-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .16in .2in; margin-top: .12in }
  .ht { display: flex; gap: .12in; text-align: left; border: 1.5px solid #ece6f3; border-radius: .14in; padding: .1in; height: 2.95in }
  .ht-art { width: 1.6in; flex: none } .ht-art svg { width: 1.6in; height: 1.41in; border-radius: .08in; display: block }
  .ht-text { font-size: 8.6pt; line-height: 1.3 } .ht-m { font: 700 15pt/1 Fredoka } .ht-t { font: 700 9pt Nunito; color: #6b6f86; text-transform: uppercase; letter-spacing: .06em; margin: .02in 0 .05in }
  .ht .paints { display: flex; flex-wrap: wrap; gap: .02in .06in; font-size: 8pt } .ht .sw i { width: .12in; height: .12in }
  .ht .uses { font-size: 8pt; color: #6b6f86; margin: .02in 0 } .ht ol { margin: .03in 0 0; padding-left: .16in } .ht li { margin-bottom: .02in }
  .grown .gps { position: relative; display: flex; justify-content: center; gap: .3in; margin: .25in 0 .2in } .grown .bpoem { font-size: 15pt }
  .gp { width: 3.3in; border: 2px dashed #d7c6f2; border-radius: .2in; padding: .1in .1in .15in } .gp svg { width: 3.1in; height: 4.2in }
  .gp-l { font: 700 15pt Fredoka; color: #8e5bd3; margin-bottom: .06in } .gp .bkeep { gap: .12in; font-size: 10pt } .gp .bkeep i { width: .45in } .gp .bkeep i.long { width: .9in }`;
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
  // A book ordered in November or December is for the year ahead.
  const now = new Date();
  const year = cfg.year || now.getFullYear() + (h.book && now.getMonth() >= 10 ? 1 : 0);
  const ctx = { name, nameSvg: esc(name), age: cfg.age || '', when: `${h.month} ${year}`, year, preview: Boolean(cfg.preview) };
  const pages = h.book
    ? [bookGuide(h, ctx), coverPage(h, ctx), ...howToPages(h, ctx), ...h.crafts.map((m) => monthPage(h, m, ctx)), grownPage(h, ctx)]
    : [guidePage(h, ctx), ...h.crafts.map((c) => craftPage(h, c, ctx)), cardsPage(h, ctx), addonsPage(h), poemPage(h, ctx)];
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css(h)}${h.book ? bookCss() : ''}</style></head><body>${pages.join('')}</body></html>`;
}

// What to call a pack: "Halloween handprint art pack", or the book's own name.
const craftLabel = (h) => (h?.book ? h.name : `${h?.name || ''} handprint art pack`);

module.exports = { buildCraftHtml, HOLIDAYS, craftLabel };
