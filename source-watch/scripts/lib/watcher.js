#!/usr/bin/env node

/**
 * Shared logic for the source-watcher.
 *
 * Implements per-URL "scan strategies" and lightweight deep vintage (year)
 * extraction so the daily watcher can detect both content changes and the
 * publication of a new edition / vintages on a source.
 *
 * Only Node built-ins are used here on top of ./sourceUrls (notably JSZip for
 * unzipping xlsx/zip archives when available).
 */

const crypto = require('node:crypto');
const JSZip = require('jszip');

const { classifyUrl, httpRequest } = require('./sourceUrls');

const HASH_ALGO = 'sha256';

/** Compute a SHA-256 hex digest of a Buffer (streaming-safe, constant-size). */
function sha256(buffer) {
  return crypto.createHash(HASH_ALGO).update(buffer).digest('hex');
}

/**
 * Best-effort year regex shared by all extractors.
 * Matches 4-digit years in a plausible range.
 */
const YEAR_REGEX = /\b(19[8-9]\d|20[0-4]\d)\b/g;

/** Compress repeated whitespace to make the HTML/page hash more stable. */
function normalizeTextForHash(text) {
  return String(text)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Return the distinct years found in a string (sorted asc). */
function extractYearsFromText(text) {
  const years = new Set();
  const matches = String(text).match(YEAR_REGEX);
  if (matches) {
    for (const m of matches) years.add(m);
  }
  return [...years].sort();
}

/** Max year found in a string, or null. */
function maxYearFromText(text) {
  const years = extractYearsFromText(text);
  return years.length ? years[years.length - 1] : null;
}

/** Loose 4-digit-year pattern used for file names inside archives. */
const FILE_NAME_YEAR_REGEX = /((?:19[8-9]|20[0-4])\d)/g;

/** Max year present in filenames (loose matching, e.g. "ed2026-d"). */
function maxYearFromFileNames(names) {
  let max = 0;
  for (const name of names) {
    const matches = String(name).match(FILE_NAME_YEAR_REGEX);
    if (!matches) continue;
    for (const m of matches) max = Math.max(max, Number(m));
  }
  return max > 0 ? String(max) : null;
}

/**
 * Deep-vintage scan: unzip an archive (zip or xlsx) and look for years both in
 * the file names and inside unzipped text / embedded spreadsheets.
 * @param {Buffer} buffer
 * @returns {Promise<string|null>} max year or null
 */
async function maxYearFromZip(buffer) {
  let zip;
  try {
    zip = await JSZip.loadAsync(buffer);
  } catch {
    return null;
  }
  const fileNames = Object.keys(zip.files);
  let max = Number(maxYearFromFileNames(fileNames) || 0);

  const MAX_ENTRIES = 25;
  const entries = fileNames
    .filter((n) => !zip.files[n].dir)
    .slice(0, MAX_ENTRIES);

  const tasks = entries.map(async (name) => {
    const entry = zip.files[name];
    const lower = name.toLowerCase();
    try {
      if (/\.(csv|txt|tsv|json|log)$/.test(lower)) {
        const str = await entry.async('string');
        max = Math.max(max, Number(maxYearFromText(str) || 0));
      } else if (/\.xlsx$/.test(lower)) {
        // An xlsx is itself a zip: read shared strings + first worksheet.
        const inner = await JSZip.loadAsync(await entry.async('nodebuffer'));
        const targets = Object.keys(inner.files).filter((n) =>
          /^xl\/(sharedStrings|worksheets\/sheet1)\.xml$/.test(n)
        );
        for (const t of targets) {
          const str = await inner.files[t].async('string');
          max = Math.max(max, Number(maxYearFromText(str) || 0));
        }
      } else if (/\.(xml|html?)$/.test(lower)) {
        const str = await entry.async('string');
        max = Math.max(max, Number(maxYearFromText(str) || 0));
      }
    } catch {
      /* ignore unreadable entries */
    }
  });
  await Promise.all(tasks);

  return max > 0 ? String(max) : null;
}

/**
 * Extract the maximum vintage (year) present in a downloaded resource.
 * @param {Buffer} buffer
 * @param {string} type  one of classifyUrl's types (zip/xlsx/csv/pdf/html/json/xml/text/sdes-media/unknown)
 * @returns {Promise<string|null>}
 */
async function deepScanMaxYear(buffer, type) {
  if (!Buffer.isBuffer(buffer) || !buffer.length) return null;

  // Archives / spreadsheets are zips.
  if (type === 'zip' || type === 'xlsx') {
    return maxYearFromZip(buffer);
  }

  // Textual formats: parse directly.
  if (['csv', 'json', 'xml', 'text', 'html'].includes(type)) {
    const text = buffer.toString('utf8');
    return maxYearFromText(text);
  }

  // PDF and other opaque binaries: attempt text extraction on the raw bytes.
  return maxYearFromText(buffer.toString('latin1').slice(0, 2 * 1024 * 1024));
}

/**
 * Produce a "content plus vintage" scan result for an URL.
 * @param {string} url
 * @param {object} [options]
 * @returns {Promise<{url:string, type:string, status:number, statusText:string, hash:string|null, year:string|null, etag:string|null, lastModified:string|null, error:string|null}>}
 */
async function scanUrl(url, options = {}) {
  const { download = true } = options;
  const type = classifyUrl(url);

  // Dashboards (PowerBI, Looker Studio...) cannot be diffed reliably:
  // only assert availability (HEAD) and record the status.
  if (type === 'dashboard') {
    try {
      const res = await httpRequest(url, { method: 'HEAD', wantBody: false });
      return {
        url,
        type,
        status: res.status,
        statusText: res.statusText,
        hash: null,
        year: null,
        etag: null,
        lastModified: null,
        error: null,
      };
    } catch (error) {
      return { url, type, status: 0, statusText: '', hash: null, year: null, etag: null, lastModified: null, error: error.message };
    }
  }

  if (!download) {
    // Availability-only pass: HEAD (fall back to a bounded GET).
    try {
      const head = await httpRequest(url, { method: 'HEAD', wantBody: false });
      if (head.status >= 200 && head.status < 300) {
        return {
          url, type, status: head.status, statusText: head.statusText,
          hash: null, year: null,
          etag: head.headers.etag || null, lastModified: head.headers['last-modified'] || null,
          error: null,
        };
      }
      const get = await httpRequest(url, { method: 'GET', wantBody: true, maxBytes: 1024 * 1024 });
      return {
        url, type, status: get.status, statusText: get.statusText,
        hash: null, year: null,
        etag: get.headers.etag || null, lastModified: get.headers['last-modified'] || null,
        error: null,
      };
    } catch (error) {
      return { url, type, status: 0, statusText: '', hash: null, year: null, etag: null, lastModified: null, error: error.message };
    }
  }

  // Full download to compute hash + deep vintage.
  try {
    const res = await httpRequest(url, { method: 'GET', wantBody: true });
    const body = res.body;
    const hash = sha256(body);
    const year = await deepScanMaxYear(body, type);
    return {
      url,
      type,
      status: res.status,
      statusText: res.statusText,
      hash,
      year,
      etag: res.headers.etag || null,
      lastModified: res.headers['last-modified'] || null,
      error: null,
    };
  } catch (error) {
    return { url, type, status: 0, statusText: '', hash: null, year: null, etag: null, lastModified: null, error: error.message };
  }
}

/** Resource types whose scraped max year is a meaningful data vintage. */
const YEAR_ALERT_TYPES = new Set(['zip', 'xlsx', 'xls', 'csv', 'json', 'xml', 'pdf', 'text', 'sdes-media']);

/**
 * Max number of years the source may be ahead of the latest *measured* Grist
 * year for a "new edition" alert to fire. Spreadsheets often carry projection /
 * horizon columns (2030, 2040, 2050…); a raw max year would therefore spam
 * false alarms. +2 catches genuine new measured vintages while ignoring
 * far-horizon projections.
 */
const NEW_YEAR_MAX_LEAD = 2;

/**
 * Decide which indicators warrant a "new edition / new vintage" alert.
 * @param {string|null} sourceYear   max year found on the source resource
 * @param {string}      type         resource type (see classifyUrl)
 * @param {Array<{name:string, latestYear:string|null}>} indicators
 * @returns {Array<{indicator:string, fromGrist:string, fromSource:string}>}
 */
function newYearAlertsFor(sourceYear, type, indicators) {
  const alerts = [];
  if (!sourceYear || !YEAR_ALERT_TYPES.has(type)) return alerts;
  for (const ind of indicators || []) {
    if (!ind.latestYear) continue;
    const lead = Number(sourceYear) - Number(ind.latestYear);
    if (lead > 0 && lead <= NEW_YEAR_MAX_LEAD) {
      alerts.push({ indicator: ind.name, fromGrist: ind.latestYear, fromSource: sourceYear });
    }
  }
  return alerts;
}

module.exports = {
  HASH_ALGO,
  sha256,
  YEAR_REGEX,
  FILE_NAME_YEAR_REGEX,
  YEAR_ALERT_TYPES,
  NEW_YEAR_MAX_LEAD,
  normalizeTextForHash,
  extractYearsFromText,
  maxYearFromText,
  maxYearFromFileNames,
  maxYearFromZip,
  deepScanMaxYear,
  scanUrl,
  newYearAlertsFor,
};
