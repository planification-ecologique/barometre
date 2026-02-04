/**
 * Écolab Cube API service for region-level indicator data.
 * Base: https://api.indicateurs.ecologie.gouv.fr/cubejs-api/v1
 * Auth: Bearer token (VUE_APP_ECOLAB_API_TOKEN or VUE_ECOLAB_API_TOKEN).
 */

const ECOLAB_BASE = 'https://api.indicateurs.ecologie.gouv.fr/cubejs-api/v1';

function getAuthHeader() {
  const token = process.env.VUE_APP_ECOLAB_API_TOKEN || process.env.VUE_ECOLAB_API_TOKEN;
  if (!token || String(token).trim() === '') {
    console.warn('[Écolab API] VUE_APP_ECOLAB_API_TOKEN is not set. Requests may return 401/403.');
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}

function checkResponse(res, context = '') {
  if (res.status === 401) {
    throw new Error('Token Écolab manquant ou invalide. Vérifiez VUE_APP_ECOLAB_API_TOKEN dans .env et redémarrez le serveur.');
  }
  if (res.status === 403) {
    throw new Error('Accès refusé par l\'API Écolab (403). Vérifiez que le token est valide et a les droits nécessaires.');
  }
  if (!res.ok) {
    throw new Error(`Écolab API ${context}: ${res.status} ${res.statusText}`);
  }
}

let metaCache = null;

/**
 * Known indicator -> cube config when meta doesn't match (e.g. API meta shape differs).
 */
const KNOWN_INDICATOR_CUBES = {
  '949': {
    cubeName: 'residences_principales_energie_region',
    measureName: 'residences_principales_energie_region.id_949',
    timeDimension: 'residences_principales_energie_region.date_mesure'
  }
};

/**
 * Fetch Cube.js meta (cubes, measures, dimensions). Cached.
 * @returns {Promise<{ cubes: Array }>}
 */
export async function getMeta() {
  if (metaCache) return metaCache;
  const res = await fetch(`${ECOLAB_BASE}/meta`, { headers: getAuthHeader() });
  checkResponse(res, 'meta');
  metaCache = await res.json();
  return metaCache;
}

/**
 * Resolve indicator id to (cubeName, measureName, timeDimension?) for region-level data.
 * Uses meta when available, otherwise fallback from KNOWN_INDICATOR_CUBES.
 * @param {{ cubes: Array } | null} meta - From getMeta() (can be null or wrong shape)
 * @param {string} indicatorId - e.g. "949"
 * @returns {{ cubeName: string, measureName: string, timeDimension?: string } | null}
 */
export function resolveRegionCubeForIndicator(meta, indicatorId) {
  const id = String(indicatorId).trim();
  if (!id) return null;
  // Fallback when meta is missing or doesn't match (e.g. Écolab API meta shape)
  const known = KNOWN_INDICATOR_CUBES[id];
  if (known) return known;

  if (!meta?.cubes || !Array.isArray(meta.cubes)) return null;
  const suffix = `.id_${id}`;
  for (const cube of meta.cubes) {
    const cubeName = cube.name;
    const hasRegion = (cube.dimensions || []).some(
      d => d.name === `${cubeName}.libelle_region` || d.name === `${cubeName}.geocode_region`
    );
    if (!hasRegion) continue;
    const measure = (cube.measures || []).find(m => m.name && m.name.endsWith(suffix));
    if (measure) {
      const timeDim = getTimeDimension(meta, cubeName);
      return { cubeName, measureName: measure.name, timeDimension: timeDim || undefined };
    }
  }
  return null;
}

/**
 * Build load query for region data. API expects timeDimensions for this cube to return data.
 * @param {string} cubeName
 * @param {string} measureName
 * @param {{ regionCode?: string, regionLabel?: string, timeDimension?: string, dimensionFilter?: { dimension: string, value: string } }} options
 */
function buildRegionQuery(cubeName, measureName, options = {}) {
  const dimensions = [
    `${cubeName}.libelle_region`,
    `${cubeName}.geocode_region`
  ];
  const query = {
    measures: [measureName],
    dimensions,
    limit: 1000,
    timezone: 'UTC'
  };
  if (options.timeDimension) {
    query.timeDimensions = [{ dimension: options.timeDimension, granularity: 'year' }];
  }
  const filters = [];
  if (options.regionCode) {
    filters.push({ member: `${cubeName}.geocode_region`, operator: 'equals', values: [options.regionCode] });
  } else if (options.regionLabel) {
    filters.push({ member: `${cubeName}.libelle_region`, operator: 'equals', values: [options.regionLabel] });
  }
  if (options.dimensionFilter) {
    filters.push({ member: options.dimensionFilter.dimension, operator: 'equals', values: [options.dimensionFilter.value] });
  }
  if (filters.length) query.filters = filters;
  return query;
}

/**
 * Load region-level data (all regions or filtered by region).
 * Pass timeDimension so the API returns data (Écolab requires timeDimensions for this cube).
 * @param {string} cubeName
 * @param {string} measureName
 * @param {{ regionCode?: string, regionLabel?: string, timeDimension?: string }} options - Optional filter and time dimension
 * @returns {Promise<{ data: Array }>}
 */
export async function loadRegionData(cubeName, measureName, options = {}) {
  const query = buildRegionQuery(cubeName, measureName, options);
  const res = await fetch(`${ECOLAB_BASE}/load`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ query })
  });
  checkResponse(res, 'load');
  return res.json();
}

