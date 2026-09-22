#!/usr/bin/env node

/**
 * Shared helpers for the source-watcher / URL-audit scripts.
 *
 * Responsibilities:
 *  - fetch & parse the Grist indicators CSV (shared config gristUrls.json)
 *  - split multi-URL cells and deduplicate
 *  - classify an URL by apparent resource type (direct file, SDES media, HTML page, JS dashboard)
 *  - HTTP helpers (HEAD/GET) with identifiable UA, timeout, redirection limit and a
 *    hard download size cap (never disable TLS).
 *
 * Only uses Node built-ins (node:https, node:crypto, global fetch from Node 18+).
 */

const https = require('node:https');
const Papa = require('papaparse');

const gristUrlsConfig = require('../../../app/src/config/gristUrls.json');
const GRIST_URLS = gristUrlsConfig.GRIST_URLS;

const USER_AGENT =
  'barometre-source-watcher/1.0 (+https://barometre.planification-ecologique.gouv.fr)';

const DEFAULT_TIMEOUT_MS = 30000;
const MAX_REDIRECTS = 5;
const MAX_DOWNLOAD_BYTES = 100 * 1024 * 1024; // 100 Mo

// Explicit file-ish extensions mapped to a resource type.
const EXTENSION_TYPES = {
  zip: 'zip',
  xlsx: 'xlsx',
  xls: 'xls',
  csv: 'csv',
  pdf: 'pdf',
  json: 'json',
  xml: 'xml',
  html: 'html',
  htm: 'html',
  txt: 'text',
};

// Hosts serving dynamic dashboards that cannot be diffed reliably.
const DASHBOARD_HOST_PATTERNS = [
  /^app\.powerbi\.com$/i,
  /powerbi/i,
  /(^|\.)lookerstudio\.google\.com$/i,
  /(^|\.)datastudio\.google\.com$/i,
];

const SDES_MEDIA_PATTERN = /\/media\/\d+\/download(?:\?|$)/;

function gristIndicatorsCsvUrl(environment = 'production') {
  return GRIST_URLS[environment] || GRIST_URLS.production;
}

function parseCSVText(csvText) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error),
    });
  });
}

/**
 * Fetch and parse the Grist indicators CSV from the public API.
 * @param {string} environment
 * @returns {Promise<Array<object>>}
 */
async function fetchGristIndicators(environment = 'production') {
  const response = await globalThis.fetch(gristIndicatorsCsvUrl(environment), {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!response.ok) {
    throw new Error(`Grist CSV API returned ${response.status} ${response.statusText}`);
  }
  const csvText = await response.text();
  return parseCSVText(csvText);
}

/**
 * Split a Grist cell that may hold several URLs into distinct candidate URLs.
 * @param {unknown} value
 * @returns {string[]} deduplicated URLs (trimmed)
 */
function splitUrls(value) {
  if (value == null) return [];
  const raw = String(value);
  // URLs may be separated by commas followed by http, newlines, or whitespace.
  const tokens = raw.split(/[\n,;\s]+(?=https?:\/\/)|[\n,;\s]+/);
  const seen = new Set();
  const result = [];
  for (let token of tokens) {
    token = token.trim();
    if (!token) continue;
    // Guard against punctuation attached at the end of a URL.
    if (/^https?:\/\//i.test(token)) {
      const cleaned = token.replace(/[)\]},.;]+$/, '');
      if (!seen.has(cleaned)) {
        seen.add(cleaned);
        result.push(cleaned);
      }
    }
  }
  return result;
}

/**
 * Best-effort classification of an URL based on its path/extension/host.
 * @param {string} url
 * @returns {'file'|'sdes-media'|'html'|'dashboard'|'unknown'}
 */
function classifyUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return 'unknown';
  }

  if (SDES_MEDIA_PATTERN.test(parsed.pathname)) {
    return 'sdes-media';
  }

  if (DASHBOARD_HOST_PATTERNS.some((re) => re.test(parsed.hostname))) {
    return 'dashboard';
  }

  const lowerPath = parsed.pathname.toLowerCase();
  const extensionMatch = lowerPath.match(/(?:\.([a-z0-9]+)){1}(?:\?|$)/);
  if (extensionMatch) {
    const ext = extensionMatch[1];
    if (EXTENSION_TYPES[ext]) {
      return ext; // e.g. 'zip', 'xlsx', 'csv', 'pdf', 'html'
    }
  }
  return 'html'; // no recognizable extension → treated as a page
}

