// Draws the link preview shown when the site is shared (Messenger, iMessage, Facebook...).
//   node scripts/share-image.js   -> docs/img/share.jpg
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const D = path.resolve('docs/img');
const img = (f) => `data:image/${f.endsWith('png') ? 'png' : 'webp'};base64,${fs.readFileSync(path.join(D, f)).toString('base64')}`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.setContent(`<!doctype html><html><head>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Atkinson+Hyperlegible:wght@400;700&display=swap">
<style>
body{margin:0;width:1200px;height:630px;overflow:hidden;background:#fbf8f1;font-family:'Atkinson Hyperlegible';color:#3f4a73;position:relative}
.brand{position:absolute;left:64px;top:56px;display:flex;align-items:center;gap:14px;font:700 34px Fredoka}
.brand img{width:76px}
.l{color:#6fcf9c}.p{color:#ef9d31}.q{color:#475379}
h1{position:absolute;left:64px;top:170px;width:560px;margin:0;font:700 66px/1.02 Fredoka;color:#2f3760}
h1 em{font-style:normal;background:linear-gradient(transparent 62%,#89dcb0 62%)}
.sub{position:absolute;left:64px;top:360px;width:520px;font-size:27px;line-height:1.35;color:#646d8f}
.pill{position:absolute;left:64px;top:480px;background:#ef9d31;color:#2b1d06;font:700 24px Atkinson Hyperlegible;padding:14px 26px;border-radius:999px}
.pg{position:absolute;width:300px;border-radius:8px;box-shadow:0 14px 34px rgba(40,40,70,.22);background:#fff}
.trail{position:absolute;right:-40px;top:-40px;width:640px;height:720px;background:radial-gradient(circle at 60% 50%,#dff3e7 0,#fbf8f1 70%)}
</style></head><body>
<div class="trail"></div>
<div class="brand"><img src="${img('mark.png')}"><span><span class="l">Little</span><span class="p">Print</span><span class="q">Quests</span></span></div>
<h1>A treasure hunt <em>made for your kid</em></h1>
<div class="sub">Printable birthday scavenger hunts with their name and your home’s own hiding spots. Ages 2 to 8.</div>
<div class="pill">Ready to print in minutes</div>
<img class="pg" src="${img('pages/unicorn-party.webp')}" style="left:690px;top:120px;transform:rotate(-9deg)">
<img class="pg" src="${img('pages/pirate-kit.webp')}" style="left:880px;top:150px;transform:rotate(8deg)">
<img class="pg" src="${img('pages/dino-briefing.webp')}" style="left:780px;top:70px;transform:rotate(-1deg)">
</body></html>`, { waitUntil: 'networkidle' });
  await p.screenshot({ path: process.argv[2] || path.join(D, 'share.jpg'), type: 'jpeg', quality: 88 });
  await b.close();
})();
