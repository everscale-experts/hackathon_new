const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  resolve: {
    fallback: {
      buffer: require.resolve("buffer"),
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      //events: require.resolve("events/"),
    //  path: require.resolve("path-browserify"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      os: require.resolve("os-browserify/browser"),
      url: require.resolve("url")
    }
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './node_modules/@tonclient/lib-web/tonclient.wasm',
       //from: './node_modules/@tonclient/appkit'
     }
      ],
    }),
    new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
  ],

};
