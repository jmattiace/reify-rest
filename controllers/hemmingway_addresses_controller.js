module.exports = function (app) {
    app.get('/hemmingway_contact', function (req, res) {
        res.send({
            address: {
                streetAddress1: '1200 4th Street',
                streetAddress2: 'Suite 219',
                country: 'US',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94158'
            },
            contact: {
                phoneNumber: '4156179982'
            }
        });
    });
};