// Order pipelines. Etsy: receipt -> parsed hunt config -> PDF -> ready-to-send message.
// Website: form -> Stripe payment -> PDF -> emailed to the buyer.
// A Party Bundle order also gets the theme's matching play kit as a second PDF.

const crypto = require('crypto');
const path = require('path');
const store = require('./store');
const etsy = require('./etsy');
const parse = require('./parse');
const { renderPdf } = require('../generator/render');
const { sendHuntEmail } = require('./email');
const { renderKit } = require('../kits/render-kit');
const { renderParty } = require('../party/render-party');
const { kitForHunt, KITS } = require('../kits/engine');
const THEMES = require('../generator/themes');
const SPOTS = require('../generator/spots');

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
  const personalization = personal.map((v) => v.formatted_value).join('\n');
  // The play kit listing has a "Kit" option naming the kit.
  const kit = Object.values(KITS).find((k) => Object.values(options).some((v) => v.toLowerCase() === k.name.toLowerCase()));
  if (kit) return { personalization, options, product: 'kit', kit: kit.id };
  // The bundle listing has a "Package" option; without one, go by the listing title.
  const pkg = options.Package;
  const bundle = pkg ? /bundle|play kit/i.test(pkg) : /bundle|play kit/i.test(tx.title || '');
  if (!bundle && !pkg && /party (pack|printables)/i.test(tx.title || '')) return { personalization, options, product: 'party' };
  return { personalization, options, product: bundle ? 'bundle' : 'hunt' };
}

function buyerMessage(order) {
  const first = (order.buyerName || '').split(' ')[0] || 'there';
  if (order.product === 'kit') {
    return `Hi ${first}! Your ${KITS[order.config.kit].name} play kit for ${order.config.childName} is ready. Download your printable PDF here:

${process.env.PUBLIC_URL}/d/${order.downloadToken}.pdf

Print at "Actual Size / 100%" and start with the grown-up guide on page 1. Have fun! 🎉`;
  }
  const theme = THEMES[order.config.theme];
  if (order.product === 'party') {
    return `Hi ${first}! Your ${theme.label} party pack for ${order.config.childName} is ready. Download your printable PDF here:

${process.env.PUBLIC_URL}/d/${order.downloadToken}.pdf

Print at "Actual Size / 100%". Invitations, toppers and the banner look best on cardstock. Have an amazing party! 🎉`;
  }
  const kit = order.kitReady ? kitForHunt(order.config.theme) : null;
  return `Hi ${first}! Your custom ${theme.name} for ${order.config.childName} is ready. Download your printable PDF here:

${process.env.PUBLIC_URL}/d/${order.downloadToken}.pdf
${kit ? `\nAnd here's the matching ${kit.name} play kit:\n\n${process.env.PUBLIC_URL}/d/${order.downloadToken}-kit.pdf\n` : ''}${order.partyReady ? `\nAnd your party printables (invitations, toppers, tags, banner and more):\n\n${process.env.PUBLIC_URL}/d/${order.downloadToken}-party.pdf\n` : ''}
Print at "Actual Size / 100%", cut out the clue cards, and use the Host Guide on page 1 to hide them. Have an amazing party! 🎉`;
}

async function generate(id) {
  const order = store.get().orders[id];
  const token = order.downloadToken || crypto.randomBytes(18).toString('base64url');
  const out = (suffix = '') => path.join(store.PDF_DIR, `${token}${suffix}.pdf`);
  if (order.product === 'kit') await renderKit(order.config, out());
  else if (order.product === 'party') await renderParty(order.config, out());
  else await renderPdf(order.config, out());
  const bundle = order.product === 'bundle';
  const kit = bundle ? kitForHunt(order.config.theme) : null;
  if (kit) await renderKit(kitConfig(order, kit), out('-kit'));
  if (bundle) await renderParty(partyConfig(order), out('-party'));
  store.update((s) => {
    Object.assign(s.orders[id], { downloadToken: token, kitReady: Boolean(kit), partyReady: bundle, status: 'ready', problem: null, generatedAt: new Date().toISOString() });
    s.orders[id].message = buyerMessage(s.orders[id]);
  });
}

function partyConfig(order) {
  const { theme, childName, age } = order.config;
  return { theme, childName, ...(age ? { age } : {}), ...(order.party ? { party: order.party } : {}) };
}

function kitConfig(order, kit) {
  return { kit: kit.id, childName: order.config.childName, subjects: order.pets || [], lenient: true, withHunt: true };
}

// Parses and builds one order. Never throws: failures become "needs attention".
async function processOrder(id) {
  const order = store.get().orders[id];
  try {
    const parsed = order.product === 'kit'
      ? await parse.parseKitOrder({ personalization: order.personalization, kit: order.kit })
      : order.product === 'party'
      ? await parse.parsePartyOrder({ personalization: order.personalization, options: order.options })
      : await parse.parseOrder({ personalization: order.personalization, options: order.options });
    if (!parsed.ok) {
      store.update((s) => Object.assign(s.orders[id], { status: 'needs_attention', problem: parsed.problem, draft: parsed.draft || null }));
    } else {
      store.update((s) => Object.assign(s.orders[id], { config: parsed.config, pets: parsed.pets || [], party: parsed.party || null }));
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
  if (!etsy.configured() || !etsy.isConnected()) return;
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
        Title: ready ? `${{ kit: 'Play kit', party: 'Party pack' }[order.product] || 'Hunt'} ready for ${order.config.childName}` : 'Order needs a look',
        Click: `${process.env.PUBLIC_URL}/admin#${order.id}`,
        Tags: ready ? 'tada' : 'warning',
      },
      body: ready ? `Open the dashboard and send the link to ${order.buyerName || 'the buyer'}.` : order.problem || 'Unknown problem',
    });
  } catch (err) {
    console.error('Notification failed:', err.message);
  }
}

