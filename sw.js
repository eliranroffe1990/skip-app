
// SKIPAPP Service Worker v3.4 (auto refresh)
const CACHE_NAME = 'skipapp-v3.4';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-180.png'
];
self.addEventListener('install',(event)=>{self.skipWaiting();event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(CORE_ASSETS)));});
self.addEventListener('activate',async (event)=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.map(k=>k!==CACHE_NAME&&caches.delete(k)));})());self.clients.claim();const clients=await self.clients.matchAll({includeUncontrolled:true,type:'window'});for(const client of clients){client.navigate(client.url);}});
self.addEventListener('fetch',(event)=>{const req=event.request;const isHTML=req.headers.get('accept')?.includes('text/html');if(isHTML){event.respondWith(fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put(req,copy));return res;}).catch(()=>caches.match(req).then(r=>r||caches.match('/index.html'))));}else{event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put(req,copy));return res;})));}});
