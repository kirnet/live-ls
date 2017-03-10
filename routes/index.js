const express = require('express');
const passport = require('passport');
const Account = require('../models/account');
const Domains = require('../models/domains.js');
const router = express.Router();

router.get('/', function(req, res, next) {
  if (!req.user) {
    res.redirect('/login');
    return false;
  }

  Domains.find({}, function(err, domains) {
    if (err) throw err;

    res.render('index', {
      title: "Домены",
      domains: domains,
      moment: require('moment')
    });
  });
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), function(req, res, next) {
  req.session.save(function(err) {
    if (err) {
      return next(err);
    }
  res.redirect('/');
  });
});

router.get('/logout', function(req, res, next) {
  req.logout();
  req.session.save(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/login');
  });
});

module.exports = router;
