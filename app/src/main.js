import Vue from 'vue'
import App from './App.vue'
import VueKeyCloak from '@dsb-norge/vue-keycloak-js'
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

// Initialize Keycloak if enabled
if (process.env.VUE_APP_KEYCLOAK_AVAILABLE === 'true') {
  Vue.use(VueKeyCloak, {
    config: {
      realm: process.env.VUE_APP_KEYCLOAK_REALM,
      url: process.env.VUE_APP_KEYCLOAK_URL,
      clientId: process.env.VUE_APP_KEYCLOAK_CLIENT
    },
    init: {
      onLoad: 'check-sso',      // or 'login-required'
      useNonce: false,
      silentCheckSsoRedirectUri: window.location.origin + process.env.VUE_APP_PREFIX_PATH + '/silent-check-sso.html'
    },
    onReady: keycloak => {
      // Store initial token
      localStorage.setItem('vue-token', JSON.stringify(keycloak.token))

      // Optionally refresh token periodically
      setInterval(() => {
        keycloak.updateToken(60).then(refreshed => {
          if (refreshed) {
            localStorage.setItem('vue-token', JSON.stringify(keycloak.token))
          }
        }).catch(() => {
          console.warn('Failed to refresh token')
        })
      }, 60000)

      // Redirect to login if not yet authenticated
      if (!keycloak.authenticated) {
        keycloak.login()
      } else {
        mountApp()
      }
    }
  })
} else {
  // No Keycloak: just mount
  mountApp()
}
