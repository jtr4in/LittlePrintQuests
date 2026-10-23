// Stripe Checkout for orders placed on the website. Order and add-on pages take promotion codes
// (made in the Stripe dashboard); the Family Pass page does not.

const Stripe = require('stripe');
const THEMES = require('../generator/themes');
const { kitForHunt, KITS } = require('../kits/engine');
const { HOLIDAYS, craftLabel } = require('../crafts/build');

const products = require('./products');
const { PRICES, priceFor } = products;
const PRICE_CENTS = PRICES.hunt; // scavenger hunts only
const BUNDLE_PRICE_CENTS = PRICES.bundle; // hunt + matching play kit + party pack
const PARTY_PRICE_CENTS = PRICES.party; // party pack only
let client = null;
const stripe = () => (client ||= new Stripe(process.env.STRIPE_SECRET_KEY));

const enabled = () => Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);

// A finished checkout we should deliver. A 100%-off promotion code makes the total $0, and then
// Stripe reports 'no_payment_required' instead of 'paid'.
const isPaid = (session) => ['paid', 'no_payment_required'].includes(session?.payment_status);

// How much a promotion code took off, before tax (0 when no code was used). Kept apart from
// paidCents, which stays at the list price so add-ons still cost the bundle difference.
const discountCents = (session) => Math.max(0, session?.total_details?.amount_discount || 0);

// Opens a Checkout page with the promotion code box. If this Stripe account won't take the box,
// open it without one rather than losing the sale.
async function createWithPromo(params) {
  try {
    return await stripe().checkout.sessions.create({ ...params, allow_promotion_codes: true });
  } catch (err) {
    if (!/promotion/i.test(err.message || '')) throw err;
    console.error('Stripe refused promotion codes, opening checkout without them:', err.message);
    return stripe().checkout.sessions.create(params);
  }
}

async function createCheckout(order) {
  const theme = THEMES[order.form.theme];
  const items = products.itemsOf(order.form);
  const kit = KITS[order.form.kit] || (theme && kitForHunt(theme.id));
  const holiday = HOLIDAYS[order.form.holiday];
  const parts = { hunt: `${theme?.label} Scavenger Hunts`, kit: `${kit?.name} pretend play`, activity: `${kit?.name} activity pack`, party: `${theme?.label} party pack`, craft: craftLabel(holiday) };
  const details = {
    hunt: `scavenger hunt with ${order.form.spots.length} clues`,
    kit: 'pretend play',
    activity: 'Wipe & Play activity pages',
    party: 'invitations, toppers, tags, banner and more',
    craft: holiday?.book ? holiday.checkoutLine : '8 handprint and footprint keepsake crafts, cards and a poem page',
  };
  const session = await createWithPromo({
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: priceFor(HOLIDAYS[order.form.holiday]?.book ? 'book' : order.form.product),
          product_data: {
            // Stripe Managed Payments needs a tax category on every product. The default is
            // "General - Electronically Supplied Services"; set STRIPE_TAX_CODE to use another.
            tax_code: process.env.STRIPE_TAX_CODE || 'txcd_10000000',
            name: items.length >= 3 ? `${items.length === 4 ? 'Everything Bundle' : 'Bundle'}: ${items.map((i) => parts[i]).join(' + ')}` : items.map((i) => parts[i]).join(' + '),
            description: `Printable ${items.map((i) => details[i]).join(' · ')} for ${order.form.childName} · PDF`,
          },
        },
      },
    ],
    client_reference_id: order.id,
    metadata: { order_id: order.id },
    success_url: `${process.env.PUBLIC_URL}/order/${order.id}`,
    cancel_url: `${process.env.SITE_URL || process.env.PUBLIC_URL}#order`,
  });
  return session;
}

// The add-ons offered after checkout (products.upgradeFor), for an order that's already paid.
async function createUpgradeCheckout(order, upgrade) {
  const theme = THEMES[order.config.theme];
  const kit = KITS[order.config.kit] || (theme && kitForHunt(theme.id));
  const parts = { kit: `${kit?.name} pretend play`, activity: `${kit?.name} activity pack`, party: `${theme?.label} party pack` };
  return createWithPromo({
    mode: 'payment',
    customer_email: order.email || undefined,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: 'usd',
        unit_amount: upgrade.cents,
        product_data: {
          tax_code: process.env.STRIPE_TAX_CODE || 'txcd_10000000',
          name: `Add to your order: ${upgrade.add.map((i) => parts[i]).join(' + ')}`,
          description: `Printable PDF for ${order.config.childName}, added to the order you already have`,
        },
      },
    }],
    client_reference_id: order.id,
    metadata: { upgrade_of: order.id, add: upgrade.add.join(','), cents: String(upgrade.cents) },
    success_url: `${process.env.PUBLIC_URL}/order/${order.id}`,
    cancel_url: `${process.env.PUBLIC_URL}/order/${order.id}`,
  });
}

// Verifies Stripe's signature; throws if the request didn't come from Stripe.
function readWebhook(rawBody, signature) {
  return stripe().webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
}

// The Family Pass is one payment, no subscription.
async function createPassCheckout(pass) {
  return stripe().checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      quantity: 1,
      price_data: {
        currency: 'usd',
        unit_amount: PRICES.pass,
        product_data: {
          tax_code: process.env.STRIPE_TAX_CODE || 'txcd_10000000',
          name: 'Family Pass: 6 everything bundles',
          description: `${pass.total} printable orders (hunt, play kit, activity pack and party pack) to use within a year · PDF · no subscription`,
        },
      },
    }],
    client_reference_id: pass.id,
    metadata: { pass_id: pass.id },
    success_url: `${process.env.PUBLIC_URL}/pass/${pass.id}`,
    cancel_url: `${process.env.SITE_URL || process.env.PUBLIC_URL}#pass`,
  });
}

module.exports = { enabled, isPaid, discountCents, createCheckout, createPassCheckout, createUpgradeCheckout, readWebhook, stripe, PRICES, PRICE_CENTS, BUNDLE_PRICE_CENTS, PARTY_PRICE_CENTS, priceFor };
