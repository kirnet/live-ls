'use strict';

const express = require('express');
const passport = require('passport');
// const Account = require('../models/account');
const Domains = require('../models/domains.js');
var isJSON = require('is-json');
const router = express.Router();

router.get('/', function(req, res, next) {
  if (!req.isAuthenticated()) {
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
    var sort = req.query.sort && isJSON(req.query.sort) ? JSON.parse(req.query.sort) : {domain: 1},
        filter = req.query.filter && isJSON(req.query.filter) ? JSON.parse(req.query.filter) : {},
        mongoFilter = {};
    for (var key in filter) {
      mongoFilter[key] = new RegExp(filter[key]);
    }
    Domains.find(mongoFilter, {}, { skip: skip, limit: perPage, sort: sort }, function(err, domains) {
      if (err) throw err;
      res.render('index', {
        title: "Домены",
        domains: domains,
        moment: require('moment'),
        error: req.flash('error'),
        pages: Math.ceil(allDocs / perPage),
        sort: sort,
        filter: filter
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
