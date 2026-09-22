#!/usr/bin/env node

/**
 * Verify baromètre indicator values stored in Grist against their SDES source
 * files, and propose the most recent source value when it differs or is newer.
 *
 * Two outcomes reported per indicator:
 *  - "COPY"   : for a year already in Grist, the source value differs beyond
 *               tolerance  -> probable recopy error; the source value is proposed.
 *  - "NEW"    : the source provides a more recent year than any measured year in
 *               Grist -> the new (year, value) is proposed for update.
 *
 * Coordinate config lives in source-watch/sdes-configs.csv (one row per
 * indicator, CSV). A row without explicit yearRow/valueRow is treated as DRAFT:
 * coordinates are auto-detected and the result flagged for human review
 * (auto-detection is unreliable on heterogeneous SDES workbooks).
 *
 * Output: a single CSV source-watch/verify-grist-values.csv with explicit
 * columns (statut, action, indic, année, valeurs source/Grist, écart, detail,
 * url). Actionable rows (COPY, NEW, ERROR, NO-SHEET, NOT-FOUND, NO-VALUE) come
 * first, then DRAFT, then OK, so the file is ready to filter/sort in a
 * spreadsheet or to drive CI from the "action" column.
 *
 * Usage:
 *   node scripts/verify-grist-values.js [--env production|preprod] [--quiet]
 *                                        [--config <path>]
 */

const fs = require('fs');
const path = require('path');

const { fetchGristIndicators, downloadBody } = require('./lib/sourceUrls.js');
const { loadXlsx } = require('./lib/xlsxGrid.js');
const { extractSeries, toNumber } = require('./lib/sdesExtract.js');

const MEASURED_YEAR_RE = /^\d{4}$/;
const EXCLUDE_PREFIX = ['cible_', 'projection_'];

function parseBool(v) {
  if (v === undefined || v === null || v === '') return null;
  const s = String(v).trim().toLowerCase();
  return s === '1' || s === 'true' || s === 'yes' || s === 'oui';
}

function parseTolerance(v) {
  const n = toNumber(v);
  return n === null ? 0.05 : n;
}

/**
 * Split one CSV/TSV line into fields, honouring double-quoted fields that may
 * contain the delimiter and escaped quotes (RFC-4180). Used because Grist
 * indicator names legitimately contain commas and quotes (e.g.
 * "…à usage énergétique, toutes énergies confondues").
 */
