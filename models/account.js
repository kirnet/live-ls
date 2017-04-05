const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const Account = new Schema({
  username: { type: String, required: true, unique: true },
  password: String,
  role: {type: Number, default: 1}
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('accounts', Account);
