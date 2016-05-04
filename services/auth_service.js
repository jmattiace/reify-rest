var Promise = require('bluebird');
var bcrypt = require('bcrypt');

function AuthService (app) {
    this.app = app;
};

AuthService.prototype.isPasswordCorrect = function (userPassword, candidatePassword, callback) {
    bcrypt.compare(candidatePassword, userPassword, function (err, isMatch) {
        if (err) {
            return callback(err);
        }

        if (!isMatch) {
            return callback(new Error('passwords do not match'));
        }

        callback(null, isMatch);
    });
};

module.exports = AuthService;