/**
 * Territorial COP levers shown instead of chantiers when a region is selected.
 * Indicator → lever comes from the Grist column "Leviers COP".
 * The crosswalk only places a known lever name into a theme and sector.
 */

import crosswalk from "@/data/copLevierCrosswalk.json";
import { getIndicators } from "@/services/csvDataService";
import { loadAllRegionsDataForIndicator } from "@/services/ecolabApiService";
import { normalizeGeocode } from "@/services/frenchRegions";
import { buildShellIndicatorRow } from "@/services/shellViewDataService";
import { mapKeysStable, mapValuesStable } from "@/utils/mapIter";

const THEME_DESCRIPTIONS = {
  "Mieux se déplacer":
    "Leviers de mobilité pour lesquels le territoire dispose d'une série IRPE.",
  "Mieux se loger":
    "Leviers du bâtiment pour lesquels le territoire dispose d'une série IRPE.",
  "Mieux produire":
    "Leviers de production et d'énergie pour lesquels le territoire dispose d'une série IRPE.",
  "Mieux consommer":
    "Leviers de consommation et de déchets pour lesquels le territoire dispose d'une série IRPE.",
  "Mieux se nourrir":
    "Leviers agricoles et alimentaires pour lesquels le territoire dispose d'une série IRPE.",
  "Mieux préserver":
    "Leviers de préservation des milieux pour lesquels le territoire dispose d'une série IRPE.",
  "Mieux s'adapter":
    "Leviers d'adaptation pour lesquels le territoire dispose d'une série IRPE.",
};

const OTHER_THEME = "Autres leviers";

/** Grist labels that rename a lever already present in the theme catalog. */
const LEVER_NAME_ALIASES = {
  "Agriculture biologique et de haute valeur environnementale (HVE)":
    "Agriculture biologique et de HVE",
  "Bâtiments et machines agricoles": "Bâtiments & Machines agricoles",
  "Changement de pratiques de fertilisation azotée": "Fertilisation azotée",
  "Gestion durable des forêts": "Gestion des forêts (levier ABR et ACC)",
  "Lois Egalim et Climat & résilience": "Loi Egalim",
  "Protection des zones de captage d'eau": "Zones de captage d’eau",
  "Réduction de l'usage des produits phytopharmaceutiques": "Usage des phytos",
  "Sobriété dans l'utilisation de la ressource en eau":
    "Sobriété dans l’eau (ABR) ou sobriété dans l'utilisation de la ressource en eau (ACC)",
  "Transports en commun": "Transport en commun",
};

const viewCache = new Map();
const geocodeCache = new Map();

