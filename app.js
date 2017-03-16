'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var isJSON = require('is-json');
var onlineClients = require('./components/online-clients');

var index = require('./routes/index');
var users = require('./routes/users');
var livestreet = require('./routes/livestreet');
var clientsPage = require('./routes/clients');

var app = express();
var WebSocket = require('ws');
var wss = new WebSocket.Server({port: 3001});
var EventEmitter = new (require('events'));
var clients = {};
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var adminDomains = require('./config/admin-domains.js');
var nowTimestamp = Math.round((new Date()).getTime() / 1000);
//Start scheduler (clear domains counters)
require('./components/scheduler.js').clearCounters();
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
app.use('/clients', clientsPage);

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
  var domains = {},
    numClients = 0,
    receivers = [];

  for (var domain in clients) {
    if (!domains[domain]) {
      domains[domain] = 0;
    }

    if (adminDomains.indexOf(domain) > -1) {
      receivers.push(domain);
    }

    for (var id in clients[domain] ) {
      domains[domain]++;
      numClients++
    }
  }
  onlineClients.refresh(receivers, clients, domains);
  console.log('active clients: ', numClients, ' ' , domains);
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
    if (isJSON(message)) {
      message = JSON.parse(message);
      if (message.ct) {
        clients[clientDomain][id].clientInfo = message;
        //clientOrigin = clients[id].upgradeReq.headers.origin.replace(/(http:\/\/|\/|https:\/\/)/g, '');

        Domains.findOne({"domain": clientDomain}, function(err, domain) {
          if (!domain) {
            clients[clientDomain][id].clientInfo.isBlock = true
          }
          else if(domain.expire < nowTimestamp) {
            clients[clientDomain][id].clientInfo.isBlock = true
          }
        });
      }

      if (message.admin) {
        if (adminDomains.indexOf(clientDomain) > -1) {
          onlineClients.init(clients[clientDomain][id], message, clients);
        }
      }
    }
    console.log('websocket received', message);
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
      objClone = {};

  if (isJSON(data)) {
    var dataObj = JSON.parse(data);
    delete dataObj.token;
  }
  if (!clients[dataObj.domain]) return false;
  for (var id in clients[dataObj.domain]) {
    dataObj.content_type.forEach(function(item) {
      if (!clients[dataObj.domain][id].clientInfo.isBlock && clients[dataObj.domain][id].clientInfo.ct.length) {
        if (clients[dataObj.domain][id].clientInfo.ct.indexOf(item) > -1) {
          if (dataObj[item].users) {
            if (dataObj[item].users.indexOf(clients[dataObj.domain][id].clientInfo.user) > -1) {
              numClients++;
              objClone = {};
              for (var i in dataObj[item]) {
                if (i != 'users') objClone[i] = dataObj[item][i]
              }
              clients[dataObj.domain][id].send(JSON.stringify(objClone));
            }
          }
          else {
            numClients++;
            clients[dataObj.domain][id].send(JSON.stringify(dataObj[item]));
          }

        }
      }
    });
  }
  console.log('broadcast sended', numClients);
};

module.exports.app = app;
module.exports.EventEmitter = EventEmitter;
module.exports.nowTimestamp = nowTimestamp;

