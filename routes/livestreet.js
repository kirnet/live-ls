'use strict';

var express = require('express');
var router = express.Router();
var app = require('../app');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('livestreet');
});

router.post('/', function(req, res, next) {
  res.send('livestreet post');
  router.params = req.body;
  app.EventEmitter.emit('sendAll');
});

module.exports = router;
