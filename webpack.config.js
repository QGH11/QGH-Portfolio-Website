const webpack = require("webpack");
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
    entry: './clientV2/js/app.js',
    output: {
        path: __dirname + '/dist',
        filename: 'bundle.js'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            }
        },
        {
            test: /\.css$/,
            use:
            [
                MiniCSSExtractPlugin.loader,
                'css-loader'
            ]
        }]
    },
    plugins: [
        new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        "window.jQuery": "jquery"
        }),

        new MiniCSSExtractPlugin()
    ]
}