/*
 * Endpoints for manually signing users up for Reify
 */
var _ = require('underscore');
var async = require('async');

module.exports = function (app) {

    app.get('/user_signup', function (req, res) {

        res.render('manual_signup');
    });

    app.post('/user_signup', function(req, res) {

        //Ensure user input fields are present
        var errors = {};
        var userFields = [
            'first-name',
            'last-name',
            'email',
            'addr1',
            'zip',
            'city',
            'state',
            'pass',
            'conf-pass'
        ];
        _.each(userFields, function (field) {
            if (_.isEmpty(req.body[field])) {
                errors[field] = 'Cannot be empty';
            }
        });
        if (req.body.pass !== req.body['conf-pass']) {
            errors.pass = errors.conf_pass = 'Passwords do not match';
        }

        //Ensure measurement fields are present
        var measFields = [
          'height',
          'weight',
          'gender'
        ];
        _.each(measFields, function (field) {
            if (_.isEmpty(req.body[field])) {
                errors[field] = 'Cannot be empty';
            }
        });

        //Return if errors were found
        if (!_.isEmpty(errors)) {
            return res.render('manual_signup', {errors: errors, values: req.body});
        }

        //Persist data
        async.auto({
            user: function (callback) {

                var userData = {};
                userData.firstName = req.body['first-name'];
                userData.lastName = req.body['last-name'];
                userData.email = req.body['email'];
                userData.addr1 = req.body['addr1'];
                userData.addr2 = req.body['addr2'];
                userData.city = req.body['city'];
                userData.state = req.body['state'];
                userData.zip = req.body['zip'];
                userData.password = req.body['pass'];

                app.models.User.create(userData, callback);

            },
            measurements: ['user', function (callback, results) {
                var measData = _.pick(req.body,
                    'gender',
                    'weight',
                    'height'
                );
                measData.user_id = results.user.id;
                app.models.Measurements.create( measData, callback);
            }]
        }, function (err, results) {
            if (err) {
                console.log("Error: " + err);
                return res.send('An error occurred: '+ err);
            }
        });


        console.log("Successfully signed up " + req.body['first-name']);
        return res.render('manual_signup');
    });
}