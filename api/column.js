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
      ctx.PortalUrl + "_api/web/lists/getbytitle('" + props.searchName + "')/Fields";

    $.ajax({
      url: props.url,
      type: "POST",
      data: JSON.stringify(props.data),
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
};
