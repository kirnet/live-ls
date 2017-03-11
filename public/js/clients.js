'use strict';

$(function() {
  var ls = ls || {};
  $('#clients-tab').tab('show');

  ls.ws = new ReconnectingWebSocket('ws:' + window.location.hostname + ':' + 3001);
  ls.ws.onopen = function(e) {
    console.log("Connection established! ", window.location.pathname);
  };

  ls.ws.onmessage = function(event) {

    var result = ls.utils.isJson(event.data) ? JSON.parse(event.data) : event.data;
  };

});
