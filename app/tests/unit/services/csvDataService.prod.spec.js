import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { transformCSVData } from '@/services/csvDataService.js';

const prodCsvPath = path.join(__dirname, '../../../public/grist-backups/grist-indicators.csv');

function loadRows() {
  const csv = fs.readFileSync(prodCsvPath, 'utf8');
  return new Promise((resolve, reject) => {
    Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: reject,
    });
  });
}

describe('transformCSVData with production-like indicators', () => {
  it('groups multi sous-niveau rows without throwing', async () => {
    const rows = await loadRows();
    const query = {
      filter_by: [{ field: 'search', values: [''] }],
      time_period: { date_start: '2015-01-01', date_end: '2031-01-01' },
    };
    expect(() => transformCSVData(rows, query)).not.toThrow();
    const result = transformCSVData(rows, query);
    expect(result.results.length).toBeGreaterThan(0);
    result.results.forEach((item) => {
      expect(Array.isArray(item.axe_taxonomie_list)).toBe(true);
    });
  });
});
