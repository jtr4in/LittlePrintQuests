// Creates the shop's Etsy listings as drafts and keeps them up to date: per theme a hunt pack, a play
// kit, a party pack and a bundle of all three, plus the handprint art. Every listing is a static
// instant download. Titles, descriptions and tags come from etsy-listings.md; prices, photos and
// files are set here.

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { PDFDocument } = require('pdf-lib');
const store = require('./store');
const etsy = require('./etsy');
const render = require('../generator/render');
const { buildHtml } = require('../generator/build');
const { BLANK_NAME, BLANK_YEAR, blankName } = require('../generator/blank-name');
const { buildPartyHtml } = require('../party/build');
const { buildCraftHtml } = require('../crafts/build');
const THEMES = require('../generator/themes');
const { KITS, kitForHunt, buildKitHtml, activityPackHtml } = require('../kits/engine');
const { flavorFor } = require('../party/flavor');
const { HOLIDAYS } = require('../crafts/build');

const ROOT = path.join(__dirname, '..', '..');
const ASSETS = path.join(ROOT, 'listing-assets');
const DOC = path.join(ROOT, 'etsy-listings.md');

const PACK_SPOTS = ['couch', 'fridge', 'bed', 'bathtub', 'bookshelf', 'front_door', 'toy_box', 'kitchen_table'];
const PACK_PROMO = 'Want a hunt with your child’s name and your own hiding spots? Make a custom one at littleprintquests.com.';
const KIT_ORDER = ['vet', 'pizza', 'space', 'grocery', 'dino', 'burger', 'hero', 'post', 'pirate', 'coffee', 'dentist', 'petshop', 'library', 'police', 'italian', 'auto', 'royal', 'unicorn', 'mermaid', 'construction', 'easter', 'halloween', 'christmas', 'valentine', 'fire', 'ice', 'racecar'];
// etsy-listings.md section for each theme's pack (the newer themes come after the bundle, kit and party pack).
const PACK_SECTIONS = { dino: 1, hero: 2, pirate: 3, space: 4, royal: 5, unicorn: 9, mermaid: 10, construction: 11, vet: 12, easter: 15, halloween: 16, christmas: 17, valentine: 18, fire: 19, ice: 20, racecar: 21 };
// The themes listed on Etsy. The shop kits' hunts and party packs (pizza, library...) are sold on the website only.
const ETSY_THEMES = Object.keys(PACK_SECTIONS);
// Since 2026-10-30 every Etsy listing is a static instant download (Etsy delivers the attached files,
// nothing to personalize): $1 for one thing, $2 for a theme bundle. Custom orders go to the website.
const SINGLE_PRICE = 1.0;
const BUNDLE_PRICE = 2.0;
// Bump this when the attached files change: the next update replaces them on every listing.
const FILES_VERSION = 'static-2026-10-30';
// Listings from before then that needed a name. The next update deactivates them on Etsy.
const RETIRED = ['bundle', 'kits', 'party'];

// Etsy takes up to 20 photos per listing.
const MAX_PHOTOS = 20;
// The page close-ups theme-photos.js makes for a listing (prefix-p01.jpg, prefix-p02.jpg...), in order.
const closeUps = (prefix) => Array.from({ length: MAX_PHOTOS }, (_, i) => `${prefix}-p${String(i + 1).padStart(2, '0')}.jpg`).filter((f) => fs.existsSync(path.join(ASSETS, f)));

// The name-free PDFs each listing delivers. Names, and the year on handprint pages, print as write-in lines.
const blank = (html) => (out) => render.renderHtml(blankName(html()), out);
const FILES = {
  hunt: (theme) => ({ name: `${theme}-scavenger-hunt.pdf`, build: (out) => render.renderHtml(buildHtml({ theme, spots: PACK_SPOTS, pictures: true, promo: PACK_PROMO }), out) }),
  kit: (k) => ({ name: `${k}-play-kit.pdf`, build: blank(() => buildKitHtml({ kit: k, childName: BLANK_NAME, subjects: [], lenient: true })) }),
  activity: (k) => ({ name: `${k}-activity-pack.pdf`, build: blank(() => activityPackHtml({ kit: k, childName: BLANK_NAME, lenient: true })) }),
  party: (theme) => ({ name: `${theme}-party-pack.pdf`, build: blank(() => buildPartyHtml({ theme, childName: BLANK_NAME })) }),
  craft: (h) => ({ name: `${h}-handprint-art.pdf`, build: blank(() => buildCraftHtml({ holiday: h, childName: BLANK_NAME, year: BLANK_YEAR })) }),
};

