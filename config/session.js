var _ = require('underscore');

var config = {
    local: {
        port: 6379,
        host: '127.0.0.1'
    },
    production: {
        port: 13938,
        host: 'pub-redis-13938.us-east-1-2.5.ec2.garantiadata.com',
        pass: 'mj4ECasP'
    }
};


module.exports = function getConfig (identity) {
    if (_.has(config, identity.type)) {
        return config[identity.type];
    }

    return config.local;
};