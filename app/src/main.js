import Vue from 'vue'
import App from './App.vue'
import VueKeyCloak from '@dsb-norge/vue-keycloak-js'
import router from './router'

// Add component otherwise you get an error object string
import Header from './components/Header'
import Footer from './components/Footer'
import Navigation from './components/Navigation'
import Tags from './components/Tags'
import GraphBox from './components/GraphBox'
// import Breadcrumb from './components/Breadcrumb.vue'

import CardImgBox from './components/CardImgBox'
import UpFooter from './components/UpFooter'
import AdaptiveDashboard from './components/AdaptiveDashboard'
import SideNavigation from './components/SideNavigation'



import vueCustomElement from 'vue-custom-element'


// if (process.env.NODE_ENV === 'development') {
require('../node_modules/@gouvfr/dsfr/dist/legacy/legacy.nomodule.min.js')
require('../node_modules/@gouvfr/dsfr/dist/core/core.module.min.js')
require('../node_modules/@gouvfr/dsfr/dist/core/core.nomodule.min.js')
require('../node_modules/@gouvfr/dsfr/dist/scheme/scheme.module.min.js')

require('../node_modules/@gouvfr/dsfr/dist/dsfr.main.css')
require('../node_modules/@gouvfr/dsfr/dist/utility/utility.main.css')
require('../node_modules/@gouvfr/dsfr/dist/dsfr.css')
require('../node_modules/@gouvfr/dsfr/dist/utility/icons/icons-system/icons-system.min.css')
require('../node_modules/@gouvfr/dsfr/dist/dsfr.module.min.js')

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

Vue.use(vueCustomElement)

Vue.customElement('header-dsfr', Header)
Vue.customElement('footer-dsfr', Footer)
Vue.customElement('navigation-dsfr', Navigation)
Vue.customElement('card-img-box', CardImgBox)
Vue.customElement('up-footer', UpFooter)
Vue.customElement('tags-dsfr', Tags)
Vue.customElement('graph-box', GraphBox)
Vue.customElement('adaptive-dashboard', AdaptiveDashboard)
Vue.customElement('side-navigation', SideNavigation)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')