/**
 * Get list of regions for an indicator (from first load without filter).
 * Pass timeDimension so the API returns data (required for Écolab cube).
 * @param {string} cubeName
 * @param {string} measureName
 * @param {string} [timeDimension] - e.g. "residences_principales_energie_region.date_mesure"
 * @returns {Promise<Array<{ geocode_region: string, libelle_region: string }>>}
 */
export async function getRegionsList(cubeName, measureName, timeDimension) {
  const result = await loadRegionData(cubeName, measureName, { timeDimension });
  const data = result?.data || [];
  const keyLabel = `${cubeName}.libelle_region`;
  const keyGeocode = `${cubeName}.geocode_region`;
  const byGeocode = new Map();
  data.forEach(row => {
    const geocode = row[keyGeocode] ?? row['geocode_region'];
    const label = row[keyLabel] ?? row['libelle_region'];
    if (geocode && label && !byGeocode.has(geocode)) byGeocode.set(geocode, { geocode_region: geocode, libelle_region: label });
  });
  return Array.from(byGeocode.values()).sort((a, b) => a.libelle_region.localeCompare(b.libelle_region, 'fr'));
}

/** Time-like dimension name patterns (cube-relative). */
const TIME_DIM_PATTERNS = ['annee', 'année', 'year', 'date', 'annee_cible', 'annee_donnees', 'date_mesure'];

/**
 * Find a time/year dimension in a cube for ordering series.
 * @param {{ cubes: Array }} meta
 * @param {string} cubeName
 * @returns {string | null} Full dimension name (e.g. "cube.date_mesure") or null
 */
export function getTimeDimension(meta, cubeName) {
  const cube = (meta?.cubes || []).find(c => c.name === cubeName);
  const dims = cube?.dimensions || [];
  for (const d of dims) {
    const short = (d.name || '').replace(`${cubeName}.`, '').toLowerCase();
    if (TIME_DIM_PATTERNS.some(p => short === p || short.includes(p))) return d.name;
  }
  return null;
}

/**
 * Load region-level data with optional time dimension (for chart time series).
 * Uses timeDimensions in query so API returns data (Écolab format).
 * @param {string} cubeName
 * @param {string} measureName
 * @param {{ regionCode?: string, timeDimension?: string, dimensionFilter?: { dimension: string, value: string } }} options
 * @returns {Promise<{ data: Array }>}
 */
export async function loadRegionDataForChart(cubeName, measureName, options = {}) {
  const query = buildRegionQuery(cubeName, measureName, {
    regionCode: options.regionCode,
    timeDimension: options.timeDimension,
    dimensionFilter: options.dimensionFilter
  });
  query.limit = 5000;
  if (options.timeDimension) {
    query.order = { [options.timeDimension]: 'asc' };
  }
  const res = await fetch(`${ECOLAB_BASE}/load`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ query })
  });
  checkResponse(res, 'load');
  return res.json();
}

/** Extract year from API time value (e.g. "2023-01-01T00:00:00.000" -> "2023"). */
function yearFromTimeValue(val) {
  if (val == null) return null;
  const s = String(val);
  const m = s.match(/^(\d{4})/);
  return m ? m[1] : s;
}

/**
 * Fetch regional chart data for one indicator and one region.
 * Returns shape compatible with GraphBox "Barres simple": { x, y, legend, regionLabel }.
 * API returns time as date_mesure.year with ISO date string; we aggregate by year.
 * @param {string} indicatorId - e.g. "949"
 * @param {string} regionCode - e.g. "84"
 * @returns {Promise<{ x: string[], y: number[][], legend: string[], regionLabel: string }>}
 */
