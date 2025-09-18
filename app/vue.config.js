// Path must be ./ to deploy in dns inside to subfolder 
// serve uses .env and build uses .env.production
if (process.env.NODE_ENV === 'production'){
  const webpack = require('webpack')
  module.exports = {
    publicPath: '/',
  }
}
