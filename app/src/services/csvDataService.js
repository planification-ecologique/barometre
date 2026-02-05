import Papa from 'papaparse';
import unitDict from '@/utils/unit_dict.json';

// Data source constants
export const GRIST_URLS = {
  staging: 'https://grist.numerique.gouv.fr/o/planification-ecologique/api/docs/jGd2ge4dy2ZMaRpdgbPLnd/download/csv?tableId=Tdb_planif_staging',
  stagingEditPage: 'https://grist.numerique.gouv.fr/o/planification-ecologique/jGd2ge4dy2ZM/Tableau-de-Bord/p/2'
};

// Separate table listing all leviers, including those without indicators.
// Source: https://grist.numerique.gouv.fr/o/planification-ecologique/api/docs/jGd2ge4dy2ZMaRpdgbPLnd/download/csv?viewSection=20&tableId=Liste_leviers
export const GRIST_LEVIERS_URL =
  'https://grist.numerique.gouv.fr/o/planification-ecologique/api/docs/jGd2ge4dy2ZMaRpdgbPLnd/download/csv?viewSection=20&tableId=Liste_leviers';

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

// Cache variable to store parsed CSV data
let csvDataCache = null;
let fetchPromise = null;

// Cache for the separate leviers list (Liste_leviers)
let levierListCache = null;
let levierFetchPromise = null;

/** When false, extrapolation (projection) series is excluded from chart data. */
export const SHOW_EXTRAPOLATION = false;

/**
 * Fetches and parses the CSV data
 * @returns {Promise} - Promise resolving to parsed CSV data
 */
export async function fetchCSVData(environment = 'production') {
  // If we already have cached data, return it
  if (csvDataCache) {
    return csvDataCache;
  }
  
  // If we're already fetching, return the existing promise
  if (fetchPromise) {
    return fetchPromise;
  }
  
  // Otherwise start a new fetch
  try {
    const gristCsvUrl = GRIST_URLS[environment] || GRIST_URLS.production;    
    // Create and store the fetch promise
    fetchPromise = (async () => {
      try {
        const response = await fetch(gristCsvUrl);
        const csvText = await response.text();
        
        return new Promise((resolve, reject) => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              // Cache the results
              csvDataCache = results.data;
              // Clear the fetch promise
              fetchPromise = null;
              resolve(results.data);
            },
            error: (error) => {
              // Clear the fetch promise on error
              fetchPromise = null;
              reject(error);
            }
          });
        });
      } catch (error) {
        // Clear the fetch promise on error
        fetchPromise = null;
        throw error;
      }
    })();
    
    return fetchPromise;
  } catch (error) {
    console.error('Error fetching CSV data:', error);
    // Clear the fetch promise on error
    fetchPromise = null;
    throw error;
  }
}

// Function to clear the cache (useful for testing or forcing a refresh)
export function clearCSVCache() {
  csvDataCache = null;
  fetchPromise = null;
}

/**
 * Fetch and parse the Grist "Liste_leviers" table listing all leviers,
 * including those that do not yet have indicators.
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

  try {
    const response = await fetch(GRIST_LEVIERS_URL);
    const csvText = await response.text();

    levierFetchPromise = new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          levierListCache = results.data;
          levierFetchPromise = null;
          resolve(levierListCache);
        },
        error: (error) => {
          levierFetchPromise = null;
          reject(error);
        }
      });
    });

    return levierFetchPromise;
  } catch (error) {
    levierFetchPromise = null;
    console.error('Error fetching leviers list from Grist:', error);
    throw error;
  }
}

/**
 * Updates the staging Grist document URL
 * @param {String} docId - The new staging document ID
 */
