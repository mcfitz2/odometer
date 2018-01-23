var mongoose = require("mongoose");
var User = require("./user.js");
var Trip = require("./trip.js");
var Vehicle = require("./vehicle.js");
var userId = "U_fac562a2a129637c"
mongoose.connect("mongodb://localhost/odometer");
Vehicle.find({
    user_id: userId
}).then((vehicles) => {
    console.log("calc for", userId)
    return Promise.all(vehicles.map((vehicle) => {
        console.log("user", userId, "vehicle", vehicle._id);
        return Trip.aggregate([{
            $match: {
                user_id: userId,
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
    mongoose.connection.close();

}).catch((err) => {
    console.log(err);
})