function List() {}

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

//be able to use this for libraies and lists
List.prototype.createColumn = function (path, nameColumn, cb) {
  var data = {
    __metadata: { type: "SP.Field" },
    Title: "Message",
    FieldTypeKind: 2,
    Required: "false",
    EnforceUniqueValues: "false",
    StaticName: nameColumn,
  };

  var url = path + "_api/web/lists/getbytitle('History')/Fields";

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
      return false;
    },
    error: function (error) {
      console.log("Message col creation failed:", error);
    },
  });
};

//figure out a better way to
List.prototype.makeHistory = function (
  listId,
  message,
  colName,
  rowId,
  tableGUID,
  listEntrySuccess,
  autoBot,
  path,
  cb
) {
  var data = {
    __metadata: { type: "SP.ListItem" },
    Message: message,
    Title: tableGUID + " - " + rowId + " - " + colName, //name of the status column that is passed
    Status: autoBot ? "Automated Message" : "User Generated",
  };

  var url = ctx.PortalUrl + "_api/web/lists/getbytitle('History')/items "; //this is dev env

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
      // listEntrySuccess(data.d);
      return false;
    },
    error: function (error) {
      console.log("History entry creation failed:", error);
    },
  });
};
