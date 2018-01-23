var mongoose = require("mongoose");
var tripSchema = new mongoose.Schema({
        "_id":{type:String, required:true},
        "url" : String,
        "driver" : String,
        "vehicle" : "String",
        "vehicle_events" : [
                {
                        "velocity_kph" : Number,
                        "ended_at" : Date,
                        "start_distance_m" : Number,
                        "started_at" : Date,
                        "type" : {type:String},
                        "end_distance_m" : Number
                }
        ],
        "duration_s" : Number,
        "distance_m" : Number,
        "fuel_cost_usd" : Number,
        "path" : String,
        "fuel_volume_l" : Number,
        "hard_brakes" : Number,
        "hard_accels" : Number,
        "duration_over_70_s" : Number,
        "duration_over_75_s" : Number,
        "duration_over_80_s" : Number,
        "average_kmpl" : Number,
        "average_from_epa_kmpl" : Number,
        "start_address" : {
                "name" : String,
                "display_name" : String,
                "street_number" : String,
                "street_name" : String,
                "city" : String,
                "state" : String,
                "country" : String,
                "zipcode" : String
        },
        "start_location" : {
                "lat" : Number,
                "lon" : Number,
                "accuracy_m" : Number
        },
        "end_address" : {
                "name" : String,
                "display_name" : String,
                "street_number" : String,
                "street_name" : String,
                "city" : String,
                "state" : String,
                "country" : String,
                "zipcode" : String
        },
        "end_location" : {
                 "lat" : Number,
                "lon" : Number,
                "accuracy_m" : Number
        },
        "started_at" : Date,
        "ended_at" : Date,
        "start_timezone" : String, //enum from moment.timezones
        "end_timezone" : String, //enum
        "score_events" : Number,
        "score_speeding" : Number,
        "city_fraction" : Number,
        "highway_fraction" : Number,
        "night_driving_fraction" : Number,
        "tags" : [String],
        "idling_time_s" : Number,
        "user_id" : String,
        "vehicle_id" : String
});
var Trip = mongoose.model('Trip', tripSchema);
module.exports = Trip;


