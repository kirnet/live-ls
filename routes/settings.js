'use strict';

var express = require('express');
var router = express.Router();
const passport = require('passport');
var crypto = require('crypto');
var Account = require('../models/account.js');
const mongoose = require('mongoose');

router.use(function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/login');
    return false;
  }
  console.log('Time:', Date.now());
  next();
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('settings');
});

router.post('/changePassword', function(req, res, next) {
  Account.findOne({username: req.user.username}, 'username salt hash', function (err, user) {
    (function(req, res, user) {
      var pass = crypto.pbkdf2Sync(req.body.password, user.salt, 25000, 512, 'sha256'),
          response = {
            error: false
          };

      pass = new Buffer(pass, 'binary').toString('hex');
      if (pass == user.hash) {
        pass = crypto.pbkdf2Sync(req.body.new_pass, user.salt, 25000, 512, 'sha256');
        pass = new Buffer(pass, 'binary').toString('hex');

        user.update({"hash": pass}).exec(function(err, result){
          if (err) throw err;
          if (result.ok) {
            res.send(JSON.stringify(response));
          }
        });

        return false;
      }
      response.error = true;
      response.message = 'invalid password';
      res.send(JSON.stringify(response));
    })(req, res, user);
  });

  return false;
  res.redirect('/settings');
});


module.exports = router;