var settings = require('.././settings');
var redis = require("redis");
var client = redis.createClient();
client.on("error", function (err) {
    console.log("Error " + err);
});
module.exports = function(app) {

	// server routes ===========================================================
	// handle things like api calls
	// authentication routes

	// frontend routes =========================================================
	// route to handle all angular requests
	app.get('/lights', function(req, res) {
		res.json(settings.fixtures);
	});
	app.put('/channels', function(req, res) {
		for (var propName in req.query) {
		    if (req.query.hasOwnProperty(propName)) {
		        console.log(propName, req.query[propName]);
		        client.hset("dmx-vals", propName, req.query[propName]);
		    }
		}
		res.json("ok");
	});
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html');
	});

};