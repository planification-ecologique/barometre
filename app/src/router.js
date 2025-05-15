import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

const GeneralTitle = "Baromètre de la planification écologique"

const routes = [
  {
    path: "/",
    name: "home",
    meta: {
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
      title:  GeneralTitle + " - Tableaux de bord"

    }
  },
  {
    path: "/search",
    name: "search",
    component: () =>
      import(/* webpackChunkName: "search" */ "./views/SearchPage.vue"),
    meta: {
      title:  GeneralTitle + " - Recherche"

    }
  },
  {
    path: "/mentions-legales",
    name: "mentions-legales",
    component: () =>
      import(/* webpackChunkName: "tags" */ "./views/MentionsLegalesPage.vue"),
    meta: {
      title: GeneralTitle + " - Mentions Legales"
    }
  },
  {
    path: "/donnees-personnelles",
    name: "donnees-personnelles",
    component: () =>
      import(/* webpackChunkName: "tags" */ "./views/PersonalDataPage.vue"),
    meta: {
      title: GeneralTitle + " - Données Personnelles"
    }
  },
  {
    path: "/plan-du-site",
    name: "plan-du-site",
    component: () =>
      import(/* webpackChunkName: "tags" */ "./views/PlanDuSitePage.vue"),
    meta: {
      title: GeneralTitle + " - Plan du Site"
    }
  },
  {
    path: "/accessibilite",
    name: "accessibilite",
    component: () =>
      import(/* webpackChunkName: "accessibilite" */ "./views/AccessibilityPage.vue"),
    meta: {
      title: GeneralTitle + " - Accessibilité"
    }
  },
  {
    path: "/gestion-des-cookies",
    name: "gestion-des-cookies",
    component: () =>
      import(/* webpackChunkName: "tags" */ "./views/CookiesPage.vue"),
    meta: {}
  },
  {
    path: "/error-404",
    name: "error 404",
    component: () =>
      import(/* webpackChunkName: "tags" */ "./views/Error404Page.vue"),
    meta: {}
  },
  {
    path: "/error-500",
    name: "error 500",
    component: () =>
      import(/* webpackChunkName: "tags" */ "./views/Error500Page.vue"),
    meta: {}
  },
  {
    path: "/error-403",
    name: "error 403",
    component: () =>
      import(/* webpackChunkName: "tags" */ "./views/Error403Page.vue"),
    meta: {}
  },
  {
    path: "/error-400",
    name: "error 400",
    component: () =>
      import(/* webpackChunkName: "tags" */ "./views/Error400Page.vue"),
    meta: {}
  },
  {
    path: "/staging",
    redirect: "/staging/dashboard",
    meta: {
      noindex: true,          // Signal to search engines not to index
      excludeFromSitemap: true // Exclude from sitemap generation
    }
  },
  {
    path: "*",
    name: "error404",
    component: () =>
      import(/* webpackChunkName: "error404" */ "./views/Error404Page.vue"),
    meta: {}
  }
];

// Only add staging routes if not in production
if (process.env.VUE_APP_ENV !== 'prod') {
  routes.push(
    {
      path: "/staging/dashboard",
      name: "staging-dashboard",
      props: { useStaging: true },
      component: () =>
        import(/* webpackChunkName: "dashboard" */ "./views/DashboardPage.vue"),
      meta: {
        title: "STAGING - " + GeneralTitle + " - Tableaux de bord",
        isStaging: true,
        noindex: true,
        excludeFromSitemap: true
      }
    },
    {
      path: "/staging/search",
      name: "staging-search",
      props: { useStaging: true },
      component: () =>
        import(/* webpackChunkName: "search" */ "./views/SearchPage.vue"),
      meta: {
        title: "STAGING - " + GeneralTitle + " - Recherche",
        isStaging: true,
        noindex: true,
        excludeFromSitemap: true
      }
    }
  );
}

const router = new Router({
  mode: "history",
  base: process.env.VUE_APP_PREFIX_PATH,
  routes,
  
  scrollBehavior(to, from, savePosition) {
    return { x: 0, y: 0 };
  }
  
});


function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Check if a route is a staging route
function isStagingRoute(route) {
  return route.path.includes('/staging') || route.meta.isStaging;
}

router.beforeEach(async (to, from, next) => {
  // If in production and trying to access a /staging route, redirect to the non-staging equivalent
  if (
    process.env.VUE_APP_ENV === 'prod' &&
    to.path.startsWith('/staging')
  ) {
    // Remove '/staging' from the path and redirect
    const newPath = to.path.replace(/^\/staging/, '') || '/';
    next({ path: newPath, query: to.query, hash: to.hash });
    return;
  }

  // Add document title prefix for staging routes
  if (isStagingRoute(to)) {
    document.title = "STAGING - " + (to.meta.title || GeneralTitle);
  }
  next();
});

export default router;
