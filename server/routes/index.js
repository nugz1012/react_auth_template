const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

require('../middleware/passport')(passport); 

// CONFIG
const { 
    ACCESS_ENCRYPTION, 
    ACCESS_EXPIRATION, 
    REFRESH_ENCRYPTION, 
    REFRESH_EXPIRATION 
} = require('../config/jwt');

const router = express.Router();

const validate = require('../middleware/validate');

router.use((req, res, next) => {
    validate(req, res);
    next();
});

router.post('/login', (req, res) => {
    const access = jwt.sign({ sub: 1, aud: 'a@a.com' }, ACCESS_ENCRYPTION, {  expiresIn: ACCESS_EXPIRATION });
    const refresh = jwt.sign({ sub: 1, aud: 'a@a.com' }, REFRESH_ENCRYPTION, { expiresIn: REFRESH_EXPIRATION });
    res.cookie('jwt', { access, refresh }, { signed: true, httpOnly: true, });
    res.status(200).json({ user: { id: 1, email: 'a@a.com' }, token: access });
});
router.post('/logout', (req, res) => {
    res.clearCookie('jwt');
    setTimeout(() => {
        res.status(200).send();
    }, 2000);
});
router.get('/token', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.status(200).json({ user: { id: 1, email: 'a@a.com' }});
});
router.get('/secret', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.status(200).send();
    // setTimeout(() => {
    // }, 2000);
});

module.exports = router;