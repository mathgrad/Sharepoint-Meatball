//Styles
var styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.textContent =
  ".menuItem{background-color: #ddd; border-radius: .25rem; color: #222; display: flex; flex-basis: 1 2; padding: .25rem;}" +
  ".menuItem:hover{background-color:#222; color:#ddd; cursor: pointer;}";
document.getElementsByTagName("head")[0].appendChild(styleSheet);

var MenuStyle = {
  button:
    "background-size: cover; cursor: pointer; height: 48px; left: calc(95vw - 48px); padding: .25rem; position: fixed; top: calc(95vh - 48px); width: 48px;",
  menu:
    "align-items: center; background-color: #ddd; border: .25rem solid #000; border-radius: 1.5rem; bottom: calc(48px + 1.5rem); cursor: default; display: flex; flex-direction: column; height: 200px; justify-content: flex-start; overflow: hidden auto; padding: .25rem; position: absolute; right: 0px; width: 150px;",
  menuHeader:
    "background-color: #ddd; border-radius: .25rem; color: #222; display: flex; flex-basis: 1 2; padding: .25rem;",
};

function Menu() {
  var menuSelf = this;
  this.children = [];
  this.$ele = document.createElement("div");
  this.$ele.style = MenuStyle.button;
  this.$ele.style.backgroundImage =
    "url(" +
    ims.defaults.absoluteUrl +
    "/SiteAssets/ims/dist/media/imo-logo-48.png)";

  this.$menu = document.createElement("div");
  this.$menu.style = MenuStyle.menu;
  this.$menu.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  this.$ele.addEventListener("click", function (e) {
    if ([].slice.call(this.childNodes).indexOf(menuSelf.$menu) > -1) {
      menuSelf.children.forEach(function (item) {
        if (item.subMenuOn) item.toggleSubMenu();
      });
      this.removeChild(menuSelf.$menu);
    } else {
      this.appendChild(menuSelf.$menu);
    }
  });
}

//Adds new menu item to the main menu
//Props is an object with key value pairs
//$ele is a document element, plus any eventlistener
//child is an object to be added to an array for removing children
Menu.prototype.addMenuItem = function (props) {
  this.children.push(props.child);
  this.$menu.appendChild(props.$ele);
};

Menu.prototype.init = function () {
  document.body.appendChild(this.$ele);
};

Menu.prototype.removeAll = function () {
  this.$menu.childNodes.forEach(function (child, index) {
    console.log(index, " ", typeof child, "\n", child);
    if (index > 0) {
      child.parentNode.removeChild(child);
    }
  });
};

//Removes a menu item to the main menu
//Props requires the child element
Menu.prototype.removeMenuItem = function (props) {
  this.$menu.removeChild(props);
};

//Props is text of item
function MenuItem(props) {
  this.$ele = document.createElement("div");
  this.$ele.className += "menuItem";
  this.$ele.innerText = props;
  this.subMenuOn = false;
}

//Props is an object of key value pairs
//title is a string
//bottom, left, right, top
//menuItems is an array of customizationItems
MenuItem.prototype.addSubMenu = function (props) {
  var MenuItemSelf = this;

  if (props) {
    this.$subMenu = document.createElement("div");
    this.$subMenu.style = MenuStyle.menu;
    this.$subMenu.style.position = "fixed";

    if (props.bottom) this.$subMenu.style.bottom = props.bottom;
    if (props.left) this.$subMenu.style.left = props.left;
    if (props.right) this.$subMenu.style.right = props.right;
    if (props.top) this.$subMenu.style.top = props.top;

    this.$subMenuTitle = document.createElement("div");
    this.$subMenuTitle.style = MenuStyle.menuHeader;
    this.$subMenuTitle.innerText = props.title;

    this.$subMenu.appendChild(this.$subMenuTitle);

    props.menuItems.forEach(function (item) {
      MenuItemSelf.$subMenu.appendChild(item);
    });

    this.$ele.addEventListener("click", function (e) {
      if (MenuItemSelf.$subMenu.parentNode) {
        MenuItemSelf.subMenuOn = false;
        MenuItemSelf.$subMenu.parentNode.removeChild(MenuItemSelf.$subMenu);
      } else {
        MenuItemSelf.subMenuOn = true;
        document.body.appendChild(MenuItemSelf.$subMenu);
      }
    });
  }
};

//Props is an object
//modal is the template element
//content is the props object to be injected into the Modal
MenuItem.prototype.addModal = function (props) {
  this.$ele.addEventListener("click", function (e) {
    props.modal.setContent(props.content);
    document.body.appendChild(props.modal.$ele);
  });
};

MenuItem.prototype.toggleSubMenu = function () {
  if (this.subMenuOn)
    if (this.$subMenu.parentNode) {
      this.subMenuOn = false;
      this.$subMenu.parentNode.removeChild(this.$subMenu);
    } else {
      this.subMenuOn = true;
      document.body.appendChild(this.$subMenu);
    }
};
