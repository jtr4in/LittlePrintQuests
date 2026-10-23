// Name slots: lets the website swap the sample child's name on a pre-rendered page for whatever a
// parent types, instantly and without rendering anything. renderHtml({ nameSlots: 'Maya' }) runs
// `nameSlots` in the print page before its screenshots: every block of text that holds the name is
// recorded (where it sits on its page, its fonts and colors, its markup with the name as {N}) and
// then made see-through, so the screenshot keeps the art, boxes and emoji but none of that text.
// docs/js/names.js draws the text back over the picture with the typed name.

// Runs in the browser. Returns [{ page, width, height, slots: [...] }] for every page (sel: .page in
// the print HTML, html for a phone screen).
function nameSlots(name, sel = '.page') {
  const TEXT = ['font-family', 'font-size', 'font-weight', 'font-style', 'font-stretch', 'font-variant', 'font-feature-settings',
    'font-variation-settings', 'line-height', 'letter-spacing', 'word-spacing', 'text-transform', 'text-align', 'text-indent',
    'white-space', 'color', 'text-shadow', '-webkit-text-stroke-width', '-webkit-text-stroke-color', 'paint-order', 'vertical-align',
    'text-decoration-line', 'text-decoration-color', 'text-decoration-thickness', 'text-underline-offset', 'direction'];
  const BOX = ['display', 'flex-direction', 'flex-wrap', 'align-items', 'justify-content', 'align-content', 'gap', 'row-gap', 'column-gap',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'border-top-width', 'border-right-width', 'border-bottom-width',
    'border-left-width', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'box-sizing', 'text-wrap'];
  const EMOJI = /(\p{Extended_Pictographic}|\p{Regional_Indicator})(️|‍\p{Extended_Pictographic}|[\u{1F3FB}-\u{1F3FF}])*/gu;
  const pages = [...document.querySelectorAll(sel)];
  // Values not worth writing down: CSS defaults, and for nested elements whatever they inherit.
  const DEFAULT = {
    'font-stretch': '100%', 'font-variant': 'normal', 'font-feature-settings': 'normal', 'font-variation-settings': 'normal',
    'font-style': 'normal', 'letter-spacing': 'normal', 'word-spacing': '0px', 'text-transform': 'none', 'text-indent': '0px',
    'text-align': 'start', 'white-space': 'normal', 'text-shadow': 'none', '-webkit-text-stroke-width': '0px', 'paint-order': 'normal',
    'vertical-align': 'baseline', 'text-decoration-line': 'none', 'direction': 'ltr', 'flex-direction': 'row', 'flex-wrap': 'nowrap',
    'align-items': 'normal', 'justify-content': 'normal', 'align-content': 'normal', 'gap': 'normal', 'row-gap': 'normal',
    'column-gap': 'normal', 'box-sizing': 'content-box', 'text-wrap': 'wrap', 'display': 'block',
  };
  const OWN = ['vertical-align', 'text-decoration-line', 'text-decoration-color', 'text-decoration-thickness', 'text-underline-offset'];
  const css = (el, props, parent) => {
    const s = getComputedStyle(el);
    const p = parent && getComputedStyle(parent);
    const out = [];
    for (const k of props) {
      const v = s.getPropertyValue(k);
      if (/^(padding|margin|border)-/.test(k) && v === '0px') continue;
      if (k.startsWith('text-decoration-') && k !== 'text-decoration-line' && s.textDecorationLine === 'none') continue;
      if (k === '-webkit-text-stroke-color' && s.webkitTextStrokeWidth === '0px') continue;
      if (p && !OWN.includes(k) ? v === p.getPropertyValue(k) : v === DEFAULT[k]) continue;
      out.push(`${k}:${v}`);
    }
    return out.join(';');
  };
  // Rotation and scale from the element up to its page, so slots on tilted signs tilt too.
  const turn = (el, page) => {
    let deg = 0;
    let scale = 1;
    for (let e = el; e && e !== page; e = e.parentElement) {
      const t = getComputedStyle(e).transform;
      if (!t || t === 'none') continue;
      const m = new DOMMatrix(t);
      deg += (Math.atan2(m.b, m.a) * 180) / Math.PI;
      scale *= Math.hypot(m.a, m.b);
    }
    return { deg, scale };
  };

  // The smallest box around each mention: SVG <text>, or the nearest element that isn't inline.
  const blocks = new Set();
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    if (!n.nodeValue.includes(name) || n.parentElement.closest('style,script,title,head')) continue;
    let el = n.parentElement;
    if (el.closest('svg')) el = el.closest('text') || el;
    else while (getComputedStyle(el).display === 'inline' && el.parentElement) el = el.parentElement;
    if (pages.some((p) => p.contains(el))) blocks.add(el);
  }
  const roots = [...blocks].filter((el) => ![...blocks].some((o) => o !== el && o.contains(el)));

  const out = new Map();
  for (const el of roots) {
    const page = pages.find((p) => p.contains(el));
    const pr = page.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const svg = el instanceof SVGElement;
    // Emoji and pictures stay in the screenshot; the overlay leaves a gap of the same size for them.
    if (!svg) {
      const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const texts = [];
      for (let t = tw.nextNode(); t; t = tw.nextNode()) if (EMOJI.test(t.nodeValue)) texts.push(t);
      for (const t of texts) {
        const span = document.createElement('span');
        span.innerHTML = t.nodeValue.replace(/[&<>]/g, (c) => `&#${c.charCodeAt(0)};`).replace(EMOJI, (m) => `<span data-emo>${m}</span>`);
        t.replaceWith(...span.childNodes);
      }
    }
    // SVG text takes its size and tilt from the drawing's own units (k) and rotation.
    // getCTM covers the drawing's own transforms and viewBox; CSS transforms on the <svg> come on top.
    const ctm = svg && el.getCTM();
    const outer = svg && turn(el.ownerSVGElement, page);
    const k = ctm ? Math.hypot(ctm.a, ctm.b) * outer.scale : 1;
    const { deg, scale } = svg ? { deg: (Math.atan2(ctm.b, ctm.a) * 180) / Math.PI + outer.deg, scale: 1 } : turn(el, page);
    const box = svg && el.getBBox();
    const w = svg ? box.width * k : el.offsetWidth;
    const h = svg ? box.height * k : el.offsetHeight;
    const ser = (node, top) => {
      if (node.nodeType === 3) return node.nodeValue.replace(/[&<>]/g, (c) => `&#${c.charCodeAt(0)};`).split(name).join('{N}');
      if (node.nodeType !== 1) return '';
      const box = node.getBoundingClientRect();
      const keep = node.matches('[data-emo],img,svg,canvas,picture,video');
      if (keep) {
        const s = getComputedStyle(node);
        return `<span style="display:inline-block;width:${box.width / scale}px;height:0;margin:0 ${s.marginRight} 0 ${s.marginLeft}"></span>`; // keeps the width only, so it never makes a line taller
      }
      const inline = getComputedStyle(node).display === 'inline';
      let style = [css(node, TEXT, top ? null : node.parentElement), inline && !top ? '' : css(node, BOX)].filter(Boolean).join(';');
      if (!inline && !top) style += `;width:${node.offsetWidth}px`;
      if (top) style += `;box-sizing:border-box;width:${node.offsetWidth}px;height:${node.offsetHeight}px;border-style:solid;border-color:transparent;margin:0`;
      const tag = inline && !top ? 'span' : 'div';
      return `<${tag} style="${style.replace(/"/g, "'")}">${[...node.childNodes].map((c) => ser(c, false)).join('')}</${tag}>`;
    };
    let html;
    if (svg) {
      const s = getComputedStyle(el);
      const fill = s.fill.startsWith('url') ? '#000' : s.fill;
      html = `<div style="${css(el, TEXT, null).replace(/"/g, "'")};color:${fill};white-space:pre;line-height:1;display:flex;align-items:center;justify-content:center;width:${w}px;height:${h}px;text-shadow:none${s.stroke !== 'none' ? `;-webkit-text-stroke:${s.strokeWidth} ${s.stroke};paint-order:stroke` : ''}">${[...el.childNodes].map((c) => ser(c, false)).join('')}</div>`;
      // SVG font sizes are in the drawing's units; scale them to the page.
      html = html.replace(/font-size:([\d.]+)px/g, (_, v) => `font-size:${(v * k).toFixed(2)}px`);
    } else {
      html = ser(el, true);
    }
    const slot = {
      x: +(r.left + r.width / 2 - pr.left).toFixed(1), y: +(r.top + r.height / 2 - pr.top).toFixed(1),
      w: +w.toFixed(1), h: +h.toFixed(1),
      ...(Math.abs(deg) > 0.2 ? { r: +deg.toFixed(2) } : {}), html,
    };
    if (!svg && scale !== 1) slot.s = +scale.toFixed(3);
    if (!out.has(page)) out.set(page, []);
    out.get(page).push(slot);

    // Hide the text for the screenshot; emoji and pictures stay.
    const hide = (e) => {
      if (e.matches?.('[data-emo],img,svg,canvas,picture,video') && !svg) return;
      e.style?.setProperty('color', 'transparent', 'important');
      e.style?.setProperty('text-shadow', 'none', 'important');
      e.style?.setProperty('-webkit-text-stroke-color', 'transparent', 'important');
      if (e instanceof SVGElement) {
        e.style.setProperty('fill', 'transparent', 'important');
        e.style.setProperty('stroke', 'transparent', 'important');
      }
      [...e.children].forEach(hide);
    };
    hide(el);
  }
  return pages.map((p, i) => ({ page: i + 1, width: p.offsetWidth, height: p.offsetHeight, slots: out.get(p) || [] }));
}

