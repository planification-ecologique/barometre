import Vue from "vue";
import Router from "vue-router";
import {
  homeRouteName,
} from "./config/routeNames.js";
import {
  toSectionSlug,
  SECTOR_SYNTHESE,
  SECTION_SYNTHESE_SLUG,
  resolveSectorFromQuery,
} from "./utils/sectionUrl.js";
import {
  getNavigationStructure,
  impactAxeNomCourt,
  resolveImpactAxeSlugToNomComplet,
} from "./services/csvDataService.js";

Vue.use(Router);

const GeneralTitle = "Baromètre de la planification écologique";

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

async function resolveSectorNameForRoute(to) {
  if (!DASHBOARD_SHELL_NAMES.includes(to.name)) return null;
  const environment = isStagingRoute(to) ? "staging" : "production";
  const nav = await getNavigationStructure(environment);
  const sectorNames = nav?.data?.sectorNames || [];
  const sectorName = resolveSectorFromQuery(to.query || {}, sectorNames);
  if (!sectorName || sectorName === SECTOR_SYNTHESE) return null;
  return sectorName;
}

function resolveImpactAxeNameForRoute(to) {
  if (!DASHBOARD_SHELL_NAMES.includes(to.name)) return null;
  const slug = to?.query?.section;
  if (!slug) return null;
  const nomComplet = resolveImpactAxeSlugToNomComplet(slug);
  if (!nomComplet) return null;
  return impactAxeNomCourt(nomComplet) || nomComplet;
}

async function resolvePageTitle(to) {
  const metaTitle = to?.meta?.title;
  if (!metaTitle) return null;
  if (typeof metaTitle === "function") {
    return await metaTitle(to);
  }
  return String(metaTitle);
}

async function updateDocumentTitle(to) {
  let sectionName = null;
  try {
    sectionName =
      (await resolveSectorNameForRoute(to)) || resolveImpactAxeNameForRoute(to);
  } catch (e) {
    // non-bloquant : le titre doit rester fonctionnel même si la nav n'est pas disponible
  }

  const pageTitle = await resolvePageTitle(to);
  let full = GeneralTitle;

  // Sur les pages "shell" (dashboard / état / chantiers), si un secteur est sélectionné,
  // on privilégie un titre court : "Baromètre ... - <Secteur>" (sans répéter le nom de page).
  if (DASHBOARD_SHELL_NAMES.includes(to.name) && sectionName) {
    full += " - " + sectionName;
  } else {
    if (pageTitle) full += " - " + pageTitle;
    if (sectionName) full += " - " + sectionName;
  }

  if (isStagingRoute(to)) {
    document.title = "STAGING - " + full;
  } else {
    document.title = full;
  }
}

/**
 * Anciennes URL (dashboard multi-vues, ?sector=, query obsolètes) → accueil.
 * Plus de redirections canoniques au cas par cas.
 */
function legacyBrokenLinkHomeRedirect(to) {
  const isSt =
    to.path.includes("/staging") || to.meta?.isStaging === true;
  const home = { name: homeRouteName(isSt), replace: true };
  const q = to.query || {};
  const name = to.name;

  // /dashboard : seules vues encore supportées (hors routes dédiées état / chantiers)
  const DASHBOARD_ALLOWED_VIEWS = new Set(["sectorial-engagements", "chantier"]);
  if (name === "dashboard" || name === "staging-dashboard") {
    const view = q.view;
    if (view != null && view !== "") {
      const v = Array.isArray(view) ? String(view[0]) : String(view);
      if (!DASHBOARD_ALLOWED_VIEWS.has(v)) {
        return home;
      }
    }
  }

  if (DASHBOARD_SHELL_NAMES.includes(name) && q.sector && !q.section) {
    return home;
  }

  if (
    (name === "etat-environnement" || name === "staging-etat-environnement") &&
    q.view === "general-engagements" &&
    q.axe
  ) {
    return home;
  }

  if (
    (name === "etat-environnement" || name === "staging-etat-environnement") &&
    q.view === "engagements-table"
  ) {
    return home;
  }

  if (name === "chantiers" || name === "staging-chantiers") {
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
    const clean =
      !q.view &&
      q.chantier_sector === undefined &&
      slug === targetSection;
    if (!clean) {
      return home;
    }
  }

  return null;
}

