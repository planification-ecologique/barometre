import Vue from 'vue'
import App from './App.vue'
import VueKeyCloak from '@dsb-norge/vue-keycloak-js'
import router from './router'

// Add component otherwise you get an error object string


// if (process.env.NODE_ENV === 'development') {
require('../node_modules/@gouvfr/dsfr/dist/legacy/legacy.nomodule.min.js')
require('../node_modules/@gouvfr/dsfr/dist/core/core.module.min.js')
require('../node_modules/@gouvfr/dsfr/dist/dsfr.main.css')
require('../node_modules/@gouvfr/dsfr/dist/utility/utility.main.css')
require('../node_modules/@gouvfr/dsfr/dist/dsfr.css')
require('../node_modules/@gouvfr/dsfr/dist/utility/icons/icons-system/icons-system.min.css')

//Tarteaucitron 
require('./tarteaucitron/tarteaucitron.js')
require('./tarteaucitron/tarteaucitron.services.js')
require('./tarteaucitron/css/dsfr-theme-tac.css')
import config_file from './services/tarteaucitron_config.js'
tarteaucitronForceLanguage = 'fr';
tarteaucitron.init(config_file);
tarteaucitron.user.eulerianHost = process.env.VUE_APP_TRACKING; //'lskh.barometre-sgpe-qualif.seenovate.com';


//DSFR Analytics
import analytics_config_file from './services/dsfr_analytics_config.js'
window.dsfr = analytics_config_file
require('../node_modules/@gouvfr/dsfr/dist/dsfr.module.min.js')
require('../node_modules/@gouvfr/dsfr/dist/scheme/scheme.module.min.js')
require('../node_modules/@gouvfr/dsfr/dist/analytics/analytics.module.js')

Vue.config.productionTip = false

Vue.use(VueKeyCloak, {
  config: {
    realm: process.env.VUE_APP_KEYCLOAK_REALM,
    url: process.env.VUE_APP_KEYCLOAK_URL,
    clientId: process.env.VUE_APP_KEYCLOAK_CLIENT
  },
  init: {
    // Use 'login-required' to always require authentication
    // If using 'login-required', there is no need for the router guards in router.js
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: window.location.origin + process.env.VUE_APP_PREFIX_PATH + '/silent-check-sso.html'
  }
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')