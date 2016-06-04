/*
 * Controller for event pages
 */

module.exports = function (app) {

    app.get('/events', function (req, res) {
        return res.render('events');
    });

};