import Light from "./Light";
import * as lightTypes from './consts';
import {hue_api, hue_lightState} from './queueWorker';
export default class HueLight extends Light {
    constructor(name, hue_id,) {
        super(name, lightTypes.LIGHT_TYPE_HUE);
        this.hue_id = hue_id;
    }
    fadeRGB(r,g,b, duration=100) {
        const displayResult = function (result) {
            console.log(JSON.stringify(result, null, 2));
        };
        this.r=r;
        this.g=g;
        this.b=b;
        hue_api.setLightState(1, hue_lightState.create().on().transitionTime(duration/100).rgb(r, g, b)).then(displayResult).done();
    }
}