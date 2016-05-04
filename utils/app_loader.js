module.exports = {
    loadApp: function (app, path) {
        var normalizedPath = require('path').join(__dirname, '../' + path);

        require('fs').readdirSync(normalizedPath).forEach(function (file) {
            require('../' + path + '/' + file)(app);
        });
        
        return app;
    }
};