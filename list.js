function List() {}

List.prototype.create = function (path, name, cb) {
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
      return false;
    },
    error: function (error) {
      console.log("History list creation failed:", error);
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
