// Etsy Open API v3: OAuth 2.0 (PKCE) and the few read calls the bot needs.

const crypto = require('crypto');
const store = require('./store');

const API = 'https://api.etsy.com/v3';
const KEYSTRING = process.env.ETSY_KEYSTRING;
const SHARED_SECRET = process.env.ETSY_SHARED_SECRET;
const SCOPES = 'transactions_r listings_r';

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
  store.update((s) => (s.etsy = { ...tokens }));
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

async function api(method, path, query) {
  const url = new URL(API + path);
  if (query) url.search = new URLSearchParams(query);
  const res = await fetch(url, {
    method,
    headers: { 'x-api-key': `${KEYSTRING}:${SHARED_SECRET}`, Authorization: `Bearer ${await accessToken()}` },
  });
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

module.exports = {
  startAuth,
  finishAuth,
  paidReceiptsSince,
  configured: () => Boolean(KEYSTRING && SHARED_SECRET),
  isConnected: () => Boolean(store.get().etsy?.shop_id),
};
