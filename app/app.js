var environment = process.env.NODE_ENV || 'local';

var appLoader = require('../utils/app_loader');
var servicesLoader = require('../utils/services_loader');
var express = require('express');
var cors = require('cors');

var app = express();
app.environment = environment;

appLoader.loadApp(app, 'middlewares');
appLoader.loadApp(app, 'controllers_admin');
appLoader.loadApp(app, 'controllers');
appLoader.loadErrorHandler(app);
servicesLoader.loadServices(app);

var port = process.env.PORT || 3000;
app.listen(port);
console.log("Listening on port " + port);
