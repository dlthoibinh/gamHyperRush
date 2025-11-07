/* HyperRush SW — static/dynamic cache */
const STATIC_CACHE = 'static-v37';
const DYNAMIC_CACHE = 'dynamic';
const STATIC_ASSETS = [
  './',
  './index.html',
  './icon-192.png',
  './manifest.json'
  // Thêm './sfx.wav', './bgm.opus' nếu có
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(STATIC_CACHE).then(c=>c.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(k=>k!==STATIC_CACHE && k!==DYNAMIC_CACHE).map(k=>caches.delete(k))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  const req = e.request;
  if (req.method !== 'GET') return;
  // Cache-first cho static
  if (STATIC_ASSETS.some(u=>req.url.includes(u.replace('./','')))){
    e.respondWith(caches.match(req).then(r=>r || fetch(req)));
    return;
  }
  // Network-first + dynamic cache
  e.respondWith((async ()=>{
    try{
      const res = await fetch(req);
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(req, res.clone());
      return res;
    }catch(_){
      const cached = await caches.match(req);
      return cached || new Response('Offline', {status:200, headers:{'Content-Type':'text/plain'}});
    }
  })());
});
