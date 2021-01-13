function List() {}

//only make agnogistic
List.prototype.search = function (
  table,
  rowIndex,
  internalColumn,
  cb,
  init,
  path,
  searchName, //listname or id
  queryParam
) {
  var url = "";
  init
    ? (url =
        path +
        "_api/web/lists/getbytitle('" +
        searchName +
        queryParam +
        table +
        " - " +
        rowIndex +
        " - " +
        internalColumn +
        "'&$expand=Author&$orderby=Created desc&$top=1")
    : (url =
        path +
        "_api/web/lists/getbytitle('" +
        searchName +
        queryParam +
        table +
        " - " +
        rowIndex +
        " - " +
        internalColumn +
        "'&$expand=Author&$top=200");

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
};

//changed from createList to create because it is ims.sharepoint.list.create
List.prototype.create = function (path, name, cb) {
  var data = {
    __metadata: { type: "SP.List" },
    AllowContentTypes: true,
    BaseTemplate: 100,
    ContentTypesEnabled: true,
    Title: name,
  };
  var url = path + "/_api/web/lists";
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
};

//change to use props
List.prototype.update = function (id, message, path, searchName) {
  var data = {
    __metadata: { type: "SP.ListItem" },
    Message: message,
  };

  var url =
    path + "_api/web/lists/getbytitle('" + searchName + "')/items(" + id + ")";

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
};

//change from deleteList to delete because it should only ref the list not item that's separate
List.prototype.deleteItem = function (listId, id, path, searchName) {
  var url =
    path + "_api/web/lists/getbytitle('" + searchName + "')/items(" + id + ")";

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
};

//will find a list by name
List.prototype.listInfo = function (path, searchName, cb) {
  var url = path + "_api/web/lists/getbytitle('" + searchName + "')";

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
      console.log("Error in the findHistoryChat:", error);
      cb(error, null);
    },
  });
};

//change so the Absolute url is passed in the props
List.prototype.choiceFields = function (props, cb) {
  var listType = props.listId ? "lists" : "getbytitle";
  var listName = props.listId ? props.listId : props.listName;
  $.ajax({
    url:
      _spPageContextInfo.siteAbsoluteUrl +
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
};

List.prototype.item.create = function (props, query, cb) {};

//specific to meatball
List.prototype.makeHistoryEntry = function (
  listId,
  message,
  colName,
  rowId,
  tableGUID,
  autoBot,
  path,
  searchName,
  cb
) {
  var data = {
    __metadata: { type: "SP.ListItem" },
    Message: message,
    Title: tableGUID + " - " + rowId + " - " + colName,
    Status: autoBot ? "Automated Message" : "User Generated",
  };
  var url = path + "_api/web/lists/getbytitle('" + searchName + "')/items ";
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
      if (autoBot) {
        return false;
      }
      cb(null, data.d);
    },
    error: function (error) {
      cb(error, null);
    },
  });
};
