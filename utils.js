var redis = require("redis");
var client = redis.createClient();
var bluebird = require("bluebird");
var colors = require('colors/safe');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

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
        console.log(colors.black.underline('setRGBW'), light.name+"("+light.id+")","timing:"+time, colorArray, colors.red(Date.now()));
        ['r', 'g', 'b', 'w'].map(function (c) {
            var value = colorArray[c];
            var channel = light.colors[c];
            if (value != undefined && channel != undefined) {
                //client.hset("dmx-vals:" + light.universe, channel, value);
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
    // client.hset("dmx-vals", channel, value);
}

function getLightByID(id)
{
    // client.hget("light-settings",id, function (err, obj) {
    //     console.log(JSON.parse(obj));
    // });
    return client.hgetAsync("light-settings",id)
        .then(function(res) {
        return JSON.parse(res);
    });
}

function processCue(cue)
{
    var numActions = cue.actions.length;
    console.log(colors.bgBlue('processcue called, '+numActions+" actions"));
    processCueAction(cue,0,numActions);
    //console.log(typeof(cue.actions));
    // for(var i in cue.actions)
    // {
    //     var each = cue.actions[i];
    //     console.log("beforepromise",each.colors);
    //     getLightByID(each.light)
    //         .then(function(light)
    //         {
    //             // console.log('yay');
    //             console.log(colors.blue("---processCue-----light #"+light.id+"-------"));
    //             console.log(colors.green("test1"), each.colors);
    //             setRGBW(light,each.colors,each.timing);
    //             console.log(colors.yellow("---------------------------------"));
    //
    //         })
    // }
}
function processCueAction(cue, actionNum, numActions)
{
    console.log('received action #'+actionNum);

        var each = cue.actions[actionNum];
        console.log("beforepromise",each.colors);
        getLightByID(each.light)
        .then(function(light)
        {
            // console.log('yay');
            console.log(colors.blue("---processCue-----light #"+light.id+"-------"));
            console.log(colors.green("test1"), each.colors);
            setRGBW(light,each.colors,each.timing);
            console.log(colors.yellow("---------------------------------"));
            var nextActionNum = actionNum+1;
            console.log(nextActionNum, numActions);
            if(nextActionNum<=numActions-1)
                processCueAction(cue, nextActionNum, numActions);

        })
}
module.exports = {
    fadeChannelChange: fadeChannelChange,
    setRGBW: setRGBW,
    setDimmer: setDimmer,
    getLightByID: getLightByID,
    processCue: processCue
    // renderPost: function(postName) { ... }
};