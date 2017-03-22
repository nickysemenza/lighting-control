#More Examples

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