const $ = s => document.querySelector(s);
const stage = $('#stage');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const RATE = 4250; // bytes per second: dial-up averaged 34 kbps (comScore, 2004)
const TAU = Math.PI * 2;

// Stage.scaleMode = "showAll": fit the 760x440 movie, letterbox the rest
const fit = () => stage.style.setProperty('--s', Math.min(innerWidth / 760, innerHeight / 440));
addEventListener('resize', fit);
fit();

const scene = id => document.querySelectorAll('.scene').forEach(s => s.classList.toggle('on', s.id === id));

let ac = null, master = null, muted = false, hush = false, noise = null;

addEventListener('message', e => {
  if (e.origin === location.origin && typeof e.data?.sound === 'boolean') {
    hush = !e.data.sound;
    volume();
  }
});

function volume() {
  const off = muted || hush;
  $('#eq').classList.toggle('off', off);
  if (master) master.gain.setTargetAtTime(off ? 0 : 0.45, ac.currentTime, 0.05);
}

function audio() {
  ac = new AudioContext();
  master = new GainNode(ac, { gain: 0 });
  master.connect(new DynamicsCompressorNode(ac, { threshold: -14, ratio: 4 })).connect(ac.destination);
  noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  volume();
}

const env = (g, t, peak, a, r) => {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + r);
};
const hz = m => 440 * 2 ** ((m - 69) / 12);

function blip(f = 1760) {
  if (!ac) return;
  const t = ac.currentTime, o = new OscillatorNode(ac, { type: 'square', frequency: f }), g = new GainNode(ac);
  o.frequency.exponentialRampToValueAtTime(f / 2, t + 0.05);
  env(g, t, 0.06, 0.002, 0.05);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + 0.07);
}

function whoosh(t = ac?.currentTime, dur = 1.3) {
  if (!ac) return;
  const s = new AudioBufferSourceNode(ac, { buffer: noise, loop: true });
  const bp = new BiquadFilterNode(ac, { type: 'bandpass', frequency: 300, Q: 2 });
  bp.frequency.exponentialRampToValueAtTime(3200, t + dur * 0.7);
  bp.frequency.exponentialRampToValueAtTime(900, t + dur);
  const g = new GainNode(ac);
  env(g, t, 0.5, dur * 0.6, dur * 0.4);
  s.connect(bp).connect(g).connect(master);
  s.start(t);
  s.stop(t + dur + 0.05);
}

function boom() {
  if (!ac) return;
  const t = ac.currentTime, o = new OscillatorNode(ac, { frequency: 90 }), g = new GainNode(ac);
  o.frequency.exponentialRampToValueAtTime(30, t + 0.8);
  env(g, t, 0.9, 0.005, 0.9);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + 1);
  whoosh(t, 0.6);
}

// four-bar trance loop, Am F C G, scheduled a little ahead
const ROOTS = [57, 53, 60, 55];
const TRIAD = r => [r, r + (r === 57 ? 3 : 4), r + 7];
let beat = 0, next = 0, loop = 0;

function voice(type, f, t, dur, peak, cutoff) {
  const o = new OscillatorNode(ac, { type, frequency: f });
  const lp = new BiquadFilterNode(ac, { type: 'lowpass', frequency: cutoff, Q: 6 });
  const g = new GainNode(ac);
  env(g, t, peak, 0.005, dur);
  o.connect(lp).connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function play16(i, t) {
  const bar = Math.floor(i / 16) % 4, s = i % 16, root = ROOTS[bar], spb = 60 / 128 / 4;
  if (s % 4 === 0) {
    const o = new OscillatorNode(ac, { frequency: 150 }), g = new GainNode(ac);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    env(g, t, 0.9, 0.002, 0.24);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.3);
  }
  if (s % 4 === 2 || s === 15) {
    const n = new AudioBufferSourceNode(ac, { buffer: noise }), hp = new BiquadFilterNode(ac, { type: 'highpass', frequency: 7500 }), g = new GainNode(ac);
    env(g, t, 0.12, 0.001, 0.04);
    n.connect(hp).connect(g).connect(master);
    n.start(t, Math.random());
    n.stop(t + 0.06);
  }
  if (s % 4 === 2) voice('sawtooth', hz(root - 24), t, spb * 1.6, 0.22, 700);
  if (s % 2 === 0) voice('square', hz(TRIAD(root)[(s / 2) % 3] + 12), t, spb * 0.9, 0.035, 2400);
  if (s === 0) for (const n of TRIAD(root)) for (const d of [-7, 7]) {
    const o = new OscillatorNode(ac, { type: 'sawtooth', frequency: hz(n), detune: d });
    const lp = new BiquadFilterNode(ac, { type: 'lowpass', frequency: 1100 }), g = new GainNode(ac);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.022, t + 0.6);
    g.gain.linearRampToValueAtTime(0.0001, t + spb * 16);
    o.connect(lp).connect(g).connect(master);
    o.start(t);
    o.stop(t + spb * 16 + 0.05);
  }
}

