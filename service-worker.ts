const CACHE_NAME = 'dental-os-v1';
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/index.tsx',
    'https://cdn.tailwindcss.com',
    'https://aistudiocdn.com/react@^19.1.1',
    'https://aistudiocdn.com/react-dom@^19.1.1/',
    'https://aistudiocdn.com/react@^19.1.1/',
    'https://aistudiocdn.com/@google/genai@^1.21.0',
    'https://aistudiocdn.com/uuid@^13.0.0',
    'https://aistudiocdn.com/react-qr-code@^2.0.18',
];

// Install event: cache core assets
self.addEventListener('install', (event: any) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching core assets');
                return cache.addAll(URLS_TO_CACHE).catch(err => {
                    console.error('Failed to cache assets:', err);
                });
            })
    );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event: any) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});


// Fetch event: serve from cache, fall back to network
self.addEventListener('fetch', (event: any) => {
    // We only want to cache GET requests.
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // If we have a cached response, return it
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Otherwise, fetch from the network
                return fetch(event.request).then(
                    networkResponse => {
                        // If the fetch was successful, clone it and cache it for next time
                        if (networkResponse && networkResponse.status === 200) {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                });
                        }
                        return networkResponse;
                    }
                ).catch(error => {
                    console.error('Service Worker: Fetch failed.', error);
                    // You could return a custom offline page here if you had one in the cache.
                });
            })
    );
});
