// Creates the shop's Etsy listings as drafts: one pack per theme, the custom Party Bundle,
// the play kit and the party pack (each with a theme dropdown, and again as one listing per theme). Titles, descriptions and tags come from etsy-listings.md; prices,
// photos, files and variations are set here.

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const store = require('./store');
const etsy = require('./etsy');
const { renderPdf, renderHtml } = require('../generator/render');
const THEMES = require('../generator/themes');
const { KITS } = require('../kits/engine');
const { flavorFor } = require('../party/flavor');

const ROOT = path.join(__dirname, '..', '..');
const ASSETS = path.join(ROOT, 'listing-assets');
const DOC = path.join(ROOT, 'etsy-listings.md');

const PACK_SPOTS = ['couch', 'fridge', 'bed', 'bathtub', 'bookshelf', 'front_door', 'toy_box', 'kitchen_table'];
const PACK_PROMO = 'Want a hunt with your child’s name and your own hiding spots? Order a Custom Hunt from our Etsy shop.';
const KIT_ORDER = ['vet', 'space', 'dino', 'hero', 'pirate', 'royal', 'unicorn', 'mermaid', 'construction', 'easter', 'halloween', 'christmas', 'valentine', 'fire', 'ice', 'racecar'];
// etsy-listings.md section for each theme's pack (the newer themes come after the bundle, kit and party pack).
const PACK_SECTIONS = { dino: 1, hero: 2, pirate: 3, space: 4, royal: 5, unicorn: 9, mermaid: 10, construction: 11, vet: 12, easter: 15, halloween: 16, christmas: 17, valentine: 18, fire: 19, ice: 20, racecar: 21 };

// Etsy takes up to 10 photos per listing.
const MAX_PHOTOS = 10;

const CATALOG = [
  ...Object.keys(THEMES).map((theme) => ({
    key: `pack-${theme}`,
    section: PACK_SECTIONS[theme],
    shopSection: 'Scavenger Hunt Packs',
    label: `${THEMES[theme].name} pack`,
    price: 8.0,
    photos: [`hunt-${theme}.jpg`, ...['inside', 'cards', 'how', 'finish'].map((k) => `pack-${theme}-${k}.jpg`)],
    file: { name: `${theme}-scavenger-hunt.pdf`, build: (out) => renderPdf({ theme, spots: PACK_SPOTS, pictures: true, promo: PACK_PROMO }, out) },
  })),
  {
    key: 'bundle',
    section: 6,
    shopSection: 'Custom Party Bundles',
    label: 'Custom Party Bundle',
    price: 16.99,
    variation: { name: 'Package', options: [
      { value: 'Hunt + Play Kit + Party Pack', price: 16.99 },
      { value: 'Hunt + Play Kit', price: 14.99 },
      { value: 'Hunt + Party Pack', price: 13.99 },
      { value: 'Hunt only', price: 9.99 },
    ] },
    personalization: { question: 'Name, age, theme, spots and pets' },
    photos: ['bundle-main.jpg', 'bundle-host.jpg', 'party-main.jpg', 'hunt-space.jpg', ...['unicorn', 'dino', 'mermaid', 'hero', 'construction', 'pirate'].map((k) => `kit-${k}.jpg`)],
    file: { name: 'your-custom-party-bundle.pdf', build: (out) => thankYouPdf(out, 'party bundle') },
  },
  {
    key: 'kits',
    section: 7,
    shopSection: 'Pretend Play Kits',
    label: 'Pretend Play Kit',
    price: 7.99,
    variation: { name: 'Kit', options: KIT_ORDER.map((k) => ({ value: KITS[k].name, price: 7.99 })) },
    personalization: { question: 'Child’s name and pets or toys' },
    photos: ['kits-main.jpg', ...KIT_ORDER.map((k) => `kit-${k}.jpg`)].slice(0, MAX_PHOTOS),
    file: { name: 'your-pretend-play-kit.pdf', build: (out) => thankYouPdf(out, 'play kit') },
  },
  {
    key: 'party',
    section: 8,
    shopSection: 'Party Printables',
    label: 'Party Pack',
    price: 6.99,
    variation: { name: 'Theme', options: Object.values(THEMES).map((t) => ({ value: t.label, price: 6.99 })) },
    personalization: { question: 'Child’s name and age' },
    photos: ['party-main.jpg', ...Object.keys(THEMES).map((k) => `party-${k}.jpg`)].slice(0, MAX_PHOTOS),
    file: { name: 'your-party-printables.pdf', build: (out) => thankYouPdf(out, 'party printables') },
  },
  // One play kit and one party pack listing per theme as well, so each shows up in its own searches.
  ...KIT_ORDER.map((k) => ({
    key: `kit-${k}`,
    section: 13,
    perTheme: k,
    shopSection: 'Pretend Play Kits',
    label: `${KITS[k].name} play kit`,
    price: 7.99,
    order: { product: 'kit', kit: k },
    personalization: { question: 'Child’s name and pets or toys' },
    photos: [`kit-${k}.jpg`, `kit-${k}-inside.jpg`, `kit-${k}-feature.jpg`],
    file: { name: 'your-pretend-play-kit.pdf', build: (out) => thankYouPdf(out, 'play kit') },
  })),
  ...Object.keys(THEMES).map((theme) => ({
    key: `party-${theme}`,
    section: 14,
    perTheme: theme,
    shopSection: 'Party Printables',
    label: `${THEMES[theme].label} party pack`,
    price: 6.99,
    order: { product: 'party', theme },
    personalization: { question: 'Child’s name and age' },
    photos: [`party-${theme}.jpg`, `party-${theme}-inside.jpg`, `party-${theme}-feature.jpg`],
    file: { name: 'your-party-printables.pdf', build: (out) => thankYouPdf(out, 'party printables') },
  })),
];

