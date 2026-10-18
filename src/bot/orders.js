// Order pipelines. Etsy: receipt -> parsed hunt config -> PDF -> ready-to-send message.
// Website: form -> Stripe payment -> PDF -> emailed to the buyer.
// An order can hold any mix of the hunt, its play kit and the party pack (see products.js).

const crypto = require('crypto');
const path = require('path');
const store = require('./store');
const etsy = require('./etsy');
const parse = require('./parse');
const { renderPdf } = require('../generator/render');
const { sendHuntEmail } = require('./email');
const { renderKit } = require('../kits/render-kit');
const { renderParty } = require('../party/render-party');
const { renderCraft } = require('../crafts/render-craft');
const { HOLIDAYS } = require('../crafts/build');
const { kitForHunt, KITS } = require('../kits/engine');
const THEMES = require('../generator/themes');
const SPOTS = require('../generator/spots');
const products = require('./products');
const listings = require('./listings');

const CUSTOM_LISTING_IDS = (process.env.CUSTOM_LISTING_IDS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// A transaction needs a custom hunt if it's on a listed custom listing, or
// (when no listing ids are configured) if the buyer filled in personalization.
function customRequest(tx) {
  const variations = tx.variations || [];
  const personal = variations.filter((v) => v.question_id || /personali[sz]/i.test(v.formatted_name || ''));
  // Listings the bot made itself are known by id, so their orders need no listing id settings.
  const made = listings.forListingId(tx.listing_id);
  const isCustom = made ? Boolean(made.personalization)
    : CUSTOM_LISTING_IDS.length ? CUSTOM_LISTING_IDS.includes(String(tx.listing_id)) : personal.length > 0;
  if (!isCustom) return null;
  const options = Object.fromEntries(variations.filter((v) => !personal.includes(v)).map((v) => [v.formatted_name, v.formatted_value]));
  const personalization = personal.map((v) => v.formatted_value).join('\n');
  // A single-theme play kit or party pack listing has no dropdown: its theme comes with the listing.
  if (made?.order?.product === 'kit') return { personalization, options, product: 'kit', kit: made.order.kit };
  if (made?.order?.product === 'craft') return { personalization, options, product: 'craft', holiday: made.order.holiday };
  if (made?.order?.product === 'party') return { personalization, options: { ...options, Theme: THEMES[made.order.theme].label }, product: 'party' };
  // The play kit listing has a "Kit" option naming the kit.
  const kit = Object.values(KITS).find((k) => Object.values(options).some((v) => v.toLowerCase() === k.name.toLowerCase()));
  if (kit) return { personalization, options, product: 'kit', kit: kit.id };
  // The bundle listing has a "Package" option ("Hunt + Party Pack", "Hunt only"…): the hunt plus
  // whatever else it names. Without one, go by the listing title.
  const pkg = options.Package;
  if (pkg) {
    const items = products.normalize(['hunt', /play kit|bundle/i.test(pkg) && 'kit', /party|bundle/i.test(pkg) && 'party']);
    return { personalization, options, product: products.productFor(items), items };
  }
  const holiday = /handprint/i.test(tx.title || '') && Object.values(HOLIDAYS).find((h) => new RegExp(h.name, 'i').test(tx.title));
  if (holiday) return { personalization, options, product: 'craft', holiday: holiday.id };
  if (/party (pack|printables)/i.test(tx.title || '') && !/bundle|play kit/i.test(tx.title || '')) return { personalization, options, product: 'party' };
  return { personalization, options, product: /bundle|play kit/i.test(tx.title || '') ? 'bundle' : 'hunt' };
}

const newToken = () => crypto.randomBytes(18).toString('base64url');
const hostUrl = (order) => `${process.env.PUBLIC_URL}/h/${order.hostToken}`;

// The kit an order's play kit uses: named by an Etsy kit order, else the theme's match.
const kitOf = (order) => KITS[order.config.kit] || kitForHunt(order.config.theme);

function buyerMessage(order) {
  const first = (order.buyerName || '').split(' ')[0] || 'there';
  const main = products.mainOf(order);
  const base = `${process.env.PUBLIC_URL}/d/${order.downloadToken}`;
  const theme = THEMES[order.config.theme];
  const title = {
    hunt: () => `custom ${theme.name}`,
    kit: () => `${kitOf(order).name} play kit`,
    party: () => `${theme.label} party pack`,
    craft: () => `${HOLIDAYS[order.config.holiday].name} handprint art pack`,
  }[main]();
  const host = order.hostToken
    ? `\n${products.has(order, 'hunt') ? 'On party day, open' : 'Open'} Host Mode on your phone. It ${products.hostHelps(order)}:\n\n${hostUrl(order)}\n`
    : '';
  const extras =
    (order.kitReady ? `\nAnd here's the matching ${kitOf(order).name} play kit:\n\n${base}-kit.pdf\n` : '') +
    (order.partyReady ? `\nAnd your party printables (invitations, toppers, tags, banner and more):\n\n${base}-party.pdf\n` : '');
  const tips = {
    hunt: 'Print at "Actual Size / 100%", cut out the clue cards, and use the Host Guide on page 1 to hide them. Have an amazing party! 🎉',
    kit: 'Print at "Actual Size / 100%" and start with the grown-up guide on page 1. Have fun! 🎉',
    party: 'Print at "Actual Size / 100%". Invitations, toppers and the banner look best on cardstock. Have an amazing party! 🎉',
    craft: 'Print the keepsake pages on white cardstock at "Actual Size / 100%" and start with the tips on page 1. Washable paint and a baby wipe nearby help a lot. Have fun! 🎨',
  }[main];
  return `Hi ${first}! Your ${title} for ${order.config.childName} is ready. Download your printable PDF here:

${base}.pdf
${extras}${host}
${tips}`;
}

async function generate(id) {
  const order = store.get().orders[id];
  const token = order.downloadToken || crypto.randomBytes(18).toString('base64url');
  // Every order gets Host Mode, a private phone page with a tab for each thing in it.
  // Hunts also get a second link for a helper (the sidekick). Handprint art needs no Host Mode.
  const main = products.mainOf(order);
  const hostTokens = main === 'craft' ? {} : { hostToken: order.hostToken || newToken(), ...(products.has(order, 'hunt') ? { sidekickToken: order.sidekickToken || newToken() } : {}) };
  const out = (suffix = '') => path.join(store.PDF_DIR, `${token}${suffix}.pdf`);
  if (main === 'craft') await renderCraft(order.config, out());
  else if (main === 'kit') await renderKit(order.config, out());
  else if (main === 'party') await renderParty(order.config, out());
  else await renderPdf(order.config, out());
  const kit = main !== 'kit' && products.has(order, 'kit') ? kitOf(order) : null;
  const party = main !== 'party' && products.has(order, 'party');
  if (kit) await renderKit(kitConfig(order, kit), out('-kit'));
  if (party) await renderParty(partyConfig(order), out('-party'));
  store.update((s) => {
    Object.assign(s.orders[id], hostTokens, { downloadToken: token, kitReady: Boolean(kit), partyReady: party, status: 'ready', problem: null, generatedAt: new Date().toISOString() });
    s.orders[id].message = buyerMessage(s.orders[id]);
  });
}

function partyConfig(order) {
  const { theme, childName, age } = order.config;
  return { theme, childName, ...(age ? { age } : {}), ...(order.party ? { party: order.party } : {}) };
}

function kitConfig(order, kit) {
  // The kit's age version (little kids or 5 and up) follows the child's age.
  return { kit: kit.id, childName: order.config.childName, ...(order.config.age ? { age: order.config.age } : {}), subjects: order.pets || [], lenient: true, withHunt: products.has(order, 'hunt') };
}

// Parses and builds one order. Never throws: failures become "needs attention".
async function processOrder(id) {
  const order = store.get().orders[id];
  try {
    const parsed = order.product === 'craft'
      ? await parse.parseCraftOrder({ personalization: order.personalization, holiday: order.holiday })
      : order.product === 'kit'
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
        Title: ready ? `${{ kit: 'Play kit', party: 'Party pack', craft: 'Handprint art' }[products.mainOf(order)] || 'Hunt'} ready for ${order.config.childName}` : 'Order needs a look',
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
  // A handprint art pack is its own thing: just a holiday and the child's name and age.
  if (body.craft !== undefined) {
    const holiday = HOLIDAYS[body.craft] ? body.craft : null;
    if (!holiday) throw new Error('Please pick Halloween or Christmas.');
    const childName = String(body.childName || '').trim().slice(0, 24);
    if (!childName) throw new Error('Please add your child’s first name.');
    const age = Number.isInteger(body.age) && body.age > 0 && body.age < 16 ? body.age : null;
    return { items: ['craft'], product: 'craft', holiday, theme: null, childName, age, spots: [], pets: [], party: null };
  }
  // A shop kit (pizza, library...) has no hunt or party theme, so it is ordered on its own.
  const shopKit = KITS[body.kit] && !KITS[body.kit].hunt ? KITS[body.kit].id : null;
  const theme = shopKit ? null : String(body.theme || '');
  if (!shopKit && !THEMES[theme]) throw new Error('Please pick a theme.');
  const childName = String(body.childName || '').trim().slice(0, 24);
  if (!childName) throw new Error('Please add your child’s first name.');
  const age = Number.isInteger(body.age) && body.age > 0 && body.age < 16 ? body.age : null;
  // Newer forms send items; older ones send a product name.
  const items = shopKit ? ['kit'] : products.normalize(Array.isArray(body.items) ? body.items : products.itemsOf({ product: body.product === 'bundle' || body.product === 'party' ? body.product : 'hunt' }));
  if (!items.length) throw new Error('Please pick the hunt, the play kit or the party pack.');
  const pets = (Array.isArray(body.pets) ? body.pets : []).slice(0, 6)
    .map((p) => ({ name: String(p?.name || '').trim().slice(0, 20), kind: String(p?.kind || '').trim().slice(0, 20) }))
    .filter((p) => p.name || p.kind);
  const form = { items, product: products.productFor(items), theme, ...(shopKit ? { kit: shopKit } : {}), childName, age, spots: [], pets, party: items.includes('party') ? cleanParty(body.party) : null };
  if (!items.includes('hunt')) return form;
  const spots = Array.isArray(body.spots) ? body.spots : [];
  if (spots.length < 3 || spots.length > 12) throw new Error('Please pick between 3 and 12 hiding spots.');
  form.spots = spots.map((s) => {
    if (typeof s === 'string' && SPOTS[s]) return s;
    const label = String(s?.custom || '').trim().slice(0, 40);
    if (!label) throw new Error('One of the hiding spots is empty.');
    return { custom: label };
  });
  return form;
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
    items: form.items,
    pets: form.pets,
    party: form.party,
    form,
    personalization: formAsText(form),
    options: form.holiday ? { Holiday: HOLIDAYS[form.holiday].name } : { Theme: form.kit ? KITS[form.kit].name : THEMES[form.theme].name, Package: products.packageName(form.items) },
  });
}

