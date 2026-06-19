#!/usr/bin/env node

/**
 * Build-time script to cache Écolab IRPE regional data as local JSON files.
 * Files are served from public/irpe-backups/ at runtime (no live API calls needed).
 */

const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const ECOLAB_BASE = 'https://api.indicateurs.ecologie.gouv.fr/cubejs-api/v1';
const ECOLAB_CONTINUE_WAIT_DELAY_MS = 10000;
const ECOLAB_CONTINUE_WAIT_MAX_RETRIES = 6;
const TIME_DIM_PATTERNS = ['annee', 'année', 'year', 'date', 'annee_cible', 'annee_donnees', 'date_mesure'];

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'irpe-backups');
const INDICATORS_DIR = path.join(OUTPUT_DIR, 'indicators');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');
const META_PATH = path.join(OUTPUT_DIR, 'meta.json');
const GRIST_INDICATORS_CSV = path.join(__dirname, '..', 'public', 'grist-backups', 'grist-indicators.csv');
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const KNOWN_INDICATOR_CUBES = {
  '949': {
    cubeName: 'residences_principales_energie_region',
    measureName: 'residences_principales_energie_region.id_949',
    timeDimension: 'residences_principales_energie_region.date_mesure',
  },
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadEnvFile(filename) {
  const envPath = path.join(__dirname, '..', filename);
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function getAuthHeader() {
  const token = process.env.VUE_APP_ECOLAB_API_TOKEN || process.env.VUE_ECOLAB_API_TOKEN;
  if (!token || String(token).trim() === '') {
    throw new Error(
      'VUE_APP_ECOLAB_API_TOKEN is not set. Add it to app/.env before running download-irpe-cache.'
    );
  }
  return { Authorization: `Bearer ${token}` };
}

function isContinueWaitResponse(body) {
  return body && typeof body === 'object' && body.error === 'Continue wait';
}

async function fetchEcolabJson(url, options, context = '') {
  for (let attempt = 0; attempt <= ECOLAB_CONTINUE_WAIT_MAX_RETRIES; attempt++) {
    const res = await fetch(url, options);
    if (res.status === 401) {
      throw new Error('Token Écolab manquant ou invalide.');
    }
    if (res.status === 403) {
      throw new Error('Accès refusé par l\'API Écolab (403).');
    }
    if (!res.ok) {
      throw new Error(`Écolab API ${context}: ${res.status} ${res.statusText}`);
    }
    const body = await res.json();
    if (!isContinueWaitResponse(body)) return body;

    if (attempt === ECOLAB_CONTINUE_WAIT_MAX_RETRIES) {
      throw new Error(
        `Écolab API ${context}: Continue wait après ${ECOLAB_CONTINUE_WAIT_MAX_RETRIES + 1} tentatives.`
      );
    }

    console.warn(
      `[Écolab API] ${context}: Continue wait, retry in ${ECOLAB_CONTINUE_WAIT_DELAY_MS / 1000}s (${attempt + 1}/${ECOLAB_CONTINUE_WAIT_MAX_RETRIES + 1})`
    );
    await sleep(ECOLAB_CONTINUE_WAIT_DELAY_MS);
  }
  throw new Error(`Écolab API ${context}: requête interrompue.`);
}

async function postEcolabLoad(query, context = 'load') {
  return fetchEcolabJson(
    `${ECOLAB_BASE}/load`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ query }),
    },
    context
  );
}

function getTimeDimension(meta, cubeName) {
  const cube = (meta?.cubes || []).find((c) => c.name === cubeName);
  const dims = cube?.dimensions || [];
  for (const d of dims) {
    const short = (d.name || '').replace(`${cubeName}.`, '').toLowerCase();
    if (TIME_DIM_PATTERNS.some((p) => short === p || short.includes(p))) return d.name;
  }
  return null;
}

