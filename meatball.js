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
var requiredScripts = [
  "chat.js",
  "column.js",
  "list.js",
  "person.js",
  "polyfill.js",
  "notification.js",
  "style.js",
  "svg.js",
];

function scriptBuilder(url) {
  var run = url === "polyfill.js" ? !Object.hasOwnProperty("values") : true;

  if (run) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = baseUrl + url;
    script.defer = true;
    script.async = false;
    document.body.appendChild(script);
    return script;
  }
}

function loadScripts() {
  requiredScripts
    .map(function (src) {
      return scriptBuilder(src);
    })
    .map(function (script, i) {
      if (i == requiredScripts.length - 1) {
        script.addEventListener("load", function () {
          ims.chat = chat;
          ims.sharepoint.color = Color;
          ims.sharepoint.column = column;
          ims.sharepoint.list = list;
          ims.sharepoint.person = person;
          ims.sharepoint.notification = Pantry;
          ims.sharepoint.style = style;
          startMeatball();
        });
      }
    });
}
loadScripts();

function startMeatball() {
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

  function start() {
    if (!window.jQuery) {
      alert("Please contact help desk. Script not properly loaded.");
      return;
    }

    window.addEventListener("error", function (msg, url, line) {
      if (debug) {
        //Fix me. Pass message into method not prototype
        var errorToast = new Toast();
        errorToast.setMessage(msg).setListeners().show();
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
              ims.sharepoint.column.create(
                {
                  colTitle: "Status",
                  fieldType: 2,
                  required: "false",
                  uniqueValue: "false",
                  listName: "History",
                },

                cb
              );
            }
            ims.sharepoint.column.create(
              {
                colTitle: "Message",
                fieldType: 2,
                required: "false",
                uniqueValue: "false",
                listName: "History",
              },

              cb
            );
          }
          ims.sharepoint.list.create({ listName: "History" }, cb);
          console.log(error);
          return;
        }
        if (props.length !== 0) {
          historyListGUID = props;
        }
      }
      ims.sharepoint.list.find({ listName: "History" }, cb);
    }

    if (userName.length <= 0) {
      function cb(error, name) {
        if (error) {
          console.log(error);
        }
        userName = name;
      }
      ims.sharepoint.person.get(cb);
    }

    //Get all the tables -- create array
    var tables = [].slice.call(
      document.getElementsByClassName("ms-listviewtable")
    );

    //Step . Reduce tables and its cells into an object.
    var organizedTables = tables.reduce(function (r, $table, index1) {
      //Step a. Get $rows of this table.
      var $thead = $table.getElementsByTagName("thead")[0];
      var $tbody = $table.getElementsByTagName("tbody")[0];
      var $tcells = [].slice
        .call($thead.getElementsByTagName("th"))
        .map(function ($th) {
          return $th.innerText;
        });
      var $rows = [].slice.call($tbody.children);

      //Step b. Build table object.
      r["table" + index1] = $rows.reduce(function (r2, $row) {
        [].slice.call($row.children).forEach(function ($cell, index3) {
          var colKey = $tcells[index3] || "delete";
          if (!r2[colKey]) {
            r2[colKey] = [];
          }
          $cell.iid = $row.getAttribute("iid").split(",")[1];
          r2[colKey].push($cell);
        });

        return r2;
      }, {});

      return r;
    }, []);

    //Grabbing the list url + Iterate through the set of tables
    tables.forEach(function ($table, index4) {
      var listId = $table.getAttribute("id").substring(1, 37);
      var listTitle = $table.summary;
      var tableKey = "table" + index4;

      //Step . Fetch choice fields based on list id.
      ims.sharepoint.list.choiceFields({ listId: listId }, function (
        error,
        results
      ) {
        var choiceFields = results.reduce(function (acc, props, index5) {
          acc[props.InternalName] = {
            choices: props.Choices.results,
            external: props.Title,
            internal: props.InternalName,
          };
          return acc;
        }, {});

        //Step . Break out external name to reference below
        let choiceFieldNames = Object.values(choiceFields).map(function (
          props
        ) {
          return props.external;
        });

        //Step . Delete "non-choice" related columns from object.
        for (var colKey in tables[tableKey]) {
          if (choiceFieldNames.indexOf(colKey) === -1) {
            delete tables[colKey];
          }
        }

        var findChoiceField = function (externalName) {
          var match = Object.values(choiceFields).filter(function (props) {
            return props.external === externalName;
          });
          return match.length ? match[0] : false;
        };
        //Step . Grab row title
        var rowTitles = Object.keys(organizedTables[tableKey]);
        //First column contains the row titles
        rowTitles = organizedTables[tableKey][rowTitles[1]];
        //Step . For each remaining $cell, convert to meatball.
        for (var colKey2 in organizedTables[tableKey]) {
          organizedTables[tableKey][colKey2].forEach(function ($cell, ci) {
            //Step A. Define the choice column in question.
            var choiceProps = findChoiceField(colKey2);
            if (rowTitles[ci] && choiceProps) {
              choiceProps.colName = colKey2;
              choiceProps.rowTitle = rowTitles[ci].innerText;
              choiceProps.iid = $cell.iid;
              choiceProps.listId = listId;
              choiceProps.listTitle = listTitle;

              //Step B. Build Meatball with these options.
              var mb = new Meatball(Object.assign(choiceProps, { $el: $cell }));
              mb.init();
            }
          });
        }
      });
    });
  }

  //Update target's value to user's selected value
  function updateTarget(props) {
    console.log("props in updateTarget:", props);
    var name = props.meatball.list.internal;
    var data = {
      __metadata: { type: "SP.ListItem" },
    };
    data[name] = props.cellText;
    var url =
      ctx.HttpRoot +
      "/_api/web/lists('" +
      props.meatball.list.id +
      "')/items(" +
      props.meatball.item.id +
      ")?$select=" +
      props.meatball.list.internal;

    props.meatball.removePopover();
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
        props.meatball.setColor(props.cellText);
        toast
          .endLoading()
          .setMessage(
            props.meatball.list.title +
              " - " +
              props.meatball.list.external +
              " updated successfully"
          )
          .setSuccess()
          .setListeners()
          .show();

        return false;
      },
      error: function (error) {
        toast
          .endLoading()
          .setMessage(
            props.meatball.list.title +
              " - " +
              props.meatball.list.external +
              " failed to update"
          )
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
  function Meatball(props) {
    this.$circle = document.createElement("div");
    this.$circle.setAttribute(
      "style",
      ims.sharepoint.style({
        type: "meatball",
        size: "large",
      }).$ele
    );
    this.list = {
      choices: props.choices,
      external: props.external,
      id: props.listId,
      internal: props.internal,
      title: props.listTitle,
    };
    this.item = {
      id: props.iid,
      title: props.rowTitle,
    };
    this.$cell = props.$el;
  }

  Meatball.prototype.init = function () {
    var meatball = this;
    var triangleSize = 10;
    var meatballHistoryDisplay = new MeatballHistory(this);
    meatballHistoryDisplay.listGUID = historyListGUID;
    var cellText = this.$cell.innerText; //pierre added
    this.$circle.style.backgroundColor = color.get(
      meatballDefaults.get(cellText)
    );

    this.$ele = document.createElement("div");
    this.$ele.style.backgroundColor = "transparent";
    this.$ele.style.padding = "10px";

    this.$popoverBody = document.createElement("div");
    this.$popoverBody.style.backgroundColor = color.get(defaultBackgroundColor);
    this.$popoverBody.style.boxShadow = "1px 1px 4px 1px rgb(0 0 0 / 0.2)";
    this.$popoverBody.style.color = color.get(defaultColor);
    this.$popoverBody.style.display = "inline-block";
    this.$popoverBody.style.margin = "0px";
    this.$popoverBody.style.padding = "0px";
    this.$popoverBody.style.width = "200px";

    this.$carret = document.createElement("div");
    this.$carret.setAttribute(
      "style",
      ims.sharepoint.style({
        type: "carret",
        size: "",
        bgc: defaultBackgroundColor,
      }).$ele
    );

    //Create Popover Element
    this.$popover = document.createElement("div");
    this.$popover.style.borderRadius = ".25rem";
    this.$popover.style.display = "inline-block";
    this.$popover.style.padding = ".5rem";
    this.$popover.style.zIndex = "1";

    //Create Header Element
    this.$header = document.createElement("div");
    this.$header.innerText = this.item.title + ": " + this.list.external;
    this.$header.style.marginBottom = ".25rem";
    this.$header.style.padding = ".25rem";
    this.$header.style.textAlign = "center";
    this.$header.style.width = "100%";

    //Add Header Element
    this.$popover.appendChild(this.$header);

    //Create Options Panel Object
    this.optionPanel = new OptionPanel(
      Object.assign(this, { cellText: cellText })
    );
    this.optionPanel.create();

    //Add Options Panel
    this.$popover.appendChild(this.optionPanel.$ele);

    this.$divider1 = document.createElement("hr");
    this.$divider1.style.borderTop =
      "1pt solid " + color.get(defaultHoverBackgroundColor);

    this.$popover.appendChild(this.$divider1);

    this.$popoverBody.appendChild(this.$carret);
    this.$popoverBody.appendChild(this.$popover);

    this.$initHistoryContainer = document.createElement("div");
    this.$initHistoryContainer.style.backgroundColor = color.get(
      defaultHoverBackgroundColor
    );
    this.$initHistoryContainer.style.borderRadius = ".25rem";
    this.$initHistoryContainer.style.color = color.get(defaultColor);
    this.$initHistoryContainer.style.display = "block";
    this.$initHistoryContainer.style.marginBottom = ".5rem";
    this.$initHistoryContainer.style.marginLeft = ".5rem";
    this.$initHistoryContainer.style.marginRight = ".5rem";
    this.$initHistoryContainer.style.padding = ".25rem";

    this.$initHistoryDate = document.createElement("div");
    this.$initHistoryDate.style.display = "block";
    this.$initHistoryDate.style.fontSize = "7pt";
    this.$initHistoryDate.style.margin = ".25rem";
    this.$initHistoryDate.style.padding = ".25rem";
    this.$initHistoryDate.style.textAlign = "left";

    this.$initHistoryMessage = document.createElement("div");
    this.$initHistoryMessage.style.display = "block";
    this.$initHistoryMessage.style.fontSize = "9pt";
    this.$initHistoryMessage.style.margin = ".25rem";
    this.$initHistoryMessage.style.padding = ".25rem";

    this.$initHistoryName = document.createElement("div");
    this.$initHistoryName.style.display = "block";
    this.$initHistoryName.style.fontSize = "7pt";
    this.$initHistoryName.style.margin = ".25rem";
    this.$initHistoryName.style.padding = ".25rem";
    this.$initHistoryName.style.textAlign = "left";

    this.$initHistoryHeader = document.createElement("div");
    this.$initHistoryHeader.style.display = "flex";
    this.$initHistoryHeader.style.justifyContent = "space-between";

    this.$showMore = document.createElement("div");
    this.$showMore.innerText = "Show More";
    this.$showMore.setAttribute(
      "style",
      ims.sharepoint.style({
        type: "button",
        size: "normal",
        fc: defaultColor,
        bgc: defaultButtonBackgroundColor,
      }).$ele
    );

    this.$showMore.addEventListener("mouseenter", function () {
      this.style.backgroundColor = color.get(defaultButtonHoverBackgroundColor);
    });

    this.$showMore.addEventListener("mouseleave", function () {
      this.style.backgroundColor = color.get(defaultButtonBackgroundColor);
    });

    this.$showMore.addEventListener("click", function () {
      function cb(error, data) {
        if (error || !data.length) {
          console.log(error);
          return;
        }

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
            var isBreak = lastDay !== day;
            if (isBreak) {
              lastAuthor = "";
              acc.push([{ type: "break", timeStamp: new Date(props.Created) }]);
              lastDay = day;
            }
            var lastIndex = acc.length - 1;
            if (!lastIndex && !lastAuthor) {
              acc[0].push(props);
              lastAuthor = author;
              lastDay = new Date(props.Created).getDay();
            } else if (author === lastAuthor && !isBreak) {
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
            var $messageContainer = document.createElement("div");
            $messageContainer.style.display = "flex";
            $messageContainer.style.flexDirection = isRight
              ? "row-reverse"
              : "row";
            $messageContainer.style.width = "100%";

            //step 1 create continer for avatar
            var $avatarContainer = document.createElement("div");

            var $avatar = document.createElement("div");
            $avatar.setAttribute(
              "style",
              ims.sharepoint.style({
                type: "avatar",
                bgc: defaultButtonBackgroundColor,
              }).$ele
            );
            $avatar.style.margin = isRight
              ? "0px 0px 0px 4px"
              : "0px 4px 0px 0px";

            var avatarAuthor = author.split(" ");
            $avatar.innerText =
              avatarAuthor.length > 1
                ? avatarAuthor[2].charAt(0) + avatarAuthor[0].charAt(0)
                : author.charAt(0);
            $avatarContainer.appendChild($avatar);

            //step 2 create the message block
            var $messageBlock = document.createElement("div");
            $messageBlock.style.alignItems = isRight
              ? "flex-end"
              : "flex-start";
            $messageBlock.style.display = "flex";
            $messageBlock.style.flex = "1";
            $messageBlock.style.flexDirection = "column";
            $messageBlock.style.maxWidth = "75%";
            $messageContainer.appendChild($avatarContainer);
            $messageContainer.appendChild($messageBlock);
            meatballHistoryDisplay.$container.appendChild($messageContainer);

            //step 3 append each mssg to mssg block
            return {
              block: $messageBlock,
              messages: block.map(function (item, index2) {
                var mhItem = new MeatballHistoryMessage();
                mhItem.setDisplay(
                  meatball,
                  item.Author,
                  generateDateTime(item.Created),
                  item.Message,
                  item.ID,
                  meatballHistoryDisplay.listGUID,
                  index2 === 0
                );
                meatballHistoryDisplay.build(mhItem);
                $messageBlock.appendChild(mhItem.$ele);

                return mhItem;
              }),
            };
          }
        });
      }

      ims.chat.getMessages(
        Object.assign(meatball, {
          listName: "History",
          qs: "'&$expand=Author&$top=300&$SortField=Modified&SortDir=Desc",
        }),
        cb
      );

      document.body.appendChild(meatballHistoryDisplay.$ele);
      meatballHistoryDisplay.$container.scrollTop =
        meatballHistoryDisplay.$container.scrollHeight;
    });

    this.$initHistoryHeader.appendChild(this.$initHistoryName);
    this.$initHistoryHeader.appendChild(this.$initHistoryDate);
    this.$initHistoryContainer.appendChild(this.$initHistoryHeader);
    this.$initHistoryContainer.appendChild(this.$initHistoryMessage);
    this.$popoverBody.appendChild(this.$initHistoryContainer);
    this.$popoverBody.appendChild(this.$showMore);

    this.$ele.appendChild(this.$popoverBody);

    //Add Mouse Enter Event to display
    this.$circle.addEventListener("mouseenter", function () {
      meatball.$initHistoryMessage.innerText = "Loading...";
      function cb(error, data) {
        if (error) {
          console.log(error);
        }
        if (data.length === 1) {
          meatball.$initHistoryDate.innerText = generateDateTime(
            data[0].Created
          );
          meatball.$initHistoryMessage.innerText = data[0].Message;
          meatball.$initHistoryName.innerText = data[0].Author;
        } else {
          meatball.$initHistoryMessage.innerText = "No History Found";
          meatball.$initHistoryContainer.style.textAlign = "center";
        }
        meatball.setPosition(triangleSize);
      }
      //should only have one function -- to call one history entry
      ims.chat.getMessages(
        Object.assign(meatball, {
          listName: "History",
          qs: "'&$expand=Author&$SortField=Created&SortDir=desc&$top=1",
        }),
        cb
      );

      document.body.appendChild(meatball.$ele);
      meatball.setPosition(triangleSize);
    });

    this.$circle.addEventListener("mouseleave", function (e) {
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
    this.$cell.innerText = "";
    this.$cell.appendChild(this.$circle);
  };

  Meatball.prototype.setPosition = function (triangleSize) {
    this.$ele.style.position = "fixed";
    this.$ele.style.right = "0px";
    this.$ele.style.left =
      this.$circle.getBoundingClientRect().right - 12 + triangleSize + "px";

    this.$carret.setAttribute(
      "style",
      ims.sharepoint.style({
        type: "carret",
        size: "",
        bgc: defaultBackgroundColor,
      }).$ele
    );
    if (this.$carret.parentNode) {
      this.$carret.parentNode.removeChild(this.$carret);
    }
    var windowHeight = window.innerHeight || document.body.clientHeight;
    var windowWidth = window.innerWidth || document.body.clientWidth;

    if (
      this.$ele.offsetHeight + this.$circle.getBoundingClientRect().top <
      windowHeight
    ) {
      this.$ele.style.top =
        this.$circle.getBoundingClientRect().top - 40 + triangleSize + "px";
    } else {
      var meatballHeight =
        this.$circle.getBoundingClientRect().top - 40 + triangleSize;
      var meatballDifferenceHeight = Math.abs(
        meatballHeight - (windowHeight - this.$ele.offsetHeight)
      );

      if (meatballHeight <= windowHeight - this.$ele.offsetHeight) {
        if (meatballDifferenceHeight > this.$ele.offsetHeight) {
          this.$carret.style.top = meatballHeight + "px";
        } else {
          this.$carret.style.top = "29px";
        }
        this.$ele.style.top =
          windowHeight -
          this.$ele.offsetHeight -
          meatballDifferenceHeight +
          "px";
      } else {
        this.$carret.style.top = 29 + meatballDifferenceHeight + "px";
        this.$ele.style.top = windowHeight - this.$ele.offsetHeight + "px";
      }
    }

    if (
      this.$popoverBody.getBoundingClientRect().width +
        this.$circle.getBoundingClientRect().right >
      windowWidth
    ) {
      this.$ele.appendChild(this.$carret);
      this.$carret.style.borderLeft =
        triangleSize + "px solid " + color.get(defaultBackgroundColor);
      this.$carret.style.borderRight = "0px";
      this.$carret.style.left =
        this.$popoverBody.getBoundingClientRect().width + triangleSize + "px";
      this.$ele.style.left =
        this.$circle.getBoundingClientRect().left -
        this.$popoverBody.getBoundingClientRect().width -
        triangleSize -
        12 +
        "px";
      this.$ele.style.width =
        this.$popoverBody.getBoundingClientRect().width + triangleSize + "px";
    } else {
      this.$ele.insertBefore(this.$carret, this.$ele.firstChild);
    }
  };

  Meatball.prototype.setColor = function (value) {
    this.$circle.style.backgroundColor = color.get(meatballDefaults.get(value));
  };

  Meatball.prototype.removePopover = function () {
    if (this.$ele) {
      if (this.$ele.parentNode) {
        this.$ele.parentNode.removeChild(this.$ele);
      }
    }
  };

  //Shows list of predetermine choices for the user
  function OptionPanel(props) {
    this.parentProps = props;
  }

  OptionPanel.prototype.create = function () {
    this.$ele = document.createElement("div");
    this.$ele.style.borderRadius = ".25rem";
    this.$ele.style.padding = ".25rem";

    var $ele = this.$ele;
    var parentProps = this.parentProps;

    parentProps.list.choices.forEach(function (choice, index) {
      var $option = document.createElement("div");
      $option.style.borderRadius = ".25rem";
      $option.style.cursor = "pointer";
      $option.style.marginBottom = ".25rem";
      $option.style.padding = ".25rem";
      $option.style.textAlign = "left";
      $option.style.width = "100%";

      var $description = document.createElement("div");
      $description.innerText = choice;
      $description.style.display = "inline";
      $description.style.marginLeft = ".25rem";

      var $radio = document.createElement("input");
      $radio.name = "option";
      $radio.style.cursor = "pointer";
      $radio.style.display = "inline";
      $radio.style.margin = "0px";
      $radio.type = "radio";

      if (containsSubString(choice, parentProps.$cell.innerText)) {
        $radio.checked = true;
        $option.style.backgroundColor = color.get(defaultHoverBackgroundColor);
      }

      $option.addEventListener("mouseenter", function () {
        if ($radio.checked) {
          $option.style.backgroundColor = color.get(defaultBackgroundColor);
        } else {
          $option.style.backgroundColor = color.get(
            defaultHoverBackgroundColor
          );
        }
      });
      $option.addEventListener("mouseleave", function () {
        if ($radio.checked) {
          $option.style.backgroundColor = color.get(
            defaultHoverBackgroundColor
          );
        } else {
          $option.style.backgroundColor = color.get(defaultBackgroundColor);
        }
      });

      $ele.addEventListener("mousedown", function () {
        [].slice.call($ele.children).forEach(function ($item) {
          if ($item.parentElement.querySelector(":hover") === $item) {
            $item.style.backgroundColor = color.get(
              defaultHoverBackgroundColor
            );
          } else {
            $item.style.backgroundColor = color.get(defaultBackgroundColor);
          }
        });
      });

      $option.addEventListener("mouseup", function () {
        if (!$radio.checked) {
          $radio.checked = true;
          $option.style.backgroundColor = color.get(
            defaultHoverBackgroundColor
          );
          updateTarget(
            {
              listName: "History",
              meatball: parentProps,
              cellText: choice,
            },
            function () {}
          );

          parentProps.removePopover();

          var autoComment = parentProps.cellText
            ? "Status change: " +
              parentProps.cellText +
              " to " +
              choice +
              " by " +
              userName
            : "Initial Status: " + choice + " by " + userName;

          ims.sharepoint.list.item.create(
            {
              data: {
                Message: autoComment,
                Status: "Automated Message",
                Title:
                  parentProps.list.id +
                  "-" +
                  parentProps.item.id +
                  "-" +
                  parentProps.list.internal,
              },
              listName: "History",
            },

            function () {}
          );
          parentProps.cellText = choice; //this will change the current value of meatball for the view purposes.
        } else {
          $option.style.backgroundColor = color.get(
            defaultHoverBackgroundColor
          );
        }
      });

      //Add Click Event to update list
      $option.appendChild($radio);
      $option.appendChild($description);
      $ele.appendChild($option);
    });
  };

  function MeatballHistory(props) {
    var meatballHistory = this;
    var windowWidth = window.innerWidth || document.body.clientWidth;
    var windowHeight = window.innerHeight || document.body.clientHeight;

    this.$ele = document.createElement("div");
    this.$ele.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
    this.$ele.style.left = "0px";
    this.$ele.style.height = windowHeight - 1 + "px";
    this.$ele.style.position = "absolute";
    this.$ele.style.top = "0px";
    this.$ele.style.width = windowWidth - 1 + "px";
    this.$ele.style.zIndex = "201";

    this.$ele.addEventListener("click", function (e) {
      if (e.target == this) {
        addMeatballHistory = true;
        meatballHistory.reset();
        this.parentNode.removeChild(this);
      }
    });

    window.addEventListener("resize", function () {
      var windowHeight = window.innerHeight || document.body.clientHeight;
      var windowWidth = window.innerWidth || document.body.clientWidth;
      meatballHistory.$ele.style.height = windowHeight;
      meatballHistory.$ele.style.width = windowWidth;
    });

    this.listGUID = historyListGUID;

    this.$historyPanel = document.createElement("div");
    this.$historyPanel.style.alignItems = "stretch";
    this.$historyPanel.style.backgroundColor = color.get(
      defaultBackgroundColor
    );
    this.$historyPanel.style.display = "flex";
    this.$historyPanel.style.flexDirection = "column";
    this.$historyPanel.style.height = windowHeight + "px";
    this.$historyPanel.style.position = "fixed";
    this.$historyPanel.style.right = "0px";
    this.$historyPanel.style.textAlign = "left";
    this.$historyPanel.style.top = "0px";
    this.$historyPanel.style.width = "calc(500px - .5rem)";

    this.$title = document.createElement("div");
    this.$title.style.backgroundColor = color.get(defaultBackgroundColor);
    this.$title.style.borderBottom = "1px solid " + color.get(22);
    this.$title.style.justifyContent = "center";
    this.$title.style.marginBottom = "0.5rem";

    this.$headerContainer = document.createElement("div");
    this.$headerContainer.style.display = "flex";
    this.$headerContainer.style.flexDirection = "row";
    this.$headerContainer.style.height = "50px";
    this.$headerContainer.style.padding = "0.25rem .5rem";

    this.$titleContainer = document.createElement("div");
    this.$titleContainer.style.flex = "1";

    this.$x = document.createElement("div");
    this.$x.innerText = "X";
    this.$x.style.alignSelf = "center";
    this.$x.style.cursor = "pointer";
    this.$x.style.fontWeight = "bolder";
    this.$x.style.height = "calc(10px + .5rem)";
    this.$x.style.padding = ".25rem";
    this.$x.style.right = "10px";
    this.$x.style.textAlign = "right";
    this.$x.style.textSize = "16pt";

    this.$x.style.color = color.get(defaultTitleColor);
    this.$x.style.backgroundColor = color.get(defaultBackgroundColor);

    this.$x.addEventListener("mouseenter", function () {
      this.style.backgroundColor = color.get(defaultHoverBackgroundColor);
    });

    this.$x.addEventListener("mouseleave", function () {
      this.style.backgroundColor = color.get(defaultBackgroundColor);
    });

    this.$x.addEventListener("click", function () {
      this.style.backgroundColor = color.get(defaultBackgroundColor);
      addMeatballHistory = true;
      meatballHistory.reset();
      meatballHistory.$ele.parentNode.removeChild(meatballHistory.$ele);
    });

    this.$titleMain = document.createElement("h3");
    this.$titleMain.innerText = "History";
    this.$titleMain.style.color = color.get(defaultTitleColor);
    this.$titleMain.style.fontWeight = "bolder";

    this.$titleDescription = document.createElement("div");
    this.$titleDescription.innerText =
      props.item.title + ": " + props.list.external;
    this.$titleDescription.style.color = color.get(defaultTitleColor);
    this.$titleDescription.style.fontSize = "10px";

    this.$titleContainer.appendChild(this.$titleMain);
    this.$titleContainer.appendChild(this.$titleDescription);
    this.$headerContainer.appendChild(this.$titleContainer);
    this.$headerContainer.appendChild(this.$x);
    this.$title.appendChild(this.$headerContainer);

    this.$historyPanel.appendChild(this.$title);

    this.$containerText = document.createElement("p");
    this.$containerText.innerText = "No History Available For This Item";
    this.$containerText.style.color = color.get(0);
    this.$containerText.style.fontWeight = "600";
    this.$containerText.style.position = "absolute";
    this.$containerText.style.textAlign = "center";
    this.$containerText.style.width = "100%";

    this.$container = document.createElement("div");
    this.$container.id = "MHContainer";
    this.$container.style.color = color.get(defaultTitleColor);
    this.$container.style.display = "flex";
    this.$container.style.flex = "1";
    this.$container.style.flexDirection = "column";
    this.$container.style.overflowX = "hidden";
    this.$container.style.overflowY = "auto";
    this.$container.style.padding = "0.25rem";

    this.$container.addNew = true;
    this.$container.isEdit = true;

    this.$container.appendChild(this.$containerText);
    this.$historyPanel.appendChild(this.$container);

    this.$divider1 = document.createElement("hr");
    this.$divider1.style.borderTop =
      "1pt solid " + color.get(defaultHoverBackgroundColor);

    this.$historyPanel.appendChild(this.$divider1);

    this.$addPanel = document.createElement("div");
    this.$addPanel.style.borderTop = "1px solid " + color.get(23);
    this.$addPanel.style.display = "flex";
    this.$addPanel.style.height = "60px";
    this.$addPanel.style.padding = ".25rem";

    this.$send = new SVGGenerator({
      color: "white",
      type: "submit",
      size: "large",
    }).wrapper;
    this.$send.style.alignItems = "center";
    this.$send.style.borderRadius = ".25rem";
    this.$send.style.cursor = "pointer";
    this.$send.style.display = "flex";
    this.$send.style.height = "auto";
    this.$send.style.justifyContent = "center";
    this.$send.style.padding = "0.5rem";
    this.$send.style.width = "40px";

    this.$send.addEventListener("mouseenter", function () {
      this.style.backgroundColor = color.get(14);
    });

    this.$send.addEventListener("mouseleave", function () {
      this.style.backgroundColor = color.get(4);
    });

    this.$send.addEventListener("click", function () {
      if (meatballHistory.$input.value.length > 0) {
        meatballHistory.$input.value = meatballHistory.$input.value.replace(
          regex,
          "",
          meatballHistory.$input.value
        );
      } else {
        return;
      }

      if (meatballHistory.$container) {
        meatballHistory.newItem(props);
      }
    });

    this.$footer = document.createElement("div");
    this.$footer.style.backgroundColor = color.get(defaultHoverBackgroundColor);
    this.$footer.style.borderRadius = "0.25rem";
    this.$footer.style.padding = "0.25rem";
    this.$footer.style.display = "flex";
    this.$footer.style.flex = "1";
    this.$footer.style.flexDirection = "row";

    this.$input = document.createElement("input");
    this.$input.id = "CommentBox";
    this.$input.maxLength = "255";
    this.$input.placeholder = "Enter Comment Here";
    this.$input.style.backgroundColor = color.get(defaultHoverBackgroundColor);
    this.$input.style.border = "0px";
    this.$input.style.borderRadius = ".25rem";
    this.$input.style.color = color.get(defaultTitleColor);
    this.$input.style.display = "flex";
    this.$input.style.flex = "1 1 0%";
    this.$input.style.fontSize = "9pt";
    this.$input.style.padding = ".25rem .5rem";

    this.$input.addEventListener("keydown", function (e) {
      if (e.keyCode === 13) {
        if (organized.length < 2 && organized[0].length === 0) {
          meatballHistory.reset();
        }
        meatballHistory.newItem(props);
      }
    });

    this.$footer.appendChild(this.$input);
    this.$footer.appendChild(this.$send);
    this.$addPanel.appendChild(this.$footer);

    this.$historyPanel.appendChild(this.$addPanel);

    this.$ele.appendChild(this.$historyPanel);

    return this;
  }

  MeatballHistory.prototype.addDivider = function (props) {
    this.$dividerPanel = document.createElement("div");
    this.$dividerPanel.style.clear = "both";
    this.$dividerPanel.style.color = color.get(defaultTitleColor);
    this.$dividerPanel.style.float = "center";
    this.$dividerPanel.style.margin = "0px";
    this.$dividerPanel.style.marginBottom = ".25rem";
    this.$dividerPanel.style.padding = ".25rem";
    this.$dividerPanel.style.textAlign = "center";

    this.$dividerText = document.createElement("div");
    this.$dividerText.innerText = " " + props.timeStamp.toDateString() + " ";
    this.$dividerText.style.display = "inline-block";
    this.$dividerText.style.textAlign = "center";
    this.$dividerText.style.verticalAlign = "middle";

    this.$leftDividerLine = document.createElement("div");
    this.$leftDividerLine.style.borderTop =
      "1pt solid " + color.get(defaultHoverBackgroundColor);
    this.$leftDividerLine.style.display = "inline-block";
    this.$leftDividerLine.style.width = "35%";

    this.$rightDividerLine = document.createElement("div");
    this.$rightDividerLine.style.borderTop =
      "1pt solid " + color.get(defaultHoverBackgroundColor);
    this.$rightDividerLine.style.display = "inline-block";
    this.$rightDividerLine.style.width = "35%";

    this.$dividerPanel.appendChild(this.$leftDividerLine);
    this.$dividerPanel.appendChild(this.$dividerText);
    this.$dividerPanel.appendChild(this.$rightDividerLine);
    this.$container.appendChild(this.$dividerPanel);
    return this;
  };

  MeatballHistory.prototype.build = function (props) {
    this.$containerText.innerText = "";

    props.setType(userName);

    this.$container.appendChild(props.$ele);
    this.$container.scrollTop = this.$container.scrollHeight;
    return this;
  };

  MeatballHistory.prototype.newItem = function (props) {
    if (this.$container.innerText === this.$containerText) {
      this.$container.innerText = "";
    }

    if (this.$input.value.length <= 0) {
      return;
    }

    //create a messageContainer
    this.$newCommentContainer = document.createElement("div");
    this.$newCommentContainer.style.display = "flex";
    this.$newCommentContainer.style.flexDirection = "row-reverse";
    this.$newCommentContainer.style.width = "100%";

    //create the avatar container + avatar
    var $avatar = document.createElement("div");
    $avatar.style.backgroundColor = color.get(4);
    $avatar.style.borderRadius = "50%";
    $avatar.style.height = "30px";
    $avatar.style.fontSize = "14px";
    $avatar.style.lineHeight = "28px";
    $avatar.style.marginLeft = "4px";
    $avatar.style.textAlign = "center";
    $avatar.style.width = "30px";

    this.$newMessageBlock = document.createElement("div");
    this.$newMessageBlock.style.alignItems = "flex-end";
    this.$newMessageBlock.style.display = "flex";
    this.$newMessageBlock.style.flex = "1";
    this.$newMessageBlock.style.flexDirection = "column";
    this.$newMessageBlock.style.maxWidth = "75%";

    var chatWindow = this;
    var $commentBlock = this.$newMessageBlock;
    var $commentRow = this.$newCommentContainer;

    var avatarAuthor = userName.split(" ");
    $avatar.innerText = avatarAuthor[2].charAt(0) + avatarAuthor[0].charAt(0);

    //create a message messageBlock
    //message block will be on the right (user generated)
    //create a message

    function cb(error, data) {
      if (error) {
        console.log(error);
        return;
      }
      //change pierre
      var item = new MeatballHistoryMessage(props);

      item.setDisplay(
        props,
        userName,
        generateDateTime(),
        data.Message,
        data.ID,
        historyListGUID,
        true
      );
      item.isNew = true;
      //item.setType(meatballObj.currentUser);

      //Step 1. Determine whether to append to existing block or append to new block
      if (lastAuthor === userName) {
        //Step 1a. Find last message block and append to existing
        var $lastBlock = organized[organized.length - 1];

        //Step 1b. Append new message to latest block in screen.
        $lastBlock.block.appendChild(item.$ele);

        //Step 1c. Push new message into memory for later use.
        organized[organized.length - 1].messages.push(item);
        //Step 2. Append new comment to new block. Add to overall display.
      } else {
        //Step 2a. Append message to message block.
        $commentBlock.appendChild(item.$ele);

        //Step 2b. Append avatar container to message container row.
        $commentRow.appendChild($avatar);

        //Step 2c. Append message block to message container row.
        $commentRow.appendChild($commentBlock);

        //Step 2d. Append new comment to chat window
        chatWindow.$container.appendChild($commentRow);

        organized.push({ block: $commentBlock, messages: [item.$ele] });

        lastAuthor = userName;
      }

      //Step 3. Scroll bottom to give appearance of chat window update.
      chatWindow.scrollDown();

      item.setEditable(item.getEditable());

      console.log(chatWindow);

      //Step 4. Reset the input to NO value to start over.
      chatWindow.$input.value = "";
    }

    ims.sharepoint.list.item.create(
      {
        data: {
          Message: this.$input.value,
          Title:
            props.list.id + "-" + props.item.id + "-" + props.list.internal,
          Status: "User Generated",
        },
        listName: "History",
      },
      cb
    );

    return this;
  };

  MeatballHistory.prototype.reset = function () {
    while (this.$container.firstChild) {
      this.$container.removeChild(this.$container.firstChild);
    }
    return this;
  };

  MeatballHistory.prototype.scrollDown = function () {
    this.$container.scrollTop = this.$container.scrollHeight;
    return this;
  };

  function MeatballHistoryMessage(props) {
    var meatballHistoryItem = this;
    this.$ele = document.createElement("div");
    this.$ele.style.borderRadius = ".5rem";
    this.$ele.style.margin = "0px;";
    this.$ele.style.marginBottom = ".25rem";
    this.$ele.style.padding = ".25rem";

    this.$display = document.createElement("div");
    this.$display.style.display = "block";
    this.$display.style.marginRight = "0px";
    this.$display.style.marginLeft = "0px";
    this.$display.style.padding = "0px";

    this.$date = document.createElement("div");
    this.$date.contentEditable = false;
    this.$date.style.display = "block";
    this.$date.style.fontSize = "6pt";
    this.$date.style.margin = "0px";
    this.$date.style.paddingLeft = ".25rem";
    this.$date.style.textAlign = "left";
    this.$date.style.verticalAlign = "middle";

    this.$display.appendChild(this.$date);

    this.isNew = false;

    this.$btnContainer = document.createElement("div");
    this.$btnContainer.style.display = "flex";

    this.$submit = document.createElement("div");
    this.$submit.innerText = "Submit";
    this.$submit.setAttribute(
      "style",
      ims.sharepoint.style({
        type: "button",
        size: "",
        bgc: defaultButtonBackgroundColor,
        fc: defaultColor,
      }).$ele
    );
    this.$submit.style.display = "inline-block";
    this.$submit.style.marginLeft = "4px";
    this.$submit.style.width = "75px";

    this.$submit.addEventListener("mouseenter", function () {
      this.style.backgroundColor = color.get(defaultButtonHoverBackgroundColor);
    });

    this.$submit.addEventListener("mouseleave", function () {
      this.style.backgroundColor = color.get(defaultButtonBackgroundColor);
    });

    this.$submit.addEventListener("click", function () {
      meatballHistoryItem.$comment.style.minWidth = "unset";
      meatballHistoryItem.$ele.style.width = "auto";
      meatballHistoryItem.$delete.style.marginRight = "15px";
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

        console.log("props:", props);
        ims.sharepoint.list.item.create(
          {
            data: {
              Message: "placeholder",
              Status: "User Generated",
              Title:
                props.list.id + "-" + props.item.id + "-" + props.list.internal,
            },
            listName: "History",
          },
          cb
        );
      } else {
        meatballHistoryItem.setEditable(
          !meatballHistoryItem.getEditable(),
          false
        );
      }
    });

    this.$cancel = document.createElement("div");
    this.$cancel.innerText = "Cancel";
    this.$cancel.setAttribute(
      "style",
      ims.sharepoint.style({
        type: "button",
        size: "",
        bgc: "transparent",
        fc: defaultColor,
      }).$ele
    );
    this.$cancel.style.border = "1px solid " + color.get(23);
    this.$cancel.style.display = "inline-block";

    this.$cancel.style.marginLeft = "267px";
    this.$cancel.style.width = "75px";

    this.$cancel.addEventListener("mouseenter", function () {
      this.style.borderColor = color.get(25);
      this.style.color = color.get(25);
    });

    this.$cancel.addEventListener("mouseleave", function () {
      this.style.border = "1px solid " + color.get(23);
      this.style.color = color.get(defaultColor);
    });

    this.$cancel.addEventListener("click", function () {
      meatballHistoryItem.$comment.style.minWidth = "unset";
      meatballHistoryItem.$comment.style.textAlign = "right";
      meatballHistoryItem.$delete.style.marginRight = "15px";
      meatballHistoryItem.$ele.style.width = "auto";
      meatballHistoryItem.setEditable(false, false, true);
    });

    this.$buttonGroup = document.createElement("div");
    this.$buttonGroup.style.alignContent = "flex-start";
    this.$buttonGroup.style.display = "flex";
    this.$buttonGroup.style.justifyContent = "space-around";
    this.$buttonGroup.style.margin = "0px";
    this.$buttonGroup.style.padding = "0px";
    this.$buttonGroup.style.textAlign = "right";

    this.$author = document.createElement("div");
    this.$author.contentEditable = false;
    this.$author.style.flex = "1";
    this.$author.style.fontSize = "8pt";
    this.$author.style.marginRight = "10px";
    this.$author.style.padding = ".25rem";
    this.$author.style.textAlign = "left";
    this.$buttonGroup.appendChild(this.$author);

    this.$edit = new SVGGenerator({
      color: color.get(6),
      type: "edit",
      size: "small",
    }).wrapper;
    this.$edit.style.cursor = "pointer";
    this.$edit.addEventListener("click", function () {
      meatballHistoryItem.isNew = false;
      meatballHistoryItem.$ele.style.flex = "1";
      if (meatballHistoryItem.$ele.parentNode.isEdit) {
        meatballHistoryItem.$ele.parentNode.isEdit = false;
        meatballHistoryItem.setEditable(!meatballHistoryItem.getEditable());
      }
    });

    this.$buttonGroup.appendChild(this.$edit);

    this.$delete = new SVGGenerator({
      color: color.get(defaultColor),
      type: "delete",
      size: "small",
    }).wrapper;
    this.$delete.style.cursor = "pointer";
    this.$delete.style.marginLeft = "15px";
    this.$delete.style.marginRight = "15px";

    this.$delete.addEventListener("click", function () {
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
          //Need to test but the rest call to check if history exsists doesn';t matter because if you could get this far it does exsist
          // function cb(error) {
          //   if (error) {
          //     console.log(error);
          //     return;
          //   }
          //change pierre -- check to fully remove cb from chat.js
          ims.chat.delete({
            id: meatballHistoryItem.id,
            listName: "History",
          });
          // }
          // rest.find((props: { listName: "History" }), cb);
        }
      }
    });
    this.$buttonGroup.appendChild(this.$delete);

    // this.$ele.appendChild(this.$buttonGroup);

    this.$comment = document.createElement("div");
    this.$comment.contentEditable = false;
    this.$comment.style.display = "inline-block";
    this.$comment.style.fontSize = "9pt";
    this.$comment.style.padding = ".25rem";
    this.$comment.style.verticalAlign = "right";

    this.$comment.addEventListener("focus", function () {
      this.style.outline = "none";
    });

    this.$ele.appendChild(this.$comment);
    this.$ele.appendChild(this.$display);

    return this;
  }

  MeatballHistoryMessage.prototype.setDisplay = function (
    props,
    author,
    date,
    comment,
    id,
    listGUID,
    isFirst
  ) {
    // console.log(props, author, date, comment, id, listGUID, isFirst);
    if (!isFirst) {
      this.$author.parentNode.removeChild(this.$author);
      this.$buttonGroup.style.display = "block";
    }
    if (comment) {
      this.$author.innerText = author;
      this.$comment.innerText = comment.replace(regex, "", comment);
      this.$date.innerText = date;
      this.id = id;
      this.internalColumn = props.internal;
      this.listGUID = listGUID;
      this.prevComment = this.$comment.innerText;
      this.rowIndex = props.iid;
      this.table = props.listId;
    }
    return this;
  };

  MeatballHistoryMessage.prototype.setEditable = function (
    value,
    newData,
    oldComment
  ) {
    if (value) {
      this.$comment.style.backgroundColor = color.get(
        defaultHoverBackgroundColor
      );
      this.$comment.style.minWidth = "-webkit-fill-available";
      this.$comment.style.textAlign = "left";
      this.$delete.style.marginRight = "15px";
      this.$ele.style.backgroundColor = color.get(defaultMHIBackgroundColor);
      this.$ele.style.color = color.get(defaultColor);
      this.$ele.style.flex = "1";
      this.$submit.style.backgroundColor = color.get(
        defaultButtonBackgroundColor
      );

      this.$btnContainer.appendChild(this.$cancel);
      this.$btnContainer.appendChild(this.$submit);
      this.$display.appendChild(this.$btnContainer);
    } else {
      if (!oldComment) {
        var currentText = this.$comment.innerText;
        currentText = currentText.replace(regex, "", currentText);
        this.$comment.innerText = currentText;
        this.prevComment = currentText;
        if (currentText.trim().length === 0) {
          return;
        }
        if (newData && newData.ID) {
          funct;
          ims.sharepoint.list.item.update({
            data: {
              Message: text,
            },
            id: newData.ID,
            listName: "History",
          });
        } else {
          var id = this.id;
          ims.sharepoint.list.item.update({
            data: {
              Message: currentText,
            },
            id: id,
            listName: "History",
          });
        }
      } else {
        this.$comment.innerText = this.prevComment;
      }

      this.$comment.style.color = color.get(defaultColor);
      this.$comment.style.backgroundColor = color.get(
        defaultButtonBackgroundColor
      );
      this.$ele.style.backgroundColor = color.get(defaultButtonBackgroundColor);
      this.$ele.style.color = color.get(defaultColor);

      if (this.$btnContainer.parentNode) {
        this.$display.removeChild(this.$btnContainer);
      }

      if (!this.$ele.parentNode.addNew && this.isNew) {
        this.$ele.parentNode.addNew = true;
        this.isNew = false;
      }
      if (!this.$ele.parentNode.isEdit) {
        this.$ele.parentNode.isEdit = true;
      }
    }
    this.$comment.contentEditable = value;

    return this;
  };

  MeatballHistoryMessage.prototype.getEditable = function () {
    return this.$comment.contentEditable === "true";
  };

  MeatballHistoryMessage.prototype.setType = function (author) {
    if (this.$author.innerText.indexOf(author) > -1) {
      this.$ele.type = "editable";
      this.$ele.style.backgroundColor = color.get(defaultButtonBackgroundColor);
      this.$ele.style.color = color.get(defaultColor);
    } else {
      this.$ele.type = "disabled";
      this.$ele.style.backgroundColor = color.get(defaultMHIBackgroundColor);
      this.$ele.style.color = color.get(defaultColor);
    }
    if (this.$ele.type !== "editable") {
      this.$delete.parentNode.removeChild(this.$delete);
      this.$edit.parentNode.removeChild(this.$edit);
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
    this.$loader = document.createElement("div");
    this.$loader.id = "LoaderCSS";
    this.$loader.style.animation = "spin 2s linear infinite";
    this.$loader.style.border = props.bSize + "px solid " + color.get(26);
    this.$loader.style.borderTop = props.bSize + "px solid " + color.get(27);
    this.$loader.style.borderRadius = props.diameter + "px";
    this.$loader.style.width = props.diameter + "px";
    this.$loader.style.height = props.diameter + "px";

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

  setTimeout(function () {
    start();
  }, 2000);
}
