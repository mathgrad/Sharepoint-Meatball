var chat = {
  //specific to meatball
  createMessage: function (props, cb) {
    var data = {
      __metadata: { type: "SP.ListItem" },
      Message: props.message,
      Title: props.tableGUID + " - " + props.rowId + " - " + props.colName,
      Status: props.autoBot ? "Automated Message" : "User Generated",
    };
    var url =
      ctx.PortalUrl +
      "_api/web/lists/getbytitle('" +
      props.searchName +
      "')/items ";
    $.ajax({
      url: url,
      type: "POST",
      data: JSON.stringify(data),
      headers: {
        Accept: "application/json; odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        credentials: true,
        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
      },
      success: function (data) {
        if (props.autoBot) {
          return false;
        }
        cb(null, data.d);
      },
      error: function (error) {
        cb(error, null);
      },
    });
  },
  //specific for meatball
  getMessage: function (props, cb) {
    var url =
      ctx.PortalUrl +
      "_api/web/lists/getbytitle('" +
      props.searchName +
      "')/items?$select=Created,Author/Title,ID,Message,Status,Title&$filter=Title eq '" +
      props.table +
      " - " +
      props.rowIndex +
      " - " +
      props.internalColumn +
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
      props.searchName +
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
