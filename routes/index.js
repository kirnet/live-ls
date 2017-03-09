const express = require('express');
const passport = require('passport');
//const Account = require('../models/account');
const router = express.Router();

router.get('/', function(req, res, next) {
  if (!req.user) {
    res.redirect('/login');
    return false;
  }
  req.getConnection(function(err,connection){
    connection.query('SELECT * FROM tokens',function(err,rows) {
      if(err) console.log("Error Selecting : %s ", err);
      res.render('index', {
        title:"Tokens list",
        tokens: rows,
        moment: require('moment')
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
