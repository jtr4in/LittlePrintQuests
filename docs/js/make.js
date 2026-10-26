// The order page (make/): a step-by-step builder. One question per screen (who, theme, what's inside,
// hiding spots or party details, checkout) with the order stack, total and page count beside it.
// Links can pick the theme, trail, age, items or a shop kit: make/?theme=dino&space=apartment&age=5,
// make/?pick=hunt+kit, make/?kit=burger. The old /?theme=…#order links land here too (index.html).

// ages is the little kids (3 to 5) or big kids (6 to 8) version; it follows the age until they pick one.
const state = { ages: 'little', agesPicked: false, theme: 'dino', picks: ['front_door', 'shoe_rack', 'couch', 'dryer', 'bathtub', 'bookshelf', 'pet_bed', 'kitchen_table'], custom: {} };
// Everything is ticked to start; untick what you don't need.
const picked = new Set(['hunt', 'kit', 'activity', 'party']);
let passInfo = null; // { code, left, total } once a Family Pass code checks out
let product = 'bundle+activity';
let payLabel = 'Pay $19.99'; // the bottom button's words on the last step

// ---- Steps ---------------------------------------------------------------------------------------
const STEPS = ['who', 'theme', 'box', 'details', 'pay'];
let step = 'who';
const stepLabel = (s) => ({ who: 'Who it’s for', theme: 'Theme', box: 'What’s inside', details: picked.has('hunt') ? 'Hiding spots' : 'Party details', pay: 'Checkout' })[s];
// Hiding spots are only for the hunt and invitation details only for the party pack.
const live = () => STEPS.filter((s) => s !== 'details' || picked.has('hunt') || picked.has('party'));
function problem(s) {
  if (s === 'who' && !$('childName').value.trim()) return 'Add your kid’s first name so we can put it on the pages.';
  if (s === 'box' && !product) return 'Pick at least one: the hunt, the play kit, the activity pack or the party pack.';
  if (s === 'details' && picked.has('hunt') && state.picks.length < 6) return `Pick at least 6 spots. You have ${state.picks.length}.`;
  return '';
}
function drawSteps() {
  const steps = live();
  const i = steps.indexOf(step);
  $('wizSteps').innerHTML = steps.map((s, j) => `<li><button type="button" data-step="${s}" aria-current="${s === step ? 'step' : 'false'}" class="${j < i ? 'done' : ''}"><b>${j + 1}</b>${stepLabel(s)}</button></li>`).join('');
  $('wizSteps').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => go(b.dataset.step)));
  // on a phone the step pills scroll sideways: keep the current one in view
  const cur = $('wizSteps').querySelector('[aria-current="step"]');
  if (cur) $('wizSteps').scrollLeft += cur.getBoundingClientRect().left - $('wizSteps').getBoundingClientRect().left - 16;
  document.querySelectorAll('.wiz-step').forEach((el) => (el.hidden = el.dataset.step !== step));
  $('wizBack').hidden = i === 0;
  // On the last step the Continue button becomes the pay button, so it's always in the same spot
  // (a bar fixed to the bottom of the screen on phones).
  $('wizNext').textContent = step === 'pay' ? payLabel : 'Continue';
  $('wizNext').classList.toggle('pay', step === 'pay');
  $('navTotal').hidden = step === 'pay';
  $('wizCount').textContent = `Step ${i + 1} of ${steps.length} · ${stepLabel(step)}`;
  $('wizBar').style.width = `${((i + 1) / steps.length) * 100}%`;
  // phones show the order summary only where it helps: choosing what's inside, and checking out
  $('orderForm').dataset.step = step;
}
// Forward only past steps that are done; back any time.
function go(to, { push = true, scroll = true } = {}) {
  const steps = live();
  if (!steps.includes(to)) to = steps[Math.min(steps.length - 1, STEPS.indexOf(to))] || 'pay';
  const ahead = steps.slice(0, steps.indexOf(to)).find((s) => problem(s));
  if (ahead && steps.indexOf(to) > steps.indexOf(step)) {
    if (ahead !== step) { step = ahead; drawSteps(); }
    status(problem(ahead), true);
    return $('formStatus').scrollIntoView({ block: 'nearest', behavior: calm() ? 'auto' : 'smooth' });
  }
  status('');
  if (to === step) return;
  step = to;
  if (push) history.pushState({ step }, '', location.pathname + location.search);
  drawSteps();
  if (step === 'pay') drawReview();
  if (step === 'theme') requestAnimationFrame(() => showTile(state.theme));
  if (scroll) $('wizTop').scrollIntoView({ behavior: calm() ? 'auto' : 'smooth', block: 'start' });
  // the first field of the new step, for keyboards (not on phones, where it would pop the keyboard up)
  if (matchMedia('(hover: hover)').matches) document.querySelector(`.wiz-step[data-step="${step}"] input:not([type="hidden"])`)?.focus({ preventScroll: true });
}
const next = () => { const steps = live(); go(steps[steps.indexOf(step) + 1] || 'pay'); };
$('wizNext').addEventListener('click', () => (step === 'pay' ? $('orderForm').requestSubmit() : next()));
$('wizBack').addEventListener('click', () => { const steps = live(); go(steps[Math.max(0, steps.indexOf(step) - 1)]); });
addEventListener('popstate', (e) => go(e.state?.step || 'who', { push: false }));

