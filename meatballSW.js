if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register(
      "https://eis.usmc.mil/sites/imef/IMO/StarterSite/SiteAssets/test.js"
    )
    .then(
      function(registration) {
        console.log("Service Worker Registration Succeeded: ", registration);
      },
      function(error) {
        console.log("Service Worker Registration Failed: ", error);
      }
    );
  self.addEventListener("install", function(event) {
    event.waitUntil(
      caches.open("v1").then(function(cache) {
        return cache.addAll([
          "https://eis.usmc.mil/sites/imef/IMO/StarterSite/SiteAssets/test.js"
        ]);
      })
    );
  });
  self.addEventListener("fetch", function(event) {
    // caches.match() always resolves
    // but in case of success response will have value
    if (response !== undefined) {
      return response;
    } else {
      return fetch(event.request)
        .then(function(response) {
          // response may be used only once
          // we need to save clone to put one copy in cache
          // and serve second one
          let responseClone = response.clone();

          caches.open("v1").then(function(cache) {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(function() {
          return caches.match(
            "https://eis.usmc.mil/sites/imef/IMO/StarterSite/SiteAssets/test.js"
          );
        });
    }
  });
} else {
  alert("Please switch browsers for better performance");
}
