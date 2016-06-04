var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var bcrypt = require('bcrypt');

var SALT_WORK_FACTOR = 10;

var UserSchema = new mongoose.Schema({
    firstName:              { type: String },
    lastName:               { type: String },
    phoneNumber:            { type: String },
    streetAddr1:            { type: String },
    streetAddr2:            { type: String },
    country:                { type: String, default: 'US' },
    zip:                    { type: String },
    city:                   { type: String },
    state:                  { type: String },
    email:                  { type: String, unique: true, lowercase: true },
    password:               { type: String},
    resetPasswordToken:     { type: String},
    resetPasswordExpires:   { type: Date},
    apiKey:                 { type: String, unique: true, sparse: true},
    measurements:           { type: mongoose.Schema.Types.ObjectId, ref: 'Measurements' },
    orders:                 [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
});

/**
 *  Setting middleware
 */

UserSchema.pre('save', function (next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) {
        return next();
    }

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) {
            return next(err);
        }

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) {
                return next(err);
            }

            // override the cleartext password with the hashed one
            user.password = hash;

            next();
        });
    });
});

module.exports = UserSchema;
