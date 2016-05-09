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
	var vals = [];
	client.hgetall("dmx-vals", function (err, obj) {
		Object.keys(obj).forEach( key => {
			vals[key]=obj[key];
		});
		var dmx_values = vals.slice(1).join(); //make comma seperated array, but ignore 0 index
		console.log(dmx_values);
		request.post('http://'+settings.ola_server.ip+':'+settings.ola_server.port+'/set_dmx')
			.form({
					d:dmx_values,
					u:settings.ola_server.universe
				  });
	});
}

function setRGB(light,r,g,b)
{
	var color_channel_map = light.colors;
	client.hset("dmx-vals", color_channel_map.r, r);
	client.hset("dmx-vals", color_channel_map.g, g);
	client.hset("dmx-vals", color_channel_map.b, b);
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

		setRGB(light,c.red(),c.green(),c.blue());
		c.rotate(light.params.step);//go to next color
	}
	if(mode=="rgbjump")
	{
		var stages = 3;
		if(a[id]==undefined)
			a[id]=0;
		if(a[id]%stages==0)
			setRGB(light, 255,0,0);
		if(a[id]%stages==1)
			setRGB(light, 0,255,0);
		if(a[id]%stages==2)
			setRGB(light, 0,0,255);
		a[id]++;
	}
	if(mode=="strobe")
	{
		var stages = 2;
		if(a[id]==undefined)
			a[id]=0;
		if(a[id]%stages==0)
			setRGB(light,255,255,255);
		if(a[id]%stages==1)
			setRGB(light, 0,0,0);
		a[id]++;
	}
}

var timerlist = {};
var lightObjs = {};
function lightModeWatcher()
{
	client.hgetall("light-settings", function (err, obj) {
    Object.keys(obj).forEach( key => {
    		var light = JSON.parse(obj[key]);
    		var mode = light.mode;
    		// console.log(key, obj[key]);

    		if(mode=="manual")
    		{
    			setRGB(light,light.params.colors.r,light.params.colors.g,light.params.colors.b);
    		}

			if(!timerlist[key] && mode!="manual")//timer doesn't exist yet
			{
				timerlist[key] = setInterval( function() { advanceLightStage(light); }, light.params.cycle_period );
			}
			else if(timerlist[key] && mode=="manual")//switch back to manual mode
			{
				clearInterval(timerlist[key]);
				timerlist[key]=null;//reset the timer
			}
			if(JSON.stringify(lightObjs[light.id]) != JSON.stringify(light))
			{
				//the light config changed
				if(mode!="manual")
				{
					//restart the intervaller because light obj has updated
					clearInterval(timerlist[key]);
					timerlist[key] = setInterval( function() { advanceLightStage(light); }, light.params.cycle_period );
				}
			}
			lightObjs[light.id] = light;
		});
	});
}
 setInterval(lightModeWatcher, 5);