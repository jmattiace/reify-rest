var async = require('async');
var request = require('request');

module.exports = function (app) {

    app.get('/waitlist', function(req, res) {
        res.send('waiting...');
    });

    app.post('/waitlist/save', function(req, res) {
        var userData = {
            'email': req.body.email
        }

        async.auto({
            waitlistUser: function (callback) {
                app.models.WaitlistUser.findOne({ email: userData.email }, function (err, waitlistUser) {
                    if (err) {
                        return callback(err)
                    }

                    if (!waitlistUser) {
                        return app.models.WaitlistUser.create(userData, callback);
                    }

                    callback(null, {errorMessage: userData.email + ' is are already on the waitlist! '
                        + 'Please use a different email address to join the waitlist'});
                });
            }
        }, function (err, results) {
            if (err) {
                console.log(err);
                return res.send('an error occurred');
            }

            if(results.waitlistUser && results.waitlistUser.errorMessage) {
                return res.send(results);
            }

            request({
                method: 'POST',
                uri: 'https://api.mailgun.net/v3/sandboxffcf2b7b67b448fdbf58b903adf14fef.mailgun.org/messages',
                form: {
                    from: 'Hemmingway@hemmingway.co',
                    to: 'jason@hemmingway.co',
                    'h:Reply-To': 'noreply@hemmingway.co',
                    subject: 'You\'re on the wait list!',
                    html: 'html goes here'
                },
                headers: {
                    Authorization: 'Basic ' + new Buffer('api:key-0a2523576d0095dee43244887fa7ee4b').toString('base64')
                }
            })

            return res.send('Success');

        });
    });

    return app;
};