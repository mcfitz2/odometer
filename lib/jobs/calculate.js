var mongoose = require("mongoose");
var User = require("./../user.js");
var Trip = require("./../trip.js");
var Vehicle = require("./../vehicle.js");
module.exports = function(done) {
    Vehicle.find({    }).then((vehicles) => {
        return Promise.all(vehicles.map((vehicle) => {
            console.log("user", vehicle.user_id, "vehicle", vehicle._id);
            return Trip.aggregate([{
                $match: {
                    vehicle_id: vehicle._id,
                    started_at: {
                        $gt: vehicle.last_mileage_update
                    }
                }
            }, {
                $group: {
                    _id: vehicle._id,
                    distance_m: {
                        $sum: '$distance_m'
                    }
                },
            }])
        }));
    }).then((sums) => {
        console.log(sums);
        return Promise.all(sums.map((sum) => {
            sum = sum[0];

            if (sum != undefined) {


                return Vehicle.findOne({
                    _id: sum._id
                }).then((vehicle) => {
                    return Vehicle.findOneAndUpdate({
                        _id: sum._id
                    }, {
                        $set: {
                            mileage: vehicle.base_mileage + (sum.distance_m / 1609.34)
                        }
                    });

                });
            }
        }));

    }).then(() => {
        console.log("Success");
	if (done) {
	        done();
	}
    }).catch((err) => {
        console.log(err);
	if (done) {
		done(err);
	}
    })
};
