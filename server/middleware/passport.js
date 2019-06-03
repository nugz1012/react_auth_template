const { ExtractJwt, Strategy } = require('passport-jwt');

// CONFIG
const { ACCESS_ENCRYPTION } = require('../config/jwt');

module.exports = function(passport) {
    let opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = ACCESS_ENCRYPTION;

    passport.use(new Strategy(opts, async function(jwt, done){
        let err = null;
        const { sub: id } = jwt;

        const user = { id, email: 'a@a.com' };

        if (err) {
            return done(err, false);
        }

        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    }));
}