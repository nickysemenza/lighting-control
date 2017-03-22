import Light from "./Light";
import * as lightTypes from './consts';
export default class DMXRGBLight extends Light {
    constructor(name,startAddress, endAddress) {
        super(name,lightTypes.LIGHT_TYPE_DMX_RGB);
        this.startAddress = startAddress;
        this.endAddress = endAddress;
    }
}