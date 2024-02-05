import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

const router = new Router({
  mode: "history",
  base: process.env.VUE_APP_PREFIX_PATH,
  routes: [
    {
      path: "/",
      name: "home",
      component: () =>
        import(/* webpackChunkName: "home" */ "./views/HomePage.vue"),
      meta: {
        requiresAuth: true,
      },
      redirect: '/accueil'
    },
    {
      path: "/accueil",
      name: "accueil",
      component: () =>
        import(/* webpackChunkName: "accueil" */ "./views/AccueilPage.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () =>
        import(/* webpackChunkName: "visits" */ "./views/DashboardPage.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/tags",
      name: "tags",
      component: () =>
        import(/* webpackChunkName: "tags" */ "./views/TagsPage.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/transport",
      name: "transport",
      component: () =>
        import(/* webpackChunkName: "transport" */ "./views/TransportPage.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    // {
    //   path: "/energie",
    //   name: "energie",
    //   component: () =>
    //     import(/* webpackChunkName: "visits" */ "./views/EnergiePage.vue"),
    //   meta: {
    //     requiresAuth: true,
    //   },
    // },
    // {
    //   path: "/batiments",
    //   name: "batiments",
    //   component: () =>
    //     import(/* webpackChunkName: "visits" */ "./views/BatimentsPage.vue"),
    //   meta: {
    //     requiresAuth: true,
    //   },
    // },
    // {
    //   path: "/industrie",
    //   name: "industrie",
    //   component: () =>
    //     import(/* webpackChunkName: "visits" */ "./views/IndustriePage.vue"),
    //   meta: {
    //     requiresAuth: true,
    //   },
    // },
    // {
    //   path: "/economie-circulaire",
    //   name: "economie-circulaire",
    //   component: () =>
    //     import(/* webpackChunkName: "visits" */ "./views/EconomiePage.vue"),
    //   meta: {
    //     requiresAuth: true,
    //   },
    // },
    // {
    //   path: "/eau",
    //   name: "eau",
    //   component: () =>
    //     import(/* webpackChunkName: "visits" */ "./views/EauPage.vue"),
    //   meta: {
    //     requiresAuth: true,
    //   },
    // },
    // {
    //   path: "/agriculture-alimentation",
    //   name: "agriculture-alimentation",
    //   component: () =>
    //     import(/* webpackChunkName: "visits" */ "./views/AgriPage.vue"),
    //   meta: {
    //     requiresAuth: true,
    //   },
    // },
    // {
    //   path: "/ecosystemes",
    //   name: "ecosystemes",
    //   component: () =>
    //     import(/* webpackChunkName: "visits" */ "./views/EcosystemessPage.vue"),
    //   meta: {
    //     requiresAuth: true,
    //   },
    // },
    {
      path: "/tags",
      name: "tags",
      component: () =>
        import(/* webpackChunkName: "visits" */ "./views/TagsPage.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/lexique",
      name: "lexique",
      component: () =>
        import(/* webpackChunkName: "visits" */ "./views/LexiquePage.vue"),
      meta: {
        requiresAuth: true,
      },
    },
  ],
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

export default router;
