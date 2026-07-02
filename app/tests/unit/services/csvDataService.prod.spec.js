import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { transformCSVData, reconstructLegacyIndicatorRows } from '@/services/csvDataService.js';

const prodCsvPath = path.join(__dirname, '../../../public/grist-backups/grist-indicators.csv');

function loadRows() {
  const csv = fs.readFileSync(prodCsvPath, 'utf8');
  return new Promise((resolve, reject) => {
    Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(reconstructLegacyIndicatorRows(results.data)),
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

  it('reconstructs sector/chantier from new Grist columns (Chantier/Engagement)', async () => {
    const rows = await loadRows();
    const query = { filter_by: [{ field: 'search', values: [''] }] };
    const result = transformCSVData(rows, query);
    const withSector = result.results.filter((item) => item.sector);
    // Some indicators carry Chantier/Engagement data → must yield a sector.
    expect(withSector.length).toBeGreaterThan(0);
    withSector.forEach((item) => {
      expect(typeof item.sector).toBe('string');
    });
  });
});
