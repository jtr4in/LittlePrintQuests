// Scheduled emails, so families come back:
// - Nurture: three short emails for people who asked for the free mini hunt (day 1, 4 and 9 after
//   signing up): play-together tips, why playing along matters, then one starring their own kid.
// - Monthly drop: on the 1st, every active Family Pass gets a free mini hunt in the month's theme and
//   a reminder of the orders left on it.
// Nothing sends unless MAIL_SCHEDULE=on. The admin page /admin/mail previews every email and says
// how many are due, so Jason can read them before turning it on.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const store = require('./store');
const pass = require('./pass');
const THEMES = require('../generator/themes');
const { renderPdf } = require('../generator/render');
const { sendEmail, esc } = require('./email');
const { unsubLink } = require('./sample');

const on = () => process.env.MAIL_SCHEDULE === 'on';
const site = () => process.env.SITE_URL || process.env.PUBLIC_URL;
const bot = () => process.env.PUBLIC_URL;
const DAY = 864e5;

// ---- Look ---------------------------------------------------------------------------------------
const btn = (href, label) => `<p><a href="${href}" style="display:inline-block;background:#ef9d31;color:#2b1d06;padding:12px 22px;border-radius:99px;text-decoration:none;font-weight:bold">${label}</a></p>`;
const wrap = (body, foot) => `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#3f4a73;line-height:1.55">${body}
  <p>Have fun out there! 🎉<br>LittlePrintQuests</p>
  <p style="font-size:12px;color:#8a90a8">${foot}</p></div>`;
const list = (items) => `<ul style="padding-left:20px">${items.map((x) => `<li style="margin-bottom:8px">${x}</li>`).join('')}</ul>`;

// ---- Nurture -------------------------------------------------------------------------------------
const NURTURE = [
  {
    day: 1,
    subject: () => '3 tricks to make your mini hunt even more fun',
    body: (sub) => `<h2 style="margin-bottom:4px">Make the mini hunt even better</h2>
      <p>A few things that make a simple hunt feel like a real adventure:</p>
      ${list([
        '<b>Use a voice.</b> Read the clues like a pirate, a robot or a very sleepy dragon. Silly beats perfect.',
        '<b>Let them hide one.</b> When it’s over, they hide the last card for you. Kids love being the one who knows.',
        '<b>End with a cheer.</b> A high five, a sticker or a photo of them holding the last card makes it feel finished.',
      ])}
      <p>The point isn’t a flawless hunt. It’s 20 minutes where you’re both in it together.</p>
      ${btn(`${bot()}/sample/${sub.theme}.pdf`, 'Print the mini hunt again')}`,
  },
  {
    day: 4,
    subject: () => 'Why playing along matters more than the toys',
    body: () => `<h2 style="margin-bottom:4px">You’re the best part</h2>
      <p>Pediatricians call play essential for kids, not extra: it’s how they practice planning, taking turns, finding words and handling a little frustration. And the American Academy of Pediatrics says it’s a grown-up’s presence and attention that enriches kids most, more than any toy.</p>
      <p>That’s nice to hear, and hard on a tired Tuesday. So here are three tiny ways in:</p>
      ${list([
        '<b>Be the customer.</b> “Excuse me, do you have any purple pancakes?” Then let them run the shop.',
        '<b>Ask one silly question.</b> “What would a dinosaur order for breakfast?” and go with the answer.',
        '<b>Follow, don’t lead.</b> Let them make the rules for ten minutes. You just play your part.',
      ])}
      <p>Our kits come with a <b>Field Kit</b> on your phone for exactly this: it gives you the next line to say, a quick challenge, customers for their shop and hints when they’re stuck, so you never have to make it all up.</p>
      ${btn(site(), 'See how it works')}`,
  },
  {
    day: 9,
    subject: () => 'Make the next one starring your kid',
    body: (sub) => {
      const t = THEMES[sub.theme] || THEMES.dino;
      return `<h2 style="margin-bottom:4px">The full ${esc(t.name)}, made for your kid</h2>
      <p>The mini hunt is a taste. The full set is made around your kid and your home:</p>
      ${list([
        'Their <b>name on every page</b>: the clue cards, the shop sign, the certificate and the party banner.',
        'Rhyming clues for <b>your own hiding spots</b>, like the dryer or Grandma’s chair.',
        'A <b>pretend play shop</b> to set up, activity pages and a party pack, all in the same theme.',
        'The <b>Field Kit</b> on your phone, so you can play right along.',
      ])}
      <p>Everything is $19.99 and ready to print in minutes.</p>
      ${btn(`${site().replace(/\/$/, '')}/make/?theme=${encodeURIComponent(sub.theme || 'dino')}`, 'Make my kit')}`;
    },
  },
];
const nurtureFoot = (email) => `You’re getting this because you asked for a free mini hunt. <a href="${unsubLink(email)}" style="color:#8a90a8">Unsubscribe</a>`;

