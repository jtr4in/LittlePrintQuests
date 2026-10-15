// Etsy Open API v3: OAuth 2.0 (PKCE), reading paid orders, and creating draft listings.

const crypto = require('crypto');
const store = require('./store');

const API = 'https://api.etsy.com/v3';
const KEYSTRING = process.env.ETSY_KEYSTRING;
const SHARED_SECRET = process.env.ETSY_SHARED_SECRET;
// listings_w lets the bot create draft listings, and shops_w lets it make shop sections for them.
// Shops connected before these were added reconnect once.
const SCOPES = 'transactions_r listings_r listings_w shops_r shops_w';

const redirectUri = () => `${process.env.PUBLIC_URL}/auth/etsy/callback`;
const b64url = (buf) => buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

function startAuth() {
  const verifier = b64url(crypto.randomBytes(32));
  const state = b64url(crypto.randomBytes(16));
  const challenge = b64url(crypto.createHash('sha256').update(verifier).digest());
  const url = new URL('https://www.etsy.com/oauth/connect');
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: KEYSTRING,
    redirect_uri: redirectUri(),
    scope: SCOPES,
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });
  return { url: url.toString(), state, verifier };
}

async function tokenRequest(params) {
  const res = await fetch(`${API}/public/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: KEYSTRING, ...params }),
  });
  if (!res.ok) throw new Error(`Etsy token request failed: ${res.status} ${await res.text()}`);
  const t = await res.json();
  return { access_token: t.access_token, refresh_token: t.refresh_token, expires_at: Date.now() + t.expires_in * 1000 };
}

async function finishAuth(code, verifier) {
  const tokens = await tokenRequest({ grant_type: 'authorization_code', code, code_verifier: verifier, redirect_uri: redirectUri() });
  store.update((s) => (s.etsy = { ...tokens, scopes: SCOPES }));
  const me = await api('GET', '/application/users/me');
  store.update((s) => Object.assign(s.etsy, { user_id: me.user_id, shop_id: me.shop_id }));
  return me;
}

async function accessToken() {
  const etsy = store.get().etsy;
  if (!etsy) throw new Error('Etsy shop is not connected yet');
  if (etsy.expires_at - Date.now() > 60_000) return etsy.access_token;
  const tokens = await tokenRequest({ grant_type: 'refresh_token', refresh_token: etsy.refresh_token });
  store.update((s) => Object.assign(s.etsy, tokens));
  return tokens.access_token;
}

// body: a plain object is sent as a form, `{ json }` as JSON, and a FormData as multipart.
async function api(method, path, query, body) {
  const url = new URL(API + path);
  if (query) url.search = new URLSearchParams(query);
  const headers = { 'x-api-key': `${KEYSTRING}:${SHARED_SECRET}`, Authorization: `Bearer ${await accessToken()}` };
  let payload;
  if (body instanceof FormData) payload = body;
  else if (body?.json) [payload, headers['Content-Type']] = [JSON.stringify(body.json), 'application/json'];
  else if (body) [payload, headers['Content-Type']] = [new URLSearchParams(body), 'application/x-www-form-urlencoded'];
  const res = await fetch(url, { method, headers, body: payload });
  if (!res.ok) throw new Error(`Etsy ${method} ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

// Paid receipts created at or after `since` (unix seconds), newest first.
async function paidReceiptsSince(since) {
  const shopId = store.get().etsy.shop_id;
  const out = [];
  for (let offset = 0; ; offset += 100) {
    const page = await api('GET', `/application/shops/${shopId}/receipts`, {
      was_paid: 'true',
      min_created: String(since),
      limit: '100',
      offset: String(offset),
    });
    out.push(...page.results);
    if (page.results.length < 100) return out;
  }
}

// ---------- listings ----------

const shopId = () => store.get().etsy.shop_id;

// Finds a seller taxonomy id by name, e.g. "Party Games", searching the whole tree.
async function taxonomyId(pattern) {
  const { results } = await api('GET', '/application/seller-taxonomy/nodes');
  const stack = [...results];
  let fallback = null;
  while (stack.length) {
    const n = stack.shift();
    if (pattern.test(n.name)) return n.id;
    if (!fallback && /^games$/i.test(n.name)) fallback = n.id;
    stack.push(...(n.children || []));
  }
  if (fallback) return fallback;
  throw new Error('Could not find an Etsy category for party games');
}

// Creates a draft digital listing. Etsy only shows it once you publish it in Shop Manager.
async function createDraftListing(l, taxonomy) {
  const form = {
    quantity: '999',
    title: l.title,
    description: l.description,
    price: l.price.toFixed(2),
    who_made: 'i_did',
    when_made: 'made_to_order',
    taxonomy_id: String(taxonomy),
    type: 'download',
    is_supply: 'false',
    should_auto_renew: 'true',
    tags: l.tags.join(','),
    ...(l.sectionId ? { shop_section_id: String(l.sectionId) } : {}),
  };
  return api('POST', `/application/shops/${shopId()}/listings`, null, form);
}

// Updates a listing's text and section (works on drafts and published listings).
async function updateListing(listingId, { title, description, tags, sectionId }) {
  return api('PATCH', `/application/shops/${shopId()}/listings/${listingId}`, null, {
    title,
    description,
    tags: tags.join(','),
    ...(sectionId ? { shop_section_id: String(sectionId) } : {}),
  });
}

// The id of the shop section with this title, made if the shop doesn't have it yet.
async function shopSectionId(title) {
  const { results = [] } = await api('GET', `/application/shops/${shopId()}/sections`);
  const found = results.find((s) => s.title.toLowerCase() === title.toLowerCase());
  if (found) return found.shop_section_id;
  return (await api('POST', `/application/shops/${shopId()}/sections`, null, { title })).shop_section_id;
}

// Every listing in the shop that the bot could have made (drafts, live and paused ones).
async function shopListings() {
  const out = [];
  for (const state of ['draft', 'active', 'inactive']) {
    for (let offset = 0; ; offset += 100) {
      const { results = [] } = await api('GET', `/application/shops/${shopId()}/listings`, { state, limit: '100', offset: String(offset) });
      out.push(...results);
      if (results.length < 100) break;
    }
  }
  return out;
}

// How many photos and digital files a listing already has.
async function listingContents(listingId) {
  const images = await api('GET', `/application/listings/${listingId}/images`);
  const files = await api('GET', `/application/shops/${shopId()}/listings/${listingId}/files`);
  return { images: images.count ?? images.results?.length ?? 0, files: files.count ?? files.results?.length ?? 0 };
}

// One required text box for the buyer's details (Etsy's personalization questions API).
async function setPersonalization(listingId, { question, instructions }) {
  return api('POST', `/application/shops/${shopId()}/listings/${listingId}/personalization`, null, {
    json: {
      personalization_questions: [
        { question_text: question, instructions, question_type: 'text_input', required: true, max_allowed_characters: 500 },
      ],
    },
  });
}

// Replaces whatever image sits at that rank, so re-uploading a changed photo list never piles up extras.
async function uploadListingImage(listingId, { name, data, type }, rank) {
  const fd = new FormData();
  fd.append('image', new Blob([data], { type }), name);
  fd.append('rank', String(rank));
  fd.append('overwrite', 'true');
  return api('POST', `/application/shops/${shopId()}/listings/${listingId}/images`, null, fd);
}

async function uploadListingFile(listingId, { name, data }) {
  const fd = new FormData();
  fd.append('file', new Blob([data], { type: 'application/pdf' }), name);
  fd.append('name', name);
  return api('POST', `/application/shops/${shopId()}/listings/${listingId}/files`, null, fd);
}

// One custom variation (Etsy's custom property 513) with a price per option.
async function setVariationPrices(listingId, name, options) {
  return api('PUT', `/application/listings/${listingId}/inventory`, null, {
    json: {
      products: options.map((o) => ({
        sku: '',
        property_values: [{ property_id: 513, property_name: name, value_ids: [], values: [o.value] }],
        offerings: [{ price: o.price, quantity: 999, is_enabled: true, readiness_state_id: null }],
      })),
      price_on_property: [513],
      quantity_on_property: [],
      sku_on_property: [],
    },
  });
}

module.exports = {
  startAuth,
  taxonomyId,
  createDraftListing,
  shopSectionId,
  updateListing,
  shopListings,
  listingContents,
  uploadListingImage,
  uploadListingFile,
  setVariationPrices,
  setPersonalization,
  canWriteListings: () => /listings_w/.test(store.get().etsy?.scopes || '') && /shops_w/.test(store.get().etsy?.scopes || ''),
  finishAuth,
  paidReceiptsSince,
  configured: () => Boolean(KEYSTRING && SHARED_SECRET),
  isConnected: () => Boolean(store.get().etsy?.shop_id),
};