// Runs in the browser, on a picture laid out from page images (the fanned kit card, the banner scenes).
// Every element marked data-key is a page; elements marked data-occ (a phone, props) only cover
// things. Returns where each page sits, its tilt, and the corners of everything drawn over it.
function sheetLayers() {
  const corners = (el) => {
    let x = 0;
    let y = 0;
    for (let e = el; e && e !== document.body; e = e.offsetParent) { x += e.offsetLeft; y += e.offsetTop; }
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const s = getComputedStyle(el);
    const m = new DOMMatrix(s.transform === 'none' ? undefined : s.transform);
    const [ox, oy] = s.transformOrigin.split(' ').map(parseFloat);
    return [[0, 0], [w, 0], [w, h], [0, h]].map(([cx, cy]) => {
      const p = m.transformPoint(new DOMPoint(cx - ox, cy - oy));
      return [+(x + ox + p.x).toFixed(1), +(y + oy + p.y).toFixed(1)];
    });
  };
  const all = [...document.querySelectorAll('[data-key],[data-occ]')];
  return all.filter((el) => el.dataset.key).map((el) => {
    const s = getComputedStyle(el);
    const m = new DOMMatrix(s.transform === 'none' ? undefined : s.transform);
    const img = el.tagName === 'IMG' ? null : el.querySelector('img');
    const c = corners(el);
    let ix = 0;
    let iy = 0;
    for (let e = img; e && e !== el; e = e.offsetParent) { ix += e.offsetLeft; iy += e.offsetTop; }
    return {
      key: el.dataset.key,
      x: +((c[0][0] + c[2][0]) / 2).toFixed(1), y: +((c[0][1] + c[2][1]) / 2).toFixed(1), w: el.offsetWidth, h: el.offsetHeight,
      r: +((Math.atan2(m.b, m.a) * 180) / Math.PI).toFixed(2), ix, iy, iw: img ? img.offsetWidth : el.offsetWidth,
      cut: all.slice(all.indexOf(el) + 1).filter((o) => !o.contains(el)).map((o) => corners(o).flat()),
    };
  });
}

