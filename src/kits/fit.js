// Shrinks name-sized text in the print page until it fits, measured in the browser with the real fonts
// (two names, "Jaxon & Jonah’s Mission Control", are much longer than "Maya’s"):
//   data-lines="2"   on an HTML block: no wider than its box, and at most that many lines.
//   data-fit-w="990" on an SVG <text>: no wider than that many drawing units.
//   .page.guide: steps up to the next tighter type size (dense, denser, densest) while its
//                lists and play ideas run into the footer.
// It runs before the PDF and screenshots (renderHtml waits for the fonts first), so the site's
// name previews record the fitted sizes too.
const FIT_JS = `
(function () {
  function lineH(el, s) {
    return parseFloat(getComputedStyle(el).lineHeight) || s * 1.25; // "normal" reads as no number
  }
  // Back to the size the page gave it, so the second pass (after the fonts load) starts fresh.
  function reset(el) {
    if (!el.hasAttribute('data-fs0')) el.setAttribute('data-fs0', el.style.fontSize);
    el.style.fontSize = el.getAttribute('data-fs0');
  }
  function fitAll() {
    document.querySelectorAll('[data-lines]').forEach(function (el) {
      reset(el);
      var s = parseFloat(getComputedStyle(el).fontSize), min = s * 0.4, n = +el.getAttribute('data-lines');
      var over = function () { return el.scrollWidth > el.clientWidth + 0.5 || el.offsetHeight > n * lineH(el, s) + s * 0.3; };
      while (over() && s > min) { s *= 0.96; el.style.fontSize = s + 'px'; }
    });
    document.querySelectorAll('text[data-fit-w]').forEach(function (el) {
      reset(el);
      var s = parseFloat(getComputedStyle(el).fontSize), min = s * 0.3, w = +el.getAttribute('data-fit-w');
      while (el.getComputedTextLength() > w && s > min) { s *= 0.96; el.style.fontSize = s + 'px'; }
    });
  }
  var LEVELS = [[], ['dense'], ['dense', 'denser'], ['dense', 'denser', 'densest']];
  function fitGuides() {
    document.querySelectorAll('.page.guide').forEach(function (g) {
      var foot = g.querySelector('footer');
      if (!foot) return;
      var over = function () {
        var bottom = 0;
        for (var i = 0; i < g.children.length; i++) if (g.children[i] !== foot) bottom = Math.max(bottom, g.children[i].getBoundingClientRect().bottom);
        return bottom > foot.getBoundingClientRect().top - 2;
      };
      var start = LEVELS.findIndex(function (l) { return l.length === ['dense', 'denser', 'densest'].filter(function (c) { return g.classList.contains(c); }).length; });
      for (var n = start; over() && n < LEVELS.length - 1; n++) LEVELS[n + 1].forEach(function (c) { g.classList.add(c); });
    });
  }
  fitAll();
  fitGuides();
  document.fonts.ready.then(fitAll);
  document.fonts.ready.then(fitGuides);
})();`;

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// "Maya’s Potion Shop" → ["Maya’s", "Potion Shop"], so the name can sit on its own line.
function splitPlace(place) {
  const i = place.indexOf('’ ') >= 0 && place.indexOf('’ ') < place.indexOf('’s ') ? place.indexOf('’ ') + 1 : place.indexOf('’s ') + 2;
  return i > 1 ? [place.slice(0, i), place.slice(i + 1)] : ['', place];
}

// The place name as HTML that only wraps between the names and the place:
// "Jaxon & Jonah’s / Mission Control", never "Jaxon & Jonah’s Mission / Control".
function placeHtml(place) {
  const nw = (s) => `<span style="white-space:nowrap">${esc(s)}</span>`;
  const [who, what] = splitPlace(place);
  return who ? `${nw(who)} ${nw(what)}` : esc(place);
}

module.exports = { FIT_JS, fitScript: `<script>${FIT_JS}</script>`, splitPlace, placeHtml };