function splitDelimited(line, delim) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i += 1; }
        else inQuotes = false;
      } else cur += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delim) {
      out.push(cur); cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

/** Quote a field for CSV output (RFC-4180), escaping embedded quotes/delims. */
function toCsvField(v, delim = ',') {
  const s = v === undefined || v === null ? '' : String(v);
  if (s.includes(delim) || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Read the extraction config file (CSV or TSV) into an array of records. */
function loadConfig(configPath) {
  const text = fs.readFileSync(configPath, 'utf8');
  const lines = text.split(/\r?\n/).filter((l) => {
    const t = l.trim();
    return t && !t.startsWith('#');
  });
  if (lines.length === 0) return [];
  // A single delimiter for the whole file: whichever occurs unquoted in the header.
  const header = lines[0];
  const delim = header.includes('\t') ? '\t' : ',';
  const headCols = splitDelimited(header, delim).map((c) => c.trim());
  return lines.slice(1).map((line) => {
    const cols = splitDelimited(line, delim);
    const rec = {};
    headCols.forEach((h, i) => { rec[h] = cols[i] !== undefined ? cols[i].trim() : ''; });
    return rec;
  });
}

/** Latest *measured* (year, value) from Grist row, excluding cible_/projection_. */
function latestMeasuredGrist(row) {
  let best = null;
  for (const key of Object.keys(row)) {
    if (!MEASURED_YEAR_RE.test(key)) continue;
    if (EXCLUDE_PREFIX.some((p) => key.startsWith(p))) continue;
    const v = row[key];
    if (v === null || v === undefined || String(v).trim() === '') continue;
    const num = toNumber(v);
    if (num === null) continue;
    const year = +key;
    if (!best || year > best.year || (year === best.year && num !== best.value)) {
      best = { year, value: num, raw: v };
    }
  }
  return best;
}

function resolveSheet(config, sheets) {
  if (config.sheet) {
    const hit = sheets.find((s) => s.name === config.sheet);
    if (hit) return hit;
    const byIndex = sheets.find((s) => s.name.endsWith(`${configSheetNumber(config.sheet)}.xml`));
    if (byIndex) return byIndex;
    return null;
  }
  return sheets.length ? sheets[0] : null;
}

function configSheetNumber(sheet) {
  const m = /(\d+)$/.exec(sheet);
  return m ? m[1] : null;
}

function gristSeriesFor(row) {
  const years = new Map();
  for (const key of Object.keys(row)) {
    if (!MEASURED_YEAR_RE.test(key)) continue;
    if (EXCLUDE_PREFIX.some((p) => key.startsWith(p))) continue;
    const v = row[key];
    if (v === null || v === undefined || String(v).trim() === '') continue;
    const num = toNumber(v);
    if (num === null) continue;
    years.set(+key, num);
  }
  return years;
}

/** Pick the Grist row for an indicator, disambiguating duplicate names by
 * best overlap with the extracted source series (e.g. "Consommations d'eau
 * douce par usage" exists once per water-usage sub-series). */
function resolveGristRow(rows, name, sourceSeries) {
  const matches = rows.filter((r) => String(r.Indicateur).trim() === name);
  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0];
  if (!sourceSeries || sourceSeries.length === 0) return matches[0];

  let best = matches[0];
  let bestScore = -1;
  for (const row of matches) {
    const g = gristSeriesFor(row);
    let hit = 0;
    let score = 0;
    for (const s of sourceSeries) {
      const gv = g.get(s.year);
      if (gv === undefined) continue;
      hit += 1;
      const maxAbs = Math.max(Math.abs(gv), Math.abs(s.value), 1);
      score += 1 - Math.min(Math.abs(gv - s.value) / maxAbs, 1);
    }
    if (hit === 0) continue;
    const normalized = score / hit;
    if (normalized > bestScore) { bestScore = normalized; best = row; }
  }
  return best;
}

async function verifyOne(config, row, series, srcRow, sheet) {
  const latestGrist = latestMeasuredGrist(row);
  const tolerance = parseTolerance(config.tolerance);
  const relTol = parseFloat(config.relTol) || 0.03;
  const draft = !(config.yearRow && (config.valueRow || (config.labelCol && config.labelValue))) || parseBool(config.verified) === false;

  if (!series || series.length === 0) {
    return { ...base(config, row, latestGrist), status: 'NO-VALUE', detail: 'aucune valeur extraite (coordonnées ?)' };
  }

  const last = series[series.length - 1];
  const srcYear = last.year;
  const srcValue = last.value;

  // Compare every source year against Grist; collect offending years.
  const gYears = gristSeriesFor(row);
  const copyErrors = [];
  let coherent = 0;
  let proposedNew = null;
  const latestGristYear = latestGrist ? latestGrist.year : null;

  for (const s of series) {
    const gv = gYears.get(s.year);
    if (gv === undefined) {
      if (latestGristYear === null || s.year > latestGristYear) {
        if (!proposedNew || s.year > proposedNew.year) {
          proposedNew = { year: s.year, value: s.value };
        }
      }
      continue;
    }
    // A divergence is flagged only when it exceeds BOTH an absolute floor and
    // a relative share of |grist| — normal SDES annual revisions (a few %)
    // are NOT copy errors; gross copy mistakes are.
    const absTol = Math.max(tolerance, relTol * Math.abs(gv));
    const diff = Math.abs(s.value - gv);
    if (diff > absTol) {
      copyErrors.push({ year: s.year, source: s.value, grist: gv, diff, rel: diff / Math.max(Math.abs(gv), 1e-9) });
    } else {
      coherent += 1;
    }
  }

  let result;
  if (copyErrors.length > 0) {
    const worst = copyErrors[copyErrors.length - 1];
    result = {
      status: 'COPY',
      detail: `${copyErrors.length} année(s) divergente(s) — ex. ${worst.year}: source=${worst.source}, Grist=${worst.grist} (écart ${worst.diff.toFixed(4)})`,
      copyErrors,
      proposed: proposedNew && proposedNew.year > (latestGristYear || 0) ? proposedNew : null,
    };
  } else if (proposedNew) {
    result = {
      status: 'NEW',
      detail: `source fournit ${proposedNew.year}=${proposedNew.value} (Grist s'arrête à ${latestGrist.year}=${latestGrist.raw})`,
      proposed: proposedNew,
    };
  } else {
    result = { status: 'OK', detail: `série cohérente (${coherent} année(s) vérifiée(s), dernier ${srcYear}=${srcValue})` };
  }

  return {
    ...base(config, row, latestGrist),
    ...result,
    srcYear,
    srcValue,
    srcRow,
    srcSheet: sheet.name,
    draft: draft || false,
  };
}

function base(config, row, latestGrist) {
  return {
    indic: config.indic || (row && row.Indicateur) || config.url,
    url: config.url || (row && row['Lien de téléchargement des données']),
    latestGrist: latestGrist ? `${latestGrist.year}=${latestGrist.raw}` : null,
    config,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const env = args.includes('--env') ? args[args.indexOf('--env') + 1] : 'production';
  const quiet = args.includes('--quiet');
  const configPath =
    (args.includes('--config') ? args[args.indexOf('--config') + 1] : null) ||
    path.join(__dirname, '..', 'sdes-configs.csv');

  const rows = await fetchGristIndicators(env);
  const configs = loadConfig(configPath);

  const results = [];
  for (const cfg of configs) {
    try {
      const buf = await downloadBody(cfg.url);
      const sheets = await loadXlsx(buf);
      const sheet = resolveSheet(cfg, sheets);
      if (!sheet) { results.push({ indic: cfg.indic, status: 'NO-SHEET', detail: `feuille ${cfg.sheet} introuvable` }); continue; }

      let extraction;
      const xcfg = {
        yearRow: cfg.yearRow,
        valueRow: cfg.valueRow,
        labelCol: cfg.labelCol,
        labelValue: cfg.labelValue,
        extraCol: cfg.extraCol,
        extraVal: cfg.extraVal,
        extraCol2: cfg.extraCol2,
        extraVal2: cfg.extraVal2,
        exact: cfg.exact,
      };
      const hasExplicit = cfg.yearRow && (cfg.valueRow || (cfg.labelCol && cfg.labelValue));
      if (hasExplicit) {
        extraction = extractSeries(sheet.grid, xcfg);
      } else {
        const auto = extractSeries(sheet.grid);
        extraction = auto ? { ...auto, autoDetected: true } : null;
      }
      const series = extraction ? extraction.series : null;
      const srcRow = extraction ? extraction.valueRow : null;

      const row = resolveGristRow(rows, String(cfg.indic).trim(), series);
      if (!row) { results.push({ indic: cfg.indic, status: 'NOT-FOUND', detail: 'indicateur absent du Grist' }); continue; }

      const res = await verifyOne(cfg, row, series, srcRow, sheet);
      results.push(res);
      if (!quiet) console.log(`[${res.status.padEnd(9)}] ${res.indic} — ${res.detail}`);
    } catch (e) {
      results.push({ indic: cfg.indic, status: 'ERROR', detail: e.message });
      if (!quiet) console.log(`[ERROR     ] ${cfg.indic} — ${e.message}`);
    }
  }

  const summary = results.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});
  if (!quiet) console.log('\nSummary:', JSON.stringify(summary));

  const outCsv = path.join(path.dirname(configPath), 'verify-grist-values.csv');
  fs.writeFileSync(outCsv, renderCsv(results));

  if (!quiet) console.log(`\nWrote ${outCsv}\n`);

  if (summary.COPY > 0 || summary.NEW > 0) process.exitCode = 2;
}

/**
 * Order results so actionable rows surface first: statuses that require human
 * attention (COPY, NEW, ERROR, NO-SHEET, NOT-FOUND, NO-VALUE), then DRAFT
 * (coordinates unconfirmed), then OK.
 */
const ACTION_RANK = { COPY: 0, NEW: 1, ERROR: 2, 'NO-SHEET': 3, 'NOT-FOUND': 4, 'NO-VALUE': 5, DRAFT: 6, OK: 7 };

function rankStatus(status, draft) {
  if (draft && status === 'OK') return ACTION_RANK.DRAFT;
  if (status in ACTION_RANK) return ACTION_RANK[status];
  return 99;
}

/**
 * Flatten results into a single CSV with explicit statut/action columns and the
 * values involved (année, source, Grist, écart) so it reads directly in a
 * spreadsheet and drives CI from the "action" column.
 */
function renderCsv(results) {
  const header = ['statut', 'action', 'indic', 'annee', 'valeur_source', 'valeur_grist', 'ecart', 'detail', 'url'];
  const sorted = [...results].sort(
    (a, b) => rankStatus(a.status, a.draft) - rankStatus(b.status, b.draft) || String(a.indic).localeCompare(String(b.indic)),
  );

  const actionable = sorted.filter((r) => {
    if (r.status !== 'OK') return true;
    return r.draft === true;
  });

  const out = [header.join(',')];
  for (const r of actionable) {
    const worst = r.copyErrors && r.copyErrors.length ? r.copyErrors[r.copyErrors.length - 1] : null;
    const action = actionFor(r);
    const annee = worst ? worst.year : (r.proposed ? r.proposed.year : '');
    const vSrc = worst ? worst.source : (r.proposed ? r.proposed.value : '');
    const vGrist = worst ? worst.grist : '';
    const ecart = worst ? worst.diff.toFixed(4) : '';
    out.push([
      r.status,
      action,
      r.indic,
      annee,
      vSrc,
      vGrist,
      ecart,
      r.detail,
      r.url || '',
    ].map((f) => toCsvField(f)).join(','));
  }
  return out.join('\n') + '\n';
}

/** Machine-readable action for the row, aligned with the CI exit-code policy. */
function actionFor(r) {
  if (r.status === 'COPY') return 'verifier_valeur_grist';
  if (r.status === 'NEW') return 'proposer_valeur_grist';
  if (r.status === 'ERROR' || r.status === 'NO-SHEET' || r.status === 'NOT-FOUND' || r.status === 'NO-VALUE') {
    return 'verifier_config';
  }
  if (r.draft) return 'a_confirmer';
  return 'rien';
}

main().catch((e) => { console.error(e); process.exit(1); });
