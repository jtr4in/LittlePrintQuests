// Sends the finished hunt to website buyers through Resend (resend.com).

const THEMES = require('../generator/themes');
const { kitForHunt, KITS } = require('../kits/engine');
const { HOLIDAYS, craftLabel } = require('../crafts/build');
const products = require('./products');
const store = require('./store');
const pass = require('./pass');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function sendHuntEmail(order) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) throw new Error('Email is not set up (RESEND_API_KEY and EMAIL_FROM)');
  const theme = THEMES[order.config.theme];
  const pdf = `${process.env.PUBLIC_URL}/d/${order.downloadToken}.pdf`;
  const main = products.mainOf(order);
  const kit = KITS[order.config.kit] || (order.config.theme && kitForHunt(order.config.theme));
  const title = { hunt: theme?.name, kit: `${kit?.name} play kit`, activity: `${kit?.name} activity pack`, party: `${theme?.label} party pack`, craft: craftLabel(HOLIDAYS[order.config.holiday]) }[main];
  // The add-on offer, same as the order page's (website checkout must be on).
  const upgrade = process.env.STRIPE_SECRET_KEY && products.upgradeFor(order);
  const btn = (href, label) => `<p><a href="${href}" style="display:inline-block;background:#ef9d31;color:#2b1d06;padding:12px 22px;border-radius:99px;text-decoration:none;font-weight:bold">${label}</a></p>`;
  const tips = {
    hunt: 'print at “Actual Size / 100%”, cut out the clue cards, and use the Host Guide on page 1 to hide them. Read the Mission Briefing aloud to start.',
    kit: 'print at “Actual Size / 100%” and start with the grown-up guide on page 1.',
    activity: 'print at “Actual Size / 100%” and slip the pages into sheet protectors to use with a dry-erase marker.',
    party: 'print at “Actual Size / 100%”. Invitations, cupcake toppers and the banner look best on cardstock.',
    craft: 'print the keepsake pages on white cardstock at “Actual Size / 100%” and start with the tips on page 1.',
  }[main];
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#3f4a73;line-height:1.5">
    <h2 style="margin-bottom:4px">${esc(order.config.childName)}’s ${esc(title)} is ready!</h2>
    <p>Thanks for your order! Your printable ${esc(products.describe(products.itemsOf(order)))} ${products.itemsOf(order).length > 1 ? 'are' : 'is'} ready to download.</p>
    ${btn(pdf, `Download your ${products.NAMES[main]} (PDF)`)}
    ${order.kitReady ? btn(pdf.replace(/\.pdf$/, '-kit.pdf'), `Download the ${esc(kit.name)} play kit (PDF)`) : ''}
    ${order.activityReady ? btn(pdf.replace(/\.pdf$/, '-activities.pdf'), 'Download the activity pack (PDF)') : ''}
    ${order.partyReady ? btn(pdf.replace(/\.pdf$/, '-party.pdf'), 'Download the party printables (PDF)') : ''}
    ${order.hostToken ? `<p><b>New: your Field Kit.</b> Open this on your phone${products.has(order, 'hunt') ? ' on party day' : ''}. It ${esc(products.hostHelps(order))}.</p>${btn(`${process.env.PUBLIC_URL}/h/${order.hostToken}`, 'Open your Field Kit')}` : ''}
    <p><b>Quick setup:</b> ${tips}${order.kitReady ? ' The play kit has its own grown-up guide on page 1.' : ''}</p>
    ${order.passId && store.get().passes?.[order.passId] ? `<p>Made with your Family Pass: <b>${pass.left(store.get().passes[order.passId])} of ${store.get().passes[order.passId].total}</b> orders left.</p>` : ''}
    ${upgrade ? `<div style="border:2px dashed #ef9d31;border-radius:14px;padding:4px 16px 12px;margin:20px 0"><p><b>Make it the whole set for $${(upgrade.cents / 100).toFixed(2)}</b><br>Add the ${esc(products.describe(upgrade.add))}, already made with ${esc(order.config.childName)}’s name. Worth $${(upgrade.worth / 100).toFixed(2)} on their own.</p>${btn(`${process.env.PUBLIC_URL}/order/${order.id}/add`, `Add to my order · $${(upgrade.cents / 100).toFixed(2)}`)}</div>` : ''}
    <p>Something not right? Just reply to this email and we’ll fix it, or refund you if we can’t.</p>
    <p>${main === 'craft' ? 'Have fun! 🎨' : 'Have an amazing party! 🎉'}<br>LittlePrintQuests</p></div>`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [order.email],
      reply_to: process.env.EMAIL_REPLY_TO || undefined,
      subject: `Your ${title} for ${order.config.childName} is ready`,
      html,
    }),
  });
  if (!res.ok) throw new Error(`Email failed: ${res.status} ${await res.text()}`);
}

// The Family Pass code, sent once Stripe confirms payment.
async function sendPassEmail(pass) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) throw new Error('Email is not set up (RESEND_API_KEY and EMAIL_FROM)');
  const site = process.env.SITE_URL || process.env.PUBLIC_URL;
  const ends = new Date(pass.expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#3f4a73;line-height:1.5">
    ${pass.gift ? `<h2 style="margin-bottom:4px">${esc(pass.gift.from || pass.buyerName || 'Someone')} gave you a Family Pass! 🎁</h2>
    ${pass.gift.message ? `<p style="background:#fbf3df;border-radius:10px;padding:12px 16px;font-style:italic">“${esc(pass.gift.message)}”</p>` : ''}
    <p>LittlePrintQuests makes printable play starring your kid: a treasure hunt for your house, a pretend play shop, activity pages and a party pack, with their name on every page and a guide on your phone so you can play along.</p>` : '<h2 style="margin-bottom:4px">Your Family Pass is ready!</h2>'}
    <p>${pass.gift ? 'Your' : 'Thanks for joining! Your'} pass covers <b>${pass.total} orders</b> on our website until <b>${ends}</b>. Each one can be the whole bundle: the scavenger hunts, their pretend play kit, the activity pack and the party pack, in any theme, for any of your kids.</p>
    <p style="font-size:13px;margin-bottom:2px">Your pass code:</p>
    <p style="font:bold 26px/1.2 'Courier New',monospace;letter-spacing:2px;background:#fbf3df;border-radius:10px;padding:14px 18px;display:inline-block;margin-top:0">${esc(pass.code)}</p>
    <p><b>How to use it:</b> build your order on our site, then type this code under “Have a Family Pass code?” next to the total. Your order is free and arrives in minutes, like always.</p>
    <p><a href="${site}#order" style="display:inline-block;background:#ef9d31;color:#2b1d06;padding:12px 22px;border-radius:99px;text-decoration:none;font-weight:bold">Make my first order</a></p>
    <p>Keep this email so the code is easy to find. Something not right? Just reply and we’ll help.</p>
    <p>Have an amazing year! 🎉<br>LittlePrintQuests</p></div>`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [pass.email], reply_to: process.env.EMAIL_REPLY_TO || undefined, subject: pass.gift ? `${pass.gift.from || pass.buyerName || 'Someone'} gave you a LittlePrintQuests Family Pass 🎁` : `Your LittlePrintQuests Family Pass code: ${pass.code}`, html }),
  });
  if (!res.ok) throw new Error(`Email failed: ${res.status} ${await res.text()}`);
}

