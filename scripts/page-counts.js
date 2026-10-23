// Usage: node scripts/page-counts.js
// Renders every product the way an order does and prints the PAGES line for docs/js/data.js, which
// shows the page count bubbles on the order stack and the kit cards. Re-run it after adding pages.
// Hunts don't need a row per theme: they're the same for all of them, 7 pages plus a sheet per two clue cards.
const { chromium } = require('playwright');
const { buildHtml } = require('../src/generator/build');
const { buildKitHtml, activityPackHtml, kitForHunt } = require('../src/kits/engine');
const { buildPartyHtml } = require('../src/party/build');
const { buildCraftHtml } = require('../src/crafts/build');
const THEMES = require('../src/generator/themes');
const SPOTS = Object.keys(require('../src/generator/spots'));

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const count = async (html) => {
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const pdf = await page.pdf({ format: 'Letter', printBackground: true, preferCSSPageSize: true });
    return (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  };
  const kid = { childName: 'Maya', age: 5 };
  // Check the hunt rule on one theme before relying on it.
  for (const n of [6, 7, 10]) {
    const got = await count(buildHtml({ theme: 'dino', ...kid, spots: SPOTS.slice(0, n) }));
    if (got !== 7 + Math.ceil(n / 2)) throw new Error(`A ${n}-spot hunt has ${got} pages; update the hunt rule here and in docs/js/data.js`);
  }
  const pages = { kit: {}, activity: {}, party: await count(buildPartyHtml({ theme: 'dino', ...kid })), craft: {} };
  for (const ages of ['big', 'little']) pages.activity[ages] = await count(activityPackHtml({ kit: 'dino', ...kid, ages, lenient: true, subjects: [] }));
  for (const id of Object.keys(THEMES)) {
    pages.kit[id] = await count(buildKitHtml({ kit: kitForHunt(id).id, ...kid, lenient: true, withHunt: true, subjects: [] }));
  }
  for (const holiday of ['halloween', 'christmas', 'memory', 'zoo', 'fingerprint']) pages.craft[holiday] = await count(buildCraftHtml({ holiday, ...kid }));
  await browser.close();
  console.log(`const PAGES = ${JSON.stringify(pages)};`);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
