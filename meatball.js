(function() {
  //Initial Load, adds functionality
  var init = function() {
    var promise = new Promise(function(resolve, reject) {
      console.log("Promise Start");
      getListItems();
    })
      .then(function(success) {
        meatball();
        console.log("Promise Ended");
      })
      .catch(function(error) {
        console.error("Promise Error: ", error);
      });
  };

  window.addEventListener("load", function() {
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
    if (choiceData)
      choiceData.filter(function(data, index) {
        if (data.Title === "meatballExplained") {
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
              var add = false;
              if (pos < 0) return;
              if (thead[ci])
                [].slice.call(thead[ci].children).forEach((item, i) => {
                  [].slice.call(item.children).forEach((item, i) => {
                    if (item.innerText) {
                      add = matchString(item.innerText, "status");
                    }
                  });
                });

              if (add && table.getAttribute("id") && row.getAttribute("iid")) {
                addPopover(
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
    var scriptAjax = document.createElement("script");
    scriptAjax.type = "text/javascript";
    scriptAjax.src =
      "https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js";
    document.body.appendChild(scriptAjax);
    //Waits till Ajax loads to allow full functionality of
    scriptAjax.onload = function() {
      //Step 1. Get all the tables -- create array
      var tables = [].slice.call(document.getElementsByTagName("table"));
      if (errorChecking(tables)) {
        console.log("No Tables Found");
        return;
      }
      //Include only the actual lists
      tables = tables.filter(function(table) {
        if (table.getAttribute("class") === "ms-listviewtable") {
          return table;
        }
      });
      //Grabbing the list url
      var site = _spPageContextInfo.webServerRelativeUrl;
      //Iterate through the
      tables.forEach(function(table, index) {
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
            if (data) {
              if (data.d)
                if (data.d.results[0].Choices.results)
                  meatball(data.d.results[0].Choices.results);
            } else meatball([]);
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
      var optionPanel = document.createElement("div");
      optionPanel.style.padding = ".25rem";
      optionPanel.style.marginBottom = ".25rem";
      optionPanel.style.cursor = "pointer";
      optionPanel.style.textAlign = "left";
      optionPanel.style.fontWeight = "bold";
      optionPanel.style.borderRadius = ".25rem";

      var option = document.createElement("div");
      option.innerText = ele.text;
      option.style.marginLeft = ".25rem";
      option.style.display = "inline";
      var radio = document.createElement("input");
      radio.type = "radio";
      radio.style.margin = "0px";
      radio.style.cursor = "pointer";
      radio.style.display = "inline";

      if (compareString(target.innerText, ele.text)) {
        option.style.color = "black";
        optionPanel.style.backgroundColor = ele.color;
        radio.checked = "checked";
      } else {
        option.style.color = ele.color;
        optionPanel.style.backgroundColor = "#a9a9a9";
      }

      optionPanel.appendChild(radio);
      optionPanel.appendChild(option);
      //Add Click Event to update list
      optionPanel.addEventListener("click", function() {
        updateMeatball(ele.text, rowIndex, header, table);
      });
      options.appendChild(optionPanel);
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

  function matchString(s0, s1) {
    return s0
      .trim()
      .toLowerCase()
      .includes(s1);
  }

  function compareString(s0, s1) {
    return s0.trim().toLowerCase() === s1.trim().toLowerCase();
  }
})();