const CATALOG = [
  ...ETSY_THEMES.map((theme) => ({
    key: `pack-${theme}`,
    section: PACK_SECTIONS[theme],
    shopSection: 'Scavenger Hunt Packs',
    label: `${THEMES[theme].name} pack`,
    price: SINGLE_PRICE,
    photos: [`hunt-${theme}.jpg`, ...['inside', 'cards', 'how', 'finish'].map((k) => `pack-${theme}-${k}.jpg`)],
    files: [FILES.hunt(theme)],
  })),
  // One play kit and one party pack listing per theme, so each shows up in its own searches.
  ...KIT_ORDER.map((k) => ({
    key: `kit-${k}`,
    section: 13,
    perTheme: k,
    shopSection: 'Pretend Play Kits',
    label: `${KITS[k].name} play kit`,
    price: SINGLE_PRICE,
    order: { product: 'kit', kit: k },
    photos: [`kit-${k}.jpg`, `kit-${k}-inside.jpg`, `kit-${k}-feature.jpg`, ...closeUps(`kit-${k}`)].slice(0, MAX_PHOTOS),
    files: [FILES.kit(k), FILES.activity(k)],
  })),
  ...ETSY_THEMES.map((theme) => ({
    key: `party-${theme}`,
    section: 14,
    perTheme: theme,
    shopSection: 'Party Printables',
    label: `${THEMES[theme].label} party pack`,
    price: SINGLE_PRICE,
    order: { product: 'party', theme },
    photos: [`party-${theme}.jpg`, `party-${theme}-inside.jpg`, `party-${theme}-feature.jpg`, ...closeUps(`party-${theme}`)].slice(0, MAX_PHOTOS),
    files: [FILES.party(theme)],
  })),
  // A theme bundle: the hunt pack, its play kit (with the activity pack) and the party pack together.
  ...ETSY_THEMES.map((theme) => {
    const k = kitForHunt(theme).id;
    return {
      key: `bundle-${theme}`,
      section: 26,
      perTheme: theme,
      shopSection: 'Party Bundles',
      label: `${THEMES[theme].label} party bundle`,
      price: BUNDLE_PRICE,
      order: { product: 'bundle', theme, kit: k },
      photos: [`hunt-${theme}.jpg`, `kit-${k}.jpg`, `party-${theme}.jpg`, `pack-${theme}-inside.jpg`, `kit-${k}-inside.jpg`, `party-${theme}-inside.jpg`],
      files: [FILES.hunt(theme), FILES.kit(k), FILES.activity(k), FILES.party(theme)],
    };
  }),
  // Handprint art packs, one per holiday.
  ...Object.keys(HOLIDAYS).filter((h) => !HOLIDAYS[h].book).map((holiday) => ({
    key: `craft-${holiday}`,
    section: 22,
    perTheme: holiday,
    shopSection: 'Handprint Art',
    label: `${HOLIDAYS[holiday].name} handprint art`,
    price: SINGLE_PRICE,
    order: { product: 'craft', holiday },
    photos: [`craft-${holiday}.jpg`, `craft-${holiday}-inside.jpg`, ...closeUps(`craft-${holiday}`)].slice(0, MAX_PHOTOS),
    files: [FILES.craft(holiday)],
  })),
  // Handprint books, one listing each: the Memory Handprint Book, the Handprint Zoo and more.
  ...Object.keys(HOLIDAYS).filter((h) => HOLIDAYS[h].book).map((holiday) => ({
    key: `craft-${holiday}`,
    section: HOLIDAYS[holiday].etsySection,
    shopSection: 'Handprint Art',
    label: HOLIDAYS[holiday].name,
    price: SINGLE_PRICE,
    order: { product: 'craft', holiday },
    photos: [`craft-${holiday}.jpg`, `craft-${holiday}-inside.jpg`, ...closeUps(`craft-${holiday}`)].slice(0, MAX_PHOTOS),
    files: [{ ...FILES.craft(holiday), name: `${holiday}-handprint-book.pdf` }],
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
  if (c.order.product === 'craft') {
    const h = HOLIDAYS[c.perTheme];
    return { holiday: h.name, month: h.month, crafts: list(h.crafts.map((k) => k.title)), count: 12 + h.crafts.length };
  }
  if (c.order.product === 'kit') {
    const k = KITS[c.perTheme];
    return {
      kit: k.name, place: k.placeName('[Name]’s'), toys: k.toys.map((t) => t.inside).join('\n• '), subjects: k.subjectPlural,
      props: list(Object.values(k.props).map((p) => p.title)),
      forms: `${k.record.title} forms and ${k.passport.pageTitle}`,
      pairing: PACK_SECTIONS[k.hunt]
        ? `Our ${THEMES[k.hunt].name} scavenger hunt: the trail ends at the ${k.name}, so the party keeps going. Find it in our shop, or get the hunt, this kit and a matching party pack together in our ${THEMES[k.hunt].label} Party Bundle.`
        : 'Any of our scavenger hunts, for a party that keeps going. Find them in our shop.',
    };
  }
  const t = THEMES[c.perTheme];
  const f = flavorFor(t);
  const kit = c.order.product === 'bundle' ? { kit: KITS[c.order.kit].name, place: KITS[c.order.kit].placeName('[Name]’s') } : {};
  return { theme: t.label, party: f.party, foods: list(f.foods), hunt: t.name, ...kit };
}

// Title, description and tags for every catalog listing.
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
    };
    const problems = [];
    if (!listing.title || listing.title.length > 140) problems.push('title missing or over 140 characters');
    if (!listing.description) problems.push('description missing');
    if (listing.tags.length > 13 || listing.tags.some((t) => t.length > 20)) problems.push('more than 13 tags, or a tag over 20 characters');
    if (problems.length) throw new Error(`${c.label}: ${problems.join('; ')}`);
    return listing;
  });
}

