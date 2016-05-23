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
                return next('Reset password token expired. Reset your password on the "forgot password" page');
            }
            res.render('set-password', {
                user: req.user
            });
        });
    });

    /*
     * Set's the password of a new user
     */
    app.post('/set-password/:token', function (req, res, next) {

        resetPassword(req.params.token, req.body.password, function (err) {
            if(err) {
                //TODO Redirect to "forgot password" page
                return next(err);
            }

            //TODO redirect to dashboard
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
                        console.log("Successfully updated password");
                        //req.logIn(user, function(err) {
                        //    done(err, user);
                        //});
                        //TODO login user
                        done(err, user);
                    });
                });
            },
            function(user, done) {
                //TODO send notification email to user
                done();
            }
        ], function(err) {
            if(err) {
               return callback(err);
            }
            console.log('Updated!');
        });
    }


    return app;
};

