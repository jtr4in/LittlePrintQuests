// The home page: shows what the kits are and sends people to make/ to order. The name typed at the top
// goes onto every preview (js/names.js) and is kept for the order page.
let theme = seasonal || 'dino'; // the theme the "What's in the box" section shows

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
// The two pages beside the name box: the story letter and the certificate, in the theme that goes
// with the occasion in the headline.
function drawHookPages(id = theme) {
  $('hookBack').src = `img/pages/${id}-briefing.webp`;
  $('hookFront').src = `img/pages/${id}-cert.webp`;
  LPQName.preload(id);
}
// The headline's occasion rotates so it reads as more than a birthday thing, each a nod to a theme.
const OCCASIONS = [
  // (all take "A", which stays put while the occasion fades)
  ['birthday', null], ['rainy day', 'pirate'], ['sleepover', 'space'], ['snow day', 'ice'],
  ['Halloween', 'halloween'], ['playdate', 'dino'], ['Christmas morning', 'christmas'],
  ['Valentine’s Day', 'valentine'], ['spring break', 'easter'], ['weekend', 'royal'],
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

// ---- Photos open bigger, with a button to make that set -------------------------------------------
$('lifePhotos').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
  const img = b.querySelector('img');
  const name = b.querySelector('span').firstChild.textContent;
  Gallery.open([{ src: b.dataset.big, cap: name, alt: img.alt }], { label: name, foot: Gallery.cta(`make/?theme=${b.dataset.theme}`, b.dataset.cta) });
}));

// ---- Themes: tap one to see its pages ------------------------------------------------------------
// Two rows of tiles that swipe sideways, so 27 themes don't make a long page.
function drawThemeGrid() {
  $('themeGrid').innerHTML = ordered.map((t) => `
  <button type="button" class="theme" data-id="${t.id}" aria-haspopup="dialog" title="${esc(t.name)}, ages ${t.ages}">
    ${t.id === seasonal ? '<span class="now">Now</span>' : ''}
    <img src="img/themes/${t.id}.webp" alt="" width="220" height="220" loading="lazy"><span>${THEME_LABELS[t.id]}</span>
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

// ---- What's in the box: one set of tabs that follows the chosen theme -----------------------------
document.querySelectorAll('#inside [role="tab"]').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('#inside [role="tab"]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
  document.querySelectorAll('#inside .box-panel').forEach((p) => (p.hidden = p.dataset.panel !== b.dataset.tab));
}));
const options = ordered.map((t) => `<option value="${t.id}">${esc(t.name)} (ages ${t.ages})</option>`).join('');
$('boxSelect').innerHTML = options;
$('sampleTheme').innerHTML = options;
$('boxSelect').addEventListener('change', (e) => { theme = e.target.value; drawBox(); });
function drawBox() {
  const t = THEMES.find((x) => x.id === theme);
  const k = KITS[t.id];
  $('boxSelect').value = t.id;
  $('boxTheme').textContent = t.name;
  $('boxGo').href = `make/?theme=${t.id}`;
  $('kitImg').src = `img/kit-${t.id}.webp`;
  $('kitImg').alt = k.alt;
  $('kitName').textContent = k.name;
  $('kitBlurb').textContent = k.blurb.replace(/your child’s/g, 'your kid’s');
  $('howtoLink').hidden = !HOWTO[t.id];
  if (HOWTO[t.id]) {
    $('howtoLink').href = `img/howto/${t.id}.webp`;
    $('howtoImg').src = `img/howto/${t.id}-sm.webp`;
    $('howtoImg').alt = `${HOWTO[t.id]}: six illustrated cardboard box steps`;
    $('howtoName').textContent = HOWTO[t.id];
  }
  $('huntName').textContent = t.name;
  for (const [el, part] of [['huntGuide', 'guide'], ['huntPuzzle', 'puzzle'], ['huntCards', 'cards'], ['huntCert', 'cert'], ['huntBonus', 'bonus']]) $(el).src = `img/pages/${t.id}-${part}.webp`;
  for (const [el, part] of [['hostHide', 'hide'], ['hostPlay', 'play'], ['hostSidekick', 'sidekick']]) $(el).src = `img/host/${t.id}-${part}.webp`;
  for (const [el, n] of [['actSpy', 2], ['actSpot', 3], ['actMaze', 4], ['actWords', 5]]) {
    $(el).src = `img/gallery/${t.id}/activity-${n}.webp`;
    $(el).alt = `${GALLERY.activity[n - 1]} activity page`;
    $(`${el}Cap`).textContent = GALLERY.activity[n - 1];
  }
  $('partyImg').src = `img/pages/${t.id}-party.webp`;
  $('partyImg').alt = `${t.name} party invitation with your kid’s name`;
  $('sampleTheme').value = t.id;
}

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

drawBox();
drawHookPages();
showKid();
