function List() {}

List.prototype.get = function (
  table,
  rowIndex,
  internalColumn,
  cb,
  init,
  path,
  searchName
) {
  var url = "";
  init
    ? (url =
        path +
        "_api/web/lists/getbytitle('" +
        searchName +
        "')/items?$select=Created,Author/Title,ID,Message,Status,Title&$filter=Title eq '" +
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
        "')/items?$select=Created,Author/Title,ID,Message,Status,Title&$filter=Title eq '" +
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

List.prototype.createList = function (path, name, cb) {
  var data = {
    __metadata: { type: "SP.List" },
    AllowContentTypes: true,
    BaseTemplate: 100,
    ContentTypesEnabled: true,
    Title: name,
  };

  //60% of the time "ctx.PortalUrl" works every time
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
      return false;
    },
    error: function (error) {
      cb(error, null);
      console.log("History list creation failed:", error);
    },
  });
};

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
List.prototype.find = function (path, searchName, cb) {
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
      cb(null, data.d.Id);
      return false;
    },
    error: function (error) {
      console.log("Error in the findHistoryChat:", error);
      cb(error, null);
    },
  });
};

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
      return false;
    },
    error: function (error) {
      cb(error, null);
    },
  });
};