function music() {
  if (!ac || loop) return;
  next = ac.currentTime + 0.1;
  loop = setInterval(() => {
    while (next < ac.currentTime + 0.15) {
      play16(beat++, next);
      next += 60 / 128 / 4;
    }
  }, 25);
}

$('#eq').addEventListener('click', () => {
  muted = !muted;
  volume();
});

const anims = [], timers = [];
const A = (el, kf, o) => {
  const a = el.animate(kf, { fill: 'both', easing: 'cubic-bezier(.2,.7,.2,1)', ...o });
  anims.push(a);
  return a;
};
const at = (ms, fn) => timers.push(setTimeout(fn, ms));
const type = (el, text, ms = 55) => [...text].forEach((c, i) => at(i * ms, () => (el.textContent = text.slice(0, i + 1) + (i < text.length - 1 ? '█' : ''))));

/* ---------- 1. enter, 2. preloader ---------- */

$('#go').addEventListener('click', () => {
  audio();
  blip(880);
  reduce ? main() : load();
});

function load() {
  scene('loader');
  const all = [...performance.getEntriesByType('navigation'), ...performance.getEntriesByType('resource')];
  const total = Math.max(24000, all.reduce((n, r) => n + (r.encodedBodySize || r.decodedBodySize || 0), 0));
  const t0 = performance.now();
  const skip = $('#skip');
  let done = false;
  at(3000, () => {
    skip.textContent = 'SKIP (THIS BUTTON DID NOT EXIST) »';
    skip.classList.add('on');
  });
  skip.onclick = () => (done = true);
  (function tick() {
    const got = Math.min(total, ((performance.now() - t0) / 1000) * RATE);
    $('#ld-pct').textContent = `LOADING ${Math.floor((got / total) * 100)}%`;
    $('#ld-bar').style.width = `${(got / total) * 100}%`;
    $('#ld-bytes').textContent = `${(got / 1000).toFixed(1)} OF ${(total / 1000).toFixed(1)} KB · 56K, REAL SPEED`;
    if (got < total && !done) return requestAnimationFrame(tick);
    timers.forEach(clearTimeout);
    intro();
  })();
}

/* ---------- 3. intro ---------- */

const NS = 'http://www.w3.org/2000/svg';
const svg = (tag, attrs = {}) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
};

let runwayRaf = 0;

function runway() {
  const r = $('#runway');
  r.replaceChildren();
  for (let x = -460; x <= 1220; x += 85) r.append(svg('line', { x1: 380, y1: 200, x2: x, y2: 440, opacity: 0.35 }));
  const rails = Array.from({ length: 9 }, () => r.appendChild(svg('line', { x1: 0, x2: 760, y1: 0, y2: 0 })));
  const lights = Array.from({ length: 24 }, () => r.appendChild(svg('circle', { class: 'light', r: 1 })));
  const t0 = performance.now();
  const frame = now => {
    const t = (now - t0) / 1000;
    rails.forEach((l, i) => {
      const p = ((t * 0.5 + i / rails.length) % 1) ** 2;
      const y = 200 + 240 * p;
      l.setAttribute('y1', y);
      l.setAttribute('y2', y);
      l.setAttribute('opacity', p * 0.6);
    });
    lights.forEach((c, i) => {
      const p = ((t * 0.7 + (i % 12) / 12) % 1) ** 2;
      const side = i < 12 ? 70 : 690;
      c.setAttribute('cx', 380 + (side - 380) * p);
      c.setAttribute('cy', 200 + 240 * p);
      c.setAttribute('r', 0.4 + 2.6 * p);
      c.setAttribute('opacity', Math.min(1, p * 3));
    });
    runwayRaf = requestAnimationFrame(frame);
  };
  runwayRaf = requestAnimationFrame(frame);
}

