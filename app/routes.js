var settings = require('.././settings');
var redis = require("redis");
var client = redis.createClient();
client.on("error", function (err) {
    console.log("Error " + err);
});
module.exports = function(app) {

	app.get('/lights', function(req, res) {
		//res.json(settings.fixtures);
		r = [];
		client.hgetall("light-settings", function (err, obj) {
		   Object.keys(obj).forEach( key => {
		   	r.push(JSON.parse(obj[key]));
		   });
		   res.json(r);
		});	
	});
	app.get('/lights/:id', function(req, res) {
		var id = req.params.id;

		client.hget("light-settings", id, function (err, obj) {
		   res.json(JSON.parse(obj));
		});		
	});

	app.put('/lights/:id', function(req, res) {
		var id = req.params.id;
		var l = req.body;
		client.hget("light-settings", id, function (err, obj) {
		   light = JSON.parse(obj);

		   for (key in l)
				{
					// console.log(key, l[key]);
					if(key=="mode")
						light.mode = l[key];
					if(key=="params")
						light.params = l[key];
				}	
				client.hset("light-settings", id, JSON.stringify(light), function (err, obj) {
				   res.json(light);
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

		ress.json("ok");
	});

	app.get('/dmx', function(req, res) {
		r = [];
		client.hgetall("dmx-vals:2", function (err, obj) {
		   res.json(obj);
		});	
	});

	app.get('*', function(req, res) {
		//serve angular
		res.sendfile('./public/index.html');
	});

};