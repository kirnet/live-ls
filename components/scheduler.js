'use strict';

var Domains = require('../models/domains.js');

module.exports.clearCounters = function() {
  var schedule = require('node-schedule');
  var rules = new schedule.RecurrenceRule();
  rules.hour = 0;
  rules.minute = 0;
  console.log('scheduler start');
  var j = schedule.scheduleJob(rules, function() {
    Domains.update({},{ $set: { counter: 0 } }, {multi: true}, function (err, rows) {
      console.log(err, rows);
    });
  });

};
