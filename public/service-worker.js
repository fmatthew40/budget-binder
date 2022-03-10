const FILES_TO_CACHE = [
    "/index.html",
    "/index.js",
    "/db.js", 
    "/style.css",
    "/manifest.json"
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

self.addEventListener('fetch', function (e) {
    console.log('fetch request : ' + e.request.url)
    e.respondWith(
        caches.match(e.request).then(function (request) {
            if (request) {
                console.log('cache initiated!')
                return request
            } else {
                console.log('Not cached!')
                return fetch(e.request)
            }
        })
    )
  })

