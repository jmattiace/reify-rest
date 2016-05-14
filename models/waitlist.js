var mongoose = require('mongoose');

var WaitlistUserSchema = new mongoose.Schema({
    email:       { type: String, unique: true, lowercase: true },
    timestamp:       { type: Date, default: Date.now}
});

module.exports = WaitlistUserSchema;