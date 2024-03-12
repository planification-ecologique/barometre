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
      // component: () =>
      //   import(/* webpackChunkName: "home" */ "./views/HomePage.vue"),
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
      path: "/dashboard/:theme/:levier",
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
      path: "/dashboard/transverse/emissions--puits",
      name: "transverse",
      component: () =>
       import(/* webpackChunkName: "visits" */ "./views/DashboardPage.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/mentions-legales",
      name: "mentions-legales",
      component: () =>
        import(/* webpackChunkName: "tags" */ "./views/MentionsLegalesPage.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/donnees-personnelles",
      name: "donnees-personnelles",
      component: () =>
        import(/* webpackChunkName: "tags" */ "./views/PersonalDataPage.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/plan-du-site",
      name: "plan-du-site",
      component: () =>
        import(/* webpackChunkName: "tags" */ "./views/PlanDuSitePage.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/gestion-des-cookies",
      name: "gestion-des-cookies",
      component: () =>
        import(/* webpackChunkName: "tags" */ "./views/CookiesPage.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/error-404",
      name: "error 404",
      component: () =>
        import(/* webpackChunkName: "tags" */ "./views/Error404Page.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/error-500",
      name: "error 500",
      component: () =>
        import(/* webpackChunkName: "tags" */ "./views/Error500Page.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/error-403",
      name: "error 403",
      component: () =>
        import(/* webpackChunkName: "tags" */ "./views/Error403Page.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/error-400",
      name: "error 400",
      component: () =>
        import(/* webpackChunkName: "tags" */ "./views/Error400Page.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "*",
      name: "error404",
      component: () =>
        import(/* webpackChunkName: "error404" */ "./views/Error404Page.vue"),
      meta: {
        requiresAuth: true, // ou false selon vos besoins
      },
    },
    
    
    
    
    // {
    //   path: "/lexique",
    //   name: "lexique",
    //   component: () =>
    //     import(/* webpackChunkName: "visits" */ "./views/LexiquePage.vue"),
    //   meta: {
    //     requiresAuth: true,
    //   },
    // },
    // {
    //   path: "/mentions-legales",
    //   name: "mentions légales",
    //   component: () =>
    //     import(/* webpackChunkName: "visits" */ "./views/MentionsLegalesPage.vue"),
    //   meta: {
    //     requiresAuth: true,
    //   },
    // },
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
      localStorage.setItem("vue-token", JSON.stringify(router.app.$keycloak.token));
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
