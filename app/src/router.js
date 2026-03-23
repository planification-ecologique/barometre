import Vue from "vue";
import Router from "vue-router";
import {
  toSectionSlug,
  SECTOR_SYNTHESE,
  SECTION_SYNTHESE_SLUG,
} from "./utils/sectionUrl.js";
import { impactAxeNameToSlug } from "./utils/impactAxeUrl.js";

Vue.use(Router);

const GeneralTitle = "Baromètre de la planification écologique"

const dashboardProps = (route) =>
  ({ query: route.query.theme }, { query: route.query.levier });

const DASHBOARD_SHELL_NAMES = [
  "dashboard",
  "staging-dashboard",
  "etat-environnement",
  "staging-etat-environnement",
  "chantiers",
  "staging-chantiers",
];

/** /etat-environnement?view=general-engagements&axe= → ?section=<slug-axe> */
function legacyEtatEngagementsQueryRedirect(to) {
  if (to.name !== "etat-environnement" && to.name !== "staging-etat-environnement") return null;
  if (to.query.view !== "general-engagements" || !to.query.axe) return null;
  const query = { section: impactAxeNameToSlug(to.query.axe) };
  if (to.query.theme !== undefined) query.theme = to.query.theme;
  if (to.query.levier !== undefined) query.levier = to.query.levier;
  return { name: to.name, query, hash: to.hash, replace: true };
}

/** /chantiers?view=chantier&chantier_sector= → ?section=<slug>&chantier_id= */
function legacyChantierDetailQueryRedirect(to) {
  if (to.name !== "chantiers" && to.name !== "staging-chantiers") return null;
  const q = to.query || {};
  if (!q.chantier_id) return null;
  if (q.view && q.view !== "chantier") return null;

  const slug =
    String(q.section || "").toLowerCase() || SECTION_SYNTHESE_SLUG;

  let targetSection;
  if (q.chantier_sector) {
    targetSection = toSectionSlug(q.chantier_sector);
  } else if (slug !== SECTION_SYNTHESE_SLUG) {
    targetSection = slug;
  } else {
    return null;
  }

  const canonical = {
    section: targetSection,
    chantier_id: String(q.chantier_id),
  };
  if (q.theme !== undefined) canonical.theme = q.theme;
  if (q.levier !== undefined) canonical.levier = q.levier;

  const clean =
    !q.view && q.chantier_sector === undefined && slug === targetSection;
  if (clean) return null;

  return { name: to.name, query: canonical, hash: to.hash, replace: true };
}

/** Ancien paramètre ?sector= → ?section= (slug), même route */
function legacySectorQueryRedirect(to) {
  if (!DASHBOARD_SHELL_NAMES.includes(to.name) || !to.query?.sector || to.query.section) return null;
  const q = { ...to.query };
  q.section = toSectionSlug(q.sector);
  delete q.sector;
  return { name: to.name, query: q, hash: to.hash, replace: true };
}

