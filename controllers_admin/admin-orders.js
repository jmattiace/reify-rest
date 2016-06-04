/*
 * Admin console for inputting and viewing orders
 */
var _ = require('underscore');

module.exports = function (app) {
    app.post('/admin/order', function (req, res) {
        var errors = {};
        var orderFields = [
            'userEmail',
            'productId',
            'brandName',
            'productName',
            'productType',
            'quantity',
            'price',
            'color',
            'size',
            'linkUrl',
            'thumbnailUrl',
            'status'
        ];

        _.each(orderFields, function (field) {
            if (_.isEmpty(req.body[field])) {
                errors[field] = field +' cannot be empty';
            }
        });

        if(!_.isEmpty(errors)) {
            return res.send('Fields cannot be empty: '+ errors);
        }

        var orderData = _.pick(req.body, orderFields);

        //Persist data
        var query = {
            email: req.body.userEmail
        };
        app.models.User.findOne(query)
            .populate('orders')
            .exec(function(err, user) {
                if (err) {
                    return res.send('Error updating order info for user ' + req.body.userEmail + ': ' + err);
                }
                if (!user) {
                    return res.send('Error updating order info for user ' + req.body.userEmail + '. Could not find user.');
                }

                //Save new order data
                orderData.user_id = user.id;
                app.models.Order.create( orderData, function(err, order) {
                    user.orders = order;
                    user.save(function(err) {
                        if(err) {
                            return res.send('Error updating order info for user ' + req.body.order + ': ' + err);
                        }

                        return res.send('Success!');
                    });
                });
            });
    });
};