var ims = {
  defaults: {
    absoluteUrl: _spPageContextInfo.siteAbsoluteUrl,
  },
  sharepoint: {},
};

(function () {
  var scripts = [].slice.call(document.getElementsByTagName("script"));
  var imo = scripts.filter(function (script) {
    if (script.src.indexOf("ims.js") > -1) {
      return script;
    }
  });
  var baseUrl = imo[0].src.substring(0, imo[0].src.indexOf("ims.js"));

  var requiredScripts = [
    "api/chat.js",
    "api/column.js",
    "api/list.js",
    "api/person.js",
    "dist/js/polyfill.js",
    "dist/css/style.js",
    "dist/js/svg.js",
    "tools/notification.js",
    "tools/meatball.js",
  ];
  function scriptBuilder(path) {
    var run =
      path === "dist/js/polyfill.js" ? !Object.hasOwnProperty("values") : true;

    if (run) {
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.src = baseUrl + path;
      script.defer = true;
      script.async = false;
      document.body.appendChild(script);
      return script;
    }
  }

  function loadScripts() {
    requiredScripts
      .map(function (src) {
        return scriptBuilder(src);
      })
      .map(function (script, i) {
        if (i == requiredScripts.length - 1) {
          script.addEventListener("load", function () {
            ims.chat = chat;
            ims.sharepoint.color = Color;
            ims.sharepoint.column = column;
            ims.sharepoint.list = list;
            ims.sharepoint.person = person;
            ims.sharepoint.notification = Pantry;
            ims.sharepoint.style = style;
            startMeatball();
          });
        }
      });
  }
  loadScripts();
})();
