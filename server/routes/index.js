const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

require('../middleware/passport')(passport); 
const validate = require('../middleware/validate');

// CONFIG
const { 
    ACCESS_ENCRYPTION, 
    ACCESS_EXPIRATION, 
    REFRESH_ENCRYPTION, 
    REFRESH_EXPIRATION 
} = require('../config/jwt');

// SERVICES
const Token = require('../services/Token.service');

const router = express.Router();

router.use(validate);

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
// router.get('/token', (req, res) => {
//     // res.status(200).json({ user: { id: 1, email: 'a@a.com' }});
// });
router.get('/token', (req, res) => {
    [err, tokens] = Token.refresh(req.signedCookies.jwt);  

    if (err) {
        res.status(401).json({ error: true, message: err });
    }

    const { access, refresh } = tokens;  

    res.cookie('jwt', { access, refresh }, { signed: true, httpOnly: true, });
    res.status(201).send({ token: access });
});
router.get('/secret', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.status(200).json({ message: 'pwnt' });
    // setTimeout(() => {
    // }, 2000);
});

module.exports = router;