// Who's due a nurture email now: signed up in the last 3 weeks (so older sign-ups don't get a burst
// when this is turned on), the next step's day has come, and nothing sent to them in the last 2 days.
function nurtureDue(now = Date.now()) {
  const out = [];
  for (const sub of Object.values(store.get().subscribers || {})) {
    if (sub.unsubscribedAt || !sub.subscribedAt) continue;
    const since = now - Date.parse(sub.subscribedAt);
    if (since > 21 * DAY) continue;
    const sent = sub.nurture || [];
    const step = NURTURE.findIndex((n, k) => !sent.includes(k));
    if (step < 0 || since < NURTURE[step].day * DAY) continue;
    if (sub.nurtureAt && now - Date.parse(sub.nurtureAt) < 2 * DAY) continue;
    out.push({ kind: 'nurture', step, sub });
  }
  return out;
}
const nurtureEmail = (sub, step) => ({ to: sub.email, subject: NURTURE[step].subject(sub), html: wrap(NURTURE[step].body(sub), nurtureFoot(sub.email)), unsub: unsubLink(sub.email) });

// ---- Monthly drop --------------------------------------------------------------------------------
// The month's theme and a 10-minute play idea.
const MONTHS = [
  ['ice', 'Build a “snow fort” from couch cushions and blankets, then hold a hot cocoa party inside it.'],
  ['valentine', 'Make a secret “kindness mailbox” from a shoebox and leave each other a note or drawing every day this week.'],
  ['unicorn', 'Hold a rainbow hunt: everyone finds one thing in the house for each color of the rainbow, in order.'],
  ['easter', 'Hide plastic eggs (or balled-up socks) and give clues in the warmer-colder style.'],
  ['construction', 'Build the tallest tower you can from boxes and cans, then knock it down with a “wrecking ball” (a sock).'],
  ['pirate', 'Draw a treasure map of your backyard or living room together, then bury (hide) a small treasure.'],
  ['mermaid', 'Turn bath time into an ocean rescue: plastic toys are sea creatures that need to be saved.'],
  ['space', 'Turn off the lights, grab a flashlight and go on a “planet tour” of the house, landing on each room.'],
  ['dino', 'Freeze small toys in a container of water overnight, then “excavate” them with warm water and spoons.'],
  ['halloween', 'Build a not-so-spooky fort, tell a silly ghost story by flashlight, and give the ghost a funny name.'],
  ['royal', 'Hold a royal feast: paper crowns, a fancy tablecloth and everyone has to speak in a royal voice at dinner.'],
  ['christmas', 'Run Santa’s workshop: wrap a few toys (or snacks) together and deliver them to every room.'],
];
const monthKey = (d = new Date()) => d.toISOString().slice(0, 7);
const monthName = (d = new Date()) => d.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
const dropTheme = (d = new Date()) => (THEMES[MONTHS[d.getUTCMonth()][0]] ? MONTHS[d.getUTCMonth()][0] : 'dino');

const dropToken = (id) => crypto.createHmac('sha256', `${process.env.ADMIN_PASSWORD}|drops`).update(id).digest('base64url').slice(0, 24);
const dropStop = (id) => `${bot()}/pass/${id}/stop-mail?t=${dropToken(id)}`;
function stopDrops(id, token) {
  const p = store.get().passes?.[id];
  if (!p || token !== dropToken(id)) return false;
  store.update((s) => (s.passes[id].dropsOff = new Date().toISOString()));
  return true;
}

