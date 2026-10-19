// Stripe Checkout for orders placed on the website.

const Stripe = require('stripe');
const THEMES = require('../generator/themes');
const { kitForHunt, KITS } = require('../kits/engine');
const { HOLIDAYS, craftLabel } = require('../crafts/build');

const products = require('./products');
const { PRICES, priceFor } = products;
const PRICE_CENTS = PRICES.hunt; // custom hunt only
const BUNDLE_PRICE_CENTS = PRICES.bundle; // hunt + matching play kit + party pack
const PARTY_PRICE_CENTS = PRICES.party; // party pack only
let client = null;
const stripe = () => (client ||= new Stripe(process.env.STRIPE_SECRET_KEY));

const enabled = () => Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);

async function createCheckout(order) {
  const theme = THEMES[order.form.theme];
  const items = products.itemsOf(order.form);
  const kit = KITS[order.form.kit] || (theme && kitForHunt(theme.id));
  const holiday = HOLIDAYS[order.form.holiday];
  const parts = { hunt: `Custom ${theme?.name}`, kit: `${kit?.name} play kit`, party: `${theme?.label} party pack`, craft: craftLabel(holiday) };
  const details = {
    hunt: `scavenger hunt with ${order.form.spots.length} clues`,
    kit: 'pretend play kit',
    party: 'invitations, toppers, tags, banner and more',
    craft: holiday?.book ? 'A handprint page for every month, a cover and a “look how I’ve grown” page' : '8 handprint and footprint keepsake crafts, cards and a poem page',
  };
  const session = await stripe().checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: priceFor(HOLIDAYS[order.form.holiday]?.book ? 'book' : order.form.product),
          product_data: {
            name: items.length === 3 ? `Party Bundle: ${items.map((i) => parts[i]).join(' + ')}` : items.map((i) => parts[i]).join(' + '),
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

// Verifies Stripe's signature; throws if the request didn't come from Stripe.
function readWebhook(rawBody, signature) {
  return stripe().webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
}

module.exports = { enabled, createCheckout, readWebhook, stripe, PRICES, PRICE_CENTS, BUNDLE_PRICE_CENTS, PARTY_PRICE_CENTS, priceFor };
