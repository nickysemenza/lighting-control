module.exports = {
  "fixtures": [
    {
      "id": 1,
      "name": "desk",
      "type": "rgbw",
      "universe": 2,
      "channels": 8,
      "start": 1,
      "end": 8,
      "modes":["manual","rgbcycle","rgbjump","strobe"],
      "mode": "rgbcycle",
      "params": {
        "dimmer": 255,
        "step": 20,
        "cycle_period": 300,
        "colors": {
            "r": "0",
            "g": "0",
            "b": "0",
            "w": "0",
        }
      },
      "has_dimmer": true,
      "dimmer": 1,
      "colors": {
        "r": 5,
        "g": 6,
        "b": 7,
        "w": 8
      }
    },
    {
      "id": 2,
      "name": "bookcase",
      "type": "rgbw",
      "universe": 2,
      "channels": 8,
      "start": 11,
      "end": 18,
      "modes":["manual","rgbcycle","rgbjump","strobe"],
      "mode": "rgbcycle",
      "params": {
        "dimmer": 255,
        "step": 20,
        "cycle_period": 300,
        "colors": {
            "r": "0",
            "g": "0",
            "b": "0",
            "w": "0"
        }
      },
      "has_dimmer": true,
      "dimmer": 11,
      "colors": {
        "r": 15,
        "g": 16,
        "b": 17,
        "w": 18
      }
    },
    {
      "id": 4,
      "name": "rgb - strip #1",
      "type": "strip",
      "universe": 3,
      "channels": 3,
      "start": 40,
      "end": 42,
      "modes":["manual","rgbcycle"],
      "mode": "manual",
      "params": {
        "dimmer": 255,
        "step": 20,
        "cycle_period": 300,
        "colors": {
            "r": "0",
            "g": "0",
            "b": "0"
        }
      },
      "has_dimmer": false,
      "colors": {
        "r": 1,
        "g": 2,
        "b": 3,
      }
    },
    {
      "id": 5,
      "name": "rgb - strip #2",
      "type": "strip",
      "universe": 3,
      "channels": 3,
      "start": 40,
      "end": 42,
      "modes":["manual","rgbcycle"],
      "mode": "manual",
      "params": {
        "dimmer": 255,
        "step": 20,
        "cycle_period": 300,
        "colors": {
            "r": "0",
            "g": "0",
            "b": "0"
        }
      },
      "has_dimmer": false,
      "colors": {
        "r": 4,
        "g": 5,
        "b": 6,
      }
    }
  ],
  "ola_server": 
  {
    "ip": "10.0.1.91",
    "port": 9090
  }
};
