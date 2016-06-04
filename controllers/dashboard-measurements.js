/*
 * Controller to handle measurements pages from the user dashboard
 */
var auth = require('../utils/auth');
var _ = require('underscore');

module.exports = function (app) {

    app.get('/dashboard/measurements', auth.ensureAuthenticated, function(req, res, next) {

        //Get the measurements based off of the user email
        var query = {
            email: req.user.email
        };
        app.models.User.findOne(query)
            .populate('measurements')
            .exec(function(err, user) {
                if(err) {
                    next(err);
                }
                var measVals = {
                    height: user.measurements.height,
                    weight: user.measurements.weight,
                    gender: user.measurements.gender,
                    neck: user.measurements.neck,
                    shoulder: user.measurements.shoulder,
                    chest: user.measurements.chest,
                    torso: user.measurements.torso,
                    sleeve: user.measurements.sleeve,
                    shirt_fit_pref: user.measurements.shirt_fit_pref,
                    waist: user.measurements.waist,
                    inseam: user.measurements.inseam,
                    outseam: user.measurements.outseam,
                    thigh: user.measurements.thigh,
                    pant_fit_pref: user.measurements.pant_fit_pref
                };

                return res.render('dashboard/measurements', {values: measVals});
            });

    });

    //app.post('/dashboard/measurements', auth.ensureAuthenticated, function (req, res) {
    app.post('/dashboard/measurements', function (req, res) {
        var requiredFields = [
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
        var errors = {};
        _.each(requiredFields, function (field) {
            if (_.isEmpty(req.body[field])) {
                errors[field] = field + ' cannot be empty';
            }
        });

        if (!_.isEmpty(errors)) {
            return res.render('dashboard/measurements', { errors: errors, values: req.body });
        }

        var query = {
            email: req.user.email
        };
        app.models.User.findOne(query)
            .populate('measurements')
            .exec(function(err, user) {
                if (err) {
                    console.log('Error updating measurement info for user ' + req.user.email + ': ' + err);
                    return res.render('dashboard/measurements', {values: req.body});
                }
                if (!user) {
                    console.log('Error updating measurement info for user ' + req.user.email + '. Could not find user.');
                    return res.render('dashboard/account', {values: req.body});
                }

                //Save new measurement data
                var measData = {};
                measData.user_id = user.id;
                measData.height = req.body['height'];
                measData.weight = req.body['weight'];
                measData.gender = req.body['gender'];
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

                user.measurements = measData;
                user.save(function(err) {
                    if(err) {
                        console.log('Error updating measurement info for user ' + req.user.email + ': ' + err);
                    }

                    return res.render('dashboard/measurements', { values: req.body });
                });
            });
    });


    return app;
};