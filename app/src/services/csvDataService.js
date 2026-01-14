import Papa from 'papaparse';
import unitDict from '@/utils/unit_dict.json';

// Data source constants
export const GRIST_URLS = {
  production: 'https://grist.numerique.gouv.fr/o/planification-ecologique/api/docs/jGd2ge4dy2ZMaRpdgbPLnd/download/csv?tableId=Tdb_planif_prod',
  staging: 'https://grist.numerique.gouv.fr/o/planification-ecologique/api/docs/jGd2ge4dy2ZMaRpdgbPLnd/download/csv?tableId=Tdb_planif_staging',
  stagingEditPage: 'https://grist.numerique.gouv.fr/o/planification-ecologique/jGd2ge4dy2ZM/Tableau-de-Bord/p/2'
};

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

// Cache variable to store parsed CSV data
let csvDataCache = null;
let fetchPromise = null;

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
      } else if (filter.field === 'grist_ids' && filter.values.length) {
        // Filter by Grist indicator IDs (for engagements, chantiers, leviers)
        const gristIds = Array.isArray(filter.values) ? filter.values : [filter.values];
        filteredData = filteredData.filter(item => {
          const itemId = item.ID;
          return gristIds.some(gristId => itemId === gristId);
        });
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
    const targetValue = item[`Objectifs ${targetYear}`] || '';

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
      values: {
        x: [years],
        y: y,
        ytab: values,
        legend: legend,
        colors: colors
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
  
  // Projection series
  const hasProjection = Object.keys(projectionData).length > 0;
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
  
  // Target series
  const hasTarget = Object.keys(targetData).length > 0;
  if (hasTarget) {
    const target = allYears.map(year => targetData[year] || 0);
    // Zero out years where we have historical or projection data
    target.forEach((val, idx) => {
      const year = allYears[idx];
      if (historicalData[year] || projectionData[year]) {
        target[idx] = 0;
      }
    });
    if (target.some(v => v !== 0)) {
      seriesData.push(target);
      legend.push('Cible');
      colors.push('blue-ecume');
    }
  } else if (targetValue) {
    // If no target in the years but we have a target value
    // Format the target value with scientific notation if needed
    const targetVal = parseFloat(getScientificNotation(targetValue));
    
    // Create target series with zero for all years except target year
    const target = allYears.map(year => (year === targetYear ? targetVal : 0));
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