'use strict';

const path = require('path');
const webpack = require('webpack');
const HappyPack = require('happypack');
const baseConfig = require('./base');
const defaultSettings = require('./defaults');
const getEntry = require('./entry');
const generateHtmls = require('./html');

// Add needed plugins here
const BowerWebpackPlugin = require('bower-webpack-plugin');

// 获取多页面的所有入口，每个入口文件名都为 index.js
let entries = getEntry('./src/pages/*/index.js');

let config = Object.assign({}, baseConfig, {
  entry: entries,
  cache: true,
  devtool: 'source-map',
  plugins: [
    new HappyPack({
      id: 'jsx',
      threads: 4,
      loaders: ['react-hot', 'babel?' + JSON.stringify({
        presets: ['es2015', 'stage-0', 'react']
      })]
    }),
    new webpack.DllReferencePlugin({
      context: path.join(__dirname, '../'),
      /**
       * 在这里引入 manifest 文件
       */
      manifest: require('../build/vendor-manifest.json')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.ProvidePlugin({
      $: 'jquery', // 使jquery变成全局变量,不用在自己文件require('jquery')了
      jQuery: 'jquery',
      React: 'react',
      ReactDOM: 'react-dom'
    }),
    // 类库统一打包生成一个文件
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.js',
      minChunks: 3 // 提取使用3次以上的模块，打包到vendor里
    }),
    //new webpack.NoErrorsPlugin(),
    new BowerWebpackPlugin({
      searchResolveModulesDirectories: false
    })
  ],
  module: defaultSettings.getDefaultModules()
});

// Add needed loaders to the defaults here
config.module.loaders.push(
  {
    test: /\.(js|jsx)$/,
    //loader: 'react-hot!babel-loader',
    loaders: ['happypack/loader?id=jsx'],
    include: [].concat(
      config.additionalPaths,
      [ path.join(__dirname, '/../src') ]
    )
  },{
    test: /\.css$/,
    loader: 'style!css'
  },{
    test: /\.less/,
    loader: 'style!css!less'
  }
);

// 生成html
config = generateHtmls(config);

module.exports = config;
