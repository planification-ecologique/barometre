/** Route nommée pour l'accueil (URL racine / ou /staging en staging). */
export function homeRouteName(isStaging) {
  return isStaging ? "staging-home" : "home";
}

/** Route nommée du tableau de bord (/dashboard, /staging/dashboard). */
export function dashboardRouteName(isStaging) {
  return isStaging ? "staging-dashboard" : "dashboard";
}
