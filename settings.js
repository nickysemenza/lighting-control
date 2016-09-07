module.exports = {
  "fixtures": {
    "1": {
      "id": 1,
      "name": "desk",
      "type": "rgbw",
      "protocol": "dmx",
      "universe": 2,
      "channels": 8,
      "start": 1,
      "end": 8,
      "has_dimmer": true,
      "dimmer": 1,
      "colors": {
        "r": 5,
        "g": 6,
        "b": 7,
        "w": 8
      }
    },
    "2": {
      "id": 2,
      "name": "bookcase",
      "type": "rgbw",
      "protocol": "dmx",
      "universe": 2,
      "channels": 8,
      "start": 11,
      "end": 18,
      "has_dimmer": true,
      "dimmer": 11,
      "colors": {
        "r": 15,
        "g": 16,
        "b": 17,
        "w": 18
      }
    },
    "3": {
      "id": 3,
      "name": "rgb - strip #1",
      "type": "strip",
      "protocol": "dmx",
      "universe": 3,
      "channels": 3,
      "start": 1,
      "end": 3,
      "has_dimmer": false,
      "colors": {
        "r": 1,
        "g": 2,
        "b": 3
      }
    },
    "11": {
      "id": 11,
      "name": "hue 1",
      "type": "color",
      "protocol": "hue",
      "hue_id": 1
    }
  },
  "ola_server": {
    "ip": "localhost",
    "port": 9090
  },
  "verbose": true
};
