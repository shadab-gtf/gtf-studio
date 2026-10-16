/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;
const CACHE = "gtf-studio-v2";
const SHELL = [
  "/",
  "/dashboard",
  "/projects",
  "/templates",
  "/offline",
  "/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/manifest.webmanifest",
];
self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(SHELL);
      const assets = new Set<string>([
        "/fonts/manrope-latin-wght-normal.woff2",
        "/fonts/catalog.json",
      ]);
      for (const route of SHELL.filter((path) => !path.includes("."))) {
        const response = await cache.match(route);
        if (!response) continue;
        const html = await response.text();
        for (const match of html.matchAll(
          /(?:src|href)="(\/_next\/static\/[^" ]+)"/g,
        ))
          assets.add(match[1].replace(/&amp;/g, "&"));
      }
      await Promise.all([...assets].map((url) => cache.add(url)));
      await self.skipWaiting();
    })(),
  );
});
self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("gtf-studio-") && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/__next")
  )
    return;
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/fonts/")
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then(async (response) => {
            if (response.ok)
              await (await caches.open(CACHE)).put(request, response.clone());
            return response;
          }),
      ),
    );
  } else if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok)
            await (await caches.open(CACHE)).put(request, response.clone());
          return response;
        })
        .catch(
          async () =>
            (await caches.match(request)) ??
            (await caches.match("/offline")) ??
            new Response("Reconnect to finish setting up offline access.", {
              headers: { "Content-Type": "text/plain" },
            }),
        ),
    );
  }
});
export {};
