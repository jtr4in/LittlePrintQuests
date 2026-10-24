// Parents can put more than one kid on an order: "Jaxon and Jonah", "Jaxon & Jonah", "Mia, Leo + Ava".
// splitNames() pulls the names apart and tidyNames() writes them back the short way, with an
// ampersand ("Jaxon & Jonah", "Mia, Leo & Ava"), so signs and badges have less to fit.
// A single name comes back as typed (spaces tidied). docs/js/names.js does the same for the site.

const SPLIT = /\s*(?:,|&|\+|\/|\band\b)\s*/i;

function splitNames(raw) {
  const s = String(raw ?? '').replace(/\s+/g, ' ').trim();
  const parts = s.split(SPLIT).map((x) => x.trim()).filter(Boolean);
  return parts.length ? parts : s ? [s] : [];
}

function joinNames(names) {
  if (names.length < 2) return names[0] || '';
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}

const tidyNames = (raw) => joinNames(splitNames(raw));

module.exports = { splitNames, joinNames, tidyNames };
