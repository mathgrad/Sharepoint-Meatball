var mmtstyle = {
  content:
    "align-items: center, display: flex, flex-direction: column, flex-wrap: wrap; justify-content: space-between;",
  item:
    "align-items: center; display: flex; flex-direction: row; flex-wrap: wrap; justify-content: space-between;",
  child: "display: flex; flex-shrink: 1; flex-grow: 2; padding: .5rem;",
};

function MeatballMenuToggleContent(props) {
  this.$ele = document.createElement("div");
  this.$ele.style = mmtstyle.content;

  this.$containerToggle = document.createElement("div");
  this.$containerToggle.style = mmtstyle.item;

  this.$labelToggle = document.createElement("label");
  this.$labelToggle.innerText = "Toggle Meatball";
  this.$labelToggle.style = mmtstyle.child;

  this.$containerToggle.appendChild(this.$labelToggle);

  this.$checkToggle = document.createElement("input");
  this.$checkToggle.type = "checkbox";
  this.$checkToggle.checked = props;
  this.$checkToggle.style = mmtstyle.child;

  this.$containerToggle.appendChild(this.$checkToggle);

  this.$containerDebug = document.createElement("div");
  this.$containerDebug.style = mmtstyle.item;

  this.$labelDebug = document.createElement("label");
  this.$labelDebug.innerText = "Debug Meatball";
  this.$labelDebug.style = mmtstyle.child;

  this.$containerDebug.appendChild(this.$labelDebug);

  this.$checkDebug = document.createElement("input");
  this.$checkDebug.type = "checkbox";
  this.$checkDebug.checked = false;
  this.$checkDebug.style = mmtstyle.child;

  this.$containerDebug.appendChild(this.$checkDebug);

  this.$ele.appendChild(this.$containerToggle);
  this.$ele.appendChild(this.$containerDebug);
}

MeatballMenuToggleContent.prototype.getValue = function () {
  return { toggle: this.$checkToggle.checked, debug: this.$checkDebug.checked };
};

MeatballMenuToggleContent.prototype.setValue = function (props) {
  this.$checkToggle.checked = props;
};

MeatballMenuToggleContent.prototype.updateValue = function () {
  this.$checkToggle.checked = ims.defaults.tools.meatball.hide;
  this.$checkDebug.checked = ims.defaults.tools.meatball.debug;
};
