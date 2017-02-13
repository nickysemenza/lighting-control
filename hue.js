// let huejay = require('huejay');

// let client = new huejay.Client({
//   host:     '10.0.0.212',
// username: 'CtL7kpP4TUjhyiaGD-0BxtcLxAQZ55PyZ6nMXdE9'});

// console.log(`Incrementing light hue/saturation levels...`);

// client.lights.getById(3)
//   .then(light => {
//     console.log(`Saving light...`);

//     light.incrementHue        = 6500;
//     light.incrementSaturation = 25;
//     light.transitionTime      = 5;

//     return client.lights.save(light);
//   })
//   .then(light => {
//     console.log('New hue:', light.hue);
//     console.log('New saturation:', light.saturation);
//   })
//   .catch(error => {
//     console.log(error.stack);
//   });

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

hue_api.setLightState(1, hue_lightState.create().on().transitionTime(10).rgb(0,80,200).bri(255)).then(displayResult).done();

// // --------------------------
// // Using a callback
// api.setLightState(5, state, function(err, lights) {
//     if (err) throw err;
//     displayResult(lights);
// });