// ---- Themes --------------------------------------------------------------------------------------
function drawThemes() {
  $('themeList').innerHTML = ordered.map((t) => `
  <button type="button" class="theme" data-id="${t.id}" aria-pressed="${t.id === state.theme}" title="${esc(t.name)}, ages ${t.ages}">
    ${t.id === seasonal ? '<span class="now">Now</span>' : ''}
    <img decoding="async" src="img/icons/${t.id}.webp" alt="" width="240" height="240" loading="lazy"><span>${THEME_LABELS[t.id]}</span>
  </button>`).join('');
  $('themeList').querySelectorAll('.theme').forEach((b) => b.addEventListener('click', () => setTheme(b.dataset.id)));
  // The dropdown lists the themes by group (the in-season one first), so 34 names are easy to scan.
  const opt = (t) => `<option value="${t.id}">${esc(THEME_LABELS[t.id])}</option>`;
  const GROUPS = typeof THEME_GROUPS === 'undefined' ? [] : THEME_GROUPS;
  const grouped = new Set(GROUPS.flatMap((g) => g.ids));
  $('themeSelect').innerHTML = (seasonal ? opt(THEMES.find((t) => t.id === seasonal)) : '') +
    GROUPS.map((g) => `<optgroup label="${esc(g.label)}">${g.ids.filter((id) => id !== seasonal).map((id) => THEMES.find((t) => t.id === id)).filter(Boolean).map(opt).join('')}</optgroup>`).join('') +
    THEMES.filter((t) => !grouped.has(t.id) && t.id !== seasonal).map(opt).join('');
  if (GROUPS.length && typeof themeFilter === 'function') themeChips = themeFilter($('themeChips'), $('themeList'));
}
let themeChips = null;
$('themeSelect').addEventListener('change', (e) => setTheme(e.target.value, { scroll: true }));
// Slides the tile row (not the page) so the chosen theme's tile shows.
function showTile(id) {
  const row = $('themeList');
  const tile = row.querySelector(`.theme[data-id="${id}"]`);
  if (!tile || !row.offsetWidth) return;
  const r = tile.getBoundingClientRect(), box = row.getBoundingClientRect();
  if (r.left < box.left || r.right > box.right) row.scrollTo({ left: row.scrollLeft + r.left - box.left - 8, behavior: calm() ? 'auto' : 'smooth' });
}
// The banner under the themes shows the chosen theme's whole set laid out on a table (scripts/hero-scenes.js).
let heroAt = null;
function showHero(id) {
  if (id === heroAt) return;
  heroAt = id;
  const name = THEMES.find((x) => x.id === id).name;
  const imgs = [...document.querySelectorAll('#heroBanner .hb')];
  const front = imgs.find((i) => i.classList.contains('on'));
  const back = imgs.find((i) => i !== front);
  back.onload = () => { back.classList.add('on'); front.classList.remove('on'); };
  back.alt = `The ${name} set printed out: host guide, story briefing, clue cards, play kit, activity page, party invitation and the Field Kit on a phone`;
  LPQName.setSrc(back, `img/hero/${id}.webp`, `img/hero/${id}-sm.webp 800w, img/hero/${id}.webp 1600w`);
  $('heroCap').innerHTML = `<b>${esc(name)}</b><span>See the pages</span>`;
}
$('heroCap').addEventListener('click', () => Gallery.open(setPages(state.theme, state.ages), { tabs: ['hunt', 'kit', 'activity', 'party'].map((k) => [k, LABELS[k]]), label: `${THEMES.find((t) => t.id === state.theme).name} pages`, ages: { value: state.ages, pages: (a) => setPages(state.theme, a) } }));
function setTheme(id, { scroll = false } = {}) {
  state.theme = id;
  $('themeSelect').value = id;
  document.querySelectorAll('#themeList .theme').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === id)));
  themeChips?.show(id);
  if (scroll) showTile(id);
  $('themeName').textContent = THEMES.find((t) => t.id === id).name;
  render();
  // The banner and the order stack's papers wait for the theme's name data (a small file), so each
  // picture downloads once, already without the sample name.
  LPQName.preload(id).then(() => { named.add(id); if (state.theme === id) { showHero(id); drawCart(); } });
}

