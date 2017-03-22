export function processQueue() {
    // console.log('processing')
    console.log(lights);
};
export let lights = {};


export let hue = require('node-hue-api'),
    HueApi = hue.HueApi,
    hue_lightState = hue.lightState;

let hue_host = '10.0.0.212',
    hue_username = 'CtL7kpP4TUjhyiaGD-0BxtcLxAQZ55PyZ6nMXdE9';

export let hue_api = new HueApi(hue_host, hue_username);