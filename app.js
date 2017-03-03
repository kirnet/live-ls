'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var isJSON = require('is-json');
var index = require('./routes/index');
var users = require('./routes/users');
var livestreet = require('./routes/livestreet');
var app = express();
var WebSocket = require('ws');
var wss = new WebSocket.Server({port: 3001});
var EventEmitter = new (require('events'));
var clients = {};
//EventEmitter = new EventEmitter();

wss.on('connection', function connection(ws) {
  var id = Math.random();
  clients[id] = ws;

  ws.on('close', function() {
    console.log('соединение закрыто ' + id);
    delete clients[id];
    countClients();
  });

  ws.on('message', function incoming(message) {
    if (message.indexOf('path') > -1) {
      clients[id].clientInfo = JSON.parse(message);
    }
    console.log('websocket', message);
  });
  console.log("новое соединение " + id);

  countClients();

});

EventEmitter.on('sendAll', function() {
  wss.broadcast(JSON.stringify(livestreet.params));
});

wss.broadcast = function broadcast(data) {
  var numClients = 0;
console.log(data);
  if (isJSON(data)) {
    data = JSON.parse(data);
  }

  for (var id in clients) {
    if (data.update) {
      switch(data.update) {
        case 'comment':
          if (data.topic_url.indexOf(clients[id].clientInfo.path) > -1) {
            clients[id].send(JSON.stringify(data));
            console.log('send to comment');
          }
          break;
        case 'stream_blog':

          break;
      }
    }
    numClients++;
  }
  console.log('broadcast clients', numClients);
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/livestreet', livestreet);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


function countClients() {
  var numClients = 0;
  for (var id in clients) {
    numClients++;
  }
  console.log('activeClients: ', numClients);
}

module.exports.app = app;
module.exports.EventEmitter = EventEmitter;

