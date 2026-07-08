/**
 * Cache session pour les vues shell lourdes (état env, synthèse chantiers).
 * Les données restent en mémoire pour toute la durée de l’onglet, quel que soit le cycle de vie des composants Vue.
 */

import { resolveSectorDescription } from '@/config/sectorMieuxLabels.js';
import { getAllColors, getHexaFromName } from '@/utils.js';
import {
  fetchEngagementLongMapping,
  fetchEngagementsByAxe,
} from './gristDataFetcher.js';
import {
  getNavigationStructure,
  getIndicators,
  getSectorDescriptionsMap,
  isImpactAxe,
  IMPACT_AXE_DISPLAY_ORDER,
  canonicalImpactAxeNomComplet,
  normalizeImpactAxeName,
  impactAxeRetenirHtml,
  impactAxeSlugFromNomComplet,
} from './csvDataService.js';

export const SHELL_VIEW_ETAT = 'etat-environnement';
export const SHELL_VIEW_CHANTIERS = 'chantiers-sectoriels';

const SHELL_INDICATORS_TIME_PERIOD = {
  date_start: '2015-01-01',
  date_end: '2031-01-01',
};

const cacheByEnv = {
  production: Object.create(null),
  staging: Object.create(null),
};

const inflightByEnv = {
  production: Object.create(null),
  staging: Object.create(null),
};

function envKey(environment) {
  return environment === 'staging' ? 'staging' : 'production';
}

export function clearShellViewDataCache() {
  cacheByEnv.production = Object.create(null);
  cacheByEnv.staging = Object.create(null);
  inflightByEnv.production = Object.create(null);
  inflightByEnv.staging = Object.create(null);
}

export function peekShellViewData(viewId, environment = 'production') {
  return cacheByEnv[envKey(environment)][viewId] ?? null;
}

