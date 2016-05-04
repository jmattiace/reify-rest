'use strict';

var _ = require('underscore');
var credentials = require('./mongoose');

function generateMongoUri (type) {
    var creds = credentials({type: type});
    if (_.has(creds, 'username') && _.has(creds, 'password')) {
        return ['mongodb://', creds.username, ':', creds.password, '@', creds.host, ':', creds.port, '/', creds.db].join('');
    } else {
        return ['mongodb://', creds.host, ':', creds.port, '/', creds.db].join('');
    }
}

var def = {     
    uri: generateMongoUri('local'),
    options: { }
};

var test = {
    uri: generateMongoUri('test'),
    options: { }
};

var staging = {
    uri: generateMongoUri('staging'),
    options: { }
};

var production = {
    uri: generateMongoUri('production'),
    options: { }
};

var Hash = {
	local: def,
    test: test,
    staging: staging,
    production: production
};

module.exports = function(identity) {

    if (_.has(Hash, identity.type)) {
        return Hash[identity.type];
    } 

    return Hash.local;

};