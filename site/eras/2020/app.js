const $ = s => document.querySelector(s);
const root = document.documentElement;
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const clock = new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' });
const dur = m => `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;

/* dates: en-CA happens to format as YYYY-MM-DD, which is what <input type=date> wants */
const day = n => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString('en-CA');
};
const dep = $('[name=depart]'), back = $('[name=back]');
dep.min = back.min = day(0);
dep.value = day(14);
back.value = day(21);
dep.addEventListener('change', () => {
  back.min = dep.value;
  if (back.value < dep.value) back.value = dep.value;
});

/* travellers */
const pax = { a: 1, c: 0 };
document.querySelectorAll('#pax [data-k]').forEach(b =>
  b.addEventListener('click', () => {
    const k = b.dataset.k;
    pax[k] = Math.max(k === 'a' ? 1 : 0, Math.min(9, pax[k] + Number(b.dataset.d)));
    $(`#pax [data-v=${k}]`).textContent = pax[k];
    $('#paxbtn').textContent = [`${pax.a} adult${pax.a > 1 ? 's' : ''}`, pax.c && `${pax.c} ${pax.c > 1 ? 'children' : 'child'}`].filter(Boolean).join(', ');
  }),
);

/* tabs */
const tabs = [...document.querySelectorAll('.tabs [role=tab]')];
function show(id) {
  tabs.forEach(t => t.setAttribute('aria-selected', t.dataset.panel === id));
  document.querySelectorAll('.panel').forEach(p => (p.hidden = p.id !== `p-${id}`));
  if (id === 'status') status();
}
for (const tab of tabs) {
  tab.onclick = () => (document.startViewTransition ? document.startViewTransition(() => show(tab.dataset.panel)) : show(tab.dataset.panel));
}

