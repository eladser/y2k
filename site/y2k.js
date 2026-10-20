import { build, play, spectrogram, PHASES, LENGTH } from './modem.js';

const COUNTER = 'https://abacus.jasoncameron.dev';
const KEY = 'y2k-eladser-dev/visits';
const ISSUE = 'https://api.github.com/repos/eladser/y2k/issues/1';
const CACHE = 'y2k-v1';
const RATE = 5000; // bytes per second, a good night on a 56K line
const MEDIAN = 2164000; // Web Almanac 2025, median mobile home page

const $ = s => document.querySelector(s);
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const local = {
  get: k => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode, fine */ } },
};
const pad = n => String(n).padStart(2, '0');
const rel = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

function ago(d) {
  const s = (new Date(d) - Date.now()) / 1000;
  for (const [u, n] of [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]])
    if (Math.abs(s) >= n) return rel.format(Math.round(s / n), u);
  return 'just now';
}

// the unpatched page isn't Y2K compliant, so every year is 19-something
function date99(d) {
  d = new Date(d);
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/19${pad(d.getFullYear() % 100)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function at56(bytes) {
  const s = bytes / RATE;
  return s < 60 ? `${s.toFixed(1)} s` : `${Math.floor(s / 60)} min ${Math.round(s % 60)} s`;
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function link(href, text) {
  const a = el('a', null, text);
  if (/^https:\/\//.test(href)) a.href = href;
  a.rel = 'nofollow ugc noopener';
  return a;
}

/* ---------- eras ---------- */

function route() {
  const era = location.hash === '#2026' ? '2026' : '1999';
  root.dataset.era = era;
  document.title = era === '2026' ? 'y2k.eladser.dev - the same homepage, 27 years apart' : "Elad's Home Page";
  if (era === '2026') {
    paint($('#spec26'), Infinity, true);
    weigh();
  }
}

addEventListener('hashchange', () => {
  route();
  if (root.dataset.era !== '2026') replay?.();
  if (location.hash === '#2026' || location.hash === '#1999') scrollTo(0, 0);
});

/* ---------- spectrogram ---------- */

let spec, img;

// one picture of the whole handshake at phone-line sample rate, built once
function picture() {
  if (img) return img;
  spec = spectrogram(build(8000), 8000, 256, 96);
  const w = spec.cols.length, h = spec.cols[0].length;
  const max = Math.max(...spec.cols.map(c => Math.max(...c)));
  const stops = [[0, 10, 10, 10], [0.5, 18, 72, 70], [0.8, 78, 205, 196], [1, 236, 255, 252]];
  img = new ImageData(w, h);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const v = Math.min(1, Math.max(0, (spec.cols[x][h - 1 - y] - max + 55) / 55));
      const j = stops.findIndex(s => s[0] >= v);
      const [a, b] = j <= 0 ? [stops[0], stops[0]] : [stops[j - 1], stops[j]];
      const f = b[0] === a[0] ? 0 : (v - a[0]) / (b[0] - a[0]);
      const i = (y * w + x) * 4;
      for (let c = 1; c < 4; c++) img.data[i + c - 1] = a[c] + (b[c] - a[c]) * f;
      img.data[i + 3] = 255;
    }
  }
  return img;
}

function paint(canvas, upto, marks) {
  const im = picture();
  if (canvas.width !== im.width) {
    canvas.width = im.width;
    canvas.height = im.height;
  }
  const g = canvas.getContext('2d');
  g.fillStyle = '#0a0a0a';
  g.fillRect(0, 0, im.width, im.height);
  g.putImageData(im, 0, 0, 0, 0, Math.min(im.width, upto), im.height);
  if (!marks) return;
  g.fillStyle = 'rgba(255,255,255,.18)';
  for (const p of PHASES) g.fillRect(Math.round(p.t / spec.sec), 0, 1, im.height);
}

/* ---------- dialing ---------- */

let line = null;

function dial() {
  const term = $('#term');
  const canvas = $('#spec0');
  $('#connect').disabled = true;
  const ctx = new AudioContext();
  const snd = play(ctx, build(ctx.sampleRate), !$('#spk').checked);
  const t0 = ctx.currentTime;
  const timers = [];
  const say = s => {
    term.textContent += s + '\n';
    term.scrollTop = term.scrollHeight;
  };

  say('\nATZ\nOK\nATDT 555-1999');
  for (const p of PHASES) timers.push(setTimeout(() => say(`; ${p.label}: ${p.note}`), p.t * 1000));
  timers.push(setTimeout(() => say('CONNECT 53333/V90/LAPM/V42BIS'), LENGTH * 1000));
  timers.push(setTimeout(() => hangup(true), LENGTH * 1000 + 800));

  canvas.classList.add('on');
  let raf;
  const draw = () => {
    paint(canvas, (ctx.currentTime - t0) / spec.sec, false);
    raf = requestAnimationFrame(draw);
  };
  picture();
  draw();

  line = {
    snd,
    stop() {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
      try { snd.src.stop(); } catch { /* already ended */ }
      ctx.close();
    },
  };
}

function hangup(load) {
  line?.stop();
  line = null;
  root.classList.remove('dialing');
  local.set('y2k.dialed', '1');
  if (location.search) history.replaceState(null, '', location.pathname + location.hash);
  route();
  if (load && !reduce) load56k();
}

$('#connect').addEventListener('click', dial);
$('#skip').addEventListener('click', () => hangup(false));
$('#spk').addEventListener('change', e => { if (line) line.snd.gain.value = e.target.checked ? 0.5 : 0; });
addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('dialing')) hangup(false); });