module.exports = { nameSlots, sheetLayers };

// Node side, for the scripts that build the website's pictures (gallery-images.js, site-images.js...).
// A page rendered with nameSlots has a blank twin; blankJob() queues that twin for docs/img/n/ next to
// the usual picture and notes its slots, and saveIndex() writes them to docs/img/n/<set>.json, which
// docs/js/names.js loads. Pages without the name get no twin.
const fs = require('fs');
const path = require('path');

const DOCS = path.join(__dirname, '..', '..', 'docs');
// The JSON file a picture's slots live in, one per theme or kit (and one for the handprint packs).
// docs/js/names.js has the same rule.
const shardOf = (key) => (key.match(/^img\/gallery\/crafts\//) ? 'crafts' : key.match(/^img\/(?:gallery\/|pages\/|kit-|hero\/|host\/)([a-z]+)/)?.[1]);

// png: a page from renderHtml's pngDir; out: where its usual picture goes in docs/img. Returns the
// blank twin's [src, out] or null.
function blankJob(index, png, out) {
  const dir = path.join(path.dirname(png), 'blank');
  const n = +path.basename(png).match(/(\d+)\.png$/)[1];
  const page = JSON.parse(fs.readFileSync(path.join(dir, 'slots.json'), 'utf8'))[n - 1];
  if (!page?.slots.length) return null;
  const key = path.relative(DOCS, out).split(path.sep).join('/');
  index[key] = { w: page.width, h: page.height, s: page.slots };
  const twin = path.join(DOCS, 'img', 'n', key.slice(4));
  fs.mkdirSync(path.dirname(twin), { recursive: true });
  return [path.join(dir, path.basename(png)), twin];
}

// For a picture laid out from pages (see sheetLayers): page(key) gives a layer's page slots
// ({ w, h, s }) or null. Returns false when no page shows the name.
function blankLayers(index, out, w, h, layers, page) {
  const key = path.relative(DOCS, out).split(path.sep).join('/');
  const list = layers.map(({ key: k, ...l }) => ({ ...l, p: page(k) })).filter((l) => l.p?.s.length);
  if (!list.length) return false;
  index[key] = { w, h, layers: list };
  const twin = path.join(DOCS, 'img', 'n', key.slice(4));
  fs.mkdirSync(path.dirname(twin), { recursive: true });
  return twin;
}

// The slots of one page rendered with nameSlots: { w, h, s } or null.
function pageSlots(png) {
  const n = +path.basename(png).match(/(\d+)\.png$/)[1];
  const page = JSON.parse(fs.readFileSync(path.join(path.dirname(png), 'blank', 'slots.json'), 'utf8'))[n - 1];
  return page?.slots.length ? { w: page.width, h: page.height, s: page.slots } : null;
}

function saveIndex(index) {
  const shards = {};
  for (const [key, v] of Object.entries(index)) (shards[shardOf(key)] ||= {})[key] = v;
  for (const [shard, entries] of Object.entries(shards)) {
    const file = path.join(DOCS, 'img', 'n', `${shard}.json`);
    const old = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify({ ...old, ...entries }));
  }
}

module.exports.blankJob = blankJob;
module.exports.blankLayers = blankLayers;
module.exports.pageSlots = pageSlots;
module.exports.saveIndex = saveIndex;
module.exports.shardOf = shardOf;
