var environment = process.env.NODE_ENV || 'local';

var appLoader = require('../utils/app_loader');
var servicesLoader = require('../utils/services_loader');
var express = require('express');
var cors = require('cors');

var app = express();
app.environment = environment;

appLoader.loadApp(app, 'middlewares');
appLoader.loadApp(app, 'controllers');
appLoader.loadApp(app, 'admin_controllers');
servicesLoader.loadServices(app);

app.listen(process.env.PORT || 3000);
console.log("Listening on port 3000");
