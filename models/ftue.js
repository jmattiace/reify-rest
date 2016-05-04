var mongoose = require('mongoose');

var FTUESchema = new mongoose.Schema({
    user_id:  { type: String, required: true },
    login:    { type: Boolean, default: false },
    productPage: { type: Boolean, default: false },
    checkoutPage: { type: Boolean, default: false }
});

module.exports = FTUESchema;