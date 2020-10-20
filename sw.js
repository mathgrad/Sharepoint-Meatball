var CACHE_NAME = "meatball-cache";
var urlsToCache = ["/SiteAssets/meatball.js"];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function(cache) {
        console.log("Opened Cache");
        console.log("Cache: ", cache);
        console.log("urlsToCache: ", urlsToCache);
        return cache.addAll(urlsToCache);
      })
      .catch(function(err) {
        console.error("Install failed: ", err);
      })
  );
});

self.addEventListener("fetch", function(event) {
  event.respondWith(
    cache.match(event.request).then(function(response) {
      if (response) {
        return response;
      }
      console.log("Fetch Cache");
      return fetch(event.request)
        .then(function(response) {
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            var responseToCache = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, responseToCache);
            });
            return response;
          }
        })
        .catch(function(err) {
          console.error("Fetch failed: ", err);
        });
    })
  );
});
