import request from 'request';
import settings from './settings'
import * as lightTypes from './consts';
export function processQueue() {
    // console.log('processing')
    // console.log(lights);
    sendDMX();
};
export let lights = {};
export let hue = require('node-hue-api'),
    HueApi = hue.HueApi,
    hue_lightState = hue.lightState;

export let hue_api = new HueApi(settings.hue.ip, settings.hue.username);

export let DMX = [null,new Array(255).fill(0)];//fill universe 1's channels
function sendDMX() {

    Object.keys(lights).forEach(l=>{
        let light = lights[l];
        if(light.type == lightTypges.LIGHT_TYPE_DMX_RGB) {
            let lightVal = light.getDMXChannelValues();
            // console.log(lightVal);

            Object.keys(lightVal.values).forEach(v=>{
                DMX[lightVal.universe][v] = lightVal.values[v];
            })
        }
    })

    let UNIVERSE = 1;
    let values = DMX[UNIVERSE].slice(1).join(); // make comma seperated array, but ignore 0 index
    // console.log(values.substring(0, 50));
    request.post({
        url: `http://${settings.ola_server.ip}:${settings.ola_server.port}/set_dmx`,
        form: {
            d: values,
            u: UNIVERSE,
        },
    }, (err, httpResponse, body) => {
        if (err)					{ console.log(err); }
    });
}