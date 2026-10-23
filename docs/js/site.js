// Shared by every storefront page (home, make/, play-kits/, handprint-art/): small helpers, the phone
// menu and the page preview gallery. Load it at the end of <body>, after js/data.js.
const $ = (id) => document.getElementById(id);
function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); }
const money = (n) => '$' + n.toFixed(2);
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// Phone menu: the header links fold into a drop-down behind the menu button.
(() => {
  const top = document.querySelector('.top');
  const btn = $('menuBtn');
  if (!top || !btn) return;
  const setMenu = (open) => { top.classList.toggle('open', open); btn.setAttribute('aria-expanded', open); };
  btn.addEventListener('click', () => setMenu(btn.getAttribute('aria-expanded') !== 'true'));
  $('navLinks')?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.top')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
})();

// The preview gallery: real pages (or a photo) one at a time, with tabs, thumbnails, swipe and arrow
// keys. Gallery.open(pages, { tabs, label, start, foot }) where each page is { k, tab, cap, src } and
// foot is an element shown under the pages (a buy form or a "Make this" button).
const Gallery = (() => {
  document.body.insertAdjacentHTML('beforeend', `<dialog class="gallery" id="gallery" aria-label="Pages">
  <div class="g-in">
    <header><div><b class="g-title" id="gTitle" hidden></b><div class="tabs" id="gTabs"></div></div><button type="button" class="x" id="gClose" aria-label="Close">×</button></header>
    <div class="view" id="gView">
      <img id="gImg" alt="" width="640" height="828">
      <button type="button" class="nav prev" id="gPrev" aria-label="Previous page">‹</button>
      <button type="button" class="nav next" id="gNext" aria-label="Next page">›</button>
    </div>
    <p class="cap" id="gCap"></p>
    <div class="thumbs" id="gThumbs"></div>
    <div class="g-foot" id="gFoot"></div>
  </div>
</dialog>`);
  let pages = [];
  let at = 0;
  function show(i) {
    at = (i + pages.length) % pages.length;
    const p = pages[at];
    const many = pages.length > 1;
    $('gImg').src = p.src;
    $('gImg').alt = p.alt || `${p.cap}${many ? `, page ${at + 1} of ${pages.length}` : ''}`;
    $('gCap').textContent = many ? `${p.tab ? `${p.tab} · ` : ''}${p.cap} (${at + 1} of ${pages.length})` : p.cap;
    $('gThumbs').querySelectorAll('button').forEach((b, j) => b.setAttribute('aria-current', j === at));
    $('gThumbs').children[at]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    $('gTabs').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.k === p.k));
  }
  function open(list, { tabs = [], label = 'Pages', title = false, start = 0, foot = null } = {}) {
    if (!list.length) return;
    pages = list;
    $('gallery').setAttribute('aria-label', label);
    $('gTitle').hidden = !title;
    $('gTitle').textContent = label;
    $('gallery').classList.toggle('buying', Boolean(foot && foot.tagName === 'FORM'));
    $('gallery').classList.toggle('single', pages.length < 2);
    $('gallery').classList.toggle('footed', Boolean(foot));
    $('gFoot').replaceChildren(...(foot ? [foot] : []));
    if (foot) foot.hidden = false;
    $('gTabs').innerHTML = tabs.map(([k, name]) => `<button type="button" data-k="${k}">${esc(name)}</button>`).join('');
    $('gTabs').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => show(pages.findIndex((p) => p.k === b.dataset.k))));
    $('gThumbs').innerHTML = pages.length < 2 ? '' : pages.map((p) => `<button type="button" aria-label="${esc(p.cap)}"><img src="${p.src}" alt="" loading="lazy" width="46" height="60"></button>`).join('');
    $('gThumbs').querySelectorAll('button').forEach((b, i) => b.addEventListener('click', () => show(i)));
    if (!$('gallery').open) $('gallery').showModal();
    show(Math.max(0, start));
  }
  // A "Make this" button for the bottom of a preview.
  function cta(href, text) {
    const a = document.createElement('a');
    a.className = 'btn btn-orange g-cta';
    a.href = href;
    a.textContent = text;
    return a;
  }
  $('gPrev').addEventListener('click', () => show(at - 1));
  $('gNext').addEventListener('click', () => show(at + 1));
  $('gClose').addEventListener('click', () => $('gallery').close());
  $('gallery').addEventListener('click', (e) => { if (e.target === $('gallery')) $('gallery').close(); });
  $('gallery').addEventListener('keydown', (e) => {
    if (pages.length < 2 || e.target.closest('input, select, textarea')) return;
    if (e.key === 'ArrowLeft') show(at - 1);
    if (e.key === 'ArrowRight') show(at + 1);
  });
  let touch = null;
  $('gView').addEventListener('touchstart', (e) => { touch = e.touches[0].clientX; }, { passive: true });
  $('gView').addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touch;
    if (touch !== null && pages.length > 1 && Math.abs(dx) > 40) show(at + (dx < 0 ? 1 : -1));
    touch = null;
  });
  return { open, show, cta, close: () => $('gallery').close() };
})();

// One theme's whole set (hunt, play kit, activity pack, party pack and the box build), for previews.
function setPages(id, ages = 'big') {
  const little = (k) => ages === 'little' && (k === 'kit' || k === 'activity');
  return ['hunt', 'kit', 'activity', 'party'].flatMap((x) => [
    ...((little(x) && GALLERY[`${x}Little`]) || GALLERY[x]).map((cap, i) => ({ k: x, tab: LABELS[x], cap, src: `img/gallery/${id}/${little(x) ? 'little/' : ''}${x}-${i + 1}.webp` })),
    ...(x === 'kit' && HOWTO[id] ? [{ k: x, tab: LABELS[x], cap: `Build it from a box: ${HOWTO[id]}`, src: `img/howto/${id}-sm.webp` }] : []),
  ]);
}

// Posts to the order bot and goes to the Stripe page it returns. say(text, bad) shows progress and errors.
async function goCheckout(body, say, url = CHECKOUT_URL) {
  if (!url) return say('Checkout opens here soon. Please check back in a little while.');
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) throw new Error(data.error || '');
    location.href = data.url;
  } catch (err) {
    say(err.message || 'Checkout didn’t open. Please try again in a moment.', true);
  }
}
