const jwt = require('jsonwebtoken');
const moment = require('moment');

// CONFIG
const { 
    ACCESS_ENCRYPTION, 
    ACCESS_EXPIRATION, 
    REFRESH_ENCRYPTION, 
    REFRESH_EXPIRATION 
} = require('../config/jwt');

module.exports = function (req, res) {
    if (req.signedCookies && req.signedCookies.jwt) {

        let { access, refresh } = req.signedCookies.jwt;
        
        // Validate access token
        const accessTokenStatus = validateToken(access, ACCESS_ENCRYPTION);

        if (accessTokenStatus.error) {
            // Check if the access token threw an invalid error.
            if (accessTokenStatus.error.indexOf('invalid') > -1) {
                res.clearCookie('jwt', { signed: true, httpOnly: true, });
                res.status(401).json({ error: true, message: `Token Error: ${accessTokenStatus.error || 'unknown'}` }).end();
                return;
            }

            // Get refresh token status
            const refreshTokenStatus = validateToken(refresh, REFRESH_ENCRYPTION);
            
            // If refresh token threw any error, bail
            if (refreshTokenStatus.error) {
                res.clearCookie('jwt', { signed: true, httpOnly: true, }); 
                res.status(401).json({ error: true, message: `Token Error: ${refreshTokenStatus.error || 'unknown'}` }).end();
                return;
            }

            // Parse refresh token
            const { sub, aud, exp } = refreshTokenStatus.parsed;
            const refreshTokenTTL = moment.unix(exp).diff(moment.now()); // TTL in ms
            
            // Verify refresh token has not expired.
            if (refreshTokenTTL <= 0) {
                res.clearCookie('jwt', { signed: true, httpOnly: true, }); 
                res.status(401).json({ error: true, message: 'Session expired. Login required.' });
                return;
            }

            /**
             * DB CALL TO CHECK IF THE REFRESH 
             * TOKEN IS BLACKLISTED BEFORE ISSUING 
             * A NEW ACCESS TOKEN
             */
            const isBlacklisted = false;

            if (isBlacklisted) {
                res.clearCookie('jwt', { signed: true, httpOnly: true, });
                res.status(401).json({ error: true, message: 'Attempted to use a blacklisted token. Login required.' }).end();
                return;
            }

            // Check if refresh token is in its window to renew
            // if (refreshTokenTTL <= 57600000) { // Less than 16 hours
            if (refreshTokenTTL <= 10000) { // Less than 16 hours

                /**
                * DB CALL TO BLACKLIST THE 
                * CURRENT REFRESH TOKEN
                */

                
                // RENEW REFRESH TOKEN
                refresh = jwt.sign({ sub, aud }, REFRESH_ENCRYPTION, {  expiresIn: REFRESH_EXPIRATION });
            }

            // Check to ensure the target user is matched between the access and refresh token.
            if (accessTokenStatus.parsed.aud !== aud) {
                res.clearCookie('jwt', { signed: true, httpOnly: true, });
                res.status(401).json({ error: true, message: 'Token relationship does not match. Login required.' }).end();
                return;
            }
            
            // RENEW ACCESS TOKEN
            access = jwt.sign({ sub, aud }, ACCESS_ENCRYPTION, {  expiresIn: ACCESS_EXPIRATION });

            /**
            * DB CALL TO SET NEW ACCESS TOKEN
            * TO ALLOW FOR ADMINS TO TRACK
            * ACTIVE USERS
            */

            req.headers['authorization'] = `Bearer ${access}`;
            res.cookie('jwt', { access, refresh }, { signed: true, httpOnly: true, });
            res.set('token', access);

        } else if (!req.headers['authorization']) {
            req.headers['authorization'] = `Bearer ${access}`;
            res.set('token', access);
        }
    }
}

const validateToken = (token, secret) => {
    return jwt.verify(token, secret, (error, parsed) => {

        if (!parsed && error.message.indexOf('signature') < 0) {
            parsed = jwt.decode(token);
        }

        return {
            error: error && error.message,
            parsed,
        }
    });
}


// const invalid = jwt.verify(access,'JWT_ACCESS_ENCRYPTION',
// // const invalid = jwt.verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTU1OTM2NTI5OSwiZXhwIjoxNTU5MzY1Mzk5fQ.p23veQw63al0HttZyo9Ye6dOnKjVyghByLaqnxMkkZg','JWT_ACCESS_ENCRYPTION',
// (err) => {
//     if () {
//         return true;
//     }
//     return false;

//     switch () {
//         case 'invalid token':
//             return 'invalid token';
//         case 'invalid signature':
//             return 'invalid signature';
//         default:
//             return false;
//     }
// });