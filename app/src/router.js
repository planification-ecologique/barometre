import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

var authenticated_required = false;
process.env.VUE_APP_KEYCLOAK_AVAILABLE === "true" ? (authenticated_required = true) : (authenticated_required = false);

const GeneralTitle = "Baromètre de la planification écologique"

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
        requiresAuth: authenticated_required,
        title: GeneralTitle + " - Accueil"

      },
      redirect: '/accueil'
    },
    
    {
      path: "/accueil",
      name: "accueil",
      component: () =>
        import(/* webpackChunkName: "accueil" */ "./views/AccueilPage.vue"),
      meta: {
        requiresAuth: authenticated_required,
        title:  GeneralTitle + " - Accueil"
      }
    },
    {
      path: "/dashboard",
      name: "dashboard",
      props: route => ({query: route.query.theme}, {query: route.query.levier}),
      component: () =>
        import(/* webpackChunkName: "dashboard" */ "./views/DashboardPage.vue"),
      meta: {
        requiresAuth: authenticated_required,
        title:  GeneralTitle + " - Tableaux de bord"

      }
    },
    {
      path: "/tags",
      name: "tags",
      component: () =>
        import(/* webpackChunkName: "tags" */ "./views/TagsPage.vue"),
      meta: {
        requiresAuth: authenticated_required,
        title:  GeneralTitle + " - Tags"

      }
    },
    {
      path: "/mentions-legales",
      name: "mentions-legales",
      component: () =>
        import(/* webpackChunkName: "tags" */ "./views/MentionsLegalesPage.vue"),
      meta: {
        requiresAuth: authenticated_required,
        title: GeneralTitle + " - Mentions Legales"
      }
    },
    {
      path: "/donnees-personnelles",
      name: "donnees-personnelles",
      component: () =>
        import(/* webpackChunkName: "tags" */ "./views/PersonalDataPage.vue"),
      meta: {
        requiresAuth: authenticated_required,
        title: GeneralTitle + " - Données Personnelles"
      }
    },
    {
      path: "/plan-du-site",
      name: "plan-du-site",
      component: () =>
        import(/* webpackChunkName: "tags" */ "./views/PlanDuSitePage.vue"),
      meta: {
        requiresAuth: authenticated_required,
        title: GeneralTitle + " - Plan du Site"
      }
    },
    {
      path: "/accessibilite",
      name: "accessibilite",
      component: () =>
        import(/* webpackChunkName: "accessibilite" */ "./views/AccessibilityPage.vue"),
      meta: {
        requiresAuth: authenticated_required,
        title: GeneralTitle + " - Accessibilité"
      }
    },
    {
      path: "/gestion-des-cookies",
      name: "gestion-des-cookies",
      component: () =>
        import(/* webpackChunkName: "tags" */ "./views/CookiesPage.vue"),
      meta: {
        requiresAuth: authenticated_required
      }
    },
    {
      path: "/error-404",
      name: "error 404",
      component: () =>
        import(/* webpackChunkName: "tags" */ "./views/Error404Page.vue"),
      meta: {
        requiresAuth: authenticated_required,
      }
    },
    {
      path: "/error-500",
      name: "error 500",
      component: () =>
        import(/* webpackChunkName: "tags" */ "./views/Error500Page.vue"),
      meta: {
        requiresAuth: authenticated_required,
      }
    },
    {
      path: "/error-403",
      name: "error 403",
      component: () =>
        import(/* webpackChunkName: "tags" */ "./views/Error403Page.vue"),
      meta: {
        requiresAuth: authenticated_required,
      }
    },
    {
      path: "/error-400",
      name: "error 400",
      component: () =>
        import(/* webpackChunkName: "tags" */ "./views/Error400Page.vue"),
      meta: {
        requiresAuth: authenticated_required,
      }
    },
    {
      path: "*",
      name: "error404",
      component: () =>
        import(/* webpackChunkName: "error404" */ "./views/Error404Page.vue"),
      meta: {
        requiresAuth: authenticated_required, // ou false selon vos besoins
      }
    }
  ],
  
  scrollBehavior(to, from, savePosition) {
    return { x: 0, y: 0 };
  }
  
});


function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// router.beforeEach(async (to, from, next) => {
//   if (to.matched.some(record => record.meta.requiresAuth)) {
//     // We wait for Keycloak init, then we can call all methods safely
//     while (router.app.$keycloak.createLoginUrl === null) {
//       await sleep(100)
//       localStorage.setItem("vue-token", JSON.stringify(router.app.$keycloak.token));
//     }
//     if (router.app.$keycloak.authenticated) {
//       next()
//     } else {
//       const loginUrl = router.app.$keycloak.createLoginUrl()
//       console.log('loginUrl ' + loginUrl)
//       window.location.replace(loginUrl)
//     }
//   }
//   else {
//     next();
//   }
// })

export default router;
