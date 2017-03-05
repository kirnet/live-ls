var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

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

  // res.render('index', { title: 'Express' });
});



// module.exports.list = function(req, res) {
//
// };

module.exports = router;