/** Anciens liens /dashboard?sector=&view= → chemins propres + ?section= */
function legacyDashboardRedirect(to) {
  if (to.name !== "dashboard" && to.name !== "staging-dashboard") return null;
  const q = to.query || {};
  const view = q.view;
  if (!view) return null;
  const isSt = to.name === "staging-dashboard";
  const section = q.section || toSectionSlug(q.sector || SECTOR_SYNTHESE);
  const carry = (base) => {
    const out = { ...base };
    if (q.chantier_id) out.chantier_id = q.chantier_id;
    if (q.chantier_sector) out.chantier_sector = q.chantier_sector;
    if (q.sectorFilter) out.sectorFilter = q.sectorFilter;
    if (q.theme !== undefined) out.theme = q.theme;
    if (q.levier !== undefined) out.levier = q.levier;
    return out;
  };
  const etatViews = ["etat-environnement", "general-engagements", "engagements-table"];
  const chantierViews = [
    "chantiers-sectoriels",
    "general-chantiers",
    "chantiers-table",
    "chantier"
  ];
  if (etatViews.includes(view)) {
    if (view === "general-engagements" && q.axe) {
      return {
        name: isSt ? "staging-etat-environnement" : "etat-environnement",
        query: carry({ section: impactAxeNameToSlug(q.axe) }),
        hash: to.hash,
        replace: true
      };
    }
    const query = carry({ section });
    if (view === "engagements-table") query.view = "engagements-table";
    else if (view === "general-engagements") query.view = "general-engagements";
    return {
      name: isSt ? "staging-etat-environnement" : "etat-environnement",
      query,
      hash: to.hash,
      replace: true
    };
  }
  if (chantierViews.includes(view)) {
    if (view === "chantier" && q.chantier_id) {
      const query = {
        section: q.chantier_sector
          ? toSectionSlug(q.chantier_sector)
          : section,
        chantier_id: String(q.chantier_id),
      };
      if (q.sectorFilter) query.sectorFilter = q.sectorFilter;
      if (q.theme !== undefined) query.theme = q.theme;
      if (q.levier !== undefined) query.levier = q.levier;
      return {
        name: isSt ? "staging-chantiers" : "chantiers",
        query,
        hash: to.hash,
        replace: true,
      };
    }
    const query = carry({ section });
    if (view !== "chantiers-sectoriels") query.view = view;
    return {
      name: isSt ? "staging-chantiers" : "chantiers",
      query,
      hash: to.hash,
      replace: true
    };
  }
  return null;
}

