import { computeTrendLine, TREND_LINE_END_YEAR } from '@/services/csvDataService.js'
import { getChartPointStatus } from '@/utils.js'

export const EXTRAPOLATION_POINT_OPACITY = 0.6

const EMPTY_AUX_LEGEND = { showTrend: false, showTarget: false }

export function isMeasuredPointStatus (labelValue, fallbackYear = '') {
  return getChartPointStatus(labelValue, fallbackYear) === 'mesuré'
}

export function chartPointOpacity (labelValue, fallbackYear = '') {
  return isMeasuredPointStatus(labelValue, fallbackYear) ? 1 : EXTRAPOLATION_POINT_OPACITY
}

export function buildYearOpacities (years, labelValues) {
  const statuses = Array.isArray(labelValues) ? labelValues : []
  return years.map((year, index) => chartPointOpacity(statuses[index], year))
}

export function buildPerSeriesOpacities (years, labelValues, seriesCount) {
  const base = buildYearOpacities(years, labelValues)
  return Array.from({ length: seriesCount }, () =>
    base.map((opacity, index) => (base[index] !== undefined ? opacity : 1))
  )
}

export function getStackedYears (indicator) {
  return Array.isArray(indicator?.date?.[0]) ? indicator.date[0] : []
}

export function getStackedStatuses (indicator) {
  return Array.isArray(indicator?.label_value) ? indicator.label_value : []
}

export function getStackedSeries (indicator) {
  return Array.isArray(indicator?.values) ? indicator.values : []
}

