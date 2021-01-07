function Person() {}

Person.prototype.get = function (path, cb) {
  var url = path + "/_api/SP.UserProfiles.PeopleManager/GetMyProperties";
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
      cb(null, data.d.DisplayName);
      return false;
    },
    error: function (error) {
      cb(error, null);
    },
  });
};
