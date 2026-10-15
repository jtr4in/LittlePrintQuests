// What a customer can buy: any mix of the hunt, its matching play kit and the party pack.
// An order's items decide which PDFs get built; the first one is the main download
// (/d/<token>.pdf) and the others get -kit / -party suffixes.

const ITEMS = ['hunt', 'kit', 'party'];
const LEGACY = { bundle: ['hunt', 'kit', 'party'], hunt: ['hunt'], party: ['party'], kit: ['kit'] };

const cents = (key, fallback) => Number(process.env[key] || fallback);
// Each item alone, every pair, and all three (the Party Bundle).
const PRICES = {
  hunt: cents('PRICE_CENTS', 999),
  kit: cents('KIT_PRICE_CENTS', 799),
  party: cents('PARTY_PRICE_CENTS', 699),
  'hunt+kit': cents('HUNT_KIT_PRICE_CENTS', 1499),
  'hunt+party': cents('HUNT_PARTY_PRICE_CENTS', 1399),
  'kit+party': cents('KIT_PARTY_PRICE_CENTS', 1299),
  bundle: cents('BUNDLE_PRICE_CENTS', 1699),
};

// Cleans a list of items into the fixed order; unknown ones are dropped.
const normalize = (items) => ITEMS.filter((i) => (items || []).includes(i));
const productFor = (items) => (items.length === 3 ? 'bundle' : items.join('+'));
const itemsOf = (order) => normalize(order.items || LEGACY[order.product] || ['hunt']);
const has = (order, item) => itemsOf(order).includes(item);
const mainOf = (order) => itemsOf(order)[0];
const priceFor = (product) => PRICES[product] ?? PRICES.hunt;

const NAMES = { hunt: 'scavenger hunt', kit: 'play kit', party: 'party pack' };
// "scavenger hunt, play kit and party pack"
function describe(items) {
  const names = items.map((i) => NAMES[i]);
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0];
}

// The Etsy-style Package option shown on the dashboard.
const packageName = (items) =>
  items.length === 3 ? 'Hunt + Play Kit + Party Pack' : items.map((i) => ({ hunt: 'Hunt', kit: 'Play Kit', party: 'Party Pack' })[i]).join(' + ') + (items.length === 1 && items[0] === 'hunt' ? ' only' : '');

// What Host Mode does for this order, as the end of "Host Mode ...", for emails and messages.
function hostHelps(order) {
  const helps = [
    has(order, 'hunt') && 'walks you through hiding each card and running the hunt, with lines to say, hints and a secret role for a second grown-up',
    has(order, 'kit') && 'has pretend-play scenarios, things to say and games for the play kit',
    has(order, 'party') && 'keeps a party-planning checklist, from the invitations to the thank-you cards',
  ].filter(Boolean);
  return helps.length > 1 ? `${helps.slice(0, -1).join(', ')}, and ${helps[helps.length - 1]}` : helps[0];
}

module.exports = { hostHelps, ITEMS, PRICES, normalize, productFor, itemsOf, has, mainOf, priceFor, describe, packageName, NAMES };
