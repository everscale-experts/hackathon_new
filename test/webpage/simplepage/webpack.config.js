const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './node_modules/@tonclient/lib-web/tonclient.wasm',
       //from: './node_modules/@tonclient/appkit'
     }
      ],
    }),
  ],

};
