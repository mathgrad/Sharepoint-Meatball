(function () {
  window.addEventListener("load", function () {
    getListItems();
  });

  //On change, adds functionality
  window.addEventListener("hashchange", function () {
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
    scriptAjax.onload = function () {
      //Step 1. Get all the tables -- create array
      var tables = [].slice.call(document.getElementsByTagName("table"));
      if (errorChecking(tables)) {
        console.log("No Tables Found");
        return;
      }
      //Include only the actual lists
      tables = tables.filter(function (table) {
        return table.getAttribute("class") === "ms-listviewtable";
      });
      //Grabbing the list url

      //Iterate through the

      tables.forEach(function (table, index) {
        var currentListName = table.getAttribute("id").substring(1, 37);
        var root = ctx.HttpRoot;
        var listName = "SP.Data." + table.summary + "ListItem";
        var data = {
          __metadata: { type: listName },
        };
        var url = root + "/_api/web/lists('" + currentListName + "')/fields";

        $.ajax({
          url: url,
          type: "GET",
          headers: {
            Accept: "application/json; odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            credentials: true,
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
          },
          success: function (data) {
            if (data && data.d) {
              var popoverData = data.d.results.reduce(
                function (acc, cv, ci, data) {
                  var add = true;
                  if (containsString(cv.Title, "status")) {
                    if (containsString(cv.Title, "value")) {
                      acc.value.push(cv.Choices.results);
                      add = false;
                    }
                    if (add && cv.Formula) {
                      acc.status.push(cv.Formula);
                    }
                  }
                  return acc;
                },
                {
                  status: [],
                  value: [],
                }
              );
              var columnNames = popoverData.status.reduce(function (
                acc,
                cv,
                ci
              ) {
                if (cv) acc.push(parseFormulaColumn(cv));
                return acc;
              },
              []);
              //console.log("Column Names: ", columnNames);

              popoverData.status.forEach(function (item, i) {
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
                  parseFormula(item),
                  table,
                  popoverData.value[i],
                  columnNames[i]
                );
              });
            }
            return false;
          },
          error: function (error) {
            console.log("Error: Get list choices request Failed.");
          },
        });
      });
    };
  }

  //Entry Point and General Function
  function findTargets(status, table, values, column) {
    if (!table || table.childNodes.length === 0) {
      return;
    }
    if (column.includes("[")) {
      column = column.substring(1, column.length - 1);
    }
    //Step 3. Iterate over each cell and compare the inner text to the list of known defaults.
    var rows = [].slice.call(table.getElementsByTagName("tr"));
    var thead = [].slice.call(table.getElementsByTagName("th"));
    var displayValue = "";
    var displayColor = "";

    rows.map(function (row, ri) {
      displayValue = "";
      displayColor = "";
      var cells = [].slice.call(row.getElementsByTagName("td"));

      if (cells.length > 0) {
        //this checks if the cell contains the text which is in user choices, select that cell to add the modal
        cells.map(function (cell, ci) {
          var add = false;
          if (thead[ci]) {
            [].slice.call(thead[ci].children).forEach(function (item, ti) {
              [].slice.call(item.children).forEach(function (item, tci) {
                if (item.innerText) {
                  add = containsString(item.innerText, "status");
                  if (add) {
                    add =
                      !containsString(item.innerText, "value") &&
                      !containsString(item.innerText, "type");

                    if (containsString(column, item.innerText)) {
                      //Pseudo function
                      if (
                        column.split(" ").length !==
                        item.innerText.split(" ").length
                      ) {
                        console.log("hit0:", column, item.innerText);
                          if (
                            column.split(" ").length - 1 ===
                            item.innerText.split(" ").length
                          ) {
                            console.log("hit1:", column, item.innerText);
                            displayValue = cell.innerText;
                          }
                        }
                      }
                    }
                  }
                  /* match text counter example*/

                  // if (item.innerText) {
                  //   var value = column;
                  //   var status = item.innerText.toString();
                  //   var regex = new RegExp(status, "gi");
                  //   if (value.match(regex)) {
                  //     console.log(value.match(regex)[0].length);
                  //   }
                  // }
                }
              });
            });
          }

          if (add && table.getAttribute("id") && row.getAttribute("iid")) {
            [].slice.call(cell.children).forEach(function (item, i) {
              [].slice.call(item.children).forEach(function (item, i) {
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
              table.getAttribute("id").substring(1, 37),
              column
            );
          }
        });
      }
    });
  }

  /*
    This creates the popover for each cell
  */
  function addPopover(
    target,
    defaults,
    displayValue,
    rowIndex,
    thead,
    table,
    column
  ) {
    if (column.includes("[")) {
      column = column.substring(1, column.length - 1);
    }
    //Create Popover Element
    var popover = document.createElement("div");
    popover.style.backgroundColor = "#6b8e23";
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
    header.style.backgroundColor = "#236C8E";
    header.innerText = displayValue;
    header.style.textShadow = "1px 1px 1px black";

    //Create Options Panel Element
    var options = document.createElement("div");
    options.style.display = "none";
    options.style.padding = ".25rem";
    // options.style.backgroundColor = "#236C8E";
    options.style.borderRadius = ".25rem";

    //Create and Add Option Elements
    defaults.forEach(function (ele, index) {
      var optionPanel = document.createElement("div");
      optionPanel.style.padding = ".25rem";
      optionPanel.style.marginBottom = ".25rem";
      optionPanel.style.cursor = "pointer";
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

      radio.style.cursor = "pointer";
      option.style.textShadow = "1px 1px 1px black";
      radio.style.color = "#f5f5f5";
      option.style.color = "#f5f5f5";
      optionPanel.style.backgroundColor = "#A8A8FF";

      if (compareString(displayValue, ele)) {
        radio.checked = "checked";
      }
      //Add Click Event to update list
      optionPanel.addEventListener("click", function () {
        updateTarget(ele, rowIndex, thead.innerText, table, column);
      });
      optionPanel.appendChild(radio);
      optionPanel.appendChild(option);
      options.appendChild(optionPanel);
    });

    //Add Header Element
    popover.appendChild(header);
    //Add Options Panel
    popover.appendChild(options);

    //Add Click Event to display Options Panel
    header.addEventListener("click", function () {
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
    target.addEventListener("mouseenter", function () {
      document.body.appendChild(popover);

      popover.style.position = "fixed";
      popover.style.left = target.getBoundingClientRect().right + "px";
      popover.style.top = target.getBoundingClientRect().top + "px";
    });

    target.addEventListener("mouseleave", function (e) {
      if (popover.contains(e.relatedTarget)) return;
      if (popover) {
        if (popover.parentNode) {
          popover.parentNode.removeChild(popover);
        }
      }
    });

    //Add Mouse leave Event to hide
    popover.addEventListener("mouseleave", function () {
      options.style.display = "none";
      if (popover) {
        if (popover.parentNode) {
          popover.parentNode.removeChild(popover);
        }
      }
    });
  }

  function updateTarget(ele, rowIndex, header, table, column) {
    console.log("col in the POST:", column, "\nheader", header, "\nele:", ele);
    var site = _spPageContextInfo.webServerRelativeUrl;
    var currentListName = ctx.ListTitle;
    var listName = "SP.ListItem";
    var data = {
      __metadata: { type: listName },
    };
    data[column] = ele;
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
        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
      },
      success: function (data) {
        alert("Updated Target Successfully");
        location.reload();
        return false;
      },
      error: function (error) {
        alert(
          "Error: Update Request Failed. Please Contact the 1MEF IMO",
          console.log(JSON.stringify(error))
        );
      },
    });
  }

  function parseFormulaColumn(formula) {
    var reg = /([()])/g;
    var init = formula.split("IF");
    var second = init.reduce(function (acc, cv, ci, init) {
      if (ci !== 0) acc.push(cv.split("="));
      return acc;
    }, []);
    var third = second.reduce(function (acc, cv, ci, second) {
      acc.push(cv[0].split(","));
      return acc;
    }, []);
    var fourth = third.reduce(function (acc, cv, ci, third) {
      if (cv[1]) {
        acc.push(cv[1].replace(reg, ""));
      } else if (cv[0]) {
        acc.push(cv[0].replace(reg, ""));
      }
      return acc;
    }, []);
    return fourth[0];
  }

  function parseFormula(formula) {
    var init = formula.split("IF");
    var second = init.reduce(function (acc, cv, ci, init) {
      if (ci !== 0) acc.push(cv.split("="));
      return acc;
    }, []);

    return second.reduce(function (acc, cv, ci, init) {
      switch (cv.length) {
        case 2:
          if (cv[0].indexOf('"') > -1) {
            acc.push([cv[0].split('"')[1], cv[1].split(",")[1]]);
          } else {
            acc.push([cv[1].split(",")]);
          }
          break;
        case 3:
          if (cv[0].indexOf('"') > -1) {
            acc.push([
              cv[0].split('"')[1],
              (cv[1] + "=" + cv[2]).split(",")[1],
            ]);
          } else {
            var temp = cv[1] + "=" + cv[2];

            acc.push([temp.split(",")]);
          }
          break;
        case 4:
          if (cv[0].indexOf('"') > -1) {
            acc.push([
              cv[0].split('"')[1],
              (cv[1].split(",")[1] + "=" + cv[2] + "=" + cv[3]).replace(
                ",",
                ""
              ),
            ]);
          } else {
            var temp = (
              cv[1].split(",")[1] +
              "=" +
              cv[2] +
              "=" +
              cv[3]
            ).replace(",", "");
            acc.push([temp]);
          }
          break;
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

    if (obj.length === 0) {
      console.error("Nothing in the array");
      return true;
    }

    return false;
  }

  function containsString(s0, s1) {
    return s0.toLowerCase().indexOf(s1.toLowerCase()) > -1;
  }

  function compareString(s0, s1) {
    if (s0 && s1) {
      return s0.trim().toLowerCase() === s1.trim().toLowerCase();
    } else {
      return false;
    }
  }
})();
