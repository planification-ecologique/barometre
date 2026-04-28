import unitDict from '@/utils/unit_dict.json';
import { getDefaultSeriesPaletteToken } from './chartColorTestOverrides.js';
import {
  fetchIndicatorsData,
  fetchLeviersData,
  fetchChantiersData,
  fetchEngagementsByAxe,
  fetchEngagementLongMapping,
  fetchTaxonomieData,
  setStagingDocId as setStagingDocIdInFetcher,
  GRIST_URLS,
  GRIST_LEVIERS_URL
} from './gristDataFetcher';

// Re-export URL constants for backward compatibility
export { GRIST_URLS, GRIST_LEVIERS_URL, fetchEngagementsByAxe, fetchEngagementLongMapping };

/**
 * Formats a number for display using scientific notation when needed
 * @param {Number} value - The number to format
 * @returns {String} - Formatted number string
 */
function getScientificNotation(value) {
  if (value === undefined || value === null) return '';
  
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check if it's a valid number
  if (isNaN(numValue)) return '';
  
  // Format large numbers or small decimals with scientific notation
  if (Math.abs(numValue) >= 1e6 || (Math.abs(numValue) < 0.001 && Math.abs(numValue) > 0)) {
    return numValue.toExponential(2);
  }
  
  // Otherwise return with standard formatting
  return numValue.toString();
}

/**
 * Transforms unit strings to use proper scientific notation with subscripts
 * @param {String} unit - The unit string to transform
 * @returns {String} - Unit with proper scientific notation
 */
function formatScientificNotation(unit) {
  if (!unit || unit === 'nan') return '';
  
  return unit
    .replace(/CO2/g, 'CO₂')
    .replace(/CH4/g, 'CH₄')
    .replace(/N2O/g, 'N₂O')
    .replace(/NH3/g, 'NH₃')
    .replace(/SO2/g, 'SO₂');
}

/**
 * Parse IRPE_ids or "ID Indicateur hub Ecolab" column to array of indicator ids for Écolab API.
 * @param {string} raw - Raw value (e.g. "949", "949, 254", or "id_949")
 * @returns {string[]} - Non-empty id strings (e.g. ["949", "254"])
 */
/**
 * Normalizes raw label/status to internal status for logic (mesuré, projection, cible).
 * Display: year for measured, "cible" for targets.
 * Legacy format: label columns with "mesuré", "projection", "cible" still supported.
 * @param {string} rawLabel - Raw label from CSV or status display
 * @param {string} yearStr - Year string for fallback
 * @returns {'mesuré'|'projection'|'cible'}
 */
function normalizeStatusForLogic(rawLabel, yearStr) {
  if (!rawLabel || String(rawLabel).trim() === '') {
    return yearStr === '2030' ? 'cible' : 'mesuré';
  }
  const s = String(rawLabel).trim();
  const lower = s.toLowerCase();
  if (/^cible_\d{4}$/.test(lower) || lower === 'cible') return 'cible';
  if (/^\d{4}$/.test(lower) || lower === 'mesuré') return 'mesuré';
  if (lower === 'projection') return 'projection';
  return 'mesuré';
}

/**
 * Normalizes raw status to display label for table/CSV: "mesuré", "projection", "cible".
 * Replaces raw year strings (e.g. "2020") with proper labels.
 */
function normalizeStatusForDisplay(rawLabel, yearStr) {
  const logic = normalizeStatusForLogic(rawLabel, yearStr);
  if (logic === 'cible') return 'cible';
  if (logic === 'projection') return 'projection';
  const currentYear = new Date().getFullYear();
  return parseInt(yearStr, 10) <= currentYear ? 'mesuré' : 'projection';
}

