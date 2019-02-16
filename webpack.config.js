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
            { test: /\.ts$/, use: 'ts-loader' }
        ]
    },
    output: {
        path: path.resolve(context, 'dist'),
        filename: 'mutation-test-elements.js'
    }
};