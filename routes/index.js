'use strict';

const express = require('express');
const passport = require('passport');
const Domains = require('../models/domains.js');
const router = express.Router();
var isJSON = require('is-json');
const Accounts = require('../models/account.js');
var config = require('../config/main.js');

router.get('/', function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/login');
    return false;
  }

  if (req.user.role < 100) {
    res.redirect('/profile');
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
        filter: filter,
      });
    });
  });
});

router.get('/login', function(req, res, next) {
  res.render('login', {
    allowSingUp: config.allowSingUp
  });
});

router.get('/registration', function(req, res, next) {
  if (!config.allowSingUp) {
    res.redirect('/');
    return;
  }
  res.render('registration');
});

router.post('/registration', function(req, res, next) {
  if (!config.allowSingUp) {
    res.redirect('/');
    return;
  }
  var errors = false;
  req.checkBody('username', 'Username is empty').notEmpty();
  req.getValidationResult().then(function(result) {
    if (!result.isEmpty()) {
      errors = result.mapped();
      //res.send(result.array());
      res.render('registration', {
        errors: errors,
        username: req.body.username
      });
      console.log(result.array());
      return false;
    }
    Accounts.findOne({username: req.body.username}, 'username', function (err, user) {
      if (user) {
        errors = {username:'Already exists'};
      }

      if (!errors) {

        Account.register(new Account({username: req.body.username}), req.body.password, function (err, account) {
          if (err) {
            return res.render('registration', {errors: err.message});
          }

          passport.authenticate('local')(req, res, function () {
            req.session.save(function (err) {
              if (err) {
                return next(err);
              }
              res.redirect('/');
            });
          });
        });

        res.redirect('/login');
        return false;
      }
      res.render('registration', {
        errors: errors,
        username: req.body.username
      });
    });
  });
  console.log(req.body);
  //res.render('registration');
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: false }), function(req, res, next) {
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
