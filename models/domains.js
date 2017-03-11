'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Domains = new Schema({
  domain  : { type: String, required: true, unique: true },
  hash    : String,
  expire  : { type: Number, required: true },
  rules   : Object
});

module.exports = mongoose.model('domains', Domains);
