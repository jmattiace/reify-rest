/*
 * Error handlers
 */
module.exports = function (app) {

    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        console.log('Error caught:');
        if(err.stack) {
            console.log(err.stack);
        }
        else {
            console.log(err);
        }
        res.render('error', {
            status: res.statusCode
        });
    });
}