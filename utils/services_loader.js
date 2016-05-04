var _ = require('underscore');

function lowerCaseFirstLetter (str) {
	return str.charAt(0).toLowerCase() + str.slice(1);
}

module.exports = {
    loadServices: function (app) {
        var normalizedPath = require('path').join(__dirname, '../services');

        app.services = {};

        require('fs').readdirSync(normalizedPath).forEach(function (file) {
            var Service = require('../services/' + file);

            if (!_.isFunction(Service)) {
                app.services[lowerCaseFirstLetter(Service.name)] = Service;
            } else {
                var serviceInstance = new Service(app);

                app.services[lowerCaseFirstLetter(Service.name)] = serviceInstance;
            }
        });
        
        return app;
    }
};