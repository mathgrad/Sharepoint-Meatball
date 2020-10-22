(function() {
  //Initial Load, adds functionality
  var init = function() {
    var promise = new Promise(function(resolve, reject) {
      console.log("Promise Start");
      getListItems();
    });
    promise
      .then(function(success) {
        meatball();
        console.log("Promise Ended");
      })
      .catch(function(error) {
        console.error("Promise Error: ", error);
      });
  };
  window.addEventListener("onload", function() {
    init();
  });

  //On change, adds functionality
  window.addEventListener("hashchange", function() {
    init();
  });

  //Entry Point and General Function
  function meatball(choiceData) {
    var overrides = [
      { color: "green", text: "up" },
      { color: "red", text: "down" },
      { color: "yellow", text: "degraded" }
    ];
    //add jquery here.
    var defaults = [
      { color: "green", text: "up" },
      { color: "red", text: "down" },
      { color: "yellow", text: "degraded" },
      { color: "green", text: "100-90" },
      { color: "yellow", text: "89-80" },
      { color: "red", text: "79-10" },
      { color: "blue", text: "<10" }
    ];
    //Step 1. Get all the tables -- create array
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
    var userChoices = false;
    choiceData.filter(function(data, index) {
      console.log(index);
      if (data.Title === "meatballExplained") {
        console.log("hit0");
        userChoices = data.Choices.results;
        return;
      } else {
        defaults = [
          { color: "green", text: "up" },
          { color: "red", text: "down" },
          { color: "yellow", text: "degraded" },
          { color: "green", text: "100-90" },
          { color: "yellow", text: "89-80" },
          { color: "red", text: "79-10" },
          { color: "blue", text: "<10" }
        ];
      }
    });

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


    if (userChoices) {
      var defaultText = userChoices.map(function(a) {
        return a;
      });
    } else {
      var defaultText = defaults.map(function(a) {
        return a.text;
      });
    }

    console.log("userChoices:", userChoices, "defaultText:", defaultText);

    //Step 3. Iterate over each cell and compare the inner text to the list of known defaults.

    tables.map(function(table, ti) {
      var rows = [].slice.call(table.getElementsByTagName("tr"));
      var thead = [].slice.call(table.getElementsByTagName("th"));
      if (rows.length > 0)
        rows.map(function(row, ri) {
          var cells = [].slice.call(row.getElementsByTagName("td"));
          if (cells.length > 0)
            //this checks if the cell contains the text which is in defaults, select that cell to add the modal
            cells.map(function(cell, ci) {
              var pos = defaultText.filter(a =>
                a.includes(cell.innerText.trim().toLowerCase())
              );
              console.log(
                defaultText.find(a =>
                  a.indexOf(cell.innerText.trim().toLowerCase())
                )
              );

              // );
              if (pos < 0) return;
              if (table.getAttribute("id") && row.getAttribute("iid")) {
                addModal(
                  cell,
                  defaults,
                  row.getAttribute("iid").split(",")[1],
                  thead[ci],
                  table.getAttribute("id").substring(1, 37)
                );
              }
            });
        });
    });
  }

  /* get all the choices and send to main func*/
  function getListItems() {
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
      //Create an array of all the tables on the page
      var $tables = [].slice.call(document.getElementsByTagName("table"));
      //Include only the actual lists
      $tables = $tables.filter(function(table) {
        if (table.getAttribute("class") === "ms-listviewtable") {
          return table;
        }
      });
      //Grabbing the list url
      var site = _spPageContextInfo.webServerRelativeUrl;
      //Iterate through the
      $tables.forEach(function(table, index) {
        var currentListName = table.getAttribute("id").substring(1, 37);
        var listName = "SP.Data." + table.summary + "ListItem";
        var data = {
          __metadata: { type: listName }
        };
        var url =
          "https://eis.usmc.mil/" +
          site +
          "/_api/web/lists('" +
          currentListName +
          "')/fields?$filter=TypeDisplayName eq 'Choice'";
        $.ajax({
          url: url,
          type: "GET",
          headers: {
            Accept: "application/json; odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            credentials: true,
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
          },
          success: function(data) {
            meatball(data.d.results);
            return false;
          },
          error: function(error) {
            console.log("Error: Get list choices request Failed.");
          }
        });
      });
    };
  }

  /*
    This creates the popover for each cell
  */
  function addPopover(target, defaults, rowIndex, header, table) {
    //Create Popover Element
    var popover = document.createElement("div");
    popover.style.backgroundColor = "#d3d3d3";
    popover.style.color = "#fff";
    popover.style.padding = ".5rem";
    popover.style.border = "1px solid black";
    popover.style.borderRadius = ".25rem";
    popover.style.fontWeight = "bold";
    popover.style.zIndex = "1";

    //Create Header Element
    var header = document.createElement("div");
    header.style.padding = ".25rem";
    header.style.borderRadius = ".25rem";
    header.style.textAlign = "center";
    header.style.cursor = "pointer";
    header.style.marginBottom = ".25rem";
    header.style.backgroundColor = "#4b6ac6";
    header.innerText = target.innerText;

    //Create Options Panel Element

    var options = document.createElement("div");
    options.style.display = "none";
    options.style.padding = ".25rem";
    options.style.backgroundColor = "#60605f";
    options.style.borderRadius = ".25rem";

    //Create and Add Option Elements
    defaults.forEach(function(ele, index) {
      var option = document.createElement("div");
      option.innerText = ele.text;
      option.style.padding = ".25rem";
      option.style.marginBottom = ".25rem";
      option.style.cursor = "pointer";
      option.style.textAlign = "center";
      option.style.fontWeight = "bold";
      option.style.borderRadius = ".25rem";

      if (compareString(target.innerText, ele.text)) {
        option.style.color = "black";
        option.style.backgroundColor = ele.color;
      } else {
        option.style.color = ele.color;
        option.style.backgroundColor = "#a9a9a9";
      }

      //Add Click Event to update list
      option.addEventListener("click", function() {
        updateMeatball(ele.text, rowIndex, header, table);
      });
      options.appendChild(option);
    });

    //Add Header Element
    popover.appendChild(header);
    //Add Options Panel
    popover.appendChild(options);

    //Add Click Event to display Options Panel
    header.addEventListener("click", function() {
      var style = options.style.display;
      var change = false;
      change = style === "block";
      change
        ? (options.style.display = "none")
        : (options.style.display = "block");
    });

    //Used addEventListener versus onmouseenter = function due to concerns of
    //overriding other scripts
    //Add Mouse Enter Event to display
    target.addEventListener("mouseenter", function() {
      document.body.appendChild(popover);
      popover.style.position = "fixed";
      popover.style.left = target.getBoundingClientRect().left + "px";
      popover.style.top = target.getBoundingClientRect().top + "px";
    });

    //Add Mouse leave Event to hide
    popover.addEventListener("mouseleave", function() {
      options.style.display = "none";
      document.body.removeChild(popover);
    });
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

  function compareString(s0, s1) {
    return s0.trim().toLowerCase() === s1.trim().toLowerCase();
  }
})();
