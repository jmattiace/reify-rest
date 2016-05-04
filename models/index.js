var _ = require('underscore');

var UserSchema = require('./user');
var ShippingAddressSchema = require('./shipping_address');
var ShirtMeasurementSchema = require('./shirt_measurement');
var PantMeasurementSchema = require('./pant_measurement');
var FTUESchema = require('./ftue');
var OrderSchema = require('./order');
var OrderDetailsSchema = require('./order_details');
var BrandSizeMeasurementSchema = require('./brand_size_measurement');
var WaitlistUserSchema = require('./waitlist');

module.exports = function (db) {
    var schemas = [
        UserSchema,
        ShippingAddressSchema,
        ShirtMeasurementSchema,
        PantMeasurementSchema,
        FTUESchema,
        OrderSchema,
        OrderDetailsSchema,
        BrandSizeMeasurementSchema,
        WaitlistUserSchema
    ];

    _.each(schemas, function (Schema) {
        Schema.pre('save', function (next) {
            var now = new Date();
            this.updated = now;
            if (!this.created) {
                this.created = now;
            }
            next();
        });
    });

    return {
        User: db.model('User', UserSchema),
        ShippingAddress: db.model('ShippingAddress', ShippingAddressSchema),
        FTUE: db.model('FTUE', FTUESchema),
        Order: db.model('Order', OrderSchema),
        OrderDetails: db.model('OrderDetails', OrderDetailsSchema),
        ShirtMeasurement: db.model('ShirtMeasurement', ShirtMeasurementSchema),
        PantMeasurement: db.model('PantMeasurement', PantMeasurementSchema),
        BrandSizeMeasurement: db.model('BrandSizeMeasurement', BrandSizeMeasurementSchema),
        WaitlistUser: db.model('WaitlistUser', WaitlistUserSchema)

    };
};
