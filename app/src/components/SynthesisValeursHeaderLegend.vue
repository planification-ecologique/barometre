<template>
  <div class="th-valeurs-inner">
    <span class="th-valeurs-title">Valeurs</span>
    <div
      v-if="showTrend || showTarget"
      class="th-valeurs-legend"
      aria-label="Légende des graphiques"
    >
      <span
        v-if="showTrend"
        class="th-valeurs-legend-item"
        :title="trendTitle"
      >
        <span class="th-valeurs-legend-dash" aria-hidden="true">
          <span class="th-valeurs-dash-seg" :style="{ backgroundColor: trendColor }"></span>
          <span class="th-valeurs-dash-seg" :style="{ backgroundColor: trendColor }"></span>
        </span>
        <span class="th-valeurs-legend-label">{{ trendLabel }}</span>
      </span>
      <span
        v-if="showTarget"
        class="th-valeurs-legend-item"
      >
        <span
          class="th-valeurs-legend-dot"
          :style="{ backgroundColor: targetColor }"
          aria-hidden="true"
        ></span>
        <span class="th-valeurs-legend-label">{{ targetLabel }}</span>
      </span>
    </div>
  </div>
</template>

<script>
import {
  listShowsAuxChartLegend,
  SYNTHESIS_TARGET_LEGEND_COLOR,
  SYNTHESIS_TARGET_LEGEND_LABEL,
  SYNTHESIS_TREND_LEGEND_COLOR,
  SYNTHESIS_TREND_LEGEND_LABEL,
  SYNTHESIS_TREND_LEGEND_TITLE
} from '@/utils/synthesisChartLegend.js'

export default {
  name: 'SynthesisValeursHeaderLegend',
  props: {
    indicators: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      trendLabel: SYNTHESIS_TREND_LEGEND_LABEL,
      targetLabel: SYNTHESIS_TARGET_LEGEND_LABEL,
      trendColor: SYNTHESIS_TREND_LEGEND_COLOR,
      targetColor: SYNTHESIS_TARGET_LEGEND_COLOR,
      trendTitle: SYNTHESIS_TREND_LEGEND_TITLE
    }
  },
  computed: {
    legendFlags () {
      return listShowsAuxChartLegend(this.indicators)
    },
    showTrend () {
      return this.legendFlags.showTrend
    },
    showTarget () {
      return this.legendFlags.showTarget
    }
  }
}
</script>

<style scoped>
.th-valeurs-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.375rem 0.75rem;
  width: 100%;
  min-height: 1.5rem;
}

.th-valeurs-title {
  font-weight: inherit;
  flex-shrink: 0;
}

.th-valeurs-legend {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem 1rem;
  font-weight: 600;
  font-size: 0.75rem;
  color: #666;
  line-height: 1.25;
  flex: 1 1 auto;
  min-width: 0;
}

.th-valeurs-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  white-space: nowrap;
}

.th-valeurs-legend-dash {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.th-valeurs-dash-seg {
  width: 0.35rem;
  height: 0.2rem;
  display: inline-block;
  flex-shrink: 0;
}

.th-valeurs-dash-seg + .th-valeurs-dash-seg {
  margin-left: 0.1rem;
}

.th-valeurs-legend-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.th-valeurs-legend-label {
  font-weight: 600;
}

@media (max-width: 768px) {
  .th-valeurs-inner {
    flex-direction: column;
    align-items: flex-start;
  }

  .th-valeurs-legend {
    justify-content: flex-start;
  }
}
</style>
