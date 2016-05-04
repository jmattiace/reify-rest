var mongoose = require('mongoose');

var ShippingAddressSchema = new mongoose.Schema({
	user_id:  { type: String, required: true },
    streetAddress1: { type: String },
    streetAddress2: { type: String },
    country:  { type: String, default: 'US' },
    zipCode:  { type: String },
    city:     { type: String },
    state:    { type: String }
});

module.exports = ShippingAddressSchema;