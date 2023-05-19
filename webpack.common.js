/* eslint-disabled */
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const path = require('path')
const webpack = require('webpack')

// Common configuration, with extensions in webpack.dev.js and webpack.prod.js.
module.exports = {
    bail: true,
    context: __dirname,
    entry: {
        main: './assets/js/app.js',
        head_async: ['lazysizes'],
    },
    module: {
        rules: [
            {
                test: /\.(sass|css|scss)$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
            {
                test: require.resolve('jquery'),
                loader: 'expose-loader',
                options: {
                    exposes: ['$'],
                },
            },
        ],
    },
    output: {
        chunkFilename: 'theme-bundle.chunk.[name].js',
        filename: 'theme-bundle.[name].js',
        path: path.resolve(__dirname, 'assets/dist'),
    },
    performance: {
        hints: 'warning',
        maxAssetSize: 1024 * 300,
        maxEntrypointSize: 1024 * 300,
    },
    plugins: [
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: ['assets/dist'],
            verbose: false,
            watch: false,
        }),
        new webpack.ProvidePlugin({
            // Provide jquery automatically without explicit import
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
        }),
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
        }),
    ],
    resolve: {
        fallback: { url: require.resolve('url/') },
        alias: {
            jquery: path.resolve(__dirname, 'node_modules/jquery/dist/jquery.min.js'),
            jstree: path.resolve(__dirname, 'node_modules/jstree/dist/jstree.min.js'),
        },
    },
}
