import request from 'request';
import settings from './settings'
import * as consts from './consts';

export let hue = require('node-hue-api');
export let HueApi = hue.HueApi;
export let hue_lightState = hue.lightState;
export let hue_api = new HueApi(settings.hue.ip, settings.hue.username);

export let lights = {};

export function processQueue() {
    sendDMX();
}

let universe = 1;
let univ1_last_val = null;
let DMX = [null,new Array(255).fill(0)];//fill universe 1's channels with 0
function sendDMX() {

    Object.keys(lights).forEach(l=>{
        let light = lights[l];
        if(light.type == consts.LIGHT_TYPE_DMX_RGB) {
            let lightVal = light.getDMXChannelValues();
            // console.log(lightVal);

            Object.keys(lightVal.values).forEach(v=>{
                DMX[lightVal.universe][v] = lightVal.values[v];
            })
        }
    });

    let values = DMX[universe].slice(1).join(); // make comma separated array, but ignore 0 index
    if(values != univ1_last_val) {//deuplicate requests
        request.post({
            url: `http://${settings.ola_server.ip}:${settings.ola_server.port}/set_dmx`,
            form: {
                d: values,
                u: universe,
            },
        }, (err) => {
            console.log("aa");
            univ1_last_val = values;
            if (err)
                console.log(err);
        });
    }
}