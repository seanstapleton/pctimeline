// Passport login methods
const isLoggedIn = (req, res) => {
    if (req.isAuthenticated()) res.send({ loggedIn: true });
    else res.send({ loggedIn: false });
};

const authenticateUser = (passport, req, res, next) => {
    passport.authenticate('login', (err, user) => {
        if (err) {
          console.log(`error: ${err}`);
          return next(err);
        }
        if (!user) {
          console.log('error user');
          return res.send({ success: false, err });
        }
        req.login(user, (loginErr) => {
          console.log(user, loginErr);
          if (loginErr) {
            return next(loginErr);
          }
          res.send({ success: true });
        });
      })(req, res, next);
}

module.exports = {
    isLoggedIn,
    authenticateUser
}
