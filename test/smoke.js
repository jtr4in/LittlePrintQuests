// Smoke test: fake Etsy, Claude, Stripe and Resend; real PDF rendering and dashboard.
// Run: node test/smoke.js
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bot-'));
// Each run's orders and PDFs take a few hundred MB: remove them when the run ends.
process.on('exit', () => { try { fs.rmSync(dataDir, { recursive: true, force: true }); } catch {} });
Object.assign(process.env, {
  DATA_DIR: dataDir, PORT: '3917', PUBLIC_URL: 'https://bot.example.com', ADMIN_PASSWORD: 'pw',
  ANTHROPIC_API_KEY: 'test', ETSY_KEYSTRING: 'key', ETSY_SHARED_SECRET: 'secret', POLL_MINUTES: '60',
  STRIPE_SECRET_KEY: 'sk_test_fake', STRIPE_WEBHOOK_SECRET: 'whsec_test', RESEND_API_KEY: 're_test', EMAIL_FROM: 'Hunts <hi@example.com>',
});
fs.writeFileSync(path.join(dataDir, 'state.json'), JSON.stringify({
  etsy: { access_token: '1.a', refresh_token: '1.r', expires_at: Date.now() + 3600e3, user_id: 1, shop_id: 42, scopes: 'transactions_r listings_r listings_w shops_r shops_w' }, orders: {},
}));

// Fake Claude: return a structured answer for whatever order text arrives.
const parse = require('../src/bot/parse');
const realToConfig = parse.toHuntConfig;
parse.parseOrder = async ({ personalization }) => realToConfig({
  ok: true, problem: null, childName: personalization.startsWith('Leo') ? 'Leo' : 'Maya', age: 6, theme: 'space',
  pets: personalization.startsWith('Leo') ? [{ name: 'Rover', kind: 'dog' }, { name: 'Zip', kind: 'spaceship' }] : [],
  spots: [
    { libraryId: 'front_door', label: 'Front Door', tip: '', riddle: [] },
    { libraryId: null, label: 'Grandma’s Piano', tip: 'On the bench', riddle: ['Plink goes the piano, plonk goes the key,', 'Check by the bench, what will you see?'] },
    { libraryId: 'pet_bed', label: 'Pet Bed', tip: '', riddle: [] },
    { libraryId: 'kitchen_table', label: 'Kitchen Table', tip: '', riddle: [] },
  ],
});

parse.parseKitOrder = async ({ personalization, kit }) => ({
  ok: true, config: { kit, childName: personalization.split(',')[0], subjects: [{ name: 'Biscuit', kind: 'dog' }], lenient: true },
});

parse.parseCraftOrder = async ({ personalization, holiday }) => ({
  ok: true, config: { holiday, childName: personalization.split(',')[0], age: 2 },
});

// Fake Stripe Checkout session creation (webhooks are signed for real below).
const payments = require('../src/bot/payments');
const charged = [];
payments.createCheckout = async (order) => {
  charged.push(payments.priceFor(order.form.product));
  return { id: 'cs_test_1', url: `https://checkout.stripe.com/c/pay/${order.id}` };
};

// Fake Etsy receipts endpoint and Resend.
const realFetch = global.fetch;
const seen = [];
const etsyCalls = [];
let failImageOnce = true;
const shopSections = [];
const shopDrafts = [];
const etsyTitles = {};
const etsyListingApi = async (u, opts) => {
  const p = new URL(u).pathname.replace('/v3/application', '');
  const body = opts.body instanceof FormData ? Object.fromEntries(opts.body) : opts.body instanceof URLSearchParams ? Object.fromEntries(opts.body) : opts.body && JSON.parse(opts.body);
  etsyCalls.push({ method: opts.method, p, body });
  const json = (o, status = 200) => new Response(JSON.stringify(o), { status });
  if (p === '/seller-taxonomy/nodes') return json({ results: [{ id: 1, name: 'Paper & Party Supplies', children: [{ id: 2, name: 'Party Supplies', children: [{ id: 1250, name: 'Party Games', children: [] }] }] }] });
  if (p === '/shops/42/sections') {
    if (opts.method === 'POST') shopSections.push({ shop_section_id: 300 + shopSections.length, title: body.title });
    return json(opts.method === 'POST' ? shopSections.at(-1) : { results: shopSections });
  }
  if (p === '/shops/42/listings' && opts.method === 'GET') return json({ results: new URL(u).searchParams.get('state') === 'draft' ? shopDrafts : [] });
  if (p === '/shops/42/listings') return json({ listing_id: 7000 + etsyCalls.filter((c) => c.p === p && c.method === 'POST').length });
  if (opts.method === 'GET' && /\/(images|files)$/.test(p)) return json({ count: 1, results: [{}] });
  const one = p.match(/^(?:\/shops\/42)?\/listings\/(\d+)$/);
  if (one && opts.method === 'GET') return json({ listing_id: +one[1], title: etsyTitles[one[1]] });
  if (one && opts.method === 'PATCH' && body.title) etsyTitles[one[1]] = body.title;
  if (/\/images$/.test(p) && body.image.name === 'kits-main.jpg' && failImageOnce) {
    failImageOnce = false;
    return json({ error: 'Temporary upload problem' }, 500);
  }
  return json({ ok: true });
};
global.fetch = async (url, opts = {}) => {
  const u = String(url);
  if (u.startsWith('https://api.etsy.com/') && !u.includes('/receipts')) return etsyListingApi(u, opts);
  if (u.startsWith('https://api.etsy.com/')) {
    seen.push({ u, headers: opts.headers });
    return new Response(JSON.stringify({ count: 2, results: [
      { receipt_id: 900, name: 'Pat Buyer', transactions: [
        { transaction_id: 1, listing_id: 555, title: 'Custom Hunt', variations: [
          { property_id: 513, formatted_name: 'Theme', formatted_value: 'Space', question_id: 0 },
          { property_id: 514, formatted_name: 'Package', formatted_value: 'Hunt + Play Kit + Party Pack', question_id: 0 },
          { property_id: 54, formatted_name: 'Personalization', formatted_value: 'Leo, 6, front door, piano, dog bed, table', question_id: 77 },
        ] },
      ] },
      { receipt_id: 902, name: 'Kim Kit', transactions: [
        { transaction_id: 3, listing_id: 557, title: 'Play Kit', variations: [
          { property_id: 513, formatted_name: 'Kit', formatted_value: 'Vet Clinic', question_id: 0 },
          { property_id: 54, formatted_name: 'Personalization', formatted_value: 'Maya, Biscuit (dog)', question_id: 78 },
        ] },
      ] },
      { receipt_id: 901, name: 'Sam Standard', transactions: [{ transaction_id: 2, listing_id: 556, title: 'Dino Pack', variations: [] }] },
    ] }), { status: 200 });
  }
  if (u === 'https://api.resend.com/emails') {
    emails.push(JSON.parse(opts.body));
    return new Response('{"id":"em_1"}', { status: 200 });
  }
  return realFetch(url, opts);
};
const emails = [];

