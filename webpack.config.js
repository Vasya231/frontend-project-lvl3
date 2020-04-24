const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: `${__dirname}/src/index.js`,
  output: {
    path: `${__dirname}/dist`,
    filename: 'index_bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'RSS aggregator',
    }),
  ],
};
