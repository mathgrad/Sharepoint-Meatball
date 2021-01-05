(function () {
  var color = new Color();
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
              "width: 15px; height: 15px; font-size: 5.25pt; border-radius: 15px; text-align: center; line-height: 14px;";
            break;
          case "normal":
            this.$ele +=
              "width: 30px; height: 30px; font-size: 10.5pt; border-radius: 30px; text-align: center; line-height: 28px;";
            break;
          case "large":
            this.$ele +=
              "width: 45px; height: 45px; font-size: 15.75pt; border-radius: 45px; text-align: center; line-height: 42px;";
            break;
          default:
            this.$ele +=
              "width: 30px; height: 30px; font-size: 10.5pt; border-radius: 30px; text-align: center; line-height: 28px;";
            break;
        }
        return this;
      case "button":
        switch (props.size) {
          case "small":
            this.$ele +=
              "border-radius: .125rem; padding: .125rem; margin: 0px .25rem .25rem .25rem; text-align: center; display: block; cursor: pointer: font-weight: 500;";
            break;
          case "normal":
            this.$ele +=
              "border-radius: .25rem; padding: .25rem; margin: 0px .5rem .5rem .5rem; text-align: center; display: block; cursor: pointer: font-weight: 500;";
            break;
          case "large":
            this.$ele +=
              "border-radius: .5rem; padding: .5rem; margin: 0px 1rem 1rem 1rem; text-align: center; display: block; cursor: pointer: font-weight: 500;";
            break;
          default:
            this.$ele +=
              "border-radius: .25rem; padding: .25rem; margin: 0px .5rem .5rem .5rem; text-align: center; display: block; cursor: pointer: font-weight: 500;";
            break;
        }
        return this;
      case "carret":
        switch (props.size) {
          case "small":
            this.$ele +=
              "margin: 0px; display: inline-block; position:absolute; height: 0px; width: 0px; left: 2px; top: 14px; border-top: 5px solid transparent; border-bottom: 5px solid transparent; border-right: 5px solid " +
              color.get(props.bgc) +
              ";";
            break;
          case "normal":
            this.$ele +=
              "margin: 0px; display: inline-block; position:absolute; height: 0px; width: 0px; left: 2px; top: 29px; border-top: 10px solid transparent; border-bottom: 10px solid transparent; border-right: 10px solid " +
              color.get(props.bgc) +
              ";";
            break;
          case "large":
            this.$ele +=
              "margin: 0px; display: inline-block; position:absolute; height: 0px; width: 0px; left: 2px; top: 44px; border-top: 15px solid transparent; border-bottom: 15px solid transparent; border-right: 15px solid " +
              color.get(props.bgc) +
              ";";
            break;
          default:
            this.$ele +=
              "margin: 0px; display: inline-block; position:absolute; height: 0px; width: 0px; left: 2px; top: 29px; border-top: 10px solid transparent; border-bottom: 10px solid transparent; border-right: 10px solid " +
              color.get(props.bgc) +
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
              "width: 10px; height: 10px; border-radius: 10px; margin: auto; padding: 0px;";
            break;
          case "normal":
            this.$ele +=
              "width: 15px; height: 15px; border-radius: 15px; margin: auto; padding: 0px;";
            break;
          case "large":
            this.$ele +=
              "width: 20px; height: 20px; border-radius: 20px; margin: auto; padding: 0px;";
            break;
          default:
            this.$ele +=
              "width: 15px; height: 15px; border-radius: 15px; margin: auto; padding: 0px;";
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
              "display: inline-block; margin: 0px; padding: 0px; width: 100px; box-shadow: 1px 1px 4px 1px rgb(0 0 0 / 0.2);";
            break;
          case "normal":
            this.$ele +=
              "display: inline-block; margin: 0px; padding: 0px; width: 200px; box-shadow: 1px 1px 4px 1px rgb(0 0 0 / 0.2);";
            break;
          case "large":
            this.$ele +=
              "display: inline-block; margin: 0px; padding: 0px; width: 300px; box-shadow: 1px 1px 4px 1px rgb(0 0 0 / 0.2);";
            break;
          default:
            this.$ele +=
              "display: inline-block; margin: 0px; padding: 0px; width: 200px; box-shadow: 1px 1px 4px 1px rgb(0 0 0 / 0.2);";
            break;
        }

        if (props.fc) {
          this.$ele += "color: " + color.get(props.fc) + ";";
        }
        if (props.bgc) {
          this.$ele += "background-color: " + color.get(props.bgc) + ";";
        }
        return this;
      }
      default:
        throw new Error("No Type Defined\nPlease Define a Type");
        return this;
    }
  }

  function Color() {
    this.blue = "#0075ff";
    this.green = "#27e833";
    this.red = "#d71010";
    this.yellow = "#f6de1c";
    this.colors = [
      "#f0f0f0",
      "#e53935",
      "#e91e63",
      "#8e24aa",
      "#3949ab",
      "#00796b",
      "#64dd17",
      "#f4511e",
      "#aaaaaa",
      "#f96816",
      "#222",
      "#191919",
      "#2c2c2c",
      "#dfdfdf",
      "#1b2b8d",
      "#333333",
      "#202020",
      "#d2d2d2",
      "#0075ff",
      "#27e833",
      "#d71010",
      "#f6de1c",
    ];
  }

  //Gets colors.  If it cannot find a color, it defaults to black
  Color.prototype.get = function (value) {
    if (!value) {
      return "#000000";
    }

    switch (typeof value) {
      case "number":
        if (this.colors.length > value) {
          return this.colors[value];
        } else {
          return this.colors[0];
        }

      case "string":
        if (compareString(value, "blue")) {
          return this.blue;
        } else if (compareString(value, "green")) {
          return this.green;
        } else if (compareString(value, "red")) {
          return this.red;
        } else if (compareString(value, "yellow")) {
          return this.yellow;
        } else if (this.colors.indexOf(value) > -1) {
          return this.colors[this.colors.indexOf(value)];
        }
        break;
      default:
        break;
    }

    if (this.colors.length > parseInt(value)) {
      return this.colors[parseInt(value)];
    }

    return "#000000";
  };

  //Either replaces the default value or creates a new values
  //If a known color value is called, it will use one of the default colors
  //For example, if user supplies blue, then #0075ff is added
  Color.prototype.set = function (value, color) {
    if (this.replaceValue(value, color)) {
      return;
    }
    this.colors.push(color);
    return this;
  };

  //Private function for the Color object
  Color.prototype.replaceValue = function (value, color) {
    if (compareString(value, "blue")) {
      this.blue = color;
      return true;
    } else if (compareString(value, "green")) {
      this.green = color;
      return true;
    } else if (compareString(value, "red")) {
      this.red = color;
      return true;
    } else if (compareString(value, "yellow")) {
      this.yellow = color;
      return true;
    }
    return false;
  };

  /*Checks to see if s0 contains to s1*/
  function containsString(s0, s1) {
    return s0.toLowerCase().indexOf(s1.toLowerCase()) > -1;
  }

  /*Uses containsString to check to see if the two strings are equal*/
  function compareString(s0, s1) {
    return containsString(s0, s1) && containsString(s1, s0);
  }
});
