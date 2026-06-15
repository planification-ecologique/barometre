<template>
  <div class="mini-chart" :class="{ 'mini-chart--detailed': detailed }" :id="containerId">
    <template v-if="detailed">
      <p class="mini-chart__title">{{ dataObj.label_indic }}</p>
      <p v-if="dataObj.label_unit" class="mini-chart__unit fr-text--xs fr-text-mention--grey">
        Unité : {{ dataObj.label_unit }}
      </p>
    </template>
    <!-- Barres simple -->
    <bar-chart
      v-if="chartType === 'Barres simple' && hasBarSimpleData"
      :isSmall="true"
      :x="JSON.stringify(dataObj.values.x)"
      :y="JSON.stringify(dataObj.values.y)"
      :name="JSON.stringify(dataObj.values.legend || [''])"
      :horizontal="false"
      :stacked="true"
      :color="barSimpleColorsJson"
      :aspectratio="2.2"
      :axis-font-size="9"
      :point-radius="2"
      :pointopacity="pointOpacityJson"
      :trendline="trendLineJson"
      :target-trajectory="targetTrajectoryJson"
    />
    <!-- Barres empilées -->
    <bar-chart
      v-else-if="chartType === 'Barres empilées' && hasStackedData"
      :isSmall="true"
      :x="JSON.stringify(dataObj.date)"
      :y="stackedBarYJson"
      :name="JSON.stringify(dataObj.label_sous_groupe || [''])"
      :color="stackedSeriesColorsJson"
      :horizontal="false"
      :stacked="true"
      :aspectratio="2.2"
      :axis-font-size="9"
      :point-radius="2"
      :pointopacity="stackedPointOpacityJson"
      :trendline="stackedTrendLineJson"
      :target-trajectory="stackedTargetTrajectoryJson"
    />
    <!-- Courbes indépendantes -->
    <multi-line-chart
      v-else-if="chartType === 'Courbes indépendantes' && hasStackedData"
      :isSmall="true"
      :x="JSON.stringify(dataObj.date)"
      :y="JSON.stringify(dataObj.values)"
      :name="JSON.stringify(dataObj.label_sous_groupe || [''])"
      :color="lineSeriesColorsJson"
      :aspectratio="2.2"
      :axis-font-size="9"
      :point-radius="2"
      :pointopacity="stackedPointOpacityJson"
    />
    <!-- Fallback: try bar chart with date/values format -->
    <bar-chart
      v-else-if="hasFallbackData"
      :isSmall="true"
      :x="JSON.stringify(dataObj.date)"
      :y="stackedBarYJson"
      :name="JSON.stringify(dataObj.label_sous_groupe || [''])"
      :color="stackedSeriesColorsJson"
      :horizontal="false"
      :stacked="true"
      :aspectratio="2.2"
      :axis-font-size="9"
      :point-radius="2"
      :pointopacity="stackedPointOpacityJson"
      :trendline="stackedTrendLineJson"
      :target-trajectory="stackedTargetTrajectoryJson"
    />
  </div>
</template>

<script>
import BarChart from './components_dsfr/BarChart.vue'
import MultiLineChart from './components_dsfr/MultiLineChart.vue'
import { TREND_LINE_END_YEAR } from '@/services/csvDataService.js'
import {
  chartColorTestState,
  resolvePrimaryBarToken,
  resolveExtrapolationToken,
  resolveStackedSeriesToken,
  resolveLineSeriesToken,
  getFallbackPrimaryBarToken,
  getFallbackExtrapolationBarToken
} from '@/services/chartColorTestOverrides.js'
import { getAllColors, stackedBarSeriesValuesWithoutCibleYears } from '@/utils.js'