// ---------- files ----------

// Etsy takes up to 5 files of 20 MB each. A bigger PDF (the vet kit is about 26 MB) goes up in parts.
const MAX_FILES = 5;
const MAX_FILE_BYTES = 19e6;
async function splitPdf(name, data) {
  if (data.length <= MAX_FILE_BYTES) return [{ name, data }];
  const src = await PDFDocument.load(data);
  const total = src.getPageCount();
  const save = async (from, to) => {
    const doc = await PDFDocument.create();
    for (const pg of await doc.copyPages(src, Array.from({ length: to - from }, (_, j) => from + j))) doc.addPage(pg);
    return Buffer.from(await doc.save());
  };
  // Each part takes as many pages as fit (found by halving), so big pictures don't make extra parts.
  const parts = [];
  for (let from = 0; from < total; ) {
    let lo = from + 1;
    let hi = total;
    let best = null;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const bytes = await save(from, mid);
      if (bytes.length <= MAX_FILE_BYTES) [best, lo] = [{ to: mid, bytes }, mid + 1];
      else hi = mid - 1;
    }
    if (!best) throw new Error(`${name}: page ${from + 1} alone is over Etsy's 20 MB limit`);
    parts.push(best.bytes);
    from = best.to;
  }
  return parts.map((d, i) => ({ name: name.replace(/\.pdf$/, `-part-${i + 1}-of-${parts.length}.pdf`), data: d }));
}