// ---- Hiding spots --------------------------------------------------------------------------------
function labelOf(key) { return state.custom[key] || (SPOTS.find((s) => s[0] === key) || [, key])[1]; }
function drawChips() {
  // a picked spot moves up into the trail, so only the spots still to pick are listed here
  const all = [...SPOTS, ...Object.entries(state.custom)].filter(([key]) => !state.picks.includes(key));
  $('spotChips').innerHTML = all.map(([key, label]) => `<button type="button" class="chip" data-key="${key}">${esc(label)}</button>`).join('');
  $('spotChips').querySelectorAll('.chip').forEach((c) => c.addEventListener('click', () => toggle(c.dataset.key)));
}
function toggle(key) {
  const i = state.picks.indexOf(key);
  if (i >= 0) state.picks.splice(i, 1);
  else if (state.picks.length < 10) state.picks.push(key);
  else return status('You’ve picked 10 spots, the most a hunt can hold. Tap one to remove it first.', true);
  status('');
  render();
}
function useSpace(id) {
  if (!SPACES[id]) return;
  state.picks = [...SPACES[id][1]];
  status('');
  render();
  document.querySelectorAll('#presets button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.space === id)));
}
$('presets').insertAdjacentHTML('beforeend', Object.entries(SPACES).map(([id, [label]]) => `<button type="button" data-space="${id}" aria-pressed="false">${label}</button>`).join(''));
$('presets').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => useSpace(b.dataset.space)));
$('addSpot').addEventListener('click', addCustom);
$('customSpot').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } });
function addCustom() {
  const label = $('customSpot').value.trim();
  if (!label) return;
  const key = 'custom_' + Date.now();
  state.custom[key] = label;
  $('customSpot').value = '';
  toggle(key);
}

