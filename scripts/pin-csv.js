// Writes the Pinterest bulk upload file (Settings > Import content > Upload .csv) for the pins in
// docs/pins/pool.json, scheduled four a day for the next 30 days. The holiday coming up goes first
// (Christmas pins wait until November 1); Valentine's and Easter pins wait for a later file.
//   node scripts/pin-csv.js [start YYYY-MM-DD] > pins.csv
const fs = require('fs');
const path = require('path');

const BOARDS = {
  'scavenger-hunts': 'Kids Scavenger Hunts',
  'pretend-play': 'Pretend Play Printables',
  'activity-pages': 'Kids Activity Pages',
  'party-printables': 'Kids Birthday Party Printables',
};
const HOURS = [14, 17, 20, 23]; // UTC: US morning, lunch, afternoon and evening
const DAYS = 30; // Pinterest schedules up to 30 days ahead
const holiday = (p) => ['halloween', 'christmas', 'valentine', 'easter'].find((h) => p.id.endsWith(`-${h}`));
const cell = (s) => `"${String(s).replace(/"/g, '""')}"`;
const kind = (p) => p.id.split('-')[0];

function rows(pool, start) {
  // The day's four pins mix the kinds: a hunt, a kit, an activity pack, a party pack...
  const byKind = {};
  for (const p of pool.filter((x) => !holiday(x))) (byKind[kind(p)] ||= []).push(p);
  const mixed = [];
  for (let i = 0; Object.values(byKind).some((l) => l[i]); i++) for (const l of Object.values(byKind)) if (l[i]) mixed.push(l[i]);
  const slots = [];
  for (let d = 0; d < DAYS; d++) for (const h of HOURS) slots.push(new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + d, h)));
  const halloween = pool.filter((p) => holiday(p) === 'halloween');
  const christmas = pool.filter((p) => holiday(p) === 'christmas');
  const out = [];
  for (const when of slots) {
    const md = (when.getUTCMonth() + 1) * 100 + when.getUTCDate();
    // Each holiday's pins go out one a day, first thing, while it is coming up.
    const first = when.getUTCHours() === HOURS[0];
    const p = (first && md <= 1031 && halloween.shift()) || (first && md >= 1101 && md <= 1225 && christmas.shift()) || mixed.shift();
    if (p) out.push([p, when]);
  }
  return out;
}

if (require.main === module) {
  const pool = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'docs', 'pins', 'pool.json'), 'utf8'));
  const start = process.argv[2] ? new Date(`${process.argv[2]}T00:00:00Z`) : new Date(Date.now() + 864e5);
  const lines = rows(pool, start).map(([p, when]) =>
    [p.title, p.image, BOARDS[p.feed], '', p.description, p.link, when.toISOString().slice(0, 19), ''].map(cell).join(','));
  process.stdout.write(['Title,Media URL,Pinterest board,Thumbnail,Description,Link,Publish date,Keywords', ...lines].join('\n') + '\n');
}
module.exports = { rows };
