var async = require('async');
var request = require('request');
var path = require("path");
var fs   = require("fs");

module.exports = function (app) {

    app.get('/waitlist', function(req, res) {
        res.send('waiting...');
    });

    app.post('/waitlist', function(req, res) {
        var userData = {
            'email': req.body.email
        }

        //Check if email already exists
        async.auto({
            waitlistUser: function (callback) {
                app.models.WaitlistUser.findOne({ email: userData.email }, function (err, waitlistUser) {
                    if (err) {
                        return callback(err)
                    }

                    if (!waitlistUser) {
                        return app.models.WaitlistUser.create(userData, callback);
                    }

                    callback(null, {errOccurred: true});
                });
            }
        }, function (err, results) {
            if (err) {
                console.log(err);
                return res.send('an error occurred');
            }

            if(results.waitlistUser && results.waitlistUser.errOccurred) {
                return res.redirect('/?waitListed=false&email='+userData.email);
            }

            //Get html for email content
            var publicPath = path.resolve(__dirname, "../public");
            var htmlPath = path.join(publicPath, "email/waitlist-conf.html");
            var html = fs.readFileSync(htmlPath, "utf8");

            //Mailgun
            request({
                method: 'POST',
                uri: 'https://api.mailgun.net/v3/reify.fit/messages',
                form: {
                    from: 'Reify <info@reify.fit>',
                    to: [userData.email, 'jason@hemmingway.co'],
                    //'recipient-variables': '{"'+userData.email+'": {"first":"newUser", "id":1}, "jason@hemmingway.co": {"first":"reify", "id": 2}}',
                    'h:Reply-To': 'noreply@reify.fit',
                    subject: 'You\'re on the wait list!',
                    html: html
                },
                headers: {
                    Authorization: 'Basic ' + new Buffer('api:key-0a2523576d0095dee43244887fa7ee4b').toString('base64')
                }
            })


            console.log('Successfully added ' + userData.email + ' to the waitlist');
            return res.redirect('/?waitListed=true&email='+userData.email);
        });
    });

    return app;
};