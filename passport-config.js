const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcrypt");
const Account = require("./models/Account"); // Import Mongoose model

function initialize(passport) {
  const authenticateUser = async (username, password, done) => {
    try {
      const user = await Account.findOne({ username: username });

      if (!user) {
        return done(null, false, { message: "User not found" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (match) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Wrong password" });
      }
    } catch (err) {
      return done(err);
    }
  };

  passport.use(new LocalStrategy(
    { usernameField: "username", passwordField: "password" },
    authenticateUser
  ));

  passport.serializeUser((user, done) => {
    done(null, user._id); // Mongoose uses _id
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await Account.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
}

module.exports = initialize;
