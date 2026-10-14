// Smoke test: fake Etsy + fake Claude, real PDF rendering and dashboard.
// Run: node test/smoke.js
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bot-'));
Object.assign(process.env, {
  DATA_DIR: dataDir, PORT: '3917', PUBLIC_URL: 'https://bot.example.com', ADMIN_PASSWORD: 'pw',
  ANTHROPIC_API_KEY: 'test', ETSY_KEYSTRING: 'key', ETSY_SHARED_SECRET: 'secret', POLL_MINUTES: '60',
});
fs.writeFileSync(path.join(dataDir, 'state.json'), JSON.stringify({
  etsy: { access_token: '1.a', refresh_token: '1.r', expires_at: Date.now() + 3600e3, user_id: 1, shop_id: 42 }, orders: {},
}));

// Fake Claude: return a structured answer for whatever order text arrives.
const parse = require('../src/bot/parse');
const realToConfig = parse.toHuntConfig;
parse.parseOrder = async ({ personalization }) => realToConfig({
  ok: true, problem: null, childName: personalization.startsWith('Leo') ? 'Leo' : 'Maya', age: 6, theme: 'space',
  spots: [
    { libraryId: 'front_door', label: 'Front Door', tip: '', riddle: [] },
    { libraryId: null, label: 'Grandma’s Piano', tip: 'On the bench', riddle: ['Plink goes the piano, plonk goes the key,', 'Check by the bench, what will you see?'] },
    { libraryId: 'pet_bed', label: 'Pet Bed', tip: '', riddle: [] },
    { libraryId: 'kitchen_table', label: 'Kitchen Table', tip: '', riddle: [] },
  ],
});

// Fake Etsy receipts endpoint.
const realFetch = global.fetch;
const seen = [];
global.fetch = async (url, opts = {}) => {
  const u = String(url);
  if (u.startsWith('https://api.etsy.com/')) {
    seen.push({ u, headers: opts.headers });
    return new Response(JSON.stringify({ count: 2, results: [
      { receipt_id: 900, name: 'Pat Buyer', transactions: [
        { transaction_id: 1, listing_id: 555, title: 'Custom Hunt', variations: [
          { property_id: 513, formatted_name: 'Theme', formatted_value: 'Space', question_id: 0 },
          { property_id: 54, formatted_name: 'Personalization', formatted_value: 'Leo, 6, front door, piano, dog bed, table', question_id: 77 },
        ] },
      ] },
      { receipt_id: 901, name: 'Sam Standard', transactions: [{ transaction_id: 2, listing_id: 556, title: 'Dino Pack', variations: [] }] },
    ] }), { status: 200 });
  }
  return realFetch(url, opts);
};

require('../src/bot/server');
const auth = { Authorization: 'Basic ' + Buffer.from('owner:pw').toString('base64') };
const base = 'http://localhost:3917';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  for (let i = 0; i < 60; i++) {
    const s = JSON.parse(fs.readFileSync(path.join(dataDir, 'state.json'), 'utf8'));
    if (s.orders['etsy-900-1']?.status === 'ready') break;
    await wait(500);
  }
  let state = JSON.parse(fs.readFileSync(path.join(dataDir, 'state.json'), 'utf8'));
  const o = state.orders['etsy-900-1'];
  assert.equal(o.status, 'ready', JSON.stringify(o));
  assert.ok(!state.orders['etsy-901-2'], 'standard pack order should be ignored');
  assert.equal(o.options.Theme, 'Space');
  assert.match(o.message, /Hi Pat!.*Deep Space Rover Expedition for Leo/s);
  assert.equal(seen[0].headers['x-api-key'], 'key:secret');
  assert.match(seen[0].u, /shops\/42\/receipts\?was_paid=true/);

  assert.equal((await realFetch(base + '/admin')).status, 401);
  const dash = await (await realFetch(base + '/admin', { headers: auth })).text();
  assert.match(dash, /Ready to send/);
  const pdf = await realFetch(`${base}/d/${o.downloadToken}.pdf`);
  assert.equal(pdf.headers.get('content-type'), 'application/pdf');
  assert.ok((await pdf.arrayBuffer()).byteLength > 50000);

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

  // Bad config edit becomes "needs attention" instead of crashing.
  await realFetch(`${base}/admin/orders/${manual.id}/config`, { method: 'POST', headers: { ...auth, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'config=' + encodeURIComponent('{"theme":"space","childName":"Maya","spots":["nope","couch","bed"]}'), redirect: 'manual' });
  state = JSON.parse(fs.readFileSync(path.join(dataDir, 'state.json'), 'utf8'));
  assert.equal(state.orders[manual.id].status, 'needs_attention');
  assert.match(state.orders[manual.id].problem, /Unknown spot "nope"/);

  console.log('All smoke checks passed');
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
