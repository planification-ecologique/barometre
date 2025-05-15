import Vue from 'vue'
import App from './App.vue'
import router from './router'
import config_file from './services/tarteaucitron_config.js'
import analytics_config_file from './services/dsfr_analytics_config.js'
import './css/website.css'

// DSFR core and legacy assets
require('../node_modules/@gouvfr/dsfr/dist/legacy/legacy.nomodule.min.js')
require('../node_modules/@gouvfr/dsfr/dist/core/core.module.min.js')
require('../node_modules/@gouvfr/dsfr/dist/dsfr.main.css')
require('../node_modules/@gouvfr/dsfr/dist/utility/utility.main.css')
require('../node_modules/@gouvfr/dsfr/dist/dsfr.css')
require('../node_modules/@gouvfr/dsfr/dist/utility/icons/icons-system/icons-system.min.css')
require('../node_modules/@gouvfr/dsfr/dist/dsfr.module.min.js')
require('../node_modules/@gouvfr/dsfr/dist/scheme/scheme.module.min.js')
require('../node_modules/@gouvfr/dsfr/dist/analytics/analytics.module.js')

Vue.config.productionTip = false

// Tarteaucitron configuration
if (typeof Storage !== 'undefined') {
  try {
    localStorage.setItem('tarteaucitron', 'available')
    require('../public/tarteaucitron/tarteaucitron.js')
    require('../public/tarteaucitron/tarteaucitron.services.js')
    require('../public/tarteaucitron/css/dsfr-theme-tac.css')
    tarteaucitronForceLanguage = 'fr'
    tarteaucitron.init(config_file)
    tarteaucitron.user.eulerianHost = process.env.VUE_APP_TRACKING
    window.dsfr = analytics_config_file
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

mountApp()

