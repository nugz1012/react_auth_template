const jwt = require('jsonwebtoken');
const moment = require('moment');

// CONFIG
const { 
    ACCESS_ENCRYPTION, 
    ACCESS_EXPIRATION, 
    REFRESH_ENCRYPTION, 
    REFRESH_EXPIRATION 
} = require('../config/jwt');

function refresh (tokens) {

    let { access, refresh } = tokens;
    
    // Validate access token
    const accessTokenStatus = validateToken(access, ACCESS_ENCRYPTION);

    if (accessTokenStatus.error) {
        // Check if the access token threw an invalid error.
        if (accessTokenStatus.error.indexOf('invalid') > -1) {
            // res.clearCookie('jwt', { signed: true, httpOnly: true, });
            // res.status(401).json({ error: true, message: `Token Error: ${accessTokenStatus.error || 'unknown'}` }).end();
            return [`Token Error: ${accessTokenStatus.error || 'unknown'}`, null];
        }

        // Get refresh token status
        const refreshTokenStatus = validateToken(refresh, REFRESH_ENCRYPTION);
        
        // If refresh token threw any error, bail
        if (refreshTokenStatus.error) {
            // res.clearCookie('jwt', { signed: true, httpOnly: true, }); 
            // res.status(401).json({ error: true, message: `Token Error: ${refreshTokenStatus.error || 'unknown'}` }).end();
            return [`Token Error: ${refreshTokenStatus.error || 'unknown'}`, null];
        }

        // Parse refresh token
        const { sub, aud, exp } = refreshTokenStatus.parsed;
        const refreshTokenTTL = moment.unix(exp).diff(moment.now()); // TTL in ms
        
        // Verify refresh token has not expired.
        if (refreshTokenTTL <= 0) {
            // res.clearCookie('jwt', { signed: true, httpOnly: true, }); 
            // res.status(401).json({ error: true, message: 'Session expired. Login required.' });
            return ['Session expired. Login required.', null];
        }

        /**
         * DB CALL TO CHECK IF THE REFRESH 
         * TOKEN IS BLACKLISTED BEFORE ISSUING 
         * A NEW ACCESS TOKEN
         */
        const isBlacklisted = false;

        if (isBlacklisted) {
            // res.clearCookie('jwt', { signed: true, httpOnly: true, });
            // res.status(401).json({ error: true, message: 'Attempted to use a blacklisted token. Login required.' }).end();
            return ['Attempted to use a blacklisted token. Login required.', null];
        }

        // Check if refresh token is in its window to renew
        if (refreshTokenTTL <= 57600000) { // Less than 16 hours
        // if (refreshTokenTTL <= 10000) { // Less than 16 hours

            /**
            * DB CALL TO BLACKLIST THE 
            * CURRENT REFRESH TOKEN
            */

            
            // RENEW REFRESH TOKEN
            refresh = jwt.sign({ sub, aud }, REFRESH_ENCRYPTION, {  expiresIn: REFRESH_EXPIRATION });
        }

        // Check to ensure the target user is matched between the access and refresh token.
        if (accessTokenStatus.parsed.aud !== aud) {
            // res.clearCookie('jwt', { signed: true, httpOnly: true, });
            // res.status(401).json({ error: true, message:  }).end();
            return ['Token relationship does not match. Login required.', null];
        }
        
        // RENEW ACCESS TOKEN
        access = jwt.sign({ sub, aud }, ACCESS_ENCRYPTION, {  expiresIn: ACCESS_EXPIRATION });

        /**
        * DB CALL TO SET NEW ACCESS TOKEN
        * TO ALLOW FOR ADMINS TO TRACK
        * ACTIVE USERS
        */

        // req.headers['authorization'] = `Bearer ${access}`;
        // res.cookie('jwt', { access, refresh }, { signed: true, httpOnly: true, });
        // res.set('token', access);
    }

    return [null, {access, refresh}];
}
module.exports.refresh = refresh;

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