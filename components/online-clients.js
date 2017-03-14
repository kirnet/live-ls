'use strict';

var isJSON = require('is-json');

module.exports.init = function(receiver, message, clients) {
  message = isJSON(message) ? JSON.parse(message) : message;
  if (typeof this[message.admin] == 'function') {
    this[message.admin](receiver, clients);
  }
};

module.exports.getList = function(receiver, clients) {
  var html = '<table class="table">',
      counter;
  html += '<tr>' +
            '<th>Домен</th>' +
            '<th>Количество</th>' +
          '<tr>';

  for (var domain in clients) {
    counter = 0;
    for (var id in clients[domain]) {
      counter++;
    }
    if (counter > 0) {
      html += '<tr>' +
        '<td data-domain="' + domain + '" class="client_domain">' + domain + '</td>' +
        '<td class="client_counter">' + counter + '</td>' +
        '<tr>';
    }
  }
  html += '</table>';
  receiver.send(html);
  console.log('show all');
};

module.exports.refresh = function(receivers, clients, domains) {
  for (var i = 0; i < receivers.length; i++) {
    if (clients[receivers[i]]) {
      for (var id in clients[receivers[i]]) {
        clients[receivers[i]][id].send(JSON.stringify(domains));
      }
    }
  }
  // for (var domain in domains) {
  //
  // }
};