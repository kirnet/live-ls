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
    html += '<tr>' +
              '<td>'+ domain +'</td>' +
              '<td class="client_counter">'+ counter +'</td>' +
            '<tr>';

  }
  html += '</table>';
  receiver.send(html);
  console.log('show all');
};

//module.exports.