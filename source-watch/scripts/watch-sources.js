#!/usr/bin/env node

/**
 * Daily source-watcher for the Baromètre de la planification écologique.
 *
 * 1. Fetches the Grist indicators (358 rows) — the source of truth for which
 *    URLs back which indicator.
 * 2. Scans every distinct source URL (download URLs, falling back to the
 *    source-site URL), computing a content hash and, when the resource is
 *    readable, the maximum vintage (year) present.
 * 3. Compares against the previous run state (source-watch/state.json) and
 *    against the latest measured year held in Grist.
 * 4. Produces an alerts report (source-watch/report-latest.md) and an updated
 *    state file. Sends a Tchap/Matrix notification when secrets are provided.
 *
 * Options (flags):
 *   --env <production|qualif>   Grist environment (default production)
 *   --limit <n>                 only scan the first n monitoring targets
 *   --concurrency <n>           concurrent downloads (default 4)
 *   --no-download               availability-only pass (HEAD, no body/hash)
 *   --state <path>              where to read/write the state file
 *   --report <path>             where to write the latest report
 *   --quiet                     do not log progress to stdout
 *
 * Exit codes: 0 = ok, 2 = runtime error.
 */

const fs = require('node:fs');
const path = require('node:path');

const { fetchGristIndicators, splitUrls, httpRequest } = require('./lib/sourceUrls');
const { scanUrl, newYearAlertsFor } = require('./lib/watcher');

const ROOT = path.join(__dirname, '..', '..', '..');
const STATE_PATH = path.join(__dirname, '..', 'state.json');
const REPORT_PATH = path.join(__dirname, '..', 'report-latest.md');

const DEFAULT_DELAY_MS = 300;
const DEFAULT_CONCURRENCY = 4;

function parseArgs(argv) {
  const args = { env: 'production', concurrency: DEFAULT_CONCURRENCY, download: true, quiet: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[i + 1];
    if (a === '--env') { args.env = next(); i++; }
    else if (a === '--limit') { args.limit = Number(next()); i++; }
    else if (a === '--concurrency') { args.concurrency = Number(next()); i++; }
    else if (a === '--no-download') { args.download = false; }
    else if (a === '--state') { args.state = next(); i++; }
    else if (a === '--report') { args.report = next(); i++; }
    else if (a === '--quiet') { args.quiet = true; }
  }
  args.statePath = path.resolve(ROOT, args.state || STATE_PATH);
  args.reportPath = args.report ? path.resolve(ROOT, args.report) : REPORT_PATH;

  // A debug run (--limit) must never clobber the committed baseline state/report
  // unless the caller explicitly provided --state/--report.
  if (args.limit && !args.state && !args.report) {
    const tmp = path.join(require('node:os').tmpdir(), 'source-watch-debug');
    fs.mkdirSync(tmp, { recursive: true });
    args.statePath = path.join(tmp, 'state.json');
    args.reportPath = path.join(tmp, 'report-latest.md');
    args.inDebugMode = true;
  }
  return args;
}

const log = (args, ...msgs) => {
  if (!args.quiet) console.log(...msgs);
};

/** Latest measured year from the bare year columns, excluding cible_/projection_. */
function latestGristYear(row) {
  let max = 0;
  for (const key of Object.keys(row)) {
    if (!/^\d{4}$/.test(key)) continue;
    const v = row[key];
    if (v == null || String(v).trim() === '') continue;
    const y = Number(key);
    if (y > max) max = y;
  }
  return max > 0 ? String(max) : null;
}

/** Build the set of {url, indicators:[{id,name,latestYear}]} to monitor. */
function buildTargets(rows) {
  const byUrl = new Map();
  for (const row of rows) {
    const downloadUrls = splitUrls(row['Lien de téléchargement des données']);
    const candidates = downloadUrls.length ? downloadUrls : splitUrls(row['Lien site source']);
    const info = { id: row.ID, name: row.Indicateur, latestYear: latestGristYear(row) };
    for (const url of candidates) {
      if (!byUrl.has(url)) byUrl.set(url, []);
      byUrl.get(url).push(info);
    }
  }
  const targets = [];
  for (const [url, indicators] of byUrl) {
    targets.push({ url, indicators });
  }
  return targets;
}

