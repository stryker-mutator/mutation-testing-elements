const path = require('path');
const context = __dirname;
module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  context,
  devtool: 'inline-source-map',
  devServer: {
    contentBase: ['./testResources', './node_modules/bootstrap', '.']
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      { test: /\.ts$/, use: 'ts-loader' },
      {
        test: /\.scss$/,
        use: [
          // "style-loader", // creates style nodes from JS strings
          "css-loader", // translates CSS into CommonJS
          "sass-loader" // compiles Sass to CSS, using Node Sass by default
        ]
      }
    ]
  },
  output: {
    path: path.resolve(context, 'dist'),
    filename: 'mutation-test-elements.js'
  }
};