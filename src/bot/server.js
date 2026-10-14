// Order bot web server: owner dashboard, Etsy connect flow, website checkout,
// Stripe webhook, order status pages, PDF downloads, and the poller.

const fs = require('fs');
const http = require('http');
const path = require('path');
const store = require('./store');
const etsy = require('./etsy');
const orders = require('./orders');
const payments = require('./payments');
const { sendHuntEmail } = require('./email');
const THEMES = require('../generator/themes');

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

const cors = () => ({
  'Access-Control-Allow-Origin': process.env.SITE_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  Vary: 'Origin',
});
const sendJson = (res, code, obj) => send(res, code, JSON.stringify(obj), { 'Content-Type': 'application/json', ...cors() });

// Public page the buyer lands on after paying. Order ids are long and random.
function orderPage(o) {
  const theme = THEMES[o.form.theme];
  const working = o.status === 'awaiting_payment' || o.status === 'processing';
  const body =
    o.status === 'ready'
      ? `<h1>${esc(o.config.childName)}’s hunt is ready! 🎉</h1>
         <p><a class="btn" href="/d/${esc(o.downloadToken)}.pdf" target="_blank">Download your hunt (PDF)</a></p>
         <p>${o.email ? `We also emailed the link to <b>${esc(o.email)}</b>.` : ''} Print at “Actual Size / 100%”, cut out the clue cards, and follow the Host Guide on page 1.</p>`
      : working
        ? `<h1>Building ${esc(o.form.childName)}’s ${esc(theme.name)}…</h1>
           <p>${o.status === 'awaiting_payment' ? 'Confirming your payment.' : 'Writing clues and laying out the cards.'} This page updates by itself, and we’ll email you the link too.</p>
           <div class="spin"></div>`
        : `<h1>Thanks for your order!</h1>
           <p>Your payment went through. We’re giving ${esc(o.form.childName)}’s hunt a quick hand check and will email it to ${esc(o.email || 'you')} shortly.</p>`;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your scavenger hunt</title>${working ? '<meta http-equiv="refresh" content="4">' : ''}<style>
:root{--bg:#fbf6ec;--ink:#1e2a5a;--muted:#5b6386;--sun:#ffc93c;--sun-ink:#2a1f00}
@media (prefers-color-scheme:dark){:root{--bg:#141a33;--ink:#f4efe4;--muted:#b6bbd6}}
body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.55 system-ui,sans-serif}
main{max-width:560px;margin:12vh auto;padding:0 16px;text-align:center}
h1{font-size:28px;line-height:1.2}p{color:var(--muted)}p b{color:var(--ink)}
.btn{display:inline-block;background:var(--sun);color:var(--sun-ink);padding:14px 26px;border-radius:99px;text-decoration:none;font-weight:700}
.spin{width:36px;height:36px;margin:24px auto;border:4px solid var(--muted);border-top-color:var(--sun);border-radius:50%;animation:s 1s linear infinite}
@keyframes s{to{transform:rotate(1turn)}}
</style></head><body><main>${body}</main></body></html>`;
}

function orderCard(o) {
  const badge = { ready: 'Ready to send', needs_attention: 'Needs a look', processing: 'Working…', awaiting_payment: 'Not paid' }[o.status] || o.status;
  const theme = o.config && THEMES[o.config.theme];
  return `<article id="${esc(o.id)}" class="order ${o.sent ? 'sent' : o.status}">
    <header><span class="badge">${o.sent ? 'Sent' : esc(badge)}</span>
      <b>${esc(o.config?.childName || o.form?.childName || o.buyerName || 'Order')}</b>${theme ? ` · ${esc(theme.name)}` : ''}
      <small>${o.source === 'web' ? 'Website · ' : ''}${esc(o.buyerName || '')}${o.email ? ` &lt;${esc(o.email)}&gt;` : ''} · ${esc(new Date(o.createdAt).toLocaleString('en-US'))}${o.receiptId ? ` · receipt ${esc(o.receiptId)}` : ''}</small></header>
    <details><summary>Buyer’s notes</summary><pre>${esc(o.personalization)}</pre>${
      Object.keys(o.options || {}).length ? `<pre>${esc(Object.entries(o.options).map(([k, v]) => `${k}: ${v}`).join('\n'))}</pre>` : ''
    }</details>
    ${o.problem ? `<p class="problem">${esc(o.problem)}</p>` : ''}
    ${
      o.status === 'ready' && o.source === 'web'
        ? `<p><a href="/d/${esc(o.downloadToken)}.pdf" target="_blank">Preview PDF</a> · ${o.deliveredAt ? `Emailed to ${esc(o.email)}` : 'Not emailed yet'}</p>
           ${o.sent ? '' : `<form method="post" action="/admin/orders/${esc(o.id)}/email"><button>Email it to ${esc(o.email)}</button></form>`}`
        : o.status === 'ready'
        ? `<p><a href="/d/${esc(o.downloadToken)}.pdf" target="_blank">Preview PDF</a></p>
           <textarea readonly rows="7">${esc(o.message)}</textarea>
           <div class="row"><button type="button" onclick="copyMsg(this)">Copy message</button>
           ${o.sent ? '' : `<form method="post" action="/admin/orders/${esc(o.id)}/sent"><button>Mark as sent</button></form>`}</div>`
        : ''
    }
    <details><summary>Edit details and rebuild</summary>
      <form method="post" action="/admin/orders/${esc(o.id)}/config">
        <textarea name="config" rows="12">${esc(JSON.stringify(o.config || o.draft || { theme: '', childName: '', age: null, spots: [] }, null, 2))}</textarea>
        <div class="row"><button>Rebuild PDF</button></div>
      </form>
      <form method="post" action="/admin/orders/${esc(o.id)}/retry"><button class="secondary">Re-read buyer’s notes with Claude</button></form>
    </details>
  </article>`;
}

function dashboard() {
  const s = store.get();
  const list = Object.values(s.orders).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
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
</style></head><body>
<h1>Order Bot</h1>
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
      ? `<b>Website checkout on.</b> <span class="muted">$${(payments.PRICE_CENTS / 100).toFixed(2)} per custom hunt, built and emailed automatically.${unpaid.length ? ` ${unpaid.length} checkout${unpaid.length === 1 ? '' : 's'} started but not paid.` : ''}</span>`
      : `<b>Website checkout off.</b> <span class="muted">Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to take orders on your site.</span>`
  }</div>
<details class="panel"><summary><b>Make a hunt by hand</b> <span class="muted">(paste order notes, or test the bot)</span></summary>
  <form method="post" action="/admin/orders">
    <p><input name="buyerName" placeholder="Buyer name (optional)"></p>
    <textarea name="personalization" rows="4" placeholder="Maya, turning 6, space theme. Spots: front door, shoe rack, washer, dryer, grandma's piano, dog bed, kitchen table (prize)"></textarea>
    <div class="row"><button>Make hunt</button></div>
  </form>
</details>
<h2>To send (${open.length})</h2>${open.map(orderCard).join('') || '<p class="muted">Nothing waiting.</p>'}
<h2>Sent (${done.length})</h2>${done.slice(0, 30).map(orderCard).join('')}
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
    res.writeHead(200, { 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline; filename="scavenger-hunt.pdf"' });
    return fs.createReadStream(file).pipe(res);
  }

  if (p === '/api/checkout') {
    if (req.method === 'OPTIONS') return send(res, 204, '', cors());
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
        .catch((err) => console.error('Fulfillment failed:', err));
    }
    return send(res, 200, 'ok', { 'Content-Type': 'text/plain' });
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

  if (p === '/' || p === '/admin') return send(res, 200, dashboard());
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
  if (p === '/admin/orders') {
    const f = await readForm(req);
    if (!f.personalization?.trim()) return redirect(res, '/admin');
    const id = orders.addOrder({ source: 'manual', buyerName: f.buyerName || '', personalization: f.personalization, options: {} });
    orders.processOrder(id);
    return redirect(res, `/admin#${id}`);
  }
  const m = p.match(/^\/admin\/orders\/([\w-]+)\/(sent|retry|config|email)$/);
  if (m && store.get().orders[m[1]]) {
    const [, id, action] = m;
    if (action === 'sent') store.update((s) => (s.orders[id].sent = true));
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
    return redirect(res, `/admin#${id}`);
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
