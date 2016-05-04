var express = require('express');
var exphbs = require('express-handlebars');

module.exports = function (app) {
    var hbs = exphbs.create({
        defaultLayout: 'main',
        layoutsDir: 'views/layouts',
        partialsDir: 'views/partials',
        helpers: {
            compare: function (lvalue, operator, rvalue, options) {
                var operators, result;

                if (arguments.length < 3) {
                    throw new Error('Handlerbars Helper \'compare\' needs 2 parameters');
                }

                if (options === undefined) {
                    options = rvalue;
                    rvalue = operator;
                    operator = '===';
                }

                operators = {
                    '===': function (l, r) { return l === r; },
                    '!==': function (l, r) { return l !== r; },
                    '<': function (l, r) { return l < r; },
                    '>': function (l, r) { return l > r; },
                    '<=': function (l, r) { return l <= r; },
                    '>=': function (l, r) { return l >= r; }
                };

                if (!operators[operator]) {
                    throw new Error('Handlerbars Helper \'compare\' doesn\'t know the operator ' + operator);
                }

                result = operators[operator](lvalue, rvalue);

                if (result) {
                    return options.fn(this);
                } else {
                    return options.inverse(this);
                }
            }
        }
    });

    app.engine('handlebars', hbs.engine);
    app.set('view engine', 'handlebars');
    app.set('views', 'views');
    app.use(express.static('public'));

    return app;
};