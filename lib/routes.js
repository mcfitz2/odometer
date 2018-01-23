var passport = require("passport");
var mongoose = require("mongoose");
var User = require("./user.js");
var Trip = require("./trip.js");
var Vehicle = require("./vehicle.js");

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.session.returnTo = req.path;
        res.redirect("/auth/automatic");
    }
}
module.exports = function(app) {
    app.get("/dashboard", ensureAuthenticated, (req, res) => {
	
        Vehicle.find({
            user_id: req.user._id
        }).then((response) => {
            res.send("<pre>" + JSON.stringify({
                user: req.user,
                vehicles: response
            }, undefined, 2) + "</pre>");
        });
    });
    app.get("/", ensureAuthenticated, function(req, res) {
        res.redirect("/dashboard");
    });
    app.get('/auth/automatic', passport.authenticate('automatic', {}));
    app.get('/auth/automatic/callback', passport.authenticate('automatic', {
        failureRedirect: '/'
    }), function(req, res) {
        res.redirect(req.session.returnTo);
    });
    app.get('/logout', function(req, res) {
        req.logout();
    });
    app.get("/recalc", ensureAuthenticated, function(req, res) {
	require("./jobs/calculate.js")((err) => {
        	res.sendStatus(200);
        	res.end();
	});
    });
};
