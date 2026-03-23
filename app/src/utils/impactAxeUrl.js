import { IMPACT_AXE_DISPLAY_ORDER } from "@/services/csvDataService.js";

function stripDiacritics(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Slug stable pour un libellé d’axe (aligné sur toSectionSlug). */
export function impactAxeNameToSlug(name) {
  return stripDiacritics(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Slug d’axe → libellé canonique (ordre d’affichage). */
export function impactAxeSlugToName(slug) {
  const s = String(slug || "").toLowerCase();
  if (!s) return null;
  return (
    IMPACT_AXE_DISPLAY_ORDER.find((axe) => impactAxeNameToSlug(axe) === s) ||
    null
  );
}

export function isImpactAxeSlug(slug) {
  return !!impactAxeSlugToName(slug);
}
