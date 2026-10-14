// Order pipeline: Etsy receipt -> parsed hunt config -> PDF -> ready-to-send message.

const crypto = require('crypto');
const path = require('path');
const store = require('./store');
const etsy = require('./etsy');
const { parseOrder } = require('./parse');
const { renderPdf } = require('../generator/render');
const THEMES = require('../generator/themes');

const CUSTOM_LISTING_IDS = (process.env.CUSTOM_LISTING_IDS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// A transaction needs a custom hunt if it's on a listed custom listing, or
// (when no listing ids are configured) if the buyer filled in personalization.
function customRequest(tx) {
  const variations = tx.variations || [];
  const personal = variations.filter((v) => v.question_id || /personali[sz]/i.test(v.formatted_name || ''));
  const isCustom = CUSTOM_LISTING_IDS.length ? CUSTOM_LISTING_IDS.includes(String(tx.listing_id)) : personal.length > 0;
  if (!isCustom) return null;
  const options = Object.fromEntries(variations.filter((v) => !personal.includes(v)).map((v) => [v.formatted_name, v.formatted_value]));
  return { personalization: personal.map((v) => v.formatted_value).join('\n'), options };
}

function buyerMessage(order) {
  const first = (order.buyerName || '').split(' ')[0] || 'there';
  const theme = THEMES[order.config.theme];
  return `Hi ${first}! Your custom ${theme.name} for ${order.config.childName} is ready. Download your printable PDF here:

${process.env.PUBLIC_URL}/d/${order.downloadToken}.pdf

Print at "Actual Size / 100%", cut out the clue cards, and use the Host Guide on page 1 to hide them. Have an amazing party! 🎉`;
}

async function generate(id) {
  const order = store.get().orders[id];
  const token = order.downloadToken || crypto.randomBytes(18).toString('base64url');
  await renderPdf(order.config, path.join(store.PDF_DIR, `${token}.pdf`));
  store.update((s) => {
    Object.assign(s.orders[id], { downloadToken: token, status: 'ready', problem: null, generatedAt: new Date().toISOString() });
    s.orders[id].message = buyerMessage(s.orders[id]);
  });
}

// Parses and builds one order. Never throws: failures become "needs attention".
async function processOrder(id) {
  const order = store.get().orders[id];
  try {
    const parsed = await parseOrder({ personalization: order.personalization, options: order.options });
    if (!parsed.ok) {
      store.update((s) => Object.assign(s.orders[id], { status: 'needs_attention', problem: parsed.problem, draft: parsed.draft || null }));
    } else {
      store.update((s) => (s.orders[id].config = parsed.config));
      await generate(id);
    }
  } catch (err) {
    store.update((s) => Object.assign(s.orders[id], { status: 'needs_attention', problem: `Error: ${err.message}` }));
  }
  await notify(store.get().orders[id]);
}

function addOrder(fields) {
  const id = fields.id || `manual-${Date.now()}`;
  store.update((s) => {
    s.orders[id] = { id, createdAt: new Date().toISOString(), status: 'processing', sent: false, ...fields };
  });
  return id;
}

async function pollEtsy() {
  if (!etsy.isConnected()) return;
  const s = store.get();
  // Look back a day on the first run, then overlap each poll by an hour; ids dedupe.
  const since = Math.floor((s.lastPollAt ? new Date(s.lastPollAt).getTime() - 3600_000 : Date.now() - 86400_000) / 1000);
  const startedAt = new Date().toISOString();
  try {
    const receipts = await etsy.paidReceiptsSince(since);
    const fresh = [];
    for (const r of receipts) {
      for (const tx of r.transactions || []) {
        const id = `etsy-${r.receipt_id}-${tx.transaction_id}`;
        if (store.get().orders[id]) continue;
        const req = customRequest(tx);
        if (!req) continue;
        fresh.push(addOrder({ id, source: 'etsy', receiptId: r.receipt_id, buyerName: r.name, listingTitle: tx.title, ...req }));
      }
    }
    for (const id of fresh) await processOrder(id);
    store.update((st) => Object.assign(st, { lastPollAt: startedAt, lastPollError: null }));
  } catch (err) {
    console.error('Etsy poll failed:', err.message);
    store.update((st) => (st.lastPollError = `${new Date().toISOString()}: ${err.message}`));
  }
}

// Push notification via ntfy.sh (free phone app). Optional.
async function notify(order) {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return;
  const ready = order.status === 'ready';
  try {
    await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
      method: 'POST',
      headers: {
        Title: ready ? `Hunt ready for ${order.config.childName}` : 'Order needs a look',
        Click: `${process.env.PUBLIC_URL}/admin#${order.id}`,
        Tags: ready ? 'tada' : 'warning',
      },
      body: ready ? `Open the dashboard and send the link to ${order.buyerName || 'the buyer'}.` : order.problem || 'Unknown problem',
    });
  } catch (err) {
    console.error('Notification failed:', err.message);
  }
}

module.exports = { addOrder, processOrder, generate, pollEtsy };