// The trail: the picked spots in order. Tap a stop to take it off; drag it (long-press on a phone) to move it.
function drawRoute() {
  const n = state.picks.length;
  $('route').innerHTML = n
    ? state.picks.map((k, i) => {
        const last = i === n - 1;
        const label = esc(labelOf(k));
        return `<li class="${last ? 'prize' : ''}" data-i="${i}"><button type="button" aria-label="Stop ${i + 1}: ${label}${last ? ', the prize' : ''}. Tap to remove">${last ? '<b>★</b>' : `<b>${i + 1}</b>`}${label}<i aria-hidden="true">×</i></button></li>`;
      }).join('')
    : '<li class="empty">Your trail shows up here. Tap spots below, or start from a ready-made one.</li>';
  $('routeTip').hidden = n < 2;
  $('spotCount').textContent = `${n} of 6 to 10 picked`;
}
(() => {
  const route = $('route');
  let drag = null; // { i, x, y, on, timer, ghost, to }
  const end = () => {
    if (!drag) return;
    clearTimeout(drag.timer);
    drag.ghost?.remove();
    route.querySelectorAll('li').forEach((li) => li.classList.remove('dragging', 'drop-before', 'drop-after'));
    drag = null;
  };
  const start = () => {
    drag.on = true;
    const li = route.querySelector(`li[data-i="${drag.i}"]`);
    li.classList.add('dragging');
    drag.ghost = li.querySelector('button').cloneNode(true);
    drag.ghost.className = 'route-ghost';
    document.body.append(drag.ghost);
    move(drag.x, drag.y);
  };
  const move = (x, y) => {
    Object.assign(drag.ghost.style, { left: x + 'px', top: y + 'px' });
    route.querySelectorAll('li').forEach((li) => li.classList.remove('drop-before', 'drop-after'));
    // drop next to the stop nearest the finger
    let best = null;
    route.querySelectorAll('li[data-i]').forEach((li) => {
      const r = li.getBoundingClientRect();
      const d = Math.hypot(x - (r.left + r.width / 2), Math.max(0, Math.abs(y - (r.top + r.height / 2)) - r.height / 2) * 3);
      if (!best || d < best.d) best = { li, d, after: x > r.left + r.width / 2 };
    });
    if (!best) return;
    best.li.classList.add(best.after ? 'drop-after' : 'drop-before');
    const at = +best.li.dataset.i + (best.after ? 1 : 0);
    drag.to = at > drag.i ? at - 1 : at;
  };
  route.addEventListener('pointerdown', (e) => {
    const li = e.target.closest('li[data-i]');
    if (!li || e.button > 0) return;
    drag = { i: +li.dataset.i, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, on: false, to: +li.dataset.i };
    // a mouse drags as soon as it moves; a finger holds still for a moment first, so the page still scrolls
    if (e.pointerType !== 'mouse') drag.timer = setTimeout(() => drag && start(), 280);
  });
  addEventListener('pointermove', (e) => {
    if (!drag) return;
    drag.x = e.clientX; drag.y = e.clientY;
    if (drag.on) return move(e.clientX, e.clientY);
    if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 6) return;
    // a finger that moves before the hold is scrolling the page, so it's not a tap either
    if (e.pointerType === 'mouse') start(); else end();
  });
  const drop = () => {
    if (!drag) return;
    const { i, on, to } = drag;
    end();
    if (!on) return toggle(state.picks[i]);
    if (to === i) return;
    const [k] = state.picks.splice(i, 1);
    state.picks.splice(to, 0, k);
    render();
  };
  addEventListener('pointerup', drop);
  route.addEventListener('touchend', drop);
  // the browser may cancel the pointer once a finger drag is under way; the touch events carry it from there
  addEventListener('pointercancel', () => { if (!drag?.on) end(); });
  // once a finger drag starts, stop the page from scrolling under it
  route.addEventListener('touchmove', (e) => {
    if (!drag?.on) return;
    e.preventDefault();
    drag.x = e.touches[0].clientX; drag.y = e.touches[0].clientY;
    move(drag.x, drag.y);
  }, { passive: false });
  route.addEventListener('contextmenu', (e) => { if (drag) e.preventDefault(); });
  // keyboard: Enter/Space removes (taps are handled above); arrows move a stop
  route.addEventListener('click', (e) => {
    const li = e.target.closest('li[data-i]');
    if (li && e.detail === 0) toggle(state.picks[+li.dataset.i]);
  });
  route.addEventListener('keydown', (e) => {
    const li = e.target.closest('li[data-i]');
    if (!li || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const i = +li.dataset.i, to = i + (e.key === 'ArrowLeft' ? -1 : 1);
    if (to < 0 || to >= state.picks.length) return;
    e.preventDefault();
    [state.picks[i], state.picks[to]] = [state.picks[to], state.picks[i]];
    render();
    route.querySelector(`li[data-i="${to}"] button`).focus();
  });
})();

function status(msg, bad) { $('formStatus').textContent = msg; $('formStatus').classList.toggle('bad', !!bad); }

function render() {
  const age = parseInt($('childAge').value, 10);
  if (!state.agesPicked && age) state.ages = age <= 5 ? 'little' : 'big'; // little kids are 3 to 5
  $('agesPick').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.ages === state.ages)));
  drawRoute();
  drawChips();
  drawCart();
}
$('agesPick').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
  state.ages = b.dataset.ages;
  state.agesPicked = true;
  render();
}));
$('childAge').addEventListener('input', render);

