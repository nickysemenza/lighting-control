import {processQueue, lights} from './queueWorker';
import DMXRGBLight from './DMXRGBLight';
import HueLight from './HueLight';
import kue from 'kue';
setInterval(processQueue, 3);

let l1 = new DMXRGBLight("l1",1,8,1);
let l2 = new DMXRGBLight("l2",11,18,1);
let h1 = new HueLight("desk",1);

// l1.fadeRGB(255,0,0,1000).then(()=>{
//     console.log("FADED1");
//     l1.fadeRGB(255,255,255,5,2000).then(()=>{
//         console.log("FADED2");
//         l1.fadeRGB(0,0,0,500).then(()=>{
//             console.log("FADED3");
//             l1.fadeRGB(0,30,255,500).then(()=>{
//                 console.log("FADED4");
//             });
//         });
//     });
//
// });
setTimeout(()=>{
    h1.fadeRGB(0,0,250,1000).then(()=>{
        console.log("1s");
        h1.fadeRGB(255,0,0,2000)
            .then(()=>{console.log("fin")})
    });
    l1.fadeRGB(0,0,255,1000).then(()=>{
        console.log("FADED4");
        l1.fadeRGB(254,121,0,2000).then(()=>{
            console.log("FADED4");
        });
        l2.fadeRGB(255,19,120,500,1200).then(()=>{
            console.log("FADED4");
            l2.fadeRGB(0,38,86,10).then(()=>{
                console.log("FADED4");
            });
        });
    });
    setTimeout(()=>{
        // l1.fadeRGB(255,0,0,500).then(()=>{
        //     console.log("FADED4");
        // });
    },500)
},2000);

//


console.log(lights);

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


