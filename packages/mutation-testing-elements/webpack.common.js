const path = require('path');
const context = __dirname;
module.exports = {
  entry: './src/index.ts',
  context,
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          projectReferences: true,
        },
      },
      {
        test: /\.scss$/,
        use: ['css-loader', 'postcss-loader', 'sass-loader'],
      },
    ],
  },
  output: {
    path: path.resolve(context, 'dist'),
    filename: 'mutation-test-elements.js',
  },
};
