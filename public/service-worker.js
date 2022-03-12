const FILES_TO_CACHE = [
    "/",
    "./index.html",
    "./js/index.js",
    "./js/idb.js", 
    "./css/styles.css",
    "./icons/icon-72x72.png",
    "./icons/icon-96x96.png",
    "./icons/icon-128x128.png",
    "./icons/icon-144x144.png",
    "./icons/icon-152x152.png",
    "./icons/icon-192x192.png",
    "./icons/icon-384x384.png",
    "./icons/icon-512x512.png",
    "./manifest.json"
  ];

const APP_PREFIX = 'BudgetBinder-';     
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache :' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    )
})

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keyList) {
            let keeplist =keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            })
            keeplist.push(CACHE_NAME);

            return Promise.all(
                keyList.map(function(key, i) {
                    if (keeplist.indexOf(key) === -1) {
                        console.log('deleting');
                        return caches.delete(keyList[i]);
                    }
                })
            )
        })
    )
})

// self.addEventListener('fetch', function (e) {
//     console.log('fetch request : ' + e.request.url)
//     e.respondWith(
//         caches.match(e.request).then(function (request) {
//             if (request) {
//                 console.log('cache initiated!')
//                 return request
//             } else {
//                 console.log('Not cached!')
//                 return fetch(e.request)
//             }
//         })
//     )
//   })

// evt

self.addEventListener('fetch', function(e) {
    if (e.request.url.includes('/api/')) {
      e.respondWith(
        caches
          .open(CACHE_NAME)
          .then(cache => {
            return fetch(e.request)
              .then(response => {
                if (response.status === 200) {
                  cache.put(e.request.url, response.clone());
                }
  
                return response;
              })
              .catch(err => {
                return cache.match(e.request);
              });
          })
          .catch(err => console.log(err))
      );
      return;
    }
  
    e.respondWith(
      fetch(e.request).catch(function() {
        return caches.match(e.request).then(function(response) {
          if (response) {
            return response;
          } else if (e.request.headers.get('accept').includes('text/html')) {
          return caches.match('/');
        }
      });
    })
  );
});

