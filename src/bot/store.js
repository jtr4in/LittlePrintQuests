// Tiny JSON-file store kept on the server's persistent disk (DATA_DIR).

const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');
const FILE = path.join(DATA_DIR, 'state.json');
const PDF_DIR = path.join(DATA_DIR, 'pdfs');
fs.mkdirSync(PDF_DIR, { recursive: true });

let state = { etsy: null, lastPollAt: null, lastPollError: null, orders: {} };
if (fs.existsSync(FILE)) state = { ...state, ...JSON.parse(fs.readFileSync(FILE, 'utf8')) };

function save() {
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, FILE);
}

module.exports = {
  PDF_DIR,
  get: () => state,
  update(fn) {
    fn(state);
    save();
  },
};
