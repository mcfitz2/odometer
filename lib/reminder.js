var mongoose = require("mongoose");
var reminderSchema = new mongoose.Schema({
	user_id: String, 
	vehicle_id:String,
	interval:Number,
	nextCheck:Number,
	lastCheck:Number,
	description:String,
	resolved:Boolean
});

reminderSchema.methods.check = function() {
	let reminder = this;
	return this.model("Vehicle").findOne({
		_id:reminder.vehicle_id
	}).then((vehicle) => {
		console.log("Mileage:", vehicle.mileage);
		console.log("Next Check:", reminder.nextCheck);
		if (vehicle.mileage >= reminder.nextCheck) {
			reminder.resolved = false;
			return reminder.save()
		} else {
			return Promise.resolve();
		}
	}).catch((err) => {
		return Promise.reject(err);
	}); 
}
reminderSchema.methods.resolve = function() {
	this.resolved = true;
	let reminder = this;
	return this.model("Vehicle").findOne({
		_id:reminder.vehicle_id
	}).then((vehicle) => {
		reminder.lastCheck = vehicle.mileage;
		reminder.nextCheck = vehicle.mileage+reminder.interval;
		return reminder.save()
	});
}

var Reminder = mongoose.model('Reminder', reminderSchema);
module.exports = Reminder;

