// The Field Kit's phone-side extras, inlined into the Field Kit and Sidekick pages
// (src/host/host.js). Settings come from window.FKCFG:
//   { key, theme, name, title, hunters, colors: { main, accent, soft }, art: [urls], base, brand }
// Everything here runs on the phone. Photos never leave it: they're kept in IndexedDB on the
// phone and the photo PDF is built right here.
(function () {
  const CFG = window.FKCFG || {};
  const C = CFG.colors || { main: '#3f4a73', accent: '#ef9d31', soft: '#f2f8f2' };
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const el = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; };
  const rnd = (n) => Math.floor(Math.random() * n);

  // ---------------------------------------------------------------------------------------------
  // Sounds: made on the phone with Web Audio, so there are no sound files to load or license.
  // ---------------------------------------------------------------------------------------------
  let ac = null;
  let master = null;
  function ctx() {
    if (!ac) {
      const A = window.AudioContext || window.webkitAudioContext;
      if (!A) return null;
      ac = new A();
      master = ac.createGain();
      master.gain.value = 1;
      master.connect(ac.destination);
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  // The sounds themselves are built by sfx.js (inlined just before this file): each one is
  // rendered once into a buffer, then replays instantly.
  const SFX_NAMES = window.LPQSFX ? window.LPQSFX.make(44100).names : [];
  let sfx = null;
  const cache = {};
  function buffer(name) {
    const a = ctx(); if (!a || !window.LPQSFX) return null;
    if (!cache[name]) {
      sfx = sfx || window.LPQSFX.make(a.sampleRate);
      const x = sfx.render(name), b = a.createBuffer(1, x.length, a.sampleRate);
      b.getChannelData(0).set(x); cache[name] = b;
    }
    return cache[name];
  }
  // Get the board's sounds (and the automatic ones) ready a little at a time once audio is on.
  let warmed = false;
  function warm() {
    if (warmed) return; warmed = true;
    const list = ['found', 'fanfare', 'cheer', 'ding', ...board().map((b) => b[0])].filter((n, i, all) => all.indexOf(n) === i);
    const step = () => { const n = list.shift(); if (!n) return; try { buffer(n); } catch (e) { /* skip */ } setTimeout(step, 80); };
    setTimeout(step, 50);
  }
  const SOUNDS = Object.fromEntries(SFX_NAMES.map((n) => [n, () => play(n)]));
  // Each theme's sound board: [sound, emoji, label]. New themes fall back to DEFAULT.
  const BOARD = {
    dino: [['roar', '🦖', 'Roar'], ['rumble', '🌋', 'Volcano'], ['radio', '📻', 'Ranger radio']],
    hero: [['siren', '🚨', 'Hero alarm'], ['power', '⚡', 'Power up'], ['whoosh', '💨', 'Whoosh']],
    pirate: [['cannon', '💥', 'Cannon'], ['squawk', '🦜', 'Parrot'], ['splash', '🌊', 'Splash']],
    space: [['countdown', '🚀', 'Liftoff'], ['radio', '📡', 'Ground Control'], ['beeps', '🤖', 'Beep boop']],
    royal: [['trumpet', '🎺', 'Royal fanfare'], ['gallop', '🐴', 'Gallop'], ['magic', '✨', 'Magic']],
    unicorn: [['magic', '✨', 'Sparkle'], ['harp', '🌈', 'Rainbow'], ['gallop', '🦄', 'Gallop']],
    mermaid: [['bubbles', '🫧', 'Bubbles'], ['harp', '🐚', 'Shell song'], ['whale', '🐋', 'Whale song']],
    construction: [['reverse', '🚚', 'Beep beep'], ['hammer', '🔨', 'Hammer'], ['drill', '🔩', 'Drill']],
    vet: [['bark', '🐶', 'Woof'], ['meow', '🐱', 'Meow'], ['heartbeat', '🩺', 'Heartbeat']],
    racecar: [['vroom', '🏎️', 'Vroom'], ['lights', '🚦', 'Start lights'], ['honk', '📣', 'Honk']],
    fire: [['siren', '🚒', 'Siren'], ['bell', '🔔', 'Fire bell'], ['spray', '💦', 'Hose']],
    ice: [['magic', '❄️', 'Frost magic'], ['wind', '🌬️', 'Snowy wind'], ['jingle', '🔔', 'Sleigh bells']],
    halloween: [['ghost', '👻', 'Ghost'], ['creak', '🚪', 'Creaky door'], ['bubbles', '🧪', 'Cauldron']],
    christmas: [['jingle', '🔔', 'Sleigh bells'], ['magic', '✨', 'Elf magic'], ['trumpet', '🎺', 'Fanfare']],
    valentine: [['harp', '💗', 'Love song'], ['pop', '🎈', 'Balloon pop'], ['kiss', '💋', 'Kiss']],
    easter: [['hop', '🐰', 'Hop'], ['chirp', '🐣', 'Chick'], ['magic', '✨', 'Magic']],
    pizza: [['ding', '🛎️', 'Order up'], ['sizzle', '🔥', 'Oven'], ['register', '💳', 'Pay']],
    burger: [['ding', '🛎️', 'Order up'], ['sizzle', '🍔', 'Grill'], ['honk', '🚗', 'Drive-thru']],
    grocery: [['scan', '🛒', 'Scan'], ['ding', '🛎️', 'Checkout'], ['reverse', '🚚', 'Delivery']],
    post: [['stamp', '📮', 'Stamp'], ['ding', '🛎️', 'Next please'], ['reverse', '🚚', 'Mail truck']],
    library: [['shh', '🤫', 'Shhh'], ['ding', '🛎️', 'Desk bell'], ['magic', '📖', 'Story magic']],
    police: [['siren', '🚓', 'Siren'], ['radio', '📻', 'Radio'], ['honk', '📣', 'Horn']],
    dentist: [['drill', '🦷', 'Polisher'], ['ding', '🛎️', 'Next patient'], ['magic', '✨', 'Sparkle']],
    petshop: [['bark', '🐶', 'Woof'], ['meow', '🐱', 'Meow'], ['chirp', '🐦', 'Tweet']],
    coffee: [['steam', '☕', 'Steamer'], ['ding', '🛎️', 'Order up'], ['register', '💳', 'Pay']],
    italian: [['bubbles', '🍝', 'Boiling pot'], ['ding', '🛎️', 'Order up'], ['trumpet', '🎺', 'Bravo']],
    auto: [['drill', '🔧', 'Wrench'], ['vroom', '🚗', 'Engine'], ['honk', '📣', 'Horn']],
    kitchen: [['sizzle', '🍳', 'Sizzle'], ['ding', '⏲️', 'Timer'], ['meow', '🐱', 'Whisk']],
    doctor: [['heartbeat', '🩺', 'Heartbeat'], ['siren', '🚑', 'Ambulance'], ['ding', '🛎️', 'Next patient']],
    puppet: [['drumroll', '🥁', 'Drumroll'], ['trumpet', '🎺', 'Curtain up'], ['magic', '🧦', 'Puppet magic']],
    agent: [['beeps', '📟', 'Gadget'], ['radio', '📻', 'HQ radio'], ['creak', '🚪', 'Sneaky door']],
    dressup: [['magic', '✨', 'Sparkle'], ['drumroll', '🥁', 'Runway'], ['trumpet', '🎺', 'Ta-da']],
    icecream: [['ding', '🛎️', 'Order up'], ['register', '💳', 'Pay'], ['magic', '🍒', 'Sprinkles']],
    airport: [['whoosh', '✈️', 'Takeoff'], ['ding', '🔔', 'Cabin chime'], ['radio', '📡', 'Control tower']],
  };
  const DEFAULT = [['fanfare', '🎺', 'Fanfare'], ['magic', '✨', 'Magic'], ['drumroll', '🥁', 'Drumroll']];
  const board = () => [...(BOARD[CFG.theme] || DEFAULT), ['cheer', '👏', 'Cheer']];
  const autoOn = () => store('fk:auto-sound') !== '0';
  function play(name) {
    try {
      const a = ctx(); if (!a) return;
      const b = buffer(SFX_NAMES.includes(name) ? name : 'fanfare'); if (!b) return;
      const src = a.createBufferSource(); src.buffer = b; src.connect(master); src.start();
      warm();
    } catch (e) { /* no audio here */ }
  }
  // Sounds that play by themselves (a card found, the big finish) respect the on/off switch.
  function auto(name) { if (autoOn()) play(name); }
  function soundBoard(title = 'Sound effects') {
    return `<div class="fk-board"><div class="k">${esc(title)}</div><div class="fk-pads">${board().map(([s, e, l]) => `<button type="button" data-sound="${s}"><span>${e}</span>${esc(l)}</button>`).join('')}</div></div>`;
  }
  document.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-sound]');
    if (!b) return;
    play(b.dataset.sound);
    b.classList.remove('hit'); void b.offsetWidth; b.classList.add('hit');
  });
  function autoToggle(btn) {
    const draw = () => { btn.textContent = autoOn() ? '🔊' : '🔇'; btn.setAttribute('aria-label', autoOn() ? 'Sounds on' : 'Sounds off'); };
    draw();
    btn.onclick = () => { store('fk:auto-sound', autoOn() ? '0' : '1'); draw(); if (autoOn()) play('found'); };
  }

  // ---------------------------------------------------------------------------------------------
  // Confetti in the theme's colors.
  // ---------------------------------------------------------------------------------------------
  function confetti(ms = 2600, count = 140) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = el('<canvas class="fk-confetti" aria-hidden="true"></canvas>');
    document.body.append(c);
    const W = (c.width = innerWidth * devicePixelRatio); const H = (c.height = innerHeight * devicePixelRatio);
    const g = c.getContext('2d');
    const cols = [C.main, C.accent, C.soft, '#ffffff', '#ffd23f'];
    const bits = Array.from({ length: count }, () => ({ x: Math.random() * W, y: -Math.random() * H * 0.6, s: (6 + Math.random() * 8) * devicePixelRatio, vy: (2 + Math.random() * 4) * devicePixelRatio, vx: (Math.random() - 0.5) * 3 * devicePixelRatio, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: cols[rnd(cols.length)] }));
    const start = performance.now();
    (function frame(now) {
      g.clearRect(0, 0, W, H);
      for (const b of bits) {
        b.x += b.vx; b.y += b.vy; b.r += b.vr;
        g.save(); g.translate(b.x, b.y); g.rotate(b.r); g.fillStyle = b.c; g.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2); g.restore();
      }
      if (now - start < ms) requestAnimationFrame(frame); else c.remove();
    })(start);
  }

  // ---------------------------------------------------------------------------------------------
  // Photos: kept on this phone in IndexedDB (a plain list in memory if that's not available).
  // ---------------------------------------------------------------------------------------------
  const DB = 'lpq-fieldkit';
  let mem = null;
  const openDb = () => new Promise((res, rej) => {
    if (!window.indexedDB) return rej(new Error('no indexedDB'));
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore('photos', { keyPath: 'id' });
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  async function photos() {
    if (mem) return mem.slice();
    try {
      const d = await openDb();
      return await new Promise((res) => {
        const out = [];
        const cur = d.transaction('photos').objectStore('photos').openCursor();
        cur.onsuccess = () => { const c = cur.result; if (c) { if (c.value.key === CFG.key) out.push(c.value); c.continue(); } else res(out.sort((a, b) => a.at - b.at)); };
        cur.onerror = () => res(out);
      });
    } catch (e) { mem = []; return []; }
  }
  async function savePhoto(rec) {
    if (mem) { mem.push(rec); return; }
    try {
      const d = await openDb();
      await new Promise((res, rej) => { const t = d.transaction('photos', 'readwrite'); t.objectStore('photos').put(rec); t.oncomplete = res; t.onerror = () => rej(t.error); });
    } catch (e) { mem = [rec]; }
  }
  async function deletePhoto(id) {
    if (mem) { mem = mem.filter((p) => p.id !== id); return; }
    const d = await openDb();
    await new Promise((res) => { const t = d.transaction('photos', 'readwrite'); t.objectStore('photos').delete(id); t.oncomplete = res; t.onerror = res; });
  }
  const loadImg = (src) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
  // Shrinks a camera photo to 1600 px on its long side, so a party's worth fits on the phone.
  async function shrink(file) {
    const url = URL.createObjectURL(file);
    try {
      const im = await loadImg(url);
      const k = Math.min(1, 1600 / Math.max(im.naturalWidth, im.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      return await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.86));
    } finally { URL.revokeObjectURL(url); }
  }
  let moment = '';
  const picker = (capture) => {
    const i = el(`<input type="file" accept="image/*" ${capture ? 'capture="environment"' : 'multiple'} hidden>`);
    i.onchange = async () => {
      const files = [...i.files]; i.value = '';
      for (const f of files) {
        try { await savePhoto({ id: `${Date.now()}-${rnd(1e6)}`, key: CFG.key, at: Date.now(), label: moment, blob: await shrink(f) }); } catch (e) { /* skip a photo the phone can't read */ }
      }
      if (files.length) { toast(files.length === 1 ? '📸 Saved to your Field Kit photos' : `📸 ${files.length} photos saved`); refreshCount(); if (sheetOpen) drawSheet(); }
    };
    document.body.append(i);
    return i;
  };
  let cam = null; let lib = null;
  function snap(label) { moment = label || ''; (cam ||= picker(true)).click(); }
  function addFromLibrary(label) { moment = label || ''; (lib ||= picker(false)).click(); }
  function toast(msg) {
    const t = el(`<div class="fk-toast" role="status">${esc(msg)}</div>`);
    document.body.append(t); setTimeout(() => t.classList.add('out'), 2200); setTimeout(() => t.remove(), 2700);
  }
  async function refreshCount() {
    const n = (await photos()).length;
    document.querySelectorAll('[data-photo-count]').forEach((b) => { b.textContent = n; b.hidden = !n; });
  }

  // ---------------------------------------------------------------------------------------------
  // The photo pages: a themed border, one photo per page or a collage, drawn on a Letter-size
  // canvas (150 dpi) and saved as a PDF built right here.
  // ---------------------------------------------------------------------------------------------
  const W = 1275; const H = 1650;
  let stickers = null;
  async function art() {
    if (!stickers) stickers = (await Promise.all((CFG.art || []).map((u) => loadImg(u).catch(() => null)))).filter(Boolean);
    return stickers;
  }
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function fitText(g, text, max, size, weight = 800) {
    let s = size;
    do { g.font = `${weight} ${s}px "Trebuchet MS", system-ui, sans-serif`; s -= 2; } while (g.measureText(text).width > max && s > 18);
  }
  function sticker(g, im, x, y, size, rot) {
    const k = size / Math.max(im.width, im.height);
    g.save(); g.translate(x, y); g.rotate((rot * Math.PI) / 180);
    g.shadowColor = 'rgba(30,20,10,.28)'; g.shadowBlur = 14; g.shadowOffsetY = 6;
    g.drawImage(im, (-im.width * k) / 2, (-im.height * k) / 2, im.width * k, im.height * k);
    g.restore();
  }
  async function pageFrame(g, title, sub) {
    g.fillStyle = C.soft; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,.35)';
    for (let y = 30; y < H; y += 60) for (let x = (y / 60) % 2 ? 30 : 60; x < W; x += 60) { g.beginPath(); g.arc(x, y, 6, 0, Math.PI * 2); g.fill(); }
    rr(g, 44, 44, W - 88, H - 88, 50); g.fillStyle = C.main; g.fill();
    rr(g, 74, 74, W - 148, H - 148, 38); g.fillStyle = '#fffdf8'; g.fill();
    g.setLineDash([18, 14]); g.strokeStyle = C.accent; g.lineWidth = 6; rr(g, 96, 96, W - 192, H - 192, 28); g.stroke(); g.setLineDash([]);
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.fillStyle = C.main; fitText(g, title, W - 420, 62); g.fillText(title, W / 2, 205);
    g.fillStyle = '#646d8f'; fitText(g, sub, W - 420, 30, 600); g.fillText(sub, W / 2, 252);
    const a = await art();
    const spots = [[150, 150, 190, -12], [W - 150, 150, 180, 10], [120, H - 160, 170, 8], [W - 140, H - 170, 190, -8], [W / 2 - 330, H - 112, 120, -6], [W / 2 + 330, H - 112, 120, 6]];
    spots.forEach(([x, y, s, r], i) => { if (a.length) sticker(g, a[i % a.length], x, y, s, r); });
    g.fillStyle = '#9aa0b8'; g.font = '600 22px system-ui, sans-serif'; g.fillText(CFG.brand || '', W / 2, H - 112);
  }
  function polaroid(g, im, x, y, w, h, rot, caption) {
    g.save(); g.translate(x + w / 2, y + h / 2); g.rotate((rot * Math.PI) / 180);
    const pad = Math.max(14, w * 0.035); const bottom = caption ? pad * 3.2 : pad;
    g.shadowColor = 'rgba(30,20,10,.25)'; g.shadowBlur = 24; g.shadowOffsetY = 8;
    g.fillStyle = '#fff'; g.fillRect(-w / 2, -h / 2, w, h); g.shadowColor = 'transparent';
    const iw = w - pad * 2; const ih = h - pad - bottom;
    const k = Math.max(iw / im.width, ih / im.height); const sw = iw / k; const sh = ih / k;
    g.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, -w / 2 + pad, -h / 2 + pad, iw, ih);
    if (caption) { g.fillStyle = '#3f4a73'; g.textAlign = 'center'; fitText(g, caption, w - pad * 2, Math.min(34, pad * 1.6), 700); g.fillText(caption, 0, h / 2 - bottom / 2 + pad * 0.5); }
    g.restore();
  }
  // Where each photo goes on a collage page, inside the frame's photo area.
  function slots(n, X, Y, AW, AH) {
    const gap = 34;
    if (n === 1) return [[X, Y, AW, AH]];
    if (n === 2) return [[X, Y, AW, (AH - gap) / 2], [X, Y + (AH + gap) / 2, AW, (AH - gap) / 2]];
    if (n === 3) return [[X, Y, AW, AH * 0.55], [X, Y + AH * 0.55 + gap, (AW - gap) / 2, AH * 0.45 - gap], [X + (AW + gap) / 2, Y + AH * 0.55 + gap, (AW - gap) / 2, AH * 0.45 - gap]];
    const rows = n === 4 ? 2 : 3; const w = (AW - gap) / 2; const h = (AH - gap * (rows - 1)) / rows;
    return Array.from({ length: n }, (_, i) => [X + (i % 2) * (w + gap), Y + Math.floor(i / 2) * (h + gap), w, h]);
  }
  const today = () => new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  async function photoPage(list) {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    await pageFrame(g, CFG.title || 'Our adventure', `${today()}${CFG.hunters ? ` · ${CFG.hunters}` : ''}`);
    const ims = await Promise.all(list.map((p) => loadImg(URL.createObjectURL(p.blob))));
    slots(ims.length, 170, 310, W - 340, H - 560).forEach(([x, y, w, h], i) => polaroid(g, ims[i], x, y, w, h, [-2.5, 2, -1.5, 2.5, -2, 1.5][i % 6], list[i].label));
    ims.forEach((im) => URL.revokeObjectURL(im.src));
    return c;
  }
  // The keepsake: "Mission complete!" for the hunt, or "Star of the day" after a Shop day.
  async function keepsakePage({ kind = 'hunt', detail = '', photo = null } = {}) {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    await pageFrame(g, kind === 'shop' ? 'Star of the Day' : 'Mission Complete!', today());
    const a = await art();
    g.textAlign = 'center';
    if (a[0]) sticker(g, a[0], W / 2, 430, 250, -4);
    g.fillStyle = C.accent; fitText(g, CFG.name || 'Our star', W - 360, 120, 900); g.fillText(CFG.name || 'Our star', W / 2, 690);
    g.fillStyle = '#3f4a73'; fitText(g, detail, W - 360, 44, 700); g.fillText(detail, W / 2, 770);
    for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? C.accent : C.main; g.font = '64px system-ui, sans-serif'; g.fillText('★', W / 2 + (i - 2) * 90, 870); }
    if (photo) {
      const im = await loadImg(URL.createObjectURL(photo.blob));
      polaroid(g, im, W / 2 - 330, 930, 660, 520, -2, photo.label); URL.revokeObjectURL(im.src);
    } else { g.fillStyle = '#646d8f'; g.font = 'italic 600 34px system-ui, sans-serif'; g.fillText('Signed ______________________', W / 2, 1120); }
    return c;
  }
  // A small PDF writer: one full-page JPEG per page, Letter size.
  async function pdfOf(canvases) {
    const enc = new TextEncoder(); const parts = []; let len = 0; const offs = [];
    const push = (x) => { const b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); len += b.length; };
    const imgs = [];
    for (const cv of canvases) { const blob = await new Promise((r) => cv.toBlob(r, 'image/jpeg', 0.9)); imgs.push({ w: cv.width, h: cv.height, data: new Uint8Array(await blob.arrayBuffer()) }); }
    const obj = (id, body) => { offs[id] = len; push(`${id} 0 obj\n${body}\nendobj\n`); };
    push('%PDF-1.4\n');
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    obj(2, `<< /Type /Pages /Kids [${imgs.map((_, i) => `${3 + i * 3} 0 R`).join(' ')}] /Count ${imgs.length} >>`);
    imgs.forEach((im, i) => {
      const p = 3 + i * 3; const cs = `q 612 0 0 792 0 0 cm /Im${i} Do Q`;
      obj(p, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im${i} ${p + 2} 0 R >> >> /Contents ${p + 1} 0 R >>`);
      obj(p + 1, `<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`);
      offs[p + 2] = len;
      push(`${p + 2} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.data.length} >>\nstream\n`);
      push(im.data); push('\nendstream\nendobj\n');
    });
    const total = 3 + imgs.length * 3; const xref = len;
    let x = `xref\n0 ${total}\n0000000000 65535 f \n`;
    for (let k = 1; k < total; k++) x += `${String(offs[k]).padStart(10, '0')} 00000 n \n`;
    push(`${x}trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
    return new Blob(parts, { type: 'application/pdf' });
  }
  const fileName = (what) => `${(CFG.name || 'our').replace(/[^\w-]+/g, '')}-${what}.pdf`.toLowerCase();
  // Shows the finished PDF with Share/Print and Download.
  function deliver(blob, what, box) {
    const file = new File([blob], fileName(what), { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const canShare = navigator.canShare && navigator.canShare({ files: [file] });
    box.innerHTML = `<p class="fk-ok">✅ Your PDF is ready (${Math.max(1, Math.round(blob.size / 1024))} KB).</p>
      <div class="fk-row">${canShare ? '<button type="button" class="btn fk-main" data-act="share">Share or print</button>' : ''}
      <a class="btn ${canShare ? '' : 'fk-main'}" href="${url}" download="${esc(file.name)}">Download PDF</a>
      <a class="btn" href="${url}" target="_blank" rel="noopener">Open</a></div>`;
    const s = box.querySelector('[data-act="share"]');
    if (s) s.onclick = () => navigator.share({ files: [file], title: CFG.title || 'Our photos' }).catch(() => {});
  }

  // ---------------------------------------------------------------------------------------------
  // The photo sheet: everything taken so far, pick which to use, and make the PDF.
  // ---------------------------------------------------------------------------------------------
  let sheetOpen = false; let picked = null; let layout = 'collage';
  const sheet = el(`<div class="fk-sheet" hidden role="dialog" aria-modal="true" aria-label="Your photos"><div class="fk-sheet-in">
    <div class="fk-sheet-head"><b>📸 Your photos</b><button type="button" class="fk-x" aria-label="Close">×</button></div>
    <p class="small">Your photos stay on this phone. We never upload them.</p>
    <div class="fk-row"><button type="button" class="btn fk-main" data-act="snap">📸 Take a photo</button><button type="button" class="btn" data-act="lib">🖼️ Add from my photos</button></div>
    <div class="fk-grid" id="fkGrid"></div>
    <div id="fkMake"></div>
    <div id="fkOut"></div>
  </div></div>`);
  sheet.querySelector('.fk-x').onclick = () => closeSheet();
  sheet.addEventListener('click', (e) => { if (e.target === sheet) closeSheet(); });
  sheet.querySelector('[data-act="snap"]').onclick = () => snap('');
  sheet.querySelector('[data-act="lib"]').onclick = () => addFromLibrary('');
  const thumbs = new Map();
  async function drawSheet() {
    const list = await photos();
    if (!picked) picked = new Set(list.map((p) => p.id));
    for (const p of list) if (!thumbs.has(p.id)) thumbs.set(p.id, URL.createObjectURL(p.blob));
    const grid = sheet.querySelector('#fkGrid');
    grid.innerHTML = list.length ? list.map((p) => `<div class="fk-th${picked.has(p.id) ? ' on' : ''}" data-id="${p.id}"><img src="${thumbs.get(p.id)}" alt=""><button type="button" class="fk-del" data-del="${p.id}" aria-label="Delete photo">×</button><span class="fk-tick">✓</span>${p.label ? `<small>${esc(p.label)}</small>` : ''}</div>`).join('')
      : '<p class="small">No photos yet. Snap some during the hunt or play, and they’ll show up here.</p>';
    grid.querySelectorAll('.fk-th').forEach((t) => t.onclick = (e) => {
      if (e.target.closest('[data-del]')) return;
      picked.has(t.dataset.id) ? picked.delete(t.dataset.id) : picked.add(t.dataset.id); drawSheet();
    });
    grid.querySelectorAll('[data-del]').forEach((b) => b.onclick = async () => { if (!confirmDelete(b)) return; await deletePhoto(b.dataset.del); picked.delete(b.dataset.del); refreshCount(); drawSheet(); });
    const n = list.filter((p) => picked.has(p.id)).length;
    sheet.querySelector('#fkMake').innerHTML = list.length ? `<div class="box"><div class="k">Make a printable page</div>
      <div class="fk-seg" role="radiogroup"><button type="button" data-lay="collage" aria-pressed="${layout === 'collage'}">Collage<small>up to 6 per page</small></button><button type="button" data-lay="single" aria-pressed="${layout === 'single'}">One per page<small>big and bold</small></button></div>
      <label class="tick fk-opt"><input type="checkbox" id="fkFirst" ${CFG.hunt ? 'checked' : ''}><span>Start with a “Mission complete” page for ${esc(CFG.name || 'your kid')}</span></label>
      <button type="button" class="btn fk-main fk-wide" id="fkGo" ${n ? '' : 'disabled'}>Make my photo PDF (${n} photo${n === 1 ? '' : 's'})</button></div>` : '';
    sheet.querySelectorAll('[data-lay]').forEach((b) => b.onclick = () => { layout = b.dataset.lay; drawSheet(); });
    const go = sheet.querySelector('#fkGo');
    if (go) go.onclick = async () => {
      const out = sheet.querySelector('#fkOut'); go.disabled = true; out.innerHTML = '<p class="small">Making your pages…</p>';
      try {
        const use = (await photos()).filter((p) => picked.has(p.id));
        const pages = [];
        if (sheet.querySelector('#fkFirst')?.checked) pages.push(await keepsakePage({ detail: CFG.keepsake || '', photo: null }));
        for (const chunk of split(use, layout === 'single' ? 1 : 6)) pages.push(await photoPage(chunk));
        deliver(await pdfOf(pages), 'photos', out);
      } catch (e) { out.innerHTML = '<p class="small">Something went wrong making the PDF. Try fewer photos at a time.</p>'; }
      go.disabled = false;
    };
  }
  // Pages of at most `per` photos, as even as possible: 7 photos make 4 + 3, not 6 + 1.
  function split(list, per) {
    const n = Math.ceil(list.length / per); const out = []; let at = 0;
    for (let i = 0; i < n; i++) { const size = Math.ceil((list.length - at) / (n - i)); out.push(list.slice(at, at + size)); at += size; }
    return out;
  }
  let armed = null;
  function confirmDelete(b) { if (armed === b) return true; armed = b; b.textContent = 'Delete?'; b.classList.add('arm'); setTimeout(() => { if (armed === b) { armed = null; b.textContent = '×'; b.classList.remove('arm'); } }, 2500); return false; }
  function openSheet() { if (!sheet.isConnected) document.body.append(sheet); sheet.hidden = false; sheetOpen = true; picked = null; sheet.querySelector('#fkOut').innerHTML = ''; drawSheet(); }
  function closeSheet() { sheet.hidden = true; sheetOpen = false; }
  // The camera button floating over the page, with how many photos there are.
  function mountCamera() {
    const b = el('<button type="button" class="fk-cam" aria-label="Photos"><span aria-hidden="true">📸</span><b data-photo-count hidden>0</b></button>');
    b.onclick = openSheet;
    document.body.append(b);
    document.body.classList.add('fk-has-cam');
    refreshCount();
  }
  // A keepsake on its own (the end of the hunt or a Shop day), with the latest photo if there is one.
  async function keepsake(kind, detail, box) {
    box.innerHTML = '<p class="small">Making it…</p>';
    const list = await photos();
    const page = await keepsakePage({ kind, detail, photo: list[list.length - 1] || null });
    deliver(await pdfOf([page]), kind === 'shop' ? 'star-of-the-day' : 'mission-complete', box);
  }

  // ---------------------------------------------------------------------------------------------
  // The page picker: every page of the order as tiles or a list, grouped by PDF. Pick some and
  // print just those (the bot joins them into one PDF). Picks are remembered on this phone.
  // ---------------------------------------------------------------------------------------------
  let pagesData = null, pagesView = store('fk:pages-view') || 'tile';
  const PKEY = () => `fk:pages:${CFG.key}`;
  let pagePicks = (() => { try { return JSON.parse(store(PKEY()) || '{}'); } catch (e) { return {}; } })();
  const savePicked = () => store(PKEY(), JSON.stringify(pagePicks));
  const pagesSheet = el(`<div class="fk-sheet" hidden role="dialog" aria-modal="true" aria-label="Choose pages to print"><div class="fk-sheet-in">
    <div class="fk-sheet-head"><b>📄 Choose pages</b><button type="button" class="fk-x" aria-label="Close">×</button></div>
    <p class="small" style="margin:4px 0 0">Tap the pages you want, then print just those.</p>
    <div class="fk-pv" role="group" aria-label="Show pages as"><button type="button" data-v="tile">▦ Tiles</button><button type="button" data-v="list">☰ List</button></div>
    <div id="fkPages"><p class="small">Getting your pages…</p></div>
    <div class="fk-pbar"><button type="button" class="btn" data-clear>Clear</button><a class="btn fk-main" id="fkPrint" target="_blank" rel="noopener">Print</a></div>
  </div></div>`);
  pagesSheet.querySelector('.fk-x').onclick = () => { pagesSheet.hidden = true; };
  pagesSheet.addEventListener('click', (e) => { if (e.target === pagesSheet) pagesSheet.hidden = true; });
  pagesSheet.querySelectorAll('[data-v]').forEach((b) => { b.onclick = () => { pagesView = b.dataset.v; store('fk:pages-view', pagesView); drawPages(); }; });
  pagesSheet.querySelector('[data-clear]').onclick = () => { pagePicks = {}; savePicked(); drawPages(); };
  const countPicked = () => Object.values(pagePicks).reduce((n, a) => n + a.length, 0);
  function printLink() {
    const n = countPicked(), a = pagesSheet.querySelector('#fkPrint');
    const q = Object.entries(pagePicks).filter(([, v]) => v.length).map(([k, v]) => `${k}=${[...v].sort((x, y) => x - y).join(',')}`).join('&');
    a.textContent = n ? `🖨️ Print ${n} page${n === 1 ? '' : 's'}` : 'Pick some pages';
    a.classList.toggle('off', !n);
    if (n) a.href = `${CFG.pages}/pick.pdf?${q}`; else a.removeAttribute('href');
  }
  function drawPages() {
    pagesSheet.querySelectorAll('[data-v]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === pagesView)));
    const box = pagesSheet.querySelector('#fkPages');
    if (!pagesData) return;
    if (!pagesData.length) { box.innerHTML = '<p class="small">Your pages aren’t ready yet. Try again in a minute.</p>'; return; }
    box.innerHTML = pagesData.map((d) => {
      const on = new Set(pagePicks[d.id] || []), all = d.pages.length && on.size === d.pages.length;
      const item = (p, i) => {
        const n = i + 1, src = `${CFG.pages}/thumb/${d.id}/${n}.jpg`, cls = on.has(n) ? ' class="on"' : '';
        return pagesView === 'tile'
          ? `<button type="button" data-d="${d.id}" data-n="${n}"${cls} aria-pressed="${on.has(n)}"><img src="${src}" alt="" loading="lazy"><span class="fk-tick">✓</span><small>${n} · ${esc(p.title)}</small></button>`
          : `<button type="button" data-d="${d.id}" data-n="${n}"${cls} aria-pressed="${on.has(n)}"><img src="${src}" alt="" loading="lazy"><span class="n">${n}</span><span>${esc(p.title)}</span><span class="ck">${on.has(n) ? '✓' : ''}</span></button>`;
      };
      return `<div class="fk-doc"><b>${esc(d.label)} <span class="small">· ${d.pages.length} pages</span></b><button type="button" data-all="${d.id}">${all ? 'Clear' : 'Select all'}</button></div>
        <div class="${pagesView === 'tile' ? 'fk-pg' : 'fk-pl'}">${d.pages.map(item).join('')}</div>`;
    }).join('');
    box.querySelectorAll('[data-n]').forEach((b) => { b.onclick = () => {
      const set = new Set(pagePicks[b.dataset.d] || []), n = +b.dataset.n;
      if (set.has(n)) set.delete(n); else set.add(n);
      pagePicks[b.dataset.d] = [...set]; savePicked(); drawPages();
    }; });
    box.querySelectorAll('[data-all]').forEach((b) => { b.onclick = () => {
      const d = pagesData.find((x) => x.id === b.dataset.all), full = (pagePicks[d.id] || []).length === d.pages.length;
      pagePicks[d.id] = full ? [] : d.pages.map((_, i) => i + 1); savePicked(); drawPages();
    }; });
    printLink();
  }
  async function openPages() {
    if (!CFG.pages) return;
    if (!pagesSheet.isConnected) document.body.append(pagesSheet);
    pagesSheet.hidden = false; drawPages(); printLink();
    if (!pagesData) {
      try { pagesData = (await (await fetch(`${CFG.pages}/pages.json`)).json()).docs; } catch (e) { pagesData = null; pagesSheet.querySelector('#fkPages').innerHTML = '<p class="small">Couldn’t load your pages. Check your signal and try again.</p>'; return; }
      drawPages();
    }
  }

  window.FK = { openPages, play, auto, soundBoard, autoToggle, confetti, snap, addFromLibrary, openSheet, mountCamera, keepsake, toast, pdfOf, photoPage, keepsakePage, SOUNDS };
})();
