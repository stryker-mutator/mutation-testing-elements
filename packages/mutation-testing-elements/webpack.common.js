const path = require('path');
const context = __dirname;
module.exports = {
  entry: './src/index.ts',
  context,
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      // webpack ts-loader does not support project references yet :( => https://github.com/TypeStrong/ts-loader/issues/851
      // Workaround pitched here: https://github.com/TypeStrong/ts-loader/issues/909
      {
        test: /\.ts$/,
        include: path.resolve(__dirname, 'src'),
        loader: 'ts-loader',
        options: {
          configFile: 'src/tsconfig.json',
          instance: 'src'
        }
      },
      {
        test: /\.ts$/,
        include: path.resolve(__dirname, 'test'),
        loader: 'ts-loader',
        options: {
          configFile: 'test/tsconfig.json',
          instance: 'test'
        }
      },
      {
        test: /\.scss$/,
        use: [
          "css-loader", // translates CSS into CommonJS
          "postcss-loader",
          {
            loader: "sass-loader",
            options: {
              implementation: require('sass')
            }
          }
        ]
      }
    ]
  },
  output: {
    path: path.resolve(context, 'dist'),
    filename: 'mutation-test-elements.js'
  }
};
