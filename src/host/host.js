// Field Kit: the grown-up's phone page for everything in the order, in three tabs.
//  - Hunt: hiding the cards and running the hunt, one tap at a time, with lines to say, hints
//    and quick challenges. A second link gives a helper (the "sidekick") their own cues.
//  - Play Kit: setup, pretend-play scenarios, things to say and games for the kit.
//  - Party: a planning checklist from the invitations to the thank-you cards.
// Tabs for things the order doesn't include are greyed out. A "Get ready" tab comes first: what to
// print on what paper, a prep checklist, a party countdown and the party-day links.
// Extras (2026-10-23, src/host/client/fieldkit.js): theme sound boards, confetti, photos kept on
// the phone with a themed photo PDF, a "Mission complete" keepsake, a Shop day mode for the play
// kit, a Mission screen for the kids (missionPage) and offline support (serviceWorker, manifest).
//
// These pages come with Etsy orders too, so they stay plain: no shop links, prices or offers.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const THEMES = require('../generator/themes');
const { planHunt } = require('../generator/build');
const SCRIPTS = require('./scripts');
const { KITS, kitForHunt } = require('../kits/engine');
const { checklist } = require('./party');
const art = require('../kits/art');

const CLIENT = fs.readFileSync(path.join(__dirname, 'client', 'fieldkit.js'), 'utf8');
const ROOT = path.join(__dirname, '..', '..');

const possessive = (name) => (/s$/i.test(name) ? `${name}’` : `${name}’s`);
const play = (kit) => { try { return require(`./play/${kit.id}`); } catch { return null; } };

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fill = (text, ctx) => text.replace(/\{(\w+)\}/g, (_, k) => ctx[k] ?? '');

function hints(spot) {
  return [
    'Read the last two lines of the clue again, slowly. Ask: “What do we do there?”',
    `Play hot and cold. Walk slowly toward the ${spot.label} and say “warmer” as they get close.`,
    `Point them right to the ${spot.label}. (${spot.tip})`,
  ];
}

// Every screen of Field Kit, plus the sidekick's cue for each one.
function plan(order, sidekickUrl, missionUrl = null) {
  const cfg = order.config;
  const { theme, cards, prize, puzzle, bonus } = planHunt(cfg);
  const s = SCRIPTS[cfg.theme];
  const name = cfg.childName || 'our birthday star';
  const kids = cfg.childName ? `${cfg.childName} and the ${theme.hunters}` : theme.hunters;
  const ctx = { name, kids, count: cards.length, prize: prize.label, age: cfg.age || '' };
  const n = cards.length;
  const steps = [];

  steps.push({ phase: 'setup', title: 'Let’s hide the cards', body: [`You have ${n} clue cards. Keep Card 1 with you, and hide the other ${n - 1} in the order on the next screens.`, 'Do this while the kids are busy, or the night before.'] });
  if (puzzle) steps.push({ phase: 'setup', title: 'Cut out the puzzle', body: [`The puzzle page has ${n} numbered pieces, one for each card. Tuck piece 1 behind Card 1, piece 2 behind Card 2, and so on.`, 'The kids collect a piece at every stop. At the last clue, they put the puzzle together to see where the prize is.'] });
  for (const c of cards.slice(1)) {
    steps.push({ phase: 'setup', check: true, title: `Hide Card ${c.n}`, spot: c.hiddenAt.label, body: [c.hiddenAt.tip], small: `Its riddle sends the kids to the ${c.leadsTo.label}.${puzzle ? ` Puzzle piece ${c.n} goes with it.` : ''}` });
  }
  steps.push({ phase: 'setup', check: true, title: 'Hide the prize', spot: prize.label, body: [`Cake, favor bags or treasure: it all goes at the ${prize.label}. The last clue leads here.`] });
  if (missionUrl) steps.push({ phase: 'setup', title: 'A screen for the kids', mission: missionUrl, body: ['Open this on a tablet or a spare phone and prop it up where the kids can see it. It shows their clues filling in, the quick challenges, and a big finish with confetti.', 'It follows along as you tap Next, and never shows where the cards are hidden.'] });
  if (sidekickUrl) steps.push({ phase: 'setup', title: 'Want a sidekick?', share: sidekickUrl, body: ['Send this link to another grown-up. They get a secret role: radio calls in character, sound effects, and sneaking ahead to check the next card is still hidden.', 'Their screen follows along as you tap Next.'] });
  steps.push({ phase: 'setup', title: 'All set!', body: ['Gather the kids and tap Next to start the hunt.'] });

  steps.push({ phase: 'play', title: 'Gather the kids', say: fill(s.gather, ctx), photo: 'Ready for the mission' });
  steps.push({ phase: 'play', title: 'Read the mission briefing', read: theme.briefing.paragraphs.map((p) => fill(p, ctx)), small: `${theme.briefing.signoff} ${theme.briefing.from}` });
  cards.forEach((c, i) => {
    const step = { phase: 'play', k: c.n, heading: c.n === n ? `the prize at the ${prize.label}` : `the ${c.leadsTo.label}`, read: c.lines, hints: hints(c.leadsTo) };
    if (c.n === 1) Object.assign(step, { title: 'Read Clue #1 aloud', body: [puzzle ? 'Hand Card 1 and puzzle piece 1 to the kids and read the card together. Pick one kid to hold the pieces, or take turns.' : 'Hand Card 1 to the kids and read it together.'] });
    else Object.assign(step, { title: `They found Card ${c.n}!`, small: `At the ${c.hiddenAt.label}${puzzle ? ` · with puzzle piece ${c.n}` : ''}`, challenge: s.challenges[(i - 1) % s.challenges.length], say: fill(s.calls[(i - 1) % s.calls.length], ctx) });
    steps.push(step);
  });
  if (puzzle) steps.push({ phase: 'play', k: n, photo: 'Puzzle time', title: 'Puzzle time! 🧩', body: [`Lay all ${n} pieces on the floor and let the kids put them together. The numbers go in order, left to right, if little ones need a hand.`, `The picture shows where the prize is: the ${prize.label}. Let them run!`] });
  steps.push({ phase: 'play', k: n, finale: true, photo: 'Treasure found', title: 'Treasure found! 🎉', say: fill(s.finale, ctx), body: [bonus ? `Hand ${name} the certificate that comes right after the puzzle page.` : `Hand ${name} the certificate from the last page of the PDF.`, ...(bonus ? ['Want to play again another day? The last three pages are bonus games: a Picture Hunt to cut out and hide, and a look-around hunt to take outside.'] : [])] });

  // The sidekick's cue for each host screen.
  const third = Math.max(2, Math.ceil(n / 3));
  const twoThirds = Math.max(third + 1, Math.ceil((2 * n) / 3));
  const cue = (step, i) => {
    if (step.phase === 'setup') return { title: 'The host is hiding the cards', body: 'Keep the kids busy away from the hiding spots. Your cues will show up here once the hunt starts.' };
    if (step.title === 'Gather the kids') return { title: 'Get in position', body: 'Stay out of sight with your phone. You’re the voice on the radio today.' };
    if (step.read && !step.hints) return { title: 'Briefing time', body: `Listen in. When the kids head off, you’ll call in as ${s.voice}.` };
    if (step.hints) {
      const k = cards.findIndex((c) => step.read === c.lines) + 1;
      const next = cards[k];
      if (k === n) return { title: 'Radio call', say: fill(s.radio[2], ctx), body: 'Then sneak to the prize spot to catch the moment on camera.' };
      if (k === third) return { title: 'Radio call', say: fill(s.radio[0], ctx), body: 'Call it out from another room, like a walkie-talkie.' };
      if (k === twoThirds) return { title: 'Radio call', say: fill(s.radio[1], ctx), body: 'Call it out from another room.' };
      if (k === 1) return { title: 'Sound effect', body: s.sounds[0] };
      return k % 2
        ? { title: 'Sound effect', body: s.sounds[(k >> 1) % s.sounds.length] }
        : { title: 'Sneak ahead', body: `Check that Card ${next.n} is still at the ${next.hiddenAt.label}. Put it back if it moved.` };
    }
    if (step.title.startsWith('Puzzle time')) return { title: 'Puzzle time', body: 'Snap a photo of the kids building the puzzle, then get to the prize spot before they do.' };
    return { title: 'Big finish', body: `Lead the cheer and take a photo when ${name} gets the certificate!` };
  };
  steps.forEach((st, i) => (st.cue = cue(st, i)));
  return { theme, steps, name, cards: n, puzzle: Boolean(puzzle), sidekick: { voice: s.voice, jobs: [`Radio calls as ${s.voice}`, ...s.sounds.slice(0, 2).map((x) => `Sound effect: ${x}`), 'Sneaking ahead to check the next card is still hidden'] } };
}

