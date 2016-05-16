var redis = require("redis");
var client = redis.createClient();
var request = require('request');
var settings = require('./settings');
var Color = require("color");
client.on("error", function (err) {
    console.log("Error " + err);
});

console.log("running!");
function updateDMX()
{
	[2,3].map( function(uni) 
	{
		console.log(uni);
		var vals = [];
		client.hgetall("dmx-vals:"+uni, function (err, obj) {
			Object.keys(obj).forEach( key => {
				vals[key]=obj[key];
			});
			var dmx_values = vals.slice(1).join(); //make comma seperated array, but ignore 0 index
			console.log(uni, dmx_values.substring(0, 50));
			request.post(
				{
					url: 'http://'+settings.ola_server.ip+':'+settings.ola_server.port+'/set_dmx',
					form: {	d:dmx_values, u:uni }
				}, function(err,httpResponse,body){
					  	if(err)
					  		console.log(err);

					  });

		});

	});
}

function setRGB(light,r,g,b)
{
	var color_channel_map = light.colors;
	client.hset("dmx-vals:"+light.universe, color_channel_map.r, r);
	client.hset("dmx-vals:"+light.universe, color_channel_map.g, g);
	client.hset("dmx-vals:"+light.universe, color_channel_map.b, b);
}
function setDimmer(light,value)
{
	var channel = light.dimmer;
	if(channel!=null)
	{
		client.hget("dmx-vals:"+light.universe, channel, function (err, obj) {
		var current = parseInt(obj);
		if(current!=value)
			fadeChannelChange(channel,current,value,light.universe);
		});	
	}
		// client.hset("dmx-vals", channel, value);
}

function setWhite(light,value)
{
	var channel = light.colors.w;
	client.hget("dmx-vals:"+light.universe, channel, function (err, obj) {
		var current = parseInt(obj);
		if(current!=value)
			fadeChannelChange(channel,current,value,light.universe);
	});	
}
function fadeChannelChange(channel,current,goal,uni)
{
	client.hset("dmx-vals:"+uni, channel, current);
	// console.log("current:"+current+" goal:"+goal);
	if(current == goal)//reached the goal
		return;
	var next;
	if(goal > current)
		next=current+1;
	else
		next=current-1;
	

	setTimeout(fadeChannelChange, 3, channel,next,goal,uni);
	//fadeChannelChange(channel,next,goal);
}
setInterval(updateDMX, 100);

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
    			if(light.colors.w!=undefined)//if it supports white
    				setWhite(light,light.params.colors.w);
    		}
    		setDimmer(light, light.params.dimmer);
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