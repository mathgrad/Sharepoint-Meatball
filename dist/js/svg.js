/*
  controller for SVGGenerator
    props:
    size,
    type,
    color
  */
function SVGGenerator(props) {
  this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  this.wrapper = document.createElement("div");
  this.wrapper.style.display = "inline-block";

  this.svg.setAttribute("role", "img");
  this.svg.setAttribute("viewBox", "0 0 512 512");
  this.svg.setAttribute("alignment-baseline", "baseline");
  this.g = document.createElementNS("http://www.w3.org/2000/svg", "g");

  switch (props.size) {
    case "small":
      this.svg.setAttribute("width", ".5em");
      this.svg.setAttribute("height", ".5em");
      this.wrapper.style.width = ".5em";
      this.wrapper.style.height = ".5em";
      break;
    case "normal":
      this.svg.setAttribute("width", "1em");
      this.svg.setAttribute("height", "1em");
      this.wrapper.style.width = "1em";
      this.wrapper.style.height = "1em";
      break;
    case "large":
      this.svg.setAttribute("width", "2em");
      this.svg.setAttribute("height", "2em");
      this.wrapper.style.width = "2em";
      this.wrapper.style.height = "2em";
      break;
    default:
      this.svg.setAttribute("width", "1em");
      this.svg.setAttribute("height", "1em");
      this.wrapper.style.width = "1em";
      this.wrapper.style.height = "1em";
      break;
  }

  var path = document.createElementNS("http://www.w3.org/2000/svg", "path");

  if (props.type !== "loading") {
    path.setAttribute("fill", props.color);
  } else {
    path.setAttribute("fill", "url(#colorFill)");
  }
  var iconPath;
  switch (props.type) {
    case "add":
      iconPath =
        "M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z";
      this.wrapper.title = "Add";
      break;

    case "delete":
      iconPath =
        "M268 416h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12zM432 80h-82.41l-34-56.7A48 48 0 0 0 274.41 0H173.59a48 48 0 0 0-41.16 23.3L98.41 80H16A16 16 0 0 0 0 96v16a16 16 0 0 0 16 16h16v336a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128h16a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16zM171.84 50.91A6 6 0 0 1 177 48h94a6 6 0 0 1 5.15 2.91L293.61 80H154.39zM368 464H80V128h288zm-212-48h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12z";
      this.wrapper.title = "Delete";
      break;

    case "edit":
      iconPath =
        "M497.9 142.1l-46.1 46.1c-4.7 4.7-12.3 4.7-17 0l-111-111c-4.7-4.7-4.7-12.3 0-17l46.1-46.1c18.7-18.7 49.1-18.7 67.9 0l60.1 60.1c18.8 18.7 18.8 49.1 0 67.9zM284.2 99.8L21.6 362.4.4 483.9c-2.9 16.4 11.4 30.6 27.8 27.8l121.5-21.3 262.6-262.6c4.7-4.7 4.7-12.3 0-17l-111-111c-4.8-4.7-12.4-4.7-17.1 0zM124.1 339.9c-5.5-5.5-5.5-14.3 0-19.8l154-154c5.5-5.5 14.3-5.5 19.8 0s5.5 14.3 0 19.8l-154 154c-5.5 5.5-14.3 5.5-19.8 0zM88 424h48v36.3l-64.5 11.3-31.1-31.1L51.7 376H88v48z";
      this.wrapper.title = "Edit";
      break;

    case "failure":
      iconPath =
        "M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z";
      this.wrapper.title = "Failure";
      break;

    case "loading":
      this.svg.setAttribute("width", "100px");
      this.svg.setAttribute("height", "100px");
      this.wrapper.style.width = "100px";
      this.wrapper.style.height = "100px";
      iconPath =
        "M67.733 0A67.733 67.733 0 110 67.733 67.733 67.733 0 0167.733 0zm.69 20.686a46.676 46.676 0 11-46.676 46.676 46.676 46.676 0 0146.676-46.676z";
      this.wrapper.title = "Loading";
      break;

    case "message":
      iconPath =
        "M448 0H64C28.7 0 0 28.7 0 64v288c0 35.3 28.7 64 64 64h96v84c0 7.1 5.8 12 12 12 2.4 0 4.9-.7 7.1-2.4L304 416h144c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64zm32 352c0 17.6-14.4 32-32 32H293.3l-8.5 6.4L192 460v-76H64c-17.6 0-32-14.4-32-32V64c0-17.6 14.4-32 32-32h384c17.6 0 32 14.4 32 32v288zM280 240H136c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h144c4.4 0 8-3.6 8-8v-16c0-4.4-3.6-8-8-8zm96-96H136c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h240c4.4 0 8-3.6 8-8v-16c0-4.4-3.6-8-8-8z";
      this.wrapper.title = "Message";
      break;

    case "submit":
      this.wrapper.style.backgroundColor = "#3949ab";
      this.svg.setAttribute("viewBox", "0 0 1000 1000");

      iconPath =
        "M931.4 498.9L94.9 79.5c-3.4-1.7-7.3-2.1-11-1.2a15.99 15.99 0 00-11.7 19.3l86.2 352.2c1.3 5.3 5.2 9.6 10.4 11.3l147.7 50.7-147.6 50.7c-5.2 1.8-9.1 6-10.3 11.3L72.2 926.5c-.9 3.7-.5 7.6 1.2 10.9 3.9 7.9 13.5 11.1 21.5 7.2l836.5-417c3.1-1.5 5.6-4.1 7.2-7.1 3.9-8 .7-17.6-7.2-21.6zM170.8 826.3l50.3-205.6 295.2-101.3c2.3-.8 4.2-2.6 5-5 1.4-4.2-.8-8.7-5-10.2L221.1 403 171 198.2l628 314.9-628.2 313.2z";
      this.wrapper.title = "Submit";
      break;

    case "success":
      iconPath =
        "M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 48c110.532 0 200 89.451 200 200 0 110.532-89.451 200-200 200-110.532 0-200-89.451-200-200 0-110.532 89.451-200 200-200m140.204 130.267l-22.536-22.718c-4.667-4.705-12.265-4.736-16.97-.068L215.346 303.697l-59.792-60.277c-4.667-4.705-12.265-4.736-16.97-.069l-22.719 22.536c-4.705 4.667-4.736 12.265-.068 16.971l90.781 91.516c4.667 4.705 12.265 4.736 16.97.068l172.589-171.204c4.704-4.668 4.734-12.266.067-16.971z";
      this.wrapper.title = "Success";
      break;

    default:
      iconPath = "";
      break;
  }
  path.setAttribute("d", iconPath);
  this.g.appendChild(path);
  this.svg.appendChild(this.g);
  this.wrapper.appendChild(this.svg);

  return this;
}

SVGGenerator.prototype.setLoadAnimation = function () {
  var linearGradient = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "linearGradient"
  );
  linearGradient.setAttribute("id", "colorFill");
  var stops = [
    {
      color: "#ffffff",
      offset: "0%",
      opacity: "0",
    },
    {
      color: "#000000",
      offset: "100%",
      opacity: "1",
    },
  ];

  stops.forEach(function (item) {
    var stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop.setAttribute("offset", item.offset);
    stop.setAttribute("stop-color", item.color);
    stop.setAttribute("fill-opacity", item.opacity);
    linearGradient.appendChild(stop);
  });
  this.g.appendChild(linearGradient);

  var animateTransform = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "animateTransform"
  );
  animateTransform.setAttribute("attributeName", "transform");
  animateTransform.setAttribute("type", "rotate");
  animateTransform.setAttribute("from", "0 64 64");
  animateTransform.setAttribute("to", "360 64 64");
  animateTransform.setAttribute("dur", "1080ms");
  animateTransform.setAttribute("repeatCount", "indefinite");
  this.g.appendChild(animateTransform);

  return this;
};
