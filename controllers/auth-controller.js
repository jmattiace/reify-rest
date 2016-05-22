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

    app.get('/set-password', function(req, res) {
        res.render('set-password');
    });

    app.post('/set-password', function (req, res) {

        //Ensure passwords are equal
        if (req.body.pass !== req.body['conf-pass']) {
            var errors= {};
            errors.pass = errors.conf_pass = 'Passwords do not match';
            res.send('Passwords do not match');
            //TODO render set-password page with errors
        }

        //Update user data
        var userData = {};
        userData.email = req.body['email'];
        userData.password = req.body['pass'];
        var query = {'email': userData.email};
        app.models.User.findOneAndUpdate(query, userData, function(err) {
            if(err) {
                console.log('Error updating password for ' + userData.email);
            }
        });

        //TODO redirect to dashboard
        res.send('Updated!');
    });

    return app;
};