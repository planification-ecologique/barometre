/**
 * French regions and overseas territories kept in IRPE series.
 * Foreign countries and "Non précisé" are dropped (parasitic rows in some cubes).
 */

export const FRENCH_REGIONS = [
  { code: "84", label: "Auvergne-Rhône-Alpes" },
  { code: "27", label: "Bourgogne-Franche-Comté" },
  { code: "53", label: "Bretagne" },
  { code: "24", label: "Centre-Val de Loire" },
  { code: "0", label: "Collectivités d'outre-mer" },
  { code: "94", label: "Corse" },
  { code: "44", label: "Grand Est" },
  { code: "01", label: "Guadeloupe" },
  { code: "03", label: "Guyane" },
  { code: "32", label: "Hauts-de-France" },
  { code: "11", label: "Île-de-France" },
  { code: "04", label: "La Réunion" },
  { code: "02", label: "Martinique" },
  { code: "06", label: "Mayotte" },
  { code: "28", label: "Normandie" },
  { code: "75", label: "Nouvelle-Aquitaine" },
  { code: "76", label: "Occitanie" },
  { code: "52", label: "Pays de la Loire" },
  { code: "93", label: "Provence-Alpes-Côte d'Azur" },
];

const FRENCH_REGION_CODES = new Set(FRENCH_REGIONS.map((region) => region.code));

/** Pad numeric INSEE codes ("1" -> "01"). Keep "0" (COM aggregate). */
export function normalizeGeocode(code) {
  const raw = String(code == null ? "" : code).trim();
  if (!raw) return "";
  if (/^\d+$/.test(raw) && raw !== "0") return raw.padStart(2, "0");
  return raw.toUpperCase();
}

export function isFrenchTerritoryGeocode(code) {
  return FRENCH_REGION_CODES.has(normalizeGeocode(code));
}

function rowGeocode(row) {
  if (!row || typeof row !== "object") return undefined;
  const key = Object.keys(row).find(
    (name) => name === "geocode_region" || name.endsWith(".geocode_region")
  );
  if (!key) return undefined;
  return row[key];
}

/** Drop rows whose region is not a French region or overseas territory. */
export function filterFrenchTerritoryRows(rows) {
  if (!Array.isArray(rows)) return rows;
  return rows.filter((row) => {
    const code = rowGeocode(row);
    if (code == null || String(code).trim() === "") return false;
    return isFrenchTerritoryGeocode(code);
  });
}
