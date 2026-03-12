<template>
  <div class="chart-iframe-view">
    <graph-box 
      v-if="indicator"
      :dataObj="indicator"
      :idAccordion="'graph-' + indicator.id_indic"
      :isIframe="true"
    ></graph-box>
  </div>
</template>

<script>
import GraphBox from '@/components/GraphBox.vue'
import { getIndicators } from '@/services/csvDataService'

export default {
  name: 'ChartIframeView',
  components: {
    GraphBox
  },
  data() {
    return {
      indicator: null,
      loading: true,
      error: null
    }
  },
  async created() {
    try {
      const params = new URLSearchParams(window.location.search)
      const id = params.get('id')
      
      if (!id) {
        throw new Error('No chart ID provided')
      }

      // Load the chart by underlying Grist row ID so that
      // any subchart ID for a grouped indicator resolves
      // to the full multi-series chart.
      const response = await getIndicators({
        time_period: {
          date_start: "2015-01-01",
          date_end: "2031-01-01"
        },
        filter_by: [
          {
            field: 'grist_ids',
            values: [id]
          }
        ]
      }, 'staging')
      
      this.indicator = response.results[0]
      if (!this.indicator) {
        throw new Error('Chart not found')
      }
    } catch (err) {
      console.error('Error loading chart:', err)
      this.error = err.message
    } finally {
      this.loading = false
    }
  }
}
</script>

<style scoped>
.chart-iframe-view {
  width: 100%;
  height: 100%;
  background: white;
}
</style>