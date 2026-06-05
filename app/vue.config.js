// serve uses .env ; build uses .env.production (ou --mode qualif / pages)
// VUE_APP_PREFIX_PATH : préfixe pour déploiement sous-dossier (ex. GitHub Pages /sgpe-app/)
const publicPath = process.env.VUE_APP_PREFIX_PATH || '/'

const devServerProxy = {
  '/api/feedback': {
    target: 'https://europe-west1-barometre-sgpe.cloudfunctions.net',
    changeOrigin: true,
    secure: true,
    pathRewrite: { '^/api/feedback': '/submitFeedback' },
  },
}

if (process.env.NODE_ENV === 'production') {
  module.exports = {
    publicPath,
  }
} else {
  module.exports = {
    publicPath,
    devServer: {
      proxy: devServerProxy,
    },
  }
}
