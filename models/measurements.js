var mongoose = require('mongoose');

var MeasurementsSchema = new mongoose.Schema({
    user_id:     { type: String },
    gender:      { type: String },
    height:      { type: String },
    weight:      { type: String },
    neck:        { type: String },
    shoulder:    { type: String },
    chest:       { type: String },
    torso:       { type: String },
    sleeve:      { type: String },
    shirt_fit_pref:   { type: String },
    waist:       { type: String },
    inseam:      { type: String },
    outseam:     { type: String },
    thigh:       { type: String },
    pant_fit_pref:   { type: String },
    notes:       { type: String }
});

module.exports = MeasurementsSchema;