<template>
  <div class="fr-grid-row">
    <div class="fr-col-12 fr-col-lg" v-if="data!=''">
      <map-chart
        :data="data"
        :level="geolevel"
        :valuenat="valueNat"
        name="Nombre de visites"
        date = '20/11/2023'
      >
      </map-chart>
    </div>
  </div>
</template>

<script>
import MapChart from './components_dsfr/MapChart.vue'
export default {
  name: 'MapBox',
  components: {
    MapChart
  },
  data () {
    return {
    }
  },
  props: {
    data: {
      type: String,
      required: true
    },
    geolevel: {
      type: String,
      required: true
    },
    valueNat: {
      type: Number,
      required: true
    }
  }
}
</script>
