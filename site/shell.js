import { ERAS, NOTE, SOURCES } from './eras.js';
import { build, play, LENGTH } from './modem.js';

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
  mail: '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" fill="#fff" stroke="#556"/><path d="m3 6 9 7 9-7" fill="none" stroke="#556"/><circle cx="18" cy="17" r="3.5" fill="#d8361b"/></svg>',
  print: '<svg viewBox="0 0 24 24"><rect x="6" y="3" width="12" height="7" fill="#fff" stroke="#556"/><rect x="3" y="10" width="18" height="8" fill="#b8b8b0" stroke="#556"/><rect x="6" y="15" width="12" height="6" fill="#fff" stroke="#556"/><circle cx="18" cy="13" r="1" fill="#2f9a1f"/></svg>',
  throb: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="11" fill="#1c5fbf"/><path d="M7 13c5-2 6 3 10 2s4-4 7-3M9 21c3-1 5 1 8 0s5-3 7-2" stroke="#7fd36b" stroke-width="2.4" fill="none"/><ellipse cx="16" cy="16" rx="15" ry="5" fill="none" stroke="#f2c230" stroke-width="1.6" transform="rotate(-20 16 16)"/></svg>',
  flag: '<svg viewBox="0 0 18 16"><path d="M2 3c2-1 4 0 6 1v5C6 8 4 7 2 8z" fill="#e8402a"/><path d="M9 4c2 1 4 1 6 0v5c-2 1-4 1-6 0z" fill="#4caf3a"/><path d="M2 9c2-1 4 0 6 1v5c-2-1-4-2-6-1z" fill="#2b62d6"/><path d="M9 10c2 1 4 1 6 0v5c-2 1-4 1-6 0z" fill="#f2c230"/></svg>',
  dun: '<svg viewBox="0 0 32 32"><rect x="2" y="6" width="12" height="9" fill="#c0c0c0" stroke="#000"/><rect x="4" y="8" width="8" height="5" fill="#008080"/><rect x="18" y="6" width="12" height="9" fill="#c0c0c0" stroke="#000"/><rect x="20" y="8" width="8" height="5" fill="#008080"/><path d="M8 15v6h16v-6" fill="none" stroke="#000"/><rect x="12" y="22" width="8" height="6" rx="1" fill="#efe8b0" stroke="#000"/></svg>',
  speaker: '<svg viewBox="0 0 16 16"><path d="M2 6h3l4-3v10l-4-3H2z" fill="#ffd23f" stroke="#555"/></svg>',
  images: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" fill="#fff" stroke="#556"/><path d="M4 18l5-6 4 4 3-3 4 5z" fill="#3a9a3a"/><circle cx="16" cy="9" r="2" fill="#f2c230"/></svg>',
  open: '<svg viewBox="0 0 24 24"><path d="M2 7h7l2 2h11v11H2z" fill="#f2d36b" stroke="#8a6a1a"/></svg>',
  find: '<svg viewBox="0 0 24 24"><circle cx="8" cy="14" r="5" fill="#9cc8f0" stroke="#335" stroke-width="2"/><circle cx="16" cy="14" r="5" fill="#9cc8f0" stroke="#335" stroke-width="2"/><path d="M12 13h0" stroke="#335" stroke-width="3"/></svg>',
  stopsign: '<svg viewBox="0 0 24 24"><path d="M8 2h8l6 6v8l-6 6H8l-6-6V8z" fill="#d8361b" stroke="#801"/><text x="12" y="15" font-size="6" font-family="Arial" font-weight="bold" fill="#fff" text-anchor="middle">STOP</text></svg>',
  key: '<svg viewBox="0 0 24 16"><circle cx="6" cy="8" r="4" fill="none" stroke="#606060" stroke-width="2"/><path d="M10 8h6m3 0h3M16 8v3M21 8v3" stroke="#606060" stroke-width="2"/></svg>',
  comet: '<svg viewBox="0 0 36 36"><g class="meteor"><path d="M4 4l16 16" stroke="#9cf" stroke-width="2" opacity=".6"/><circle cx="21" cy="21" r="3" fill="#fff"/></g><circle cx="8" cy="28" r="1" fill="#fff"/><circle cx="28" cy="8" r="1" fill="#fff"/></svg>',
  rss: '<svg viewBox="0 0 16 16"><rect width="16" height="16" rx="3" fill="#f78422"/><circle cx="4.5" cy="11.5" r="1.8" fill="#fff"/><path d="M3 7a6 6 0 0 1 6 6M3 3a10 10 0 0 1 10 10" fill="none" stroke="#fff" stroke-width="2"/></svg>',
  ffx: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#2a6fc9"/><path d="M3 9c2-3 6-4 10-2-2 0-3 2-2 4-3 1-6 0-8-2z" fill="#f2862e"/></svg>',
  ffBack: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#5f9e2f" stroke="#3d6d1b"/><circle cx="16" cy="11" r="10" fill="#9fd35f" opacity=".5"/><path d="M18 8 10 16l8 8v-5h6v-6h-6z" fill="#fff"/></svg>',
  ffFwd: '<svg viewBox="0 0 26 26"><circle cx="13" cy="13" r="11" fill="#b8b8b8" stroke="#8a8a8a"/><path d="M11 7l6 6-6 6v-4H7v-4h4z" fill="#fff"/></svg>',
  ffReload: '<svg viewBox="0 0 26 26"><path d="M19 9a7 7 0 1 0 1 6" fill="none" stroke="#3c8b21" stroke-width="3"/><path d="m21 4-.4 7-6.4-2.6z" fill="#3c8b21"/></svg>',
  ffStop: '<svg viewBox="0 0 26 26"><circle cx="13" cy="13" r="10" fill="#c0c0c0"/><path d="m9 9 8 8m0-8-8 8" stroke="#fff" stroke-width="2.6"/></svg>',
  ffHome: '<svg viewBox="0 0 26 26"><path d="M13 4 3 13h3v9h5v-6h4v6h5v-9h3z" fill="#e8c35a" stroke="#8a6a1a"/><path d="M13 4 3 13h3l7-6 7 6h3z" fill="#c8402a"/></svg>',
  ffGo: '<svg viewBox="0 0 26 26"><path d="M8 6l10 7-10 7z" fill="#4c9f2a" stroke="#2f6d17"/></svg>',
  modem: '<svg viewBox="0 0 16 16"><rect x="1" y="3" width="6" height="5" fill="#c0c0c0" stroke="#000"/><rect x="9" y="8" width="6" height="5" fill="#c0c0c0" stroke="#000"/><rect x="2" y="4" width="4" height="2" fill="#0f0"/><rect x="10" y="9" width="4" height="2" fill="#0f0"/></svg>',
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
    <div class="sb"><span>${I.page}<b class="txt">Done</b></span><span class="zone">${I.globe}Internet</span></div>`,
  ie5: e => `
    <div class="tb98">${I.page}<span class="t">${e.title}</span><span class="wb"><i class="w98">_</i><i class="w98">&#9633;</i><i class="w98">&times;</i></span></div>
    <div class="menu"><span>File</span><span>Edit</span><span>View</span><span>Favorites</span><span>Tools</span><span>Help</span></div>
    <div class="bar">
      <span class="b">${I.back}Back</span><span class="b">${I.fwd}Forward</span><span class="b">${I.stop}Stop</span><span class="b">${I.refresh}Refresh</span><span class="b">${I.home}Home</span><i class="sep"></i>
      <span class="b">${I.search}Search</span><span class="b">${I.fav}Favorites</span><span class="b">${I.hist}History</span><i class="sep"></i><span class="b">${I.mail}Mail</span><span class="b">${I.print}Print</span>
      <span class="throb">${I.throb}</span>
    </div>
    <div class="addr"><span>Address</span><div class="fld2 sunk">${I.page}${e.url}</div><span>Links</span></div>
    <div class="view sunk"><div class="spot"></div></div>
    <div class="sb"><span class="msg thin-sunk">${I.page}<b class="txt">Done</b></span><span class="prog thin-sunk"><i></i></span><span class="zone thin-sunk">${I.globe}Internet</span></div>`,
  ff1: e => `
    <div class="tb">${I.ffx}<span class="t">${e.title}</span><span class="wb"><i class="min"></i><i class="max"></i><i class="x"></i></span></div>
    <div class="menu"><span>File</span><span>Edit</span><span>View</span><span>Go</span><span>Bookmarks</span><span>Tools</span><span>Help</span></div>
    <div class="navb"><span class="b">${I.ffBack}</span><span class="b">${I.ffFwd}</span><span class="b">${I.ffReload}</span><span class="b">${I.ffStop}</span><span class="b">${I.ffHome}</span><div class="url">${I.ffx}${e.url}</div>${I.ffGo}<div class="srch">${I.search}Search</div></div>
    <div class="view"><div class="spot"></div></div>
    <div class="sb"><span><b class="txt">Done</b></span><span class="feed" title="This page has an RSS feed">${I.rss}</span></div>`,
  nn3: e => `
    <div class="tb98 tb95">${I.page}<span class="t">${e.title}</span><span class="wb"><i class="w98">_</i><i class="w98">&#9633;</i><i class="w98">&times;</i></span></div>
    <div class="menu"><span>File</span><span>Edit</span><span>View</span><span>Go</span><span>Bookmarks</span><span>Options</span><span>Directory</span><span>Window</span><span>Help</span></div>
    <div class="bar">
      <span class="b">${I.back}Back</span><span class="b">${I.fwd}Forward</span><span class="b">${I.home}Home</span><span class="b">${I.refresh}Reload</span><span class="b">${I.images}Images</span><span class="b">${I.open}Open</span><span class="b">${I.print}Print</span><span class="b">${I.find}Find</span><span class="b">${I.stopsign}Stop</span>
      <span class="throb">${I.comet}</span>
    </div>
    <div class="addr"><span>Location:</span><div class="fld2 sunk">${e.url}</div></div>
    <div class="dirs"><span class="w98">What's New?</span><span class="w98">What's Cool?</span><span class="w98">Destinations</span><span class="w98">Net Search</span><span class="w98">People</span><span class="w98">Software</span></div>
    <div class="view sunk"><div class="spot"></div></div>
    <div class="sb"><span class="key thin-sunk">${I.key}</span><span class="msg thin-sunk"><b class="txt">Document: Done</b></span><span class="prog thin-sunk"><i></i></span></div>`,
  ff2: e => `
    <div class="tbv">${I.ffx}<span class="t">${e.title}</span><span class="caps"><i>&#8211;</i><i>&#9633;</i><i class="x">&#10005;</i></span></div>
    <div class="ff2">
      <div class="menu"><span>File</span><span>Edit</span><span>View</span><span>History</span><span>Bookmarks</span><span>Tools</span><span>Help</span></div>
      <div class="navb"><span class="back">${I.ffBack}</span>${I.ffFwd}${I.ffReload}${I.ffStop}${I.ffHome}<div class="url">${I.ffx}${e.url}<span class="dd">&#9660;</span></div>${I.ffGo}<div class="srch">${I.search}Search</div></div>
      <div class="tabs2"><div class="tab2">${I.ffx}<span>${e.tab}</span><span class="x">&#10005;</span></div></div>
      <div class="view"><div class="spot"></div></div>
      <div class="sbar sb"><b class="txt">Done</b></div>
    </div>`,
  now: e => `
    <div class="tabs"><span class="dots"><i></i><i></i><i></i></span><div class="tab"><i class="fav"></i><span>${e.title}</span><span class="x">&times;</span></div></div>
    <div class="bar">${I.arrowL}${I.arrowR}${I.reload}<div class="omni">${I.lock}${e.url}</div>${I.star}</div>
    <div class="view"><div class="spot"></div></div>`,
};

const ICONS98 = `<div class="icons98" aria-hidden="true">
  <span><svg viewBox="0 0 32 32"><rect x="4" y="4" width="24" height="17" fill="#c0c0c0" stroke="#000"/><rect x="7" y="7" width="18" height="11" fill="#008080"/><rect x="10" y="22" width="12" height="3" fill="#c0c0c0" stroke="#000"/><rect x="4" y="25" width="24" height="4" fill="#c0c0c0" stroke="#000"/></svg>My Computer</span>
  <span><svg viewBox="0 0 32 32"><path d="M8 9h16l-2 20H10z" fill="#e8e8e8" stroke="#000"/><path d="M6 7h20v3H6z" fill="#c0c0c0" stroke="#000"/><path d="M12 13v13M16 13v13M20 13v13" stroke="#808080"/></svg>Recycle Bin</span>
  <span>${'<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="11" fill="#1c5fbf"/><path d="M7 13c5-2 6 3 10 2s4-4 7-3M9 21c3-1 5 1 8 0s5-3 7-2" stroke="#7fd36b" stroke-width="2.4" fill="none"/></svg>'}The Internet</span>
