var mmccstyle = {
  content:
    "align-items: center, display: flex, flex-direction: column, flex-wrap: wrap; justify-content: space-between;",
  item:
    "align-items: center; display: flex; flex-direction: row; flex-wrap: wrap; justify-content: space-between; margin: 5px 0px;",
  child: "display: flex; flex-shrink: 1; flex-grow: 2; padding: .5rem;",
  circle:
    "border-radius: 100%; height: 15px; margin: .25rem auto; padding: .5rem; width: 15px;",
};

var colorChoices = [
  { color: "blue", value: "#0075ff" },
  { color: "green", value: "#27e833" },
  { color: "orange", value: "#f96816" },
  { color: "purple", value: "#8e24aa" },
  { color: "red", value: "#d71010" },
  { color: "yellow", value: "#f6de1c" },
];

//props is an object of key values
//columns is an array of objects
//  name is the internal name of the column
//  values is an array of objects
//    text is a string
//    color is a string
function MeatballMenuColorSelector(props) {
  var mmcs = this;
  this.$ele = document.createElement("div");
  this.mmcc = new MeatballMenuColorContent();
  var mmcc = this.mmcc;
  mmcc.setValues({ values: props.columns[0].values });

  this.$content = document.createElement("div");
  this.$content.appendChild(mmcc.$ele);
  var $content = this.$content;

  this.content = props;
  var content = this.content;

  this.$select = document.createElement("select");
  this.$select.style = mmccstyle.content;
  this.$select.name = "content";
  this.$select.value = "page";
  var $select = this.$select;

  props.columns.forEach(function (item) {
    this.$option = document.createElement("option");
    this.$option.innerText = item.name;
    this.$option.value = item.name;
    $select.appendChild(this.$option);
  });

  this.$select.addEventListener("click", function () {
    mmcs.updateCurrent();
  });

  this.$select.addEventListener("change", function () {
    var tt = this;
    content.columns.forEach(function (column, index) {
      if (column.name === tt.value) {
        $content.innerText = "";
        mmcc = new MeatballMenuColorContent();
        mmcc.setValues({ values: column.values });
        mmcs.mmcc = mmcc;
      }
    });
    $content.appendChild(mmcc.$ele);
  });

  this.$ele.appendChild(this.$select);
  this.$ele.appendChild(this.$content);
}

MeatballMenuColorSelector.prototype.getValues = function () {
  this.updateCurrent();
  return this.content;
};

MeatballMenuColorSelector.prototype.setValues = function (props) {};

MeatballMenuColorSelector.prototype.updateCurrent = function () {
  var sv = this.$select.value;
  var mmcc = this.mmcc;
  this.content.columns.forEach(function (item, index) {
    if (item.name === sv) {
      item.values = mmcc.getValues();
    }
  });
};

function MeatballMenuColorContent() {
  this.$ele = document.createElement("div");
  this.$ele.style = mmccstyle.content;
  this.content = [];
}

MeatballMenuColorContent.prototype.getValues = function () {
  var returnArray = [];
  this.content.forEach(function (item) {
    if (item.on) returnArray.push(item.getValues());
  });
  return returnArray;
};

//Props is an object key value pairs
//values is an array of objects
//  text: column's text
//  value: column's color
MeatballMenuColorContent.prototype.setValues = function (props) {
  var mmcc = this;
  props.values.forEach(function (item) {
    this.temp = new MeatballMenuColorItem({
      text: item.text,
      value: item.value,
    });
    mmcc.content.push(this.temp);
    mmcc.$ele.appendChild(this.temp.$ele);
  });
  this.$add = document.createElement("div");
  this.$add.className += "remove";
  this.$add.innerText = "Add";
  this.$add.style.cursor = "pointer";
  this.$add.style.textAlign = "center";

  this.$add.addEventListener("click", function () {
    this.temp = new MeatballMenuColorItem({ text: "", value: "blue" });
    mmcc.content.push(this.temp);
    mmcc.$ele.insertBefore(this.temp.$ele, this);
  });
  mmcc.$ele.appendChild(this.$add);
};

//Props is an object key value pairs
//text is the column text
//value is the color value
function MeatballMenuColorItem(props) {
  this.on = true;
  var mmci = this;
  this.$ele = document.createElement("div");
  this.$ele.style = mmccstyle.item;

  this.$input = document.createElement("input");
  this.$input.type = "text";
  this.$input.style = mmccstyle.child;
  this.$input.style.border = "0px";
  this.$input.value = props.text;

  this.$ele.appendChild(this.$input);

  this.$select = document.createElement("select");
  this.$select.name = "color";
  this.$select.style.minWidth = "50px";
  this.$select.style.width = "5vw";
  this.$select.style.maxWidth = "200px";
  this.$select.style.border = "0px";
  this.$select.style.padding = ".5rem";
  this.$select.value = props.value;
  var $select = this.$select;

  colorChoices.forEach(function (item) {
    this.$option = document.createElement("option");
    this.$option.value = item.color;

    if (this.$option.value === props.value) {
      this.$option.setAttribute("selected", "select");
      $select.style.backgroundColor = item.value;
    }

    this.$option.style.backgroundColor = item.value;
    this.$option.style.color = "#222";

    $select.appendChild(this.$option);
  });

  this.$select.addEventListener("change", function () {
    var tt = this;
    colorChoices.forEach(function (item) {
      if (tt.value === item.color) tt.style.backgroundColor = item.value;
    });
  });

  this.$ele.appendChild(this.$select);

  this.$remove = document.createElement("div");
  this.$remove.innerText = "X";
  this.$remove.className += "remove";
  this.$remove.style = mmccstyle.child;
  this.$remove.style.cursor = "pointer";

  this.$remove.addEventListener("click", function () {
    mmci.on = false;
    this.parentNode.parentNode.removeChild(this.parentNode);
  });

  this.$ele.appendChild(this.$remove);
}

MeatballMenuColorItem.prototype.getValues = function () {
  return { text: this.$input.value, value: this.$select.value };
};

MeatballMenuColorItem.prototype.setValues = function (props) {
  this.$input.value = props.text;
  this.$select.value = props.value;
};
