function Library() {}

//NEEDS WORK
//create folder
Library.prototype.get = function (fileName, folderName, path) {
  var data = {
    __metadata: {
      type: "SP.Folder",
    },
    ServerRelativeUrl: "/document library relative url/" + folderName,
  };

  var url =
    path + "_api/web/GetFolderByServerRelativeUrl('" + searchName + "')/Files";

  $.ajax({
    url: url,
    type: "GET",
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
      console.log(error);
    },
  });
};

//get all
Library.prototype.get = function (fileName, folderName, path) {
  var url =
    path + "_api/web/GetFolderByServerRelativeUrl('" + searchName + "')/Files";

  $.ajax({
    url: url,
    type: "GET",
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
      console.log(error);
    },
  });
};

//get by name
Library.prototype.getItem = function (fileName, folderName, path) {
  var url =
    path +
    "_api/web/GetFolderByServerRelativeUrl('" +
    searchName +
    "')/Files('" +
    fileName +
    "')/$value";

  $.ajax({
    url: url,
    type: "GET",
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
      console.log(error);
    },
  });
};

//NEEDS WORK
// update a item -- remember that the user must know th exact path like the folders and filename
// see link below for structure
// https://docs.microsoft.com/en-us/sharepoint/dev/sp-add-ins/working-with-folders-and-files-with-rest
Library.prototype.update = function (path, searchName) {
  var url =
    path +
    "_api/web/GetFolderByServerRelativeUrl('" +
    searchName +
    "')/Files/add(url='a.txt',overwrite=true)";

  $.ajax({
    url: url,
    type: "PUT",
    data: JSON.stringify(data),
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
      console.log(error);
    },
  });
};

//delete a folder
Library.prototype.deleteFolder = function (path, searchName) {
  var url =
    path + "_api/web/GetFolderByServerRelativeUrl('" + searchName + "')";

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
      console.log(error);
    },
  });
};

//delete a file
Library.prototype.deleteFolder = function (path, searchName) {
  var url =
    path + "_api/web/GetFolderByServerRelativeUrl('" + searchName + "')";

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
      console.log(error);
    },
  });
};
