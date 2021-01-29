var chat = {
  //specific for meatball
  getMessages: function (props, cb) {
    var url =
      ctx.PortalUrl +
      "_api/web/lists/getbytitle('" +
      props.listName +
      "')/items?$select=Created,Author/Title,ID,Message,Status,Title&$filter=Title eq '" +
      props.list.id +
      "-" +
      props.item.id +
      "-" +
      props.list.internal +
      props.qs;

    $.ajax({
      url: url,
      type: "GET",
      headers: {
        Accept: "application/json; odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        credentials: true,
        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
      },
      success: function (res) {
        var data = res.d.results.map(function (item) {
          item.Author =
            item.Status === "Automated Message" ? "AutoBot" : item.Author.Title;
          return item;
        });
        cb(null, data);
      },
      error: function (error) {
        cb(error, null);
      },
    });
  },
  //back burner
  create: {},
  get: {},
  getAll: {},
  update: {},
  delete: function (props) {
    var url =
      ctx.PortalUrl +
      "_api/web/lists/getbytitle('" +
      props.listName +
      "')/items(" +
      props.id +
      ")";

    $.ajax({
      url: url,
      type: "DELETE",
      headers: {
        Accept: "application/json; odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        credentials: true,
        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
        "IF-MATCH": "*",
      },
      success: function (data) {
        return false;
      },
      error: function (error) {
        console.log("History entry deletion failed:", error);
      },
    });
  },
};