/* ---------- the page arriving at 56K ---------- */

function pageBytes(fonts) {
  const all = [...performance.getEntriesByType('navigation'), ...performance.getEntriesByType('resource')];
  return all
    .filter(r => r.name.startsWith(location.origin) && r.initiatorType !== 'fetch' && (fonts || !r.name.includes('/fonts/')))
    .reduce((n, r) => n + (r.encodedBodySize || r.decodedBodySize || 0), 0);
}

function load56k() {
  const page = $('#v99'), bar = $('#status');
  const total = Math.max(pageBytes(false), 20000);
  const rate = Math.max(RATE, total / 12); // nobody waits more than 12 s for a demo
  const t0 = performance.now();
  let got = 0, over = false;

  const done = () => {
    over = true;
    page.style.clipPath = '';
    $('#st-msg').textContent = 'Document: Done.';
    $('#st-kb').textContent = '';
    setTimeout(() => bar.classList.remove('on'), 2000);
  };
  $('#st-stop').onclick = done;
  bar.classList.add('on');

  (function tick() {
    if (over) return;
    // packets show up in lumps, not as a smooth stream
    got = Math.min(total, Math.max(got, ((performance.now() - t0) / 1000) * rate * (0.75 + Math.random() * 0.5)));
    page.style.clipPath = `inset(0 0 ${(1 - got / total) * 100}% 0)`;
    $('#st-msg').textContent = 'Document: Receiving data...';
    $('#st-kb').textContent = `${(got / 1000).toFixed(1)} of ${Math.round(total / 1000)} KB (${((rate / 1000) * (0.85 + Math.random() * 0.3)).toFixed(1)} KB/s)`;
    if (got >= total) return done();
    setTimeout(tick, 80 + Math.random() * 240);
  })();
}

/* ---------- hit counter ---------- */

let mine = null;

function showCount(n) {
  if (n == null) {
    $('#big26').textContent = '------';
    $('#countnote').textContent = "counter's unreachable. in 1999 this was a broken image";
    $('#kick').textContent = 'offline';
    return;
  }
  mine ??= n;
  $('#c99').textContent = String(n).padStart(6, '0');
  const big = $('#big26');
  if (big.textContent !== n.toLocaleString('en-US')) {
    big.textContent = n.toLocaleString('en-US');
    big.classList.remove('tick');
    void big.offsetWidth;
    big.classList.add('tick');
  }
  const more = n - mine;
  $('#countnote').textContent = more > 0 ? `${more} more since you got here` : `you're number ${mine.toLocaleString('en-US')}`;
  $('#kick').textContent = `visitor #${mine.toLocaleString('en-US')} · counting live`;
}

