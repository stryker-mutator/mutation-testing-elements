const path = require('path');
// const TerserPlugin = require('terser-webpack-plugin');
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

//   if (argv.mode === 'production') {
//     console.log('Detected "production" mode');
//     config.devtool = undefined;
//     config.optimization = {
//       minimizer: [
//         new TerserPlugin({
//           test: /\.js(\?.*)?$/i,
//         }),
//       ],
//     };
//   }
//   return config;
// };