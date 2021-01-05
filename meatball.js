(function () {
  //Size sets the Meatball size in pixels
  var size = 20;
  //Creates the Color object which manages meatball colors
  var colors = new Colors();
  // console.log(
  //   "Background Color: ",
  //   window
  //     .getComputedStyle(document.body, null)
  //     .getPropertyValue("background-color")
  // );
  // var defaultBackgroundColor = "#F0F0F0";
  // var defaultHoverBackgroundColor = "#D2D2D2";
  // var defaultColor = "#202020";
  // var defaultTitleColor = "#333333";
  // dbgc = 16
  var defaultBackgroundColor = "#202020";
  // dMHIbgc = 11;
  var defaultMHIBackgroundColor = "#191919";
  // dHbgc = 15
  var defaultHoverBackgroundColor = "#333333";
  // dBgbc = 4
  var defaultButtonBackgroundColor = "#3949ab";
  // dBHbgc = 14
  var defaultButtonHoverBackgroundColor = "#1B2B8D";
  // dCBbgc = 4
  var defaultCancelButtonBackgroundColor = "#3949ab";
  // dCBHbgc = 14
  var defaultCancelButtonHoverBackgroundColor = "#1B2B8D";
  // dIbgc = 17
  var defaultInputBackgroundColor = "#D2D2D2";
  // dc = 0
  var defaultColor = "#F0F0F0";
  // dTc = 13
  var defaultTitleColor = "#DFDFDF";

  //Creates the Pantry object which manages toast notifications
  var kitchen = new Pantry();

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
    defaultBackgroundColor +
    ";margin-right:5px;}" +
    "#MHContainer::-webkit-scrollbar{width:12px;background-color:" +
    defaultBackgroundColor +
    ";}" +
    "#MHContainer::-webkit-scrollbar-thumb{border-radius:10px;-webkit-box-shadow:inset 0 0 6px rgba(0,0,0,0.3);background-color:#505050;}" +
    "#MHContainer::-webkit-scrollbar-thumb:hover{background-color: #3949ab}";
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
        colors.set(item.value, item.color);
      });
    }

    if (historyListGUID.length <= 0) {
      function historyChatCb(props) {
        historyListGUID = props;
      }
      findHistoryChat(historyChatCb);
    }
    if (userName.length <= 0) {
      function success(props, name) {
        userName = name;
      }
      getUserName(success);
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
              var longestString = displayValue;
              values.forEach(function (item, i) {
                if (longestString.length < item.length) {
                  longestString = item;
                }
              });
              this.canvas = document.createElement("canvas");
              this.context = canvas.getContext("2d");
              context.font = "100 12pt arial";
              this.meatballWidth = context.measureText(longestString);

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
                listTitle,
                "200px",
                longestString
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
    this.circle = document.createElement("div");
    this.circle.style.width = this.size;
    this.circle.style.height = this.size;
    this.circle.style.borderRadius = this.size;
    this.circle.style.margin = "auto";
    this.circle.style.padding = "0px";
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
    panelWidth,
    longestString
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

    this.circle.style.backgroundColor = colors.get(cellText);

    this.$ele = document.createElement("div");
    this.$ele.style.backgroundColor = "transparent";
    this.$ele.style.padding = "10px";

    this.popoverBody = document.createElement("div");
    this.popoverBody.style.display = "inline-block";
    this.popoverBody.style.margin = "0px";
    this.popoverBody.style.padding = "0px";
    this.popoverBody.style.width = panelWidth;
    this.popoverBody.style.backgroundColor = defaultBackgroundColor;
    this.popoverBody.style.color = defaultColor;
    this.popoverBody.style.boxShadow = "1px 1px 4px 1px rgb(0 0 0 / 0.2)";

    this.carret = document.createElement("div");
    this.carret.style.margin = "0px";
    this.carret.style.display = "inline-block";
    this.carret.style.position = "absolute";
    this.carret.style.height = "0px";
    this.carret.style.width = "0px";
    this.carret.style.left = "2px";
    this.carret.style.top = "29px";
    this.carret.style.borderTop = triangleSize + "px solid transparent";
    this.carret.style.borderBottom = triangleSize + "px solid transparent";
    this.carret.style.borderRight =
      triangleSize + "px solid " + defaultBackgroundColor;

    //Create Popover Element
    this.popover = document.createElement("div");
    this.popover.style.display = "inline-block";
    this.popover.style.padding = ".5rem";
    this.popover.style.boxShadow = "0px 0px 5px " + defaultBackgroundColor;
    this.popover.style.borderRadius = ".25rem";
    this.popover.style.zIndex = "1";

    //Create Header Element
    this.header = document.createElement("div");
    this.header.style.padding = ".25rem";
    this.header.style.textAlign = "center";
    this.header.style.marginBottom = ".25rem";
    this.header.style.width = "100%";
    this.header.style.textAlign = "center";
    this.header.innerText = value;

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

    this.dividor1 = document.createElement("hr");
    this.dividor1.style.borderTop = "1pt solid " + defaultHoverBackgroundColor;

    this.popover.appendChild(this.dividor1);

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
    this.initHistoryContainer.style.borderRadius = ".25rem";
    this.initHistoryContainer.style.padding = ".25rem";
    this.initHistoryContainer.style.marginBottom = ".5rem";
    this.initHistoryContainer.style.marginLeft = ".5rem";
    this.initHistoryContainer.style.marginRight = ".5rem";
    this.initHistoryContainer.style.display = "block";
    this.initHistoryContainer.style.backgroundColor = defaultHoverBackgroundColor;
    this.initHistoryContainer.style.color = defaultColor;
    this.initHistoryContainer.style.borderRadius = "0.25rem";

    this.initHistoryDate = document.createElement("div");
    this.initHistoryDate.style.padding = ".25rem";
    this.initHistoryDate.style.margin = ".25rem";
    this.initHistoryDate.style.textAlign = "left";
    this.initHistoryDate.style.display = "block";
    this.initHistoryDate.style.fontSize = "7pt";

    this.initHistoryMessage = document.createElement("div");
    this.initHistoryMessage.style.padding = ".25rem";
    this.initHistoryMessage.style.margin = ".25rem";
    this.initHistoryMessage.style.display = "block";
    this.initHistoryMessage.style.fontSize = "9pt";

    this.initHistoryName = document.createElement("div");
    this.initHistoryName.style.padding = ".25rem";
    this.initHistoryName.style.margin = ".25rem";
    this.initHistoryName.style.textAlign = "left";
    this.initHistoryName.style.display = "block";
    this.initHistoryName.style.fontSize = "7pt";

    this.initHistoryHeader = document.createElement("div");
    this.initHistoryHeader.style.display = "flex";
    this.initHistoryHeader.style.justifyContent = "space-between";

    this.showMore = document.createElement("div");
    this.showMore.innerText = "Show More";
    this.showMore.style.color = defaultColor;
    this.showMore.style.borderRadius = ".25rem";
    this.showMore.style.padding = ".25rem";
    this.showMore.style.marginBottom = ".5rem";
    this.showMore.style.marginLeft = ".5rem";
    this.showMore.style.marginRight = ".5rem";
    this.showMore.style.textAlign = "center";
    this.showMore.style.display = "block";
    this.showMore.style.cursor = "pointer";
    this.showMore.style.fontWeight = "500";
    this.showMore.style.backgroundColor = defaultButtonBackgroundColor;

    this.showMore.addEventListener("mouseenter", function () {
      this.style.backgroundColor = defaultButtonHoverBackgroundColor;
    });

    this.showMore.addEventListener("mouseleave", function () {
      this.style.backgroundColor = defaultButtonBackgroundColor;
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
            return;
          }
          if (data.length !== 0) {
            var priorDate,
              currentDate = null;
            var nowDate = new Date();

            meatballHistoryDisplay.query = data[0].Title;

            var avatar = false;
            var lastDay = new Date().getDay();

            organized = data.reduce(
              function (r, props) {
                var author = props.Author;
                var day = new Date(props.Created).getDay();
                var lastIndex = r.length - 1;
                //this pushes a "dividor" for today's entries
                if (lastDay !== day) {
                  r.push([
                    { type: "break", timeStamp: new Date(props.Created) },
                  ]);
                  lastDay = day;
                  lastAuthor = "";
                }
                //first mhItem
                if (!lastIndex && !lastAuthor) {
                  r[0].push(props);
                  lastAuthor = author;
                  lastDay = new Date(props.Created).getDay();
                } else if (author === lastAuthor) {
                  r[lastIndex].push(props);
                } else {
                  r.push([props]);
                  lastAuthor = author;
                }
                return r;
              },
              [[]]
            );

            console.log("organized", organized);
            organized = organized.map(function (block, index) {
              if (block.length === 1 && block[0].type === "break") {
                meatballHistoryDisplay.addDividor(block[0]);
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
                avatar.style.width = "30px";
                avatar.style.height = "30px";
                avatar.style.fontSize = "14px";
                avatar.style.backgroundColor = "#3949ab";
                avatar.style.borderRadius = "50%";
                avatar.style.textAlign = "center";
                avatar.style.lineHeight = "28px";
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
        retrieveHistory(table, rowIndex, internalColumn, cb, false);
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
      function success(param, data) {
        if (data.length === 1) {
          meatball.initHistoryMessage.innerText = data[0].Message;
          meatball.initHistoryName.innerText = data[0].Author;
          meatball.initHistoryDate.innerText = generateDateTime(
            data[0].Created
          );
        } else {
          meatball.initHistoryContainer.innerText = "No History Found";
          meatball.initHistoryContainer.style.textAlign = "center";
        }
        meatball.setPosition(triangleSize);
      }
      retrieveHistory(table, rowIndex, internalColumn, success, true);

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

    this.carret.style.position = "absolute";
    this.carret.style.top = "29px";
    this.carret.style.left = "2px";
    this.carret.style.right = "0px";
    this.carret.style.borderLeft = "0px";
    this.carret.style.borderRight =
      triangleSize + "px solid " + defaultBackgroundColor;
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
        triangleSize + "px solid " + defaultBackgroundColor;
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
    this.circle.style.backgroundColor = colors.get(value);
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
        option.style.backgroundColor = defaultHoverBackgroundColor;
      }

      option.addEventListener("mouseenter", function () {
        if (radio.checked) {
          option.style.backgroundColor = defaultBackgroundColor;
        } else {
          option.style.backgroundColor = defaultHoverBackgroundColor;
        }
      });
      option.addEventListener("mouseleave", function () {
        if (radio.checked) {
          option.style.backgroundColor = defaultHoverBackgroundColor;
        } else {
          option.style.backgroundColor = defaultBackgroundColor;
        }
      });

      panel.options.addEventListener("mousedown", function () {
        [].slice.call(panel.options.children).forEach(function (item) {
          if (item.parentElement.querySelector(":hover") === item) {
            item.style.backgroundColor = defaultHoverBackgroundColor;
          } else {
            item.style.backgroundColor = defaultBackgroundColor;
          }
        });
      });

      option.addEventListener("mouseup", function () {
        if (!radio.checked) {
          radio.checked = true;
          option.style.backgroundColor = defaultHoverBackgroundColor;
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

          makeHistory(
            historyListGUID,
            autoComment,
            internalColumn,
            rowIndex,
            table,
            null,
            true
          );
          cellText = ele; //this will change the current value of meatball for the view purposes.
        } else {
          option.style.backgroundColor = defaultHoverBackgroundColor;
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
    this.historyPanel.style.backgroundColor = defaultBackgroundColor;
    this.historyPanel.style.display = "flex";
    this.historyPanel.style.flexDirection = "column";
    this.historyPanel.style.height = windowHeight + "px";
    this.historyPanel.style.position = "fixed";
    this.historyPanel.style.right = "0px";
    this.historyPanel.style.textAlign = "left";
    this.historyPanel.style.top = "0px";
    this.historyPanel.style.width = "calc(500px - .5rem)";

    this.title = document.createElement("div");
    this.title.style.backgroundColor = defaultBackgroundColor;
    this.title.style.justifyContent = "center";
    this.title.style.borderBottom = "1px solid #2d2d2d";
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
    this.x.style.color = defaultTitleColor;
    this.x.style.backgroundColor = defaultBackgroundColor;

    this.x.addEventListener("mouseenter", function () {
      this.style.backgroundColor = defaultHoverBackgroundColor;
    });

    this.x.addEventListener("mouseleave", function () {
      this.style.backgroundColor = defaultBackgroundColor;
    });

    this.x.addEventListener("click", function () {
      this.style.backgroundColor = defaultBackgroundColor;
      addMeatballHistory = true;
      meatballHistory.reset();
      meatballHistory.$ele.parentNode.removeChild(meatballHistory.$ele);
    });

    this.titleMain = document.createElement("h3");
    this.titleMain.innerText = "History";
    this.titleMain.style.fontWeight = "bolder";
    this.titleMain.style.color = defaultTitleColor;

    this.titleDescription = document.createElement("div");
    this.titleDescription.innerText = title;
    this.titleDescription.style.color = defaultTitleColor;
    this.titleDescription.style.fontSize = "10px";

    this.titleContainer.appendChild(this.titleMain);
    this.titleContainer.appendChild(this.titleDescription);
    this.headerContainer.appendChild(this.titleContainer);
    this.headerContainer.appendChild(this.x);
    this.title.appendChild(this.headerContainer);

    this.historyPanel.appendChild(this.title);
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
    //     meatballHistory.addDividor(priorDate, mhItem.$ele);
    //   }
    //
    //   if (index + 1 === data.length) {
    //     meatballHistory.addDividor(priorDate, mhItem.$ele);
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

    this.containerText = document.createElement("p");
    this.containerText.innerText = "No History Available For This Item";
    this.containerText.style.color = "white";
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
    this.container.style.color = defaultTitleColor;

    this.container.addNew = true;
    this.container.isEdit = true;

    this.container.appendChild(this.containerText);
    this.historyPanel.appendChild(this.container);

    this.dividor1 = document.createElement("hr");
    this.dividor1.style.borderTop = "1pt solid " + defaultHoverBackgroundColor;

    this.historyPanel.appendChild(this.dividor1);

    this.addPanel = document.createElement("div");
    this.addPanel.style.borderTop = "1px solid #444444";
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
      this.style.backgroundColor = "#1B2B8D";
    });

    this.send.addEventListener("mouseleave", function () {
      this.style.backgroundColor = "#3949ab";
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
        //if (meatballHistory.container.addNew) {
        //meatballHistory.container.addNew = false;
        meatballHistory.newItem(table, rowIndex, internalColumn);
        //}
      }
    });

    this.footer = document.createElement("div");
    this.footer.style.borderRadius = "0.25rem";
    this.footer.style.padding = "0.25rem";
    this.footer.style.display = "flex";
    this.footer.style.flex = "1";
    this.footer.style.flexDirection = "row";
    this.footer.style.backgroundColor = defaultHoverBackgroundColor;

    this.input = document.createElement("input");
    this.input.id = "CommentBox";
    this.input.placeholder = "Enter Comment Here";
    this.input.style.backgroundColor = defaultHoverBackgroundColor;
    this.input.style.border = "0px";
    this.input.style.borderRadius = ".25rem";
    this.input.style.color = defaultTitleColor;
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

  MeatballHistory.prototype.addDividor = function (props) {
    this.dividorPanel = document.createElement("div");
    this.dividorPanel.style.padding = ".25rem";
    this.dividorPanel.style.margin = "0px";
    this.dividorPanel.style.padding = ".25rem";
    this.dividorPanel.style.marginBottom = ".25rem";
    this.dividorPanel.style.padding = defaultHoverBackgroundColor;
    this.dividorPanel.style.color = defaultTitleColor;
    this.dividorPanel.style.float = "center";
    this.dividorPanel.style.clear = "both";
    this.dividorPanel.style.textAlign = "center";

    this.dividorText = document.createElement("div");
    this.dividorText.innerText = " " + props.timeStamp.toDateString() + " ";
    this.dividorText.style.textAlign = "center";
    this.dividorText.style.verticalAlign = "middle";
    this.dividorText.style.display = "inline-block";

    this.leftDividorLine = document.createElement("div");
    this.leftDividorLine.style.borderTop =
      "1pt solid " + defaultHoverBackgroundColor;
    this.leftDividorLine.style.display = "inline-block";
    this.leftDividorLine.style.width = "35%";

    this.rightDividorLine = document.createElement("div");
    this.rightDividorLine.style.borderTop =
      "1pt solid " + defaultHoverBackgroundColor;
    this.rightDividorLine.style.display = "inline-block";
    this.rightDividorLine.style.width = "35%";

    this.dividorPanel.appendChild(this.leftDividorLine);
    this.dividorPanel.appendChild(this.dividorText);
    this.dividorPanel.appendChild(this.rightDividorLine);
    this.container.appendChild(this.dividorPanel);
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
    avatar.style.backgroundColor = "#3949ab";
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

    function listEntrySuccess(data) {
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
    makeHistory(
      historyListGUID,
      this.input.value,
      internalColumn,
      rowIndex,
      table,
      listEntrySuccess
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
    this.submit.style.textAlign = "center";
    this.submit.style.backgroundColor = defaultButtonBackgroundColor;
    this.submit.style.color = defaultColor;
    this.submit.style.width = "75px";
    this.submit.style.cursor = "pointer";
    this.submit.style.padding = ".25rem";
    this.submit.style.borderRadius = ".25rem";
    this.submit.style.display = "inline-block";
    this.submit.style.marginLeft = "4px";

    this.submit.addEventListener("mouseenter", function () {
      this.style.backgroundColor = defaultButtonHoverBackgroundColor;
    });

    this.submit.addEventListener("mouseleave", function () {
      this.style.backgroundColor = defaultButtonBackgroundColor;
    });

    this.submit.addEventListener("click", function () {
      meatballHistoryItem.comment.style.minWidth = "unset";
      meatballHistoryItem.$ele.style.width = "auto";
      meatballHistoryItem.delete.style.marginRight = "15px";
      if (meatballHistoryItem.isNew) {
        function listEntrySuccess(newData) {
          meatballHistoryItem.setEditable(
            !meatballHistoryItem.getEditable(),
            newData
          );
        }
        makeHistory(
          meatballHistoryItem.listGUID,
          "placeholder",
          internalColumn,
          rowindex,
          table,
          listEntrySuccess
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
    this.cancel.style.textAlign = "center";
    this.cancel.style.backgroundColor = "transparent";
    this.cancel.style.border = "1px solid rgb(67, 67, 67)";
    this.cancel.style.color = defaultColor;
    this.cancel.style.width = "75px";
    this.cancel.style.cursor = "pointer";
    this.cancel.style.marginLeft = "267px";
    this.cancel.style.padding = ".25rem";
    this.cancel.style.borderRadius = ".25rem";
    this.cancel.style.display = "inline-block";

    this.cancel.addEventListener("mouseenter", function () {
      this.style.borderColor = "#165996";
      this.style.color = "#165996";
    });

    this.cancel.addEventListener("mouseleave", function () {
      this.style.border = "1px solid rgb(67, 67, 67)";
      this.style.color = "white";
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
      color: "#4AAB39",
      type: "edit",
      size: "small",
    }).wrapper;
    this.edit.style.cursor = "pointer";
    this.edit.addEventListener("click", function () {
      meatballHistoryItem.isNew = false;
      meatballHistoryItem.$ele.style.flex = "1";
      console.log(
        meatballHistoryItem.$ele.attributes,
        meatballHistoryItem.$ele.parentNode
      );
      if (meatballHistoryItem.$ele.parentNode.isEdit) {
        meatballHistoryItem.$ele.parentNode.isEdit = false;
        console.log(!meatballHistoryItem.getEditable());
        meatballHistoryItem.setEditable(!meatballHistoryItem.getEditable());
      }
    });

    this.buttonGroup.appendChild(this.edit);

    this.delete = new SVGGenerator({
      color: defaultColor,
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
          function newHistoryChatCb(listGUID) {
            deleteHistory(listGUID, meatballHistoryItem.id);
          }
          findHistoryChat(newHistoryChatCb);
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
      this.$ele.style.backgroundColor = defaultMHIBackgroundColor;
      this.$ele.style.color = defaultColor;

      this.comment.style.backgroundColor = defaultHoverBackgroundColor;
      this.submit.style.backgroundColor = defaultButtonBackgroundColor;

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
          updateHistory(historyListGUID, newData.ID, currentText);
        } else {
          updateHistory(historyListGUID, this.id, currentText);
        }
      } else {
        this.comment.innerText = this.prevComment;
      }

      this.comment.style.color = defaultColor;
      this.comment.style.backgroundColor = defaultButtonBackgroundColor;
      this.$ele.style.backgroundColor = defaultButtonBackgroundColor;
      this.$ele.style.color = defaultColor;

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
      this.$ele.style.backgroundColor = defaultButtonBackgroundColor;
      this.$ele.style.color = defaultColor;
    } else {
      this.$ele.type = "disabled";
      this.$ele.style.backgroundColor = defaultMHIBackgroundColor;
      this.$ele.style.color = defaultColor;
    }
    if (this.$ele.type !== "editable") {
      this.delete.parentNode.removeChild(this.delete);
      this.edit.parentNode.removeChild(this.edit);
    }
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
    this.container.appendChild(notification.$ele);
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
    this.container.appendChild(toast.$ele);
  };

  //Notification object with ability to display messages, and images
  function Toast() {
    this.$ele = document.createElement("div");
    this.$ele.id = generateId();
    this.$ele.style.backgroundColor = "white";
    this.$ele.style.borderRadius = "0";
    this.$ele.style.boxShadow = "0px 1px 1px rgba(0,0,0,0.1)";
    this.$ele.style.color = "black";
    this.$ele.style.display = "flex";
    this.$ele.style.marginTop = "5px";
    this.$ele.style["-ms-flex"] = "1 0 1";
    this.$ele.style.height = "50px";
    this.$ele.style.padding = "0.5rem";
    this.$ele.style.width = "275px";
    this.$ele.style.zIndex = "202";
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
    var self = this.$ele;
    this.close.addEventListener("click", function () {
      self.removeToast();
    });
    return this;
  };

  Toast.prototype.startLoading = function () {
    this.svg = new LoaderCSS({ bSize: "5", diameter: "25" }).loader;
    return this;
  };

  Toast.prototype.endLoading = function () {
    this.svg.parentNode.removeChild(this.svg);
    return this;
  };

  Toast.prototype.setSuccess = function () {
    var icon = new SVGGenerator({
      color: "green",
      type: "success",
      size: "large",
    });
    this.svg = icon.wrapper;
    this.title.innerText = "Successfully Saved";
    return this;
  };

  Toast.prototype.setFailed = function () {
    var icon = new SVGGenerator({
      color: "red",
      type: "failure",
      size: "large",
    });
    this.svg = icon.wrapper;
    this.title.innerText = "Failed to Save";
    return this;
  };

  Toast.prototype.show = function () {
    this.$ele.appendChild(this.svg);
    this.$ele.appendChild(this.text);
    return this;
  };

  Toast.prototype.removeToast = function () {
    if (this.$ele) {
      if (this.$ele.parentNode) {
        this.$ele.parentNode.removeChild(this.$ele);
        clearTimeout(this.timer);
      }
    }
    return this;
  };

  function SVGGenerator(props) {
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.wrapper = document.createElement("div");
    this.wrapper.style.display = "inline-block";

    this.svg.setAttribute("role", "img");
    this.svg.setAttribute("viewBox", "0 0 512 512");
    this.svg.setAttribute("alignment-baseline", "baseline");
    this.g = document.createElementNS("http://www.w3.org/2000/svg", "g");

    switch (props.size) {
      case "small":
        this.svg.setAttribute("width", ".5em");
        this.svg.setAttribute("height", ".5em");
        this.wrapper.style.width = ".5em";
        this.wrapper.style.height = ".5em";
        break;
      case "normal":
        this.svg.setAttribute("width", "1em");
        this.svg.setAttribute("height", "1em");
        this.wrapper.style.width = "1em";
        this.wrapper.style.height = "1em";
        break;
      case "large":
        this.svg.setAttribute("width", "2em");
        this.svg.setAttribute("height", "2em");
        this.wrapper.style.width = "2em";
        this.wrapper.style.height = "2em";
        break;
      default:
        this.svg.setAttribute("width", "1em");
        this.svg.setAttribute("height", "1em");
        this.wrapper.style.width = "1em";
        this.wrapper.style.height = "1em";
        break;
    }

    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    if (props.type !== "loading") {
      path.setAttribute("fill", props.color);
    } else {
      path.setAttribute("fill", "url(#colorFill)");
    }
    var iconPath;
    switch (props.type) {
      case "add":
        iconPath =
          "M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z";
        this.wrapper.title = "Add";
        break;

      case "delete":
        iconPath =
          "M268 416h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12zM432 80h-82.41l-34-56.7A48 48 0 0 0 274.41 0H173.59a48 48 0 0 0-41.16 23.3L98.41 80H16A16 16 0 0 0 0 96v16a16 16 0 0 0 16 16h16v336a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128h16a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16zM171.84 50.91A6 6 0 0 1 177 48h94a6 6 0 0 1 5.15 2.91L293.61 80H154.39zM368 464H80V128h288zm-212-48h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12z";
        this.wrapper.title = "Delete";
        break;

      case "edit":
        iconPath =
          "M497.9 142.1l-46.1 46.1c-4.7 4.7-12.3 4.7-17 0l-111-111c-4.7-4.7-4.7-12.3 0-17l46.1-46.1c18.7-18.7 49.1-18.7 67.9 0l60.1 60.1c18.8 18.7 18.8 49.1 0 67.9zM284.2 99.8L21.6 362.4.4 483.9c-2.9 16.4 11.4 30.6 27.8 27.8l121.5-21.3 262.6-262.6c4.7-4.7 4.7-12.3 0-17l-111-111c-4.8-4.7-12.4-4.7-17.1 0zM124.1 339.9c-5.5-5.5-5.5-14.3 0-19.8l154-154c5.5-5.5 14.3-5.5 19.8 0s5.5 14.3 0 19.8l-154 154c-5.5 5.5-14.3 5.5-19.8 0zM88 424h48v36.3l-64.5 11.3-31.1-31.1L51.7 376H88v48z";
        this.wrapper.title = "Edit";
        break;

      case "failure":
        iconPath =
          "M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z";
        this.wrapper.title = "Failure";
        break;

      case "loading":
        this.svg.setAttribute("width", "100px");
        this.svg.setAttribute("height", "100px");
        this.wrapper.style.width = "100px";
        this.wrapper.style.height = "100px";
        iconPath =
          "M67.733 0A67.733 67.733 0 110 67.733 67.733 67.733 0 0167.733 0zm.69 20.686a46.676 46.676 0 11-46.676 46.676 46.676 46.676 0 0146.676-46.676z";
        this.wrapper.title = "Loading";
        break;

      case "submit":
        this.wrapper.style.backgroundColor = "#3949ab";
        this.svg.setAttribute("viewBox", "0 0 1000 1000");

        iconPath =
          "M931.4 498.9L94.9 79.5c-3.4-1.7-7.3-2.1-11-1.2a15.99 15.99 0 00-11.7 19.3l86.2 352.2c1.3 5.3 5.2 9.6 10.4 11.3l147.7 50.7-147.6 50.7c-5.2 1.8-9.1 6-10.3 11.3L72.2 926.5c-.9 3.7-.5 7.6 1.2 10.9 3.9 7.9 13.5 11.1 21.5 7.2l836.5-417c3.1-1.5 5.6-4.1 7.2-7.1 3.9-8 .7-17.6-7.2-21.6zM170.8 826.3l50.3-205.6 295.2-101.3c2.3-.8 4.2-2.6 5-5 1.4-4.2-.8-8.7-5-10.2L221.1 403 171 198.2l628 314.9-628.2 313.2z";
        this.wrapper.title = "Submit";
        break;

      case "success":
        iconPath =
          "M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 48c110.532 0 200 89.451 200 200 0 110.532-89.451 200-200 200-110.532 0-200-89.451-200-200 0-110.532 89.451-200 200-200m140.204 130.267l-22.536-22.718c-4.667-4.705-12.265-4.736-16.97-.068L215.346 303.697l-59.792-60.277c-4.667-4.705-12.265-4.736-16.97-.069l-22.719 22.536c-4.705 4.667-4.736 12.265-.068 16.971l90.781 91.516c4.667 4.705 12.265 4.736 16.97.068l172.589-171.204c4.704-4.668 4.734-12.266.067-16.971z";
        this.wrapper.title = "Success";
        break;

      default:
        iconPath = "";
        break;
    }
    path.setAttribute("d", iconPath);
    this.g.appendChild(path);
    this.svg.appendChild(this.g);
    this.wrapper.appendChild(this.svg);

    return this;
  }

  SVGGenerator.prototype.setLoadAnimation = function () {
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
    this.g.appendChild(linearGradient);

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
    this.g.appendChild(animateTransform);

    return this;
  };

  function LoaderCSS(props) {
    this.loader = document.createElement("div");
    this.loader.id = "LoaderCSS";
    this.loader.style.border = props.bSize + "px solid #F3F3F3";
    this.loader.style.borderTop = props.bSize + "px solid #3498db";
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

  //Show the history and on fail display "No Messages" in the history view

  function retrieveHistory(table, rowIndex, internalColumn, cb, init) {
    var url = "";
    init
      ? (url =
          ctx.PortalUrl +
          "_api/web/lists/getbytitle('History')/items?$select=Created,Author/Title,ID,Message,Status,Title&$filter=Title eq '" +
          table +
          " - " +
          rowIndex +
          " - " +
          internalColumn +
          "'&$expand=Author&$orderby=Created desc&$top=1")
      : (url =
          ctx.PortalUrl +
          "_api/web/lists/getbytitle('History')/items?$select=Created,Author/Title,ID,Message,Status,Title&$filter=Title eq '" +
          table +
          " - " +
          rowIndex +
          " - " +
          internalColumn +
          "'&$expand=Author&$top=200");

    $.ajax({
      url: url,
      type: "GET",
      headers: {
        Accept: "application/json; odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        credentials: true,
        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
      },
      success: function (res) {
        var data = res.d.results.map(function (item) {
          item.Author =
            item.Status === "Automated Message" ? "AutoBot" : item.Author.Title;
          return item;
        });

        cb(null, data);
      },
      error: cb,
    });
  }

  function findHistoryChat(cb) {
    var url = ctx.PortalUrl + "_api/web/lists/getbytitle('History')";

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
        cb(data.d.Id);
        return false;
      },
      error: function (error) {
        console.log("Error in the findHistoryChat:", error);
        makeList("History");
      },
    });
  }

  function getUserName(success, meatballHistory) {
    var url =
      ctx.HttpRoot + "/_api/SP.UserProfiles.PeopleManager/GetMyProperties";
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
        success(meatballHistory, data.d.DisplayName);
        return false;
      },
      error: function (error) {
        console.log("Error in the getting the current:", error);
      },
    });
  }

  function makeList(name) {
    var data = {
      __metadata: { type: "SP.List" },
      AllowContentTypes: true,
      BaseTemplate: 100,
      ContentTypesEnabled: true,
      Title: name,
    };

    var url = ctx.PortalUrl + "/_api/web/lists";

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
        createMessageColumn(); //colName and rowId come from the cell
        return false;
      },
      error: function (error) {
        console.log("History list creation failed:", error);
      },
    });
  }

  function createMessageColumn() {
    var data = {
      __metadata: { type: "SP.Field" },
      Title: "Message",
      FieldTypeKind: 2,
      Required: "false",
      EnforceUniqueValues: "false",
      StaticName: "Message",
    };

    var url = ctx.PortalUrl + "_api/web/lists/getbytitle('History')/Fields";

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
        createStatusColumn();
        return false;
      },
      error: function (error) {
        console.log("Message col creation failed:", error);
      },
    });
  }

  function createStatusColumn() {
    var data = {
      __metadata: { type: "SP.Field" },
      Title: "Status",
      FieldTypeKind: 2,
      Required: "false",
      EnforceUniqueValues: "false",
      StaticName: "Status",
    };

    var url = ctx.PortalUrl + "_api/web/lists/getbytitle('History')/Fields"; //this is dev env

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
        return false;
      },
      error: function (error) {
        console.log("Status col creation failed:", error);
      },
    });
  }

  function makeHistory(
    listId,
    message,
    colName,
    rowId,
    tableGUID,
    listEntrySuccess,
    autoBot
  ) {
    var data = {
      __metadata: { type: "SP.ListItem" },
      Message: message,
      Title: tableGUID + " - " + rowId + " - " + colName, //name of the status column that is passed
      Status: autoBot ? "Automated Message" : "User Generated",
    };

    var url = ctx.PortalUrl + "_api/web/lists/getbytitle('History')/items "; //this is dev env

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
        if (autoBot) {
          return false;
        }
        listEntrySuccess(data.d);
        return false;
      },
      error: function (error) {
        console.log("History entry creation failed:", error);
      },
    });
  }

  function deleteHistory(listId, id) {
    var url =
      ctx.PortalUrl + "_api/web/lists/getbytitle('History')/items(" + id + ")"; //this is dev env

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
        return false;
      },
      error: function (error) {
        console.log("History entry deletion failed:", error);
      },
    });
  }

  function updateHistory(listId, id, message) {
    var data = {
      __metadata: { type: "SP.ListItem" },
      Message: message,
    };

    var url =
      ctx.PortalUrl + "_api/web/lists/getbytitle('History')/items(" + id + ")";

    $.ajax({
      url: url,
      type: "POST",
      data: JSON.stringify(data),
      headers: {
        Accept: "application/json; odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        credentials: true,
        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
        "X-HTTP-Method": "MERGE",
        "IF-MATCH": "*",
      },
      success: function (data) {
        return false;
      },
      error: function (error) {
        console.log("History entry update failed:", error);
      },
    });
  }
})();
