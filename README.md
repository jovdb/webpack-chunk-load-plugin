# webpack-chunk-load-plugin

A webpack plugin to modify the code for loading async chunks:
- Wait for a netwerk connection before importing
- Do 2 retries with a delay of 500ms

No configuration possible

## How to use it:
```
npm install webpack-chunk-load-plugin --save-dev
```

Adjust your webpack.config.js script

```
const { ChunkLoadPlugin } = require("webpack-chunk-load-plugin");
```

Add it to the webpack plugins array:
```
  plugins: [
    new ChunkLoadPlugin(),
  ],
```