/** Generic delay helper. */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Run scanUrl across targets with limited concurrency and per-host politeness. */
async function scanAll(targets, args) {
  const results = [];
  const nextIdx = { i: 0 };
  const worker = async () => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const idx = nextIdx.i++;
      if (idx >= targets.length) break;
      const target = targets[idx];
      log(args, `[${idx + 1}/${targets.length}] ${target.url}`);
      const res = await scanUrl(target.url, { download: args.download });
      res.indicators = target.indicators;
      results.push(res);
      await sleep(DEFAULT_DELAY_MS);
    }
  };
  const workers = Array.from({ length: args.concurrency }, worker);
  await Promise.all(workers);
  return results;
}

/** Merge a fresh scan result into stored state; returns a diff descriptor. */
function mergeState(target, prev) {
  const changedContent = prev && prev.hash && target.hash && prev.hash !== target.hash;
  const firstTime = !prev;
  const statusNow = target.status;
  const statusPrev = prev ? prev.status : null;
  const statusChanged = prev && statusPrev && statusNow && statusPrev !== statusNow;

  const newYearAlerts = newYearAlertsFor(target.year, target.type, target.indicators);

  return {
    changedContent,
    firstTime,
    statusChanged,
    statusNow,
    statusPrev,
    newYearAlerts,
    url: target.url,
    type: target.type,
  };
}