export default {
  name: 'MiniChart',
  components: {
    BarChart,
    MultiLineChart
  },
  props: {
    dataObj: {
      type: Object,
      required: true
    },
    /** Titre, unité et légende visibles (aperçu home) ; défaut = graphique seul (tableaux synthèse). */
    detailed: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    containerId() {
      return 'mini-chart-' + (this.dataObj.id_indic || Math.random().toString(36).substr(2, 8))
    },
    chartType() {
      return this.dataObj.type_de_graphique || 'Barres simple'
    },
    hasBarSimpleData() {
      const v = this.dataObj.values
      return v && v.x && Array.isArray(v.x) && v.y && Array.isArray(v.y)
    },
    hasStackedData() {
      return Array.isArray(this.dataObj.date) && Array.isArray(this.dataObj.values)
    },
    hasFallbackData() {
      return (Array.isArray(this.dataObj.date) && Array.isArray(this.dataObj.values)) ||
             (this.dataObj.values && this.dataObj.values.x)
    },
    /** Barres empilées : pas de segments sur les années « cible » (ligne objectif uniquement). */
    stackedBarYJson() {
      const vals = this.dataObj?.values
      const years = this.getStackedYears()
      const lv = this.dataObj?.label_value
      const strip =
        Array.isArray(vals) &&
        years.length > 0 &&
        (this.chartType === 'Barres empilées' || this.hasFallbackData)
      if (!strip) {
        return JSON.stringify(vals)
      }
      return JSON.stringify(
        stackedBarSeriesValuesWithoutCibleYears(vals, Array.isArray(lv) ? lv : [], years)
      )
    },
    barColors() {
      const legend = this.dataObj.values?.legend
      if (Array.isArray(legend)) {
        return legend.map(() => '#000091')
      }
      return ['#000091']
    },
    barSimpleColorsJson() {
      chartColorTestState.seriesByIndex
      chartColorTestState.activePresetId
      chartColorTestState.targetToken
      const v = this.dataObj.values
      const base = (v && v.colors && [...v.colors]) || [...this.barColors]
      if (base.length > 0) base[0] = resolvePrimaryBarToken(getFallbackPrimaryBarToken())
      if (base.length > 1) base[1] = resolveExtrapolationToken(getFallbackExtrapolationBarToken())
      return JSON.stringify(base)
    },
    stackedSeriesColorsJson() {
      chartColorTestState.seriesByIndex
      chartColorTestState.activePresetId
      const vals = this.dataObj.values
      if (!Array.isArray(vals) || !vals.length) return undefined
      const palette = getAllColors()
      const arr = vals.map((_, i) =>
        resolveStackedSeriesToken(i, palette[i % palette.length])
      )
      return JSON.stringify(arr)
    },
    lineSeriesColorsJson() {
      chartColorTestState.seriesByIndex
      chartColorTestState.activePresetId
      const vals = this.dataObj.values
      if (!Array.isArray(vals) || !vals.length) return undefined
      const palette = getAllColors()
      const arr = vals.map((_, i) =>
        resolveLineSeriesToken(i, palette[i % palette.length])
      )
      return JSON.stringify(arr)
    },
    // Pass trendLine from the values object (same as GraphBox's chartValues.trendLine)
    trendLineJson() {
      const tl = this.dataObj.values?.trendLine
      return tl ? JSON.stringify(tl) : undefined
    },
    // Pass targetTrajectory from the values object
    targetTrajectoryJson() {
      const tt = this.dataObj.values?.targetTrajectory
      return tt ? JSON.stringify(tt) : undefined
    },
    // Build point opacity from label_value (same logic as GraphBox)
    pointOpacityJson() {
      try {
        const lv = this.dataObj.label_value
        const values = this.dataObj.values
        if (!values || !values.x) return undefined
        const length = values.x[0]?.length || 0
        if (!length) return undefined

        if (Array.isArray(lv)) {
          const arr = lv.map(v => {
            const s = String(v ?? '').trim().toLowerCase()
            if (s === 'mesuré' || /^\d{4}$/.test(s)) return 1
            // projection and cible: use 0.6 to match GraphBox (avoids ghost target dots)
            if (s === 'projection' || /^cible_\d{4}$/.test(s) || s === 'cible') return 0.6
            return 0.6
          })
          // Pad to match length
          while (arr.length < length) arr.push(1)
          return JSON.stringify(arr.slice(0, length))
        }
        return undefined
      } catch (e) {
        return undefined
      }
    },
    // Point opacity for stacked/multi-line charts (must match GraphBox.buildOpacityArray logic)
    stackedPointOpacityJson() {
      try {
        const lv = this.dataObj.label_value
        const values = this.dataObj.values
        if (!Array.isArray(values)) return undefined

        const years = Array.isArray(this.dataObj.date?.[0]) ? this.dataObj.date[0] : []
        // Use year for fallback when status is empty: 2030 -> cible (0.6), else mesuré (1)
        const baseOpacity = years.map((year, i) => {
          const v = Array.isArray(lv) ? lv[i] : null
          const s = String(v ?? '').trim().toLowerCase()
          if (s === 'mesuré' || /^\d{4}$/.test(s)) return 1
          if (s === 'projection' || /^cible_\d{4}$/.test(s) || s === 'cible') return 0.6
          // Empty/unknown: match GraphBox isMeasuredValue fallback (year 2030 -> cible, else mesuré)
          return String(year ?? '').trim() === '2030' ? 0.6 : 1
        })
        while (baseOpacity.length < years.length) baseOpacity.push(1)
        const perSeries = values.map(series =>
          Array.isArray(series)
            ? series.map((_, i) => baseOpacity[i] !== undefined ? baseOpacity[i] : 1)
            : []
        )
        return JSON.stringify(perSeries)
      } catch (e) {
        return undefined
      }
    },
    // Trend line for Barres empilées (same logic as GraphBox.stackedTrendLine) - only when there is a target
    stackedTrendLineJson() {
      if (this.chartType !== 'Barres empilées' || !this.hasStackedData) return undefined
      const traj = this.computeTargetTrajectory(
        this.getStackedYears(),
        this.getStackedTotals(),
        Array.isArray(this.dataObj?.label_value) ? this.dataObj.label_value : []
      )
      if (!traj) return undefined
      const years = this.getStackedYears()
      const totals = this.getStackedTotals()
      const statuses = Array.isArray(this.dataObj?.label_value) ? this.dataObj.label_value : []
      const series = this.computeTrendSeries(years, totals, statuses)
      return series ? JSON.stringify(series) : undefined
    },
    // Target trajectory for Barres empilées (same logic as GraphBox.stackedTargetTrajectory)
    stackedTargetTrajectoryJson() {
      if (this.chartType !== 'Barres empilées' || !this.hasStackedData) return undefined
      const years = this.getStackedYears()
      const totals = this.getStackedTotals()
      const statuses = Array.isArray(this.dataObj?.label_value) ? this.dataObj.label_value : []
      const traj = this.computeTargetTrajectory(years, totals, statuses)
      return traj ? JSON.stringify(traj) : undefined
    }
  },
  methods: {
    getStackedYears() {
      return Array.isArray(this.dataObj?.date?.[0]) ? this.dataObj.date[0] : []
    },
    getStackedTotals() {
      const years = this.getStackedYears()
      const series = Array.isArray(this.dataObj?.values) ? this.dataObj.values : []
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
    },
    isMeasuredValue(value, fallbackYear = '') {
      return this.getPointStatus(value, fallbackYear) === 'mesuré'
    },
    getPointStatus(value, fallbackYear = '') {
      const normalized = String(value ?? '').trim().toLowerCase()
      if (/^cible_\d{4}$/.test(normalized) || normalized === 'cible') return 'cible'
      if (normalized === 'projection') return 'projection'
      if (normalized === 'mesuré' || /^\d{4}$/.test(normalized)) return 'mesuré'
      if (normalized !== '') return 'mesuré'
      return String(fallbackYear ?? '').trim() === '2030' ? 'cible' : 'mesuré'
    },
    computeLinearRegression(xValues, yValues) {
      if (!Array.isArray(xValues) || !Array.isArray(yValues) || xValues.length !== yValues.length || xValues.length < 2) {
        return null
      }
      const n = xValues.length
      const sumX = xValues.reduce((sum, v) => sum + v, 0)
      const sumY = yValues.reduce((sum, v) => sum + v, 0)
      const sumXY = xValues.reduce((sum, v, i) => sum + v * yValues[i], 0)
      const sumXX = xValues.reduce((sum, v) => sum + v * v, 0)
      const denominator = (n * sumXX) - (sumX * sumX)
      if (denominator === 0) return null
      const slope = ((n * sumXY) - (sumX * sumY)) / denominator
      const intercept = (sumY - (slope * sumX)) / n
      return { slope, intercept }
    },
    computeTrendSeries(years, values, statuses, numYears = 3) {
      if (!Array.isArray(years) || !Array.isArray(values) || years.length !== values.length) return null
      const measured = []
      for (let index = 0; index < years.length; index += 1) {
        if (values[index] === null || values[index] === undefined || values[index] === '') continue
        const numericValue = Number(values[index])
        if (this.isMeasuredValue(statuses[index], years[index]) && !Number.isNaN(numericValue)) {
          measured.push({ index, year: Number(years[index]), value: numericValue })
        }
      }
      if (measured.length < 2) return null
      const lastMeasured = measured.slice(-numYears)
      const regression = this.computeLinearRegression(
        lastMeasured.map((p) => p.year),
        lastMeasured.map((p) => p.value)
      )
      if (!regression) return null
      const firstIndex = lastMeasured[0].index
      return years.map((year, index) => {
        if (index < firstIndex) return null
        const numericYear = Number(year)
        if (Number.isNaN(numericYear)) return null
        if (numericYear > TREND_LINE_END_YEAR) return null
        return regression.slope * numericYear + regression.intercept
      })
    },
    computeTargetTrajectory(years, values, statuses) {
      if (!Array.isArray(years) || !Array.isArray(values) || years.length !== values.length) return null
      const explicitReferenceYear = this.dataObj?.reference_year_for_target_trajectory
      let lastMeasuredPoint = null
      let referencePoint = null
      const targetPoints = []

      for (let index = 0; index < years.length; index += 1) {
        if (values[index] === null || values[index] === undefined || values[index] === '') continue
        const numericValue = Number(values[index])
        if (Number.isNaN(numericValue)) continue

        if (this.isMeasuredValue(statuses[index], years[index])) {
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
  }
}
</script>

<style>
/* Mini chart styles — unscoped so they can reach into child components */
/* Largeur pilotée par la cellule du tableau (desktop) ; pas de plafond fixe pour éviter le blanc vide */
.mini-chart {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  min-height: 130px;
  overflow: visible;
  position: relative;
}

.mini-chart .widget_container {
  margin: 0 !important;
  padding: 0 !important;
}

.mini-chart .r_col {
  padding: 0 !important;
  margin: 0 !important;
}

.mini-chart .chart {
  padding: 0 !important;
  margin: 0 !important;
}

/* Hide legends, tooltips, metadata in compact/table mode */
.mini-chart .linechart_tooltip {
  display: none !important;
}

.mini-chart:not(.mini-chart--detailed) .bar-chart-legend,
.mini-chart:not(.mini-chart--detailed) .flex,
.mini-chart:not(.mini-chart--detailed) .legende_dot,
.mini-chart:not(.mini-chart--detailed) .legende_dash_line1,
.mini-chart:not(.mini-chart--detailed) .legende_dash_line2,
.mini-chart:not(.mini-chart--detailed) .legende_dot_circle,
.mini-chart:not(.mini-chart--detailed) .fr-text--xs,
.mini-chart:not(.mini-chart--detailed) .fr-text--sm,
.mini-chart:not(.mini-chart--detailed) .fr-text--bold,
.mini-chart:not(.mini-chart--detailed) .fr-mt-3v,
.mini-chart:not(.mini-chart--detailed) .fr-mt-1w,
.mini-chart:not(.mini-chart--detailed) .fr-mb-1v,
.mini-chart:not(.mini-chart--detailed) .fr-mb-0 {
  display: none !important;
}

.mini-chart:not(.mini-chart--detailed) p {
  display: none !important;
}

.mini-chart--detailed .mini-chart__title {
  display: block;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.35;
  margin: 0 0 0.35rem;
  color: #161616;
}

.mini-chart--detailed .mini-chart__unit {
  display: block;
  margin: 0 0 0.5rem;
}

.mini-chart--detailed .bar-chart-legend-row,
.mini-chart--detailed .legend-row {
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
}

.mini-chart--detailed .bar-chart-legend-label,
.mini-chart--detailed .legend-item {
  font-size: 0.75rem;
}
</style>
