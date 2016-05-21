var mongoose = require('mongoose');

var MeasurementsSchema = new mongoose.Schema({
    user_id:     { type: String },
    gender:      { type: String },
    height:      { type: String },
    weight:      { type: String },
    pant_size:   { type: String },
    hip:         { type: String },
    waist:       { type: String },
    inseam:      { type: String },
    outseam:     { type: String },
    thigh:       { type: String }
});

module.exports = MeasurementsSchema;