function isFileType(type) {
  return ['zip', 'xlsx', 'xls', 'csv', 'json', 'xml', 'pdf', 'text'].includes(type);
}

/**
 * Minimal HTTP redirect-following fetch returning status + headers (+ optional body).
 * Never sends a body unless requested.
 * @param {string} url
 * @param {object} [options]
 * @returns {Promise<{status:number, statusText:string, headers:Record<string,string>, finalUrl:string, body?:Buffer}>}
 */
function httpRequest(url, options = {}) {
  const {
    method = 'GET',
    timeout = DEFAULT_TIMEOUT_MS,
    wantBody = false,
    maxBytes = MAX_DOWNLOAD_BYTES,
    headers = {},
  } = options;

  return new Promise((resolve, reject) => {
    const doRequest = (currentUrl, redirectsLeft) => {
      let parsed;
      try {
        parsed = new URL(currentUrl);
      } catch (error) {
        reject(new Error(`Invalid URL: ${currentUrl}`));
        return;
      }

      const reqOptions = {
        method,
        hostname: parsed.hostname,
        port: parsed.port || undefined,
        path: parsed.pathname + parsed.search,
        headers: {
          'User-Agent': USER_AGENT,
          Accept: '*/*',
          ...headers,
        },
      };

      const req = https.request(reqOptions, (res) => {
        const status = res.statusCode;
        const finalHeaders = res.headers;

        if ([301, 302, 303, 307, 308].includes(status)) {
          const location = res.headers.location;
          res.resume(); // drain
          if (!location) {
            resolve({
              status,
              statusText: res.statusMessage || '',
              headers: finalHeaders,
              finalUrl: currentUrl,
              body: undefined,
            });
            return;
          }
          if (redirectsLeft <= 0) {
            reject(new Error(`Too many redirects from ${currentUrl}`));
            return;
          }
          const nextUrl = new URL(location, parsed).toString();
          doRequest(nextUrl, redirectsLeft - 1);
          return;
        }

        if (!wantBody || status >= 300) {
          // For HEAD / error responses we still want to close the socket.
          res.resume();
        }

        if (!wantBody) {
          resolve({
            status,
            statusText: res.statusMessage || '',
            headers: finalHeaders,
            finalUrl: currentUrl,
            body: undefined,
          });
          return;
        }

        const chunks = [];
        let total = 0;
        let aborted = false;

        res.on('data', (chunk) => {
          total += chunk.length;
          if (total > maxBytes) {
            aborted = true;
            res.destroy();
            reject(new Error(`Response body exceeds ${maxBytes} bytes (${currentUrl})`));
            return;
          }
          chunks.push(chunk);
        });

        res.on('end', () => {
          if (aborted) return;
          resolve({
            status,
            statusText: res.statusMessage || '',
            headers: finalHeaders,
            finalUrl: currentUrl,
            body: Buffer.concat(chunks),
          });
        });

        res.on('error', (error) => {
          if (aborted) return;
          reject(error);
        });
      });

      req.setTimeout(timeout, () => {
        req.destroy(new Error(`Request timed out after ${timeout}ms (${currentUrl})`));
      });

      req.on('error', (error) => reject(error));

      if (method === 'POST' && options.body) {
        req.write(options.body);
      }
      req.end();
    };

    doRequest(url, MAX_REDIRECTS);
  });
}

function httpHead(url, options = {}) {
  return httpRequest(url, { ...options, method: 'HEAD', wantBody: false });
}

/**
 * Download an URL body (following redirects) up to a size cap.
 * @param {string} url
 * @param {object} [options]
 * @returns {Promise<Buffer>}
 */
async function downloadBody(url, options = {}) {
  const res = await httpRequest(url, { ...options, method: 'GET', wantBody: true });
  if (res.status >= 300) {
    throw new Error(`GET ${url} returned ${res.status} ${res.statusText}`);
  }
  return res.body;
}

module.exports = {
  USER_AGENT,
  DEFAULT_TIMEOUT_MS,
  MAX_REDIRECTS,
  MAX_DOWNLOAD_BYTES,
  EXTENSION_TYPES,
  DASHBOARD_HOST_PATTERNS,
  SDES_MEDIA_PATTERN,
  gristIndicatorsCsvUrl,
  parseCSVText,
  fetchGristIndicators,
  splitUrls,
  classifyUrl,
  isFileType,
  httpRequest,
  httpHead,
  downloadBody,
};
