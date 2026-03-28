// Service Worker for Jr's Grill PWA
const CACHE_NAME = 'jrs-grill-v2';
const STATIC_CACHE = 'jrs-grill-static-v2';
const DYNAMIC_CACHE = 'jrs-grill-dynamic-v2';

// Static assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-72x72.png',
    '/icon-96x96.png',
    '/icon-128x128.png',
    '/icon-144x144.png',
    '/icon-152x152.png',
    '/icon-192x192.png',
    '/icon-384x384.png',
    '/icon-512x512.png',
    '/placeholder-food.png',
    '/steakhouse-hero.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch((err) => {
                console.log('[SW] Failed to cache some assets:', err);
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - network first for API, cache first for static
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip cross-origin requests
    if (url.origin !== self.location.origin) return;

    // API requests - network first, no cache
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .catch(() => {
                    return new Response(
                        JSON.stringify({ error: 'Offline', message: 'Please check your connection' }),
                        { headers: { 'Content-Type': 'application/json' } }
                    );
                })
        );
        return;
    }

    // Static assets - cache first, then network
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request)
                    .then((networkResponse) => {
                        // Don't cache non-successful responses
                        if (!networkResponse || networkResponse.status !== 200) {
                            return networkResponse;
                        }

                        // Clone and cache the response
                        const responseToCache = networkResponse.clone();
                        caches.open(DYNAMIC_CACHE)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });

                        return networkResponse;
                    })
                    .catch(() => {
                        // Return offline page for navigation requests
                        if (request.mode === 'navigate') {
                            return caches.match('/').then((cached) => {
                                return cached || new Response(
                                    '<html><body><h1>Offline</h1><p>Please check your connection and try again.</p></body></html>',
                                    { headers: { 'Content-Type': 'text/html' } }
                                );
                            });
                        }
                        return new Response('', { status: 408, statusText: 'Offline' });
                    });
            })
    );
});

// Push notification event
self.addEventListener('push', (event) => {
    console.log('[SW] Push received');
    const data = event.data ? event.data.json() : {};

    const title = data.title || "Jr's Grill";
    const options = {
        body: data.body || 'You have a new notification',
        icon: '/icon-192x192.png',
        badge: '/icon-96x96.png',
        data: data.url || '/',
        vibrate: [200, 100, 200],
        tag: data.tag || 'jrs-grill-notification',
        actions: data.actions || [
            { action: 'open', title: 'Open' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked');
    event.notification.close();

    if (event.action === 'dismiss') return;

    const urlToOpen = event.notification.data || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // Check if there's already a window open
                for (const client of windowClients) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        client.navigate(urlToOpen);
                        return client.focus();
                    }
                }
                // Open new window if none exists
                return clients.openWindow(urlToOpen);
            })
    );
});

// Background sync event (for offline order submissions)
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);

    if (event.tag === 'sync-orders') {
        event.waitUntil(syncOrders());
    }
});

async function syncOrders() {
    // Placeholder for syncing offline orders when back online
    console.log('[SW] Syncing offline orders...');
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-menu') {
        event.waitUntil(updateMenuCache());
    }
});

async function updateMenuCache() {
    console.log('[SW] Updating menu cache in background...');
}
