// config/passport.js

// load all the things we need
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;



// load up the user model
var bcrypt = require('bcrypt-nodejs');
var slug = require('slug');

console.log('yo');
// expose this function to our app using module.exports
module.exports = function(passport, models, dbQueries, config) {

    var User = models.User;

    var opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
    opts.secretOrKey = config.secret;
    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        User.findById(jwt_payload._id, function(err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                done(null, user);
            } else {
                done(null, false);
                // or you could create a new account
            }
        });
    }));
};