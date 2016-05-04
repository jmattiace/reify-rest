var mongoose = require('mongoose');

var WaitlistUserSchema = new mongoose.Schema({
    email:       { type: String, unique: true, lowercase: true }
});

module.exports = WaitlistUserSchema;