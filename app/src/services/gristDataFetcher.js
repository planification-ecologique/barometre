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
export const GRIST_CHANTIERS_URL = gristUrlsConfig.GRIST_CHANTIERS_URL || null;
export const GRIST_TAXONOMIE_URL = gristUrlsConfig.GRIST_TAXONOMIE_URL || null;

// Cache for fetch promises to prevent duplicate requests
let indicatorsFetchPromise = null;
let leviersFetchPromise = null;
let taxonomieFetchPromise = null;
let engagementsFetchPromise = null;
let chantiersFetchPromise = null;
let engagementLongMappingPromise = null;

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
function publicAssetBasePath() {
  const raw =
    (typeof process !== 'undefined' && process.env && process.env.VUE_APP_PREFIX_PATH) || ''
  return String(raw).replace(/\/$/, '')
}

async function loadLocalBackup(filename) {
  try {
    const base = publicAssetBasePath()
    const url = `${base}/grist-backups/${filename}`
    const response = await fetch(url)
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

/**
 * Liste_taxonomie (Grist) : colonnes « Nom complet », « Nom court » — ordre des lignes = ordre d’affichage.
 * @returns {Promise<Array<Record<string, string>>>}
 */
export async function fetchTaxonomieData() {
  if (!GRIST_TAXONOMIE_URL) {
    return [];
  }
  if (taxonomieFetchPromise) {
    return taxonomieFetchPromise;
  }

  taxonomieFetchPromise = fetchCSVText(GRIST_TAXONOMIE_URL, 'grist-taxonomie.csv')
    .then((csvText) => parseCSVText(csvText))
    .then((parsedData) => {
      taxonomieFetchPromise = null;
      return parsedData;
    })
    .catch((error) => {
      taxonomieFetchPromise = null;
      console.warn('Could not load Liste_taxonomie:', error.message);
      return [];
    });

  return taxonomieFetchPromise;
}

/**
 * Fetch Liste_engagements (Engagement, Thématique, Axe taxonomie).
 * Returns map: nom complet d’axe (Liste_taxonomie) → premier engagement pour cet axe.
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
      const [csvText, taxoRows] = await Promise.all([
        fetchCSVText(GRIST_ENGAGEMENTS_URL, 'grist-engagements.csv'),
        fetchTaxonomieData(),
      ]);
      const rows = await parseCSVText(csvText);
      const map = new Map();

      const nomCourtToComplet = new Map();
      for (const tr of taxoRows || []) {
        const long = String(tr['Nom complet'] ?? tr.Nom_complet ?? '').trim();
        const short = String(tr['Nom court'] ?? tr.Nom_court ?? '').trim();
        if (long && short) nomCourtToComplet.set(short, long);
      }

      const toDisplayAxe = (axeTaxo) =>
        nomCourtToComplet.get(axeTaxo) || axeTaxo;

      for (const row of rows) {
        const axeTaxo = String(row['Axe taxonomie'] ?? row['Axe_taxonomie'] ?? '').trim();
        const engagement = String(row['Engagement'] ?? '').trim();
        if (!axeTaxo || !engagement) continue;
        const displayAxe = toDisplayAxe(axeTaxo);
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
 * Extract chantier name from "Sector / Chantier" or use as-is if no slash.
 */
function toChantierKey(value) {
  const s = String(value ?? '').trim();
  const idx = s.indexOf(' / ');
  return idx >= 0 ? s.slice(idx + 3).trim() : s;
}

/**
 * Multiple axes in Liste_chantiers can be stored in one cell (comma/semicolon/newline)
 * or as a JSON array string when exported from Grist.
 * @param {unknown} raw - Cell value from CSV/API
 * @returns {string[]}
 */
function parseAxeTaxonomieCell(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.flatMap((v) => parseAxeTaxonomieCell(v));
  }
  const s = String(raw).trim();
  if (!s || s.toLowerCase() === 'nan') return [];
  if (s.startsWith('[')) {
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) {
        return parsed
          .map((x) => String(x).trim())
          .filter(Boolean);
      }
    } catch {
      /* treat as plain text below */
    }
  }
  return s
    .split(/[,;\n]+/)
    .map((part) => part.trim().replace(/^["']+|["']+$/g, ''))
    .filter(Boolean);
}

/**
 * Fetch Liste_chantiers (Chantier or Chantier associé, Axe taxonomie, Description chantier).
 * @returns {Promise<{ axesByChantier: Map<string, string[]>, descriptionByChantier: Map<string, string> }>}
 */
export async function fetchChantiersData() {
  const empty = () => ({
    axesByChantier: new Map(),
    descriptionByChantier: new Map(),
  });

  if (!GRIST_CHANTIERS_URL) {
    return empty();
  }

  if (chantiersFetchPromise) {
    return chantiersFetchPromise;
  }

  chantiersFetchPromise = (async () => {
    const buildMapsFromRows = (rows) => {
      const axesByChantier = new Map();
      const descriptionByChantier = new Map();

      for (const row of rows) {
        const raw = String(
          row['Chantier'] ?? row['Chantier associé'] ?? row['Chantier ou Impact'] ?? ''
        ).trim();
        const chantierKey = toChantierKey(raw);
        if (!chantierKey) continue;

        const axeParts = parseAxeTaxonomieCell(
          row['Axe taxonomie'] ?? row['Axe_taxonomie'] ?? ''
        );
        if (axeParts.length > 0) {
          if (!axesByChantier.has(chantierKey)) {
            axesByChantier.set(chantierKey, []);
          }
          const arr = axesByChantier.get(chantierKey);
          for (const axeTaxo of axeParts) {
            if (axeTaxo && !arr.includes(axeTaxo)) {
              arr.push(axeTaxo);
            }
          }
        }

        const desc = String(
          row['Description chantier'] ??
            row['Description_chantier'] ??
            row['Description Chantier'] ??
            ''
        ).trim();
        if (desc && !descriptionByChantier.has(chantierKey)) {
          descriptionByChantier.set(chantierKey, desc);
        }
      }

      return { axesByChantier, descriptionByChantier };
    };

    try {
      // Load local backup first (works offline / when API returns 404).
      let axesByChantier = new Map();
      let descriptionByChantier = new Map();
      try {
        const backupText = await loadLocalBackup('grist-chantiers.csv');
        const backupRows = await parseCSVText(backupText);
        const built = buildMapsFromRows(backupRows);
        axesByChantier = built.axesByChantier;
        descriptionByChantier = built.descriptionByChantier;
      } catch (backupErr) {
        console.warn('Liste_chantiers backup unavailable:', backupErr.message);
      }

      // When the API responds, use live Grist data (backup alone hid multi-axis updates).
      try {
        const response = await fetch(GRIST_CHANTIERS_URL);
        if (response.ok) {
          const csvText = await response.text();
          const rows = await parseCSVText(csvText);
          const built = buildMapsFromRows(rows);
          axesByChantier = built.axesByChantier;
          descriptionByChantier = built.descriptionByChantier;
        }
      } catch (apiErr) {
        console.warn('Liste_chantiers API unavailable:', apiErr.message);
      }

      chantiersFetchPromise = null;
      return { axesByChantier, descriptionByChantier };
    } catch (error) {
      chantiersFetchPromise = null;
      console.warn('Could not load Liste_chantiers, axe taxonomie column may be empty:', error.message);
      return empty();
    }
  })();

  return chantiersFetchPromise;
}

/**
 * Fetch Liste_engagements and build Thématique → Engagement (long) mapping.
 * Used to display the long version of engagement in Etat environnement synthesis.
 * @returns {Promise<Map<string, string>>} Map of Thématique (short) → Engagement (long)
 */
export async function fetchEngagementLongMapping() {
  if (!GRIST_ENGAGEMENTS_URL) {
    return new Map();
  }

  if (engagementLongMappingPromise) {
    return engagementLongMappingPromise;
  }

  engagementLongMappingPromise = (async () => {
    try {
      const csvText = await fetchCSVText(GRIST_ENGAGEMENTS_URL, 'grist-engagements.csv');
      const rows = await parseCSVText(csvText);
      const map = new Map();

      for (const row of rows) {
        const thematique = String(row['Thématique'] ?? row['Thematique'] ?? '').trim();
        const engagement = String(row['Engagement'] ?? '').trim();
        if (!thematique || !engagement) continue;
        map.set(thematique, engagement);
      }

      engagementLongMappingPromise = null;
      return map;
    } catch (error) {
      engagementLongMappingPromise = null;
      console.warn('Could not load engagement long mapping:', error.message);
      return new Map();
    }
  })();

  return engagementLongMappingPromise;
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
