const CACHE_NAME = "lanka-map-v1";

// Static assets to pre-cache
const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/icon.svg",
];

// Install: pre-cache shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
//  - API routes: network-first, fall back to cache
//  - Map tiles (OpenStreetMap): cache-first with 7-day expiry
//  - Everything else: network-first, fall back to cache
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Map tiles — cache-first
  if (url.hostname.includes("tile.openstreetmap.org")) {
    event.respondWith(
      caches.open("lanka-map-tiles").then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
    );
    return;
  }

  // API routes — network-first
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && request.method === "GET") {
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Default — network-first
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
