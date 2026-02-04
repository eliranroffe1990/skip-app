// SKIPAPP Service Worker v5.0
// PWA Offline Support + Firebase Analytics

const CACHE_VERSION = 'skipapp-v5.0';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;600;700;800&display=swap',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics-compat.js'
];

// Install - Cache files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v5.0...');
  
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      console.log('[SW] Caching app shell');
      return cache.addAll(CACHE_URLS);
    })
  );
  
  self.skipWaiting();
});

// Activate - Clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker v5.0...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_VERSION) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  return self.clients.claim();
});

// Fetch - Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
  // Skip Firebase Analytics requests - always go to network
  if (event.request.url.includes('google-analytics.com') ||
      event.request.url.includes('analytics.google.com') ||
      event.request.url.includes('firebase')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone response before caching
        const responseToCache = response.clone();
        
        caches.open(CACHE_VERSION).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          
          // If not in cache, return offline page or error
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Background Sync (for future versions)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-skips') {
    console.log('[SW] Background sync: skips');
    // Future: sync offline data to Firebase
  }
});

// Push Notifications (for future versions)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('SKIPAPP', options)
  );
});

// Message from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker v5.0 loaded successfully');
