var mmdcstyle = {
  content:
    "align-items: center, display: flex, flex-direction: column, flex-wrap: wrap; justify-content: space-between;",
  item:
    "align-items: center; display: flex; flex-direction: row; flex-wrap: wrap; justify-content: space-between; margin: 5px 0px;",
  child: "display: flex; flex-shrink: 1; flex-grow: 2; padding: .5rem;",
};

function MeatballMenuDeleteContent() {
  var mmdc = this;
  this.$ele = document.createElement("div");
  this.$ele.style = mmdcstyle.content;

  this.items = [];

  ims.defaults.tools.meatball.defaults.forEach(function (d) {
    this.item = new MeatballMenuDeleteItem(d.external);
    mmdc.items.push(this.item);
    mmdc.$ele.appendChild(this.item.$ele);
  });
}

MeatballMenuDeleteContent.prototype.getValues = function () {
  var results = [];
  this.items.forEach(function (item) {
    if (item.getValues().delete) results.push(item.getValues().name);
  });
  return results;
};

MeatballMenuDeleteContent.prototype.updateValues = function () {
  var mmdc = this;
  this.$ele.innerText = "";
  this.items = [];

  ims.defaults.tools.meatball.defaults.forEach(function (d) {
    this.item = new MeatballMenuDeleteItem(d.external);
    mmdc.items.push(this.item);
    mmdc.$ele.appendChild(this.item.$ele);
  });
};

function MeatballMenuDeleteItem(props) {
  this.$ele = document.createElement("div");
  this.$ele.style = mmdcstyle.item;

  this.$label = document.createElement("div");
  this.$label.innerText = props;
  this.$label.style = mmdcstyle.child;

  this.$ele.appendChild(this.$label);

  this.$input = document.createElement("input");
  this.$input.type = "checkbox";

  this.$ele.appendChild(this.$input);
}

MeatballMenuDeleteItem.prototype.getValues = function () {
  return { name: this.$label.innerText, delete: this.$input.checked };
};
