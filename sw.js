
// SKIPAPP Service Worker v4.7.3 (relative paths, fixed activate)
const CACHE = 'skipapp-v4.7.3';
const CORE = [
  '.', 'index.html', 'manifest.json',
  'icons/icon-192  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png',
  'images/hero.jpg', 'images/play_logo.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => k !== CACHE && caches.delete(k)));
  })());
  self.clients.claim(); // ← חשוב: בלי סוגר נוסף
});

// Network-first למסמכי HTML, אחרת cache-first עם עדכון-ברקע לנכסים
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const isHTML = req.headers.get('accept')?.includes('text/html');

  if (isHTML) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() =>
        caches.match(req).then(r => r || caches.match('index.html'))
      )
    );
  } else {
    e.respondWith(
      caches.match(req).then(cached =>
        cached ||
        fetch(req).then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(cc => cc.put(req, copy));
          return res;
        })
      )
    );
  }

