(function () {
  var colors = new Colors();
  var size = 15;
  var notification = new Notification("");

  window.addEventListener("load", function () {
    notification.startLoading();
    getListItems();
    notification.endLoading();
  });

  //On change, adds functionality
  window.addEventListener("hashchange", function () {
    notification.startLoading();
    getListItems();
    notification.endLoading();
  });

  /* get all the choices and send to main func*/
  function getListItems() {
    if (document.body.hasAttribute("meatball_override")) {
      var overrides = window.meatball_override;
      overrides.forEach(function (item) {
        colors.set(item.value, item.color);
      });
    }
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
    //Grabbing the list url + Iterate through the set of tables
    tables.forEach(function (table, index) {
      var currentListId = table.getAttribute("id").substring(1, 37);
      var root = ctx.HttpRoot;
      var url =
        root +
        "/_api/web/lists('" +
        currentListId +
        `')/fields?$filter=TypeDisplayName eq 'Choice'`;
      var configureAxios = {
        headers: {
          Accept: "application/json; odata=verbose",
          "X-RequestDigest": document.getElementById("__REQUESTDIGEST").value,
        },
        credentials: true,
      };
      axios
        .get(url, configureAxios)
        .then(function (res) {
          if (res.data && res.data.d) {
            var popoverData = res.data.d.results.reduce(
              function (acc, cv, ci, data) {
                var add = true;
                if (cv.Choices) {
                  if (acc.value.indexOf(cv.Choices.results) < 0) {
                    acc.value.push(cv.Choices.results);
                    acc.internalColumn.push(cv.InternalName);
                    acc.externalColumn.push(cv.Title);
                  }
                }
                return acc;
              },
              {
                externalColumn: [],
                internalColumn: [],
                value: [],
              }
            );
            popoverData.value.forEach(function (item, i) {
              findTargets(
                table,
                item,
                popoverData.externalColumn[i],
                popoverData.internalColumn[i]
              );
            });
          }
          return false;
        })
        .catch(function (e) {
          console.log("Error: Get list choices request Failed", e);
        });
    });
  }

  //Entry Point and General Function
  function findTargets($table, values, externalColumn, internalColumn, colors) {
    if (!$table || $table.childNodes.length === 0) {
      return;
    }

    //deafult keywords that have values.
    var defaults = [
      { color: "green", text: "up" },
      { color: "red", text: "down" },
      { color: "yellow", text: "degraded" },
      { color: "green", text: "100-90" },
      { color: "yellow", text: "89-80" },
      { color: "red", text: "79-10" },
      { color: "steelblue", text: "<10" },
    ];

    //Step 3. Iterate over each cell and compare the inner text to the list of known defaults.
    var $rows = [].slice.call($table.getElementsByTagName("tr"));
    var thead = [].slice.call($table.getElementsByTagName("th"));
    var displayValue = "";
    var displayColor = "";

    $rows.map(function ($row, ri) {
      displayValue = "";
      var $cells = [].slice.call($row.getElementsByTagName("td"));

      if ($cells.length > 0) {
        //this checks if the cell contains the text which is in user choices, select that cell to add the modal
        $cells.map(function ($cell, ci) {
          //new logic
          var text = $cell.innerText;
          var defaultText = defaults.map(function (a) {
            return a.text;
          });
          var pos = defaultText.indexOf(text.toLowerCase());

          //Comparing the thead with the external
          var add = false;
          if (thead[ci]) {
            [].slice.call(thead[ci].children).forEach(function (item, ti) {
              if (add) {
                return;
              }
              [].slice.call(item.children).forEach(function (item, tci) {
                if (add) {
                  return;
                }

                if (item.innerText) {
                  add = compareString(externalColumn, item.innerText);
                }
              });
            });
          }

          if (add && $table.getAttribute("id") && $row.getAttribute("iid")) {
            displayValue = $row.childNodes[1].innerText + ": " + externalColumn;

            if (displayValue) {
              new Meatball(size).init(
                values,
                externalColumn,
                internalColumn,
                $cell,
                $row.getAttribute("iid").split(",")[1],
                thead[ci],
                $table.getAttribute("id").substring(1, 37),
                text,
                displayValue
              );
            }
          }
        });
      }
    });
  }

  function Meatball(size) {
    this.size = size + "px";
    this.element = document.createElement("div");
    this.element.style.width = this.size;
    this.element.style.height = this.size;
    this.element.style.borderRadius = this.size;
  }

  Meatball.prototype.init = function (
    defaults,
    externalColumn,
    internalColumn,
    parent,
    rowIndex,
    thead,
    table,
    cellText,
    value
  ) {
    var meatball = this;
    this.element.style.backgroundColor = colors.get(cellText);

    var popoverBorder = "#c4c3d0";
    var triangleSize = 10;

    var popoverPanel = document.createElement("div");
    popoverPanel.style.display = "inline-block";
    popoverPanel.style.margin = "0px";
    popoverPanel.style.padding = "0px";

    var carret = document.createElement("div");
    carret.style.margin = "0px";
    carret.style.display = "inline-block";
    carret.style.position = "fixed";
    carret.style.height = "0px";
    carret.style.width = "0px";
    carret.style.borderTop = triangleSize + "px solid transparent";
    carret.style.borderBottom = triangleSize + "px solid transparent";
    carret.style.borderRight = triangleSize + "px solid " + popoverBorder;
    popoverPanel.appendChild(carret);

    //Create Popover Element
    var popover = document.createElement("div");
    popover.style.display = "inline-block";
    popover.style.backgroundColor = "#ffffff";
    popover.style.color = "#000000";
    popover.style.padding = ".5rem";
    popover.style.border = "1px solid " + popoverBorder;
    popover.style.borderRadius = ".25rem";
    popover.style.zIndex = "1";

    //Create Header Element
    var header = document.createElement("div");
    header.style.padding = ".25rem";
    header.style.borderRadius = ".25rem";
    header.style.textAlign = "center";
    header.style.cursor = "pointer";
    header.style.marginBottom = ".25rem";
    header.style.backgroundColor = "#BABBFD";
    header.innerText = value;

    //Create Options Panel Element
    var options = document.createElement("div");
    options.style.padding = ".25rem";
    options.style.borderRadius = ".25rem";

    //Create and Add Option Elements
    defaults.forEach(function (ele, index) {
      var optionPanel = document.createElement("div");
      optionPanel.style.padding = ".25rem";
      optionPanel.style.marginBottom = ".25rem";
      optionPanel.style.textAlign = "left";
      optionPanel.style.borderRadius = ".25rem";

      var option = document.createElement("div");
      option.innerText = ele;
      option.style.marginLeft = ".25rem";
      option.style.display = "inline";
      var radio = document.createElement("input");
      radio.type = "radio";
      radio.style.margin = "0px";
      radio.style.display = "inline";

      if (containsSubString(ele, cellText)) {
        radio.checked = "checked";
        optionPanel.style.backgroundColor = "#BABBFD";
      } else {
        radio.style.cursor = "pointer";
        optionPanel.style.cursor = "pointer";
        optionPanel.addEventListener("click", function () {
          notification.startLoading();
          radio.checked = "checked";
          optionPanel.style.backgroundColor = "#BABBFD";

          updateTarget(
            ele,
            rowIndex,
            meatball,
            thead.innerText,
            table,
            externalColumn,
            internalColumn
          );
        });
        optionPanel.addEventListener("mouseenter", function () {
          optionPanel.style.boxShadow = "0px 0px 10px #BABBFD";
        });
        optionPanel.addEventListener("mouseleave", function () {
          optionPanel.style.boxShadow = "0px 0px 0px";
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
    header.addEventListener("click", function () {
      var style = options.style.display;
      var change = false;
      change = style === "block";
      change
        ? (options.style.display = "none")
        : (options.style.display = "block");
    });

    popoverPanel.appendChild(popover);

    //Used addEventListener versus onmouseenter = function due to concerns of
    //overriding other scripts
    //Add Mouse Enter Event to display
    this.element.addEventListener("mouseenter", function () {
      document.body.appendChild(popoverPanel);
      popoverPanel.style.position = "fixed";
      popoverPanel.style.left =
        this.getBoundingClientRect().right + triangleSize + "px";
      popoverPanel.style.top =
        this.getBoundingClientRect().top - triangleSize + "px";
      carret.style.left =
        popoverPanel.getBoundingClientRect().left - triangleSize + "px";
      carret.style.top = this.getBoundingClientRect().top + "px";
    });

    this.element.addEventListener("mouseleave", function (e) {
      if (popoverPanel.contains(e.relatedTarget)) return;
      if (popoverPanel) {
        if (popoverPanel.parentNode) {
          popoverPanel.parentNode.removeChild(popoverPanel);
        }
      }
    });

    //Add Mouse leave Event to hide
    popoverPanel.addEventListener("mouseleave", function () {
      if (popoverPanel) {
        if (popoverPanel.parentNode) {
          popoverPanel.parentNode.removeChild(popoverPanel);
        }
      }
    });
    parent.innerText = "";
    parent.appendChild(this.element);
  };

  Meatball.prototype.setColor = function (value) {
    this.element.style.backgroundColor = colors.get(value);
  };

  function updateTarget(
    ele,
    rowIndex,
    meatball,
    header,
    table,
    externalColumn,
    internalColumn
  ) {
    var root = ctx.HttpRoot;
    var currentListName = ctx.ListTitle;
    var listName = "SP.ListItem";
    var data = {
      __metadata: { type: listName },
    };
    data[internalColumn] = ele;

    var url =
      root +
      "/_api/web/lists('" +
      table +
      "')/items(" +
      rowIndex +
      ")?$select=" +
      internalColumn;

    var configureAxios = {
      headers: {
        Accept: "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        "If-Match": "*",
        "X-HTTP-Method": "MERGE",
        "X-RequestDigest": document.getElementById("__REQUESTDIGEST").value,
      },
      credentials: true,
    };
    axios
      .post(url, data, configureAxios)
      .then(function (res) {
        meatball.setColor(data[internalColumn]);
        notification.setMessage("Update Success");
        notification.show();
      })
      .catch(function (e) {
        notification.setMessage("Update Failed");
        notification.show();
      });
  }

  //Easier way of handling the different colors and defaults
  function Colors() {
    this.blue = "#0075ff";
    this.green = "#27e833";
    this.red = "#d71010";
    this.yellow = "#f6de1c";
    this.transparent = "transparent";
    this.defaults = [
      {
        value: "Up",
        color: this.green,
      },
      { value: "Down", color: this.red },
      { value: "Degraded", color: this.yellow },
      { value: "NA", color: this.transparent },
      { value: "100-90", color: this.green },
      { value: "89-80", color: this.yellow },
      { value: "79-10", color: this.red },
      { value: "<10", color: this.blue },
    ];
  }

  Colors.prototype.get = function (value) {
    var test = this.defaults.filter(function (item) {
      // console.log(value, " : ", item.value);
      if (containsSubString(item.value, value)) {
        return item;
      }
    });
    // console.log(test);

    if (test[0]) {
      return test[0].color;
    } else {
      return "#000000";
    }
  };

  Colors.prototype.set = function (value, color) {
    if (compareString(color, "blue")) {
      this.defaults.push({ value: value, color: this.blue });
    } else if (compareString(color, "green")) {
      this.defaults.push({ value: value, color: this.green });
    } else if (compareString(color, "red")) {
      this.defaults.push({ value: value, color: this.red });
    } else if (compareString(color, "yellow")) {
      this.defaults.push({ value: value, color: this.yellow });
    } else {
      this.defaults.push({ value: value, color: color });
    }
  };

  //In house build of a notification feature
  function Notification(message) {
    this.notification = document.createElement("div");
    this.notification.style.textAlign = "center";
    this.notification.style.fontSize = "16pt";
    this.notification.style.width = "250px";
    this.notification.style.height = "50px";
    this.notification.style.backgroundColor = "white";
    this.notification.style.border = "1px solid black";
    this.notification.style.position = "fixed";
    this.notification.style.right = "10px";
    this.notification.style.top = "10px";
    this.notification.style.zIndex = "1";
    this.notification.style.borderRadius = ".25rem";
    this.notification.innerText = message;
  }

  Notification.prototype.setMessage = function (message) {
    this.notification.innerText = message;
  };

  Notification.prototype.show = function () {
    if (this.notification) {
      if (this.notification.parentNode) {
        this.notification.parentNode.removeChild(this.notification);
      }
    }
    var note = this.notification;
    document.body.appendChild(note);
    var timer = setTimeout(
      function (note) {
        if (note) {
          if (note.parentNode) {
            note.parentNode.removeChild(note);
          }
        }
      },
      5000,
      note
    );
  };

  Notification.prototype.startLoading = function () {
    this.notification.innerText = "Loading";
    document.body.appendChild(this.notification);
  };

  Notification.prototype.endLoading = function () {
    if (this.notification) {
      if (this.notification.parentNode) {
        this.notification.parentNode.removeChild(this.notification);
      }
    }
    this.notification.innerText = "Done";
    var note = this.notification;
    document.body.appendChild(note);
    var timer = setTimeout(
      function (note) {
        if (note) {
          if (note.parentNode) {
            note.parentNode.removeChild(note);
          }
        }
      },
      1000,
      note
    );
  };

  Notification.prototype.debug = function () {
    document.body.appendChild(this.notification);
  };

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

  function containsSubString(knownValue, givenValue) {
    return (
      givenValue
        .slice(0, knownValue.length)
        .toLowerCase()
        .indexOf(knownValue.toLowerCase()) > -1
    );
  }

  /*Checks to see if s0 is contains to s1*/
  function containsString(s0, s1) {
    return s0.toLowerCase().indexOf(s1.toLowerCase()) > -1;
  }

  /*Uses containsString to check to see if the two strings are equal*/
  function compareString(s0, s1) {
    return containsString(s0, s1) && containsString(s1, s0);
  }
})();
