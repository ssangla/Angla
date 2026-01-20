// Service Worker for Portfolio PWA
// Version 1.0.0

const CACHE_NAME = 'dev-portfolio-v1';
const RUNTIME_CACHE = 'dev-portfolio-runtime-v1';

// Files to cache on install
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json'
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// ========================================
// Install Event - Cache static assets
// ========================================
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[Service Worker] Skip waiting');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Precaching failed:', error);
      })
  );
});

// ========================================
// Activate Event - Clean up old caches
// ========================================
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim();
      })
  );
});

// ========================================
// Fetch Event - Serve from cache or network
// ========================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Apply caching strategy based on request type
  if (request.destination === 'document') {
    // HTML pages - Network first, fall back to cache
    event.respondWith(networkFirst(request));
  } else if (request.destination === 'image') {
    // Images - Cache first, fall back to network
    event.respondWith(cacheFirst(request));
  } else {
    // Other resources - Stale while revalidate
    event.respondWith(staleWhileRevalidate(request));
  }
});

// ========================================
// Cache Strategies Implementation
// ========================================

/**
 * Cache First Strategy
 * Try cache first, fall back to network
 * Good for: Images, fonts, static assets
 */
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Cache first failed:', error);
    return new Response('Offline - Resource not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

/**
 * Network First Strategy
 * Try network first, fall back to cache
 * Good for: HTML pages, API calls
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network failed, falling back to cache');

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for HTML requests
    if (request.destination === 'document') {
      return caches.match('./index.html');
    }

    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

/**
 * Stale While Revalidate Strategy
 * Return cached version immediately, update cache in background
 * Good for: CSS, JS files
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request).then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    });

    return cachedResponse || fetchPromise;
  } catch (error) {
    console.error('[Service Worker] Stale while revalidate failed:', error);

    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// ========================================
// Background Sync (for form submissions)
// ========================================
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);

  if (event.tag === 'sync-form-submissions') {
    event.waitUntil(syncFormSubmissions());
  }
});

async function syncFormSubmissions() {
  try {
    // Get pending form submissions from IndexedDB
    // This would be implemented if using IndexedDB for offline form storage
    console.log('[Service Worker] Syncing form submissions...');

    // Example: Send stored form data to server
    // const submissions = await getStoredSubmissions();
    // for (const submission of submissions) {
    //   await fetch('/api/contact', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(submission)
    //   });
    // }

    return Promise.resolve();
  } catch (error) {
    console.error('[Service Worker] Background sync failed:', error);
    return Promise.reject(error);
  }
}

// ========================================
// Push Notifications
// ========================================
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');

  let data = {
    title: 'Portfolio Update',
    body: 'Check out the latest updates!',
    icon: './images/icon-192.png',
    badge: './images/icon-72.png',
    tag: 'portfolio-notification',
    requireInteraction: false
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      console.error('[Service Worker] Error parsing push data:', error);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    requireInteraction: data.requireInteraction,
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: './images/icon-72.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: './images/icon-72.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ========================================
// Notification Click Handler
// ========================================
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('./')
    );
  } else if (event.action === 'close') {
    // Notification closed
  } else {
    // Default action - open app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // If app is already open, focus it
          for (const client of clientList) {
            if (client.url === '/' && 'focus' in client) {
              return client.focus();
            }
          }
          // Otherwise open new window
          if (clients.openWindow) {
            return clients.openWindow('./');
          }
        })
    );
  }
});

// ========================================
// Message Handler (for cache management)
// ========================================
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE)
        .then((cache) => cache.addAll(event.data.urls))
    );
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }

  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    event.waitUntil(
      getCacheSize().then((size) => {
        event.ports[0].postMessage({ cacheSize: size });
      })
    );
  }
});

// ========================================
// Utility Functions
// ========================================

/**
 * Calculate total cache size
 */
async function getCacheSize() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage,
      quota: estimate.quota,
      usageInMB: (estimate.usage / (1024 * 1024)).toFixed(2),
      quotaInMB: (estimate.quota / (1024 * 1024)).toFixed(2)
    };
  }
  return null;
}

/**
 * Clean up old runtime cache entries
 */
async function cleanupRuntimeCache() {
  const cache = await caches.open(RUNTIME_CACHE);
  const requests = await cache.keys();

  // Remove entries older than 30 days
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  const now = Date.now();

  for (const request of requests) {
    const response = await cache.match(request);
    const dateHeader = response.headers.get('date');

    if (dateHeader) {
      const date = new Date(dateHeader);
      if (now - date.getTime() > maxAge) {
        await cache.delete(request);
        console.log('[Service Worker] Removed old cache entry:', request.url);
      }
    }
  }
}

// Run cleanup periodically
setInterval(() => {
  cleanupRuntimeCache();
}, 24 * 60 * 60 * 1000); // Once per day

console.log('[Service Worker] Loaded successfully');
