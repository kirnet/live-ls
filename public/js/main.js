'use strict';

var lls = {};

lls.isJson = function(string) {
  try {
    JSON.parse(string);
  }
  catch(e) {
    console.log('not json');
    return false;
  }
  return true;
};
