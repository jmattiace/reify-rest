module.exports = function (app) {
    app.get('/', function (req, res) {

/*        //Check if req came from waitlist response
        if(req.query.waitListed) {
            var respMsg = '';
            if(req.query.waitListed == 'true') {
                respMsg = 'You have been added to the waitlist!';
            }
            else {
                respMsg = req.query.email + ' is already on the waitlist. Please use a different email';
            }

            return res.render('index',
                {
                    layout: 'waitlist-home',
                    waitListRespMsg: respMsg
                }
            );
        }
*/
        res.render('splash', { layout: 'landing'} );
    });

    app.get('/faq', function(req, res) {
        res.render('faq');
    });

    app.get('/splash', function(req, res) {

        //Post email to waitlist endpoint
        //OR
        //Go to faq page
        //OR
        //Login
        res.redirect('dashboard_controller/current_orders');
    });

    return app;
};