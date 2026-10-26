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
// keys. Gallery.open(pages, { tabs, label, start, foot, ages }) where each page is { k, tab, cap, src },
// foot is an element shown under the pages (a buy form or a "Make this" button), and ages
// ({ value: 'big' | 'little', pages: (ages) => pages }) adds a Little kids / Big kids switch: the play kit
// and activity pack differ by age, so parents can flip between the two versions of the same page.
const Gallery = (() => {
  document.body.insertAdjacentHTML('beforeend', `<dialog class="gallery" id="gallery" aria-label="Pages">
  <div class="g-in">
    <header><div><b class="g-title" id="gTitle" hidden></b><div class="g-bar"><div class="tabs" id="gTabs"></div><div class="g-ages" id="gAges" role="group" aria-label="Show the pages for" hidden><button type="button" data-ages="little">Ages 3–5</button><button type="button" data-ages="big">Ages 6–8</button><span class="g-same" id="gSame" hidden>Same for both ages</span></div></div></div><button type="button" class="x" id="gClose" aria-label="Close">×</button></header>
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
  let ages = null; // { value, pages } while the open preview has an age switch
  const AGED = ['kit', 'activity', 'big', 'little', 'photo']; // no "same for both" note on these (they change with the age, or it's a photo)
  function show(i) {
    at = (i + pages.length) % pages.length;
    const p = pages[at];
    const many = pages.length > 1;
    $('gImg').src = p.src;
    $('gImg').alt = p.alt || `${p.cap}${many ? `, page ${at + 1} of ${pages.length}` : ''}`;
    $('gCap').textContent = many ? `${p.cap} · ${at + 1} of ${pages.length}` : p.cap;
    $('gThumbs').querySelectorAll('button').forEach((b, j) => b.setAttribute('aria-current', j === at));
    $('gThumbs').children[at]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    $('gTabs').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.k === p.k));
    if (ages) $('gSame').hidden = AGED.includes(p.k);
  }
  function drawThumbs() {
    $('gallery').classList.toggle('single', pages.length < 2);
    $('gThumbs').innerHTML = pages.length < 2 ? '' : pages.map((p) => `<button type="button" aria-label="${esc(p.cap)}"><img src="${p.src}" alt="" loading="lazy" width="46" height="60"></button>`).join('');
    $('gThumbs').querySelectorAll('button').forEach((b, i) => b.addEventListener('click', () => show(i)));
  }
  // Switching ages keeps you on the same thing (the 3rd play kit page stays the 3rd play kit page).
  function setAges(value) {
    if (!ages) return;
    const p = pages[at];
    const nth = pages.slice(0, at).filter((x) => x.k === p.k).length;
    ages.value = value;
    $('gAges').querySelectorAll('[data-ages]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.ages === value));
    pages = ages.pages(value);
    drawThumbs();
    const same = pages.map((x, i) => [x, i]).filter(([x]) => x.k === p.k);
    show(same.length ? same[Math.min(nth, same.length - 1)][1] : Math.min(at, pages.length - 1));
  }
  $('gAges').querySelectorAll('[data-ages]').forEach((b) => b.addEventListener('click', () => setAges(b.dataset.ages)));
  function open(list, { tabs = [], label = 'Pages', title = false, start = 0, foot = null, ages: agesOpt = null } = {}) {
    if (!list.length) return;
    pages = list;
    ages = agesOpt ? { ...agesOpt } : null;
    $('gAges').hidden = !ages;
    if (ages) $('gAges').querySelectorAll('[data-ages]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.ages === ages.value));
    $('gallery').setAttribute('aria-label', label);
    $('gTitle').hidden = !title;
    $('gTitle').textContent = label;
    $('gallery').classList.toggle('buying', Boolean(foot && foot.tagName === 'FORM'));
    $('gallery').classList.toggle('footed', Boolean(foot));
    $('gFoot').replaceChildren(...(foot ? [foot] : []));
    if (foot) foot.hidden = false;
    // Short names keep the tabs on one line on a phone.
    const SHORT = { hunt: 'Hunt', kit: 'Play kit', activity: 'Activities', party: 'Party' };
    $('gTabs').innerHTML = tabs.map(([k, name]) => `<button type="button" data-k="${k}">${esc(SHORT[k] || name)}</button>`).join('');
    $('gTabs').scrollLeft = 0;
    $('gTabs').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => show(pages.findIndex((p) => p.k === b.dataset.k))));
    drawThumbs();
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
// The <option>s for a theme dropdown: the in-season theme first, then the themes by group
// (THEME_GROUPS), then any left over. Used by the order page and the free sample so they match.
// label(t) is each option's text.
function themeOptions(label = (t) => THEME_LABELS[t.id]) {
  const opt = (t) => `<option value="${t.id}">${esc(label(t))}</option>`;
  const GROUPS = typeof THEME_GROUPS === 'undefined' ? [] : THEME_GROUPS;
  const grouped = new Set(GROUPS.flatMap((g) => g.ids));
  return (seasonal ? opt(THEMES.find((t) => t.id === seasonal)) : '') +
    GROUPS.map((g) => `<optgroup label="${esc(g.label)}">${g.ids.filter((id) => id !== seasonal).map((id) => THEMES.find((t) => t.id === id)).filter(Boolean).map(opt).join('')}</optgroup>`).join('') +
    THEMES.filter((t) => !grouped.has(t.id) && t.id !== seasonal).map(opt).join('');
}

// Filter chips over a row of tiles: All plus each group with at least `min` tiles in the row.
// Tiles carry their id in data-<key>. Returns { show(id) } to bring a hidden tile's group up.
function themeFilter(chips, row, { groups = THEME_GROUPS, key = 'id', min = 2 } = {}) {
  const tiles = () => [...row.querySelectorAll(`[data-${key}]`)];
  const have = new Set(tiles().map((t) => t.dataset[key]));
  const list = groups.map((g) => ({ ...g, ids: g.ids.filter((id) => have.has(id)) })).filter((g) => g.ids.length >= min);
  chips.innerHTML = `<button type="button" data-g="all" aria-pressed="true">All</button>` +
    list.map((g) => `<button type="button" data-g="${g.id}" aria-pressed="false">${esc(g.label)}</button>`).join('');
  const pick = (gid) => {
    const g = list.find((x) => x.id === gid);
    chips.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.g === gid)));
    tiles().forEach((t) => { t.hidden = Boolean(g) && !g.ids.includes(t.dataset[key]); });
    row.scrollLeft = 0;
    const on = chips.querySelector('[aria-pressed="true"]');
    chips.scrollTo({ left: Math.max(0, on.offsetLeft - chips.offsetLeft - 8), behavior: calm() ? 'auto' : 'smooth' });
  };
  chips.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => pick(b.dataset.g)));
  return { show(id) { const t = tiles().find((x) => x.dataset[key] === id); if (t && t.hidden) pick((list.find((g) => g.ids.includes(id)) || { id: 'all' }).id); } };
}

// A theme's play kit pages for the preview: welcome poster, sign and wow piece, then up to four big
// picture pages (BIGPICS, the same for both ages), then a hands-on page. Each is { cap, src }.
function kitPages(id, ages = 'big') {
  const dir = ages === 'little' ? 'little/' : '';
  const page = (n) => ({ cap: GALLERY.kit[n - 1], src: `img/gallery/${id}/${dir}kit-${n}.webp` });
  const big = (typeof BIGPICS !== 'undefined' && BIGPICS[id]) || [];
  return [page(1), page(2), page(3),
    ...(big.length ? big.map((cap, i) => ({ cap, src: `img/gallery/${id}/big-${i + 1}.webp` })) : [page(4)]),
    page(5)];
}

function setPages(id, ages = 'big') {
  const little = (k) => ages === 'little' && (k === 'kit' || k === 'activity');
  return ['hunt', 'kit', 'activity', 'party'].flatMap((x) => [
    ...(x === 'kit' ? kitPages(id, ages) : ((little(x) && GALLERY[`${x}Little`]) || GALLERY[x]).map((cap, i) => ({ cap, src: `img/gallery/${id}/${little(x) ? 'little/' : ''}${x}-${i + 1}.webp` })))
      .map((p) => ({ k: x, tab: LABELS[x], ...p })),
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
