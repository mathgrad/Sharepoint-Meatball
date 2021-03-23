function easyStart() {
  var styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.textContent =
    ".MenuButton{background-color: #1890ff; border: 0px; border-radius: .25rem; color: #ddd; cursor: pointer; font-weight: bold; padding: .25rem;}" +
    ".MenuButton:hover{background-color: #ddd; color: #1890ff}";
  document.getElementsByTagName("head")[0].appendChild(styleSheet);
  //Styles
  var meatballCustomizationMenuStyle =
    "align-items: center; background-color: #ddd; border: .25rem solid #000; border-radius: 1.5rem; bottom: 104px; color: #222; display: flex; flex-direction: column; height: 200px; justify-content: space-between: overflow: hidden auto; padding: .25rem; position: fixed; right: calc(155px + 5.5vw); width: 150px;";

  function cbObject(error, props) {
    if (error) {
      console.error(error);
    }

    if (props) {
      console.log(props);
    }
  }

  function cbCreate(error, props) {
    if (error) {
      console.error(error.message);
    }
    if (props) {
      console.log(props);
    }

    this.create = {
      data: {
        Message: "Test",
        Overrides: JSON.stringify(ims.defaults.tools.meatball.defaults),
        Title: _spPageContextInfo.webServerRelativeUrl,
        Status: "Override",
      },
      listName: "IMS_SHAREPOINT",
    };

    ims.sharepoint.list.item.create(this.create, cbObject);
  }

  ims.sharepoint.list.get({ listName: "IMS_SHAREPOINT" }, cbCreate);


  var cv = {
    main:
      "align-item: center; display: flex; flex-direction: row; flex-wrap: wrap; justify-content: space-between;",
    child:
      "display: flex; flex-shrink: 1; flex-grow: 2; line-height: 1.5rem; padding: .25rem;",
    circle:
      "border-radius: 100%; height: 15px; margin: .25rem auto; padding: .25rem; width: 15px;",
  };

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
      mmcs.updateCurrent();
      console.log(mmcs.getValues());
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
    this.cvMIBody.setValues({
      columns: [
        {
          name: "Text",
          value: "circle",
        },
        { name: "Test", value: "ignore" },
        { name: "Hi", value: "text" },
      ],
    });
    this.cvMIContent.body.push(this.cvMIBody.$ele);
    this.cvSubmit = document.createElement("button");
    this.cvSubmit.innerText = "Submit";
    this.cvSubmit.className += "MenuButton";
    this.cvSubmit.addEventListener("click", function (e) {
      e.stopPropagation();
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

    this.cvMIBody = new MeatballMenuToggleContent(true);
    this.cvMIContent.body.push(this.cvMIBody.$ele);
    this.cvSubmit = document.createElement("button");
    this.cvSubmit.innerText = "Submit";
    this.cvSubmit.className += "MenuButton";
    this.cvSubmit.addEventListener("click", function (e) {
      e.stopPropagation();
      this.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.removeChild(
        this.parentNode.parentNode.parentNode.parentNode.parentNode
      );
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
