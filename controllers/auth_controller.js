var async = require('async');
var passport = require('passport');

module.exports = function (app) {
    app.post('/login', passport.authenticate('local'), function (req, res) {
        res.send(req.user);
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    return app;
};