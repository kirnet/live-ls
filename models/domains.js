'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Domains = new Schema({
  domain    : { type: String, required: true, unique: true },
  hash      : String,
  expire    : { type: Number, required: true },
  rules     : Object,
  counter   : { type:Number, default: 0},
  maxCounter: { type:Number, default: 0}
});

module.exports = mongoose.model('domains', Domains);