/** ?view=chantiers-table supprimé → synthèse chantiers (même route, sans view). */
function canonicalChantiersTableQueryRedirect(to) {
  if (to.name !== "chantiers" && to.name !== "staging-chantiers") return null;
  if (to.query?.view !== "chantiers-table") return null;
  const q = { ...to.query };
  delete q.view;
  return { name: to.name, query: q, hash: to.hash, replace: true };
}

const routes = [
  {
    path: "/",
    name: "home",
    props: dashboardProps,
    component: () =>
      import(/* webpackChunkName: "dashboard" */ "./views/DashboardPage.vue"),
    meta: {
      title: null,
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
      title: "Tableaux de bord",

    }
  },
  {
    path: "/etat-environnement",
    name: "etat-environnement",
    props: dashboardProps,
    component: () =>
      import(/* webpackChunkName: "dashboard" */ "./views/DashboardPage.vue"),
    meta: {
      title: "État de l'environnement",
    }
  },
  {
    path: "/chantiers",
    name: "chantiers",
    props: dashboardProps,
    component: () =>
      import(/* webpackChunkName: "dashboard" */ "./views/DashboardPage.vue"),
    meta: {
      title: "Chantiers sectoriels",
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
      title: "Recherche",
    }
  },
  {
    path: "/favoris",
    name: "favoris",
    component: () =>
      import(/* webpackChunkName: "favoris" */ "./views/FavorisPage.vue"),
    meta: {
      title: "Favoris",
    }
  },
  {
    path: "/mentions-legales",
    name: "mentions-legales",
    component: () =>
      import(/* webpackChunkName: "tags" */ "./views/MentionsLegalesPage.vue"),
    meta: {
      title: "Mentions légales",
    }
  },
  {
    path: "/donnees-personnelles",
    name: "donnees-personnelles",
    component: () =>
      import(/* webpackChunkName: "tags" */ "./views/PersonalDataPage.vue"),
    meta: {
      title: "Données personnelles",
    }
  },
  {
    path: "/plan-du-site",
    name: "plan-du-site",
    component: () =>
      import(/* webpackChunkName: "tags" */ "./views/PlanDuSitePage.vue"),
    meta: {
      title: "Plan du site",
    }
  },
  {
    path: "/accessibilite",
    name: "accessibilite",
    component: () =>
      import(/* webpackChunkName: "accessibilite" */ "./views/AccessibilityPage.vue"),
    meta: {
      title: "Accessibilité",
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
      title: "Chart",
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
      title: "Sélection d'indicateur",
      noindex: true
    }
  },
  {
    path: "/test/accueil-v2",
    name: "test-accueil-v2",
    component: () =>
      import(/* webpackChunkName: "test-home-v2" */ "./views/HomeV2TestPage.vue"),
    meta: {
      title: "Test accueil V2",
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
        title: null,
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
        title: "Tableaux de bord",
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
        title: "État de l'environnement",
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
        title: "Chantiers sectoriels",
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
        title: "Recherche",
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
        title: "Test accueil V2 (staging)",
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
    // Ancre : ne scroller que si l’élément existe déjà (sinon la vue cible appelle scrollToHash après rendu)
    if (to.hash) {
      try {
        if (document.querySelector(to.hash)) {
          return { selector: to.hash, behavior: "smooth" };
        }
      } catch (e) {
        /* sélecteur invalide */
      }
      return false;
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
  const chantiersTableCanon = canonicalChantiersTableQueryRedirect(to);
  if (chantiersTableCanon) {
    next(chantiersTableCanon);
    return;
  }
  const legacyHome = legacyBrokenLinkHomeRedirect(to);
  if (legacyHome) {
    next(legacyHome);
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

  await updateDocumentTitle(to);
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
