// The Family Pass: 6 website orders to use within a year, bought once through Stripe.
// The buyer gets a code by email and types it at checkout instead of paying. Each order made with
// it is added to the pass's uses, so the count is right whenever they come back.

const crypto = require('crypto');
const store = require('./store');

const USES = Number(process.env.PASS_USES || 6);
const DAYS = 365;
const LETTERS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O or 1/I/L to mix up
const chunk = () => Array.from(crypto.randomBytes(4), (b) => LETTERS[b % LETTERS.length]).join('');
const clean = (code) => String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const left = (p) => p.total - p.uses.length;

function addPass({ gift = null } = {}) {
  const id = `pass-${crypto.randomBytes(12).toString('base64url')}`;
  store.update((s) => {
    s.passes ||= {};
    s.passes[id] = { id, status: 'awaiting_payment', createdAt: new Date().toISOString(), total: USES, uses: [], ...(gift ? { gift } : {}) };
  });
  return id;
}

// Called once Stripe confirms payment. Returns the pass the first time, null on a repeat.
function activate(id, { email, buyerName }) {
  const p = store.get().passes?.[id];
  if (!p || p.status !== 'awaiting_payment') return null;
  const now = new Date();
  store.update((s) => Object.assign(s.passes[id], {
    // A gift's code belongs to the person it's for; the buyer is kept for the receipt.
    status: 'active', code: `LPQ-${chunk()}-${chunk()}`, email: p.gift ? p.gift.to : email, buyerName, ...(p.gift ? { buyerEmail: email } : {}),
    paidAt: now.toISOString(), expiresAt: new Date(now.getTime() + DAYS * 864e5).toISOString(),
  }));
  return store.get().passes[id];
}

// { pass } when the code can pay for an order, else { error } to show the buyer.
function check(code) {
  const c = clean(code);
  const p = c && Object.values(store.get().passes || {}).find((x) => x.code && clean(x.code) === c);
  if (!p) return { error: 'We couldn’t find that pass code. Check it against your Family Pass email.' };
  if (new Date(p.expiresAt) < new Date()) return { error: 'That Family Pass has ended. Thanks for a great year!' };
  if (left(p) <= 0) return { error: `You’ve used all ${p.total} orders on that Family Pass.` };
  return { pass: p };
}

// Counts one order against the pass. Checks again inside the update, so two at once can't both win.
function use(code, orderId) {
  const { pass, error } = check(code);
  if (error) throw Object.assign(new Error(error), { status: 400 });
  store.update((s) => {
    const p = s.passes[pass.id];
    if (left(p) <= 0) throw Object.assign(new Error(`You’ve used all ${p.total} orders on that Family Pass.`), { status: 400 });
    p.uses.push(orderId);
  });
  return store.get().passes[pass.id];
}

const summary = (p) => ({ left: left(p), total: p.total, expiresAt: p.expiresAt });

module.exports = { USES, addPass, activate, check, use, left, summary };
