var mmccstyle = {
  content:
    "align-items: center, display: flex, flex-direction: column, flex-wrap: wrap; justify-content: space-between;",
  item:
    "align-items: center; display: flex; flex-direction: row; flex-wrap: wrap; justify-content: space-between; margin: 5px 0px;",
  child: "display: flex; flex-shrink: 1; flex-grow: 2; padding: .5rem;",
  circle:
    "border-radius: 100%; height: 15px; margin: .25rem auto; padding: .5rem; width: 15px;",
};

var colorDefaults = [
  { text: "Up", color: "green" },
  { text: "Down", color: "red" },
  { text: "Degraded", color: "yellow" },
  { text: "NA", color: "blue" },
  { text: "100-90", color: "green" },
  { text: "89-79", color: "yellow" },
  { text: "79-10", color: "red" },
  { text: "<79", color: "red" },
  { text: "<10", color: "blue" },
];

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
  if (props.columns.length > 0)
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

MeatballMenuColorSelector.prototype.updateChoices = function () {
  var formatColumns = [];

  ims.defaults.tools.meatball.defaults.forEach(function (d) {
    var cn = { name: d.external };
    var v = [];
    d.color.forEach(function (choice) {
      v.push({ text: choice.text, value: choice.value });
    });
    cn.values = v;
    formatColumns.push(cn);
  });

  if (formatColumns.length == 0) return;

  this.content.columns = formatColumns;

  this.$select.innerText = "";
  var $select = this.$select;

  formatColumns.forEach(function (column) {
    this.$option = document.createElement("option");
    this.$option.innerText = column.name;
    this.$option.value = column.name;
    $select.appendChild(this.$option);
  });

  this.mmcc.setValues({ values: formatColumns[0].values });
};

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
    if (item.value.length == 0) {
      colorDefaults.forEach(function (d) {
        if (compareString(item.text, d.text)) {
          item.value = d.color;
        }
      });
    }
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

  this.$text = document.createElement("div");
  this.$text.type = "text";
  this.$text.style = mmccstyle.child;
  this.$text.style.border = "0px";
  this.$text.style.width = "50%";
  this.$text.style.wordWrap = "break-word";
  this.$text.innerText = props.text;

  this.$ele.appendChild(this.$text);

  this.$select = document.createElement("select");
  this.$select.name = "color";
  this.$select.style.minWidth = "50px";
  this.$select.style.width = "30%";
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
  return { text: this.$text.innerText, value: this.$select.value };
};

MeatballMenuColorItem.prototype.setValues = function (props) {
  this.$text.innerText = props.text;
  this.$select.value = props.value;
};

function compareString(s0, s1) {
  s0 = s0.toLowerCase();
  s1 = s1.toLowerCase();

  return ~s0.indexOf(s1) < 0 && ~s1.indexOf(s0) < 0;
}
