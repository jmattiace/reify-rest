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
    host: 'ds031641.mongolab.com',
    port: 31641,
    db: 'reify',
    username: 'mongify',
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