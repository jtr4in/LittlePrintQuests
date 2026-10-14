// Sends the finished hunt to website buyers through Resend (resend.com).

const THEMES = require('../generator/themes');
const { kitForHunt } = require('../kits/engine');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function sendHuntEmail(order) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) throw new Error('Email is not set up (RESEND_API_KEY and EMAIL_FROM)');
  const theme = THEMES[order.config.theme];
  const pdf = `${process.env.PUBLIC_URL}/d/${order.downloadToken}.pdf`;
  const kit = order.kitReady ? kitForHunt(order.config.theme) : null;
  const btn = (href, label) => `<p><a href="${href}" style="display:inline-block;background:#ef9d31;color:#2b1d06;padding:12px 22px;border-radius:99px;text-decoration:none;font-weight:bold">${label}</a></p>`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#3f4a73;line-height:1.5">
    <h2 style="margin-bottom:4px">${esc(order.config.childName)}’s ${esc(theme.name)} is ready!</h2>
    <p>Thanks for your order! Your printable scavenger hunt${kit ? ` and ${esc(kit.name)} play kit are` : ' is'} ready to download.</p>
    ${btn(pdf, 'Download your hunt (PDF)')}
    ${kit ? btn(pdf.replace(/\.pdf$/, '-kit.pdf'), `Download the ${esc(kit.name)} play kit (PDF)`) : ''}
    <p><b>Quick setup:</b> print at “Actual Size / 100%”, cut out the clue cards, and use the Host Guide on page 1 to hide them. Read the Mission Briefing aloud to start.${kit ? ' The play kit has its own grown-up guide on page 1.' : ''}</p>
    <p>Something not right? Just reply to this email and we’ll fix it.</p>
    <p>Have an amazing party! 🎉<br>LittlePrintQuests</p></div>`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [order.email],
      reply_to: process.env.EMAIL_REPLY_TO || undefined,
      subject: `Your ${theme.name} for ${order.config.childName} is ready`,
      html,
    }),
  });
  if (!res.ok) throw new Error(`Email failed: ${res.status} ${await res.text()}`);
}

module.exports = { sendHuntEmail };