</div>`;
const clock = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const TASK = {
  vista: e => `<div class="task-vista"><span class="orb">${I.flag}</span><span class="job">${I.ffx}${e.tab}</span><span class="tray" id="clock">${clock()}</span></div>`,
  win95: e => `<div class="task-98"><span class="start w98">${I.flag}Start</span><span class="job thin-sunk">${I.page}${e.title}</span><span class="tray thin-sunk">${I.speaker}<span id="clock">${clock()}</span></span></div>`,
  win98: e => `<div class="task-98"><span class="start w98">${I.flag}Start</span><span class="job thin-sunk">${I.page}${e.title}</span><span class="tray thin-sunk"><span id="modemicon">${dialed() ? I.modem : ''}</span>${I.speaker}<span id="clock">${clock()}</span></span></div>`,
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
  $('#nowsay').textContent = `${e.year}: ${e.browser.toLowerCase()}, ${e.conn.toLowerCase()}`;
  desk(e);
  xray(e);
}

function desk(e) {
  const d = $('#desk');
  d.dataset.os = e.os;
  const win = $('#win');
  win.className = `win ${{ ff1: 'ie6 ff1', nn3: 'ie5 w98 nn3', ie5: 'ie5 w98', ie6: 'ie6', ff2: 'aero', now: 'chrome-now' }[e.chrome]}`;
  win.innerHTML = CHROME[e.chrome](e);
  $('.popup')?.remove();
  hangup98?.();
  frame = document.createElement('iframe');
  const src = `eras/${e.year}/index.html`;
  // 1999 starts offline: the page only loads once Dial-Up Networking has connected
  if (e.dialup && !dialed()) dun(() => (frame.src = src));
  else frame.src = src;
  frame.title = `Halcyon Airways homepage, ${e.year}`;
  frame.addEventListener('load', () => {
    frame.contentWindow.postMessage({ sound }, location.origin);
    weigh(frame);
  });
  win.querySelector('.view').append(frame);
  $('#task').innerHTML = TASK[e.os]?.(e) ?? '';
  $('.icons98')?.remove();
  if (e.os === 'win98' || e.os === 'win95') $('.wall').insertAdjacentHTML('afterbegin', ICONS98);
  d.classList.remove('desk-in');
  void d.offsetWidth;
  d.classList.add('desk-in');
}

/* ---------- Dial-Up Networking ---------- */

let hangup98 = null, dialGain = null;
const dialed = () => { try { return !!sessionStorage.getItem('halcyon.dialed'); } catch { return false; } };

function dun(done) {
  body.classList.add('dialing98');
  const box = document.createElement('div');
  box.className = 'dun w98';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-label', 'Connect To');
  box.innerHTML = `<div class="tb98">${I.modem}<span class="t">Connect To</span><span class="wb"><i class="w98">?</i><i class="w98">&times;</i></span></div>
    <div class="body">
      <div class="head">${I.dun}<span>Halcyon Online</span></div>
      <div class="dr"><span>User name:</span><span class="fv sunk">guest</span></div>
      <div class="dr"><span>Password:</span><span class="fv sunk">&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;</span></div>
      <div class="chk"><i class="sunk">&#10003;</i>Save password</div>
      <div class="dr"><span>Phone number:</span><span class="fv sunk">555-1999</span></div>
      <div class="dr"><span>Dialing from:</span><span class="fv sunk">New Location</span></div>
      <div class="btns"><button type="button" class="w98 c">Connect</button><button type="button" class="w98 o">Work Offline</button></div>
    </div>`;
  $('.wall').append(box);
  const timers = [];
  let snd = null;
  const stop = () => {
    timers.forEach(clearTimeout);
    try { snd?.src.stop(); } catch { /* already over */ }
    box.remove();
    body.classList.remove('dialing98');
    hangup98 = dialGain = null;
  };
  const finish = () => {
    stop();
    done();
  };
  hangup98 = stop;
  box.querySelector('.o').addEventListener('click', finish);
  box.querySelector('.c').addEventListener('click', () => {
    wake();
    snd = play(ac, build(ac.sampleRate), !sound);
    dialGain = snd.gain;
    const b = box.querySelector('.body');
    b.innerHTML = `<div class="head">${I.dun}<span>Connecting to Halcyon Online</span></div><div class="status"><b>Status:</b><span class="st">Dialing...</span></div><div class="btns"><button type="button" class="w98 x">Cancel</button></div>`;
    // Cancel hangs up and puts the Connect form back, like the real dialog
    b.querySelector('.x').addEventListener('click', () => {
      stop();
      dun(done);
    });
    b.querySelector('.x').focus();
    const st = t => (b.querySelector('.st').textContent = t);
    timers.push(setTimeout(() => st('Verifying user name and password...'), 3400));
    timers.push(setTimeout(() => st('Logging on to network...'), 7350));
    timers.push(setTimeout(() => st('Connected at 53,333 bps.'), LENGTH * 1000));
    timers.push(setTimeout(() => {
      try { sessionStorage.setItem('halcyon.dialed', '1'); } catch { /* fine */ }
      const m = $('#modemicon');
      if (m) m.innerHTML = I.modem;
      finish();
    }, LENGTH * 1000 + 900));
  });
  box.querySelector('.c').focus();
}

/* ---------- messages from the era pages: status bar text, progress, popups ---------- */

addEventListener('message', ev => {
  if (ev.origin !== location.origin || !ev.data || typeof ev.data !== 'object') return;
  const { status, progress, popup, closePopup } = ev.data;
  if (closePopup) $(".popup")?.remove();
  if (typeof status === 'string') {
    const t = $('#win .sb .txt');
    if (t) t.textContent = status;
  }
  if (typeof progress === 'number') $('#win .sb .prog')?.style.setProperty('--p', `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%`);
  if (popup) openPopup(popup);
});

function openPopup({ src, title = '', w = 420, h = 360 }) {
  const url = new URL(src, frame?.contentWindow?.location.href ?? location.href);
  // only our own era pages, never an arbitrary URL handed over in a message
  if (url.origin !== location.origin || !url.pathname.startsWith(new URL('eras/', location.href).pathname)) return;
  $('.popup')?.remove();
  const p = document.createElement('div');
  p.className = 'popup w98';
  const box = $('#win').getBoundingClientRect(), wall = $('.wall').getBoundingClientRect();
  Object.assign(p.style, { width: `${w}px`, height: `${h}px`, left: `${box.left - wall.left + 90}px`, top: `${box.top - wall.top + 70}px` });
  p.innerHTML = `<div class="tb98">${I.page}<span class="t"></span><span class="wb"><i class="w98 x" role="button" tabindex="0" aria-label="Close">&times;</i></span></div>`;
  p.querySelector('.t').textContent = title;
  const f = document.createElement('iframe');
  f.src = url.href;
  f.title = title;
  p.append(f);
  const close = () => p.remove();
  p.querySelector('.x').addEventListener('click', close);
  p.querySelector('.x').addEventListener('keydown', k => k.key === 'Enter' && close());
  $('.wall').append(p);
}

function step(dir) {
  for (let i = cur + dir; i >= 0 && i < ERAS.length; i += dir) if (ERAS[i].built) return go(i);
}

function route() {
  const i = ERAS.findIndex(e => `#${e.year}` === location.hash);
  if (i >= 0 && ERAS[i].built) return go(i, false);
  land();
}

