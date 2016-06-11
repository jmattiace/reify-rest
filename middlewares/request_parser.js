var _ = require('underscore');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var LocalStrategy = require('passport-local').Strategy;
var LocalAPIKeyStrategy = require('passport-localapikey').Strategy;

module.exports = function (app) {
    app.use(cookieParser());
    var redisSessionSettings = require('../config/session')({ type: app.environment });

    var RedisStore = require('connect-redis')(session);
    app.use(session({
        store: new RedisStore(redisSessionSettings),
        secret: 'allisonisawitch'
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function (user, done) {
        done(null, user.get('id'));
    });

    passport.deserializeUser(function (id, done) {
        app.models.User.findById(id, done);
    });

    passport.use('local', new LocalStrategy({ usernameField : 'email', passwordField : 'password', passReqToCallback : true }, localStrategyHandler));
    passport.use('web', new LocalStrategy({ usernameField : 'email', passwordField : 'password', passReqToCallback : true }, webStrategyHandler));
    passport.use('localapikey', new LocalAPIKeyStrategy(localApiKeyStrategyHandler));

    function localApiKeyStrategyHandler (apikey, done) {
      app.models.User.findOne({ apiKey: apikey }, function (err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      });
    };

    function localStrategyHandler (req, email, password, done) {
        var normalizedEmail = _.isString(email) ? email.toLowerCase() : email;

        app.models.User.findOne({ email: normalizedEmail }, function (err, user) {
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(new Error('User not found'));
            }

            app.services.authService.isPasswordCorrect(user.get('password'), password, function (err) {
                if (err) {
                    return done(err);
                }

                return done(null, user);
            });
        });
    }

    function webStrategyHandler (req, email, password, done) {
        var normalizedEmail = _.isString(email) ? email.toLowerCase() : email;

        app.models.User.findOne({ email: normalizedEmail }, function (err, user) {
            if (err) {
                return done(err);
            }

            var errors = {
                email: 'Email and password are not correct',
                password: 'Email and password are not correct'
            };

            if (!user) {
                return req.res.render('login', { errors: errors, values: { email: email, password: '' } });
            }

            app.services.authService.isPasswordCorrect(user.get('password'), password, function (err) {
                if (err) {
                    return req.res.render('login', { errors: errors, values: { email: email, password: '' } });
                }

                return done(null, user);
            });
        });
    }
//Comment out lines 96-113 in order to run prod locally
    app.use(function (req, res, next) {
        if((!req.secure) && (req.get('X-Forwarded-Proto') !== 'https') && process.env.NODE_ENV === 'production') {
            res.redirect('https://' + req.get('Host') + req.url);
        }
        next();
    });

    app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
        if ('OPTIONS' == req.method) {
             res.send(200);
         } else {
             next();
         }
    });

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());

    app.use(expressValidator());

    return app;
};
