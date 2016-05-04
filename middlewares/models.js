var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

module.exports = function (app) {
    var mongooseURISettings  = require('../config/mongoose_uri')({ type: app.environment });
    console.log("App environment: " + app.environment);
    console.log("Initializing DB. Mongoose uri: " + mongooseURISettings.uri);
    var db = mongoose.createConnection(mongooseURISettings.uri, mongooseURISettings.options);

    autoIncrement.initialize(db);

    app.models = require('../models')(db);

    return app;
};
