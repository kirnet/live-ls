var express = require('express');
var router = express.Router();
//const passport = require('passport');

/* GET users listing. */
router.get('/', function(req, res, next) {
  if (!req.user) {
    res.redirect('/login');
    return false;
  }

  res.render('clients');
});

module.exports = router;