function resolveRegionCubeForIndicator(meta, indicatorId) {
  const id = String(indicatorId).trim();
  if (!id) return null;
  const known = KNOWN_INDICATOR_CUBES[id];
  if (known) return known;

  if (!meta?.cubes || !Array.isArray(meta.cubes)) return null;
  const suffix = `.id_${id}`;
  for (const cube of meta.cubes) {
    const cubeName = cube.name;
    const hasRegion = (cube.dimensions || []).some(
      (d) => d.name === `${cubeName}.libelle_region` || d.name === `${cubeName}.geocode_region`
    );
    if (!hasRegion) continue;
    const measure = (cube.measures || []).find((m) => m.name && m.name.endsWith(suffix));
    if (measure) {
      const timeDim = getTimeDimension(meta, cubeName);
      return { cubeName, measureName: measure.name, timeDimension: timeDim || undefined };
    }
  }
  return null;
}

function buildRegionQuery(cubeName, measureName, options = {}) {
  const dimensions = [`${cubeName}.libelle_region`, `${cubeName}.geocode_region`];
  const query = {
    measures: [measureName],
    dimensions,
    limit: 5000,
    timezone: 'UTC',
  };
  if (options.timeDimension) {
    query.timeDimensions = [{ dimension: options.timeDimension, granularity: 'year' }];
    query.order = { [options.timeDimension]: 'asc' };
  }
  const filters = [];
  if (options.regionCode) {
    filters.push({
      member: `${cubeName}.geocode_region`,
      operator: 'equals',
      values: [options.regionCode],
    });
  } else if (options.regionLabel) {
    filters.push({
      member: `${cubeName}.libelle_region`,
      operator: 'equals',
      values: [options.regionLabel],
    });
  }
  if (options.dimensionFilter) {
    filters.push({
      member: options.dimensionFilter.dimension,
      operator: 'equals',
      values: [options.dimensionFilter.value],
    });
  }
  if (filters.length) query.filters = filters;
  return query;
}

function parseValidatedIrpeIdsFromGristCsv() {
  if (!fs.existsSync(GRIST_INDICATORS_CSV)) {
    throw new Error(
      `Missing ${GRIST_INDICATORS_CSV}. Run npm run download-grist-csvs first.`
    );
  }
  const csvText = fs.readFileSync(GRIST_INDICATORS_CSV, 'utf8');
  const { data } = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  const ids = new Set();
  for (const row of data) {
    const valid = String(row['IRPE valide'] || '').trim().toLowerCase();
    if (valid !== 'true') continue;
    String(row['IRPE ids'] || '')
      .split(/[,;]/)
      .forEach((part) => {
        const id = part.replace(/^id_/i, '').trim();
        if (id) ids.add(id);
      });
  }
  return Array.from(ids).sort((a, b) => Number(a) - Number(b));
}

async function loadAllRegionsDataForIndicator(meta, indicatorId) {
  const resolved = resolveRegionCubeForIndicator(meta, indicatorId);
  if (!resolved) {
    throw new Error(`Indicateur non trouvé dans l'API Écolab. ID: ${indicatorId}`);
  }
  const { cubeName, measureName, timeDimension: resolvedTimeDim } = resolved;
  const timeDim = resolvedTimeDim || getTimeDimension(meta, cubeName);
  const result = await postEcolabLoad(
    buildRegionQuery(cubeName, measureName, { timeDimension: timeDim || undefined }),
    `indicator ${indicatorId}`
  );
  const data = result?.data || [];

  let extraDimension = null;
  const cube = (meta?.cubes || []).find((c) => c.name === cubeName);
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
    measureMeta,
  };
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function readExistingIndicatorPayload(indicatorId) {
  const filePath = indicatorCachePath(indicatorId);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function validateIndicatorPayload(payload, existing) {
  const rowCount = Array.isArray(payload?.data) ? payload.data.length : 0;
  const existingRows = Array.isArray(existing?.data) ? existing.data.length : 0;

  if (rowCount === 0) {
    throw new Error('Réponse API vide.');
  }

  if (existingRows > 0 && rowCount < existingRows) {
    throw new Error(`Moins de lignes qu'en cache (${rowCount} < ${existingRows}).`);
  }
}

function readManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  } catch {
    return null;
  }
}

function isCacheFresh(manifest) {
  if (!manifest?.generatedAt) return false;
  const generatedAt = new Date(manifest.generatedAt).getTime();
  if (Number.isNaN(generatedAt)) return false;
  const ageMs = Date.now() - generatedAt;
  return ageMs >= 0 && ageMs < CACHE_MAX_AGE_MS;
}

