// Saves the panel page on the phone after the first scan, so later scans open without internet.
const CACHE = "panel-page-v1";
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "./index.html"])).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.mode !== "navigate") return;
  // Open the saved copy at once (fast on weak site signal); refresh it in the background when online.
  const fresh = fetch(e.request).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put("./", copy)); }
    return r;
  });
  e.respondWith(caches.match("./").then(saved => saved || fresh));
  e.waitUntil(fresh.catch(() => {}));
});
