const redis = require('redis');
const client = redis.createClient();
const request = require('request');
const utils = require('./utils');
const settings = require('./settings');
const Color = require('color');
const colors = require('colors/safe');


client.on('error', (err) => {
  console.log(`Error ${err}`);
});

console.log('running daemon!');
/**
 * Updates OLA DMX based on redis light-settings dict
 * todo: multiple universes
 */
function updateDMX() {
  [3].map((uni) => {
    const vals = [];
    client.hgetall(`dmx-vals:${uni}`, (err, obj) => {
      Object.keys(obj).forEach((key) => {
        vals[key] = obj[key];
      });
      let dmx_values = vals.slice(1);
			// console.log(dmx_values);
      const x = [];
      dmx_values = dmx_values.concat(dmx_values);
      dmx_values = dmx_values.concat(dmx_values);
      dmx_values = dmx_values.concat(dmx_values);
      dmx_values = dmx_values.concat(dmx_values);
      dmx_values = dmx_values.concat(dmx_values);
      dmx_values = dmx_values.concat(dmx_values);
      dmx_values = dmx_values.concat(dmx_values);
      dmx_values = dmx_values.concat(dmx_values);
      console.log(x);
      if (uni == 3) {
			// Array.prototype.push.apply(vals,vals)

      }
      dmx_values = dmx_values.join(); // make comma seperated array, but ignore 0 index
      console.log(uni, dmx_values.substring(0, 50));
      request.post({
        url: `http://${settings.ola_server.ip}:${settings.ola_server.port}/set_dmx`,
        form: {
          d: dmx_values,
          u: uni,
        },
      }, (err, httpResponse, body) => {
        if (err)					{ console.log(err); }
      });
    });
  });
}
setInterval(updateDMX, 5);

function watchQueue() {
  client.lpop('queue', (err, obj) => {
    if (obj == null)		{
      setTimeout(watchQueue, 50); // empty queue, wait a bit
    } else		{
      const q = JSON.parse(obj);
      utils.processCue(q);
      if (settings.verbose)				{ console.log(`${colors.yellow(`WAITING FOR: ${q.wait}`)} TO CHECK THE QUEUE AGAIN`); }
      setTimeout(watchQueue, q.wait);
    }
  });
}
watchQueue();

