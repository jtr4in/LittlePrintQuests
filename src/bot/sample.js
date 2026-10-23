// Free sample hunt for the website: a visitor leaves an email, gets a short
// picture-clue hunt by email, and joins the mailing list (with an unsubscribe link).

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const store = require('./store');
const THEMES = require('../generator/themes');
const { renderPdf } = require('../generator/render');

const SPOTS = ['toy_box', 'couch', 'fridge', 'kitchen_table'];
const PROMO = 'Want one with your child’s name, your own hiding spots and a matching play kit? Get our Scavenger Hunts at LittlePrintQuests.';
const EMAIL_RE = /^[^\s@<>"]{1,64}@[^\s@<>"]{1,190}\.[a-z]{2,}$/i;

const recent = new Map(); // ip -> request times, for a simple rate limit

function tooMany(ip) {
  const now = Date.now();
  const times = (recent.get(ip) || []).filter((t) => now - t < 3600e3);
  times.push(now);
  recent.set(ip, times);
  return times.length > 5;
}

function validate(body) {
  const email = String(body.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) throw Object.assign(new Error('Please enter a valid email address.'), { status: 400 });
  const theme = THEMES[body.theme] ? body.theme : 'dino';
  return { email, theme };
}

// Built once per theme and kept on disk.
async function samplePdf(theme) {
  const file = path.join(store.PDF_DIR, `sample-${theme}.pdf`);
  if (!fs.existsSync(file)) await renderPdf({ theme, spots: SPOTS, pictures: true, promo: PROMO }, file);
  return file;
}

const unsubToken = (email) =>
  crypto.createHmac('sha256', `${process.env.ADMIN_PASSWORD}|unsubscribe`).update(email).digest('base64url').slice(0, 24);
const unsubLink = (email) => `${process.env.PUBLIC_URL}/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubToken(email)}`;

function unsubscribe(email, token) {
  const e = String(email || '').toLowerCase();
  const sub = store.get().subscribers?.[e];
  if (!sub || !token || token !== unsubToken(e)) return false;
  store.update((s) => (s.subscribers[e].unsubscribedAt = new Date().toISOString()));
  return true;
}

async function sendSampleEmail({ email, theme }) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) throw new Error('Email is not set up (RESEND_API_KEY and EMAIL_FROM)');
  const t = THEMES[theme];
  const link = `${process.env.PUBLIC_URL}/sample/${theme}.pdf`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#3f4a73;line-height:1.5">
    <h2 style="margin-bottom:4px">Your free ${t.name} mini hunt</h2>
    <p>Here's a 4-clue hunt you can print and play today. Each card has a picture of the next spot, so even kids who can't read yet can join in.</p>
    <p><a href="${link}" style="display:inline-block;background:#ef9d31;color:#2b1d06;padding:12px 22px;border-radius:99px;text-decoration:none;font-weight:bold">Download the mini hunt (PDF)</a></p>
    <p>Planning a birthday? Our scavenger hunts use your child's name and your own hiding spots, and come with a matching pretend play kit and party printables.</p>
    <p>Happy hunting! 🎉<br>LittlePrintQuests</p>
    <p style="font-size:12px;color:#8a90a8">You're getting this because you asked for a free sample. We'll send the occasional party idea. <a href="${unsubLink(email)}" style="color:#8a90a8">Unsubscribe</a></p></div>`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [email],
      reply_to: process.env.EMAIL_REPLY_TO || undefined,
      subject: `Your free ${t.name} mini hunt`,
      html,
      headers: { 'List-Unsubscribe': `<${unsubLink(email)}>` },
    }),
  });
  if (!res.ok) throw new Error(`Email failed: ${res.status} ${await res.text()}`);
}

// Saves the subscriber and emails the sample (once a day per address at most).
async function requestSample(body, ip) {
  if (tooMany(ip)) throw Object.assign(new Error('Too many requests. Please try again later.'), { status: 429 });
  const { email, theme } = validate(body);
  const prev = store.get().subscribers?.[email];
  store.update((s) => {
    s.subscribers ||= {};
    s.subscribers[email] = { email, theme, source: 'site-sample', subscribedAt: prev?.subscribedAt || new Date().toISOString(), lastSampleAt: prev?.lastSampleAt || null };
  });
  if (prev?.lastSampleAt && Date.now() - Date.parse(prev.lastSampleAt) < 86400e3) return;
  await samplePdf(theme);
  await sendSampleEmail({ email, theme });
  store.update((s) => (s.subscribers[email].lastSampleAt = new Date().toISOString()));
}

function subscribersCsv() {
  const rows = Object.values(store.get().subscribers || {}).filter((s) => !s.unsubscribedAt);
  const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return ['email,theme,source,subscribed_at', ...rows.map((s) => [s.email, s.theme, s.source, s.subscribedAt].map(q).join(','))].join('\n') + '\n';
}

module.exports = { requestSample, samplePdf, unsubscribe, subscribersCsv, unsubLink };
