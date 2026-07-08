import Vue from 'vue'
import App from './App.vue'
import router from './router'
import {
  ensureImpactTaxonomyLoaded,
  getNavigationStructure,
} from './services/csvDataService.js'
import { prewarmShellViewData } from './services/shellViewDataService.js'
import config_file from './services/tarteaucitron_config.js'
import analytics_config_file, { resolveTrackingDomain } from './services/dsfr_analytics_config.js'
import './css/website.css'

const trackingDomain = resolveTrackingDomain()
const analyticsEnabled =
  Boolean(trackingDomain) && !window.location.pathname.includes('chart-iframe')

if (!trackingDomain && !window.location.pathname.includes('chart-iframe')) {
  const appEnv = process.env.VUE_APP_ENV || 'dev'
  const prodHint =
    appEnv === 'prod'
      ? 'Set VUE_APP_TRACKING in the deploy workflow (GitHub Actions vars or .env.production).'
      : 'Add VUE_APP_TRACKING to .env or run with --mode qualif.'
  console.warn(`[DSFR analytics] VUE_APP_TRACKING not set (VUE_APP_ENV=${appEnv}). Eulerian disabled. ${prodHint}`)
}

// DSFR analytics config must exist before dsfr.module.js and analytics.module.js
if (analyticsEnabled) {
  window.dsfr = analytics_config_file
}

// DSFR core and legacy assets (dsfr.module includes core — do not load core.module separately)
require('../node_modules/@gouvfr/dsfr/dist/legacy/legacy.nomodule.min.js')
require('../node_modules/@gouvfr/dsfr/dist/dsfr.main.css')
require('../node_modules/@gouvfr/dsfr/dist/utility/utility.main.css')
require('../node_modules/@gouvfr/dsfr/dist/dsfr.css')
require('../node_modules/@gouvfr/dsfr/dist/utility/icons/icons-system/icons-system.min.css')
require('../node_modules/@gouvfr/dsfr/dist/utility/icons/icons.main.min.css')
require('remixicon/fonts/remixicon.css')
require('../node_modules/@gouvfr/dsfr/dist/dsfr.module.min.js')
require('../node_modules/@gouvfr/dsfr/dist/scheme/scheme.module.min.js')
if (analyticsEnabled) {
  require('../node_modules/@gouvfr/dsfr/dist/analytics/analytics.module.js')
}

Vue.config.productionTip = false

// Tarteaucitron configuration except for chart-iframe route
if (typeof Storage !== 'undefined' && !window.location.pathname.includes('chart-iframe')) {
  try {
    localStorage.setItem('tarteaucitron', 'available')
    require('../public/tarteaucitron/tarteaucitron.js')
    require('../public/tarteaucitron/tarteaucitron.services.js')
    require('../public/tarteaucitron/css/dsfr-theme-tac.css')
    window.tarteaucitronForceLanguage = 'fr'
    tarteaucitron.init(config_file)
    if (trackingDomain) {
      tarteaucitron.user.eulerianHost = trackingDomain
    }
  } catch (err) {
    console.warn('Cookies failed to be set; blocked by the browser')
  }
}

// Function to mount Vue app
function mountApp () {
  new Vue({
    router,
    render: h => h(App)
  }).$mount('#app')
}

const navEnvironment =
  typeof window !== 'undefined' && window.location.pathname.includes('/staging')
    ? 'staging'
    : 'production'

Promise.all([
  ensureImpactTaxonomyLoaded().catch((e) =>
    console.warn('Taxonomie axes (Liste_taxonomie) : chargement partiel', e)
  ),
  getNavigationStructure(navEnvironment).catch((e) =>
    console.warn('Structure de navigation : chargement partiel', e)
  ),
]).finally(() => {
  mountApp()
  prewarmShellViewData(navEnvironment).catch((e) =>
    console.warn('Préchauffage vues shell : échec partiel', e)
  )
})