async function counter() {
  try {
    const hit = await fetch(`${COUNTER}/hit/${KEY}`).then(r => r.json());
    showCount(hit.value);
    const es = new EventSource(`${COUNTER}/stream/${KEY}`);
    es.onmessage = e => showCount(JSON.parse(e.data).value);
  } catch (e) {
    console.warn('counter', e);
    showCount(null);
  }
}

/* ---------- guestbook ---------- */

async function guestbook() {
  const list99 = $('#gblist99'), feed = $('#feed26');
  let comments;
  try {
    const get = async url => {
      const r = await fetch(url, { headers: { accept: 'application/vnd.github+json' } });
      if (!r.ok) throw new Error(`github said ${r.status}`);
      return r.json();
    };
    // comments come oldest first, so ask how many there are and read the last two pages
    const last = Math.max(1, Math.ceil((await get(ISSUE)).comments / 30));
    const pages = await Promise.all([last - 1, last].filter(p => p > 0).map(p => get(`${ISSUE}/comments?per_page=30&page=${p}`)));
    comments = pages.flat().slice(-30).reverse();
  } catch (e) {
    console.warn('guestbook', e);
    list99.textContent = 'The guestbook server is down. Please try again later!';
    feed.replaceChildren(el('li', 'empty', "Couldn't reach GitHub. The guestbook comes back when the line does."));
    return;
  }

  if (!comments.length) {
    list99.textContent = 'Nobody has signed yet. Be the first!';
    feed.replaceChildren(el('li', 'empty', 'No entries yet. Be the first since 1999.'));
    return;
  }

  list99.replaceChildren(...comments.map(c => {
    const d = el('div', 'gb99');
    d.append(el('b', null, c.user.login), ' (', link(c.user.html_url, 'homepage'), ')', el('br'), el('i', null, date99(c.created_at)));
    d.append(el('p', null, c.body.trim().slice(0, 500)), el('hr'));
    return d;
  }));

  feed.replaceChildren(...comments.map(c => {
    const li = el('li');
    const who = el('div', 'who');
    const av = el('img');
    av.src = `${c.user.avatar_url}${c.user.avatar_url.includes('?') ? '&' : '?'}s=48`;
    av.alt = '';
    av.width = av.height = 24;
    av.loading = 'lazy';
    who.append(av, link(c.user.html_url, c.user.login), el('time', 'mono', ago(c.created_at)));
    li.append(who, el('p', null, c.body.trim().slice(0, 500)));
    return li;
  }));
}

/* ---------- last updated ---------- */

function stamp() {
  const { sha, built } = root.dataset;
  $('#lastmod').textContent = date99(built || document.lastModified);
  if (!sha) return;
  const b = $('#build26');
  b.replaceChildren(`deployed ${ago(built)} from `, link(`https://github.com/eladser/y2k/commit/${sha}`, sha.slice(0, 7)), ` · ${new Date(built).toISOString().slice(0, 16).replace('T', ' ')} UTC`);
}

/* ---------- page weight ---------- */

function weigh() {
  const nav = performance.getEntriesByType('navigation')[0];
  const rows = [
    ['this page, all of it', pageBytes(true)],
    ['a 1999 rule of thumb', 40000],
    ['median home page, 2025', MEDIAN],
  ];
  const box = $('#weight26');
  box.replaceChildren(...rows.map(([label, b]) => {
    const r = el('div', 'wrow');
    const fill = el('div', 'fill');
    fill.style.width = `${Math.max(0.4, (b / MEDIAN) * 100)}%`;
    const track = el('div', 'track');
    track.append(fill);
    r.append(el('span', 'lbl', label), el('span', 'kb mono', `${Math.round(b / 1000).toLocaleString('en-US')} KB`), el('span', 't mono', at56(b)), track);
    return r;
  }));
  if (nav?.duration)
    box.append(el('p', 'mono note', `times are at 5 KB/s, a good night on 56K. your connection took ${Math.round(nav.duration)} ms for this page.`));
}

/* ---------- work offline ---------- */