// back to the board: stop whatever the open era is doing, the 2001 music included
function land() {
  hangup98?.();
  $('.popup')?.remove();
  frame?.remove();
  frame = null;
  cur = -1;
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
    if (x.wrap) pre.classList.add('wrap');
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
  if (!f.getAttribute('src')) return;
  try {
    // 1999 is a frameset, so count what every frame inside it loaded too
    const wins = [f.contentWindow, ...Array.from(f.contentWindow.frames)];
    const all = wins.flatMap(w => [...w.performance.getEntriesByType('navigation'), ...w.performance.getEntriesByType('resource')]);
    const bytes = all.reduce((n, r) => n + (r.encodedBodySize || r.decodedBodySize || 0), 0);
    $('#xr-foot').textContent = `This recreation: ${Math.max(1, Math.round(bytes / 1000))} KB over ${all.length} requests, measured in your browser just now.`;
  } catch (err) {
    console.warn('weigh', err);
  }
}

/* ---------- controls ---------- */

$('#prev').addEventListener('click', () => step(-1));
$('#next').addEventListener('click', () => step(1));
$('#all').addEventListener('click', () => {
  // a half-finished dial can't sit behind the board; picking 1999 again starts it over
  if (hangup98) {
    hangup98();
    cur = -1;
  }
  body.classList.add('boards');
});
$('#xr').addEventListener('click', () => {
  const on = body.classList.toggle('xr');
  $('#xr').setAttribute('aria-pressed', on);
  spot(on ? open() : null);
  // the 2026 film is still arriving at iframe load, so measure again whenever someone looks
  if (on && frame) weigh(frame);
});
$('#snd').addEventListener('click', () => {
  sound = !sound;
  if (dialGain) dialGain.value = sound ? 0.5 : 0;
  $('#snd').setAttribute('aria-pressed', sound);
  frame?.contentWindow?.postMessage({ sound }, location.origin);
});

addEventListener('keydown', e => {
  if ($('#pass').open || e.target.closest?.('input, select, textarea')) return;
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

/* ---------- the boarding pass: what this is, for first-time visitors ---------- */

const pass = $('#pass');
let seen = false;
try { seen = !!localStorage.getItem('halcyon.pass'); } catch { /* private mode: they'll see it again, fine */ }
const openPass = () => { seen = true; if (!pass.open) pass.showModal(); };
document.querySelectorAll('[data-pass]').forEach(b => b.addEventListener('click', openPass));
pass.addEventListener('close', () => {
  try { localStorage.setItem('halcyon.pass', '1'); } catch { /* same */ }
});
pass.addEventListener('click', e => { if (e.target === pass) pass.close(); });
if (!seen) setTimeout(() => { if (!seen) openPass(); }, reduce ? 0 : 1100);

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
