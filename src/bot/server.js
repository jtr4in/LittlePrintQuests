// Order bot web server: owner dashboard, Etsy connect flow, PDF downloads, and the poller.

const fs = require('fs');
const http = require('http');
const path = require('path');
const store = require('./store');
const etsy = require('./etsy');
const orders = require('./orders');
const THEMES = require('../generator/themes');

const PORT = Number(process.env.PORT || 3000);
const POLL_MINUTES = Number(process.env.POLL_MINUTES || 5);
const REQUIRED = ['PUBLIC_URL', 'ADMIN_PASSWORD', 'ANTHROPIC_API_KEY', 'ETSY_KEYSTRING', 'ETSY_SHARED_SECRET'];
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

function orderCard(o) {
  const badge = { ready: 'Ready to send', needs_attention: 'Needs a look', processing: 'Working…' }[o.status] || o.status;
  const theme = o.config && THEMES[o.config.theme];
  return `<article id="${esc(o.id)}" class="order ${o.sent ? 'sent' : o.status}">
    <header><span class="badge">${o.sent ? 'Sent' : esc(badge)}</span>
      <b>${esc(o.config?.childName || o.buyerName || 'Order')}</b>${theme ? ` · ${esc(theme.name)}` : ''}
      <small>${esc(o.buyerName || '')} · ${esc(new Date(o.createdAt).toLocaleString('en-US'))}${o.receiptId ? ` · receipt ${esc(o.receiptId)}` : ''}</small></header>
    <details><summary>Buyer’s notes</summary><pre>${esc(o.personalization)}</pre>${
      Object.keys(o.options || {}).length ? `<pre>${esc(Object.entries(o.options).map(([k, v]) => `${k}: ${v}`).join('\n'))}</pre>` : ''
    }</details>
    ${o.problem ? `<p class="problem">${esc(o.problem)}</p>` : ''}
    ${
      o.status === 'ready'
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
  const open = list.filter((o) => !o.sent);
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
    etsy.isConnected()
      ? `<b>Etsy shop connected.</b> <span class="muted">Checks for new orders every ${POLL_MINUTES} min. Last check: ${esc(s.lastPollAt ? new Date(s.lastPollAt).toLocaleString('en-US') : 'not yet')}</span>
         ${s.lastPollError ? `<p class="problem">Last check failed: ${esc(s.lastPollError)}</p>` : ''}
         <form method="post" action="/admin/poll"><button class="secondary">Check now</button></form>`
      : `<b>Etsy shop not connected.</b> <p class="muted">Register this redirect URL in your Etsy app first: <code>${esc(process.env.PUBLIC_URL)}/auth/etsy/callback</code></p>
         <a href="/auth/etsy/start"><button>Connect Etsy shop</button></a>`
  }
</div>
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
  const m = p.match(/^\/admin\/orders\/([\w-]+)\/(sent|retry|config)$/);
  if (m && store.get().orders[m[1]]) {
    const [, id, action] = m;
    if (action === 'sent') store.update((s) => (s.orders[id].sent = true));
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
      if (!res.headersSent) send(res, 500, `Something went wrong: ${esc(err.message)}`);
    })
  )
  .listen(PORT, () => console.log(`Order bot listening on :${PORT}`));

setInterval(() => orders.pollEtsy(), POLL_MINUTES * 60_000);
orders.pollEtsy();