async function offline() {
  const box = $('#off26');
  if (!('serviceWorker' in navigator) || !window.caches) {
    box.textContent = "this browser won't run a service worker here (they need https)";
    return;
  }
  const draw = async () => {
    const n = (await (await caches.open(CACHE)).keys()).length;
    const sw = navigator.serviceWorker.controller ? 'active' : 'installing';
    box.textContent = `service worker ${sw} · ${n} files cached · you're ${navigator.onLine ? 'online' : 'offline'}`;
  };
  addEventListener('online', draw);
  addEventListener('offline', draw);
  navigator.serviceWorker.addEventListener('controllerchange', draw);
  try {
    await navigator.serviceWorker.register('sw.js');
    await navigator.serviceWorker.ready;
  } catch (e) {
    console.warn('sw', e);
  }
  draw();
}

/* ---------- the patch ---------- */

const STEPS = [
  ['modem', 'modem', 'US Robotics -> Web Audio'],
  ['counter', 'hit counter', 'cgi-bin -> event stream'],
  ['guestbook', 'guestbook', 'guestbook.pl -> GitHub issue'],
  ['dates', 'dates', '19YY -> ISO 8601'],
  ['lastmod', 'last updated', 'WS_FTP -> GitHub Actions'],
  ['weight', 'page weight', 'LOWSRC -> nobody counts'],
  ['cache', 'work offline', 'IE cache -> service worker'],
];
let patching = false;

async function patch(e) {
  e.preventDefault();
  if (patching) return;
  if (reduce) {
    location.hash = '#2026';
    return;
  }
  patching = true;
  const log = $('#patchlog');
  log.textContent = 'C:\\> Y2KPATCH.EXE\n\n';
  log.classList.add('on');
  for (const [key, name, what] of STEPS) {
    document.querySelector(`[data-patch="${key}"]`)?.classList.add('zap');
    log.textContent += `${(name + ' ').padEnd(14, '.')} ${what.padEnd(29)} ok\n`;
    await sleep(260);
  }
  log.textContent += '\nrestarting in 2026...';
  await sleep(600);
  document.querySelectorAll('.zap').forEach(n => n.classList.remove('zap'));
  log.classList.remove('on');
  root.classList.add('crt');
  location.hash = '#2026';
  scrollTo(0, 0);
  setTimeout(() => root.classList.remove('crt'), 700);
  patching = false;
}

document.querySelectorAll('.patch').forEach(a => a.addEventListener('click', patch));

/* ---------- 2026 modem replay ---------- */

let replay = null;

$('#play26').addEventListener('click', () => {
  replay?.();
  const ctx = new AudioContext();
  const snd = play(ctx, build(ctx.sampleRate), false);
  const t0 = ctx.currentTime;
  const head = $('#head26'), items = [...document.querySelectorAll('#phases26 li')];
  let raf;
  head.classList.add('on');
  const move = () => {
    const t = ctx.currentTime - t0;
    head.style.left = `${Math.min(100, (t / LENGTH) * 100)}%`;
    items.forEach((li, i) => li.classList.toggle('now', t >= PHASES[i].t && (i === PHASES.length - 1 || t < PHASES[i + 1].t)));
    if (t < LENGTH) raf = requestAnimationFrame(move);
    else replay();
  };
  replay = () => {
    cancelAnimationFrame(raf);
    try { snd.src.stop(); } catch { /* ended */ }
    ctx.close();
    head.classList.remove('on');
    items.forEach(li => li.classList.remove('now'));
    replay = null;
  };
  move();
});

$('#phases26').replaceChildren(...PHASES.map(p => {
  const li = el('li');
  li.append(el('span', 't', `${p.t.toFixed(1)}s`), el('b', null, p.label), el('span', 'n', p.note));
  return li;
}));

/* ---------- go ---------- */

const RING = ['https://aerolens.eladser.dev/', 'https://github.com/eladser/mtop', 'https://github.com/eladser/seerlens', 'https://github.com/eladser/AspNetDebugDashboard', 'https://eladser.dev/'];
$('#ringrand').href = RING[Math.floor(Math.random() * RING.length)];
if (reduce) $('marquee')?.stop();

if (!root.classList.contains('dialing')) route();
stamp();
counter();
guestbook();
offline();
