(function() {
  window.onload = function() {
    meatball();
  };

  window.addEventListener("hashchange", function() {
    meatball();
  });

  function meatball() {
    var overrides = [
      { color: "green", text: "up" },
      { color: "red", text: "down" },
      { color: "yellow", text: "degraded" }
    ];
    //add jquery here.
    var linkBootstrap = document.createElement("link");
    var scriptAjax = document.createElement("script");
    var scriptBootstrap = document.createElement("script");
    linkBootstrap.type = "text/css";
    scriptAjax.type = "text/javascript";
    scriptBootstrap.type = "text/javascript";
    linkBootstrap.href =
      "https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css";
    scriptAjax.src =
      "https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js";
    scriptBootstrap.src =
      "https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js";
    document.head.appendChild(linkBootstrap);
    document.body.appendChild(scriptAjax);
    //Waits till Ajax loads to allow full functionality of
    scriptAjax.onload = function() {
      document.body.appendChild(scriptBootstrap);
    };
    scriptBootstrap.onload = function() {
      var tables = [].slice.call(document.getElementsByTagName("table"));

      if (errorChecking(tables)) {
        console.log("No Tables Found");
        return;
      }

      //Step 2. Defaults to apply across all solutions in sharepoint.
      var defaults = [
        { color: "green", text: "up" },
        { color: "red", text: "down" },
        { color: "yellow", text: "degraded" },
        { color: "green", text: "100-90" },
        { color: "yellow", text: "89-80" },
        { color: "red", text: "79-10" },
        { color: "blue", text: "<10" }
      ];

      if (window.hasOwnProperty("overrides")) {
        defaults = defaults.concat(overrides);
        var uniqueObject = defaults.reduce(function(a, b) {
          a[b.color] = b.text;
          return a;
        }, {});
        defaults = Object.keys(uniqueObject).map(function(key) {
          return { color: key, text: uniqueObject[key] };
        });
      }

      var defaultText = defaults.map(function(a) {
        return a.text;
      });

      tables.map(function(table, ti) {
        var rows = [].slice.call(table.getElementsByTagName("tr"));
        var thead = [].slice.call(table.getElementsByTagName("th"));

        if (rows.length > 0)
          rows.map(function(row, ri) {
            var cells = [].slice.call(row.getElementsByTagName("td"));

            if (cells.length > 0)
              cells.map(function(cell, ci) {
                var pos = defaultText.indexOf(
                  cell.innerText.trim().toLowerCase()
                );

                if (pos < 0) return;

                if (table.getAttribute("id") && row.getAttribute("iid"))
                  addModal(
                    cell,
                    defaults,
                    row.getAttribute("iid").split(",")[1],
                    thead[ci],
                    table.getAttribute("id").substring(1, 37)
                  );
              });
          });
      });
    };
  }
  function updateMeatball(status, rowIndex, header, table) {
    var site = _spPageContextInfo.webServerRelativeUrl;
    var currentListName = ctx.ListTitle;
    var listName = "SP.Data." + currentListName + "ListItem";
    var data = {
      __metadata: { type: listName },
      MeatballStatus: status
    };
    var url =
      "https://eis.usmc.mil/" +
      site +
      "/_api/web/lists('" +
      table +
      "')/items(" +
      rowIndex +
      ")?$select=" +
      header;
    $.ajax({
      url: url,
      type: "POST",
      data: JSON.stringify(data),
      headers: {
        Accept: "application/json; odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        credentials: true,
        "If-Match": "*",
        "X-HTTP-Method": "MERGE",
        "X-RequestDigest": $("#__REQUESTDIGEST").val()
      },
      success: function(data) {
        alert("Updated Meatball Successfully");
        location.reload();
        return false;
      },
      error: function(error) {
        alert(
          "Error: Update Request Failed. Please Contact the 1MEF IMO",
          console.log(JSON.stringify(error))
        );
      }
    });
  }
  /*
    This creates the modal for each cell
  */
  function addModal(target, defaults, rowIndex, header, table) {
    var border = "1px solid black";
    var pad = "2.5px";
    var modal = document.createElement("div");
    //Step 1, creating child elements of the modal
    //Step 1a, paragraph element
    var paragraph = document.createElement("p");
    paragraph.innerText = target.innerText;
    //Step 1b, button element
    var buttonToggle = document.createElement("button");
    buttonToggle.innerText = " Toggle ";
    buttonToggle.style.margin = pad;
    paragraph.appendChild(buttonToggle);
    //Step 1c, option element construction
    var options = document.createElement("div");
    options.style.display = "none";
    options.style.padding = pad;
    options.style.border = border;
    //Step 1d, adding in options
    defaults.forEach(function(ele, index) {
      var option = document.createElement("p");
      option.className += " pointer";
      option.innerText = ele.text;
      option.style.color = ele.color;
      option.addEventListener("click", function() {
        updateMeatball(ele.text, rowIndex, header, table);
      });
      options.appendChild(option);
    });
    //Step 1e, add paragraph
    modal.appendChild(paragraph);
    modal.appendChild(options);
    modal.style.padding = pad;
    modal.style.zIndex = "1";
    modal.style.backgroundColor = "white";
    modal.style.border = border;
    //Step 2, toggle button event
    buttonToggle.addEventListener("click", function() {
      var style = options.style.display;
      var change = false;
      change = style === "block";
      change
        ? (options.style.display = "none")
        : (options.style.display = "block");
    });
    //Step 3, mouse enter event, adds modal to body to display
    target.onmouseenter = function() {
      document.body.appendChild(modal);
      modal.style.position = "fixed";
      modal.style.left = target.getBoundingClientRect().left + "px";
      modal.style.top = target.getBoundingClientRect().top + "px";
    };
    //Step 4, mouse leave event, removes modal from body
    modal.onmouseleave = function() {
      options.style.display = "none";
      document.body.removeChild(modal);
    };
  }

  //True, error.  False, no error.
  function errorChecking(obj) {
    if (!obj) {
      console.error("Undefined");
      return true;
    }

    if (obj.length === 0) {
      console.error("Nothing in the array");
      return true;
    }

    return false;
  }
})();
