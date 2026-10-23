// The home page: shows what the kits are and sends people to make/ to order. The name typed at the top
// goes onto every preview (js/names.js) and is kept for the order page.
let theme = seasonal || 'dino'; // the theme the hero and free sample start on

// ---- The name hook -------------------------------------------------------------------------------
function showKid() {
  const typed = LPQName.typed();
  document.querySelector('#hookTitle b').textContent = typed || 'your kid';
  $('hookGo').textContent = typed ? `Make ${typed}’s kit` : 'Make my kit';
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
  $('hookBack').src = `img/pages/${id}-kit.webp`;
  $('hookFront').src = `img/pages/${id}-party.webp`;
  LPQName.preload(id);
}
// The occasion under the headline rotates so it reads as more than a birthday thing, each a nod to a theme.
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
    drawHookPages(id || theme);
  }, 350);
}
if (!calm()) setInterval(nextOccasion, 3200);

// ---- Hero banner: each set laid out on a table that matches the theme (scripts/hero-scenes.js) -----
// It rotates through the themes; its button opens the order page with that theme.
let heroAt = null;
const heroSrc = (id) => ({ src: `img/hero/${id}.webp`, srcset: `img/hero/${id}-sm.webp 800w, img/hero/${id}.webp 1600w` });
function showHero(id) {
  if (id === heroAt) return;
  heroAt = id;
  const name = THEMES.find((x) => x.id === id).name;
  const imgs = [...document.querySelectorAll('#heroBanner .hb')];
  const front = imgs.find((i) => i.classList.contains('on'));
  const back = imgs.find((i) => i !== front);
  const { src, srcset } = heroSrc(id);
  back.onload = () => { back.classList.add('on'); front.classList.remove('on'); };
  back.srcset = srcset;
  back.src = src;
  back.alt = `The ${name} set printed out: host guide, story briefing, clue cards, play kit, activity page, party invitation and Host Mode on a phone`;
  $('heroCap').innerHTML = `<b>${esc(name)}</b><span>Make this set</span>`;
  $('heroCap').dataset.id = id;
  // warm up the next one so the fade is instant
  new Image().src = heroSrc(ordered[(ordered.findIndex((x) => x.id === id) + 1) % ordered.length].id).src;
}
$('heroCap').addEventListener('click', () => { location.href = `make/?theme=${$('heroCap').dataset.id}`; });
showHero(theme);
if (!calm()) setInterval(() => { if (!document.hidden) showHero(ordered[(ordered.findIndex((x) => x.id === heroAt) + 1) % ordered.length].id); }, 5000);

// ---- What you get: each product card opens its real pages, the photo first ------------------------
$('productCards').querySelectorAll('.product').forEach((b) => b.addEventListener('click', () => {
  const k = b.dataset.k, id = b.dataset.theme, name = b.querySelector('b').textContent;
  const pages = [{ k, cap: `${name}, printed and set up`, src: b.dataset.photo, alt: b.querySelector('img').alt },
    ...setPages(id).filter((p) => p.k === k).map((p) => ({ ...p, tab: '' }))];
  Gallery.open(pages, { label: `${name}: ${THEMES.find((t) => t.id === id).name}`, title: true, foot: Gallery.cta(`make/?theme=${id}`, 'Make my kit') });
}));
// Host Mode: three phone screens from a real order.
const HOST = [['hide', 'Hide the cards: one per screen, in your hiding order'], ['play', 'Play along: a quick challenge, a line to say and the clue to read'], ['sidekick', 'Bring a sidekick: a second grown-up gets their own lines']];
$('hostThumb').src = `img/host/${theme}-play.webp`;
$('seeHost').addEventListener('click', () => Gallery.open(HOST.map(([f, cap]) => ({ k: f, cap, src: `img/host/${theme}-${f}.webp` })), { label: 'Host Mode', title: true, foot: Gallery.cta('make/', 'Make my kit') }));

// ---- Themes: tap one to see its pages ------------------------------------------------------------
// Two rows of tiles that swipe sideways, so 27 themes don't make a long page.
function drawThemeGrid() {
  $('themeGrid').innerHTML = ordered.map((t) => `
  <button type="button" class="theme" data-id="${t.id}" aria-haspopup="dialog" title="${esc(t.name)}, ages ${t.ages}">
    ${t.id === seasonal ? '<span class="now">Now</span>' : ''}
    <img src="img/icons/${t.id}.webp" alt="" width="240" height="240" loading="lazy"><span>${THEME_LABELS[t.id]}</span>
  </button>`).join('');
  $('themeGrid').querySelectorAll('.theme').forEach((b) => b.addEventListener('click', () => previewTheme(b.dataset.id)));
}
function previewTheme(id) {
  const t = THEMES.find((x) => x.id === id);
  Gallery.open(setPages(id), {
    tabs: ['hunt', 'kit', 'activity', 'party'].map((k) => [k, LABELS[k]]),
    label: `${t.name} pages`,
    foot: Gallery.cta(`make/?theme=${id}`, `Make the ${THEME_LABELS[id]} set`),
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
