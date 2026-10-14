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
  etsy: { access_token: '1.a', refresh_token: '1.r', expires_at: Date.now() + 3600e3, user_id: 1, shop_id: 42, scopes: 'transactions_r listings_r listings_w shops_r' }, orders: {},
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
const etsyListingApi = async (u, opts) => {
  const p = new URL(u).pathname.replace('/v3/application', '');
  const body = opts.body instanceof FormData ? Object.fromEntries(opts.body) : opts.body instanceof URLSearchParams ? Object.fromEntries(opts.body) : opts.body && JSON.parse(opts.body);
  etsyCalls.push({ method: opts.method, p, body });
  const json = (o, status = 200) => new Response(JSON.stringify(o), { status });
  if (p === '/seller-taxonomy/nodes') return json({ results: [{ id: 1, name: 'Paper & Party Supplies', children: [{ id: 2, name: 'Party Supplies', children: [{ id: 1250, name: 'Party Games', children: [] }] }] }] });
  if (p === '/shops/42/listings') return json({ listing_id: 7000 + etsyCalls.filter((c) => c.p === p).length });
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
          { property_id: 514, formatted_name: 'Package', formatted_value: 'Hunt + Play Kit', question_id: 0 },
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
  assert.ok(o.kitReady);
  assert.match(o.message, /Mission Control play kit:\s+https:\/\/bot\.example\.com\/d\/[\w-]+-kit\.pdf/);
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

  // Website order: checkout -> signed Stripe webhook -> PDF -> email.
  const bad = await realFetch(base + '/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ theme: 'dino', childName: 'Ava', spots: ['front_door'] }) });
  assert.equal(bad.status, 400);
  assert.match((await bad.json()).error, /between 3 and 12/);
  const pre = await realFetch(base + '/api/checkout', { method: 'OPTIONS' });
  assert.equal(pre.headers.get('access-control-allow-origin'), '*');
  for (const [product, spots] of [['bundle', ['front_door', 'pet_bed', 'kitchen_table']], [undefined, ['front_door', { custom: 'Grandma’s piano' }, 'kitchen_table']]]) {
    const co = await realFetch(base + '/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product, theme: 'dino', childName: 'Ava', age: 5, spots, pets: [{ name: 'Rex', kind: 'trex' }] }) });
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
    assert.equal(mail.html.includes(`/d/${w.downloadToken}-kit.pdf`), product === 'bundle');
    assert.equal(Boolean(w.kitReady), product === 'bundle');
    assert.match(await (await realFetch(`${base}/order/${orderId}`)).text(), /hunt is ready/);
    // Stripe retries the same event: no second email.
    await realFetch(base + '/webhooks/stripe', { method: 'POST', body: payload, headers: { 'stripe-signature': sig } });
  }
  await wait(500);
  assert.equal(emails.length, 2);
  assert.deepEqual(charged, [1699, 999]);
  assert.equal((await realFetch(base + '/order/manual-1')).status, 401); // only web orders are public
  assert.match(await (await realFetch(base + '/admin', { headers: auth })).text(), /Emailed to ava\.parent@example\.com/);

  // Etsy listings: drafts with photos, files and variation prices; a failed step resumes on the next click.
  const createListings = () => realFetch(base + '/admin/etsy/listings', { method: 'POST', headers: auth, redirect: 'manual' });
  const listingsDone = async () => {
    for (let i = 0; i < 240; i++) {
      await wait(500);
      const l = JSON.parse(fs.readFileSync(path.join(dataDir, 'state.json'), 'utf8')).listings || {};
      if (Object.keys(l).length === 7 && Object.values(l).every((x) => x.ready || (x.error && !x.working))) return l;
    }
    throw new Error('listings never finished');
  };
  assert.match(await (await realFetch(base + '/admin', { headers: auth })).text(), /Create drafts on Etsy/);
  await createListings();
  let listed = await listingsDone();
  assert.match(listed.kits.error, /Temporary upload problem/);
  assert.equal(Object.values(listed).filter((x) => x.ready).length, 6);
  await createListings();
  listed = await listingsDone();
  assert.ok(Object.values(listed).every((x) => x.ready));
  const creates = etsyCalls.filter((c) => c.p === '/shops/42/listings');
  assert.equal(creates.length, 7, 'resuming must not create a second kits listing');
  const pack = creates[0].body;
  assert.equal(pack.type, 'download');
  assert.equal(pack.price, '8.00');
  assert.equal(pack.taxonomy_id, '1250');
  assert.equal(pack.tags.split(',').length, 13);
  assert.match(pack.description, /^Roar!.*WHAT'S INCLUDED/s);
  const bundleId = listed.bundle.id;
  const inv = etsyCalls.find((c) => c.p === `/listings/${bundleId}/inventory`).body;
  assert.deepEqual(inv.products.map((x) => [x.property_values[0].values[0], x.offerings[0].price]), [['Hunt + Play Kit', 16.99], ['Hunt only', 9.99]]);
  const kitInv = etsyCalls.find((c) => c.p === `/listings/${listed.kits.id}/inventory`).body;
  assert.equal(kitInv.products.length, 6);
  const q = etsyCalls.find((c) => c.p === `/shops/42/listings/${bundleId}/personalization`).body.personalization_questions[0];
  assert.ok(q.required && q.question_text.length <= 45 && /pets or toys/.test(q.instructions));
  assert.equal(etsyCalls.filter((c) => c.p === `/shops/42/listings/${listed.kits.id}/images`).length, 8); // 7 photos + 1 failed try
  const files = etsyCalls.filter((c) => /\/files$/.test(c.p));
  assert.equal(files.length, 7);
  assert.ok(files.every((f) => f.body.file.size > 10000 && f.body.file.type === 'application/pdf'));
  assert.ok(!etsyCalls.some((c) => c.p.includes(`/listings/${listed['pack-dino'].id}/personalization`)));

  console.log('All smoke checks passed');
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
