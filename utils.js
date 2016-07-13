function test() {
    console.log("hi");
}

var redis = require("redis");
var client = redis.createClient();
var bluebird = require("bluebird");

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
    return new Promise(function(resolve, reject) {
        console.log('setRGBW', light.id, light.name, colorArray);
        time = time || 0;
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

module.exports = {
    test: test,
    fadeChannelChange: fadeChannelChange,
    setRGBW: setRGBW,
    setDimmer: setDimmer,
    getLightByID: getLightByID
    // renderPost: function(postName) { ... }
};