const routes = [
  {
    path: "/",
    name: "home",
    props: dashboardProps,
    component: () =>
      import(/* webpackChunkName: "dashboard" */ "./views/DashboardPage.vue"),
    meta: {
      title: GeneralTitle + " - Tableaux de bord"
    }
  },
  {
    path: "/accueil",
    name: "accueil",
    redirect: { name: "home" }
  },
  
  {
    path: "/dashboard",
    name: "dashboard",
    props: dashboardProps,
    component: () =>
      import(/* webpackChunkName: "dashboard" */ "./views/DashboardPage.vue"),
    meta: {
      title:  GeneralTitle + " - Tableaux de bord"

    }
  },
  {
    path: "/etat-environnement",
    name: "etat-environnement",
    props: dashboardProps,
    component: () =>
      import(/* webpackChunkName: "dashboard" */ "./views/DashboardPage.vue"),
    meta: {
      title: GeneralTitle + " - État de l'environnement"
    }
  },
  {
    path: "/chantiers",
    name: "chantiers",
    props: dashboardProps,
    component: () =>
      import(/* webpackChunkName: "dashboard" */ "./views/DashboardPage.vue"),
    meta: {
      title: GeneralTitle + " - Chantiers sectoriels"
    }
  },
  {
    path: "/search",
    redirect: (to) => ({
      path: "/recherche",
      query: to.query,
      hash: to.hash
    })
  },
  {
    path: "/recherche",
    name: "recherche",
    component: () =>
      import(/* webpackChunkName: "search" */ "./views/SearchPage.vue"),
    meta: {
      title: GeneralTitle + " - Recherche"
    }
  },
  {
    path: "/favoris",
    name: "favoris",
    component: () =>
      import(/* webpackChunkName: "favoris" */ "./views/FavorisPage.vue"),
    meta: {
      title: GeneralTitle + " - Favoris"
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
    path: "/chart-iframe",
    name: "chart-iframe",
    component: () =>
      import(/* webpackChunkName: "chart-iframe" */ './views/ChartIframeView.vue'),
    meta: {
      title: GeneralTitle + " - Chart",
      noindex: true,
      hideHeader: true,
      hideFooter: true
    }
  },
  {
    path: "/chart-selector",
    name: "chart-selector",
    component: () =>
      import(/* webpackChunkName: "chart-selector" */ "./components/GraphBoxSelector.vue"),
    meta: {
      title: GeneralTitle + " - Sélection d'indicateur",
      noindex: true
    }
  },
  {
    path: "/test/accueil-v2",
    name: "test-accueil-v2",
    component: () =>
      import(/* webpackChunkName: "test-home-v2" */ "./views/HomeV2TestPage.vue"),
    meta: {
      title: GeneralTitle + " — Test accueil V2",
      noindex: true,
      excludeFromSitemap: true
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
      path: "/staging",
      name: "staging-home",
      props: { useStaging: true },
      component: () =>
        import(/* webpackChunkName: "dashboard" */ "./views/DashboardPage.vue"),
      meta: {
        title: GeneralTitle + " - Tableaux de bord",
        isStaging: true,
        noindex: true,
        excludeFromSitemap: true
      }
    },
    {
      path: "/staging/dashboard",
      name: "staging-dashboard",
      props: { useStaging: true },
      component: () =>
        import(/* webpackChunkName: "dashboard" */ "./views/DashboardPage.vue"),
      meta: {
        title: GeneralTitle + " - Tableaux de bord",
        isStaging: true,
        noindex: true,
        excludeFromSitemap: true
      }
    },
    {
      path: "/staging/etat-environnement",
      name: "staging-etat-environnement",
      props: { useStaging: true },
      component: () =>
        import(/* webpackChunkName: "dashboard" */ "./views/DashboardPage.vue"),
      meta: {
        title: GeneralTitle + " - État de l'environnement",
        isStaging: true,
        noindex: true,
        excludeFromSitemap: true
      }
    },
    {
      path: "/staging/chantiers",
      name: "staging-chantiers",
      props: { useStaging: true },
      component: () =>
        import(/* webpackChunkName: "dashboard" */ "./views/DashboardPage.vue"),
      meta: {
        title: GeneralTitle + " - Chantiers sectoriels",
        isStaging: true,
        noindex: true,
        excludeFromSitemap: true
      }
    },
    {
      path: "/staging/search",
      redirect: (to) => ({
        path: "/staging/recherche",
        query: to.query,
        hash: to.hash
      })
    },
    {
      path: "/staging/recherche",
      name: "staging-recherche",
      props: { useStaging: true },
      component: () =>
        import(/* webpackChunkName: "search" */ "./views/SearchPage.vue"),
      meta: {
        title: GeneralTitle + " - Recherche",
        isStaging: true,
        noindex: true,
        excludeFromSitemap: true
      }
    },
    {
      path: "/staging/test/accueil-v2",
      name: "staging-test-accueil-v2",
      props: { useStaging: true },
      component: () =>
        import(/* webpackChunkName: "test-home-v2" */ "./views/HomeV2TestPage.vue"),
      meta: {
        title: GeneralTitle + " — Test accueil V2 (staging)",
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
  
  scrollBehavior(to, from, savedPosition) {
    // Restore scroll position when user navigates back/forward
    if (savedPosition) {
      return savedPosition;
    }
    // Scroll to hash anchor if present
    if (to.hash) {
      return { selector: to.hash, behavior: 'smooth' };
    }
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
  const etatAxeRedir = legacyEtatEngagementsQueryRedirect(to);
  if (etatAxeRedir) {
    next(etatAxeRedir);
    return;
  }
  const chantierRedir = legacyChantierDetailQueryRedirect(to);
  if (chantierRedir) {
    next(chantierRedir);
    return;
  }
  const sectorRedir = legacySectorQueryRedirect(to);
  if (sectorRedir) {
    next(sectorRedir);
    return;
  }
  const dashRedir = legacyDashboardRedirect(to);
  if (dashRedir) {
    next(dashRedir);
    return;
  }

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
  // Toggle header/footer visibility via body classes (prevents component remounts)
  const body = document.body;
  if (to.meta.hideHeader) {
    body.classList.add('hide-header');
  } else {
    body.classList.remove('hide-header');
  }
  if (to.meta.hideFooter) {
    body.classList.add('hide-footer');
  } else {
    body.classList.remove('hide-footer');
  }
  next();
});

export default router;
