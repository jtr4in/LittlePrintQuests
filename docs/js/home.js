// The home page: shows what the kits are and sends people to make/ to order. The name typed at the top
// goes onto every preview (js/names.js) and is kept for the order page.
let theme = seasonal || 'dino'; // the theme the hero and free sample start on

// ---- The name hook -------------------------------------------------------------------------------
function showKid() {
  const typed = LPQName.typed();
  document.querySelector('#hookTitle b').textContent = typed ? LPQName.get() : 'your kid';
  $('hookGo').textContent = typed ? `Make ${LPQName.get()}’s kit` : 'Make my kit';
  if ($('hookName').value.trim() !== typed) $('hookName').value = typed;
  document.querySelectorAll('[data-kid-name]').forEach((el) => { el.textContent = LPQName.get(); });
}
$('hookName').addEventListener('input', () => { LPQName.set($('hookName').value); showKid(); });
$('hookForm').addEventListener('submit', (e) => {
  e.preventDefault();
  LPQName.set($('hookName').value);
  location.href = 'make/';
});
// The two pages beside the name box: the play kit and the party pack, in the theme that goes with
// the occasion in the headline.
function drawHookPages(id = theme) {
  LPQName.preload(id).then(() => {
    LPQName.setSrc($('hookBack'), `img/pages/${id}-kit.webp`);
    LPQName.setSrc($('hookFront'), `img/pages/${id}-party.webp`);
  });
}
// The occasion under the headline rotates so it reads as more than a birthday thing. (Only the words
// change: swapping the pages beside it too meant downloads every few seconds, which made phones choppy.)
const OCCASIONS = [
  // (all follow "Made for", which stays put while the occasion fades)
  ['birthdays', null], ['rainy days', 'pirate'], ['sleepovers', 'space'], ['snow days', 'ice'],
  ['Halloween', 'halloween'], ['playdates', 'dino'], ['Christmas morning', 'christmas'],
  ['Valentine’s Day', 'valentine'], ['spring break', 'easter'], ['weekends', 'royal'],
];
let occasionAt = 0;
function nextOccasion() {
  if (document.hidden) return;
  occasionAt = (occasionAt + 1) % OCCASIONS.length;
  const [words, id] = OCCASIONS[occasionAt];
  $('occasion').classList.add('out');
  setTimeout(() => {
    $('occasion').textContent = words;
    $('occasion').classList.remove('out');
  }, 350);
}
if (!calm()) setInterval(nextOccasion, 3200);

// ---- Hero banner: each set laid out on a table that matches the theme (scripts/hero-scenes.js) -----
// It rotates through a handful of themes, only while it's on screen, and fetches the next one's
// picture and name data ahead so each change is one quiet download. Its button opens make/ with that theme.
const ROTATE = [...new Set([theme, 'dino', 'unicorn', 'space', 'pirate', 'mermaid', 'vet', 'royal'])];
let heroAt = null;
const heroSrc = (id) => ({ src: `img/hero/${id}.webp`, srcset: `img/hero/${id}-sm.webp 800w, img/hero/${id}.webp 1600w` });
const nextHero = () => ROTATE[(ROTATE.indexOf(heroAt) + 1) % ROTATE.length];
function showHero(id) {
  if (id === heroAt) return;
  heroAt = id;
  const name = THEMES.find((x) => x.id === id).name;
  const imgs = [...document.querySelectorAll('#heroBanner .hb')];
  const front = imgs.find((i) => i.classList.contains('on'));
  const back = imgs.find((i) => i !== front);
  const { src, srcset } = heroSrc(id);
  back.onload = () => { back.classList.add('on'); front.classList.remove('on'); };
  back.alt = `The ${name} set printed out: host guide, story briefing, clue cards, play kit, activity page, party invitation and the Field Kit on a phone`;
  LPQName.setSrc(back, src, srcset);
  $('heroCap').innerHTML = `<b>${esc(name)}</b><span>Make this set</span>`;
  $('heroCap').dataset.id = id;
  LPQName.preload(nextHero());
}
$('heroCap').addEventListener('click', () => { location.href = `make/?theme=${$('heroCap').dataset.id}`; });
LPQName.preload(theme).then(() => showHero(theme));
let heroSeen = true;
new IntersectionObserver(([e]) => { heroSeen = e.isIntersecting; }).observe($('heroBanner'));
if (!calm()) setInterval(() => { if (!document.hidden && heroSeen) showHero(nextHero()); }, 6000);

// ---- What you get: each product card opens its real pages, the photo first ------------------------
$('productCards').querySelectorAll('.product').forEach((b) => b.addEventListener('click', () => {
  const k = b.dataset.k, id = b.dataset.theme, name = b.querySelector('b').textContent;
  const pagesFor = (a) => [{ k: 'photo', cap: `${name}, printed and set up`, src: b.dataset.photo, alt: b.querySelector('img').alt },
    ...setPages(id, a).filter((p) => p.k === k).map((p) => ({ ...p, tab: '' }))];
  Gallery.open(pagesFor('big'), { label: `${name}: ${THEMES.find((t) => t.id === id).name}`, title: true, foot: Gallery.cta(`make/?theme=${id}`, 'Make my kit'),
    ages: k === 'kit' || k === 'activity' ? { value: 'big', pages: pagesFor } : null });
}));
// The Field Kit (the grown-up's phone page): screens from a real order, in the home theme. The first
// four are the phones on the page; the popup adds the printed photo page and the Sidekick.
const HOST = [['hide', 'Hide the clues: one card per screen, in your hiding order'], ['play', 'Run the hunt: a quick challenge, a line to say and the clue to read'],
  ['shop', 'Shop day: customers come to the counter and order from the real menu'], ['photos', 'Snap photos as you go. They stay on your phone.'],
  ['print', 'Then print a photo page with a themed border'], ['sidekick', 'Your Sidekick: a second grown-up gets their own lines on their phone']];
