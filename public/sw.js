const CACHE_NAME = "skillify-v1";
const MAX_RETRIES = 3;

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== "GET") return;

  const isAsset = url.pathname.startsWith("/assets/");
  const isHTML = event.request.mode === "navigate";

  if (isAsset) {
    event.respondWith(
      (async () => {
        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
          try {
            const cache = await caches.open(CACHE_NAME);
            const cached = await cache.match(event.request);
            if (cached) return cached;

            const response = await fetch(event.request);
            if (response.ok) {
              cache.put(event.request, response.clone());
              return response;
            }

            if (response.status === 404) {
              await caches.delete(CACHE_NAME);
              if (attempt < MAX_RETRIES) {
                await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
                continue;
              }
            }

            return response;
          } catch (err) {
            if (attempt < MAX_RETRIES) {
              await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
              continue;
            }
            throw err;
          }
        }
      })()
    );
    return;
  }

  if (isHTML) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request);
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, response.clone());
          return response;
        } catch (err) {
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match(event.request);
          if (cached) return cached;
          throw err;
        }
      })()
    );
    return;
  }
});
