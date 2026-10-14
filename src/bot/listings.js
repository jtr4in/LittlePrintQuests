// Creates the shop's Etsy listings as drafts: the five theme packs, the custom Party Bundle
// and the play kit. Titles, descriptions and tags come from etsy-listings.md; prices,
// photos, files and variations are set here.

const fs = require('fs');
const os = require('os');
const path = require('path');
const store = require('./store');
const etsy = require('./etsy');
const { renderPdf, renderHtml } = require('../generator/render');
const THEMES = require('../generator/themes');
const { KITS } = require('../kits/engine');

const ROOT = path.join(__dirname, '..', '..');
const ASSETS = path.join(ROOT, 'listing-assets');
const DOC = path.join(ROOT, 'etsy-listings.md');

const PACK_SPOTS = ['couch', 'fridge', 'bed', 'bathtub', 'bookshelf', 'front_door', 'toy_box', 'kitchen_table'];
const PACK_PROMO = 'Want a hunt with your child’s name and your own hiding spots? Order a Custom Hunt from our Etsy shop.';
const KIT_ORDER = ['vet', 'space', 'dino', 'hero', 'pirate', 'royal'];

const CATALOG = [
  ...['dino', 'hero', 'pirate', 'space', 'royal'].map((theme, i) => ({
    key: `pack-${theme}`,
    section: i + 1,
    label: `${THEMES[theme].name} pack`,
    price: 8.0,
    photos: [`hunt-${theme}.jpg`],
    file: { name: `${theme}-scavenger-hunt.pdf`, build: (out) => renderPdf({ theme, spots: PACK_SPOTS, promo: PACK_PROMO }, out) },
  })),
  {
    key: 'bundle',
    section: 6,
    label: 'Custom Party Bundle',
    price: 16.99,
    variation: { name: 'Package', options: [{ value: 'Hunt + Play Kit', price: 16.99 }, { value: 'Hunt only', price: 9.99 }] },
    personalization: { question: 'Name, age, theme, spots and pets' },
    photos: ['bundle-main.jpg', 'hunt-space.jpg', ...['dino', 'hero', 'pirate', 'space', 'royal'].map((k) => `kit-${k}.jpg`)],
    file: { name: 'your-custom-party-bundle.pdf', build: (out) => thankYouPdf(out, 'party bundle') },
  },
  {
    key: 'kits',
    section: 7,
    label: 'Pretend Play Kit',
    price: 7.99,
    variation: { name: 'Kit', options: KIT_ORDER.map((k) => ({ value: KITS[k].name, price: 7.99 })) },
    personalization: { question: 'Child’s name and pets or toys' },
    photos: ['kits-main.jpg', ...KIT_ORDER.map((k) => `kit-${k}.jpg`)],
    file: { name: 'your-pretend-play-kit.pdf', build: (out) => thankYouPdf(out, 'play kit') },
  },
];

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

// Title, description, tags and personalization instructions for every catalog listing.
function readCopy(md = fs.readFileSync(DOC, 'utf8')) {
  const all = sections(md);
  const shared = blockAfter(md, '## Shared description');
  return CATALOG.map((c) => {
    const s = all[c.section];
    if (!s) throw new Error(`etsy-listings.md has no section ${c.section} (${c.label})`);
    const opening = lineAfter(s, 'Opening line');
    const description = opening ? `${opening}\n\n${shared}` : blockAfter(s, '\\*\\*Description\\*\\*');
    const listing = {
      ...c,
      title: lineAfter(s, 'Title'),
      description,
      tags: (lineAfter(s, 'Tags') || '').split(',').map((t) => t.trim()).filter(Boolean),
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
async function createOne(l, taxonomy) {
  const done = () => store.get().listings?.[l.key] || {};
  if (!done().id) {
    const created = await etsy.createDraftListing(l, taxonomy);
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
  for (const [i, name] of l.photos.entries()) await step(`photo:${name}`, () => etsy.uploadListingImage(id, photo(name), i + 1));
  await step('file', async () => {
    const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'listing-')), l.file.name);
    await l.file.build(tmp);
    await etsy.uploadListingFile(id, { name: l.file.name, data: fs.readFileSync(tmp) });
  });
  setStatus(l.key, { ready: true, error: null, finishedAt: new Date().toISOString() });
}

async function createDrafts() {
  if (running) return;
  running = true;
  try {
    const listings = readCopy();
    const todo = listings.filter((l) => !store.get().listings?.[l.key]?.ready);
    if (!todo.length) return;
    const taxonomy = await etsy.taxonomyId(/^party games$/i);
    for (const l of todo) {
      try {
        setStatus(l.key, { error: null, working: true });
        await createOne(l, taxonomy);
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

module.exports = { CATALOG, readCopy, createDrafts, isRunning };
