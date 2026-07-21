import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import {
  transformCSVData,
  reconstructLegacyIndicatorRows,
  isEmplacementEngagementAutresImpact,
} from '@/services/csvDataService.js';

const prodCsvPath = path.join(__dirname, '../../../public/grist-backups/grist-indicators.csv');

function loadRawRows() {
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

function loadRows() {
  return loadRawRows().then((rows) => reconstructLegacyIndicatorRows(rows));
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

  it('classifies empty Emplacement_engagement as impact-autres, not Synthèse principal', async () => {
    const rows = await loadRows();
    const pib = rows.find((r) => String(r.Indicateur || '').includes('par unité de PIB'));
    expect(pib).toBeTruthy();
    expect(String(pib.Levier || '')).toContain("Indicateur d'impact - autres");
    expect(String(pib.Levier || '')).not.toBe("Indicateur d'impact");

    const emptyEmpl = {
      Engagement: 'Atténuation / Émissions territoriales',
      'Emplacement_engagement': '',
      Chantier: '',
      Levier: '',
      Indicateur: 'Test indicateur sans emplacement',
      ID: 'test-empty-emplacement',
    };
    const [reconstructed] = reconstructLegacyIndicatorRows([emptyEmpl]);
    expect(String(reconstructed.Levier || '')).toContain("Indicateur d'impact - autres");
  });

  it('ignores legacy Levier for engagement placement when Emplacement_engagement is set', async () => {
    const rawRows = await loadRawRows();
    const fossiles = rawRows.find(
      (r) =>
        String(r.Indicateur || '').includes('Part des sources fossiles') &&
        String(r['Emplacement_engagement'] || '').trim() === 'Transverse' &&
        String(r.Engagement || '').includes('Atténuation')
    );
    expect(fossiles).toBeTruthy();
    expect(isEmplacementEngagementAutresImpact(fossiles['Emplacement_engagement'])).toBe(false);

    const withLegacyLevier = {
      ...fossiles,
      Levier: 'Autres indicateurs',
      'Chantier ou Impact': '',
    };
    const withoutLevier = {
      ...fossiles,
      Levier: '',
      'Chantier ou Impact': '',
    };
    const [reconstructedWith] = reconstructLegacyIndicatorRows([withLegacyLevier]);
    const [reconstructedWithout] = reconstructLegacyIndicatorRows([withoutLevier]);

    expect(String(reconstructedWith['Chantier ou Impact'] || '')).toBe(
      String(reconstructedWithout['Chantier ou Impact'] || '')
    );
    expect(String(reconstructedWith.Levier || '')).toContain("Indicateur d'impact");
    expect(String(reconstructedWith.Levier || '')).not.toContain("Indicateur d'impact - autres");
    expect(String(reconstructedWithout.Levier || '')).toBe(String(reconstructedWith.Levier || ''));
  });
});
