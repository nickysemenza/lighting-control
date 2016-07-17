var redis = require("redis");
var client = redis.createClient();
var request = require('request');
var utils = require('./utils');
var settings = require('./settings');
var animations = require('./animations');
var Color = require("color");
var colors = require('colors/safe');


client.on("error", function (err) {
    console.log("Error " + err);
});

console.log("running daemon!");
/**
 * Updates OLA DMX based on redis light-settings dict
 */
function updateDMX() {
	[2].map(function(uni) {
		var vals = [];
		client.hgetall("dmx-vals:" + uni, function(err, obj) {
			Object.keys(obj).forEach(function(key) {
				vals[key] = obj[key];
			});
			var dmx_values = vals.slice(1).join(); //make comma seperated array, but ignore 0 index
			//console.log(uni, dmx_values.substring(0, 50));
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



var colorlist = {};
var a = {};
function advanceLightStage(light)
{
	var id = light.id;
	var mode = light.mode;
	if(mode=="rgbcycle")
	{
		if(colorlist[id]==null)
			colorlist[id] = Color({r:0, g: 255, b: 0});
		var c = colorlist[id];

		utils.setRGBW(light,{r: c.red(),g: c.green(),b: c.blue()});
		c.rotate(light.params.step);//go to next color
	}
	if(mode=="rgbjump" || mode=="strobe")
	{

		var anim = animations[mode];
		var numStages = anim.frames.length;
		if(a[id]==undefined || a[id]>=numStages)
			a[id]=0;

		for (i = 0; i < numStages; i++) {
    		if(a[id]%numStages==i)
				utils.setRGBW(light, anim.frames[i].colors);
		}
		a[id]++;
	}
}


var timerlist = {};
var lightObjs = {};
function lightModeWatcher()
{
	client.hgetall("light-settings", function (err, obj) {
    Object.keys(obj).forEach( function(key) {
    		var light = JSON.parse(obj[key]);
    		var mode = light.mode;
    		// console.log(key, obj[key]);

    		if(mode=="manual")
    		{
				utils.setRGBW(light,light.params.colors);
    		}
            // utils.setDimmer(light, light.params.dimmer);
			// if(!timerlist[key] && mode!="manual")//timer doesn't exist yet
			// {
			// 	timerlist[key] = setInterval( function() { advanceLightStage(light); }, light.params.cycle_period );
			// }
			// else if(timerlist[key] && mode=="manual")//switch back to manual mode
			// {
			// 	clearInterval(timerlist[key]);
			// 	timerlist[key]=null;//reset the timer
			// }
			// if(JSON.stringify(lightObjs[light.id]) != JSON.stringify(light))
			// {
			// 	//the light config changed
			// 	if(mode!="manual")
			// 	{
			// 		//restart the intervaller because light obj has updated
			// 		clearInterval(timerlist[key]);
			// 		timerlist[key] = setInterval( function() { advanceLightStage(light); }, light.params.cycle_period );
			// 	}
			// }
			//lightObjs[light.id] = light;
		});
	});
}
 //setInterval(lightModeWatcher, 50);

function watchQueue()
{
	client.lpop("queue", function (err, obj) {
		//console.log("pop the queue");
		//console.log("QUEUE ENTRY", JSON.parse(obj));
		if(obj==null)
		{
			//console.log('empty queue');
			setTimeout(watchQueue, 50);
		}
		else
		{
			utils.processCue(JSON.parse(obj));
			console.log(colors.yellow("WAITING FOR: "+JSON.parse(obj).wait)+" TO CHECK THE QUEUE AGAIN");
			setTimeout(watchQueue, JSON.parse(obj).wait);
		}
	});
}
watchQueue();


