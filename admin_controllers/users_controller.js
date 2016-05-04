var _ = require('underscore');
var Promise = require('bluebird');
var hat = require('hat');
var join = Promise.join;

module.exports = function (app) {
    app.get('/admin/users_search', function (req, res) {
        // TODO: check that the user is logged in AND is an admin
        if (!req.user) {
          res.send('user is not logged in');
        }
        if (_.isEmpty(req.query.firstName) && _.isEmpty(req.query.lastName)) {
            return res.render('admin/users_search', { layout: 'admin' });
        }

        var query;

        if (!_.isEmpty(req.query.firstName) && !_.isEmpty(req.query.lastName)) {
            query = {
                $and: [
                    {
                        firstName: new RegExp('^' + req.query.firstName, 'i')
                    },
                    {
                        lastName: new RegExp('^' + req.query.lastName, 'i')
                    }
                ]
            };
        } else if (!_.isEmpty(req.query.firstName)) {
            query = {
                firstName: new RegExp('^' + req.query.firstName, 'i')
            };
        } else {
            query = {
                lastName: new RegExp('^' + req.query.lastName, 'i')
            }
        }

        app.models.User.find(query, function (err, users) {
            if (err) {
                return res.send('an error has occurred');
            }

            res.render('admin/users_search_results.handlebars', { layout: 'admin', users: users });
        });
    });

    app.post('/admin/users/:user_id/generate_api_key', function (req, res) {
      // TODO: check if user is logged in AND is an admin
      if (!req.user) {
        return res.send('user is not logged in');
      }

      if (!req.body['user-email']) {
        return res.send('user missing email');
      }

      var apiKey = hat();
      join(app.models.User.findOne({ email: req.body['user-email'] }).exec(),
           app.models.User.findOne({ apiKey: apiKey }).exec(),
           function (existingUser, userWithApiKey) {
        if (!existingUser) {
          return res.send('user does not exist with given email');
        }
        if (userWithApiKey) {
          // need a better way to handle api key collision, but for now, force a
          // re-try if key is already in use
          return res.send('api key is already being used');
        }

        return app.models.User.update({ email: existingUser.email }, { apiKey: apiKey }, {}).exec();
      })
      .then(function (user) {
        return res.send('Successfully generated api key for the user');
      })
      .catch(function (err) {
        return res.send('Error trying to generate api key for user');
      });

    });

    app.get('/admin/users/:user_id/recommended_shirt_size', function (req, res) {
        app.services.recommendedSizeService.getRecommendedShirtSize(req.params.user_id, function (err, recommendedShirtSize) {
            if (err) {
                return res.send('an error has occurred');
            }

            res.send(recommendedShirtSize);
        });
    });
};