// ---------- website orders ----------

// Checks the website's order form. Returns a clean form or throws a message for the buyer.
function validateWebForm(body) {
  const theme = String(body.theme || '');
  if (!THEMES[theme]) throw new Error('Please pick a theme.');
  const childName = String(body.childName || '').trim().slice(0, 24);
  if (!childName) throw new Error('Please add your child’s first name.');
  const age = Number.isInteger(body.age) && body.age > 0 && body.age < 16 ? body.age : null;
  if (body.product === 'party') return { product: 'party', theme, childName, age, spots: [], pets: [], party: cleanParty(body.party) };
  const spots = Array.isArray(body.spots) ? body.spots : [];
  if (spots.length < 3 || spots.length > 12) throw new Error('Please pick between 3 and 12 hiding spots.');
  const clean = spots.map((s) => {
    if (typeof s === 'string' && SPOTS[s]) return s;
    const label = String(s?.custom || '').trim().slice(0, 40);
    if (!label) throw new Error('One of the hiding spots is empty.');
    return { custom: label };
  });
  const product = body.product === 'bundle' ? 'bundle' : 'hunt';
  const pets = (Array.isArray(body.pets) ? body.pets : []).slice(0, 6)
    .map((p) => ({ name: String(p?.name || '').trim().slice(0, 20), kind: String(p?.kind || '').trim().slice(0, 20) }))
    .filter((p) => p.name || p.kind);
  return { product, theme, childName, age, spots: clean, pets, party: product === 'bundle' ? cleanParty(body.party) : null };
}

// Optional party details for the invitations.
function cleanParty(p) {
  if (!p || typeof p !== 'object') return null;
  const out = {};
  for (const k of ['date', 'time', 'place', 'rsvp']) {
    const v = String(p[k] || '').trim().slice(0, 60);
    if (v) out[k] = v;
  }
  return Object.keys(out).length ? out : null;
}

function addWebOrder(form) {
  return addOrder({
    id: `web-${crypto.randomBytes(12).toString('base64url')}`,
    source: 'web',
    status: 'awaiting_payment',
    product: form.product,
    pets: form.pets,
    party: form.party,
    form,
    personalization: formAsText(form),
    options: { Theme: THEMES[form.theme].name, Package: { bundle: 'Hunt + Play Kit + Party Pack', party: 'Party Pack' }[form.product] || 'Hunt only' },
  });
}

function formAsText(f) {
  if (f.product === 'party') return `${f.childName}${f.age ? `, turning ${f.age}` : ''}. Party pack.`;
  const spots = f.spots.map((s) => (typeof s === 'string' ? SPOTS[s].label : s.custom));
  return `${f.childName}${f.age ? `, turning ${f.age}` : ''}. Spots in order: ${spots.join(', ')} (prize at the last one).`;
}

// Called once Stripe confirms payment. Builds the PDF and emails it.
async function fulfillWebOrder(id, { email, buyerName }) {
  const order = store.get().orders[id];
  if (!order || order.status !== 'awaiting_payment') return; // already handled (Stripe can resend)
  store.update((s) => Object.assign(s.orders[id], { status: 'processing', email, buyerName, paidAt: new Date().toISOString() }));
  const f = order.form;
  try {
    if (f.product === 'party') {
      store.update((s) => (s.orders[id].config = { theme: f.theme, childName: f.childName, ...(f.age ? { age: f.age } : {}), ...(f.party ? { party: f.party } : {}) }));
    } else if (f.spots.every((s) => typeof s === 'string')) {
      // Every spot is in the library, so no need to ask Claude.
      store.update((s) => (s.orders[id].config = { theme: f.theme, childName: f.childName, ...(f.age ? { age: f.age } : {}), spots: f.spots }));
    } else {
      const parsed = await parse.parseOrder({ personalization: order.personalization, options: order.options });
      if (!parsed.ok) throw new Error(parsed.problem);
      store.update((s) => (s.orders[id].config = { ...parsed.config, theme: f.theme }));
    }
    await generate(id);
    await sendHuntEmail(store.get().orders[id]);
    store.update((s) => Object.assign(s.orders[id], { sent: true, deliveredAt: new Date().toISOString() }));
  } catch (err) {
    store.update((s) => Object.assign(s.orders[id], { status: 'needs_attention', problem: err.message }));
  }
  await notify(store.get().orders[id]);
}

module.exports = { addOrder, processOrder, generate, pollEtsy, validateWebForm, addWebOrder, fulfillWebOrder };
