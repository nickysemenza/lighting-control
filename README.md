# lighting-control
web-based lighting control for DMX fixtures using node, angular, express, and redis

![alt tag](https://raw.githubusercontent.com/nickysemenza/lighting-control/master/demo.gif "demo")

##How it works
* I have the [Open Lighting Architecture](https://www.openlighting.org/ola/) server installed on my raspberry pi, and I have a USB<->DMX adapter plugged into the pi, which is plugged into the chain of fixtures, i.e. `ethernet<->PI<->USBDMX->Light1->Light2`

* DMX channel values are stored/cached in redis, and daemon.js continually sends the values over to the OLA server's `/set_dmx` endpoint.

* The express server has an API for receiving **cues** in JSON format. (`PUT /q`) A cue can have one or more actions, which represent the change to a given light fixture's attributes, along with a `timing`, to describe how long the fade can take, in milliseconds (0 for instant). Each cue has a `wait`, the time to hold after completing a cue before evaulating the next cue. Cues are RPUSH-ed onto the redis cue
* `watchQueue()` continuously evaluates the cue queue, LPOP-ing each cue, can calling `processCue` as necessary
* `processCue` takes the JSON and calls setRGB appropriately as per  the light settings' channel mapping
  * ex: if the colors{} block of the fixture definition defines: `"r": 2, "g": 3, "b": 4`, then  `setRGB(200,132,5)` would need to be converted to channel 2@200, channel 3@132, etc...

###Example cues
This will set light #1's green channel to 255 (100%), and the fade will take 1/2 a second. It will wait 200ms before evaluating the next cue

```
{
  "actions": [
    {
      "light": "1",
      "colors": {
        "g": "255"
      },
      "timing": 500
    }
  ],
  "wait": 200
}
```
* * *

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

##TODO

- [ ] Philips Hue [maybe with this?](https://github.com/peter-murray/node-hue-api)
- [ ] Scheduling
- [ ] Amazon Dash Buttons
- [ ] Rework the web interface
- [ ] API tokens
- [ ] Make `updateDMX` be listening for redis changes
- [ ] ability to put a cue on the front of the queue
- [ ] Better dimmer support
- [ ] Better support for white channel