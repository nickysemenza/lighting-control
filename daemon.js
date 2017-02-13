var redis = require("redis");
var client = redis.createClient();
var request = require('request');
var utils = require('./utils');
var settings = require('./settings');
var Color = require("color");
var colors = require('colors/safe');


client.on("error", function (err) {
    console.log("Error " + err);
});

console.log("running daemon!");
/**
 * Updates OLA DMX based on redis light-settings dict
 * todo: multiple universes
 */
function updateDMX() {
	[3].map(function(uni) {
		var vals = [];
		client.hgetall("dmx-vals:" + uni, function(err, obj) {
			Object.keys(obj).forEach(function(key) {
				vals[key] = obj[key];
			});
			var dmx_values = vals.slice(1);
			//console.log(dmx_values);
			var x = [];
			dmx_values = dmx_values.concat(dmx_values);
			dmx_values = dmx_values.concat(dmx_values);
			dmx_values = dmx_values.concat(dmx_values);
			dmx_values = dmx_values.concat(dmx_values);
			dmx_values = dmx_values.concat(dmx_values);
			dmx_values = dmx_values.concat(dmx_values);
			dmx_values = dmx_values.concat(dmx_values);
			dmx_values = dmx_values.concat(dmx_values);
			console.log(x);
			if(uni==3) {
			//Array.prototype.push.apply(vals,vals)

			}
			dmx_values = dmx_values.join(); //make comma seperated array, but ignore 0 index
			console.log(uni, dmx_values.substring(0, 50));
			request.post({
				url: 'http://' + settings.ola_server.ip + ':' + settings.ola_server.port + '/set_dmx',
				form: {
					d: dmx_values,
					u: uni
				}
			}, function(err, httpResponse, body) {
				if (err)
					console.log(err);
			});
		});

	});
}
setInterval(updateDMX, 5);

function watchQueue()
{
	client.lpop("queue", function (err, obj) {
		if(obj==null)
		{
			setTimeout(watchQueue, 50); //empty queue, wait a bit
		}
		else
		{
			var q = JSON.parse(obj);
			utils.processCue(q);
			if(settings.verbose)
				console.log(colors.yellow("WAITING FOR: "+q.wait)+" TO CHECK THE QUEUE AGAIN");
			setTimeout(watchQueue, q.wait);

		}
	});
}
watchQueue();


