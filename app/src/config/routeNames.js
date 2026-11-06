import { isImpactAxeSlug } from "@/utils/impactAxeUrl.js";
import { SECTION_SYNTHESE_SLUG } from "@/utils/sectionUrl.js";

/** Route nommée pour l'accueil (URL racine / ou /staging en staging). */
export function homeRouteName(isStaging) {
  return isStaging ? "staging-home" : "home";
}

/** Route nommée du tableau de bord (/dashboard, /staging/dashboard). */
export function dashboardRouteName(isStaging) {
  return isStaging ? "staging-dashboard" : "dashboard";
}

export function etatEnvironnementRouteName(isStaging) {
  return isStaging ? "staging-etat-environnement" : "etat-environnement";
}

export function chantiersRouteName(isStaging) {
  return isStaging ? "staging-chantiers" : "chantiers";
}

export function territoiresRouteName(isStaging) {
  return isStaging ? "staging-territoires" : "territoires";
}

export function isTerritoiresShellName(name) {
  return name === "territoires" || name === "staging-territoires";
}

/** Chantiers nationaux ou arborescence territoriale. */
export function isChantiersShellName(name) {
  return (
    name === "chantiers" ||
    name === "staging-chantiers" ||
    isTerritoiresShellName(name)
  );
}

export function rechercheRouteName(isStaging) {
  return isStaging ? "staging-recherche" : "recherche";
}

export function territoiresRechercheRouteName(isStaging) {
  return isStaging ? "staging-territoires-recherche" : "territoires-recherche";
}

export function territoiresFavorisRouteName(isStaging) {
  return isStaging ? "staging-territoires-favoris" : "territoires-favoris";
}

export function isTerritoiresContext(route) {
  const path = String(route?.path || "");
  return (
    path === "/territoires" ||
    path.startsWith("/territoires/") ||
    path === "/staging/territoires" ||
    path.startsWith("/staging/territoires/")
  );
}

/**
 * From a territoires page, menu targets stay under /territoires.
 * Accueil is unchanged and leaves the shell.
 * @returns {object|null}
 */
export function keepTerritoiresNavigation(to, from) {
  if (!isTerritoiresContext(from) || !to) return null;
  const staging = String(from.path || "").includes("/staging");
  const name = to.name;
  const query = { ...(to.query || {}) };

  let next = null;
  if (name === "etat-environnement" || name === "staging-etat-environnement") {
    const slug = String(query.section || "").toLowerCase();
    if (slug && slug !== SECTION_SYNTHESE_SLUG && isImpactAxeSlug(slug)) {
      query.view = "general-engagements";
    } else if (
      !query.view ||
      query.view === "chantiers-sectoriels" ||
      query.view === "chantier"
    ) {
      query.view = "etat-environnement";
    }
    next = { name: territoiresRouteName(staging), query, hash: to.hash };
  } else if (name === "chantiers" || name === "staging-chantiers" || name === "dashboard" || name === "staging-dashboard") {
    if (query.view === "etat-environnement" || query.view === "general-engagements") {
      delete query.view;
    }
    next = { name: territoiresRouteName(staging), query, hash: to.hash };
  } else if (name === "recherche" || name === "staging-recherche") {
    next = { name: territoiresRechercheRouteName(staging), query, hash: to.hash };
  } else if (name === "favoris") {
    next = { name: territoiresFavorisRouteName(staging), query, hash: to.hash };
  }

  if (!next || next.name === to.name) return null;
  return next;
}
