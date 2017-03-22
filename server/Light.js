import {lights} from './queueWorker';
export default class Light {
    constructor(name, type) {
        this.name = name;
        this.type = type;
        this.r=0;
        this.g=0;
        this.b=0;
        this.blackout=false;
        this.dimmer=255;
        this.actionID=0;
        lights[name]=this;
    }
    debug() {
        console.log(`i am light name ${this.name}, type: ${this.type}`);
    }

    newAction() {
        return ++this.actionID;
    }

    doRGBFade(deltaR,deltaG,deltaB,frameLength,numFrames,frameNum,resolve,actionIDAtStart) {
        // console.log('doing frame '+frameNum+" out of "+numFrames,this.r,this.b,this.g);
        if(this.actionID!=actionIDAtStart) {
            console.log('aborting due to lock');
            resolve();
        }
        else {
            this.r+=(deltaR/numFrames);
            this.g+=(deltaG/numFrames);
            this.b+=(deltaB/numFrames);
            if(frameNum+1>=numFrames)//eek overshooting
                resolve();
            else {
                frameNum++;
                setTimeout(() => {
                    this.doRGBFade(deltaR, deltaG, deltaB, frameLength, numFrames, frameNum, resolve,actionIDAtStart)
                }, frameLength)
            }
        }

    }
    fadeRGB(r,g,b, duration=100, afterWait=0) {
        this.newAction();
        let actionIDAtStart = this.actionID;
        return new Promise((resolve, reject)=>{
            let frameLength = 2;//ms, higher = more stutter

            let numFrames = duration/frameLength;
            let deltaR = r-this.r;
            let deltaG = g-this.g;
            let deltaB = b-this.b;
            console.log(`[light ${this.name}, action #${this.actionID}\n\tRGB fade, deltas are: ${deltaR},${deltaG},${deltaB},\n\twe will have ${numFrames}frames at ${frameLength}ms each, animation is ${duration}ms long, wait for ${afterWait}ms after`);
            let processFade = new Promise((resolveDo, reject)=>{
                this.doRGBFade(deltaR,deltaG,deltaB,frameLength,numFrames,1,resolveDo,actionIDAtStart);
            });
            processFade.then(()=>{
                //fix precision issues...
                this.r = r;
                this.g = g;
                this.b = b;
                if(actionIDAtStart==this.actionID)
                    setTimeout(()=>{resolve();},afterWait);
            })
        })
    }
    doStrobe(rate, duration, startTime, r) {
        if(new Date().getTime() < startTime+duration) {
            this.fadeRGB(255, 255, 255, 0, rate).then(() => {
                this.fadeRGB(0, 0, 0, 0, rate).then(() => {
                    this.doStrobe(rate, duration, startTime, r);
                })
            })
        }
        else
            r();
    }
    strobe(rate=30, duration=1000) {
        return new Promise((resolve, reject)=>{
            this.doStrobe(rate,duration,new Date().getTime(), resolve);
        })
    }

}