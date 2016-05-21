var _ = require('underscore');

var UserSchema = require('./user');
var MeasurementsSchema = require('./measurements');
var FTUESchema = require('./ftue');
var OrderSchema = require('./order');
var OrderDetailsSchema = require('./order_details');
var WaitlistUserSchema = require('./waitlist');

module.exports = function (db) {
    var schemas = [
        UserSchema,
        MeasurementsSchema,
        FTUESchema,
        OrderSchema,
        OrderDetailsSchema,
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
        FTUE: db.model('FTUE', FTUESchema),
        Order: db.model('Order', OrderSchema),
        OrderDetails: db.model('OrderDetails', OrderDetailsSchema),
        Measurements: db.model('Measurements', MeasurementsSchema),
        WaitlistUser: db.model('WaitlistUser', WaitlistUserSchema)

    };
};