function intro() {
  scene('intro');
  music();
  const skip = $('#skip');
  skip.textContent = 'SKIP INTRO »';
  skip.classList.add('on');
  skip.onclick = () => {
    blip();
    main();
  };

  runway();
  A($('#runway'), [{ opacity: 0 }, { opacity: 1 }], { duration: 700 });
  A($('#hud'), [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }], { duration: 900, delay: 300 });
  A($('.r1'), [{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 9000, iterations: Infinity, easing: 'linear' });
  A($('.r2'), [{ transform: 'rotate(0)' }, { transform: 'rotate(-360deg)' }], { duration: 13000, iterations: Infinity, easing: 'linear' });
  A($('.r3'), [{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 21000, iterations: Infinity, easing: 'linear' });
  $('#read1').textContent = '';
  $('#read2').textContent = '';
  at(600, () => type($('#read1'), 'LAT 32.79N  LON 34.98E', 30));
  at(900, () => type($('#read2'), 'ALT 35000  HDG 270  GS 488KT', 30));

  // the plane plus three fading copies: Flash's poor man's motion blur
  const plane = $('#plane');
  document.querySelectorAll('.ghost').forEach(g => g.remove());
  const ghosts = [1, 2, 3].map(i => {
    const g = plane.cloneNode(true);
    g.removeAttribute('id');
    g.classList.add('ghost');
    g.style.cssText = `position:absolute;left:-140px;top:250px;width:120px;fill:#39c6ff;opacity:${0.4 / i}`;
    plane.before(g);
    return [g, i];
  });
  at(1500, () => whoosh());
  for (const [el, lag] of [[plane, 0], ...ghosts]) {
    A(el, [{ transform: 'translate(0,0) rotate(-6deg) scale(.7)' }, { transform: 'translate(1060px,-190px) rotate(-14deg) scale(1.15)' }], {
      duration: 1500, delay: 1600 + lag * 45, easing: 'cubic-bezier(.55,0,.35,1)',
    });
  }

  A($('#runway'), [{ opacity: 1 }, { opacity: 0.25 }], { duration: 600, delay: 3000, composite: 'replace' });
  A($('#hud'), [{ opacity: 1 }, { opacity: 0.3 }], { duration: 600, delay: 3000 });

  const word = $('#word');
  word.replaceChildren(...[...'HALCYON'].map(c => Object.assign(document.createElement('span'), { textContent: c })));
  [...word.children].forEach((s, i) =>
    A(s, [{ opacity: 0, transform: 'scale(3.2) translateY(-8px)', filter: 'blur(10px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 520, delay: 3100 + i * 75 }),
  );
  at(3800, boom);
  A($('#flash'), [{ opacity: 0 }, { opacity: 0.85, offset: 0.15 }, { opacity: 0 }], { duration: 420, delay: 3780 });
  A($('#sub'), [{ opacity: 0, letterSpacing: '1.2em' }, { opacity: 1, letterSpacing: '.08em' }], { duration: 900, delay: 3900 });
  $('#tag').textContent = '';
  at(4600, () => type($('#tag'), 'THE SKY. REDEFINED.', 65));
  A($('#intro'), [{ opacity: 1 }, { opacity: 0 }], { duration: 500, delay: 6600 });
  at(7100, main);
}

/* ---------- 4. the site ---------- */

let inMain = false;

function main() {
  if (inMain) return;
  inMain = true;
  timers.forEach(clearTimeout);
  anims.forEach(a => a.cancel());
  cancelAnimationFrame(runwayRaf);
  $('#skip').classList.remove('on');
  music();
  scene('main');
  if (!reduce) {
    A($('.top'), [{ transform: 'translateY(-46px)' }, { transform: 'none' }], { duration: 450 });
    document.querySelectorAll('.nav button').forEach((b, i) => A(b, [{ transform: 'translateX(-180px)' }, { transform: 'none' }], { duration: 420, delay: 200 + i * 70 }));
    A($('.panel'), [{ clipPath: 'inset(50% 0 50% 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 500, delay: 450, easing: 'cubic-bezier(.7,0,.2,1)' });
    A($('.bottom'), [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 900 });
  }
  globe();
}

const SAY = $('#say');
document.querySelectorAll('.nav button').forEach(b => {
  const hover = () => {
    blip();
    SAY.textContent = '» ' + b.dataset.say;
  };
  b.addEventListener('pointerenter', hover);
  b.addEventListener('focus', hover);
  b.addEventListener('click', () => show(b.dataset.go, b));
});

function show(id, btn) {
  blip(1320);
  document.querySelectorAll('.nav button').forEach(n => n.classList.toggle('on', n === btn));
  const sec = $(`#s-${id}`);
  document.querySelectorAll('.sec').forEach(s => s.classList.toggle('on', s === sec));
  $('#ptitle').textContent = '';
  type($('#ptitle'), `» ${id === 'home' ? 'WELCOME ABOARD' : btn.textContent}`, 30);
  if (!reduce) A(sec, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 380, easing: 'cubic-bezier(.7,0,.2,1)' });
  if (id === 'dest') cities();
  if (id === 'fleet' && !reduce) document.querySelectorAll('.spec').forEach((s, i) => A(s, [{ opacity: 0, transform: 'translateX(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 300, delay: 300 + i * 160 }));
}

const CITIES = [[51.5, -0.1, 'LON'], [48.9, 2.35, 'PAR'], [40.7, -74, 'NYC'], [35.7, 139.7, 'TYO'], [41.9, 12.5, 'ROM'], [-33.9, 151.2, 'SYD'], [32.1, 34.8, 'TLV']];
const HUB = CITIES[6];
let globeRaf = 0;

function globe() {
  const c = $('#globe'), g = c.getContext('2d'), R = 170, cx = 220, cy = 220, tilt = 0.38, D = Math.PI / 180;
  const p3 = (lat, lon, rot) => {
    const φ = lat * D, λ = lon * D + rot;
    const x = Math.cos(φ) * Math.sin(λ), y = Math.sin(φ), z = Math.cos(φ) * Math.cos(λ);
    return [x, y * Math.cos(tilt) - z * Math.sin(tilt), y * Math.sin(tilt) + z * Math.cos(tilt)];
  };
  const line = (pts, rot, alt = 1) => {
    for (let i = 1; i < pts.length; i++) {
      const a = p3(...pts[i - 1], rot), b = p3(...pts[i], rot);
      const z = (a[2] + b[2]) / 2;
      g.strokeStyle = `rgba(57,198,255,${z > 0 ? 0.5 : 0.08})`;
      g.beginPath();
      g.moveTo(cx + a[0] * R * alt, cy - a[1] * R * alt);
      g.lineTo(cx + b[0] * R * alt, cy - b[1] * R * alt);
      g.stroke();
    }
  };
  const t0 = performance.now();
  const frame = now => {
    const t = (now - t0) / 1000, rot = -0.6 + t * 0.22;
    g.clearRect(0, 0, 440, 440);
    const glow = g.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.15);
    glow.addColorStop(0, 'rgba(57,198,255,.10)');
    glow.addColorStop(1, 'rgba(57,198,255,0)');
    g.fillStyle = glow;
    g.fillRect(0, 0, 440, 440);
    g.lineWidth = 1;
    for (let lon = 0; lon < 360; lon += 20) line(Array.from({ length: 37 }, (_, i) => [-90 + i * 5, lon]), rot);
    for (let lat = -60; lat <= 60; lat += 30) line(Array.from({ length: 73 }, (_, i) => [lat, i * 5]), rot);

    // routes out of the hub, lifted off the surface and drawn up to a moving head
    CITIES.slice(0, 6).forEach(([lat, lon], k) => {
      const n = 40, head = ((t * 0.35 + k / 6) % 1.4);
      const a = p3(HUB[0], HUB[1], 0), b = p3(lat, lon, 0);
      const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2], w = Math.acos(Math.min(1, dot));
      for (let i = 1; i <= n && i / n <= head; i++) {
        const pt = j => {
          const f = j / n, s1 = Math.sin((1 - f) * w) / Math.sin(w), s2 = Math.sin(f * w) / Math.sin(w);
          const v = [0, 1, 2].map(q => a[q] * s1 + b[q] * s2);
          const lat2 = Math.asin(v[1] * Math.cos(tilt) + v[2] * Math.sin(tilt));
          const lon2 = Math.atan2(v[0], -v[1] * Math.sin(tilt) + v[2] * Math.cos(tilt));
          const q = p3(lat2 / D, lon2 / D, rot), lift = 1 + 0.16 * Math.sin(Math.PI * f);
          return [cx + q[0] * R * lift, cy - q[1] * R * lift, q[2]];
        };
        const [x1, y1, z1] = pt(i - 1), [x2, y2] = pt(i);
        g.strokeStyle = z1 > -0.1 ? 'rgba(255,138,31,.9)' : 'rgba(255,138,31,.15)';
        g.beginPath();
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
        g.stroke();
      }
    });
    g.font = '8px Silkscreen, monospace';
    for (const [lat, lon, name] of CITIES) {
      const [x, y, z] = p3(lat, lon, rot);
      if (z < 0) continue;
      g.fillStyle = name === 'TLV' ? '#ff8a1f' : '#e8f6ff';
      g.fillRect(cx + x * R - 2, cy - y * R - 2, 4, 4);
      g.fillText(name, cx + x * R + 6, cy - y * R + 3);
    }
    if (!reduce) globeRaf = requestAnimationFrame(frame);
  };
  cancelAnimationFrame(globeRaf);
  globeRaf = requestAnimationFrame(frame);
}

/* ---------- flight search: loadVariables ---------- */

const CODES = { 'TEL AVIV': 'TLV', LONDON: 'LHR', 'NEW YORK': 'JFK', PARIS: 'CDG', TOKYO: 'NRT' };

$('#search').addEventListener('submit', e => {
  e.preventDefault();
  blip(990);
  const f = new FormData(e.target);
  const from = f.get('from'), to = f.get('to');
  const wire = $('#wire'), out = $('#results');
  out.replaceChildren();
  if (from === to) {
    wire.textContent = 'PLEASE SELECT TWO DIFFERENT CITIES.';
    return;
  }
  const body = new URLSearchParams(f).toString();
  // what search.asp would have answered: one long URL-encoded string
  let seed = [...body].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) % 1000) / 1000;
  const rows = [0, 1, 2].map(i => {
    const dep = 6 + i * 5 + Math.floor(rnd() * 3), dur = 4 + Math.floor(rnd() * 9);
    return `HA${100 + Math.floor(rnd() * 800)}|${String(dep).padStart(2, '0')}:${rnd() > 0.5 ? '10' : '45'}|${String((dep + dur) % 24).padStart(2, '0')}:${rnd() > 0.5 ? '05' : '35'}|$${380 + Math.floor(rnd() * 900)}`;
  });
  const reply = `&count=3&from=${CODES[from]}&to=${CODES[to]}&${rows.map((r, i) => `f${i + 1}=${encodeURIComponent(r)}`).join('&')}&done=1&`;

  wire.replaceChildren(Object.assign(document.createElement('b'), { textContent: `POST /search.asp  ${body}` }), document.createElement('br'));
  const recv = document.createTextNode('');
  wire.append(recv);
  let i = 0;
  const tick = () => {
    i = Math.min(reply.length, i + 3 + Math.floor(Math.random() * 4));
    recv.textContent = reply.slice(0, i);
    if (i < reply.length) return setTimeout(tick, 40);
    const v = new URLSearchParams(reply);
    const head = Object.assign(document.createElement('div'), { className: 'px hd' });
    head.append(...['FLIGHT', 'ROUTE', 'DEPART', 'ARRIVE', 'FARE'].map(t => Object.assign(document.createElement('span'), { textContent: t })));
    out.append(head);
    for (let n = 1; n <= Number(v.get('count')); n++) {
      const [no, dep, arr, fare] = v.get(`f${n}`).split('|');
      const r = Object.assign(document.createElement('div'), { className: 'px' });
      r.append(...[no, `${v.get('from')} - ${v.get('to')}`, dep, arr].map(t => Object.assign(document.createElement('span'), { textContent: t })), Object.assign(document.createElement('span'), { className: 'fare', textContent: fare }));
      out.append(r);
      if (!reduce) A(r, [{ opacity: 0, transform: 'translateX(-12px)' }, { opacity: 1, transform: 'none' }], { duration: 250, delay: n * 90 });
    }
    blip(660);
  };
  tick();
});

const DEST = [['LONDON', 499, '#1b3a5c', '#ffb347'], ['PARIS', 459, '#2b2350', '#ff7a8a'], ['NEW YORK', 689, '#0f2f45', '#ffd166'], ['TOKYO', 812, '#2a1638', '#ff4f6a'], ['ROME', 429, '#3a2414', '#ffb000'], ['SYDNEY', 1199, '#06324a', '#ffe066']];

function cities() {
  const box = $('#cities');
  if (box.children.length) return;
  for (const [name, fare, sky, sun] of DEST) {
    let seed = name.length * 97;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const d = document.createElement('div');
    d.className = 'city';
    const s = svg('svg', { viewBox: '0 0 160 128', preserveAspectRatio: 'xMidYMax slice' });
    s.append(svg('rect', { width: 160, height: 128, fill: sky }), svg('circle', { cx: 40 + rnd() * 80, cy: 46, r: 16, fill: sun, opacity: 0.85 }));
    for (let x = 0; x < 160; ) {
      const w = 10 + rnd() * 18, h = 24 + rnd() * 60;
      s.append(svg('rect', { x, y: 128 - h, width: w - 2, height: h, fill: '#020a10' }));
      for (let wy = 128 - h + 5; wy < 124; wy += 7) if (rnd() > 0.55) s.append(svg('rect', { x: x + 3, y: wy, width: 2, height: 2, fill: sun, opacity: 0.8 }));
      x += w;
    }
    const label = document.createElement('div');
    label.className = 'px';
    label.append(`${name} `, Object.assign(document.createElement('span'), { textContent: `FROM $${fare}` }));
    d.append(s, label);
    box.append(d);
  }
}
