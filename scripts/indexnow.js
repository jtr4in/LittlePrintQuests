// Tells Bing (and the other IndexNow search engines: Yandex, Seznam, Naver) which site pages changed, so they
// recrawl in days instead of weeks. Google doesn't use IndexNow; it reads the sitemap's lastmod dates.
//   node scripts/indexnow.js <git range>   pages changed in that range, e.g. HEAD~1..HEAD (the workflow does this)
//   node scripts/indexnow.js --all         every URL in docs/sitemap.xml
//   add --dry to print the URLs without sending them
// The key is public by design: docs/<KEY>.txt holds it so the search engines can check we own the site.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const KEY = '7f373aabcc0c8f7354e1d5a457cf6d8b';
const SITE = 'https://littleprintquests.com/';
const DOCS = path.join(__dirname, '..', 'docs');

// docs/ideas/x/index.html -> https://littleprintquests.com/ideas/x/ (only HTML pages and the sitemap matter).
function urlOf(file) {
  const rel = path.relative('docs', file).split(path.sep).join('/');
  if (rel.startsWith('..') || !rel.endsWith('.html')) return null;
  if (!fs.existsSync(path.join(DOCS, rel))) return null; // deleted pages can't be recrawled
  return SITE + rel.replace(/(^|\/)index\.html$/, '$1');
}

function urls(args) {
  if (args.includes('--all')) {
    return [...fs.readFileSync(path.join(DOCS, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  }
  const range = args.find((a) => !a.startsWith('--'));
  if (!range) throw new Error('Give a git range (HEAD~1..HEAD) or --all');
  const files = execFileSync('git', ['diff', '--name-only', range, '--', 'docs'], { cwd: path.join(DOCS, '..') }).toString().split('\n').filter(Boolean);
  return [...new Set(files.map(urlOf).filter(Boolean))];
}

async function main() {
  const args = process.argv.slice(2);
  const list = urls(args).slice(0, 10000);
  if (!list.length) return console.log('No site pages changed.');
  console.log(list.join('\n'));
  if (args.includes('--dry')) return;
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}${KEY}.txt`, urlList: list }),
  });
  // 200 and 202 both mean accepted; 403 means the key file isn't live yet.
  console.log(`IndexNow: HTTP ${res.status} for ${list.length} URL(s)`);
  if (res.status >= 300) process.exit(1);
}

if (require.main === module) main().catch((e) => { console.error(e.message); process.exit(1); });
module.exports = { KEY, urlOf };
