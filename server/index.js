const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const cookieParser = require('cookie-parser')
const pe = require('parse-error');
const cors = require('cors');
const helmet = require('helmet');





/**
|--------------------------------------------------------------------------
| INIT APP
|--------------------------------------------------------------------------
|
*/
const app = express();




/**
|--------------------------------------------------------------------------
| SECURITY
|--------------------------------------------------------------------------
|
*/
// CONFIG HEADERS
app.use(helmet());

//CORS
const whitelist = ['http://localhost:4000'];
// const whitelist = ['http://10.200.204.51'];
app.use(cors({ 
    credentials: true,
    origin: (origin, callback) => {
        if(whitelist.includes(origin))
          return callback(null, true)
    
          callback(new Error('Not allowed by CORS'));
    },
    exposedHeaders: ['token'],
    // preflightContinue: true,
}));





/**
|--------------------------------------------------------------------------
| PARSERS
|--------------------------------------------------------------------------
|
*/
// BODY PARSER
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// COOKIE PARSER
app.use(cookieParser('cookie-secret'));





/**
|--------------------------------------------------------------------------
| MIDDLEWARE
|--------------------------------------------------------------------------
|
*/

// PASSPORT
app.use(passport.initialize()); 





/**
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
|
*/
// HEALTHCHECK ROUTE
app.use('/test', (req, res) => {
    res.status(200).json({ status: "success", message: "API Active", data: null });
});

// MAIN ROUTES
const v1 = require('./routes');
app.use('/v1', v1);
 




/**
|--------------------------------------------------------------------------
| ERROR ROUTES
|--------------------------------------------------------------------------
|
*/

// ERROR 404
app.use(function(req, res, next) {
    const errorMessage = 'Resource not found';
    const err = new Error(errorMessage);

    if(!res.headersSent) {
        res.status(404).send(errorMessage);
    }
    next(err);
}); 

// ERROR 500
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // send error
    if(!res.headersSent) {
        res.status(err.status || 500).send(err.message);
    }
    next();
});




/**
|--------------------------------------------------------------------------
| UNCAUGHT ERRORS
|--------------------------------------------------------------------------
|
*/
process.on('unhandledRejection', error => {
    console.error('Uncaught Error', pe(error));
});





/**
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
|
*/
app.listen(4001, () => console.log('API running on port 4001'));
