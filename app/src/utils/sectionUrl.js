/** Nom canonique du secteur « Synthèse » (données métier). */
export const SECTOR_SYNTHESE = "Synthèse";

/** Slug d’URL pour la synthèse. */
export const SECTION_SYNTHESE_SLUG = "synthese";

function stripDiacritics(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Convertit un nom de secteur métier en slug pour le paramètre d’URL `section`.
 */
export function toSectionSlug(sectorName) {
  if (!sectorName || sectorName === SECTOR_SYNTHESE) return SECTION_SYNTHESE_SLUG;
  return stripDiacritics(sectorName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || SECTION_SYNTHESE_SLUG;
}

/**
 * Résout le secteur métier depuis `query.section` (slug) ou `query.sector` (ancien format).
 * @param {Record<string,string>} q - this.$route.query
 * @param {string[]} knownSectorNames - noms issus de la navigation (ex. getNavigationStructure)
 */
export function resolveSectorFromQuery(q, knownSectorNames = []) {
  if (q.sector) return q.sector;
  const slug = (q.section && String(q.section).toLowerCase()) || SECTION_SYNTHESE_SLUG;
  if (slug === SECTION_SYNTHESE_SLUG) return SECTOR_SYNTHESE;
  const list = Array.isArray(knownSectorNames) ? knownSectorNames : [];
  const hit = list.find((s) => toSectionSlug(s) === slug);
  return hit || SECTOR_SYNTHESE;
}
