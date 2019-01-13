module.exports = {
  entry: './source/app.jsx',
  output: {
    path: __dirname + '/public/js/',
    filename: 'bundle.js'
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader'
      },
      {
        test:/\.(s*)css$/,
        exclude: /(node_modules)/,
        use:['style-loader','css-loader', 'sass-loader']
      }
    ]
  }
}
