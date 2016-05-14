var environment = process.env.NODE_ENV || 'local';

var appLoader = require('../utils/app_loader');
var servicesLoader = require('../utils/services_loader');
var express = require('express');
var cors = require('cors');

var app = express();
app.environment = environment;

appLoader.loadApp(app, 'middlewares');
appLoader.loadApp(app, 'admin_controllers');
appLoader.loadApp(app, 'controllers');
servicesLoader.loadServices(app);

var port = process.env.PORT || 3000;
app.listen(port);
console.log("Listening on port " + port);