// Dark text on light accents, white text on dark ones (race car black, Christmas green).
function textOn(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.2 ? '#1d1406' : '#fff'; // whichever contrasts more
}

function shell(theme, title, body, script, { cfg = null, head = '' } = {}) {
  const [main, accent, soft] = [theme.colors.primary, theme.colors.accent, theme.colors.soft];
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex"><meta name="referrer" content="no-referrer"><meta name="theme-color" content="${esc(main)}">
<title>${esc(title)}</title><style>
:root{--main:${main};--accent:${accent};--on-accent:${textOn(accent)};--soft:${soft};--bg:#fbf8f1;--card:#fff;--ink:#2c3352;--muted:#646d8f;--line:#e4dfd3}
@media (prefers-color-scheme:dark){:root{--bg:#151a2e;--card:#1f2540;--ink:#f4f0e6;--muted:#b4bad4;--line:#353c5c}}
*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-text-size-adjust:100%}
.top{background:var(--main);color:#fff;padding:14px 16px calc(14px) 16px;display:flex;align-items:center;gap:10px}
.top svg{width:30px;height:30px;flex:none}.top b{display:block;font-size:16px;line-height:1.2}.top small{opacity:.85;font-size:13px}
.sections{display:flex;gap:6px;padding:10px 16px 0;max-width:560px;margin:0 auto}
.sections button{flex:1;padding:8px 4px;border-radius:14px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);font:700 14px system-ui;display:flex;flex-direction:column;align-items:center;gap:1px}
.sections button span{font-size:20px}.sections button.on{background:var(--main);color:#fff;border-color:var(--main)}
.sections button.off{opacity:.45;border-style:dashed}.sections button small{font:500 10px system-ui}
.sections button.off.on{background:var(--card);color:var(--ink);border-color:var(--line)}
h2{font-size:20px;margin:22px 0 4px}
.tick{display:flex;gap:10px;align-items:flex-start;padding:7px 0;border-bottom:1px solid var(--line)}.tick:last-child{border:0}
.tick input{width:22px;height:22px;flex:none;margin-top:2px;accent-color:var(--main)}.tick input:checked+span{color:var(--muted);text-decoration:line-through}.fk-opt input:checked+span{color:inherit;text-decoration:none}
details.sc summary{cursor:pointer;font-size:18px;list-style:none}details.sc summary::after{content:' ›';color:var(--muted)}details.sc[open] summary::after{content:''}
ul.lines{padding-left:18px;margin:4px 0}ul.lines li{margin:4px 0}
.tabs{display:flex;gap:6px;padding:10px 16px 0}.tabs button{flex:1;padding:9px;border-radius:99px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);font:600 15px system-ui}
.tabs button.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.bar{height:6px;background:var(--line);margin:12px 16px 0;border-radius:9px;overflow:hidden}.bar i{display:block;height:100%;background:var(--accent);transition:width .3s}
main{padding:16px;max-width:560px;margin:0 auto;padding-bottom:120px}
.count{color:var(--muted);font-size:14px;margin:0 0 4px}
h1{font-size:26px;line-height:1.2;margin:0 0 12px}
.spot{font-size:30px;font-weight:800;color:var(--main);margin:4px 0 8px;line-height:1.15}
@media (prefers-color-scheme:dark){.spot{color:var(--soft)}}
.box{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin:12px 0}
.box .k{font:700 12px/1 ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:6px}
.say{border-left:5px solid var(--accent);font-size:19px}.read p{margin:0 0 8px}.read p:last-child{margin:0}
.challenge{background:color-mix(in srgb,var(--soft) 45%,var(--card))}
.small{color:var(--muted);font-size:15px}
.head{font-size:20px;font-weight:700}
.hint{display:none}.hint.show{display:block}
.btn{display:inline-block;border:0;border-radius:99px;padding:12px 18px;font:700 16px system-ui;background:var(--card);color:var(--ink);border:1.5px solid var(--line)}
.nav{position:fixed;left:0;right:0;bottom:0;display:flex;gap:10px;padding:12px 16px calc(12px + env(safe-area-inset-bottom));background:color-mix(in srgb,var(--bg) 92%,transparent);backdrop-filter:blur(6px);border-top:1px solid var(--line)}
.nav button{flex:1;padding:16px;border-radius:16px;border:0;font:800 18px system-ui}
.nav .back{flex:0 0 30%;background:var(--card);color:var(--ink);border:1.5px solid var(--line)}
.nav .next{background:var(--accent);color:var(--on-accent)}
.check{display:flex;align-items:center;gap:10px;font-weight:700;margin-top:6px}.check input{width:26px;height:26px;accent-color:var(--main)}
ul.jobs{padding-left:20px;margin:6px 0}.live{display:inline-block;width:9px;height:9px;border-radius:50%;background:#2fbf71;margin-right:6px;animation:p 1.6s infinite}
@keyframes p{50%{opacity:.3}}
${FK_CSS}
</style>${head}</head><body>${body}<script>${cfg ? `window.FKCFG=${JSON.stringify(cfg).replace(/</g, '\\u003c')};\n${CLIENT}\n` : ''}${script}</script></body></html>`;
}

// Styles for the extras (sound boards, the camera and photo sheet, Shop day, Get ready, Mission).
const FK_CSS = `
.top .fk-mute{margin-left:auto;flex:none;width:40px;height:40px;border-radius:50%;border:0;background:rgba(255,255,255,.18);font-size:20px;line-height:40px;padding:0}
.fk-board{margin:18px 0 6px}.fk-board .k{font:700 12px/1 ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
.fk-pads{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.fk-pads button{display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 4px;border-radius:16px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);font:700 12px/1.15 system-ui;min-height:72px}
.fk-pads button span{font-size:26px;line-height:1.1}.fk-pads button.hit{animation:fkhit .35s ease}
@keyframes fkhit{40%{transform:scale(1.12);background:color-mix(in srgb,var(--accent) 35%,var(--card))}}
.fk-confetti{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:60}
.fk-toast{position:fixed;left:50%;top:16px;transform:translateX(-50%);z-index:70;background:var(--ink);color:var(--bg);padding:10px 16px;border-radius:99px;font:700 15px system-ui;box-shadow:0 10px 24px rgba(0,0,0,.25);transition:opacity .4s}.fk-toast.out{opacity:0}
body.fk-has-cam{padding-bottom:84px}.fk-cam{position:fixed;right:16px;bottom:calc(100px + env(safe-area-inset-bottom));z-index:40;width:58px;height:58px;border-radius:50%;border:0;background:var(--main);color:#fff;font-size:26px;box-shadow:0 10px 22px rgba(0,0,0,.28)}
body.no-nav .fk-cam{bottom:calc(20px + env(safe-area-inset-bottom))}
.fk-cam b{position:absolute;top:-4px;right:-4px;min-width:22px;height:22px;border-radius:11px;background:var(--accent);color:var(--on-accent);font:800 12px/22px system-ui;padding:0 5px}.fk-cam b[hidden]{display:none}
.fk-sheet{position:fixed;inset:0;z-index:50;background:rgba(15,18,32,.55);display:flex;align-items:flex-end;justify-content:center}.fk-sheet[hidden]{display:none}
.fk-sheet-in{background:var(--bg);width:100%;max-width:560px;max-height:92vh;overflow:auto;border-radius:22px 22px 0 0;padding:16px 16px calc(24px + env(safe-area-inset-bottom))}
.fk-sheet-head{display:flex;align-items:center;justify-content:space-between;font-size:20px}.fk-x{border:0;background:none;color:var(--ink);font-size:30px;width:44px;height:44px}
.fk-row{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.btn.fk-main{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}.fk-wide{width:100%;margin-top:10px}
.btn[disabled]{opacity:.5}a.btn{text-decoration:none}
.fk-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0}
.fk-th{position:relative;aspect-ratio:1;border-radius:12px;overflow:hidden;border:3px solid transparent;opacity:.55}.fk-th.on{border-color:var(--accent);opacity:1}
.fk-th img{width:100%;height:100%;object-fit:cover;display:block}.fk-th small{position:absolute;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);color:#fff;font:600 11px system-ui;padding:3px 5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fk-tick{position:absolute;left:6px;top:6px;width:24px;height:24px;border-radius:50%;background:var(--accent);color:var(--on-accent);font:800 14px/24px system-ui;text-align:center;display:none}.fk-th.on .fk-tick{display:block}
.fk-del{position:absolute;right:4px;top:4px;min-width:30px;height:30px;border-radius:15px;border:0;background:rgba(0,0,0,.55);color:#fff;font:700 16px system-ui;padding:0 8px}.fk-del.arm{background:#c2410c;font-size:12px}
.fk-seg{display:flex;gap:8px;margin:6px 0 4px}.fk-seg button{flex:1;padding:10px;border-radius:14px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);font:700 15px system-ui}
.fk-seg button small{display:block;font:500 12px system-ui;color:var(--muted)}.fk-seg button[aria-pressed="true"]{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent) inset}
.fk-ok{font-weight:700}
.fk-shop .cust{font-size:58px;line-height:1;text-align:center;margin:8px 0}.fk-shop .order{list-style:none;padding:0;margin:8px 0}
.fk-shop .order li{display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px dashed var(--line);font-size:18px}.fk-shop .order li b{white-space:nowrap}
.fk-shop .tally{display:flex;justify-content:space-between;font:700 15px system-ui;color:var(--muted);margin-top:6px}
.fk-count{font:800 40px/1.1 system-ui;color:var(--main)}@media (prefers-color-scheme:dark){.fk-count{color:var(--soft)}}
.fk-paper li{margin:6px 0}
`;

// Shop kits (pizza, grocery...) have no matching hunt, so Field Kit takes its look from the kit.
const kitLook = (kit) => ({
  name: kit.name,
  colors: { primary: kit.colors.dark, accent: kit.colors.accent, soft: kit.colors.soft },
  icon: `<span style="font-size:26px;line-height:30px">${kit.icon}</span>`,
});

function topBar(theme, line1, line2, extra = '') {
  return `<div class="top" aria-hidden="false">${theme.icon}<div><b>${esc(line1)}</b><small>${esc(line2)}</small></div>${extra}</div>`;
}

const kitOf = (cfg) => KITS[cfg.kit] || kitForHunt(cfg.theme) || null;

// The pictures for the photo pages' border: the theme's picker illustration, then the kit's own art
// for its icon, menu and customers. Served at <base>/art/<n>.webp (src/bot/server.js).
function stickers(order) {
  const cfg = order.config || {};
  const kit = kitOf(cfg);
  const out = [];
  const icon = path.join(ROOT, 'docs', 'img', 'icons', `${cfg.theme || kit?.id}.webp`);
  if (fs.existsSync(icon)) out.push(icon);
  if (kit) {
    const dir = path.join(__dirname, '..', 'kits', 'art', kit.id);
    const pics = art.kitPictures(kit);
    const want = [kit.icon, ...(kit.menu?.items || []).map(([e]) => e), ...(kit.defaultKinds || []).map((k) => kit.kinds?.[k]?.[0])].filter(Boolean);
    for (const e of want) {
      const pic = pics.find((x) => x.e === e);
      const f = pic && path.join(dir, `${pic.slug}.webp`);
      if (f && fs.existsSync(f) && !out.includes(f)) out.push(f);
      if (out.length >= 8) break;
    }
  }
  return out;
}

// The Mission screen's link: made from the host's token, so it needs nothing stored and never
// reveals the host's own link (or the hiding spots) to the kids.
const missionToken = (order) => crypto.createHash('sha256').update(`mission:${order.hostToken}`).digest('base64url').slice(0, 24);

// What the phone-side extras need to know (window.FKCFG in src/host/client/fieldkit.js).
function clientCfg(order, theme, { base, name, hunt = false }) {
  return {
    key: base, theme: order.config.theme || kitOf(order.config)?.id, name,
    title: `${possessive(name)} ${theme.name}`, hunters: theme.hunters || '',
    colors: { main: theme.colors.primary, accent: theme.colors.accent, soft: theme.colors.soft },
    art: base ? stickers(order).map((_, i) => `${base}/art/${i}.webp`) : [],
    brand: 'LittlePrintQuests', hunt, keepsake: `completed the ${theme.name}`,
  };
}

// Shop day: customers come to the counter with an order from the kit's own menu.
function shopData(kit, name) {
  const P = play(kit);
  const items = (kit.menu?.items || []).filter((x) => typeof x[2] === 'number').map(([e, n, pr]) => [e, n, pr]);
  if (items.length < 2) return null;
  const ctx = { name, child: name, place: kit.placeName(possessive(name)) };
  const customers = Object.values(kit.kinds || {}).slice(0, 14).map(([e, n]) => [e, n]);
  return {
    place: ctx.place, coinWord: kit.menu.coinWord || 'coin', items,
    customers: customers.length ? customers : [['🧸', 'Teddy bear'], ['🐶', 'Puppy'], ['🐱', 'Kitty'], ['🐰', 'Bunny']],
    says: (P?.lines.grownup || ['Hello! Can I order, please?']).map((x) => fill(x, ctx)),
    kidSays: (P?.lines.kid || ['Welcome! What would you like today?']).map((x) => fill(x, ctx)),
  };
}

// The Get ready tab: what to print on what paper, a prep checklist, a countdown and the party-day links.
function prepSection({ name, has, items, puzzle, downloads, sidekick, mission }) {
  const paper = [['🖨️', 'Printing', 'Print at “Actual size” (100%) on Letter paper. Color looks best; black and white works too.']];
  if (has.hunt) paper.push(['🗺️', 'Scavenger hunt', `Clue cards and the certificate look great on cardstock. Cutting the cards takes about 10 minutes${puzzle ? ', and the puzzle pieces about 5 more' : ''}.`]);
  if (has.kit) paper.push(['🎭', 'Play kit', 'Print the hands-on toys and the big wow piece on cardstock so they stand up to play; signs and menus are fine on plain paper. Cutting takes 20 to 30 minutes, and grown-ups do the tricky bits.']);
  if (items.includes('activity')) paper.push(['✏️', 'Activity pages', 'Slip the pages into sheet protectors (or laminate them) and grab a dry-erase marker.']);
  if (has.party) paper.push(['🎉', 'Party pack', 'Invitations, toppers and tags on cardstock if you have it. The banner letters are fine on plain paper.']);
  const todo = ['Print everything',
    ...(has.hunt ? ['Cut out the clue cards', ...(puzzle ? ['Cut out the puzzle pieces'] : [])] : []),
    ...(has.kit ? ['Cut out the play kit and set up the shop'] : []),
    ...(has.party ? ['Send the invitations'] : []),
    ...(has.hunt ? ['Hide the cards (the Hunt tab walks you through it, about 10 minutes)'] : []),
    'Charge your phone, and open this page once on Wi-Fi so it works without signal',
    ...(sidekick ? ['Send the Sidekick link to a helper'] : [])];
  return `<h1>Get ready</h1><p class="small">Everything for ${esc(possessive(name))} big day, from printing to party time. Your ticks are saved on this phone.</p>
  <div class="box" id="fkCountdown" hidden><div class="k">Countdown</div><div class="fk-count"></div></div>
  <div class="box"><div class="k">Print it</div><ul class="lines fk-paper">${paper.map(([e, t, x]) => `<li>${e} <b>${esc(t)}:</b> ${esc(x)}</li>`).join('')}</ul>
    ${downloads ? `<p style="margin:10px 0 0"><a class="btn" href="${esc(downloads)}" target="_blank">Open the printable PDF</a></p>` : ''}</div>
  <div class="box"><div class="k">To do</div>${todo.map((x, i) => `<label class="tick"><input type="checkbox" data-key="prep:${i}"><span>${esc(x)}</span></label>`).join('')}</div>
  <h2>On the day</h2>
  <div class="fk-row">${mission ? '<button type="button" class="btn" data-mission>📺 Mission screen for the kids</button>' : ''}${sidekick ? '<button type="button" class="btn" data-sidekick>🤝 Send the Sidekick link</button>' : ''}<button type="button" class="btn" data-photos>📸 Photos</button></div>
  <p class="small">Snap photos any time with the 📸 button. At the end you can make a printable photo page with a ${has.hunt ? 'hunt' : 'theme'} border, one big photo or a collage. Photos stay on this phone.</p>
  <div data-board="Try the sounds"></div>
  <div class="box"><div class="k">Keep it handy</div><p class="small" id="fkOffline" style="margin:0">Open this page once on Wi-Fi and it keeps working without signal.</p>
    <button type="button" class="btn" id="fkAdd" hidden style="margin-top:10px">Add to home screen</button>
    <p class="small" id="fkIos" hidden style="margin:8px 0 0">On iPhone: tap the Share button, then “Add to Home Screen”.</p></div>`;
}

// The Play Kit tab: setup, scenarios to start, lines for both players and quick games.
function kitSection(kit, name) {
  const P = play(kit);
  const ctx = { name, child: name, place: kit.placeName(possessive(name)) };
  const f = (t) => esc(fill(t, ctx));
  const setup = [kit.guide.setup[0], 'Hang the welcome poster, then tape up the menu and specials.', ...kit.guide.setup.slice(1)];
  const checks = (key, items) => items.map((x, i) => `<label class="tick"><input type="checkbox" data-key="${key}:${i}"><span>${f(x)}</span></label>`).join('');
  let h = `<h1>${f(ctx.place)}</h1><p class="small">${f(kit.tagline)}. Ideas for playing with the printed kit, any day.</p>
  <div class="box"><div class="k">Set up the shop</div>${checks('kit-setup', setup)}</div>`;
  if (shopData(kit, name)) {
    h += `<div class="box fk-shop"><div class="k">Shop day</div><div class="head">Run ${f(ctx.place)} for real</div>
    <p class="small">The phone becomes the order screen: customers come to the counter, ${esc(name)} serves them and earns ${esc(kit.menu.coinsTitle.toLowerCase())}. Six customers make a shift.</p>
    <button type="button" class="btn fk-main" id="shopOpen">🛎️ Open the shop</button><div id="shopStage"></div></div>
    <div data-board="Shop sounds"></div>`;
  }
  if (P) {
    h += `<h2>Pretend-play scenarios</h2><p class="small">Pick one, or let the phone choose.</p>
    <button class="btn" id="surprise">🎲 Surprise me</button><div id="picked"></div>
    ${P.scenarios.map((sc, i) => `<details class="box sc" data-sc="${i}"><summary><b>${f(sc.title)}</b></summary>
      <p>${f(sc.setup)}</p><div class="box say"><div class="k">Say this</div>“${f(sc.say)}”</div><p class="small"><b>Twist:</b> ${f(sc.twist)}</p></details>`).join('')}
    <h2>Things to say</h2>
    <div class="box"><div class="k">${esc(name)} can say</div><ul class="lines">${P.lines.kid.map((x) => `<li>“${f(x)}”</li>`).join('')}</ul></div>
    <div class="box"><div class="k">You can say</div><ul class="lines">${P.lines.grownup.map((x) => `<li>“${f(x)}”</li>`).join('')}</ul></div>
    <h2>Quick games</h2>
    ${P.games.map((g) => `<div class="box"><div class="head">${f(g.title)}</div><p>${f(g.how)}</p><p class="small">Uses: ${f(g.uses)}</p></div>`).join('')}`;
  }
  h += `<h2>More ideas from the guide</h2>${kit.guide.play.map(([t, x]) => `<div class="box"><div class="head">${f(t)}</div><p>${f(x)}</p></div>`).join('')}`;
  return h;
}

// The Party tab: a checklist that remembers what's done on this phone.
function partySection(theme, name, has) {
  const groups = checklist(theme, { name, hunt: has.hunt, kit: has.kit });
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  return `<h1>${esc(possessive(name))} party plan</h1><p class="small">Tick things off as you go. Your ticks are saved on this phone.</p>
  <div class="box"><div class="k">Done</div><div class="head"><span id="done">0</span> of ${total}</div><div class="bar" style="margin:8px 0 0"><i id="pbar"></i></div></div>
  ${groups.map((g, gi) => `<h2>${esc(g.when)}</h2><div class="box">${g.items.map((x, i) => `<label class="tick"><input type="checkbox" data-key="party:${gi}:${i}" data-party><span>${esc(x)}</span></label>`).join('')}</div>`).join('')}`;
}

const SECTIONS = [['prep', '✂️', 'Get ready'], ['hunt', '🗺️', 'Hunt'], ['kit', '🎭', 'Play Kit'], ['party', '🎉', 'Party']];

// The host's page. `stateUrl` saves the hunt's progress so the sidekick and the Mission screen can follow.
// `items` says what the order includes (hunt, kit, party, activity); the other tabs are greyed out.
function hostPage(order, { stateUrl, sidekickUrl, downloads, items = ['hunt'] }) {
  const cfg = order.config;
  const has = { prep: true, hunt: items.includes('hunt'), kit: items.includes('kit'), party: items.includes('party') };
  const kit = has.kit ? kitOf(cfg) : null;
  if (!kit) has.kit = false;
  const theme = THEMES[cfg.theme] || THEMES[kit?.hunt] || kitLook(kit || kitOf(cfg));
  const name = cfg.childName || 'our birthday star';
  const base = stateUrl.replace(/\/state$/, '');
  const missionUrl = has.hunt && order.hostToken ? `/m/${missionToken(order)}` : null;
  const p = has.hunt ? plan(order, sidekickUrl, missionUrl) : null;
  const steps = p ? p.steps.map(({ cue, ...st }) => st) : [];
  if (downloads && steps.length) steps[0].download = downloads;
  const what = has.hunt ? theme.name : has.kit ? `${kit.name} play kit` : 'party';
  const fk = { ...clientCfg(order, theme, { base, name, hunt: has.hunt }), shop: kit ? shopData(kit, name) : null, mission: missionUrl, sidekick: sidekickUrl || null, party: cfg.party?.date || '' };
  const body = `${topBar(theme, `${possessive(name)} ${what}`, `Field Kit · ${has.hunt ? 'keep this screen secret!' : 'your party helper'}`, '<button type="button" class="fk-mute" id="fkMute"></button>')}
<div class="sections">${SECTIONS.map(([k, icon, label]) => `<button data-sec="${k}" data-label="${label}"${has[k] ? '' : ' class="off" aria-disabled="true"'}><span>${icon}</span>${label}${has[k] ? '' : '<small>Not in this order</small>'}</button>`).join('')}</div>
<section id="sec-prep" hidden><main>${prepSection({ name, has, items, puzzle: p?.puzzle, downloads, sidekick: sidekickUrl, mission: missionUrl })}</main></section>
<section id="sec-hunt" hidden>
  <div class="tabs"><button data-phase="setup">1 · Hide</button><button data-phase="play">2 · Play</button></div>
  <div class="bar"><i id="bar"></i></div>
  <main id="main"></main>
  <div class="nav"><button class="back" id="back">Back</button><button class="next" id="next">Next</button></div>
</section>
<section id="sec-kit" hidden><main>${kit ? kitSection(kit, name) : ''}</main></section>
<section id="sec-party" hidden><main>${has.party ? partySection(theme, name, has) : ''}</main></section>
<section id="sec-off" hidden><main><h1 id="off-title"></h1><p>This part isn’t included in this order. Everything that is lives in the other tabs.</p></main></section>`;
  const script = `
const STEPS=${JSON.stringify(steps).replace(/</g, '\\u003c')},STATE=${JSON.stringify(stateUrl)},KEY='host:'+STATE;
const CFG=window.FKCFG;
const $=(id)=>document.getElementById(id);
const t=(s)=>String(s).replace(/[&<>"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const get=(k)=>{try{return localStorage.getItem(k)}catch(e){return null}},put=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const boards=()=>document.querySelectorAll('[data-board]').forEach(d=>d.outerHTML=FK.soundBoard(d.dataset.board));
// Tabs
function show(sec){const btn=document.querySelector('[data-sec="'+sec+'"]');const off=btn.classList.contains('off');
  document.querySelectorAll('section').forEach(s=>s.hidden=true);$(off?'sec-off':'sec-'+sec).hidden=false;
  if(off)$('off-title').textContent=btn.dataset.label;
  document.body.classList.toggle('no-nav',sec!=='hunt'||off);
  document.querySelectorAll('.sections button').forEach(b=>b.classList.toggle('on',b===btn));
  if(!off)put(KEY+':tab',sec);window.scrollTo(0,0)}
document.querySelectorAll('.sections button').forEach(b=>b.onclick=()=>show(b.dataset.sec));
// Checklists
function partyCount(){const all=[...document.querySelectorAll('[data-party]')],n=all.filter(x=>x.checked).length;if($('done')){$('done').textContent=n;$('pbar').style.width=(100*n/all.length)+'%'}}
document.querySelectorAll('input[data-key]').forEach(c=>{c.checked=get(KEY+':'+c.dataset.key)==='1';c.onchange=()=>{put(KEY+':'+c.dataset.key,c.checked?'1':'0');partyCount()}});partyCount();
// Play kit: surprise me
const sur=$('surprise');if(sur)sur.onclick=()=>{const all=[...document.querySelectorAll('.sc')];all.forEach(d=>d.open=false);const d=all[Math.floor(Math.random()*all.length)];d.open=true;d.scrollIntoView({behavior:'smooth',block:'center'})};
// Links for the kids' Mission screen and the sidekick: share them, or copy, or open.
async function sendLink(u,title,open){const url=new URL(u,location.href).href;if(navigator.share){try{await navigator.share({title,url});return}catch(e){if(e.name==='AbortError')return}}
  if(!open&&navigator.clipboard){try{await navigator.clipboard.writeText(url);FK.toast('Link copied!');return}catch(e){}}window.open(url,'_blank')}
document.addEventListener('click',(e)=>{const b=e.target.closest('[data-snap]');if(b)FK.snap(b.dataset.snap);
  if(e.target.closest('[data-photos]'))FK.openSheet();
  if(e.target.closest('[data-mission]'))sendLink(CFG.mission,'Mission screen',true);
  if(e.target.closest('[data-sidekick]'))sendLink(CFG.sidekick,'Be my hunt sidekick')});
// Hunt
let i=0;try{i=Math.min(STEPS.length-1,+get(KEY)||0)}catch(e){}
const box=(k,html,cls='')=>'<div class="box '+cls+'"><div class="k">'+k+'</div>'+html+'</div>';
let saveTimer;
function save(){put(KEY,i);clearTimeout(saveTimer);saveTimer=setTimeout(()=>fetch(STATE,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({step:i})}).catch(()=>{}),300)}
function draw(){
  const s=STEPS[i],ph=STEPS.filter(x=>x.phase===s.phase),n=ph.indexOf(s)+1;let h='';
  h+='<p class="count">'+(s.phase==='setup'?'Hiding':'The hunt')+' · '+n+' of '+ph.length+'</p><h1>'+t(s.title)+'</h1>';
  if(s.spot)h+='<div class="spot">'+t(s.spot)+'</div>';
  if(s.small)h+='<p class="small">'+t(s.small)+'</p>';
  if(s.challenge)h+=box('Quick challenge first','<div class="head">'+t(s.challenge)+'</div>','challenge');
  if(s.say)h+=box('Say this','“'+t(s.say)+'”','say');
  if(s.read)h+=box(s.hints?'Read the clue':'Read aloud',s.read.map(p=>'<p>'+t(p)+'</p>').join(''),'read');
  (s.body||[]).forEach(p=>h+='<p>'+t(p)+'</p>');
  if(s.download)h+='<p><a class="btn" href="'+t(s.download)+'" target="_blank">Open the printable PDF</a></p>';
  if(s.hints)h+=box('The kids are heading to','<div class="head">'+t(s.heading)+'</div>')+'<button class="btn" id="stuck">They’re stuck 🤔</button>'+s.hints.map((x,k)=>'<div class="box hint" data-h="'+k+'"><div class="k">Hint '+(k+1)+'</div>'+t(x)+'</div>').join('');
  if(s.mission)h+='<div class="fk-row"><a class="btn fk-main" href="'+t(s.mission)+'" target="_blank">Open the Mission screen</a><button class="btn" data-mission>Send the link</button></div>';
  if(s.share)h+='<button class="btn" id="share">Send the sidekick link</button> <span class="small" id="shared"></span>';
  if(s.check){const done=get(KEY+':'+i)==='1';h+='<label class="check"><input type="checkbox" id="chk"'+(done?' checked':'')+'> Hidden!</label>'}
  if(s.photo)h+='<p><button class="btn" data-snap="'+t(s.photo)+'">📸 Snap a photo</button></p>';
  if(s.finale)h+=box('Keepsake','<p style="margin-top:0">Make a “Mission complete” page for '+t(CFG.name)+', with your latest photo. Then make a photo page with all of them from the 📸 button.</p><button class="btn fk-main" id="fkKeep">🏅 Make the keepsake PDF</button><div id="fkKeepOut"></div>');
  if(s.phase==='play')h+=FK.soundBoard();
  $('main').innerHTML=h;
  $('bar').style.width=(100*(i+1)/STEPS.length)+'%';
  document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.phase===s.phase));
  $('back').disabled=i===0;$('next').textContent=i===STEPS.length-1?'Done 🎉':s.check?'Hidden, next':'Next';
  let shown=0;const st=$('stuck');if(st)st.onclick=()=>{const el=document.querySelector('[data-h="'+shown+'"]');if(el){el.classList.add('show');shown++}if(shown>=s.hints.length)st.style.display='none';else st.textContent='Still stuck?'};
  const sh=$('share');if(sh)sh.onclick=async()=>{const url=s.share;try{if(navigator.share){await navigator.share({title:'Be my hunt sidekick',text:'Your secret role for the scavenger hunt:',url});return}await navigator.clipboard.writeText(url);$('shared').textContent='Link copied!'}catch(e){$('shared').textContent=url}};
  const c=$('chk');if(c)c.onchange=()=>put(KEY+':'+i,c.checked?'1':'0');
  const kp=$('fkKeep');if(kp)kp.onclick=()=>FK.keepsake('hunt',CFG.keepsake,$('fkKeepOut'));
  window.scrollTo(0,0);save();
}
// A card found plays a little jingle; the big finish gets a fanfare and confetti.
function cheer(){const s=STEPS[i];if(s.finale){FK.auto('fanfare');FK.confetti()}else if(s.hints&&s.k>1)FK.auto('found')}
if(STEPS.length){
  $('next').onclick=()=>{const c=$('chk');if(c&&!c.checked){c.checked=true;c.onchange()}if(i<STEPS.length-1){i++;draw();cheer()}};
  $('back').onclick=()=>{if(i>0){i--;draw()}};
  document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{i=STEPS.findIndex(s=>s.phase===b.dataset.phase);draw()});
  draw();
  fetch(STATE).then(r=>r.json()).then(d=>{if(Number.isInteger(d.step)&&d.step>i&&d.step<STEPS.length){i=d.step;draw()}}).catch(()=>{});
}
// Shop day
const SHOP=CFG.shop;
if(SHOP&&$('shopOpen')){
  const stage=$('shopStage'),GOAL=6,pick=(a)=>a[Math.floor(Math.random()*a.length)];
  const coinsTxt=(n)=>n+' '+(n===1?SHOP.coinWord:SHOP.coinWord+'s');
  let served=0,coins=0;
  function next(){
    const c=pick(SHOP.customers),items=[...SHOP.items].sort(()=>Math.random()-.5).slice(0,Math.random()<.5?1:2),total=items.reduce((n,x)=>n+x[2],0);
    stage.innerHTML='<div class="cust">'+c[0]+'</div><div class="head" style="text-align:center">'+t(c[1])+' is next in line!</div>'
      +'<div class="box say"><div class="k">The customer says</div>“'+t(pick(SHOP.says))+'”</div>'
      +'<div class="k">Order</div><ul class="order">'+items.map(x=>'<li><span>'+x[0]+' '+t(x[1])+'</span><b>'+coinsTxt(x[2])+'</b></li>').join('')+'<li><span><b>Total</b></span><b>'+coinsTxt(total)+'</b></li></ul>'
      +'<p class="small">'+t(CFG.name)+' can say: “'+t(pick(SHOP.kidSays))+'”</p>'
      +'<div class="fk-row"><button class="btn fk-main" id="shopServed">✅ Served!</button><button class="btn" id="shopSkip">Next customer</button><button class="btn" id="shopClose">Close the shop</button></div>'
      +'<div class="tally"><span>Served: '+served+' of '+GOAL+'</span><span>'+coinsTxt(coins)+' earned</span></div>';
    $('shopServed').onclick=()=>{served++;coins+=total;FK.play('ding');if(served>=GOAL)end();else next()};
    $('shopSkip').onclick=next;$('shopClose').onclick=end;
  }
  function end(){
    FK.auto('fanfare');FK.confetti();
    const did='ran '+SHOP.place+' and served '+served+' customer'+(served===1?'':'s');
    stage.innerHTML='<div class="cust">⭐</div><div class="head" style="text-align:center">Shop closed! '+t(SHOP.place)+' served '+served+' customer'+(served===1?'':'s')+' and earned '+coinsTxt(coins)+'.</div>'
      +'<div class="fk-row"><button class="btn" data-snap="Shop day">📸 Snap a photo</button><button class="btn fk-main" id="shopKeep">⭐ Star of the Day page</button><button class="btn" id="shopAgain">Open again</button></div><div id="shopKeepOut"></div>';
    $('shopKeep').onclick=()=>FK.keepsake('shop',did,$('shopKeepOut'));
    $('shopAgain').onclick=()=>{served=0;coins=0;next()};
  }
  $('shopOpen').onclick=()=>{FK.play('ding');$('shopOpen').hidden=true;next()};
}
// Get ready: the party countdown, Add to home screen, and working without signal
const cd=$('fkCountdown');
if(cd&&CFG.party){
  const now=new Date(),day=(d)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()),txt=CFG.party.replace(/^[A-Za-z]+,\\s*/,'');
  const at=(y)=>{const d=new Date(/\\d{4}/.test(txt)?txt:txt+', '+y);return isNaN(d)?null:d};
  let d=at(now.getFullYear());if(d&&!/\\d{4}/.test(txt)&&day(d)<day(now))d=at(now.getFullYear()+1);
  if(d){const n=Math.round((day(d)-day(now))/864e5);if(n>=0&&n<400){cd.hidden=false;cd.querySelector('.fk-count').textContent=n===0?'Party day! 🎉':n===1?'Tomorrow! 🎈':n+' days to go'}}
}
let deferred=null;
addEventListener('beforeinstallprompt',(e)=>{e.preventDefault();deferred=e;if($('fkAdd'))$('fkAdd').hidden=false});
if($('fkAdd'))$('fkAdd').onclick=async()=>{if(!deferred)return;deferred.prompt();try{await deferred.userChoice}catch(e){}deferred=null;$('fkAdd').hidden=true};
if(/iphone|ipad|ipod/i.test(navigator.userAgent)&&!navigator.standalone&&$('fkIos'))$('fkIos').hidden=false;
if('serviceWorker' in navigator)navigator.serviceWorker.register(CFG.key+'/sw.js',{scope:CFG.key}).then(()=>navigator.serviceWorker.ready).then(()=>{if($('fkOffline'))$('fkOffline').textContent='✓ Saved on this phone: it keeps working without signal.'}).catch(()=>{});
boards();FK.autoToggle($('fkMute'));FK.mountCamera();
// Open where they left off: the hunt once it has started, otherwise Get ready.
const saved=get(KEY+':tab');show(saved&&document.querySelector('[data-sec="'+saved+'"]:not(.off)')?saved:(i>0&&STEPS.length?'hunt':'prep'));`;
  const head = `<link rel="manifest" href="${base}/manifest.webmanifest"><link rel="apple-touch-icon" href="${base}/icon-192.png">`;
  return shell(theme, `${possessive(name)} ${has.hunt ? 'hunt' : 'party'} · Field Kit`, body, script, { cfg: fk, head });
}

// The sidekick's page: their jobs, sound buttons, plus a live cue that follows the host's screen.
// The sidekick and the Mission screen follow the host's step number, so they lay out the same steps
// the host's page has (a hunt's host page always has the Mission screen and sidekick steps).
const followPlan = (order) => plan(order, 'sidekick', 'mission');

function sidekickPage(order, { stateUrl }) {
  const p = followPlan(order);
  const cues = p.steps.map((s) => ({ ...s.cue, where: s.hints ? s.heading : null }));
  const body = `${topBar(p.theme, `${p.name}’s ${p.theme.name}`, 'Sidekick · your secret role')}
<main>
  <div class="box"><div class="k">Your jobs today</div><ul class="jobs">${p.sidekick.jobs.map((j) => `<li>${esc(j)}</li>`).join('')}</ul>
  <p class="small" style="margin:6px 0 0">Keep this screen open. It follows the host’s screen and tells you what to do next.</p></div>
  <p class="count"><span class="live"></span>Live with the host</p>
  <div id="cue"></div>
  <div data-board="Your sound effects"></div>
</main>`;
  const script = `
const CUES=${JSON.stringify(cues).replace(/</g, '\\u003c')},STATE=${JSON.stringify(stateUrl)};
const t=(s)=>String(s).replace(/[&<>"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
document.querySelectorAll('[data-board]').forEach(d=>d.outerHTML=FK.soundBoard(d.dataset.board));
let last=-1;
function draw(i){const c=CUES[i];if(!c||i===last)return;last=i;let h='<h1>'+t(c.title)+'</h1>';
  if(c.where)h+='<p class="small">The kids are heading to '+t(c.where)+'.</p>';
  if(c.say)h+='<div class="box say"><div class="k">Say this</div>“'+t(c.say)+'”</div>';
  if(c.body)h+='<p>'+t(c.body)+'</p>';
  document.getElementById('cue').innerHTML=h;if(navigator.vibrate&&last>0)navigator.vibrate(120)}
function poll(){fetch(STATE).then(r=>r.json()).then(d=>draw(Number.isInteger(d.step)?d.step:0)).catch(()=>{})}
draw(0);poll();setInterval(poll,3000);`;
  return shell(p.theme, `${p.name}’s hunt · Sidekick`, body, script, { cfg: clientCfg(order, p.theme, { base: '', name: p.name }) });
}

// The kids' Mission screen (/m/<token>): big and bright for a tablet propped up during the hunt.
// It follows the host's steps but never shows where cards are hidden.
const MS_CSS = `<style>
.ms{min-height:calc(100vh - 66px);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px 18px 110px;background:radial-gradient(circle at 50% 30%,color-mix(in srgb,var(--soft) 75%,var(--bg)),var(--bg) 70%)}
.ms-icon{width:clamp(90px,22vw,150px);height:clamp(90px,22vw,150px);border-radius:50%;background:var(--main);color:#fff;display:grid;place-items:center;box-shadow:0 14px 30px rgba(0,0,0,.2)}.ms-icon svg{width:60%;height:60%}
.ms h1{font-size:clamp(34px,8vw,68px);line-height:1.05;margin:18px 0 6px}
.ms-slots{display:grid;grid-template-columns:repeat(var(--cols,4),auto);justify-content:center;gap:clamp(8px,2vw,14px);margin:18px 0 6px;max-width:720px}
.ms-slots span{width:clamp(46px,10vw,78px);height:clamp(46px,10vw,78px);border-radius:50%;border:4px dashed var(--line);display:grid;place-items:center;font:800 clamp(18px,4vw,30px) system-ui;color:var(--muted);background:var(--card)}
.ms-slots span.on{border:4px solid var(--accent);background:var(--accent);color:var(--on-accent);animation:mspop .5s}
@keyframes mspop{50%{transform:scale(1.25)}}
.ms-count{font:800 clamp(22px,5vw,38px) system-ui;color:var(--main);margin:6px 0}@media (prefers-color-scheme:dark){.ms-count{color:var(--soft)}}
.ms-ch{font:800 clamp(24px,5.5vw,44px)/1.2 system-ui;background:var(--card);border:4px solid var(--accent);border-radius:26px;padding:18px 24px;margin-top:18px;max-width:760px}
.ms-ch small{display:block;font:700 clamp(13px,2.5vw,18px) ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:6px}
.ms-start{position:fixed;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));padding:18px;border-radius:18px;border:0;background:var(--accent);color:var(--on-accent);font:800 20px system-ui;box-shadow:0 12px 28px rgba(0,0,0,.25)}
</style>`;
function kidTitle(s, p) {
  if (s.phase === 'setup') return 'The mission starts soon…';
  if (s.title === 'Gather the kids') return `Gather round, ${p.theme.hunters || 'adventurers'}!`;
  if (s.finale) return 'Mission complete!';
  if (/^Puzzle time/.test(s.title)) return 'Puzzle time! 🧩';
  if (s.hints && s.k === 1) return 'Clue 1: let’s go!';
  if (s.hints) return `Card ${s.k} found!`;
  return 'Mission briefing';
}
function missionPage(order, { stateUrl }) {
  const p = followPlan(order);
  const meta = p.steps.map((s) => ({ phase: s.phase, k: s.k || 0, finale: Boolean(s.finale), challenge: s.challenge || null, title: kidTitle(s, p) }));
  const body = `${topBar(p.theme, `${p.name}’s ${p.theme.name}`, 'Mission screen')}
<main class="ms" style="max-width:none;padding-bottom:110px"><div class="ms-icon">${p.theme.icon}</div><h1 id="msTitle">The mission starts soon…</h1>
<div class="ms-slots" id="msSlots" style="--cols:${p.cards > 5 ? Math.ceil(p.cards / 2) : p.cards}">${Array.from({ length: p.cards }, (_, i) => `<span>${i + 1}</span>`).join('')}</div><p class="ms-count" id="msCount"></p><div class="ms-ch" id="msCh" hidden></div></main>
<button type="button" class="ms-start" id="msStart">▶ Tap to start (turns on the sounds)</button>`;
  const script = `
const META=${JSON.stringify(meta).replace(/</g, '\\u003c')},STATE=${JSON.stringify(stateUrl)},N=${p.cards};
const $=(id)=>document.getElementById(id);const t=(s)=>String(s).replace(/[&<>"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let last=-1,lastK=0,on=false;
function draw(i){const m=META[i];if(!m||i===last)return;const first=last<0;last=i;
  $('msTitle').textContent=m.title;
  [...$('msSlots').children].forEach((el,j)=>{const got=j<m.k;if(got&&!el.classList.contains('on'))el.textContent='★';el.classList.toggle('on',got);if(!got)el.textContent=j+1});
  $('msCount').textContent=m.phase==='setup'?'':m.k?m.k+' of '+N+' clues found':'';
  $('msCh').hidden=!m.challenge;if(m.challenge)$('msCh').innerHTML='<small>Quick challenge</small>'+t(m.challenge);
  if(!first&&on){if(m.finale){FK.play('fanfare');setTimeout(()=>FK.play('cheer'),700);FK.confetti(5000,220)}else if(m.k>lastK){FK.play('found');FK.confetti(1400,60)}}
  lastK=m.k}
function poll(){fetch(STATE).then(r=>r.json()).then(d=>draw(Number.isInteger(d.step)?d.step:0)).catch(()=>{})}
$('msStart').onclick=async()=>{on=true;FK.play('found');$('msStart').remove();try{await navigator.wakeLock.request('screen')}catch(e){}};
poll();setInterval(poll,2000);`;
  return shell(p.theme, `${p.name}’s mission`, body, script, { cfg: clientCfg(order, p.theme, { base: '', name: p.name }), head: MS_CSS });
}

// Offline: the Field Kit page, its manifest and pictures are kept on the phone; the page is
// fetched fresh when there's signal and comes from the phone when there isn't.
function serviceWorker(base, artCount) {
  const files = [base, `${base}/manifest.webmanifest`, `${base}/icon-192.png`, ...Array.from({ length: artCount }, (_, i) => `${base}/art/${i}.webp`)];
  return `const BASE=${JSON.stringify(base)},CACHE='fk:'+BASE,FILES=${JSON.stringify(files)};
self.addEventListener('install',(e)=>{e.waitUntil(caches.open(CACHE).then((c)=>Promise.all(FILES.map((f)=>c.add(f).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',(e)=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',(e)=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin||!(u.pathname===BASE||u.pathname.startsWith(BASE+'/')))return;
  if(/\\/art\\/|\\.png$/.test(u.pathname)){e.respondWith(caches.match(r).then((m)=>m||fetch(r).then((res)=>{const cp=res.clone();caches.open(CACHE).then((c)=>c.put(r,cp));return res})));return}
  e.respondWith(fetch(r).then((res)=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then((c)=>c.put(r,cp))}return res}).catch(()=>caches.match(r).then((m)=>m||(u.pathname.endsWith('/state')?new Response('{}',{headers:{'Content-Type':'application/json'}}):Response.error()))))});`;
}
function manifest(order, base) {
  const cfg = order.config;
  const theme = THEMES[cfg.theme] || THEMES[kitOf(cfg)?.hunt] || kitLook(kitOf(cfg));
  const name = cfg.childName || 'Our';
  return JSON.stringify({
    name: `${possessive(name)} Field Kit`, short_name: 'Field Kit', start_url: base, scope: base, display: 'standalone',
    background_color: '#fbf8f1', theme_color: theme.colors.primary,
    icons: [{ src: `${base}/icon-192.png`, sizes: '192x192', type: 'image/png' }, { src: `${base}/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' }],
  });
}

module.exports = { plan, hostPage, sidekickPage, missionPage, missionToken, stickers, serviceWorker, manifest };
