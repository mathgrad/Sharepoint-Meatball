(function () {
  //Size sets the Meatball size in pixels
  var size = 20;
  //Creates the Color object which manages meatball colors
  var colors = new Colors();
  //Creates the Pantry object which manages toast notifications
  var kitchen = new Pantry();
  //Used by developers in Production to find bugs
  var debug = false;

  //Show the history and on fail display "No Messages" in the history view
  //needs message, colName, rowId, tableGUID
  function RetrieveHistory() {
    //the row information needs to get passed here

    var listName = "History " + ctx.SiteTitle; //"Sandbox"
    var message = "hello sharepoint"; //this represents the message that the user wants to POST // this should be getting passed to the GET -- may need to assign to the variable onced it's passed into

    //////////Test Vars//////////
    //this needs to be passed as the func params
    var colName = "TestName"; //internalName for the status column
    var rowId = 45; //iid
    var tableGUID = "55e24452-ce07-437e-991b-fdb29cb030ca"; //list guid
    /////////////////////////////

    var url =
      ctx.HttpRoot +
      "/_api/web/lists/getbytitle('" +
      listName +
      "')/items?$filter=Title eq '" +
      tableGUID +
      " - " +
      rowId +
      " - " +
      colName +
      "'&$orderby=Created desc";
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
        console.log("Messages:", data);
        return false;
      },
      error: function (error) {
        console.log("No History:", error);
      },
    });
  }
  //needs message, colName, rowId, tableGUID
  function PostHistory() {
    //the row information needs to get passed here
    var listName = "History " + ctx.SiteTitle; //"Sandbox"
    var message = "hello sharepoint"; //this represents the message that the user wants to POST
    //////////Test Vars//////////
    //this needs to be passed as the func params
    var colName = "TestName";
    var rowId = 45;
    var tableGUID = "55e24452-ce07-437e-991b-fdb29cb030ca";
    /////////////////////////////

    var url = ctx.HttpRoot + "/_api/web/lists/getbytitle('" + listName + "')";

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
        console.log("FindHistory:", data);
        //get the user informaton before the concat
        //needs to expand the modified by object to ensure that the person's name is viwable
        GetCurrentUser(data.d.Id, message, colName, rowId, tableGUID);
        return false;
      },
      error: function (error) {
        console.log("Error in the PostHistory:", error);
        MakeList(listName, message, colName, rowId, tableGUID);
      },
    });
  }

  function GetCurrentUser(listId, message, colName, rowId, tableGUID) {
    console.log(listId);
    var url =
      ctx.HttpRoot + `/_api/SP.UserProfiles.PeopleManager/GetMyProperties`;
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
        console.log("CurrentUser:", data);
        MakeHistory(
          listId,
          message,
          colName,
          rowId,
          tableGUID,
          data.d.DisplayName
        ); // need to pass the values for the colStatus and rowId
        return false;
      },
      error: function (error) {
        console.log("Error in the getting the current:", error);
      },
    });
  }

  function MakeList(listName, message, colName, rowId, tableGUID) {
    var data = {
      __metadata: { type: "SP.List" },
      AllowContentTypes: true,
      BaseTemplate: 100,
      ContentTypesEnabled: true,
      Title: listName,
    };

    var url = ctx.HttpRoot + "/_api/web/lists"; //this is dev env

    $.ajax({
      url: url,
      type: "POST",
      data: JSON.stringify(data),
      headers: {
        Accept: "application/json; odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        credentials: true,
        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
      },
      success: function (data) {
        console.log("History list created - successfully");
        CreateMessageColumn(data.d.Id, message, colName, rowId, tableGUID); //colName and rowId come from the cell
        return false;
      },
      error: function (error) {
        console.log("History list creation failed:", error);
      },
    });
  }

  function CreateMessageColumn(listId, message, colName, rowId, tableGUID) {
    var data = {
      __metadata: { type: "SP.Field" },
      Title: "Message",
      FieldTypeKind: 2,
      Required: "false",
      EnforceUniqueValues: "false",
      StaticName: "Message",
    };

    var url = ctx.HttpRoot + "/_api/web/lists('" + listId + "')/Fields"; //this is dev env

    $.ajax({
      url: url,
      type: "POST",
      data: JSON.stringify(data),
      headers: {
        Accept: "application/json; odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        credentials: true,
        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
      },
      success: function (data) {
        console.log("Message col created - successfully");
        CreateUserNameColumn(listId, message, colName, rowId, tableGUID);
        return false;
      },
      error: function (error) {
        console.log("Message col creation failed:", error);
      },
    });
  }

  function CreateUserNameColumn(listId, message, colName, rowId, tableGUID) {
    var data = {
      __metadata: { type: "SP.Field" },
      Title: "UserName",
      FieldTypeKind: 2,
      Required: "false",
      EnforceUniqueValues: "false",
      StaticName: "UserName",
    };

    var url = ctx.HttpRoot + "/_api/web/lists('" + listId + "')/Fields"; //this is dev env

    $.ajax({
      url: url,
      type: "POST",
      data: JSON.stringify(data),
      headers: {
        Accept: "application/json; odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        credentials: true,
        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
      },
      success: function (data) {
        console.log("UserName col created - successfully");
        GetCurrentUser(listId, message, colName, rowId, tableGUID);
        return false;
      },
      error: function (error) {
        console.log("UserName col creation failed:", error);
      },
    });
  }

  function MakeHistory(
    listId,
    message,
    colName,
    rowId,
    tableGUID,
    currentUser
  ) {
    //we would need the info that the table has
    //has to be able to get the person data in order to post the entry to the popover see People Manager
    var data = {
      __metadata: { type: "SP.ListItem" },
      Message: message,
      Title: tableGUID + " - " + rowId + " - " + colName, //name of the status column that is passed
      UserName: currentUser,
    };

    var url = ctx.HttpRoot + "/_api/web/lists('" + listId + "')/items "; //this is dev env

    $.ajax({
      url: url,
      type: "POST",
      data: JSON.stringify(data),
      headers: {
        Accept: "application/json; odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        credentials: true,
        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
      },
      success: function (data) {
        console.log("History entry created - successfully");
        return false;
      },
      error: function (error) {
        console.log("History list creation failed:", error);
      },
    });
  }

  //the id (row#) will be apart of that item... would will need to be passed
  function DeleteHistory() {
    //////////Test Vars//////////
    var listId = "5fa2c8ab-cdf8-40c6-b425-75bc9e6b95c6";
    var id = 1; //the id on the list item to be deleted not the iid (rowId) of the meatball
    /////////////////////////////

    var url =
      ctx.HttpRoot + "/_api/web/lists('" + listId + "')/items(" + id + ")"; //this is dev env

    $.ajax({
      url: url,
      type: "DELETE",
      headers: {
        Accept: "application/json; odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        credentials: true,
        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
        "IF-MATCH": "*",
      },
      success: function (data) {
        console.log("History entry deleted - successfully");
        return false;
      },
      error: function (error) {
        console.log("History entry deletion failed:", error);
      },
    });
  }
  //the id (row#) will be apart of that item... would will need to be passed + the message
  function UpdateHistory() {
    //////////Test Vars//////////
    var listId = "5fa2c8ab-cdf8-40c6-b425-75bc9e6b95c6";
    var id = 2; //the id on the list item to be deleted not the iid (rowId) of the meatball
    var message = "hi pierre";
    /////////////////////////////

    var data = {
      __metadata: { type: "SP.ListItem" },
      Message: message,
    };

    var url =
      ctx.HttpRoot + "/_api/web/lists('" + listId + "')/items(" + id + ")"; //this is dev env

    $.ajax({
      url: url,
      type: "POST",
      data: JSON.stringify(data),
      headers: {
        Accept: "application/json; odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        credentials: true,
        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
        "IF-MATCH": "*",
      },
      success: function (data) {
        console.log("History entry updated - successfully");
        return false;
      },
      error: function (error) {
        console.log("History entry update failed:", error);
      },
    });
  }

  //On initial load
  window.addEventListener("load", function () {
    start();
    PostHistory();
  });

  //On change
  window.addEventListener("hashchange", function () {
    start();
  });

  function start() {
    if (!window.jQuery) {
      alert("Please contact help desk.  Script not properly loaded.");
      return;
    }

    window.addEventListener("error", function (msg, url, line) {
      if (debug) {
        var errorToast = new Toast().setMessage(msg).setListeners().show();
        kitchen.debug(errorToast);
      }
    });

    //Checks for overrides
    if (window.meatball_override) {
      meatball_override.forEach(function (item) {
        colors.set(item.value, item.color);
      });
    }

    //Get all the tables -- create array
    var tables = [].slice.call(document.getElementsByTagName("table"));

    if (errorChecking(tables)) {
      if (debug) {
        var errorToast = new Toast()
          .setMessage("No Tables Found")
          .setListeners()
          .show();
        kitchen.debug(errorToast);
      }
      return;
    }
    //Include only the actual lists
    tables = tables.filter(function (table) {
      return table.getAttribute("class") === "ms-listviewtable";
    });
    //Grabbing the list url + Iterate through the set of tables
    tables.forEach(function (table, ti) {
      var currentListId = table.getAttribute("id").substring(1, 37);
      var root = ctx.HttpRoot;
      var url =
        root +
        "/_api/web/lists('" +
        currentListId +
        "')/fields?$filter=TypeDisplayName eq 'Choice'";
      var listTitle = table.summary;
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
                popoverData.internalColumn[i],
                listTitle
              );
            });
          }
          return false;
        },
        error: function (error) {
          if (debug) {
            var errorToast = new Toast()
              .setMessage("Error: Get list choices request Failed.")
              .setListeners()
              .show();
            kitchen.debug(errorToast);
          }
        },
      });
    });
  }

  //Finds cells with known default values and replaces them with meatballs
  function findTargets(
    $table,
    values,
    externalColumn,
    internalColumn,
    listTitle
  ) {
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
        //this checks if the cell contains the text which is in user choices, selects that cell to add the meatball and popover
        $cells.map(function ($cell, ci) {
          //Comparing the thead (internal name) with the external name
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
                displayValue,
                listTitle
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
    internalColumn,
    listTitle
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
    //Closes the popover
    meatball.removePopover();
    var toast = new Toast().startLoading().show();
    kitchen.show(toast);
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
        toast
          .endLoading()
          .setMessage(
            listTitle + " - " + externalColumn + " updated successfully"
          )
          .setSuccess()
          .setListeners()
          .show();

        return false;
      },
      error: function (error) {
        toast
          .endLoading()
          .setMessage(listTitle + " - " + externalColumn + " failed to update")
          .setFailed()
          .setListeners()
          .show();
        kitchen.show(toast);
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
    this.element.style.margin = "auto";
    this.element.style.padding = "0px";
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
    value,
    listTitle
  ) {
    var meatball = this;
    this.element.style.backgroundColor = colors.get(cellText);

    var backgroundColor = "rgb(240, 240,240)";
    var triangleSize = 10;

    this.popoverPanel = document.createElement("div");
    this.popoverPanel.style.backgroundColor = "transparent";
    this.popoverPanel.style.padding = "10px";
    this.popoverBody = document.createElement("div");
    this.popoverBody.style.display = "inline-block";
    this.popoverBody.style.margin = "0px";
    this.popoverBody.style.padding = "0px";
    this.popoverBody.style.backgroundColor = backgroundColor;
    this.popoverBody.style.boxShadow = "1px 1px 4px 1px rgb(0 0 0 / 0.2)";

    var carret = document.createElement("div");
    carret.style.margin = "0px";
    carret.style.display = "inline-block";
    carret.style.position = "absolute";
    carret.style.height = "0px";
    carret.style.width = "0px";
    carret.style.left = "2px";
    carret.style.top = "29px";
    carret.style.borderTop = triangleSize + "px solid transparent";
    carret.style.borderBottom = triangleSize + "px solid transparent";
    carret.style.borderRight = triangleSize + "px solid " + backgroundColor;

    //Create Popover Element
    var popover = document.createElement("div");
    popover.style.display = "inline-block";
    popover.style.backgroundColor = backgroundColor;
    popover.style.color = "#000000";
    popover.style.padding = ".5rem";
    popover.style.boxShadow = "0px 0px 5px " + backgroundColor;
    popover.style.borderRadius = ".25rem";
    popover.style.zIndex = "1";

    //Create Header Element
    var header = document.createElement("div");
    header.style.padding = ".25rem";
    header.style.borderRadius = ".25rem";
    header.style.textAlign = "center";
    header.style.marginBottom = ".25rem";
    header.style.backgroundColor = "#BABBFD";
    header.innerText = value;
    //Create Options Panel Object
    var options = new OptionPanel();
    options.create(
      defaults,
      rowIndex,
      meatball,
      thead.innerText,
      table,
      externalColumn,
      internalColumn,
      cellText,
      listTitle
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

    this.popoverBody.appendChild(carret);
    this.popoverBody.appendChild(popover);
    this.popoverPanel.appendChild(this.popoverBody);

    var popoverPanel = this.popoverPanel;
    //Used addEventListener versus onmouseenter = function due to concerns of
    //overriding other scripts
    //Add Mouse Enter Event to display
    this.element.addEventListener("mouseenter", function () {
      if (!popoverPanel.parentNode) {
        document.body.appendChild(popoverPanel);
        popoverPanel.style.position = "fixed";
        popoverPanel.style.left =
          this.getBoundingClientRect().right - 12 + triangleSize + "px";
        popoverPanel.style.top =
          this.getBoundingClientRect().top - 40 + triangleSize + "px";
      }
    });

    this.element.addEventListener("mouseleave", function (e) {
      if (!e.toElement.parentNode.contains(popoverPanel)) {
        popoverPanel.parentNode.removeChild(popoverPanel);
      }
    });

    //Add Mouse leave Event to hide
    this.popoverPanel.addEventListener("mouseleave", function (e) {
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

  Meatball.prototype.removePopover = function () {
    if (this.popoverPanel) {
      if (this.popoverPanel.parentNode) {
        this.popoverPanel.parentNode.removeChild(this.popoverPanel);
      }
    }
  };

  //Shows list of predetermine choices for the user
  function OptionPanel() {
    this.options = document.createElement("div");
    this.options.style.padding = ".25rem";
    this.options.style.borderRadius = ".25rem";
  }

  OptionPanel.prototype.create = function (
    defaults,
    rowIndex,
    meatball,
    thead,
    table,
    externalColumn,
    internalColumn,
    cellText,
    listTitle
  ) {
    var panel = this;

    defaults.forEach(function (ele, index) {
      var option = document.createElement("div");
      option.style.padding = ".25rem";
      option.style.marginBottom = ".25rem";
      option.style.textAlign = "left";
      option.style.borderRadius = ".25rem";
      option.style.cursor = "pointer";

      var description = document.createElement("div");
      description.innerText = ele;
      description.style.marginLeft = ".25rem";
      description.style.display = "inline";

      var radio = document.createElement("input");
      radio.name = "option";
      radio.style.margin = "0px";
      radio.style.display = "inline";
      radio.style.cursor = "pointer";
      radio.type = "radio";

      if (containsSubString(ele, cellText)) {
        radio.checked = true;
        option.style.backgroundColor = "#BABBFD";
      }

      option.addEventListener("mouseenter", function () {
        option.style.boxShadow = "0px 0px 10px #BABBFD";
      });
      option.addEventListener("mouseleave", function () {
        option.style.boxShadow = "0px 0px 0px";
      });

      panel.options.addEventListener("mousedown", function () {
        [].slice.call(panel.options.children).forEach(function (item) {
          if (item.parentElement.querySelector(":hover") === item) {
            item.style.backgroundColor = "#BABBFD";
          } else {
            item.style.backgroundColor = "";
          }
        });
      });

      option.addEventListener("mouseup", function () {
        if (!radio.checked) {
          radio.checked = true;
          option.style.backgroundColor = "#BABBFD";
          option.style.boxShadow = "0px 0px 0px";
          updateTarget(
            ele,
            rowIndex,
            meatball,
            thead,
            table,
            externalColumn,
            internalColumn,
            listTitle
          );
        } else {
          option.style.backgroundColor = "#BABBFD";
        }
      });

      //Add Click Event to update list
      option.appendChild(radio);
      option.appendChild(description);
      panel.options.appendChild(option);
    });
  };

  //A hashmap between values and colors
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
      { value: "89-79", color: this.yellow },
      { value: "79-10", color: this.red },
      { value: "<79", color: this.red },
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
  //If a known color value is called, it will use one of the default colors
  //For example, if user supplies blue, then #0075ff is added
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

  //Private function for the Color object
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

  //Controller for the Toast Object
  function Pantry() {
    this.container = document.createElement("div");
    this.container.style.width = "250px";
    this.container.style.right = "40px";
    this.container.style.display = "flex";
    this.container.style.flexDirection = "column";
    this.container.style.zIndex = "1";
    this.container.style.top = "75px";
    this.container.style.position = "fixed";
    this.container.style.backgroundColor = "transparent";
    document.body.appendChild(this.container);
  }

  Pantry.prototype.show = function (notification) {
    var note = notification;
    this.container.appendChild(notification.toast);
    var timer = setTimeout(
      function (note) {
        note.removeToast();
      },
      3000,
      note
    );
    return this;
  };

  Pantry.prototype.debug = function (toast) {
    this.container.appendChild(toast.toast);
  };

  //Notification object with ability to display messages, and images
  function Toast() {
    this.toast = document.createElement("div");
    this.toast.id = Math.floor(Math.random() * 1000);
    this.toast.style.backgroundColor = "white";
    this.toast.style.borderRadius = "0";
    this.toast.style.boxShadow = "0px 1px 1px rgba(0,0,0,0.1)";
    this.toast.style.color = "black";
    this.toast.style.display = "flex";
    this.toast.style.marginTop = "5px";
    this.toast.style["-ms-flex"] = "1 0 1";
    this.toast.style.height = "50px";
    this.toast.style.padding = "0.5rem";
    this.toast.style.width = "275px";
    this.toast.style.zIndex = "1";
    this.text = document.createElement("div");
    this.text.style.display = "flex";
    this.text.style.flexDirection = "column";
    this.text.style.justifyContent = "center";
    this.text.style.position = "relative";
    this.text.style.paddingLeft = "10px";
    return this;
  }

  Toast.prototype.setMessage = function (message) {
    this.message = message;
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
  };

  Toast.prototype.setListeners = function () {
    var self = this.toast;
    this.close.addEventListener("click", function () {
      self.removeToast();
    });
    return this;
  };

  Toast.prototype.startLoading = function () {
    var icon = new LoadingSVG();
    this.svg = icon.svg;
    return this;
  };

  Toast.prototype.endLoading = function () {
    this.svg.parentNode.removeChild(this.svg);
    return this;
  };

  Toast.prototype.setSuccess = function () {
    var icon = new StatusSVG({ color: "green", type: "success" });
    this.svg = icon.svg;
    this.title.innerText = "Successfully Saved";
    return this;
  };

  Toast.prototype.setFailed = function () {
    var icon = new StatusSVG({ color: "red", type: "failure" });
    this.svg = icon.svg;
    this.title.innerText = "Failed to Save";
    return this;
  };

  Toast.prototype.show = function () {
    this.toast.appendChild(this.svg);
    this.toast.appendChild(this.text);
    return this;
  };

  Toast.prototype.removeToast = function () {
    if (this.toast) {
      if (this.toast.parentNode) {
        this.toast.parentNode.removeChild(this.toast);
        clearTimeout(this.timer);
      }
    }
    return this;
  };

  //Creates Loading SVG for toast
  function LoadingSVG(props) {
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("role", "img");
    this.svg.setAttribute("viewBox", "0 0 512 512");
    this.svg.setAttribute("width", "120px");
    this.svg.setAttribute("height", "120px");

    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");

    var linearGradient = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "linearGradient"
    );
    linearGradient.setAttribute("id", "colorFill");

    var stops = [
      {
        color: "#ffffff",
        offset: "0%",
        opacity: "0",
      },
      {
        color: "#000000",
        offset: "100%",
        opacity: "1",
      },
    ];

    stops.forEach(function (item) {
      var stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      stop.setAttribute("offset", item.offset);
      stop.setAttribute("stop-color", item.color);
      stop.setAttribute("fill-opacity", item.opacity);
      linearGradient.appendChild(stop);
    });
    g.appendChild(linearGradient);

    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "url(#colorFill)");
    path.setAttribute("fill-rule", "evenodd");
    path.setAttribute(
      "d",
      "M 63.85,0 A 63.85,63.85 0 1 1 0,63.85 63.85,63.85 0 0 1 63.85,0 Z m 0.65,19.5 a 44,44 0 1 1 -44,44 44,44 0 0 1 44,-44 z"
    );
    g.appendChild(path);

    var animateTransform = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "animateTransform"
    );
    animateTransform.setAttribute("attributeName", "transform");
    animateTransform.setAttribute("type", "rotate");
    animateTransform.setAttribute("from", "0 64 64");
    animateTransform.setAttribute("to", "360 64 64");
    animateTransform.setAttribute("dur", "1080ms");
    animateTransform.setAttribute("repeatCount", "indefinite");
    g.appendChild(animateTransform);

    this.svg.appendChild(g);
  }

  //Creates a status svg depending on values: success => a green check circle; failure => a red x circle;
  function StatusSVG(props) {
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("role", "img");
    this.svg.setAttribute("viewBox", "0 0 512 512");
    this.svg.setAttribute("height", "30px");
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
