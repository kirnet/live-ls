'use strict';

var lls = lls || {};

lls.isJson = function(string) {
  try {
    JSON.parse(string);
  }
  catch(e) {
    return false;
  }
  return true;
};

lls.addUrlParams = function(params) {
  params = params || {};
  var search = window.location.search.substr(1),
      keyVal = {},
      key,
      str = '?';

  search = search.split('&');
  search.forEach(function(item) {
    item = item.split('=');
    keyVal[item[0]] = item[1];
  });

  for (key in params) {
    keyVal[key] = params[key];
  }

  for (key in keyVal) {
    str += key + '=' + keyVal[key] + '&';
  }
  return str.slice(0, -1);
};
