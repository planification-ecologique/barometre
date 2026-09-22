#!/usr/bin/env node

/**
 * Phase 1a — Deterministic URL audit of the Barometer indicator sources.
 *
 * Reads the Grist indicators CSV (Tdb_planif_indicateurs), inspects every
 * download / source-site URL (HTTP reachability, redirection, resource type)
 * and writes:
 *   - source-watch/audit-urls.json   (machine-readable results)
 *   - source-watch/audit-urls.md     (human-readable report, actions per indicator)
 *
 * Output classification (per indicator download URL):
 *   TO_COMPLETE  : no download URL at all
 *   OK           : URL reachable and of an exploitable type
 *   TO_FIX       : URL dead (>=400) or indefinitely redirecting
 *   TO_IMPROVE   : URL is an HTML page while a direct file is likely available
 *   MANUAL       : non-diffable resource (dashboard, unknown) — listed but not auto-handled
 *
 * Options:
 *   --json-only   print the JSON audit to stdout instead of writing files
 *   --limit N     restrict to the first N indicators (dev/debug)
 */

const fs = require('node:fs');
const path = require('node:path');

const {
  fetchGristIndicators,
  splitUrls,
  classifyUrl,
  isFileType,
  httpHead,
} = require('./lib/sourceUrls');

const OUT_DIR = path.join(__dirname, '..');
const JSON_PATH = path.join(OUT_DIR, 'audit-urls.json');
const MD_PATH = path.join(OUT_DIR, 'audit-urls.md');

function classifyAction(url, type, status, redirect) {
  if (!url) return 'TO_COMPLETE';
  if (redirect) return 'TO_FIX'; // resolved to another location → likely stale link
  if (status >= 400) return 'TO_FIX';
  if (type === 'html') return 'TO_IMPROVE';
  if (type === 'dashboard') return 'MANUAL';
  if (type === 'unknown') return 'MANUAL';
  if (!isFileType(type)) return 'MANUAL';
  return 'OK';
}

async function auditIndicators(rows) {
  const results = rows.map((row) => {
    const id = String(row.ID || '').trim();
    const name = String(row.Indicateur || '').trim() || String(row['ID'] || '');
    const downloadUrls = splitUrls(row['Lien de téléchargement des données']);
    const siteUrls = splitUrls(row['Lien site source']);
    const etatSource = String(row['Etat source'] || '').trim();
    const derniereMAJ = String(row['Dernière mise à jour'] || '').trim();

    return {
      id,
      name,
      sources: String(row.Sources || '').trim(),
      etatSource,
      derniereMAJ,
      downloadUrl: downloadUrls[0] || '',
      downloadUrls,
      siteUrls,
    };
  });

  // Dedupe URLs to avoid re-checking the same URL many times.
  const urlMap = new Map();
  for (const r of results) {
    for (const u of r.downloadUrls) {
      if (!urlMap.has(u)) urlMap.set(u, { status: null, type: classifyUrl(u), redirect: null, error: null });
    }
    for (const u of r.siteUrls) {
      if (!urlMap.has(u)) urlMap.set(u, { status: null, type: classifyUrl(u), redirect: null, error: null });
    }
  }

  const entries = Array.from(urlMap.entries());
  console.log(`Checking ${entries.length} unique URLs...`);

  let done = 0;
  const CONCURRENCY = 6;
  const buckets = Array.from({ length: CONCURRENCY }, (_, i) => entries.filter((_, j) => j % CONCURRENCY === i));

  async function worker(bucketArr) {
    for (const [url, info] of bucketArr) {
      try {
        const res = await httpHead(url, { timeout: 20000 });
        info.status = res.status;
        info.type = res.status >= 300 ? info.type : classifyWithHeaders(url, res.headers, info.type);
        info.redirect = [301, 302, 303, 307, 308].includes(res.status)
          ? res.headers.location || true
          : null;
        if (info.redirect && res.status === 200) info.redirect = null;
      } catch (error) {
        info.status = 0;
        info.error = error.message;
      }
      info.tried = true;
      done += 1;
      if (done % 50 === 0) console.log(`  ${done}/${entries.length}`);
    }
  }

  await Promise.all(buckets.map(worker));

  // Attach findings to each indicator.
  const enriched = results.map((r) => {
    const siteInfo = r.siteUrls.map((u) => urlMap.get(u)).filter(Boolean);
    const primary = r.downloadUrls[0] ? urlMap.get(r.downloadUrls[0]) : null;

    let action;
    if (!r.downloadUrls.length) {
      action = 'TO_COMPLETE';
    } else if (primary) {
      action = classifyAction(
        r.downloadUrls[0],
        primary.type,
        primary.status,
        primary.redirect
      );
    } else {
      action = 'MANUAL';
    }

    return {
      ...r,
      primaryStatus: primary ? primary.status : null,
      primaryType: primary ? primary.type : null,
      primaryRedirect: primary ? primary.redirect : null,
      primaryError: primary ? primary.error : null,
      siteStatuses: siteInfo.map((s) => s.status),
      action,
    };
  });

  return { enriched, urlStats: summarizeUrls(urlMap) };
}

