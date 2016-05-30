/*
 * Controller to handle authentication routes
 */

var async = require('async');
var passport = require('passport');
var _ = require('underscore');

module.exports = function (app) {
    app.post('/login', passport.authenticate('local'), function (req, res) {
        res.send(req.user);
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    /*
     * Renders page with given token used to find existing user
     */
    app.get('/set-password/:token', function(req, res, next) {
        var query = {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        };
        app.models.User.findOne(query, function(err, user) {
            if (!user) {
                return next('Set password token expired. Please reset your password on the "forgot password" page');
            }
            res.render('set-password', {
                token: user.resetPasswordToken,
                email: user.email
            });
        });
    });

    /*
     * Set's the password of a new user
     */
    app.post('/set-password/:token', function (req, res, next) {

        if(!req.body.password) {
            return res.render('set-password', {
                token: req.params.token,
                email: req.body.email,
                noPassword: true
            });
        }
        resetPassword(req.params.token, req.body.password, function (err) {
            if(err) {
                //TODO Redirect to "forgot password" page
                return res.send(err);
                //return next(err);
            }

            //Login
            passport.authenticate('local', function(err, user, info) {
                if (err) {
                    return next(err);
                }
                if (!user) {
                    //TODO is this the right page to redirect to?
                    return res.redirect('/login');
                }
                req.logIn(user, function(err) {
                    if (err) {
                        return next(err);
                    }

                    return res.redirect('/dashboard/orders');
                });
            })(req, res, next);
        });
    });

    app.post('/forgot', function(req, res, next) {
        async.waterfall([
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function(token, done) {
                app.models.User.findOne({ email: req.body.email }, function(err, user) {
                    if (!user) {
                        console.log("No user with email " + req.body.email + " found."); //TODO error handling
                        return res.redirect('/forgot');
                    }

                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                    app.models.User.save(function(err) {
                        done(err, token, user);
                    });
                });
            },
            function(token, user, done) {
               //TODO send notification email to user
            }
        ], function(err) {
            if (err) return next(err);
            res.redirect('/forgot');
        });
    });

    app.get('/reset/:token', function(req, res) {
        var query = {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        };
        app.models.User.findOne(query, function(err, user) {
            if (!user) {
                //TODO error handling
                return res.redirect('/forgot');
            }
            res.render('reset', {
                user: req.user
            });
        });
    });

    app.post('/reset/:token', function(req, res) {
        resetPassword(req.params.token, req.body.password);

        //TODO redirect somewhere
        res.redirect('/');
    });

    function resetPassword(token, password, callback) {
        async.waterfall([
            //Set password for user with the given reset-password-token
            function(done) {
                var query = {
                    resetPasswordToken: token,
                    resetPasswordExpires: { $gt: Date.now() }
                };
                app.models.User.findOne(query, function(err, user) {
                    if (!user) {
                        //Error
                        return done('Reset password token expired. Reset your password on the "forgot password" page', user);
                    }

                    user.password = password;
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;

                    user.save(function(err) {
                        if(err) {
                            //TODO redirect to same page
                            return done('Could not save new password: ' + err);
                        }
                        done(err, user);
                    });
                });
            },
            //Send notifcation email
            function(user, done) {
                //TODO send notification email to user
                done();
            }
        ], function(err) {
            if(err) {
               return callback(err);
            }

            return callback(null);
        });
    }


    return app;
};

