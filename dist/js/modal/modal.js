//Style
var styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.textContent =
  ".modal-close{position: absolute; top: 0; right: 0; z-index: 10; padding: .25rem .5rem; color: rgba(0, 0, 0, 0.45); font-weight: 700; line-height: 1rem; text-decoration: none; background: 0 0; border: 0px; outline: 0px; cursor: pointer;}" +
  ".modal-close:focus, .modal-close:hover{color: rgba(0, 0, 0, 0.75); text-decoration: none;}" +
  ".remove{color: rgba(0,0,0,0.75); font-weight: 700;}" +
  ".remove:focus, .remove:hover{color: rgba(0, 0, 0, 0.45); text-decoration:none;}";
document.getElementsByTagName("head")[0].appendChild(styleSheet);

var modalStyle = {
  mask:
    "background-color: rgba(0, 0, 0, 0.45); bottom: 0px; box-sizing: border-box; height: 100vh; left: 0px; position: fixed; right: 0px; top: 0px; width: 100vw; z-index: 1000;",
  wrap:
    "bottom: 0px; left: 0px; position: fixed; right: 0px; top: 0px; outline: 0px; overflow: auto; -webkit-overflow-scrolling: touch; z-index: 1000;",
  modal:
    "box-sizing: border-box; color: rgba(0, 0, 0, 0.85); font-size: 14pt; line-height: 1rem; list-style: none; margin: 0px auto; padding: 0 0 .25rem; position: relative; top: 100px; min-width: 275px; width: 25vw; max-width: calc(100vw - .5rem); -webkit-box-sizing: border-box;",
  content:
    "background-color: #fff; background-clip: padding-box; border: 0px; border-radius: .25rem; box-shadow: 0 3px 6px -4px rgb(0 0 0 / 12%), 0 6px 16px 0 rgb(0 0 0 / 8%), 0 9px 28px 8px rgb(0 0 0 / 5%); -webkit-box-shadow: 0 3px 6px -4px rgb(0 0 0 / 12%),  0 6px 16px 0 rgb(0 0 0 / 8%), 0 9px 28px 8px rgb(0 0 0 / 5%);",
  header:
    "background: #fff; border-bottom: 1px solid #f0f0f0; border-radius: 2px 2px 0 0; color: rgba(0, 0, 0, 0.85); padding: .25rem .5rem;",
  title:
    "color: rgba(0, 0, 0, 0.85); font-weight: 500; font-size: 16pt; line-height: 22px; word-wrap: break-word;",
  body:
    "padding: .25rem; font-size: 14pt; min-height: 200px; height: 20vh; max-height: calc(100vh - 2rem); line-height: 1rem; overflow: hidden auto;  word-wrap: break-word;",
  footer:
    "padding: .125rem .1875rem; text-align: right; background: 0px 0px; border-top: 1px solid #f0f0f0; border-radius: 0 0 2px 2px;",
};

function Modal() {
  this.$ele = document.createElement("div");
  var modalParent = this.$ele;

  this.$mask = document.createElement("div");
  this.$mask.style = modalStyle.mask;

  this.$wrap = document.createElement("div");
  this.$wrap.style = modalStyle.wrap;
  this.$wrap.addEventListener("click", function (e) {
    e.stopPropagation();
    if (e.target === this) {
      modalParent.parentNode.removeChild(modalParent);
    }
  });

  this.$modal = document.createElement("div");
  this.$modal.style = modalStyle.modal;

  this.$content = document.createElement("div");
  this.$content.style = modalStyle.content;

  this.$header = document.createElement("div");
  this.$header.style = modalStyle.header;

  this.$title = document.createElement("div");
  this.$title.style = modalStyle.title;

  this.$close = document.createElement("div");
  this.$close.innerText = "X";
  this.$close.className += "modal-close";

  this.$close.addEventListener("click", function (e) {
    e.stopPropagation();
    modalParent.parentNode.removeChild(modalParent);
  });

  this.$header.appendChild(this.$title);
  this.$header.appendChild(this.$close);

  this.$body = document.createElement("div");
  this.$body.style = modalStyle.body;

  this.$footer = document.createElement("div");
  this.$footer.style = modalStyle.footer;

  this.$content.appendChild(this.$header);
  this.$content.appendChild(this.$body);
  this.$content.appendChild(this.$footer);

  this.$modal.appendChild(this.$content);
  this.$wrap.appendChild(this.$modal);

  this.$ele.appendChild(this.$mask);
  this.$ele.appendChild(this.$wrap);
}

//Props is an object with key value pairs
//title: title text
//body: components array
//footer: buttons array
Modal.prototype.setContent = function (props) {
  this.$title.innerText = props.title;
  this.$body.innerText = "";
  var $body = this.$body;
  props.body.forEach(function (component) {
    $body.appendChild(component);
  });
  this.$footer.innerText = "";
  var $footer = this.$footer;
  props.footer.forEach(function (component) {
    $footer.appendChild(component);
  });
};