export function normalizeLeverLabel(value) {
  return String(value || "")
    .replace(/[\u2019\u2018]/g, "'")
    .replace(/\u00a0/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function slugify(value) {
  return normalizeLeverLabel(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function catalogByName() {
  const map = new Map();
  for (const lever of crosswalk.levers) {
    map.set(normalizeLeverLabel(lever.name), lever);
  }
  return map;
}

const catalog = catalogByName();

const aliasToCatalogKey = new Map(
  Object.entries(LEVER_NAME_ALIASES).map(([from, to]) => [
    normalizeLeverLabel(from),
    normalizeLeverLabel(to),
  ])
);

/**
 * Theme and territorial sector for a Grist "Leviers COP" label.
 * The displayed name stays the Grist value.
 * @param {string} name
 * @returns {{ name: string, theme: string, sector: string }}
 */
export function copLeverMeta(name) {
  const label = String(name || "").trim();
  const key = normalizeLeverLabel(label);
  const known = catalog.get(key) || catalog.get(aliasToCatalogKey.get(key));
  return {
    name: label,
    theme: known?.theme || OTHER_THEME,
    sector: known?.sector || "",
  };
}

export function indicatorCopLeverName(indicator) {
  return String(indicator?.levier_cop || "").trim();
}

/**
 * Geocodes that have a non-null measure in an IRPE payload.
 * @param {{ measureName?: string, data?: object[] }} payload
 * @returns {Set<string>}
 */
export function geocodesWithMeasure(payload) {
  const codes = new Set();
  const measure = payload?.measureName;
  if (!measure) return codes;
  for (const row of payload?.data || []) {
    if (!row || typeof row !== "object") continue;
    if (row[measure] == null || row[measure] === "") continue;
    const geoKey = Object.keys(row).find((key) => key.endsWith("geocode_region"));
    if (!geoKey || row[geoKey] == null || row[geoKey] === "") continue;
    const code = normalizeGeocode(row[geoKey]);
    if (code) codes.add(code);
  }
  return codes;
}

function geocodesForIrpeId(irpeId) {
  const id = String(irpeId || "").trim();
  if (!id) return Promise.resolve(new Set());
  if (!geocodeCache.has(id)) {
    geocodeCache.set(
      id,
      loadAllRegionsDataForIndicator(id)
        .then((payload) => geocodesWithMeasure(payload))
        .catch(() => new Set())
    );
  }
  return geocodeCache.get(id);
}

export async function indicatorCoversRegion(indicator, regionCode) {
  const code = normalizeGeocode(regionCode);
  const ids = indicator?.irpe_ids || [];
  if (!code || !ids.length) return false;
  const sets = await Promise.all(ids.map(geocodesForIrpeId));
  return sets.some((set) => set.has(code));
}

/**
 * @param {object[]} indicators
 * @param {(indicator: object) => object} [toRow]
 */
export function groupIndicatorsIntoSectors(indicators, toRow = (indicator) => indicator) {
  const byTheme = new Map();
  for (const indicator of indicators || []) {
    const leverName = indicatorCopLeverName(indicator);
    if (!leverName) continue;
    const lever = copLeverMeta(leverName);
    if (!byTheme.has(lever.theme)) byTheme.set(lever.theme, new Map());
    const byLever = byTheme.get(lever.theme);
    if (!byLever.has(lever.name)) {
      byLever.set(lever.name, {
        lever,
        indicators: [],
        seen: new Set(),
      });
    }
    const bucket = byLever.get(lever.name);
    const id = indicator.id_indic != null ? String(indicator.id_indic) : indicator.label_indic;
    if (!id || bucket.seen.has(id)) continue;
    bucket.seen.add(id);
    bucket.indicators.push(indicator);
  }

  const themeOrder = [...(crosswalk.themes || []), OTHER_THEME];
  const themes = mapKeysStable(byTheme).sort((a, b) => {
    const ia = themeOrder.indexOf(a);
    const ib = themeOrder.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  return themes.map((theme) => {
    const leverOrder = crosswalk.levers.filter((lever) => lever.theme === theme);
    const buckets = mapValuesStable(byTheme.get(theme)).sort((a, b) => {
      const ia = leverOrder.findIndex((lever) => lever.name === a.lever.name);
      const ib = leverOrder.findIndex((lever) => lever.name === b.lever.name);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
    const chantiers = buckets.map((bucket) => {
      const rows = bucket.indicators.map((indicator) => toRow(indicator));
      return {
        name: bucket.lever.name,
        id: `cop-${slugify(bucket.lever.name)}`,
        gristIds: bucket.indicators.map((indicator) => indicator.id_indic).filter(Boolean),
        engagementBadges: bucket.lever.sector ? [bucket.lever.sector] : [],
        remainingEngagements: 0,
        remainingEngagementNames: "",
        indicators: rows,
        sortedLeviers: [],
        descriptionChantier:
          "Indicateurs IRPE disponibles pour ce levier sur le territoire sélectionné.",
        axeTaxonomie: [],
        copMode: true,
      };
    });
    return {
      name: theme,
      description: THEME_DESCRIPTIONS[theme] || "",
      chantierCount: chantiers.length,
      levierCount: 0,
      indicatorCount: chantiers.reduce((sum, chantier) => sum + chantier.indicators.length, 0),
      engagementLabel: "Secteur",
      chantiers,
    };
  });
}

export async function loadCopRegionalView(regionCode, environment = "production") {
  const code = normalizeGeocode(regionCode);
  if (!code) return { displaySectors: [] };
  const cacheKey = `${environment}:${code}`;
  if (viewCache.has(cacheKey)) return viewCache.get(cacheKey);

  const response = await getIndicators({}, environment);
  const candidates = (response.results || []).filter(
    (indicator) => Array.isArray(indicator.irpe_ids) && indicator.irpe_ids.length > 0
  );
  const available = [];
  await Promise.all(
    candidates.map(async (indicator) => {
      if (await indicatorCoversRegion(indicator, code)) available.push(indicator);
    })
  );
  const displaySectors = groupIndicatorsIntoSectors(available, (indicator) =>
    buildShellIndicatorRow(indicator)
  );
  const view = { displaySectors };
  viewCache.set(cacheKey, view);
  return view;
}
