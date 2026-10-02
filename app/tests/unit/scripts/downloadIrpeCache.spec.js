const { sortIndicatorRows } = require('../../../scripts/download-irpe-cache');

describe('sortIndicatorRows', () => {
  const measure = 'cube.id_1';

  function row(region, geocode, year, value) {
    return {
      'cube.libelle_region': region,
      'cube.geocode_region': geocode,
      'cube.date_mesure.year': `${year}-01-01T00:00:00.000`,
      [measure]: value,
      'cube.date_mesure': `${year}-01-01T00:00:00.000`,
    };
  }

  it('orders rows by dimensions and ignores API shuffle', () => {
    const shuffled = [
      row('Mayotte', '06', '2025', null),
      row('Bretagne', '53', '2013', 1),
      row('Hauts-de-France', '32', '2025', 4),
      row('Corse', '94', '2013', 2),
    ];
    const again = [shuffled[2], shuffled[0], shuffled[3], shuffled[1]];

    const sorted = sortIndicatorRows(shuffled, measure);
    expect(sortIndicatorRows(again, measure)).toEqual(sorted);
    expect(sorted.map((item) => item['cube.geocode_region'])).toEqual([
      '53',
      '94',
      '06',
      '32',
    ]);
  });

  it('keeps a value change on the same row', () => {
    const before = sortIndicatorRows(
      [row('Mayotte', '06', '2025', null), row('Hauts-de-France', '32', '2025', 4)],
      measure
    );
    const after = sortIndicatorRows(
      [row('Hauts-de-France', '32', '2025', 9), row('Mayotte', '06', '2025', 1)],
      measure
    );

    expect(before.map((item) => item['cube.geocode_region'])).toEqual(['06', '32']);
    expect(after.map((item) => item['cube.geocode_region'])).toEqual(['06', '32']);
    expect(after[1][measure]).toBe(9);
  });
});
