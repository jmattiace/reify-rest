/*
 * Controller to handle account pages from the user dashboard
 */
var auth = require('../utils/auth');

module.exports = function (app) {

    app.get('/dashboard/account', auth.ensureAuthenticated, function(req, res) {

        return res.send('Dashboard - orders')
    });

    return app;
};