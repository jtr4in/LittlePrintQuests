// (Unused while Pinterest offers no RSS import on this account; pin-csv.js makes the bulk upload instead.)
// Adds the next pins from docs/pins/pool.json to the Pinterest RSS feeds, one per board feed per run
// (or the number given), and rewrites docs/pins/<feed>.xml. Pinterest's "Auto-publish" reads each
// feed and posts new items to the board it was linked to. The holiday that's coming up goes first.
// docs/pins/published.json remembers what went out when. Run it daily to drip pins into the feeds.
//   node scripts/pin-feed.js [per-feed]
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'docs', 'pins');
const SITE = 'https://littleprintquests.com/';
const BOARDS = {
  'scavenger-hunts': 'Kids Scavenger Hunts',
  'pretend-play': 'Pretend Play Printables',
  'activity-pages': 'Kids Activity Pages',
  'party-printables': 'Kids Birthday Party Printables',
};
const KEEP = 60; // items kept in each feed
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);

// The holiday pins to push now: from about six weeks before the day until the day itself.
function inSeason(now) {
  const m = now.getUTCMonth() + 1, d = now.getUTCDate(), md = m * 100 + d;
  return [
    ['halloween', 915, 1031], ['christmas', 1101, 1225], ['valentine', 101, 214], ['easter', 301, 420],
  ].filter(([, from, to]) => md >= from && md <= to).map(([id]) => id);
}
const holiday = (pin) => ['halloween', 'christmas', 'valentine', 'easter'].find((h) => pin.id.endsWith(`-${h}`));

function run(perFeed = 1, now = new Date()) {
  const pool = JSON.parse(fs.readFileSync(path.join(DIR, 'pool.json'), 'utf8'));
  const file = path.join(DIR, 'published.json');
  const published = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  const season = inSeason(now);
  const added = [];
  for (const feed of Object.keys(BOARDS)) {
    // Holiday pins wait for their season; the one coming up jumps the queue.
    const next = pool
      .filter((p) => p.feed === feed && !published[p.id] && (!holiday(p) || season.includes(holiday(p))))
      .sort((a, b) => Boolean(holiday(b)) - Boolean(holiday(a)));
    for (const p of next.slice(0, perFeed)) {
      published[p.id] = now.toISOString();
      added.push(p.id);
    }
  }
  fs.writeFileSync(file, JSON.stringify(published, null, 1) + '\n');
  for (const [feed, board] of Object.entries(BOARDS)) {
    const items = pool.filter((p) => p.feed === feed && published[p.id]).sort((a, b) => (published[a.id] < published[b.id] ? 1 : -1)).slice(0, KEEP);
    fs.writeFileSync(path.join(DIR, `${feed}.xml`), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
<channel>
<title>LittlePrintQuests: ${esc(board)}</title>
<link>${SITE}</link>
<description>${esc(board)} from LittlePrintQuests, printable and personalized for kids.</description>
<language>en-us</language>
${items.map((p) => `<item>
<title>${esc(p.title)}</title>
<link>${esc(p.link)}</link>
<guid isPermaLink="false">${esc(p.id)}</guid>
<pubDate>${new Date(published[p.id]).toUTCString()}</pubDate>
<description>${esc(p.description)}</description>
<enclosure url="${esc(p.image)}" type="image/jpeg" length="0"/>
<media:content url="${esc(p.image)}" medium="image" type="image/jpeg" width="1000" height="1500"/>
</item>`).join('\n')}
</channel>
</rss>
`);
  }
  return added;
}

if (require.main === module) {
  const added = run(Number(process.argv[2]) || 1);
  console.log(added.length ? `Added ${added.join(', ')}` : 'Nothing new to add');
}
module.exports = { run, inSeason };
