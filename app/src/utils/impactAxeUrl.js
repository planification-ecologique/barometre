import {
  IMPACT_AXE_DISPLAY_ORDER,
  isImpactAxe,
  normalizeImpactAxeName,
} from "@/services/csvDataService.js";

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

/**
 * Mappe un libellé issu des données (Liste_chantiers, indicateurs…) vers l’axe canonique
 * d’IMPACT_AXE_DISPLAY_ORDER pour construire une URL `?section=<slug>` reconnue par l’app.
 * Gère les formes courtes type « Atténuation » → « Atténuation climat ».
 */
export function resolveImpactAxeCanonicalFromLabel(raw) {
  if (!raw || !String(raw).trim()) return null;
  const t = String(raw).trim();
  const norm = normalizeImpactAxeName(t);

  const byExact = IMPACT_AXE_DISPLAY_ORDER.find((a) => a === t || a === norm);
  if (byExact) return byExact;

  if (isImpactAxe(t) || isImpactAxe(norm)) {
    const label = isImpactAxe(norm) ? norm : t;
    const fromSlug = impactAxeSlugToName(impactAxeNameToSlug(label));
    if (fromSlug) return fromSlug;
  }

  const s = impactAxeNameToSlug(t);
  if (!s) return null;
  for (const axe of IMPACT_AXE_DISPLAY_ORDER) {
    const axeSlug = impactAxeNameToSlug(axe);
    if (axeSlug === s || axeSlug.startsWith(`${s}-`)) return axe;
  }
  return null;
}
