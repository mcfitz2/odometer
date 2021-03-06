const express = require("express");
const passport = require("passport");
const session = require("express-session");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const winston = require("winston");
const expressWinston = require("express-winston");
mongoose.Promise = global.Promise;
const MongoStore = require('connect-mongo')(session);
const schedule = require('node-schedule');
if (process.argv.length > 1 && process.argv[2] == "testing") {
    mongoose.connect(process.env.MONGODB_URI);
    require("./lib/jobs/notifications.js")();
} else {

    var app = express();
    app.use(expressWinston.logger({
        transports: [
            new winston.transports.Console({
                json: true,
                colorize: true
            })
        ],
        meta: true, // optional: control whether you want to log the meta data about the request (default to true)
        //msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
        expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
        colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    }));
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(session({
        secret: 'keyboard cat',
        store: new MongoStore({
            mongooseConnection: mongoose.connection
        })
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.set('view engine', 'html');
    app.engine('html', require('hogan-express'));
    app.set('views', __dirname + '/views');
    app.db = mongoose.connection;
    app.db.on("error", function(err) {
        console.log(err);
    });
    app.db.once("open", function() {
        require("./lib/passport.js")(app);
        require("./lib/routes.js")(app);
        require("./lib/extract.js")(app);
        var j = schedule.scheduleJob('0 22 * * *', require("./lib/jobs/notifications.js"));

        app.listen(process.env.PORT || 8888);
    });
    mongoose.connect(process.env.MONGODB_URI);
}