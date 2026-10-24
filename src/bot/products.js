// What a customer can buy: any mix of the hunt, its matching pretend play kit, the activity pack
// and the party pack, or a holiday handprint art pack (always on its own).
// An order's items decide which PDFs get built; the first one is the main download
// (/d/<token>.pdf) and the others get -kit / -activities / -party suffixes.

const ITEMS = ['hunt', 'kit', 'activity', 'party', 'craft'];
const LEGACY = { bundle: ['hunt', 'kit', 'party'], hunt: ['hunt'], party: ['party'], kit: ['kit'], craft: ['craft'] };

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
  activity: cents('ACTIVITY_PRICE_CENTS', 499), // the activity pack on its own
  activityAdd: cents('ACTIVITY_ADD_CENTS', 300), // added to anything else
  craft: cents('CRAFT_PRICE_CENTS', 599),
  pass: cents('PASS_PRICE_CENTS', 3999), // the Family Pass: 6 orders within a year
  book: cents('BOOK_PRICE_CENTS', 799), // a handprint book (memory, zoo, fingerprint), a craft order
};

// Cleans a list of items into the fixed order; unknown ones are dropped.
const normalize = (items) => ITEMS.filter((i) => (items || []).includes(i));
// The hunt, kit and party mixes keep their names ("bundle" is all three); the activity pack adds
// "+activity", so the hunt, kit and activity pack together is "hunt+kit+activity".
function productFor(items) {
  const rest = items.filter((i) => i !== 'activity');
  const base = rest.length === 3 ? 'bundle' : rest.join('+');
  return items.includes('activity') ? (base ? `${base}+activity` : 'activity') : base;
}
const itemsOf = (order) => normalize(order.items || LEGACY[order.product] || ['hunt']);
const has = (order, item) => itemsOf(order).includes(item);
const mainOf = (order) => itemsOf(order)[0];
function priceFor(product) {
  if (product !== 'activity' && String(product).endsWith('+activity')) return priceFor(product.slice(0, -9)) + PRICES.activityAdd;
  return PRICES[product] ?? PRICES.hunt;
}

const NAMES = { hunt: 'scavenger hunt', kit: 'pretend play kit', activity: 'activity pack', party: 'party pack', craft: 'handprint art pack' };
// "scavenger hunt, play kit and party pack"
function describe(items) {
  const names = items.map((i) => NAMES[i]);
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0];
}

// The Etsy-style Package option shown on the dashboard.
const packageName = (items) =>
  items.map((i) => ({ hunt: 'Hunt', kit: 'Play Kit', activity: 'Activity Pack', party: 'Party Pack', craft: 'Handprint Art' })[i]).join(' + ') + (items.length === 1 && items[0] === 'hunt' ? ' only' : '');

// What a paid website order can still add after checkout, and for how much: the rest of the
// everything bundle at the bundle price, minus what they already paid. Only items that come after
// the main one, so the main download stays the same file. Shop kits have no party pack, handprint
// art has no add-ons, and Family Pass orders can already make the whole bundle.
const ALONE = { kit: 'kit', activity: 'activity', party: 'party' };
function upgradeFor(order) {
  if (order.source !== 'web' || order.status !== 'ready' || order.paidWith === 'pass') return null;
  const items = itemsOf(order);
  const main = items[0];
  if (main === 'craft') return null;
  const themed = Boolean(order.config?.theme || order.form?.theme);
  const add = ITEMS.slice(ITEMS.indexOf(main) + 1).filter((i) => ALONE[i] && !items.includes(i) && (themed || i === 'activity'));
  if (!add.length) return null;
  // Orders taken with a 100%-off code before Oct 23, 2026 saved paidCents as 0; price those at list too.
  const paid = order.paidCents || priceFor(order.product || productFor(items));
  const cents = priceFor(productFor(normalize([...items, ...add]))) - paid;
  if (cents <= 0) return null;
  const worth = add.reduce((n, i) => n + PRICES[ALONE[i]], 0);
  return { add, cents, worth };
}

// The age version picked for a play kit, activity pack or hunt.
const VERSIONS = { little: 'Little kids, ages 3 to 5', big: 'Big kids, ages 6 to 8' };
// The labels before 2026-10-23, when the split was 2 to 4 and 5 to 8: older orders still carry them.
const OLD_VERSIONS = { little: 'Little kids, ages 2 to 4', big: 'Big kids, ages 5 to 8' };
const versionOf = (label) => Object.keys(VERSIONS).find((k) => VERSIONS[k] === label || OLD_VERSIONS[k] === label);

// What Field Kit does for this order, as the end of "Field Kit ...", for emails and messages.
function hostHelps(order) {
  const helps = [
    has(order, 'hunt') && 'walks you through hiding each card and running the hunt, with lines to say, hints and a secret role for a second grown-up',
    has(order, 'kit') && 'has pretend-play scenarios, things to say and games for the play kit',
    has(order, 'party') && 'keeps a party-planning checklist, from the invitations to the thank-you cards',
  ].filter(Boolean);
  return helps.length > 1 ? `${helps.slice(0, -1).join(', ')}, and ${helps[helps.length - 1]}` : helps[0];
}

module.exports = { upgradeFor, VERSIONS, versionOf, hostHelps, ITEMS, PRICES, normalize, productFor, itemsOf, has, mainOf, priceFor, describe, packageName, NAMES };
