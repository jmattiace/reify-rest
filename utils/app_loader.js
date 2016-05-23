module.exports = {
    loadApp: function (app, path) {
        var normalizedPath = require('path').join(__dirname, '../' + path);

            //Do not load error handler middleware
            require('fs').readdirSync(normalizedPath).forEach(function (file) {
                if(file !== 'error-handler.js') {
                    require('../' + path + '/' + file)(app);
                }
            });
        
        return app;
    },

    loadErrorHandler: function(app) {
        require('../middlewares/error-handler.js')(app);
        return app;
    }
};