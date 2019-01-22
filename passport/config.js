const LocalStrategy = require('passport-local');

module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, 'pctumich');
  });

  passport.deserializeUser((id, done) => {
    done(undefined, { id: 'pctumich' });
  });

  passport.use('login', new LocalStrategy({
    usernameField: 'id',
    passwordField: 'password',
    passReqToCallback: true,
  }, (req, email, password, done) => {
    if (password !== process.env.loginPwd) return done(null, false, req.flash, ('loginMessage', 'Incorrect Password'));
    return done(null, { id: 'pctumich' });
  }));
};
