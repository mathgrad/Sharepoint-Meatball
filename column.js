function Column() {}

Column.prototype.create = function (
  colTitle,
  fieldType,
  required,
  uniqueValue,
  path,
  searchName
) {
  //FieldTypeKind values go to: https://docs.microsoft.com/en-us/previous-versions/office/sharepoint-server/ee540543(v=office.15)
  var data = {
    __metadata: { type: "SP.Field" },
    Title: colTitle,
    FieldTypeKind: fieldType,
    Required: required,
    EnforceUniqueValues: uniqueValue,
    StaticName: colTitle,
  };

  var url = name + "_api/web/lists/getbytitle('" + searchName + "')/Fields";

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
      createStatusColumn();
      return false;
    },
    error: function (error) {
      console.log("Column creation failed:", error);
    },
  });
};
