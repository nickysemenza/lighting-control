var redis = require("redis");
var client = redis.createClient();
var bluebird = require("bluebird");
var colors = require('colors/safe');
var settings = require('./settings');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);


var hue = require("node-hue-api"),
    HueApi = hue.HueApi,
    hue_lightState = hue.lightState;


var hue_host = "10.0.0.212",
    hue_username = "CtL7kpP4TUjhyiaGD-0BxtcLxAQZ55PyZ6nMXdE9",
    hue_api = new HueApi(hue_host, hue_username),
    hue_state;

var displayResult = function(result) {
    console.log(JSON.stringify(result, null, 2));
};


/**
 * animates the change in a channel value
 *
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
    //console.log(channelNum+"@"+current+"->"+goal+ "| "+timeLeft);
    setTimeout(fadeChannelChange, timing, channelNum,uni,nextVal,goal, timeLeft-timing);
}

/**
 * Updates a light's redis channel values for r/g/b/w
 */
function setRGBW(light,colorArray, time)
{
    time = time || 0;
    return new Promise(function(resolve, reject) {
        //setDimmer(light,255,0);
        if(settings.verbose)
            console.log(colors.black.underline('setRGBW'), light.name+" ( "+light.protocol+" #"+light.id+")","timing:"+time, colorArray, colors.red(Date.now()));
        
            if(light.protocol=="hue"){
                setHueRGB(light.hue_id,colorArray);
                resolve('ok');
            }

        ['r', 'g', 'b', 'w'].map(function (c) {
            var value = colorArray[c];
            var channel = light.colors[c];
            if (value != undefined && channel != undefined) {
                client.hget("dmx-vals:" + light.universe, channel, function (err, obj) {
                    var current = parseInt(obj);
                    if (current != value) {
                        fadeChannelChange(channel, light.universe, current, value, time);
                    }
                    resolve('ok');
                });
            }
        });
    });

}
/**
 * Updates a light's redis channel values for dimmer
 * TODO: fake dimming for non-dimming lights
 */
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
}
/**
 * Gets a Light object by its id
 * @param id
 * @returns light object
 */
function getLightByID(id)
{
    return settings.fixtures[id];//todo: make settings object, not array
}
/**
 * Processes a cue
 * @param cue
 */
function processCue(cue)
{
    var numActions = cue.actions.length;
    promises = [];
    promises.push(client.hincrbyAsync('light-stats','queue_processed',1));
    promises.push(client.hincrbyAsync('light-stats','queue_actions_processed',numActions));
    Promise.all(promises).then(function() {
        if(settings.verbose)
            console.log(colors.bgBlue('processcue called, '+numActions+" actions"));
        processCueAction(cue,0,numActions);
    });
}
/**
 * Recursive processing of cue actions
 * @param cue
 * @param actionNum
 * @param numActions
 */
function processCueAction(cue, actionNum, numActions)
{
    if(settings.verbose)
        console.log('received action #'+actionNum);
    var each = cue.actions[actionNum];
    var light = getLightByID(each.light);
    if(settings.verbose)
        console.log(colors.blue("---processCue-----light #"+light.id+"---protocol:"+light.protocol+"----"));
    setRGBW(light,each.colors,each.timing);
    var nextActionNum = actionNum+1;
    if(nextActionNum <= numActions-1)//if we need to keep going
        processCueAction(cue, nextActionNum, numActions);

}
function setHueRGB(hue_light_id, colorArray) {
    var r = colorArray.r;
    var g = colorArray.g;
    var b = colorArray.b;
    hue_api.setLightState(hue_light_id, hue_lightState.create().on().transitionTime().rgb(r,g,b).bri(255)).then(displayResult).done();
}
module.exports = {
    processCue: processCue
};