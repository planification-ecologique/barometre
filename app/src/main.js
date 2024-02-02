import Vue from 'vue'
import App from './App.vue'
import VueKeyCloak from '@dsb-norge/vue-keycloak-js'
import router from './router'

// Add component otherwise you get an error object string
import SideBar from './components/SideBar'
import ChartVisits from './components/ChartVisits'
import Header from './components/Header'
import Footer from './components/Footer'
import Navigation from './components/Navigation'
import Tags from './components/Tags'
import GraphBox from './components/GraphBox'
// import Breadcrumb from './components/Breadcrumb.vue'

// import Sites from './views/Sites'
import CardImgBox from './components/CardImgBox'
import UpFooter from './components/UpFooter'



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

// Vue.use(VueKeyCloak, {
//   config: {
//     realm: 'DEV',
//     url: process.env.VUE_APP_KEYCLOAK_URL,
//     clientId: 'statsAtGouv'
//   },
//   init: {
//     // Use 'login-required' to always require authentication
//     // If using 'login-required', there is no need for the router guards in router.js
//     onLoad: 'check-sso',
//     silentCheckSsoRedirectUri: window.location.origin + process.env.VUE_APP_PREFIX_PATH + '/silent-check-sso.html'
//   }
// })

Vue.use(vueCustomElement)

Vue.customElement('header-dsfr', Header)
Vue.customElement('footer-dsfr', Footer)
Vue.customElement('navigation-dsfr', Navigation)
Vue.customElement('card-img-box', CardImgBox)
Vue.customElement('up-footer', UpFooter)
Vue.customElement('tags-dsfr', Tags)
Vue.customElement('graph-box', GraphBox)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')