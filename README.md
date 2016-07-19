# lighting-control
web-based lighting control for DMX fixtures using node, angular, express, and redis


![alt tag](https://raw.githubusercontent.com/nickysemenza/lighting-control/master/demo.gif "demo")

##How it works
* I have the [Open Lighting Architecture](https://www.openlighting.org/ola/) server installed on my raspberry pi, and I have a USB<->DMX adapter plugged into the pi, which is plugged into the chain of fixtures, i.e. `ethernet<->PI<->USBDMX->Light1->Light2`

* DMX channel values are stored/cached in redis, and daemon.js continually sends the values over to the OLA server's `/set_dmx` endpoint.

* The express server has an API for receiving **cues** in JSON format. A cue can have one or more actions, which represent the change to a given light fixture's attributes, along with a `timing`, to describe how long the fade can take, in milliseconds (0 for instant). Each cue has a `wait`, the time to hold after completing a cue before evaulating the next cue.

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
This will fade light 1's green channel to be 100%, leaving the red and blue channels as they are, over the course of 250ms. Light 2 will then take 800ms to fade to an orange color, and then there will be 1 second of idle time.

```
[
  {
    "actions": [
      {
        "light": "1",
        "colors": {
          "g": "255"
        },
        "timing": "250"
      },
      {
        "light": "2",
        "colors": {
          "r": "255",
          "g": "120",
          "b": "0"
        },
        "timing": "800"
      }
    ],
    "wait": "1000"
  }
]
```
* * *
This will fade light 1 to blue, and light 2 to red, over 200ms. After 500ms, both lights will jump to green.

```
[
  {
    "actions": [
      {
        "light": "1",
        "colors": {
          "r": "0",
          "g": "255",
          "b": "0"
        },
        "timing": "200"
      },
      {
        "light": "2",
        "colors": {
          "r": "255",
          "g": "0",
          "b": "0"
        },
        "timing": "200"
      }
    ],
    "wait": "500"
  },
  {
    "actions": [
      {
        "light": "1",
        "colors": {
          "r": "0",
          "g": "255",
          "b": "0"
        },
        "timing": "0"
      },
      {
        "light": "2",
        "colors": {
          "r": "0",
          "g": "255",
          "b": "0"
        },
        "timing": "0"
      }
    ],
    "wait": "500"
  }
]
```
* * *



* The web interface displays a colorpicker for all the rgb fixtures defined in settings.js, and maps the RGB value selected to the appropriate channel number + value (0-255). This information is then sent over to redis and the light updates with no noticeable delay.

  * ex: if the colors{} block of the fixture definition defines: `"r": 2, "g": 3, "b": 4`, then  `setRGB(200,132,5)` would need to be converted to channel 2@200, channel 3@132, etc...


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
- [ ] Rework the web interface
- [ ] API tokens
- [ ] Make `updateDMX` be listening for redis changes