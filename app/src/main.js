import Vue from 'vue'
import App from './App.vue'
import VueKeyCloak from '@dsb-norge/vue-keycloak-js'
import router from './router'
import config_file from './services/tarteaucitron_config.js'
import analytics_config_file from './services/dsfr_analytics_config.js'
import './css/website.css'

// DSFR requirements
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

// Tarteaucitron config
if (typeof Storage !== "undefined") {
  try {
    localStorage.setItem("tarteaucitron", "available");
    require('../public/tarteaucitron/tarteaucitron.js')
    require('../public/tarteaucitron/tarteaucitron.services.js')
    require('../public/tarteaucitron/css/dsfr-theme-tac.css')
    tarteaucitronForceLanguage = 'fr';
    tarteaucitron.init(config_file);
    tarteaucitron.user.eulerianHost = process.env.VUE_APP_TRACKING;
    window.dsfr = analytics_config_file;
  } catch (err) {
    console.warn("Cookies failed to be set; Blocked!");
  }
}

// Delayed mount only after Keycloak is ready
if (process.env.VUE_APP_KEYCLOAK_AVAILABLE === 'true') {
  Vue.use(VueKeyCloak, {
    config: {
      realm: process.env.VUE_APP_KEYCLOAK_REALM,
      url: process.env.VUE_APP_KEYCLOAK_URL,
      clientId: process.env.VUE_APP_KEYCLOAK_CLIENT
    },
    init: {
      onLoad: 'check-sso',
      useNonce: false,
      silentCheckSsoRedirectUri: window.location.origin + process.env.VUE_APP_PREFIX_PATH + '/silent-check-sso.html'
    },
    onReady: (keycloak) => {
      if (!keycloak.authenticated) {
        keycloak.login();
      } else {
        new Vue({
          router,
          render: h => h(App)
        }).$mount('#app');
      }
    }
  });
} else {
  // Mount app without Keycloak
  new Vue({
    router,
    render: h => h(App)
  }).$mount('#app');
}
