const CACHE_NAME = 'shadoron-cache-v1';
const ASSETS = [
  '/',
  '/finance.html',
  '/styles.css',
  '/app.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(resp => resp || fetch(e.request).then(fetchResp => {
    return caches.open(CACHE_NAME).then(cache => { cache.put(e.request, fetchResp.clone()); return fetchResp; });
  }).catch(() => caches.match('/finance.html'))));
});