/* theme */
$('.theme').addEventListener('click', () => {
  const dark = root.classList.contains('dark') || (!root.classList.contains('light') && matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('dark', !dark);
  root.classList.toggle('light', dark);
});

/* the window: whatever the sky looks like where you are */
function sky() {
  const now = new Date(), h = now.getHours() + now.getMinutes() / 60;
  const [name, top, bottom] =
    h < 5 || h >= 20.5 ? ['night', 'oklch(17% .05 268)', 'oklch(31% .08 262)']
    : h < 8 ? ['dawn', 'oklch(60% .09 252)', 'oklch(86% .09 55)']
    : h < 17.5 ? ['day', 'oklch(54% .13 246)', 'oklch(88% .06 225)']
    : ['dusk', 'oklch(44% .12 290)', 'oklch(78% .14 45)'];
  const s = $('#sky');
  s.style.setProperty('--top', top);
  s.style.setProperty('--bottom', bottom);
  s.classList.toggle('night', name === 'night');
  $('#skycap').textContent = `Your sky right now: ${name}, ${clock.format(now)}`;
}
sky();
setInterval(sky, 60000);

/* destinations */
const art = (a, b, sun, far, near) =>
  `radial-gradient(circle at 72% 34%, ${sun} 0 8%, transparent 8.6%), radial-gradient(120% 40% at 30% 100%, ${near} 0 60%, transparent 61%), radial-gradient(90% 34% at 85% 100%, ${far} 0 70%, transparent 71%), linear-gradient(${a}, ${b})`;
const DESTS = [
  ['Tokyo', 'New: daily non-stop from June', 765, 849, art('oklch(28% .08 285)', 'oklch(58% .14 15)', 'oklch(92% .09 85)', 'oklch(36% .07 290)', 'oklch(22% .05 280)')],
  ['Lisbon', 'Daily · 5h 10m non-stop', 310, 189, art('oklch(78% .08 60)', 'oklch(92% .05 85)', 'oklch(97% .06 95)', 'oklch(62% .12 40)', 'oklch(52% .12 235)')],
  ['Athens', '3 a week · 1h 55m non-stop', 115, 129, art('oklch(70% .1 235)', 'oklch(94% .03 220)', 'oklch(98% .03 95)', 'oklch(86% .02 80)', 'oklch(48% .13 240)')],
  ['New York', 'Daily · 11h 40m non-stop', 700, 612, art('oklch(42% .09 260)', 'oklch(80% .11 55)', 'oklch(90% .1 75)', 'oklch(32% .04 260)', 'oklch(25% .03 260)')],
  ['London', 'Twice daily · 5h 15m non-stop', 315, 241, art('oklch(72% .03 240)', 'oklch(88% .02 230)', 'oklch(96% .02 90)', 'oklch(55% .05 160)', 'oklch(42% .06 150)')],
];
$('#grid').replaceChildren(...DESTS.map(([city, note, , fare, bg], i) => {
  const a = document.createElement('article');
  a.className = 'card';
  const inner = document.createElement('div');
  inner.className = 'card-in';
  const pic = document.createElement('div');
  pic.className = 'art';
  pic.style.setProperty('--art', bg);
  const info = document.createElement('div');
  info.className = 'info';
  const h = Object.assign(document.createElement('h3'), { textContent: city });
  const p = Object.assign(document.createElement('p'), { textContent: note });
  const f = Object.assign(document.createElement('p'), { className: 'fare', textContent: `from ${usd.format(fare)} ` });
  f.append(Object.assign(document.createElement('small'), { textContent: 'round trip' }));
  info.append(h, p);
  if (i === 0) {
    info.append(
      Object.assign(document.createElement('p'), { className: 'more', textContent: 'Our longest route: a 787 overnight to Narita, with a lie-flat seat in every business row.' }),
      Object.assign(document.createElement('a'), { className: 'book', href: '#', textContent: 'See Tokyo flights' }),
    );
  }
  info.append(f);
  inner.append(pic, info);
  a.append(inner);
  return a;
}));

/* flight status: HA 214 leaves at 08:40 local every day */
function status() {
  const now = new Date(), out = new Date(now);
  out.setHours(8, 40, 0, 0);
  const mins = 310, land = new Date(out.getTime() + mins * 60000);
  const p = Math.min(1, Math.max(0, (now - out) / (land - out)));
  const state = p === 0 ? `Departs in ${dur(Math.round((out - now) / 60000))}` : p < 1 ? `In the air, ${Math.round(p * 100)}% of the way` : `Landed at ${clock.format(land)}`;
  const box = $('#live');
  box.innerHTML = `
    <div class="row"><span>HA 214<small>Tel Aviv to London</small></span><span class="state"></span></div>
    <div class="track"><div class="done-bar"></div><svg class="plane" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" transform="rotate(90 12 12)"/></svg></div>
    <div class="row"><span>${clock.format(out)}<small>TLV</small></span><span>${clock.format(land)}<small>LHR</small></span></div>`;
  box.querySelector('.state').textContent = state;
  box.querySelector('.done-bar').style.width = `${p * 100}%`;
  box.querySelector('.plane').style.left = `${p * 100}%`;
}

/* search: results in a real <dialog> */
const NAMES = { TLV: 'Tel Aviv', LHR: 'London', CDG: 'Paris', LIS: 'Lisbon', NRT: 'Tokyo', JFK: 'New York', ATH: 'Athens' };
$('#search').addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const from = f.get('from'), to = f.get('to');
  const list = $('#rlist');
  $('#rtitle').textContent = `${NAMES[from]} to ${NAMES[to]}`;
  let seed = [...from + to + f.get('depart')].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 11);
  const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) % 1000) / 1000;
  const base = DESTS.find(d => d[0] === NAMES[to])?.[2] ?? 300;
  list.replaceChildren(...[0, 1, 2].map(i => {
    const out = 6 * 60 + i * 300 + Math.floor(rnd() * 90), m = base + Math.floor(rnd() * 40);
    const t = d => clock.format(new Date(2026, 0, 1, 0, d));
    const li = document.createElement('li');
    const a = Object.assign(document.createElement('span'), { textContent: `HA ${100 + Math.floor(rnd() * 800)} · ${t(out)} to ${t(out + m)}` });
    a.append(Object.assign(document.createElement('small'), { textContent: `${dur(m)} non-stop · ${pax.a + pax.c} traveller${pax.a + pax.c > 1 ? 's' : ''}` }));
    const price = Object.assign(document.createElement('strong'), { textContent: usd.format((DESTS.find(d => d[0] === NAMES[to])?.[3] ?? 199) * (1 + rnd() * 0.6) * (pax.a + pax.c)) });
    li.append(a, price);
    return li;
  }));
  $('#results').showModal();
});
