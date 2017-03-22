import {lights} from './queueWorker';
export default class Light {
    constructor(name, type) {
        this.name = name;
        this.type = type;
        this.r=0;
        this.g=200;
        this.b=0;
        this.blackout=false;
        this.dimmer=255;
        lights[name]=this;
    }
    debug() {
        console.log(`i am light name ${this.name}, type: ${this.type}`);
    }
    doRGBFade(deltaR,deltaG,deltaB,frameLength,numFrames,frameNum,resolve) {
        // console.log('doing frame '+frameNum+" out of "+numFrames,this.r,this.b,this.g);
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
    fadeRGB(r,g,b, duration=100, afterWait=0) {
        return new Promise((resolve, reject)=>{
            let frameLength = 5;//ms, higher = more stutter

            let numFrames = duration/frameLength;
            let deltaR = r-this.r;
            let deltaG = g-this.g;
            let deltaB = b-this.b;
            console.log(`going to fade, deltas are: ${deltaR},${deltaG},${deltaB},\n we will have ${numFrames}frames at ${frameLength}ms each, animation is ${duration}ms long, wait for ${afterWait}ms after`);
            let processFade = new Promise((resolveDo, reject)=>{
                this.doRGBFade(deltaR,deltaG,deltaB,frameLength,numFrames,1,resolveDo);
            });
            processFade.then(()=>{
                //fix precision issues...
                this.r = r;
                this.g = g;
                this.b = b;
                setTimeout(()=>{resolve();},afterWait);
            })
        })
    }

}