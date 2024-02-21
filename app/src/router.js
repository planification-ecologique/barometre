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
      path: "/lexique",
      name: "lexique",
      component: () =>
        import(/* webpackChunkName: "visits" */ "./views/LexiquePage.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/mentions-legales",
      name: "mentions légales",
      component: () =>
        import(/* webpackChunkName: "visits" */ "./views/MentionsLegalesPage.vue"),
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
