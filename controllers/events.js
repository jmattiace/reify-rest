/*
 * Controller for event pages
 */

module.exports = function (app) {

    app.get('/events', function (req, res) {
        return res.render('events', {layout: 'landing'});
    });

    app.get('/partners', function (req, res) {
        return res.render('partners', {layout: 'landing'});
    });
};