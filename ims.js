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
      "dist/js/modal/modal.js",
      "tools/notification.js",
    ],
    show: !window.ims_show,
    tools: {
      easy: {
        scripts: [
          "dist/js/modal/meatball/color.js",
          "dist/js/modal/meatball/toggle.js",
          "dist/js/modal/meatball/type.js",
          "tools/menu/menu.js",
          "tools/easy.js",
        ],
        hide: !window.ims_easy_hide,
      },
      meatball: {
        scripts: ["api/chat.js", "tools/meatball.js"],
        defaults: [],
        hide: !window.ims_meatball_hide,
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

    if (ims.defaults.tools.easy.hide) {
      scriptArr = scriptArr.concat(ims.defaults.tools.easy.scripts);
    }

    if (ims.defaults.tools.meatball.hide) {
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
          getDefaults();
          startMeatball();
          easyStart();
        });
      }
    });
  }

  function getDefaults() {
    function cbFinal(error, props) {
      if (error) {
        console.error(error);
        return;
      }

      ims.sharepoint.list.get({ listName: "IMS_SHAREPOINT" }, cbCreateList);
    }

    function cbCreateOverrides(error, props) {
      if (error) {
        return;
      }

      ims.sharepoint.column.create(
        {
          colTitle: "Overrides",
          fieldType: 3,
          required: "false",
          uniqueValue: "false",
          listName: "IMS_SHAREPOINT",
        },
        cbFinal
      );
    }

    function cbCreateStatus(error, props) {
      if (error) {
        console.error(error);
        return;
      }
      ims.sharepoint.column.create(
        {
          colTitle: "Status",
          fieldType: 2,
          required: "false",
          uniqueValue: "false",
          listName: "IMS_SHAREPOINT",
        },
        cbCreateOverrides
      );
    }

    function cbCreateMessage(error, props) {
      if (error) {
        console.error(error);
      }
      ims.sharepoint.column.create(
        {
          colTitle: "Message",
          fieldType: 2,
          required: "false",
          uniqueValue: "false",
          listName: "IMS_SHAREPOINT",
        },
        cbCreateStatus
      );
    }

    function cbCreateList(error, props) {
      if (error) {
        ims.sharepoint.list.create(
          { listName: "IMS_SHAREPOINT" },
          cbCreateMessage
        );
        console.error(error);
        return;
      }

      if (props) {
        console.log(props);
        if (props.hasOwnProperty("Id")) {
          ims.defaults.listGUID = props.Id;
          return;
        }
      }
    }

    ims.sharepoint.list.item.gets({ listName: "IMS_SHAREPOINT" }, cbCreateList);
  }

  window.addEventListener("load", loadScripts);
})();
