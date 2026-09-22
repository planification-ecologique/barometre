#!/usr/bin/env node

/**
 * Build the "propositions" (URL strengthening) report for the Baromètre source-watcher.
 *
 * Merges verified research findings (SDES direct media URLs, CITEPA edition URLs,
 * open-data portal direct files) with the Phase 1a audit (source-watch/audit-urls.json),
 * then re-verifies every proposed URL over HTTP before writing the deliverable.
 *
 * Outputs:
 *  - source-watch/propositions-urls.csv
 *
 * Usage:
 *   node app/scripts/build-propositions.js
 */

const fs = require('node:fs');
const path = require('node:path');

const { httpRequest } = require('./lib/sourceUrls');

const WATCH_DIR = path.join(__dirname, '..');
const RESEARCH_DIR = path.join(WATCH_DIR, 'research');

/** Parse a RFC-4180 CSV line into fields (handles quoted fields w/ commas). */
function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = false;
      } else cur += c;
    } else if (c === '"') {
      inQ = true;
    } else if (c === ',') {
      out.push(cur); cur = '';
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

function readCsv(filename) {
  const text = fs.readFileSync(path.join(RESEARCH_DIR, filename), 'utf8');
  return text
    .split('\n')
    .filter((line) => line.trim() && !line.trim().startsWith('#'))
    .map((line) => parseCsvLine(line));
}

/** Normalize an indicator name so research entries can be matched to audit rows. */
function normalizeName(name) {
  if (name == null) return '';
  let s = String(name).toLowerCase();
  // unicode subscript digits (₀-₉) -> plain digits
  s = s.replace(/[\u2080-\u2089]/g, (c) => String.fromCharCode(c.codePointAt(0) - 0x2080 + 0x30));
  // unicode subscript letters (ₓ etc.) -> base letter
  s = s.replace(/\u2093/g, 'x'); // subscript x
  s = s.replace(/[\u2090-\u209c]/g, ''); // strip other subscript letters
  s = s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
  return s;
}

async function verify(url) {
  try {
    const res = await httpRequest(url, { method: 'HEAD', wantBody: false });
    if (res.status >= 200 && res.status < 300) {
      return { status: res.status, ok: true };
    }
    // Some hosts reject HEAD but allow GET: fall back to a bounded GET.
    const getRes = await httpRequest(url, { method: 'GET', wantBody: true, maxBytes: 2 * 1024 * 1024 });
    return { status: getRes.status, ok: getRes.status >= 200 && getRes.status < 300 };
  } catch (error) {
    return { status: 'ERR', ok: false, error: error.message };
  }
}

async function main() {
  const audit = JSON.parse(fs.readFileSync(path.join(WATCH_DIR, 'audit-urls.json'), 'utf8'));

  const research = [
    ...readCsv('citepa.csv').map((r) => ({ ...r, source: 'CITEPA' })),
    ...readCsv('sdes.csv').map((r) => ({ ...r, source: 'SDES' })),
    ...readCsv('opendata.csv').map((r) => ({ ...r, source: 'OPEN_DATA' })),
  ];

  // Index research by normalized name (keep first occurrence, prefer later sources? -> keep all)
  const researchByName = new Map();
  for (const entry of research) {
    const key = normalizeName(entry[0]);
    if (!researchByName.has(key)) researchByName.set(key, []);
    researchByName.get(key).push(entry);
  }

  const matched = [];
  const unmatchedResearch = [];

  for (const row of audit) {
    const nameKey = normalizeName(row.name);
    const entries = researchByName.get(nameKey) || [];
    if (entries.length === 0) continue;
    for (const entry of entries) {
      matched.push({
        id: row.id,
        name: row.name,
        action: row.action,
        currentDownloadUrl: row.downloadUrl || '',
        sourcePage: entry[1],
        proposedUrl: entry[2],
        proposedStatus: entry[3],
        reason: entry[4],
        researchSource: entry.source,
      });
    }
  }

  // Which research entries did not match any audit indicator?
  for (const entry of research) {
    const key = normalizeName(entry[0]);
    const matchedThis = matched.some((m) => normalizeName(m.name) === key);
    if (!matchedThis) unmatchedResearch.push(entry);
  }

  // Re-verify all proposed URLs (dedupe first)
  const urlsToVerify = [...new Set(matched.map((m) => m.proposedUrl).filter((u) => u && u !== 'AUCUN' && u !== 'AUCUN_FICHIER_DIRECT'))];
  const verification = {};
  for (const url of urlsToVerify) {
    verification[url] = await verify(url);
    await new Promise((r) => setTimeout(r, 300));
  }

  let stats = { pourposesVerifyOk: 0, proposesVerifyFail: 0 };

  const rows = matched.map((m) => {
    const isDirect = m.proposedUrl && !['AUCUN', 'AUCUN_FICHIER_DIRECT'].includes(m.proposedUrl);
    const v = isDirect ? verification[m.proposedUrl] : null;
    if (v) (v.ok ? stats.pourposesVerifyOk++ : stats.proposesVerifyFail++);
    return {
      ...m,
      verified: v ? (v.ok ? 'OK' : `FAIL(${v.status})`) : 'n/a',
    };
  });

  // Sort: TO_FIX first, then TO_COMPLETE, then TO_IMPROVE; then by name.
  const order = { TO_FIX: 0, TO_COMPLETE: 1, TO_IMPROVE: 2 };
  rows.sort((a, b) => {
    const d = (order[a.action] ?? 9) - (order[b.action] ?? 9);
    if (d) return d;
    return a.name.localeCompare(b.name, 'fr');
  });

  // ---- CSV ----
  const csvLines = [
    'id,name,action,source,source_page,current_download_url,proposed_url,proposed_http,verified,reason',
  ];
  for (const r of rows) {
    csvLines.push(
      [
        [r.id, r.name, r.action, r.researchSource, r.sourcePage, r.currentDownloadUrl, r.proposedUrl, r.proposedStatus, r.verified, r.reason]
          .map((c) => '"' + String(c ?? '').replace(/"/g, '""') + '"'),
      ].join(',')
    );
  }
  fs.writeFileSync(path.join(WATCH_DIR, 'propositions-urls.csv'), csvLines.join('\n') + '\n');

  console.log(`Matched proposals: ${rows.length}`);
  console.log(`Verified OK: ${stats.pourposesVerifyOk}, FAIL: ${stats.proposesVerifyFail}, n/a: ${rows.filter((r) => r.verified === 'n/a').length}`);
  console.log(`Unmatched research entries: ${unmatchedResearch.length}`);
  console.log('Wrote source-watch/propositions-urls.csv');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
