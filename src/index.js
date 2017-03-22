import {processQueue, lights} from './queueWorker';
import DMXRGBLight from './DMXRGBLight';
import HueLight from './HueLight';
import kue from 'kue';
setInterval(processQueue, 200);
console.log("hi");

let l1 = new DMXRGBLight("l1");
l1.fadeRGB(20,30,40,5000).then(()=>{console.log("FADED");});



let h1 = new HueLight("desk",1);
h1.fadeRGB(5,3,2,20);
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