export function getStackedTotals (years, series) {
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

export function hasActiveTrendLine (trendLine) {
  return Array.isArray(trendLine) && trendLine.some((v) => v != null && !Number.isNaN(Number(v)))
}

export function hasTargetTrajectoryDisplay (trajectory) {
  return Boolean(trajectory && Array.isArray(trajectory.points) && trajectory.points.length > 0)
}

export function computeTargetTrajectory ({
  years,
  values,
  statuses,
  referenceYear = null
}) {
  if (!Array.isArray(years) || !Array.isArray(values) || years.length !== values.length) return null

  let lastMeasuredPoint = null
  let referencePoint = null
  const targetPoints = []

  for (let index = 0; index < years.length; index += 1) {
    if (values[index] === null || values[index] === undefined || values[index] === '') continue
    const numericValue = Number(values[index])
    if (Number.isNaN(numericValue)) continue

    if (isMeasuredPointStatus(statuses[index], years[index])) {
      const measuredPoint = { year: String(years[index]), value: numericValue, isTarget: false }
      lastMeasuredPoint = measuredPoint
      if (referenceYear && String(years[index]) === String(referenceYear)) {
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

export function computeTrendLineFromStatuses (years, values, statuses, numYears = 3) {
  if (!Array.isArray(years) || !Array.isArray(values) || years.length !== values.length) return null
  return computeTrendLine(years.map(String), values, statuses, numYears)
}

/** Cible multi-ligne : point 2030 semi-transparent (aligné MultiLineChart). */
export function hasMultiLineTargetFromOpacities (years, opacities) {
  const idx2030 = years.findIndex((year) => String(year).trim() === '2030')
  if (idx2030 === -1) return false
  if (Array.isArray(opacities?.[0])) {
    return opacities.some((seriesOpacity) => Number(seriesOpacity?.[idx2030]) < 1)
  }
  return Number(opacities[idx2030]) < 1
}

export function computeTrendLineFromOpacities (years, values, opacities, numYears = 3) {
  if (!Array.isArray(years) || !Array.isArray(values) || years.length !== values.length) return null

  const measured = []
  for (let index = 0; index < years.length; index += 1) {
    const raw = values[index]
    if (raw === null || raw === undefined || raw === '') continue
    const numericValue = Number(raw)
    if (Number.isNaN(numericValue)) continue
    const alpha = (opacities && opacities[index] !== undefined) ? Number(opacities[index]) : 1
    if (alpha < 1) continue
    const year = Number(years[index])
    if (Number.isNaN(year)) continue
    measured.push({ index, year, value: numericValue })
  }

  if (measured.length < 2) return null
  const lastMeasured = measured.slice(-numYears)
  const xValues = lastMeasured.map((point) => point.year)
  const yValues = lastMeasured.map((point) => point.value)
  const regression = linearRegression(xValues, yValues)
  if (!regression) return null

  const firstIndex = lastMeasured[0].index
  return years.map((year, index) => {
    if (index < firstIndex) return null
    const numericYear = Number(year)
    if (Number.isNaN(numericYear)) return null
    if (numericYear > TREND_LINE_END_YEAR) return null
    return regression.slope * numericYear + regression.intercept
  })
}

export function computeMultiLineTrendLines (years, series, opacities) {
  return series.map((values) => computeTrendLineFromOpacities(years, values, opacities))
}

function linearRegression (xValues, yValues) {
  if (!Array.isArray(xValues) || !Array.isArray(yValues) || xValues.length !== yValues.length || xValues.length < 2) {
    return null
  }
  const n = xValues.length
  const sumX = xValues.reduce((sum, value) => sum + value, 0)
  const sumY = yValues.reduce((sum, value) => sum + value, 0)
  const sumXY = xValues.reduce((sum, value, index) => sum + value * yValues[index], 0)
  const sumXX = xValues.reduce((sum, value) => sum + value * value, 0)
  const denominator = (n * sumXX) - (sumX * sumX)
  if (denominator === 0) return null
  const slope = ((n * sumXY) - (sumX * sumY)) / denominator
  const intercept = (sumY - (slope * sumX)) / n
  return { slope, intercept }
}

function emptyOverlays (chartType = 'Barres simple') {
  return {
    chartType,
    trendLine: null,
    trendLines: null,
    targetTrajectory: null,
    pointOpacities: null,
    hasTarget: false,
    auxLegend: { ...EMPTY_AUX_LEGEND }
  }
}

function resolveBarSimpleOverlays (indicator) {
  const values = indicator.values
  const years = Array.isArray(values?.x?.[0]) ? values.x[0] : (Array.isArray(values?.x) ? values.x : [])
  const statuses = getStackedStatuses(indicator)
  const trendLine = values?.trendLine ?? null
  const targetTrajectory = values?.targetTrajectory ?? null
  const pointOpacities = years.length > 0 ? buildYearOpacities(years, statuses) : null

  return {
    chartType: 'Barres simple',
    trendLine,
    trendLines: null,
    targetTrajectory,
    pointOpacities,
    hasTarget: hasTargetTrajectoryDisplay(targetTrajectory),
    auxLegend: {
      showTrend: hasActiveTrendLine(trendLine),
      showTarget: hasTargetTrajectoryDisplay(targetTrajectory)
    }
  }
}

function resolveStackedBarOverlays (indicator) {
  const years = getStackedYears(indicator)
  const statuses = getStackedStatuses(indicator)
  const series = getStackedSeries(indicator)
  const totals = getStackedTotals(years, series)
  const targetTrajectory = computeTargetTrajectory({
    years,
    values: totals,
    statuses,
    referenceYear: indicator?.reference_year_for_target_trajectory ?? null
  })
  const trendLine = targetTrajectory
    ? computeTrendLineFromStatuses(years, totals, statuses)
    : null
  const pointOpacities = series.length > 0
    ? buildPerSeriesOpacities(years, statuses, series.length)
    : null

  return {
    chartType: 'Barres empilées',
    trendLine,
    trendLines: null,
    targetTrajectory,
    pointOpacities,
    hasTarget: hasTargetTrajectoryDisplay(targetTrajectory),
    auxLegend: {
      showTrend: hasActiveTrendLine(trendLine),
      showTarget: hasTargetTrajectoryDisplay(targetTrajectory)
    }
  }
}

function resolveMultiLineOverlays (indicator) {
  const years = getStackedYears(indicator)
  const statuses = getStackedStatuses(indicator)
  const series = getStackedSeries(indicator)
  const baseOpacities = buildYearOpacities(years, statuses)
  const pointOpacities = series.length > 0
    ? buildPerSeriesOpacities(years, statuses, series.length)
    : null
  const hasTarget = hasMultiLineTargetFromOpacities(years, baseOpacities)
  const trendLines = hasTarget ? computeMultiLineTrendLines(years, series, baseOpacities) : []

  return {
    chartType: 'Courbes indépendantes',
    trendLine: null,
    trendLines,
    targetTrajectory: null,
    pointOpacities,
    hasTarget,
    auxLegend: {
      showTrend: trendLines.some((trend) => hasActiveTrendLine(trend)),
      showTarget: hasTarget
    }
  }
}

/** Single source for trend / target overlays and synthesis legend flags. */
export function resolveIndicatorOverlays (indicator) {
  if (!indicator) return emptyOverlays()

  const chartType = indicator.type_de_graphique || 'Barres simple'
  const values = indicator.values
  const hasStackedShape = Array.isArray(indicator.date) && Array.isArray(indicator.values)
  const hasBarSimpleShape = values && Array.isArray(values.x) && Array.isArray(values.y)

  if (chartType === 'Barres simple' && hasBarSimpleShape) {
    return resolveBarSimpleOverlays(indicator)
  }

  if (chartType === 'Barres empilées' && hasStackedShape) {
    return resolveStackedBarOverlays(indicator)
  }

  if (chartType === 'Courbes indépendantes' && hasStackedShape) {
    return resolveMultiLineOverlays(indicator)
  }

  if (hasBarSimpleShape) {
    return resolveBarSimpleOverlays(indicator)
  }

  if (hasStackedShape) {
    return resolveStackedBarOverlays(indicator)
  }

  return emptyOverlays(chartType)
}

export function listIndicatorAuxLegendFlags (indicators) {
  let showTrend = false
  let showTarget = false
  const list = Array.isArray(indicators) ? indicators : []
  for (const raw of list) {
    const { auxLegend } = resolveIndicatorOverlays(raw)
    if (auxLegend.showTrend) showTrend = true
    if (auxLegend.showTarget) showTarget = true
  }
  return { showTrend, showTarget }
}
