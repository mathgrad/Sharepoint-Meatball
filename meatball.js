var scripts = [].slice.call(document.getElementsByTagName("script"));
var meatball = scripts.filter(function (script) {
  if (script.src.indexOf("meatball.js") > -1) {
    return script;
  }
});
meatball = meatball[0].src;
var baseUrl = meatball.substring(0, meatball.indexOf("meatball"));
var ims = {};
ims.sharepoint = {};
var scripts = [
  "column.js",
  "list.js",
  "person.js",
  "notification.js",
  "style.js",
  "svg.js",
];

function scriptBuilder(url) {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = baseUrl + url;
  script.defer = true;
  script.async = false;
  document.body.appendChild(script);
  return script;
}

function loadScripts() {
  scripts
    .map(function (src) {
      return scriptBuilder(src);
    })
    .map(function (script, i) {
      if (i == scripts.length - 1) {
        script.addEventListener("load", function () {
          ims.sharepoint.color = Color;
          ims.sharepoint.column = Column;
          ims.sharepoint.list = List;
          ims.sharepoint.person = Person;
          ims.sharepoint.notification = Pantry;
          ims.sharepoint.style = style;
          startMeatball();
        });
      }
    });
}

loadScripts();

function startMeatball() {
  var rest = new ims.sharepoint.list();
  var restCol = new ims.sharepoint.column();
  var restPerson = new ims.sharepoint.person();
  var color = new ims.sharepoint.color();

  var meatballDefaults = new Defaults();
  var defaultBackgroundColor = 16;
  var defaultMHIBackgroundColor = 11;
  var defaultHoverBackgroundColor = 15;
  var defaultButtonBackgroundColor = 4;
  var defaultButtonHoverBackgroundColor = 14;
  var defaultCancelButtonBackgroundColor = 4;
  var defaultCancelButtonHoverBackgroundColor = 14;
  var defaultInputBackgroundColor = 17;
  var defaultColor = 0;
  var defaultTitleColor = 13;

  //Creates the Pantry object which manages toast notifications
  var kitchen = new ims.sharepoint.notification();

  var regex = /[^\d\w\s\.\?\!\@\-\:\"\']/g;
  //Used by developers in Production to find bugs
  var debug = false;

  var begin = true;
  var checkUser = "";
  var historyListGUID = "";
  var lastAuthor = false;
  var organized = [[]];
  var userName = "";

  var style = document.createElement("style");
  style.type = "text/css";
  style.textContent =
    "@keyframes spin{0%{transform: rotate(0deg);}100%{transform: rotate(360deg);}}" +
    "@-webkit-keyframes spin{0%{-webkit-transform: rotate(0deg);}100%{-webkit-transform: rotate(360deg);}}" +
    "#CommentBox:focus{outline:none;}" +
    "#MHContainer::-webkit-scrollbar-track{border-radius:10px;background-color:" +
    color.get(defaultBackgroundColor) +
    ";margin-right:5px;}" +
    "#MHContainer::-webkit-scrollbar{width:12px;background-color:" +
    color.get(defaultBackgroundColor) +
    ";}" +
    "#MHContainer::-webkit-scrollbar-thumb{border-radius:10px;-webkit-box-shadow:inset 0 0 6px rgba(0,0,0,0.3);background-color: " +
    color.get(24) +
    ";}" +
    "#MHContainer::-webkit-scrollbar-thumb:hover{background-color: " +
    color.get(4) +
    "}";
  document.getElementsByTagName("head")[0].appendChild(style);

  //On initial load
  window.addEventListener("load", function () {
    if (begin) {
      begin = false;
      start();
    }
  });

  //On change
  window.addEventListener("hashchange", function () {
    if (begin) {
      begin = false;
      start();
    }
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
        meatballDefaults.set(item);
      });
    }

    if (historyListGUID.length <= 0) {
      function cb(error, props) {
        if (error) {
          function cb(error) {
            if (error) {
              console.log(error);
            }
            function cb(error) {
              if (error) {
                console.log(error);
              }
              function cb(error, props) {
                if (error) {
                  console.log(error);
                }
                if (props.length !== 0) {
                  historyListGUID = props.d.Id;
                }
              }
              restCol.create(
                "Status",
                2,
                "false",
                "false",
                ctx.PortalUrl,
                "History",
                cb
              );
            }
            restCol.create(
              "Message",
              2,
              "false",
              "false",
              ctx.PortalUrl,
              "History",
              cb
            );
          }
          rest.createList(ctx.PortalUrl, "History", cb);
          console.log(error);
          return;
        }
        if (props.length !== 0) {
          historyListGUID = props;
        }
      }
      rest.find(ctx.PortalUrl, "History", cb);
    }

    if (userName.length <= 0) {
      function cb(error, name) {
        if (error) {
          console.log(error);
        }
        userName = name;
      }
      restPerson.get(ctx.PortalUrl, cb);
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

      //Table Guid checker
      if (currentListId.indexOf("-") < 0) {
        return;
      }

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
              new Meatball().init(
                values,
                externalColumn,
                internalColumn,
                $cell,
                $row.getAttribute("iid").split(",")[1],
                $thead[ci],
                $table.getAttribute("id").substring(1, 37),
                text,
                displayValue,
                listTitle,
                "200px"
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
    var data = {
      __metadata: { type: "SP.ListItem" },
    };
    data[internalColumn] = ele;
    var url =
      ctx.HttpRoot +
      "/_api/web/lists('" +
      table +
      "')/items(" +
      rowIndex +
      ")?$select=" +
      internalColumn;
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
  function Meatball() {
    this.circle = document.createElement("div");
    this.circle.style = ims.sharepoint.style({
      type: "meatball",
      size: "large",
    }).$ele;
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
    listTitle,
    panelWidth
  ) {
    var meatball = this;
    var triangleSize = 10;
    var meatballHistoryDisplay = new MeatballHistory(
      table,
      rowIndex,
      internalColumn,
      value
    );
    meatballHistoryDisplay.listGUID = historyListGUID;

    this.circle.style.backgroundColor = colors.get(
      meatballDefaults.get(cellText)
    );

    this.$ele = document.createElement("div");
    this.$ele.style.backgroundColor = "transparent";
    this.$ele.style.padding = "10px";

    this.popoverBody = document.createElement("div");
    this.popoverBody.style.backgroundColor = color.get(defaultBackgroundColor);
    this.popoverBody.style.boxShadow = "1px 1px 4px 1px rgb(0 0 0 / 0.2)";
    this.popoverBody.style.color = color.get(defaultColor);
    this.popoverBody.style.display = "inline-block";
    this.popoverBody.style.margin = "0px";
    this.popoverBody.style.padding = "0px";
    this.popoverBody.style.width = panelWidth;

    this.carret = document.createElement("div");
    this.carret.style = ims.sharepoint.style({
      type: "carret",
      size: "",
      bgc: defaultBackgroundColor,
    }).$ele;

    //Create Popover Element
    this.popover = document.createElement("div");
    this.popover.style.borderRadius = ".25rem";
    this.popover.style.boxShadow =
      "0px 0px 5px " + color.get(defaultBackgroundColor);
    this.popover.style.display = "inline-block";
    this.popover.style.padding = ".5rem";
    this.popover.style.zIndex = "1";

    //Create Header Element
    this.header = document.createElement("div");
    this.header.innerText = value;
    this.header.style.marginBottom = ".25rem";
    this.header.style.padding = ".25rem";
    this.header.style.textAlign = "center";
    this.header.style.width = "100%";

    //Add Header Element
    this.popover.appendChild(this.header);

    //Create Options Panel Object
    this.options = new OptionPanel();
    this.options.create(
      defaults,
      rowIndex,
      meatball,
      thead.innerText,
      table,
      externalColumn,
      internalColumn,
      cellText,
      listTitle,
      meatballHistoryDisplay
    );

    //Add Options Panel
    this.popover.appendChild(this.options.options);

    this.divider1 = document.createElement("hr");
    this.divider1.style.borderTop =
      "1pt solid " + color.get(defaultHoverBackgroundColor);

    this.popover.appendChild(this.divider1);

    //Add Click Event to display Options Panel
    this.header.addEventListener("click", function () {
      var style = meatball.options.style.display;
      var change = false;
      change = style === "block";
      change
        ? (meatball.options.style.display = "none")
        : (meatball.options.style.display = "block");
    });

    this.popoverBody.appendChild(this.carret);
    this.popoverBody.appendChild(this.popover);

    this.initHistoryContainer = document.createElement("div");
    this.initHistoryContainer.style.backgroundColor = color.get(
      defaultHoverBackgroundColor
    );
    this.initHistoryContainer.style.borderRadius = ".25rem";
    this.initHistoryContainer.style.color = color.get(defaultColor);
    this.initHistoryContainer.style.display = "block";
    this.initHistoryContainer.style.marginBottom = ".5rem";
    this.initHistoryContainer.style.marginLeft = ".5rem";
    this.initHistoryContainer.style.marginRight = ".5rem";
    this.initHistoryContainer.style.padding = ".25rem";

    this.initHistoryDate = document.createElement("div");
    this.initHistoryDate.style.display = "block";
    this.initHistoryDate.style.fontSize = "7pt";
    this.initHistoryDate.style.margin = ".25rem";
    this.initHistoryDate.style.padding = ".25rem";
    this.initHistoryDate.style.textAlign = "left";

    this.initHistoryMessage = document.createElement("div");
    this.initHistoryMessage.style.display = "block";
    this.initHistoryMessage.style.fontSize = "9pt";
    this.initHistoryMessage.style.margin = ".25rem";
    this.initHistoryMessage.style.padding = ".25rem";

    this.initHistoryName = document.createElement("div");
    this.initHistoryName.style.display = "block";
    this.initHistoryName.style.fontSize = "7pt";
    this.initHistoryName.style.margin = ".25rem";
    this.initHistoryName.style.padding = ".25rem";
    this.initHistoryName.style.textAlign = "left";

    this.initHistoryHeader = document.createElement("div");
    this.initHistoryHeader.style.display = "flex";
    this.initHistoryHeader.style.justifyContent = "space-between";

    this.showMore = document.createElement("div");
    this.showMore.innerText = "Show More";
    this.showMore.style = ims.sharepoint.style({
      type: "button",
      size: "normal",
      fc: defaultColor,
      bgc: defaultButtonBackgroundColor,
    }).$ele;

    this.showMore.addEventListener("mouseenter", function () {
      this.style.backgroundColor = color.get(defaultButtonHoverBackgroundColor);
    });

    this.showMore.addEventListener("mouseleave", function () {
      this.style.backgroundColor = color.get(defaultButtonBackgroundColor);
    });

    var addHistory = true;

    this.showMore.addEventListener("click", function () {
      if (!meatballHistoryDisplay.parentNode) {
        addHistory = true;
      }

      if (addHistory) {
        addHistory = !addHistory;
        function cb(error, data) {
          if (error) {
            console.log(error);
          }
          if (data.length !== 0) {
            var priorDate,
              currentDate = null;
            var nowDate = new Date();

            meatballHistoryDisplay.query = data[0].Title;

            var avatar = false;
            var lastDay = new Date().getDay();

            organized = data.reduce(
              function (acc, props) {
                var author = props.Author;
                var day = new Date(props.Created).getDay();
                var lastIndex = r.length - 1;
                //this pushes a "divider" for today's entries
                //Combined the break into the conditional because when it continued it pushed a author block into the break block
                if (lastDay !== day) {
                  acc.push([
                    { type: "break", timeStamp: new Date(props.Created) },
                  ]);
                  lastDay = day;
                  lastAuthor = "";
                } else if (!lastIndex && !lastAuthor) {
                  acc[0].push(props);
                  lastAuthor = author;
                  lastDay = new Date(props.Created).getDay();
                } else if (author === lastAuthor) {
                  acc[lastIndex].push(props);
                } else {
                  acc.push([props]);
                  lastAuthor = author;
                }
                return acc;
              },
              [[]]
            );

            organized = organized.map(function (block, index) {
              if (block.length === 1 && block[0].type === "break") {
                meatballHistoryDisplay.addDivider(block[0]);
              } else if (block.length >= 1) {
                var author = block[0].Author;
                var isRight = author === userName;

                //step 0 create mssg container
                //determine if its left or right -- important because before this was done in the message item
                var messageContainer = document.createElement("div");
                messageContainer.style.display = "flex";
                messageContainer.style.flexDirection = isRight
                  ? "row-reverse"
                  : "row";
                messageContainer.style.width = "100%";

                //step 1 create continer for avatar
                var avatarContainer = document.createElement("div");

                var avatar = document.createElement("div");
                avatar.style = ims.sharepoint.style({
                  type: "avatar",
                  bgc: defaultButtonBackgroundColor,
                }).$ele;
                avatar.style.margin = isRight
                  ? "0px 0px 0px 4px"
                  : "0px 4px 0px 0px";

                var avatarParts = author.split(" ");
                avatar.innerText =
                  avatarParts.length > 1
                    ? avatarParts[2].charAt(0) + avatarParts[0].charAt(0)
                    : author.charAt(0);
                avatarContainer.appendChild(avatar);

                //step 2 create the message block
                var messageBlock = document.createElement("div");
                messageBlock.style.alignItems = isRight
                  ? "flex-end"
                  : "flex-start";
                messageBlock.style.display = "flex";
                messageBlock.style.flex = "1";
                messageBlock.style.flexDirection = "column";
                messageContainer.appendChild(avatarContainer);
                messageContainer.appendChild(messageBlock);
                meatballHistoryDisplay.container.appendChild(messageContainer);

                //step 3 append each mssg to mssg block
                return {
                  block: messageBlock,
                  messages: block.map(function (item, index2) {
                    var mhItem = new MeatballHistoryMessage();
                    mhItem.setDisplay(
                      item.Author,
                      generateDateTime(item.Created),
                      item.Message,
                      item.ID,
                      meatballHistoryDisplay.listGUID,
                      null,
                      null,
                      null,
                      index2 === 0
                    );
                    meatballHistoryDisplay.build(mhItem);
                    messageBlock.appendChild(mhItem.$ele);

                    return mhItem;
                  }),
                };
              }
            });
          }
        }
        rest.get(
          table,
          rowIndex,
          internalColumn,
          cb,
          false,
          ctx.PortalUrl,
          "History"
        );
      }
      document.body.appendChild(meatballHistoryDisplay.$ele);
      meatballHistoryDisplay.container.scrollTop =
        meatballHistoryDisplay.container.scrollHeight;
    });

    this.initHistoryHeader.appendChild(this.initHistoryName);
    this.initHistoryHeader.appendChild(this.initHistoryDate);
    this.initHistoryContainer.appendChild(this.initHistoryHeader);
    this.initHistoryContainer.appendChild(this.initHistoryMessage);
    this.popoverBody.appendChild(this.initHistoryContainer);
    this.popoverBody.appendChild(this.showMore);

    this.$ele.appendChild(this.popoverBody);

    //Add Mouse Enter Event to display
    this.circle.addEventListener("mouseenter", function () {
      meatball.initHistoryMessage.innerText = "Loading...";
      function cb(error, data) {
        if (error) {
          console.log(error);
        }
        if (data.length === 1) {
          meatball.initHistoryMessage.innerText = data[0].Message;
          meatball.initHistoryName.innerText = data[0].Author;
          meatball.initHistoryDate.innerText = generateDateTime(
            data[0].Created
          );
        } else {
          meatball.initHistoryMessage.innerText = "No History Found";
          meatball.initHistoryContainer.style.textAlign = "center";
        }
        meatball.setPosition(triangleSize);
      }
      rest.get(
        table,
        rowIndex,
        internalColumn,
        cb,
        true,
        ctx.PortalUrl,
        "History"
      );

      add = true;
      document.body.appendChild(meatball.$ele);

      meatball.setPosition(triangleSize);
    });

    this.circle.addEventListener("mouseleave", function (e) {
      if (!e.toElement.parentNode.contains(meatball.$ele)) {
        meatball.$ele.parentNode.removeChild(meatball.$ele);
      }
    });

    //Add Mouse leave Event to hide
    this.$ele.addEventListener("mouseleave", function (e) {
      if (meatball.$ele) {
        if (meatball.$ele.parentNode) {
          meatball.$ele.parentNode.removeChild(meatball.$ele);
        }
      }
    });
    parent.innerText = "";
    parent.appendChild(this.circle);
  };

  Meatball.prototype.setPosition = function (triangleSize) {
    this.$ele.style.position = "fixed";
    this.$ele.style.right = "0px";
    this.$ele.style.left =
      this.circle.getBoundingClientRect().right - 12 + triangleSize + "px";

    this.carret.style = ims.sharepoint.style({
      type: "carret",
      size: "",
      bgc: defaultBackgroundColor,
    }).$ele;
    if (this.carret.parentNode) {
      this.carret.parentNode.removeChild(this.carret);
    }
    var windowHeight = window.innerHeight || document.body.clientHeight;
    var windowWidth = window.innerWidth || document.body.clientWidth;

    if (
      this.$ele.offsetHeight + this.circle.getBoundingClientRect().top <
      windowHeight
    ) {
      this.$ele.style.top =
        this.circle.getBoundingClientRect().top - 40 + triangleSize + "px";
    } else {
      var meatballHeight =
        this.circle.getBoundingClientRect().top - 40 + triangleSize;
      var meatballDifferenceHeight = Math.abs(
        meatballHeight - (windowHeight - this.$ele.offsetHeight)
      );

      if (meatballHeight <= windowHeight - this.$ele.offsetHeight) {
        this.carret.style.top = meatballDifferenceHeight + "px";
        this.$ele.style.top =
          windowHeight -
          this.$ele.offsetHeight -
          meatballDifferenceHeight +
          "px";
      } else {
        this.carret.style.top = 29 + meatballDifferenceHeight + "px";
        this.$ele.style.top = windowHeight - this.$ele.offsetHeight + "px";
      }
    }

    if (
      this.popoverBody.getBoundingClientRect().width +
        this.circle.getBoundingClientRect().right >
      windowWidth
    ) {
      this.$ele.appendChild(this.carret);
      this.carret.style.left =
        this.popoverBody.getBoundingClientRect().width + triangleSize + "px";
      this.carret.style.borderRight = "0px";
      this.carret.style.borderLeft =
        triangleSize + "px solid " + color.get(defaultBackgroundColor);
      this.$ele.style.left =
        this.circle.getBoundingClientRect().left -
        this.popoverBody.getBoundingClientRect().width -
        triangleSize -
        12 +
        "px";
      this.$ele.style.width =
        this.popoverBody.getBoundingClientRect().width + triangleSize + "px";
    } else {
      this.$ele.insertBefore(this.carret, this.$ele.firstChild);
    }
  };

  Meatball.prototype.setColor = function (value) {
    this.circle.style.backgroundColor = color.get(value);
  };

  Meatball.prototype.removePopover = function () {
    if (this.$ele) {
      if (this.$ele.parentNode) {
        this.$ele.parentNode.removeChild(this.$ele);
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
    listTitle,
    meatObj
  ) {
    var panel = this;

    defaults.forEach(function (ele, index) {
      var option = document.createElement("div");
      option.style.padding = ".25rem";
      option.style.marginBottom = ".25rem";
      option.style.textAlign = "left";
      option.style.borderRadius = ".25rem";
      option.style.cursor = "pointer";
      option.style.width = "100%";

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
        option.style.backgroundColor = color.get(defaultHoverBackgroundColor);
      }

      option.addEventListener("mouseenter", function () {
        if (radio.checked) {
          option.style.backgroundColor = color.get(defaultBackgroundColor);
        } else {
          option.style.backgroundColor = color.get(defaultHoverBackgroundColor);
        }
      });
      option.addEventListener("mouseleave", function () {
        if (radio.checked) {
          option.style.backgroundColor = color.get(defaultHoverBackgroundColor);
        } else {
          option.style.backgroundColor = color.get(defaultBackgroundColor);
        }
      });

      panel.options.addEventListener("mousedown", function () {
        [].slice.call(panel.options.children).forEach(function (item) {
          if (item.parentElement.querySelector(":hover") === item) {
            item.style.backgroundColor = color.get(defaultHoverBackgroundColor);
          } else {
            item.style.backgroundColor = color.get(defaultBackgroundColor);
          }
        });
      });

      option.addEventListener("mouseup", function () {
        if (!radio.checked) {
          radio.checked = true;
          option.style.backgroundColor = color.get(defaultHoverBackgroundColor);
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

          var autoComment = cellText
            ? "Status change: " + cellText + " to " + ele + " by " + userName
            : "Initial Status: " + ele + " by " + userName;
          rest.makeHistoryEntry(
            historyListGUID,
            autoComment,
            internalColumn,
            rowIndex,
            table,
            true,
            ctx.PortalUrl,
            "History",
            null
          );
          cellText = ele; //this will change the current value of meatball for the view purposes.
        } else {
          option.style.backgroundColor = color.get(defaultHoverBackgroundColor);
        }
      });

      //Add Click Event to update list
      option.appendChild(radio);
      option.appendChild(description);
      panel.options.appendChild(option);
    });
  };

  function MeatballHistory(table, rowIndex, internalColumn, title) {
    var meatballHistory = this;
    var windowWidth = window.innerWidth || document.body.clientWidth;
    var windowHeight = window.innerHeight || document.body.clientHeight;

    this.$ele = document.createElement("div");
    this.$ele.style.width = windowWidth - 1 + "px";
    this.$ele.style.height = windowHeight - 1 + "px";
    this.$ele.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
    this.$ele.style.position = "absolute";
    this.$ele.style.left = "0px";
    this.$ele.style.top = "0px";
    this.$ele.style.zIndex = "201";

    this.$ele.addEventListener("click", function (e) {
      if (e.target == this) {
        addMeatballHistory = true;
        meatballHistory.reset();
        this.parentNode.removeChild(this);
      }
    });

    window.addEventListener("resize", function () {
      var windowWidth = window.innerWidth || document.body.clientWidth;
      var windowHeight = window.innerHeight || document.body.clientHeight;
      meatballHistory.$ele.style.width = windowWidth;
      meatballHistory.$ele.style.height = windowHeight;
    });

    this.listGUID = historyListGUID;

    this.historyPanel = document.createElement("div");
    this.historyPanel.style.alignItems = "stretch";
    this.historyPanel.style.backgroundColor = color.get(defaultBackgroundColor);
    this.historyPanel.style.display = "flex";
    this.historyPanel.style.flexDirection = "column";
    this.historyPanel.style.height = windowHeight + "px";
    this.historyPanel.style.position = "fixed";
    this.historyPanel.style.right = "0px";
    this.historyPanel.style.textAlign = "left";
    this.historyPanel.style.top = "0px";
    this.historyPanel.style.width = "calc(500px - .5rem)";

    this.title = document.createElement("div");
    this.title.style.backgroundColor = color.get(defaultBackgroundColor);
    this.title.style.justifyContent = "center";
    this.title.style.borderBottom = "1px solid " + color.get(22);
    this.title.style.marginBottom = "0.5rem";

    this.headerContainer = document.createElement("div");
    this.headerContainer.style.height = "50px";
    this.headerContainer.style.padding = "0.25rem .5rem";
    this.headerContainer.style.display = "flex";
    this.headerContainer.style.flexDirection = "row";

    this.titleContainer = document.createElement("div");
    this.titleContainer.style.flex = "1";

    this.x = document.createElement("div");
    this.x.innerText = "X";
    this.x.style.textSize = "16pt";
    this.x.style.fontWeight = "bolder";
    this.x.style.padding = ".25rem";
    this.x.style.cursor = "pointer";
    this.x.style.height = "calc(10px + .5rem)";
    this.x.style.alignSelf = "center";
    this.x.style.right = "10px";
    this.x.style.textAlign = "right";
    this.x.style.color = color.get(defaultTitleColor);
    this.x.style.backgroundColor = color.get(defaultBackgroundColor);

    this.x.addEventListener("mouseenter", function () {
      this.style.backgroundColor = color.get(defaultHoverBackgroundColor);
    });

    this.x.addEventListener("mouseleave", function () {
      this.style.backgroundColor = color.get(defaultBackgroundColor);
    });

    this.x.addEventListener("click", function () {
      this.style.backgroundColor = color.get(defaultBackgroundColor);
      addMeatballHistory = true;
      meatballHistory.reset();
      meatballHistory.$ele.parentNode.removeChild(meatballHistory.$ele);
    });

    this.titleMain = document.createElement("h3");
    this.titleMain.innerText = "History";
    this.titleMain.style.fontWeight = "bolder";
    this.titleMain.style.color = color.get(defaultTitleColor);

    this.titleDescription = document.createElement("div");
    this.titleDescription.innerText = title;
    this.titleDescription.style.color = color.get(defaultTitleColor);
    this.titleDescription.style.fontSize = "10px";

    this.titleContainer.appendChild(this.titleMain);
    this.titleContainer.appendChild(this.titleDescription);
    this.headerContainer.appendChild(this.titleContainer);
    this.headerContainer.appendChild(this.x);
    this.title.appendChild(this.headerContainer);

    this.historyPanel.appendChild(this.title);

    this.containerText = document.createElement("p");
    this.containerText.innerText = "No History Available For This Item";
    this.containerText.style.color = color.get(0);
    this.containerText.style.textAlign = "center";
    this.containerText.style.width = "100%";
    this.containerText.style.fontWeight = "600";
    this.containerText.style.position = "absolute";

    this.container = document.createElement("div");
    this.container.id = "MHContainer";
    this.container.style.display = "flex";
    this.container.style.flex = "1";
    this.container.style.flexDirection = "column";
    this.container.style.overflowX = "hidden";
    this.container.style.overflowY = "auto";
    this.container.style.padding = "0.25rem";
    this.container.style.color = color.get(defaultTitleColor);

    this.container.addNew = true;
    this.container.isEdit = true;

    this.container.appendChild(this.containerText);
    this.historyPanel.appendChild(this.container);

    this.divider1 = document.createElement("hr");
    this.divider1.style.borderTop =
      "1pt solid " + color.get(defaultHoverBackgroundColor);

    this.historyPanel.appendChild(this.divider1);

    this.addPanel = document.createElement("div");
    this.addPanel.style.borderTop = "1px solid " + color.get(23);
    this.addPanel.style.display = "flex";
    this.addPanel.style.height = "60px";
    this.addPanel.style.padding = ".25rem";

    this.send = new SVGGenerator({
      color: "white",
      type: "submit",
      size: "large",
    }).wrapper;
    this.send.style.alignItems = "center";
    this.send.style.borderRadius = ".25rem";
    this.send.style.cursor = "pointer";
    this.send.style.display = "flex";
    this.send.style.height = "auto";
    this.send.style.justifyContent = "center";
    this.send.style.padding = "0.5rem";
    this.send.style.width = "40px";

    this.send.addEventListener("mouseenter", function () {
      this.style.backgroundColor = color.get(14);
    });

    this.send.addEventListener("mouseleave", function () {
      this.style.backgroundColor = color.get(4);
    });

    this.send.addEventListener("click", function () {
      if (meatballHistory.input.value.length > 0) {
        meatballHistory.input.value = meatballHistory.input.value.replace(
          regex,
          "",
          meatballHistory.input.value
        );
      } else {
        return;
      }

      if (meatballHistory.container) {
        meatballHistory.newItem(table, rowIndex, internalColumn);
      }
    });

    this.footer = document.createElement("div");
    this.footer.style.borderRadius = "0.25rem";
    this.footer.style.padding = "0.25rem";
    this.footer.style.display = "flex";
    this.footer.style.flex = "1";
    this.footer.style.flexDirection = "row";
    this.footer.style.backgroundColor = color.get(defaultHoverBackgroundColor);

    this.input = document.createElement("input");
    this.input.id = "CommentBox";
    this.input.placeholder = "Enter Comment Here";
    this.input.style.backgroundColor = color.get(defaultHoverBackgroundColor);
    this.input.style.border = "0px";
    this.input.style.borderRadius = ".25rem";
    this.input.style.color = color.get(defaultTitleColor);
    this.input.style.display = "flex";
    this.input.style.flex = "1 1 0%";
    this.input.style.fontSize = "9pt";
    this.input.style.padding = ".25rem .5rem";

    this.input.addEventListener("keydown", function (e) {
      if (e.keyCode === 13) {
        if (organized.length < 2 && organized[0].length === 0) {
          meatballHistory.reset();
        }
        meatballHistory.newItem(table, rowIndex, internalColumn);
      }
    });

    this.footer.appendChild(this.input);
    this.footer.appendChild(this.send);
    this.addPanel.appendChild(this.footer);

    this.historyPanel.appendChild(this.addPanel);

    this.$ele.appendChild(this.historyPanel);

    return this;
  }

  MeatballHistory.prototype.addDivider = function (props) {
    this.dividerPanel = document.createElement("div");
    this.dividerPanel.style.padding = ".25rem";
    this.dividerPanel.style.margin = "0px";
    this.dividerPanel.style.marginBottom = ".25rem";
    this.dividerPanel.style.padding = color.get(defaultHoverBackgroundColor);
    this.dividerPanel.style.color = color.get(defaultTitleColor);
    this.dividerPanel.style.float = "center";
    this.dividerPanel.style.clear = "both";
    this.dividerPanel.style.textAlign = "center";

    this.dividerText = document.createElement("div");
    this.dividerText.innerText = " " + props.timeStamp.toDateString() + " ";
    this.dividerText.style.textAlign = "center";
    this.dividerText.style.verticalAlign = "middle";
    this.dividerText.style.display = "inline-block";

    this.leftDividerLine = document.createElement("div");
    this.leftDividerLine.style.borderTop =
      "1pt solid " + color.get(defaultHoverBackgroundColor);
    this.leftDividerLine.style.display = "inline-block";
    this.leftDividerLine.style.width = "35%";

    this.rightDividerLine = document.createElement("div");
    this.rightDividerLine.style.borderTop =
      "1pt solid " + color.get(defaultHoverBackgroundColor);
    this.rightDividerLine.style.display = "inline-block";
    this.rightDividerLine.style.width = "35%";

    this.dividerPanel.appendChild(this.leftDividerLine);
    this.dividerPanel.appendChild(this.dividerText);
    this.dividerPanel.appendChild(this.rightDividerLine);
    this.container.appendChild(this.dividerPanel);
    return this;
  };

  MeatballHistory.prototype.build = function (props) {
    this.containerText.innerText = "";

    props.setType(userName);

    this.container.appendChild(props.$ele);
    this.container.scrollTop = this.container.scrollHeight;
    return this;
  };

  MeatballHistory.prototype.newItem = function (
    table,
    rowIndex,
    internalColumn
  ) {
    if (this.container.innerText === this.containerText) {
      this.container.innerText = "";
    }

    if (this.input.value.length <= 0) {
      return;
    }

    //create a messageContainer
    this.newCommentContainer = document.createElement("div");
    this.newCommentContainer.style.display = "flex";
    this.newCommentContainer.style.flexDirection = "row-reverse";
    this.newCommentContainer.style.width = "100%";

    //create the avatar container + avatar
    var avatar = document.createElement("div");
    avatar.style.width = "30px";
    avatar.style.height = "30px";
    avatar.style.fontSize = "14px";
    avatar.style.backgroundColor = color.get(4);
    avatar.style.borderRadius = "50%";
    avatar.style.textAlign = "center";
    avatar.style.lineHeight = "28px";
    avatar.style.marginLeft = "4px";

    this.newMessageBlock = document.createElement("div");
    this.newMessageBlock.style.alignItems = "flex-end";
    this.newMessageBlock.style.display = "flex";
    this.newMessageBlock.style.flex = "1";
    this.newMessageBlock.style.flexDirection = "column";

    var chatWindow = this;
    var commentBlock = this.newMessageBlock;
    var commentRow = this.newCommentContainer;

    var avatarParts = userName.split(" ");
    avatar.innerText = avatarParts[2].charAt(0) + avatarParts[0].charAt(0);

    //create a message messageBlock
    //message block will be on the right (user generated)
    //create a message

    function cb(error, data) {
      if (error) {
        console.log(error);
      }
      var item = new MeatballHistoryMessage(
        historyListGUID,
        table,
        rowIndex,
        internalColumn
      );
      item.setDisplay(
        userName,
        generateDateTime(),
        data.Message,
        data.ID,
        historyListGUID,
        table,
        rowIndex,
        internalColumn,
        true
      );
      item.isNew = true;
      //item.setType(meatballObj.currentUser);

      //Step 1. Determine whether to append to existing block or append to new block
      if (lastAuthor === userName) {
        //Step 1a. Find last message block and append to existing
        var lastBlock = organized[organized.length - 1];

        //Step 1b. Append new message to latest block in screen.
        lastBlock.block.appendChild(item.$ele);

        //Step 1c. Push new message into memory for later use.
        organized[organized.length - 1].messages.push(item);
        //Step 2. Append new comment to new block. Add to overall display.
      } else {
        //Step 2a. Append message to message block.
        commentBlock.appendChild(item.$ele);

        //Step 2b. Append avatar container to message container row.
        commentRow.appendChild(avatar);

        //Step 2c. Append message block to message container row.
        commentRow.appendChild(commentBlock);

        //Step 2d. Append new comment to chat window
        chatWindow.container.appendChild(commentRow);

        organized.push({ block: commentBlock, messages: [item.$ele] });

        lastAuthor = userName;
      }

      //Step 3. Scroll bottom to give appearance of chat window update.
      chatWindow.scrollDown();

      item.setEditable(item.getEditable());

      //Step 4. Reset the input to NO value to start over.
      chatWindow.input.value = "";
    }
    rest.makeHistoryEntry(
      historyListGUID,
      this.input.value,
      internalColumn,
      rowIndex,
      table,
      null,
      ctx.PortalUrl,
      "History",
      cb
    );

    return this;
  };

  MeatballHistory.prototype.reset = function () {
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
    return this;
  };

  MeatballHistory.prototype.scrollDown = function () {
    this.container.scrollTop = this.container.scrollHeight;
    return this;
  };

  function MeatballHistoryMessage(
    historyListGUID,
    table,
    rowindex,
    internalColumn
  ) {
    var meatballHistoryItem = this;
    this.$ele = document.createElement("div");
    this.$ele.style.margin = "0px;";
    this.$ele.style.marginBottom = ".25rem";
    this.$ele.style.padding = ".25rem";
    this.$ele.style.borderRadius = ".5rem";

    this.display = document.createElement("div");
    this.display.style.display = "block";
    this.display.style.padding = "0px";
    this.display.style.marginRight = "0px";
    this.display.style.marginLeft = "0px";

    this.date = document.createElement("div");
    this.date.contentEditable = false;
    this.date.style.paddingLeft = ".25rem";
    this.date.style.margin = "0px";
    this.date.style.verticalAlign = "middle";
    this.date.style.textAlign = "left";
    this.date.style.fontSize = "6pt";
    this.date.style.display = "block";
    this.display.appendChild(this.date);

    this.isNew = false;

    this.btnContainer = document.createElement("div");
    this.btnContainer.style.display = "flex";

    this.submit = document.createElement("div");
    this.submit.innerText = "Submit";
    this.submit.style = ims.sharepoint.style({
      type: "button",
      size: "",
      bgc: defaultButtonBackgroundColor,
      fc: defaultColor,
    });
    this.submit.style.width = "75px";
    this.submit.style.display = "inline-block";
    this.submit.style.marginLeft = "4px";

    this.submit.addEventListener("mouseenter", function () {
      this.style.backgroundColor = color.get(defaultButtonHoverBackgroundColor);
    });

    this.submit.addEventListener("mouseleave", function () {
      this.style.backgroundColor = color.get(defaultButtonBackgroundColor);
    });

    this.submit.addEventListener("click", function () {
      meatballHistoryItem.comment.style.minWidth = "unset";
      meatballHistoryItem.$ele.style.width = "auto";
      meatballHistoryItem.delete.style.marginRight = "15px";
      if (meatballHistoryItem.isNew) {
        function cb(newData) {
          if (error) {
            console.log(error);
          }
          meatballHistoryItem.setEditable(
            !meatballHistoryItem.getEditable(),
            newData
          );
        }
        rest.makeHistoryEntry(
          meatballHistoryItem.listGUID,
          "placeholder",
          internalColumn,
          rowindex,
          table,
          false,
          ctx.PortalUrl,
          "History",
          cb
        );
      } else {
        meatballHistoryItem.setEditable(
          !meatballHistoryItem.getEditable(),
          false
        );
      }
    });

    this.cancel = document.createElement("div");
    this.cancel.innerText = "Cancel";
    this.cancel.style = ims.sharepoint.style({
      type: "button",
      size: "",
      bgc: "transparent",
      fc: defaultColor,
    }).$ele;
    this.cancel.style.border = "1px solid " + color.get(23);
    this.cancel.style.width = "75px";
    this.cancel.style.marginLeft = "267px";
    this.cancel.style.display = "inline-block";

    this.cancel.addEventListener("mouseenter", function () {
      this.style.borderColor = color.get(25);
      this.style.color = color.get(25);
    });

    this.cancel.addEventListener("mouseleave", function () {
      this.style.border = "1px solid " + color.get(23);
      this.style.color = color.get(defaultColor);
    });

    this.cancel.addEventListener("click", function () {
      meatballHistoryItem.comment.style.minWidth = "unset";
      meatballHistoryItem.comment.style.textAlign = "right";
      meatballHistoryItem.delete.style.marginRight = "15px";
      meatballHistoryItem.$ele.style.width = "auto";
      meatballHistoryItem.setEditable(false, false, true);
    });

    this.buttonGroup = document.createElement("div");
    this.buttonGroup.style.textAlign = "right";
    this.buttonGroup.style.margin = "0px";
    this.buttonGroup.style.padding = "0px";
    this.buttonGroup.style.display = "flex";
    this.buttonGroup.style.alignContent = "flex-start";
    this.buttonGroup.style.justifyContent = "space-around";

    this.author = document.createElement("div");
    this.author.contentEditable = false;
    this.author.style.flex = "1";
    this.author.style.padding = ".25rem";
    this.author.style.marginRight = "10px";
    this.author.style.fontSize = "8pt";
    this.author.style.textAlign = "left";
    this.buttonGroup.appendChild(this.author);

    this.edit = new SVGGenerator({
      color: color.get(6),
      type: "edit",
      size: "small",
    }).wrapper;
    this.edit.style.cursor = "pointer";
    this.edit.addEventListener("click", function () {
      meatballHistoryItem.isNew = false;
      meatballHistoryItem.$ele.style.flex = "1";
      if (meatballHistoryItem.$ele.parentNode.isEdit) {
        meatballHistoryItem.$ele.parentNode.isEdit = false;
        meatballHistoryItem.setEditable(!meatballHistoryItem.getEditable());
      }
    });

    this.buttonGroup.appendChild(this.edit);

    this.delete = new SVGGenerator({
      color: color.get(defaultColor),
      type: "delete",
      size: "small",
    }).wrapper;
    this.delete.style.cursor = "pointer";
    this.delete.style.marginLeft = "15px";
    this.delete.style.marginRight = "15px";

    this.delete.addEventListener("click", function () {
      if (meatballHistoryItem.$ele) {
        if (meatballHistoryItem.$ele.parentNode) {
          if (!meatballHistoryItem.$ele.parentNode.addNew) {
            meatballHistoryItem.$ele.parentNode.addNew = true;
          }
          if (!meatballHistoryItem.$ele.parentNode.isEdit) {
            meatballHistoryItem.$ele.parentNode.isEdit = true;
          }
          meatballHistoryItem.$ele.parentNode.removeChild(
            meatballHistoryItem.$ele
          );
          function cb(error, listGUID) {
            if (error) {
              console.log(error);
              return;
            }
            rest.deleteItem(
              listGUID,
              meatballHistoryItem.id,
              ctx.PortalUrl,
              "History"
            );
          }
          rest.find(ctx.PortalUrl, "History", cb);
        }
      }
    });
    this.buttonGroup.appendChild(this.delete);

    // this.$ele.appendChild(this.buttonGroup);

    this.comment = document.createElement("div");
    this.comment.contentEditable = false;
    this.comment.style.padding = ".25rem";
    this.comment.style.display = "inline-block";
    this.comment.style.verticalAlign = "right";
    this.comment.style.fontSize = "9pt";

    this.comment.addEventListener("focus", function () {
      this.style.outline = "none";
    });

    this.$ele.appendChild(this.comment);
    this.$ele.appendChild(this.display);

    return this;
  }

  MeatballHistoryMessage.prototype.setDisplay = function (
    author,
    date,
    comment,
    id,
    listGUID,
    table,
    rowIndex,
    internalColumn,
    isFirst
  ) {
    if (!isFirst) {
      this.author.parentNode.removeChild(this.author);
      this.buttonGroup.style.display = "block";
    }
    if (comment) {
      this.author.innerText = author;
      this.comment.innerText = comment.replace(regex, "", comment);
      this.prevComment = this.comment.innerText;
      this.date.innerText = date;
      this.id = id;
      this.listGUID = listGUID;
      this.table = table;
      this.rowIndex = rowIndex;
      this.internalColumn = internalColumn;
    }

    return this;
  };

  MeatballHistoryMessage.prototype.setEditable = function (
    value,
    newData,
    oldComment
  ) {
    if (value) {
      this.comment.style.minWidth = "-webkit-fill-available";
      this.comment.style.textAlign = "left";
      this.delete.style.marginRight = "15px";
      this.$ele.style.flex = "1";
      this.$ele.style.backgroundColor = color.get(defaultMHIBackgroundColor);
      this.$ele.style.color = color.get(defaultColor);

      this.comment.style.backgroundColor = color.get(
        defaultHoverBackgroundColor
      );
      this.submit.style.backgroundColor = color.get(
        defaultButtonBackgroundColor
      );

      this.btnContainer.appendChild(this.cancel);
      this.btnContainer.appendChild(this.submit);
      this.display.appendChild(this.btnContainer);
    } else {
      if (!oldComment) {
        var currentText = this.comment.innerText;
        currentText = currentText.replace(regex, "", currentText);
        this.comment.innerText = currentText;
        this.prevComment = currentText;
        if (currentText.trim().length === 0) {
          return;
        }
        if (newData && newData.ID) {
          rest.update(newData.ID, currentText, ctx.PortalUrl, "History");
        } else {
          rest.update(this.id, currentText, ctx.PortalUrl, "History");
        }
      } else {
        this.comment.innerText = this.prevComment;
      }

      this.comment.style.color = color.get(defaultColor);
      this.comment.style.backgroundColor = color.get(
        defaultButtonBackgroundColor
      );
      this.$ele.style.backgroundColor = color.get(defaultButtonBackgroundColor);
      this.$ele.style.color = color.get(defaultColor);

      if (this.btnContainer.parentNode) {
        this.display.removeChild(this.btnContainer);
      }

      if (!this.$ele.parentNode.addNew && this.isNew) {
        this.$ele.parentNode.addNew = true;
        this.isNew = false;
      }
      if (!this.$ele.parentNode.isEdit) {
        this.$ele.parentNode.isEdit = true;
      }
    }
    this.comment.contentEditable = value;

    return this;
  };

  MeatballHistoryMessage.prototype.getEditable = function () {
    return this.comment.contentEditable === "true";
  };

  MeatballHistoryMessage.prototype.setType = function (author) {
    if (this.author.innerText.indexOf(author) > -1) {
      this.$ele.type = "editable";
      this.$ele.style.backgroundColor = color.get(defaultButtonBackgroundColor);
      this.$ele.style.color = color.get(defaultColor);
    } else {
      this.$ele.type = "disabled";
      this.$ele.style.backgroundColor = color.get(defaultMHIBackgroundColor);
      this.$ele.style.color = color.get(defaultColor);
    }
    if (this.$ele.type !== "editable") {
      this.delete.parentNode.removeChild(this.delete);
      this.edit.parentNode.removeChild(this.edit);
    }
  };

  function Defaults() {
    this.defaults = [
      { value: "Up", color: "green" },
      { value: "Down", color: "red" },
      { value: "Degraded", color: "yellow" },
      { value: "NA", color: "0" },
      { value: "100-90", color: "green" },
      { value: "89-79", color: "yellow" },
      { value: "79-10", color: "red" },
      { value: "<79", color: "red" },
      { value: "<10", color: "blue" },
    ];
  }

  Defaults.prototype.get = function (props) {
    if (!props) {
      return "0";
    }
    var results = this.defaults.filter(function (item) {
      if (containsSubString(item.value, props)) {
        return item;
      }
    });
    if (results[0]) {
      return results[0].color;
    } else {
      return "0";
    }
  };

  Defaults.prototype.set = function (props) {
    if (this.replace(props)) {
      return;
    }
    this.defaults.push({ value: props.value, color: props.color });
  };

  Defaults.prototype.replace = function (props) {
    var found = false;
    this.defaults.map(function (item) {
      if (found) {
        return;
      }
      if (compareString(props.value, item.value)) {
        found = true;
        item = { value: props.value, color: props.color };
      }
    });
    return found;
  };

  function LoaderCSS(props) {
    this.loader = document.createElement("div");
    this.loader.id = "LoaderCSS";
    this.loader.style.border = props.bSize + "px solid " + color.get(26);
    this.loader.style.borderTop = props.bSize + "px solid " + color.get(27);
    this.loader.style.borderRadius = props.diameter + "px";
    this.loader.style.width = props.diameter + "px";
    this.loader.style.height = props.diameter + "px";
    this.loader.style.animation = "spin 2s linear infinite";
    return this;
  }

  function generateDateTime(date) {
    if (!date) {
      this.time = new Date();
    } else {
      this.time = new Date(date);
    }

    this.returnTime = "";

    var meridiem = this.time.getHours() >= 12 ? " pm" : " am";

    var hours = (this.returnTime += this.time.getHours() % 12);

    if (hours == "0") {
      this.returnTime = 12;
    }

    var minutes = this.time.getMinutes().toString();

    minutes.length == 1
      ? (this.returnTime += ":" + "0" + minutes + meridiem)
      : (this.returnTime += ":" + minutes + meridiem);

    return this.returnTime;
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

  function generateId() {
    return Math.floor(Math.random() * 1000);
  }
}

//Code for the show more button in drawer
//
// this.addMore = document.createElement("div");
// this.addMore.innerText = "Show More";
// this.addMore.style.cursor = "pointer";
// this.addMore.style.marginTop = ".25rem";
// this.addMore.style.marginLeft = "auto";
// this.addMore.style.marginRight = "auto";
// this.addMore.style.padding = ".25rem";
// this.addMore.style.borderRadius = ".25rem";
// this.addMore.style.width = "115px";
// this.addMore.style.backgroundColor = defaultTitleColor;
// this.addMore.style.textAlign = "center";
//
// var addMeatballHistory = true;
//
// this.addMore.addEventListener("click", function () {
//possilble history.clear is needed  - pierre
//it needs the information for the cell, table, row etc
// if (addMeatballHistory) {
//   addMeatballHistory = !addMeatballHistory;
// function cb(error, data) {
//   if (error) {
//     console.log(error);
//     return;
//   }
//
//   var priorDate = null;
//   var currentDate = null;
//   var nowDate = new Date();
//   meatballHistory.clear();
//   data.forEach(function (props, index) {
//     currentDate = new Date(props.Created);
//     var mhItem = new MeatballHistoryMessage().setDisplay(
//       props.Author,
//       generateDateTime(props.Created),
//       props.Message,
//       props.ID,
//       historyListGUID,
//       table,
//       rowIndex,
//       internalColumn
//     );
//
//     meatballHistory.build(mhItem);
// if (!priorDate) {
//   priorDate = currentDate;
// }
// if (currentDate.getDate() != nowDate.getDate()) {
//   if (priorDate.getDate() != currentDate.getDate()) {
//     meatballHistory.addDivider(priorDate, mhItem.$ele);
//   }
//
//   if (index + 1 === data.length) {
//     meatballHistory.addDivider(priorDate, mhItem.$ele);
//   }
// }
//
// priorDate = currentDate;
//   });
// }
// retrieveHistory(table, rowIndex, internalColumn, cb, false);
// });
//meatballHistory.addMore.parentNode.removeChild(meatballHistory.addMore);
// meatballHistory.scrollDown();
// meatballHistory.container.scrollTop =
//   meatballHistory.container.scrollHeight;
// }
