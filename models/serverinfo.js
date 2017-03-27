'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServerInfo = new Schema({
  maxOnlineCounter: { type:Number, default: 0}
});

module.exports = mongoose.model('serverinfo', ServerInfo);
