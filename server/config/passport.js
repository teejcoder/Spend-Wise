var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const passport = require("passport");
require("dotenv").config({ path: "./config/.env" });
const User = require("../models/User");


module.exports = function(passport) {
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACKURL,
    },
    async function (accessToken, refreshToken, profile, cb) {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          avatar: profile.photos[0].value,
        });
      }
      cb(null, user);
    }
  )
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

}

module.exports = passport;