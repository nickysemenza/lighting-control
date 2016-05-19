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

function setRGBW(light,colorArray, time)
{
	time = time || 0;
	['r','g','b','w'].map(function(c)
	{
		var value = colorArray[c];
		var channel = light.colors[c];
		if(value != undefined && channel != undefined) {
			//client.hset("dmx-vals:" + light.universe, channel, value);
			client.hget("dmx-vals:"+light.universe, channel, function (err, obj) {
				var current = parseInt(obj);
				if(current!=value) {
					console.log("calling fadeChannelChange on channel",channel);
					fadeChannelChange(channel, light.universe, current, value, time);
				}
			});
		}
	});

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
	console.log(channelNum+"@"+current+"->"+goal+ "| "+timeLeft);
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

		setRGBW(light,{r: c.red(),g: c.green(),b: c.blue()});
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
				setRGBW(light, anim.frames[i].colors);
		}
		a[id]++;
	}
}



client.hgetall("light-settings", function (err, obj) {
	Object.keys(obj).forEach( key => {
		var light = JSON.parse(obj[key]);
		setRGBW(light,{r:255,g:255,b:255,w:255},100);
		//setRGBW(light,{r:0},100);
		//setRGBW(light,{g:255},100);
	});
});




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
    			setRGBW(light,light.params.colors);
    			//if(light.colors.w!=undefined)//if it supports white
    			//	setWhite(light,light.params.colors.w);
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
 //setInterval(lightModeWatcher, 5);