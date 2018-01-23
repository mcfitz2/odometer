var passport = require("passport");
var AutomaticStrategy = require('passport-automatic').Strategy;
var mongoose = require("mongoose");
var User = require("./user.js");
var Vehicle = require("./vehicle.js");
var auto = require("automatic");
module.exports = function(app) {
    function callback(req, accessToken, refreshToken, profile, done) {
        console.log("PROFILE", profile);
        profile.access_token = accessToken;
        profile.refresh_token = refreshToken;
        User.findOneAndUpdate({
            _id: profile.id,
        }, {
            _id: profile.id,
            access_token: accessToken,
            refresh_token: refreshToken,
            username: profile.username,
            first_name: profile.first_name,
            last_name: profile.last_name,
            email: profile.email
        }, {
            upsert: true,
            new: true
        }, function(err, user) {
            var automatic = auto.createClient({
                client_id: process.env.automatic_client_id,
                client_secret: process.env.automatic_client_secret,
                access_token: user.access_token
            });
            automatic.vehicles({}).then((results) => {
                console.log(results.body.results);
                let updates = results.body.results.map((item) => {
                    item.user_id = user._id;
                    return Vehicle.findOneAndUpdate({
                        _id: item.id
                    }, item, {
                        upsert: true
                    });
                });
                Promise.all(updates).then(() => {
                    done(err, user);
                }).catch((err) => {
                    console.log(err);
                    done(err, user);
                });
            }).catch((err) => {
                console.log(err);
                done(err, user);
            });
        });
    }
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
    passport.use(new AutomaticStrategy({
        clientID: process.env.automatic_client_id,
        clientSecret: process.env.automatic_client_secret,
        callbackURL: process.env.automatic_callback_url,
        passReqToCallback: true,
    }, callback));
};