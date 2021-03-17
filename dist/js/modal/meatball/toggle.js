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

  this.$container = document.createElement("div");
  this.$container.style = mmtstyle.item;

  this.$label = document.createElement("label");
  this.$label.innerText = "Toggle Meatball";
  this.$label.style = mmtstyle.child;

  this.$container.appendChild(this.$label);

  this.$check = document.createElement("input");
  this.$check.type = "checkbox";
  this.$check.checked = props;
  this.$check.style = mmtstyle.child;

  this.$container.appendChild(this.$check);

  this.$ele.appendChild(this.$container);
}

MeatballMenuToggleContent.prototype.getValue = function () {
  return this.$check.checked;
};

MeatballMenuToggleContent.prototype.setValue = function (props) {
  this.$check.checked = props;
};
