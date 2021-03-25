function easyStart() {
  var listName = "ims-sharepoint";
  var styleSheet = document.createElement("style");
  var originalItem = { id: null, etag: null };
  styleSheet.type = "text/css";
  styleSheet.textContent =
    ".MenuButton{background-color: #1890ff; border: 0px; border-radius: .25rem; color: #ddd; cursor: pointer; font-weight: bold; padding: .25rem;}" +
    ".MenuButton:hover{background-color: #ddd; color: #1890ff}";
  document.getElementsByTagName("head")[0].appendChild(styleSheet);
  //Styles
  var meatballCustomizationMenuStyle =
    "align-items: center; background-color: #ddd; border: .25rem solid #000; border-radius: 1.5rem; bottom: 104px; color: #222; display: flex; flex-direction: column; height: 200px; justify-content: space-between: overflow: hidden auto; padding: .25rem; position: fixed; right: calc(155px + 5.5vw); width: 150px;";

  function updateOverrides() {
    function cbObject(error, props) {
      if (error) {
        console.error("Update Override error:\n", error);
        return;
      }

      if (props) {
        return;
      }
    }

    ims.defaults.tools.meatball.hide;

    this.update = {
      data: ims.defaults.tools.meatball,
      colName: "Overrides",
      // etag: ims.defaults.etag,
      etag: "*",
      id: ims.defaults.listGUID,
      listName: listName,
    };

    ims.sharepoint.list.item.update(this.update, cbObject);
  }

  var start = new Menu();
  var meatballItem = new MenuItem("Meatball");
  var modal = new Modal();
  var meatballSubMenu = {};
  meatballSubMenu.title = "Meatball";
  meatballSubMenu.bottom = "calc(80px + 1.5rem)";
  meatballSubMenu.right = "calc(200px + 2vw)";
  meatballSubMenu.title = "Customize";
  meatballSubMenu.menuItems = [];

  //Creates the Color Value Menu Item
  function CVM() {
    this.cvMI = new MenuItem("Color and Value");
    this.cvMIContent = {
      title: "Color and Value Customization",
      body: [],
      footer: [],
    };

    this.cvMIBody = new MeatballMenuColorSelector({
      columns: [],
    });
    var mmcs = this.cvMIBody;

    this.cvMIContent.body.push(this.cvMIBody.$ele);
    this.cvSubmit = document.createElement("button");
    this.cvSubmit.innerText = "Submit";
    this.cvSubmit.className += "MenuButton";
    this.cvSubmit.addEventListener("click", function (e) {
      e.stopPropagation();

      var mmcsNV = mmcs.getValues().columns;
      ims.defaults.tools.meatball.defaults.forEach(function (d, i) {
        if (compareString(d.external, mmcsNV[i].name))
          d.color = mmcsNV[i].values;
      });
      updateOverrides();
      this.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.removeChild(
        this.parentNode.parentNode.parentNode.parentNode.parentNode
      );
    });

    this.cvMIContent.footer.push(this.cvSubmit);

    this.cvMI.addModal({ modal: modal, content: this.cvMIContent });

    this.cvMI.$ele.addEventListener("click", function () {
      mmcs.updateChoices();
    });
    return this.cvMI.$ele;
  }

  meatballSubMenu.menuItems.push(new CVM());

  function CTypeM() {
    this.cvMI = new MenuItem("Meatball Type");
    this.cvMIContent = {
      title: "Set Type",
      body: [],
      footer: [],
    };

    this.cvMIBody = new MeatballMenuTypeContent();
    var cvmibody = this.cvMIBody;
    var columns = [];

    ims.defaults.tools.meatball.defaults.forEach(function (d) {
      columns.push({ name: d.external, value: d.type });
    });
    this.cvMIBody.setValues({ columns: columns });
    this.cvMIContent.body.push(this.cvMIBody.$ele);
    this.cvSubmit = document.createElement("button");
    this.cvSubmit.innerText = "Submit";
    this.cvSubmit.className += "MenuButton";
    this.cvSubmit.addEventListener("click", function (e) {
      e.stopPropagation();
      var cvMIBodyNV = cvmibody.getValues();
      ims.defaults.tools.meatball.defaults.forEach(function (d, i) {
        if (compareString(d.external, cvMIBodyNV[i].column))
          d.type = cvMIBodyNV[i].value;
      });
      updateOverrides();
      this.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.removeChild(
        this.parentNode.parentNode.parentNode.parentNode.parentNode
      );
    });

    this.cvMIContent.footer.push(this.cvSubmit);

    this.cvMI.addModal({ modal: modal, content: this.cvMIContent });

    this.cvMI.$ele.addEventListener("click", function () {
      cvmibody.updateValues();
    });

    return this.cvMI.$ele;
  }

  meatballSubMenu.menuItems.push(new CTypeM());

  function CTM() {
    this.cvMI = new MenuItem("Toggle Meatball");
    this.cvMIContent = {
      title: "Toggle Meatball",
      body: [],
      footer: [],
    };

    this.cvMIBody = new MeatballMenuToggleContent(
      ims.defaults.tools.meatball.hide
    );
    var cvmibody = this.cvMIBody;
    this.cvMIContent.body.push(this.cvMIBody.$ele);
    this.cvSubmit = document.createElement("button");
    this.cvSubmit.innerText = "Submit";
    this.cvSubmit.className += "MenuButton";
    this.cvSubmit.addEventListener("click", function (e) {
      e.stopPropagation();
      ims.defaults.tools.meatball.hide = cvmibody.getValue();
      updateOverrides();
      this.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.removeChild(
        this.parentNode.parentNode.parentNode.parentNode.parentNode
      );
    });

    this.cvSubmit.addEventListener("click", function () {
      cvmibody.updateValue();
    });

    this.cvMIContent.footer.push(this.cvSubmit);

    this.cvMI.addModal({ modal: modal, content: this.cvMIContent });
    return this.cvMI.$ele;
  }

  meatballSubMenu.menuItems.push(new CTM());

  meatballItem.addSubMenu(meatballSubMenu);

  start.addMenuItem({ child: meatballItem, $ele: meatballItem.$ele });
  start.init();
}