/** Send a Matrix/Tchap notice. Returns false if no credentials configured. */
async function notifyTchap(text) {
  const home = process.env.MATRIX_HOMESERVER_URL;
  const token = process.env.MATRIX_ACCESS_TOKEN;
  const room = process.env.MATRIX_ROOM_ID;
  if (!home || !token || !room) return false;
  const txnId = `${Date.now()}`;
  const url = `${home.replace(/\/$/, '')}/_matrix/client/v3/rooms/${encodeURIComponent(room)}/send/m.room.message/${txnId}`;
  const res = await httpRequest(url, {
    method: 'POST',
    wantBody: true,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ msgtype: 'm.text', body: text }),
  });
  return res.status >= 200 && res.status < 300;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  log(args, `Fetching Grist indicators (${args.env})…`);
  const rows = await fetchGristIndicators(args.env);
  log(args, `  ${rows.length} indicators`);

  const targets = buildTargets(rows);
  if (args.limit) targets.splice(args.limit);
  log(args, `  ${targets.length} monitoring targets (deduplicated URLs)`);

  // Load previous state.
  let state = {};
  if (fs.existsSync(args.statePath)) {
    try {
      state = JSON.parse(fs.readFileSync(args.statePath, 'utf8'));
    } catch {
      state = {};
    }
  }

  const results = await scanAll(targets, args);

  // Merge + collect alerts.
  const alerts = [];
  const newState = {};
  let changedCount = 0;
  let unavailableCount = 0;

  for (const res of results) {
    const prev = state[res.url];
    const diff = mergeState(res, prev);
    let record = {
      url: res.url,
      type: res.type,
      status: res.status,
      statusText: res.statusText,
      hash: res.hash,
      year: res.year,
      etag: res.etag,
      lastModified: res.lastModified,
      error: res.error || null,
      indicators: (res.indicators || []).map((i) => i.id),
      checkedAt: new Date().toISOString(),
    };
    newState[res.url] = record;

    if (diff.firstTime) {
      // baseline established; note only if new-year already fires
    } else if (diff.statusChanged) {
      changedCount++;
      alerts.push({ severity: 'info', kind: 'status', ...diff });
    } else if (diff.changedContent) {
      changedCount++;
      alerts.push({ severity: 'info', kind: 'content', ...diff });
    }
    for (const na of diff.newYearAlerts) {
      alerts.push({ severity: 'new', kind: 'new-year', ...na, url: res.url, type: res.type });
    }
    if (!res.status || res.status >= 500) unavailableCount++;
  }

  // Write new state (committed by the workflow so future diffs work).
  fs.mkdirSync(path.dirname(args.statePath), { recursive: true });
  fs.writeFileSync(args.statePath, JSON.stringify(newState, null, 2) + '\n');

  // Build report.
  const lines = [];
  lines.push('# Source-watch — Rapport');
  lines.push('');
  lines.push(`Généré le ${new Date().toISOString()} (env ${args.env}, ${targets.length} cibles).`);
  lines.push('');
  lines.push(`- Changements de contenu/statut : **${changedCount}**`);
  lines.push(`- Nouvelles éditions / millésimes détectés : **${alerts.filter((a) => a.kind === 'new-year').length}**`);
  lines.push(`- Sources injoignables (≥500 / erreur) : **${unavailableCount}**`);
  lines.push('');

  const newYear = alerts.filter((a) => a.kind === 'new-year');
  if (newYear.length) {
    lines.push('## 🆕 Nouvelles éditions / millésimes');
    lines.push('');
    lines.push('| Indicateur | Millésime source | Millésime Grist (max) | Type |');
    lines.push('|---|---|---|---|');
    for (const a of newYear) {
      lines.push(`| ${a.indicator} | ${a.fromSource} | ${a.fromGrist} | ${a.type} |`);
    }
    lines.push('');
  }

  const contentChanges = alerts.filter((a) => a.kind === 'content' || a.kind === 'status');
  if (contentChanges.length) {
    lines.push('## 🔄 Autres changements');
    lines.push('');
    lines.push('| Indicateur | Type | Détail |');
    lines.push('|---|---|---|');
    for (const a of contentChanges) {
      const names = (a.indicators || []).map((i) => i.name).join(', ') || a.url;
      const detail =
        a.kind === 'status'
          ? `STATUS ${a.statusPrev} → ${a.statusNow}`
          : `CONTENU modifié (${a.url})`;
      lines.push(`| ${names} | ${a.kind} | ${detail} |`);
    }
    lines.push('');
  }

  const unavail = results.filter((r) => !r.status || r.status >= 500);
  if (unavail.length) {
    lines.push('## ⚠️ Sources injoignables');
    lines.push('');
    lines.push('| URL | Statut | Erreur |');
    lines.push('|---|---|---|');
    for (const r of unavail) {
      lines.push(`| ${r.url} | ${r.status || 'ERR'} | ${r.error || r.statusText || ''} |`);
    }
    lines.push('');
  }

  lines.push('_Rapport automatique de la veille des sources du Baromètre._');
  fs.mkdirSync(path.dirname(args.reportPath), { recursive: true });
  fs.writeFileSync(args.reportPath, lines.join('\n') + '\n');

  // Send Tchap notification if there is anything worth reporting.
  const hasAlert = newYear.length > 0 || contentChanges.length > 0;
  const notifBase = lines.slice(0, 9).join('\n');
  const notifText = hasAlert
    ? `🔔 *Baromètre — veille des sources*\n\n${notifBase}\nDétails : report-latest.md dans le dépôt.`
    : null;
  let notified = false;
  if (notifText) notified = await notifyTchap(notifText);

  log(args, '\nSummary:');
  if (args.inDebugMode) log(args, `  DEBUG MODE (--limit): outputs written to ${args.statePath}`);
  log(args, `  content/status changes: ${changedCount}`);
  log(args, `  new-year alerts:         ${newYear.length}`);
  log(args, `  unavailable:             ${unavailableCount}`);
  log(args, `  tchap notified:           ${notified ? 'yes' : 'no (skip)'}`);
  log(args, `  state -> ${args.statePath}`);
  log(args, `  report -> ${args.reportPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
