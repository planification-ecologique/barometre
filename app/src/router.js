import Vue from 'vue'
import Router from 'vue-router'


Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.VUE_APP_PREFIX_PATH,
  routes: [
    {      
      path: '/sites',
      name: 'sites',
      component: () => import(/* webpackChunkName: "sites" */ './views/Sites.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/visites',
      name: 'visits',
      component: () => import(/* webpackChunkName: "visits" */ './views/Visits.vue'),
      meta: {
         requiresAuth: true
      },
    },
    {
      path: '/',
      name: 'home',
      component: () => import(/* webpackChunkName: "visits" */ './views/Visits.vue'),
      meta: {
         requiresAuth: true
      },
    }
  ]
})

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

router.beforeEach(async (to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // We wait for Keycloak init, then we can call all methods safely
    while (router.app.$keycloak.createLoginUrl === null) {      
      await sleep(100)
    }
    if (router.app.$keycloak.authenticated) {
      next()
    } else {
      const loginUrl = router.app.$keycloak.createLoginUrl()
      console.log('loginUrl ' + loginUrl)  
      window.location.replace(loginUrl)
    }
  } else {
    next()
  }
})

export default router
