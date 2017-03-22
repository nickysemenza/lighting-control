import Light from "./Light";
import * as lightTypes from './consts';
export default class DMXRGBLight extends Light {
    constructor(name, startAddress, endAddress, universe = 1, profile = null) {
        super(name,lightTypes.LIGHT_TYPE_DMX_RGB);
        this.startAddress = startAddress;
        this.endAddress = endAddress;
        this.universe = universe;
        this.profile = lightTypes.PROFILE_RGBW_PAR_1;
    }
    getDMXChannelValues() {
        let values = {};
        let human = {};
        Object.keys(this.profile.channelMap).forEach(attr=>
        {
            let channel = this.profile.channelMap[attr]+this.startAddress-1;
            values[channel] = Math.ceil(this[attr] ? this[attr] : 0);
            human[channel] = {value: Math.ceil(this[attr]), channel: attr};
        });
        return {universe: this.universe, values, human};
    }
    // fadeRGB(...args) {
    //     return super.fadeRGB(...args);
    // }
}