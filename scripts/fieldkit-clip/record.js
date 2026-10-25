// Records a walkthrough of the Field Kit (dino sample order on the stand-in server, port 8790) as
// PNG frames with timestamps, via Chrome's screencast. Writes frames/ and frames.txt for ffmpeg.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = path.join(process.argv[2] || require('os').tmpdir(), 'fk-frames');
const PHOTOS = path.join(__dirname, '..', '..', 'project-files', 'fieldkit-photos');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT);
const H = `http://localhost:8790/h/${'h'.repeat(24)}`;
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 360, height: 720 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  const marks = []; // [label, ms] for the captions beside the video
  // A soft tap marker wherever we tap.
  await p.addInitScript(() => {
    addEventListener('pointerdown', (e) => {
      const d = document.createElement('div');
      d.style.cssText = `position:fixed;left:${e.clientX - 22}px;top:${e.clientY - 22}px;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.55);border:3px solid rgba(40,40,60,.55);z-index:99999;pointer-events:none;transition:transform .45s,opacity .45s`;
      document.body.append(d);
      requestAnimationFrame(() => { d.style.transform = 'scale(1.6)'; d.style.opacity = '0'; });
      setTimeout(() => d.remove(), 600);
    }, true);
  });
  await p.goto(H, { waitUntil: 'networkidle' });
  // the photos the family took during the day
  const photos = ['hallway', 'couch', 'living-room', 'party'].map((f) => `data:image/webp;base64,${fs.readFileSync(path.join(PHOTOS, `${f}.webp`)).toString('base64')}`);
  await p.evaluate(async (list) => {
    const db = await new Promise((res) => { const r = indexedDB.open('lpq-fieldkit', 1); r.onupgradeneeded = () => r.result.createObjectStore('photos', { keyPath: 'id' }); r.onsuccess = () => res(r.result); });
    const labels = ['Off on the hunt', 'Card 3 found', 'Which way next?', 'Mission complete!'];
    for (const [k, url] of list.entries()) {
      const blob = await (await fetch(url)).blob();
      await new Promise((res) => { const t = db.transaction('photos', 'readwrite'); t.objectStore('photos').put({ id: `p${k}`, key: FKCFG.key, at: k, label: labels[k], blob }); t.oncomplete = res; });
    }
  }, photos);
  await p.click('[data-sec="hunt"]');
  const steps = await p.evaluate(() => STEPS.map((s) => s.title));
  await p.evaluate((k) => { i = k; draw(); }, steps.indexOf('Hide Card 3'));
  await p.waitForTimeout(300);

  const cdp = await ctx.newCDPSession(p);
  const frames = [];
  let t0 = null;
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    const t = metadata.timestamp; if (t0 === null) t0 = t;
    const f = path.join(OUT, `f${String(frames.length).padStart(5, '0')}.png`);
    fs.writeFileSync(f, Buffer.from(data, 'base64'));
    frames.push([f, t - t0]);
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1, maxWidth: 720, maxHeight: 1440 });
  const start = Date.now();
  const mark = (label) => marks.push([label, Date.now() - start]);
  const pause = (ms) => p.waitForTimeout(ms);

  mark('Hide the clues');
  await pause(1400);
  await p.click('#chk'); await pause(700);
  await p.click('#next'); await pause(1300);

  mark('Run the hunt');
  await p.evaluate((k) => { i = k; draw(); scrollTo(0, 0); }, steps.findIndex((s, n) => n > steps.indexOf('Gather the kids') && /Card 3/.test(s)) - 1);
  await pause(1200);
  await p.click('#next'); await pause(2400);
  await p.evaluate(() => scrollBy({ top: 260, behavior: 'smooth' })); await pause(1200);

  mark('Shop day');
  await p.evaluate(() => scrollTo(0, 0));
  await p.click('[data-sec="kit"]'); await pause(500);
  await p.evaluate(() => document.querySelector('.fk-shop').scrollIntoView({ block: 'start', behavior: 'smooth' })); await pause(900);
  await p.click('#shopOpen'); await pause(1800);
  await p.click('#shopServed'); await pause(1800);

  mark('Snap & print');
  await p.click('.fk-cam'); await pause(1600);
  await p.evaluate(() => document.querySelector('.fk-sheet-in').scrollTo({ top: 400, behavior: 'smooth' })); await pause(900);
  await p.click('#fkGo'); await p.waitForSelector('.fk-ok', { timeout: 20000 }); await pause(900);
  // the page that prints: the real photo page the phone just made, sliding up
  await p.evaluate(async () => {
    const list = await new Promise((res) => { const r = indexedDB.open('lpq-fieldkit', 1); r.onsuccess = () => { const out = []; const c = r.result.transaction('photos').objectStore('photos').openCursor(); c.onsuccess = () => { if (c.result) { out.push(c.result.value); c.result.continue(); } else res(out.sort((a, b) => a.at - b.at)); }; }; });
    const url = (await FK.photoPage(list)).toDataURL('image/jpeg', 0.9);
    const o = document.createElement('div');
    o.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(20,24,40,.82);display:grid;place-items:center;opacity:0;transition:opacity .4s';
    o.innerHTML = `<img src="${url}" style="width:86%;border-radius:6px;box-shadow:0 18px 40px rgba(0,0,0,.45);transform:translateY(60px) rotate(-2deg);transition:transform .6s cubic-bezier(.2,.8,.2,1)">`;
    document.body.append(o);
    requestAnimationFrame(() => { o.style.opacity = '1'; o.firstChild.style.transform = 'translateY(0) rotate(-2deg)'; });
  });
  await pause(2600);
  mark('end');
  await cdp.send('Page.stopScreencast');
  await pause(300);
  // ffmpeg concat list: each frame shown until the next one
  const lines = [];
  for (let k = 0; k < frames.length; k++) {
    const dur = k + 1 < frames.length ? frames[k + 1][1] - frames[k][1] : 0.5;
    lines.push(`file '${frames[k][0]}'`, `duration ${Math.max(0.01, dur).toFixed(3)}`);
  }
  lines.push(`file '${frames[frames.length - 1][0]}'`);
  fs.writeFileSync(path.join(OUT, 'frames.txt'), lines.join('\n'));
  fs.writeFileSync(path.join(OUT, 'marks.json'), JSON.stringify(marks));
  console.log('frames', frames.length, 'seconds', frames.at(-1)[1].toFixed(1), 'marks', JSON.stringify(marks));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
