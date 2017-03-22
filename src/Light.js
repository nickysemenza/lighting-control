import {lights} from './queueWorker';
export default class Light {
    constructor(name, type) {
        this.name = name;
        this.type = type;
        this.r=0;
        this.g=200;
        this.b=0;
        this.blackout=false;
        lights[name]=this;
    }
    debug() {
        console.log(`i am light name ${this.name}, type: ${this.type}`);
    }
    doRGBFade(deltaR,deltaG,deltaB,frameLength,numFrames,frameNum,resolve) {
        console.log('doing frame '+frameNum+" out of "+numFrames);
        this.r+=(deltaR/numFrames);
        this.g+=(deltaG/numFrames);
        this.b+=(deltaB/numFrames);
        if(frameNum+1>=numFrames)//eek overshooting
            resolve();
        else {
            frameNum++;
            setTimeout(() => {
                this.doRGBFade(deltaR, deltaG, deltaB, frameLength, numFrames, frameNum, resolve)
            }, frameLength)
        }

    }
    fadeRGB(r,g,b, duration=100) {
        return new Promise((resolve, reject)=>{
            let frameLength = 20;//ms

            let numFrames = duration/20;
            let deltaR = r-this.r;
            let deltaG = g-this.g;
            let deltaB = b-this.b;
            console.log(`going to fade, deltas are: ${deltaR},${deltaG},${deltaB},`);
            let processFade = new Promise((resolveDo, reject)=>{
                this.doRGBFade(deltaR,deltaG,deltaB,frameLength,numFrames,1,resolveDo);
            });
            processFade.then(()=>{
                //fix precision issues...
                this.r = r;
                this.g = g;
                this.b = b;
                resolve();
            })
        })
    }

}