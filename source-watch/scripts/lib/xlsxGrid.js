const JSZip = require('jszip');

/** Parse xl/sharedStrings.xml into an ordered array of strings. */
async function readSharedStrings(zip) {
  const file = zip.files['xl/sharedStrings.xml'];
  if (!file) return null;
  const xml = await file.async('string');
  const out = [];
  const siRe = /<si[^>]*>([\s\S]*?)<\/si>/g;
  let m;
  while ((m = siRe.exec(xml)) !== null) {
    let text = '';
    const tRe = /<t[^>]*>([\s\S]*?)<\/t>/g;
    let tm;
    while ((tm = tRe.exec(m[1])) !== null) text += tm[1];
    out.push(text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'"));
  }
  return out;
}

/** Convert an Excel column letters ("A", "AB") to a zero-based index. */
function colIndex(col) {
  let n = 0;
  for (const ch of col) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

/**
 * Parse a single worksheet XML into a 2D array grid[zRow][zCol] (both
 * zero-based). Shared-string cells are resolved via `shared`; inline strings
 * are read directly; empty cells are null.
 */
async function readSheet(zip, sheetPath, shared) {
  const xml = await zip.files[sheetPath].async('string');
  const grid = {};
  let maxR = 0;
  let maxC = 0;
  const cRe = /<c r="([A-Z]+)(\d+)"([^>]*)>([\s\S]*?)<\/c>/g;
  let m;
  while ((m = cRe.exec(xml)) !== null) {
    const col = colIndex(m[1]);
    const row = +m[2];
    const attrs = m[3];
    const body = m[4];
    const tMatch = attrs.match(/t="([^"]+)"/);
    const t = tMatch ? tMatch[1] : 'n';
    let val = null;
    if (t === 'inlineStr') {
      const it = body.match(/<is>[\s\S]*?<t[^>]*>([\s\S]*?)<\/t>/);
      if (it) val = it[1];
    } else {
      const vMatch = body.match(/<v>([\s\S]*?)<\/v>/);
      if (vMatch) val = vMatch[1];
      if (t === 's' && shared && val !== null) val = shared[+val];
    }
    grid[`${row},${col}`] = val;
    if (row > maxR) maxR = row;
    if (col > maxC) maxC = col;
  }
  const arr = [];
  for (let r = 1; r <= maxR; r += 1) {
    const row = [];
    for (let c = 0; c <= maxC; c += 1) {
      row.push(Object.prototype.hasOwnProperty.call(grid, `${r},${c}`) ? grid[`${r},${c}`] : null);
    }
    arr.push(row);
  }
  return arr;
}

/**
 * Load an .xlsx Buffer into a list of named grids.
 * @param {Buffer} buf
 * @returns {Promise<Array<{name:string, grid:any[][]}>>}
 */
async function loadXlsx(buf) {
  const zip = await JSZip.loadAsync(buf);
  const shared = await readSharedStrings(zip);
  const sheets = Object.keys(zip.files)
    .filter((f) => /^xl\/worksheets\/sheet\d+\.xml$/.test(f))
    .sort((a, b) => +a.match(/\d+/)[0] - +b.match(/\d+/)[0]);
  const out = [];
  for (const name of sheets) {
    out.push({ name, grid: await readSheet(zip, name, shared) });
  }
  return out;
}

module.exports = { loadXlsx, readSheet, readSharedStrings, colIndex };
