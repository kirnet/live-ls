'use strict';

const express = require('express');
const passport = require('passport');
// const Account = require('../models/account');
const Domains = require('../models/domains.js');
const router = express.Router();

router.get('/', function(req, res, next) {
  if (!req.user) {
    res.redirect('/login');
    return false;
  }

  var perPage = 50,
      page = 1;

  if (req.query.page && parseInt(req.query.page) > 0) {
    page = req.query.page;
  }
  var skip = page * perPage - perPage;

  Domains.count('domains', function(err, allDocs) {
    Domains.find({}, {}, { skip: skip, limit: perPage, sort: {domain: 1} }, function(err, domains) {
      if (err) throw err;
      res.render('index', {
        title: "Домены",
        domains: domains,
        moment: require('moment'),
        error: req.flash('error'),
        pages: Math.ceil(allDocs / perPage)
      });
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
