const Reminder = require("./../reminder.js");
const mailgun = require('mailgun-js')({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
});
const User = require("./../user.js");
const Vehicle = require("./../vehicle.js");
const hogan = require("hogan.js");
const fs = require("fs");
const fmtMileage = (x) => {
    return Math.round((x * 100) / 100);
}

function compileTemplate(template, data) {
    return new Promise((resolve, reject) => {
        console.log(process.cwd());
        fs.readFile(`./views/${template}.html`, 'utf8', function(err, tmpl) {
            if (err) {
                reject(err);
            }
            try {
                let temp = hogan.compile(tmpl);
                resolve(temp.render(data));
            } catch (err) {
                reject(err);
            }
        });
    });
}


module.exports = function() {
    return Vehicle.find({}).then((vehicles) => {
        return Promise.all(vehicles.map((vehicle) => {
            return Promise.all([Reminder.find({
                    vehicle_id: vehicle._id,
                    resolved: false
                }),
                User.findOne({
                    _id: vehicle.user_id
                })
            ]).then(([reminders, user]) => {
                console.log(reminders, user, vehicle);
                if (reminders.length > 0) {
                    return compileTemplate("maintenance_email", {
                        reminders: reminders.map((r) => {
                            r.lastCheck = fmtMileage(r.lastCheck)
                            r.nextCheck = fmtMileage(r.nextCheck)
                            return r;
                        }),
                        user: user,
                        vehicle: vehicle,
                        mileage: fmtMileage(vehicle.mileage),
                        baseUrl: process.env.base_url
                    }).then((html) => {
                        var data = {
                            from: 'Odometer <odometer@tacoma-odometer.herokuapp.com>',
                            to: user.email,
                            subject: `Service Required on your ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
                            html: html
                        };
                        console.log(data);
                        return new Promise((resolve, reject) => {
                            mailgun.messages().send(data).then(resolve, reject);
                        });
                    });
                } else {
                    return Promise.resolve();
                }
            });
        }));
    });
}