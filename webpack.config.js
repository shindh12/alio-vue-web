var path = require('path');
var webpack = require('webpack');
let htmlWebpackPlugin = require('html-webpack-plugin');

function resolve(dir) {
    return path.join(__dirname, '.', dir)
}

module.exports = {
    entry : {
        app: ['babel-polyfill', './src/main.js'],
    },
    output : {
        path : resolve('/dist'),
        /* publicPath : resolve('/dist'), */
        filename : 'build.js'
    },
    resolve : {
        extensions : [ '.js', '.vue', '.json' ],
        alias : {
            'vue$' : 'vue/dist/vue.esm.js',
            '@' : resolve('src/app'),
            '~' : resolve('src'),
            'styles' : resolve('src/app/style')
        }
    },
    module : {
        rules : [ {
            test : /\.css$/,
            use : [ 'vue-style-loader', 'css-loader' ]
        }, {
            test : /\.s[a|c]ss$/,
            loaders : [ 'style-loader', 'css-loader', 'sass-loader?outputStyle=compressed' ]
        }, {
            test : /\.vue$/,
            loader : 'vue-loader',
            query : {
                "presets": ["es2015"]
            }
        }, {
            test : /\.js$/,
            loader : 'babel-loader',
            include : [ resolve('src'), resolve('test'), resolve('/node_modules/vue-json-excel')],
            exclude : /node_modules/,
            query : {
                "presets": ["es2015"]
            }
        }, {
            test : /\.(png|jpg|gif|svg|ico)$/,
            loader : 'file-loader',
            options : {
                name : '[name].[ext]?[hash]'
            }
        } ]
    },
    plugins : [
        new htmlWebpackPlugin({
            template : resolve('/src/index.html'),
            inject : true,
            favicon: resolve('/src/favicon.ico')
    }) ],
    devServer : {
        historyApiFallback : true,
        noInfo : true,
        overlay : true
    },
    performance : {
        hints : false
    },
    devtool : '#eval-source-map'
}

if (process.env.NODE_ENV === 'production') {
    module.exports.devtool = '#source-map'
    module.exports.plugins = (module.exports.plugins || []).concat([ new webpack.DefinePlugin({
        'process.env' : {
            NODE_ENV : '"production"'
        }
    }), new webpack.LoaderOptionsPlugin({
        minimize : true
    }) ])
}