// Renders a listing's PDFs, then swaps them in for whatever files the listing has now.
async function listingParts(l) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'listing-'));
  try {
    const parts = [];
    for (const f of l.files) {
      checkStop();
      const out = path.join(dir, f.name);
      await f.build(out);
      parts.push(...(await splitPdf(f.name, fs.readFileSync(out))));
    }
    if (parts.length > MAX_FILES) throw new Error(`${parts.length} files to attach, but Etsy takes ${MAX_FILES}`);
    return parts;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
async function sendFiles(l, id) {
  const parts = await listingParts(l);
  for (const old of await etsy.listingFiles(id)) await etsy.deleteListingFile(id, old.listing_file_id);
  for (const [i, p] of parts.entries()) await etsy.uploadListingFile(id, { ...p, rank: i + 1 });
  setStatus(l.key, { filesVersion: FILES_VERSION });
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
// Live progress for the dashboard: listings finished out of the total, plus the photos of the one in hand.
let progress = null;
let stopAsked = false;
const getProgress = () => (running ? { ...progress, stopping: stopAsked } : null);
// Stops between steps, never mid-upload. Every step is saved, so the next run picks up from there.
function stop() {
  if (running) stopAsked = true;
}
function checkStop() {
  if (stopAsked) throw Object.assign(new Error('Stopped'), { stopped: true });
}
function photoDone(i, count) {
  progress.photo = i + 1;
  progress.photos = count;
}

function setStatus(key, patch) {
  store.update((s) => {
    s.listings ||= {};
    s.listings[key] = { ...(s.listings[key] || {}), ...patch };
  });
}

// Each listing goes draft -> photos -> files. Progress is
// saved after every step, so clicking the button again after an error picks up where it stopped.
// If the bot's records were lost (say, a redeploy without a volume), a listing it made before is
// found again by its title, so it isn't made twice. Photos it already has count as done; its files
// are replaced, since there's no telling which ones they are.
async function adopt(l, existing) {
  const title = (t) => String(t || '').trim().toLowerCase();
  const found = (await existing()).find((x) => title(x.title) === title(l.title));
  if (!found) return false;
  const has = await etsy.listingContents(found.listing_id);
  // A draft with every photo may hold an older photo list, so those get re-uploaded in place;
  // a half-finished one was uploaded in this order and only needs the rest.
  const partial = has.images < l.photos.length;
  const steps = partial ? l.photos.slice(0, has.images).map((p) => `photo:${p}`) : [];
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
  for (const [i, name] of l.photos.entries()) {
    if (done().steps?.includes(`photo:${name}`)) continue;
    checkStop();
    await etsy.uploadListingImage(id, photo(name), i + 1);
    photoSent(l.key, name);
    photoDone(i, l.photos.length);
  }
  if (done().adopted) await step('price', () => etsy.setPrice(id, l.price));
  if ((done().steps || []).includes('personalization') && !done().personalizationOff) {
    await etsy.removePersonalization(id);
    setStatus(l.key, { personalizationOff: true });
  }
  if (done().filesVersion !== FILES_VERSION) await sendFiles(l, id);
  setStatus(l.key, { ready: true, error: null, finishedAt: new Date().toISOString() });
}

// Brings a finished listing up to date with etsy-listings.md and this catalog: title, description,
// tags, section and price, plus any photos added or redrawn and any files changed since it was made.
// A listing made before 2026-10-30 also loses its personalization box and dropdown and gets its real
// files in place of the old "we're making it" PDF.
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
  await etsy.setPrice(id, l.price);
  if ((rec.steps || []).includes('personalization') && !rec.personalizationOff) {
    await etsy.removePersonalization(id);
    setStatus(l.key, { personalizationOff: true });
  }
  // From the first new or changed photo on, every rank is re-uploaded in place, so the order matches the list.
  const steps = () => store.get().listings[l.key].steps || [];
  const hashes = store.get().listings[l.key].photoHashes || {};
  const from = l.photos.findIndex((name) => !steps().includes(`photo:${name}`) || hashes[name] !== photoHash(name));
  if (from >= 0) {
    const keep = steps().filter((x) => !x.startsWith('photo:') || l.photos.slice(0, from).includes(x.slice(6)));
    setStatus(l.key, { steps: keep });
    for (const [i, name] of l.photos.entries()) {
      if (i < from) continue;
      checkStop();
      await etsy.uploadListingImage(id, photo(name), i + 1);
      photoSent(l.key, name);
      photoDone(i, l.photos.length);
    }
  }
  if (rec.filesVersion !== FILES_VERSION) await sendFiles(l, id);
  setStatus(l.key, { error: null, updatedAt: new Date().toISOString() });
}

// The old listings that needed a name (the custom bundle and the kit and party dropdowns) are
// deactivated, which hides them from the shop and can be undone in Shop Manager.
async function retireOld() {
  for (const key of RETIRED) {
    const rec = store.get().listings?.[key];
    if (!rec?.id || rec.retired) continue;
    try {
      await etsy.deactivateListing(rec.id);
      setStatus(key, { retired: true, error: null });
    } catch (err) {
      setStatus(key, { error: `Couldn't deactivate it: ${err.message}` });
    }
  }
}

async function createDrafts() {
  if (running) return;
  running = true;
  stopAsked = false;
  try {
    const listings = readCopy();
    progress = { done: 0, total: listings.length, label: '', photo: 0, photos: 0 };
    // New listings are created; finished ones are updated to match the latest copy and photos.
    const isReady = (l) => store.get().listings?.[l.key]?.ready;
    const taxonomy = listings.some((l) => !isReady(l)) ? await etsy.taxonomyId(/^party games$/i) : null;
    let shop = null;
    const existing = async () => (shop ||= await etsy.shopListings());
    for (const l of listings) {
      if (stopAsked) break;
      Object.assign(progress, { label: l.label, photo: 0, photos: 0 });
      try {
        setStatus(l.key, { error: null, working: true });
        await (isReady(l) ? updateOne(l) : createOne(l, taxonomy, existing));
      } catch (err) {
        if (!err.stopped) setStatus(l.key, { error: err.message });
      } finally {
        setStatus(l.key, { working: false });
      }
      progress.done++;
    }
    if (!stopAsked) await retireOld();
    store.update((s) => (s.listingsStopped = stopAsked ? new Date().toISOString() : null));
  } catch (err) {
    store.update((s) => (s.listingsError = err.message));
  } finally {
    running = false;
    stopAsked = false;
  }
}

module.exports = { CATALOG, RETIRED, FILES_VERSION, splitPdf, MAX_FILES, readCopy, createDrafts, isRunning, getProgress, stop, forListingId };
