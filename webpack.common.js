var path = require('path');

function resolve(dir) {
    return path.join(__dirname, '.', dir)
}

module.exports = {
    entry : {
        app: ['babel-polyfill', './src/main.js'],
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
    performance : {
        hints : false
    },

};

