// Writes the shop's Contact, Refunds, Privacy and Terms pages to docs/<page>/index.html.
// Change the words here and run `node scripts/help-pages.js`; the footer on the homepage links to them.

const fs = require('fs');
const path = require('path');

const DOCS = path.join(__dirname, '..', 'docs');
const EMAIL = 'hello@littleprintquests.com';
const UPDATED = 'October 22, 2026';
const mail = `<a href="mailto:${EMAIL}">${EMAIL}</a>`;

const PAGES = {
  contact: {
    title: 'Contact us',
    lede: 'A real person reads every message, usually within a day. If your party is today, say so in the subject line and we’ll jump on it.',
    body: `
<h2>Email</h2>
<p>${mail}</p>
<p>Already ordered? The fastest way is to reply to your order email, so we can see your order right away.</p>
<h2>Something wrong with your PDF?</h2>
<p>Tell us what to change, like a misspelled name or a hiding spot you don’t have, and we’ll send a new PDF free, usually the same day. See <a href="../refunds/">refunds</a> for the rest.</p>`,
  },
  refunds: {
    title: 'Our happy party promise',
    lede: 'Everything we make is a digital download, so nothing ships. If it isn’t right, we make it right.',
    body: `
<h2>Free fixes</h2>
<p>A typo, a name spelled wrong, a hiding spot that doesn’t fit your home, or a page that won’t print well: reply to your order email or write to ${mail} and we’ll send a corrected PDF free.</p>
<h2>Refunds</h2>
<p>If we can’t fix it, or the download never reached you, we’ll refund your order in full. Just ask within 30 days of buying. Refunds go back to the card or wallet you paid with and usually show up in 5 to 10 days.</p>
<h2>The Family Pass</h2>
<p>If you haven’t used any orders on your pass yet, we’ll refund it in full within 30 days of buying. Once you’ve used it, the free-fix promise covers every order you make with it.</p>`,
  },
  privacy: {
    title: 'Privacy',
    lede: 'We only ask for what we need to make your printables, and we never sell it.',
    body: `
<h2>What we collect</h2>
<ul class="tips">
<li><b>Your order details:</b> your child’s first name, age, theme, hiding spots, pets or toys you list, and party details for the invitations. We use them only to make your PDFs and Field Kit page.</li>
<li><b>Your email and name</b> from checkout, to send your download link and answer you.</li>
<li><b>Free sample sign-ups:</b> your email, to send the sample and the occasional party idea. Every email has an unsubscribe link.</li>
</ul>
<h2>Who helps us</h2>
<ul class="tips">
<li><b>Stripe</b> handles payments. We never see or store your card number.</li>
<li><b>Resend</b> sends our emails.</li>
<li><b>Anthropic (Claude)</b> helps write rhymes for hiding spots we haven’t seen before. It gets the order details above, never your payment or email.</li>
<li><b>Railway</b> hosts the server that builds and stores your PDFs.</li>
</ul>
<p>We don’t use advertising trackers, and we don’t sell or share your information with anyone else.</p>
<h2>Kids’ information</h2>
<p>This site is for parents and other grown-ups. We only know what you tell us about your child, which is usually a first name and age, and it’s used only to print on their pages.</p>
<h2>How long we keep it</h2>
<p>We keep your order so your download link and your Field Kit keep working, and so we can fix it if you ask. To have your order or email deleted, write to ${mail} and we’ll remove it.</p>`,
  },
  terms: {
    title: 'Terms of use',
    lede: 'The short version: print as many copies as you like for your own family, parties and classroom, and please don’t resell them.',
    body: `
<h2>What you’re buying</h2>
<p>Every order is a digital PDF, plus a Field Kit page for your phone where your order includes one. Nothing is shipped. Print at home on Letter paper, or at a print shop.</p>
<h2>How you can use it</h2>
<ul class="tips">
<li>Print and use it as often as you like for your own family, parties, playdates, classroom or homeschool group.</li>
<li>Don’t resell, share or post the files, or sell anything printed from them.</li>
</ul>
<h2>The Family Pass</h2>
<p>One payment covers six orders made within 12 months of buying. Unused orders expire after 12 months, and the pass never renews or charges you again. See <a href="../refunds/">refunds</a>.</p>
<h2>Safety</h2>
<p>Hunts are meant to be run by a grown-up. We skip unsafe hiding spots like the oven, but you know your home best, so please check each spot before you hide a card. Little cut-out pieces aren’t for children who still put things in their mouths.</p>
<h2>Questions</h2>
<p>Write to ${mail}.</p>`,
  },
};

const page = (slug, { title, lede, body }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · LittlePrintQuests</title>
<meta name="description" content="${lede.replace(/"/g, '&quot;')}">
<link rel="canonical" href="https://littleprintquests.com/${slug}/">
<link rel="icon" type="image/png" href="https://littleprintquests.com/img/favicon.png">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Atkinson+Hyperlegible:wght@400;700&display=swap">
<style>
:root { --paper:#fbf8f1; --ink:#3f4a73; --soft:#646d8f; --line:#e4dfd2; --orange:#ef9d31;
  --display:'Fredoka','Trebuchet MS',system-ui,sans-serif; --body:'Atkinson Hyperlegible','Segoe UI',system-ui,sans-serif; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --paper:#151a2e; --ink:#f4f0e6; --soft:#b4bad4; --line:#343c63; --orange:#f2a640; color-scheme:dark; } }
:root[data-theme="dark"] { --paper:#151a2e; --ink:#f4f0e6; --soft:#b4bad4; --line:#343c63; --orange:#f2a640; color-scheme:dark; }
* { box-sizing:border-box; }
body { margin:0; background:var(--paper); color:var(--ink); font:17px/1.6 var(--body); }
a { color:inherit; }
.wrap { max-width:720px; margin:0 auto; padding:0 16px; }
header { padding:18px 0; border-bottom:1px solid var(--line); }
header a { font:700 20px var(--display); text-decoration:none; }
header a span:nth-child(1) { color:#2f9a6b; } header a span:nth-child(2) { color:var(--orange); }
h1, h2 { font-family:var(--display); line-height:1.15; text-wrap:balance; }
h1 { font-size:clamp(32px,6vw,44px); margin:36px 0 12px; }
h2 { font-size:clamp(22px,4vw,26px); margin:36px 0 8px; }
.lede { font-size:19px; color:var(--soft); }
ul.tips li { margin-bottom:6px; }
small { color:var(--soft); }
footer { margin-top:56px; padding:28px 0 40px; border-top:1px solid var(--line); color:var(--soft); font-size:15px; }
</style>
</head>
<body>
<header><div class="wrap"><a href="../"><span>Little</span><span>Print</span><span>Quests</span></a></div></header>
<main class="wrap">
<h1>${title}</h1>
<p class="lede">${lede}</p>
${body.trim()}
<p><small>Last updated ${UPDATED}.</small></p>
</main>
<footer><div class="wrap">${Object.keys(PAGES).map((s) => `<a href="../${s}/">${PAGES[s].title.replace('Our happy party promise', 'Refunds')}</a>`).join(' · ')} · <a href="../">LittlePrintQuests</a></div></footer>
</body>
</html>
`;

for (const [slug, p] of Object.entries(PAGES)) {
  fs.mkdirSync(path.join(DOCS, slug), { recursive: true });
  fs.writeFileSync(path.join(DOCS, slug, 'index.html'), page(slug, p));
}
console.log(`Wrote ${Object.keys(PAGES).join(', ')} pages.`);
