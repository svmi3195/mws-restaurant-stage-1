const path = require('path')

module.exports = {
  mode: 'development',
  entry: './app/service_worker.js',
  output: {
    filename: 'bundled_sw.js',
    path: path.resolve(__dirname, 'app')
  },
  devServer: {
    contentBase: './app'
  }
}
