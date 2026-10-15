// Stripe Checkout for orders placed on the website.

const Stripe = require('stripe');
const THEMES = require('../generator/themes');
const { kitForHunt } = require('../kits/engine');

const PRICE_CENTS = Number(process.env.PRICE_CENTS || 999); // custom hunt only
const BUNDLE_PRICE_CENTS = Number(process.env.BUNDLE_PRICE_CENTS || 1699); // hunt + matching play kit + party pack
const PARTY_PRICE_CENTS = Number(process.env.PARTY_PRICE_CENTS || 699); // party pack only
const priceFor = (product) => ({ bundle: BUNDLE_PRICE_CENTS, party: PARTY_PRICE_CENTS })[product] || PRICE_CENTS;
let client = null;
const stripe = () => (client ||= new Stripe(process.env.STRIPE_SECRET_KEY));

const enabled = () => Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);

async function createCheckout(order) {
  const theme = THEMES[order.form.theme];
  const bundle = order.form.product === 'bundle';
  const session = await stripe().checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: priceFor(order.form.product),
          product_data: {
            name: order.form.product === 'party'
              ? `${theme.label} Party Pack`
              : bundle ? `Party Bundle: ${theme.name} + ${kitForHunt(theme.id).name} play kit + party pack` : `Custom ${theme.name}`,
            description: order.form.product === 'party'
              ? `Printable invitations, toppers, tags, banner and more for ${order.form.childName} · PDF`
              : `Printable scavenger hunt for ${order.form.childName} · ${order.form.spots.length} clues${bundle ? ' · matching pretend play kit · party printables' : ''} · PDF`,
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

module.exports = { enabled, createCheckout, readWebhook, stripe, PRICE_CENTS, BUNDLE_PRICE_CENTS, PARTY_PRICE_CENTS, priceFor };
