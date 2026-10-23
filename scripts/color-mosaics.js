// Usage: node scripts/color-mosaics.js [kit ...]
// Builds the color-by-number pictures for the activity packs (src/kits/mosaics.json): one picture
// per kit, drawn from its emoji and snapped to a grid of crayon colors. The big kids version is
// 18 squares across its longer side with numbers, the little kids version 11 with colored dots.
// Each row is a string: '.' is outside the picture, any other letter is a crayon from CRAYONS
// in src/kits/activities.js.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const art = require('../src/kits/art');
const { KITS } = require('../src/kits/engine');
const { MOSAIC_PICS } = require('../src/kits/activities');

const OUT = path.join(__dirname, '..', 'src', 'kits', 'mosaics.json');
const SIZES = { big: 18, little: 11 };

// Runs in the browser: the emoji's crayon grid, n squares across.
async function grid(svg, n) {
  const img = new Image();
  img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  await img.decode();
  const S = 512;
  const cv = document.createElement('canvas'); cv.width = cv.height = S;
  const ctx = cv.getContext('2d');
  ctx.drawImage(img, 0, 0, S, S);
  const px = ctx.getImageData(0, 0, S, S).data;
  // the picture's own box, so it fills the grid
  let x0 = S, y0 = S, x1 = 0, y1 = 0;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (px[(y * S + x) * 4 + 3] > 40) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  // n squares across the longer side, and as many as it takes along the other
  const w = x1 - x0 + 1; const h = y1 - y0 + 1; const side = Math.max(w, h) / n;
  let cols = Math.round(w / side); let rows = Math.round(h / side);
  const ox = x0 + (w - cols * side) / 2; const oy = y0 + (h - rows * side) / 2;
  const crayon = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b); const min = Math.min(r, g, b); const l = (max + min) / 2; const d = max - min;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    let h = 0;
    if (d) h = 60 * (max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4);
    if (h < 0) h += 360;
    if (l > 0.9 || (l > 0.8 && s < 0.35)) return 'w';
    if (s < 0.18 || l < 0.2) return l < 0.3 ? 'k' : 'a';
    if (l < 0.42 && h >= 15 && h < 50) return 'n';
    if (h < 15 || h >= 345) return l > 0.72 ? 'p' : 'r';
    if (h < 40) return s > 0.5 || l > 0.5 ? 'o' : 'n';
    if (h < 64) return 'y';
    if (h < 170) return 'g';
    if (h < 255) return 'b';
    if (h < 300) return 'v';
    return 'p';
  };
  const k = 8; let out = [];
  for (let gy = 0; gy < rows; gy++) {
    let row = '';
    for (let gx = 0; gx < cols; gx++) {
      const votes = {};
      for (let sy = 0; sy < k; sy++) for (let sx = 0; sx < k; sx++) {
        const x = Math.floor(ox + (gx + (sx + 0.5) / k) * side); const y = Math.floor(oy + (gy + (sy + 0.5) / k) * side);
        const i = (y * S + x) * 4;
        const c = x < 0 || y < 0 || x >= S || y >= S || px[i + 3] < 128 ? '.' : crayon(px[i], px[i + 1], px[i + 2]);
        votes[c] = (votes[c] || 0) + 1;
      }
      row += Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0];
    }
    out.push(row);
  }
  // A square on its own takes its neighbors' color, so there are no specks to fiddle with.
  // Bits floating on their own (a puff of smoke, a sparkle) are too small to color, so they go.
  const seen = new Set(); const blobs = [];
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    if (out[y][x] === '.' || seen.has(`${x},${y}`)) continue;
    const blob = []; const todo = [[x, y]]; seen.add(`${x},${y}`);
    while (todo.length) {
      const [cx, cy] = todo.pop(); blob.push([cx, cy]);
      for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || out[ny][nx] === '.' || seen.has(`${nx},${ny}`)) continue;
        seen.add(`${nx},${ny}`); todo.push([nx, ny]);
      }
    }
    blobs.push(blob);
  }
  const biggest = Math.max(...blobs.map((b) => b.length));
  for (const blob of blobs) if (blob.length < Math.max(4, biggest * 0.08)) for (const [bx, by] of blob) out[by] = out[by].slice(0, bx) + '.' + out[by].slice(bx + 1);
  // ...and the empty edge they leave behind is trimmed off.
  while (out.length && /^\.*$/.test(out[0])) out.shift();
  while (out.length && /^\.*$/.test(out.at(-1))) out.pop();
  while (out.every((r) => r[0] === '.')) out = out.map((r) => r.slice(1));
  while (out.every((r) => r.at(-1) === '.')) out = out.map((r) => r.slice(0, -1));
  rows = out.length; cols = out[0].length;
  return out.map((row, y) => [...row].map((c, x) => {
    const nb = {};
    for (let yy = y - 1; yy <= y + 1; yy++) for (let xx = x - 1; xx <= x + 1; xx++) {
      if ((yy === y && xx === x) || yy < 0 || xx < 0 || yy >= rows || xx >= cols) continue;
      nb[out[yy][xx]] = (nb[out[yy][xx]] || 0) + 1;
    }
    return nb[c] ? c : Object.entries(nb).sort((a, b) => b[1] - a[1])[0][0];
  }).join(''));
}

(async () => {
  const only = process.argv.slice(2);
  const out = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const id of Object.keys(KITS).filter((k) => !only.length || only.includes(k))) {
    const e = MOSAIC_PICS[id] || KITS[id].icon;
    let svg = art.emojiSvg(e);
    if (!svg) throw new Error(`${id}: no emoji drawing for ${e}`);
    if (!/xmlns=/.test(svg)) svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    if (/xlink:/.test(svg) && !/xmlns:xlink/.test(svg)) svg = svg.replace('<svg', '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    out[id] = { e };
    for (const [ages, n] of Object.entries(SIZES)) out[id][ages] = await page.evaluate(`(${grid})(${JSON.stringify(svg)}, ${n})`);
    console.log(id, e);
  }
  await browser.close();
  fs.writeFileSync(OUT, `${JSON.stringify(out, null, 1)}\n`);
  console.log('Wrote', path.relative(process.cwd(), OUT));
})().catch((e) => { console.error(e); process.exit(1); });
