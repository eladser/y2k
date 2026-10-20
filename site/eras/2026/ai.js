import { PHOTOS } from './prompts.js';

const $ = s => document.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// the bent-glass edge is an SVG filter inside backdrop-filter, which only Chromium draws
if (navigator.userAgentData?.brands?.some(b => b.brand === 'Chromium')) document.documentElement.classList.add('lens');
if (reduce) $('.film').pause();

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const PLACES = [
  { city: 'Tokyo', hours: '12h 45m', fare: 849, tags: ['city', 'food', 'night', 'never sleeps', 'spring', 'long'], line: 'Rain-washed streets, the best food on earth, and a city that is still awake at 3am.' },
  { city: 'Lisbon', hours: '5h 10m', fare: 189, tags: ['warm', 'march', 'spring', 'food', 'cheap', 'sea', 'weekend'], line: 'Already warm enough to sit outside in March, and dinner costs less than the taxi in.' },
  { city: 'Athens', hours: '1h 55m', fare: 129, tags: ['warm', 'short', 'weekend', 'sea', 'history', 'cheap', 'islands'], line: 'Under two hours away, so a long weekend is really a long weekend.' },
  { city: 'Reykjavik', hours: '6h 20m', fare: 489, tags: ['snow', 'cozy', 'winter', 'northern lights', 'nature', 'quiet'], line: 'Snow outside, a hot spring and a warm cabin inside, and the northern lights if the sky is clear.' },
  { city: 'New York', hours: '11h 40m', fare: 612, tags: ['city', 'never sleeps', 'winter', 'snow', 'museums', 'shopping'], line: 'The other city that never sleeps, at its best in winter.' },
  { city: 'London', hours: '5h 15m', fare: 241, tags: ['city', 'museums', 'theatre', 'weekend', 'rain'], line: 'Museums are free, the theatre is not, and both are worth it.' },
];

/* the bento */
$('#bento').replaceChildren(...PLACES.map((p, i) => {
  const t = document.createElement('article');
  t.className = 'tile';
  t.dataset.city = p.city;
  const img = Object.assign(document.createElement('img'), { src: PHOTOS[i].file, alt: '', loading: i < 2 ? 'eager' : 'lazy', decoding: 'async' });
  img.addEventListener('error', () => img.remove());
  const tag = document.createElement('div');
  tag.className = 'tag glass';
  tag.append(Object.assign(document.createElement('b'), { textContent: p.city }), Object.assign(document.createElement('span'), { textContent: `${p.hours} non-stop` }), Object.assign(document.createElement('em'), { textContent: `from ${usd.format(p.fare)}` }));
  t.append(img, tag);
  return t;
}));
document.querySelectorAll('.seat-pic img').forEach(img => img.addEventListener('error', () => img.remove()));

/* ask */
const answer = $('#answer'), how = $('#how'), q = $('#q');
let ready = null;

// one promise for everyone, so a double click doesn't see "no model" while it's still loading
function model() {
  return (ready ??= (async () => {
    if (!('LanguageModel' in self)) return null;
    try {
      // only use it if it's already on the machine; a first download is gigabytes, not our call to make
      if ((await LanguageModel.availability()) !== 'available') return null;
      return await LanguageModel.create({
        initialPrompts: [{
          role: 'system',
          content: `You are the trip finder for Halcyon, an airline flying from Tel Aviv. Pick exactly one destination for the traveller from this list and say why in one short, plain sentence. Destinations: ${PLACES.map(p => `${p.city} (${p.hours} non-stop, from $${p.fare}; ${p.tags.join(', ')})`).join('; ')}.`,
        }],
      });
    } catch (e) {
      console.warn('on-device model unavailable', e);
      return null;
    }
  })());
}

const cheapest = list => list.reduce((a, b) => (a.fare < b.fare ? a : b));

// no model: score the destinations by whole words they share with the question, within the budget
function keyword(text) {
  const t = text.toLowerCase().replace(/(\d),(\d{3})/g, '$1$2');
  const budget = Number(t.match(/\$\s?(\d+)/)?.[1] ?? t.match(/(\d+)\s*(?:usd|dollars)\b/)?.[1] ?? Infinity);
  const fits = PLACES.filter(p => p.fare <= budget);
  if (!fits.length) {
    const p = cheapest(PLACES);
    return { city: p.city, why: `Nothing we fly is under $${budget}. The closest is ${p.city}.` };
  }
  const scored = fits.map(p => ({ p, n: p.tags.filter(tag => new RegExp(`\\b${tag}\\b`).test(t)).length }));
  scored.sort((a, b) => b.n - a.n || a.p.fare - b.p.fare);
  const best = scored[0];
  if (!best.n) {
    const p = cheapest(fits);
    return { city: p.city, why: `Nothing matched those words, so here is the cheapest place that fits. ${p.line}` };
  }
  return { city: best.p.city, why: best.p.line };
}

async function ask(text) {
  if (!text.trim()) return;
  answer.hidden = false;
  answer.textContent = 'Thinking...';
  const ai = await model();
  let pick, byModel = false;
  if (ai) {
    let s;
    try {
      // a fresh copy per question, so earlier questions don't steer this one or fill the context
      s = await ai.clone();
      const raw = await s.prompt(text, {
        responseConstraint: { type: 'object', properties: { city: { type: 'string', enum: PLACES.map(p => p.city) }, why: { type: 'string' } }, required: ['city', 'why'] },
      });
      pick = JSON.parse(raw);
      byModel = true;
    } catch (e) {
      console.warn('prompt failed, falling back', e);
    } finally {
      s?.destroy();
    }
  }
  pick ??= keyword(text);
  const place = PLACES.find(p => p.city === pick.city) ?? PLACES[0];
  answer.replaceChildren(Object.assign(document.createElement('b'), { textContent: `${place.city}. ` }), `${pick.why} ${place.hours} non-stop, from ${usd.format(place.fare)}.`);
  how.textContent = byModel
    ?'Answered on your device by Gemini Nano through the Prompt API. Nothing you typed left this page.'
    : 'This browser has no on-device model ready, so that answer is a keyword match. In Chrome with Gemini Nano, the same box runs a real language model locally.';
  document.querySelectorAll('.tile').forEach(t => t.classList.toggle('pick', t.dataset.city === place.city));
}

$('#ask').addEventListener('submit', e => {
  e.preventDefault();
  ask(q.value);
});
document.querySelectorAll('.chips button').forEach(b => b.addEventListener('click', () => {
  q.value = b.textContent;
  ask(b.textContent);
}));

/* the placeholder cycles through things people actually type */
const EXAMPLES = ['Somewhere warm in March, good food, under $700', 'Snow, a cabin, no crowds', 'A long weekend with a short flight', 'The best food city in the world'];
let ex = 0;
if (!reduce) setInterval(() => {
  if (document.activeElement === q || q.value) return;
  q.placeholder = EXAMPLES[(ex = (ex + 1) % EXAMPLES.length)];
}, 3500);
