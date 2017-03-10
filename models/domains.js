'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Domains = new Schema({
  domain  : String,
  expire  : Number,
  rules   : Object
});

module.exports = mongoose.model('domains', Domains);
