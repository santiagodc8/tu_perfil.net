const CACHE_NAME = "tuperfil-v1";
const OFFLINE_URL = "/offline";

// Precache: shell mínimo
const PRECACHE_URLS = [
  OFFLINE_URL,
  "/favicon.ico",
  "/apple-touch-icon.png",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
];

// Install: precache shell + offline page
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: limpiar caches viejos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first para navegación, cache-first para assets estáticos
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Solo GET requests
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Ignorar requests a admin, api, supabase
  if (
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("supabase")
  ) {
    return;
  }

  // Navegación (HTML pages): network-first con fallback a offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cachear páginas de noticias visitadas
          if (url.pathname.startsWith("/noticia/")) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // Assets estáticos (imágenes, fonts, CSS, JS): cache-first
  if (
    url.pathname.match(/\.(png|jpg|jpeg|webp|svg|ico|woff2?|css|js)$/) ||
    url.pathname.startsWith("/_next/static/")
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          })
      )
    );
    return;
  }
});
