// Order bot web server: owner dashboard, Etsy connect flow, website checkout,
// Stripe webhook, order status pages, PDF downloads, and the poller.

const fs = require('fs');
const http = require('http');
const path = require('path');
const store = require('./store');
const etsy = require('./etsy');
const orders = require('./orders');
const payments = require('./payments');
const listings = require('./listings');
const sample = require('./sample');
const health = require('./health');
const products = require('./products');
const { KITS, kitForHunt } = require('../kits/engine');
const { sendHuntEmail } = require('./email');
const THEMES = require('../generator/themes');
const { HOLIDAYS, craftLabel } = require('../crafts/build');
const host = require('../host/host');

const PORT = Number(process.env.PORT || 3000);
const POLL_MINUTES = Number(process.env.POLL_MINUTES || 5);
const REQUIRED = ['PUBLIC_URL', 'ADMIN_PASSWORD', 'ANTHROPIC_API_KEY'];
const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
let pendingAuth = null;

function authorized(req) {
  const [scheme, value] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Basic' || !value) return false;
  const pass = Buffer.from(value, 'base64').toString().split(':').slice(1).join(':');
  return pass === process.env.ADMIN_PASSWORD;
}

async function readForm(req) {
  let body = '';
  for await (const chunk of req) body += chunk;
  return Object.fromEntries(new URLSearchParams(body));
}

const send = (res, code, body, headers = {}) => {
  res.writeHead(code, { 'Content-Type': 'text/html; charset=utf-8', ...headers });
  res.end(body);
};
const redirect = (res, to) => send(res, 303, '', { Location: to });

