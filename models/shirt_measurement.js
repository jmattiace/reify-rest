var mongoose = require('mongoose');

var ShirtMeasurementSchema = new mongoose.Schema({
    user_id:     { type: String },
    temp_user_id: { type: String },
    shirt_size:  { type: String },
    neck:        { type: String },
    chest:       { type: String },
    shoulder:    { type: String },
    sleeve:      { type: String },
    waist:       { type: String },
    preferred_fit: { type: String },
    preferred_brand: { type: String },
    preferred_brand_size: { type: String },
    additional_brands_and_sizes: { type: String },
    chest_preference: { type: String },
    waist_preference: { type: String },
    length_preference: { type: String },
    neck_preference: { type: String },
    sleeve_preference: { type: String },
    preference1: { type: String },
    preference2: { type: String },
    preference3: { type: String }
});

module.exports = ShirtMeasurementSchema;