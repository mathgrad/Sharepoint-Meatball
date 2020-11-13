(function () {
  //Size sets the Meatball size in pixels
  var size = 15;
  var colors = new Colors();

  window.addEventListener("load", function () {
    start();
  });

  //On change, adds functionality
  window.addEventListener("hashchange", function () {
    start();
  });

  //Initial point of the application
  function start() {
    //Checks for JQuery
    if (!window.jQuery) {
      alert("Please contact help desk.  Script not properly loaded.");
      return;
    }
    //Checks for overrides
    if (window.meatball_override) {
      meatball_override.forEach(function (item) {
        colors.set(item.value, item.color);
      });
    }

    //Get all the tables -- create array
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
        "')/fields?$filter=TypeDisplayName eq 'Choice'";

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
            //Returns all columns with choices
            var popoverData = data.d.results.reduce(
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
        },
        error: function (error) {
          console.log("Error: Get list choices request Failed.");
        },
      });
    });
  }

  //Finds cells with known default values and replaces them with meatballs
  function findTargets($table, values, externalColumn, internalColumn, colors) {
    if (!$table || $table.childNodes.length === 0) {
      return;
    }

    //Iterate over each cell and compare the inner text to the list of known defaults.
    var $rows = [].slice.call($table.getElementsByTagName("tr"));
    var $thead = [].slice.call($table.getElementsByTagName("th"));
    var displayValue,
      text = "";
    var add = false;

    $rows.map(function ($row, ri) {
      displayValue = "";

      var $cells = [].slice.call($row.getElementsByTagName("td"));

      if ($cells.length > 0) {
        //this checks if the cell contains the text which is in user choices, select that cell to add the modal
        $cells.map(function ($cell, ci) {
          //Comparing the thead with the external
          add = false;
          text = "";

          if ($thead[ci]) {
            [].slice.call($thead[ci].children).forEach(function (item, ti) {
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
              text = $cell.innerText;
              new Meatball(size).init(
                values,
                externalColumn,
                internalColumn,
                $cell,
                $row.getAttribute("iid").split(",")[1],
                $thead[ci],
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

  //Update target's value to user's selected value
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
    meatball.remove();
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
        meatball.setColor(ele);
        var notification = new Notification(
          externalColumn + " has been updated"
        );
        notification.success().listeners().show();
        return false;
      },
      error: function (error) {
        var notification = new Notification(
          externalColumn + " failed to update"
        );
        notification.failed().listeners().show();
      },
    });
  }

  //Main object
  //Replaces default text from Color object with circles with color from Color object
  //Attaches popover to the color circle along with updateTarget function
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

    this.popoverPanel = document.createElement("div");
    this.popoverPanel.style.display = "inline-block";
    this.popoverPanel.style.margin = "0px";
    this.popoverPanel.style.padding = "0px";

    var carret = document.createElement("div");
    carret.style.margin = "0px";
    carret.style.display = "inline-block";
    carret.style.position = "fixed";
    carret.style.height = "0px";
    carret.style.width = "0px";
    carret.style.boxShadow = "0px 0px 5px " + popoverBorder;
    carret.style.borderTop = triangleSize + "px solid transparent";
    carret.style.borderBottom = triangleSize + "px solid transparent";
    carret.style.borderRight = triangleSize + "px solid " + popoverBorder;
    this.popoverPanel.appendChild(carret);

    //Create Popover Element
    var popover = document.createElement("div");
    popover.style.display = "inline-block";
    popover.style.backgroundColor = "#ffffff";
    popover.style.color = "#000000";
    popover.style.padding = ".5rem";
    popover.style.boxShadow = "0px 0px 5px " + popoverBorder;
    // popover.style.border = "1px solid " + popoverBorder;
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
    var options = new OptionPanel();
    options.create(
      defaults,
      rowIndex,
      meatball,
      thead.innerText,
      table,
      externalColumn,
      internalColumn,
      cellText
    );

    //Add Header Element
    popover.appendChild(header);
    //Add Options Panel
    popover.appendChild(options.options);

    //Add Click Event to display Options Panel
    header.addEventListener("click", function () {
      var style = options.style.display;
      var change = false;
      change = style === "block";
      change
        ? (options.style.display = "none")
        : (options.style.display = "block");
    });

    this.popoverPanel.appendChild(popover);
    var popoverPanel = this.popoverPanel;
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
    this.popoverPanel.addEventListener("mouseleave", function () {
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

  Meatball.prototype.remove = function () {
    if (this.popoverPanel) {
      if (this.popoverPanel.parentNode) {
        this.popoverPanel.parentNode.removeChild(this.popoverPanel);
      }
    }
  };

  function OptionPanel() {
    this.options = document.createElement("div");
    this.options.style.padding = ".25rem";
    this.options.style.borderRadius = ".25rem";
  }

  //Starting function call, and creates all values
  OptionPanel.prototype.create = function (
    defaults,
    rowIndex,
    meatball,
    thead,
    table,
    externalColumn,
    internalColumn,
    cellText
  ) {
    var optionsPanel = this;
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
      radio.name = "options";
      radio.style.margin = "0px";
      radio.style.display = "inline";
      radio.type = "radio";
      radio.value = ele;

      if (containsSubString(ele, cellText)) {
        radio.checked = true;
      }
      radio.style.cursor = "pointer";
      optionPanel.style.cursor = "pointer";

      optionPanel.addEventListener("click", function () {
        if (!radio.checked) {
          radio.checked = true;
          updateTarget(
            ele,
            rowIndex,
            meatball,
            thead,
            table,
            externalColumn,
            internalColumn
          );
        }
      });

      optionPanel.addEventListener("mouseenter", function () {
        optionPanel.style.boxShadow = "0px 0px 10px #BABBFD";
      });
      optionPanel.addEventListener("mouseleave", function () {
        optionPanel.style.boxShadow = "0px 0px 0px";
      });

      //Add Click Event to update list
      optionPanel.appendChild(radio);
      optionPanel.appendChild(option);
      optionsPanel.options.appendChild(optionPanel);
    });
  };

  //Easier way of handling the different colors and defaults
  function Colors() {
    this.blue = "#0075ff";
    this.green = "#27e833";
    this.red = "#d71010";
    this.yellow = "#f6de1c";
    this.defaults = [
      { value: "Up", color: this.green },
      { value: "Down", color: this.red },
      { value: "Degraded", color: this.yellow },
      { value: "NA", color: "inherit" },
      { value: "100-90", color: this.green },
      { value: "89-80", color: this.yellow },
      { value: "79-10", color: this.red },
      { value: "<10", color: this.blue },
    ];
  }

  //Gets colors.  If it cannot find a color, it defaults to black
  Colors.prototype.get = function (value) {
    if (!value) {
      return "#000000";
    }
    var results = this.defaults.filter(function (item) {
      if (containsSubString(item.value, value)) {
        return item;
      }
    });

    if (results[0]) {
      return results[0].color;
    } else {
      return "#000000";
    }
  };

  //Either replaces the default value or creates a new values
  //If a specific color value is called, it will use one of the default colors
  Colors.prototype.set = function (value, color) {
    if (this.replaceValue(value, color)) {
      return;
    }
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

  //Private function for the object
  Colors.prototype.replaceValue = function (value, color) {
    var found = false;
    this.defaults.map(function (item, index) {
      if (compareString(value, item.value)) {
        found = true;
        item = { value: value, color: color };
      }
    });
    return found;
  };

  function StatusSVG(props) {
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.style.padding = "0px 10px";
    this.svg.setAttribute("role", "img");
    this.svg.setAttribute("viewBox", "0 0 512 512");
    this.svg.setAttribute("width", "30px");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", props.color);
    var iconPath =
      props.type === "success"
        ? "M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 48c110.532 0 200 89.451 200 200 0 110.532-89.451 200-200 200-110.532 0-200-89.451-200-200 0-110.532 89.451-200 200-200m140.204 130.267l-22.536-22.718c-4.667-4.705-12.265-4.736-16.97-.068L215.346 303.697l-59.792-60.277c-4.667-4.705-12.265-4.736-16.97-.069l-22.719 22.536c-4.705 4.667-4.736 12.265-.068 16.971l90.781 91.516c4.667 4.705 12.265 4.736 16.97.068l172.589-171.204c4.704-4.668 4.734-12.266.067-16.971z"
        : "M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z";

    path.setAttribute("d", iconPath);
    this.svg.appendChild(path);
  }

  //Displays information to users
  //Set the message (setMessage) first, then show (show) message for five seconds (default value)
  //Also handles loading through use of startLoading and endLoading
  //Debug allows developers to handle edit the notification object and with debugging in environments where development tools have been disabled
  function Notification(message) {
    this.notification = document.createElement("div");
    this.notification.style.backgroundColor = "white";
    this.notification.style.borderRadius = "0";
    this.notification.style.boxShadow = "0px 1px 1px rgba(0,0,0,0.1)";
    this.notification.style.color = "black";
    this.notification.style.display = "flex";
    this.notification.style.flexDirection = "row";
    this.notification.style["-ms-flex"] = "1 0 1";
    this.notification.style.height = "50px";
    this.notification.style.padding = "0.5rem";
    this.notification.style.position = "fixed";
    this.notification.style.right = "10px";
    this.notification.style.top = "50px";
    this.notification.style.width = "250px";
    this.notification.style.zIndex = "1";
    this.message = message;
    this.text = document.createElement("div");
    this.text.style.display = "flex";
    this.text.style.flexDirection = "column";
    this.text.style.justifyContent = "center";
    this.text.style.position = "relative";
    this.title = document.createElement("div");
    this.title.style.fontSize = "12pt";
    this.subtitle = document.createElement("div");
    this.subtitle.innerText = this.message;
    this.subtitle.style.fontSize = "9pt";
    this.close = document.createElement("div");
    this.close.innerText = "x";
    this.close.style.cursor = "pointer";
    this.close.style.display = "flex";
    this.close.style.flexDirection = "column";
    this.close.style.fontSize = "14px";
    this.close.style.height = "14px";
    this.close.style.justifyContent = "center";
    this.close.style.position = "absolute";
    this.close.style.right = "0px";
    this.close.style.top = "0px";
    this.close.style.width = "14px";
    this.text.appendChild(this.title);
    this.text.appendChild(this.subtitle);
    this.text.appendChild(this.close);
    return this;
  }

  Notification.prototype.listeners = function () {
    var self = this;
    this.close.onclick = function () {
      self.remove(self.notification);
    };
    return this;
  };

  Notification.prototype.success = function () {
    var icon = new StatusSVG({ color: "green", type: "success" });
    this.svg = icon.svg;
    this.title.innerText = "Successfully Saved";
    return this;
  };

  Notification.prototype.failed = function () {
    var icon = new StatusSVG({ color: "red", type: "failure" });
    this.svg = icon.svg;
    this.title.innerText = "Failed to Save";
    return this;
  };

  Notification.prototype.show = function () {
    this.notification.appendChild(this.svg);
    this.notification.appendChild(this.text);
    document.body.appendChild(this.notification);
    this.timer = setTimeout(this.remove, 3000, this.notification);
    return this;
  };

  Notification.prototype.remove = function ($el) {
    $el.parentNode.removeChild($el);
    clearTimeout(this.timer);
    return this;
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

  //Checks to see if s1 substring of length (s0.length) contains s0
  function containsSubString(s0, s1) {
    if (s0.length === s1.length) {
      return containsString(s0, s1);
    }
    return s1.slice(0, s0.length).toLowerCase().indexOf(s0.toLowerCase()) > -1;
  }

  /*Checks to see if s0 contains to s1*/
  function containsString(s0, s1) {
    return s0.toLowerCase().indexOf(s1.toLowerCase()) > -1;
  }

  /*Uses containsString to check to see if the two strings are equal*/
  function compareString(s0, s1) {
    return containsString(s0, s1) && containsString(s1, s0);
  }
})();