function classifyWithHeaders(url, headers, fallbackType) {
  const ct = String(headers['content-type'] || '');
  if (/(zip|xlsx|xls|csv|pdf|json|xml)/i.test(ct)) {
    if (/zip/i.test(ct)) return 'zip';
    if (/excel|xlsx|xls/i.test(ct)) return 'xlsx';
    if (/csv/i.test(ct)) return 'csv';
    if (/pdf/i.test(ct)) return 'pdf';
    if (/json/i.test(ct)) return 'json';
    if (/xml/i.test(ct)) return 'xml';
  }
  if (/text\/html|application\/xhtml/i.test(ct)) return 'html';
  return fallbackType;
}

function summarizeUrls(urlMap) {
  const counts = {};
  for (const [, info] of urlMap) {
    const key = info.status === 0 ? 'error' : info.status >= 400 ? 'httpError' : 'ok';
    counts[key] = (counts[key] || 0) + 1;
    const t = info.type || 'unknown';
    counts[`type:${t}`] = (counts[t] || 0) + 1;
  }
  return counts;
}

function byAction(enriched) {
  const groups = { TO_COMPLETE: [], OK: [], TO_FIX: [], TO_IMPROVE: [], MANUAL: [] };
  for (const r of enriched) {
    (groups[r.action] || (groups[r.action] = [])).push(r);
  }
  return groups;
}

function renderMarkdown(enriched) {
  const groups = byAction(enriched);
  const lines = [];
  lines.push('# Audit des URLs sources — Baromètre de la planification écologique\n');
  lines.push(`- **Indicateurs audités** : ${enriched.length}`);
  lines.push('- **Actions** : ' + Object.entries(groups).map(([k, v]) => `${k}=${v.length}`).join(' · '));
  lines.push(`- **Date** : ${new Date().toISOString()}\n`);

  const COUNT_HINT = { OK: 'Indicateurs dont l’URL de téléchargement est opérationnelle.', TO_COMPLETE: 'Aucune URL de téléchargement renseignée — à compléter.', TO_FIX: 'URL morte ou redirigée — à corriger.', TO_IMPROVE: 'URL = page HTML — un fichier direct est probablement disponible.', MANUAL: 'Ressource non diffable (dashboard JS, inconnu) — voir manuellement.' };

  for (const action of ['TO_COMPLETE', 'TO_FIX', 'TO_IMPROVE', 'MANUAL', 'OK']) {
    const items = groups[action] || [];
    lines.push(`\n## ${action} (${items.length})\n`);
    if (COUNT_HINT[action]) lines.push(`> ${COUNT_HINT[action]}\n`);
    if (!items.length) {
      lines.push('_Aucun._\n');
      continue;
    }
    lines.push('| Indicateur | Source | URL | État HTTP | Type |');
    lines.push('| --- | --- | --- | --- | --- |');
    for (const r of items) {
      const url = r.downloadUrl || (r.siteUrls[0] || '—');
      const status = r.primaryStatus != null ? (r.primaryStatus === 0 ? 'erreur' : r.primaryStatus) : (r.siteStatuses[0] ?? '—');
      const type = r.primaryType || (r.siteUrls[0] ? classifyUrl(r.siteUrls[0]) : '—');
      lines.push(`| ${r.name.split('\n')[0]} | ${r.sources.replace(/\|/g, '/')} | \`${url}\` | ${status} | ${type} |`);
    }
  }

  lines.push('\n---\n');
  lines.push('_Rapport généré automatiquement par `app/scripts/audit-source-urls.js`._');
  return lines.join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const jsonOnly = args.includes('--json-only');
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : null;

  console.log('Fetching Grist indicators CSV...');
  let rows = await fetchGristIndicators();
  if (limit) rows = rows.slice(0, limit);
  console.log(`Parsed ${rows.length} indicator rows.\n`);

  const { enriched } = await auditIndicators(rows);

  if (jsonOnly) {
    process.stdout.write(JSON.stringify(enriched, null, 2) + '\n');
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(JSON_PATH, JSON.stringify(enriched, null, 2) + '\n', 'utf8');
  fs.writeFileSync(MD_PATH, renderMarkdown(enriched), 'utf8');
  console.log(`\n✓ Written ${JSON_PATH}`);
  console.log(`✓ Written ${MD_PATH}`);

  const groups = byAction(enriched);
  console.log('\n--- Summary ---');
  for (const [k, v] of Object.entries(groups)) {
    console.log(`${k}: ${v.length}`);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
