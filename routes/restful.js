'use strict';

const passport = require('passport');
const express = require('express');
const config = require('../config/restful');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Account = require('../models/account');
const Domains = require('../models/domains');
const requireAuth = passport.authenticate('jwt', { session: false });
const moment = require('moment');
const crypto = require('crypto');

require('../config/passport')(passport);

router.get('/', requireAuth, function(req, res) {
  res.json({result:'ok'});
});

router.post('/add_domain', requireAuth, function(req, res) {
  let response = {
    errors: []
  };
  req.checkBody('domain').notEmpty();
  req.getValidationResult().then(function(result) {
    if (!result.isEmpty()) {
      res.status(400);
      response.errors = result.array();
      res.send(response);
    } else {
      let domain = req.body.domain.replace(/http:\/\/|https:\/\/|www./g, '');
      let newDomain = new Domains({
        domain: domain,
        expire: moment().add(1, 'month').unix(),
        hash: crypto.createHash('sha1').update(req.body.domain).digest("hex")
      });

      newDomain.save(function(err, domain) {
        if (err)  {
          if (err.code == 11000) {
            response.errors = {'domain': 'Такой домен уже существует'};
          }
        } else {
          Account.findOneAndUpdate({ _id: req.user._id}, {$push: {domains: domain._id}}).exec();
          response.result = 'ok';
        }
        res.send(response);
      });
    }
  });
});

router.get('/list_domains', requireAuth, function(req, res) {
  let response = {
    errors: []
  };
  Account.findOne({_id: req.user._id}, function(err, user) {
    if (err) throw err;
    if (user) {
      Domains.find({_id:{$in:user.domains}}, function(err, domains){
        res.send(domains);
      });
    }
  });
  //res.json({result:'ok'});
});

router.delete('/delete_domain', requireAuth, function(req, res) {
  let response = {
    errors: []
  };
  req.checkBody('domain').notEmpty();
  req.getValidationResult().then(function(result) {
    if (!result.isEmpty()) {
      res.status(400);
      response.errors = result.array();
      res.send(response);
    } else {
      Domains.findOne({domain: req.body.domain}, function(err, domain) {
        if (err) throw err;
        if (!domain) {
          response.errors = {'domain': 'Домен не найден'};
          res.send(response);
          return
        }
        Account.findOne({username: req.user.username}, function(err, user) {
          let domainIndex = user.domains.indexOf(domain._id);
          if (domainIndex > -1) {
            user.domains.splice(domainIndex, 1);
            Account.findOneAndUpdate({username: user.username}, {$set: {domains:user.domains}}).exec();
            Domains.findOneAndRemove({_id: domain._id }, function(err) {
              if (err) throw err;
              response.result = 'ok';
              res.send(response);
            });
          } else {
            response.errors = {'domain': 'Нет прав'};
            res.send(response);
          }
        });
      });
    }
  });
});

router.post('/login', function(req, res) {
  Account.findOne({username: req.body.username || req.body.email}, 'username salt hash', function(err, user) {
    if (err) throw err;

    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication failed. User not found.' });
    } else {
      // Check if password matches
      user.comparePassword(req.body.password, function(isMatch) {
        if (isMatch) {
          // Create token if the password matched and no error was thrown
          const token = jwt.sign({hash:user.id}, config.secret, {
            //expiresIn: config.sessionTime // in seconds
          });
          res.status(200).json({ success: true, token: 'JWT ' + token });
        } else {
          res.status(401).json({ success: false, message: 'Authentication failed. Passwords did not match.' });
        }
      });
    }
  });
});

router.post('/register', function(req, res) {
  let response = {
    errors: []
  };
  req.checkBody('email').notEmpty().isEmail();
  req.checkBody('password').notEmpty();

  req.getValidationResult().then(function(result) {
    if (!result.isEmpty()) {
      res.status(400);
      response.errors = result.array();
    } else {
      Account.register(new Account({username: req.body.email}), req.body.password, function (err, account) {
        if (err) {
          response.errors = err.message;
        } else {
          console.log(account);
          response.userId = account._id;
        }
        res.send(response);
      });
    }
  });

});

module.exports = router;