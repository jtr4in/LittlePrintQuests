// Library book pockets and date due cards, an idea from Jason's wife (2026-10-24): the little paper
// pocket glued inside a book's back cover, with a card that slides in and gets the date each time the
// book is borrowed. Little kids (ages 3 to 5) stamp a box; big kids write the date and their name.
// Only kits with def.bookCards get them.

const { pic } = require('./art');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const head = (title, sub) => `<h2 class="pg-title">${esc(title)}</h2><p class="pg-sub">${esc(sub)}</p>`;

function pocket(k) {
  return `<div class="bk-pocket">
    <div class="bk-flap l">glue</div><div class="bk-flap r">glue</div><div class="bk-flap b">glue</div>
    <div class="bk-face">
      <div class="bk-place">${esc(k.placeName)}</div>
      ${pic('📚', '.5in')}
      <div class="bk-word">Date Due card</div>
      <div class="bk-line"><span>Book</span><i></i></div>
      <div class="bk-note">Please bring me back!</div>
    </div>
  </div>`;
}

function card(k) {
  const rows = k.little
    ? `<div class="bk-stamps">${Array.from({ length: 9 }, () => '<span>stamp</span>').join('')}</div>`
    : `<div class="bk-table"><div class="bk-th"><span>Date due</span><span>Reader</span></div>${'<div class="bk-tr"><span></span><span></span></div>'.repeat(8)}</div>`;
  return `<div class="bk-card">
    <div class="bk-card-head"><span>${esc(k.placeName)}</span><b>DATE DUE</b></div>
    <div class="bk-line"><span>Book</span><i></i></div>
    ${rows}
  </div>`;
}

function bookCardPages(k) {
  if (!k.def.bookCards) return '';
  const how = k.little ? 'Each time a book is borrowed, stamp the next box (or draw a star).' : 'Each time a book is borrowed, write the date it is due back and the reader\'s name.';
  return `<section class="page props bk">
    ${head('Book Pockets', 'Cut out each pocket, fold the three glue flaps back and glue it inside the back cover of a book. Slide a date due card in.')}
    <div class="bk-grid">${pocket(k).repeat(4)}</div>
  </section>
  <section class="page props bk">
    ${head('Date Due Cards', `Cut out the cards and slide one into each book pocket. ${how}`)}
    <div class="bk-grid">${card(k).repeat(4)}</div>
  </section>`;
}

const bookCardLine = (k) => (k.def.bookCards ? [`Book pockets and date due cards to ${k.little ? 'stamp' : 'fill in'} for 4 books`] : []);

const bookCardCss = `
.bk-grid { flex:1; display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr; gap:.3in .35in; padding:.1in .2in; }
.bk-pocket { position:relative; margin:1in .3in .3in; }
.bk-flap { position:absolute; border:2px dashed #b7c0cc; background:var(--mint-l); font:600 8pt 'Fredoka'; color:#9aa5b8; display:grid; place-items:center; text-transform:uppercase; letter-spacing:.06em; }
.bk-flap.l, .bk-flap.r { top:.25in; bottom:0; width:.28in; writing-mode:vertical-rl; }
.bk-flap.l { left:-.3in; border-right:none; border-radius:10px 0 0 10px; }
.bk-flap.r { right:-.3in; border-left:none; border-radius:0 10px 10px 0; }
.bk-flap.b { left:0; right:0; bottom:-.3in; height:.28in; border-top:none; border-radius:0 0 10px 10px; }
.bk-face { position:absolute; inset:0; border:2px solid var(--teal); border-radius:4px 4px 2px 2px; background:var(--mint); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.08in; padding:.2in; text-align:center; }
.bk-place { font:700 12pt 'Fredoka'; color:var(--teal-d); }
.bk-word { font:700 16pt 'Fredoka'; color:var(--navy); text-transform:uppercase; letter-spacing:.04em; }
.bk-note { font:600 10pt 'Nunito'; color:var(--teal-d); }
.bk-line { display:flex; align-items:flex-end; gap:.08in; width:100%; font:700 11pt 'Fredoka'; color:var(--navy); }
.bk-line i { flex:1; border-bottom:1.5px solid var(--navy); height:.25in; }
.bk-card { border:2px dashed #b7c0cc; border-radius:6px; background:#fff; display:flex; flex-direction:column; gap:.1in; padding:.14in .2in; margin:0 .55in; }
.bk-card-head { display:flex; flex-direction:column; align-items:center; border-bottom:3px double var(--teal); padding-bottom:.05in; }
.bk-card-head span { font:600 9pt 'Fredoka'; color:var(--teal-d); }
.bk-card-head b { font:700 15pt 'Fredoka'; color:var(--navy); letter-spacing:.08em; }
.bk-table { flex:1; display:flex; flex-direction:column; border:1.5px solid var(--navy); }
.bk-th, .bk-tr { display:grid; grid-template-columns:1fr 1.3fr; }
.bk-th { background:var(--mint); font:700 9pt 'Fredoka'; color:var(--navy); text-transform:uppercase; }
.bk-th span, .bk-tr span { padding:.03in .08in; border-right:1.5px solid var(--navy); }
.bk-th span:last-child, .bk-tr span:last-child { border-right:none; }
.bk-tr { flex:1; border-top:1px solid var(--line); }
.bk-stamps { flex:1; display:grid; grid-template-columns:repeat(3, 1fr); gap:.08in; }
.bk-stamps span { border:2px dashed var(--teal); border-radius:10px; display:grid; place-items:center; font:600 8pt 'Fredoka'; color:#b0b8c6; text-transform:uppercase; }
`;

module.exports = { bookCardPages, bookCardLine, bookCardCss };
