var list = {
  //this is meant for the subsite or the page you're already on
  choiceFields: function (props, cb) {
    var listType = props.listId ? "lists" : "getbytitle";
    var listName = props.listId ? props.listId : props.listName;
    $.ajax({
      url:
        ctx.HttpRoot +
        "/_api/web/" +
        listType +
        "('" +
        listName +
        "')/fields?$filter=TypeDisplayName eq 'Choice'",
      type: "GET",
      headers: {
        Accept: "application/json; odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        credentials: true,
        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
      },
      success: function (data) {
        cb(null, data.d.results);
      },
      error: function (e) {
        console.error(e);
        cb(null, []);
      },
    });
  },
  find: function (props, cb) {
    var url =
      ctx.PortalUrl + "_api/web/lists/getbytitle('" + props.searchName + "')";

    $.ajax({
      url: url,
      type: "GET",
      headers: {
        Accept: "application/json; odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        credentials: true,
        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
      },
      success: function (data) {
        cb(null, data.d);
      },
      error: function (error) {
        cb(error, null);
      },
    });
  },
  create: function (props, cb) {
    var data = {
      __metadata: { type: "SP.List" },
      AllowContentTypes: true,
      BaseTemplate: 100,
      ContentTypesEnabled: true,
      Title: name,
    };
    var url = ctx.PortalUrl + "/_api/web/lists";
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
        cb(null, data);
      },
      error: function (error) {
        cb(error, null);
      },
    });
  },
  //back burner - move to item
  update: {},
  //back burner - deleteing an entire list...
  delete: {},
  item: {
    //back burner
    create: {},
    update: function (props, cb) {
      var data = {
        __metadata: { type: "SP.ListItem" },
      };
      data[props.column] = props.text;

      var url =
        ctx.PortalUrl +
        "_api/web/lists/getbytitle('" +
        props.searchName +
        "')/items(" +
        props.id +
        ")";

      $.ajax({
        url: url,
        type: "POST",
        data: JSON.stringify(data),
        headers: {
          Accept: "application/json; odata=verbose",
          "Content-Type": "application/json;odata=verbose",
          credentials: true,
          "X-RequestDigest": $("#__REQUESTDIGEST").val(),
          "X-HTTP-Method": "MERGE",
          "IF-MATCH": "*",
        },
        success: function (data) {
          return false;
        },
        error: function (error) {
          console.log("History entry update failed:", error);
        },
      });
    },
    delete: {},
  },
};
