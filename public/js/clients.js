'use strict';
var lls = lls || {};

$(function() {

  $('#clients-tab').tab('show');

  lls.ws = new ReconnectingWebSocket('ws:' + window.location.hostname + ':' + 3001);
  lls.ws.onopen = function(e) {
    console.log("Connection established! ", window.location.pathname);

    lls.ws.send(JSON.stringify({
      admin: 'getList'
    }));

  };

  lls.ws.onmessage = function(event) {
    if (!lls.isJson(event.data)) {
      var counter = 0;
      $('#clients').html(event.data);
      $('.client_counter').each(function() {
        counter += parseInt($(this).text());
      });
      $('#totalClients').html(counter);
    }

  };

});
