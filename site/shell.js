import { ERAS, NOTE, SOURCES } from './eras.js';

const $ = s => document.querySelector(s);
const body = document.body;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DRUM = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,-/:';
const WIDTH = { tm: 4, fl: 5, br: 20, cn: 11, pg: 7, ld: 7, st: 8 };

/* ---------- the clack ---------- */

let ac = null, noise = null, sound = true, last = 0;

function wake() {
  if (ac) return;
  ac = new AudioContext();
  noise = ac.createBuffer(1, ac.sampleRate * 0.012, ac.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 6;
}
addEventListener('pointerdown', wake, { once: true });
addEventListener('keydown', wake, { once: true });

function clack() {
  if (!sound || !ac) return;
  // a full board flipping is hundreds of flaps; one clack per 22 ms reads as the rattle
  if (ac.currentTime - last < 0.022) return;
  last = ac.currentTime;
  const src = new AudioBufferSourceNode(ac, { buffer: noise, playbackRate: 0.8 + Math.random() * 0.5 });
  const bp = new BiquadFilterNode(ac, { type: 'bandpass', frequency: 1600 + Math.random() * 1600, Q: 1.4 });
  src.connect(bp).connect(new GainNode(ac, { gain: 0.05 + Math.random() * 0.05 })).connect(ac.destination);
  src.start();
}

/* ---------- flaps ---------- */

function field(cls) {
  const s = document.createElement('span');
  s.className = 'fld ' + cls;
  for (let i = 0; i < WIDTH[cls]; i++) {
    const f = document.createElement('span');
    f.className = 'f';
    f.textContent = ' ';
    s.append(f);
  }
  return s;
}

function set(fld, text, delay = 0) {
  const want = text.toUpperCase().padEnd(fld.children.length).slice(0, fld.children.length);
  [...fld.children].forEach((c, i) => {
    const to = want[i] === ' ' ? ' ' : want[i];
    if (c.dataset.to === to) return;
    c.dataset.to = to;
    if (reduce) {
      c.textContent = to;
      return;
    }
    // real boards roll forward through the drum, so show a few letters on the way
    let steps = 2 + Math.floor(Math.random() * 5);
    const tick = () => {
      if (c.dataset.to !== to) return;
      const next = --steps <= 0 ? to : DRUM[(DRUM.indexOf(c.textContent) + 1 + Math.floor(Math.random() * 3)) % DRUM.length].replace(' ', ' ');
      c.textContent = next;
      c.classList.remove('flip');
      void c.offsetWidth;
      c.classList.add('flip');
      clack();
      if (next !== to) setTimeout(tick, 55 + Math.random() * 30);
    };
    setTimeout(tick, delay + i * 16 + Math.random() * 40);
  });
}

const narrow = matchMedia('(max-width: 900px)');
const kb = n => (n >= 1000 ? `${(n / 1000).toFixed(1)} MB` : `${Math.round(n)} KB`);
const secs = s => (s >= 60 ? `${Math.floor(s / 60)}M ${Math.round(s % 60)}S` : s >= 10 ? `${Math.round(s)} S` : `${s.toFixed(s < 1 ? 2 : 1)} S`);

function fields(row) {
  const f = {};
  for (const k of Object.keys(WIDTH)) row.append((f[k] = field(k)));
  return f;
}

function fill(f, e, status, delay = 0) {
  set(f.tm, String(e.year), delay);
  set(f.fl, `HA ${String(e.year).slice(2)}`, delay + 60);
  set(f.br, (narrow.matches && e.short) || e.browser, delay + 110);
  set(f.cn, e.conn, delay + 170);
  set(f.pg, e.page ? kb(e.page) : '--', delay + 220);
  set(f.ld, e.page && e.kbps ? secs(e.page / e.kbps) : '--', delay + 260);
  set(f.st, status ?? (e.built ? 'ON TIME' : 'DELAYED'), delay + 300);
}

const rows = ERAS.map((e, i) => {
  const li = document.createElement('li');
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'row';
  b.disabled = !e.built;
  b.setAttribute('aria-label', `${e.year}, ${e.browser.toLowerCase()}${e.built ? '' : ', not built yet'}`);
  const f = fields(b);
  b.addEventListener('click', () => go(i));
  li.append(b);
  $('#rows').append(li);
  return f;
});
const now = fields($('#nowrow'));

/* ---------- browser chrome ---------- */

const I = {
  back: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="#3aa82b" stroke="#1d6b12"/><circle cx="10" cy="9" r="6" fill="#7bd85f" opacity=".55"/><path d="M13.5 6.5 7.5 12l6 5.5V14H17v-4h-3.5z" fill="#fff"/></svg>',
  fwd: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="#b9b7ad" stroke="#8c8a80"/><path d="M10.5 6.5 16.5 12l-6 5.5V14H7v-4h3.5z" fill="#fff"/></svg>',
  stop: '<svg viewBox="0 0 24 24"><path d="M5 3h10l4 4v14H5z" fill="#fff" stroke="#7a8aa0"/><circle cx="12" cy="13" r="5.5" fill="#d8361b"/><path d="m9.6 10.6 4.8 4.8m0-4.8-4.8 4.8" stroke="#fff" stroke-width="1.6"/></svg>',
  refresh: '<svg viewBox="0 0 24 24"><path d="M5 3h10l4 4v14H5z" fill="#fff" stroke="#7a8aa0"/><path d="M15.5 11a3.8 3.8 0 1 0-1 4" fill="none" stroke="#2f9a1f" stroke-width="2"/><path d="m16.8 8.2-.4 4-3.6-1.6z" fill="#2f9a1f"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="M12 3 2.5 11.5H5V21h5v-6h4v6h5v-9.5h2.5z" fill="#f2c24a" stroke="#9b6b12"/><path d="M12 3 2.5 11.5H5L12 5.5l7 6h2.5z" fill="#d8361b"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="6" fill="#d9ecff" stroke="#3a6ea5" stroke-width="2"/><path d="m14.5 14.5 6 6" stroke="#8a5a1a" stroke-width="3" stroke-linecap="round"/></svg>',
  fav: '<svg viewBox="0 0 24 24"><path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z" fill="#ffd23f" stroke="#c08a00"/></svg>',
  hist: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" fill="#fff" stroke="#3a6ea5" stroke-width="1.6"/><path d="M12 6.5V12l4 2.5" stroke="#1d3f73" stroke-width="1.8" fill="none"/></svg>',
  page: '<svg class="glyph" viewBox="0 0 16 16"><path d="M3 1h7l3 3v11H3z" fill="#fff" stroke="#6d84a8"/><circle cx="8" cy="9" r="3.4" fill="none" stroke="#2f6fd6" stroke-width="1.6"/></svg>',
  globe: '<svg class="glyph" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="#4b9be8" stroke="#1f5fae"/><path d="M4 5c2 0 2 2 4 2s1 3 3 3M9 2.5c-1 1.5 0 2.5 1 3" stroke="#3aa82b" stroke-width="1.6" fill="none"/></svg>',
  arrowL: '<svg viewBox="0 0 24 24"><path d="M19 12H5m6-6-6 6 6 6"/></svg>',
  arrowR: '<svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>',
  reload: '<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
};

const CHROME = {
  ie6: e => `
    <div class="tb">${I.page}<span class="t">${e.title}</span><span class="wb"><i class="min"></i><i class="max"></i><i class="x"></i></span></div>
    <div class="menu"><span>File</span><span>Edit</span><span>View</span><span>Favorites</span><span>Tools</span><span>Help</span></div>
    <div class="tools">
      <span class="b">${I.back}Back</span><span class="b">${I.fwd}</span><i class="sep"></i>
      <span class="b">${I.stop}</span><span class="b">${I.refresh}</span><span class="b">${I.home}</span><i class="sep"></i>
      <span class="b">${I.search}Search</span><span class="b">${I.fav}Favorites</span><span class="b">${I.hist}</span>
    </div>
    <div class="addr"><span>Address</span><div class="fld2">${I.page}${e.url}</div><span class="go"><i></i>Go</span><span>Links &raquo;</span></div>
    <div class="view"><div class="spot"></div></div>
    <div class="sb"><span>${I.page}Done</span><span class="zone">${I.globe}Internet</span></div>`,
  now: e => `
    <div class="tabs"><span class="dots"><i></i><i></i><i></i></span><div class="tab"><i class="fav"></i><span>${e.title}</span><span class="x">&times;</span></div></div>
    <div class="bar">${I.arrowL}${I.arrowR}${I.reload}<div class="omni">${I.lock}${e.url}</div>${I.star}</div>
    <div class="view"><div class="spot"></div></div>`,
};

const clock = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const TASK = {
  xp: e => `<div class="task-xp"><span class="start"><i></i>start</span><span class="job">${I.page}${e.title}</span><span class="tray" id="clock">${clock()}</span></div>`,
};
setInterval(() => { const c = $('#clock'); if (c) c.textContent = clock(); }, 20000);

/* ---------- flying ---------- */

let cur = -1, frame = null;

function go(i, push = true) {
  const e = ERAS[i];
  if (!e?.built) return;
  body.classList.remove('boards');
  body.classList.add('flying');
  if (push && location.hash !== `#${e.year}`) history.pushState(null, '', `#${e.year}`);
  if (cur === i) return;
  cur = i;
  fill(now, e, "BOARDING");
  desk(e);
  xray(e);
}

function desk(e) {
  const d = $('#desk');
  d.dataset.os = e.os;
  const win = $('#win');
  win.className = `win ${e.chrome === 'ie6' ? 'ie6' : 'chrome-now'}`;
  win.innerHTML = CHROME[e.chrome](e);
  frame = document.createElement('iframe');
  frame.src = `eras/${e.year}/index.html`;
  frame.title = `Halcyon Airways homepage, ${e.year}`;
  frame.addEventListener('load', () => {
    frame.contentWindow.postMessage({ sound }, location.origin);
    weigh(frame);
  });
  win.querySelector('.view').append(frame);
  $('#task').innerHTML = TASK[e.os]?.(e) ?? '';
  d.classList.remove('desk-in');
  void d.offsetWidth;
  d.classList.add('desk-in');
}

function step(dir) {
  for (let i = cur + dir; i >= 0 && i < ERAS.length; i += dir) if (ERAS[i].built) return go(i);
}

function route() {
  const i = ERAS.findIndex(e => `#${e.year}` === location.hash);
  if (i >= 0 && ERAS[i].built) return go(i, false);
  body.classList.remove('flying', 'boards');
}

/* ---------- x-ray ---------- */

let lit = null, raf = 0;

function xray(e) {
  $('#xr-title').textContent = `${e.year}: how it was built`;
  $('#xr-stack').textContent = e.stack;
  $('#xr-foot').textContent = '';
  const codeFirst = e.year < 2026;
  $('#xr-list').replaceChildren(...e.xray.map(x => {
    const li = document.createElement('li');
    const d = document.createElement('details');
    const s = document.createElement('summary');
    s.append(x.name);
    if (x.check) {
      const ok = document.createElement('span');
      const yes = (() => { try { return x.check(); } catch { return false; } })();
      ok.className = `ok${yes ? ' yes' : ''}`;
      ok.textContent = yes ? 'works in your browser' : 'not in your browser yet';
      s.append(ok);
    }
    const b = document.createElement('div');
    b.className = 'xr-body';
    const h = t => Object.assign(document.createElement('h3'), { textContent: t });
    const p = t => Object.assign(document.createElement('p'), { textContent: t });
    const pre = document.createElement('pre');
    pre.textContent = x.code;
    b.append(h(codeFirst ? 'Then' : 'Before'), p(x.then));
    if (codeFirst) b.append(pre);
    b.append(h('Now'), p(x.now));
    if (!codeFirst) b.append(pre);
    d.append(s, b);
    li.append(d);
    li.addEventListener('pointerenter', () => spot(x));
    li.addEventListener('pointerleave', () => spot(open()));
    d.addEventListener('toggle', () => {
      if (d.open) $('#xr-list').querySelectorAll('details[open]').forEach(o => o !== d && (o.open = false));
      spot(open());
    });
    li._x = x;
    return li;
  }));
}

const open = () => $('#xr-list details[open]')?.closest('li')._x ?? null;

// a hole cut in a dark overlay over whatever the technique drives, tracked every frame
// because half of these pages are animating
function spot(x) {
  lit = x && body.classList.contains('xr') ? x : null;
  cancelAnimationFrame(raf);
  const el = $('#win .spot');
  if (!el) return;
  if (!lit) return el.classList.remove('on');
  const doc = frame?.contentDocument;
  const hits = doc ? [...doc.querySelectorAll(lit.sel)].filter(n => n.getClientRects().length) : [];
  if (!hits.length) return el.classList.remove('on');
  hits[0].scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  el.dataset.label = lit.name;
  const track = () => {
    const r = hits.map(n => n.getBoundingClientRect());
    const box = { l: Math.min(...r.map(q => q.left)), t: Math.min(...r.map(q => q.top)), r: Math.max(...r.map(q => q.right)), b: Math.max(...r.map(q => q.bottom)) };
    Object.assign(el.style, { left: `${box.l}px`, top: `${box.t}px`, width: `${box.r - box.l}px`, height: `${box.b - box.t}px` });
    el.classList.toggle('low', box.t < 40);
    el.classList.add('on');
    raf = requestAnimationFrame(track);
  };
  track();
}

function weigh(f) {
  try {
    const p = f.contentWindow.performance;
    const all = [...p.getEntriesByType('navigation'), ...p.getEntriesByType('resource')];
    const bytes = all.reduce((n, r) => n + (r.encodedBodySize || r.decodedBodySize || 0), 0);
    $('#xr-foot').textContent = `This recreation: ${Math.max(1, Math.round(bytes / 1000))} KB over ${all.length} requests, measured in your browser just now.`;
  } catch (err) {
    console.warn('weigh', err);
  }
}

/* ---------- controls ---------- */

$('#prev').addEventListener('click', () => step(-1));
$('#next').addEventListener('click', () => step(1));
$('#all').addEventListener('click', () => body.classList.add('boards'));
$('#xr').addEventListener('click', () => {
  const on = body.classList.toggle('xr');
  $('#xr').setAttribute('aria-pressed', on);
  spot(on ? open() : null);
});
$('#snd').addEventListener('click', () => {
  sound = !sound;
  $('#snd').setAttribute('aria-pressed', sound);
  frame?.contentWindow?.postMessage({ sound }, location.origin);
});

addEventListener('keydown', e => {
  if (e.target.closest?.('input, select, textarea')) return;
  if (e.key === 'Escape') {
    if (body.classList.contains('boards') && cur >= 0) body.classList.remove('boards');
    else if (body.classList.contains('xr')) $('#xr').click();
  }
  if (!body.classList.contains('flying') || body.classList.contains('boards')) return;
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'ArrowRight') step(1);
  if (e.key === 'x' || e.key === 'X') $('#xr').click();
});
addEventListener('popstate', route);

/* ---------- boarding ---------- */

{
  const ul = document.createElement('ul');
  for (const [what, who, url] of SOURCES) {
    const li = document.createElement('li');
    const a = Object.assign(document.createElement('a'), { href: url, textContent: who });
    li.append(`${what}: `, a);
    ul.append(li);
  }
  $('#src').append(Object.assign(document.createElement('p'), { textContent: NOTE }), ul);
}

ERAS.forEach((e, i) => fill(rows[i], e, null, reduce ? 0 : 250 + i * 140));
route();
