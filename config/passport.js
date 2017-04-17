const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Account = require('../models/account');
const config = require('../config/restful');

// Setup work and export for the JWT passport strategy
module.exports = function(passport) {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    secretOrKey: config.secret
  };
  passport.use(new JwtStrategy(opts, function(jwtPayload, done) {
    const userId = jwtPayload._doc._id;
    Account.findById(userId, function(err, user) {
      if (err) {
        return done(err, false);
      }
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    });
  }));
};
