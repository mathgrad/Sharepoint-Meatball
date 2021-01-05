(function () {
  /*
    props properties:
    type
    size
    fc
    bgc
  */
  function style(props) {
    this.$ele = "";
    switch (props.type) {
      case "avatar":
        switch (props.size) {
          case "small":
            this.$ele +=
              "width: 15px; height: 15px; font-size: 5.25pt; border-radius: 15px; text-align: center; line-height: 14px; background-color: " +
              color(props.bgc) +
              ";";
            break;
          case "normal":
            this.$ele +=
              "width: 30px; height: 30px; font-size: 10.5pt; border-radius: 30px; text-align: center; line-height: 28px; background-color: " +
              color(props.bgc) +
              ";";
            break;
          case "large":
            this.$ele +=
              "width: 45px; height: 45px; font-size: 15.75pt; border-radius: 45px; text-align: center; line-height: 42px; background-color: " +
              color(props.bgc) +
              ";";
            break;
          default:
            this.$ele +=
              "width: 30px; height: 30px; font-size: 10.5pt; border-radius: 30px; text-align: center; line-height: 28px; background-color: " +
              color(props.bgc) +
              ";";
            break;
        }
        return this;
      case "button":
        switch (props.size) {
          case "small":
            this.$ele +=
              "border-radius: .125rem; padding: .125rem; margin: 0px .25rem .25rem .25rem; text-align: center; display: block; cursor: pointer: font-weight: 500; background-color: " +
              color(props.bgc) +
              "; color: " +
              color(props.fc) +
              ";";
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
            this.$ele +=
              "border-radius: .5rem; padding: .5rem; margin: 0px 1rem 1rem 1rem; text-align: center; display: block; cursor: pointer: font-weight: 500; background-color: " +
              color(props.bgc) +
              "; color: " +
              color(props.fc) +
              ";";
            break;
          default:
            this.$ele +=
              "border-radius: .25rem; padding: .25rem; margin: 0px .5rem .5rem .5rem; text-align: center; display: block; cursor: pointer: font-weight: 500; background-color: " +
              color(props.bgc) +
              "; color: " +
              color(props.fc) +
              ";";
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
      case "popoverBody": {
        switch (props.size) {
          case "small":
            this.$ele +=
              "display: inline-block; margin: 0px; padding: 0px; width: 100px; box-shadow: 1px 1px 4px 1px rgb(0 0 0 / 0.2); color: " +
              color(props.fc) +
              "; background-color: " +
              color(props.bgc) +
              ";";
            break;
          case "normal":
            this.$ele +=
              "display: inline-block; margin: 0px; padding: 0px; width: 200px; box-shadow: 1px 1px 4px 1px rgb(0 0 0 / 0.2); color: " +
              color(props.fc) +
              "; background-color: " +
              color(props.bgc) +
              ";";
            break;
          case "large":
            this.$ele +=
              "display: inline-block; margin: 0px; padding: 0px; width: 300px; box-shadow: 1px 1px 4px 1px rgb(0 0 0 / 0.2); color: " +
              color(props.fc) +
              "; background-color: " +
              color(props.bgc) +
              ";";
            break;
          default:
            this.$ele +=
              "display: inline-block; margin: 0px; padding: 0px; width: 200px; box-shadow: 1px 1px 4px 1px rgb(0 0 0 / 0.2); color: " +
              color(props.fc) +
              "; background-color: " +
              color(props.bgc) +
              ";";
            break;
        }
        return this;
      }
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
      case "17":
        return "#d2d2d2";
      default:
        return "#f0f0f0";
    }
  }
});