export function setStagingDocId(docId) {
  if (docId) {
    GRIST_URLS.staging = `https://grist.numerique.gouv.fr/o/ecolabservicesdonnees/api/docs/${docId}/download/csv?viewSection=562&tableId=Indicateurs_tableau_v1`;
    // Clear cache to ensure using new URL
    clearCSVCache();
  }
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
      } else if (filter.field === 'grist_ids') {
        // Filter by Grist indicator IDs (for engagements, chantiers, leviers)
        // If values is empty, return empty array (no matches)
        if (!filter.values || filter.values.length === 0) {
          filteredData = [];
        } else {
          const gristIds = Array.isArray(filter.values) ? filter.values : [filter.values];
          
          // First, find all matching rows by ID
          const matchedRows = filteredData.filter(item => {
            const itemId = item.ID;
            return gristIds.some(gristId => itemId === gristId);
          });
          
          // Then, get all indicator names from matched rows (to handle multi-line charts)
          const matchedIndicatorNames = new Set(matchedRows.map(item => item.Indicateur).filter(name => name));
          
          // Finally, include ALL rows that either match by ID OR share the same indicator name
          // This ensures multi-line charts (with sub-groups) get all their data
          filteredData = filteredData.filter(item => {
            const itemId = item.ID;
            const indicatorName = item.Indicateur;
            
            // Include if ID matches directly
            if (gristIds.some(gristId => itemId === gristId)) {
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

  // Transform to API response format
  const results = filteredData.map(item => {
    // Extract years and values
    const years = [];
    const values = [];
    const statuses = []; // mesuré, projection, cible
    
    for (let i = 2017; i <= 2030; i++) {
      const yearStr = i.toString();
      if (item[yearStr] && item[yearStr] !== '') {
        years.push(yearStr);
        
        // Parse floating point values correctly
        // Replace commas with periods if needed (for French decimal format)
        const normalizedValue = item[yearStr].toString().replace(',', '.');
        // Parse and then limit to exactly two decimal places
        values.push(parseFloat(parseFloat(normalizedValue).toFixed(2)));
        
        const labelKey = `label_${yearStr}`;
        statuses.push(item[labelKey] || '');
      }
    }

    // Target year
    const targetYear = '2030';
    let targetValue = item[targetYear] || '';
    const targetValueNumeric = parseFloat(parseFloat((targetValue || '').toString().replace(',', '.')).toFixed(2));
    const targetValueIsNumeric = !isNaN(targetValueNumeric);
    // Ensure 2030 is in the chart when we have a target (so target segment can be drawn)
    if ((targetValue || item[targetYear]) && !years.includes(targetYear)) {
      years.push(targetYear);
      const val2030 = targetValueIsNumeric ? targetValueNumeric : parseFloat(parseFloat((item[targetYear] || '').toString().replace(',', '.')).toFixed(2));
      values.push(!isNaN(val2030) ? val2030 : 0);
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

    // Segment from last measured year to 2030 target (for blue trajectory line)
    let targetSegment = null;
    let lastMeasuredIndex = -1;
    for (let i = 0; i < statuses.length; i++) {
      if ((statuses[i] || '').toString().toLowerCase() === 'mesuré') lastMeasuredIndex = i;
    }
    if (lastMeasuredIndex >= 0 && (targetValue || years.includes(targetYear))) {
      const idx2030 = years.indexOf(targetYear);
      // 2030 value is valid only if not empty and not NA (so we only consider has2030 when we have a real value)
      const raw2030 = (targetValue != null && String(targetValue).trim() !== '') ? targetValue : (item[targetYear] ?? '');
      const is2030ValueValid = raw2030 !== '' && ['na', 'nan'].indexOf(String(raw2030).toLowerCase().trim()) === -1 && !isNaN(Number(String(raw2030).replace(',', '.')));
      const has2030 = years.includes(targetYear) && is2030ValueValid;
      // Use numeric "Objectifs 2030" when valid; else use the value already in data for 2030 (e.g. from CSV year column or label like "SNBC 3 (provisoire)")
      const endVal = targetValueIsNumeric ? targetValueNumeric : (has2030 && idx2030 >= 0 && values[idx2030] != null ? Number(values[idx2030]) : null);
      if (endVal != null && !isNaN(endVal) && has2030) {
        targetSegment = {
          startYear: years[lastMeasuredIndex],
          startValue: values[lastMeasuredIndex],
          endYear: targetYear,
          endValue: endVal
        };
      }
    }
    
    // Dernière valeur: last "mesuré" (measured) data point with a valid value
    let valeur_actuelle = null;
    let date_valeur_actuelle = null;
    for (let i = values.length - 1; i >= 0; i--) {
      const status = (statuses[i] || '').toString().toLowerCase();
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
    return {
      label_indic: item.Indicateur,
      id_indic: item.ID,
      label_description: (item.Description || '').toString() + nbNote,
      label_unit: formattedUnitLong,
      label_unit_short: formattedUnitShort,
      label_tags: item['Tags objectifs environnementaux'],
      label_sources: item.Sources,
      lien_donnees_source: item['Lien données source'],
      lien_site_source: item['Lien site source'],
      label_perimetre: item.Périmètre,
      int_ordre: parseInt(item.Ordre) || 0,
      int_annee_cible: 2030,
      date_maj: item['Dernière mise à jour'],
      label_sous_groupe: item['Sous-niveau (graphique)'] || '',
      label_value: statuses,
      type_de_graphique: chartType,
      // For synthesis tables (EngagementsTableView, ChantiersTableView)
      objectif_valeur_cible,
      valeur_actuelle,
      date_valeur_actuelle,
      unite: formattedUnitLong,
      // Add new fields from Grist
      levier: item['Levier'] || '',
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
      values: {
        x: [years],
        y: y,
        ytab: values,
        legend: legend,
        colors: colors,
        trendLine: statuses.some(s => {
          const t = (s || '').toString().toLowerCase();
          return t === 'projection' || t === 'cible';
        }) ? computeTrendLine(years, values, statuses) : null,
        targetSegment
      }
    };
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
        const searchTerm = filter.values[0].toLowerCase().trim();
        if (searchTerm) {
          groupedResults = groupedResults.filter(item => {
            // Search in title (label_indic)
            const titleMatch = item.label_indic && item.label_indic.toLowerCase().includes(searchTerm);
            
            // Search in description
            const descMatch = item.label_description && item.label_description.toLowerCase().includes(searchTerm);
            
            // Search in tags
            const tagMatch = item.label_tags && 
              item.label_tags.toLowerCase().includes(searchTerm);
            
            // Search in sub-group labels (for grouped indicators)
            const subGroupMatch = Array.isArray(item.label_sous_groupe) && 
              item.label_sous_groupe.some(subGroup => 
                subGroup && subGroup.toLowerCase().includes(searchTerm)
              );
            
            return titleMatch || descMatch || tagMatch || subGroupMatch;
          });
        }
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

/**
 * Computes a trend line based on the last N years of measured data.
 * @param {Array<string>} years - Year labels (e.g. ['2017','2018',...])
 * @param {Array<number>} ytab - Value for each year (same order as years)
 * @param {Array<string>} statuses - Status per year ('mesuré', 'projection', 'cible')
 * @param {number} numYears - Number of measured years to use (default 3)
 * @returns {Array<number>|null} - Trend y value for each year index, or null if insufficient measured data
 */
export function computeTrendLine(years, ytab, statuses, numYears = 3) {
  if (!years?.length || !ytab?.length || years.length !== ytab.length) return null;
  const measured = [];
  for (let i = 0; i < years.length; i++) {
    const s = (statuses[i] || '').toString().toLowerCase();
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
 * Group indicators by their label and process sub-groups
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
      const baseItem = {...item};
      baseItem.label_sous_groupe = [item.label_sous_groupe];
      // Make sure date is a nested array format expected by the chart component
      baseItem.date = item.values.x;
      baseItem.values = [item.values.ytab];
      indicatorMap.set(key, baseItem);
    } else {
      // Add to existing grouped item
      const groupedItem = indicatorMap.get(key);
      groupedItem.label_sous_groupe.push(item.label_sous_groupe);
      groupedItem.values.push(item.values.ytab);

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
      
      // Preserve perimetre information if empty
      if ((!groupedItem.label_perimetre || groupedItem.label_perimetre.trim() === '') && 
          item.label_perimetre && item.label_perimetre.trim() !== '') {
        groupedItem.label_perimetre = item.label_perimetre;
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
      
      // Merge arrays without duplicates using a more compatible approach
      const existingDates = groupedItem.date[0];
      // Safely access the new dates - handle different possible structures
      const newDates = Array.isArray(item.values.x[0]) ? item.values.x[0] : item.values.x;
      
      const mergedDates = [...existingDates];
      newDates.forEach(date => {
        if (!mergedDates.includes(date)) {
          mergedDates.push(date);
        }
      });
      groupedItem.date = [mergedDates];
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
  
  // Assign each value to appropriate category based on status label
  list_y.forEach((value, index) => {
    const year = list_x[index];
    const status = statuses[index].toLowerCase();
    
    // Format the value with scientific notation if needed
    const formattedValue = parseFloat(getScientificNotation(value));
    
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
      if (parseInt(year) <= currentYear) {
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
  
  // Historical series
  const hasHistorical = Object.keys(historicalData).length > 0;
  if (hasHistorical) {
    const history = allYears.map(year => historicalData[year] || 0);
    // Zero out years where we have projection or target data
    history.forEach((val, idx) => {
      const year = allYears[idx];
      if (projectionData[year] || targetData[year]) {
        history[idx] = 0;
      }
    });
    if (history.some(v => v !== 0)) {
      seriesData.push(history);
      legend.push('Historique');
      colors.push('brown-cafe-creme');
    }
  }
  
  // Projection series (extrapolation) – controlled by SHOW_EXTRAPOLATION
  const hasProjection = SHOW_EXTRAPOLATION && Object.keys(projectionData).length > 0;
  if (hasProjection) {
    const projection = allYears.map(year => projectionData[year] || 0);
    // Zero out years where we have historical or target data
    projection.forEach((val, idx) => {
      const year = allYears[idx];
      if (historicalData[year] || targetData[year]) {
        projection[idx] = 0;
      }
    });
    if (projection.some(v => v !== 0)) {
      seriesData.push(projection);
      legend.push('Extrapolation');
      colors.push('green-emeraude');
    }
  }
  
  // Target series: only 2030 target
  const targetValFor2030 = targetData[targetYear] != null
    ? targetData[targetYear]
    : (targetValue ? parseFloat(getScientificNotation(targetValue)) : null);
  if (targetValFor2030 != null && !isNaN(targetValFor2030)) {
    const target = allYears.map(year => (year === targetYear ? targetValFor2030 : 0));
    seriesData.push(target);
    legend.push('Cible');
    colors.push('blue-ecume');
  }
  
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
 * Parse the "Levier" column which is a list field.
 * We avoid naïvely splitting on all commas to not break labels that contain commas.
 * Instead, we detect known levier labels inside the string.
 * @param {String} value - Raw levier value
 * @returns {string[]} - List of levier labels
 */
function parseLevierList(value) {
  if (value == null) return [];
  let s = String(value).trim();
  if (!s || s.toLowerCase() === 'nan') return [];

  // Clean surrounding quotes if the whole field is quoted
  s = s.replace(/^[\s"']+|[\s"']+$/g, '').trim();

  const knownLeviers = [
    "Indicateur d'impact",
    "Indicateur de chantier",
    "Indicateur d'impact - autres",
    "Autres indicateurs",
  ];

  const result = [];

  knownLeviers.forEach(label => {
    if (s.includes(label)) {
      result.push(label);
    }
  });

  // If none of the known labels matched, keep the raw string as a single entry
  if (result.length === 0 && s) {
    result.push(s);
  }

  return result;
}

// Known taxonomy axes used for impact indicators
const IMPACT_AXES = [
  'Atténuation climat',
  'Adaptation climat',
  'Biodiversité',
  'Pollution',
  'Economie Circulaire',
  'Économie Circulaire',
  'Eau',
];

function isImpactAxe(name) {
  if (!name) return false;
  const cleaned = String(name).trim();
  return IMPACT_AXES.includes(cleaned);
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
 * Build the navigation structure dynamically from Grist data
 * @param {String} environment - Environment to use (production or staging)
 * @returns {Promise} - Promise resolving to navigation structure
 */
export async function getNavigationStructure(environment = 'production') {
  try {
    // Load indicators and full leviers list in parallel
    const [csvData, levierList] = await Promise.all([
      fetchCSVData(environment),
      fetchLevierList()
    ]);
    
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
            // Group by chantierOuImpact (taxonomy_axe like "Atténuation climat")
            const axe = chantierOuImpact || 'Autre';
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
            if (!isImpactAxe(chantierOuImpact)) {
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
    
    // Sort leviers within each chantier
    Object.values(sectors).forEach(sector => {
      Object.values(sector.chantiers).forEach(chantier => {
        // Convert leviers object to sorted array
        const sortedLeviers = Object.entries(chantier.leviers)
          .map(([name, indicators]) => ({ name, indicators, sortOrder: getLevierSortOrder(name) }))
          .sort((a, b) => {
            if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
            return a.name.localeCompare(b.name); // Alphabetical for same order
          });
        chantier.sortedLeviers = sortedLeviers;
      });
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
