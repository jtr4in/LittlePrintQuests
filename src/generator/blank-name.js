// Name-free copies of the personalized PDFs (the static Etsy downloads): a product is built with
// stand-in name and year, and every mention of them becomes a write-in line.
const BLANK_NAME = 'Qzxname';
const BLANK_YEAR = 'Qzxyear';
const blankName = (html) => html.replace(/qzxname/gi, '________').replace(/qzxyear/gi, '_____');
module.exports = { BLANK_NAME, BLANK_YEAR, blankName };
