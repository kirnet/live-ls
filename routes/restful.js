'use strict';

const passport = require('passport');
const express = require('express');
const config = require('../config/restful');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Account = require('../models/account');
const requireAuth = passport.authenticate('jwt', { session: false });

require('../config/passport')(passport);

router.get('/', requireAuth, function(req, res) {
  res.json({result:'ok'});
});

router.post('/authenticate', function(req, res) {
  Account.findOne({username: req.body.username}, 'username salt hash', function(err, user) {
    if (err) throw err;

    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication failed. User not found.' });
    } else {
      // Check if password matches
      user.comparePassword(req.body.password, function(isMatch) {
        if (isMatch) {
          // Create token if the password matched and no error was thrown
          const token = jwt.sign(user, config.secret, {
            expiresIn: config.sessionTime // in seconds
          });
          res.status(200).json({ success: true, token: 'JWT ' + token });
        } else {
          res.status(401).json({ success: false, message: 'Authentication failed. Passwords did not match.' });
        }
      });
    }
  });
});

module.exports = router;



