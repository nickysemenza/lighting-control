import {processQueue, lights} from './queueWorker';
import DMXRGBLight from './DMXRGBLight';
import HueLight from './HueLight';
import kue from 'kue';
setInterval(processQueue, 5);

let l1 = new DMXRGBLight("l1",1,8,1);
l1.fadeRGB(255,0,0,1000).then(()=>{
    console.log("FADED1");
    l1.fadeRGB(255,255,255,5,2000).then(()=>{
        console.log("FADED2");
        l1.fadeRGB(0,0,0,500).then(()=>{
            console.log("FADED3");
            l1.fadeRGB(0,30,255,500).then(()=>{
                console.log("FADED4");
            });
        });
    });

});

//
// let h1 = new HueLight("desk",1);
// h1.fadeRGB(5,3,2,20);
// console.log(lights);

const queue = kue.createQueue({prefix: 'lighting-q'});

let job = queue.create('rgb', {
    r: 25,
    g: 233,
    b: 52,
    light: "l1",
    time: 100
}).save( function(err) {
    if( !err ) console.log( job.id );
});