// ---- The cart: a stack of papers, one per thing picked --------------------------------------------
const little = (k) => state.ages === 'little' && (k === 'kit' || k === 'activity');
const named = new Set(); // themes whose name data has loaded, so their papers can go straight to the twins
function pick(id) {
  picked.has(id) ? picked.delete(id) : picked.add(id);
  drawCart();
}
function setPicks(ids) {
  picked.clear();
  ids.forEach((k) => picked.add(k));
  drawCart();
}
function drawCart() {
  const gets = LAYERS.map((l) => l.id).filter((k) => picked.has(k));
  product = productOf(gets);
  // papers fan out wider as the stack grows
  const pos = { 1: [[0, 0]], 2: [[-38, -6], [38, 5]], 3: [[-62, -9], [62, 9], [0, -1]], 4: [[-74, -10], [74, 10], [-24, -4], [26, 3]] }[gets.length] || [];
  const order = ['hunt', 'party', 'activity', 'kit'].filter((k) => gets.includes(k));
  $('stack').querySelectorAll(':scope > img').forEach((img) => img.classList.toggle('out', !gets.includes(img.dataset.k)));
  order.forEach((k, i) => {
    const img = $('stack').querySelector(`[data-k="${k}"]`);
    // The play kit's paper (on top of the stack) is its realistic wow prop, the third Play kit page
    // in the gallery for every theme and age (Jason, 2026-10-26: lead with the wow pieces).
    const src = k === 'kit' ? `img/gallery/${state.theme}/${little(k) ? 'little/' : ''}kit-3.webp`
      : `img/pages/${state.theme}-${little(k) ? 'little-' : ''}${k}.webp`;
    if (named.has(state.theme) && img.dataset.src !== src) { img.dataset.src = src; LPQName.setSrc(img, src); }
    img.style.zIndex = i + 1;
    img.style.transform = `translate(calc(-50% + ${pos[i][0]}px), ${Math.abs(pos[i][0]) / 5}px) rotate(${pos[i][1]}deg)`;
  });
  // Field Kit rides along with the hunt.
  const phone = $('stack').querySelector('.phone');
  phone.classList.toggle('out', !gets.includes('hunt'));
  // tuck the phone against the lower left of the hunt's clue cards, outside the rest of the stack
  const huntX = gets.includes('hunt') ? pos[order.indexOf('hunt')][0] : 0;
  phone.style.left = `max(4px, calc(50% + ${huntX - 104}px))`;
  const host = phone.querySelector('img'), hostSrc = `img/host/${state.theme}-play.webp`;
  if (named.has(state.theme) && host.dataset.src !== hostSrc) { host.dataset.src = hostSrc; LPQName.setSrc(host, hostSrc); }
  $('layers').innerHTML = LAYERS.map((l) => `<li><button type="button" class="layer" data-id="${l.id}" aria-pressed="${gets.includes(l.id)}">
      <span class="box">✓</span><span><b>${l.name}</b><small>${l.note}<span class="plus">${{ hunt: '+ Field Kit phone guide included', kit: '+ Play ideas in the Field Kit', activity: '+ Reusable with a dry-erase marker', party: '+ Party checklist in the Field Kit' }[l.id] || ''}</span></small></span><span class="amt">${l.id === 'activity' && gets.some((k) => k !== 'activity') ? `+${money(PRICES.activityAdd)}` : money(l.price)}</span></button></li>`).join('');
  $('layers').querySelectorAll('button.layer').forEach((b) => b.addEventListener('click', () => pick(b.dataset.id)));
  const value = gets.reduce((sum, k) => sum + LAYERS.find((l) => l.id === k).price, 0);
  const price = priceOf(product);
  // suggest the party pack first: it's the add-on
  const nextUp = ['party', 'activity', 'kit', 'hunt'].find((k) => !gets.includes(k));
  const nextName = nextUp && LAYERS.find((l) => l.id === nextUp).name.toLowerCase();
  const addNext = nextUp && ` Add the ${nextName} for ${money(priceOf(productOf([...gets, nextUp].sort((a, b) => LAYERS.findIndex((l) => l.id === a) - LAYERS.findIndex((l) => l.id === b)))) - price)} more.`;
  $('saveNote').innerHTML = !product ? 'Pick at least one thing to print.'
    : gets.length > 1 ? `<s>${money(value)}</s> together for ${money(price)}, so you save ${money(value - price)}.${addNext || ''}`
    : `Add another one and save. All four are ${money(priceOf('bundle+activity'))}.`;
  $('totalLabel').textContent = !product ? 'Nothing picked yet' : gets.length === 4 ? 'Everything bundle, PDF' : product === 'hunt+kit+activity' ? 'Play bundle, PDF' : product === 'bundle' ? 'Party bundle, PDF' : `${gets.map((k) => LABELS[k]).join(' + ')}, PDF`;
  const shown = passInfo && product ? '$0.00' : money(price);
  if (passInfo && product) {
    $('totalPrice').innerHTML = `<s>${money(price)}</s>$0.00`;
    $('totalLabel').textContent += ' · Family Pass';
  } else $('totalPrice').textContent = money(price);
  $('navTotal').textContent = product ? shown : '';
  payLabel = passInfo && product ? 'Make my order with my pass' : `Pay ${money(price)}`;
  $('checkoutBtn').textContent = payLabel;
  // the pass pays off for anyone spending this much more than once a year
  $('passUp').hidden = Boolean(passInfo) || price < 13;
  $('peek').parentElement.hidden = !product;
  const badge = $('stack').querySelector('.pages-badge');
  const total = gets.reduce((n, k) => n + pagesOf(k, state.theme, state.picks.length, state.ages), 0);
  badge.hidden = !total;
  if (badge.textContent !== `${total} pages`) {
    badge.textContent = `${total} pages`;
    badge.classList.remove('pop');
    void badge.offsetWidth;
    badge.classList.add('pop');
  }
  $('spotsField').hidden = !picked.has('hunt');
  $('partyDetails').hidden = !picked.has('party');
  // with no hunt, the party details are all this step has, so show them open
  if (!picked.has('hunt')) $('partyDetails').open = true;
  // only the party pack is the same for every age
  $('agesField').hidden = !gets.some((k) => k !== 'party');
  if (!live().includes(step)) step = 'pay';
  drawSteps();
  if (step === 'pay') drawReview();
}

