// HyperRush Freeze SW - v3
const CACHE_NAME = 'hr-freeze-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', (e)=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE_NAME&&caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e)=>{
  const req = e.request;
  if (req.method !== 'GET') return; // để POST tới GAS đi thẳng mạng
  e.respondWith(
    caches.match(req).then(res=>res || fetch(req).then(r=>{
      const copy = r.clone();
      if (r.ok && new URL(req.url).origin === location.origin) {
        caches.open(CACHE_NAME).then(c=>c.put(req, copy));
      }
      return r;
    }).catch(()=>caches.match('./')))
  );
});
