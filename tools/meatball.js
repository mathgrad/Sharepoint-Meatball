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
    "#CommentBox::-ms-clear{display:none;width:0;height:0;}" +
    "#CommentBox::-ms-reveal{display:none;width:0;height:0;}" +
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
    ";}" +
    "#OptionPanel::-webkit-scrollbar-track{border-radius:10px;background-color:" +
    color.get(defaultBackgroundColor) +
    ";margin-right:5px;}" +
    "#OptionPanel::-webkit-scrollbar{width:12px;background-color:" +
    color.get(defaultBackgroundColor) +
    ";}" +
    "#OptionPanel::-webkit-scrollbar-thumb{border-radius:10px;-webkit-box-shadow:inset 0 0 6px rgba(0,0,0,0.3);background-color: " +
    color.get(24) +
    ";}" +
    "#OptionPanel::-webkit-scrollbar-thumb:hover{background-color: " +
    color.get(4) +
    "}";

  document.getElementsByTagName("head")[0].appendChild(style);

  function start() {
    if (!window.jQuery) {
      alert("Please contact help desk. Script not properly loaded.");
      return;
    }

    //Checks for overrides
    if (window.meatball_override) {
      meatball_override.forEach(function (item) {
        meatballDefaults.set(item);
      });
    }

    //Checks for Field DEBUG
    if (window.meatball_debug) {
      meatballDefaults.setDebug(meatball_debug);
    }

    //Checks for Field Ignore
    if (window.meatball_ignore) {
      meatballDefaults.setIgnore(meatball_ignore);
    }

    //Checks for Field Text
    if (window.meatball_text) {
      meatballDefaults.setText(meatball_text);
    }

    if (historyListGUID.length <= 0) {
      function cb0(error, props0) {
        if (error) {
          return;
        }
        if (props0.hasOwnProperty("Id")) {
          historyListGUID = props0.Id;
          return;
        }
        function cb1(error, props1) {
          if (error) {
            console.log(error);
            return;
          }
          function cb2(error, props2) {
            if (error) {
              console.log(error);
              return;
            }
            function cb3(error, props3) {
              if (error) {
                console.log(error);
                return;
              }
              historyListGUID = props3.Id;
            }
            ims.sharepoint.column.create(
              {
                colTitle: "Status",
                fieldType: 2,
                required: "false",
                uniqueValue: "false",
                listName: "History",
              },

              cb3
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

            cb2
          );
        }
        ims.sharepoint.list.create({ listName: "History" }, cb1);
        console.log(error);
        return;
      }
      ims.sharepoint.list.get({ listName: "History" }, cb0);
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

    window.addEventListener("error", function (e) {
      if (meatballDefaults.getDebug()) {
        console.log(e);
        var errorToast = new Toast();
        errorToast
          .setMessage("Message: " + e.message + "\n File: " + e.filename + "\nLine #: " + e.lineno)
          .setFailed()
          .show();
        kitchen.debug(errorToast);
      }
    });

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
              if (!meatballDefaults.getIgnore(choiceProps.external)) {
                //To check if the row title is already in the choices array
                if (choiceProps.choices.indexOf(rowTitles[ci].innerText) > -1) {
                  choiceProps.rowTitle = false;
                } else {
                  choiceProps.rowTitle = rowTitles[ci].innerText;
                }
                choiceProps.colName = colKey2;
                choiceProps.iid = $cell.iid;
                choiceProps.listId = listId;
                choiceProps.listTitle = listTitle;

                //Step B. Build Meatball with these options.
                var mb = new Meatball(
                  Object.assign(choiceProps, {
                    $el: $cell,
                    showText: meatballDefaults.getText(choiceProps.external),
                  })
                );
                mb.init();
              }
            }
          });
        }
      });
    });
  }

  //Update target's value to user's selected value
  function updateTarget(props) {
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
        if (props.meatball.showText) {
          props.meatball.$circleMessage.innerText = props.cellText;
        } else {
          props.meatball.setColor(props.cellText);
        }

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
    this.showText = props.showText;
  }

  Meatball.prototype.init = function () {
    var meatball = this;
    var triangleSize = 10;
    var meatballHistoryDisplay = new MeatballHistory(this);
    meatballHistoryDisplay.listGUID = historyListGUID;
    var cellText = this.$cell.innerText;

    if (this.showText) {
      this.$circle.className = "ms-qSuggest-hListItem";
      this.$circle.style.position = "relative";
      this.$circle.style.width = "100%";
      this.$circle.style.border = "0px";
      this.$circle.style.borderRadius = "0px";
      this.$circle.style.textAlign = "center";
      this.$circle.style.display = "flex";
      this.$circle.style.flexDirection = "row";
      this.$circle.style.justifyContent = "space-between";
      this.$circle.style.alignItems = "baseline";
      this.$circle.style.padding = ".25rem";
      this.$circle.style.borderRadius = ".25rem";

      this.$circleMessage = document.createElement("div");
      this.$circleMessage.style.padding = "0px";
      this.$circleMessage.style.margin = "0px";
      this.$circleMessage.style.display = "flex";
      this.$circleMessage.style.flexBasis = "1";
      this.$circleMessage.style.alignSelf = "center";
      this.$circleMessage.style.fontWeight = "500";
      this.$circleMessage.innerText = this.$cell.innerText;

      this.$messageSVG = new SVGGenerator({
        color: "black",
        type: "message",
        size: "normal",
      }).wrapper;
      this.$messageSVG.style.padding = "0px";
      this.$messageSVG.style.margin = "0px";
      this.$messageSVG.style.display = "flex";
      this.$messageSVG.style.verticalAlign = "middle";
      this.$messageSVG.style.flexBasis = "1";
      this.$messageSVG.style.alignSelf = "center";
      this.$messageSVG.style.marginLeft = ".5rem";
      var messageSVGPath = this.$messageSVG.firstChild.firstChild.firstChild;

      this.$circle.addEventListener("mouseenter", function () {
        this.style.backgroundColor = color.get(defaultButtonBackgroundColor);
        this.style.color = color.get(defaultColor);
        messageSVGPath.setAttribute("fill", "white");
      });

      this.$circle.addEventListener("mouseleave", function () {
        this.style.backgroundColor = "";
        this.style.color = "";
        messageSVGPath.setAttribute("fill", "black");
      });

      this.$circle.appendChild(this.$circleMessage);
      this.$circle.appendChild(this.$messageSVG);
    } else {
      this.$circle.setAttribute(
        "style",
        ims.sharepoint.style({
          type: "meatball",
          size: "large",
        }).$ele
      );
      this.$circle.style.backgroundColor = color.get(
        meatballDefaults.get(cellText)
      );
    }

    this.$ele = document.createElement("div");
    this.$ele.style.backgroundColor = "transparent";
    this.$ele.style.padding = "10px";
    this.$ele.style.width = "200px";
    this.$ele.style.position = "absolute";

    //Create Popover Element
    this.$popover = document.createElement("div");
    this.$popover.style.borderRadius = ".25rem";
    this.$popover.style.display = "inline-block";
    this.$popover.style.padding = ".5rem";
    this.$popover.style.width = "90%"; //pierre
    this.$popover.style.zIndex = "1";

    //Create Header Element
    this.$header = document.createElement("div");

    this.$header.innerText = this.item.title
      ? this.item.title + ": " + this.list.external
      : this.list.external;
    this.$header.style.marginBottom = ".25rem";
    this.$header.style.padding = ".25rem";
    this.$header.style.textAlign = "center";
    this.$header.style.width = "90%";

    this.$popoverBody = document.createElement("div");
    this.$popoverBody.style.backgroundColor = color.get(defaultBackgroundColor);
    this.$popoverBody.style.boxShadow = "1px 1px 4px 1px rgb(0 0 0 / 0.2)";
    this.$popoverBody.style.color = color.get(defaultColor);
    this.$popoverBody.style.display = "inline-block";
    this.$popoverBody.style.margin = "0px";
    this.$popoverBody.style.padding = "0px";
    this.$popoverBody.style.width = "100%";

    this.$carret = document.createElement("div");
    this.$carret.setAttribute(
      "style",
      ims.sharepoint.style({
        type: "carret",
        size: "",
        bgc: defaultBackgroundColor,
      }).$ele
    );

    //Add Header Element
    this.$popover.appendChild(this.$header);

    //Create Options Panel Object
    this.optionPanel = new OptionPanel(
      Object.assign(this, { cellText: cellText })
    );
    this.optionPanel.create();

    //Add Options Panel
    this.$popover.appendChild(this.optionPanel.$ele);

    this.$popoverDivider = document.createElement("hr");
    this.$popoverDivider.style.borderTop =
      "1pt solid " + color.get(defaultHoverBackgroundColor);
    this.$popoverDivider.style.padding = "0px";
    this.$popoverDivider.style.margin = "0px";
    this.$popoverDivider.style.width = "calc(100% - 1rem)";

    //Add Title
    this.$initHistoryTitle = document.createElement("div");
    this.$initHistoryTitle.innerText = "Latest Message";
    this.$initHistoryTitle.style.textAlign = "center";
    this.$initHistoryTitle.style.width = "90%";

    this.$popover.appendChild(this.$popoverDivider);
    this.$popover.appendChild(this.$initHistoryTitle);

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
    this.$initHistoryContainer.style.width = "calc(90% - .25rem)";

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
        if (data.length) {
          meatballHistoryDisplay.$container.innerHTML = "";
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

        console.log("Josh look: ", organized);

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

            $messageContainer.appendChild($avatarContainer);
            $messageContainer.appendChild($messageBlock);
            meatballHistoryDisplay.$container.appendChild($messageContainer);

            //step 3 append each mssg to mssg block
            return {
              block: $messageBlock,
              messages: block.map(function (data, index2) {
                var message = new MeatballHistoryMessage({ data: data });
                message.buildMessage().buildDate().listeners().append();
                $messageBlock.appendChild(message.$ele);

                return message;
              }),
            };
          }
        });
      }

      ims.chat.getMessages(
        Object.assign(meatball, {
          listName: "History",
          qs: "'&$expand=Author&$top=200",
        }),
        cb
      );

      document.body.appendChild(meatballHistoryDisplay.$ele);
      setTimeout(function () {
        var height = meatballHistoryDisplay.$container.scrollHeight;
        var inc = 0;
        var timerRef = setInterval(function () {
          meatballHistoryDisplay.$container.scrollTop = inc;
          inc += 100;
          if (inc >= height) {
            clearTimeout(timerRef);
          }
        }, 20);
      }, 800);
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
          qs: "'&$expand=Author&$orderby=Created desc&$top=1",
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
      this.$popover.getBoundingClientRect().width +
        this.$circle.getBoundingClientRect().right >
      windowWidth
    ) {
      this.$ele.appendChild(this.$carret);
      this.$carret.style.borderLeft =
        triangleSize + "px solid " + color.get(defaultBackgroundColor);
      this.$carret.style.borderRight = "0px";
      this.$carret.style.left =
        this.$popover.getBoundingClientRect().width + triangleSize + "px";
      this.$ele.style.left =
        this.$circle.getBoundingClientRect().left -
        this.$popover.getBoundingClientRect().width -
        triangleSize -
        12 +
        "px";
      this.$ele.style.width =
        this.$popover.getBoundingClientRect().width + triangleSize + "px";
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
    this.$ele.id = "OptionPanel";
    this.$ele.style.borderRadius = ".25rem";
    this.$ele.style.height = "150px";
    this.$ele.style.padding = ".25rem";
    this.$ele.style.overflowY = "auto";
    this.$ele.style.width = "100%";

    var $ele = this.$ele;
    var parentProps = this.parentProps;

    parentProps.list.choices.forEach(function (choice, index) {
      var $option = document.createElement("div");
      $option.style.borderRadius = ".25rem";
      $option.style.cursor = "pointer";
      $option.style.marginBottom = ".25rem";
      $option.style.padding = ".25rem";
      $option.style.textAlign = "left";
      $option.style.width = "calc(90% - .5rem)";

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

            function (error, data) {
              if (error) {
                alert("Error in the update autoBot:" + JSON.stringify(error));
              }
            }
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
    this.$titleDescription.innerText = props.item.title
      ? props.item.title + ": " + props.list.external
      : props.list.external;
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
    this.$addPanel.style.height = "55px";
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
    this.$footer.style.flex = "1 1 0";
    this.$footer.style.flexDirection = "row";
    this.$footer.style.height = "45px";

    this.$input = document.createElement("input");
    this.$input.id = "CommentBox";
    this.$input.maxLength = "255";
    this.$input.placeholder = "Enter Comment Here";
    this.$input.style.backgroundColor = color.get(defaultHoverBackgroundColor);
    this.$input.style.border = "0px";
    this.$input.style.borderRadius = ".25rem";
    this.$input.style.color = color.get(defaultTitleColor);
    this.$input.style.display = "flex";
    this.$input.style.flex = "1 1 0";
    this.$input.style.fontSize = "9pt";
    this.$input.style.padding = ".25rem .5rem";
    this.$input.style.width = "400px";

    this.$input.addEventListener("keydown", function (e) {
      props.item.message = e.target.value;
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
    this.$newMessageBlock.style.maxWidth = "80%";

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
      data.Author = userName;
      var message = new MeatballHistoryMessage(
        Object.assign(props, { data: data })
      );
      message.buildMessage().buildDate().listeners().append();
      //Step 1. Determine whether to append to existing block or append to new block
      if (lastAuthor === userName) {
        //Step 1a. Find last message block and append to existing
        var $lastBlock = organized[organized.length - 1];

        //Step 1b. Append new message to latest block in screen.
        $lastBlock.block.appendChild(message.$ele);

        //Step 1c. Push new message into memory for later use.
        organized[organized.length - 1].messages.push(message);
        //Step 2. Append new comment to new block. Add to overall display.
      } else {
        //Step 2a. Append message to message block.
        $commentBlock.appendChild(message.$ele);

        //Step 2b. Append avatar container to message container row.
        $commentRow.appendChild($avatar);

        //Step 2c. Append message block to message container row.
        $commentRow.appendChild($commentBlock);

        //Step 2d. Append new comment to chat window
        chatWindow.$container.appendChild($commentRow);

        organized.push({ block: $commentBlock, messages: [message.$ele] });

        lastAuthor = userName;
      }

      //Step 3. Scroll bottom to give appearance of chat window update.
      chatWindow.scrollDown();

      // message.setEditable(message.getEditable());

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
    this.data = props.data;
    return this;
  }

  MeatballHistoryMessage.prototype.append = function () {
    this.$ele = document.createElement("div");
    this.$ele.style.backgroundColor =
      this.data.Author === userName ? color.get(4) : color.get(11);
    this.$ele.style.borderRadius = ".5rem";
    this.$ele.style.margin = "0px;";
    this.$ele.style.marginBottom = ".25rem";
    this.$ele.style.padding = ".25rem";
    this.$ele.style.maxWidth = "90%";

    this.$ele.appendChild(this.$message);
    this.$ele.appendChild(this.$date);

    return this;
  };
  MeatballHistoryMessage.prototype.buildDate = function () {
    this.$date = document.createElement("div");
    this.$date.contentEditable = false;
    this.$date.style.display = "block";
    this.$date.style.fontSize = "6pt";
    this.$date.style.margin = "0px";
    this.$date.style.paddingLeft = ".25rem";
    this.$date.style.textAlign = "left";
    this.$date.style.verticalAlign = "middle";
    this.$date.innerText = generateDateTime(this.data.Created);

    return this;
  };
  MeatballHistoryMessage.prototype.buildMessage = function () {
    this.$message = document.createElement("div");
    this.$message.contentEditable = false;
    this.$message.style.display = "inline-block";
    this.$message.style.fontSize = "9pt";
    this.$message.style.padding = ".25rem";
    this.$message.style.verticalAlign = "right";
    this.$message.innerText = this.data.Message;

    return this;
  };
  MeatballHistoryMessage.prototype.listeners = function () {
    // throw new Error("Test For Issues");
    // this.$message.addEventListener("focus", function () {
    //   this.style.outline = "none";
    // });

    return this;
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

    this.debug = false;
    this.ignore = [];
    this.text = [];
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

  Defaults.prototype.getDebug = function (props) {
    return this.debug;
  };

  Defaults.prototype.setDebug = function (props) {
    this.debug = props;
  };

  Defaults.prototype.getIgnore = function (props) {
    if (this.ignore.length < 1) {
      return false;
    }
    var ignoreFound = false;
    this.ignore.forEach(function (value) {
      if (props.indexOf(value) > -1) {
        ignoreFound = true;
      }
    });
    return ignoreFound;
  };

  Defaults.prototype.setIgnore = function (props) {
    this.ignore = this.ignore.concat(props);
  };

  Defaults.prototype.getText = function (props) {
    if (this.text.length < 1) {
      return false;
    }

    var textFound = false;
    this.text.forEach(function (value) {
      if (compareString(value, props)) {
        textFound = true;
      }
    });
    return textFound;
  };

  Defaults.prototype.setText = function (props) {
    this.text = this.text.concat(props);
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
