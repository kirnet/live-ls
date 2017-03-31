var express = require('express');
var router = express.Router();
var serverInfo = require('../models/serverinfo');
var admin = require('../components/admin');

/* GET users listing. */
router.get('/', function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/login');
    return false;
  }

  serverInfo.findOne({}, function (err, info) {
    if (info === null) {
      info = new ServerInfo();
      info.maxOnlineCounter = 0;
      info.save(function (err) {
        if (err) console.log(err);
      });
    }
    console.log('from mongo', info.maxOnlineCounter);
    admin.maxOnline = info.maxOnlineCounter;
    res.render('clients', {maxOnline: admin.maxOnline});
  });
});

module.exports = router;