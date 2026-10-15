// Smoke test: fake Etsy, Claude, Stripe and Resend; real PDF rendering and dashboard.
// Run: node test/smoke.js
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bot-'));
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

  // Party Pack: builds for every theme, fills party details or leaves write-in lines, renders a real PDF.
  const { buildPartyHtml } = require('../src/party/build');
  const { renderParty } = require('../src/party/render-party');
  for (const theme of Object.keys(require('../src/generator/themes'))) {
    const party = buildPartyHtml({ theme, childName: 'Maximilian', age: 6, party: { date: 'June 3', place: 'The Park' } });
    assert.match(party, /Maximilian’s/);
    assert.match(party, /6th Birthday!/);
    assert.ok(party.includes('June 3') && party.includes('The Park'));
    assert.equal((party.match(/class="item flag"/g) || []).length, 5 + 1 + 8 + 1 + 10);
    assert.ok(buildPartyHtml({ theme, childName: 'Bo' }).includes('Birthday Party!'));
  }
  assert.throws(() => buildPartyHtml({ theme: 'dino' }), /childName is required/);
  const partyPdf = path.join(dataDir, 'party.pdf');
  await renderParty({ theme: 'space', childName: 'Bo', age: 3 }, partyPdf);
  assert.ok(fs.statSync(partyPdf).size > 50000);

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
  // Host Mode: every order gets a private host link in the Etsy message; only hunts get a sidekick.
  assert.ok(o.message.includes(`https://bot.example.com/h/${o.hostToken}`) && o.sidekickToken);
  assert.ok(kitOrder.message.includes(`/h/${kitOrder.hostToken}`) && !kitOrder.sidekickToken);
  assert.match(kitOrder.message, /^Open Host Mode on your phone\. It has pretend-play scenarios/m);
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
  // Older forms send a product name; newer ones send any mix of items.
  const webOrders = [
    { product: 'bundle', spots: ['front_door', 'pet_bed', 'kitchen_table'], has: ['hunt', 'kit', 'party'] },
    { spots: ['front_door', { custom: 'Grandma’s piano' }, 'kitchen_table'], has: ['hunt'] },
    { product: 'party', spots: [], has: ['party'] },
    { items: ['hunt', 'kit'], spots: ['front_door', 'pet_bed', 'kitchen_table'], has: ['hunt', 'kit'] },
    { items: ['party', 'kit'], spots: [], has: ['kit', 'party'] },
  ];
  for (const { product, items, spots, has } of webOrders) {
    const co = await realFetch(base + '/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product, items, theme: 'dino', childName: 'Ava', age: 5, spots, pets: [{ name: 'Rex', kind: 'trex' }], party: { date: 'Saturday, June 3', place: '' } }) });
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
    assert.equal(w.config.theme, 'dino');
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
    if (has.includes('party')) assert.deepEqual(w.party || w.config.party, { date: 'Saturday, June 3' });
    if (main === 'kit') assert.match(mail.subject, /Dino Dig Lab play kit for Ava/);
    if (product === 'party') {
      assert.match(mail.subject, /Dinosaur party pack for Ava/);
      assert.equal((await realFetch(`${base}/d/${w.downloadToken}.pdf`)).headers.get('content-disposition'), 'inline; filename="scavenger-hunt.pdf"');
    }
    if (product === 'bundle') assert.equal((await realFetch(`${base}/d/${w.downloadToken}-party.pdf`)).headers.get('content-disposition'), 'inline; filename="party-printables.pdf"');
    assert.match(await (await realFetch(`${base}/order/${orderId}`)).text(), { hunt: /hunt is ready/, kit: /play kit is ready/, party: /party pack is ready/ }[main]);
    assert.ok(w.hostToken && mail.html.includes(`/h/${w.hostToken}`));
    assert.equal(Boolean(w.sidekickToken), has.includes('hunt'));
    // Host Mode has a tab for each thing bought; the others are greyed out.
    const tabsHtml = await (await realFetch(`${base}/h/${w.hostToken}`)).text();
    for (const [item, label] of [['hunt', 'Hunt'], ['kit', 'Play Kit'], ['party', 'Party']]) {
      const greyed = new RegExp(`class="off"[^>]*><span>[^<]+</span>${label}<small>Not in this order`).test(tabsHtml);
      assert.equal(greyed, !has.includes(item), `${product}: ${label} tab`);
    }
    if (has.includes('kit')) assert.match(tabsHtml, /Pretend-play scenarios[\s\S]*Surprise me[\s\S]*Ava can say/);
    if (has.includes('party')) assert.match(tabsHtml, /Ava’s party plan[\s\S]*Hand out or mail the invitations/);
    assert.ok(!/\{\w+\}/.test(tabsHtml.replace(/<script>[\s\S]*<\/script>/, '')), 'no unfilled placeholders');
    assert.ok(!/etsy\.com|github\.io|\$\d/i.test(tabsHtml), 'Host Mode must not link to the shop or show prices');
    if (main === 'hunt') {
      // Host Mode and the sidekick page share progress, and stay free of shop links and prices (Etsy buyers get them too).
      const hostHtml = await (await realFetch(`${base}/h/${w.hostToken}`)).text();
      assert.match(hostHtml, /Hide Card 2/);
      assert.match(hostHtml, /Read Clue #1 aloud/);
      assert.ok(!/etsy\.com|github\.io|\$\d/i.test(hostHtml), 'Host Mode must not link to the shop or show prices');
      assert.equal((await realFetch(`${base}/h/${w.hostToken}/state`, { method: 'POST', body: JSON.stringify({ step: 5 }) })).status, 204);
      assert.deepEqual(await (await realFetch(`${base}/s/${w.sidekickToken}/state`)).json(), { step: 5 });
      assert.match(await (await realFetch(`${base}/s/${w.sidekickToken}`)).text(), /Your jobs today/);
      assert.equal((await realFetch(`${base}/s/${w.sidekickToken}/state`, { method: 'POST', body: '{"step":1}' })).status, 200); // sidekick can't move the host
      assert.equal((await realFetch(`${base}/h/${'x'.repeat(24)}`)).status, 404);
      assert.match(await (await realFetch(`${base}/order/${orderId}`)).text(), /Open Host Mode/);
    }
    // Stripe retries the same event: no second email.
    await realFetch(base + '/webhooks/stripe', { method: 'POST', body: payload, headers: { 'stripe-signature': sig } });
  }
  await wait(500);
  assert.equal(emails.length, 5);
  assert.deepEqual(charged, [1699, 999, 699, 1499, 1299]);
  assert.equal((await realFetch(base + '/order/manual-1')).status, 401); // only web orders are public
  assert.match(await (await realFetch(base + '/admin', { headers: auth })).text(), /Emailed to ava\.parent@example\.com/);

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
    assert.ok(c.photos.length <= 10, `${c.key} has more than 10 photos`);
    for (const f of c.photos) assert.ok(fs.existsSync(path.join(__dirname, '..', 'listing-assets', f)), `missing listing-assets/${f}`);
  }
  assert.equal(N, 55); // 16 packs, the bundle, both dropdown listings, a party pack per theme and a listing per kit (16 theme kits + 4 shop kits)
  const listingsDone = async () => {
    for (let i = 0; i < 240; i++) {
      await wait(500);
      const l = JSON.parse(fs.readFileSync(path.join(dataDir, 'state.json'), 'utf8')).listings || {};
      if (Object.keys(l).length === N && Object.values(l).every((x) => x.ready || (x.error && !x.working))) return l;
    }
    throw new Error('listings never finished');
  };
  assert.match(await (await realFetch(base + '/admin', { headers: auth })).text(), /Create drafts on Etsy/);
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
  // Four shop sections, each made once and reused.
  assert.deepEqual(shopSections.map((s) => s.title), ['Scavenger Hunt Packs', 'Custom Party Bundles', 'Pretend Play Kits', 'Party Printables']);
  assert.deepEqual([...new Set(creates.map((c) => c.body.shop_section_id))], ['300', '301', '302', '303']);
  assert.equal(pack.type, 'download');
  assert.equal(pack.price, '8.00');
  assert.equal(pack.taxonomy_id, '1250');
  assert.equal(pack.tags.split(',').length, 13);
  assert.match(pack.description, /^Roar!.*WHAT'S INCLUDED/s);
  const bundleId = listed.bundle.id;
  const inv = etsyCalls.find((c) => c.p === `/listings/${bundleId}/inventory`).body;
  assert.deepEqual(inv.products.map((x) => [x.property_values[0].values[0], x.offerings[0].price]), [['Hunt + Play Kit + Party Pack', 16.99], ['Hunt + Play Kit', 14.99], ['Hunt + Party Pack', 13.99], ['Hunt only', 9.99]]);
  const kitInv = etsyCalls.find((c) => c.p === `/listings/${listed.kits.id}/inventory`).body;
  assert.equal(kitInv.products.length, 20);
  const partyInv = etsyCalls.find((c) => c.p === `/listings/${listed.party.id}/inventory`).body;
  assert.deepEqual(partyInv.products.map((x) => x.property_values[0].values[0]).slice(0, 2), ['Dinosaur', 'Superhero']);
  const q = etsyCalls.find((c) => c.p === `/shops/42/listings/${bundleId}/personalization`).body.personalization_questions[0];
  assert.ok(q.required && q.question_text.length <= 45 && /pets or toys/.test(q.instructions));
  assert.equal(etsyCalls.filter((c) => c.p === `/shops/42/listings/${listed.kits.id}/images`).length, 11); // 10 photos + 1 failed try
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
  // re-uploaded with overwrite, so the listing never goes past Etsy's 10 photos.
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
  // Per-theme listings: their own copy, three photos, and orders that know their kit or theme.
  const pirateKit = creates.find((c) => /Pirate Ship Pretend Play/.test(c.body.title)).body;
  assert.match(pirateKit.description, /^Ahoy, Captain!.*Pirate Ship".*Treasure Map, Wanted Posters/s);
  assert.doesNotMatch(pirateKit.description, /\{\w+\}/);
  assert.equal(etsyCalls.filter((c) => c.method === 'POST' && c.p === `/shops/42/listings/${listed['kit-pirate'].id}/images`).length, 3);
  const { customRequest } = require('../src/bot/orders');
  const name = [{ formatted_name: 'Personalization', formatted_value: 'Maya, Teddy (bear)', question_id: 1 }];
  assert.deepEqual(customRequest({ listing_id: listed['kit-pirate'].id, title: 'x', variations: name }), { personalization: 'Maya, Teddy (bear)', options: {}, product: 'kit', kit: 'pirate' });
  const partyReq = customRequest({ listing_id: listed['party-vet'].id, title: 'x', variations: name });
  assert.equal(partyReq.product, 'party');
  assert.equal(partyReq.options.Theme, 'Pet Vet');
  assert.equal(customRequest({ listing_id: listed['pack-dino'].id, title: 'x', variations: [] }), null);
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

  // Shop kits (pizza, grocery...) have no matching hunt: their listing and Host Mode stand on their own.
  const shopCopy = require('../src/bot/listings').readCopy().find((l) => l.key === 'kit-pizza');
  assert.match(shopCopy.description, /Pizza Order forms and Pizza Club Cards/);
  assert.match(shopCopy.description, /Any of our personalized scavenger hunts/);
  assert.doesNotMatch(shopCopy.description, /\{\w+\}/);
  const { hostPage } = require('../src/host/host');
  for (const id of ['pizza', 'burger', 'grocery', 'post']) {
    const html = hostPage({ config: { kit: id, childName: 'Ava' } }, { stateUrl: '/x', items: ['kit'] });
    assert.match(html, new RegExp(`Ava’s ${require('../src/kits/engine').KITS[id].name} play kit`));
    assert.match(html, /Surprise me/);
    assert.doesNotMatch(html.replace(/<script>[\s\S]*?<\/script>/g, ''), /\{name\}|undefined/);
  }

  console.log('All smoke checks passed');
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
