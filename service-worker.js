// キャッシュ名を変えるとアプリ本体を更新できます(新しいバージョンをデプロイしたら v1 → v2 のように上げてください)
const CACHE_NAME = 'ward-photo-app-v2';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './jszip.min.js',
  './xlsx.full.min.js',
  './pptxgen.bundle.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// ネットワークがあれば最新を取りに行きつつ、失敗時はキャッシュへフォールバック(病棟内の電波が弱くても使えるように)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
