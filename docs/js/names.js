// Writes the kid's name onto the page previews. Every preview picture that shows the sample name
// (Maya) has a twin in img/n/ with that name left out, and img/n/<set>.json says where the name went:
// each spot's box on the page, its fonts and colors, and its words with the name as {N}. This file
// swaps each such picture for its twin and lays those words back over it with whatever name the
// parent typed, so every preview updates as they type, with no waiting on a server.
// The pictures and JSON come from scripts/gallery-images.js, site-images.js and hero-scenes.js
// (see src/generator/name-slots.js).
//
// LPQName.get() is the name to show (the sample name until a parent types one), LPQName.typed() what
// they typed, LPQName.set(name) saves it for next time, and LPQName.on(fn) hears every change.
// LPQName.setSrc(img, src, srcset) swaps a picture without downloading the sample-name version first
// (call LPQName.preload(set) a little ahead so the set's data is there).
(() => {
  const SAMPLE = 'Maya';
  const KEY = 'lpq.kidName';
  const read = () => { try { return localStorage.getItem(KEY) || ''; } catch { return ''; } };
  let typed = read();
  const listeners = new Set();
  const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, 24);
  const get = () => typed || SAMPLE;

  // ---- The JSON for each set, loaded once ------------------------------------------------------
  const shards = {};
  // Same rule as shardOf() in src/generator/name-slots.js.
  const shardOf = (key) => (/^img\/gallery\/crafts\//.test(key) ? 'crafts' : key.match(/^img\/(?:gallery\/|pages\/|kit-|hero\/|host\/)([a-z]+)/)?.[1]);
  const load = (shard) => (shards[shard] ||= fetch(`img/n/${shard}.json`).then((r) => (r.ok ? r.json() : {})).catch(() => ({})).then((d) => (shards[shard] = d)));
  const ready = (shard) => (shards[shard] && !(shards[shard] instanceof Promise) ? shards[shard] : null);

  // ---- Drawing the words -----------------------------------------------------------------------
  const esc = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const sized = (html, f) => (f === 1 ? html : html.replace(/(font-size|line-height|letter-spacing|word-spacing):(-?[\d.]+)px/g, (_, k, v) => `${k}:${(v * f).toFixed(2)}px`));
  const slotHtml = (slot) => {
    const t = `left:${slot.x}px;top:${slot.y}px;transform:translate(-50%,-50%)${slot.r ? ` rotate(${slot.r}deg)` : ''}${slot.s ? ` scale(${slot.s})` : ''}`;
    return `<div class="nm-slot" style="${t}"></div>`;
  };
  // One page's spots, in page units (816 x 1056 for Letter).
  const pageHtml = (p) => `<div class="nm-page" style="width:${p.w}px;height:${p.h}px">${p.s.map(slotHtml).join('')}</div>`;

  // Fills every spot under `root` with the name, shrinking the words until they fit the box.
  function fill(root, pages, name) {
    const slots = root.querySelectorAll('.nm-slot');
    const all = pages.flatMap((p) => p.s);
    slots.forEach((el, i) => {
      el.innerHTML = all[i].html.split('{N}').join(esc(name));
      el.dataset.fit = '1';
    });
    fit(root);
  }
  // Only boxes on screen can be measured; the rest wait for the next sync. A box is too full when the
  // name pushes the words past its sides, or onto another line: anything printed under it is baked
  // into the picture, so a wrapped name would run over it. Heights get a little slack because the
  // fonts' line metrics differ a hair between devices.
  function fit(root) {
    if (!root.offsetWidth) return;
    root.querySelectorAll('.nm-slot[data-fit="1"]').forEach((el) => {
      el.dataset.fit = '';
      const box = () => el.firstElementChild;
      if (!box()) return;
      const cw = box().clientWidth;
      const ch = box().clientHeight;
      const over = () => box().scrollWidth > cw + 1 || box().scrollHeight > ch * 1.2 + 2;
      if (!over()) return;
      const html = el.innerHTML;
      let lo = 0.3;
      let hi = 1;
      for (let i = 0; i < 7; i++) {
        const f = (lo + hi) / 2;
        el.innerHTML = sized(html, f);
        if (over()) hi = f;
        else lo = f;
      }
      el.innerHTML = sized(html, lo);
    });
  }

  // ---- Laying the words over a picture ---------------------------------------------------------
  // tracked: img -> { key, entry, ov }
  const tracked = new Map();
  const relSrc = (img) => {
    const src = img.getAttribute('src') || '';
    try { return new URL(src, location.href).pathname.replace(/^.*?\/(img\/)/, '$1'); } catch { return src; }
  };

  // The overlay for one picture: a plain page, or pages laid out on a scene (the kit fan, the banners).
  function build(entry) {
    const ov = document.createElement('div');
    ov.className = 'nm';
    ov.setAttribute('aria-hidden', 'true');
    let pages;
    if (entry.layers) {
      pages = entry.layers.map((l) => l.p);
      const W = entry.w;
      const H = entry.h;
      ov.innerHTML = `<div class="nm-scene" style="width:${W}px;height:${H}px">${entry.layers.map((l) => {
        // Everything drawn over this page in the picture (other pages, a phone) masks its words.
        // An alpha mask (what Safari reads): opaque where the page shows, clear where something covers it.
        const mask = l.cut.length ? `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><mask id="m"><rect width="${W}" height="${H}" fill="#fff"/>${l.cut.map((c) => `<polygon points="${c.join(' ')}" fill="#000"/>`).join('')}</mask><rect width="${W}" height="${H}" mask="url(#m)"/></svg>`)}` : '';
        const m = mask ? `-webkit-mask:url('${mask}') 0 0/100% 100% no-repeat;mask:url('${mask}') 0 0/100% 100% no-repeat;` : '';
        return `<div class="nm-layer" style="${m}"><div class="nm-sheet" style="left:${l.x - l.w / 2}px;top:${l.y - l.h / 2}px;width:${l.w}px;height:${l.h}px;transform:rotate(${l.r}deg)"><div style="position:absolute;left:${l.ix}px;top:${l.iy}px;transform:scale(${l.iw / l.p.w});transform-origin:0 0">${pageHtml(l.p)}</div></div></div>`;
      }).join('')}</div>`;
    } else {
      pages = [entry];
      ov.innerHTML = `<div class="nm-scene" style="width:${entry.w}px;height:${entry.h}px">${pageHtml(entry)}</div>`;
    }
    return { ov, pages };
  }

  // Keeps an overlay on top of its picture: same box, same tilt, same fade.
  function sync(img, t) {
    const { ov, entry } = t;
    if (!img.isConnected) return untrack(img);
    const cs = getComputedStyle(img);
    if (cs.display === 'none' || !img.offsetWidth || !img.complete || !img.naturalWidth || relSrc(img) !== t.blank) { ov.style.display = 'none'; return; }
    ov.style.display = '';
    if (ov.previousElementSibling !== img) img.after(ov);
    const bl = parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft);
    const bt = parseFloat(cs.borderTopWidth) + parseFloat(cs.paddingTop);
    const cw = img.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const ch = img.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    Object.assign(ov.style, {
      left: `${img.offsetLeft}px`, top: `${img.offsetTop}px`, width: `${img.offsetWidth}px`, height: `${img.offsetHeight}px`,
      transform: cs.transform === 'none' ? '' : cs.transform, transformOrigin: cs.transformOrigin, opacity: cs.opacity,
      visibility: cs.visibility, zIndex: cs.zIndex === 'auto' ? '' : cs.zIndex, borderRadius: cs.borderRadius,
      margin: '0', position: 'absolute',
    });
    // Where the picture's pixels land inside its box: fill (stretch), or cover/contain with object-position.
    const W = entry.w;
    const H = entry.h;
    let sx = cw / W;
    let sy = ch / H;
    let ox = 0;
    let oy = 0;
    if (cs.objectFit === 'cover' || cs.objectFit === 'contain') {
      sx = sy = (cs.objectFit === 'cover' ? Math.max : Math.min)(cw / W, ch / H);
      const [px, py] = cs.objectPosition.split(' ').map((v) => (v.endsWith('%') ? parseFloat(v) / 100 : null));
      ox = (cw - W * sx) * (px ?? 0.5);
      oy = (ch - H * sy) * (py ?? 0.5);
    }
    const scene = ov.firstElementChild;
    scene.style.transform = `translate(${bl + ox}px,${bt + oy}px) scale(${sx},${sy})`;
    if (ov.querySelector('.nm-slot[data-fit="1"]')) fit(ov);
  }

  function track(img, key, entry) {
    untrack(img);
    const { ov, pages } = build(entry);
    const t = { key, entry, ov, pages, blank: `img/n/${key.slice(4)}` };
    tracked.set(img, t);
    twin(img, t);
    img.after(ov);
    fill(ov, pages, get());
    ro?.observe(img);
    sync(img, t);
  }
  // Points the picture at its twin (srcset too: the banners have a phone size).
  function twin(img, t) {
    if (img.getAttribute('srcset')) img.setAttribute('srcset', img.getAttribute('srcset').replace(/(^|,\s*)img\//g, '$1img/n/'));
    img.setAttribute('src', t.blank);
  }
  // The words wait for the twin to load, so they never float over an empty box.
  document.addEventListener('load', (e) => { const t = tracked.get(e.target); if (t) sync(e.target, t); }, true);

  function untrack(img) {
    const t = tracked.get(img);
    if (!t) return;
    tracked.delete(img);
    t.ov.remove();
    ro?.unobserve(img);
    delete img.dataset.nmKey;
  }

  // Looks at a picture whenever its src changes.
  function check(img) {
    const key = relSrc(img);
    const t = tracked.get(img);
    if (t && key === t.blank) return; // our own swap
    if (t && key === t.key) { twin(img, t); return; } // the same picture again
    if (t) untrack(img);
    const shard = shardOf(key);
    if (!shard) return;
    const now = ready(shard);
    if (now) { if (now[key]) track(img, key, now[key]); return; }
    load(shard).then((d) => { if (relSrc(img) === key && d[key]) track(img, key, d[key]); });
  }

  // ---- Watching the page -----------------------------------------------------------------------
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver((es) => es.forEach((e) => tracked.has(e.target) && sync(e.target, tracked.get(e.target)))) : null;
  const syncAll = () => tracked.forEach((t, img) => sync(img, t));
  // Pictures that slide or fade (the order stack) are followed frame by frame while they move.
  let until = 0;
  const follow = () => {
    syncAll();
    if (performance.now() < until) requestAnimationFrame(follow);
    else until = 0;
  };
  const moving = (e) => {
    if (!tracked.has(e.target)) return;
    const start = !until;
    until = performance.now() + 900;
    if (start) requestAnimationFrame(follow);
  };
  document.addEventListener('transitionrun', moving, true);
  document.addEventListener('transitionend', moving, true);
  addEventListener('resize', syncAll);
  document.fonts?.addEventListener?.('loadingdone', () => tracked.forEach((t) => fill(t.ov, t.pages, get())));

  const scan = (root) => root.querySelectorAll?.('img').forEach(check);
  new MutationObserver((ms) => {
    for (const m of ms) {
      if (m.type === 'attributes') {
        if (m.target.tagName !== 'IMG') continue;
        if (m.attributeName === 'src') check(m.target);
        else if (tracked.has(m.target)) sync(m.target, tracked.get(m.target));
      } else {
        m.addedNodes.forEach((n) => (n.tagName === 'IMG' ? check(n) : scan(n)));
        m.removedNodes.forEach((n) => (n.tagName === 'IMG' ? untrack(n) : n.querySelectorAll?.('img').forEach(untrack)));
      }
    }
  }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['src', 'class', 'style'] });
  const start = () => scan(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  // Sets a picture's src (and srcset), going straight to its nameless twin when that set's data is
  // already loaded, so a phone doesn't download the sample-name picture first and then the twin.
  function setSrc(img, src, srcset) {
    const key = src.replace(/^.*?(img\/)/, '$1');
    const d = ready(shardOf(key));
    if (srcset !== undefined) img.setAttribute('srcset', srcset);
    if (d && d[key]) {
      img.setAttribute('src', src);
      track(img, key, d[key]);
    } else {
      img.setAttribute('src', src);
    }
  }

  // ---- The name itself -------------------------------------------------------------------------
  function set(v) {
    const next = clean(v);
    if (next === typed) return;
    typed = next;
    try { if (typed) localStorage.setItem(KEY, typed); else localStorage.removeItem(KEY); } catch {}
    tracked.forEach((t) => fill(t.ov, t.pages, get()));
    document.querySelectorAll('[data-kid-name]').forEach((el) => { el.textContent = get(); });
    listeners.forEach((fn) => fn(get(), typed));
  }
  window.LPQName = { get, typed: () => typed, set, on: (fn) => listeners.add(fn), sample: SAMPLE, preload: (set) => Promise.resolve(load(set)), setSrc };
})();
