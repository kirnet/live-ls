'use strict';

var express = require('express');
var router = express.Router();
var app = require('../app');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('livestreet');
});

router.delete('/delete_token', function(req, res, next) {
  console.log(req.body);
  if (req.body.id && req.body.id > 0) {
    req.getConnection(function(err,connection) {
      connection.query('DELETE FROM tokens WHERE id=?', req.body.id, function(err, rows) {
        if(err) console.log("Error Selecting : %s ", err);
        console.log(rows);
        res.send(JSON.stringify({result: rows.affectedRows}));
      });
    });
  }
  else {
    res.send('delete livestreet');
  }
});

router.put('/add_token', function(req, res, next) {
  if (req.body.token) {
    req.getConnection(function(err, connection) {
      connection.query('INSERT INTO tokens SET ?', req.body, function(err, rows) {
        if(err) console.log("Error Selecting : %s ", err);
        res.redirect('/');
      });
    });
  }
});

router.post('/save_token', function(req, res, next) {
  if (req.body.id) {
    var moment = require('moment');
    moment.locale('ru');
    req.body.expire = moment(req.body.expire, 'DD.MM.YYYY').unix();
    req.getConnection(function(err, connection) {
      connection.query('UPDATE tokens set ? WHERE id =' + req.body.id, req.body, function(err, rows) {
        if(err) console.log("Error Selecting : %s ", err);
        res.send(JSON.stringify({result: rows.affectedRows}));
      });
    });
  }
});

router.post('/', function(req, res, next) {
  res.send('livestreet post');
  router.params = req.body;
  app.EventEmitter.emit('sendAll');
});

module.exports = router;
