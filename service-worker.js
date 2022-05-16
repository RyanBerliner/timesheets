// https://web.dev/offline-cookbook/

const ASSETS_STATIC = [
  'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
  'https://unpkg.com/react@17.0.2/umd/react.production.min.js',
  'https://unpkg.com/react-dom@17.0.2/umd/react-dom.production.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/bs5-react-elements@2.1.0/dist/bs5-react-elements.min.js',
  'app.js',
  'index.html',
  'manifest.json',
  'icons-192.png',
  'icons-512.png',
];

// This is deployed a my github pages site, which contains other projects
// and sites on the same domain. Because of this we should prefix the caches
// with something specific to timesheets so we lessen the possiblity of conflicts

const CACHE_PREFIX = 'timesheets-sw-assets';
const CACHE_VERSION = '2022.05.15.0';

const EXPECTED_CACHES = [
  `${CACHE_PREFIX}static-${CACHE_VERSION}`,
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(`${CACHE_PREFIX}static-${CACHE_VERSION}`).then(function (cache) {
      return cache.addAll(ASSETS_STATIC);
    }),
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (cacheName) {
            const isOldCache = cacheName.startsWith(CACHE_PREFIX) &&
              EXPECTED_CACHES.indexOf(cacheName) < 0;

            return [
              // assets-static-v* are legacy from when asset caching
              // was implemented poorly. Some older user may still need
              // these deleted - so lets keep this here
              'assets-static-v1',
              'assets-static-v2',
              'assets-static-v3',
            ].indexOf(cacheName) >= 0 || isOldCache;
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

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
