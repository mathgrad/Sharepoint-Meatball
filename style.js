(function () {
  function style(props) {
    this.$ele = "";
    switch (props.type) {
      case "avatar":
        switch (props.size) {
          case "small":
            break;
          case "normal":
            break;
          case "large":
            break;
          default:
            break;
        }
        return this;
      case "button":
        switch (props.size) {
          case "small":
            break;
          case "normal":
            this.$ele +=
              "border-radius: .25rem; padding: .25rem; margin: 0px .5rem .5rem .5rem; text-align: center; display: block; cursor: pointer: font-weight: 500; background-color: " +
              color(props.bgc) +
              "; color: " +
              color(props.fc) +
              ";";
            break;
          case "large":
            break;
          default:
            break;
        }
        return this;
      case "carret":
        switch (props.size) {
          case "small":
            this.$ele +=
              "margin: 0px; display: inline-block; position:absolute; height: 0px; width: 0px; left: 2px; top: 14px; border-top: 5px solid transparent; border-bottom: 5px solid transparent; border-right: 5px solid " +
              color(props.bgc) +
              ";";
            break;
          case "normal":
            this.$ele +=
              "margin: 0px; display: inline-block; position:absolute; height: 0px; width: 0px; left: 2px; top: 29px; border-top: 10px solid transparent; border-bottom: 10px solid transparent; border-right: 10px solid " +
              color(props.bgc) +
              ";";
            break;
          case "large":
            this.$ele +=
              "margin: 0px; display: inline-block; position:absolute; height: 0px; width: 0px; left: 2px; top: 44px; border-top: 15px solid transparent; border-bottom: 15px solid transparent; border-right: 15px solid " +
              color(props.bgc) +
              ";";
            break;
          default:
            this.$ele +=
              "margin: 0px; display: inline-block; position:absolute; height: 0px; width: 0px; left: 2px; top: 29px; border-top: 10px solid transparent; border-bottom: 10px solid transparent; border-right: 10px solid " +
              color(props.bgc) +
              ";";
            break;
        }
        return this;
      case "container":
        switch (props.size) {
          case "small":
            break;
          case "normal":
            break;
          case "large":
            break;
          default:
            break;
        }
        return this;
      case "meatball":
        switch (props.size) {
          case "small":
            this.$ele +=
              "width: 10px; height: 10px; border-radius: 10px; margin: auto; padding: 0px; background-color: " +
              color(props.bgc) +
              ";";
            break;
          case "normal":
            this.$ele +=
              "width: 15px; height: 15px; border-radius: 15px; margin: auto; padding: 0px; background-color: " +
              color(props.bgc) +
              ";";
            break;
          case "large":
            this.$ele +=
              "width: 20px; height: 20px; border-radius: 20px; margin: auto; padding: 0px; background-color: " +
              color(props.bgc) +
              ";";
            break;
          default:
            this.$ele +=
              "width: 15px; height: 15px; border-radius: 15px; margin: auto; padding: 0px; background-color: " +
              color(props.bgc) +
              ";";
            break;
        }
        return this;
      case "message":
        switch (props.size) {
          case "small":
            break;
          case "normal":
            break;
          case "large":
            break;
          default:
            break;
        }
        return this;
      default:
        throw new Error("No Type Defined\nPlease Define a Type");
        return this;
    }
  }

  function color(props) {
    switch (props) {
      case "0":
        return "#f0f0f0";
      case "1":
        return "#e53935";
      case "2":
        return "#e91e63";
      case "3":
        return "#8e24aa";
      case "4":
        return "#3949ab";
      case "5":
        return "#00796b";
      case "6":
        return "#64dd17";
      case "7":
        return "#f4511e";
      case "8":
        return "#aaaaaa";
      case "9":
        return "#f96816";
      case "10":
        return "#222";
      case "11":
        return "#191919";
      case "12":
        return "#2c2c2c";
      case "13":
        return "#dfdfdf";
      case "14":
        return "#1b2b8d";
      case "15":
        return "#333333";
      case "16":
        return "#202020";
      default:
        return "#f0f0f0";
    }
  }
});