function dropsDue(now = new Date()) {
  const key = monthKey(now);
  return Object.values(store.get().passes || {})
    .filter((p) => p.status === 'active' && p.email && !p.dropsOff && new Date(p.expiresAt) > now && !(p.drops || []).includes(key) && p.paidAt && p.paidAt.slice(0, 7) < key)
    .map((p) => ({ kind: 'drop', key, pass: p }));
}
function dropEmail(p, now = new Date()) {
  const theme = dropTheme(now), t = THEMES[theme], idea = MONTHS[now.getUTCMonth()][1];
  const ends = new Date(p.expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const body = `<h2 style="margin-bottom:4px">Your free ${esc(monthName(now))} mini hunt</h2>
    <p>A little something for Family Pass families: a 4-clue picture hunt in our ${esc(t.name)} theme, ready to print and play today.</p>
    ${btn(`${bot()}/drop/${theme}.pdf`, 'Print the mini hunt')}
    <p><b>A 10-minute play idea for this month:</b> ${esc(idea)}</p>
    <p>You have <b>${pass.left(p)} of ${p.total}</b> everything bundles left on your pass, until ${esc(ends)}. Your code: <b>${esc(p.code)}</b></p>
    ${pass.left(p) > 0 ? btn(`${site().replace(/\/$/, '')}/make/`, 'Make my next kit') : ''}`;
  return { to: p.email, subject: `Your free ${monthName(now)} mini hunt`, html: wrap(body, `You’re getting this because you have a LittlePrintQuests Family Pass. <a href="${dropStop(p.id)}" style="color:#8a90a8">Stop these monthly emails</a>`), unsub: dropStop(p.id) };
}

// The month's mini hunt (no sales line), made once per theme and kept on disk.
async function dropPdf(theme) {
  const file = path.join(store.PDF_DIR, `drop-${theme}.pdf`);
  if (!fs.existsSync(file)) await renderPdf({ theme, spots: ['toy_box', 'couch', 'fridge', 'kitchen_table'], pictures: true }, file);
  return file;
}

// ---- Sending -------------------------------------------------------------------------------------
let running = false;
async function run({ now = new Date(), force = false } = {}) {
  if ((!on() && !force) || running) return { sent: 0 };
  running = true;
  let sent = 0;
  try {
    for (const d of [...nurtureDue(now.getTime()), ...dropsDue(now)]) {
      try {
        if (d.kind === 'nurture') {
          await sendEmail(nurtureEmail(d.sub, d.step));
          store.update((s) => { const x = s.subscribers[d.sub.email]; x.nurture = [...(x.nurture || []), d.step]; x.nurtureAt = now.toISOString(); });
        } else {
          await dropPdf(dropTheme(now));
          await sendEmail(dropEmail(d.pass, now));
          store.update((s) => { const x = s.passes[d.pass.id]; x.drops = [...(x.drops || []), d.key]; });
        }
        sent++;
        await new Promise((r) => setTimeout(r, 600)); // gentle on the email service
      } catch (err) {
        console.error(`Scheduled email (${d.kind}) failed:`, err.message);
      }
    }
  } finally {
    running = false;
  }
  return { sent };
}

// The admin preview: every email with sample data, and what would go out right now.
function preview() {
  const now = new Date();
  const sub = { email: 'parent@example.com', theme: 'dino' };
  const p = { id: 'pass-preview', code: 'LPQ-ABCD-EFGH', total: 6, uses: ['a', 'b'], expiresAt: new Date(Date.now() + 200 * DAY).toISOString(), email: 'parent@example.com' };
  const due = { nurture: nurtureDue().length, drops: dropsDue(now).length };
  const card = (label, e) => `<section style="border:1px solid #ddd;border-radius:12px;padding:12px 16px;margin:16px 0"><p style="color:#888;margin:0">${esc(label)}</p><p><b>Subject:</b> ${esc(e.subject)}</p>${e.html}</section>`;
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Scheduled emails</title>
  <body style="font-family:system-ui,sans-serif;max-width:640px;margin:20px auto;padding:0 14px;color:#2c3352">
  <p><a href="/admin">← Admin</a></p><h1>Scheduled emails</h1>
  <p>Sending is <b>${on() ? 'ON' : 'OFF'}</b>. ${on() ? '' : 'Nothing goes out until <code>MAIL_SCHEDULE=on</code> is set in Railway.'}</p>
  <p>Due right now: <b>${due.nurture}</b> nurture email${due.nurture === 1 ? '' : 's'} and <b>${due.drops}</b> monthly drop${due.drops === 1 ? '' : 's'} (${esc(monthName(now))}: ${esc(THEMES[dropTheme(now)].name)}).</p>
  ${NURTURE.map((n, k) => card(`Nurture ${k + 1} of ${NURTURE.length} · day ${n.day} after asking for the free mini hunt`, nurtureEmail(sub, k))).join('')}
  ${card(`Monthly drop · the 1st of each month to Family Pass holders (this month: ${THEMES[dropTheme(now)].name})`, dropEmail(p, now))}
  </body>`;
}

module.exports = { run, preview, nurtureDue, dropsDue, nurtureEmail, dropEmail, dropPdf, stopDrops, dropTheme, NURTURE, MONTHS };
