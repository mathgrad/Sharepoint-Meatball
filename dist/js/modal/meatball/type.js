var mmtstyle = {
  content:
    "align-items: center, display: flex, flex-direction: column, flex-wrap: wrap; justify-content: space-between;",
  item:
    "align-items: center; display: flex; flex-direction: row; flex-wrap: wrap; justify-content: space-between;",
  child: "display: flex; flex-shrink: 1; flex-grow: 2; padding: .5rem;",
};

var typeChoices = ["circle", "ignore", "text"];

function MeatballMenuTypeContent() {
  this.$ele = document.createElement("div");
  this.$ele.style = mmtstyle.content;
  this.content = [];
}

MeatballMenuTypeContent.prototype.getValues = function () {
  var returnArray = [];
  this.content.forEach(function (item) {
    returnArray.push(item.getValues());
  });

  return returnArray;
};

//Props is an object key value pairs
//columns ia an array of objects
//  name is the internal name of the column
//  value is a string from the choice array
MeatballMenuTypeContent.prototype.setValues = function (props) {
  var mmic = this;
  props.columns.forEach(function (item) {
    this.temp = new MeatballMenuTypeItem({
      column: item.name,
      value: item.value,
    });
    mmic.content.push(this.temp);
    mmic.$ele.appendChild(this.temp.$ele);
  });
};

MeatballMenuTypeContent.prototype.updateValues = function () {
  var formatColumns = [];

  ims.defaults.tools.meatball.defaults.forEach(function (d) {
    formatColumns.push({
      name: d.external,
      internal: d.internal,
      value: d.type || "circle",
    });
  });

  if (formatColumns.length == 0) return;
  this.$ele.innerText = "";
  this.setValues({ columns: formatColumns });
};

function MeatballMenuTypeItem(props) {
  this.$ele = document.createElement("div");
  this.$ele.style = mmtstyle.item;

  this.$column = document.createElement("div");
  this.$column.style = mmtstyle.child;
  this.$column.innerText = props.column;

  this.$ele.appendChild(this.$column);

  this.$select = document.createElement("select");
  this.$select.name = "type";
  this.$select.style.border = "0px";
  this.$select.style.fontSize = "14pt";
  this.$select.style.padding = ".5rem";
  this.$select.style.minWidth = "50px";
  this.$select.style.maxWidth = "200px";
  this.$select.style.cursor = "pointer";
  this.$select.value = props.value;
  var $select = this.$select;

  typeChoices.forEach(function (item) {
    this.$option = document.createElement("option");
    this.$option.innerText = item;
    // this.$option.style = mmtstyle.child;
    this.$option.value = item;

    if (this.$option.value === props.value) {
      this.$option.setAttribute("selected", "select");
    }

    $select.appendChild(this.$option);
  });

  this.$ele.appendChild(this.$select);
}

MeatballMenuTypeItem.prototype.getValues = function () {
  return { column: this.$column.innerText, value: this.$select.value };
};

MeatballMenuTypeItem.prototype.setValues = function (props) {
  this.$column.innerText = props.column;
  this.$input.checked = props.value;
};
