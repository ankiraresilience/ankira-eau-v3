/* ANKIRA EAU PWA — v3.2.0. Increment VERSION at every published update. */
const VERSION = '3.2.0';
const SCOPE = self.registration.scope;
const PREFIX = 'ankira-eau-pwa:' + SCOPE + ':';
const CACHE = PREFIX + VERSION;
const entry = new URL('index.html', SCOPE).href;
const assets = ['index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/icon-180.png','icons/maskable-512.png'].map(p=>new URL(p,SCOPE).href);
self.addEventListener('install', event => {
  event.waitUntil((async()=>{
    const cache = await caches.open(CACHE);
    await cache.addAll(assets.map(url=>new Request(url,{cache:'reload'})));
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async()=>{
    for(const key of await caches.keys()) if(key.startsWith(PREFIX)&&key!==CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});
self.addEventListener('message', event=>{if(event.data?.type==='ACTIVATE_UPDATE')event.waitUntil(self.skipWaiting());});
self.addEventListener('fetch', event => {
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url), scope=new URL(SCOPE);
  if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
  // Only cache the application shell, never API queries, maps or personal data.
  if(req.mode==='navigate'&&(url.pathname===scope.pathname||url.pathname===new URL(entry).pathname)){
    event.respondWith((async()=>{const cache=await caches.open(CACHE);return (await cache.match(entry))||fetch(req);})());return;
  }
  if(assets.includes(url.href))event.respondWith((async()=>{const cache=await caches.open(CACHE);return (await cache.match(req))||fetch(req);})());
});
