'use strict';

var _ = require('underscore');

var defaultPort = 27017;
var defaultHost = 'localhost';

var def = {     
    host: defaultHost,
    port: defaultPort,
    db: 'hemmingway'
};

var production = {
    host: 'ds051953.mongolab.com',
    port: 51953,
    db: 'hemmingway-rest',
    username: 'hemmingway',
    password: 'NJYqKePe'
};

var Hash = {
	local: def,
    production: production
};

module.exports = function (identity) {
    if (_.has(Hash, identity.type)) {
        return Hash[identity.type];
    }

    return Hash.local;
};