/* Offline-first service worker: cache-first for app shell, network-fallback */
const CACHE = 'chemlab-v3';
const CORE = [
  './',
  './index.html',
  './lab.html',
  './thelab.html',
  './chem-features.js',
  './manifest.json',
  './lab-bg.svg'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // low-bandwidth: never fetch 3rd-party
  e.respondWith(
    caches.match(e.request, { ignoreSearch: false }).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy).catch(() => {}));
        return res;
      }).catch(() => caches.match('./lab.html').then((f) => f || caches.match('./index.html')));
    })
  );
});
