/**
 * Helpers for working with Écolab cube region data.
 * Pure functions so that Vue components (e.g. GraphBox) stay lean.
 */

/** True when measure can plot (keeps 0; drops null / empty / NaN). */
export function isValidMeasureValue(v) {
  if (v == null) return false;
  if (typeof v === 'number') return !Number.isNaN(v);
  if (typeof v === 'string' && String(v).trim() !== '') {
    const num = parseFloat(String(v).replace(/\s/g, '').replace(',', '.'));
    return !Number.isNaN(num);
  }
  return false;
}

/**
 * Extract the list of regions and an optional extra dimension (e.g. énergie)
 * from one or more indicator load results.
 * Regions with only null/empty measures are omitted (e.g. Italie on IRPE 685).
 * Pass an array for multi-IRPE: region kept if any source has valid data;
 * extra dimension taken from first result that has one.
 *
 * @param {object | object[] | null | undefined} resultOrResults
 * @returns {{
 *   regionsList: Array<{ geocode_region: string, libelle_region: string }>,
 *   extraDimension: string | null,
 *   extraOptions: Array<{ value: string, label: string }>,
 *   defaultExtraValue: string
 * }}
 */
export function extractRegionsAndExtra(resultOrResults) {
  const empty = {
    regionsList: [],
    extraDimension: null,
    extraOptions: [],
    defaultExtraValue: ''
  };

  const list = Array.isArray(resultOrResults)
    ? resultOrResults.filter(Boolean)
    : resultOrResults
      ? [resultOrResults]
      : [];
  if (!list.length) return empty;

  const byGeocode = new Map();
  let extras = null;

  list.forEach((result) => {
    const extracted = extractRegionsAndExtraFromOne(result);
    extracted.regionsList.forEach((region) => {
      if (!byGeocode.has(region.geocode_region)) {
        byGeocode.set(region.geocode_region, region);
      }
    });
    if (!extras && (extracted.extraDimension || extracted.extraOptions.length)) {
      extras = extracted;
    }
  });

  const regionsList = Array.from(byGeocode.values()).sort((a, b) =>
    a.libelle_region.localeCompare(b.libelle_region, 'fr')
  );

  if (!extras) {
    return { ...empty, regionsList };
  }

  return {
    regionsList,
    extraDimension: extras.extraDimension,
    extraOptions: extras.extraOptions,
    defaultExtraValue: extras.defaultExtraValue
  };
}

/** @param {{ cubeName: string, measureName?: string | null, extraDimension: string | null, data: Array }} result */
function extractRegionsAndExtraFromOne(result) {
  const { cubeName, measureName, extraDimension, data } = result || {};
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
  const measureKey = measureName || null;

  const geocodesWithData = new Set();
  if (measureKey) {
    data.forEach((row) => {
      if (!isValidMeasureValue(row[measureKey])) return;
      const geocode = row[keyGeocode] ?? row['geocode_region'];
      if (geocode) geocodesWithData.add(String(geocode));
    });
  }

  const byGeocode = new Map();

  data.forEach((row) => {
    const geocode = row[keyGeocode] ?? row['geocode_region'];
    const label = row[keyLabel] ?? row['libelle_region'];
    if (!geocode || !label || byGeocode.has(geocode)) return;
    if (measureKey && !geocodesWithData.has(String(geocode))) return;
    byGeocode.set(geocode, {
      geocode_region: String(geocode),
      libelle_region: String(label)
    });
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

    if (isValidMeasureValue(v)) {
      const num =
        typeof v === 'number'
          ? v
          : parseFloat(String(v).replace(/\s/g, '').replace(',', '.'));
      byTime.set(t, num);
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

/**
 * Build a stacked bar series from multiple Écolab indicator loads (multi IRPE ids).
 *
 * @param {Array<{ regionAllData: object, seriesLabel?: string }>} sources
 * @param {string} selectedRegionCode
 * @param {string} selectedExtraValue
 * @returns {{ x: string[], y: number[][], legend: string[] } | null}
 */
export function buildStackedRegionalSeries(sources, selectedRegionCode, selectedExtraValue) {
  if (!Array.isArray(sources) || !sources.length || !selectedRegionCode) {
    return null;
  }

  const built = sources
    .map(({ regionAllData, seriesLabel }) => {
      const series = buildRegionalSeries(
        regionAllData,
        selectedRegionCode,
        selectedExtraValue
      );
      if (!series || !series.x?.length) return null;
      const label =
        seriesLabel ||
        regionAllData?.measureMeta?.libelle_indicateur ||
        regionAllData?.measureName ||
        'Série';
      return { series, label: String(label) };
    })
    .filter(Boolean);

  if (!built.length) return null;

  if (built.length === 1) {
    return built[0].series;
  }

  const yearSet = new Set();
  built.forEach(({ series }) => {
    series.x.forEach((year) => yearSet.add(String(year)));
  });
  const x = Array.from(yearSet).sort((a, b) => {
    const na = Number(a);
    const nb = Number(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    return a.localeCompare(b);
  });

  const y = built.map(({ series }) => {
    const byYear = new Map(series.x.map((year, index) => [String(year), series.y[0][index]]));
    return x.map((year) => (byYear.has(year) ? byYear.get(year) : null));
  });

  return {
    x,
    y,
    legend: built.map((entry) => entry.label),
  };
}