const fieldKit = (i = 0) => Gallery.open(HOST.map(([f, cap]) => ({ k: f, cap, src: `img/host/${theme}-${f}.webp` })), { label: 'Your Field Kit', title: true, start: i, foot: Gallery.cta('make/', 'Make my kit') });
// The Field Kit clip: plays (muted, looping) only while it's on screen, and not at all for people who
// turn motion off; the steps beside it light up as it plays, and tapping one jumps there.
{
  const v = $('fkVideo'), steps = [...$('fkSteps').querySelectorAll('button')];
  const at = (b) => +b.dataset.t;
  const light = () => { const t = v.currentTime; steps.forEach((b, k) => b.classList.toggle('on', t >= at(b) && (k === steps.length - 1 || t < at(steps[k + 1])))); };
  v.addEventListener('timeupdate', light);
  steps.forEach((b) => b.addEventListener('click', () => { v.currentTime = at(b); light(); if (!calm()) v.play().catch(() => {}); }));
  if (!calm() && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { if (e.isIntersecting) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause(); }, { threshold: 0.35 }).observe(v);
  }
  steps[0].classList.add('on');
}
$('seeHost').addEventListener('click', () => fieldKit());

// ---- Themes: tap one to see its pages ------------------------------------------------------------
// Two rows of tiles that swipe sideways, so 34 themes don't make a long page.
function drawThemeGrid() {
  $('themeGrid').innerHTML = ordered.map((t) => `
  <button type="button" class="theme" data-id="${t.id}" aria-haspopup="dialog" title="${esc(t.name)}, ages ${t.ages}">
    ${t.id === seasonal ? '<span class="now">Now</span>' : ''}
    <img decoding="async" src="img/icons/${t.id}.webp" alt="" width="240" height="240" loading="lazy"><span>${THEME_LABELS[t.id]}</span>
  </button>`).join('');
  $('themeGrid').querySelectorAll('.theme').forEach((b) => b.addEventListener('click', () => previewTheme(b.dataset.id)));
  if (typeof THEME_GROUPS !== 'undefined' && typeof themeFilter === 'function') themeFilter($('themeChips'), $('themeGrid'));
}
function previewTheme(id) {
  const t = THEMES.find((x) => x.id === id);
  Gallery.open(setPages(id), {
    tabs: ['hunt', 'kit', 'activity', 'party'].map((k) => [k, LABELS[k]]),
    label: `${t.name} pages`,
    foot: Gallery.cta(`make/?theme=${id}`, `Make the ${THEME_LABELS[id]} set`),
    ages: { value: 'big', pages: (a) => setPages(id, a) },
  });
}
drawThemeGrid();

// The free sample's theme list.
$('sampleTheme').innerHTML = ordered.map((t) => `<option value="${t.id}">${esc(t.name)} (ages ${t.ages})</option>`).join('');
$('sampleTheme').value = theme;

// ---- Pricing -------------------------------------------------------------------------------------
// The price card can't know the theme or spots, so it says the fewest pages any theme gets.
document.querySelectorAll('.plan [data-pages]').forEach((el) => {
  const least = Math.min(...Object.keys(PAGES.kit).map((t) => el.dataset.pages.split(' ').reduce((n, k) => n + pagesOf(k, t, 6, 'little'), 0)));
  el.textContent = `${Math.floor(least / 5) * 5}+ pages`;
});
// Family Pass: buy one (Stripe).
$('buyPass').addEventListener('click', () => {
  $('passStatus').textContent = 'Opening secure checkout…';
  goCheckout({}, (t) => { $('passStatus').textContent = t; }, CHECKOUT_URL.replace(/\/api\/checkout$/, '/api/pass'));
});

// Or give one: the code goes to their email with a note.
$('giftForm').addEventListener('submit', (e) => {
  e.preventDefault();
  $('giftStatus').textContent = 'Opening secure checkout…';
  goCheckout({ gift: { to: $('giftTo').value, from: $('giftFrom').value, message: $('giftNote').value } }, (t) => { $('giftStatus').textContent = t; }, CHECKOUT_URL.replace(/\/api\/checkout$/, '/api/pass'));
});

// ---- Free sample signup: posts to the order bot next to /api/checkout ------------------------------
const SAMPLE_URL = CHECKOUT_URL.replace(/\/api\/checkout$/, '/api/sample');
$('sampleForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const say = (t, bad) => { $('sampleStatus').textContent = t; $('sampleStatus').classList.toggle('bad', Boolean(bad)); };
  const email = $('sampleEmail').value.trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) return say('Please enter your email address.', true), $('sampleEmail').focus();
  say('Sending…');
  try {
    const res = await fetch(SAMPLE_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, theme: $('sampleTheme').value }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Something went wrong');
    say('Sent! Check your inbox for your free mini hunt.');
    $('sampleForm').reset();
    $('sampleTheme').value = theme;
  } catch (err) {
    say(err.message || 'That didn’t go through. Please try again.', true);
  }
});

drawHookPages();
showKid();
