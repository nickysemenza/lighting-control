const redis = require('redis');
const client = redis.createClient();
const bluebird = require('bluebird');
const colors = require('colors/safe');
const settings = require('./settings');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);


let hue = require('node-hue-api'),
  HueApi = hue.HueApi,
  hue_lightState = hue.lightState;


let hue_host = '10.0.0.212',
  hue_username = 'CtL7kpP4TUjhyiaGD-0BxtcLxAQZ55PyZ6nMXdE9',
  hue_api = new HueApi(hue_host, hue_username),
  hue_state;

const displayResult = function (result) {
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
function fadeChannelChange(channelNum, uni, current, goal, timeLeft) {
  if (timeLeft == 0)// instant change
        { current = goal; }
  client.hset(`dmx-vals:${uni}`, channelNum, current);
  if (current == goal)// reached the goal
        { return; }
  const timing = timeLeft / Math.abs(goal - current);
  let nextVal;
  if (goal > current) { nextVal = current + 1; } else { nextVal = current - 1; }
    // console.log(channelNum+"@"+current+"->"+goal+ "| "+timeLeft);
  setTimeout(fadeChannelChange, timing, channelNum, uni, nextVal, goal, timeLeft - timing);
}

/**
 * Updates a light's redis channel values for r/g/b/w
 */
function setRGBW(light, colorArray, time) {
  time = time || 0;
  return new Promise((resolve, reject) => {
        // setDimmer(light,255,0);
    if (settings.verbose) { console.log(colors.black.underline('setRGBW'), `${light.name} ( ${light.protocol} #${light.id})`, `timing:${time}`, colorArray, colors.red(Date.now())); }

    if (light.protocol == 'hue') {
      setHueRGB(light.hue_id, colorArray);
      resolve('ok');
    }

    ['r', 'g', 'b', 'w'].map((c) => {
      const value = colorArray[c];
      const channel = light.colors[c];
      if (value != undefined && channel != undefined) {
        client.hget(`dmx-vals:${light.universe}`, channel, (err, obj) => {
          const current = parseInt(obj);
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
function setDimmer(light, value, time) {
  time = time || 0;
  const channel = light.dimmer;
  if (channel != null) {
    client.hget(`dmx-vals:${light.universe}`, channel, (err, obj) => {
      const current = parseInt(obj);
      if (current != value) { fadeChannelChange(channel, light.universe, current, value, time); }
    });
  }
}
/**
 * Gets a Light object by its id
 * @param id
 * @returns light object
 */
function getLightByID(id) {
  return settings.fixtures[id];// todo: make settings object, not array
}
/**
 * Processes a cue
 * @param cue
 */
function processCue(cue) {
  const numActions = cue.actions.length;
  promises = [];
  promises.push(client.hincrbyAsync('light-stats', 'queue_processed', 1));
  promises.push(client.hincrbyAsync('light-stats', 'queue_actions_processed', numActions));
  Promise.all(promises).then(() => {
    if (settings.verbose) { console.log(colors.bgBlue(`processcue called, ${numActions} actions`)); }
    processCueAction(cue, 0, numActions);
  });
}
/**
 * Recursive processing of cue actions
 * @param cue
 * @param actionNum
 * @param numActions
 */
function processCueAction(cue, actionNum, numActions) {
  if (settings.verbose) { console.log(`received action #${actionNum}`); }
  const each = cue.actions[actionNum];
  const light = getLightByID(each.light);
  if (settings.verbose) { console.log(colors.blue(`---processCue-----light #${light.id}---protocol:${light.protocol}----`)); }
  setRGBW(light, each.colors, each.timing);
  const nextActionNum = actionNum + 1;
  if (nextActionNum <= numActions - 1)// if we need to keep going
      { processCueAction(cue, nextActionNum, numActions); }
}
function setHueRGB(hue_light_id, colorArray) {
  const r = colorArray.r;
  const g = colorArray.g;
  const b = colorArray.b;
  hue_api.setLightState(hue_light_id, hue_lightState.create().on().transitionTime().rgb(r, g, b).bri(255)).then(displayResult).done();
}
module.exports = {
  processCue,
};
