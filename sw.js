const CACHE = 'sirenita-v11';
const CORE_ASSETS = ['./','./index.html','./styles.css','./premium.css?v=11','./premium-flat.css?v=11','./welcome.css?v=11','./app.js?v=11','./products.json?v=11','./assets/logo-oficial.png','./assets/marble-gold-v2.png'];
self.addEventListener('install', event => { self.skipWaiting(); event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE_ASSETS))); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
async function networkFirst(request) { const cache = await caches.open(CACHE); try { const response = await fetch(request); if (response.ok) cache.put(request, response.clone()); return response; } catch (error) { return (await cache.match(request)) || Promise.reject(error); } }
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (event.request.mode === 'navigate' || url.pathname.endsWith('/products.json')) { event.respondWith(networkFirst(event.request)); return; }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => { if (response.ok && url.origin === self.location.origin) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); } return response; })));
});
