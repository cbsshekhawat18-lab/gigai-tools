/*
 * Gigai Tools service worker — intelligent caching + offline mode.
 *
 * Strategy (conservative, quota-friendly):
 *   • /_next/static/**        → cache-first (content-hashed, immutable)
 *   • small same-origin assets (css/js/fonts/images/svg/pdfjs)
 *                              → stale-while-revalidate
 *   • page navigations        → network-first, falling back to the cached copy
 *                                (so every page you've visited works offline),
 *                                then the cached homepage as a last resort
 *   • /models/ and /ffmpeg/   → NOT cached here (tens of MB; avoids blowing the
 *                                origin storage quota — those tools need network
 *                                on first use like today)
 *   • cross-origin (ads, etc.) → untouched, straight to network
 *
 * Bump VERSION to invalidate all caches on deploy of breaking changes; nginx
 * serves /sw.js with `Cache-Control: no-cache`, so updates propagate on the
 * next visit.
 */
// v3 (2026-08-11): several deploys that deleted old files removed old hashed chunks
// while v2 caches still held HTML referencing them — the exact combination that
// produced the July "unstyled site" outage. Bumping invalidates every cache so
// returning visitors fetch fresh HTML instead of pointing at deleted assets.
// v4 (2026-08-12): bumped to drop every page cached under v3. The HTML
// Cache-Control previously carried stale-while-revalidate=604800, so
// browsers held week-old pages; clearing the SW caches too means no client
// keeps serving itself a pre-fix page from any layer.
const VERSION = "v87";
const PAGE_CACHE = `gt-pages-${VERSION}`;
const ASSET_CACHE = `gt-assets-${VERSION}`;
const STATIC_CACHE = `gt-static-${VERSION}`;
const KNOWN = new Set([PAGE_CACHE, ASSET_CACHE, STATIC_CACHE]);
/** Cap the navigation cache so it never grows unbounded. */
const MAX_PAGES = 80;

/** Big vendored payloads we deliberately do NOT cache (storage quota). */
const SKIP_PREFIXES = ["/models/", "/ffmpeg/"];

self.addEventListener("install", (event) => {
  // Warm the shell: homepage + workspace (both cheap, high-value offline).
  event.waitUntil(
    caches
      .open(PAGE_CACHE)
      .then((cache) => cache.addAll(["/", "/workspace"]).catch(() => {}))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !KNOWN.has(k)).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

/** Trim a cache to `max` entries (oldest first — insertion order). */
async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= max) return;
  await Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)));
}

/** Network-first for navigations; cache successful pages for offline reuse. */
async function handleNavigation(request) {
  const url = new URL(request.url);
  const key = new Request(url.origin + url.pathname); // normalise ?query
  try {
    const fresh = await fetch(request);
    if (fresh.ok) {
      const cache = await caches.open(PAGE_CACHE);
      cache.put(key, fresh.clone());
      trim(PAGE_CACHE, MAX_PAGES);
    }
    return fresh;
  } catch {
    const cached = await caches.match(key, { cacheName: PAGE_CACHE });
    if (cached) return cached;
    const home = await caches.match("/", { cacheName: PAGE_CACHE });
    if (home) return home;
    return new Response(
      "<!doctype html><meta charset=utf-8><title>Offline</title><body style=\"font-family:system-ui;display:grid;place-items:center;min-height:100vh;margin:0\"><div style=\"text-align:center\"><h1>You’re offline</h1><p>Pages you’ve visited before are available offline.</p></div>",
      { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }
}

/** Cache-first for immutable hashed chunks. */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request, { cacheName });
  if (cached) return cached;
  const fresh = await fetch(request);
  if (fresh.ok) (await caches.open(cacheName)).put(request, fresh.clone());
  return fresh;
}

/** Stale-while-revalidate for small mutable assets. */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const refresh = fetch(request)
    .then((fresh) => {
      if (fresh.ok) cache.put(request, fresh.clone());
      return fresh;
    })
    .catch(() => undefined);
  return cached ?? (await refresh) ?? fetch(request);
}

const ASSET_RE = /\.(css|js|mjs|woff2?|ttf|png|jpe?g|webp|avif|gif|svg|ico|json|wasm)$/;

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // ads/analytics untouched
  if (SKIP_PREFIXES.some((p) => url.pathname.startsWith(p))) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
  if (ASSET_RE.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
  }
});
