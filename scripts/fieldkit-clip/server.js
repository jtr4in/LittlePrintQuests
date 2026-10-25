// A stand-in for the order bot's Field Kit routes, with one sample everything-bundle order.
// Usage: node fkserver.js <port> [theme]
const http = require('http');
const fs = require('fs');
const path = require('path');
const host = require('../../src/host/host');
const port = +process.argv[2] || 8790;
const theme = process.argv[3] || 'dino';
const o = {
  id: 'web-test', status: 'ready', hostToken: 'h'.repeat(24), sidekickToken: 's'.repeat(24), downloadToken: 'd'.repeat(24),
  config: { theme, childName: 'Ava', age: 6, spots: ['front_door', 'shoe_rack', 'couch', 'dryer', 'bathtub', 'bookshelf', 'pet_bed', 'kitchen_table'], party: { date: 'Saturday, October 31' } },
};
let step = 0;
http.createServer((req, res) => {
  const p = new URL(req.url, 'http://x').pathname;
  const m = p.match(/^\/(h|s)\/([A-Za-z0-9_-]{20,})(?:\/(state|sw\.js|manifest\.webmanifest|icon-(?:192|512)\.png|art\/(\d{1,2})\.webp))?$/);
  if (!m) { res.writeHead(404); return res.end('nf'); }
  const [, kind, , sub, artN] = m;
  if (sub === 'state') {
    if (req.method === 'POST') { let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => { try { step = JSON.parse(b).step; } catch {} res.writeHead(204); res.end(); }); return; }
    res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ step }));
  }
  const base = `/h/${o.hostToken}`;
  if (sub === 'sw.js') { res.writeHead(200, { 'Content-Type': 'text/javascript', 'Service-Worker-Allowed': base }); return res.end(host.serviceWorker(base, host.stickers(o).length)); }
  if (sub === 'manifest.webmanifest') { res.writeHead(200, { 'Content-Type': 'application/manifest+json' }); return res.end(host.manifest(o, base)); }
  if (sub) {
    const file = artN !== undefined ? host.stickers(o)[+artN] : path.join(require('path').join(__dirname, '..', '..', 'docs', 'img'), sub);
    if (!file || !fs.existsSync(file)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': file.endsWith('.png') ? 'image/png' : 'image/webp' }); return res.end(fs.readFileSync(file));
  }
  const html = kind === 'h' ? host.hostPage(o, { stateUrl: `${base}/state`, items: ['hunt', 'kit', 'activity', 'party'], sidekickUrl: `http://localhost:${port}/s/${o.sidekickToken}`, downloads: '/d/x.pdf' })
    : host.sidekickPage(o, { stateUrl: `/s/${o.sidekickToken}/state` });
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(html);
}).listen(port, () => console.log(`http://localhost:${port}/h/${o.hostToken}  stickers ${host.stickers(o).length}`));
