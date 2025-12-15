
var CACHE='skipapp-v5.1.3';
var CORE=['.','index.html','manifest.json','icon/icon-192.png','icon/icon-512.png','icon/icon-180.png','images/hero.jpg','images/play_logo.png'];
self.addEventListener('install', function(e){ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(CORE); })); });
self.addEventListener('activate', function(e){ e.waitUntil(caches.keys().then(function(keys){ return Promise.all(keys.map(function(k){ if(k!==CACHE){ return caches.delete(k); } })); })); self.clients.claim(); });
self.addEventListener('fetch', function(e){ var req=e.request; var accept=req.headers.get('accept'); var html = accept && accept.indexOf('text/html')!==-1; if(html){ e.respondWith(fetch(req).then(function(res){ var copy=res.clone(); caches.open(CACHE).then(function(c){ c.put(req, copy); }); return res; }).catch(function(){ return caches.match(req).then(function(r){ return r || caches.match('index.html'); }); })); } else { e.respondWith(caches.match(req).then(function(c){ return c || fetch(req).then(function(res){ var copy=res.clone(); caches.open(CACHE).then(function(cc){ cc.put(req, copy); }); return res; }); })); } });
