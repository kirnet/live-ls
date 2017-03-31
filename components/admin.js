'use strict';

var isJSON = require('is-json');
var ServerInfo = require('../models/serverinfo');
var maxOnline = 0;
var onlineCounter = 0;

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
            '<th>Онлайн</th>' +
          '<tr>';

  for (var domain in clients) {
    counter = this.countOnline(clients[domain], true);

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

  if (!module.exports.maxOnline) {
    module.exports.getMaxOnline(function (maxOnline) {
      module.exports.updateMaxOnlineCounter(maxOnline, module.exports.onlineCounter);
    });
  }
  else {
    module.exports.updateMaxOnlineCounter(module.exports.maxOnline, module.exports.onlineCounter);
  }
};

module.exports.countOnline = function(clients, byHost) {
  var numClients = 0;

  for (var domain in clients) {
    if (!byHost) {
      for (var id in clients[domain]) {
        numClients++
      }
    }
    else {
      numClients++;
    }
  }
  return numClients;
};

module.exports.getMaxOnline = function(cb) {
  ServerInfo.findOne({}, function (err, info) {
    if (info === null) {
      info = new ServerInfo();
      info.maxOnlineCounter = 0;
      info.save(function (err) {
        if (err) console.log(err);
      });
      console.log('from mongo', info.maxOnlineCounter);
    }

    if (cb) {
      cb(info.maxOnlineCounter);
    }
    else {
      module.exports.maxOnline = info.maxOnlineCounter;
    }
  });
};

module.exports.updateMaxOnlineCounter = function(maxOnline, online) {
  if (maxOnline >= online) {
    return false;
  }
  maxOnline = online;
  ServerInfo.findOneAndUpdate({}, {
      maxOnlineCounter: parseInt(maxOnline)
    },
    function(err) {
      if (err) throw err;
      module.exports.maxOnline = maxOnline;
      console.log('save counter');
    }
  );
};

module.exports.maxOnline = maxOnline;
module.exports.onlineCounter = onlineCounter;