function formAsText(f) {
  if (f.holiday) return `${f.childName}${f.age ? `, age ${f.age}` : ''}. ${HOLIDAYS[f.holiday].name} handprint art pack.`;
  if (!products.has(f, 'hunt')) return `${f.childName}${f.age ? `, turning ${f.age}` : ''}. ${products.describe(products.itemsOf(f))}.`;
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
    const main = products.mainOf(order);
    if (main === 'craft') {
      store.update((s) => (s.orders[id].config = { holiday: f.holiday, childName: f.childName, ...(f.age ? { age: f.age } : {}) }));
    } else if (main === 'kit') {
      store.update((s) => (s.orders[id].config = { kit: f.kit || kitForHunt(f.theme).id, ...(f.theme ? { theme: f.theme } : {}), childName: f.childName, ...(f.age ? { age: f.age } : {}), subjects: f.pets || [], lenient: true }));
    } else if (main === 'party') {
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
    try {
      await sendHuntEmail(store.get().orders[id]);
      store.update((s) => Object.assign(s.orders[id], { sent: true, deliveredAt: new Date().toISOString() }));
    } catch (err) {
      // The buyer can still download it from their order page, so the order stays ready.
      store.update((s) => (s.orders[id].problem = `Not emailed (${err.message}). The buyer can download it from their order page.`));
    }
  } catch (err) {
    store.update((s) => Object.assign(s.orders[id], { status: 'needs_attention', problem: err.message }));
  }
  await notify(store.get().orders[id]);
}

module.exports = { customRequest, hostUrl, addOrder, processOrder, generate, pollEtsy, validateWebForm, addWebOrder, fulfillWebOrder };