// The catalog entry for an Etsy listing the bot made, if it made it.
function forListingId(listingId) {
  const made = store.get().listings || {};
  return CATALOG.find((c) => made[c.key]?.id && String(made[c.key].id) === String(listingId)) || null;
}

// ---------- reading etsy-listings.md ----------

function sections(md) {
  const out = {};
  for (const part of md.split(/^## /m).slice(1)) {
    const m = part.match(/^(\d+)\. /);
    if (m) out[m[1]] = part;
  }
  return out;
}

const lineAfter = (text, label) => text.match(new RegExp(`\\*\\*${label}[^*]*\\*\\*\\s*\\n(.+)`))?.[1].trim();
const blockAfter = (text, label) => text.match(new RegExp(`${label}[\\s\\S]*?\\n\`\`\`\\n([\\s\\S]*?)\\n\`\`\``))?.[1].trim();

const fill = (text, values) => text && text.replace(/\{(\w+)\}/g, (m, k) => values[k] ?? m);
const list = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}` : items[0]);

// What a per-theme description template can say about its kit or theme.
function placeholders(c) {
  if (c.order.product === 'kit') {
    const k = KITS[c.perTheme];
    return {
      kit: k.name, place: k.placeName('[Name]’s'), toys: k.toys.map((t) => t.inside).join('\n• '), subjects: k.subjectPlural,
      props: list(Object.values(k.props).map((p) => p.title)), hunt: THEMES[k.hunt].name,
    };
  }
  const t = THEMES[c.perTheme];
  const f = flavorFor(t);
  return { theme: t.label, party: f.party, foods: list(f.foods), hunt: t.name };
}

// Title, description, tags and personalization instructions for every catalog listing.
function readCopy(md = fs.readFileSync(DOC, 'utf8')) {
  const all = sections(md);
  const shared = blockAfter(md, '## Shared description');
  return CATALOG.map((c) => {
    const s = all[c.section];
    if (!s) throw new Error(`etsy-listings.md has no section ${c.section} (${c.label})`);
    // Per-theme listings share a description template; each theme has a "### id" part with its
    // own title, opening line and tags.
    const own = c.perTheme ? s.split(/^### /m).find((part) => part.startsWith(`${c.perTheme}\n`)) : s;
    if (!own) throw new Error(`etsy-listings.md section ${c.section} has no "### ${c.perTheme}" part (${c.label})`);
    const opening = lineAfter(own, 'Opening line');
    const description = c.perTheme
      ? fill(blockAfter(s, '\\*\\*Description template\\*\\*'), { opening, ...placeholders(c) })
      : opening ? `${opening}\n\n${shared}` : blockAfter(s, '\\*\\*Description\\*\\*');
    const listing = {
      ...c,
      title: lineAfter(own, 'Title'),
      description,
      tags: (lineAfter(own, 'Tags') || '').split(',').map((t) => t.trim()).filter(Boolean),
      instructions: c.personalization ? blockAfter(s, 'Instructions to buyer') : null,
    };
    const problems = [];
    if (!listing.title || listing.title.length > 140) problems.push('title missing or over 140 characters');
    if (!listing.description) problems.push('description missing');
    if (listing.tags.length > 13 || listing.tags.some((t) => t.length > 20)) problems.push('more than 13 tags, or a tag over 20 characters');
    if (c.personalization && !listing.instructions) problems.push('buyer instructions missing');
    if (problems.length) throw new Error(`${c.label}: ${problems.join('; ')}`);
    return listing;
  });
}

// ---------- files ----------

function thankYouPdf(out, what) {
  const html = `<!doctype html><style>
    @page { size: Letter; margin: 0 }
    body { margin: 0; font-family: Arial, sans-serif; color: #3f4a73 }
    .page { width: 8.5in; height: 11in; box-sizing: border-box; padding: 1.4in 1in; background: #fbf8f1; text-align: center }
    h1 { font-size: 34pt; margin: .6in 0 .2in } p { font-size: 15pt; line-height: 1.5 }
  </style><div class="page"><div style="font-size:60pt">🎉</div><h1>Thank you for your order!</h1>
    <p>We’re making your personalized ${what} now.</p>
    <p>Your finished PDF arrives in your Etsy messages, usually within a few hours.</p>
    <p>Questions? Just send us a message on Etsy.</p><p style="margin-top:.6in"><b>LittlePrintQuests</b></p></div>`;
  return renderHtml(html, out);
}

const photo = (name) => ({ name, type: 'image/jpeg', data: fs.readFileSync(path.join(ASSETS, name)) });
// A fingerprint of a photo's contents, so a regenerated photo with the same name still gets re-sent.
const photoHash = (name) => crypto.createHash('sha1').update(fs.readFileSync(path.join(ASSETS, name))).digest('hex').slice(0, 16);
function photoSent(key, name) {
  const l = store.get().listings[key];
  setStatus(key, { steps: [...(l.steps || []), `photo:${name}`], photoHashes: { ...(l.photoHashes || {}), [name]: photoHash(name) } });
}

// ---------- creating drafts ----------

let running = false;
const isRunning = () => running;

function setStatus(key, patch) {
  store.update((s) => {
    s.listings ||= {};
    s.listings[key] = { ...(s.listings[key] || {}), ...patch };
  });
}

// Each listing goes draft -> personalization -> variation prices -> photos -> file. Progress is
// saved after every step, so clicking the button again after an error picks up where it stopped.
// If the bot's records were lost (say, a redeploy without a volume), a listing it made before is
// found again by its title, so it isn't made twice. Photos and the file it already has count as done.
async function adopt(l, existing) {
  const title = (t) => String(t || '').trim().toLowerCase();
  const found = (await existing()).find((x) => title(x.title) === title(l.title));
  if (!found) return false;
  const has = await etsy.listingContents(found.listing_id);
  // A draft with every photo may hold an older photo list, so those get re-uploaded in place;
  // a half-finished one was uploaded in this order and only needs the rest.
  const partial = has.images < l.photos.length;
  const steps = [...(partial ? l.photos.slice(0, has.images).map((p) => `photo:${p}`) : []), ...(has.files ? ['file'] : [])];
  setStatus(l.key, { id: found.listing_id, steps, adopted: true });
  await etsy.updateListing(found.listing_id, { ...l, sectionId: await etsy.shopSectionId(l.shopSection) });
  return true;
}

async function createOne(l, taxonomy, existing) {
  const done = () => store.get().listings?.[l.key] || {};
  if (!done().id && !(await adopt(l, existing))) {
    // Each kind of listing goes in its own shop section, made on first use.
    const sectionId = await etsy.shopSectionId(l.shopSection);
    const created = await etsy.createDraftListing({ ...l, sectionId }, taxonomy);
    setStatus(l.key, { id: created.listing_id, steps: [] });
  }
  const id = done().id;
  const step = async (name, fn) => {
    if ((done().steps || []).includes(name)) return;
    await fn();
    setStatus(l.key, { steps: [...(done().steps || []), name] });
  };
  if (l.personalization) await step('personalization', () => etsy.setPersonalization(id, { question: l.personalization.question, instructions: l.instructions }));
  if (l.variation) await step('variation', () => etsy.setVariationPrices(id, l.variation.name, l.variation.options));
  for (const [i, name] of l.photos.entries()) {
    if (done().steps?.includes(`photo:${name}`)) continue;
    await etsy.uploadListingImage(id, photo(name), i + 1);
    photoSent(l.key, name);
  }
  await step('file', async () => {
    const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'listing-')), l.file.name);
    await l.file.build(tmp);
    await etsy.uploadListingFile(id, { name: l.file.name, data: fs.readFileSync(tmp) });
  });
  setStatus(l.key, { ready: true, error: null, finishedAt: new Date().toISOString() });
}

// Brings a finished draft up to date with etsy-listings.md and this catalog: title, description,
// tags, section, buyer instructions and option prices, plus any photos added or redrawn since it was made.
async function updateOne(l) {
  const rec = store.get().listings[l.key];
  const id = rec.id;
  const sectionId = await etsy.shopSectionId(l.shopSection);
  // A title changed on Etsy (by hand, or by Etsy's title review) is kept, unless our own copy's
  // title has changed since: then ours goes out.
  const lastSent = rec.etsyTitle ?? l.title;
  const lastCopy = rec.copyTitle ?? l.title;
  const onEtsy = await etsy.listingTitle(id);
  const title = onEtsy && onEtsy !== lastSent && l.title === lastCopy ? onEtsy : l.title;
  await etsy.updateListing(id, { ...l, title, sectionId });
  setStatus(l.key, { etsyTitle: title, copyTitle: l.title, titleKept: title !== l.title });
  if (l.personalization) await etsy.setPersonalization(id, { question: l.personalization.question, instructions: l.instructions });
  if (l.variation) await etsy.setVariationPrices(id, l.variation.name, l.variation.options);
  // From the first new or changed photo on, every rank is re-uploaded in place, so the order matches the list.
  const steps = () => store.get().listings[l.key].steps || [];
  const hashes = store.get().listings[l.key].photoHashes || {};
  const from = l.photos.findIndex((name) => !steps().includes(`photo:${name}`) || hashes[name] !== photoHash(name));
  if (from >= 0) {
    const keep = steps().filter((x) => !x.startsWith('photo:') || l.photos.slice(0, from).includes(x.slice(6)));
    setStatus(l.key, { steps: keep });
    for (const [i, name] of l.photos.entries()) {
      if (i < from) continue;
      await etsy.uploadListingImage(id, photo(name), i + 1);
      photoSent(l.key, name);
    }
  }
  setStatus(l.key, { error: null, updatedAt: new Date().toISOString() });
}

async function createDrafts() {
  if (running) return;
  running = true;
  try {
    const listings = readCopy();
    // New listings are created; finished ones are updated to match the latest copy and photos.
    const isReady = (l) => store.get().listings?.[l.key]?.ready;
    const taxonomy = listings.some((l) => !isReady(l)) ? await etsy.taxonomyId(/^party games$/i) : null;
    let shop = null;
    const existing = async () => (shop ||= await etsy.shopListings());
    for (const l of listings) {
      try {
        setStatus(l.key, { error: null, working: true });
        await (isReady(l) ? updateOne(l) : createOne(l, taxonomy, existing));
      } catch (err) {
        setStatus(l.key, { error: err.message });
      } finally {
        setStatus(l.key, { working: false });
      }
    }
  } catch (err) {
    store.update((s) => (s.listingsError = err.message));
  } finally {
    running = false;
  }
}

module.exports = { CATALOG, readCopy, createDrafts, isRunning, forListingId };
