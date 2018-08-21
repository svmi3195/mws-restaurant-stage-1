const path = require('path')

module.exports = {
  mode: 'development',
  entry: './app/js/main.js',
  output: {
    filename: 'js/bundle.js',
    path: path.resolve(__dirname, 'app')
  },
  devServer: {
    contentBase: './app',
    port: 8080
  }
}