// The buyer's receipt for a gifted Family Pass.
async function sendGiftReceipt(pass) {
  if (!pass.buyerEmail) return;
  const ends = new Date(pass.expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#3f4a73;line-height:1.5">
    <h2 style="margin-bottom:4px">Your gift is on its way 🎁</h2>
    <p>We emailed a Family Pass to <b>${esc(pass.gift.to)}</b>${pass.gift.message ? ' with your note' : ''}. It covers ${pass.total} everything bundles until ${esc(ends)}.</p>
    <p>Their code, if you’d like to write it in a card: <b style="font-family:'Courier New',monospace">${esc(pass.code)}</b></p>
    <p>Thank you for giving play! If anything’s not right, just reply to this email.</p>
    <p>LittlePrintQuests</p></div>`;
  return sendEmail({ to: pass.buyerEmail, subject: `Your Family Pass gift for ${pass.gift.to} is on its way`, html });
}

// Any other email: one Resend call. `unsub` adds the List-Unsubscribe header.
async function sendEmail({ to, subject, html, unsub }) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) throw new Error('Email is not set up (RESEND_API_KEY and EMAIL_FROM)');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [to], reply_to: process.env.EMAIL_REPLY_TO || undefined, subject, html, ...(unsub ? { headers: { 'List-Unsubscribe': `<${unsub}>` } } : {}) }),
  });
  if (!res.ok) throw new Error(`Email failed: ${res.status} ${await res.text()}`);
}

module.exports = { sendHuntEmail, sendPassEmail, sendGiftReceipt, sendEmail, esc };
