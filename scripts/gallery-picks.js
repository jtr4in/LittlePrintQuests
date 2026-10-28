// Which pages the website's preview popup shows for each product, about half of each (Jason,
// 2026-10-27): hunt 6, party pack 8, activity pack 10 per age, play kit 15 per age (welcome poster,
// sign, wow piece, the big pictures, then hands-on pages). Each function takes the page titles that
// renderHtml(..., { titles }) writes ([{ title, kind }], one per page) and returns [{ n, cap }] in page
// order, with n the 1-based page number. Captions use {N} for the kid's name; the site fills it in.
// gallery-images.js turns these into docs/img/gallery/<theme>/pages.json.

const SAMPLE = /\bMaya\b|\bMAYA\b/; // no g flag: .test() would keep state between calls
const named = (s) => String(s || '').replace(new RegExp(SAMPLE.source, 'g'), '{N}');
const has = (p, cls) => ` ${p.kind} `.includes(` ${cls} `);
const pages = (titles) => titles.map((p, i) => ({ ...p, n: i + 1 }));
const byPage = (list) => list.sort((a, b) => a.n - b.n);
// Evenly spread picks: count items from list, first and last included.
const spread = (list, count) => (count >= list.length ? list : Array.from({ length: count }, (_, i) => list[Math.round((i * (list.length - 1)) / Math.max(1, count - 1))]));

const HUNT = [
  ['host', 'Host guide and hiding checklist'], ['briefing', 'Mission briefing to read aloud'], ['sheet', 'Clue cards'],
  ['puzzle', 'Puzzle finale'], ['cert', 'Certificate'], ['pic-cards', 'Bonus game: picture hunt cards'],
];
function huntPicks(titles) {
  const ps = pages(titles);
  return byPage(HUNT.map(([cls, cap]) => { const p = ps.find((x) => has(x, cls)); return p && { n: p.n, cap }; }).filter(Boolean));
}

// One of each kind of party page (the name banner runs over several pages, the food tents over two).
function partyPicks(titles, max = 8) {
  const seen = new Set();
  const out = [];
  for (const p of pages(titles)) {
    const key = p.title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ n: p.n, cap: has(p, 'guide') ? 'Party plan and checklist' : named(p.title) });
  }
  return out.slice(0, max);
}

// Activities in order of how well they show the pack. Dot the Letter is never shown: its big letter is
// the sample name's, which the name overlay can't change.
const ACT = {
  big: ['act-cover', 'og-paper', 'og-how', 'wp-spy', 'wp-code', 'wp-color', 'wp-roll', 'wp-maze', 'wp-move-board', 'wp-words', 'wp-spotdiff', 'wp-match', 'wp-story', 'wp-design'],
  little: ['act-cover', 'og-paper', 'og-how', 'wp-path', 'wp-glue', 'wp-color', 'wp-spy', 'wp-shapes', 'wp-move-board', 'wp-maze', 'wp-spotdiff', 'wp-count', 'wp-match'],
};
function activityPicks(titles, ages = 'big', max = 10) {
  const ps = pages(titles).filter((p) => !has(p, 'wp-dots'));
  const out = [];
  for (const cls of ACT[ages === 'little' ? 'little' : 'big']) {
    const p = ps.find((x) => has(x, cls) && !out.includes(x));
    if (p && out.length < max) out.push(p);
  }
  return byPage(out).map((p) => ({ n: p.n, cap: has(p, 'act-cover') ? 'Activity pack checklist' : has(p, 'wp-move-board') ? `${named(p.title)}: move game board` : named(p.title) }));
}

// The play kit: the welcome poster, sign and wow piece (fixed page numbers from gallery-images.js),
// then hands-on pages to make up `max` with the big pictures (which the site adds from BIGPICS).
// Every toy page comes first, then the liveliest kinds of page (badges, photo booth disguises, the
// menu board, passports, forms...), then whatever is left spread through the kit. Pages that only repeat
// (three check-up forms, two coin sheets), the grown-up guide, blank certificate, big sign halves,
// door signs and pages titled by their instructions are left out.
const LIVELY = ['badges', 'dg', 'menu-board', 'passports', 'recs', 'recipe', 'morning', 'specials-page', 'money-page', 'cert'];
const SKIP = ['guide', 'bigpic', 'big-sign', 'blank', 'ct-page', 'appliance', 'rxs', 'signs', 'poster', 'wow'];
function kitPicks(titles, { poster, sign, wow, big = 0, max = 15 }) {
  const ps = pages(titles);
  const fixed = [
    { n: poster, cap: 'Welcome poster' },
    { n: sign, cap: SAMPLE.test(ps[sign - 1]?.title) ? `Sign: ${named(ps[sign - 1].title)}` : 'Big shop sign' },
    { n: wow, cap: `Wow piece: ${named(ps[wow - 1]?.title)}` },
  ];
  const seen = new Set();
  const pool = ps.filter((p) => {
    if (p.n <= 1 || [poster, sign, wow].includes(p.n) || SKIP.some((c) => has(p, c))) return false;
    const key = p.title.toLowerCase().replace(/\s*\(more\)$/, '');
    if (!/[a-z]/i.test(key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const room = Math.max(0, max - fixed.length - big);
  const out = pool.filter((p) => has(p, 'toy')).slice(0, room);
  for (const cls of LIVELY) {
    const p = pool.find((x) => has(x, cls) && !out.includes(x));
    if (p && out.length < room) out.push(p);
  }
  out.push(...spread(pool.filter((p) => !out.includes(p)), room - out.length));
  return { fixed, hands: byPage(out).map((p) => ({ n: p.n, cap: named(p.title) })) };
}

module.exports = { huntPicks, partyPicks, activityPicks, kitPicks, named };
