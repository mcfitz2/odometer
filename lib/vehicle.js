var mongoose = require("mongoose");
var vehicleSchema = new mongoose.Schema({
	_id: {type:String, required:true},
	model: String,
        fuel_level_percent: Number,
        display_name: String,
        created_at: Date,
	battery_voltage: Number,
      	active_dtcs: [String],
      	updated_at: Date,
        submodel: String,
       	year: Number,
       	fuel_grade: String,
       	make: String,
	base_mileage:Number,
	last_mileage_update:Date,
	mileage:Number,
	user_id:String,
});
var Vehicle = mongoose.model('Vehicle', vehicleSchema);
module.exports = Vehicle;