require('../src/bot/server');
const auth = { Authorization: 'Basic ' + Buffer.from('owner:pw').toString('base64') };
const base = 'http://localhost:3917';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  // Picture clues: on for ages 3 to 5, off for older kids unless asked for.
  const { buildHtml } = require('../src/generator/build');
  const hunt = (cfg) => buildHtml({ theme: 'dino', spots: ['couch', 'fridge', { label: 'Piano', tip: 'Bench', riddle: ['a,', 'b!'], pic: '🎹' }], ...cfg });
  assert.equal((hunt({ age: 4 }).match(/class="pic-hint"/g) || []).length, 3);
  assert.ok(hunt({ age: 4 }).includes('🎹') && hunt({ age: 4 }).includes('<svg viewBox="0 0 64 64" fill="none"'));
  assert.ok(!hunt({ age: 7 }).includes('class="pic-hint"'));
  assert.ok(hunt({ age: 7, pictures: true }).includes('class="pic-hint"'));

  // Puzzle finale: one numbered piece per clue card for every theme and spot count, a note on the
  // last card, the prize spot on the picture, and real illustrations; `puzzle: false` leaves it out.
  const { PUZZLES, ROWS } = require('../src/generator/puzzle');
  const spotIds = Object.keys(require('../src/generator/spots'));
  for (let n = 3; n <= 12; n++) assert.equal(ROWS[n].reduce((a, b) => a + b), n);
  for (const theme of Object.keys(require('../src/generator/themes'))) {
    assert.equal(PUZZLES[theme].art.filter((a) => fs.existsSync(path.join(__dirname, '..', 'src', 'kits', 'art', a.includes('/') ? a : `${theme}/${a}`) + '.webp')).length, 5, theme);
    const n = 3 + (theme.length % 10);
    const html = buildHtml({ theme, spots: spotIds.slice(0, n) });
    assert.equal((html.match(/<g class="num">/g) || []).length, n, theme);
    assert.equal((html.match(/class="puzzle-note"/g) || []).length, 1);
    assert.ok(html.includes(`class="spot-label"`) && html.includes('.webp"'));
  }
  assert.ok(!hunt({ puzzle: false }).includes('class="page puzzle"') && !hunt({ puzzle: false }).includes('class="puzzle-note"'));

  // Bonus games: a picture hunt (12 cards + two matching checklists) and a look-around hunt with 12 finds,
  // after the certificate, for every theme; every picture resolves; `bonus: false` leaves them out.
  const { PICTURES, LOOK, entry } = require('../src/generator/bonus');
  for (const theme of Object.keys(require('../src/generator/themes'))) {
    assert.equal(PICTURES[theme].length, 12, theme);
    assert.equal(LOOK[theme].items.length, 12, theme);
    for (const s of [...PICTURES[theme], ...LOOK[theme].items]) entry(theme, s);
    const html = buildHtml({ theme, spots: spotIds.slice(0, 5) });
    assert.equal((html.match(/class="pc"/g) || []).length, 12, theme);
    assert.equal((html.match(/class="pl-item"/g) || []).length, 24, theme);
    assert.equal((html.match(/class="lk-item"/g) || []).length, 12, theme);
    assert.ok(html.indexOf('class="page cert"') < html.indexOf('class="page bonus'), theme);
  }
  assert.ok(!hunt({ bonus: false }).includes('class="page bonus') && !hunt({ bonus: false }).includes('Play again another day'));

  // Party Pack: builds for every theme, fills party details or leaves write-in lines, renders a real PDF.
  const { buildPartyHtml } = require('../src/party/build');
  const { renderParty } = require('../src/party/render-party');
  for (const theme of Object.keys(require('../src/generator/themes'))) {
    const party = buildPartyHtml({ theme, childName: 'Maximilian', age: 6, party: { date: 'June 3', place: 'The Park' } });
    assert.match(party, /Maximilian’s/);
    assert.match(party, /6th Birthday!/);
    assert.ok(party.includes('June 3') && party.includes('The Park'));
    assert.equal((party.match(/class="item flag[ "]/g) || []).length, 5 + 1 + 8 + 1 + 10);
    assert.ok(buildPartyHtml({ theme, childName: 'Bo' }).includes('Birthday Party!'));
  }
  assert.throws(() => buildPartyHtml({ theme: 'dino' }), /childName is required/);
  const partyPdf = path.join(dataDir, 'party.pdf');
  await renderParty({ theme: 'space', childName: 'Bo', age: 3 }, partyPdf);
  assert.ok(fs.statSync(partyPdf).size > 50000);

  // Play kits come in two versions: little kids (3 to 5) get picture-only order forms, bigger
  // pictures and thicker cut lines; the version follows the child's age.
  const { buildKitHtml, KITS } = require('../src/kits/engine');
  const littleKit = buildKitHtml({ kit: 'italian', childName: 'Ava', age: 3, lenient: true });
  const bigKit = buildKitHtml({ kit: 'italian', childName: 'Ava', age: 6, lenient: true });
  assert.match(littleKit, /<body class="little">/);
  assert.match(bigKit, /<body class="big">/);
  // the Italian waiter's pad is a guest check: little kids circle how many, big kids write it
  assert.ok(littleKit.includes('class="gc-circ"') && !bigKit.includes('class="gc-circ"') && bigKit.includes('class="gc-qty"'));
  const littlePizza = buildKitHtml({ kit: 'pizza', childName: 'Ava', age: 3, lenient: true });
  const bigPizza = buildKitHtml({ kit: 'pizza', childName: 'Ava', age: 6, lenient: true });
  assert.ok(littlePizza.includes('little-rec') && !bigPizza.includes('little-rec'));
  // Hand washing is a sign in pictures; the stove is just a cooktop; no bread basket sign; pizza is on the trattoria menu.
  assert.ok(bigPizza.includes('class="sign wash"') && bigKit.includes('class="sign wash"'));
  assert.ok(!bigKit.includes('class="sv-door"') && bigKit.includes('class="sv-ring"'));
  assert.ok(!/Bread Basket/i.test(bigKit));
  assert.match(bigKit, /class="fm-n">Pizza</);
  // Play money looks like real bills, sized for a toy cash register drawer, with metal-look coins.
  assert.match(bigKit, /class="bill2"[^>]*style="width:4.75in;height:2in"/);
  assert.equal((bigKit.match(/class="bill2"/g) || []).length, 8);
  assert.ok(bigKit.includes('BANK OF AVA’S TRATTORIA') && bigKit.includes('class="coin3"'));
  assert.ok(littleKit.includes('Circle what they want!') && !bigKit.includes('Circle what they want!'));
  assert.match(buildKitHtml({ kit: 'italian', childName: 'Ava', age: 3, ages: 'big', lenient: true }), /<body class="big">/);
  // Every kit: draw labels sit under the boxes, a fold-over Open/Closed sign and the money machine.
  for (const id of Object.keys(KITS)) {
    const html = buildKitHtml({ kit: id, childName: 'Ava', lenient: true });
    assert.ok(html.includes('class="draw-cap">Draw yourself') && !html.includes('Draw<br>yourself'), id);
    assert.ok(html.includes('flip-sign') && html.includes('Money Machine') && html.includes('Good Morning,'), id);
    assert.equal(html.includes('Big sign, page 2 of 2'), !KITS[id].hunt || Boolean(KITS[id].bigSign), id);
  }
  // Two kids on one kit: "and" becomes "&", each kid gets a lead badge and a certificate, and the
  // name spots shrink to fit in the browser.
  const { tidyNames } = require('../src/generator/kid-names');
  assert.equal(tidyNames(' Jaxon and  Jonah '), 'Jaxon & Jonah');
  assert.equal(tidyNames('Mia, Leo + Ava'), 'Mia, Leo & Ava');
  assert.equal(tidyNames('Anderson'), 'Anderson');
  const twins = buildKitHtml({ kit: 'space', childName: 'Jaxon and Jonah', lenient: true });
  assert.ok(twins.includes('Jaxon &amp; Jonah’s</span> <span style="white-space:nowrap">Mission Control'));
  assert.equal((twins.match(/class="badge /g) || []).length, 8);
  assert.ok(twins.includes('>Commander Jaxon</div>') && twins.includes('>Commander Jonah</div>'));
  assert.equal((twins.match(/class="page cert"/g) || []).length, 2);
  assert.ok(twins.includes('data-lines="1"') && twins.includes('data-fit-w=') && twins.includes('document.fonts.ready.then(fitAll)'));
  // The Italian kit: oven and stove that look like the real thing, jar labels, a peel, a chef hat and a folding menu.
  for (const piece of ['ov-dome', 'sv-ring', 'Jar Labels', 'Pizza Peel', 'Draw Your Own Pizza', 'Chef Hat', 'Menu, page 2 of 2']) assert.ok(bigKit.includes(piece), piece);
  assert.doesNotMatch(bigKit, /class="st-title"[^>]*>Pizza Oven/);

  // Handprint art: 12 pages per holiday with the child's name, age and month on every craft page.
  const { buildCraftHtml, HOLIDAYS } = require('../src/crafts/build');
  for (const holiday of Object.keys(HOLIDAYS).filter((h) => !HOLIDAYS[h].book)) {
    const craft = buildCraftHtml({ holiday, childName: 'Juniper', age: 3, year: 2026 });
    assert.equal((craft.match(/<section class="page/g) || []).length, 20, holiday); // 12, plus the 8 crafts again without outlines
    assert.equal((craft.match(new RegExp(`Juniper <i>·</i> age 3 <i>·</i> ${HOLIDAYS[holiday].month} 2026`, "g")) || []).length >= 16, true, holiday);
    assert.doesNotMatch(craft, /\{name\}|\{year\}|undefined|NaN/);
  }
  assert.throws(() => buildCraftHtml({ holiday: 'easter', childName: 'Bo' }), /Unknown holiday/);
  // The Memory Handprint Book: guide, cover, 2 how-to pages, 12 months and a growth page, with dashed
  // outlines to press on, or the finished prints in preview mode.
  const book = buildCraftHtml({ holiday: 'memory', childName: 'Juniper', year: 2027 });
  assert.equal((book.match(/<section class="page/g) || []).length, 29); // plus the 12 months again without outlines
  for (const m of HOLIDAYS.memory.crafts) assert.ok(book.includes(`>${m.month[0]}</span>`) && book.includes(m.title), m.month);
  assert.equal((book.match(/<div class="bkeep"><b>Juniper<\/b>/g) || []).length, 24);
  assert.match(book, /This book belongs to[\s\S]*Juniper[\s\S]*2027/);
  assert.doesNotMatch(book, /\{name\}|\{year\}|undefined|NaN/);
  // The other books: guide, cover, 2 how-to pages and 12 craft pages, then the 12 again without outlines.
  for (const id of ['zoo', 'fingerprint']) {
    const other = buildCraftHtml({ holiday: id, childName: 'Juniper', year: 2027 });
    assert.equal((other.match(/<section class="page/g) || []).length, 28, id);
    for (const c of HOLIDAYS[id].crafts) assert.ok(other.includes(c.heading) && other.includes(c.title), c.heading);
    assert.equal((other.match(/<div class="bkeep"><b>Juniper<\/b>/g) || []).length, 24, id);
    assert.match(other, /This book belongs to[\s\S]*Juniper[\s\S]*2027/);
    assert.doesNotMatch(other, /\{name\}|\{year\}|undefined|NaN/);
  }
  const preview = buildCraftHtml({ holiday: 'memory', childName: 'Juniper', preview: true });
  assert.ok((preview.match(/stroke-dasharray/g) || []).length < (book.match(/stroke-dasharray/g) || []).length);
  // Ready-made trails: only library spots, and the website's copy matches.
  const SPACE_TRAILS = require('../src/generator/spaces');
  const site = fs.readFileSync(path.join(__dirname, '..', 'docs', 'js', 'data.js'), 'utf8');
  for (const sp of Object.values(SPACE_TRAILS)) {
    assert.ok(sp.spots.every((id) => require('../src/generator/spots')[id]), sp.id);
    assert.ok(site.includes(`${sp.id}: ['${sp.label}', ${JSON.stringify(sp.spots).replace(/"/g, "'").replace(/,/g, ', ')}]`), `site trail ${sp.id}`);
  }
  // Shared scripts and the stylesheet carry a fingerprint of their content, so phones never mix old and new copies.
  assert.deepEqual(require('../scripts/stamp-assets').run({ check: true }), [], 'run: node scripts/stamp-assets.js');
  // Field Kit sounds: every one renders to clean audio, and every sound board button has a sound.
  {
    const sfx = require('../src/host/client/sfx').make(22050);
    for (const n of sfx.names) {
      const x = sfx.render(n);
      assert.ok(x.length > 2000 && x.length < 22050 * 7, `sound ${n} length`);
      let peak = 0; for (const v of x) { assert.ok(Number.isFinite(v), `sound ${n} is clean`); peak = Math.max(peak, Math.abs(v)); }
      assert.ok(peak > 0.05 && peak < 1, `sound ${n} level ${peak}`);
    }
    const fk = fs.readFileSync(path.join(__dirname, '..', 'src', 'host', 'client', 'fieldkit.js'), 'utf8');
    const used = [...fk.slice(fk.indexOf('const BOARD')).matchAll(/\['(\w+)', '/g)].map((m) => m[1]);
    assert.ok(used.length > 80);
    for (const n of new Set(used)) assert.ok(sfx.names.includes(n), `sound board uses missing sound ${n}`);
  }
  // Theme filter chips: every theme on the site sits in exactly one group.
  {
    const vm = require('vm');
    const ctx = { document: {}, window: {} };
    vm.createContext(ctx);
    vm.runInContext(`${site};this.T=THEMES;this.G=THEME_GROUPS;`, ctx);
    const grouped = ctx.G.flatMap((g) => g.ids);
    assert.equal(new Set(grouped).size, grouped.length, 'a theme is in two groups');
    for (const t of ctx.T) assert.ok(grouped.includes(t.id), `theme ${t.id} needs a group in THEME_GROUPS`);
    for (const id of grouped) assert.ok(ctx.T.some((t) => t.id === id), `THEME_GROUPS lists unknown theme ${id}`);
  }
  // The idea pages: a hub, one per home, one per theme and one per play kit, all in the sitemap, with no blanks.
  const ideaUrls = require('../scripts/idea-pages').build();
  // (plus the home page, make/, play-kits/ and handprint-art/)
  assert.equal(ideaUrls.length, 5 + Object.keys(SPACE_TRAILS).length + Object.keys(require('../src/generator/themes')).length + Object.keys(require('../src/kits/engine').KITS).length);
  const pizzaIdeas = fs.readFileSync(path.join(__dirname, '..', 'docs', 'ideas', 'pizza-shop-pretend-play', 'index.html'), 'utf8');
  assert.match(pizzaIdeas, /make\/\?theme=pizza"/);
  assert.match(pizzaIdeas, /Delivery Driver/);
  const sitemap = fs.readFileSync(path.join(__dirname, '..', 'docs', 'sitemap.xml'), 'utf8');
  for (const u of ideaUrls) assert.ok(sitemap.includes(`<loc>${u}</loc>`), u);
  const dinoIdeas = fs.readFileSync(path.join(__dirname, '..', 'docs', 'ideas', 'dinosaur-scavenger-hunt', 'index.html'), 'utf8');
  assert.match(dinoIdeas, /Junior Rangers/);
  assert.match(dinoIdeas, /make\/\?theme=dino"/);
  for (const f of fs.readdirSync(path.join(__dirname, '..', 'docs', 'ideas'))) {
    if (!f.endsWith('.html') && fs.statSync(path.join(__dirname, '..', 'docs', 'ideas', f)).isDirectory()) {
      assert.doesNotMatch(fs.readFileSync(path.join(__dirname, '..', 'docs', 'ideas', f, 'index.html'), 'utf8'), /undefined|\{kids\}|\{count\}|NaN/, f);
    }
  }
  const craftPdf = path.join(dataDir, 'craft.pdf');
  await require('../src/crafts/render-craft').renderCraft({ holiday: 'christmas', childName: 'Bo', age: 1 }, craftPdf);
  assert.ok(fs.statSync(craftPdf).size > 50000);

  for (let i = 0; i < 60; i++) {
    const s = JSON.parse(fs.readFileSync(path.join(dataDir, 'state.json'), 'utf8'));
    if (s.orders['etsy-900-1']?.status === 'ready' && s.orders['etsy-902-3']?.status === 'ready') break;
    await wait(500);
  }
  let state = JSON.parse(fs.readFileSync(path.join(dataDir, 'state.json'), 'utf8'));
  const o = state.orders['etsy-900-1'];
  assert.equal(o.status, 'ready', JSON.stringify(o));
  assert.ok(!state.orders['etsy-901-2'], 'standard pack order should be ignored');
  const kitOrder = state.orders['etsy-902-3'];
  assert.equal(kitOrder.product, 'kit');
  assert.equal(kitOrder.config.kit, 'vet');
  assert.match(kitOrder.message, /Hi Kim! Your Vet Clinic play kit for Maya is ready/);
  assert.ok(!kitOrder.kitReady);
  assert.equal(o.options.Theme, 'Space');
  assert.match(o.message, /Hi Pat!.*Deep Space Rover Expedition for Leo/s);
  assert.equal(o.product, 'bundle');
  // Each bundle Package option maps to the right mix.
  const pkgItems = (value) => require('../src/bot/orders').customRequest({ listing_id: 1, title: 'Custom Party Bundle', variations: [
    { formatted_name: 'Package', formatted_value: value }, { formatted_name: 'Personalization', formatted_value: 'Leo', question_id: 9 }] });
  assert.deepEqual(['Hunt + Play Kit + Party Pack', 'Hunt + Play Kit', 'Hunt + Party Pack', 'Hunt only'].map((v) => pkgItems(v).product), ['bundle', 'hunt+kit', 'hunt+party', 'hunt']);
  assert.deepEqual(pkgItems('Hunt + Party Pack').items, ['hunt', 'party']);
  assert.ok(o.kitReady);
  assert.match(o.message, /Mission Control play kit:\s+https:\/\/bot\.example\.com\/d\/[\w-]+-kit\.pdf/);
  assert.ok(o.partyReady);
  assert.match(o.message, /party printables[^\n]*:\s+https:\/\/bot\.example\.com\/d\/[\w-]+-party\.pdf/);
  // Field Kit: every order gets a private host link in the Etsy message; only hunts get a sidekick.
  assert.ok(o.message.includes(`https://bot.example.com/h/${o.hostToken}`) && o.sidekickToken);
  assert.ok(kitOrder.message.includes(`/h/${kitOrder.hostToken}`) && !kitOrder.sidekickToken);
  assert.match(kitOrder.message, /^Open your Field Kit on your phone\. It has pretend-play scenarios/m);
  assert.equal(seen[0].headers['x-api-key'], 'key:secret');
  assert.match(seen[0].u, /shops\/42\/receipts\?was_paid=true/);

  assert.equal((await realFetch(base + '/admin')).status, 401);
  const dash = await (await realFetch(base + '/admin', { headers: auth })).text();
  assert.match(dash, /Ready to send/);
  const pdf = await realFetch(`${base}/d/${o.downloadToken}.pdf`);
  assert.equal(pdf.headers.get('content-type'), 'application/pdf');
  assert.ok((await pdf.arrayBuffer()).byteLength > 50000);
  const kitPdf = await realFetch(`${base}/d/${o.downloadToken}-kit.pdf`);
  assert.equal(kitPdf.headers.get('content-disposition'), 'inline; filename="play-kit.pdf"');
  assert.ok((await kitPdf.arrayBuffer()).byteLength > 50000);

  // Manual order through the form.
  await realFetch(base + '/admin/orders', { method: 'POST', headers: { ...auth, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'personalization=Maya+6+space&buyerName=Jo', redirect: 'manual' });
  for (let i = 0; i < 60; i++) {
    state = JSON.parse(fs.readFileSync(path.join(dataDir, 'state.json'), 'utf8'));
    if (Object.values(state.orders).some((x) => x.source === 'manual' && x.status === 'ready')) break;
    await wait(500);
  }
  const manual = Object.values(state.orders).find((x) => x.source === 'manual');
  assert.equal(manual.status, 'ready');
  assert.ok(!manual.kitReady, 'unchecked play kit box means hunt only');

  // Bad config edit becomes "needs attention" instead of crashing.
  await realFetch(`${base}/admin/orders/${manual.id}/config`, { method: 'POST', headers: { ...auth, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'config=' + encodeURIComponent('{"theme":"space","childName":"Maya","spots":["nope","couch","bed"]}'), redirect: 'manual' });
  state = JSON.parse(fs.readFileSync(path.join(dataDir, 'state.json'), 'utf8'));
  assert.equal(state.orders[manual.id].status, 'needs_attention');
  assert.match(state.orders[manual.id].problem, /Unknown spot "nope"/);

  // Theme dropdown passes the theme on; clearing hides an order without deleting it.
  const form = { ...auth, 'Content-Type': 'application/x-www-form-urlencoded' };
  assert.match(await (await realFetch(base + '/admin', { headers: auth })).text(), /<select name="theme">.*Race Car Grand Prix Chase/s);
  await realFetch(base + '/admin/orders', { method: 'POST', headers: form, body: 'personalization=Leo+5&theme=racecar&product=hunt', redirect: 'manual' });
  state = JSON.parse(fs.readFileSync(path.join(dataDir, 'state.json'), 'utf8'));
  const themed = Object.values(state.orders).find((x) => x.personalization === 'Leo 5');
  assert.equal(themed.options.Theme, 'Race Car Grand Prix Chase');
  // The shop kits are hunt themes now; "Play kit only" makes a theme's kit, and an old kit: pick still works.
  assert.match(await (await realFetch(base + '/admin', { headers: auth })).text(), /<option value="dentist">Dentist Office Sparkle Smile Quest<\/option>/);
  await realFetch(base + '/admin/orders', { method: 'POST', headers: form, body: 'personalization=Ivy+4&theme=kit%3Adentist&product=kit', redirect: 'manual' });
  await realFetch(base + '/admin/orders', { method: 'POST', headers: form, body: 'personalization=Max+7&theme=pirate&product=kit', redirect: 'manual' });
  state = JSON.parse(fs.readFileSync(path.join(dataDir, 'state.json'), 'utf8'));
  const byHand = (n) => Object.values(state.orders).find((x) => x.personalization === n);
  assert.deepEqual([byHand('Ivy 4').product, byHand('Ivy 4').kit, byHand('Ivy 4').options.Kit], ['kit', 'dentist', 'Dentist Office']);
  assert.deepEqual([byHand('Max 7').product, byHand('Max 7').kit], ['kit', 'pirate']);
  // Boxes pick what's in it, and the version can be picked by hand.
  const page0 = await (await realFetch(base + '/admin', { headers: auth })).text();
  assert.match(page0, /name="item" value="activity"/);
  assert.match(page0, /<option value="little">Little kids, ages 3 to 5<\/option>/);
  await realFetch(base + '/admin/orders', { method: 'POST', headers: form, body: 'personalization=Zoe+6&theme=kit%3Apizza&item=kit&item=activity&ages=little', redirect: 'manual' });
  await realFetch(base + '/admin/orders', { method: 'POST', headers: form, body: 'personalization=Eli+3&theme=dino&item=activity', redirect: 'manual' });
  for (let i = 0; i < 60; i++) {
    state = JSON.parse(fs.readFileSync(path.join(dataDir, 'state.json'), 'utf8'));
    if (['Zoe 6', 'Eli 3', 'Ivy 4'].every((n) => byHand(n)?.status === 'ready')) break;
    await wait(500);
  }
  assert.deepEqual([byHand('Zoe 6').items, byHand('Zoe 6').config.ages, byHand('Zoe 6').options.Version, byHand('Zoe 6').activityReady], [['kit', 'activity'], 'little', 'Little kids, ages 3 to 5', true]);
  assert.deepEqual([byHand('Eli 3').product, byHand('Eli 3').kit, byHand('Eli 3').kitReady], ['activity', 'dino', false]);
  assert.ok(!byHand('Ivy 4').activityReady, 'a hand-made play kit leaves out the activity pack unless ticked');
  await realFetch(`${base}/admin/orders/${manual.id}/clear`, { method: 'POST', headers: form, redirect: 'manual' });
  let page = await (await realFetch(base + '/admin', { headers: auth })).text();
  assert.match(page, /Cleared \(1\)/);
  assert.match(page, /Put back/);
  await realFetch(`${base}/admin/orders/${manual.id}/restore`, { method: 'POST', headers: form, redirect: 'manual' });
  state = JSON.parse(fs.readFileSync(path.join(dataDir, 'state.json'), 'utf8'));
  assert.equal(state.orders[manual.id].cleared, false);
  await realFetch(`${base}/admin/orders/${o.id}/sent`, { method: 'POST', headers: form, redirect: 'manual' });
  await realFetch(base + '/admin/orders/clear-sent', { method: 'POST', headers: form, redirect: 'manual' });
  state = JSON.parse(fs.readFileSync(path.join(dataDir, 'state.json'), 'utf8'));
  assert.ok(state.orders[o.id].cleared && !state.orders[manual.id].cleared, 'clear all sent only clears sent orders');
  assert.equal((await realFetch(`${base}/d/${o.downloadToken}.pdf`)).status, 200, 'cleared orders keep their links');

  // Website order: checkout -> signed Stripe webhook -> PDF -> email.
  const bad = await realFetch(base + '/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ theme: 'dino', childName: 'Ava', spots: ['front_door'] }) });
  assert.equal(bad.status, 400);
  assert.match((await bad.json()).error, /between 3 and 12/);
  const pre = await realFetch(base + '/api/checkout', { method: 'OPTIONS' });
  assert.equal(pre.headers.get('access-control-allow-origin'), '*');
  // With SITE_ORIGIN set to the old GitHub Pages site, the new domain is still allowed.
  process.env.SITE_ORIGIN = 'https://jtr4in.github.io';
  for (const origin of ['https://littleprintquests.com', 'https://jtr4in.github.io']) {
    const ok = await realFetch(base + '/api/checkout', { method: 'OPTIONS', headers: { Origin: origin } });
    assert.equal(ok.headers.get('access-control-allow-origin'), origin);
  }
  const other = await realFetch(base + '/api/checkout', { method: 'OPTIONS', headers: { Origin: 'https://evil.example' } });
  assert.equal(other.headers.get('access-control-allow-origin'), 'https://jtr4in.github.io');
  delete process.env.SITE_ORIGIN;
  // Older forms send a product name; newer ones send any mix of items.
  const webOrders = [
    { product: 'bundle', spots: ['front_door', 'pet_bed', 'kitchen_table'], has: ['hunt', 'kit', 'party'] },
    { spots: ['front_door', { custom: 'Grandma’s piano' }, 'kitchen_table'], has: ['hunt'] },
    { product: 'party', spots: [], has: ['party'] },
    { items: ['hunt', 'kit'], spots: ['front_door', 'pet_bed', 'kitchen_table'], has: ['hunt', 'kit'] },
    { items: ['party', 'kit'], spots: [], has: ['kit', 'party'] },
    { items: ['activity', 'kit', 'hunt'], spots: ['front_door', 'pet_bed', 'kitchen_table'], has: ['hunt', 'kit', 'activity'] },
    { items: ['activity'], spots: [], has: ['activity'] },
    // The shop kits have their own hunt and party pack now, so they get the everything bundle too.
    { theme: 'pizza', items: ['hunt', 'kit', 'party'], spots: ['front_door', 'pet_bed', 'kitchen_table'], has: ['hunt', 'kit', 'party'] },
    // An older page sends the shop kit by itself: it stands for its theme.
    { kit: 'burger', items: ['kit', 'activity'], spots: [], has: ['kit', 'activity'], ages: 'little' },
  ];
  for (const { product, items, spots, has, kit, ages, theme = 'dino' } of webOrders) {
    const co = await realFetch(base + '/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product, items, kit, ages, theme, childName: 'Ava', age: 5, spots, pets: [{ name: 'Rex', kind: 'trex' }], party: { date: 'Saturday, June 3', place: '' } }) });
    assert.equal(co.status, 200);
    const orderId = (await co.json()).url.split('/').pop();
    assert.match(orderId, /^web-/);
    state = JSON.parse(fs.readFileSync(path.join(dataDir, 'state.json'), 'utf8'));
    assert.equal(state.orders[orderId].status, 'awaiting_payment');
    assert.match(await (await realFetch(`${base}/order/${orderId}`)).text(), /Confirming your payment/);

    const payload = JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed', data: { object: {
      id: 'cs_test_1', payment_status: 'paid', metadata: { order_id: orderId }, customer_details: { email: 'ava.parent@example.com', name: 'Pat Parent' } } } });
    const forged = await realFetch(base + '/webhooks/stripe', { method: 'POST', body: payload, headers: { 'stripe-signature': 't=1,v1=bad' } });
    assert.equal(forged.status, 400);
    const sig = payments.stripe().webhooks.generateTestHeaderString({ payload, secret: 'whsec_test' });
    const hook = await realFetch(base + '/webhooks/stripe', { method: 'POST', body: payload, headers: { 'stripe-signature': sig } });
    assert.equal(hook.status, 200);
    for (let i = 0; i < 60; i++) {
      state = JSON.parse(fs.readFileSync(path.join(dataDir, 'state.json'), 'utf8'));
      if (state.orders[orderId].sent || state.orders[orderId].status === 'needs_attention') break;
      await wait(500);
    }
    const w = state.orders[orderId];
    assert.equal(w.status, 'ready', JSON.stringify(w));
    assert.equal(w.config.theme, kit || theme);
    if (kit) assert.equal(w.config.kit, kit);
    // the website's Little kids / Big kids choice reaches the kit
    assert.equal(w.config.ages, ages);
    if (ages) assert.equal(w.options.Version, 'Little kids, ages 3 to 5');
    assert.ok(w.sent && w.deliveredAt);
    const mail = emails.at(-1);
    assert.deepEqual(mail.to, ['ava.parent@example.com']);
    assert.ok(mail.html.includes(`/d/${w.downloadToken}.pdf`));
    const main = has[0];
    const extraKit = main !== 'kit' && has.includes('kit');
    const extraParty = main !== 'party' && has.includes('party');
    assert.equal(mail.html.includes(`/d/${w.downloadToken}-kit.pdf`), extraKit);
    assert.equal(Boolean(w.kitReady), extraKit);
    assert.equal(mail.html.includes(`/d/${w.downloadToken}-party.pdf`), extraParty);
    assert.equal(Boolean(w.partyReady), extraParty);
    const extraActivity = main !== 'activity' && has.includes('activity');
    assert.equal(mail.html.includes(`/d/${w.downloadToken}-activities.pdf`), extraActivity);
    assert.equal(Boolean(w.activityReady), extraActivity);
    if (extraActivity) assert.equal((await realFetch(`${base}/d/${w.downloadToken}-activities.pdf`)).headers.get('content-disposition'), 'inline; filename="activity-pack.pdf"');
    if (has.includes('party')) assert.deepEqual(w.party || w.config.party, { date: 'Saturday, June 3' });
    if (main === 'kit') assert.match(mail.subject, kit ? new RegExp(`${KITS[kit].name} play kit for Ava`) : /Dino Dig Lab play kit for Ava/);
    if (product === 'party') {
      assert.match(mail.subject, /Dinosaur party pack for Ava/);
      assert.equal((await realFetch(`${base}/d/${w.downloadToken}.pdf`)).headers.get('content-disposition'), 'inline; filename="scavenger-hunt.pdf"');
    }
    if (product === 'bundle') assert.equal((await realFetch(`${base}/d/${w.downloadToken}-party.pdf`)).headers.get('content-disposition'), 'inline; filename="party-printables.pdf"');
    assert.match(await (await realFetch(`${base}/order/${orderId}`)).text(), { hunt: /hunt is ready/, kit: /play kit is ready/, activity: /activity pack is ready/, party: /party pack is ready/ }[main]);
    // The activity pack on its own has nothing for the Field Kit to do.
    if (main === 'activity' && has.length === 1) {
      assert.ok(!w.hostToken && !mail.html.includes('/h/'));
      continue;
    }
    assert.ok(w.hostToken && mail.html.includes(`/h/${w.hostToken}`));
    assert.equal(Boolean(w.sidekickToken), has.includes('hunt'));
    // Field Kit has a tab for each thing bought; the others are greyed out.
    const tabsHtml = await (await realFetch(`${base}/h/${w.hostToken}`)).text();
    for (const [item, label] of [['hunt', 'Hunt'], ['kit', 'Play Kit'], ['party', 'Party']]) {
      const greyed = new RegExp(`class="off"[^>]*><span>[^<]+</span>${label}<small>Not in this order`).test(tabsHtml);
      assert.equal(greyed, !has.includes(item), `${product}: ${label} tab`);
    }
    if (has.includes('kit')) assert.match(tabsHtml, /Pretend-play scenarios[\s\S]*Surprise me[\s\S]*Ava can say/);
    if (has.includes('party')) assert.match(tabsHtml, /Ava’s party plan[\s\S]*Hand out or mail the invitations/);
    assert.ok(!/\{\w+\}/.test(tabsHtml.replace(/<script>[\s\S]*<\/script>/, '')), 'no unfilled placeholders');
    assert.ok(!/etsy\.com|github\.io|\$\d/i.test(tabsHtml), 'Field Kit must not link to the shop or show prices');
    if (main === 'hunt') {
      // Field Kit and the sidekick page share progress, and stay free of shop links and prices (Etsy buyers get them too).
      const hostHtml = await (await realFetch(`${base}/h/${w.hostToken}`)).text();
      assert.match(hostHtml, /Hide Card 2/);
      assert.match(hostHtml, /Read Clue #1 aloud/);
      assert.ok(!/etsy\.com|github\.io|\$\d/i.test(hostHtml), 'Field Kit must not link to the shop or show prices');
      assert.equal((await realFetch(`${base}/h/${w.hostToken}/state`, { method: 'POST', body: JSON.stringify({ step: 5 }) })).status, 204);
      assert.deepEqual(await (await realFetch(`${base}/s/${w.sidekickToken}/state`)).json(), { step: 5 });
      assert.match(await (await realFetch(`${base}/s/${w.sidekickToken}`)).text(), /Your jobs today/);
      assert.equal((await realFetch(`${base}/s/${w.sidekickToken}/state`, { method: 'POST', body: '{"step":1}' })).status, 200); // sidekick can't move the host
      assert.equal((await realFetch(`${base}/h/${'x'.repeat(24)}`)).status, 404);
      // Page picker: every PDF's pages listed with thumbnails, and a PDF of just the picked pages.
      assert.match(hostHtml, /data-pages/);
      const { PDFDocument } = require('pdf-lib');
      const pj = await (await realFetch(`${base}/d/${w.downloadToken}/pages.json`)).json();
      assert.equal(pj.docs[0].id, 'main');
      assert.equal(pj.docs.length, 1 + ['kit', 'activity', 'party'].filter((i) => has.includes(i)).length);
      for (const d of pj.docs) {
        const suffix = d.id === 'main' ? '' : `-${d.id}`;
        const pdf = await PDFDocument.load(Buffer.from(await (await realFetch(`${base}/d/${w.downloadToken}${suffix}.pdf`)).arrayBuffer()));
        assert.equal(d.pages.length, pdf.getPageCount(), `${d.id} page list matches its PDF`);
        assert.ok(d.pages.every((x) => x.title && !/\{\w+\}/.test(x.title)), `${d.id} page titles`);
      }
      const th = await realFetch(`${base}/d/${w.downloadToken}/thumb/main/1.jpg`);
      assert.equal(th.status, 200); assert.equal(th.headers.get('content-type'), 'image/jpeg');
      const second = pj.docs[1]?.id;
      const pick = await realFetch(`${base}/d/${w.downloadToken}/pick.pdf?main=1,3${second ? `&${second}=2-3,99` : ''}`);
      assert.equal(pick.headers.get('content-type'), 'application/pdf');
      assert.equal((await PDFDocument.load(Buffer.from(await pick.arrayBuffer()))).getPageCount(), second ? 4 : 2);
      assert.equal((await realFetch(`${base}/d/${w.downloadToken}/pick.pdf`)).status, 400);
      assert.equal((await realFetch(`${base}/d/${'x'.repeat(24)}/pages.json`)).status, 404);
      // Field Kit extras: Get ready tab and offline files.
      assert.match(hostHtml, /data-sec="prep"[\s\S]*Keep it handy/);
      assert.match(hostHtml, /window\.FKCFG=/);
      assert.ok(!hostHtml.includes('/m/') && !hostHtml.includes('Mission screen'), 'no kids’ screen');
      const sw = await realFetch(`${base}/h/${w.hostToken}/sw.js`);
      assert.equal(sw.headers.get('service-worker-allowed'), `/h/${w.hostToken}`);
      assert.equal((await (await realFetch(`${base}/h/${w.hostToken}/manifest.webmanifest`)).json()).start_url, `/h/${w.hostToken}`);
      assert.equal((await realFetch(`${base}/h/${w.hostToken}/icon-192.png`)).status, 200);
      assert.equal((await realFetch(`${base}/h/${w.hostToken}/art/0.webp`)).status, 200);
      assert.equal((await realFetch(`${base}/s/${w.sidekickToken}/sw.js`)).status, 404);
      assert.match(await (await realFetch(`${base}/order/${orderId}`)).text(), /Open your Field Kit/);
    }
    // Stripe retries the same event: no second email.
    await realFetch(base + '/webhooks/stripe', { method: 'POST', body: payload, headers: { 'stripe-signature': sig } });
  }
  await wait(500);
  assert.equal(emails.length, 9);
  assert.deepEqual(charged, [1699, 999, 699, 1499, 1299, 1799, 499, 1699, 1099]);

  // A 100%-off promotion code: Stripe says 'no_payment_required', and the order is still built and emailed.
  {
    const co = await realFetch(base + '/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: 'space', childName: 'Free', age: 5, spots: ['front_door', 'pet_bed', 'kitchen_table'] }) });
    const orderId = (await co.json()).url.split('/').pop();
    const payload = JSON.stringify({ id: 'evt_free', type: 'checkout.session.completed', data: { object: {
      id: 'cs_test_free', payment_status: 'no_payment_required', amount_subtotal: 999, amount_total: 0, total_details: { amount_discount: 999 },
      metadata: { order_id: orderId }, customer_details: { email: 'friend@example.com', name: 'A Friend' } } } });
    const sig = payments.stripe().webhooks.generateTestHeaderString({ payload, secret: 'whsec_test' });
    assert.equal((await realFetch(base + '/webhooks/stripe', { method: 'POST', body: payload, headers: { 'stripe-signature': sig } })).status, 200);
    for (let i = 0; i < 60; i++) {
      state = JSON.parse(fs.readFileSync(path.join(dataDir, 'state.json'), 'utf8'));
      if (state.orders[orderId].sent || state.orders[orderId].status === 'needs_attention') break;
      await wait(500);
    }
    const free = state.orders[orderId];
    assert.equal(free.status, 'ready', JSON.stringify(free));
    assert.ok(free.sent);
    // The code is noted, but add-ons are still priced as the bundle difference ($10 more for a hunt).
    assert.equal(free.discountCents, 999);
    assert.equal(free.paidCents, 999);
    assert.match(await (await realFetch(`${base}/order/${orderId}`)).text(), /Add to my order · \$10\.00/);
    assert.deepEqual(emails.at(-1).to, ['friend@example.com']);
    assert.ok(emails.at(-1).html.includes(`/d/${free.downloadToken}.pdf`));
    assert.equal((await realFetch(`${base}/d/${free.downloadToken}.pdf`)).status, 200);
    charged.pop();
  }

  // After checkout: the order page and email offer the rest of the bundle for the difference.
  state = JSON.parse(fs.readFileSync(path.join(dataDir, 'state.json'), 'utf8'));
  const huntOnly = Object.values(state.orders).find((o) => o.source === 'web' && o.product === 'hunt' && o.status === 'ready');
  assert.equal(huntOnly.paidCents, 999);
  assert.ok(emails.some((m) => m.html.includes(`/order/${huntOnly.id}/add`) && m.html.includes('$10.00')));
  assert.match(await (await realFetch(`${base}/order/${huntOnly.id}`)).text(), /Add the pretend play kit, activity pack and party pack[\s\S]*Add to my order · \$10\.00/);
  // The party bundle (hunt, kit and party pack) only lacks the activity pack: $3 more.
  const bundleOrder = Object.values(state.orders).find((o) => o.source === 'web' && o.product === 'bundle' && o.status === 'ready');
  assert.match(await (await realFetch(`${base}/order/${bundleOrder.id}`)).text(), /Add the activity pack[\s\S]*Add to my order · \$3\.00/);
  const upCharged = [];
  payments.createUpgradeCheckout = async (order, up) => {
    upCharged.push(up.cents);
    return { id: 'cs_up', url: `https://checkout.stripe.com/c/pay/up-${order.id}` };
  };
  const addRes = await realFetch(`${base}/order/${huntOnly.id}/add`, { redirect: 'manual' });
  assert.equal(addRes.status, 303);
  assert.equal(addRes.headers.get('location'), `https://checkout.stripe.com/c/pay/up-${huntOnly.id}`);
  assert.deepEqual(upCharged, [1000]);
  const upPayload = JSON.stringify({ id: 'evt_up', type: 'checkout.session.completed', data: { object: {
    id: 'cs_up', payment_status: 'paid', amount_total: 1000, metadata: { upgrade_of: huntOnly.id, add: 'kit,activity,party', cents: '1000' } } } });
  const upSig = payments.stripe().webhooks.generateTestHeaderString({ payload: upPayload, secret: 'whsec_test' });
  const mailsBefore = emails.length;
  for (let i = 0; i < 2; i++) assert.equal((await realFetch(base + '/webhooks/stripe', { method: 'POST', body: upPayload, headers: { 'stripe-signature': upSig } })).status, 200);
  let up;
  for (let i = 0; i < 60; i++) {
    up = JSON.parse(fs.readFileSync(path.join(dataDir, 'state.json'), 'utf8')).orders[huntOnly.id];
    if (up.status !== 'processing' && up.upgrades) break;
    await wait(500);
  }
  assert.equal(up.status, 'ready', JSON.stringify(up));
  assert.deepEqual(up.items, ['hunt', 'kit', 'activity', 'party']);
  assert.equal(up.downloadToken, huntOnly.downloadToken); // same links as before
  assert.equal(up.hostToken, huntOnly.hostToken);
  assert.ok(up.kitReady && up.activityReady && up.partyReady);
  assert.equal(up.paidCents, 1999);
  assert.equal(up.upgrades.length, 1); // Stripe resending the event adds nothing twice
  await wait(300);
  assert.equal(emails.length, mailsBefore + 1);
  assert.ok(emails.at(-1).html.includes(`/d/${up.downloadToken}-party.pdf`) && !emails.at(-1).html.includes('/add'));
  const upPage = await (await realFetch(`${base}/order/${huntOnly.id}`)).text();
  assert.match(upPage, /Download your party printables/);
  assert.ok(!/Add to my order/.test(upPage));
  assert.equal((await realFetch(`${base}/order/${huntOnly.id}/add`, { redirect: 'manual' })).headers.get('location'), `/order/${huntOnly.id}`);
  assert.equal((await realFetch(base + '/order/manual-1')).status, 401); // only web orders are public
  assert.match(await (await realFetch(base + '/admin', { headers: auth })).text(), /Emailed to ava\.parent@example\.com/);

  const readStateNow = () => JSON.parse(fs.readFileSync(path.join(dataDir, 'state.json'), 'utf8'));
  // Family Pass: bought once through Stripe, the code comes by email, then 6 free orders and no more.
  payments.createPassCheckout = async (p) => {
    charged.push(payments.PRICES.pass);
    return { id: 'cs_pass', url: `https://checkout.stripe.com/c/pay/${p.id}` };
  };
  const passId = (await (await realFetch(base + '/api/pass', { method: 'POST', body: '{}' })).json()).url.split('/').pop();
  assert.match(passId, /^pass-/);
  assert.match(await (await realFetch(`${base}/pass/${passId}`)).text(), /Setting up your Family Pass/);
  const passPayload = JSON.stringify({ id: 'evt_p', type: 'checkout.session.completed', data: { object: {
    id: 'cs_pass', payment_status: 'paid', metadata: { pass_id: passId }, customer_details: { email: 'pat@example.com', name: 'Pat Parent' } } } });
  const passSig = payments.stripe().webhooks.generateTestHeaderString({ payload: passPayload, secret: 'whsec_test' });
  for (let i = 0; i < 2; i++) assert.equal((await realFetch(base + '/webhooks/stripe', { method: 'POST', body: passPayload, headers: { 'stripe-signature': passSig } })).status, 200);
  await wait(300);
  const passMails = emails.filter((e) => /Family Pass code/.test(e.subject));
  assert.equal(passMails.length, 1, 'Stripe resending the event sends no second code');
  assert.deepEqual(passMails[0].to, ['pat@example.com']);
  const code = passMails[0].subject.split(': ')[1];
  assert.match(code, /^LPQ-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/);
  assert.ok(passMails[0].html.includes(code) && /6 orders/.test(passMails[0].html));
  const passHtml = await (await realFetch(`${base}/pass/${passId}`)).text();
  assert.ok(passHtml.includes(code) && /6 of 6<\/b> orders left/.test(passHtml));
  const checkCode = (c) => realFetch(base + '/api/pass/check', { method: 'POST', body: JSON.stringify({ code: c }) });
  assert.equal((await (await checkCode(code.toLowerCase().replace(/-/g, ' '))).json()).left, 6); // forgiving about case and dashes
  assert.equal((await checkCode('LPQ-AAAA-AAAA')).status, 404);
  const passOrder = (passCode) => realFetch(base + '/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: ['activity'], theme: 'dino', childName: 'Ava', spots: [], passCode }) });
  const before = charged.length;
  const passOrderIds = [];
  for (let i = 0; i < 6; i++) {
    const r = await passOrder(code);
    assert.equal(r.status, 200);
    const data = await r.json();
    assert.equal(data.pass.left, 5 - i);
    passOrderIds.push(data.url.split('/').pop());
  }
  const seventh = await passOrder(code);
  assert.equal(seventh.status, 400);
  assert.match((await seventh.json()).error, /used all 6/);
  assert.equal(charged.length, before, 'pass orders never go to Stripe');
  for (let i = 0; i < 120 && !passOrderIds.every((id) => readStateNow().orders[id]?.sent); i++) await wait(500);
  const firstPassOrder = readStateNow().orders[passOrderIds[0]];
  assert.equal(firstPassOrder.status, 'ready');
  assert.equal(firstPassOrder.paidWith, 'pass');
  assert.deepEqual(emails.find((e) => e.html.includes(`/d/${firstPassOrder.downloadToken}.pdf`)).to, ['pat@example.com']);
  assert.ok(emails.some((e) => /Made with your Family Pass: <b>0 of 6<\/b>/.test(e.html)));
  const ordersNow = Object.values(readStateNow().orders);
  assert.equal(readStateNow().passes[passId].uses.length, 6);
  assert.ok(!ordersNow.some((o) => o.status === 'awaiting_payment' && o.form?.items?.[0] === 'activity' && !o.passId), 'the refused 7th order is not kept');
  assert.match(await (await realFetch(base + '/admin', { headers: auth })).text(), /Family Passes:<\/b> 1 sold · 6 orders made with them/);

  // Website handprint art order: on its own, no Field Kit.
  const readState = () => JSON.parse(fs.readFileSync(path.join(dataDir, 'state.json'), 'utf8'));
  const badCraft = await realFetch(base + '/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ craft: 'easter', childName: 'Ava' }) });
  assert.equal(badCraft.status, 400);
  assert.match((await badCraft.json()).error, /handprint art pack or book/);
  const craftCo = await realFetch(base + '/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ craft: 'halloween', childName: 'Ava', age: 2 }) });
  const craftId = (await craftCo.json()).url.split('/').pop();
  assert.match(await (await realFetch(`${base}/order/${craftId}`)).text(), /Confirming your payment/);
  const craftPayload = JSON.stringify({ id: 'evt_2', type: 'checkout.session.completed', data: { object: {
    id: 'cs_test_2', payment_status: 'paid', metadata: { order_id: craftId }, customer_details: { email: 'ava.parent@example.com', name: 'Pat Parent' } } } });
  await realFetch(base + '/webhooks/stripe', { method: 'POST', body: craftPayload, headers: { 'stripe-signature': payments.stripe().webhooks.generateTestHeaderString({ payload: craftPayload, secret: 'whsec_test' }) } });
  for (let i = 0; i < 60 && !readState().orders[craftId].sent; i++) await wait(500);
  const craftOrder = readState().orders[craftId];
  assert.equal(craftOrder.status, 'ready', JSON.stringify(craftOrder));
  assert.deepEqual(craftOrder.config, { holiday: 'halloween', childName: 'Ava', age: 2 });
  assert.ok(!craftOrder.hostToken);
  assert.equal(charged.at(-1), 599);
  assert.ok(craftOrder.sent, JSON.stringify(craftOrder));
  assert.match(emails.at(-1).subject, /Halloween handprint art pack for Ava/);
  assert.doesNotMatch(emails.at(-1).html, /Field Kit/);
  assert.match(await (await realFetch(`${base}/order/${craftId}`)).text(), /handprint art pack is ready/);
  assert.match(await (await realFetch(base + '/admin', { headers: auth })).text(), /Halloween handprint art/);
  // By hand from the dashboard, picking the holiday.
  const handCraft = await realFetch(base + '/admin/orders', { method: 'POST', headers: { ...auth, 'Content-Type': 'application/x-www-form-urlencoded' }, redirect: 'manual',
    body: new URLSearchParams({ personalization: 'Theo, age 2', theme: 'craft:christmas' }).toString() });
  const handId = decodeURIComponent(handCraft.headers.get('location').match(/made=([^#&]+)/)[1]);
  for (let i = 0; i < 60 && readState().orders[handId].status !== 'ready'; i++) await wait(500);
  assert.equal(readState().orders[handId].status, 'ready', readState().orders[handId].problem);
  assert.match(readState().orders[handId].message, /Christmas handprint art pack for Theo/);

  // Free sample: email signup sends a mini picture-clue hunt and joins the list; unsubscribe works.
  const ask = (body) => realFetch(base + '/api/sample', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  assert.equal((await ask({ email: 'nope' })).status, 400);
  assert.equal((await ask({ email: 'Jo@Example.com', theme: 'pirate' })).status, 200);
  const sampleMail = emails.at(-1);
  assert.deepEqual(sampleMail.to, ['jo@example.com']);
  assert.match(sampleMail.html, /\/sample\/pirate\.pdf/);
  await ask({ email: 'jo@example.com', theme: 'pirate' });
  assert.equal(emails.filter((e) => e.to[0] === 'jo@example.com').length, 1, 'one sample email a day');
  const samplePdf = await realFetch(base + '/sample/pirate.pdf');
  assert.equal(samplePdf.headers.get('content-type'), 'application/pdf');
  assert.match(await (await realFetch(base + '/admin/subscribers.csv', { headers: auth })).text(), /"jo@example\.com","pirate"/);
  const unsub = sampleMail.html.match(/href="https:\/\/bot\.example\.com(\/unsubscribe\?[^"]+)"/)[1].replace(/&amp;/g, '&');
  assert.equal((await realFetch(base + unsub)).status, 200);
  assert.doesNotMatch(await (await realFetch(base + '/admin/subscribers.csv', { headers: auth })).text(), /jo@example/);
  assert.equal((await realFetch(base + '/unsubscribe?e=jo@example.com&t=wrong')).status, 400);

  // Etsy listings: drafts with photos, files and variation prices; a failed step resumes on the next click.
  const createListings = () => realFetch(base + '/admin/etsy/listings', { method: 'POST', headers: auth, redirect: 'manual' });
  const N = require('../src/bot/listings').CATALOG.length;
  for (const c of require('../src/bot/listings').CATALOG) {
    assert.ok(c.photos.length <= 20, `${c.key} has more than 20 photos`);
    for (const f of c.photos) assert.ok(fs.existsSync(path.join(__dirname, '..', 'listing-assets', f)), `missing listing-assets/${f}`);
  }
  assert.equal(N, 67); // 16 packs, the bundle, both dropdown listings, a party pack per theme, a listing per kit (16 theme kits + 11 shop kits) 2 handprint art packs and 3 handprint books
  const listingsDone = async () => {
    for (let i = 0; i < 240; i++) {
      await wait(500);
      const l = JSON.parse(fs.readFileSync(path.join(dataDir, 'state.json'), 'utf8')).listings || {};
      if (Object.keys(l).length === N && Object.values(l).every((x) => x.ready || (x.error && !x.working))) return l;
    }
    throw new Error('listings never finished');
  };
  assert.match(await (await realFetch(base + '/admin', { headers: auth })).text(), /Create drafts on Etsy/);
  // A run shows its progress and can be stopped between steps, then picks up where it left off.
  await createListings();
  const running = await (await realFetch(base + '/admin', { headers: auth })).text();
  assert.match(running, /class="bar"/);
  assert.match(running, /of 67 listings done/);
  await realFetch(base + '/admin/etsy/listings/stop', { method: 'POST', headers: auth, redirect: 'manual' });
  for (let i = 0; i < 100 && require('../src/bot/listings').isRunning(); i++) await wait(100);
  assert.ok(!require('../src/bot/listings').isRunning(), 'stop ends the run');
  const stoppedPage = await (await realFetch(base + '/admin', { headers: auth })).text();
  assert.match(stoppedPage, /Stopped\. Click below to pick up where it left off/);
  assert.ok(Object.values(JSON.parse(fs.readFileSync(path.join(dataDir, 'state.json'), 'utf8')).listings || {}).filter((x) => x.ready).length < N);
  await createListings();
  let listed = await listingsDone();
  assert.match(listed.kits.error, /Temporary upload problem/);
  assert.equal(Object.values(listed).filter((x) => x.ready).length, N - 1);
  await createListings();
  listed = await listingsDone();
  assert.ok(Object.values(listed).every((x) => x.ready));
  const creates = etsyCalls.filter((c) => c.p === '/shops/42/listings' && c.method === 'POST');
  assert.equal(creates.length, N, 'resuming must not create a second kits listing');
  const pack = creates[0].body;
  // Five shop sections, each made once and reused.
  assert.deepEqual(shopSections.map((s) => s.title), ['Scavenger Hunt Packs', 'Custom Party Bundles', 'Pretend Play Kits', 'Party Printables', 'Handprint Art']);
  assert.deepEqual([...new Set(creates.map((c) => c.body.shop_section_id))], ['300', '301', '302', '303', '304']);
  assert.equal(pack.type, 'download');
  assert.equal(pack.price, '8.00');
  assert.equal(pack.taxonomy_id, '1250');
  assert.equal(pack.tags.split(',').length, 13);
  assert.match(pack.description, /^Roar!.*WHAT'S INCLUDED/s);
  const bundleId = listed.bundle.id;
  const inv = etsyCalls.find((c) => c.p === `/listings/${bundleId}/inventory`).body;
  assert.deepEqual(inv.products.map((x) => [x.property_values[0].values[0], x.offerings[0].price]), [['Hunt + Play Kit + Party Pack', 16.99], ['Hunt + Play Kit', 14.99], ['Hunt + Party Pack', 13.99], ['Hunt only', 9.99]]);
  const kitInv = etsyCalls.find((c) => c.p === `/listings/${listed.kits.id}/inventory`).body;
  assert.equal(kitInv.products.length, 27);
  const partyInv = etsyCalls.find((c) => c.p === `/listings/${listed.party.id}/inventory`).body;
  assert.deepEqual(partyInv.products.map((x) => x.property_values[0].values[0]).slice(0, 2), ['Dinosaur', 'Superhero']);
  const q = etsyCalls.find((c) => c.p === `/shops/42/listings/${bundleId}/personalization`).body.personalization_questions[0];
  assert.ok(q.required && q.question_text.length <= 45 && /pets or toys/.test(q.instructions));
  assert.equal(etsyCalls.filter((c) => c.p === `/shops/42/listings/${listed.kits.id}/images`).length, 21); // 20 photos + 1 failed try
  const files = etsyCalls.filter((c) => /\/files$/.test(c.p));
  assert.equal(files.length, N);
  // Theme packs get 5 photos each.
  assert.equal(etsyCalls.filter((c) => c.p === `/shops/42/listings/${listed['pack-dino'].id}/images`).length, 5);
  // Clicking again once everything is ready updates the listings in place: no new drafts or photos.
  const imagesBefore = etsyCalls.filter((c) => /\/images$/.test(c.p) && c.method === 'POST').length;
  const patchesBefore = etsyCalls.filter((c) => c.method === 'PATCH').length;
  const bundleInvBefore = etsyCalls.filter((c) => c.p === `/listings/${bundleId}/inventory`).length;
  assert.match(await (await realFetch(base + '/admin', { headers: auth })).text(), /Update listings on Etsy/);
  await createListings();
  for (let i = 0; i < 120 && etsyCalls.filter((c) => c.method === 'PATCH').length < patchesBefore + N; i++) await wait(250);
  const patches = etsyCalls.filter((c) => c.method === 'PATCH').slice(patchesBefore);
  assert.equal(patches.length, N);
  assert.ok(patches.every((c) => c.body.shop_section_id && c.body.title && c.body.tags));
  assert.equal(etsyCalls.filter((c) => c.p === '/shops/42/listings' && c.method === 'POST').length, N);
  assert.equal(etsyCalls.filter((c) => /\/images$/.test(c.p) && c.method === 'POST').length, imagesBefore);
  // The update also re-sends option prices, so the bundle's new Package choices reach old drafts.
  assert.equal(etsyCalls.filter((c) => c.p === `/listings/${bundleId}/inventory`).length, bundleInvBefore + 1);
  // A draft made with an older photo list gets the new photo in place: every rank from it on is
  // re-uploaded with overwrite, so the listing never goes past Etsy's 20 photos.
  const store = require('../src/bot/store');
  const oldPhotos = ['bundle-main.jpg', 'party-main.jpg', 'hunt-space.jpg', 'kit-unicorn.jpg', 'kit-dino.jpg', 'kit-mermaid.jpg', 'kit-hero.jpg', 'kit-construction.jpg', 'kit-pirate.jpg', 'kit-royal.jpg'];
  store.update((st) => (st.listings.bundle.steps = [...st.listings.bundle.steps.filter((x) => !x.startsWith('photo:')), ...oldPhotos.map((x) => `photo:${x}`)]));
  const callsBefore = etsyCalls.length;
  await createListings();
  for (let i = 0; i < 120 && etsyCalls.filter((c) => c.method === 'PATCH').length < patchesBefore + 2 * N; i++) await wait(250);
  const redo = etsyCalls.slice(callsBefore).filter((c) => c.method === 'POST' && c.p === `/shops/42/listings/${bundleId}/images`);
  assert.equal(redo.length, 9);
  assert.equal(redo[0].body.image.name, 'bundle-host.jpg');
  assert.equal(String(redo[0].body.rank), '2');
  assert.ok(redo.every((c) => String(c.body.overwrite) === 'true'));
  assert.ok(!store.get().listings.bundle.steps.includes('photo:kit-royal.jpg'));
  // A photo regenerated under the same name (new art) is re-sent at its rank on the next update.
  const lastPhoto = store.get().listings.bundle.steps.filter((x) => x.startsWith('photo:')).pop().slice(6);
  store.update((st) => (st.listings.bundle.photoHashes[lastPhoto] = 'stale'));
  const callsBefore2 = etsyCalls.length;
  await createListings();
  for (let i = 0; i < 120 && etsyCalls.filter((c) => c.method === 'PATCH').length < patchesBefore + 3 * N; i++) await wait(250);
  const redo2 = etsyCalls.slice(callsBefore2).filter((c) => c.method === 'POST' && /\/images$/.test(c.p));
  assert.equal(redo2.length, 1);
  assert.equal(redo2[0].body.image.name, lastPhoto);
  assert.equal(String(redo2[0].body.rank), '10');
  // A title changed on Etsy (say, by Etsy's title review) survives the next update.
  const pirateId = String(listed['kit-pirate'].id);
  etsyTitles[pirateId] = 'Pirate Pretend Play Printable, Ages 3-8 (Digital Download)';
  const callsBefore3 = etsyCalls.length;
  await createListings();
  for (let i = 0; i < 120 && etsyCalls.filter((c) => c.method === 'PATCH').length < patchesBefore + 4 * N; i++) await wait(250);
  const piratePatch = etsyCalls.slice(callsBefore3).find((c) => c.method === 'PATCH' && c.p === `/shops/42/listings/${pirateId}`);
  assert.equal(piratePatch.body.title, 'Pirate Pretend Play Printable, Ages 3-8 (Digital Download)');
  assert.ok(store.get().listings['kit-pirate'].titleKept);
  const dinoPatch = etsyCalls.slice(callsBefore3).find((c) => c.method === 'PATCH' && c.p === `/shops/42/listings/${listed['kit-dino'].id}`);
  assert.match(dinoPatch.body.title, /Dino/);
  assert.ok(!store.get().listings['kit-dino'].titleKept);
  // Per-theme listings: their own copy, three photos plus a page close-up for each pair of pages, and orders that know their kit or theme.
  const pirateKit = creates.find((c) => /Pirate Ship Pretend Play/.test(c.body.title)).body;
  assert.match(pirateKit.description, /^Ahoy, Captain!.*Pirate Ship".*Treasure Map, Wanted Posters/s);
  assert.doesNotMatch(pirateKit.description, /\{\w+\}/);
  assert.equal(etsyCalls.filter((c) => c.method === 'POST' && c.p === `/shops/42/listings/${listed['kit-pirate'].id}/images`).length, require('../src/bot/listings').CATALOG.find((c) => c.key === 'kit-pirate').photos.length);
  assert.ok(require('../src/bot/listings').CATALOG.find((c) => c.key === 'kit-pirate').photos.length > 10);
  const { customRequest } = require('../src/bot/orders');
  const name = [{ formatted_name: 'Personalization', formatted_value: 'Maya, Teddy (bear)', question_id: 1 }];
  assert.deepEqual(customRequest({ listing_id: listed['kit-pirate'].id, title: 'x', variations: name }), { personalization: 'Maya, Teddy (bear)', options: {}, product: 'kit', kit: 'pirate' });
  const partyReq = customRequest({ listing_id: listed['party-vet'].id, title: 'x', variations: name });
  assert.equal(partyReq.product, 'party');
  assert.equal(partyReq.options.Theme, 'Pet Vet');
  assert.equal(customRequest({ listing_id: listed['pack-dino'].id, title: 'x', variations: [] }), null);
  assert.deepEqual(customRequest({ listing_id: listed['craft-christmas'].id, title: 'x', variations: name }), { personalization: 'Maya, Teddy (bear)', options: {}, product: 'craft', holiday: 'christmas' });
  assert.deepEqual(customRequest({ listing_id: listed['craft-memory'].id, title: 'x', variations: name }), { personalization: 'Maya, Teddy (bear)', options: {}, product: 'craft', holiday: 'memory' });
  assert.match(creates.find((c) => /Memory Handprint Book/.test(c.body.title)).body.description, /12 month pages/);
  assert.equal(customRequest({ listing_id: listed['craft-zoo'].id, title: 'x', variations: name }).holiday, 'zoo');
  assert.equal(customRequest({ listing_id: listed['craft-fingerprint'].id, title: 'x', variations: name }).holiday, 'fingerprint');
  assert.match(creates.find((c) => /Handprint Zoo Book/.test(c.body.title)).body.description, /12 animal pages/);
  assert.match(creates.find((c) => /Fingerprint Art Book/.test(c.body.title)).body.description, /12 fingerprint pages/);
  const craftListing = creates.find((c) => /Halloween Handprint Art/.test(c.body.title)).body;
  assert.match(craftListing.description, /Handprint Ghosts, Itsy Bitsy Spider/);
  assert.doesNotMatch(craftListing.description, /\{\w+\}/);
  // If the bot's records are lost (a redeploy without a volume), the next click finds the drafts it
  // made by title instead of making them again, and only adds the photos they're missing.
  shopDrafts.push(...etsyCalls.filter((c) => c.p === '/shops/42/listings' && c.method === 'POST').map((c, i) => ({ listing_id: 7001 + i, title: c.body.title })));
  require('../src/bot/store').update((st) => delete st.listings);
  assert.match(await (await realFetch(base + '/admin', { headers: auth })).text(), /Create drafts on Etsy/);
  const postsBefore = etsyCalls.filter((c) => c.method === 'POST').length;
  await createListings();
  listed = await listingsDone();
  assert.ok(Object.values(listed).every((x) => x.ready && x.adopted));
  assert.equal(listed['pack-dino'].id, shopDrafts[0].listing_id);
  assert.equal(etsyCalls.filter((c) => c.p === '/shops/42/listings' && c.method === 'POST').length, N);
  const adoptPosts = etsyCalls.filter((c) => c.method === 'POST').slice(postsBefore);
  assert.equal(adoptPosts.filter((c) => c.p === `/shops/42/listings/${listed['pack-dino'].id}/images`).length, 4);
  assert.ok(!adoptPosts.some((c) => /\/files$/.test(c.p)));
  assert.ok(files.every((f) => f.body.file.size > 10000 && f.body.file.type === 'application/pdf'));
  assert.ok(!etsyCalls.some((c) => c.p.includes(`/listings/${listed['pack-dino'].id}/personalization`)));

  // Shop kits (pizza, grocery...) have no matching hunt: their listing and Field Kit stand on their own.
  const shopCopy = require('../src/bot/listings').readCopy().find((l) => l.key === 'kit-pizza');
  assert.match(shopCopy.description, /Pizza Order forms and Pizza Club Cards/);
  assert.match(shopCopy.description, /Any of our personalized scavenger hunts/);
  assert.doesNotMatch(shopCopy.description, /\{\w+\}/);
  const { hostPage } = require('../src/host/host');
  for (const id of ['pizza', 'burger', 'grocery', 'post', 'library', 'police', 'petshop', 'coffee', 'italian', 'auto', 'dentist']) {
    const html = hostPage({ config: { kit: id, childName: 'Ava' } }, { stateUrl: '/x', items: ['kit'] });
    assert.match(html, new RegExp(`Ava’s ${require('../src/kits/engine').KITS[id].name} play kit`));
    assert.match(html, /Surprise me/);
    assert.doesNotMatch(html.replace(/<script>[\s\S]*?<\/script>/g, ''), /\{name\}|undefined/);
  }

  // The activity pack: every kit, both age versions, no gaps; the play kit no longer has those pages.
  const { activityPackHtml, buildKitHtml: kitHtml, KITS: allKits } = require('../src/kits/engine');
  for (const id of Object.keys(allKits)) {
    for (const age of [3, 6]) {
      const html = activityPackHtml({ kit: id, childName: 'Ava', age, lenient: true });
      assert.equal((html.match(/<section class="page/g) || []).length, age === 3 ? 20 : 19, `${id} activity pages`);
      // The move game: two sheets of 9 cards (6 specials) and a board with 4 stand-up pieces, for both ages.
      assert.equal((html.match(/class="mv-card[ "]/g) || []).length, 18, `${id} move cards`);
      assert.equal((html.match(/class="mv-card sp"/g) || []).length, 6, `${id} move specials`);
      assert.equal((html.match(/class="mv-piece"/g) || []).length, 4, `${id} move pieces`);
      assert.match(html, /Ava’s Move/, `${id} move game names the kid`);
      // The newer pages: little kids get dot, path, shapes and glue pages; big kids a secret code and a roll-and-draw.
      for (const cls of age === 3 ? ['wp-dots', 'wp-path', 'wp-shapes', 'wp-glue'] : ['wp-code', 'wp-roll']) assert.match(html, new RegExp(`class="page wp ${cls}`), `${id} ${cls}`);
      for (const cls of ['wp-color', 'wp-me', 'wp-story']) assert.match(html, new RegExp(`class="page wp ${cls}`), `${id} ${cls}`);
      assert.match(html, new RegExp(`class="wp-cb-key">(<div>.*?</div>){2,}</div>`), `${id} color by number has colors`);
      if (age === 6) assert.doesNotMatch(html, /class="wp-k-num"/, `${id} secret code has enough pictures`);
      assert.doesNotMatch(html.replace(/<style>[\s\S]*?<\/style>|data:[^"')]+/g, ''), /undefined|NaN|\{\w+\}/, id);
      if (age === 6) assert.ok((html.match(/class="wp-w-list"><div>|<\/b><\/div><div>/g) || []).length >= 4, `${id} word search has words`);
    }
    assert.doesNotMatch(kitHtml({ kit: id, childName: "Ava", lenient: true }), /class="page wp |class="wp-badge"/, `${id} kit has no activity pages`);
  }
  const prices = require('../src/bot/products');
  assert.deepEqual(['activity', 'hunt+kit+activity', 'bundle+activity', 'kit+party+activity'].map(prices.priceFor), [499, 1799, 1999, 1599]);
  assert.equal(prices.productFor(['hunt', 'kit', 'activity', 'party']), 'bundle+activity');
  // The site's cart prices must match the bot's.
  const docs = (...f) => fs.readFileSync(path.join(__dirname, '..', 'docs', ...f), 'utf8');
  assert.match(docs('js', 'data.js'), /activity: 4\.99, activityAdd: 3 \}/);
  // The order page (make/) starts with everything ticked.
  assert.match(docs('js', 'make.js'), /const picked = new Set\(\['hunt', 'kit', 'activity', 'party'\]\)/);
  assert.match(docs('make', 'index.html'), /id="childAge" min="2" max="12" placeholder="Optional">/);
  // Old order links (/?theme=dino#order, pins, the bot's emails) still reach the order page.
  assert.match(docs('index.html'), /location\.hash === '#order'[^\n]*location\.replace\('make\/' \+ location\.search\)/);
  // Each storefront page loads the shared code, and no page repeats an id.
  for (const f of [['index.html'], ['make', 'index.html'], ['play-kits', 'index.html'], ['handprint-art', 'index.html']]) {
    const html = docs(...f);
    for (const s of ['css/site.css', 'js/names.js', 'js/data.js', 'js/site.js']) assert.ok(html.includes(s), `${f.join('/')} loads ${s}`);
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(ids.filter((id, i) => ids.indexOf(id) !== i), [], `${f.join('/')} repeats an id`);
    if (f.length > 1) assert.match(html, /<base href="\.\.\/">/, `${f.join('/')} links from the site root`);
  }

  // The homepage banner has a scene (big and small) for every theme and shop kit.
  const shopIds = Object.values(KITS).filter((k) => !k.hunt).map((k) => k.id);
  for (const id of [...Object.keys(require('../src/generator/themes')), ...shopIds]) for (const f of [id, `${id}-sm`]) assert.ok(fs.existsSync(path.join(__dirname, '..', 'docs', 'img', 'hero', `${f}.webp`)), `hero ${f}`);
  // Shop kits open in the order builder, so they need its pictures too.
  for (const id of shopIds) {
    for (const f of [`themes/${id}`, `pages/${id}-kit`, `pages/${id}-activity`]) assert.ok(fs.existsSync(path.join(__dirname, '..', 'docs', 'img', `${f}.webp`)), f);
    for (const k of ['kit', 'activity']) for (let i = 1; i <= 5; i++) assert.ok(fs.existsSync(path.join(__dirname, '..', 'docs', 'img', 'gallery', id, `${k}-${i}.webp`)), `gallery ${id} ${k}-${i}`);
  }
  // ...and the little kids version of every kit and activity pack.
  for (const id of [...Object.keys(require('../src/generator/themes')), ...shopIds]) {
    for (const f of [`pages/${id}-little-kit`, `pages/${id}-little-activity`]) assert.ok(fs.existsSync(path.join(__dirname, '..', 'docs', 'img', `${f}.webp`)), f);
    for (const k of ['kit', 'activity']) for (let i = 1; i <= 5; i++) assert.ok(fs.existsSync(path.join(__dirname, '..', 'docs', 'img', 'gallery', id, 'little', `${k}-${i}.webp`)), `little ${id} ${k}-${i}`);
  }
  // Age versions are little kids 3 to 5 and big kids 6 to 8; orders saved before the change still read.
  {
    const products = require('../src/bot/products');
    assert.deepEqual(['Little kids, ages 3 to 5', 'Big kids, ages 6 to 8', 'Little kids, ages 2 to 4', 'Big kids, ages 5 to 8', 'Other'].map(products.versionOf), ['little', 'big', 'little', 'big', undefined]);
  }
  // Stripe checkout shows a picture beside the product, linked from the website (scripts/checkout-images.py).
  {
    const pay = require('../src/bot/payments');
    const site = process.env.SITE_URL;
    process.env.SITE_URL = 'https://littleprintquests.com';
    for (const id of Object.keys(require('../src/generator/themes'))) assert.deepEqual(pay.checkoutImages(pay.imageFor({ theme: id })), [`https://littleprintquests.com/img/checkout/${id}.jpg`], `checkout picture ${id}`);
    for (const h of Object.keys(require('../src/crafts/build').HOLIDAYS)) assert.ok(pay.checkoutImages(pay.imageFor({ holiday: h })), `checkout picture craft ${h}`);
    assert.ok(pay.checkoutImages('pass'));
    process.env.SITE_URL = 'http://localhost:3000/';
    assert.equal(pay.checkoutImages('dino'), undefined, 'Stripe needs https pictures');
    if (site === undefined) delete process.env.SITE_URL; else process.env.SITE_URL = site;
  }
  // Every name-swap entry has its nameless twin, and no twin is left over without an entry (a leftover
  // twin of a page that lost its name showed the wrong page in the previews).
  {
    const N = path.join(__dirname, '..', 'docs', 'img', 'n');
    const keys = new Set(fs.readdirSync(N).filter((f) => f.endsWith('.json')).flatMap((f) => Object.keys(JSON.parse(fs.readFileSync(path.join(N, f), 'utf8')))));
    for (const k of keys) assert.ok(fs.existsSync(path.join(N, k.slice(4))), `twin for ${k}`);
    // and no name spot without a size (text that was hidden when the picture was taken)
    for (const f of fs.readdirSync(N).filter((x) => x.endsWith('.json'))) {
      for (const [k, v] of Object.entries(JSON.parse(fs.readFileSync(path.join(N, f), 'utf8')))) {
        for (const page of [v, ...(v.layers || []).map((l) => l.p)]) for (const s of page.s || []) assert.ok(s.w > 0 && s.h > 0, `empty name spot in ${k}`);
      }
    }
    const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
    for (const f of walk(path.join(N, 'gallery'))) assert.ok(keys.has(`img/${path.relative(N, f).split(path.sep).join('/')}`), `leftover twin ${f}`);
  }
  // The theme pickers show one illustration per theme (scripts/theme-icons.py).
  for (const id of Object.keys(require('../src/generator/themes'))) assert.ok(fs.existsSync(path.join(__dirname, '..', 'docs', 'img', 'icons', `${id}.webp`)), `theme icon ${id}`);
  // The order preview gallery has five pages per item for every theme.
  for (const id of Object.keys(require('../src/generator/themes'))) {
    for (const k of ['hunt', 'party', 'kit', 'activity']) for (let i = 1; i <= 5; i++) assert.ok(fs.existsSync(path.join(__dirname, '..', 'docs', 'img', 'gallery', id, `${k}-${i}.webp`)), `gallery ${id} ${k}-${i}`);
  }

  // Every Pinterest pin has its picture and a link into the site; holiday pins wait for their season.
  const pins = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'docs', 'pins', 'pool.json'), 'utf8'));
  for (const p of pins) {
    assert.ok(fs.existsSync(path.join(__dirname, '..', 'docs', 'pins', 'img', `${p.id}.jpg`)), `pin image ${p.id}`);
    assert.match(p.link, /^https:\/\/littleprintquests\.com\/.*utm_source=pinterest/);
  }
  const ideas = pins.filter((p) => p.id.startsWith('ideas-')).map((p) => new URL(p.link).pathname);
  for (const u of ideas) assert.ok(fs.existsSync(path.join(__dirname, '..', 'docs', u, 'index.html')), `idea page ${u}`);
  const { inSeason } = require('../scripts/pin-feed');
  assert.deepEqual([inSeason(new Date('2026-10-22')), inSeason(new Date('2026-12-01')), inSeason(new Date('2026-07-01'))], [['halloween'], ['christmas'], []]);

  console.log('All smoke checks passed');
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
