module.exports = {
  "fixtures": [
    {
      "id": 1,
      "name": "rgbw - par",
      "type": "rgbw",
      "channels": 7,
      "start": 1,
      "end": 7,
      "modes":["manual","rgbcycle","rgbjump"],
      "mode": "rgbcycle",
      "params": {
        "fade_step": 20,
        "cycle_period": 300,
      },
      "has_dimmer": true,
      "dimmer": 1,
      "colors": {
        "r": 2,
        "g": 3,
        "b": 4,
        "w": 5
      }
    },
    {
      "id": 2,
      "name": "rgb - strip",
      "type": "rgb",
      "channels": 3,
      "start": 10,
      "end": 12,
      "modes":["manual","rgbcycle"],
      "mode": "manual",
      "params": {
        "fade_step": 20,
        "cycle_period": 300,
      },
      "has_dimmer": false,
      "colors": {
        "r": 10,
        "g": 11,
        "b": 12,
      }
    }
  ],
  "ola_server": 
  {
    "ip": "localhost",
    "port": 9090,
    "universe": 2
  }
};
