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
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(connection(mysql, require('./config/mysql.js'),'request'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(flash());
app.use(passport.session());


var Account = require('./models/account.js');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

var Domains = require('./models/domains.js');

mongoose.connect('mongodb://localhost/live_ls');


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
  var numClients = 0,
      domains = '';
  for (var domain in clients) {
    domains += domain + ' ';
    for (var id in clients[domain] ) {
      numClients++;
    }
  }
  console.log('active clients: ', numClients, ' ' ,domains);
}

wss.on('connection', function (ws) {
  var id = Math.random(),
      clientDomain = ws.upgradeReq.headers.origin.replace(/(http:\/\/|\/|https:\/\/)/g, '');

  if (!clients[clientDomain]) {
    clients[clientDomain] = {};
  }
  clients[clientDomain][id] = ws;

  ws.on('close', function() {
    console.log('соединение закрыто ' + id);
    delete clients[clientDomain][id];
    countClients();
  });

  ws.on('message', function incoming(message) {
    if (message.indexOf('path') > -1 && message.indexOf('token')) {
      clients[clientDomain][id].clientInfo = JSON.parse(message);
      if (clients[clientDomain][id].clientInfo) {

      }
      var now = new Date(),
        nowTimestamp = Math.round(now.getTime() / 1000);
        //clientOrigin = clients[id].upgradeReq.headers.origin.replace(/(http:\/\/|\/|https:\/\/)/g, '');

      Domains.findOne({"domain": clientDomain}, function(err, domain) {
        if (!domain) {
          clients[clientDomain][id].clientInfo.isBlock = true
        }
        else if(domain.expire < nowTimestamp) {
          clients[clientDomain][id].clientInfo.isBlock = true
        }
        else {
          if (domain.rules) {
            clients[clientDomain][id].clientInfo.rules = JSON.parse(domain.rules);
          }
        }
      });
    }
    console.log('websocket receive', message);
  });
  console.log("новое соединение " + clientDomain);
  countClients();
});

EventEmitter.on('sendAll', function() {
  wss.broadcast(JSON.stringify(livestreet.params));
});

/**
 * Send users
 * @param data
 */
wss.broadcast = function broadcast(data) {
  var numClients = 0,
    sendUrls = [];

  if (isJSON(data)) {
    var dataObj = JSON.parse(data);
  }
  if (!clients[dataObj.domain]) return false;
  for (var id in clients[dataObj.domain]) {
    if (dataObj.content_type.length) {
      sendUrls = [];
      if (clients[dataObj.domain][id].clientInfo.rules && clients[dataObj.domain][id].clientInfo.rules[dataObj.content_type[0]]) {
        dataObj.update = clients[dataObj.domain][id].clientInfo.rules[dataObj.content_type[0]];
      }

      for (var indx in dataObj.update) {
        if (parseInt(indx) > -1) {
          sendUrls = sendUrls.concat(['/', '/index']);

        }
        else {
          sendUrls.push(dataObj.update[indx]);
        }
      }

      if (!clients[dataObj.domain][id].clientInfo.isBlock) {
        if (sendUrls.indexOf(clients[dataObj.domain][id].clientInfo.path) > -1) {
          console.log('send client');
          clients[dataObj.domain][id].send(data);
          numClients++;
        }
        else {
          for (var indx in sendUrls) {
            if (['/','/index'].indexOf(sendUrls[indx]) > -1) continue;
            var regexp = new RegExp(sendUrls[indx]);
            console.log('regexp: ', regexp);
            if (regexp.test(clients[dataObj.domain][id].clientInfo.path)) {
              console.log('regexp parsed');
              console.log('send client');
              clients[dataObj.domain][id].send(data);
              numClients++;
            }
          }
        }
      }
    }
  }
  console.log('broadcast sended', numClients);
};

module.exports.app = app;
module.exports.EventEmitter = EventEmitter;

