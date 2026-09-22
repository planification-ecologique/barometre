import {
  extractLatestValue,
  extractSeries,
  detectYearRow,
  toNumber,
  WIDE_YEAR_RE,
} from '../../scripts/lib/sdesExtract.js';

describe('toNumber', () => {
  it('parses French and English decimal formats', () => {
    expect(toNumber('8,21')).toBe(8.21);
    expect(toNumber('1664674')).toBe(1664674);
    expect(toNumber('-0.31')).toBe(-0.31);
    expect(toNumber(' 9,1  ')).toBe(9.1);
  });

  it('rejects non-numeric', () => {
    expect(toNumber('abc')).toBeNull();
    expect(toNumber('n.d.')).toBeNull();
    expect(toNumber('')).toBeNull();
    expect(toNumber(null)).toBeNull();
    expect(toNumber('Réalisé')).toBeNull();
  });
});

describe('WIDE_YEAR_RE', () => {
  it('matches standalone years inside header cells', () => {
    expect(WIDE_YEAR_RE.exec('2023')[1]).toBe('2023');
    expect(WIDE_YEAR_RE.exec('Atteint 2023')[1]).toBe('2023');
    expect(WIDE_YEAR_RE.exec('Objectifs 2030**')[1]).toBe('2030');
  });

  it('does not match digits glued to letters (a real year word is required)', () => {
    expect(WIDE_YEAR_RE.exec('ed2026')).toBeNull();
    expect(WIDE_YEAR_RE.exec('38byte')).toBeNull();
  });
});

describe('extractLatestValue (explicit coordinates)', () => {
  // A typical wide SDES table: label in col A, years as headers starting col B.
  const grid = [
    [null, null, null, null, null, null, null, null], // 0
    ['Titre du graphique', null, null, null, null, null, null, null], // 1
    [null, null, null, null, null, null, null, null], // 2
    [null, '2020', '2021', '2022', '2023', '2024', null, null], // 3  (yearRow=4)
    [null, '110,5', '112,3', '115,0', '118,2', null, null, null], // 4  (valueRow=5)
  ];

  it('extracts the value of the most recent populated year', () => {
    const res = extractLatestValue(grid, { yearRow: 4, valueRow: 5 });
    expect(res).toMatchObject({ year: 2023, value: 118.2 });
    expect(res.col).toBe(4); // column E (0-based 4)
  });

  it('returns null when the year row is empty', () => {
    expect(extractLatestValue([[null], [null]], { yearRow: 1, valueRow: 2 })).toBeNull();
  });

  it('does not auto-detect outside an explicit year row when told to use grid bounds', () => {
    // Expose that a wrong explicit year row just yields null / whatever is there.
    const res = extractLatestValue(grid, { yearRow: 100 });
    expect(res).toBeNull();
  });

  it('extracts years embedded in header labels (e.g. "Atteint 2023")', () => {
    const g = [
      [null, null, null],
      [null, 'Atteint 2023', 'Objectifs 2030**'],
      [null, '22.18', 'Réalisé'],
    ];
    const res = extractLatestValue(g, { yearRow: 2, valueRow: 3 });
    expect(res).toMatchObject({ year: 2023, value: 22.18 });
  });
});

describe('extractSeries', () => {
  it('returns the full ordered (year -> value) series', () => {
    const grid = [
      [null, null, null, null, null],
      [null, '2017', '2018', '2019', null],
      [null, '1,035', '1,018', '0,999', null],
    ];
    const res = extractSeries(grid, { yearRow: 2, valueRow: 3 });
    expect(res.series.map((s) => [s.year, s.value])).toEqual([
      [2017, 1.035],
      [2018, 1.018],
      [2019, 0.999],
    ]);
    expect(res.valueRow).toBe(3);
  });

  it('skips non-numeric cells and returns null when none are numeric', () => {
    const grid = [
      [null, '2017', '2018'],
      [null, 'n.d.', 'Réalisé'],
    ];
    const res = extractSeries(grid, { yearRow: 2, valueRow: 3 });
    expect(res).toBeNull();
  });

  it('returns null when the year row is absent', () => {
    expect(extractSeries([[null, null]], { yearRow: 10 })).toBeNull();
  });
});

