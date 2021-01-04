(function () {
  function style(props) {
    this.$ele = "";
    switch (props.type) {
      case "avatar":
        break;
      case "button":
        break;
      case "carret":
        break;
      case "container":
        break;
      case "meatball":
        switch (props.size) {
          case "small":
            this.$ele +=
              "width: 10px; height: 10px; border-radius: 10px; margin: auto; padding: 0px; background-color: " +
              color(props) +
              ";";
            break;
          case "normal":
            this.$ele +=
              "width: 15px; height: 15px; border-radius: 15px; margin: auto; padding: 0px; background-color: " +
              color(props) +
              ";";
            break;
          case "large":
            this.$ele +=
              "width: 20px; height: 20px; border-radius: 20px; margin: auto; padding: 0px; background-color: " +
              color(props) +
              ";";
            break;
          default:
            this.$ele +=
              "width: 15px; height: 15px; border-radius: 15px; margin: auto; padding: 0px; background-color: " +
              color(props) +
              ";";
            break;
        }
        return this;
      case "message":
        break;
      default:
        break;
    }
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
  }

  function color(props) {
    switch (props.color) {
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
