// serve uses .env ; build uses .env.production (ou --mode qualif / pages)
// VUE_APP_PREFIX_PATH : préfixe pour déploiement sous-dossier (ex. GitHub Pages /sgpe-app/)
const publicPath = process.env.VUE_APP_PREFIX_PATH || '/'

if (process.env.NODE_ENV === 'production') {
  module.exports = {
    publicPath,
  }
}
