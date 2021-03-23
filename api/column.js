var column = {
  create: function (props, cb) {
    //FieldTypeKind values go to: https://docs.microsoft.com/en-us/previous-versions/office/sharepoint-server/ee540543(v=office.15)
    var data = {
      __metadata: { type: "SP.Field" },
      Title: props.colTitle,
      FieldTypeKind: props.fieldType,
      Required: props.required,
      EnforceUniqueValues: props.uniqueValue,
      StaticName: props.colTitle,
    };

    var url =
      ctx.PortalUrl +
      "_api/web/lists/getbytitle('" +
      props.listName +
      "')/Fields";

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
};
