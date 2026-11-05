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
