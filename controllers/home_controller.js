module.exports = function (app) {
    app.get('/', function (req, res) {
        res.render('index');
    });

    app.get('/faq', function(req, res) {
        res.render('faq');
    });

    return app;
};