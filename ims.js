var ims = {
  defaults: {
    absoluteUrl: _spPageContextInfo.siteAbsoluteUrl,
    scripts: [
      "api/column.js",
      "api/list.js",
      "api/person.js",
      "dist/js/polyfill.js",
      "dist/css/style.js",
      "dist/js/svg.js",
      "tools/notification.js",
    ],
    show: !window.ims_show,
    tools: {
      meatball: {
        scripts: ["api/chat.js", "tools/meatball.js"],
        show: !window.ims_meatball_show,
      },
    },
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

  function scriptBuilder(path) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = ims.defaults.absoluteUrl + "/SiteAssets/ims/" + path;
    script.defer = true;
    script.async = false;
    document.body.appendChild(script);
    return script;
  }

  function loadScripts() {
    var scriptArr = ims.defaults.scripts;

    if (ims.defaults.tools.meatball.show) {
      scriptArr = scriptArr.concat(ims.defaults.tools.meatball.scripts);
    }

    scriptArr = Object.keys(
      scriptArr.reduce(function (acc, path, index) {
        acc[path] = index;
        return acc;
      }, {})
    );

    scriptArr.map(scriptBuilder).map(function (script, i) {
      if (i == scriptArr.length - 1) {
        script.addEventListener("load", function () {
          if (!window.ims_meatball_show) {
            ims.chat = chat;
          }
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
