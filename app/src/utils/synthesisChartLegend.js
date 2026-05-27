import { computeTrendLine } from '@/services/csvDataService.js'

export const SYNTHESIS_TREND_LEGEND_LABEL = 'Rythme actuel (3 ans)'
export const SYNTHESIS_TARGET_LEGEND_LABEL = 'Cible(s)'
export const SYNTHESIS_TREND_LEGEND_COLOR = '#6a6156'
export const SYNTHESIS_TARGET_LEGEND_COLOR = '#000091'
export const SYNTHESIS_TREND_LEGEND_TITLE =
  'Droite de tendance par régression linéaire sur les 3 dernières années de données mesurées, prolongée jusqu\'en 2035. Lecture indicative par rapport à la cible.'

export function hasActiveTrendLine (trendLine) {
  return Array.isArray(trendLine) && trendLine.some((v) => v != null && !Number.isNaN(Number(v)))
}

export function hasTargetTrajectoryDisplay (trajectory) {
  return Boolean(trajectory && Array.isArray(trajectory.points) && trajectory.points.length > 0)
}

function getPointStatus (value, fallbackYear = '') {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (/^cible_\d{4}$/.test(normalized) || normalized === 'cible') return 'cible'
  if (normalized === 'projection') return 'projection'
  if (normalized === 'mesuré' || /^\d{4}$/.test(normalized)) return 'mesuré'
  if (normalized !== '') return 'mesuré'
  return String(fallbackYear ?? '').trim() === '2030' ? 'cible' : 'mesuré'
}

function isMeasuredValue (value, fallbackYear = '') {
  return getPointStatus(value, fallbackYear) === 'mesuré'
}

function getStackedYears (indicator) {
  return Array.isArray(indicator?.date?.[0]) ? indicator.date[0] : []
}

function getStackedTotals (indicator) {
  const years = getStackedYears(indicator)
  const series = Array.isArray(indicator?.values) ? indicator.values : []
  return years.map((_, index) => {
    let total = 0
    let hasValue = false
    series.forEach((currentSeries) => {
      const rawValue = currentSeries?.[index]
      if (rawValue === null || rawValue === undefined || rawValue === '') return
      const numericValue = Number(rawValue)
      if (Number.isNaN(numericValue)) return
      hasValue = true
      total += numericValue
    })
    return hasValue ? total : null
  })
}

function computeStackedTargetTrajectory (indicator) {
  const years = getStackedYears(indicator)
  const values = getStackedTotals(indicator)
  const statuses = Array.isArray(indicator?.label_value) ? indicator.label_value : []
  if (!years.length || years.length !== values.length) return null

  const explicitReferenceYear = indicator?.reference_year_for_target_trajectory
  let lastMeasuredPoint = null
  let referencePoint = null
  const targetPoints = []

  for (let index = 0; index < years.length; index += 1) {
    if (values[index] === null || values[index] === undefined || values[index] === '') continue
    const numericValue = Number(values[index])
    if (Number.isNaN(numericValue)) continue

    if (isMeasuredValue(statuses[index], years[index])) {
      const measuredPoint = { year: String(years[index]), value: numericValue, isTarget: false }
      lastMeasuredPoint = measuredPoint
      if (explicitReferenceYear && String(years[index]) === String(explicitReferenceYear)) {
        referencePoint = measuredPoint
      }
      continue
    }

    targetPoints.push({ year: String(years[index]), value: numericValue, isTarget: true })
  }

  const startPoint = referencePoint || lastMeasuredPoint
  if (!startPoint || targetPoints.length === 0) return null
  return { points: [startPoint, ...targetPoints] }
}

function computeStackedTrendLine (indicator) {
  const trajectory = computeStackedTargetTrajectory(indicator)
  if (!trajectory) return null
  const years = getStackedYears(indicator)
  const totals = getStackedTotals(indicator)
  const statuses = Array.isArray(indicator?.label_value) ? indicator.label_value : []
  return computeTrendLine(years.map(String), totals, statuses)
}

/** Whether an indicator row would show trend / target overlays in MiniChart. */
export function indicatorAuxChartLegend (indicator) {
  if (!indicator) return { showTrend: false, showTarget: false }

  const chartType = indicator.type_de_graphique || 'Barres simple'
  const isStacked =
    chartType === 'Barres empilées' &&
    Array.isArray(indicator.date) &&
    Array.isArray(indicator.values)

  if (isStacked) {
    const target = computeStackedTargetTrajectory(indicator)
    const trend = target ? computeStackedTrendLine(indicator) : null
    return {
      showTrend: hasActiveTrendLine(trend),
      showTarget: hasTargetTrajectoryDisplay(target)
    }
  }

  const values = indicator.values
  if (values && Array.isArray(values.x) && Array.isArray(values.y)) {
    return {
      showTrend: hasActiveTrendLine(values.trendLine),
      showTarget: hasTargetTrajectoryDisplay(values.targetTrajectory)
    }
  }

  return { showTrend: false, showTarget: false }
}

/** Aggregate flags for a synthesis table (sector or axe). */
export function listShowsAuxChartLegend (indicators) {
  let showTrend = false
  let showTarget = false
  const list = Array.isArray(indicators) ? indicators : []
  for (const raw of list) {
    const flags = indicatorAuxChartLegend(raw)
    if (flags.showTrend) showTrend = true
    if (flags.showTarget) showTarget = true
  }
  return { showTrend, showTarget }
}