describe('extractSeries — label-based row selection', () => {
  // SDES "wide" energy files: one row of year headers, one series per row keyed
  // by a label column (e.g. LIBSERIE).
  const grid = [
    ['CODTOT', 'LIBSERIE', 'ENERGIE', 'UNITE', 'NIVGEO', 'TYPDONNEE', '1960', '1961', '1962'],
    ['59T', 'Consommation finale toutes energies', 'Toutes énergies', 'TWh', 'Métropole', 'Réelles', 30.7, 31.4, 32.1],
    ['93', 'Facture énergétique totale', 'Toutes énergies', 'M€', 'France', 'Réelles', 12421.9, 15117.4, 15394.0],
    ['94', 'Émissions de CO2 liées charbon', 'Charbon', 'Mt CO2', 'France', 'CVC', 45.6, 46.1, 46.9],
    ['95', 'Production nette d’électricité nucléaire vendue', 'Nucléaire', 'TWh', 'France', 'Réelles', 321.0, 322.0, 323.0],
    ['96', 'Production nette d’électricité', 'Ensemble', 'TWh', 'France', 'Réelles', 531.0, 541.2, 547.5],
    ['97', 'Émissions de CO2 liées charbon', 'Charbon', 'Mt CO2', 'France', 'Réelles', 45.0, 45.1, 45.2],
  ];

  it('selects the value row by a label substring in the label column', () => {
    const res = extractSeries(grid, { yearRow: 1, labelCol: 2, labelValue: "Facture énergétique totale" });
    expect(res.valueRow).toBe(3);
    expect(res.series.map((s) => [s.year, s.value])).toEqual([
      [1960, 12421.9],
      [1961, 15117.4],
      [1962, 15394.0],
    ]);
  });

  it('selects the value row even when the label is a partial match', () => {
    const res = extractSeries(grid, { yearRow: 1, labelCol: 2, labelValue: 'CO2 liées' });
    expect(res.valueRow).toBe(4);
    expect(res.series[res.series.length - 1]).toMatchObject({ year: 1962, value: 46.9 });
  });

  it('returns null when no label matches', () => {
    const res = extractSeries(grid, { yearRow: 1, labelCol: 2, labelValue: 'introuvable' });
    expect(res).toBeNull();
  });

  it('uses exact match to pick an aggregate row over a longer label row', () => {
    // Without exact, the substring "Production nette d’électricité" hits the
    // "nucléaire vendue" row first (it comes first); with exact it must pick
    // the row whose label equals the needle.
    const subset = extractSeries(grid, { yearRow: 1, labelCol: 2, labelValue: 'Production nette d’électricité' });
    expect(subset.valueRow).toBe(5);
    const exact = extractSeries(grid, { yearRow: 1, labelCol: 2, labelValue: 'Production nette d’électricité', exact: true });
    expect(exact.valueRow).toBe(6);
    expect(exact.series[exact.series.length - 1]).toMatchObject({ year: 1962, value: 547.5 });
  });

  it('disambiguates identical labels with the second extra filter', () => {
    // Rows 94 (France/CVC) and 97 (France/Réelles) share the label "CO2 liées".
    // The second filter must select the row whose col 6 matches.
    const cvc = extractSeries(grid, {
      yearRow: 1,
      labelCol: 2,
      labelValue: 'CO2 liées',
      extraCol: 5,
      extraVal: 'France',
      extraCol2: 6,
      extraVal2: 'CVC',
    });
    expect(cvc.valueRow).toBe(4);
    const reelles = extractSeries(grid, {
      yearRow: 1,
      labelCol: 2,
      labelValue: 'CO2 liées',
      extraCol: 5,
      extraVal: 'France',
      extraCol2: 6,
      extraVal2: 'Réelles',
    });
    expect(reelles.valueRow).toBe(7);
    expect(reelles.series[reelles.series.length - 1]).toMatchObject({ year: 1962, value: 45.2 });
  });

  it('returns null when only the second extra filter excludes every row', () => {
    const res = extractSeries(grid, {
      yearRow: 1,
      labelCol: 2,
      labelValue: 'CO2 liées',
      extraCol: 5,
      extraVal: 'France',
      extraCol2: 6,
      extraVal2: 'DOM',
    });
    expect(res).toBeNull();
  });
});

describe('detectYearRow (draft hint only)', () => {
  it('finds the row with the most distinct year headers', () => {
    const grid = [
      ['Some long title', null, null],
      [null, '2020', '2021', '2022', '2023', '2024'],
      [null, '1', '2', '3', '4', '5'],
    ];
    const dr = detectYearRow(grid);
    expect(dr.row).toBe(2);
    expect(dr.count).toBe(5);
  });

  it('returns null when too few years are present', () => {
    expect(detectYearRow([[null, '2020', null, 'only 2']])).toBeNull();
  });
});
