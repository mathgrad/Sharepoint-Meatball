if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker
      .register("/sites/imef/IMO/StarterSite/SiteAssets/sw.js")
      .then(
        function(registration) {
          console.log(
            "ServiceWorker registration successful with scope: ",
            registration.scope
          );
        },
        function(err) {
          console.error("ServiceWorker Registration Failed: ", err);
        }
      );
  });
}
