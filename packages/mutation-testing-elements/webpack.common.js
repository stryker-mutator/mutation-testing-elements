const path = require('path');
// const TerserPlugin = require('terser-webpack-plugin');
const context = __dirname;
module.exports = {
  entry: './src/index.ts',
  context,
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          configFile: process.env.STRYKER ? 'tsconfig.stryker.json' : 'tsconfig.json'
        }
      },
      {
        test: /\.scss$/,
        use: [
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