export async function getRegionChartData(indicatorId, regionCode) {
  const meta = await getMeta();
  const resolved = resolveRegionCubeForIndicator(meta, indicatorId);
  if (!resolved) throw new Error('Indicateur non trouvé dans l\'API Écolab. ID: ' + indicatorId);
  const { cubeName, measureName, timeDimension: resolvedTimeDim } = resolved;
  const timeDim = resolvedTimeDim || getTimeDimension(meta, cubeName);
  const result = await loadRegionDataForChart(cubeName, measureName, {
    regionCode,
    timeDimension: timeDim || undefined
  });
  const data = result?.data || [];
  const keyLabel = `${cubeName}.libelle_region`;
  const keyGeocode = `${cubeName}.geocode_region`;
  const measureKey = measureName;
  // API returns time with granularity year as "cube.date_mesure.year" with value like "2023-01-01T00:00:00.000"
  const keyTime = timeDim ? `${timeDim}.year` : null;
  const keyTimeAlt = timeDim || null;

  const byTime = new Map();
  let regionLabel = '';
  data.forEach(row => {
    const label = row[keyLabel] ?? row['libelle_region'];
    const geocode = row[keyGeocode] ?? row['geocode_region'];
    if (geocode) regionLabel = label || regionLabel;
    const rawTime = keyTime ? (row[keyTime] ?? row[keyTimeAlt]) : null;
    const t = rawTime != null ? yearFromTimeValue(rawTime) : 'Valeur';
    const v = row[measureKey];
    if (v != null && (typeof v === 'number' || (typeof v === 'string' && String(v).trim() !== ''))) {
      const num = typeof v === 'number' ? v : parseFloat(String(v).replace(/\s/g, '').replace(',', '.'));
      if (!Number.isNaN(num)) byTime.set(t, num);
    }
  });
  const sortedTimes = Array.from(byTime.keys()).sort((a, b) => {
    const na = Number(a);
    const nb = Number(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    return String(a).localeCompare(String(b));
  });
  const x = sortedTimes.map(t => String(t));
  const y = [sortedTimes.map(t => byTime.get(t))];
  const legend = ['Historique'];
  return { x, y, legend, regionLabel: regionLabel || 'Région' };
}

/**
 * Load all-region data for an indicator in a single call.
 * Returns raw rows plus cube metadata and any extra dimension after region.
 * @param {string} indicatorId
 * @returns {Promise<{ cubeName: string, measureName: string, timeDimension: string | null, extraDimension: string | null, data: Array }>}
 */
export async function loadAllRegionsDataForIndicator(indicatorId) {
  const meta = await getMeta();
  const resolved = resolveRegionCubeForIndicator(meta, indicatorId);
  if (!resolved) throw new Error('Indicateur non trouvé dans l\'API Écolab. ID: ' + indicatorId);
  const { cubeName, measureName, timeDimension: resolvedTimeDim } = resolved;
  const timeDim = resolvedTimeDim || getTimeDimension(meta, cubeName);
  const result = await loadRegionDataForChart(cubeName, measureName, {
    timeDimension: timeDim || undefined
  });
  const data = result?.data || [];

  // Detect extra dimension (e.g. energie) after region dimensions
  let extraDimension = null;
  const cube = (meta?.cubes || []).find(c => c.name === cubeName);
  if (cube && Array.isArray(cube.dimensions)) {
    for (const d of cube.dimensions) {
      const name = d.name;
      if (!name || typeof name !== 'string') continue;
      if (name === `${cubeName}.libelle_region`) continue;
      if (name === `${cubeName}.geocode_region`) continue;
      if (timeDim && (name === timeDim || name === `${timeDim}.year`)) continue;
      extraDimension = name;
      break;
    }
  }

  const measureAnnotation = result?.annotation?.measures?.[measureName] || null;
  const measureMeta = measureAnnotation && measureAnnotation.meta ? measureAnnotation.meta : null;

  return {
    cubeName,
    measureName,
    timeDimension: timeDim || null,
    extraDimension,
    data,
    measureMeta
  };
}

// Default export for bundlers that expect it (avoids "Cannot read properties of undefined (reading 'default')")
export default {
  getMeta,
  resolveRegionCubeForIndicator,
  getRegionsList,
  getTimeDimension,
  loadRegionData,
  loadRegionDataForChart,
  getRegionChartData,
  loadAllRegionsDataForIndicator
};
