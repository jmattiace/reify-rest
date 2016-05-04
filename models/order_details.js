var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

var OrderDetailsSchema = new mongoose.Schema({
    order_id:  { type: String, required: true },
    analyzedNote: { type: String },
    analyzedDate: { type: Date },
    alteredNote:  { type: String },
    alteredDate:  { type: Date },
    shippedNote:  { type: String },
    shippedDate:  { type: Date },
    deliveredNote: { type: String },
    deliveredDate: { type: Date },
    requiresAlteration: { type: Boolean, default: false }
});

module.exports = OrderDetailsSchema;