<template>
  <div class="mini-chart" :class="{ 'mini-chart--detailed': detailed }" :id="containerId">
    <template v-if="detailed">
      <p class="mini-chart__title">{{ displayData.label_indic }}</p>
      <p v-if="displayData.label_unit" class="mini-chart__unit fr-text--xs fr-text-mention--grey">
        Unité : {{ displayData.label_unit }}
      </p>
    </template>
    <!-- Barres simple -->
    <bar-chart
      v-if="chartType === 'Barres simple' && hasBarSimpleData"
      :isSmall="true"
      :x="JSON.stringify(displayData.values.x)"
      :y="JSON.stringify(displayData.values.y)"
      :name="JSON.stringify(displayData.values.legend || [''])"
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
      :x="JSON.stringify(displayData.date)"
      :y="stackedBarYJson"
      :name="JSON.stringify(displayData.label_sous_groupe || [''])"
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
      :x="JSON.stringify(displayData.date)"
      :y="JSON.stringify(displayData.values)"
      :name="JSON.stringify(displayData.label_sous_groupe || [''])"
      :color="lineSeriesColorsJson"
      :aspectratio="2.2"
      :axis-font-size="9"
      :point-radius="2"
      :pointopacity="stackedPointOpacityJson"
      :target-overlay="multiLineHasTarget"
      :trend-by-series-json="multiLineTrendBySeriesJson"
    />
    <!-- Fallback: try bar chart with date/values format -->
    <bar-chart
      v-else-if="hasFallbackData"
      :isSmall="true"
      :x="JSON.stringify(displayData.date)"
      :y="stackedBarYJson"
      :name="JSON.stringify(displayData.label_sous_groupe || [''])"
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
import {
  chartColorTestState,
  resolvePrimaryBarToken,
  resolveExtrapolationToken,
  resolveStackedSeriesToken,
  resolveLineSeriesToken,
  getFallbackPrimaryBarToken,
  getFallbackExtrapolationBarToken
} from '@/services/chartColorTestOverrides.js'
import { getStackedYears, resolveIndicatorOverlays } from '@/utils/chartOverlays.js'
import { getAllColors, getHexaFromName, stackedBarSeriesValuesWithoutCibleYears } from '@/utils.js'
import { regionSelection } from '@/services/regionSelection.js'
import { loadAllRegionsDataForIndicator } from '@/services/ecolabApiService.js'
import { buildStackedRegionalSeries, extractRegionsAndExtra } from '@/services/ecolabRegionHelpers.js'

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
  data() {
    return {
      regionalChartData: null,
      regionalMeasureMeta: null,
      regionalLoadToken: 0,
    }
  },
  watch: {
    sharedRegionCode() {
      this.loadSharedRegion()
    },
    dataObj() {
      this.loadSharedRegion()
    },
    regionalPresentation: {
      handler(value) {
        this.$emit('regional-presentation', value)
      },
      immediate: true,
    },
  },
  computed: {
    sharedRegionCode() {
      return regionSelection.code
    },
    regionalIndicatorIds() {
      const ids = this.dataObj?.irpe_ids
      if (!Array.isArray(ids)) return []
      return ids.map((id) => String(id).trim()).filter(Boolean)
    },
    /** Payload for the synthesis table: regional label, unit and source, or null. */
    regionalPresentation() {
      const regional = this.regionalChartData
      if (!this.sharedRegionCode || !regional || !Array.isArray(regional.x) || !regional.x.length) {
        return null
      }
      const meta = this.regionalMeasureMeta
      const legend = Array.isArray(regional.legend) ? regional.legend : []
      const palette = getAllColors()
      return {
        label: meta?.libelle_indicateur || this.dataObj.label_indic,
        unit: meta?.unite || this.dataObj.label_unit || '',
        source: 'Écolab',
        legendItems: legend.length > 1
          ? legend.map((label, index) => ({
            label,
            color: getHexaFromName(palette[index % palette.length]),
          }))
          : [],
      }
    },
    /** National series, or the shared territory when this indicator can plot it. */
    displayData() {
      const regional = this.regionalChartData
      if (!this.sharedRegionCode || !regional || !Array.isArray(regional.x) || !regional.x.length) {
        return this.dataObj
      }
      const meta = this.regionalMeasureMeta
      const label = meta?.libelle_indicateur || this.dataObj.label_indic
      const unit = meta?.unite || this.dataObj.label_unit
      const stacked = Array.isArray(regional.y) && regional.y.length > 1
      const measured = regional.x.map(() => 'mesuré')
      if (stacked) {
        return {
          ...this.dataObj,
          type_de_graphique: 'Barres empilées',
          label_indic: label,
          label_unit: unit,
          date: [regional.x],
          values: regional.y,
          label_sous_groupe: regional.legend,
          label_value: measured,
        }
      }
      return {
        ...this.dataObj,
        type_de_graphique: 'Barres simple',
        label_indic: label,
        label_unit: unit,
        label_value: measured,
        values: {
          x: [regional.x],
          y: regional.y,
          legend: regional.legend || ['Historique'],
        },
      }
    },
    containerId() {
      return 'mini-chart-' + (this.dataObj.id_indic || Math.random().toString(36).substr(2, 8))
    },
    chartType() {
      return this.displayData.type_de_graphique || 'Barres simple'
    },
    hasBarSimpleData() {
      const v = this.displayData.values
      return v && v.x && Array.isArray(v.x) && v.y && Array.isArray(v.y)
    },
    hasStackedData() {
      return Array.isArray(this.displayData.date) && Array.isArray(this.displayData.values)
    },
    hasFallbackData() {
      return (Array.isArray(this.displayData.date) && Array.isArray(this.displayData.values)) ||
             (this.displayData.values && this.displayData.values.x)
    },
    overlays() {
      return resolveIndicatorOverlays(this.displayData)
    },
    /** Barres empilées : pas de segments sur les années « cible » (ligne objectif uniquement). */
    stackedBarYJson() {
      const vals = this.displayData?.values
      const years = getStackedYears(this.displayData)
      const lv = this.displayData?.label_value
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
      const legend = this.displayData.values?.legend
      if (Array.isArray(legend)) {
        return legend.map(() => '#000091')
      }
      return ['#000091']
    },
    barSimpleColorsJson() {
      chartColorTestState.seriesByIndex
      chartColorTestState.activePresetId
      chartColorTestState.targetToken
      const v = this.displayData.values
      const base = (v && v.colors && [...v.colors]) || [...this.barColors]
      if (base.length > 0) base[0] = resolvePrimaryBarToken(getFallbackPrimaryBarToken())
      if (base.length > 1) base[1] = resolveExtrapolationToken(getFallbackExtrapolationBarToken())
      return JSON.stringify(base)
    },
    stackedSeriesColorsJson() {
      chartColorTestState.seriesByIndex
      chartColorTestState.activePresetId
      const vals = this.displayData.values
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
      const vals = this.displayData.values
      if (!Array.isArray(vals) || !vals.length) return undefined
      const palette = getAllColors()
      const arr = vals.map((_, i) =>
        resolveLineSeriesToken(i, palette[i % palette.length])
      )
      return JSON.stringify(arr)
    },
    trendLineJson() {
      const trendLine = this.overlays.trendLine
      return trendLine ? JSON.stringify(trendLine) : undefined
    },
    targetTrajectoryJson() {
      const targetTrajectory = this.overlays.targetTrajectory
      return targetTrajectory ? JSON.stringify(targetTrajectory) : undefined
    },
    pointOpacityJson() {
      const opacities = this.overlays.pointOpacities
      if (!opacities || Array.isArray(opacities[0])) return undefined
      return JSON.stringify(opacities)
    },
    stackedPointOpacityJson() {
      const opacities = this.overlays.pointOpacities
      if (!opacities || !Array.isArray(opacities[0])) return undefined
      return JSON.stringify(opacities)
    },
    stackedTrendLineJson() {
      if (this.chartType !== 'Barres empilées' || !this.hasStackedData) return undefined
      const trendLine = this.overlays.trendLine
      return trendLine ? JSON.stringify(trendLine) : undefined
    },
    stackedTargetTrajectoryJson() {
      if (this.chartType !== 'Barres empilées' || !this.hasStackedData) return undefined
      const targetTrajectory = this.overlays.targetTrajectory
      return targetTrajectory ? JSON.stringify(targetTrajectory) : undefined
    },
    multiLineHasTarget() {
      if (this.chartType !== 'Courbes indépendantes' || !this.hasStackedData) return undefined
      return this.overlays.hasTarget
    },
    multiLineTrendBySeriesJson() {
      if (this.chartType !== 'Courbes indépendantes' || !this.hasStackedData) return undefined
      const trendLines = this.overlays.trendLines
      return Array.isArray(trendLines) ? JSON.stringify(trendLines) : undefined
    }
  },
  mounted() {
    this.loadSharedRegion()
  },
  methods: {
    async loadSharedRegion() {
      const token = ++this.regionalLoadToken
      const code = this.sharedRegionCode
      const indicatorIds = this.regionalIndicatorIds
      if (!code || !indicatorIds.length) {
        this.clearRegionalSeries()
        return
      }

      try {
        const settled = await Promise.all(
          indicatorIds.map((indicatorId) =>
            loadAllRegionsDataForIndicator(indicatorId)
              .then((data) => ({ indicatorId, data }))
              .catch(() => null)
          )
        )
        if (token !== this.regionalLoadToken) return
        const loaded = settled.filter(Boolean)
        if (!loaded.length) {
          this.clearRegionalSeries()
          return
        }

        const extracted = extractRegionsAndExtra(loaded.map(({ data }) => data))
        const match = extracted.regionsList.find(
          (region) => String(region.geocode_region) === String(code)
        )
        if (!match) {
          this.clearRegionalSeries()
          return
        }

        const sources = loaded.map(({ data }) => ({ regionAllData: data }))
        const series = buildStackedRegionalSeries(
          sources,
          match.geocode_region,
          extracted.defaultExtraValue
        )
        if (!series || !series.x || !series.x.length) {
          this.clearRegionalSeries()
          return
        }
        this.regionalMeasureMeta = loaded[0].data?.measureMeta || null
        this.regionalChartData = series
      } catch (_error) {
        if (token !== this.regionalLoadToken) return
        this.clearRegionalSeries()
      }
    },
    clearRegionalSeries() {
      this.regionalChartData = null
      this.regionalMeasureMeta = null
    },
  },
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
