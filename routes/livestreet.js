'use strict';

var express = require('express');
var router = express.Router();
var app = require('../app');
var Domains = require('../models/domains.js');
var moment = require('moment');
var crypto = require('crypto');


moment.locale('ru');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('livestreet');
});

router.delete('/delete_domain', function(req, res, next) {
  if (req.body.domain) {
    Domains.findOneAndRemove({ domain: req.body.domain }, function(err) {
      if (err) throw err;
      res.send(JSON.stringify({result: true}));
    });
  }
  else {
    res.send('delete livestreet');
  }
});

router.post('/add_domain', function(req, res, next) {
  if (req.body.domain) {
    var newDomain = new Domains({
      domain: req.body.domain,
      expire: moment(req.body.expire, 'DD.MM.YYYY').unix(),
      hash: crypto.createHash('sha1').update(req.body.domain).digest("hex")
    });

    newDomain.save(function(err) {
      if (err)  {
        res.send(err);
        return false;
      };
      res.redirect('/');
    });
  }
});

router.post('/save_domain', function(req, res, next) {
  if (req.body.domain) {

    var isJSON = require('is-json');
    req.body.expire = moment(req.body.expire, 'DD.MM.YYYY').unix();
    if (!isJSON(req.body.rules) && req.body.rules != '{}') {
      res.send(JSON.stringify({
        result: false,
        message: 'Not valid JSON'
      }));
    }
    else {

      Domains.findOneAndUpdate({ domain: req.body.domain }, {
          expire: req.body.expire,
          rules: req.body.rules
        },
        function(err, domain) {
          if (err) throw err;
          console.log(domain);
          res.send(JSON.stringify({result: true}));
      });
    }
  }
});

router.post('/', function(req, res, next) {
  res.send('livestreet post');
  router.params = req.body;
  console.log(router.params);
  Domains.findOne({"hash": req.body.token}, function(err, domain) {
    if (domain) {
      router.params.domain = domain.domain;
      app.EventEmitter.emit('sendAll');
    }
  });

});

module.exports = router;
