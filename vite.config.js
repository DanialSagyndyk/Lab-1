import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createHash } from "node:crypto";

function productHubServiceWorker() {
  return {
    name: "producthub-service-worker",
    generateBundle(_, bundle) {
      const assets = Object.keys(bundle)
        .filter((file) => /\.(js|css|woff2?|ttf|otf|svg|png|webp|jpg|jpeg|ico)$/.test(file))
        .map((file) => `/${file}`);
      const precache = ["/", "/index.html", "/offline.html", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png", ...assets];
      const version = `producthub-${createHash("sha256").update(precache.join("|")).digest("hex").slice(0, 10)}`;
      const source = `
const VERSION = "${version}";
const SHELL_CACHE = VERSION + "-shell";
const STATIC_CACHE = VERSION + "-static";
const API_CACHE = VERSION + "-public-api";
const PRECACHE_URLS = ${JSON.stringify([...new Set(precache)])};
const MAX_API_ENTRIES = 50;
const API_ORIGIN = "https://dummyjson.com";

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await cache.addAll(PRECACHE_URLS);
    // First installation can activate immediately. Updates wait for user approval.
    if (!self.registration.active) await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith("producthub-") && ![SHELL_CACHE, STATIC_CACHE, API_CACHE].includes(name)).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

async function notifyCached(request) {
  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  clients.forEach((client) => client.postMessage({ type: "PWA_CACHED_RESPONSE", url: request.url }));
}

async function putWithTimestamp(cache, request, response) {
  const headers = new Headers(response.headers);
  headers.set("x-pwa-cache-time", String(Date.now()));
  headers.set("x-pwa-cached", "true");
  const stored = new Response(await response.clone().arrayBuffer(), { status: response.status, statusText: response.statusText, headers });
  await cache.put(request, stored);
  const keys = await cache.keys();
  if (keys.length > MAX_API_ENTRIES) {
    const dated = await Promise.all(keys.map(async (key) => {
      const item = await cache.match(key);
      return { key, time: Number(item?.headers.get("x-pwa-cache-time") || 0) };
    }));
    dated.sort((a, b) => a.time - b.time);
    for (const item of dated.slice(0, keys.length - MAX_API_ENTRIES)) await cache.delete(item.key);
  }
}

async function networkFirstApi(request) {
  const cache = await caches.open(API_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok && response.type !== "opaque") await putWithTimestamp(cache, request, response);
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      await notifyCached(request);
      return cached;
    }
    return new Response(JSON.stringify({ message: "You are offline and this public data has not been cached yet." }), { status: 503, headers: { "Content-Type": "application/json", "x-pwa-cached": "false" } });
  }
}

async function cacheFirstStatic(request) {
  const cache = await caches.open(STATIC_CACHE);
  const shell = await caches.open(SHELL_CACHE);
  const cached = await cache.match(request) || await shell.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok || response.type === "opaque") await cache.put(request, response.clone());
    return response;
  } catch {
    return new Response("", { status: 504, statusText: "Offline" });
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return; // Never cache writes or authentication operations.
  const url = new URL(request.url);

  if (url.origin === API_ORIGIN && url.pathname.startsWith("/products")) {
    event.respondWith(networkFirstApi(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      const shell = await caches.open(SHELL_CACHE);
      try {
        const response = await fetch(request);
        if (response.ok) await shell.put(request, response.clone()); // Remember routes the user has visited.
        return response;
      } catch {
        const previouslyVisited = await shell.match(request);
        if (previouslyVisited) return previouslyVisited;
        return await shell.match("/offline.html") || await shell.match("/index.html");
      }
    })());
    return;
  }

  const isStaticAsset = (url.origin === self.location.origin && /\\.(js|css|png|jpe?g|webp|svg|ico|woff2?|ttf|otf)$/.test(url.pathname))
    || request.destination === "image"
    || request.destination === "font"
    || url.hostname === "fonts.googleapis.com"
    || url.hostname === "fonts.gstatic.com";
  if (isStaticAsset) event.respondWith(cacheFirstStatic(request));
});
`;
      this.emitFile({ type: "asset", fileName: "sw.js", source });
    },
  };
}

export default defineConfig({ plugins: [react(), productHubServiceWorker()] });
