/**
 * Territorial tree: chantier hats become leviers COP, and the baromètre
 * levers are filed under those hats. The route /territoires shows every
 * baromètre series, not only the ones that have a regional IRPE measure.
 * The crosswalk places a known lever or chantier name into a theme.
 */

import crosswalk from "@/data/copLevierCrosswalk.json";
import { getIndicators, getNavigationStructure, isImpactAxe } from "@/services/csvDataService";
import { loadAllRegionsDataForIndicator } from "@/services/ecolabApiService";
import { normalizeGeocode } from "@/services/frenchRegions";
import { buildShellIndicatorRow } from "@/services/shellViewDataService";
import { mapKeysStable, mapValuesStable } from "@/utils/mapIter";

const THEME_DESCRIPTIONS = {
  "Mieux se déplacer":
    "Leviers COP de mobilité, avec les leviers du baromètre rangés dessous.",
  "Mieux se loger":
    "Leviers COP du bâtiment, avec les leviers du baromètre rangés dessous.",
  "Mieux produire":
    "Leviers COP de production et d'énergie, avec les leviers du baromètre rangés dessous.",
  "Mieux consommer":
    "Leviers COP de consommation et de déchets, avec les leviers du baromètre rangés dessous.",
  "Mieux se nourrir":
    "Leviers COP agricoles et alimentaires, avec les leviers du baromètre rangés dessous.",
  "Mieux préserver":
    "Leviers COP de préservation des milieux, avec les leviers du baromètre rangés dessous.",
  "Mieux s'adapter":
    "Leviers COP d'adaptation, avec les leviers du baromètre rangés dessous.",
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

const STRUCTURAL_LEVER_NAMES = new Set(
  [
    "Indicateur de chantier",
    "Autres indicateurs",
    "Indicateur d'impact",
    "Indicateur d'impact - autres",
  ].map(normalizeLeverLabel)
);

const referentielByLabel = new Map();
for (const lever of crosswalk.levers) {
  referentielByLabel.set(normalizeLeverLabel(lever.name), lever);
  for (const label of lever.referentiel || []) {
    referentielByLabel.set(normalizeLeverLabel(label), lever);
  }
}

function catalogLever(label) {
  const key = normalizeLeverLabel(label);
  if (!key || STRUCTURAL_LEVER_NAMES.has(key)) return null;
  return (
    referentielByLabel.get(key) ||
    catalog.get(key) ||
    catalog.get(aliasToCatalogKey.get(key)) ||
    null
  );
}

/**
 * COP hat for a baromètre lever. A Grist "Leviers COP" value wins, then the
 * lever name, then the chantier it belongs to.
 * @returns {{ name: string, theme: string, sector: string } | null}
 */
export function resolveCopLever({ levierCop, leverName, chantierName }) {
  const direct = String(levierCop || "").trim();
  if (direct) return copLeverMeta(direct);
  const fromLever = catalogLever(leverName);
  if (fromLever) {
    return {
      name: fromLever.name,
      theme: fromLever.theme,
      sector: fromLever.sector || "",
    };
  }
  const fromChantier = catalogLever(chantierName);
  if (fromChantier) {
    return {
      name: fromChantier.name,
      theme: fromChantier.theme,
      sector: fromChantier.sector || "",
    };
  }
  return null;
}

function levierCopFromItems(items) {
  for (const item of items || []) {
    const raw = item?.indicator || {};
    const value = String(raw["Leviers COP"] || raw.levier_cop || "").trim();
    if (value) return value;
  }
  return "";
}

/**
 * Full baromètre tree reorganized under leviers COP.
 * Every chantier lever is kept, including series that have no IRPE id.
 * @param {object[]} sectors - navigation sectors from getNavigationStructure
 */
export function assembleTerritoireSectors(sectors) {
  const byTheme = {};

  for (const sector of sectors || []) {
    if (!sector || sector.name === "Synthèse") continue;
    const chantiers = sector.chantiers || {};
    for (const [chantierName, chantier] of Object.entries(chantiers)) {
      if (isImpactAxe(chantierName)) continue;
      for (const lever of chantier.sortedLeviers || []) {
        const leverName = lever?.name || "";
        const leverKey = normalizeLeverLabel(leverName);
        if (
          !leverName ||
          leverKey === normalizeLeverLabel("Indicateur d'impact") ||
          leverKey === normalizeLeverLabel("Indicateur d'impact - autres")
        ) {
          continue;
        }
        const known = resolveCopLever({
          levierCop: levierCopFromItems(lever.indicators),
          leverName,
          chantierName,
        });
        const meta = known || {
          name:
            normalizeLeverLabel(leverName) === normalizeLeverLabel("Indicateur de chantier")
              ? chantierName
              : leverName,
          theme: OTHER_THEME,
          sector: "",
        };
        if (!byTheme[meta.theme]) byTheme[meta.theme] = {};
        if (!byTheme[meta.theme][meta.name]) {
          byTheme[meta.theme][meta.name] = { meta, levers: {} };
        }
        const hat = byTheme[meta.theme][meta.name];
        if (!hat.levers[leverName]) {
          hat.levers[leverName] = {
            name: leverName,
            indicators: [],
            objectifLevier: lever.objectifLevier || "",
            axeTaxonomie: lever.axeTaxonomie || [],
            seen: {},
          };
        }
        const dest = hat.levers[leverName];
        if (!dest.objectifLevier && lever.objectifLevier) {
          dest.objectifLevier = lever.objectifLevier;
        }
        for (const item of lever.indicators || []) {
          const id = item?.gristId;
          if (!id || dest.seen[id]) continue;
          dest.seen[id] = true;
          dest.indicators.push({
            gristId: id,
            levier: leverName,
            indicator: item.indicator,
          });
        }
      }
    }
  }

  const themeOrder = [...(crosswalk.themes || []), OTHER_THEME];
  const themeNames = Object.keys(byTheme).sort((a, b) => {
    const ia = themeOrder.indexOf(a);
    const ib = themeOrder.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  return themeNames.map((theme) => {
    const leverOrder = crosswalk.levers.filter((lever) => lever.theme === theme);
    const hatNames = Object.keys(byTheme[theme]).sort((a, b) => {
      const ia = leverOrder.findIndex((lever) => lever.name === a);
      const ib = leverOrder.findIndex((lever) => lever.name === b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b, "fr");
    });
    const chantiers = hatNames.map((hatName) => {
      const hat = byTheme[theme][hatName];
      const sortedLeviers = Object.values(hat.levers)
        .map((lever) => ({
          name: lever.name,
          indicators: lever.indicators,
          objectifLevier: lever.objectifLevier || "",
          axeTaxonomie: lever.axeTaxonomie || [],
          sortOrder:
            normalizeLeverLabel(lever.name) === normalizeLeverLabel("Indicateur de chantier")
              ? 0
              : 1,
        }))
        .sort((a, b) => {
          if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
          return a.name.localeCompare(b.name, "fr");
        });
      const gristIds = [];
      const seen = {};
      for (const lever of sortedLeviers) {
        for (const item of lever.indicators) {
          if (!item.gristId || seen[item.gristId]) continue;
          seen[item.gristId] = true;
          gristIds.push(item.gristId);
        }
      }
      const barometreLevers = sortedLeviers.filter(
        (lever) =>
          normalizeLeverLabel(lever.name) !== normalizeLeverLabel("Indicateur de chantier")
      );
      return {
        name: hat.meta.name,
        id: `cop-${slugify(hat.meta.name)}`,
        gristIds,
        engagementBadges: hat.meta.sector ? [hat.meta.sector] : [],
        remainingEngagements: 0,
        remainingEngagementNames: "",
        indicators: [],
        sortedLeviers,
        descriptionChantier:
          "Indicateurs du baromètre rattachés à ce levier COP.",
        axeTaxonomie: [],
        copMode: true,
        levierCount: barometreLevers.length,
      };
    });
    return {
      name: theme,
      description:
        THEME_DESCRIPTIONS[theme] ||
        "Leviers COP et leviers du baromètre qui n'ont pas encore de correspondance.",
      chantierCount: chantiers.length,
      levierCount: chantiers.reduce((sum, chantier) => sum + chantier.levierCount, 0),
      indicatorCount: chantiers.reduce((sum, chantier) => sum + chantier.gristIds.length, 0),
      engagementLabel: "Secteur",
      chantiers,
    };
  });
}

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

const TERRITOIRE_TIME_PERIOD = {
  date_start: "2015-01-01",
  date_end: "2031-01-01",
};

/**
 * Every baromètre indicator, grouped as leviers COP → leviers du baromètre.
 * A selected region does not remove rows: charts overlay the regional series
 * when one exists.
 */
export async function loadCopTerritoireView(environment = "production") {
  const cacheKey = `territoire:${environment}`;
  if (viewCache.has(cacheKey)) return viewCache.get(cacheKey);

  const navigation = await getNavigationStructure(environment);
  const displaySectors = assembleTerritoireSectors(navigation?.data?.sectors || []);
  const ids = [];
  for (const sector of displaySectors) {
    for (const chantier of sector.chantiers) {
      ids.push(...chantier.gristIds);
    }
  }
  if (ids.length) {
    const response = await getIndicators(
      {
        filter_by: [{ field: "grist_ids", values: ids }],
        time_period: TERRITOIRE_TIME_PERIOD,
      },
      environment
    );
    const byId = {};
    for (const indicator of response.results || []) {
      if (indicator?.id_indic) byId[indicator.id_indic] = buildShellIndicatorRow(indicator);
    }
    for (const sector of displaySectors) {
      for (const chantier of sector.chantiers) {
        chantier.indicators = chantier.gristIds
          .map((id) => byId[id])
          .filter(Boolean);
      }
    }
  }
  const view = { displaySectors };
  viewCache.set(cacheKey, view);
  return view;
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
