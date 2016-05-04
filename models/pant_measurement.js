var mongoose = require('mongoose');

var PantMeasurementSchema = new mongoose.Schema({
    user_id:     { type: String },
    temp_user_id: { type: String },
    pant_size:   { type: String },
    hip:         { type: String },
    waist:       { type: String },
    inseam:      { type: String },
    outseam:     { type: String },
    thigh:       { type: String },
    preferred_fit: { type: String },
    preferred_brand: { type: String },
    preferred_brand_size: { type: String },
    additional_brands_and_sizes: { type: String },
    waist_preference: { type: String },
    inseam_preference: { type: String },
    thigh_preference: { type: String },
    ankle_preference: { type: String },
    preference1: { type: String },
    preference2: { type: String },
    preference3: { type: String }
});

module.exports = PantMeasurementSchema;