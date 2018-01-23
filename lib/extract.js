var bodyParser = require('body-parser')
var auto = require("automatic");
var mongoose = require("mongoose");
var User = require("./user.js");
var Trip = require("./trip.js");
var Vehicle = require("./vehicle.js");
module.exports = function(app) {
    app.use(bodyParser.json());
    app.post("/odometer", function(req, res) {
        let trip = req.body.trip;
        console.log(req.body);
        if (req.body.type == "trip:finished") {
            var automatic = null;
            var user = null;
            console.log("getting user");
            User.findOne({
                _id: req.body.user.v2_id
            }).then((result) => {
                user = result;
                automatic = auto.createClient({
                    client_id: process.env.automatic_client_id,
                    client_secret: process.env.automatic_client_secret,
                    access_token: user.access_token
                });
                return Trip.findOne({
                    user_id: user._id
                }, {}, {
                    sort: {
                        'ended_at': -1
                    }
                });
            }).then((lastTrip) => {
                console.log("last trip", lastTrip)
                //console.log("fetching trips from",lastTrip.started_at,"to",new Date())
                return automatic.trips({
                    //started_at__gte: Math.floor(lastTrip.started_at.getTime() / 1000),
                    started_at__gte: Math.floor(new Date(2017, 1, 1).getTime() / 1000),
                    started_at__lte: Math.floor(new Date().getTime() / 1000),
                    page: 1,
                    limit: 250,
                    paginate: true
                });
            }).then(function(results) {
                console.log("trips", results);
                var trips = [].concat.apply([], results.map(function(page) {
                    return page.body.results;
                }));
                console.log("Fetched", trips.length, "trips");
                return Promise.all(trips.map((trip) => {
                    trip._id = trip.id;
                    trip.user_id = user._id;
                    trip.vehicle_id = trip.vehicle.split("/")[4];
                    return Trip.findOneAndUpdate({
                        _id: trip._id
                    }, trip, {
                        upsert: true
                    })
                }));
            }).then(() => {
                console.log("extract completed");
		require("./jobs/calculate.js")();
            }).catch(function(err) {
                console.log(err);
            });
        }
        res.sendStatus(200);
    });
}
