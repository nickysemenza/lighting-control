import Light from "./Light";
import * as lightTypes from './consts';
export default class DMXRGBLight extends Light {
    constructor(name, startAddress, endAddress, universe = 1, profile = null) {
        super(name,lightTypes.LIGHT_TYPE_DMX_RGB);
        this.startAddress = startAddress;
        this.endAddress = endAddress;
        this.universe = universe;
        this.profile = {dimmer: 1, r:5, g:6, b:7, w:8};
    }
    getDMXChannelValues() {
        let values = {};
        Object.keys(this.profile).forEach(attr=>
        {
            let channel = this.profile[attr]+this.startAddress-1;
            values[channel] = Math.ceil(this[attr] ? this[attr] : 0);
        });
        return {universe: this.universe, values};
    }
    fadeRGB(...args) {
        return super.fadeRGB(...args);
    }
}