/** Strip accents for accent-insensitive search. "déchets" → "dechets" */
function stripAccents(str) {
  if (!str || typeof str !== 'string') return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function parseIrpeIds(raw, valid) {
  // If the IRPE is not provided, return an empty array
  if (raw == null || String(raw).trim() === '' || String(raw).toLowerCase() === 'nan') {
    return [];
  }
  // If the IRPE is not marked valid, return an empty array
  if (
    valid == null || String(valid).trim() === '' ||
    String(valid).toLowerCase() === 'nan' ||
    String(valid).toLowerCase() !== 'true'
  ) {
    return [];
  }
  const ids = String(raw)
    .split(/[,;]/)
    .map(s => s.replace(/^id_/i, '').trim())
    .filter(Boolean);
  return ids;
}

// Parsed CSV cache per environment (production vs staging may diverge in config)
const csvDataCacheByEnv = {};
const fetchPromiseByEnv = {};

// Cache for the separate leviers list (Liste_leviers)
let levierListCache = null;
let levierFetchPromise = null;

/** When false, extrapolation (projection) series is excluded from chart data. */
export const SHOW_EXTRAPOLATION = false;

/** Colonnes CSV année (ex. 2010, 2017) : borne basse pour l’ingestion. */
export const YEAR_COLUMN_MIN = 2010;
/** Colonnes CSV année : borne haute (alignée traitement existant 2030 + cibles). */
export const YEAR_COLUMN_MAX = 2030;
/**
 * Colonnes d’année : on ingère d’abord [YEAR_AXIS_PIVOT … YEAR_COLUMN_MAX].
 * Année pivot avant laquelle l’historique gauche est optionnel.
 */
export const YEAR_AXIS_PIVOT = 2018;
/**
 * Seuil de mesures (colonnes année **hors** cibles) avec année ≥ YEAR_AXIS_PIVOT.
 * Strictement sous ce nombre → on ingère aussi les colonnes YEAR_COLUMN_MIN … YEAR_AXIS_PIVOT-1 (« expand left »).
 * Au-delà ou égal → on ne lit pas cette plage ancienne → graphiques résents sans traîner tout l’historique CSV.
 */
export const MEASURED_YEARS_DENSE_THRESHOLD = 5;

/**
 * Fetches parsed CSV data from Grist
 * Uses gristDataFetcher for downloading and parsing
 * @param {string} environment - Environment to use (production or staging)
 * @returns {Promise} - Promise resolving to parsed CSV data
 */
export async function fetchCSVData(environment = 'production') {
  const env = environment || 'production';
  if (csvDataCacheByEnv[env]) {
    return csvDataCacheByEnv[env];
  }
  if (fetchPromiseByEnv[env]) {
    return fetchPromiseByEnv[env];
  }

  fetchPromiseByEnv[env] = (async () => {
    try {
      const parsedData = await fetchIndicatorsData(env);
      csvDataCacheByEnv[env] = parsedData;
      fetchPromiseByEnv[env] = null;
      return parsedData;
    } catch (error) {
      fetchPromiseByEnv[env] = null;
      throw error;
    }
  })();

  return fetchPromiseByEnv[env];
}

// Function to clear the cache (useful for testing or forcing a refresh)
export function clearCSVCache() {
  Object.keys(csvDataCacheByEnv).forEach((k) => {
    delete csvDataCacheByEnv[k];
  });
  Object.keys(fetchPromiseByEnv).forEach((k) => {
    delete fetchPromiseByEnv[k];
  });
}

/**
 * Fetch parsed leviers list from Grist
 * Uses gristDataFetcher for downloading and parsing
 * @returns {Promise<Array>} - Parsed CSV rows
 */
export async function fetchLevierList() {
  // If we already have cached data, return it
  if (levierListCache) {
    return levierListCache;
  }

  // If we're already fetching, return the existing promise
  if (levierFetchPromise) {
    return levierFetchPromise;
  }

  // Fetch parsed data using the fetcher service
  levierFetchPromise = (async () => {
    try {
      const parsedData = await fetchLeviersData();
      
      // Cache the results
      levierListCache = parsedData;
      levierFetchPromise = null;
      return parsedData;
    } catch (error) {
      // Clear the fetch promise on error
      levierFetchPromise = null;
      throw error;
    }
  })();

  return levierFetchPromise;
}

/**
 * Updates the staging Grist document URL
 * @param {String} docId - The new staging document ID
 */
export function setStagingDocId(docId) {
  setStagingDocIdInFetcher(docId);
  // Clear cache to ensure using new URL
  clearCSVCache();
}

/**
 * Parse the "Chantier ou Impact" column into a list of { sector, chantierOuImpact } pairs.
 * The Grist column can now contain multiple values (one per line, optionally separated by ";").
 * @param {String} value - The raw column value
 * @returns {Array<{ sector: string|null, chantierOuImpact: string|null }>}
 */
function parseChantierOuImpactList(value) {
  if (!value || value === 'nan') {
    return [];
  }
  // Split into entries:
  // - primarily on new lines (multi-select from Grist)
  // - accept ";" as a secondary separator if present
  // - and split on ", " only when the remainder clearly starts a new
  //   "sector / chantier" pair (we detect a "/" later in the remainder),
  //   to avoid splitting inside labels such as "(pollution lumineuse, EEEE)".
  const rawEntries = value
    .split(/[\r\n]+/) // first, split on real line breaks
    .flatMap(entry => entry.split(';')) // then on ';' inside each line
    .flatMap(entry => entry.split(/,\s+(?=[^/]+\/)/)) // then on ", " only if a "/" follows somewhere
    .map(entry => entry.trim())
    .filter(Boolean);

  const results = [];

  const cleanPart = (str) => {
    if (!str) return '';
    // Remove surrounding quotes and extra spaces
    let cleaned = str.replace(/^[\s"']+|[\s"']+$/g, '').trim();
    // Handle values like ""Texte"" coming from CSV escaping
    cleaned = cleaned.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1').trim();
    return cleaned;
  };

  rawEntries.forEach(entry => {
    // Normalize slashes and whitespace inside each entry
    let line = entry.replace(/\s*\/\s*/g, ' / ');
    line = line.replace(/\s+/g, ' ').trim();
    if (!line) return;

    const parts = line.split(' / ');

    if (parts.length >= 2) {
      results.push({
        sector: cleanPart(parts[0]),
        chantierOuImpact: cleanPart(parts.slice(1).join(' / '))
      });
    } else {
      results.push({
        sector: cleanPart(parts[0]),
        chantierOuImpact: null
      });
    }
  });

  return results;
}

/**
 * Internal helper to get a single { sector, chantierOuImpact } pair
 * from the "Chantier ou Impact" column (uses the first entry when multiple exist).
 * @param {String} value - The raw column value
 * @returns {Object} - { sector, chantierOuImpact }
 */
function parseChantierOuImpactInternal(value) {
  const list = parseChantierOuImpactList(value);
  if (!list || list.length === 0) {
    return { sector: null, chantierOuImpact: null };
  }
  return list[0];
}

/**
 * Transforms CSV data to match the API response format
 * @param {Array} csvData - Raw CSV data
 * @param {Object} query - Query parameters (similar to API request)
 * @returns {Object} - Data in API response format
 */
export function transformCSVData(csvData, query) {
  let filteredData = csvData;
  
  // Apply structural filters early (theme, levier, grist_ids) - these filter at the item level
  // Search and tag filters will be applied after grouping to ensure complete charts
  if (query.filter_by) {
    for (const filter of query.filter_by) {
      if (filter.field === 'id_theme' && filter.values.length) {
        filteredData = filteredData.filter(item => item.Indicateurs_Onglet === filter.values[0]);
      } else if (filter.field === 'id_levier' && filter.values.length) {
        filteredData = filteredData.filter(item => item['Indicateurs_Sous-onglet'] === filter.values[0]);
      } else if (filter.field === 'sector' && filter.values.length) {
        const targetSectors = new Set(filter.values);
        filteredData = filteredData.filter(item => {
          const associations = parseChantierOuImpactList(item['Chantier ou Impact'] || '');
          if (!associations || associations.length === 0) return false;
          return associations.some(p => p.sector && targetSectors.has(p.sector));
        });
      } else if (filter.field === 'chantier_ou_impact' && filter.values.length) {
        const targetValues = new Set(
          filter.values.map((v) => canonicalImpactAxeNomComplet(v) || normalizeImpactAxeName(v))
        );
        filteredData = filteredData.filter(item => {
          const associations = parseChantierOuImpactList(item['Chantier ou Impact'] || '');
          if (!associations || associations.length === 0) return false;
          return associations.some(p => {
            if (!p.chantierOuImpact) return false;
            const canon =
              canonicalImpactAxeNomComplet(p.chantierOuImpact) ||
              normalizeImpactAxeName(p.chantierOuImpact);
            return (
              targetValues.has(canon) ||
              targetValues.has(p.chantierOuImpact) ||
              targetValues.has(normalizeImpactAxeName(p.chantierOuImpact))
            );
          });
        });
      } else if (filter.field === 'grist_ids') {
        // Filter by Grist indicator IDs (for engagements, chantiers, leviers)
        // If values is empty, return empty array (no matches)
        if (!filter.values || filter.values.length === 0) {
          filteredData = [];
        } else {
          const gristIds = Array.isArray(filter.values) ? filter.values : [filter.values];
          const gristIdSet = new Set(gristIds.map((id) => String(id)));

          // First, find all matching rows by ID
          const matchedRows = filteredData.filter(item => {
            const itemId = item.ID;
            return itemId != null && gristIdSet.has(String(itemId));
          });
          
          // Then, get all indicator names from matched rows (to handle multi-line charts)
          const matchedIndicatorNames = new Set(matchedRows.map(item => item.Indicateur).filter(name => name));
          
          // Finally, include ALL rows that either match by ID OR share the same indicator name
          // This ensures multi-line charts (with sub-groups) get all their data
          filteredData = filteredData.filter(item => {
            const itemId = item.ID;
            const indicatorName = item.Indicateur;

            // Include if ID matches directly
            if (itemId != null && gristIdSet.has(String(itemId))) {
              return true;
            }
            
            // Include if indicator name matches a selected indicator (for multi-line charts)
            if (indicatorName && matchedIndicatorNames.has(indicatorName)) {
              return true;
            }
            
            return false;
          });
        }
      }
      // Note: label_tags and search filters are applied after grouping (see below)
    }
  }

  // Filter out items marked for deletion in V1
  filteredData = filteredData.filter(item => item['A supprimer de la V1'] !== 'true');

  // Sort by order
  filteredData.sort((a, b) => parseInt(a.Ordre) - parseInt(b.Ordre));

  const validateTransformedIndicatorShape = (indicator) => {
    try {
      const type = indicator.type_de_graphique || 'Barres simple';
      const title = indicator.label_indic || 'Indicateur inconnu';
      const id = indicator.id_indic || 'n/a';

      if (type === 'Barres simple') {
        const values = indicator.values;
        const ok = values && Array.isArray(values.x) && Array.isArray(values.y);
        if (!ok) {
          console.error(
            `[CSV transform] Invalid shape for "Barres simple" on "${title}" (id: ${id}). Expected values.x[] and values.y[].`,
            { indicator }
          );
        }
        return;
      }

      if (type === 'Barres empilées' || type === 'Courbes indépendantes') {
        const ok = Array.isArray(indicator.date) && Array.isArray(indicator.values);
        if (!ok) {
          console.error(
            `[CSV transform] Invalid shape for "${type}" on "${title}" (id: ${id}). Expected date[] and values[].`,
            { indicator }
          );
        }
      }
    } catch (e) {
      console.error('[CSV transform] Error while validating indicator shape.', e);
    }
  };

  // Transform to API response format
  const results = filteredData.map(item => {
    // Extract years and values from columns.
    // Year columns = measured; cible_XXXX columns = targets.
    // Status from projection_YYYY or label_YYYY (deprecated).
    const dataPoints = new Map(); // yearStr -> { value, statusDisplay }

    const parseVal = (raw) => {
      if (raw === undefined || raw === null || raw === '') return null;
      const s = String(raw).trim().replace(/\s/g, '');
      if (!s || ['na', 'nan'].includes(s.toLowerCase())) return null;
      const num = Number(s.replace(',', '.'));
      return isNaN(num) ? null : parseFloat(parseFloat(num).toFixed(2));
    };

    const isValidValue = (numVal, hasExplicitMarker) => !(numVal === 0 && !hasExplicitMarker);

    // Helper: get status from projection_YYYY (label_YYYY deprecated)
    const getStatusDisplay = (yearStr) => {
      const raw = item[`label_${yearStr}`] || item[`projection_${yearStr}`] || '';
      const s = String(raw).trim();
      return s || yearStr;
    };

    const hasExplicitMarker = (yearStr) => {
      const raw = item[`label_${yearStr}`] || item[`projection_${yearStr}`] || '';
      return raw != null && String(raw).trim() !== '';
    };

    const ingestMeasuredYearColumn = (yearStr) => {
      const rawVal = item[yearStr];
      const numVal = parseVal(rawVal);
      const hasMarker = hasExplicitMarker(yearStr) || numVal !== null;
      if (numVal !== null && isValidValue(numVal, hasMarker)) {
        const statusDisplay = getStatusDisplay(yearStr);
        dataPoints.set(yearStr, { value: numVal, statusDisplay });
      }
    };

    // 1a. Toujours : colonnes [pivot … YEAR_COLUMN_MAX] (mesures / projection depuis colonnes année)
    for (let i = YEAR_AXIS_PIVOT; i <= YEAR_COLUMN_MAX; i++) {
      ingestMeasuredYearColumn(i.toString());
    }

    let measuredCountFromPivot = 0;
    for (const yStr of dataPoints.keys()) {
      const y = parseInt(yStr, 10);
      if (!Number.isNaN(y) && y >= YEAR_AXIS_PIVOT) measuredCountFromPivot += 1;
    }

    // 1b. Colonnes &lt; pivot : seulement si « sparse » depuis le pivot (cibles encore exclues)
    if (measuredCountFromPivot < MEASURED_YEARS_DENSE_THRESHOLD) {
      for (let i = YEAR_COLUMN_MIN; i < YEAR_AXIS_PIVOT; i++) {
        ingestMeasuredYearColumn(i.toString());
      }
    }

    // Years with measured data (year columns only) — avant fusion cibles
    const yearsWithMeasured = new Set(dataPoints.keys());

    // 2. cible_XXXX columns (cible_2030, cible_2028, etc.) = target data
    // Store targets separately so years with BOTH measured and target show both (bar + line)
    const targetValuesByYear = {};
    Object.keys(item).forEach((key) => {
      const m = key.match(/^cible_(\d{4})$/i);
      if (m) {
        const yearStr = m[1];
        const numVal = parseVal(item[key]);
        if (numVal !== null) {
          targetValuesByYear[yearStr] = numVal;
          // Only add to dataPoints when year has no measured data (target-only years)
          if (!dataPoints.has(yearStr)) {
            dataPoints.set(yearStr, { value: numVal, statusDisplay: 'cible' });
          }
        }
      }
    });

    // Build sorted year axis: union of measured years and target years
    const allYearNumbers = new Set([
      ...Array.from(dataPoints.keys()).map((y) => parseInt(y, 10)),
      ...Object.keys(targetValuesByYear).map((y) => parseInt(y, 10))
    ]);
    const allYears = Array.from(allYearNumbers).sort((a, b) => a - b);
    const minYearRaw = allYears.length > 0 ? allYears[0] : YEAR_AXIS_PIVOT;
    const maxYear = allYears.length > 0 ? allYears[allYears.length - 1] : 2030;

    const minYear = minYearRaw;

    const years = [];
    const values = [];
    const statuses = [];

    for (let y = minYear; y <= maxYear; y++) {
      const yearStr = y.toString();
      years.push(yearStr);
      const pt = dataPoints.get(yearStr);
      if (pt) {
        values.push(pt.value);
        statuses.push(normalizeStatusForDisplay(pt.statusDisplay, yearStr));
      } else {
        values.push(null);
        statuses.push('');
      }
    }

    const targetYear = '2030';
    const targetValue = item[targetYear] || item['cible_2030'] || '';
    const targetValueNumeric = parseVal(targetValue);
    const targetValueIsNumeric = targetValueNumeric !== null;

    // Ensure 2030 is in the chart when we have a target (so target segment can be drawn)
    if (targetValueNumeric !== null && !years.includes(targetYear)) {
      years.push(targetYear);
      values.push(targetValueNumeric);
      statuses.push('cible');
    }

    // Determine series for chart display
    const { y, legend, colors } = getSeries(values, years, statuses, targetYear, targetValue);
    // Use unitDict to get the shortened unit representation and apply scientific notation
    const unitLong = item.Unité || '';
    let unitShort = unitDict[unitLong] || unitLong;
    
    // Apply scientific notation formatting to both long and short unit formats
    const formattedUnitLong = formatScientificNotation(unitLong);
    const formattedUnitShort = formatScientificNotation(unitShort);

    // Determine chart type
    const chartType = item['Type de graphique'] || determineChartType(item);
    // Some rows have a subgroup label while still being "Barres simple".
    // In that case, keep simple-series shape to avoid grouped-series mismatch in GraphBox.
    const rawSubGroup = item['Sous-niveau (graphique)'] || '';
    const normalizedSubGroup = chartType === 'Barres simple' ? '' : rawSubGroup;
    
    // Add a NB for targets being adjusted.
    let nbNote = ''
    if (
      item['MAJ cible'] && [
        "Cible en cours d'ajustement - SNBC",
        "Cible en cours d'ajustement - autre"
      ].includes(item['MAJ cible'])
    ) {
      nbNote = "</br>NB : Des travaux sont en cours et pourraient légèrement modifier la cible dans les mois qui viennent (ex : SNBC 3)";
    }

    // Parse the "Chantier ou Impact" column
    const chantierOuImpactRaw = item['Chantier ou Impact'] || '';
    const chantierOuImpactList = parseChantierOuImpactList(chantierOuImpactRaw);
    const parsedChantierOuImpact = chantierOuImpactList[0] || { sector: null, chantierOuImpact: null };

    // Target trajectory: line from reference year through all target years, with dots at targets
    // Uses "Année de référence de la source" column; falls back to last measured year if absent
    let targetTrajectory = null;
    const refYearRaw = item['Année de référence de la source'];
    const refYearStr = refYearRaw != null ? String(refYearRaw).trim() : '';
    const refYearParsed = refYearStr && /^\d{4}$/.test(refYearStr) ? refYearStr : null;

    let refYearIdx = -1;
    let refYearValue = null; // Value at ref year for trajectory start (may need fallback)
    if (refYearParsed) {
      const idx = years.indexOf(refYearParsed);
      if (idx >= 0) {
        refYearIdx = idx;
        refYearValue = (values[idx] != null && !isNaN(values[idx])) ? values[idx] : null;
      }
    }
    if (refYearIdx < 0) {
      for (let i = 0; i < statuses.length; i++) {
        const v = values[i];
        if (normalizeStatusForLogic(statuses[i] || '', years[i]) === 'mesuré' && v != null && !isNaN(v)) {
          refYearIdx = i;
          refYearValue = v;
        }
      }
    }
    // When ref year has no data: use last available year with a measurement as trajectory start
    // (otherwise the target line starts from nothing, e.g. "Volume de déchets ménagers valorisés matière")
    if (refYearIdx >= 0 && refYearValue == null) {
      for (let i = values.length - 1; i >= 0; i--) {
        const v = values[i];
        if (normalizeStatusForLogic(statuses[i] || '', years[i]) === 'mesuré' && v != null && !isNaN(v)) {
          refYearIdx = i;
          refYearValue = v;
          break;
        }
      }
      if (refYearValue == null) refYearValue = 0;
    }

    // Target trajectory: use targetValuesByYear for target points (so years with both
    // measured + target show bar from measured, line from target)
    const targetYearsSorted = Object.keys(targetValuesByYear)
      .map((y) => parseInt(y, 10))
      .sort((a, b) => a - b);
    const refYearNum = refYearIdx >= 0 ? parseInt(years[refYearIdx], 10) : null;
    const firstTargetYear = targetYearsSorted[0];
    const firstTargetEqualsRef = firstTargetYear != null && firstTargetYear === refYearNum;
    const firstTargetHasMeasured = firstTargetYear != null && yearsWithMeasured.has(firstTargetYear.toString());
    const firstTargetAfterRef = targetYearsSorted.find((y) => y > refYearNum);

    let points = [];
    if (targetYearsSorted.length >= 2) {
      if (firstTargetEqualsRef && firstTargetHasMeasured) {
        // When ref year is also the first target and has measured data: start line along target data only
        points = targetYearsSorted
          .map((y) => ({
            year: y.toString(),
            value: targetValuesByYear[y.toString()],
            isTarget: true
          }))
          .filter((p) => p.value != null && !isNaN(p.value));
      } else if (refYearIdx >= 0 && firstTargetAfterRef != null && refYearValue != null && !isNaN(refYearValue)) {
        // Start from reference year through targets after ref
        const refYearStr = years[refYearIdx];
        const refHasTarget = targetValuesByYear[refYearStr] != null && !isNaN(targetValuesByYear[refYearStr]);
        points = [
          { year: refYearStr, value: refYearValue, isTarget: refHasTarget }
        ];
        targetYearsSorted.forEach((y) => {
          if (y > refYearNum) {
            const val = targetValuesByYear[y.toString()];
            if (val != null && !isNaN(val)) {
              points.push({ year: y.toString(), value: val, isTarget: true });
            }
          }
        });
      } else if (refYearIdx < 0 && targetYearsSorted.length >= 2) {
        // Ref year not in chart: start from first target
        points = targetYearsSorted
          .map((y) => ({
            year: y.toString(),
            value: targetValuesByYear[y.toString()],
            isTarget: true
          }))
          .filter((p) => p.value != null && !isNaN(p.value));
      }
    } else if (targetYearsSorted.length === 1 && refYearIdx >= 0 && refYearNum != null) {
      // Single target (e.g. only cible_2030): draw line from reference year to that target
      const singleTargetYear = targetYearsSorted[0];
      if (singleTargetYear > refYearNum) {
        const refYearStr = years[refYearIdx];
        const refHasTarget = targetValuesByYear[refYearStr] != null && !isNaN(targetValuesByYear[refYearStr]);
        const targetVal = targetValuesByYear[singleTargetYear.toString()];
        if (refYearValue != null && !isNaN(refYearValue) && targetVal != null && !isNaN(targetVal)) {
          points = [
            { year: refYearStr, value: refYearValue, isTarget: refHasTarget },
            { year: singleTargetYear.toString(), value: targetVal, isTarget: true }
          ];
        }
      }
    } else if (targetYearsSorted.length === 1 && refYearIdx < 0) {
      // Single target, no ref in chart: just the target point (no line, but we need 2 points for a segment)
      // Skip - cannot draw a line with one point
    }

    if (points.length >= 2) {
      targetTrajectory = { points };
    }
    
    // Dernière valeur: last "mesuré" (measured) data point with a valid value
    let valeur_actuelle = null;
    let date_valeur_actuelle = null;
    for (let i = values.length - 1; i >= 0; i--) {
      const status = normalizeStatusForLogic(statuses[i] || '', years[i]);
      if (status === 'mesuré') {
        const v = values[i];
        if (v != null && !isNaN(v)) {
          valeur_actuelle = v;
          date_valeur_actuelle = years[i] || null;
          break;
        }
      }
    }
    // Cible 2030: value at 2030 when valid
    const idx2030ForCible = years.indexOf(targetYear);
    const objectif_valeur_cible = (idx2030ForCible >= 0 && values[idx2030ForCible] != null && !isNaN(values[idx2030ForCible]))
      ? values[idx2030ForCible]
      : null;

    // Table rows: allow same year twice when it has both measured and target; include 0 as valid data
    const tableAnnee = [];
    const tableValeur = [];
    const tableTypeMesure = [];
    const hasValue = (v) => v != null && !isNaN(v);
    for (let i = 0; i < years.length; i++) {
      const yearStr = years[i];
      const hasMeasured = yearsWithMeasured.has(yearStr) && hasValue(values[i]);
      const hasTarget = hasValue(targetValuesByYear[yearStr]);
      if (hasMeasured) {
        tableAnnee.push(yearStr);
        tableValeur.push(values[i]);
        tableTypeMesure.push(statuses[i] || 'mesuré');
      }
      if (hasTarget) {
        tableAnnee.push(yearStr);
        tableValeur.push(targetValuesByYear[yearStr]);
        tableTypeMesure.push('cible');
      }
      if (!hasMeasured && !hasTarget && hasValue(values[i])) {
        tableAnnee.push(yearStr);
        tableValeur.push(values[i]);
        tableTypeMesure.push(statuses[i] || 'mesuré');
      }
    }

    const transformed = {
      label_indic: item.Indicateur,
      id_indic: item.ID,
      label_description: (item.Description || '').toString() + nbNote,
      label_unit: formattedUnitLong,
      label_unit_short: formattedUnitShort,
      label_tags: item['Tags objectifs environnementaux'],
      label_sources: item.Sources,
      label_sources_cible: item['Source de la cible'] || '',
      lien_cible: item['Lien cible 2030'] || '',
      lien_donnees_source: item['Lien données source'],
      lien_site_source: item['Lien site source'],
      label_perimetre: item.Périmètre,
      int_ordre: parseInt(item.Ordre) || 0,
      int_annee_cible: 2030,
      date_maj: item['Dernière mise à jour'],
      label_sous_groupe: normalizedSubGroup,
      label_value: statuses,
      type_de_graphique: chartType,
      // For synthesis tables (EngagementsTableView, ChantiersTableView)
      objectif_valeur_cible,
      valeur_actuelle,
      date_valeur_actuelle,
      unite: formattedUnitLong,
      // Add new fields from Grist
      levier: item['Levier'] || '',
      // Engagement from main CSV (for Etat environnement synthesis)
      engagement: String(item['Engagement'] || item['Ambition liée'] || '').trim(),
      // Primary sector / chantier (backward compatible with existing components)
      chantier_ou_impact: parsedChantierOuImpact.chantierOuImpact || '',
      sector: parsedChantierOuImpact.sector || '',
      // Full lists so that indicators attached to several chantiers / axes
      // can be displayed in all relevant places.
      chantier_ou_impact_list: chantierOuImpactList
        .map(entry => entry.chantierOuImpact)
        .filter(Boolean),
      sector_list: chantierOuImpactList
        .map(entry => entry.sector)
        .filter(Boolean),
      // IRPE / Écolab: indicator ids for regional data (column IRPE_ids or ID Indicateur hub Ecolab)
      irpe_ids: parseIrpeIds(item['IRPE ids'], item['IRPE valide']),
      reference_year_for_target_trajectory: refYearIdx >= 0 ? years[refYearIdx] : null,
      tableAnnee,
      tableValeur,
      tableTypeMesure,
      values: {
        x: [years],
        y: y,
        ytab: values,
        legend: legend,
        colors: colors,
        trendLine: (targetTrajectory != null && statuses.some((s, idx) => {
          const t = normalizeStatusForLogic(s || '', years[idx]);
          return t === 'projection' || t === 'cible';
        })) ? computeTrendLine(years, values, statuses) : null,
        targetTrajectory
      }
    };
    validateTransformedIndicatorShape(transformed);
    return transformed;
  });

  // Group indicators by their label and process sub-groups
  let groupedResults = groupByIndicator(results);

  // Apply search and tag filters after grouping to ensure complete charts
  // This ensures that if any sub-group matches, the entire grouped indicator is included
  if (query.filter_by) {
    for (const filter of query.filter_by) {
      if (filter.field === 'label_tags' && filter.values.length) {
        groupedResults = groupedResults.filter(item => {
          if (!item.label_tags) return false;
          const tags = item.label_tags.split(',').map(tag => tag.trim().toLowerCase());
          return filter.values.some(filterTag => tags.includes(filterTag.toLowerCase()));
        });
      } else if (filter.field === 'search' && filter.values.length && filter.values[0]) {
        const searchTerm = stripAccents(filter.values[0].toLowerCase().trim());
        if (searchTerm) {
          groupedResults = groupedResults.filter(item => {
            const includesTerm = (s) => s && stripAccents(s.toLowerCase()).includes(searchTerm);
            // Search in title (label_indic)
            const titleMatch = includesTerm(item.label_indic);
            // Search in description
            const descMatch = includesTerm(item.label_description);
            // Search in tags
            const tagMatch = item.label_tags && includesTerm(item.label_tags);
            // Search in sub-group labels (for grouped indicators)
            const subGroupMatch = Array.isArray(item.label_sous_groupe) &&
              item.label_sous_groupe.some(subGroup => includesTerm(subGroup));
            return titleMatch || descMatch || tagMatch || subGroupMatch;
          });
        }
      } else if (filter.field === 'has_regional_data' && filter.values && filter.values.includes(true)) {
        groupedResults = groupedResults.filter(item => {
          const ids = item.irpe_ids;
          return Array.isArray(ids) && ids.length > 0 && ids.some(id => id && String(id).trim() !== '');
        });
      }
    }
  }

  return {
    length: groupedResults.length,
    results: groupedResults
  };
}

/**
 * Linear regression of (x[], y[]) using least squares.
 * @param {Array<number>} xVals - X values
 * @param {Array<number>} yVals - Y values
 * @returns {{ slope: number, intercept: number }|null} - Slope and intercept, or null if insufficient data
 */
function linearRegression(xVals, yVals) {
  const n = xVals.length;
  if (n < 2) return null;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += xVals[i];
    sumY += yVals[i];
    sumXY += xVals[i] * yVals[i];
    sumX2 += xVals[i] * xVals[i];
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

/** Last calendar year (inclusive) for which the trend line is drawn; beyond this, values are null so targets further out are unaffected. */
export const TREND_LINE_END_YEAR = 2035;

/**
 * Computes a trend line based on the last N years of measured data.
 * @param {Array<string>} years - Year labels (e.g. ['2018','2019',...])
 * @param {Array<number>} ytab - Value for each year (same order as years)
 * @param {Array<string>} statuses - Status per year ('mesuré', 'projection', 'cible')
 * @param {number} numYears - Number of measured years to use (default 3)
 * @returns {Array<number>|null} - Trend y value for each year index, or null if insufficient measured data
 */
export function computeTrendLine(years, ytab, statuses, numYears = 3) {
  if (!years?.length || !ytab?.length || years.length !== ytab.length) return null;
  const measured = [];
  for (let i = 0; i < years.length; i++) {
    const s = normalizeStatusForLogic(statuses[i] || '', years[i]);
    if (s === 'mesuré') {
      const y = parseFloat(ytab[i]);
      if (!isNaN(y)) measured.push({ year: parseInt(years[i], 10), value: y, index: i });
    }
  }
  if (measured.length < 2) return null;
  const lastN = measured.slice(-numYears);
  const firstIndex = lastN[0].index;
  const xVals = lastN.map(p => p.year);
  const yVals = lastN.map(p => p.value);
  const reg = linearRegression(xVals, yVals);
  if (!reg) return null;
  const result = [];
  const yearNumbers = years.map(y => parseInt(y, 10));
  for (let i = 0; i < years.length; i++) {
    if (i < firstIndex) {
      // Before the first year used for regression: no trend value
      result.push(null);
    } else if (yearNumbers[i] > TREND_LINE_END_YEAR) {
      result.push(null);
    } else {
      result.push(reg.slope * yearNumbers[i] + reg.intercept);
    }
  }
  return result;
}

/**
 * Determine the chart type based on indicator data if not explicitly specified
 * @param {Object} item - The indicator data
 * @returns {String} - The chart type
 */
function determineChartType(item) {
  // If it has sub-groups, use stacked bar chart or multi-line chart
  if (item['Sous-niveau (graphique)']) {
    // You can add logic here to determine between 'Barres empilées' and 'Courbes indépendantes'
    // For now, default to 'Barres empilées' for sub-grouped data
    return 'Barres empilées';
  }
  
  // Default to simple bar chart for single-series data
  return 'Barres simple';
}

/**
 * Group indicators by their label and process sub-groups.
 * Ensures that:
 * - Years are sorted numerically
 * - All sub-series are aligned on the same year axis
 * @param {Array} results - Processed indicator results
 * @returns {Array} - Grouped results
 */
function groupByIndicator(results) {
  const indicatorMap = new Map();
  
  results.forEach(item => {
    if (!item.label_sous_groupe) {
      // If no sub-group, keep as is
      indicatorMap.set(item.id_indic, item);
      return;
    }
    
    const key = item.label_indic;
    
    if (!indicatorMap.has(key)) {
      // Initialize with first sub-group item
      const baseItem = { ...item };
      baseItem.label_sous_groupe = [item.label_sous_groupe];

      // Build a sorted year axis and align values to it
      const rawDates = Array.isArray(item.values.x[0]) ? item.values.x[0] : item.values.x;
      const valueMap = {};
      const statusMap = {};
      rawDates.forEach((year, idx) => {
        valueMap[year] = item.values.ytab[idx];
        statusMap[year] = Array.isArray(item.label_value) ? item.label_value[idx] : null;
      });
      const sortedDates = [...rawDates].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
      const alignedValues = sortedDates.map(year =>
        Object.prototype.hasOwnProperty.call(valueMap, year) ? valueMap[year] : null
      );
      const alignedStatuses = sortedDates.map(year =>
        Object.prototype.hasOwnProperty.call(statusMap, year) ? statusMap[year] : null
      );

      // Format expected by the chart & table components
      baseItem.date = [sortedDates];
      baseItem.values = [alignedValues];
      baseItem.label_value = alignedStatuses;
      baseItem.reference_year_for_target_trajectory = item.reference_year_for_target_trajectory || null;
      indicatorMap.set(key, baseItem);
    } else {
      // Add to existing grouped item
      const groupedItem = indicatorMap.get(key);
      groupedItem.label_sous_groupe.push(item.label_sous_groupe);

      // Current common axis
      const existingDates = Array.isArray(groupedItem.date?.[0])
        ? groupedItem.date[0].slice()
        : [];

      // Dates for the new sub-group
      const newDates = Array.isArray(item.values.x[0]) ? item.values.x[0] : item.values.x;

      // Build merged, unique, numerically sorted axis
      const mergedDates = Array.from(
        new Set([...(existingDates || []), ...(newDates || [])])
      ).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

      // Realign all existing series to mergedDates
      if (groupedItem.values && Array.isArray(groupedItem.values)) {
        groupedItem.values = groupedItem.values.map(seriesValues => {
          const seriesMap = {};
          (existingDates || []).forEach((year, idx) => {
            seriesMap[year] = seriesValues[idx];
          });
          return mergedDates.map(year =>
            Object.prototype.hasOwnProperty.call(seriesMap, year) ? seriesMap[year] : null
          );
        });
      }

      // Build aligned series for the new sub-group
      const newSeriesMap = {};
      (newDates || []).forEach((year, idx) => {
        newSeriesMap[year] = item.values.ytab[idx];
      });
      const newAlignedSeries = mergedDates.map(year =>
        Object.prototype.hasOwnProperty.call(newSeriesMap, year) ? newSeriesMap[year] : null
      );
      groupedItem.values.push(newAlignedSeries);

      // Update the common axis
      groupedItem.date = [mergedDates];

      // Merge label_value (status per year): for each merged year, use status from first item that has it
      const existingStatusMap = {};
      const prevLabelValue = groupedItem.label_value || [];
      if (Array.isArray(prevLabelValue) && existingDates.length === prevLabelValue.length) {
        existingDates.forEach((yr, idx) => {
          existingStatusMap[yr] = prevLabelValue[idx];
        });
      }
      const newStatusMap = {};
      const itemDates = Array.isArray(item.values.x[0]) ? item.values.x[0] : item.values.x;
      const itemStatuses = item.label_value;
      if (Array.isArray(itemStatuses) && itemDates.length === itemStatuses.length) {
        itemDates.forEach((year, idx) => {
          newStatusMap[year] = itemStatuses[idx];
        });
      }
      const mergedStatuses = mergedDates.map(year =>
        existingStatusMap[year] ?? newStatusMap[year] ?? null
      );
      groupedItem.label_value = mergedStatuses;

      // Preserve description if the current one is empty but this item has it
      if ((!groupedItem.label_description || groupedItem.label_description.trim() === '') && 
          item.label_description && item.label_description.trim() !== '') {
        groupedItem.label_description = item.label_description;
      }
      
      // Preserve unit information if the current ones are empty but this item has them
      if ((!groupedItem.label_unit || groupedItem.label_unit.trim() === '') && 
          item.label_unit && item.label_unit.trim() !== '') {
        groupedItem.label_unit = item.label_unit;
        groupedItem.label_unit_short = item.label_unit_short;
      }
      
      // Preserve source information if empty
      if ((!groupedItem.label_sources || groupedItem.label_sources.trim() === '') && 
          item.label_sources && item.label_sources.trim() !== '') {
        groupedItem.label_sources = item.label_sources;
      }
      
      // Preserve target source information if empty
      if ((!groupedItem.label_sources_cible || groupedItem.label_sources_cible.trim() === '') && 
          item.label_sources_cible && item.label_sources_cible.trim() !== '') {
        groupedItem.label_sources_cible = item.label_sources_cible;
        groupedItem.lien_cible = item.lien_cible || groupedItem.lien_cible;
      }
      
      // Preserve perimetre information if empty
      if ((!groupedItem.label_perimetre || groupedItem.label_perimetre.trim() === '') && 
          item.label_perimetre && item.label_perimetre.trim() !== '') {
        groupedItem.label_perimetre = item.label_perimetre;
      }

      const existingReferenceYear = groupedItem.reference_year_for_target_trajectory;
      const incomingReferenceYear = item.reference_year_for_target_trajectory;
      if (!existingReferenceYear && incomingReferenceYear) {
        groupedItem.reference_year_for_target_trajectory = incomingReferenceYear;
      } else if (existingReferenceYear && incomingReferenceYear) {
        groupedItem.reference_year_for_target_trajectory =
          parseInt(incomingReferenceYear, 10) < parseInt(existingReferenceYear, 10)
            ? incomingReferenceYear
            : existingReferenceYear;
      }
      
      // Merge tags from all sub-groups to ensure complete tag coverage
      if (item.label_tags) {
        const existingTags = groupedItem.label_tags ? 
          groupedItem.label_tags.split(',').map(tag => tag.trim().toLowerCase()) : [];
        const newTags = item.label_tags.split(',').map(tag => tag.trim().toLowerCase());
        
        // Combine tags and remove duplicates
        const allTags = [...existingTags];
        newTags.forEach(tag => {
          if (tag && !allTags.includes(tag)) {
            allTags.push(tag);
          }
        });
        
        groupedItem.label_tags = allTags.join(', ');
      }
      
      // Note: `groupedItem.date` and `groupedItem.values` are already
      // kept aligned and sorted above.
    }
  });
  
  // Log information about each grouped item
  const groupedItems = Array.from(indicatorMap.values());  
  return groupedItems;
}

/**
 * Generates chart series data based on the statuses from the CSV
 * @param {Array} list_y - Values
 * @param {Array} list_x - Years
 * @param {Array} statuses - Status labels (mesuré, projection, cible)
 * @param {String} targetYear - Target year
 * @param {String} targetValue - Target value
 * @returns {Object} - Chart series data
 */
function getSeries(list_y, list_x, statuses, targetYear, targetValue) {
  // Initialize result arrays
  const legend = [];
  const colors = [];
  let seriesData = [];
  
  // Create a categorized view of the data by status
  let historicalData = {};
  let projectionData = {};
  let targetData = {};
  
  // Assign each value to appropriate category based on status label.
  // New format: year = mesuré, Cible_XXXX = cible. Use normalizeStatusForLogic.
  list_y.forEach((value, index) => {
    const year = list_x[index];
    const rawStatus = statuses[index] || '';
    const status = normalizeStatusForLogic(rawStatus, year);

    // Ignore missing / invalid numeric values, but keep the year in the axis
    if (value === null || value === undefined || value === '' || isNaN(Number(String(value)))) {
      return;
    }

    // Format the value with scientific notation when needed
    const formattedValue = parseFloat(getScientificNotation(value));
    if (formattedValue === null || isNaN(formattedValue)) {
      return;
    }

    // Categorize data points
    if (status === 'mesuré') {
      historicalData[year] = formattedValue;
    } else if (status === 'projection') {
      projectionData[year] = formattedValue;
    } else if (status === 'cible') {
      targetData[year] = formattedValue;
    } else {
      // Default categorization by year
      const currentYear = new Date().getFullYear();
      if (parseInt(year, 10) <= currentYear) {
        historicalData[year] = formattedValue;
      } else if (year === targetYear) {
        targetData[year] = formattedValue;
      } else {
        projectionData[year] = formattedValue;
      }
    }
  });
  
  // Prepare series in the format expected by the chart component
  // Use a compatible approach instead of Set for uniqueness
  const uniqueYears = [];
  list_x.forEach(year => {
    if (!uniqueYears.includes(year)) {
      uniqueYears.push(year);
    }
  });
  const allYears = uniqueYears.sort((a, b) => parseInt(a) - parseInt(b));
  
  // Historical series (include 0 values as valid historical data)
  const hasHistorical = Object.keys(historicalData).length > 0;
  if (hasHistorical) {
    const history = allYears.map(year => historicalData[year] ?? null);
    // Zero out years where we have projection or target data (use 'in' to handle target value 0)
    history.forEach((val, idx) => {
      const year = allYears[idx];
      if (year in projectionData || year in targetData) {
        history[idx] = 0;
      }
    });
    // Replace null with 0 for chart display (null = no data for that year)
    const historyForChart = history.map(v => v == null ? 0 : v);
    seriesData.push(historyForChart);
    legend.push('Historique');
    colors.push(getDefaultSeriesPaletteToken(0));
  }

  // Projection series (extrapolation) – controlled by SHOW_EXTRAPOLATION
  const hasProjection = SHOW_EXTRAPOLATION && Object.keys(projectionData).length > 0;
  if (hasProjection) {
    const projection = allYears.map(year => projectionData[year] ?? null);
    // Zero out years where we have historical or target data (use 'in' to handle value 0)
    projection.forEach((val, idx) => {
      const year = allYears[idx];
      if (year in historicalData || year in targetData) {
        projection[idx] = 0;
      }
    });
    const projectionForChart = projection.map(v => v == null ? 0 : v);
    seriesData.push(projectionForChart);
    legend.push('Extrapolation');
    colors.push(getDefaultSeriesPaletteToken(1));
  }

  // Targets: no bars, shown as line + dots via targetTrajectory (handled separately)

  return { y: seriesData, legend, colors };
}

/**
 * Get all indicators matching the given query
 * @param {Object} query - Query parameters (similar to API request)
 * @param {String} environment - Environment to use (production or staging)
 * @returns {Promise} - Promise resolving to processed data
 */
export async function getIndicators(query, environment = 'production') {
  try {
    await ensureImpactTaxonomyLoaded();
    const csvData = await fetchCSVData(environment);
    return transformCSVData(csvData, query);
  } catch (error) {
    console.error('Error getting indicators from CSV:', error);
    throw error;
  }
}

/**
 * Get all themes and leviers from CSV data
 * @param {String} environment - Environment to use (production or staging)
 * @returns {Promise} - Promise resolving to themes and leviers
 */
export async function getThemesLevier(environment = 'production') {
  try {
    const csvData = await fetchCSVData(environment);
    
    // Filter out items marked for deletion in V1
    const filteredData = csvData.filter(item => item['A supprimer de la V1'] !== 'true');
    
    // Extract unique themes
    const uniqueThemes = [];
    filteredData.forEach(item => {
      const theme = item.Indicateurs_Onglet;
      if (theme && !uniqueThemes.includes(theme)) {
        uniqueThemes.push(theme);
      }
    });
    
    // Create theme objects
    const themes = uniqueThemes.map(theme => ({
      id_theme: theme,
      label_theme: theme
    }));
    
    // Group leviers by theme
    const themesWithLeviers = themes.map(theme => {
      // Extract unique leviers for this theme
      const uniqueLeviers = [];
      filteredData
        .filter(item => item.Indicateurs_Onglet === theme.id_theme)
        .forEach(item => {
          const levier = item['Indicateurs_Sous-onglet'];
          if (levier && !uniqueLeviers.includes(levier)) {
            uniqueLeviers.push(levier);
          }
        });
      
      // Create levier objects
      const leviers = uniqueLeviers.map(levier => ({
        id_levier: levier,
        label_levier: levier,
        selected: false // Initialize selection state
      }));
      
      return {
        ...theme,
        leviers,
        selected: false, // Initialize selection state
        expanded: false  // Initialize expanded state
      };
    });
    
    return {
      status: 'success',
      data: {
        themes: themesWithLeviers
      }
    };
  } catch (error) {
    console.error('Error getting themes and leviers from CSV:', error);
    throw error;
  }
}

/**
 * Get all unique tags from the CSV data
 * @param {String} environment - Environment to use (production or staging)
 * @returns {Promise} - Promise resolving to an array of unique tags
 */
export async function getAllUniqueTags(environment = 'production') {
  try {
    const csvData = await fetchCSVData(environment);
    
    // Filter out items marked for deletion in V1
    const filteredData = csvData.filter(item => item['A supprimer de la V1'] !== 'true');
    
    // Extract all tags and flatten the array
    const allTags = [];
    filteredData.forEach(item => {
      if (item['Tags objectifs environnementaux']) {
        const tags = item['Tags objectifs environnementaux']
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
          
        tags.forEach(tag => {
          if (!allTags.includes(tag)) {
            allTags.push(tag);
          }
        });
      }
    });
    
    // Sort tags alphabetically
    allTags.sort();
    
    return {
      status: 'success',
      data: {
        results: allTags
      }
    };
  } catch (error) {
    console.error('Error getting unique tags from CSV:', error);
    throw error;
  }
}

/**
 * Parse the "Chantier ou Impact" column to extract sector and chantier/impact
 * Format: "Sector / Chantier ou Impact" or "\nSector / \nChantier ou Impact"
 * @param {String} value - The raw column value
 * @returns {Object} - { sector, chantierOuImpact }
 */
function parseChantierOuImpact(value) {
  return parseChantierOuImpactInternal(value);
}

/**
 * Known levier labels (Grist). Longest first so lookaheads match the full phrase
 * (e.g. "Indicateur d'impact - autres" before "Indicateur d'impact").
 */
const KNOWN_LEVIER_LABELS = [
  "Indicateur d'impact - autres",
  "Indicateur d'impact",
  "Indicateur de chantier",
  'Autres indicateurs',
];

function escapeRegExp(str) {
  return str.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * Parse the "Levier" column which is a list field.
 * Splits on ", " only when followed by a known levier label, so names like
 * "… (énergie, matières, …)" stay intact while "Nom levier, Indicateur de chantier"
 * yields both entries.
 * @param {String} value - Raw levier value
 * @returns {string[]} - List of levier labels
 */
function parseLevierList(value) {
  if (value == null) return [];
  let s = String(value).trim();
  if (!s || s.toLowerCase() === 'nan') return [];

  // Clean surrounding quotes if the whole field is quoted
  s = s.replace(/^[\s"']+|[\s"']+$/g, '').trim();

  const knownAlternation = KNOWN_LEVIER_LABELS.map(escapeRegExp).join('|');
  const splitBeforeKnown = new RegExp(
    `,\\s*(?=${knownAlternation}(?:\\s*,|\\s*$|$))`
  );

  const segments = s.split(splitBeforeKnown).map((p) => p.trim()).filter(Boolean);
  const knownSet = new Set(KNOWN_LEVIER_LABELS);
  const result = [];
  const seen = new Set();

  for (const seg of segments) {
    if (knownSet.has(seg)) {
      if (!seen.has(seg)) {
        result.push(seg);
        seen.add(seg);
      }
      continue;
    }
    // Legacy: whole cell contained a known label without the ", Known" pattern
    const legacy = [];
    for (const label of KNOWN_LEVIER_LABELS) {
      if (seg.includes(label)) legacy.push(label);
    }
    if (legacy.length > 0) {
      for (const label of legacy) {
        if (!seen.has(label)) {
          result.push(label);
          seen.add(label);
        }
      }
      const rest = legacy
        .reduce((acc, label) => acc.split(label).join(''), seg)
        .replace(/^\s*,\s*|\s*,\s*$/g, '')
        .trim();
      if (rest && !seen.has(rest)) {
        result.push(rest);
        seen.add(rest);
      }
    } else if (!seen.has(seg)) {
      result.push(seg);
      seen.add(seg);
    }
  }

  return result;
}

/**
 * Taxonomie des axes d’impact (Liste_taxonomie Grist : « Nom complet », « Nom court »).
 * IMPACT_AXE_DISPLAY_ORDER = noms complets, dans l’ordre des lignes du CSV.
 */
export const IMPACT_AXE_DISPLAY_ORDER = [];

const labelToNomComplet = new Map();
const slugToNomComplet = new Map();
const nomCompletToNomCourt = new Map();
const nomCompletToRetenirHtml = new Map();
let impactTaxonomyLoaded = false;
let impactTaxonomyLoadPromise = null;

/** Copie de secours si l’API et le fichier backup sont indisponibles (même contenu que grist-taxonomie.csv). */
const FALLBACK_TAXONOMIE_ROWS = [
  { 'Nom complet': 'Atténuation du changement climatique', 'Nom court': 'Atténuation' },
  { 'Nom complet': 'Adaptation au changement climatique', 'Nom court': 'Adaptation' },
  {
    'Nom complet': 'Utilisation durable et protection des ressources aquatiques et maritimes',
    'Nom court': 'Eau',
  },
  { 'Nom complet': 'Transition vers une économie circulaire', 'Nom court': 'Economie circulaire' },
  { 'Nom complet': 'Prévention et le contrôle de la pollution', 'Nom court': 'Pollution' },
  {
    'Nom complet': 'Protection et restauration de la biodiversité et des écosystèmes',
    'Nom court': 'Biodiversité',
  },
];

function stripDiacriticsImpact(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function slugifyImpactAxeLabel(str) {
  return stripDiacriticsImpact(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function clearImpactTaxonomyMaps() {
  labelToNomComplet.clear();
  slugToNomComplet.clear();
  nomCompletToNomCourt.clear();
  nomCompletToRetenirHtml.clear();
  IMPACT_AXE_DISPLAY_ORDER.length = 0;
}

function normalizeTaxoHeaderKey(raw) {
  return String(raw || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function pickRowValueByHeaderAliases(row, aliases) {
  if (!row || typeof row !== 'object') return '';
  const normalizedToRealKey = new Map();
  for (const k of Object.keys(row)) {
    normalizedToRealKey.set(normalizeTaxoHeaderKey(k), k);
  }
  for (const a of aliases) {
    const real = normalizedToRealKey.get(normalizeTaxoHeaderKey(a));
    if (!real) continue;
    const v = row[real];
    const s = v == null ? '' : String(v).trim();
    if (s && s.toLowerCase() !== 'nan') return s;
  }
  return '';
}

function applyTaxonomieRows(rows) {
  clearImpactTaxonomyMaps();
  const list = Array.isArray(rows) && rows.length > 0 ? rows : FALLBACK_TAXONOMIE_ROWS;
  for (const row of list) {
    const nomComplet = String(row['Nom complet'] ?? row.Nom_complet ?? '').trim();
    const nomCourt = String(row['Nom court'] ?? row.Nom_court ?? '').trim();
    if (!nomComplet || !nomCourt) continue;
    IMPACT_AXE_DISPLAY_ORDER.push(nomComplet);
    nomCompletToNomCourt.set(nomComplet, nomCourt);

    // Optional: texte "Ce qu'il faut retenir" directement depuis Liste_taxonomie (si la colonne existe).
    // On ne fige pas un nom de colonne unique pour rester compatible si l'intitulé Grist évolue.
    const retenir = pickRowValueByHeaderAliases(row, [
      "Ce qu'il faut retenir"
    ]);
    if (retenir) {
      nomCompletToRetenirHtml.set(nomComplet, retenir);
    }

    labelToNomComplet.set(nomComplet, nomComplet);
    labelToNomComplet.set(nomCourt, nomComplet);
    // Slugs d’URL = uniquement slug du « Nom court » (ex. attenuation, economie-circulaire)
    slugToNomComplet.set(slugifyImpactAxeLabel(nomCourt), nomComplet);
    // TODO - cleanup
    // Rétrocompatibilité indicateurs : la colonne « Chantier ou Impact » contient encore
    // « … / Atténuation climat » (et équivalents) au lieu du nom complet ou du nom court Grist.
    // À supprimer lorsque ces cellules seront alignées sur Liste_taxonomie.
    if (nomCourt === 'Atténuation' || nomCourt === 'Adaptation') {
      labelToNomComplet.set(`${nomCourt} climat`, nomComplet);
    }
    if (/circulaire/i.test(nomCourt)) {
      labelToNomComplet.set('Économie circulaire', nomComplet);
      labelToNomComplet.set('Economie circulaire', nomComplet);
    }
  }
}

/**
 * Charge Liste_taxonomie (Grist ou backup). À appeler au boot (main.js) et avant getNavigationStructure / getIndicators.
 */
export async function ensureImpactTaxonomyLoaded() {
  if (impactTaxonomyLoaded) return;
  if (!impactTaxonomyLoadPromise) {
    impactTaxonomyLoadPromise = (async () => {
      const rows = await fetchTaxonomieData();
      applyTaxonomieRows(rows);
      impactTaxonomyLoaded = true;
      impactTaxonomyLoadPromise = null;
    })();
  }
  await impactTaxonomyLoadPromise;
}

/** Nom complet taxonomie → nom court (badges, menus courts). Retombe sur le libellé si inconnu. */
export function impactAxeNomCourt(nomComplet) {
  if (!nomComplet) return '';
  return nomCompletToNomCourt.get(nomComplet) || String(nomComplet);
}

/**
 * Texte HTML (ou texte simple) à afficher dans « Ce qu'il faut retenir » pour l'axe.
 * Source: Liste_taxonomie (Grist) si la colonne est disponible, sinon chaîne vide.
 */
export function impactAxeRetenirHtml(nomComplet) {
  if (!nomComplet) return '';
  return nomCompletToRetenirHtml.get(String(nomComplet).trim()) || '';
}

/** Slug d’URL (`?section=`) dérivé du nom court taxonomie. */
export function impactAxeSlugFromNomComplet(nomComplet) {
  if (!nomComplet) return '';
  const court = nomCompletToNomCourt.get(nomComplet);
  if (court) return slugifyImpactAxeLabel(court);
  return slugifyImpactAxeLabel(nomComplet);
}

/** Slug d’URL → nom complet (clés = slugs des noms courts uniquement). */
export function resolveImpactAxeSlugToNomComplet(slug) {
  const s = String(slug || '')
    .toLowerCase()
    .trim();
  if (!s) return null;
  return slugToNomComplet.get(s) || null;
}

/** Normalize axe name variants (accent/case) to canonical form. Handles "Economie circulaire", "Economie Circulaire", etc. */
export function normalizeImpactAxeName(name) {
  if (!name) return name;
  const lower = String(name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return lower === 'economie circulaire' ? 'Économie circulaire' : name;
}

/**
 * Libellé issu des données (colonne Chantier ou Impact, Liste_chantiers, etc.) → nom complet taxonomie.
 */
export function canonicalImpactAxeNomComplet(raw) {
  if (!raw || !String(raw).trim()) return null;
  const t = String(raw).trim();
  if (labelToNomComplet.has(t)) return labelToNomComplet.get(t);
  const normEco = normalizeImpactAxeName(t);
  if (labelToNomComplet.has(normEco)) return labelToNomComplet.get(normEco);
  const sl = slugifyImpactAxeLabel(t);
  if (slugToNomComplet.has(sl)) return slugToNomComplet.get(sl);
  return null;
}

export function isImpactAxe(name) {
  return canonicalImpactAxeNomComplet(name) != null;
}

/**
 * Tri des libellés d’axe selon l’ordre des lignes de Liste_taxonomie (IMPACT_AXE_DISPLAY_ORDER).
 * Inconnus en fin ; tie-break alphabétique (fr).
 */
export function compareImpactAxeLabelsTaxonomie(labelA, labelB) {
  const rank = (raw) => {
    const complet = canonicalImpactAxeNomComplet(raw);
    if (!complet) return IMPACT_AXE_DISPLAY_ORDER.length;
    const i = IMPACT_AXE_DISPLAY_ORDER.indexOf(complet);
    return i === -1 ? IMPACT_AXE_DISPLAY_ORDER.length : i;
  };
  const da = rank(labelA);
  const db = rank(labelB);
  if (da !== db) return da - db;
  return String(labelA || '').localeCompare(String(labelB || ''), 'fr', {
    sensitivity: 'base',
  });
}

/**
 * Clé dans `sectors['Synthèse'].chantiers` pour un axe d’impact. Les données utilisent en général
 * le nom court Grist (Pollution, Eau…) dans « Chantier ou impact », le menu le nom complet taxonomie.
 */
export function resolveSyntheseImpactGroupingKey(syntheseChantiersMap, axeLabel) {
  if (!syntheseChantiersMap || axeLabel == null) return null;
  const raw = String(axeLabel).trim();
  if (!raw) return null;

  const canonical =
    canonicalImpactAxeNomComplet(raw) ||
    (nomCompletToNomCourt.has(raw) ? raw : null) ||
    raw;
  const court = nomCompletToNomCourt.get(canonical);

  const pick = (k) => (k && syntheseChantiersMap[k] ? k : null);

  return (
    pick(canonical) ||
    pick(court) ||
    pick(court ? normalizeImpactAxeName(court) : null)
  );
}

/**
 * Whether the levier is an impact indicator (shown in "Indicateurs d'impact" section, not in chantiers).
 * Includes "Indicateur d'impact" (grouped by axe) and "Indicateur d'impact - autres" (grouped by chantier, no submenu).
 * @param {String} levier - The levier value
 * @returns {Boolean}
 */
function isImpactIndicator(levier) {
  const list = Array.isArray(levier) ? levier : parseLevierList(levier);
  return list.some(v => v === "Indicateur d'impact" || v === "Indicateur d'impact - autres");
}

/**
 * Get the sort order for Levier types (lower = first).
 * "Indicateur d'impact - autres" appears below the others under each chantier.
 * @param {String} levier - The levier value
 * @returns {Number} - Sort order
 */
function getLevierSortOrder(levier) {
  if (!levier || levier === 'nan') return 999;
  if (levier === "Indicateur d'impact") return 0;
  if (levier === "Indicateur de chantier") return 1;
  if (levier === "Indicateur d'impact - autres") return 997; // Below others under chantier
  if (levier === "Autres indicateurs") return 998;
  return 500; // Named leviers in the middle
}

/**
 * Cache session (mémoire) : une entrée par environnement, vidée au rechargement de la page.
 * Évite de reconstruire toute la structure à chaque remontée de SyntheseSectorielle / SideNavigation.
 */
const navigationStructureSessionCache = {
  production: null,
  staging: null,
};
const navigationStructureSessionInflight = {
  production: null,
  staging: null,
};

function navigationStructureEnvKey(environment) {
  return environment === 'staging' ? 'staging' : 'production';
}

/**
 * Compare two chantier display names using row order from Liste_chantiers (Grist).
 * Names absent from the list sort after known ones, then alphabetically (fr).
 * @param {string} nameA
 * @param {string} nameB
 * @param {Map<string, number>} orderMap
 * @returns {number}
 */
export function compareChantierNamesByListeOrder(nameA, nameB, orderMap) {
  const a = nameA || '';
  const b = nameB || '';
  const ia =
    orderMap && orderMap.has(a) ? orderMap.get(a) : Number.MAX_SAFE_INTEGER;
  const ib =
    orderMap && orderMap.has(b) ? orderMap.get(b) : Number.MAX_SAFE_INTEGER;
  if (ia !== ib) return ia - ib;
  return a.localeCompare(b, 'fr');
}

/**
 * @returns {Promise<Map<string, number>>}
 */
export async function getChantierListeOrderIndexMap() {
  const m = await fetchChantiersData();
  return m.orderIndexByChantier || new Map();
}

function sortChantiersObjectKeys(chantiersObj, orderMap) {
  const sorted = {};
  const keys = Object.keys(chantiersObj).sort((ka, kb) =>
    compareChantierNamesByListeOrder(ka, kb, orderMap)
  );
  for (const k of keys) {
    sorted[k] = chantiersObj[k];
  }
  return sorted;
}

/**
 * Construction réelle (CSV + listes) — appelée au plus une fois par env et session.
 * @param {String} environment
 */
async function buildNavigationStructureCore(environment) {
  try {
    // Load indicators, leviers list and chantiers list (for Axe taxonomie) in parallel
    const [csvData, levierList, chantiersMaps] = await Promise.all([
      fetchCSVData(environment),
      fetchLevierList(),
      fetchChantiersData()
    ]);
    const chantiersAxeMap = chantiersMaps.axesByChantier;
    const chantiersDescriptionMap = chantiersMaps.descriptionByChantier;
    const chantiersOrderMap = chantiersMaps.orderIndexByChantier || new Map();
    
    // Filter out items marked for deletion
    const filteredData = csvData.filter(item => item['A supprimer de la V1'] !== 'true');
    
    // Build the structure
    const sectors = {};
    
    filteredData.forEach(item => {
      const chantierOuImpactRaw = item['Chantier ou Impact'] || '';
      const levierRaw = item['Levier'] || '';
      const gristId = item['ID'] || '';
      
      // Allow multiple sector / chantier associations for a single indicator
      const associations = parseChantierOuImpactList(chantierOuImpactRaw);
      const effectiveAssociations = associations.length
        ? associations
        : [parseChantierOuImpactInternal(chantierOuImpactRaw)];

      // Allow multiple leviers for a single indicator using known labels
      const levierList = parseLevierList(levierRaw);
      const effectiveLeviers = levierList.length ? levierList : [levierRaw || ''];
      
      effectiveAssociations.forEach(({ sector, chantierOuImpact }) => {
        if (!sector) return;
        
        // Initialize sector if not exists
        if (!sectors[sector]) {
          sectors[sector] = {
            name: sector,
            indicateursImpact: {},  // Grouped by taxonomy_axe (for Indicateur d'impact)
            indicateursImpactAutresByChantier: {},  // Grouped by chantier name (for Indicateur d'impact - autres, no submenu)
            chantiers: {}          // Grouped by chantier name
          };
        }
        
        // Determine if this is an impact indicator or a chantier/levier for each levier label
        effectiveLeviers.forEach(levierName => {
          const cleanLevier = (levierName || '').trim();
          if (!cleanLevier) return;

          if (cleanLevier === "Indicateur d'impact") {
            // Group by nom complet taxonomie (Grist Liste_taxonomie)
            const axe =
              canonicalImpactAxeNomComplet(chantierOuImpact) ||
              normalizeImpactAxeName(chantierOuImpact) ||
              'Autre';
            if (!sectors[sector].indicateursImpact[axe]) {
              sectors[sector].indicateursImpact[axe] = [];
            }
            sectors[sector].indicateursImpact[axe].push({
              gristId,
              levier: cleanLevier,
              indicator: item
            });

            // When an indicator d'impact is also associated to a non-axis
            // chantier (e.g. "Développer des pratiques alimentaires saines et durables"),
            // expose it as an "Indicateur de chantier" for that chantier.
            // Skip if the row also has levier "Indicateur de chantier": the main
            // branch below already registers it once (avoids duplicate rows in
            // synthèse sectorielle and chantier views).
            const hasIndicateurDeChantierLevier = effectiveLeviers.some(
              (l) => (l || '').trim() === 'Indicateur de chantier'
            );
            if (!isImpactAxe(chantierOuImpact) && !hasIndicateurDeChantierLevier) {
              const chantierName = chantierOuImpact || 'Autres';
              if (!sectors[sector].chantiers[chantierName]) {
                sectors[sector].chantiers[chantierName] = {
                  name: chantierName,
                  leviers: {}
                };
              }
              const levierKey = "Indicateur de chantier";
              if (!sectors[sector].chantiers[chantierName].leviers[levierKey]) {
                sectors[sector].chantiers[chantierName].leviers[levierKey] = [];
              }
              sectors[sector].chantiers[chantierName].leviers[levierKey].push({
                gristId,
                levier: levierKey,
                indicator: item
              });
            }
          } else if (cleanLevier === "Indicateur d'impact - autres") {
            // Group by chantier name; displayed on Indicateurs d'impact page under chantier title, no submenu
            const chantierName = chantierOuImpact || 'Autres';
            if (!sectors[sector].indicateursImpactAutresByChantier[chantierName]) {
              sectors[sector].indicateursImpactAutresByChantier[chantierName] = [];
            }
            sectors[sector].indicateursImpactAutresByChantier[chantierName].push({
              gristId,
              levier: cleanLevier,
              indicator: item
            });
          } else {
            // This is a chantier or levier indicator
            const chantierName = chantierOuImpact || 'Autres';
            if (!sectors[sector].chantiers[chantierName]) {
              sectors[sector].chantiers[chantierName] = {
                name: chantierName,
                leviers: {}
              };
            }
            
            // Group by levier within the chantier
            const levierKey = cleanLevier || 'Autres indicateurs';
            if (!sectors[sector].chantiers[chantierName].leviers[levierKey]) {
              sectors[sector].chantiers[chantierName].leviers[levierKey] = [];
            }
            sectors[sector].chantiers[chantierName].leviers[levierKey].push({
              gristId,
              levier: levierKey,
              indicator: item
            });
          }
        });
      });
    });
    
    // Enrich the structure with all chantiers & leviers from the dedicated
    // "Liste_leviers" table, so that leviers without indicators still appear.
    if (Array.isArray(levierList)) {
      levierList.forEach(row => {
        const associated = row['Chantier associé'] || '';
        const rawLevierName = row['clean/strip'] || row['Levier'] || '';

        // Skip rows without a chantier association or levier label
        if (!associated || !rawLevierName) return;

        const { sector, chantierOuImpact } = parseChantierOuImpact(associated);
        if (!sector || !chantierOuImpact) return;

        // Ensure sector exists
        if (!sectors[sector]) {
          sectors[sector] = {
            name: sector,
            indicateursImpact: {},
            indicateursImpactAutresByChantier: {},
            chantiers: {}
          };
        }

        // Ensure chantier exists within sector
        if (!sectors[sector].chantiers[chantierOuImpact]) {
          sectors[sector].chantiers[chantierOuImpact] = {
            name: chantierOuImpact,
            leviers: {}
          };
        }

        const levierName = rawLevierName;
        const chantierObj = sectors[sector].chantiers[chantierOuImpact];

        // Ensure levier exists, even if it has no indicators yet
        if (!chantierObj.leviers[levierName]) {
          chantierObj.leviers[levierName] = [];
        }
      });
    }
    
    // Sort leviers within each chantier and enrich with Axe taxonomie from Liste_chantiers
    Object.values(sectors).forEach(sector => {
      Object.entries(sector.chantiers).forEach(([chantierName, chantier]) => {
        // Convert leviers object to sorted array
        const sortedLeviers = Object.entries(chantier.leviers)
          .map(([name, indicators]) => ({ name, indicators, sortOrder: getLevierSortOrder(name) }))
          .sort((a, b) => {
            if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
            return a.name.localeCompare(b.name); // Alphabetical for same order
          });
        chantier.sortedLeviers = sortedLeviers;

        // Enrich with Axe taxonomie from Liste_chantiers (key: chantier name only)
        const axeTaxonomie = (chantiersAxeMap && chantiersAxeMap.get(chantierName)) || [];
        chantier.axeTaxonomie = axeTaxonomie;
        chantier.descriptionChantier =
          (chantiersDescriptionMap && chantiersDescriptionMap.get(chantierName)) || '';
      });
    });

    Object.values(sectors).forEach((sector) => {
      sector.chantiers = sortChantiersObjectKeys(
        sector.chantiers,
        chantiersOrderMap
      );
    });
    
    // Sort sectors alphabetically, with "Synthèse" always first (it's the overview section)
    const sortedSectors = Object.values(sectors)
      .sort((a, b) => {
        // Synthèse always comes first
        if (a.name === 'Synthèse') return -1;
        if (b.name === 'Synthèse') return 1;
        // All other sectors sorted alphabetically
        return a.name.localeCompare(b.name, 'fr');
      });
    
    return {
      status: 'success',
      data: {
        sectors: sortedSectors,
        sectorNames: sortedSectors.map(s => s.name)
      }
    };
  } catch (error) {
    console.error('Error building navigation structure from CSV:', error);
    throw error;
  }
}

/**
 * Build the navigation structure dynamically from Grist data.
 * Résultat mis en cache pour la durée de vie de la page (onglet), par environnement.
 * @param {String} environment - Environment to use (production or staging)
 * @returns {Promise} - Promise resolving to navigation structure
 */
export async function getNavigationStructure(environment = 'production') {
  const key = navigationStructureEnvKey(environment);
  await ensureImpactTaxonomyLoaded();
  if (navigationStructureSessionCache[key]) {
    return navigationStructureSessionCache[key];
  }
  if (!navigationStructureSessionInflight[key]) {
    navigationStructureSessionInflight[key] = (async () => {
      const result = await buildNavigationStructureCore(environment);
      navigationStructureSessionCache[key] = result;
      return result;
    })().finally(() => {
      navigationStructureSessionInflight[key] = null;
    });
  }
  return navigationStructureSessionInflight[key];
}
