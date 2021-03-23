//https://www.codeproject.com/Articles/990131/CRUD-Operation-to-List-Using-SharePoint-Rest-API
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
  get: function (props, cb) {
    var url =
      _spPageContextInfo.siteAbsoluteUrl +
      "/_api/web/lists/getbytitle('" +
      props.listName +
      "')";

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
        cb(null, data);
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
      Title: props.listName,
    };
    var url = _spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists";
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
  update: function (props, cb) {
    var url =
      _spPageContextInfo.siteAbsoluteUrl +
      "/_api/web/lists/getbytitle('" +
      props.listName +
      "')";

    $.ajax({
      url: url,
      type: "PATCH",
      headers: {
        Accept: "application/json; odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        credentials: true,
        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
        "X-Http-Method": "PATCH",
        "If-Match": props.oldItem.__metadata.etag,
      },
      data: JSON.stringify(props.data),
      success: function (data) {
        cb(null, data);
      },
      error: function (error) {
        cb(error, null);
      },
    });
  },
  //back burner - deleteing an entire list...
  delete: {},
  item: {
    create: function (props, cb) {
      var data = Object.assign(props.data, {
        __metadata: { type: "SP.ListItem" },
      });

      var url =
        _spPageContextInfo.siteAbsoluteUrl +
        "/_api/web/lists/getbytitle('" +
        props.listName +
        "')/items";

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
    get: function (props, cb) {
      var url =
        _spPageContextInfo.siteAbsoluteUrl +
        "/_api/web/lists/getbytitle('" +
        props.listName +
        "')/getitembyid('" +
        props.id +
        "')";

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
          cb(null, data);
        },
        error: function (error) {
          cb(error, null);
        },
      });
    },
    gets: function (props, cb) {
      var url =
        _spPageContextInfo.siteAbsoluteUrl +
        "/_api/web/lists/getbytitle('" +
        props.listName +
        "')/items";

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
          cb(null, data);
        },
        error: function (error) {
          cb(error, null);
        },
      });
    },
    update: function (props, cb) {
      var data = Object.assign(props.data, {
        __metadata: { type: "SP.ListItem" },
      });

      var url =
        _spPageContextInfo.siteAbsoluteUrl +
        "_api/web/lists/getbytitle('" +
        props.listName +
        "')/getitembyid(" +
        props.id +
        ")";

      $.ajax({
        url: url,
        type: "PATCH",
        data: JSON.stringify(data),
        headers: {
          Accept: "application/json; odata=verbose",
          "Content-Type": "application/json;odata=verbose",
          credentials: true,
          "X-RequestDigest": $("#__REQUESTDIGEST").val(),
          "X-HTTP-Method": "PATCH",
          "IF-MATCH": props.oldItem.__metadata.etag,
        },
        success: function (data) {
          cb(null, data);
        },
        error: function (error) {
          cb(error, null);
        },
      });
    },
    delete: function (props, cb) {
      var url =
        _spPageContextInfo.siteAbsoluteUrl +
        "_api/web/lists/getbytitle('" +
        props.listName +
        "')/getitembyid(" +
        props.id +
        ")";

      $.ajax({
        url: url,
        type: "DELETE",
        headers: {
          Accept: "application/json;odata=verbose",
          "X-RequestDigest": $("#__REQUESTDIGEST").val(),
          "If-Match": props.oldItem.__metadata.etag,
        },
        success: function (data) {
          cb(null, data);
        },
        error: function (error) {
          cb(error, null);
        },
      });
    },
  },
};
