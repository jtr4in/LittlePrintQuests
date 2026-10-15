// Host Mode: the grown-up's phone page for everything in the order, in three tabs.
//  - Hunt: hiding the cards and running the hunt, one tap at a time, with lines to say, hints
//    and quick challenges. A second link gives a helper (the "sidekick") their own cues.
//  - Play Kit: setup, pretend-play scenarios, things to say and games for the kit.
//  - Party: a planning checklist from the invitations to the thank-you cards.
// Tabs for things the order doesn't include are greyed out.
//
// These pages come with Etsy orders too, so they stay plain: no shop links, prices or offers.

const THEMES = require('../generator/themes');
const { planHunt } = require('../generator/build');
const SCRIPTS = require('./scripts');
const { KITS, kitForHunt } = require('../kits/engine');
const { checklist } = require('./party');

const possessive = (name) => (/s$/i.test(name) ? `${name}’` : `${name}’s`);
const play = (kit) => { try { return require(`./play/${kit.id}`); } catch { return null; } };

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fill = (text, ctx) => text.replace(/\{(\w+)\}/g, (_, k) => ctx[k] ?? '');

function hints(spot) {
  return [
    'Read the last two lines of the clue again, slowly. Ask: “What do we do there?”',
    `Play hot and cold. Walk slowly toward the ${spot.label} and say “warmer” as they get close.`,
    `Point them right to the ${spot.label}. (${spot.tip})`,
  ];
}

// Every screen of Host Mode, plus the sidekick's cue for each one.
function plan(order, sidekickUrl) {
  const cfg = order.config;
  const { theme, cards, prize } = planHunt(cfg);
  const s = SCRIPTS[cfg.theme];
  const name = cfg.childName || 'our birthday star';
  const kids = cfg.childName ? `${cfg.childName} and the ${theme.hunters}` : theme.hunters;
  const ctx = { name, kids, count: cards.length, prize: prize.label, age: cfg.age || '' };
  const n = cards.length;
  const steps = [];

  steps.push({ phase: 'setup', title: 'Let’s hide the cards', body: [`You have ${n} clue cards. Keep Card 1 with you, and hide the other ${n - 1} in the order on the next screens.`, 'Do this while the kids are busy, or the night before.'] });
  for (const c of cards.slice(1)) {
    steps.push({ phase: 'setup', check: true, title: `Hide Card ${c.n}`, spot: c.hiddenAt.label, body: [c.hiddenAt.tip], small: `Its riddle sends the kids to the ${c.leadsTo.label}.` });
  }
  steps.push({ phase: 'setup', check: true, title: 'Hide the prize', spot: prize.label, body: [`Cake, favor bags or treasure: it all goes at the ${prize.label}. The last clue leads here.`] });
  if (sidekickUrl) steps.push({ phase: 'setup', title: 'Want a sidekick?', share: sidekickUrl, body: ['Send this link to another grown-up. They get a secret role: radio calls in character, sound effects, and sneaking ahead to check the next card is still hidden.', 'Their screen follows along as you tap Next.'] });
  steps.push({ phase: 'setup', title: 'All set!', body: ['Gather the kids and tap Next to start the hunt.'] });

  steps.push({ phase: 'play', title: 'Gather the kids', say: fill(s.gather, ctx) });
  steps.push({ phase: 'play', title: 'Read the mission briefing', read: theme.briefing.paragraphs.map((p) => fill(p, ctx)), small: `${theme.briefing.signoff} ${theme.briefing.from}` });
  cards.forEach((c, i) => {
    const step = { phase: 'play', heading: c.n === n ? `the prize at the ${prize.label}` : `the ${c.leadsTo.label}`, read: c.lines, hints: hints(c.leadsTo) };
    if (c.n === 1) Object.assign(step, { title: 'Read Clue #1 aloud', body: ['Hand Card 1 to the kids and read it together.'] });
    else Object.assign(step, { title: `They found Card ${c.n}!`, small: `At the ${c.hiddenAt.label}`, challenge: s.challenges[(i - 1) % s.challenges.length], say: fill(s.calls[(i - 1) % s.calls.length], ctx) });
    steps.push(step);
  });
  steps.push({ phase: 'play', title: 'Treasure found! 🎉', say: fill(s.finale, ctx), body: [`Hand ${name} the certificate from the last page of the PDF.`] });

  // The sidekick's cue for each host screen.
  const third = Math.max(2, Math.ceil(n / 3));
  const twoThirds = Math.max(third + 1, Math.ceil((2 * n) / 3));
  const cue = (step, i) => {
    if (step.phase === 'setup') return { title: 'The host is hiding the cards', body: 'Keep the kids busy away from the hiding spots. Your cues will show up here once the hunt starts.' };
    if (step.title === 'Gather the kids') return { title: 'Get in position', body: 'Stay out of sight with your phone. You’re the voice on the radio today.' };
    if (step.read && !step.hints) return { title: 'Briefing time', body: `Listen in. When the kids head off, you’ll call in as ${s.voice}.` };
    if (step.hints) {
      const k = cards.findIndex((c) => step.read === c.lines) + 1;
      const next = cards[k];
      if (k === n) return { title: 'Radio call', say: fill(s.radio[2], ctx), body: 'Then sneak to the prize spot to catch the moment on camera.' };
      if (k === third) return { title: 'Radio call', say: fill(s.radio[0], ctx), body: 'Call it out from another room, like a walkie-talkie.' };
      if (k === twoThirds) return { title: 'Radio call', say: fill(s.radio[1], ctx), body: 'Call it out from another room.' };
      if (k === 1) return { title: 'Sound effect', body: s.sounds[0] };
      return k % 2
        ? { title: 'Sound effect', body: s.sounds[(k >> 1) % s.sounds.length] }
        : { title: 'Sneak ahead', body: `Check that Card ${next.n} is still at the ${next.hiddenAt.label}. Put it back if it moved.` };
    }
    return { title: 'Big finish', body: `Lead the cheer and take a photo when ${name} gets the certificate!` };
  };
  steps.forEach((st, i) => (st.cue = cue(st, i)));
  return { theme, steps, name, sidekick: { voice: s.voice, jobs: [`Radio calls as ${s.voice}`, ...s.sounds.slice(0, 2).map((x) => `Sound effect: ${x}`), 'Sneaking ahead to check the next card is still hidden'] } };
}

