/*
 * Controller to handle orders pages from the user dashboard
 */
var auth = require('../utils/auth');

module.exports = function (app) {

    app.get('/dashboard/orders', auth.ensureAuthenticated, function(req, res) {

        return res.render('dashboard/orders', {layout: 'user-dashboard'});
    });

    app.get('/dashboard/current_orders', auth.ensureAuthenticated, function (req, res) {

        app.models.Order.find({ user_id: req.user.id, status: { $ne: 'DELIVERED' } }, function (err, orders) {
            if (err) {
                console.log("Error retrieving current orders: " + err);
                return res.render('dashboard/empty_current_orders', { user: user });
            }

            var user = {
                firstName: req.user.firstName.toUpperCase()
            };

            if (orders.length === 0) {
                return res.render('dashboard/empty_current_orders', { user: user });
            }

            formatOrders(orders, function (err, orderDetailsResponse) {
                if (err) {
                    console.log("Error formatting current orders: " + err);
                    return res.render('dashboard/empty_current_orders', { user: user });
                }

                res.render('dashboard/orders', { user: user, orderDetails: orderDetailsResponse, isCurrent: true });
            });
        });
    });

    app.get('/dashboard/past_orders', auth.ensureAuthenticated, function (req, res) {

        app.models.Order.find({ user_id: req.user.id, status: 'DELIVERED' }, function (err, orders) {
            if (err) {
                console.log("Error retrieving current orders: " + err);
                return res.render('dashboard/empty_current_orders', { user: user });
            }

            var user = {
                firstName: req.user.firstName.toUpperCase()
            };

            if (orders.length === 0) {
                return res.render('dashboard/empty_past_orders', { user: user });
            }

            formatOrders(orders, function (err, orderDetailsResponse) {
                if (err) {
                    console.log("Error retrieving current orders: " + err);
                    return res.render('dashboard/empty_current_orders', { user: user });
                }

                res.render('dashboard/orders', { user: user, orderDetails: orderDetailsResponse, isPast: true });
            });
        });
    });

    function formatOrders (orders, callback) {
        async.map(orders, function (order, next) {
            app.models.OrderDetails.findOne({ order_id: order.id }, function (err, orderDetails) {
                if (err) {
                    return next(err);
                }

                var orderPlaced = dateformat(order.created, 'mmmm dS, yyyy');

                var total = {};
                var isInactive = true;
                var amount = 'Pending';
                var productTypeIconUrl;
                var orderStatus = {
                    stage: 'one',
                    receive: {
                        label: 'Order Received',
                        isCompleted: true,
                        date: dateformat(order.created, '(mmm dd)')
                    },
                    analyze: {
                        label: 'Analyze Measurements',
                        isCompleted: false
                    },
                    alter: {
                        label: 'Alter Garments',
                        isCompleted: false
                    },
                    ship: {
                        label: 'Ship to You',
                        isCompleted: false
                    },
                    deliver: {
                        label: 'Delivered to You',
                        isCompleted: false
                    }
                };
                var analyzeInformation;
                var alterationInformation;
                var billingTitle;

                if (orderDetails !== null) {

                    var analyzedDate = orderDetails.analyzedDate;

                    if (_.isDate(analyzedDate)) {
                        orderStatus.analyze.isCompleted = true;
                        orderStatus.analyze.date = dateformat(analyzedDate, '(mmm dd)');
                        orderStatus.stage = 'two';

                        analyzeInformation = orderDetails.analyzedNote;

                        var alteredDate = orderDetails.alteredDate;

                        if (_.isDate(alteredDate)) {
                            orderStatus.alter.isCompleted = true;
                            orderStatus.alter.date = dateformat(alteredDate, '(mmm dd)');
                            orderStatus.stage = 'three';
                            isInactive = !orderDetails.requiresAlteration;
                            amount = '$' + order.quantity * 25;

                            alterationInformation = orderDetails.alteredNote;

                        }

                        var shippedDate = orderDetails.shippedDate;

                        if (_.isDate(shippedDate)) {
                            orderStatus.ship.isCompleted = true;
                            orderStatus.ship.date = dateformat(shippedDate, '(mmm dd)');
                            orderStatus.stage = 'four';

                            var deliveredDate = orderDetails.deliveredDate;

                            if (_.isDate(deliveredDate)) {
                                orderStatus.deliver.isCompleted = true;
                                orderStatus.deliver.date = dateformat(deliveredDate, '(mmm dd)');
                                orderStatus.stage = 'five';
                            }
                        }
                    }
                }

                if (isInactive) {
                    billingTitle = 'Estimated Cost';
                } else {
                    billingTitle = 'Hemmingway Cost';
                }

                if (order.productType === 'shirt') {
                    productTypeIconUrl = '/assets/shirt_icon.png';
                } else {
                    productTypeIconUrl = '/assets/pants_icon.png';
                }

                var formattedOrderTotal = '= ' + amount;

                next(null, {
                    orderPlaced: orderPlaced,
                    orderNumber: order.orderNumber,
                    orderUrl: order.thumbnailUrl,
                    billingTitle: billingTitle,
                    orderDescription: 'Purchased Size: ' + order.size,
                    productId: order.productId,
                    orderTitle: order.brandName + ' ' + order.productName,
                    isInactive: isInactive,
                    hasAlterationDetails: !_.isEmpty(analyzeInformation) || !isInactive,
                    orderAmount: amount,
                    orderStatus: orderStatus,
                    orderQuantity: order.quantity,
                    formattedOrderPrice: 'x $25',
                    formattedOrderTotal: formattedOrderTotal,
                    productTypeIconUrl: productTypeIconUrl,
                    alterationInformation: alterationInformation || analyzeInformation
                });
            });
        }, callback);
    }

    return app;
};