function indicatorCachePath(indicatorId) {
  return path.join(INDICATORS_DIR, `${indicatorId}.json`);
}

function getMissingIndicatorIds(indicatorIds) {
  return indicatorIds.filter((id) => !fs.existsSync(indicatorCachePath(id)));
}

async function main() {
  loadEnvFile('.env');
  loadEnvFile('.env.production');
  loadEnvFile('.env.local');

  const forceRefresh =
    process.argv.includes('--force') || process.env.IRPE_CACHE_FORCE === '1';

  console.log('Starting Écolab IRPE cache download...\n');
  if (forceRefresh) {
    console.log('Force refresh enabled — ignoring cache age.\n');
  }

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  if (!fs.existsSync(INDICATORS_DIR)) fs.mkdirSync(INDICATORS_DIR, { recursive: true });

  const indicatorIds = parseValidatedIrpeIdsFromGristCsv();
  if (!indicatorIds.length) {
    throw new Error('No validated IRPE ids found in grist-indicators.csv');
  }
  console.log(`Found ${indicatorIds.length} validated IRPE indicator id(s).\n`);

  const manifest = readManifest();
  const cacheFresh = !forceRefresh && isCacheFresh(manifest);
  const missingIds = getMissingIndicatorIds(indicatorIds);
  const needsMeta = !fs.existsSync(META_PATH) || !cacheFresh;
  const idsToFetch = cacheFresh ? missingIds : indicatorIds;

  if (cacheFresh && !needsMeta && idsToFetch.length === 0) {
    console.log(`IRPE cache is fresh (generated ${manifest.generatedAt}), skipping download.`);
    return;
  }

  if (cacheFresh) {
    console.log(`IRPE cache is fresh; fetching ${idsToFetch.length} missing indicator(s) only.\n`);
  } else if (manifest?.generatedAt) {
    console.log(`IRPE cache is older than 1 day (generated ${manifest.generatedAt}), refreshing.\n`);
  }

  let meta;
  if (needsMeta) {
    console.log('Fetching Écolab meta...');
    meta = await fetchEcolabJson(`${ECOLAB_BASE}/meta`, { headers: getAuthHeader() }, 'meta');
    writeJson(META_PATH, meta);
    console.log('✓ Saved meta.json\n');
  } else {
    meta = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
    console.log('Using cached meta.json\n');
  }

  const errors = [];
  for (const indicatorId of idsToFetch) {
    try {
      console.log(`Fetching indicator ${indicatorId}...`);
      const existing = readExistingIndicatorPayload(indicatorId);
      const payload = await loadAllRegionsDataForIndicator(meta, indicatorId);
      validateIndicatorPayload(payload, existing);
      writeJson(indicatorCachePath(indicatorId), payload);
      console.log(`✓ Saved indicators/${indicatorId}.json (${payload.data.length} rows)`);
    } catch (error) {
      console.error(`✗ Error caching indicator ${indicatorId}:`, error.message);
      errors.push({ indicatorId, error: error.message });
    }
  }

  writeJson(MANIFEST_PATH, {
    generatedAt: new Date().toISOString(),
    indicatorIds,
    cachedCount: indicatorIds.filter((id) => fs.existsSync(indicatorCachePath(id))).length,
    failed: errors,
  });

  console.log('\n--- Download Summary ---');
  if (errors.length === 0) {
    if (idsToFetch.length === 0) {
      console.log('✓ IRPE cache unchanged.');
    } else {
      console.log(`✓ Cached ${idsToFetch.length} IRPE indicator(s) successfully!`);
    }
    console.log(`Files saved to: ${OUTPUT_DIR}`);
    return;
  }

  console.error(`✗ ${errors.length} indicator(s) failed to cache:`);
  errors.forEach(({ indicatorId, error }) => {
    console.error(`  - ${indicatorId}: ${error}`);
  });
  process.exit(1);
}

main().catch((error) => {
  console.error('Fatal error:', error.message || error);
  process.exit(1);
});