// The last step: everything they chose, in words, each with a link back to change it.
function drawReview() {
  const name = $('childName').value.trim();
  const age = parseInt($('childAge').value, 10);
  const gets = LAYERS.filter((l) => picked.has(l.id));
  const party = ['partyDate', 'partyTime', 'partyPlace', 'partyRsvp'].map((id) => $(id).value.trim()).filter(Boolean);
  const rows = [
    ['who', 'For', `${esc(name)}${age ? `, turning ${age}` : ''}${gets.some((l) => l.id !== 'party') ? ` · ${state.ages === 'little' ? 'little kids (3 to 5)' : 'big kids (6 to 8)'}` : ''}`],
    ['theme', 'Theme', esc(THEMES.find((t) => t.id === state.theme).name)],
    ['box', 'Includes', `${gets.map((l) => l.name).join(', ')}${picked.has('hunt') || picked.has('kit') || picked.has('party') ? ', plus the Field Kit' : ''}`],
    ...(picked.has('hunt') ? [['details', 'Hiding spots', state.picks.map((k, i) => `${i === state.picks.length - 1 ? '★ ' : ''}${esc(labelOf(k))}`).join(' → ')]] : []),
    ...(picked.has('party') ? [['details', 'Invitations', party.length ? party.map(esc).join(' · ') : 'Write-in lines for the date and place']] : []),
  ];
  $('review').innerHTML = rows.map(([s, k, v]) => `<div><dt>${k}</dt><dd>${v}</dd><dd class="edit"><button type="button" data-step="${s}">Change</button></dd></div>`).join('');
  $('review').querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => go(b.dataset.step)));
}

$('stack').innerHTML = ['hunt', 'kit', 'activity', 'party'].map((k) => `<img data-k="${k}" class="out" alt="" width="400" height="518">`).join('')
  + '<span class="phone out"><img alt="" width="240" height="480"></span><span class="pages-badge" hidden></span>';

// Tapping the stack opens a gallery of real pages for the picked items, made by scripts/gallery-images.js.
function openGallery(k) {
  const gets = ['hunt', 'kit', 'activity', 'party'].filter((x) => picked.has(x));
  if (!gets.length) return;
  const pagesFor = (a) => setPages(state.theme, a).filter((p) => gets.includes(p.k));
  const pages = pagesFor(state.ages);
  // starts on the age they picked; the switch only changes the preview, not the order
  Gallery.open(pages, { tabs: gets.map((x) => [x, LABELS[x]]), label: 'Pages in your order', start: pages.findIndex((p) => p.k === k),
    ages: gets.some((x) => x === 'kit' || x === 'activity') ? { value: state.ages, pages: pagesFor } : null });
}
$('stack').addEventListener('click', (e) => openGallery(e.target.closest('[data-k]')?.dataset.k));
$('stack').addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGallery(); } });
$('peek').addEventListener('click', () => openGallery());

