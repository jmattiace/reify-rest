/*
 * Controller to handle account pages from the user dashboard
 */
var auth = require('../utils/auth');
var _ = require('underscore');

module.exports = function (app) {

    app.get('/dashboard/account', auth.ensureAuthenticated, function(req, res, next) {

        var query = {
            email: req.user.email
        };
        app.models.User.findOne(query, function(err, user) {
            if (err || !user) {
                //Error
                return next('Could not find user: ' + req.user.email, user);
            }

            var values = {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                streetAddr1: user.streetAddr1,
                streetAddr2: user.streetAddr2,
                city: user.city,
                state: user.state,
                zip: user.zip
            };

            return res.render('dashboard/account', { values: values });
        });
    });

    app.post('/dashboard/account', auth.ensureAuthenticated, function (req, res) {
        var requiredFields = [
            'first-name',
            'last-name',
            'addr1',
            'zip',
            'city',
            'state'
        ];
        var errors = {};
        _.each(requiredFields, function (field) {
            if (_.isEmpty(req.body[field])) {
                errors[field] = field + ' cannot be empty';
            }
        });

        if (!_.isEmpty(errors)) {
            return res.render('dashboard/account', { errors: errors, values: req.body });
        }

        var query = {
          email: req.body.email
        };
        app.models.User.findOne(query, function(err, updatedUser) {
            if(err) {
                console.log('Error updating account info for user ' + req.body.email + ': ' + err);
                return res.render('dashboard/account', { values: req.body });
            }
            if (!updatedUser) {
                console.log('Error updating account info for user ' + req.body.email + '. Could not find user.');
                return res.render('dashboard/account', { values: req.body });
            }

            updatedUser.firstName = req.body['first-name'];
            updatedUser.lastName = req.body['last-name'];
            updatedUser.phoneNumber = req.body['phone-number'];
            updatedUser.streetAddr1 = req.body['addr1'];
            updatedUser.streetAddr2 = req.body['addr2'];
            updatedUser.city = req.body['city'];
            updatedUser.state = req.body['state'];
            updatedUser.zip = req.body['zip'];

            updatedUser.save(function(err) {
                if(err) {
                    console.log('Error updating account info for user ' + req.body.email + ': ' + err);
                }

                return res.render('dashboard/account', { values: updatedUser });
            });
        });
    });


    return app;
};