var _ = require('underscore');
var async = require('async');
var dateformat = require('dateformat');
var passport = require('passport');
var request = require('request');

function getSelectedGenericSize (size) {
    var genericSize = {
        is_small: size === 'S',
        is_medium: size === 'M',
        is_large: size === 'L',
        is_xlarge: size === 'XL',
        is_xxlarge: size === 'XXL'
    };

    if (!genericSize.is_small && !genericSize.is_medium && !genericSize.is_large && !genericSize.is_xlarge && !genericSize.is_xxlarge) {
        genericSize.is_small = true;
    }

    return genericSize;
}

function getPreferredShirtFit (preferredFit) {
    var preferredFit = {
        is_classic: preferredFit === 'classic',
        is_regular: preferredFit === 'regular',
        is_trim: preferredFit === 'trim',
        is_xtrim: preferredFit === 'xtrim'
    };

    return preferredFit;
}

function getPreferredPantFit (preferredFit) {
    var preferredFit = {
        is_relaxed: preferredFit === 'relaxed',
        is_straight: preferredFit === 'straight',
        is_slim: preferredFit === 'slim',
        is_skinny: preferredFit === 'skinny'
    };

    return preferredFit;
}

module.exports = function (app) {
    app.get('/dashboard/login', function (req, res) {
        res.render('dashboard/login');
    });

    app.post('/dashboard/login', passport.authenticate('web'), function (req, res) {
        res.redirect('/dashboard/current_orders');
    });

    app.get('/dashboard/account', function (req, res) {
        if (!req.user) {
            return res.redirect('/dashboard/login');
        }

        app.models.ShippingAddress.findOne({ user_id: req.user.id }, function (err, shippingAddress) {
            if (err) {
                return callback(err);
            }

            if (!shippingAddress) {
                shippingAddress = {};
            }

            var values = {
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                email: req.user.email,
                phoneNumber: req.user.phoneNumber,
                streetAddress1: shippingAddress.streetAddress1,
                streetAddress2: shippingAddress.streetAddress2,
                city: shippingAddress.city,
                state: shippingAddress.state,
                zipCode: shippingAddress.zipCode                
            };

            res.render('dashboard/account', { values: values });
        });
    });

    app.post('/dashboard/account', function (req, res) {
        var fields = ['firstName', 'lastName', 'email', 'phoneNumber', 'streetAddress1', 'gender', 'city', 'state', 'zipCode'];
        var errors = {};

        _.each(fields, function (field) {
            if (_.isEmpty(req.body[field])) {
                errors[field] = 'Please fill in this field';
            }
        });

        if (!_.isEmpty(errors)) {
            return res.render('dashboard/account', { errors: errors, values: req.body });
        }

        req.user.firstName = req.body.firstName;
        req.user.lastName = req.body.lastName;
        req.user.email = req.body.email;
        req.user.phoneNumber = req.body.phoneNumber;
        req.user.gender = req.body.gender;

        req.user.save(function (err, updatedUser) {
            if (err) {
                return res.send('an error occurred');
            }

            app.models.ShippingAddress.findOne({ user_id: updatedUser.id }, function (err, shippingAddress) {
                if (err) {
                    return res.send('an error occurred');
                }

                shippingAddress.streetAddress1 = req.body.streetAddress1;
                shippingAddress.streetAddress2 = req.body.streetAddress2;
                shippingAddress.zipCode = req.body.zipCode;
                shippingAddress.city = req.body.city;
                shippingAddress.state = req.body.state;

                shippingAddress.save(function (err, updatedShippingAddress) {
                    if (err) {
                        return res.send('an error occurred');
                    }

                    var values = {
                        firstName: updatedUser.firstName,
                        lastName: updatedUser.lastName,
                        email: updatedUser.email,
                        phoneNumber: updatedUser.phoneNumber,
                        streetAddress1: updatedShippingAddress.streetAddress1,
                        streetAddress2: updatedShippingAddress.streetAddress2,
                        city: updatedShippingAddress.city,
                        state: updatedShippingAddress.state,
                        zipCode: updatedShippingAddress.zipCode                
                    };

                    res.render('dashboard/account', { values: values });
                });
            });
        });
    });

    app.get('/dashboard/extension', function (req, res) {
        if (!req.user) {
            return res.redirect('/dashboard/login');
        }

        res.render('dashboard/extension');
    });

    app.get('/dashboard/signed_up_extension', function (req, res) {
        if (!req.user) {
            return res.redirect('/dashboard/login');
        }

        if (req.session.temp_user_id) {
            delete req.session.temp_user_id;
        } else {
            return res.redirect('/dashboard/extension');
        }

        //Confirmation email
        request({
            method: 'POST',
            uri: 'https://api.mailgun.net/v3/sandboxffcf2b7b67b448fdbf58b903adf14fef.mailgun.org/messages',
            form: {
                from: 'Hemmingway@hemmingway.co',
                to: req.user.email,
                'h:Reply-To': 'noreply@hemmingway.co',
                subject: 'Welcome to Hemmingway!',
                html: 'html goes here'
            },
            headers: {
                Authorization: 'Basic ' + new Buffer('api:key-0a2523576d0095dee43244887fa7ee4b').toString('base64')
            }
        })

        //TODO remove this request when Allison no longer wants these emails
        request({
            method: 'POST',
            uri: 'https://api.mailgun.net/v3/sandbox5c428136873843419e17ef69f1dd5e66.mailgun.org/messages',
            form: {
                from: 'allison@hemmingway.co',
                to: 'allison@hemmingway.co',
                'h:Reply-To': 'noreply@hemmingway.co',
                subject: 'User signed up',
                html: req.user.id
            },
            headers: {
                Authorization: 'Basic ' + new Buffer('api:key-9e402520d0b4cbaf26cdffc3c7538b56').toString('base64')
            }
        })

        res.render('dashboard/extension', { layout: 'facebook_sign_up_dashboard' });
    });

    app.get('/dashboard/shirt_measurements', function (req, res) {
        if (!req.user) {
            return res.redirect('/dashboard/login');
        }

        var defaults = {
            preferred_fit: 'classic',
            preferred_brand: 'jcrew',
            preferred_brand_size: 'medium',
            chest_preference: '0',
            waist_preference: '0',
            length_preference: '0',
            neck_preference: '0',
            sleeve_preference: '0'
        };

        app.models.ShirtMeasurement.findOne({ user_id: req.user.id }, function (err, shirtMeasurement) {
            if (err) {
                return res.send('an error occurred');
            }

            if (!shirtMeasurement) {
                shirtMeasurement = defaults
            } else {
                _.defaults(shirtMeasurement, defaults);
            }

            var selectedShirtFit = app.services.measurementsViewService.getPreferredShirtFit(shirtMeasurement.preferred_fit);
            var preferredBrandSize = app.services.measurementsViewService.getPreferredBrandSize(shirtMeasurement.preferred_brand, shirtMeasurement.preferred_brand_size);
            var chestPreference = app.services.measurementsViewService.getOneInchRangePreference(shirtMeasurement.chest_preference);
            var waistPreference = app.services.measurementsViewService.getOneInchRangePreference(shirtMeasurement.waist_preference);
            var lengthPreference = app.services.measurementsViewService.getTwoInchRangePreference(shirtMeasurement.length_preference);
            var neckPreference = app.services.measurementsViewService.getOneInchRangePreference(shirtMeasurement.neck_preference);
            var sleevePreference = app.services.measurementsViewService.getTwoInchRangePreference(shirtMeasurement.sleeve_preference);

            var user = {
                firstName: req.user.firstName.toUpperCase()
            };

            res.render('dashboard/new_shirt_measurements', { layout: 'custom_measurements', values: shirtMeasurement, selectedShirtFit: selectedShirtFit, preferredBrandSize: preferredBrandSize, chestPreference: chestPreference, waistPreference: waistPreference, lengthPreference: lengthPreference, neckPreference: neckPreference, sleevePreference: sleevePreference, user: user });
        });
    });

    app.post('/dashboard/shirt_measurements', function (req, res) {
        if (!req.user) {
            return res.redirect('/dashboard/login');
        }

        var user = {
            firstName: req.user.firstName.toUpperCase()
        };

        var fields = ['neck', 'chest', 'shoulder', 'sleeve', 'waist'];
        var errors = {};

        _.each(fields, function (field) {
            if (!_.isEmpty(req.body[field]) && _.isNaN(Number(req.body[field]))) {
                errors[field] = 'Please enter a positive number';
            }
        });

        if (!_.isEmpty(errors)) {
            var selectedShirtFit = app.services.measurementsViewService.getPreferredShirtFit(req.body.preferred_fit);
            var preferredBrandSize = app.services.measurementsViewService.getPreferredBrandSize(req.body.preferred_brand, req.body.preferred_brand_size);
            var chestPreference = app.services.measurementsViewService.getOneInchRangePreference(req.body.chest_preference);
            var waistPreference = app.services.measurementsViewService.getOneInchRangePreference(req.body.waist_preference);
            var lengthPreference = app.services.measurementsViewService.getTwoInchRangePreference(req.body.length_preference);
            var neckPreference = app.services.measurementsViewService.getOneInchRangePreference(req.body.neck_preference);
            var sleevePreference = app.services.measurementsViewService.getTwoInchRangePreference(req.body.sleeve_preference);

            return res.render('dashboard/new_shirt_measurements', { layout: 'custom_measurements', errors: errors, values: req.body, selectedShirtFit: selectedShirtFit, selectedShirtFit: selectedShirtFit, preferredBrandSize: preferredBrandSize, chestPreference: chestPreference, waistPreference: waistPreference, lengthPreference: lengthPreference, neckPreference: neckPreference, sleevePreference: sleevePreference, user: user });
        }

        app.models.ShirtMeasurement.findOne({ user_id: req.user.id }, function (err, shirtMeasurement) {
            if (err) {
                return res.send('an error occurred');
            }

            if (shirtMeasurement === null) {
                shirtMeasurement = new app.models.ShirtMeasurement(_.extend({ user_id: req.user.id }, req.body));
            } else {
                _.extend(shirtMeasurement, req.body);
            }

            shirtMeasurement.save(function (err, updatedShirtMeasurement) {
                if (err) {
                    return res.send('an error occurred');
                }

                var user = {
                    firstName: req.user.firstName.toUpperCase()
                }

                var selectedShirtFit = app.services.measurementsViewService.getPreferredShirtFit(updatedShirtMeasurement.preferred_fit);
                var preferredBrandSize = app.services.measurementsViewService.getPreferredBrandSize(updatedShirtMeasurement.preferred_brand, updatedShirtMeasurement.preferred_brand_size);
                var chestPreference = app.services.measurementsViewService.getOneInchRangePreference(updatedShirtMeasurement.chest_preference);
                var waistPreference = app.services.measurementsViewService.getOneInchRangePreference(updatedShirtMeasurement.waist_preference);
                var lengthPreference = app.services.measurementsViewService.getTwoInchRangePreference(updatedShirtMeasurement.length_preference);
                var neckPreference = app.services.measurementsViewService.getOneInchRangePreference(updatedShirtMeasurement.neck_preference);
                var sleevePreference = app.services.measurementsViewService.getTwoInchRangePreference(updatedShirtMeasurement.sleeve_preference);

                res.render('dashboard/new_shirt_measurements', { layout: 'custom_measurements', values: updatedShirtMeasurement, selectedShirtFit: selectedShirtFit, preferredBrandSize: preferredBrandSize, chestPreference: chestPreference, waistPreference: waistPreference, lengthPreference: lengthPreference, neckPreference: neckPreference, sleevePreference: sleevePreference, user: user });
            });
        });
    });

    app.get('/dashboard/pant_measurements', function (req, res) {
        if (!req.user) {
            return res.redirect('/dashboard/login');
        }

        var defaults = {
            preferred_fit: 'relaxed',
            preferred_brand: 'jcrew',
            preferred_brand_size: 'medium',
            waist_preference: '0',
            inseam_preference: '0',
            thigh_preference: '0',
            ankle_preference: '0'
        };

        app.models.PantMeasurement.findOne({ user_id: req.user.id }, function (err, pantMeasurement) {
            if (err) {
                return res.send('an error occurred');
            }

            if (!pantMeasurement) {
                pantMeasurement = defaults;
            } else {
                _.defaults(pantMeasurement, defaults);
            }

            var selectedPantFit = app.services.measurementsViewService.getPreferredPantFit(pantMeasurement.preferred_fit);
            var preferredBrandSize = app.services.measurementsViewService.getPreferredBrandSize(pantMeasurement.preferred_brand, pantMeasurement.preferred_brand_size);
            var waistPreference = app.services.measurementsViewService.getTwoInchRangePreference(pantMeasurement.waist_preference);
            var inseamPreference = app.services.measurementsViewService.getTwoInchRangePreference(pantMeasurement.inseam_preference);
            var thighPreference = app.services.measurementsViewService.getOneInchRangePreference(pantMeasurement.thigh_preference);
            var anklePreference = app.services.measurementsViewService.getOneInchRangePreference(pantMeasurement.ankle_preference);

            var user = {
                firstName: req.user.firstName.toUpperCase()
            }

            res.render('dashboard/new_pant_measurements', { layout: 'custom_measurements', values: pantMeasurement, selectedPantFit: selectedPantFit, preferredBrandSize: preferredBrandSize, waistPreference: waistPreference, inseamPreference: inseamPreference, thighPreference: thighPreference, anklePreference: anklePreference, user: user });
        });
    });

    app.post('/dashboard/pant_measurements', function (req, res) {
        if (!req.user) {
            return res.redirect('/dashboard/login');
        }

        var user = {
            firstName: req.user.firstName.toUpperCase()
        };

        var pantFields = ['hip', 'waist', 'inseam', 'outseam', 'thigh'];
        var errors = {};

        _.each(pantFields, function (field) {
            if (!_.isEmpty(req.body[field]) && _.isNaN(Number(req.body[field]))) {
                errors[field] = 'Please enter a positive number';
            }
        });

        if (!_.isEmpty(errors)) {
            var selectedPantFit = app.services.measurementsViewService.getPreferredPantFit(req.body.preferred_fit);
            var preferredBrandSize = app.services.measurementsViewService.getPreferredBrandSize(req.body.preferred_brand, req.body.preferred_brand_size);
            var waistPreference = app.services.measurementsViewService.getTwoInchRangePreference(req.body.waist_preference);
            var inseamPreference = app.services.measurementsViewService.getTwoInchRangePreference(req.body.inseam_preference);
            var thighPreference = app.services.measurementsViewService.getOneInchRangePreference(req.body.thigh_preference);
            var anklePreference = app.services.measurementsViewService.getOneInchRangePreference(req.body.ankle_preference);

            return res.render('dashboard/new_pant_measurements', { layout: 'custom_measurements', errors: errors, values: req.body, selectedPantFit: selectedPantFit, preferredBrandSize: preferredBrandSize, waistPreference: waistPreference, inseamPreference: inseamPreference, thighPreference: thighPreference, anklePreference: anklePreference, user: user });
        }
        
        app.models.PantMeasurement.findOne({ user_id: req.user.id }, function (err, pantMeasurement) {
            if (err) {
                return res.send('an error occurred');
            }

            if (pantMeasurement === null) {
                pantMeasurement = new app.models.PantMeasurement(_.extend({ user_id: req.user.id }, req.body));
            } else {
                _.extend(pantMeasurement, req.body);
            }

            pantMeasurement.save(function (err, updatedPantMeasurement) {
                if (err) {
                    return res.send('an error occurred');
                }

                var selectedPantFit = app.services.measurementsViewService.getPreferredPantFit(updatedPantMeasurement.preferred_fit);
                var preferredBrandSize = app.services.measurementsViewService.getPreferredBrandSize(updatedPantMeasurement.preferred_brand, updatedPantMeasurement.preferred_brand_size);
                var waistPreference = app.services.measurementsViewService.getTwoInchRangePreference(updatedPantMeasurement.waist_preference);
                var inseamPreference = app.services.measurementsViewService.getTwoInchRangePreference(updatedPantMeasurement.inseam_preference);
                var thighPreference = app.services.measurementsViewService.getOneInchRangePreference(updatedPantMeasurement.thigh_preference);
                var anklePreference = app.services.measurementsViewService.getOneInchRangePreference(updatedPantMeasurement.ankle_preference);

                return res.render('dashboard/new_pant_measurements', { layout: 'custom_measurements', values: updatedPantMeasurement, selectedPantFit: selectedPantFit, preferredBrandSize: preferredBrandSize, waistPreference: waistPreference, inseamPreference: inseamPreference, thighPreference: thighPreference, anklePreference: anklePreference, user: user });
            });
        });
    });

    app.get('/dashboard/current_orders', function (req, res) {
        if (!req.user) {
            return res.redirect('/dashboard/login');
        }

        app.models.Order.find({ user_id: req.user.id, status: { $ne: 'DELIVERED' } }, function (err, orders) {
            if (err) {
                return res.send('an error occurred');
            }

            var user = {
                firstName: req.user.firstName.toUpperCase()
            };

            if (orders.length === 0) {
                return res.render('dashboard/empty_current_orders', { user: user });
            }

            formatOrders(orders, function (err, orderDetailsResponse) {
                if (err) {
                    return res.send('an error occurred');
                }

                res.render('dashboard/orders', { user: user, orderDetails: orderDetailsResponse, isCurrent: true });
            });
        });
    });

    app.get('/dashboard/past_orders', function (req, res) {
        if (!req.user) {
            return res.redirect('/dashboard/login');
        }

        app.models.Order.find({ user_id: req.user.id, status: 'DELIVERED' }, function (err, orders) {
            if (err) {
                return res.send('an error occurred');
            }

            var user = {
                firstName: req.user.firstName.toUpperCase()
            };

            if (orders.length === 0) {
                return res.render('dashboard/empty_past_orders', { user: user });
            }

            formatOrders(orders, function (err, orderDetailsResponse) {
                if (err) {
                    return res.send('an error occurred');
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
};