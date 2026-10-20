const CACHE = 'y2k-v1';
const FILES = ['./', 'index.html', 'y2k.css', 'y2k.js', 'modem.js', 'img/stripe.svg', 'img/construction.svg', 'img/pc.svg', 'img/favicon.svg', 'fonts/jetbrains-mono-400-latin.woff2', 'fonts/jetbrains-mono-600-latin.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(k => k.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  // network first so a deploy shows up right away; cache only when there's no line
  e.respondWith(fetch(e.request.url, { cache: 'no-cache' })
    .then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); } return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true })));
});
