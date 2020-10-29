(function() {
  window.addEventListener("load", function() {
    getListItems();
  });

  //On change, adds functionality
  window.addEventListener("hashchange", function() {
    getListItems();
  });

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
        return table.getAttribute("class") === "ms-listviewtable";
      });
      //Grabbing the list url

      //Iterate through the

      tables.forEach(function(table, index) {
        var currentListName = table.getAttribute("id").substring(1, 37);
        var root = ctx.HttpRoot;
        var listName = "SP.Data." + table.summary + "ListItem";
        var data = {
          __metadata: { type: listName }
        };
        var url = root + "/_api/web/lists('" + currentListName + "')/fields";

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
            if (data && data.d) {
              var popoverData = data.d.results.reduce(
                function(acc, cv, ci, data) {
                  var add = true;
                  if (containsString(cv.Title, "status")) {
                    if (containsString(cv.Title, "value")) {
                      acc.value.push(cv.Choices.results);
                      add = false;
                    }
                    if (add && cv.Formula) {
                      acc.status.push(parseFormula(cv.Formula));
                      acc.column.push(parseFormulaColumn(cv.Formula));
                    }
                  }
                  return acc;
                },
                {
                  column: [],
                  status: [],
                  value: []
                }
              );

              popoverData.status.forEach(function(item, i) {
                if (!popoverData) {
                  return;
                }
                if (!popoverData.value) {
                  return;
                }
                if (!popoverData.value[i]) {
                  return;
                }
                if (popoverData.value[i].length < 1) {
                  return;
                }
                findTargets(
                  item,
                  table,
                  popoverData.value[i],
                  popoverData.column[i]
                );
              });
            }
            return false;
          },
          error: function(error) {
            console.log("Error: Get list choices request Failed.");
          }
        });
      });
    };
  }

  //Entry Point and General Function
  function findTargets(status, table, values, column) {
    if (!table || table.childNodes.length === 0) {
      return;
    }

    //Step 3. Iterate over each cell and compare the inner text to the list of known defaults.
    var rows = [].slice.call(table.getElementsByTagName("tr"));
    var thead = [].slice.call(table.getElementsByTagName("th"));
    var displayValue = "";
    var displayColor = "";

    rows.map(function(row, ri) {
      displayValue = "";
      var cells = [].slice.call(row.getElementsByTagName("td"));

      if (cells.length > 0) {
        //this checks if the cell contains the text which is in user choices, select that cell to add the modal
        cells.map(function(cell, ci) {
          var add = false;
          if (thead[ci]) {
            [].slice.call(thead[ci].children).forEach(function(item, ti) {
              [].slice.call(item.children).forEach(function(item, tci) {
                if (item.innerText) {
                  add = containsString(item.innerText, "status");
                  if (add) {
                    add =
                      !containsString(item.innerText, "value") &&
                      !containsString(item.innerText, "color") &&
                      !containsString(item.innerText, "type");
                  }
                  if (containsString(item.innerText, "value")) {
                    displayValue = cell.innerText;
                  }
                }
              });
            });
          }

          if (add && table.getAttribute("id") && row.getAttribute("iid")) {
            [].slice.call(cell.children).forEach(function(item, i) {
              [].slice.call(item.children).forEach(function(item, i) {
                if (!displayValue) {
                  displayValue = item.getAttribute("key");
                } else if (displayValue.length < 1) {
                  displayValue = item.getAttribute("key");
                }
              });
            });

            addPopover(
              cell,
              values,
              displayValue,
              row.getAttribute("iid").split(",")[1],
              thead[ci],
              table.getAttribute("id").substring(1, 37)
            );
          }
        });
      }
    });
  }

  /*
    This creates the popover for each cell
  */
  function addPopover(target, defaults, displayValue, rowIndex, thead, table) {
    //Create Popover Element
    var popover = document.createElement("div");
    popover.style.backgroundColor = "	#676767";
    popover.style.color = "#f2f3f4";
    popover.style.padding = ".5rem";
    popover.style.border = "1px solid";
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
    header.style.backgroundColor = "#3D71EB";
    header.innerText = displayValue;
    header.style.textShadow = "1px 1px 1px black";

    //Create Options Panel Element
    var options = document.createElement("div");
    options.style.display = "none";
    options.style.padding = ".25rem";
    // options.style.backgroundColor = "#1C9BF0";
    options.style.borderRadius = ".25rem";

    //Create and Add Option Elements
    defaults.forEach(function(ele, index) {
      var optionPanel = document.createElement("div");
      optionPanel.style.padding = ".25rem";
      optionPanel.style.marginBottom = ".25rem";
      optionPanel.style.textAlign = "left";
      optionPanel.style.fontWeight = "bold";
      optionPanel.style.borderRadius = ".25rem";

      var option = document.createElement("div");
      option.innerText = ele;
      option.style.marginLeft = ".25rem";
      option.style.display = "inline";
      var radio = document.createElement("input");
      radio.type = "radio";
      radio.style.margin = "0px";
      radio.style.display = "inline";

      option.style.textShadow = "1px 1px 1px black";
      radio.style.color = "#f5f5f5";
      option.style.color = "#f5f5f5";
      optionPanel.style.backgroundColor = "#3D71EB";

      if (compareString(displayValue, ele)) {
        radio.checked = "checked";
      } else {
        radio.style.cursor = "pointer";
        optionPanel.style.cursor = "pointer";
        optionPanel.addEventListener("click", function() {
          updateTarget(ele, rowIndex, thead.innerText, table);
        });
      }
      //Add Click Event to update list
      optionPanel.appendChild(radio);
      optionPanel.appendChild(option);
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
      popover.style.left = target.getBoundingClientRect().right + "px";
      popover.style.top = target.getBoundingClientRect().top + "px";
    });

    target.addEventListener("mouseleave", function(e) {
      if (popover.contains(e.relatedTarget)) return;
      if (popover) {
        if (popover.parentNode) {
          popover.parentNode.removeChild(popover);
        }
      }
    });

    //Add Mouse leave Event to hide
    popover.addEventListener("mouseleave", function() {
      options.style.display = "none";
      if (popover) {
        if (popover.parentNode) {
          popover.parentNode.removeChild(popover);
        }
      }
    });
  }

  function updateTarget(ele, rowIndex, header, table, column) {
    console.log("col in the POST:", column, "\nheader", header);
    var site = _spPageContextInfo.webServerRelativeUrl;
    var currentListName = ctx.ListTitle;
    var listName = "SP.ListItem";
    var data = {
      __metadata: { type: listName },
      status_value: ele
    };
    var url =
      window.location.origin +
      site +
      "/_api/web/lists('" +
      table +
      "')/items(" +
      rowIndex +
      ")?$select=" +
      column;
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
        alert("Updated Target Successfully");
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

  function parseFormulaColumn(formula) {
    var reg = /([()])/g;
    var splitIf = formula.split("IF");
    var splitEqual = splitIf.reduce(function(acc, cv, ci, splitIf) {
      if (ci !== 0) acc.push(cv.split("="));
      return acc;
    }, []);
    var splitComma = splitEqual.reduce(function(acc, cv, ci, splitEqual) {
      acc.push(cv[0].split(","));
      return acc;
    }, []);
    var splitReg = splitComma.reduce(function(acc, cv, ci, splitComma) {
      if (cv[1]) {
        acc.push(cv[1].replace(reg, ""));
      } else if (cv[0]) {
        acc.push(cv[0].replace(reg, ""));
      }
      return acc;
    }, []);
    return splitReg[0];
  }

  function parseFormula(formula) {
    return formula.split("IF").reduce(function(acc, cv, ci, init) {
      if (ci !== 0) {
        var splitEqual = cv.split("=");
        switch (splitEqual.length) {
          case 2:
            if (splitEqual[0].includes('"')) {
              acc.push([
                splitEqual[0].split('"')[1],
                splitEqual[1].split(",")[1]
              ]);
            } else {
              acc.push([splitEqual[1].split(",")]);
            }
            break;
          case 3:
            if (splitEqual[0].indexOf('"') > -1) {
              acc.push([
                splitEqual[0].split('"')[1],
                (splitEqual[1] + "=" + splitEqual[2]).split(",")[1]
              ]);
            } else {
              var temp = splitEqual[1] + "=" + splitEqual[2];

              acc.push([temp.split(",")]);
            }
            break;
          case 4:
            if (splitEqual[0].indexOf('"') > -1) {
              acc.push([
                splitEqual[0].split('"')[1],
                (
                  splitEqual[1].split(",")[1] +
                  "=" +
                  splitEqual[2] +
                  "=" +
                  splitEqual[3]
                ).replace(",", "")
              ]);
            } else {
              var temp = (
                splitEqual[1].split(",")[1] +
                "=" +
                splitEqual[2] +
                "=" +
                splitEqual[3]
              ).replace(",", "");
              acc.push([temp]);
            }
            break;
          default:
            break;
        }
      }
      return acc;
    }, []);
  }

  //True, error.  False, no error.
  function errorChecking(obj) {
    if (!obj) {
      console.error("Undefined");
      return true;
    }

    if (obj.length) {
      if (obj.length === 0) {
        console.error("Nothing in the array");
        return true;
      }
    }

    return false;
  }

  /*Checks to see if s0 is contains to s1*/
  function containsString(s0, s1) {
    return (
      s0
        .trim()
        .toLowerCase()
        .indexOf(s1.trim().toLowerCase()) > -1
    );
  }

  /*Uses containsString to check to see if the two strings are equal*/
  function compareString(s0, s1) {
    return containsString(s0, s1) && containsString(s1, s0);
  }
})();