// ---- Checkout ------------------------------------------------------------------------------------
$('orderForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  // Enter in a field before the last step means "Continue"
  if (step !== 'pay') return next();
  const bad = live().find((s) => problem(s));
  if (bad) { go(bad); status(problem(bad), true); return $('formStatus').scrollIntoView({ block: 'nearest' }); }
  const items = [...picked];
  const order = {
    product,
    items,
    theme: state.theme,
    childName: $('childName').value.trim(),
    age: parseInt($('childAge').value, 10) || null,
    ages: state.ages,
    spots: items.includes('hunt') ? state.picks.map((k) => (state.custom[k] ? { custom: state.custom[k] } : k)) : [],
    party: { date: $('partyDate').value, time: $('partyTime').value, place: $('partyPlace').value, rsvp: $('partyRsvp').value },
  };
  if (passInfo) order.passCode = passInfo.code;
  status(passInfo ? 'Making your order…' : 'Opening secure checkout…');
  goCheckout(order, status);
});

// Family Pass: apply a code so this order is free.
const PASS_URL = CHECKOUT_URL.replace(/\/api\/checkout$/, '/api/pass');
async function applyPass() {
  const code = $('passCode').value.trim();
  if (!code) return;
  $('passNote').textContent = 'Checking your code…';
  try {
    const res = await fetch(`${PASS_URL}/check`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'That code didn’t work. Please try again.');
    passInfo = { code, left: data.left, total: data.total };
    $('passNote').textContent = `Pass applied. This order uses 1 of your ${data.left} left.`;
  } catch (err) {
    passInfo = null;
    // Promo codes (not Family Pass codes) go on the Stripe payment page.
    const promo = !/^LPQ/i.test(code) && err.message !== 'Failed to fetch';
    $('passNote').textContent = promo ? 'That looks like a promo code. Tap the checkout button and enter it under “Add promotion code” on the payment page.' : err.message === 'Failed to fetch' ? 'We couldn’t check that code just now. Please try again.' : err.message;
  }
  drawCart();
}
$('passApply').addEventListener('click', applyPass);
$('passCode').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); applyPass(); } });
$('passCode').addEventListener('input', () => { if (passInfo) { passInfo = null; $('passNote').textContent = ''; drawCart(); } });

// ---- The kid's name ------------------------------------------------------------------------------
// What a parent typed on any page (js/names.js keeps it) fills the name box, the headline and every preview.
function showKid() {
  const typed = LPQName.typed();
  $('makeName').textContent = typed ? `${LPQName.get()}’s` : 'your kid’s';
  document.querySelectorAll('[data-kid-name]').forEach((el) => { el.textContent = LPQName.get(); });
}
$('childName').addEventListener('input', () => { LPQName.set($('childName').value); showKid(); if (step === 'pay') drawReview(); });

// ---- Start ---------------------------------------------------------------------------------------
const params = new URLSearchParams(location.search);
const askedAge = Number(params.get('age'));
if (askedAge >= 2 && askedAge <= 12) $('childAge').value = askedAge;
$('childName').value = LPQName.typed();
const kit = SHOP_KITS.some(([id]) => id === params.get('kit')) ? params.get('kit') : null;
const asked = kit || (THEMES.some((t) => t.id === params.get('theme')) ? params.get('theme') : null);
drawThemes();
setTheme(asked || seasonal || state.theme);
useSpace(params.get('space'));
const pickParam = (params.get('pick') || '').split(/[\s,+]+/).filter((k) => LABELS[k]);
if (kit) setPicks(['kit']);
else if (pickParam.length) setPicks(pickParam);
showKid();
render();
// Always start on step 1, even with a name already typed: it also asks which age version they want
// (Jason, 2026-10-23: skipping ahead meant nobody saw it). A theme, kit or items from the link are
// already picked, so later steps start filled in.
step = 'who';
history.replaceState({ step }, '', location.pathname + location.search);
drawSteps();
