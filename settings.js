module.exports = {
  "fixtures": [
    {
      "name": "rgbw - par",
      "type": "rgbw",
      "channels": 7,
      "start": 1,
      "end": 7,
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
      "name": "rgb - strip",
      "type": "rgb",
      "channels": 3,
      "start": 10,
      "end": 12,
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
    "ip": "128.211.242.211",
    "port": 9090,
    "universe": 2
  }
};
