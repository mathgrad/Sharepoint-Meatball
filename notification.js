//Requires svg.js
//z-index of 202 required due to odd object in Sharepoint with a z-index of 200
function notificationStyle(props) {
  switch (props) {
    case "pMain": {
      return "background-color: transparent; width: 250px; position: fixed; top: 75px; right: 40px; display: flex; flex-direction: column; z-index: 1;";
    }
    case "tMain": {
      return "background-color: #f0f0f0; color: #222222; width: 275px; height: 50px; margin-top: 5px; padding: 0.5rem; border-radius: 0px; box-shadow: 0px 1px 1px rgba(0,0,0,0.1); display: flex; -ms-flex: 1 0 1; z-index: 202;";
    }
    case "textContainer": {
      return "padding-left: 10px; position: relative; display: flex; flex-direction: column; justify-content: center;";
    }
    case "toastClose": {
      //display: flex; flex-direction: column;
      return "font-size: 10.5pt; width: 14px; height: 14px; position: absolute; top: 0px; right: 0px; justify-content: center; cursor: pointer;";
    }
    case "loaderMain": {
      return "width: 25px; height: 25px; border-radius: 25px; border: 5px solid #f3f3f3; border-top: 5px solid #3498db; animation: spin 2s linear infinite;";
    }
  }
}

var pantryId = "_NOTIFICATION_PARENT";

function Pantry() {
  if (document.getElementById(pantryId)) {
    this.$ele = document.getElementById(pantryId);
  } else {
    this.$ele = document.createElement("div");
    this.$ele.setAttribute("style", notificationStyle("pMain"));
    this.$ele.id = pantryId;
    document.body.appendChild(this.$ele);
  }
  return this;
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
  this.toast.setAttribute("style", notificationStyle("tMain"));

  this.text = document.createElement("div");
  this.text.setAttribute("style", notificationStyle("textContainer"));
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
  this.close.setAttribute("style", notificationStyle("toastClose"));

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
  this.svg = new LoaderCSS().loader;
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

function LoaderCSS() {
  this.loader = document.createElement("div");
  this.loader.id = "LoaderCSS " + generateId();
  this.loader.setAttribute("style", notificationStyle("loaderMain"));
  return this;
}

function generateId() {
  return Math.floor(Math.random() * 1000);
}
