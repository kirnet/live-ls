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
    console.log('receive websocket');
    if (!lls.isJson(event.data)) {
      console.log(event.data.substr(0, 80));
      $('#clients').html(event.data);
      //lls.countTotal();
    }
    else {
      var data = JSON.parse(event.data);
      console.log(data);
      if (data.maxOnline != undefined) {
        var online = $('#totalClients').text();
        if (parseInt(online) > data.maxOnline) {
          data.maxOnline = online;
        }
        $('#maxOnline').text(data.maxOnline);
        lls.countTotal();
      }
      else {
        lls.refreshTable(data);
      }

    }
  };

  lls.countTotal = function(counter) {
    var maxSpan = $('#maxOnline'),
        max = maxSpan.text() || 0;
    if (!counter) {
      $('.client_counter').each(function() {
        counter += parseInt($(this).text());
      });
    }
    $('#totalClients').html(counter);
    if (counter > max) {
      //lls.ws.send(JSON.stringify({admin: 1, updMaxOnline: 1}));
      maxSpan.text(counter);
    }
  };

  lls.refreshTable = function(data) {
    var counter = 0;
    for (var domain in data) {
      var td = $('.client_domain[data-domain="'+ domain +'"]');
      counter += data[domain];
      if (td.length) {
        if (data[domain] == 0) {
          td.parent().remove();
        }
        else {
          td.next('td').html(data[domain]);
        }
      }
      else if(data[domain] > 0) {
        var html = '<tr><td data-domain="'+ domain +'" class="client_domain">'+ domain +'</td>' +
          '<td class="client_counter">'+ data[domain] +'</td></tr>';
        $('table.table').find('tr:first').after(html);
      }
    }
    lls.countTotal(counter);
  };

});
