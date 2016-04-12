# lighting-control
web-based lighting control for DMX fixtures using node, angular, express, and redis


![alt tag](https://raw.githubusercontent.com/nickysemenza/lighting-control/master/demo.gif "demo")

##How it works
* I have the [Open Lighting Architecture](https://www.openlighting.org/ola/) server installed on my raspberry pi, and I have a USB<->DMX adapter plugged into the pi, which is plugged into my lights

* DMX channel values are stored/cached in redis, and daemon.js continually sends the values over to the OLA server's `/set_dmx` endpoint.

* The web interface displays a colorpicker for all the rgb fixtures defined in settings.js, and maps the RGB value selected to the appropriate channel number 

  * ex: if the colors{} block of the fixture definition defines: `"r": 2, "g": 3, "b": 4`, then  `rgb(200,132,5)` would need to be converted to channel 2@200, channel 3@132, etc...


## Installation
1. clone this
2. `npm install`
3. `bower install`
4. Install redis and launch it
5. Install the [Open Lighting Architecture](https://www.openlighting.org/ola/getting-started/)
6. modify `settings.js` to specify your fixtures, as well as the OLA server Port + IP
7. Start up the listener: `node daemon.js` 
5. Start up the API server: `node server.js`
6. View in browser at http://localhost:8080
