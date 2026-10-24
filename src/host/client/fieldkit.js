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
  let noiseBuf = null;
  function ctx() {
    if (!ac) {
      const A = window.AudioContext || window.webkitAudioContext;
      if (!A) return null;
      ac = new A();
      master = ac.createGain();
      master.gain.value = 0.7;
      master.connect(ac.destination);
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  function env(g, t, v, attack, d) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + Math.min(attack, d * 0.8));
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  }
  function tone(f, d, o = {}) {
    const a = ctx(); if (!a) return;
    const t = a.currentTime + (o.at || 0);
    const osc = a.createOscillator();
    const g = a.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + d);
    if (o.vib) {
      const l = a.createOscillator(); const lg = a.createGain();
      l.frequency.value = o.vib; lg.gain.value = o.vibAmt || f * 0.04;
      l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + d + 0.05);
    }
    env(g, t, o.vol || 0.3, o.attack || 0.01, d);
    let node = osc;
    if (o.lp) { const fl = a.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; osc.connect(fl); node = fl; }
    node.connect(g); g.connect(master);
    osc.start(t); osc.stop(t + d + 0.05);
  }
  function noise(d, o = {}) {
    const a = ctx(); if (!a) return;
    if (!noiseBuf) {
      noiseBuf = a.createBuffer(1, a.sampleRate * 2, a.sampleRate);
      const c = noiseBuf.getChannelData(0);
      for (let i = 0; i < c.length; i++) c[i] = Math.random() * 2 - 1;
    }
    const t = a.currentTime + (o.at || 0);
    const s = a.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const f = a.createBiquadFilter(); f.type = o.ftype || 'lowpass';
    f.frequency.setValueAtTime(o.f || 1000, t);
    if (o.fto) f.frequency.exponentialRampToValueAtTime(o.fto, t + d);
    f.Q.value = o.q || 1;
    const g = a.createGain(); env(g, t, o.vol || 0.3, o.attack || 0.01, d);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t); s.stop(t + d + 0.05);
  }
  const N = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const PENT = [0, 2, 4, 7, 9];
  const SOUNDS = {
    fanfare() { [60, 64, 67, 72].forEach((m, i) => tone(N(m), 0.2, { type: 'triangle', at: i * 0.12, vol: 0.3 })); [60, 64, 67, 72].forEach((m) => tone(N(m), 1, { type: 'triangle', at: 0.5, vol: 0.16 })); },
    found() { [72, 76, 79, 84, 88].forEach((m, i) => tone(N(m), 0.28, { type: 'triangle', at: i * 0.06, vol: 0.22 })); },
    cheer() { for (let i = 0; i < 45; i++) noise(0.05 + Math.random() * 0.08, { at: Math.random() * 1.8, ftype: 'bandpass', f: 1500 + Math.random() * 2500, q: 2, vol: 0.25 }); },
    roar() { tone(95, 1.4, { type: 'sawtooth', to: 55, vol: 0.5, lp: 600, vib: 9, vibAmt: 12, attack: 0.08 }); noise(1.4, { f: 500, fto: 200, vol: 0.35, attack: 0.1 }); },
    rumble() { noise(2.2, { f: 120, vol: 0.7, attack: 0.3 }); tone(45, 2.2, { vol: 0.4, vib: 6, vibAmt: 5, attack: 0.3 }); },
    radio() { noise(0.35, { ftype: 'bandpass', f: 2500, q: 0.8, vol: 0.25 }); tone(1200, 0.09, { type: 'square', at: 0.4, vol: 0.12 }); tone(1200, 0.09, { type: 'square', at: 0.55, vol: 0.12 }); noise(0.25, { ftype: 'bandpass', f: 2500, q: 0.8, vol: 0.2, at: 0.75 }); },
    countdown() { [0, 1, 2].forEach((i) => tone(880, 0.15, { type: 'square', at: i * 0.6, vol: 0.12 })); tone(1320, 0.5, { type: 'square', at: 1.8, vol: 0.14 }); noise(1.8, { at: 2.1, f: 200, fto: 6000, vol: 0.4, attack: 0.3 }); },
    beeps() { for (let i = 0; i < 8; i++) tone(600 + Math.random() * 1400, 0.07, { type: 'square', at: i * 0.09, vol: 0.1 }); },
    cannon() { noise(0.9, { f: 900, fto: 80, vol: 0.8 }); tone(70, 0.8, { to: 30, vol: 0.6 }); },
    splash() { noise(0.6, { ftype: 'bandpass', f: 1200, fto: 400, q: 0.7, vol: 0.45 }); for (let i = 0; i < 6; i++) tone(400 + Math.random() * 500, 0.08, { to: 900 + Math.random() * 600, at: 0.2 + i * 0.07, vol: 0.15 }); },
    bubbles() { for (let i = 0; i < 12; i++) tone(300 + Math.random() * 400, 0.1, { to: 800 + Math.random() * 900, at: i * 0.11, vol: 0.18 }); },
    squawk() { [0, 0.24].forEach((at) => tone(1300, 0.17, { type: 'sawtooth', to: 900, at, vol: 0.16, vib: 40, vibAmt: 200 })); },
    trumpet() { [[67, 0, 0.14], [67, 0.16, 0.14], [72, 0.32, 0.7]].forEach(([m, at, d]) => tone(N(m), d, { type: 'sawtooth', at, vol: 0.25, lp: 2200, attack: 0.03 })); },
    magic() { for (let i = 0; i < 12; i++) tone(N(84 + PENT[i % 5] + 12 * Math.floor(i / 5)), 0.4, { type: 'triangle', at: i * 0.05, vol: 0.12 }); },
    harp() { for (let i = 0; i < 10; i++) tone(N(67 + PENT[i % 5] + 12 * Math.floor(i / 5)), 0.7, { type: 'triangle', at: i * 0.07, vol: 0.15 }); },
    gallop() { for (let i = 0; i < 8; i++) tone(i % 2 ? 900 : 700, 0.05, { type: 'square', at: Math.floor(i / 2) * 0.36 + (i % 2) * 0.1, vol: 0.12, lp: 1500 }); },
    whale() { tone(220, 1.8, { to: 120, vol: 0.3, attack: 0.4, vib: 3, vibAmt: 8 }); tone(160, 1.2, { at: 1.6, to: 260, vol: 0.2, attack: 0.3 }); },
    reverse() { [0, 1, 2, 3].forEach((i) => tone(1050, 0.25, { type: 'square', at: i * 0.5, vol: 0.12 })); },
    hammer() { [0, 0.3, 0.6].forEach((at) => { noise(0.06, { at, ftype: 'highpass', f: 2000, vol: 0.5 }); tone(180, 0.1, { at, to: 90, vol: 0.3 }); }); },
    drill() { tone(220, 1.3, { type: 'sawtooth', vib: 30, vibAmt: 40, vol: 0.15, lp: 1800, attack: 0.05 }); noise(1.3, { ftype: 'bandpass', f: 3000, q: 3, vol: 0.1 }); },
    bark() { [0, 0.35].forEach((at) => { tone(420, 0.13, { type: 'sawtooth', at, to: 260, vol: 0.3, lp: 1400 }); noise(0.1, { at, ftype: 'bandpass', f: 900, q: 2, vol: 0.25 }); }); },
    meow() { tone(600, 0.7, { type: 'triangle', to: 900, vol: 0.2, vib: 6, vibAmt: 30, attack: 0.1 }); tone(900, 0.45, { type: 'triangle', at: 0.55, to: 500, vol: 0.15 }); },
    heartbeat() { [0, 0.25, 1, 1.25].forEach((at) => tone(60, 0.18, { at, to: 40, vol: 0.6 })); },
    vroom() { tone(70, 1.7, { type: 'sawtooth', to: 230, vol: 0.3, lp: 900, attack: 0.1, vib: 25, vibAmt: 10 }); },
    honk() { [0, 0.3].forEach((at) => tone(370, 0.22, { type: 'square', at, vol: 0.15, lp: 1500 })); },
    lights() { [0, 0.7, 1.4].forEach((at) => tone(440, 0.25, { at, vol: 0.2 })); tone(880, 0.7, { at: 2.1, vol: 0.25 }); },
    siren() { for (let i = 0; i < 3; i++) { tone(650, 0.5, { type: 'triangle', at: i, to: 950, vol: 0.2 }); tone(950, 0.5, { type: 'triangle', at: i + 0.5, to: 650, vol: 0.2 }); } },
    bell() { for (let i = 0; i < 10; i++) { tone(1800, 0.12, { at: i * 0.09, vol: 0.15 }); tone(2700, 0.08, { at: i * 0.09, vol: 0.06 }); } },
    spray() { noise(1.5, { ftype: 'highpass', f: 3000, vol: 0.3, attack: 0.1 }); },
    wind() { noise(2.5, { ftype: 'bandpass', f: 400, fto: 1200, q: 4, vol: 0.4, attack: 0.6 }); },
    jingle() { for (let i = 0; i < 14; i++) { const f = 2400 + Math.random() * 1200; tone(f, 0.25, { at: i * 0.08, vol: 0.08 }); tone(f * 1.5, 0.15, { at: i * 0.08, vol: 0.04 }); } },
    ghost() { tone(380, 2, { to: 520, vol: 0.25, vib: 5, vibAmt: 25, attack: 0.3 }); },
    creak() { tone(90, 1.6, { type: 'sawtooth', to: 160, vol: 0.15, lp: 900, vib: 14, vibAmt: 20, attack: 0.2 }); },
    hop() { [0, 0.35, 0.7].forEach((at) => tone(300, 0.25, { at, to: 900, vol: 0.2 })); },
    chirp() { for (let i = 0; i < 6; i++) tone(2600, 0.07, { at: i * 0.13, to: 3400, vol: 0.12 }); },
    pop() { [0, 0.2, 0.4].forEach((at) => { tone(900, 0.06, { at, to: 200, vol: 0.3 }); noise(0.04, { at, ftype: 'highpass', f: 2500, vol: 0.3 }); }); },
    kiss() { tone(1400, 0.12, { to: 2600, vol: 0.15 }); noise(0.05, { at: 0.1, ftype: 'highpass', f: 3000, vol: 0.2 }); },
    power() { tone(200, 1, { type: 'sawtooth', to: 1600, vol: 0.15, lp: 3000 }); tone(400, 1, { type: 'square', to: 3200, vol: 0.05 }); },
    whoosh() { noise(0.8, { ftype: 'bandpass', f: 300, fto: 3000, q: 2, vol: 0.45, attack: 0.2 }); },
    ding() { tone(2093, 0.6, { vol: 0.25 }); tone(2637, 0.8, { at: 0.12, vol: 0.25 }); for (let i = 0; i < 5; i++) tone(3000 + Math.random() * 1500, 0.08, { at: 0.35 + i * 0.05, vol: 0.05 }); },
    sizzle() { noise(1.7, { ftype: 'highpass', f: 4000, vol: 0.25, attack: 0.2 }); for (let i = 0; i < 20; i++) noise(0.02, { at: Math.random() * 1.5, ftype: 'highpass', f: 5000, vol: 0.3 }); },
    steam() { noise(1.6, { ftype: 'bandpass', f: 2500, fto: 4500, q: 1.5, vol: 0.3, attack: 0.4 }); },
    scan() { tone(1800, 0.12, { type: 'square', vol: 0.12 }); tone(1800, 0.12, { type: 'square', at: 0.25, vol: 0.12 }); },
    stamp() { [0, 0.4].forEach((at) => { tone(110, 0.15, { at, to: 60, vol: 0.6 }); noise(0.08, { at, f: 800, vol: 0.4 }); }); },
    shh() { noise(1.1, { ftype: 'highpass', f: 2500, vol: 0.3, attack: 0.15 }); },
    drumroll() { for (let i = 0; i < 30; i++) noise(0.05, { at: i * 0.05, f: 1200, vol: 0.25 + i * 0.01 }); noise(1, { at: 1.55, ftype: 'highpass', f: 3000, vol: 0.4 }); tone(90, 0.4, { at: 1.5, to: 50, vol: 0.5 }); },
  };
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
    pizza: [['ding', '🛎️', 'Order up'], ['sizzle', '🔥', 'Oven'], ['scan', '💳', 'Pay']],
    burger: [['ding', '🛎️', 'Order up'], ['sizzle', '🍔', 'Grill'], ['honk', '🚗', 'Drive-thru']],
    grocery: [['scan', '🛒', 'Scan'], ['ding', '🛎️', 'Checkout'], ['reverse', '🚚', 'Delivery']],
    post: [['stamp', '📮', 'Stamp'], ['ding', '🛎️', 'Next please'], ['reverse', '🚚', 'Mail truck']],
    library: [['shh', '🤫', 'Shhh'], ['ding', '🛎️', 'Desk bell'], ['magic', '📖', 'Story magic']],
    police: [['siren', '🚓', 'Siren'], ['radio', '📻', 'Radio'], ['honk', '📣', 'Horn']],
    dentist: [['drill', '🦷', 'Polisher'], ['ding', '🛎️', 'Next patient'], ['magic', '✨', 'Sparkle']],
    petshop: [['bark', '🐶', 'Woof'], ['meow', '🐱', 'Meow'], ['chirp', '🐦', 'Tweet']],
    coffee: [['steam', '☕', 'Steamer'], ['ding', '🛎️', 'Order up'], ['scan', '💳', 'Pay']],
    italian: [['bubbles', '🍝', 'Boiling pot'], ['ding', '🛎️', 'Order up'], ['trumpet', '🎺', 'Bravo']],
    auto: [['drill', '🔧', 'Wrench'], ['vroom', '🚗', 'Engine'], ['honk', '📣', 'Horn']],
    kitchen: [['sizzle', '🍳', 'Sizzle'], ['ding', '⏲️', 'Timer'], ['meow', '🐱', 'Whisk']],
    doctor: [['heartbeat', '🩺', 'Heartbeat'], ['siren', '🚑', 'Ambulance'], ['ding', '🛎️', 'Next patient']],
    puppet: [['drumroll', '🥁', 'Drumroll'], ['trumpet', '🎺', 'Curtain up'], ['magic', '🧦', 'Puppet magic']],
    agent: [['beeps', '📟', 'Gadget'], ['radio', '📻', 'HQ radio'], ['creak', '🚪', 'Sneaky door']],
    dressup: [['magic', '✨', 'Sparkle'], ['drumroll', '🥁', 'Runway'], ['trumpet', '🎺', 'Ta-da']],
    icecream: [['ding', '🛎️', 'Order up'], ['scan', '💳', 'Pay'], ['magic', '🍒', 'Sprinkles']],
    airport: [['whoosh', '✈️', 'Takeoff'], ['ding', '🔔', 'Cabin chime'], ['radio', '📡', 'Control tower']],
  };
  const DEFAULT = [['fanfare', '🎺', 'Fanfare'], ['magic', '✨', 'Magic'], ['drumroll', '🥁', 'Drumroll']];
  const board = () => [...(BOARD[CFG.theme] || DEFAULT), ['cheer', '👏', 'Cheer']];
  const autoOn = () => store('fk:auto-sound') !== '0';
  function play(name) { try { (SOUNDS[name] || SOUNDS.fanfare)(); } catch (e) { /* no audio here */ } }
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

  window.FK = { play, auto, soundBoard, autoToggle, confetti, snap, addFromLibrary, openSheet, mountCamera, keepsake, toast, pdfOf, photoPage, keepsakePage, SOUNDS };
})();
