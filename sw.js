// ============================================================================
// Service Worker: Inspección Visual PWA
// Estrategia: Cache First con precaching del Application Shell
// Restricción académica: 100% Vanilla JS, Promesas puras (.then / .catch), SIN async/await
// ============================================================================

var NOMBRE_CACHE = 'inspeccion-pwa-v2';

var ARCHIVOS_PRECACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Evento Install: se ejecuta cuando el navegador instala el Service Worker
self.addEventListener('install', function (evento) {
  evento.waitUntil(
    caches.open(NOMBRE_CACHE)
      .then(function (cache) {
        return cache.addAll(ARCHIVOS_PRECACHE);
      })
      .then(function () {
        return self.skipWaiting();
      })
      .catch(function (error) {
        console.error('Error al precachear recursos en el Service Worker:', error);
      })
  );
});

// Evento Activate: limpieza de cachés antiguas para garantizar frescura
self.addEventListener('activate', function (evento) {
  evento.waitUntil(
    caches.keys()
      .then(function (clavesDeCache) {
        return Promise.all(
          clavesDeCache.map(function (clave) {
            if (clave !== NOMBRE_CACHE) {
              return caches.delete(clave);
            }
          })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

// Evento Fetch: Estrategia Cache First (busca en caché; si no existe, consulta la red)
self.addEventListener('fetch', function (evento) {
  // Solo interceptar solicitudes GET del mismo origen
  if (evento.request.method !== 'GET') {
    return;
  }

  evento.respondWith(
    caches.match(evento.request)
      .then(function (respuestaEnCache) {
        if (respuestaEnCache) {
          return respuestaEnCache;
        }

        // Si no está en caché, solicitar a la red
        return fetch(evento.request)
          .then(function (respuestaRed) {
            // Si la respuesta es válida, clonar y guardar dinámicamente en caché
            if (!respuestaRed || respuestaRed.status !== 200 || respuestaRed.type !== 'basic') {
              return respuestaRed;
            }

            var respuestaParaCache = respuestaRed.clone();
            caches.open(NOMBRE_CACHE)
              .then(function (cache) {
                cache.put(evento.request, respuestaParaCache);
              })
              .catch(function (err) {
                console.warn('No se pudo cachear recurso dinámico:', err);
              });

            return respuestaRed;
          })
          .catch(function (errorRed) {
            console.warn('Fallo de red al solicitar recurso:', evento.request.url, errorRed);
            // Si es una navegación y no hay red ni caché, se podría retornar index.html
            return caches.match('./index.html');
          });
      })
  );
});
