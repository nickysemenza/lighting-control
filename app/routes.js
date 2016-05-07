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
	app.get('/lights/:id', function(req, res) {
		var id = req.params.id;

		client.hget("light-settings", id, function (err, obj) {
		   res.json(JSON.parse(obj));
		});		
	});

	app.put('/lights/:id', function(req, res) {
		var id = req.params.id;

		console.log(req.query);	
		console.log(req.body);

		var r = req.body;


		client.hget("light-settings", id, function (err, obj) {
		   light = JSON.parse(obj);

		   for (key in r)
				{
					console.log(key, r[key]);
					if(key=="mode")
						light.mode = r[key];
				}	
				client.hset("light-settings", id, JSON.stringify(light), function (err, obj) {
				   res.json("h]");
				});	
			});
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