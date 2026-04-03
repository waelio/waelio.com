// src/service-worker.ts
var CACHE_NAME = "waelio-cache-v13";
var ASSET_VERSION = "20260403";
function versionedAsset(path) {
  return `${path}?v=${ASSET_VERSION}`;
}
var APP_SHELL = [
  "/",
  "/index.html",
  versionedAsset("/styles.css"),
  versionedAsset("/app.js"),
  versionedAsset("/theme.js"),
  versionedAsset("/ga.js"),
  versionedAsset("/consent.js"),
  "/favicon.svg",
  "/social-card.svg",
  versionedAsset("/manifest.webmanifest"),
  "/about.html",
  "/contact.html",
  "/privacy.html",
  "/terms.html",
  "/thanks.html",
  "/api.html",
  "/wall.html"
];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  void self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((key) => key !== CACHE_NAME ? caches.delete(key) : Promise.resolve(false)))));
  void self.clients.claim();
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  const wantsHtml = request.mode === "navigate" || (request.headers.get("accept") ?? "").includes("text/html");
  if (wantsHtml || url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request).then((response) => {
      const responseClone = response.clone();
      void caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone)).catch(() => {
      });
      return response;
    }).catch(async () => await caches.match(request) ?? Response.error()));
    return;
  }
  event.respondWith(caches.match(request).then((cachedResponse) => cachedResponse ?? fetch(request)));
});
