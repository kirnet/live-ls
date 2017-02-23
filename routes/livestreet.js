var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('livestreet');
});

router.post('/', function(req, res, next) {
  res.send('livestreet post');
  console.log(req.body);
});

module.exports = router;
