/**
 * Service for fetching and parsing CSV data from Grist API
 * Handles downloading CSV text from API with fallback to local backups,
 * and parsing CSV text into structured data
 */

import Papa from 'papaparse';
import gristUrlsConfig from '@/config/gristUrls.json';

// Data source constants - loaded from shared config
export const GRIST_URLS = gristUrlsConfig.GRIST_URLS;
export const GRIST_LEVIERS_URL = gristUrlsConfig.GRIST_LEVIERS_URL;
export const GRIST_ENGAGEMENTS_URL = gristUrlsConfig.GRIST_ENGAGEMENTS_URL || null;

// Cache for fetch promises to prevent duplicate requests
let indicatorsFetchPromise = null;
let leviersFetchPromise = null;
let engagementsFetchPromise = null;

/**
 * Parse CSV text into structured data
 * @param {string} csvText - CSV text content
 * @returns {Promise<Array>} - Parsed CSV data
 */
function parseCSVText(csvText) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

/**
 * Load CSV from local backup file (fallback when API is unavailable)
 * @param {string} filename - Name of the backup file
 * @returns {Promise<string>} - CSV text content
 */
async function loadLocalBackup(filename) {
  try {
    const response = await fetch(`/grist-backups/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load backup: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.warn(`Could not load local backup ${filename}:`, error);
    throw error;
  }
}

/**
 * Fetch CSV text from Grist API with fallback to local backup
 * @param {string} url - URL to fetch from
 * @param {string} backupFilename - Filename of the backup file to use as fallback
 * @returns {Promise<string>} - CSV text content
 */
async function fetchCSVText(url, backupFilename) {
  // Try to fetch from API first
  try {
    const response = await fetch(url);
    if (response.ok) {
      return await response.text();
    } else {
      throw new Error(`API returned ${response.status}`);
    }
  } catch (apiError) {
    console.warn(`Grist API unavailable, falling back to local backup (${backupFilename}):`, apiError.message);
    
    // Fallback to local backup file
    try {
      const csvText = await loadLocalBackup(backupFilename);
      console.info(`✓ Loaded CSV data from local backup: ${backupFilename}`);
      return csvText;
    } catch (backupError) {
      throw new Error(`Failed to fetch CSV data from API and backup: ${backupError.message}`);
    }
  }
}

/**
 * Fetch and parse indicators CSV data
 * @param {string} environment - Environment to use (production or staging)
 * @returns {Promise<Array>} - Parsed CSV data
 */
export async function fetchIndicatorsData(environment = 'production') {
  // If we're already fetching, return the existing promise
  if (indicatorsFetchPromise) {
    return indicatorsFetchPromise;
  }

  const gristCsvUrl = GRIST_URLS[environment] || GRIST_URLS.production;
  
  indicatorsFetchPromise = fetchCSVText(gristCsvUrl, 'grist-indicators.csv')
    .then((csvText) => parseCSVText(csvText))
    .then((parsedData) => {
      indicatorsFetchPromise = null;
      return parsedData;
    })
    .catch((error) => {
      indicatorsFetchPromise = null;
      throw error;
    });

  return indicatorsFetchPromise;
}

/**
 * Fetch and parse leviers CSV data
 * @returns {Promise<Array>} - Parsed CSV data
 */
export async function fetchLeviersData() {
  // If we're already fetching, return the existing promise
  if (leviersFetchPromise) {
    return leviersFetchPromise;
  }

  leviersFetchPromise = fetchCSVText(GRIST_LEVIERS_URL, 'grist-leviers.csv')
    .then((csvText) => parseCSVText(csvText))
    .then((parsedData) => {
      leviersFetchPromise = null;
      return parsedData;
    })
    .catch((error) => {
      leviersFetchPromise = null;
      throw error;
    });

  return leviersFetchPromise;
}

/** Map Liste_engagements "Axe taxonomie" → our display axe names */
const AXE_TAXONOMIE_TO_DISPLAY = {
  'Atténuation': 'Atténuation climat',
  'Adaptation': 'Adaptation climat',
  'Biodiversité': 'Biodiversité',
  'Eau': 'Eau',
  'Pollution': 'Pollution',
  'Economie circulaire': 'Économie circulaire',
  'Économie circulaire': 'Économie circulaire',
};

/**
 * Fetch Liste_engagements (Engagement, Thématique, Axe taxonomie).
 * Returns map: displayAxeName → first engagement for that axe.
 * Used to fill the engagement column in Etat environnement synthesis.
 * @returns {Promise<Map<string, string>>} Map of axe name → engagement
 */
export async function fetchEngagementsByAxe() {
  if (!GRIST_ENGAGEMENTS_URL) {
    return new Map();
  }

  if (engagementsFetchPromise) {
    return engagementsFetchPromise;
  }

  engagementsFetchPromise = (async () => {
    try {
      const csvText = await fetchCSVText(GRIST_ENGAGEMENTS_URL, 'grist-engagements.csv');
      const rows = await parseCSVText(csvText);
      const map = new Map();

      for (const row of rows) {
        const axeTaxo = String(row['Axe taxonomie'] ?? row['Axe_taxonomie'] ?? '').trim();
        const engagement = String(row['Engagement'] ?? '').trim();
        if (!axeTaxo || !engagement) continue;
        const displayAxe = AXE_TAXONOMIE_TO_DISPLAY[axeTaxo] || axeTaxo;
        if (!map.has(displayAxe)) {
          map.set(displayAxe, engagement);
        }
      }

      engagementsFetchPromise = null;
      return map;
    } catch (error) {
      engagementsFetchPromise = null;
      console.warn('Could not load Liste_engagements, engagement column may be empty:', error.message);
      return new Map();
    }
  })();

  return engagementsFetchPromise;
}

/**
 * Updates the staging Grist document URL
 * @param {String} docId - The new staging document ID
 */
export function setStagingDocId(docId) {
  if (docId) {
    GRIST_URLS.staging = `https://grist.numerique.gouv.fr/o/ecolabservicesdonnees/api/docs/${docId}/download/csv?viewSection=562&tableId=Indicateurs_tableau_v1`;
    // Clear fetch promises to ensure using new URL
    indicatorsFetchPromise = null;
  }
}
