// Haulist service worker: keeps the app shell cached so it opens instantly / offline.
// Bump VERSION whenever you upload a new index.html so phones get the update.
const VERSION = 'haulist-v0.6.5';
const SHELL = ['./', 'index.html', 'privacy.html', 'config.js', 'manifest.json', 'icon.svg', 'icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   // never cache Supabase/API calls
  // network first (fresh app), fall back to cache when offline
  e.respondWith(fetch(e.request, {cache:'no-cache'}).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put(e.request, c)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
