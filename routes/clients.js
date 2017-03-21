var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/login');
    return false;
  }

  res.render('clients');
});

module.exports = router;