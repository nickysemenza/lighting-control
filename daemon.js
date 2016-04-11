var redis = require("redis");
var client = redis.createClient();
var request = require('request');
var settings = require('./settings');
client.on("error", function (err) {
    console.log("Error " + err);
});

function updatevals()
{
	var test = [];
	client.hgetall("dmx-vals", function (err, obj) {
		Object.keys(obj).forEach( key => {
			// console.log(key+"-"+obj[key]);
			test[key]=obj[key];
		});
		var dmx_values = test.slice(1).join(); //make comma seperated array, but ignore 0 index
		request.post('http://'+settings.ola_server.ip+':'+settings.ola_server.port+'/set_dmx')
			.form({
					d:dmx_values,
					u:settings.ola_server.universe
				  });
	});
}
setInterval(updatevals, 10);//update every 10ms