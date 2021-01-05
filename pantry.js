//Controller for the Toast Object
if (errorCheck()) {
  throw new Error("Failed to Make Script");
}

function Pantry() {
  this.$ele = document.createElement("div");
  this.$ele.style.width = "250px";
  this.$ele.style.right = "40px";
  this.$ele.style.display = "flex";
  this.$ele.style.flexDirection = "column";
  this.$ele.style.zIndex = "1";
  this.$ele.style.top = "75px";
  this.$ele.style.position = "fixed";
  this.$ele.style.backgroundColor = "transparent";
  document.body.appendChild(this.$ele);
}

Pantry.prototype.show = function (notification) {
  var note = notification;
  this.$ele.appendChild(notification.toast);
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
  this.$ele.appendChild(toast.toast);
};

//Notification object with ability to display messages, and images
function Toast() {
  this.toast = document.createElement("div");
  this.toast.id = generateId();
  this.toast.style.backgroundColor = "white";
  this.toast.style.borderRadius = "0";
  this.toast.style.boxShadow = "0px 1px 1px rgba(0,0,0,0.1)";
  this.toast.style.color = "black";
  this.toast.style.display = "flex";
  this.toast.style.marginTop = "5px";
  this.toast.style["-ms-flex"] = "1 0 1";
  this.toast.style.height = "50px";
  this.toast.style.padding = "0.5rem";
  this.toast.style.width = "275px";
  this.toast.style.zIndex = "202";
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
  var self = this.toast;
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
  this.toast.appendChild(this.svg);
  this.toast.appendChild(this.text);
  return this;
};

Toast.prototype.removeToast = function () {
  if (this.toast) {
    if (this.toast.parentNode) {
      this.toast.parentNode.removeChild(this.toast);
      clearTimeout(this.timer);
    }
  }
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

function errorCheck() {
  var scripts = [].slice.call(document.getElementsByTagName("script"));

  var svgGenerator = scripts.filter(function (script) {
    if (script.src.indexOf("svgGenerator") > -1) {
      return script;
    } else {
      return;
    }
  });

  var pantry = scripts.filter(function (script) {
    if (script.src.indexOf("pantry") > -1) {
      return script.src;
    } else {
      return;
    }
  });
  pantry = pantry[0].src;

  if (svgGenerator.length == 0) {
    try {
      loadScript(
        pantry.substring(0, pantry.indexOf("pantry")) + "pantry.js",
        null
      );
    } catch (error) {
      throw new Error(error);
      console.log(error);
      return true;
    }
  }

  return false;
}

function loadScript(url, callback) {
  var head = document.head;
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = url;

  if (callback) {
    script.addEventListener("readystatechange", callback);
    script.addEventListener("load", callback);
  }
  head.appendChild(script);
}
