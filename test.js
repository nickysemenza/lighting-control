var request = require('request');


/**
 * use the
 * QWE
 * ASD
 * ZXC
 * block of keys to control 0/120/255 brightness for RGB
 * R - example chained animations
 * @param sequence
 */
function evaluateKeyPress(sequence) {
    var globalTiming = 200;
    var globalWait = 300;

    switch(sequence)
    {
        case "q":
            request({
                url: 'http://localhost:8081/q',
                method: "PUT",
                json:     {
                    "actions": [
                        {
                            "light": "1",
                            "colors": {
                                "r": "255"
                            },
                            "timing": globalTiming
                        }
                    ],
                    "wait": globalWait
                }
            });
            break;
        case "w":
            request({
                url: 'http://localhost:8081/q',
                method: "PUT",
                json:     {
                    "actions": [
                        {
                            "light": "1",
                            "colors": {
                                "g": "255",
                            },
                            "timing": globalTiming
                        }
                    ],
                    "wait": globalWait
                }
            });
            break;
        case "e":
            request({
                url: 'http://localhost:8081/q',
                method: "PUT",
                json:     {
                    "actions": [
                        {
                            "light": "1",
                            "colors": {
                                "b": "255"
                            },
                            "timing": globalTiming
                        }
                    ],
                    "wait": globalWait
                }
            });
            break;
        case "a":
            request({
                url: 'http://localhost:8081/q',
                method: "PUT",
                json:     {
                    "actions": [
                        {
                            "light": "1",
                            "colors": {
                                "r": "120"
                            },
                            "timing": globalTiming
                        }
                    ],
                    "wait": globalWait
                }
            });
            break;
        case "s":
            request({
                url: 'http://localhost:8081/q',
                method: "PUT",
                json:     {
                    "actions": [
                        {
                            "light": "1",
                            "colors": {
                                "g": "120",
                            },
                            "timing": globalTiming
                        }
                    ],
                    "wait": globalWait
                }
            });
            break;
        case "d":
            request({
                url: 'http://localhost:8081/q',
                method: "PUT",
                json:     {
                    "actions": [
                        {
                            "light": "1",
                            "colors": {
                                "b": "120"
                            },
                            "timing": globalTiming
                        }
                    ],
                    "wait": globalWait
                }
            });
            break;
        case "z":
            request({
                url: 'http://localhost:8081/q',
                method: "PUT",
                json:     {
                    "actions": [
                        {
                            "light": "1",
                            "colors": {
                                "r": "0"
                            },
                            "timing": globalTiming
                        }
                    ],
                    "wait": globalWait
                }
            });
            break;
        case "x":
            request({
                url: 'http://localhost:8081/q',
                method: "PUT",
                json:     {
                    "actions": [
                        {
                            "light": "1",
                            "colors": {
                                "g": "0",
                            },
                            "timing": globalTiming
                        }
                    ],
                    "wait": globalWait
                }
            });
            break;
        case "c":
            request({
                url: 'http://localhost:8081/q',
                method: "PUT",
                json:     {
                    "actions": [
                        {
                            "light": "1",
                            "colors": {
                                "b": "0"
                            },
                            "timing": globalTiming
                        }
                    ],
                    "wait": globalWait
                }
            });
            break;
        case "r":
            request({
                url: 'http://localhost:8081/q',
                method: "PUT",
                json:     [{
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
                                    "r": "255",
                                    "g": "0",
                                    "b": "0"
                                },
                                "timing": "200"
                            },
                            {
                                "light": "2",
                                "colors": {
                                    "r": "0",
                                    "g": "0",
                                    "b": "255"
                                },
                                "timing": "200"
                            }
                        ],
                        "wait": "500"
                    },{
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
                                    "r": "255",
                                    "g": "0",
                                    "b": "0"
                                },
                                "timing": "200"
                            },
                            {
                                "light": "2",
                                "colors": {
                                    "r": "0",
                                    "g": "0",
                                    "b": "255"
                                },
                                "timing": "200"
                            }
                        ],
                        "wait": "500"
                    }]
            });
            break;
    }
}


var keypress = require('keypress');

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);


process.stdin.on('keypress', function (ch, key) {
    console.log('got "keypress"', key);
    evaluateKeyPress(key.sequence);
    if (key && key.ctrl && key.name == 'c') {
        process.stdin.pause();
    }
});

process.stdin.setRawMode(true);
process.stdin.resume();