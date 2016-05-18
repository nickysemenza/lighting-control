var redis = require("redis");
var client = redis.createClient();
var request = require('request');
var settings = require('./settings');
var animations = require('./animations');
var Color = require("color");
client.on("error", function (err) {
    console.log("Error " + err);
});



console.log("running!");
function updateDMX()
{
	[2,3].map( function(uni) 
	{
		var vals = [];
		client.hgetall("dmx-vals:"+uni, function (err, obj) {
			Object.keys(obj).forEach( key => {
				vals[key]=obj[key];
			});
			var dmx_values = vals.slice(1).join(); //make comma seperated array, but ignore 0 index
			//console.log(uni, dmx_values.substring(0, 50));
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
setInterval(updateDMX, 45);

function setRGB(light,r,g,b)
{
	var color_channel_map = light.colors;
	client.hset("dmx-vals:"+light.universe, color_channel_map.r, r);
	client.hset("dmx-vals:"+light.universe, color_channel_map.g, g);
	client.hset("dmx-vals:"+light.universe, color_channel_map.b, b);
}
function setDimmer(light,value,time)
{
	time = time || 0;
	var channel = light.dimmer;
	if(channel!=null)
	{
		client.hget("dmx-vals:"+light.universe, channel, function (err, obj) {
		var current = parseInt(obj);
		if(current!=value)
			fadeChannelChange(channel,light.universe,current,value,time);
		});	
	}
		// client.hset("dmx-vals", channel, value);
}

function setWhite(light,value,time)
{
	time = time || 0;
	var channel = light.colors.w;
	client.hget("dmx-vals:"+light.universe, channel, function (err, obj) {
		var current = parseInt(obj);
		if(current!=value)
			fadeChannelChange(channel,light.universe,current,value,time);
	});	
}
/*
* channelNum - the channel number to alter the value of
* uni - the universe the channel is in
* current - the current value
* goal - the target dmx_values
*/
function fadeChannelChange(channelNum,uni,current,goal,timeLeft)
{
	if(timeLeft==0)//instant change
		current=goal;
	client.hset("dmx-vals:"+uni, channelNum, current);
	if(current == goal)//reached the goal
		return;

	var timing = timeLeft/Math.abs(goal-current);
	var nextVal;
	if(goal > current)
		nextVal=current+1;
	else
		nextVal=current-1;
	setTimeout(fadeChannelChange, timing, channelNum,uni,nextVal,goal, timeLeft-timing);
}
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
	if(mode=="rgbjump" || mode=="strobe")
	{

		var anim = animations[mode];
		var numStages = anim.frames.length;
		if(a[id]==undefined || a[id]>=numStages)
			a[id]=0;

		for (i = 0; i < numStages; i++) { 
    		if(a[id]%numStages==i)
				setRGB(light, anim.frames[i].colors.r,anim.frames[i].colors.g,anim.frames[i].colors.b);
		}
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