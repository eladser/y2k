// Halcyon, 2020. JSX written out as the createElement calls Babel emits, so there's no build step
(function () {
  'use strict';
  const { useState, useEffect, useRef } = React;
  const h = React.createElement;

  // feather icons
  const ICONS = {
    x: 'M18 6 6 18M6 6l12 12',
    arrow: 'M5 12h14M12 5l7 7-7 7',
    back: 'M19 12H5M12 19l-7-7 7-7',
    refresh: 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
    shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    wind: 'M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2',
    chat: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
    moon: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
    sun: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42',
    info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01',
  };
  const Icon = ({ name }) => h('svg', { className: 'ic', viewBox: '0 0 24 24', 'aria-hidden': true }, h('path', { d: ICONS[name] }));
  const Logo = () => h('svg', { viewBox: '0 0 46 44', 'aria-hidden': true },
    h('path', { d: 'M4 26c8-1 12-9 21-9 4 0 7 2 9 4l8-2-5 5c0 8-7 13-16 13-10 0-15-5-17-11z' }));

  const CITIES = [
    { code: 'ATH', name: 'Athens', from: 129, rule: 'Open' },
    { code: 'LIS', name: 'Lisbon', from: 219, rule: 'Test required' },
    { code: 'LHR', name: 'London', from: 289, rule: 'Quarantine on arrival' },
    { code: 'KEF', name: 'Reykjavik', from: 459, rule: 'Test required' },
    { code: 'JFK', name: 'New York', from: 649, rule: 'Quarantine on arrival' },
    { code: 'NRT', name: 'Tokyo', from: 829, rule: 'Closed to visitors' },
  ];
  const img = c => c.name.toLowerCase().replace(' ', '');
  const closed = c => c.rule.startsWith('Closed');

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
  };
  const wait = ms => new Promise(r => setTimeout(r, ms));

  // the desk clock says 2020, so the default date does too
  function inTwoWeeks() {
    const d = new Date();
    d.setFullYear(2020);
    d.setDate(d.getDate() + 14);
    return d.toLocaleDateString('en-CA');
  }

  function readQuery() {
    const p = new URLSearchParams(location.search);
    const to = p.get('to');
    if (!CITIES.some(c => c.code === to)) return null;
    const ok = /^\d{4}-\d\d-\d\d$/.test(p.get('date')) && !isNaN(new Date(p.get('date')));
    const date = ok ? p.get('date') : inTwoWeeks();
    return { to, date, pax: Math.min(4, Math.max(1, parseInt(p.get('pax'), 10) || 1)) };
  }

  function useTheme() {
    const [theme, setTheme] = useState(() => store.get('halcyon2020.theme'));
    useEffect(() => {
      if (theme) document.documentElement.dataset.theme = theme;
    }, [theme]);
    const dark = theme ? theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    const toggle = () => {
      const t = dark ? 'light' : 'dark';
      store.set('halcyon2020.theme', t);
      setTheme(t);
    };
    return [dark, toggle];
  }

  function useReveal() {
    const ref = useRef(null);
    useEffect(() => {
      const el = ref.current;
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        el.classList.add('in');
        io.disconnect();
      }, { threshold: 0.15 });
      io.observe(el);
      return () => io.disconnect();
    }, []);
    return ref;
  }

  function App() {
    const [query, setQuery] = useState(readQuery);
    const [dark, toggleTheme] = useTheme();
    useEffect(() => {
      const onPop = () => setQuery(readQuery());
      window.addEventListener('popstate', onPop);
      return () => window.removeEventListener('popstate', onPop);
    }, []);

    const search = q => {
      history.pushState(null, '', '?' + new URLSearchParams(q));
      setQuery(q);
      window.scrollTo(0, 0);
    };
    const home = () => {
      history.pushState(null, '', location.pathname);
      setQuery(null);
    };
    const city = query && CITIES.find(c => c.code === query.to);

    return h(React.Fragment, null,
      h(CovidBar),
      h(Header, { dark, toggleTheme, home }),
      city ? h(Results, { key: [city.code, query.date, query.pax].join(), city, query, home }) : h(Home, { search }),
      h(Footer),
      h(Consent),
      h(Chat));
  }

  function CovidBar() {
    const [open, setOpen] = useState(true);
    if (!open) return null;
    return h('div', { className: 'covid', role: 'region', 'aria-label': 'Travel update' },
      h(Icon, { name: 'info' }),
      h('p', null, h('strong', null, 'COVID-19: '), 'check the entry rules for your destination before you fly. Every fare can be changed for free until 31 March 2021. ',
        h('a', { href: '#' }, 'Travel updates')),
      h('button', { type: 'button', 'aria-label': 'Dismiss', onClick: () => setOpen(false) }, h(Icon, { name: 'x' })));
  }

  function Header({ dark, toggleTheme, home }) {
    return h('header', { className: 'top' },
      h('div', { className: 'wrap' },
        h('a', { className: 'brand', href: '.', onClick: e => { e.preventDefault(); home(); } }, h(Logo), 'halcyon'),
        h('nav', null, ['Book', 'Manage', 'Check in', 'Travel updates'].map((t, i) =>
          h('a', { key: t, href: '#', className: i === 0 ? 'on' : null }, t))),
        h('button', { className: 'theme', type: 'button', onClick: toggleTheme, 'aria-label': dark ? 'Switch to light mode' : 'Switch to dark mode' },
          h(Icon, { name: dark ? 'sun' : 'moon' })),
        h('a', { className: 'pill ghost', href: '#' }, 'Sign in')));
  }

  function Home({ search }) {
    return h('main', null,
      h('section', { className: 'hero wrap' },
        h('div', null,
          h('h1', null, 'Book now, ', h('span', null, 'change later.')),
          h('p', { className: 'lead' }, 'Every fare can be moved for free until March 2021. Fly when it feels right.'),
          h(SearchForm, { search })),
        h('picture', { className: 'art' },
          h('source', { srcSet: 'img/hero.webp', type: 'image/webp' }),
          h('img', { src: 'img/hero.jpg', alt: '', width: 560, height: 560 }))),
      h(Promises),
      h(Deals, { search }));
  }

  function SearchForm({ search }) {
    const [trip, setTrip] = useState('round');
    const [to, setTo] = useState('LIS');
    const [date, setDate] = useState(inTwoWeeks);
    const [pax, setPax] = useState(1);
    const submit = e => {
      e.preventDefault();
      search({ to, date, pax });
    };
    return h('form', { className: 'search card', onSubmit: submit },
      h('div', { className: 'seg', role: 'radiogroup', 'aria-label': 'Trip type' },
        [['round', 'Round trip'], ['oneway', 'One way']].map(([k, t]) =>
          h('button', { key: k, type: 'button', role: 'radio', 'aria-checked': trip === k, onClick: () => setTrip(k) }, t))),
      h('div', { className: 'fields' },
        h('label', null, h('span', null, 'From'), h('input', { value: 'Tel Aviv (TLV)', readOnly: true })),
        h('label', null, h('span', null, 'To'),
          h('select', { value: to, onChange: e => setTo(e.target.value) },
            CITIES.map(c => h('option', { key: c.code, value: c.code }, `${c.name} (${c.code})`)))),
        h('label', null, h('span', null, 'Depart'), h('input', { type: 'date', value: date, required: true, onChange: e => setDate(e.target.value) })),
        h('label', null, h('span', null, 'Travellers'),
          h('select', { value: pax, onChange: e => setPax(+e.target.value) },
            [1, 2, 3, 4].map(n => h('option', { key: n, value: n }, n > 1 ? `${n} adults` : '1 adult'))))),
      h('button', { className: 'pill go', type: 'submit' }, 'Search flights', h(Icon, { name: 'arrow' })));
  }

  const PROMISES = [
    ['refresh', 'Free changes', 'Move your flight as many times as you need. No change fee.'],
    ['wind', 'Cleaner air', 'HEPA filters replace the cabin air every three minutes.'],
    ['shield', 'Masks on board', 'Required for everyone over six, on every flight.'],
  ];

  function Promises() {
    const ref = useReveal();
    return h('section', { className: 'promises wrap reveal', ref },
      PROMISES.map(([i, t, d]) => h('div', { key: t },
        h('span', { className: 'badge' }, h(Icon, { name: i })),
        h('h3', null, t),
        h('p', null, d))));
  }

  function Deals({ search }) {
    const ref = useReveal();
    return h('section', { className: 'deals wrap reveal', ref },
      h('h2', null, 'Where you can go right now'),
      h('div', { className: 'grid' }, CITIES.map(c => h('article', { key: c.code, className: 'deal card' },
        h('picture', null,
          h('source', { srcSet: `img/${img(c)}.webp`, type: 'image/webp' }),
          h('img', { src: `img/${img(c)}.jpg`, alt: '', width: 640, height: 420, loading: 'lazy' })),
        h('div', { className: 'body' },
          h('span', { className: 'tag ' + (closed(c) ? 'no' : c.rule === 'Open' ? 'ok' : 'warn') }, c.rule),
          h('h3', null, c.name),
          h('p', null, closed(c) ? 'Flights restart when the border reopens.' : `Flights from $${c.from}`),
          closed(c)
            ? h('button', { className: 'pill', type: 'button', disabled: true }, 'Not flying yet')
            : h('button', { className: 'pill', type: 'button', onClick: () => search({ to: c.code, date: inTwoWeeks(), pax: 1 }) }, 'See flights'))))));
  }

  function Results({ city, query, home }) {
    const [flights, setFlights] = useState(null);
    const [error, setError] = useState(null);
    const shut = closed(city);

    useEffect(() => {
      if (shut) return;
      let live = true;
      (async () => {
        try {
          // the real fares API took a second or two, long enough to see the skeletons
          const [res] = await Promise.all([fetch('data/fares.json'), wait(1400)]);
          if (!res.ok) throw new Error(res.status);
          const f = (await res.json())[city.code];
          if (!live) return;
          setFlights([['07:10', 0, 9], ['13:45', 40, 3], ['22:30', -30, 14]].map(([dep, diff, left], i) =>
            ({ no: 'HA ' + (700 + i * 2), dep, hours: f.hours, price: (f.fare + diff) * query.pax, left })));
        } catch (e) {
          if (live) setError("Couldn't load flights. Check your connection and try again.");
        }
      })();
      return () => { live = false; };
    }, [city.code, query.pax, shut]);

    const when = new Date(query.date + 'T00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    let list;
    if (shut) list = h('div', { className: 'empty card' }, `${city.name} is closed to visitors for now. We'll restart flights as soon as the border reopens.`);
    else if (error) list = h('div', { className: 'empty card', role: 'alert' }, error);
    else if (!flights) list = [0, 1, 2].map(i => h('div', { key: i, className: 'flight card skel', 'aria-hidden': true }, h('i'), h('i'), h('i')));
    else list = flights.map(f => h('div', { key: f.no, className: 'flight card' },
      h('div', null, h('strong', null, f.dep), h('span', null, f.no)),
      h('div', null, h('strong', null, f.hours), h('span', null, 'Non-stop')),
      h('div', null, h('strong', null, '$' + f.price),
        f.left < 5 ? h('span', { className: 'hot' }, `Only ${f.left} seats left at this price`) : h('span', null, 'Free changes')),
      h('button', { className: 'pill', type: 'button' }, 'Select')));

    return h('main', { className: 'results wrap', 'aria-busy': !shut && !flights && !error },
      h('button', { className: 'link', type: 'button', onClick: home }, h(Icon, { name: 'back' }), 'Change search'),
      h('h1', null, `Tel Aviv to ${city.name}`),
      h('p', { className: 'lead' }, `${when} · ${query.pax > 1 ? query.pax + ' adults' : '1 adult'}`),
      list);
  }

  const LINKS = [['Company', ['About', 'Careers', 'Press']], ['Help', ['Travel updates', 'Refunds', 'Contact us']], ['Legal', ['Privacy', 'Cookies', 'Terms']]];

  function Footer() {
    return h('footer', { className: 'foot' },
      h('div', { className: 'wrap' },
        h('div', null, h('a', { className: 'brand', href: '#' }, h(Logo), 'halcyon'), h('p', null, 'Flexible flights from Tel Aviv.')),
        LINKS.map(([t, ls]) => h('div', { key: t }, h('h4', null, t), ls.map(l => h('a', { key: l, href: '#' }, l)))),
        h('p', { className: 'copy' }, '© 2020 Halcyon Airways')));
  }

  function Consent() {
    const [done, setDone] = useState(false);
    const [manage, setManage] = useState(false);
    const [prefs, setPrefs] = useState({ analytics: false, marketing: false });
    const dlg = useRef(null);
    useEffect(() => {
      if (manage) dlg.current.focus();
    }, [manage]);
    if (done) return null;
    const flip = k => setPrefs(p => Object.assign({}, p, { [k]: !p[k] }));
    const row = (k, title, text) => h('label', { className: 'toggle' },
      h('span', null, h('strong', null, title), h('br'), text),
      h('input', { type: 'checkbox', checked: k ? prefs[k] : true, disabled: !k, onChange: k ? () => flip(k) : null }));

    return h(React.Fragment, null,
      h('div', { className: 'consent card', role: 'region', 'aria-label': 'Cookie consent' },
        h('p', null, 'We use cookies to make the site work, to understand how it is used and to show you relevant ads. ', h('a', { href: '#' }, 'Cookie policy')),
        h('div', { className: 'row' },
          h('button', { className: 'pill ghost', type: 'button', onClick: () => setManage(true) }, 'Manage'),
          h('button', { className: 'pill', type: 'button', onClick: () => setDone(true) }, 'Accept all'))),
      manage && h('div', { className: 'modal' },
        h('div', { className: 'card', role: 'dialog', 'aria-modal': true, 'aria-label': 'Cookie preferences', tabIndex: -1, ref: dlg,
          onKeyDown: e => { if (e.key === 'Escape') setManage(false); } },
          h('h3', null, 'Cookie preferences'),
          row(null, 'Strictly necessary', 'Keeps you signed in and remembers your booking. Always on.'),
          row('analytics', 'Analytics', 'Counts visits so we can see which pages work.'),
          row('marketing', 'Marketing', 'Lets our partners show you Halcyon ads on other sites.'),
          h('div', { className: 'row' },
            h('button', { className: 'pill ghost', type: 'button', onClick: () => setDone(true) }, 'Save choices'),
            h('button', { className: 'pill', type: 'button', onClick: () => setDone(true) }, 'Accept all')))));
  }

  const ANSWERS = {
    'Change my flight': 'Open Manage, find your booking and pick a new date. There is no change fee until 31 March 2021, you only pay any difference in fare.',
    'Entry rules': 'They change often right now. Each destination shows its current rule, and we email you if it changes before you fly.',
    'Refunds': 'If we cancel your flight you can have your money back, or a voucher worth 120% of your ticket.',
  };

  function Chat() {
    const [open, setOpen] = useState(false);
    const [nudge, setNudge] = useState(false);
    const [log, setLog] = useState([['bot', "Hi, I'm Hal 👋 Halcyon's virtual assistant. What can I help you with?"]]);
    const box = useRef(null);
    const btn = useRef(null);
    useEffect(() => {
      const t = setTimeout(() => setNudge(true), 6000);
      return () => clearTimeout(t);
    }, []);
    useEffect(() => {
      if (box.current) box.current.scrollTop = box.current.scrollHeight;
    }, [log, open]);
    const ask = q => {
      setLog(l => l.concat([['me', q]]));
      setTimeout(() => setLog(l => l.concat([['bot', ANSWERS[q]]])), 700);
    };
    const toggle = () => {
      setOpen(!open);
      setNudge(false);
    };

    return h('div', { className: 'chat' },
      open && h('div', { className: 'panel card', role: 'dialog', 'aria-label': 'Chat with Halcyon',
        onKeyDown: e => { if (e.key === 'Escape') { setOpen(false); btn.current.focus(); } } },
        h('div', { className: 'head' },
          h('strong', null, 'Halcyon support'),
          h('span', null, 'Usually replies in a few minutes')),
        h('div', { className: 'log', ref: box, 'aria-live': 'polite' }, log.map(([who, t], i) => h('p', { key: i, className: who }, t))),
        h('div', { className: 'chips' }, Object.keys(ANSWERS).map((q, i) => h('button', { key: q, type: 'button', autoFocus: i === 0, onClick: () => ask(q) }, q)))),
      !open && nudge && h('button', { className: 'nudge card', type: 'button', onClick: toggle }, 'Hi there 👋 Need help with a booking?'),
      h('button', { className: 'bubble', type: 'button', ref: btn, 'aria-label': open ? 'Close chat' : 'Open chat', onClick: toggle }, h(Icon, { name: open ? 'x' : 'chat' })));
  }

  ReactDOM.render(h(App), document.getElementById('root'));
})();
