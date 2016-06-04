/*
 * Endpoints for manually signing users up for Reify
 */
var _ = require('underscore');
var async = require('async');
var crypto = require('crypto');
var path = require("path");
var fs   = require("fs");
var request = require('request');

module.exports = function (app) {

    app.get('/user_signup', function (req, res) {

        res.render('manual-signup');
    });

    app.post('/user_signup', function(req, res, next) {

        //Ensure user input fields are present
        var errors = {};
        var userFields = [
            'first-name',
            'last-name',
            'email',
            'addr1',
            'zip',
            'city',
            'state'
        ];
        _.each(userFields, function (field) {
            if (_.isEmpty(req.body[field])) {
                errors[field] = 'Cannot be empty';
            }
        });

        //Ensure measurement fields are present
        var measFields = [
            'height',
            'weight',
            'gender',
            'neck',
            'shoulder',
            'chest',
            'torso',
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
            return res.render('manual-signup', {errors: errors, values: req.body});
        }

        //Persist data
        async.auto({
            token: function(callback) {
                crypto.randomBytes(20, function(err, buf) {
                    var token = buf.toString('hex');
                    callback(err, token);
                });
            },
            user: ['token', function (callback, results) {

                var userData = {};
                userData.firstName = req.body['first-name'];
                userData.lastName = req.body['last-name'];
                userData.email = req.body['email'];
                userData.streetAddr1 = req.body['addr1'];
                userData.streetAddr2 = req.body['addr2'];
                userData.city = req.body['city'];
                userData.state = req.body['state'];
                userData.zip = req.body['zip'];

                userData.resetPasswordToken = results.token;
                userData.resetPasswordExpires = Date.now() + 31536000000; // 1 year

                app.models.User.create(userData, callback);

            }],
            measurements: ['user', function (callback, results) {
                var measData = {};
                measData.user_id = results.user.id;
                measData.height = req.body['height'];
                measData.weight = req.body['gender'];
                measData.gender = req.body['weight'];
                measData.neck = req.body['neck'];
                measData.shoulder = req.body['shoulder'];
                measData.chest = req.body['chest'];
                measData.torso = req.body['torso'];
                measData.sleeve = req.body['sleeve'];
                measData.shirt_fit_pref = req.body['shirt-fit-pref'];
                measData.waist = req.body['waist'];
                measData.inseam = req.body['inseam'];
                measData.outseam = req.body['outseam'];
                measData.thigh = req.body['thigh'];
                measData.pant_fit_pref = req.body['pant-fit-pref'];
                measData.notes = req.body['notes'];

                app.models.Measurements.create( measData, callback);
            }],
            updateUser: ['measurements', function (callback, results) {
                //Update the user that was previously created with the new measurements document
                app.models.User.findById(results.user.id, function(err, user) {
                    user.measurements = results.measurements.id;
                    user.save(callback);
                });

            }],
            email: ['updateUser', function(callback, results) {
                //Get html for email content
                var publicPath = path.resolve(__dirname, "../public");
                var htmlPath = path.join(publicPath, "email/waitlist-conf.html");
                var html = fs.readFileSync(htmlPath, "utf8");

                //Mailgun
                request({
                    method: 'POST',
                    uri: 'https://api.mailgun.net/v3/reify.fit/messages',
                    form: {
                        from: 'Reify <support@reify.fit>',
                        to: [results.user.email],
                        bcc: 'jason@reify.fit',
                        'h:Reply-To': 'noreply@reify.fit',
                        subject: 'You\'re on the wait list!',
                        html: html
                    },
                    headers: {
                        Authorization: 'Basic ' + new Buffer('api:key-0a2523576d0095dee43244887fa7ee4b').toString('base64')
                    }
                })

                return callback();
            }]
        }, function (err, results) {
            if (err) {
                if(err.code === 11000) {
                    errors.email = 'Email already registered';
                    return res.render('manual-signup', {errors: errors, values: req.body});
                }
                errors.email = 'An error occurred during registration';
                return res.render('manual-signup', {errors: errors, values: req.body});
            }

            var msg = "Successfully signed up " + req.body['email'];
            console.log(msg);
            return res.render('manual-signup', {success: msg});
        });

    });
}