function buildShellIndicatorRow(indicator, engagementLongMap = null) {
  const values = [];
  let targetValue = null;

  if (indicator.date && indicator.values) {
    const years = Array.isArray(indicator.date[0]) ? indicator.date[0] : indicator.date;
    const series = Array.isArray(indicator.values[0]) ? indicator.values[0] : indicator.values;

    if (years.length > 0 && series.length > 0) {
      years.forEach((year, i) => {
        const val = series[i];
        if (val !== null && val !== undefined && !isNaN(val)) {
          values.push(parseFloat(val));
        }
      });
    }
  }

  if (
    indicator.cible !== null &&
    indicator.cible !== undefined &&
    String(indicator.cible).trim() !== '' &&
    !isNaN(indicator.cible)
  ) {
    targetValue = parseFloat(indicator.cible);
  }

  let ecart = null;
  if (targetValue !== null && values.length > 0) {
    const lastValue = values[values.length - 1];
    if (lastValue !== 0 && targetValue !== 0) {
      ecart = ((lastValue - targetValue) / Math.abs(targetValue)) * 100;
    }
  }

  let description = '';
  if (indicator.label_description) {
    description = String(indicator.label_description)
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const unit = indicator.label_unit || indicator.unite;
  const labelBase = indicator.label_indic || 'Indicateur';

  let engagementName;
  if (engagementLongMap) {
    const rawEngagement = indicator.engagement || '';
    engagementName = engagementLongMap.get(rawEngagement) || rawEngagement;
  }

  let legendItems = [];
  const chartType = indicator.type_de_graphique || 'Barres simple';
  const palette = getAllColors();

  if (chartType === 'Barres empilées' || chartType === 'Courbes indépendantes') {
    const sg = indicator.label_sous_groupe;
    const labels = Array.isArray(sg) && sg.length > 1 ? sg.filter(Boolean) : [];
    legendItems = labels.map((lbl, i) => ({
      label: lbl,
      color: getHexaFromName(palette[i] || palette[0]),
    }));
  } else if (chartType === 'Barres simple' && indicator.values?.legend) {
    const leg = indicator.values.legend;
    const colors = indicator.values?.colors;
    if (Array.isArray(leg) && leg.length > 1) {
      legendItems = leg.filter(Boolean).map((lbl, i) => {
        const c =
          Array.isArray(colors) && colors[i]
            ? typeof colors[i] === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(colors[i])
              ? colors[i]
              : getHexaFromName(colors[i])
            : getHexaFromName(palette[i] || palette[0]);
        return { label: String(lbl), color: c };
      });
    }
  }

  const row = {
    label: labelBase,
    labelUnit: unit || '',
    legendItems,
    values,
    targetValue,
    ecart,
    description,
    id: indicator.id_indic,
    rawData: indicator,
  };

  if (engagementLongMap) {
    row.engagementName = engagementName;
  }

  return row;
}

async function loadEtatEnvironnementShellData(environment) {
  const [response, engagementLongMap, engagementByAxe] = await Promise.all([
    getNavigationStructure(environment),
    fetchEngagementLongMapping(),
    fetchEngagementsByAxe(),
  ]);

  if (response.status !== 'success') {
    return { displayAxes: [] };
  }

  const syntheseSector = response.data.sectors.find((s) => s.name === 'Synthèse');
  if (!syntheseSector?.indicateursImpact) {
    return { displayAxes: [] };
  }

  const allGristIds = [];
  const axeStructures = [];
  const mergedImpact = {};

  for (const [axeName, indicators] of Object.entries(syntheseSector.indicateursImpact)) {
    const canonical =
      canonicalImpactAxeNomComplet(axeName) || normalizeImpactAxeName(axeName);
    if (!canonical) continue;
    if (!mergedImpact[canonical]) mergedImpact[canonical] = [];
    mergedImpact[canonical].push(...indicators);
  }

  for (const axeName of IMPACT_AXE_DISPLAY_ORDER) {
    const axeIndicators = mergedImpact[axeName] || [];
    const gristIds = axeIndicators.map((item) => item.gristId).filter(Boolean);
    allGristIds.push(...gristIds);

    axeStructures.push({
      name: axeName,
      slug: impactAxeSlugFromNomComplet(axeName),
      description: impactAxeRetenirHtml(axeName) || '',
      indicatorCount: 0,
      gristIds,
      indicators: [],
      engagement: engagementByAxe.get(axeName) || '',
    });
  }

  if (allGristIds.length > 0) {
    const query = {
      filter_by: [{ field: 'grist_ids', values: allGristIds }],
      time_period: SHELL_INDICATORS_TIME_PERIOD,
    };
    const indicatorResponse = await getIndicators(query, environment);
    const allIndicators = indicatorResponse.results || [];
    const indicatorMap = {};
    allIndicators.forEach((ind) => {
      if (ind.id_indic) indicatorMap[ind.id_indic] = ind;
    });

    for (const axe of axeStructures) {
      axe.indicators = axe.gristIds
        .map((gid) => indicatorMap[gid])
        .filter(Boolean)
        .map((ind) => buildShellIndicatorRow(ind, engagementLongMap));
      axe.indicatorCount = axe.indicators.length;
    }
  }

  for (const axe of axeStructures) {
    if (axe.indicatorCount === undefined) {
      axe.indicatorCount = 0;
    }
  }

  return { displayAxes: axeStructures };
}

async function loadChantiersSyntheseShellData(environment) {
  const response = await getNavigationStructure(environment);
  if (response.status !== 'success') {
    return { displaySectors: [], navigationData: null };
  }

  const navigationData = response.data;
  const sectorDescriptions = await getSectorDescriptionsMap();
  const sectors = response.data.sectors.filter((s) => s.name !== 'Synthèse');
  const allGristIds = [];
  const sectorStructures = [];

  for (const sector of sectors) {
    const chantiers = [];
    const chantierEntries = Object.entries(sector.chantiers || {}).filter(
      ([name]) => !isImpactAxe(name)
    );

    let levierCount = 0;

    for (const [chantierName, chantierData] of chantierEntries) {
      const levierNames = Object.keys(chantierData.leviers || {}).filter(
        (l) =>
          l !== 'Indicateur de chantier' &&
          l !== 'Autres indicateurs' &&
          l !== "Indicateur d'impact - autres"
      );

      levierCount += levierNames.length;

      const chantierIndicators = chantierData.leviers['Indicateur de chantier'] || [];
      const gristIds = chantierIndicators.map((item) => item.gristId).filter(Boolean);
      allGristIds.push(...gristIds);

      const axeTaxonomie = chantierData.axeTaxonomie || [];
      const maxVisible = 4;
      const visibleBadges = axeTaxonomie.slice(0, maxVisible);
      const remainingNames = axeTaxonomie.slice(maxVisible);

      chantiers.push({
        name: chantierName,
        id: chantierName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        gristIds,
        engagementBadges: visibleBadges,
        remainingEngagements: remainingNames.length,
        remainingEngagementNames: remainingNames.join('\n'),
        indicators: [],
        sortedLeviers: chantierData.sortedLeviers || [],
      });
    }

    sectorStructures.push({
      name: sector.name,
      description: resolveSectorDescription(sector.name, sectorDescriptions),
      chantierCount: chantierEntries.length,
      levierCount,
      engagementLabel: 'Axe de la taxonomie',
      chantiers,
    });
  }

  if (allGristIds.length > 0) {
    const query = {
      filter_by: [{ field: 'grist_ids', values: allGristIds }],
      time_period: SHELL_INDICATORS_TIME_PERIOD,
    };
    const indicatorResponse = await getIndicators(query, environment);
    const allIndicators = indicatorResponse.results || [];
    const indicatorMap = {};
    allIndicators.forEach((ind) => {
      if (ind.id_indic) indicatorMap[ind.id_indic] = ind;
    });

    for (const sector of sectorStructures) {
      for (const chantier of sector.chantiers) {
        chantier.indicators = chantier.gristIds
          .map((gid) => indicatorMap[gid])
          .filter(Boolean)
          .map((ind) => buildShellIndicatorRow(ind));
      }
    }
  }

  return { displaySectors: sectorStructures, navigationData };
}

const loaders = {
  [SHELL_VIEW_ETAT]: loadEtatEnvironnementShellData,
  [SHELL_VIEW_CHANTIERS]: loadChantiersSyntheseShellData,
};

export async function ensureShellViewData(viewId, environment = 'production') {
  const env = envKey(environment);
  if (cacheByEnv[env][viewId]) {
    return cacheByEnv[env][viewId];
  }
  if (inflightByEnv[env][viewId]) {
    return inflightByEnv[env][viewId];
  }

  const loader = loaders[viewId];
  if (!loader) {
    throw new Error(`Unknown shell view: ${viewId}`);
  }

  inflightByEnv[env][viewId] = loader(environment)
    .then((result) => {
      cacheByEnv[env][viewId] = result;
      return result;
    })
    .finally(() => {
      inflightByEnv[env][viewId] = null;
    });

  return inflightByEnv[env][viewId];
}

/** Préchauffe toutes les vues shell (données d’affichage, pas seulement getIndicators). */
export async function prewarmShellViewData(environment = 'production') {
  try {
    await Promise.all([
      ensureShellViewData(SHELL_VIEW_ETAT, environment),
      ensureShellViewData(SHELL_VIEW_CHANTIERS, environment),
    ]);
  } catch (error) {
    console.warn('Préchauffage vues shell : échec partiel', error);
  }
}
