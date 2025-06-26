const CACHE_NAME = 'achieve-hub-v1';
const STATIC_CACHE = 'static-v1';
const API_CACHE = 'api-v1';

// Critical assets to cache immediately
const CRITICAL_ASSETS = [
  '/',
  '/landing',
  '/auth',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/pages/Landing.tsx',
  '/src/components/landing/HeroSection.tsx',
  '/src/context/AuthContext.tsx'
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(CRITICAL_ASSETS);
      }),
      caches.open(API_CACHE)
    ]).then(() => {
      self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with cache-first strategy for performance
  if (url.pathname.includes('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            // Serve from cache immediately, update in background
            fetch(request).then((response) => {
              if (response.ok) {
                cache.put(request, response.clone());
              }
            }).catch(() => {
              // Network failed, but we have cache
            });
            return cachedResponse;
          }

          // Not in cache, fetch from network
          return fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => {
            // Return a basic error response for API failures
            return new Response(JSON.stringify({ error: 'Network unavailable' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        });
      })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  if (request.method === 'GET') {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(request).then((response) => {
            // Cache successful responses
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => {
            // If it's a navigation request and we're offline, serve the app shell
            if (request.mode === 'navigate') {
              return cache.match('/');
            }
            throw error;
          });
        });
      })
    );
  }
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle offline data sync when connection is restored
      syncOfflineData()
    );
  }
});

// Push notifications (for future features)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'achieve-hub-notification'
      })
    );
  }
});

// Helper function to sync offline data
async function syncOfflineData() {
  try {
    // Sync any pending data when connection is restored
    const cache = await caches.open(API_CACHE);
    // Implementation would depend on your specific offline strategy
    console.log('Background sync completed');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
} 