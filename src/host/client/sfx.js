// Field Kit sound effects (inlined before fieldkit.js by src/host/host.js), synthesized on the phone (no sound files to load or license).
// Each sound is rendered once into a buffer with models of the real thing instead of bare beeps:
// voices shaped by mouth formants (bark, meow, roar, cheering), struck metal with inharmonic
// partials (bells, chimes), a plucked-string model (harp), noise bursts for claps, splashes and
// creaks, and a small room reverb on everything. Works in the browser (window.LPQSFX) and in
// Node (module.exports) so test/smoke.js can render every sound and check it.
(function (root) {
  const TAU = Math.PI * 2;
  const VOWELS = { a: [730, 1090, 2440], e: [530, 1840, 2480], i: [270, 2290, 3010], o: [570, 840, 2410], u: [300, 870, 2240], m: [250, 1700, 2600], er: [490, 1350, 1690] };

  function make(SR) {
    const S = (sec) => new Float32Array(Math.max(1, Math.ceil(sec * SR)));
    const rnd = (a, b) => a + Math.random() * (b - a);
    const val = (x) => (typeof x === 'function' ? x : () => x);
    const N = (m) => 440 * Math.pow(2, (m - 69) / 12);
    function mix(dst, src, at = 0, g = 1) {
      const o = Math.round(at * SR);
      for (let i = 0; i < src.length; i++) { const j = o + i; if (j >= 0 && j < dst.length) dst[j] += src[i] * g; }
      return dst;
    }
    // A piecewise-linear curve over time: [[t, v], ...].
    function curve(pts) {
      return (t) => {
        if (t <= pts[0][0]) return pts[0][1];
        for (let k = 1; k < pts.length; k++) if (t <= pts[k][0]) { const [t0, v0] = pts[k - 1]; const [t1, v1] = pts[k]; return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0 || 1); }
        return pts[pts.length - 1][1];
      };
    }
    const ad = (a, d) => (t) => (t < a ? t / a : Math.exp(-(t - a) / d));
    function amp(x, fn) { const F = val(fn); for (let i = 0; i < x.length; i++) x[i] *= F(i / SR); return x; }
    function noise(sec, color = 'white') {
      const x = S(sec); let b = 0, p0 = 0, p1 = 0, p2 = 0;
      for (let i = 0; i < x.length; i++) {
        const w = Math.random() * 2 - 1;
        if (color === 'brown') { b = (b + 0.02 * w) / 1.02; x[i] = b * 3.5; }
        else if (color === 'pink') { p0 = 0.99765 * p0 + w * 0.099046; p1 = 0.963 * p1 + w * 0.2965164; p2 = 0.57 * p2 + w * 1.0526913; x[i] = (p0 + p1 + p2 + w * 0.1848) * 0.2; }
        else x[i] = w;
      }
      return x;
    }
    // RBJ biquad; frequency and Q can change over time.
    function filt(x, type, freq, q = 0.707) {
      const F = val(freq), Q = val(q), y = new Float32Array(x.length);
      let b0 = 0, b1 = 0, b2 = 0, a1 = 0, a2 = 0, x1 = 0, x2 = 0, y1 = 0, y2 = 0;
      for (let i = 0; i < x.length; i++) {
        if (i % 32 === 0) {
          const t = i / SR, f = Math.min(Math.max(F(t), 10), SR * 0.45), qq = Math.max(Q(t), 0.05);
          const w = (TAU * f) / SR, c = Math.cos(w), s = Math.sin(w), al = s / (2 * qq);
          let n0, n1, n2;
          if (type === 'lp') { n0 = (1 - c) / 2; n1 = 1 - c; n2 = n0; }
          else if (type === 'hp') { n0 = (1 + c) / 2; n1 = -(1 + c); n2 = n0; }
          else { n0 = al; n1 = 0; n2 = -al; }
          const d0 = 1 + al; b0 = n0 / d0; b1 = n1 / d0; b2 = n2 / d0; a1 = (-2 * c) / d0; a2 = (1 - al) / d0;
        }
        const v = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
        x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
      }
      return y;
    }
    const blep = (t, dt) => { if (t < dt) { t /= dt; return t + t - t * t - 1; } if (t > 1 - dt) { t = (t - 1) / dt; return t * t + t + t + 1; } return 0; };
    // Oscillators: sine, saw (band-limited), pulse (band-limited, width w), tri.
    function osc(sec, freq, shape = 'sine', w = 0.5) {
      const F = val(freq), x = S(sec); let ph = Math.random();
      for (let i = 0; i < x.length; i++) {
        const dt = F(i / SR) / SR; ph += dt; ph -= Math.floor(ph);
        if (shape === 'sine') x[i] = Math.sin(TAU * ph);
        else if (shape === 'tri') x[i] = 1 - 4 * Math.abs(ph - 0.5);
        else if (shape === 'saw') x[i] = 2 * ph - 1 - blep(ph, dt);
        else { const p2 = (ph + 1 - w) % 1; x[i] = (2 * ph - 1 - blep(ph, dt)) - (2 * p2 - 1 - blep(p2, dt)); }
      }
      return x;
    }
    // Struck metal or wood: decaying partials [ratio, gain, decay seconds], plus a tiny strike click.
    function modal(sec, f0, partials, click = 0.3) {
      const x = S(sec);
      for (const [r, g, d] of partials) {
        const f = f0 * r; if (f > SR * 0.45) continue; const ph = Math.random() * TAU;
        for (let i = 0; i < x.length; i++) { const t = i / SR, e = Math.exp(-t / d); if (e < 1e-4) break; x[i] += g * e * Math.sin(TAU * f * t + ph); }
      }
      if (click) mix(x, amp(filt(noise(0.01), 'hp', f0 * 2), ad(0.0005, 0.002)), 0, click);
      return amp(x, (t) => Math.min(1, (sec - t) / (sec * 0.35)));
    }
    const GLOCK = [[1, 1, 0.9], [2.756, 0.35, 0.35], [5.404, 0.14, 0.15], [8.933, 0.06, 0.08]];
    const BELL = [[0.5, 0.35, 1.6], [1, 1, 1.2], [1.183, 0.5, 0.9], [1.506, 0.35, 0.8], [2, 0.3, 0.6], [2.514, 0.2, 0.45], [2.662, 0.15, 0.4], [3.011, 0.12, 0.3], [4.166, 0.08, 0.2]];
    const DESK = [[1, 1, 1.1], [2.32, 0.45, 0.7], [3.87, 0.22, 0.4], [5.6, 0.1, 0.25], [7.1, 0.05, 0.15]];
    // Plucked string (Karplus-Strong).
    function pluck(sec, f, bright = 0.5, decay = 0.996) {
      const x = S(sec), L = Math.max(2, Math.round(SR / f)), buf = new Float32Array(L);
      let lp = 0; for (let k = 0; k < L; k++) { lp += bright * ((Math.random() * 2 - 1) - lp); buf[k] = lp; }
      let p = 0;
      for (let i = 0; i < x.length; i++) { const n = (p + 1) % L; const v = decay * 0.5 * (buf[p] + buf[n]); x[i] = buf[p]; buf[p] = v; p = n; }
      return fadeOut(x, sec * 0.3);
    }
    // A voice: glottal pulses (with jitter) through three mouth formants that can glide between vowels.
    function voice(sec, pitch, vowel, o = {}) {
      const P = val(pitch), V = val(vowel), jit = o.jitter ?? 0.01, open = o.open ?? 0.55;
      const src = S(sec), gl = S(sec); let ph = 0, j = 0, prev = 0, odd = 0, peak = 1e-9;
      for (let i = 0; i < src.length; i++) {
        const t = i / SR; ph += (P(t) * (1 + j)) / SR;
        if (ph >= 1) { ph -= 1; j = j * 0.6 + (Math.random() * 2 - 1) * jit; odd ^= 1; }
        const c = open * 0.66;
        let s = ph < c ? 0.5 * (1 - Math.cos((Math.PI * ph) / c)) : ph < open ? Math.cos((Math.PI / 2) * (ph - c) / (open - c)) : 0;
        if (o.sub && odd) s *= 1 - o.sub;
        gl[i] = s; src[i] = s - prev; prev = s; peak = Math.max(peak, Math.abs(src[i]));
      }
      const br = o.breath ?? 0.08;
      for (let i = 0; i < src.length; i++) src[i] = src[i] / peak + br * (Math.random() * 2 - 1) * (0.3 + gl[i]);
      const y = S(sec), bw = o.bw || [80, 100, 140], fg = o.fg || [1, 0.55, 0.3], sc = o.scale || 1;
      for (let k = 0; k < 3; k++) {
        const Fk = (t) => V(t)[k] * sc;
        mix(y, filt(src, 'bp', Fk, (t) => Fk(t) / (bw[k] * sc)), 0, fg[k]);
      }
      return o.env ? amp(y, o.env) : y;
    }
    // Glide between vowels: [[t, 'a'], [t, 'o'], ...].
    function vowels(steps) {
      return (t) => {
        if (t <= steps[0][0]) return VOWELS[steps[0][1]];
        for (let k = 1; k < steps.length; k++) if (t <= steps[k][0]) {
          const [t0, v0] = steps[k - 1], [t1, v1] = steps[k], u = (t - t0) / (t1 - t0 || 1);
          return VOWELS[v0].map((f, n) => f + (VOWELS[v1][n] - f) * u);
        }
        return VOWELS[steps[steps.length - 1][1]];
      };
    }
    // A small room (Freeverb style). `wet` is the reverb's level relative to the dry sound.
    function reverb(x, wet = 0.25, size = 0.84, damp = 0.25, tail = 1.0) {
      fadeOut(x, 0.01);
      const n = x.length + Math.round(tail * SR), sc = SR / 44100, rev = new Float32Array(n);
      const combs = [1116, 1188, 1277, 1356, 1422, 1491].map((d) => ({ b: new Float32Array(Math.round(d * sc)), i: 0, s: 0 }));
      const aps = [556, 441, 341].map((d) => ({ b: new Float32Array(Math.round(d * sc)), i: 0 }));
      for (let k = 0; k < n; k++) {
        const inp = k < x.length ? x[k] : 0; let out = 0;
        for (const c of combs) { const y = c.b[c.i]; c.s = y * (1 - damp) + c.s * damp; c.b[c.i] = inp + c.s * size; c.i = (c.i + 1) % c.b.length; out += y; }
        for (const a of aps) { const y = a.b[a.i]; a.b[a.i] = out + y * 0.5; a.i = (a.i + 1) % a.b.length; out = y - out; }
        rev[k] = out;
      }
      let ed = 0, er = 0; for (let k = 0; k < x.length; k++) ed += x[k] * x[k]; for (let k = 0; k < n; k++) er += rev[k] * rev[k];
      const g = er > 0 ? wet * Math.sqrt(ed / er) : 0;
      for (let k = 0; k < n; k++) rev[k] = (k < x.length ? x[k] : 0) + rev[k] * g;
      return rev;
    }
    function fadeOut(x, sec = 0.03) { const f = Math.min(x.length, Math.round(sec * SR)); for (let i = 0; i < f; i++) x[x.length - 1 - i] *= i / f; return x; }
    const sat = (x, drive = 2) => { const k = Math.tanh(drive); for (let i = 0; i < x.length; i++) x[i] = Math.tanh(x[i] * drive) / k; return x; };
    // Even loudness across sounds, no clicks, nothing clipping.
    function finish(x, level = 1) {
      const y = filt(x, 'hp', 30), win = Math.round(0.05 * SR); let loud = 1e-9;
      for (let i = 0; i < y.length; i += win) { let e = 0, m = 0; for (let k = i; k < Math.min(y.length, i + win); k++) { e += y[k] * y[k]; m++; } loud = Math.max(loud, Math.sqrt(e / m)); }
      const g = (0.2 * level) / loud;
      for (let i = 0; i < y.length; i++) y[i] = Math.tanh(y[i] * g * 1.1) / 1.1;
      const f = Math.min(y.length, Math.round(0.02 * SR)); for (let i = 0; i < f; i++) y[y.length - 1 - i] *= i / f;
      return y;
    }

    // ---- The sounds ------------------------------------------------------------------------
    const brassNote = (sec, f, vol = 1) => {
      const e = (t) => (t < 0.05 ? t / 0.05 : t < sec - 0.08 ? 0.85 + 0.15 * Math.exp(-(t - 0.05) / 0.15) : Math.max(0, (sec - t) / 0.08) * 0.85);
      const vib = (t) => 1 + 0.006 * Math.sin(TAU * 5.5 * t) * Math.min(1, t / 0.3) - 0.03 * Math.exp(-t / 0.03);
      const x = osc(sec, (t) => f * vib(t), 'saw'); mix(x, osc(sec, (t) => f * 1.004 * vib(t), 'saw'), 0, 0.7);
      const y = filt(x, 'lp', (t) => f * (1.2 + 7 * e(t)), 1.2);
      mix(y, amp(filt(noise(0.06), 'bp', f * 3, 2), ad(0.005, 0.02)), 0, 0.15);
      return amp(y, (t) => e(t) * vol);
    };
    const timpani = (f) => { const x = modal(1.4, f, [[1, 1, 0.5], [1.5, 0.4, 0.35], [1.98, 0.25, 0.25], [2.44, 0.12, 0.18]], 0); mix(x, amp(filt(noise(0.1), 'lp', 400), ad(0.002, 0.03)), 0, 0.6); return x; };
    const clap = () => amp(filt(noise(0.06), 'bp', rnd(900, 2200), rnd(1.2, 2.2)), (t) => (t < 0.001 ? t / 0.001 : Math.exp(-t / rnd(0.008, 0.02))));
    const snare = (v = 1) => { const x = amp(filt(noise(0.25), 'bp', 3500, 0.7), ad(0.001, 0.06)); mix(x, amp(osc(0.15, (t) => 190 - 30 * t, 'sine'), ad(0.001, 0.03)), 0, 0.8); return amp(x, v); };
    const bubble = (f0, d = 0.04) => amp(osc(d * 4, (t) => f0 * (1 + 3.5 * t / (d * 4)), 'sine'), ad(0.002, d));
    const hoof = () => { const x = amp(filt(noise(0.08), 'bp', rnd(500, 800), 3), ad(0.001, 0.015)); mix(x, amp(osc(0.08, rnd(220, 280)), ad(0.001, 0.02)), 0, 0.5); return filt(x, 'lp', 3000); };
    const SND = {
      found() { const x = S(1.6); [84, 88, 91, 96].forEach((m, i) => mix(x, modal(1.2, N(m), GLOCK), i * 0.075, 0.9 - i * 0.1)); return reverb(x, 0.3); },
      ding() { const x = modal(1.8, 2350, DESK, 0.6); return reverb(x, 0.2, 0.75); },
      fanfare() {
        const x = S(2.4);
        [[67, 0, 0.14], [72, 0.16, 0.14], [76, 0.32, 0.14], [79, 0.48, 1.2]].forEach(([m, at, d]) => { mix(x, brassNote(d, N(m)), at, 0.8); mix(x, brassNote(d, N(m - 5)), at, 0.45); });
        [[60, 0.48], [64, 0.48]].forEach(([m, at]) => mix(x, brassNote(1.2, N(m)), at, 0.4));
        mix(x, timpani(N(43)), 0.48, 0.9);
        return reverb(x, 0.35, 0.86);
      },
      trumpet() { const x = S(1.6); [[72, 0, 0.13], [72, 0.15, 0.13], [79, 0.3, 0.9]].forEach(([m, at, d]) => mix(x, brassNote(d, N(m)), at)); return reverb(x, 0.35, 0.86); },
      cheer() {
        const x = S(2.6);
        for (let v = 0; v < 12; v++) {
          const d = rnd(0.9, 1.7), p = rnd(200, 420), kid = Math.random() < 0.6;
          mix(x, voice(d, (t) => p * (1 + 0.25 * Math.sin(Math.PI * Math.min(1, t / d))), vowels([[0, 'e'], [0.15, 'a'], [d, 'a']]), { scale: kid ? 1.18 : 1, breath: 0.25, jitter: 0.02, env: (t) => Math.min(1, t / 0.08) * Math.max(0, 1 - t / d) }), rnd(0, 0.5), rnd(0.6, 1));
        }
        for (let k = 0; k < 300; k++) { const at = 0.1 + Math.pow(Math.random(), 1.4) * 2.3; mix(x, clap(), at, 0.35 * (1 - at / 2.6)); }
        return reverb(x, 0.35, 0.86, 0.3, 1.2);
      },
      roar() {
        const d = 1.7, p = curve([[0, 70], [0.4, 95], [1.2, 75], [d, 50]]);
        const x = voice(d, p, vowels([[0, 'a'], [1, 'o'], [d, 'u']]), { scale: 0.5, jitter: 0.07, sub: 0.45, breath: 0.2, bw: [120, 160, 220], env: (t) => Math.min(1, t / 0.12) * Math.max(0, 1 - Math.pow(t / d, 3)) });
        const rasp = amp(filt(noise(d, 'pink'), 'bp', 500, 1.2), (t) => (0.6 + 0.4 * Math.sin(TAU * 32 * t)) * Math.min(1, t / 0.12) * Math.max(0, 1 - Math.pow(t / d, 2)));
        mix(x, rasp, 0, 0.25);
        return reverb(filt(sat(x, 2.5), 'lp', 2800), 0.3, 0.88);
      },
      rumble() {
        const d = 2.6, env = (t) => Math.min(1, t / 0.8) * Math.min(1, (d - t) / 0.8);
        const x = amp(filt(noise(d, 'brown'), 'lp', 160), (t) => env(t) * (0.8 + 0.2 * Math.sin(TAU * 1.7 * t)));
        mix(x, amp(osc(d, (t) => 38 + 4 * Math.sin(TAU * 0.7 * t)), env), 0, 0.5);
        for (let k = 0; k < 14; k++) mix(x, amp(filt(noise(0.2), 'lp', rnd(800, 2500)), ad(0.002, rnd(0.02, 0.06))), rnd(0.4, 2.1), rnd(0.15, 0.35));
        return reverb(x, 0.25, 0.9, 0.5);
      },
      radio() {
        const x = S(1.6);
        mix(x, amp(filt(noise(0.18), 'bp', 2200, 0.9), ad(0.003, 0.12)), 0, 0.8);
        let at = 0.2; const talk = S(0.9);
        for (let k = 0; k < 6; k++) { const d = rnd(0.08, 0.16), v = ['a', 'e', 'o', 'i', 'u'][Math.floor(Math.random() * 5)], w = ['o', 'a', 'e'][k % 3]; mix(talk, voice(d, rnd(140, 190), vowels([[0, v], [d, w]]), { breath: 0.15, env: (t) => Math.sin(Math.PI * t / d) }), at - 0.2, 1); at += d + rnd(0.01, 0.05); }
        mix(x, sat(filt(filt(talk, 'hp', 500), 'lp', 2800), 4), 0.2, 0.9);
        mix(x, amp(filt(noise(0.9), 'bp', 2500, 0.8), () => 0.08), 0.2);
        const end = at + 0.05;
        mix(x, amp(filt(noise(0.25), 'bp', 2200, 0.9), ad(0.003, 0.15)), end, 0.8);
        mix(x, amp(osc(0.08, 1250), ad(0.003, 0.05)), end + 0.02, 0.3);
        return reverb(x, 0.1, 0.6);
      },
      countdown() {
        const x = S(4.6);
        [0, 0.7, 1.4].forEach((at) => mix(x, amp(osc(0.25, 1000), (t) => Math.min(1, t / 0.005) * Math.max(0, 1 - t / 0.2)), at, 0.5));
        mix(x, amp(osc(0.5, 1500), (t) => Math.min(1, t / 0.005) * Math.max(0, 1 - t / 0.45)), 2.1, 0.5);
        const d = 2.2, rumble = filt(noise(d, 'brown'), 'lp', (t) => 200 + 2500 * Math.min(1, t / 1.2), 0.9);
        mix(rumble, filt(noise(d), 'lp', (t) => 400 + 4000 * Math.min(1, t / 1.4)), 0, 0.25);
        for (let k = 0; k < 60; k++) mix(rumble, amp(filt(noise(0.05), 'hp', 1500), ad(0.001, 0.008)), rnd(0.3, 2), 0.4);
        mix(x, amp(rumble, (t) => Math.min(1, t / 0.6) * Math.min(1, (d - t) / 0.7)), 2.4, 1.2);
        return reverb(x, 0.3, 0.88, 0.4);
      },
      beeps() {
        const x = S(1.4); let at = 0;
        for (let k = 0; k < 7; k++) { const d = rnd(0.06, 0.16), f0 = rnd(900, 2400), f1 = f0 * rnd(0.6, 1.6); mix(x, amp(osc(d, (t) => (f0 + (f1 - f0) * (t / d)) * (1 + 0.05 * Math.sin(TAU * 30 * t)), 'tri'), (t) => Math.sin(Math.PI * t / d)), at, 0.5); at += d + rnd(0.02, 0.06); }
        return reverb(x, 0.15, 0.7);
      },
      cannon() {
        const x = amp(filt(noise(1.2), 'lp', (t) => 3000 * Math.exp(-t / 0.08) + 120, 0.8), ad(0.002, 0.18));
        mix(x, amp(osc(1.0, (t) => 35 + 45 * Math.exp(-t / 0.08)), ad(0.002, 0.25)), 0, 1.2);
        return reverb(sat(x, 3), 0.45, 0.9, 0.4, 1.6);
      },
      splash() {
        const x = amp(filt(noise(0.8), 'bp', (t) => 1400 - 900 * Math.min(1, t / 0.5), 0.8), ad(0.005, 0.15));
        for (let k = 0; k < 26; k++) mix(x, bubble(rnd(500, 2200), rnd(0.015, 0.04)), rnd(0.05, 0.75), rnd(0.15, 0.4));
        return reverb(x, 0.2, 0.75);
      },
      bubbles() {
        const x = S(1.8);
        for (let k = 0; k < 30; k++) mix(x, bubble(rnd(250, 900), rnd(0.02, 0.06)), Math.pow(Math.random(), 0.8) * 1.6, rnd(0.3, 0.7));
        mix(x, amp(filt(noise(1.8, 'brown'), 'lp', 300), (t) => Math.min(1, t / 0.3) * Math.min(1, (1.8 - t) / 0.3)), 0, 0.3);
        return reverb(x, 0.2, 0.75);
      },
      squawk() {
        const x = S(1);
        [0, 0.3].forEach((at, k) => { const d = 0.22; mix(x, voice(d, curve([[0, 850], [0.08, 1050], [d, 800]]), vowels([[0, 'a'], [d, 'e']]), { scale: 1.9, jitter: 0.06, breath: 0.4, bw: [200, 250, 300], env: (t) => Math.min(1, t / 0.02) * Math.max(0, 1 - t / d) }), at, k ? 0.8 : 1); });
        return reverb(sat(x, 3), 0.18, 0.75);
      },
      magic() {
        const x = S(2.2), PENT = [0, 2, 4, 7, 9];
        for (let i = 0; i < 12; i++) mix(x, modal(1, N(79 + PENT[i % 5] + 12 * Math.floor(i / 5)), [[1, 1, 0.6], [4, 0.25, 0.15], [7.1, 0.06, 0.08]], 0.1), i * 0.055, 0.5);
        mix(x, amp(filt(noise(1.6), 'hp', 7000), (t) => 0.06 * Math.sin(Math.PI * Math.min(1, t / 1.6))), 0.1);
        return reverb(x, 0.5, 0.88);
      },
      harp() {
        const x = S(2.6), PENT = [0, 2, 4, 7, 9];
        for (let i = 0; i < 11; i++) mix(x, pluck(1.8, N(60 + PENT[i % 5] + 12 * Math.floor(i / 5)), 0.35, 0.997), i * 0.07, 0.5);
        return reverb(x, 0.35, 0.86);
      },
      gallop() {
        const x = S(2.2);
        for (let k = 0; k < 6; k++) [0, 0.09, 0.18].forEach((o, n) => mix(x, hoof(), 0.05 + k * 0.33 + o + rnd(-0.01, 0.01), (n === 2 ? 1 : 0.7) * (0.4 + 0.6 * Math.sin(Math.PI * (k + 0.5) / 6))));
        return reverb(x, 0.15, 0.7);
      },
      whale() {
        const x = S(3.2);
        const call = (d, p) => { const v = osc(d, p); mix(v, osc(d, (t) => 2 * p(t)), 0, 0.3); mix(v, osc(d, (t) => 3 * p(t)), 0, 0.12); return amp(v, (t) => Math.sin(Math.PI * t / d)); };
        mix(x, call(1.6, curve([[0, 180], [0.6, 320], [1.6, 140]])), 0, 1);
        mix(x, call(1.1, curve([[0, 260], [1.1, 420]])), 1.7, 0.7);
        mix(x, amp(filt(noise(3.2, 'brown'), 'lp', 200), () => 0.15), 0);
        return reverb(filt(x, 'lp', 1500), 0.6, 0.93, 0.5, 2);
      },
      reverse() {
        const x = S(2.6);
        for (let k = 0; k < 3; k++) mix(x, amp(osc(0.45, 1100, 'pulse', 0.4), (t) => Math.min(1, t / 0.01) * Math.min(1, (0.45 - t) / 0.01)), k * 0.9, 0.4);
        const y = filt(x, 'bp', 1600, 0.9);
        mix(y, amp(filt(noise(2.6, 'brown'), 'lp', 120), () => 0.4), 0);
        return reverb(y, 0.25, 0.8);
      },
      hammer() {
        const x = S(1.2);
        [0, 0.35, 0.7].forEach((at) => { const h = modal(0.4, rnd(1900, 2200), [[1, 0.6, 0.06], [1.8, 0.4, 0.05], [2.7, 0.25, 0.04]], 0.8); mix(h, amp(osc(0.15, 160), ad(0.001, 0.04)), 0, 0.8); mix(h, amp(filt(noise(0.05), 'bp', 3000, 1), ad(0.0005, 0.006)), 0, 0.8); mix(x, h, at); });
        return reverb(x, 0.2, 0.75);
      },
      drill() {
        const d = 1.6, f = curve([[0, 60], [0.25, 190], [1.3, 200], [d, 70]]), e = (t) => Math.min(1, t / 0.15) * Math.min(1, (d - t) / 0.25);
        const x = filt(osc(d, (t) => f(t) * (1 + 0.01 * Math.sin(TAU * 55 * t)), 'saw'), 'lp', 2500);
        mix(x, filt(osc(d, (t) => f(t) * 4.02, 'saw'), 'bp', 2000, 2), 0, 0.3);
        mix(x, amp(filt(noise(d), 'bp', 3200, 1.5), (t) => 0.3 * (0.6 + 0.4 * Math.sin(TAU * 60 * t))), 0);
        return reverb(amp(x, e), 0.15, 0.7);
      },
      bark() {
        const x = S(1.1);
        [0, 0.32].forEach((at, k) => { const d = 0.2; mix(x, voice(d, curve([[0, 520], [0.04, 600], [d, 300]]), vowels([[0, 'a'], [d, 'u']]), { scale: 0.85, jitter: 0.05, breath: 0.5, bw: [130, 160, 200], env: (t) => Math.min(1, t / 0.012) * Math.exp(-t / 0.07) }), at, k ? 0.85 : 1); });
        return reverb(sat(x, 2), 0.18, 0.75);
      },
      meow() {
        const d = 0.85, p = curve([[0, 520], [0.25, 760], [0.55, 700], [d, 480]]);
        const x = voice(d, p, vowels([[0, 'i'], [0.25, 'e'], [0.5, 'a'], [d, 'u']]), { scale: 1.35, breath: 0.2, jitter: 0.015, env: (t) => Math.min(1, t / 0.06) * Math.max(0, 1 - Math.pow(t / d, 2)) });
        return reverb(x, 0.15, 0.75);
      },
      heartbeat() {
        const x = S(2);
        const beat = (v) => { const b = amp(osc(0.25, (t) => 50 + 30 * Math.exp(-t / 0.02)), ad(0.004, 0.05)); mix(b, amp(filt(noise(0.1), 'lp', 180), ad(0.002, 0.03)), 0, 0.6); return amp(b, v); };
        [0, 0.9].forEach((at) => { mix(x, beat(1), at); mix(x, beat(0.7), at + 0.22); });
        return filt(x, 'lp', 400);
      },
      vroom() {
        const d = 2, rate = curve([[0, 30], [0.25, 32], [0.7, 110], [1.1, 125], [1.5, 70], [d, 45]]), e = (t) => Math.min(1, t / 0.1) * Math.min(1, (d - t) / 0.25);
        const x = S(d); let ph = 0;
        for (let i = 0; i < x.length; i++) { const t = i / SR; ph += rate(t) * (1 + 0.04 * (Math.random() - 0.5)) / SR; if (ph >= 1) { ph -= 1; x[i] = 1; } }
        const y = filt(filt(x, 'lp', (t) => 300 + rate(t) * 6, 2), 'lp', 2500);
        mix(y, amp(filt(noise(d), 'bp', (t) => 400 + rate(t) * 8, 1.2), (t) => 0.3 * rate(t) / 125), 0);
        return reverb(sat(amp(y, e), 3), 0.18, 0.8);
      },
      honk() {
        const x = S(1.1), horn = (d) => { const h = osc(d, 415, 'pulse', 0.3); mix(h, osc(d, 520, 'pulse', 0.3), 0, 0.8); return amp(filt(h, 'bp', 1800, 0.8), (t) => Math.min(1, t / 0.015) * Math.min(1, (d - t) / 0.02)); };
        mix(x, horn(0.18), 0); mix(x, horn(0.45), 0.28);
        return reverb(sat(x, 2), 0.25, 0.8);
      },
      lights() {
        const x = S(3.8), beep = (f, d) => amp(filt(osc(d, f, 'pulse', 0.5), 'lp', f * 3), (t) => Math.min(1, t / 0.005) * Math.min(1, (d - t) / 0.01));
        [0, 0.8, 1.6].forEach((at) => mix(x, beep(440, 0.3), at, 0.5));
        mix(x, beep(880, 0.7), 2.4, 0.6);
        return reverb(x, 0.3, 0.86);
      },
      siren() {
        const d = 3, f = (t) => 950 + 330 * Math.sin(TAU * 0.5 * t - Math.PI / 2);
        const x = osc(d, f, 'tri'); mix(x, osc(d, (t) => f(t) * 2), 0, 0.15);
        return reverb(sat(amp(filt(x, 'bp', 1200, 0.7), (t) => Math.min(1, t / 0.2) * Math.min(1, (d - t) / 0.3)), 1.5), 0.35, 0.88);
      },
      bell() {
        const x = S(2);
        for (let k = 0; k < 28; k++) mix(x, modal(0.5, 1400, BELL, 0.2), k * 0.05, 0.4 + 0.1 * Math.random());
        return reverb(x, 0.3, 0.84);
      },
      spray() {
        const d = 1.8, e = (t) => Math.min(1, t / 0.15) * Math.min(1, (d - t) / 0.3);
        const x = amp(filt(noise(d, 'pink'), 'bp', 3500, 0.6), (t) => e(t) * (0.8 + 0.2 * Math.random()));
        for (let k = 0; k < 50; k++) mix(x, amp(filt(noise(0.03), 'bp', rnd(1500, 4000), 3), ad(0.001, 0.01)), rnd(0.2, 1.7), 0.3);
        return reverb(x, 0.15, 0.7);
      },
      wind() {
        const d = 3, c = curve([[0, 350], [0.8, 700], [1.6, 450], [2.3, 900], [d, 500]]);
        const x = amp(filt(noise(d, 'pink'), 'bp', c, 1.2), (t) => Math.min(1, t / 0.8) * Math.min(1, (d - t) / 0.8));
        mix(x, amp(filt(noise(d), 'bp', (t) => c(t) * 2.2, 18), (t) => 0.5 * Math.pow(Math.sin(Math.PI * t / d), 2)), 0);
        return reverb(x, 0.2, 0.8);
      },
      jingle() {
        const x = S(2);
        for (let k = 0; k < 12; k++) { const at = k * 0.15 + (k % 2) * 0.02; for (let b = 0; b < 4; b++) mix(x, modal(0.3, rnd(3800, 6200), [[1, 1, 0.12], [1.47, 0.5, 0.08], [2.09, 0.3, 0.05]], 0.4), at + rnd(0, 0.03), 0.25); mix(x, amp(filt(noise(0.05), 'hp', 5000), ad(0.002, 0.02)), at, 0.3); }
        return reverb(x, 0.25, 0.8);
      },
      ghost() {
        const d = 2.4, p = curve([[0, 260], [0.8, 360], [1.6, 300], [d, 230]]);
        const x = voice(d, (t) => p(t) * (1 + 0.03 * Math.sin(TAU * 4.5 * t)), vowels([[0, 'u'], [1.2, 'o'], [d, 'u']]), { breath: 0.2, env: (t) => Math.min(1, t / 0.5) * Math.min(1, (d - t) / 0.6) });
        return reverb(filt(x, 'lp', 2200), 0.7, 0.93, 0.3, 2);
      },
      creak() {
        const d = 1.6, rate = curve([[0, 18], [0.3, 45], [0.8, 30], [1.2, 55], [d, 25]]), x = S(d); let ph = 0;
        for (let i = 0; i < x.length; i++) { ph += rate(i / SR) * (1 + 0.3 * (Math.random() - 0.5)) / SR; if (ph >= 1) { ph -= 1; x[i] = 1 + Math.random(); } }
        const y = S(d); [[650, 9, 1], [1400, 12, 0.6], [2600, 14, 0.3]].forEach(([f, q, g]) => mix(y, filt(x, 'bp', f, q), 0, g));
        return reverb(amp(y, (t) => Math.min(1, t / 0.1) * Math.min(1, (d - t) / 0.2)), 0.25, 0.82);
      },
      hop() {
        const x = S(1.5);
        [0, 0.42, 0.84].forEach((at) => { const d = 0.32; mix(x, amp(osc(d, (t) => (260 + 500 * (t / d)) * (1 + 0.12 * Math.exp(-t / 0.12) * Math.sin(TAU * 18 * t))), (t) => Math.sin(Math.PI * t / d)), at, 0.5); mix(x, amp(filt(noise(0.06), 'lp', 300), ad(0.002, 0.02)), at + d, 0.5); });
        return reverb(x, 0.15, 0.7);
      },
      chirp() {
        const x = S(1.5);
        for (let k = 0; k < 7; k++) { const d = rnd(0.06, 0.1), f0 = rnd(3200, 4200); mix(x, amp(osc(d, (t) => f0 * (1 - 0.3 * Math.sin(Math.PI * t / d)) * (1 + 0.04 * Math.sin(TAU * 90 * t))), (t) => Math.sin(Math.PI * t / d)), k * 0.16 + rnd(0, 0.04), 0.4); }
        return reverb(x, 0.2, 0.8);
      },
      pop() {
        const x = S(1.2), d = 0.35;
        mix(x, amp(filt(noise(d), 'bp', (t) => 1200 + 2500 * t / d, 6), (t) => 0.25 * Math.sin(Math.PI * t / d)), 0);
        mix(x, amp(noise(0.15), ad(0.0003, 0.02)), d, 1.4);
        mix(x, amp(osc(0.15, (t) => 90 - 40 * t), ad(0.001, 0.04)), d, 0.8);
        return reverb(x, 0.3, 0.82);
      },
      kiss() {
        const x = S(0.9);
        mix(x, voice(0.25, 220, VOWELS.m, { breath: 0.1, env: (t) => Math.min(1, t / 0.05) * Math.min(1, (0.25 - t) / 0.03) }), 0, 0.5);
        mix(x, amp(filt(noise(0.04), 'bp', 1800, 4), ad(0.0005, 0.006)), 0.24, 1.2);
        mix(x, voice(0.3, curve([[0, 260], [0.3, 200]]), VOWELS.a, { breath: 0.6, env: (t) => Math.exp(-t / 0.08) }), 0.26, 0.4);
        return reverb(x, 0.15, 0.7);
      },
      power() {
        const d = 1.4, f = (t) => 110 * Math.pow(2, 2 * Math.min(1, t / 1.1));
        const x = S(d); [1, 1.006, 0.995, 2.003].forEach((r, k) => mix(x, osc(d, (t) => f(t) * r, 'saw'), 0, k === 3 ? 0.3 : 0.5));
        const y = filt(x, 'lp', (t) => 300 + 6000 * Math.min(1, t / 1.1), 3);
        mix(y, amp(filt(noise(d), 'hp', 6000), (t) => 0.1 * t / d), 0);
        return reverb(amp(y, (t) => Math.min(1, t / 0.05) * Math.min(1, (d - t) / 0.25)), 0.35, 0.86);
      },
      whoosh() {
        const d = 1.1, c = curve([[0, 250], [0.55, 2600], [d, 400]]);
        const x = amp(filt(noise(d, 'pink'), 'bp', c, 1.3), (t) => Math.pow(Math.sin(Math.PI * t / d), 2));
        mix(x, amp(filt(noise(d, 'brown'), 'lp', 200), (t) => 0.5 * Math.sin(Math.PI * t / d)), 0);
        return reverb(x, 0.2, 0.8);
      },
      register() {
        const x = S(1.6);
        mix(x, amp(filt(noise(0.25), 'bp', 900, 1.5), (t) => Math.min(1, t / 0.03) * Math.max(0, 1 - t / 0.25)), 0, 0.5);
        mix(x, amp(filt(noise(0.05), 'lp', 1500), ad(0.001, 0.01)), 0.25, 0.7);
        mix(x, modal(1.3, 2600, DESK, 0.5), 0.3, 0.9);
        for (let k = 0; k < 5; k++) mix(x, modal(0.2, rnd(4500, 6500), [[1, 1, 0.05], [1.6, 0.4, 0.03]], 0.3), 0.35 + k * 0.05, 0.2);
        return reverb(x, 0.2, 0.75);
      },
      sizzle() {
        const d = 2, e = (t) => Math.min(1, t / 0.4) * Math.min(1, (d - t) / 0.4);
        const x = amp(filt(noise(d), 'hp', 4500), (t) => 0.15 * e(t));
        for (let k = 0; k < 260; k++) { const at = rnd(0, d - 0.05); mix(x, amp(filt(noise(0.01), 'hp', rnd(2500, 6000)), ad(0.0002, 0.0015)), at, rnd(0.2, 1) * e(at)); }
        return reverb(x, 0.1, 0.6);
      },
      steam() {
        const d = 2, e = (t) => Math.min(1, t / 0.4) * Math.min(1, (d - t) / 0.3);
        const x = amp(filt(noise(d), 'bp', curve([[0, 2500], [d, 4500]]), 1.2), e);
        mix(x, amp(filt(noise(d), 'bp', curve([[0, 1600], [d, 2600]]), 25), (t) => 0.5 * e(t)), 0);
        for (let k = 0; k < 18; k++) mix(x, bubble(rnd(200, 500), 0.04), rnd(0.2, 1.6), 0.25);
        return reverb(x, 0.15, 0.7);
      },
      scan() { const x = amp(filt(osc(0.16, 2900, 'pulse', 0.5), 'bp', 2900, 2), (t) => Math.min(1, t / 0.004) * Math.min(1, (0.16 - t) / 0.01)); return reverb(x, 0.12, 0.6); },
      stamp() {
        const x = S(1.1), thunk = () => { const b = amp(osc(0.2, (t) => 140 - 60 * t), ad(0.001, 0.04)); mix(b, amp(filt(noise(0.06), 'lp', 1200), ad(0.001, 0.015)), 0, 0.9); return b; };
        mix(x, thunk(), 0, 0.5); mix(x, thunk(), 0.4, 1);
        return reverb(x, 0.2, 0.75);
      },
      shh() {
        const d = 1.3;
        const x = amp(filt(filt(noise(d), 'bp', 2600, 1.3), 'hp', 1600), (t) => Math.min(1, t / 0.15) * Math.min(1, (d - t) / 0.35) * (1 + 0.1 * Math.sin(TAU * 3 * t)));
        return reverb(x, 0.15, 0.7);
      },
      drumroll() {
        const x = S(3.4); let t = 0;
        while (t < 1.8) { const r = 10 + 16 * (t / 1.8); mix(x, snare(0.25 + 0.5 * t / 1.8), t + rnd(-0.004, 0.004)); t += 1 / r; }
        const crash = amp(filt(noise(1.6), 'hp', 4000), ad(0.002, 0.5)); for (let k = 0; k < 8; k++) mix(crash, amp(osc(1.6, rnd(3000, 8000), 'pulse', 0.5), ad(0.002, 0.3)), 0, 0.05);
        mix(x, crash, 1.85, 0.8); mix(x, timpani(55), 1.85, 1);
        return reverb(x, 0.3, 0.86);
      },
    };
    const LEVEL = { heartbeat: 1.3, scan: 0.6, shh: 0.8, sizzle: 0.8, wind: 0.85, spray: 0.85, beeps: 0.8, reverse: 0.8, lights: 0.8 };
    function render(name) { const f = SND[name] || SND.fanfare; return finish(f(), LEVEL[name] || 1); }
    return { render, names: Object.keys(SND) };
  }
  const api = { make };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LPQSFX = api;
})(typeof window !== 'undefined' ? window : globalThis);
