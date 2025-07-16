// Define a unique cache name for this version of the app
const CACHE_NAME = 'nuevo-quasar-cache-v8'; // Cache version updated

// List all the files and resources that need to be cached for offline use
const URLS_TO_CACHE = [
  '/',
  '/index.html?v=8',
  '/index.css?v=8',
  '/manifest.json?v=8',
  // App icons for PWA
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable.png',
  // Core TSX/TS files
  '/index.tsx?v=8',
  '/App.tsx',
  '/types.ts',
  '/services/geminiService.ts',
  // Components
  '/components/ActionPlan.tsx',
  '/components/CalendarView.tsx',
  '/components/Dashboard.tsx',
  '/components/Goals.tsx',
  '/components/InfoView.tsx',
  '/components/PomodoroTimer.tsx',
  '/components/Purpose.tsx',
  '/components/Reflection.tsx',
  '/components/StatisticsView.tsx',
  '/components/common/Chart.tsx',
  '/components/common/ErrorBoundary.tsx',
  '/components/common/Modal.tsx',
  '/components/common/Spinner.tsx',
  '/components/icons/Icon.tsx',
  // Contexts
  '/contexts/NotificationContext.tsx',
  // External resources
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  // Import map dependencies
  'https://esm.sh/react@18.2.0',
  'https://esm.sh/react-dom@18.2.0/client',
  'https://esm.sh/chart.js@^4.5.0',
  'https://esm.sh/@google/genai',
];

// Install event: This is triggered when the service worker is first installed.
self.addEventListener('install', event => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching resources');
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch(err => {
        console.error('Failed to cache resources during install:', err);
      })
  );
});

// Activate event: This is used to clean up old caches.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service worker activated and old caches cleaned.');
      return self.clients.claim(); // Take control of all open clients.
    })
  );
});


// Fetch event: This is triggered for every network request made by the app.
self.addEventListener('fetch', event => {
  const { request } = event;

  // Use a "Network First, falling back to Cache" strategy for navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // If fetch is successful, clone it and cache it.
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          // If fetch fails (offline), try to get the main page from the cache.
          return caches.match('/');
        })
    );
    return;
  }

  // Use a "Cache First, falling back to Network" strategy for all other requests (CSS, JS, images, etc.)
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        // If we find a response in the cache, return it.
        if (cachedResponse) {
          return cachedResponse;
        }

        // If not, fetch it from the network.
        return fetch(request).then(networkResponse => {
          // If the fetch is successful, clone it, cache it, and return it.
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(request, responseToCache);
              });
          }
          return networkResponse;
        });
      })
  );
});