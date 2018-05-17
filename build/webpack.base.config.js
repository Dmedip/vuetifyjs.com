require('dotenv').config()

const path = require('path')
const webpack = require('webpack')
const vueConfig = require('./vue-loader.config')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

const isProd = process.env.NODE_ENV === 'production'
const resolve = (file) => path.resolve(__dirname, file)

let plugins = [
  new webpack.DefinePlugin({
    'process.env': JSON.stringify(process.env)
  })
]

module.exports = {
  devtool: isProd
    ? false
    : 'eval-source-map',
  output: {
    path: resolve('../public'),
    publicPath: '/public/',
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js'
  },
  resolve: {
    extensions: ['*', '.js', '.json', '.vue'],
    alias: {
      '@': path.resolve(__dirname, '../'),
      // Make sure *our* version of vue is always loaded. This is needed for `yarn link vuetify` to work
      'vue$': path.resolve(__dirname, '../node_modules/vue/dist/vue.common.js')
    },
    symlinks: false
  },
  module: {
    noParse: /es6-promise\.js$/, // avoid webpack shimming process
    rules: [
      {
        test: /\.js$/,
        loader: 'source-map-loader',
        include: path.resolve(__dirname, '../node_modules/vuetify'),
        enforce: 'pre'
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          loader: 'css-loader',
          options: {
            minimize: isProd
          }
        })
      },
      {
        test: /\.styl$/,
        loader: ['style-loader', `css-loader?minimize=${isProd}`, 'stylus-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)(\?.*)?$/,
        loader: 'url-loader',
        query: {
          limit: 10000,
          name: 'img/[name].[hash:7].[ext]'
        }
      }
    ]
  },
  performance: {
    maxEntrypointSize: 300000,
    hints: isProd ? 'warning' : false
  },
  plugins
}

plugins.push(
  new ExtractTextPlugin({
    filename: 'common.[chunkhash].css'
  }),
  new FriendlyErrorsPlugin()
)

isProd && plugins.push(
  new webpack.optimize.UglifyJsPlugin({
    compress: { warnings: false }
  })
)
