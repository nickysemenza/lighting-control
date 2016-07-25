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

	/**
	 * Gets a list of all lights
     */
	app.get('/lights', function(req, res) {
		res.json(settings.fixtures);
	});
	/**
	 * JSON obj of stats hmap
	 */
	app.get('/stats', function(req, res) {
		client.hgetall("light-stats", function (err, obj) {
			res.json(obj);
		});
	});
	/**
	 * Receives a cue and adds it to redis queue
	 */
	app.put('/q', function(req, res) {
		var multipleCues = req.body instanceof Array;
		if(multipleCues)
		{
			var numCues = req.body.length;
			console.log(colors.bgBlack(numCues+" cues received"));
			var aaa = [];
			for(var x in req.body)
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
				client.hincrby('light-stats','queue_received',1, function(err, obj){
					res.json('ok');
				});
			})
		}

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