const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const crypto = require('crypto');

const Account = new Schema({
  username: { type: String, required: true, unique: true },
  password: String,
  role: {type: Number, default: 1}
});

Account.plugin(passportLocalMongoose);

Account.methods.comparePassword = function(pw, cb) {
  var pass = crypto.pbkdf2Sync(pw, this.salt, 25000, 512, 'sha256'),
      isMatch = false;
  pass = new Buffer(pass, 'binary').toString('hex');

  if (pass == this.hash) {
    isMatch = true;
  }
  cb(isMatch);
};

module.exports = mongoose.model('accounts', Account);