// Dark text on light accents, white text on dark ones (race car black, Christmas green).
function textOn(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.2 ? '#1d1406' : '#fff'; // whichever contrasts more
}

function shell(theme, title, body, script) {
  const [main, accent, soft] = [theme.colors.primary, theme.colors.accent, theme.colors.soft];
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex"><meta name="referrer" content="no-referrer"><meta name="theme-color" content="${esc(main)}">
<title>${esc(title)}</title><style>
:root{--main:${main};--accent:${accent};--on-accent:${textOn(accent)};--soft:${soft};--bg:#fbf8f1;--card:#fff;--ink:#2c3352;--muted:#646d8f;--line:#e4dfd3}
@media (prefers-color-scheme:dark){:root{--bg:#151a2e;--card:#1f2540;--ink:#f4f0e6;--muted:#b4bad4;--line:#353c5c}}
*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-text-size-adjust:100%}
.top{background:var(--main);color:#fff;padding:14px 16px calc(14px) 16px;display:flex;align-items:center;gap:10px}
.top svg{width:30px;height:30px;flex:none}.top b{display:block;font-size:16px;line-height:1.2}.top small{opacity:.85;font-size:13px}
.sections{display:flex;gap:6px;padding:10px 16px 0;max-width:560px;margin:0 auto}
.sections button{flex:1;padding:8px 4px;border-radius:14px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);font:700 14px system-ui;display:flex;flex-direction:column;align-items:center;gap:1px}
.sections button span{font-size:20px}.sections button.on{background:var(--main);color:#fff;border-color:var(--main)}
.sections button.off{opacity:.45;border-style:dashed}.sections button small{font:500 10px system-ui}
.sections button.off.on{background:var(--card);color:var(--ink);border-color:var(--line)}
h2{font-size:20px;margin:22px 0 4px}
.tick{display:flex;gap:10px;align-items:flex-start;padding:7px 0;border-bottom:1px solid var(--line)}.tick:last-child{border:0}
.tick input{width:22px;height:22px;flex:none;margin-top:2px;accent-color:var(--main)}.tick input:checked+span{color:var(--muted);text-decoration:line-through}
details.sc summary{cursor:pointer;font-size:18px;list-style:none}details.sc summary::after{content:' ›';color:var(--muted)}details.sc[open] summary::after{content:''}
ul.lines{padding-left:18px;margin:4px 0}ul.lines li{margin:4px 0}
.tabs{display:flex;gap:6px;padding:10px 16px 0}.tabs button{flex:1;padding:9px;border-radius:99px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);font:600 15px system-ui}
.tabs button.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.bar{height:6px;background:var(--line);margin:12px 16px 0;border-radius:9px;overflow:hidden}.bar i{display:block;height:100%;background:var(--accent);transition:width .3s}
main{padding:16px;max-width:560px;margin:0 auto;padding-bottom:120px}
.count{color:var(--muted);font-size:14px;margin:0 0 4px}
h1{font-size:26px;line-height:1.2;margin:0 0 12px}
.spot{font-size:30px;font-weight:800;color:var(--main);margin:4px 0 8px;line-height:1.15}
@media (prefers-color-scheme:dark){.spot{color:var(--soft)}}
.box{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin:12px 0}
.box .k{font:700 12px/1 ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:6px}
.say{border-left:5px solid var(--accent);font-size:19px}.read p{margin:0 0 8px}.read p:last-child{margin:0}
.challenge{background:color-mix(in srgb,var(--soft) 45%,var(--card))}
.small{color:var(--muted);font-size:15px}
.head{font-size:20px;font-weight:700}
.hint{display:none}.hint.show{display:block}
.btn{display:inline-block;border:0;border-radius:99px;padding:12px 18px;font:700 16px system-ui;background:var(--card);color:var(--ink);border:1.5px solid var(--line)}
.nav{position:fixed;left:0;right:0;bottom:0;display:flex;gap:10px;padding:12px 16px calc(12px + env(safe-area-inset-bottom));background:color-mix(in srgb,var(--bg) 92%,transparent);backdrop-filter:blur(6px);border-top:1px solid var(--line)}
.nav button{flex:1;padding:16px;border-radius:16px;border:0;font:800 18px system-ui}
.nav .back{flex:0 0 30%;background:var(--card);color:var(--ink);border:1.5px solid var(--line)}
.nav .next{background:var(--accent);color:var(--on-accent)}
.check{display:flex;align-items:center;gap:10px;font-weight:700;margin-top:6px}.check input{width:26px;height:26px;accent-color:var(--main)}
ul.jobs{padding-left:20px;margin:6px 0}.live{display:inline-block;width:9px;height:9px;border-radius:50%;background:#2fbf71;margin-right:6px;animation:p 1.6s infinite}
@keyframes p{50%{opacity:.3}}
</style></head><body>${body}<script>${script}</script></body></html>`;
}

function topBar(theme, line1, line2) {
  return `<div class="top" aria-hidden="false">${theme.icon}<div><b>${esc(line1)}</b><small>${esc(line2)}</small></div></div>`;
}

// The Play Kit tab: setup, scenarios to start, lines for both players and quick games.
function kitSection(kit, name) {
  const P = play(kit);
  const ctx = { name, child: name, place: kit.placeName(possessive(name)) };
  const f = (t) => esc(fill(t, ctx));
  const setup = [kit.guide.setup[0], 'Hang the welcome poster, then tape up the menu and specials.', ...kit.guide.setup.slice(1)];
  const checks = (key, items) => items.map((x, i) => `<label class="tick"><input type="checkbox" data-key="${key}:${i}"><span>${f(x)}</span></label>`).join('');
  let h = `<h1>${f(ctx.place)}</h1><p class="small">${f(kit.tagline)}. Ideas for playing with the printed kit, any day.</p>
  <div class="box"><div class="k">Set up the shop</div>${checks('kit-setup', setup)}</div>`;
  if (P) {
    h += `<h2>Pretend-play scenarios</h2><p class="small">Pick one, or let the phone choose.</p>
    <button class="btn" id="surprise">🎲 Surprise me</button><div id="picked"></div>
    ${P.scenarios.map((sc, i) => `<details class="box sc" data-sc="${i}"><summary><b>${f(sc.title)}</b></summary>
      <p>${f(sc.setup)}</p><div class="box say"><div class="k">Say this</div>“${f(sc.say)}”</div><p class="small"><b>Twist:</b> ${f(sc.twist)}</p></details>`).join('')}
    <h2>Things to say</h2>
    <div class="box"><div class="k">${esc(name)} can say</div><ul class="lines">${P.lines.kid.map((x) => `<li>“${f(x)}”</li>`).join('')}</ul></div>
    <div class="box"><div class="k">You can say</div><ul class="lines">${P.lines.grownup.map((x) => `<li>“${f(x)}”</li>`).join('')}</ul></div>
    <h2>Quick games</h2>
    ${P.games.map((g) => `<div class="box"><div class="head">${f(g.title)}</div><p>${f(g.how)}</p><p class="small">Uses: ${f(g.uses)}</p></div>`).join('')}`;
  }
  h += `<h2>More ideas from the guide</h2>${kit.guide.play.map(([t, x]) => `<div class="box"><div class="head">${f(t)}</div><p>${f(x)}</p></div>`).join('')}`;
  return h;
}

// The Party tab: a checklist that remembers what's done on this phone.
function partySection(theme, name, has) {
  const groups = checklist(theme, { name, hunt: has.hunt, kit: has.kit });
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  return `<h1>${esc(possessive(name))} party plan</h1><p class="small">Tick things off as you go. Your ticks are saved on this phone.</p>
  <div class="box"><div class="k">Done</div><div class="head"><span id="done">0</span> of ${total}</div><div class="bar" style="margin:8px 0 0"><i id="pbar"></i></div></div>
  ${groups.map((g, gi) => `<h2>${esc(g.when)}</h2><div class="box">${g.items.map((x, i) => `<label class="tick"><input type="checkbox" data-key="party:${gi}:${i}" data-party><span>${esc(x)}</span></label>`).join('')}</div>`).join('')}`;
}

const SECTIONS = [['hunt', '🗺️', 'Hunt'], ['kit', '🎭', 'Play Kit'], ['party', '🎉', 'Party']];

// The host's page. `stateUrl` saves the hunt's progress so the sidekick can follow along.
// `items` says what the order includes (hunt, kit, party); the other tabs are greyed out.
function hostPage(order, { stateUrl, sidekickUrl, downloads, items = ['hunt'] }) {
  const cfg = order.config;
  const has = { hunt: items.includes('hunt'), kit: items.includes('kit'), party: items.includes('party') };
  const kit = has.kit ? KITS[cfg.kit] || kitForHunt(cfg.theme) : null;
  if (!kit) has.kit = false;
  const theme = THEMES[cfg.theme] || THEMES[kit?.hunt];
  const name = cfg.childName || 'our birthday star';
  const p = has.hunt ? plan(order, sidekickUrl) : null;
  const steps = p ? p.steps.map(({ cue, ...st }) => st) : [];
  if (downloads && steps.length) steps[0].download = downloads;
  const first = SECTIONS.find(([k]) => has[k])[0];
  const what = has.hunt ? theme.name : has.kit ? `${kit.name} play kit` : 'party';
  const body = `${topBar(theme, `${possessive(name)} ${what}`, `Host Mode · ${has.hunt ? 'keep this screen secret!' : 'your party helper'}`)}
<div class="sections">${SECTIONS.map(([k, icon, label]) => `<button data-sec="${k}" data-label="${label}"${has[k] ? '' : ' class="off" aria-disabled="true"'}><span>${icon}</span>${label}${has[k] ? '' : '<small>Not in this order</small>'}</button>`).join('')}</div>
<section id="sec-hunt" hidden>
  <div class="tabs"><button data-phase="setup">1 · Hide</button><button data-phase="play">2 · Play</button></div>
  <div class="bar"><i id="bar"></i></div>
  <main id="main"></main>
  <div class="nav"><button class="back" id="back">Back</button><button class="next" id="next">Next</button></div>
</section>
<section id="sec-kit" hidden><main>${kit ? kitSection(kit, name) : ''}</main></section>
<section id="sec-party" hidden><main>${has.party ? partySection(theme, name, has) : ''}</main></section>
<section id="sec-off" hidden><main><h1 id="off-title"></h1><p>This part isn’t included in this order. Everything that is lives in the other tabs.</p></main></section>`;
  const script = `
const STEPS=${JSON.stringify(steps).replace(/</g, '\\u003c')},STATE=${JSON.stringify(stateUrl)},KEY='host:'+STATE,FIRST=${JSON.stringify(first)};
const $=(id)=>document.getElementById(id);
const t=(s)=>String(s).replace(/[&<>"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const get=(k)=>{try{return localStorage.getItem(k)}catch(e){return null}},put=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
// Tabs
function show(sec){const btn=document.querySelector('[data-sec="'+sec+'"]');const off=btn.classList.contains('off');
  document.querySelectorAll('section').forEach(s=>s.hidden=true);$(off?'sec-off':'sec-'+sec).hidden=false;
  if(off)$('off-title').textContent=btn.dataset.label;
  document.querySelectorAll('.sections button').forEach(b=>b.classList.toggle('on',b===btn));
  if(!off)put(KEY+':tab',sec);window.scrollTo(0,0)}
document.querySelectorAll('.sections button').forEach(b=>b.onclick=()=>show(b.dataset.sec));
// Checklists
function partyCount(){const all=[...document.querySelectorAll('[data-party]')],n=all.filter(x=>x.checked).length;if($('done')){$('done').textContent=n;$('pbar').style.width=(100*n/all.length)+'%'}}
document.querySelectorAll('input[data-key]').forEach(c=>{c.checked=get(KEY+':'+c.dataset.key)==='1';c.onchange=()=>{put(KEY+':'+c.dataset.key,c.checked?'1':'0');partyCount()}});partyCount();
// Play kit: surprise me
const sur=$('surprise');if(sur)sur.onclick=()=>{const all=[...document.querySelectorAll('.sc')];all.forEach(d=>d.open=false);const d=all[Math.floor(Math.random()*all.length)];d.open=true;d.scrollIntoView({behavior:'smooth',block:'center'})};
// Hunt
let i=0;try{i=Math.min(STEPS.length-1,+get(KEY)||0)}catch(e){}
const box=(k,html,cls='')=>'<div class="box '+cls+'"><div class="k">'+k+'</div>'+html+'</div>';
let saveTimer;
function save(){put(KEY,i);clearTimeout(saveTimer);saveTimer=setTimeout(()=>fetch(STATE,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({step:i})}).catch(()=>{}),300)}
function draw(){
  const s=STEPS[i],ph=STEPS.filter(x=>x.phase===s.phase),n=ph.indexOf(s)+1;let h='';
  h+='<p class="count">'+(s.phase==='setup'?'Hiding':'The hunt')+' · '+n+' of '+ph.length+'</p><h1>'+t(s.title)+'</h1>';
  if(s.spot)h+='<div class="spot">'+t(s.spot)+'</div>';
  if(s.small)h+='<p class="small">'+t(s.small)+'</p>';
  if(s.challenge)h+=box('Quick challenge first','<div class="head">'+t(s.challenge)+'</div>','challenge');
  if(s.say)h+=box('Say this','“'+t(s.say)+'”','say');
  if(s.read)h+=box(s.hints?'Read the clue':'Read aloud',s.read.map(p=>'<p>'+t(p)+'</p>').join(''),'read');
  (s.body||[]).forEach(p=>h+='<p>'+t(p)+'</p>');
  if(s.download)h+='<p><a class="btn" href="'+t(s.download)+'" target="_blank">Open the printable PDF</a></p>';
  if(s.hints)h+=box('The kids are heading to','<div class="head">'+t(s.heading)+'</div>')+'<button class="btn" id="stuck">They’re stuck 🤔</button>'+s.hints.map((x,k)=>'<div class="box hint" data-h="'+k+'"><div class="k">Hint '+(k+1)+'</div>'+t(x)+'</div>').join('');
  if(s.share)h+='<button class="btn" id="share">Send the sidekick link</button> <span class="small" id="shared"></span>';
  if(s.check){const done=get(KEY+':'+i)==='1';h+='<label class="check"><input type="checkbox" id="chk"'+(done?' checked':'')+'> Hidden!</label>'}
  $('main').innerHTML=h;
  $('bar').style.width=(100*(i+1)/STEPS.length)+'%';
  document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.phase===s.phase));
  $('back').disabled=i===0;$('next').textContent=i===STEPS.length-1?'Done 🎉':s.check?'Hidden, next':'Next';
  let shown=0;const st=$('stuck');if(st)st.onclick=()=>{const el=document.querySelector('[data-h="'+shown+'"]');if(el){el.classList.add('show');shown++}if(shown>=s.hints.length)st.style.display='none';else st.textContent='Still stuck?'};
  const sh=$('share');if(sh)sh.onclick=async()=>{const url=s.share;try{if(navigator.share){await navigator.share({title:'Be my hunt sidekick',text:'Your secret role for the scavenger hunt:',url});return}await navigator.clipboard.writeText(url);$('shared').textContent='Link copied!'}catch(e){$('shared').textContent=url}};
  const c=$('chk');if(c)c.onchange=()=>put(KEY+':'+i,c.checked?'1':'0');
  window.scrollTo(0,0);save();
}
if(STEPS.length){
  $('next').onclick=()=>{const c=$('chk');if(c&&!c.checked){c.checked=true;c.onchange()}if(i<STEPS.length-1){i++;draw()}};
  $('back').onclick=()=>{if(i>0){i--;draw()}};
  document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{i=STEPS.findIndex(s=>s.phase===b.dataset.phase);draw()});
  draw();
  fetch(STATE).then(r=>r.json()).then(d=>{if(Number.isInteger(d.step)&&d.step>i&&d.step<STEPS.length){i=d.step;draw()}}).catch(()=>{});
}
const saved=get(KEY+':tab');show(saved&&document.querySelector('[data-sec="'+saved+'"]:not(.off)')?saved:FIRST);`;
  return shell(theme, `${possessive(name)} ${has.hunt ? 'hunt' : 'party'} · Host Mode`, body, script);
}

// The sidekick's page: their jobs, plus a live cue that follows the host's screen.
function sidekickPage(order, { stateUrl }) {
  const p = plan(order, null);
  const cues = p.steps.map((s) => ({ ...s.cue, where: s.hints ? s.heading : null }));
  const body = `${topBar(p.theme, `${p.name}’s ${p.theme.name}`, 'Sidekick · your secret role')}
<main>
  <div class="box"><div class="k">Your jobs today</div><ul class="jobs">${p.sidekick.jobs.map((j) => `<li>${esc(j)}</li>`).join('')}</ul>
  <p class="small" style="margin:6px 0 0">Keep this screen open. It follows the host’s screen and tells you what to do next.</p></div>
  <p class="count"><span class="live"></span>Live with the host</p>
  <div id="cue"></div>
</main>`;
  const script = `
const CUES=${JSON.stringify(cues).replace(/</g, '\\u003c')},STATE=${JSON.stringify(stateUrl)};
const t=(s)=>String(s).replace(/[&<>"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let last=-1;
function draw(i){const c=CUES[i];if(!c||i===last)return;last=i;let h='<h1>'+t(c.title)+'</h1>';
  if(c.where)h+='<p class="small">The kids are heading to '+t(c.where)+'.</p>';
  if(c.say)h+='<div class="box say"><div class="k">Say this</div>“'+t(c.say)+'”</div>';
  if(c.body)h+='<p>'+t(c.body)+'</p>';
  document.getElementById('cue').innerHTML=h;if(navigator.vibrate&&last>0)navigator.vibrate(120)}
function poll(){fetch(STATE).then(r=>r.json()).then(d=>draw(Number.isInteger(d.step)?d.step:0)).catch(()=>{})}
draw(0);poll();setInterval(poll,3000);`;
  return shell(p.theme, `${p.name}’s hunt · Sidekick`, body, script);
}

module.exports = { plan, hostPage, sidekickPage };
