import {
  canonicalImpactAxeNomComplet,
  impactAxeSlugFromNomComplet,
  resolveImpactAxeSlugToNomComplet,
} from "@/services/csvDataService.js";

function stripDiacritics(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function slugifyLoose(raw) {
  return stripDiacritics(String(raw || ""))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Slug pour `?section=` : toujours dérivé du nom court taxonomie (ex. attenuation, adaptation).
 */
export function impactAxeNameToSlug(name) {
  const complet = canonicalImpactAxeNomComplet(name);
  if (complet) return impactAxeSlugFromNomComplet(complet);
  return slugifyLoose(name);
}

/** Slug → nom complet taxonomie. */
export function impactAxeSlugToName(slug) {
  const s = String(slug || "").toLowerCase().trim();
  if (!s) return null;
  return resolveImpactAxeSlugToNomComplet(s);
}

export function isImpactAxeSlug(slug) {
  return !!impactAxeSlugToName(slug);
}

/**
 * Mappe un libellé issu des données (Liste_chantiers, indicateurs, nom court Grist…) vers le
 * nom complet taxonomie pour titres et URLs `?section=<slug>`.
 */
export function resolveImpactAxeCanonicalFromLabel(raw) {
  return canonicalImpactAxeNomComplet(raw);
}
