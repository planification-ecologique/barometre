import { getIndicators } from './csvDataService.js'

function escapeCsvCell(value) {
  const s = value == null ? '' : String(value)
  if (/[;"\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function rowsForIndicator(indicator) {
  const rows = []
  const base = {
    id: indicator.id_indic || '',
    label: indicator.label_indic || '',
    unit: indicator.label_unit || indicator.unite || '',
    sector: indicator.sector || '',
    levier: indicator.levier || '',
  }

  const hasSubgroups =
    Array.isArray(indicator.label_sous_groupe) &&
    indicator.label_sous_groupe.length > 0 &&
    indicator.label_sous_groupe !== ''

  if (hasSubgroups && indicator.date && indicator.values) {
    const years = indicator.date[0] || []
    indicator.label_sous_groupe.forEach((subgroup, seriesIndex) => {
      const series = indicator.values[seriesIndex] || []
      years.forEach((year, yearIndex) => {
        const value = series[yearIndex]
        if (value == null || value === '') return
        rows.push({
          ...base,
          sous_groupe: subgroup,
          annee: year,
          valeur: value,
          type: 'Mesuré',
        })
      })
    })
    return rows
  }

  const years = indicator.tableAnnee || []
  const values = indicator.tableValeur || []
  const types = indicator.tableTypeMesure || []
  for (let i = 0; i < years.length; i++) {
    rows.push({
      ...base,
      sous_groupe: '',
      annee: years[i],
      valeur: values[i],
      type: types[i] || 'Mesuré',
    })
  }
  return rows
}

/**
 * CSV long format — une ligne par point de donnée (aligné sur GraphBox).
 * @param {string} environment - production | staging
 * @returns {Promise<string>}
 */
export async function buildAllIndicatorsCsv(environment = 'production') {
  const response = await getIndicators(
    {
      time_period: {
        date_start: '2010-01-01',
        date_end: '2051-01-01',
      },
    },
    environment
  )

  const headers = [
    'ID',
    'Indicateur',
    'Unité',
    'Secteur',
    'Levier',
    'Sous-groupe',
    'Année',
    'Valeur',
    'Type',
  ]
  const lines = [headers.join(';')]

  for (const indicator of response.results || []) {
    for (const row of rowsForIndicator(indicator)) {
      lines.push(
        [
          row.id,
          row.label,
          row.unit,
          row.sector,
          row.levier,
          row.sous_groupe,
          row.annee,
          row.valeur,
          row.type,
        ]
          .map(escapeCsvCell)
          .join(';')
      )
    }
  }

  return lines.join('\n')
}

function exportFilename() {
  const date = new Date().toISOString().slice(0, 10)
  return `barometre_indicateurs_${date}.csv`
}

/**
 * Télécharge un CSV regroupant tous les indicateurs visibles.
 * @param {string} environment - production | staging
 */
export async function downloadAllIndicators(environment = 'production') {
  const csv = await buildAllIndicatorsCsv(environment)
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = exportFilename()
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
