var redis = require("redis");
var client = redis.createClient();
var request = require('request');
var settings = require('./settings');
var Color = require("color");
client.on("error", function (err) {
    console.log("Error " + err);
});

function updateDMX()
{
	var test = [];
	client.hgetall("dmx-vals", function (err, obj) {
		Object.keys(obj).forEach( key => {
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
setInterval(updateDMX, 10);

var lightsById = {};
settings.fixtures.forEach(function(l)
{
	//so we can access by ID;
	lightsById[l.id] = l;
});
var timerlist = {};
var colorlist = {};

function advanceLightStage(light_id,mode)
{

	if(mode=="fade")
	{
		var fade_step = 10;
		if(colorlist[light_id]==null)
		colorlist[light_id] = Color({r: 0, g: 255, b: 255});
		var current_color = colorlist[light_id];
		// console.log(current_color.hexString());
		var color_channel_map = lightsById[light_id].colors;
		client.hset("dmx-vals", color_channel_map.r, current_color.red());
		client.hset("dmx-vals", color_channel_map.g, current_color.green());
		client.hset("dmx-vals", color_channel_map.b, current_color.blue());
		current_color.rotate(fade_step);
	}
}

function lightModeWatcher()
{
	client.hgetall("light-modes", function (err, obj) {
    Object.keys(obj).forEach( key => {
    		var mode = obj[key];
    		console.log(key, obj[key]);
			if(!timerlist[key] && mode!="manual")
			{
				var period = 70;
				timerlist[key] = setInterval( function() { advanceLightStage(key,mode); }, period );
			}
			else if(timerlist[key] && mode=="manual")//switch back to manual mode
			{
				clearInterval(timerlist[key]);
				timerlist[key]=null;//reset the timer
			}
		});
	});
}
 setInterval(lightModeWatcher, 10);