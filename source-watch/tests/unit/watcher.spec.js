import crypto from 'crypto';
import JSZip from 'jszip';

import {
  sha256,
  extractYearsFromText,
  maxYearFromText,
  maxYearFromFileNames,
  deepScanMaxYear,
  maxYearFromZip,
  newYearAlertsFor,
  YEAR_ALERT_TYPES,
} from '../../scripts/lib/watcher.js';

describe('sha256', () => {
  it('produces the correct hex digest', () => {
    const expected = crypto.createHash('sha256').update('barometre').digest('hex');
    expect(sha256(Buffer.from('barometre'))).toBe(expected);
    expect(sha256(Buffer.from('barometre'))).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('year extraction from text', () => {
  it('finds years in a plain string', () => {
    expect(extractYearsFromText('published in 2023, revised 2025')).toEqual(['2023', '2025']);
    expect(extractYearsFromText('no years here')).toEqual([]);
  });

  it('ignores out-of-range numbers', () => {
    expect(extractYearsFromText('temperature 19 and 2087')).toEqual([]);
  });

  it('returns the max year', () => {
    expect(maxYearFromText('2020 to 2029')).toBe('2029');
    expect(maxYearFromText('nothing')).toBeNull();
  });

  it('matches years as standalone words in text (strict)', () => {
    expect(maxYearFromText('vintage 2026 available')).toBe('2026');
  });

  it('does not match a year glued to a word via the strict text matcher', () => {
    // "ed2026" has no word boundary before 2026 -> not a standalone year.
    expect(maxYearFromText('file ed2026 v2')).toBeNull();
  });
});

describe('maxYearFromFileNames', () => {
  it('loosely matches years glued to suffixes (ed2026-d)', () => {
    expect(maxYearFromFileNames(['01-Citepa_ed2026-d.xlsx', '20_chiffres_ed2025-d.xlsx'])).toBe('2026');
    expect(maxYearFromFileNames(['no-timestamp.txt'])).toBeNull();
  });
});

describe('deepScanMaxYear', () => {
  it('scans plain text formats for years', async () => {
    const buf = Buffer.from('2019,2020,2021\nval1,val2,val3\n', 'utf8');
    expect(await deepScanMaxYear(buf, 'csv')).toBe('2021');
    expect(await deepScanMaxYear(buf, 'json')).toBe('2021');
    expect(await deepScanMaxYear(Buffer.alloc(0), 'csv')).toBeNull();
  });

  it('scans archives by filename and embedded text', async () => {
    const zip = new JSZip();
    zip.file('donnees_ed2024.xlsx', new Uint8Array([1, 2, 3])); // filename year only
    zip.file('meta.txt', 'année de référence : 2023');
    const buf = await zip.generateAsync({ type: 'nodebuffer' });
    expect(await maxYearFromZip(buf)).toBe('2024');
    expect(await deepScanMaxYear(buf, 'zip')).toBe('2024');
  });

  it('returns null for a non-archive binary buffer', async () => {
    const buf = Buffer.from('garbage that is not a zip at all padding 2029', 'utf8');
    // Not a valid zip -> JSZip.loadAsync fails -> null
    expect(await deepScanMaxYear(buf, 'zip')).toBeNull();
  });
});

describe('newYearAlertsFor', () => {
  const indicators = [
    { name: 'Émissions GES', latestYear: '2024' },
    { name: 'Sans millésime', latestYear: null },
  ];

  it('alerts when source year is a plausible measured increment', () => {
    const alerts = newYearAlertsFor('2025', 'xlsx', indicators);
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toMatchObject({ indicator: 'Émissions GES', fromGrist: '2024', fromSource: '2025' });
  });

  it('ignores far-horizon projection years', () => {
    expect(newYearAlertsFor('2030', 'xlsx', indicators)).toHaveLength(0);
    expect(newYearAlertsFor('2050', 'csv', indicators)).toHaveLength(0);
  });

  it('does not alert for html narrative years', () => {
    expect(newYearAlertsFor('2026', 'html', indicators)).toHaveLength(0);
  });

  it('treats a max lead of two years as alertable', () => {
    expect(newYearAlertsFor('2026', 'zip', indicators)).toHaveLength(1);
  });

  it('exposes the whitelist of file types for year alerts', () => {
    for (const t of ['zip', 'xlsx', 'csv', 'sdes-media', 'pdf']) {
      expect(YEAR_ALERT_TYPES.has(t)).toBe(true);
    }
    expect(YEAR_ALERT_TYPES.has('html')).toBe(false);
    expect(YEAR_ALERT_TYPES.has('dashboard')).toBe(false);
  });
});
