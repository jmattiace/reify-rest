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
            'gender',
            'neck',
            'shoulder',
            'chest',
            'sleeve',
            'shirt-fit-pref',
            'waist',
            'inseam',
            'outseam',
            'thigh',
            'pant-fit-pref'
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
                var measData = {};
                measData.user_id = results.user.id;
                measData.height = req.body['height'];
                measData.weight = req.body['gender'];
                measData.gender = req.body['gender'];
                measData.neck = req.body['neck'];
                measData.shoulder = req.body['shoulder'];
                measData.chest = req.body['chest'];
                measData.sleeve = req.body['sleeve'];
                measData.shirt_fit_pref = req.body['shirt-fit-pref'];
                measData.waist = req.body['waist'];
                measData.inseam = req.body['inseam'];
                measData.outseam = req.body['outseam'];
                measData.thigh = req.body['thigh'];
                measData.pant_fit_pref = req.body['pant-fit-pref'];

                app.models.Measurements.create( measData, callback);
            }]
        }, function (err, results) {
            if (err) {
                console.log("Error: " + err);
                return res.send('An error occurred: '+ err);
            }

            console.log("Successfully signed up " + req.body['email']);
            res.render('manual_signup');
        });

    });
}