async function readRaw(req, limit = 100_000) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error('Request too large'), { status: 413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// Sites allowed to call the API: the shop's own domain and its old GitHub Pages address, plus any
// in SITE_ORIGIN (comma-separated). The browser's Origin is echoed back when it is one of them.
const ORIGINS = ['https://littleprintquests.com', 'https://www.littleprintquests.com', 'https://jtr4in.github.io'];
const allowedOrigin = (origin) => {
  const extra = (process.env.SITE_ORIGIN || '').split(',').map((o) => o.trim().replace(/\/$/, '')).filter(Boolean);
  if (!extra.length) return '*';
  return [...ORIGINS, ...extra].includes(origin) ? origin : extra[0];
};
const cors = (req) => ({
  'Access-Control-Allow-Origin': allowedOrigin(req?.headers.origin),
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  Vary: 'Origin',
});
const kitLink = (o, label) =>
  (o.kitReady ? ` · <a href="/d/${esc(o.downloadToken)}-kit.pdf" target="_blank">${label}</a>` : '') +
  (o.activityReady ? ` · <a href="/d/${esc(o.downloadToken)}-activities.pdf" target="_blank">Activities</a>` : '') +
  (o.partyReady ? ` · <a href="/d/${esc(o.downloadToken)}-party.pdf" target="_blank">Party pack</a>` : '');
const sendJson = (res, code, obj) => send(res, code, JSON.stringify(obj), { 'Content-Type': 'application/json', ...cors(res.req) });

// "Dino Fossil Recovery", "Dino Dig Lab play kit" or "Dinosaur party pack".
function orderTitle(o) {
  const main = products.mainOf(o);
  const theme = THEMES[o.config?.theme];
  if (main === 'craft') return HOLIDAYS[o.config?.holiday]?.book ? HOLIDAYS[o.config.holiday].name : `${HOLIDAYS[o.config?.holiday]?.name || ''} handprint art`;
  if (main === 'kit' || main === 'activity') return `${(KITS[o.config?.kit] || kitForHunt(o.config.theme)).name} ${main === 'kit' ? 'play kit' : 'activity pack'}`;
  return main === 'party' ? `${theme.label} party pack` : theme.name;
}

// Public page the buyer lands on after paying. Order ids are long and random.
function orderPage(o) {
  const theme = THEMES[o.form.theme];
  const working = o.status === 'awaiting_payment' || o.status === 'processing';
  const main = products.mainOf(o);
  const party = main === 'party';
  const book = main === 'craft' && HOLIDAYS[(o.config || o.form)?.holiday];
  const what = book?.book ? book.name : products.NAMES[main];
  const body =
    o.status === 'ready'
      ? `<h1>${esc(o.config.childName)}’s ${what} is ready! 🎉</h1>
         <p><a class="btn" href="/d/${esc(o.downloadToken)}.pdf" target="_blank">Download your ${what} (PDF)</a></p>
         ${o.kitReady ? `<p><a class="btn" href="/d/${esc(o.downloadToken)}-kit.pdf" target="_blank">Download your play kit (PDF)</a></p>` : ''}
         ${o.activityReady ? `<p><a class="btn" href="/d/${esc(o.downloadToken)}-activities.pdf" target="_blank">Download your activity pack (PDF)</a></p>` : ''}
         ${o.partyReady ? `<p><a class="btn" href="/d/${esc(o.downloadToken)}-party.pdf" target="_blank">Download your party printables (PDF)</a></p>` : ''}
         ${o.hostToken ? `<p><a class="btn alt" href="/h/${esc(o.hostToken)}">Open Host Mode</a><br><small>Help on your phone for ${esc(products.has(o, 'hunt') ? 'hiding the cards and running the hunt' : products.has(o, 'kit') ? 'playing with the kit' : 'planning the party')}.</small></p>` : ''}
         <p>${o.email && o.deliveredAt ? `We also emailed the link to <b>${esc(o.email)}</b>.` : 'Save your PDF now, or bookmark this page to come back to it.'} Print at “Actual Size / 100%”${{ hunt: ', cut out the clue cards, and follow the Host Guide on page 1.', kit: ', and start with the grown-up guide on page 1.', activity: ', then slip the pages into sheet protectors for a dry-erase marker.', party: ', on cardstock if you have it.', craft: ', on white cardstock, and start with the tips on page 1.' }[main]}</p>`
      : working
        ? `<h1>Building ${esc(o.form.childName)}’s ${esc(main === 'craft' ? (book?.book ? what : `${HOLIDAYS[o.form.holiday].name} ${what}`) : main === 'hunt' ? theme.name : theme ? `${theme.label} ${what}` : `${KITS[o.form.kit]?.name || ''} ${what}`)}…</h1>
           <p>${o.status === 'awaiting_payment' ? 'Confirming your payment.' : main === 'craft' ? 'Laying out the keepsake pages.' : 'Writing clues and laying out the cards.'} This page updates by itself.</p>
           <div class="spin"></div>`
        : `<h1>Thanks for your order!</h1>
           <p>Your payment went through. We’re giving ${esc(o.form.childName)}’s ${what} a quick hand check and will email it to ${esc(o.email || 'you')} shortly.</p>`;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your ${what}</title>${working ? '<meta http-equiv="refresh" content="4">' : ''}<style>
:root{--bg:#fbf8f1;--ink:#3f4a73;--muted:#646d8f;--sun:#ef9d31;--sun-ink:#2b1d06}
@media (prefers-color-scheme:dark){:root{--bg:#151a2e;--ink:#f4f0e6;--muted:#b4bad4}}
body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.55 system-ui,sans-serif}
main{max-width:560px;margin:12vh auto;padding:0 16px;text-align:center}
h1{font-size:28px;line-height:1.2}p{color:var(--muted)}p b{color:var(--ink)}
.btn{display:inline-block;background:var(--sun);color:var(--sun-ink);padding:14px 26px;border-radius:99px;text-decoration:none;font-weight:700}.btn.alt{background:transparent;color:var(--ink);border:2px solid var(--sun)}small{color:var(--muted)}
.spin{width:36px;height:36px;margin:24px auto;border:4px solid var(--muted);border-top-color:var(--sun);border-radius:50%;animation:s 1s linear infinite}
@keyframes s{to{transform:rotate(1turn)}}
</style></head><body><main>${body}</main></body></html>`;
}

// Etsy listings the bot can create as drafts (see listings.js).
// How far the Etsy run has got: whole listings, plus the photos of the one being sent.
function progressBar(p) {
  if (!p) return '';
  const pct = Math.min(100, Math.round(((p.done + (p.photos ? p.photo / p.photos : 0)) / p.total) * 100));
  return `<div class="bar"><div style="width:${pct}%"></div></div>
  <p><b>${pct}%</b> · ${p.done} of ${p.total} listings done${p.label ? ` · now on <b>${esc(p.label)}</b>${p.photos ? ` (photo ${p.photo} of ${p.photos})` : ''}` : ''}</p>
  ${p.stopping
    ? '<p class="muted">Stopping after this step…</p>'
    : '<form method="post" action="/admin/etsy/listings/stop"><button class="secondary">Stop</button> <span class="muted">Finishes the current step, then stops. Click the button again later to pick up where it left off.</span></form>'}`;
}

function listingsPanel(s) {
  if (!etsy.isConnected()) return '';
  const st = s.listings || {};
  const working = listings.isRunning();
  const rows = listings.CATALOG.map((c) => {
    const l = st[c.key] || {};
    const state = l.ready
      ? `<a href="https://www.etsy.com/your/shops/me/listing-editor/edit/${esc(l.id)}" target="_blank">Draft ready, review and publish</a>`
      : l.working ? 'Creating…' : l.error ? `<span class="problem">${esc(l.error)}</span>` : l.id ? 'Partly created' : '<span class="muted">Not created</span>';
    return `<li><b>${esc(c.label)}</b> · ${state}${l.titleKept ? ' <span class="muted">· keeping the title from Etsy</span>' : ''}</li>`;
  }).join('');
  const allReady = listings.CATALOG.every((c) => st[c.key]?.ready);
  const someReady = listings.CATALOG.some((c) => st[c.key]?.ready);
  const action = !etsy.canWriteListings()
    ? `<p class="muted">To let the bot create listings, reconnect your shop once and allow listing access.</p><a href="/auth/etsy/start"><button class="secondary">Reconnect Etsy shop</button></a>`
    : working
    ? progressBar(listings.getProgress())
    : `${s.listingsStopped ? '<p class="muted">Stopped. Click below to pick up where it left off.</p>' : ''}<form method="post" action="/admin/etsy/listings"><button>${allReady ? 'Update listings on Etsy' : someReady ? 'Update listings and create new drafts' : 'Create drafts on Etsy'}</button></form>
       ${someReady ? `<p class="muted">Sends the latest titles, descriptions, tags, option prices, shop sections and any new photos to these listings, including ones you’ve already published.${allReady ? '' : ' Listings marked Not created are made as new drafts.'}</p>` : ''}`;
  return `<div class="panel"><b>Etsy listings</b> <span class="muted">Created as drafts with photos, files, prices and options. Nothing goes live until you publish it in Shop Manager.</span>
  <ul>${rows}</ul>${s.listingsError ? `<p class="problem">${esc(s.listingsError)}</p>` : ''}${action}
  ${working ? '<script>setTimeout(()=>location.reload(),4000)</script>' : ''}</div>`;
}

function orderCard(o) {
  const badge = { ready: 'Ready to send', needs_attention: 'Needs a look', processing: 'Working…', awaiting_payment: 'Not paid' }[o.status] || o.status;
  const theme = o.config && (THEMES[o.config.theme] || KITS[o.config.kit] || HOLIDAYS[o.config.holiday]);
  return `<article id="${esc(o.id)}" class="order ${o.sent ? 'sent' : o.status}">
    <header><span class="badge">${o.sent ? 'Sent' : esc(badge)}</span>
      <b>${esc(o.config?.childName || o.form?.childName || o.buyerName || 'Order')}</b>${theme ? ` · ${esc(orderTitle(o))}${products.itemsOf(o).length > 1 ? ` <span class="muted">(${esc(products.packageName(products.itemsOf(o)))})</span>` : ''}` : ''}
      <small>${o.source === 'web' ? 'Website · ' : ''}${esc(o.buyerName || '')}${o.email ? ` &lt;${esc(o.email)}&gt;` : ''} · ${esc(new Date(o.createdAt).toLocaleString('en-US'))}${o.receiptId ? ` · receipt ${esc(o.receiptId)}` : ''}</small></header>
    <details><summary>Buyer’s notes</summary><pre>${esc(o.personalization)}</pre>${
      Object.keys(o.options || {}).length ? `<pre>${esc(Object.entries(o.options).map(([k, v]) => `${k}: ${v}`).join('\n'))}</pre>` : ''
    }</details>
    ${o.problem ? `<p class="problem">${esc(o.problem)}</p>` : ''}
    ${
      o.status === 'ready' && o.source === 'web'
        ? `<p><a href="/d/${esc(o.downloadToken)}.pdf" target="_blank">Preview PDF</a>${kitLink(o, 'Play kit PDF')} · ${o.deliveredAt ? `Emailed to ${esc(o.email)}` : 'Not emailed yet'}</p>
           ${o.sent ? '' : `<form method="post" action="/admin/orders/${esc(o.id)}/email"><button>Email it to ${esc(o.email)}</button></form>`}`
        : o.status === 'ready'
        ? `<p><a href="/d/${esc(o.downloadToken)}.pdf" target="_blank">Preview PDF</a>${kitLink(o, 'Play kit PDF')}</p>
           <textarea readonly rows="${7 + (o.kitReady ? 3 : 0) + (o.partyReady ? 3 : 0) + (o.hostToken ? 4 : 0)}">${esc(o.message)}</textarea>
           <div class="row"><button type="button" onclick="copyMsg(this)">Copy message</button>
           ${o.sent ? '' : `<form method="post" action="/admin/orders/${esc(o.id)}/sent"><button>Mark as sent</button></form>`}</div>`
        : ''
    }
    ${o.status === 'processing' ? '' : `<form method="post" action="/admin/orders/${esc(o.id)}/${o.cleared ? 'restore' : 'clear'}"><button class="secondary">${o.cleared ? 'Put back' : 'Clear from list'}</button></form>`}
    <details><summary>Edit details and rebuild</summary>
      <form method="post" action="/admin/orders/${esc(o.id)}/config">
        <textarea name="config" rows="12">${esc(JSON.stringify(o.config || o.draft || { theme: '', childName: '', age: null, spots: [] }, null, 2))}</textarea>
        <div class="row"><button>Rebuild PDF</button></div>
      </form>
      <form method="post" action="/admin/orders/${esc(o.id)}/retry"><button class="secondary">Re-read buyer’s notes with Claude</button></form>
    </details>
  </article>`;
}

function setupPanel() {
  const rows = health.checks();
  const bad = rows.filter((r) => !r[1]);
  return `<details class="panel"${bad.length || health.recent.length ? ' open' : ''}><summary><b>Setup check</b> <span class="muted">${bad.length ? `${bad.length} setting${bad.length === 1 ? '' : 's'} to fix` : 'all settings look right'}</span></summary>
  <ul style="padding-left:18px">${rows.map(([label, ok, hint]) => `<li>${ok ? '✅' : '❌'} ${esc(label)}${ok ? '' : ` <span class="muted">${esc(hint)}</span>`}</li>`).join('')}</ul>
  ${health.recent.length ? `<b>Recent problems</b><ul style="padding-left:18px">${health.recent.map((e) => `<li><span class="muted">${esc(new Date(e.at).toLocaleString('en-US'))} · ${esc(e.area)}</span><br>${esc(e.message)}</li>`).join('')}</ul>` : ''}
  <p class="muted">Change settings in Railway's Variables tab. Railway restarts the bot when you save.</p></details>`;
}

function dashboard(query = new URLSearchParams()) {
  const s = store.get();
  const all = Object.values(s.orders).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const cleared = all.filter((o) => o.cleared);
  const list = all.filter((o) => !o.cleared);
  const unpaid = list.filter((o) => o.status === 'awaiting_payment');
  const open = list.filter((o) => !o.sent && o.status !== 'awaiting_payment');
  const done = list.filter((o) => o.sent);
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Order Bot</title><style>
body{font-family:system-ui,sans-serif;max-width:820px;margin:0 auto;padding:16px;background:#f6f5f2;color:#222}
h1{font-size:22px} h2{font-size:16px;margin-top:28px;color:#555}
.panel,.order{background:#fff;border:1px solid #ddd;border-radius:10px;padding:14px 16px;margin:10px 0}
.order header small{display:block;color:#777;margin-top:2px}
.badge{display:inline-block;font-size:12px;padding:2px 8px;border-radius:10px;background:#eee;margin-right:6px}
.ready .badge{background:#d8f3dc;color:#1b5e20}.needs_attention .badge{background:#ffe0b2;color:#8a4b00}.sent{opacity:.6}
.problem{color:#8a4b00;background:#fff4e5;padding:8px 10px;border-radius:6px}
textarea{width:100%;box-sizing:border-box;font:13px ui-monospace,monospace;padding:8px;border:1px solid #ccc;border-radius:6px}
pre{white-space:pre-wrap;background:#f3f3f3;padding:8px;border-radius:6px}
button{background:#2d6a4f;color:#fff;border:0;border-radius:6px;padding:8px 14px;font-size:14px;cursor:pointer}
button.secondary{background:#fff;color:#2d6a4f;border:1px solid #2d6a4f;margin-top:8px}
.row{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap} input{padding:7px;border:1px solid #ccc;border-radius:6px;width:100%;box-sizing:border-box}
.muted{color:#777;font-size:13px}
.bar{height:14px;background:#e6efe9;border-radius:99px;overflow:hidden;margin-top:10px}.bar div{height:100%;background:#2d6a4f;transition:width .4s}
</style></head><body>
<h1>Order Bot</h1>
${query.get('empty') ? '<div class="panel problem">Type or paste the order details first (the grey example text doesn’t count). Tap “Use the sample” to try it.</div>' : ''}
${query.get('pickkit') ? '<div class="panel problem">For a play kit on its own, pick a theme or a shop kit from the list.</div>' : ''}
${query.get('made') && s.orders[query.get('made')] ? `<div class="panel"><b>Making it now.</b> <span class="muted">It’s under “To send” below and finishes in about a minute; this page refreshes by itself.</span> <a href="#${esc(query.get('made'))}">Jump to it</a></div>` : ''}
${setupPanel()}
<div class="panel">
  ${
    !etsy.configured()
      ? `<b>Etsy not set up.</b> <span class="muted">Add ETSY_KEYSTRING and ETSY_SHARED_SECRET to turn on Etsy orders.</span>`
      : etsy.isConnected()
      ? `<b>Etsy shop connected.</b> <span class="muted">Checks for new orders every ${POLL_MINUTES} min. Last check: ${esc(s.lastPollAt ? new Date(s.lastPollAt).toLocaleString('en-US') : 'not yet')}</span>
         ${s.lastPollError ? `<p class="problem">Last check failed: ${esc(s.lastPollError)}</p>` : ''}
         <form method="post" action="/admin/poll"><button class="secondary">Check now</button></form>`
      : `<b>Etsy shop not connected.</b> <p class="muted">Register this redirect URL in your Etsy app first: <code>${esc(process.env.PUBLIC_URL)}/auth/etsy/callback</code></p>
         <a href="/auth/etsy/start"><button>Connect Etsy shop</button></a>`
  }
</div>
<div class="panel">${
    payments.enabled()
      ? `<b>Website checkout on.</b> <span class="muted">Buyers pick any mix of hunt ($${(payments.PRICES.hunt / 100).toFixed(2)}), play kit ($${(payments.PRICES.kit / 100).toFixed(2)}), activity pack ($${(payments.PRICES.activity / 100).toFixed(2)}) and party pack ($${(payments.PRICES.party / 100).toFixed(2)}), or all three for $${(payments.PRICES.bundle / 100).toFixed(2)}, built and emailed automatically.${unpaid.length ? ` ${unpaid.length} checkout${unpaid.length === 1 ? '' : 's'} started but not paid.` : ''}</span>`
      : `<b>Website checkout off.</b> <span class="muted">Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to take orders on your site.</span>`
  }</div>
${listingsPanel(s)}
<div class="panel"><b>Mailing list:</b> ${Object.values(s.subscribers || {}).filter((x) => !x.unsubscribedAt).length} people from the free sample. <a href="/admin/subscribers.csv">Download CSV</a></div>
<details class="panel"><summary><b>Make an order by hand</b> <span class="muted">(paste order notes, or test the bot)</span></summary>
  <form method="post" action="/admin/orders">
    <p><input name="buyerName" placeholder="Buyer name (optional)"></p>
    <textarea name="personalization" rows="4" required placeholder="Maya, turning 6, space theme. Spots: front door, shoe rack, washer, dryer, grandma's piano, dog bed, kitchen table (prize). Pets: Rover (dog)"></textarea>
    <button type="button" class="secondary" onclick="const t=this.form.personalization;t.value=t.placeholder;t.focus()">Use the sample</button>
    <div class="row"><select name="theme"><option value="">Theme: from the notes</option><optgroup label="Hunt themes">${Object.entries(THEMES).map(([id, t]) => `<option value="${esc(id)}">${esc(t.name)}</option>`).join('')}</optgroup><optgroup label="Shop kits (play kit only)">${Object.values(KITS).filter((k) => !k.hunt).map((k) => `<option value="kit:${esc(k.id)}">${esc(k.name)}</option>`).join('')}</optgroup><optgroup label="Handprint art">${Object.values(HOLIDAYS).map((h) => `<option value="craft:${esc(h.id)}">${esc(h.kicker)}</option>`).join('')}</optgroup></select><select name="product"><option value="bundle">Party bundle (hunt, play kit and party pack)</option><option value="hunt">Hunt only</option><option value="kit">Play kit only</option><option value="party">Party pack only</option></select><button>Make it</button></div>
  </form>
</details>
<h2>To send (${open.length})</h2>${open.map(orderCard).join('') || '<p class="muted">Nothing waiting.</p>'}
<h2>Sent (${done.length})</h2>${done.length ? '<form method="post" action="/admin/orders/clear-sent"><button class="secondary">Clear all sent</button></form>' : ''}${done.slice(0, 30).map(orderCard).join('')}
${cleared.length ? `<details class="cleared"${query.get('cleared') ? ' open' : ''}><summary><h2 style="display:inline">Cleared (${cleared.length})</h2> <span class="muted">Hidden from the list. Buyers’ download and Host Mode links still work.</span></summary>${cleared.slice(0, 50).map(orderCard).join('')}</details>` : ''}
<script>
function copyMsg(btn){const t=btn.closest('.order').querySelector('textarea');navigator.clipboard.writeText(t.value).then(()=>{btn.textContent='Copied!';setTimeout(()=>btn.textContent='Copy message',1500)})}
${open.some((o) => o.status === 'processing') ? 'setTimeout(()=>location.reload(),5000)' : ''}
</script></body></html>`;
}

async function route(req, res) {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;

  if (p === '/health') return send(res, 200, 'ok', { 'Content-Type': 'text/plain' });

  const dl = p.match(/^\/d\/([A-Za-z0-9_-]{20,})\.pdf$/);
  if (dl) {
    const file = path.join(store.PDF_DIR, `${dl[1]}.pdf`);
    if (!fs.existsSync(file)) return send(res, 404, 'Not found');
    res.writeHead(200, { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${dl[1].endsWith('-kit') ? 'play-kit' : dl[1].endsWith('-activities') ? 'activity-pack' : dl[1].endsWith('-party') ? 'party-printables' : 'scavenger-hunt'}.pdf"` });
    return fs.createReadStream(file).pipe(res);
  }

  if (p === '/api/sample') {
    if (req.method === 'OPTIONS') return send(res, 204, '', cors(req));
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Use POST' });
    try {
      const body = JSON.parse((await readRaw(req, 5_000)).toString() || '{}');
      await sample.requestSample(body, req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress);
      return sendJson(res, 200, { ok: true });
    } catch (err) {
      if (err instanceof SyntaxError) return sendJson(res, 400, { error: 'Bad request' });
      if (!err.status) {
        console.error('Sample request failed:', err.message);
        health.recordError('Free sample email', err.message);
      }
      return sendJson(res, err.status || 502, { error: err.status ? err.message : 'Something went wrong. Please try again in a minute.' });
    }
  }

  const sp = p.match(/^\/sample\/([a-z]+)\.pdf$/);
  if (sp && THEMES[sp[1]]) {
    const file = await sample.samplePdf(sp[1]);
    res.writeHead(200, { 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline; filename="mini-scavenger-hunt.pdf"' });
    return fs.createReadStream(file).pipe(res);
  }

  if (p === '/unsubscribe') {
    const ok = sample.unsubscribe(url.searchParams.get('e'), url.searchParams.get('t'));
    return send(res, ok ? 200 : 400, `<!doctype html><meta name="viewport" content="width=device-width"><body style="font-family:Arial,sans-serif;color:#3f4a73;text-align:center;padding:60px 16px">${ok ? '<h2>You’re unsubscribed</h2><p>You won’t get any more emails from us.</p>' : '<h2>That link didn’t work</h2><p>Reply to any of our emails and we’ll remove you by hand.</p>'}</body>`);
  }

  if (p === '/api/checkout') {
    if (req.method === 'OPTIONS') return send(res, 204, '', cors(req));
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Use POST' });
    if (!payments.enabled()) return sendJson(res, 503, { error: 'Online ordering is not open yet.' });
    let form;
    try {
      form = orders.validateWebForm(JSON.parse((await readRaw(req, 20_000)).toString() || '{}'));
    } catch (err) {
      return sendJson(res, 400, { error: err instanceof SyntaxError ? 'Bad request' : err.message });
    }
    const id = orders.addWebOrder(form);
    try {
      const session = await payments.createCheckout(store.get().orders[id]);
      store.update((s) => (s.orders[id].checkoutId = session.id));
      return sendJson(res, 200, { url: session.url });
    } catch (err) {
      console.error('Stripe checkout failed:', err.message);
      health.recordError('Website checkout', err.message);
      return sendJson(res, 502, { error: 'Checkout is having trouble right now. Please try again in a minute.' });
    }
  }

  if (p === '/webhooks/stripe' && req.method === 'POST') {
    let event;
    try {
      event = payments.readWebhook(await readRaw(req), req.headers['stripe-signature']);
    } catch (err) {
      return send(res, 400, `Webhook error: ${esc(err.message)}`, { 'Content-Type': 'text/plain' });
    }
    const session = event.data?.object;
    if (event.type === 'checkout.session.completed' && session.payment_status === 'paid' && session.metadata?.order_id) {
      // Answer Stripe right away; building the PDF takes a few seconds.
      orders
        .fulfillWebOrder(session.metadata.order_id, { email: session.customer_details?.email, buyerName: session.customer_details?.name || '' })
        .catch((err) => {
          console.error('Fulfillment failed:', err);
          health.recordError('Building a website order', err.message);
        });
    }
    return send(res, 200, 'ok', { 'Content-Type': 'text/plain' });
  }

  // Host Mode (/h/<token>) and the sidekick page (/s/<token>). /state keeps them in step.
  const hm = p.match(/^\/(h|s)\/([A-Za-z0-9_-]{20,})(\/state)?$/);
  if (hm) {
    const [, kind, token, state] = hm;
    const field = kind === 'h' ? 'hostToken' : 'sidekickToken';
    const o = Object.values(store.get().orders).find((x) => x[field] === token && x.status === 'ready');
    if (!o) return send(res, 404, 'This link isn’t working. Check that you copied all of it.');
    const noStore = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };
    if (state && req.method === 'POST' && kind === 'h') {
      try {
        const step = JSON.parse((await readRaw(req, 1_000)).toString()).step;
        if (Number.isInteger(step) && step >= 0 && step < 200) store.update((s) => (s.orders[o.id].hostStep = { step, at: new Date().toISOString() }));
      } catch {}
      return send(res, 204, '', noStore);
    }
    if (state) return send(res, 200, JSON.stringify({ step: o.hostStep?.step ?? 0 }), { 'Content-Type': 'application/json', ...noStore });
    const stateUrl = `/h/${o.hostToken}/state`;
    const page = kind === 'h'
      ? host.hostPage(o, { stateUrl, items: products.itemsOf(o), sidekickUrl: o.sidekickToken && `${process.env.PUBLIC_URL}/s/${o.sidekickToken}`, downloads: `/d/${o.downloadToken}.pdf` })
      : host.sidekickPage(o, { stateUrl: `/s/${o.sidekickToken}/state` });
    return send(res, 200, page, noStore);
  }

  const op = p.match(/^\/order\/(web-[A-Za-z0-9_-]{16,})$/);
  if (op) {
    const o = store.get().orders[op[1]];
    if (!o) return send(res, 404, 'Order not found');
    return send(res, 200, orderPage(o));
  }

  if (p === '/auth/etsy/callback') {
    if (!pendingAuth || url.searchParams.get('state') !== pendingAuth.state) return send(res, 400, 'Connection expired, please try again from the dashboard.');
    if (url.searchParams.get('error')) return send(res, 400, `Etsy said: ${esc(url.searchParams.get('error_description') || url.searchParams.get('error'))}`);
    await etsy.finishAuth(url.searchParams.get('code'), pendingAuth.verifier);
    pendingAuth = null;
    orders.pollEtsy();
    return redirect(res, '/admin');
  }

  if (!authorized(req)) return send(res, 401, 'Login required', { 'WWW-Authenticate': 'Basic realm="Order Bot"' });

  if (p === '/' || p === '/admin') return send(res, 200, dashboard(url.searchParams));
  if (p === '/admin/subscribers.csv') return send(res, 200, sample.subscribersCsv(), { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="subscribers.csv"' });
  if (p === '/auth/etsy/start') {
    const auth = etsy.startAuth();
    pendingAuth = { state: auth.state, verifier: auth.verifier };
    return redirect(res, auth.url);
  }
  if (req.method !== 'POST') return send(res, 404, 'Not found');

  if (p === '/admin/poll') {
    await orders.pollEtsy();
    return redirect(res, '/admin');
  }
  if (p === '/admin/etsy/listings') {
    store.update((st) => (st.listingsError = null));
    listings.createDrafts();
    return redirect(res, '/admin');
  }
  if (p === '/admin/etsy/listings/stop') {
    listings.stop();
    return redirect(res, '/admin');
  }
  if (p === '/admin/orders') {
    const f = await readForm(req);
    if (!f.personalization?.trim()) return redirect(res, '/admin?empty=1');
    // Handprint art is its own product: the holiday comes from the dropdown.
    const holiday = HOLIDAYS[String(f.theme || '').replace(/^craft:/, '')];
    if (f.theme?.startsWith('craft:') && holiday) {
      const id = orders.addOrder({ source: 'manual', buyerName: f.buyerName || '', personalization: f.personalization, options: { Holiday: holiday.name }, product: 'craft', holiday: holiday.id });
      orders.processOrder(id);
      return redirect(res, `/admin?made=${encodeURIComponent(id)}#${id}`);
    }
    // A shop kit is always a play kit on its own; "Play kit only" with a hunt theme makes that theme's kit.
    const shopKit = KITS[String(f.theme || '').replace(/^kit:/, '')];
    const kit = f.theme?.startsWith('kit:') && shopKit && !shopKit.hunt ? shopKit : f.product === 'kit' && THEMES[f.theme] ? kitForHunt(f.theme) : null;
    if (f.product === 'kit' && !kit) return redirect(res, '/admin?pickkit=1');
    const product = kit ? 'kit' : ['bundle', 'hunt', 'party'].includes(f.product) ? f.product : f.bundle ? 'bundle' : 'hunt';
    const options = kit ? { Kit: kit.name } : THEMES[f.theme] ? { Theme: THEMES[f.theme].name } : {};
    const id = orders.addOrder({ source: 'manual', buyerName: f.buyerName || '', personalization: f.personalization, options, product, ...(kit ? { kit: kit.id } : {}) });
    orders.processOrder(id);
    return redirect(res, `/admin?made=${encodeURIComponent(id)}#${id}`);
  }
  if (p === '/admin/orders/clear-sent') {
    store.update((s) => Object.values(s.orders).forEach((o) => o.sent && (o.cleared = true)));
    return redirect(res, '/admin');
  }
  const m = p.match(/^\/admin\/orders\/([\w-]+)\/(sent|retry|config|email|clear|restore)$/);
  if (m && store.get().orders[m[1]]) {
    const [, id, action] = m;
    if (action === 'sent') store.update((s) => (s.orders[id].sent = true));
    if (action === 'clear' || action === 'restore') {
      store.update((s) => (s.orders[id].cleared = action === 'clear'));
      return redirect(res, action === 'clear' ? '/admin' : `/admin#${id}`);
    }
    if (action === 'email') {
      try {
        await sendHuntEmail(store.get().orders[id]);
        store.update((s) => Object.assign(s.orders[id], { sent: true, deliveredAt: new Date().toISOString(), problem: null }));
      } catch (err) {
        store.update((s) => (s.orders[id].problem = err.message));
      }
    }
    if (action === 'retry') {
      store.update((s) => (s.orders[id].status = 'processing'));
      orders.processOrder(id);
    }
    if (action === 'config') {
      const f = await readForm(req);
      try {
        const config = JSON.parse(f.config);
        store.update((s) => Object.assign(s.orders[id], { config, status: 'processing' }));
        await orders.generate(id);
      } catch (err) {
        store.update((s) => Object.assign(s.orders[id], { status: 'needs_attention', problem: `Rebuild failed: ${err.message}` }));
      }
    }
    return redirect(res, `/admin?made=${encodeURIComponent(id)}#${id}`);
  }
  return send(res, 404, 'Not found');
}

http
  .createServer((req, res) =>
    route(req, res).catch((err) => {
      console.error(err);
      if (!res.headersSent) send(res, err.status || 500, `Something went wrong: ${esc(err.message)}`);
    })
  )
  .listen(PORT, () => console.log(`Order bot listening on :${PORT}`));

setInterval(() => orders.pollEtsy(), POLL_MINUTES * 60_000);
orders.pollEtsy();
