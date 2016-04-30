var settings = require('.././settings');
var redis = require("redis");
var client = redis.createClient();
client.on("error", function (err) {
    console.log("Error " + err);
});
module.exports = function(app) {

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
	app.get('/reset', function(req, res) {
		settings.fixtures.forEach(function(l)
		{
			client.hset("light-settings", l.id, JSON.stringify(l), redis.print);
		});

	});

	app.get('*', function(req, res) {
		//serve angular
		res.sendfile('./public/index.html');
	});

};