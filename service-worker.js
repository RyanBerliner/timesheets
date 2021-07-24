// https://web.dev/offline-cookbook/

const CACHED_FILES = [
  'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css',
  'https://unpkg.com/react@17/umd/react.production.min.js',
  'https://unpkg.com/react-dom@17/umd/react-dom.production.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/bs5-react-elements@0/dist/bs5-react-elements.min.js',
  'app.js',
  'index.html',
  'manifest.json',
  'icons-192.png',
  'icons-512.png',
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open('assets-static-v2').then(function (cache) {
      return cache.addAll(CACHED_FILES);
    }),
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (cacheName) {
            return [
              'assets-static-v1',
            ].indexOf(cacheName) >= 0;
          })
          .map(function (cacheName) {
            return caches.delete(cacheName);
          }),
      );
    }),
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    }),
  );
});