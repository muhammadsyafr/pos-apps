/**
 * CloudPOS Service Worker
 * Strategy: Network-first for API/auth, stale-while-revalidate for assets.
 */

const CACHE = "cloudpos-v1"

// Assets to pre-cache on install
const PRECACHE = ["/", "/manifest.json", "/assets/logo.svg"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin GET requests
  if (request.method !== "GET" || url.origin !== self.location.origin) return

  // Never cache API routes or auth — always go network
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/")) return

  // Network-first for navigation (HTML pages)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            caches.open(CACHE).then((cache) => cache.put(request, response.clone()))
          }
          return response
        })
        .catch(() => caches.match(request) || caches.match("/"))
    )
    return
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            caches.open(CACHE).then((cache) => cache.put(request, response.clone()))
          }
          return response
        })
    )
  )
})
