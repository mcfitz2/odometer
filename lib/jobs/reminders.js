const Vehicle = require("./../vehicle.js");
const User = require("./../user.js");
const Reminder = require("./../reminder.js");
module.exports = function() {
	Reminder.find().then((reminders) => {
		console.log(reminders);
		return Promise.all(reminders.map((reminder) => {
			console.log(reminder);
			let t = reminder.check();
			return t;
		}));
	})
}
