/**
 * Config-driven extraction of a SDES spreadsheet's "most recent measured
 * value". SDES workbooks are heterogeneous (nested charts, region series,
 * narrative text), so generic parsing is unreliable. These helpers are strict:
 * they only extract from a genuine (row-of-year-headers x row-of-values)
 * tabular region, identified by explicit or auto-detected coordinates.
 */

/** Strict year regex: a standalone 4-digit year bounded by non-alphanumerics. */
const WIDE_YEAR_RE = /(?:^|[^0-9A-Za-z])(19[5-9]\d|20[0-4]\d)(?![0-9A-Za-z])/;

/**
 * Find the row (1-based) whose cells contain the most year-like headers.
 * @param {any[][]} grid
 * @returns {{row:number, count:number, years:Array<{col:number,year:number}>}|null}
 */
function detectYearRow(grid) {
  let best = null;
  for (let r = 0; r < grid.length; r += 1) {
    const years = [];
    grid[r].forEach((cell, col) => {
      if (cell === null || cell === undefined) return;
      const s = String(cell).trim();
      if (s.length > 12) return;
      const m = s.match(WIDE_YEAR_RE);
      if (m) years.push({ col, year: +m[1] });
    });
    const unique = new Set(years.map((y) => y.year)).size;
    if (unique >= 3 && (!best || unique > best.count)) {
      best = { row: r + 1, count: unique, years };
    }
  }
  return best;
}

/** Parse a cell to a finite number (rejecting anything non-numeric). */
function toNumber(cell) {
  if (cell === null || cell === undefined) return null;
  const s = String(cell).replace(/\s/g, '').replace(',', '.').replace(' ', '');
  if (!/^-?\d+(\.\d+)?([eE][-+]?\d+)?$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Pick a numeric value cell from a value row (prefer non-empty, plausible). */
function pickValue(grid, row, col) {
  if (!grid[row]) return null;
  return toNumber(grid[row][col]);
}

/**
 * Resolve the year-header row info from explicit config or auto-detection.
 */
function resolveYearRow(grid, config) {
  if (config.yearRow) {
    const r = config.yearRow - 1;
    const years = [];
    (grid[r] || []).forEach((cell, col) => {
      if (cell === null || cell === undefined) return;
      const m = String(cell).trim().match(WIDE_YEAR_RE);
      if (m) years.push({ col, year: +m[1] });
    });
    return { row: config.yearRow, count: years.length, years };
  }
  return detectYearRow(grid);
}

/**
 * Resolve the value row, in priority order:
 *   1. explicit valueRow (1-based),
 *   2. labelCol+labelValue: the first row below the year header whose label
 *      cell contains labelValue (used for "wide table, one series per row",
 *      e.g. the SDES energy-balance files),
 *   3. else: first row below the year row holding a number in a year column.
 */
function resolveValueRow(grid, yearRowInfo, candidates, config) {
  if (config.valueRow != null && config.valueRow !== '') return Number(config.valueRow) - 1;
  if (config.labelCol != null && config.labelCol !== '' && config.labelValue) {
    const col = Number(config.labelCol) - 1;
    const needle = String(config.labelValue).trim().toLowerCase();
    const exact = config.exact === true || config.exact === '1' || config.exact === 'yes';
    const extras = [];
    if (config.extraCol != null && config.extraCol !== '' && config.extraVal) {
      extras.push({ col: Number(config.extraCol) - 1, val: String(config.extraVal).trim().toLowerCase() });
    }
    if (config.extraCol2 != null && config.extraCol2 !== '' && config.extraVal2) {
      extras.push({ col: Number(config.extraCol2) - 1, val: String(config.extraVal2).trim().toLowerCase() });
    }
    const yr = yearRowInfo.row - 1;
    for (let r = yr + 1; r < grid.length; r += 1) {
      const cell = grid[r] && grid[r][col];
      if (cell === null || cell === undefined) continue;
      const s = String(cell).trim().toLowerCase();
      if (exact ? (s !== needle) : !s.includes(needle)) continue;
      let ok = true;
      for (const ex of extras) {
        const c = grid[r] && grid[r][ex.col];
        if (c === null || c === undefined || !String(c).trim().toLowerCase().includes(ex.val)) { ok = false; break; }
      }
      if (ok) return r;
    }
    return undefined;
  }
  const yr = yearRowInfo.row - 1;
  for (let r = yr + 1; r < Math.min(yr + 12, grid.length); r += 1) {
    if (candidates.some((c) => pickValue(grid, r, c.col) !== null)) return r;
  }
  return undefined;
}

/**
 * Extract the full (year -> value) series from a wide year-header table.
 * @param {any[][]} grid
 * @param {object} config  {yearRow, valueRow}
 * @returns {{series:Array<{year:number,value:number,col:number}>, yearRow:number, valueRow:number}|null}
 */
function extractSeries(grid, config = {}) {
  const yearRowInfo = resolveYearRow(grid, config);
  if (!yearRowInfo || yearRowInfo.years.length === 0) return null;

  const byYear = new Map();
  const forRow = [];
  yearRowInfo.years
    .filter((y) => y.year >= 1955)
    .forEach((y) => {
      const key = `${y.year}:${y.col}`;
      if (!byYear.has(key)) { byYear.set(key, y); forRow.push(y); }
    });

  const valueRow = resolveValueRow(grid, yearRowInfo, forRow, config);
  if (valueRow === undefined) return null;

  const series = [];
  for (const y of forRow) {
    const value = pickValue(grid, valueRow, y.col);
    if (value !== null) series.push({ year: y.year, value, col: y.col });
  }
  if (series.length === 0) return null;
  series.sort((a, b) => a.year - b.year);
  return { series, yearRow: yearRowInfo.row, valueRow: valueRow + 1 };
}

/**
 * Extract the value for the most recent year from a wide year-header table.
 * @returns {{year:number, value:number, row:number, col:number}|null}
 */
function extractLatestValue(grid, config = {}) {
  const res = extractSeries(grid, config);
  if (!res || res.series.length === 0) return null;
  const last = res.series[res.series.length - 1];
  return { year: last.year, value: last.value, row: res.valueRow, col: last.col };
}

module.exports = {
  extractLatestValue,
  extractSeries,
  detectYearRow,
  toNumber,
  WIDE_YEAR_RE,
};
