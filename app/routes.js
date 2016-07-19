var settings = require('.././settings');
var utils = require('.././utils');
var redis = require("redis");
var colors = require('colors');

var bluebird = require("bluebird");


bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);


var client = redis.createClient();
client.on("error", function (err) {
    console.log("Error " + err);
});
module.exports = function(app) {

	/**
	 * CORS headers
	 */
	app.all('/*', function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "content-type");
		res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
		next();
	});

	app.get('/lights', function(req, res) {
		r = [];
		client.hgetall("light-settings", function (err, obj) {
		   Object.keys(obj).forEach( function(key) {
		   	r.push(JSON.parse(obj[key]));
		   });
		   res.json(r);
		});	
	});
	/**
	 * JSON obj of stats hmap
	 */
	app.get('/stats', function(req, res) {
		client.hgetall("light-stats", function (err, obj) {
			res.json(obj);
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

	/**
	 * Receives a cue and adds it to redis
	 */
	app.put('/q', function(req, res) {
		var multipleCues = req.body instanceof Array;
		if(multipleCues)
		{
			var numCues = req.body.length;
			console.log(colors.bgBlack(numCues+" cues received"));
			var aaa = [];
			for(x in req.body)
			{
				aaa.push(client.rpushAsync('queue', JSON.stringify(req.body[x])));

			}
			aaa.push(client.hincrbyAsync('light-stats','queue_received',numCues));
			Promise.all(aaa).then(function() {
				res.json('ok');
			});

		}
		else
		{
			console.log(colors.bgBlack("1 cue received"));
			client.rpush('queue', JSON.stringify(req.body), function(err, obj) {
				client.hincrby('stats','queue_received',1, function(err, obj){
					res.json('ok');
				});
			})
		}

	});

		

	// app.put('/channels', function(req, res) {
	// 	for (var propName in req.query) {
	// 	    if (req.query.hasOwnProperty(propName)) {
	// 	        console.log(propName, req.query[propName]);
	// 	        client.hset("dmx-vals", propName, req.query[propName]);
	// 	    }
	// 	}
	// 	res.json("ok");
	// });
	app.get('/reset', function(req, res) {
		settings.fixtures.forEach(function(l)
		{
			client.hset("light-settings", l.id, JSON.stringify(l), redis.print);
		});

		ress.json("ok");
	});
	app.put('/c/:id/', function(req,res)
	{
		// console.log(Date.now());
		var id = req.params.id;
		var rgbwvals = req.body;

		utils
			.getLightByID(id)
			.then(function(light)
			{
				utils.setRGBW(light,
					rgbwvals,
					req.body.t || 0
				).then(
					function()
					{
						res.json('ok')
					});
			});
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