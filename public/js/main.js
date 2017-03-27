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

lls.getUrlParams = function() {
  var search = window.location.search.substr(1),
      keyVal = {};
  search = search.split('&');
  search.forEach(function(item) {
    item = item.split('=');
    if (item[0]) {
      keyVal[item[0]] = item[1];
    }
  });
  return keyVal;
};

lls.addUrlParams = function(params) {
  params = params || {};
  var keyVal = this.getUrlParams(),
      key,
      str = '?';
  for (key in params) {
    keyVal[key] = params[key];
  }

  for (key in keyVal) {
    str += key + '=' + (typeof keyVal[key] == 'object' ? JSON.stringify(keyVal[key]) : keyVal[key]) + '&';
  }
  return str.slice(0, -1);
};
