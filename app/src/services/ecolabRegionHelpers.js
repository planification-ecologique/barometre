/**
 * Helpers for working with Écolab cube region data.
 * Pure functions so that Vue components (e.g. GraphBox) stay lean.
 */

/**
 * Extract the list of regions and an optional extra dimension (e.g. énergie)
 * from a full indicator load result.
 *
 * @param {{ cubeName: string, extraDimension: string | null, data: Array }} result
 * @returns {{
 *   regionsList: Array<{ geocode_region: string, libelle_region: string }>,
 *   extraDimension: string | null,
 *   extraOptions: Array<{ value: string, label: string }>,
 *   defaultExtraValue: string
 * }}
 */
export function extractRegionsAndExtra(result) {
  const { cubeName, extraDimension, data } = result || {};
  if (!cubeName || !Array.isArray(data)) {
    return {
      regionsList: [],
      extraDimension: null,
      extraOptions: [],
      defaultExtraValue: ''
    };
  }

  const keyLabel = `${cubeName}.libelle_region`;
  const keyGeocode = `${cubeName}.geocode_region`;
  const byGeocode = new Map();

  data.forEach((row) => {
    const geocode = row[keyGeocode] ?? row['geocode_region'];
    const label = row[keyLabel] ?? row['libelle_region'];
    if (geocode && label && !byGeocode.has(geocode)) {
      byGeocode.set(geocode, {
        geocode_region: String(geocode),
        libelle_region: String(label)
      });
    }
  });

  const regionsList = Array.from(byGeocode.values()).sort((a, b) =>
    a.libelle_region.localeCompare(b.libelle_region, 'fr')
  );

  // Extra dimension (e.g. énergie)
  if (!extraDimension) {
    return {
      regionsList,
      extraDimension: null,
      extraOptions: [],
      defaultExtraValue: ''
    };
  }

  const extraKey = extraDimension;
  const shortExtra = extraDimension.split('.').pop();
  const values = new Set();

  data.forEach((row) => {
    const v = row[extraKey] ?? (shortExtra ? row[shortExtra] : undefined);
    if (v != null && String(v).trim() !== '') {
      values.add(String(v));
    }
  });

  const extraOptions = Array.from(values)
    .sort((a, b) => a.localeCompare(b, 'fr'))
    .map((v) => ({ value: v, label: v }));

  return {
    regionsList,
    extraDimension,
    extraOptions,
    defaultExtraValue: extraOptions[0]?.value || ''
  };
}

/** Extract year from API time value (e.g. "2023-01-01T00:00:00.000" -> "2023"). */
export function yearFromTimeValue(val) {
  if (val == null) return null;
  const s = String(val);
  const m = s.match(/^(\d{4})/);
  return m ? m[1] : s;
}

/**
 * Build a simple bar-series from all-region data for a given region (and optional extra filter).
 *
 * @param {{
 *   cubeName: string,
 *   measureName: string,
 *   timeDimension: string | null,
 *   extraDimension: string | null,
 *   data: Array
 * }} regionAllData
 * @param {string} selectedRegionCode
 * @param {string} selectedExtraValue
 * @returns {{ x: string[], y: number[][], legend: string[] } | null}
 */
export function buildRegionalSeries(regionAllData, selectedRegionCode, selectedExtraValue) {
  if (
    !regionAllData ||
    !selectedRegionCode ||
    !Array.isArray(regionAllData.data)
  ) {
    return null;
  }

  const { cubeName, measureName, timeDimension, extraDimension, data } =
    regionAllData;

  const keyGeocode = `${cubeName}.geocode_region`;
  const extraKey = extraDimension;
  const shortExtra = extraDimension ? extraDimension.split('.').pop() : null;
  const timeDim = timeDimension;
  const keyTime = timeDim ? `${timeDim}.year` : null;
  const keyTimeAlt = timeDim || null;
  const measureKey = measureName;

  const byTime = new Map();

  data.forEach((row) => {
    const geocode = row[keyGeocode] ?? row['geocode_region'];
    if (String(geocode) !== String(selectedRegionCode)) return;

    if (extraDimension && selectedExtraValue) {
      const dimVal = row[extraKey] ?? (shortExtra ? row[shortExtra] : undefined);
      if (String(dimVal) !== String(selectedExtraValue)) return;
    }

    const rawTime = keyTime ? row[keyTime] ?? row[keyTimeAlt] : null;
    const t = rawTime != null ? yearFromTimeValue(rawTime) : 'Valeur';
    const v = row[measureKey];

    if (
      v != null &&
      (typeof v === 'number' || (typeof v === 'string' && String(v).trim() !== ''))
    ) {
      const num =
        typeof v === 'number'
          ? v
          : parseFloat(String(v).replace(/\s/g, '').replace(',', '.'));
      if (!Number.isNaN(num)) {
        byTime.set(t, num);
      }
    }
  });

  const sortedTimes = Array.from(byTime.keys()).sort((a, b) => {
    const na = Number(a);
    const nb = Number(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    return String(a).localeCompare(String(b));
  });

  const x = sortedTimes.map((t) => String(t));
  const y = [sortedTimes.map((t) => byTime.get(t))];

  return {
    x,
    y,
    legend: ['Historique']
  };
}

