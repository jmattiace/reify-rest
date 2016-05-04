var mongoose = require('mongoose');

var PaymentMethodSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    venmoId: { type: String }
});

module.exports = PaymentMethodSchema;