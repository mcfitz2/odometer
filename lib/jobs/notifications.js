const Reminder = require("./../reminder.js");
const mailgun = require('mailgun-js')({apiKey: process.env.MAILGUN_API_KEY, domain:process.env.MAILGUN_DOMAIN});
const User = require("./../user.js");
const Vehicle = require("./../vehicle.js");

const fmtMileage = (x) => {
  return Math.round((x * 100)/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
module.exports = function() {
	return Vehicle.find({}).then((vehicles) => {
		return Promise.all(vehicles.map((vehicle) => {
			return Reminder.find({vehicle_id: vehicle._id, resolved:false}).then((reminders) => {
				return User.findOne({_id: vehicle.user_id}).then((user) => {
					let text = `Your ${vehicle.year} ${vehicle.make} ${vehicle.model} has reached ${fmtMileage(vehicle.mileage)} miles and is due for service:\n` + reminders.map((reminder) => {return reminder.description}).join("\n");
					var data = {
					  from: 'Odometer <odometer@tacoma-odometer.herokuapp.com>',
					  to: user.email,
					  subject: `Service Required on your ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
			  		  text: text
					};
					console.log(data);
					return new Promise((resolve, reject) => {
						mailgun.messages().send(data).then(resolve, reject);
					});
				});
			});
		}));
	});
}

