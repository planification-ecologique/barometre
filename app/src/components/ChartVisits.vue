<template>
  <div id="projects-overview" class="fr-grid-row fr-pt-3w fr-pb-5w">
    <!-- Vue d'ensemble  -->
    <div>
      <h1 id="home" class="fr-mb-4w">Vue d'ensemble</h1>
    <p>Le service d'information du gouvernement, placé sous l'autorité du premier ministre, est en charge de la mesure d'audience de tout les sites internet de l'état.</p>
    </div>
 
    <div id="explanation">
      "L'observatoire des sites internet de l'état" à pour objectif de synthétiser l'ensemble des données sur la fréquentation des sites internet de l'état, Il est tenu de renseigner la fréquentation de toute la toile gouvernementale, et de permettre à chacun de se faire une idée de l'implication de l'état dans sa communication numérique. Ces informations sont publiques et sont rendu disponible au grand public.
      <br>
      La partie "Fréquentation des sites internet de l'état" concerne uniquement les sites internet tracké par la solution de mesure d'audience Eulerian. Elle donne la fréquentation en terme de visite et pages vues de ces derniers, tout en renseignant le taux de consentement global de la toile gouvernementale.
      <br><br>
    </div>
    <!-- Mobile average chart -->
    
    <LineSeriesChart :serieObj=visiteObj v-if="querySuccess"></LineSeriesChart>
    <br>
    <LineSeriesChart :serieObj=vueObj v-if="querySuccess"></LineSeriesChart>
    <br>
    <LineSeriesChart :serieObj=durationObj v-if="querySuccess"></LineSeriesChart>
    <!-- Cartographie -->
    <div v-if="queryMapSucces">
      <h1 id="provenance-geographique" class="fr-mt-4w">Provenance géographique</h1>
      <!-- Onglets -->
      <div class="fr-tabs">
        <ul class="fr-tabs__list" role="tablist" aria-label="Onglets mailles">
          <li role="presentation">
            <button id="tabpanel-reg" class="fr-tabs__tab fr-icon-checkbox-line fr-tabs__tab--icon-left" tabindex="-1" role="tab" aria-selected="true" aria-controls="tabpanel-reg-panel">Région</button>
          </li>
          <li role="presentation">
            <button id="tabpanel-dep" class="fr-tabs__tab fr-icon-checkbox-line fr-tabs__tab--icon-left" tabindex="0" role="tab" aria-selected="false" aria-controls="tabpanel-dep-panel">Département</button>
          </li>
          <li role="presentation">
            <button id="tabpanel-inter" class="fr-tabs__tab fr-icon-checkbox-line fr-tabs__tab--icon-left" tabindex="-1" role="tab" aria-selected="false" aria-controls="tabpanel-inter-panel">International</button>
          </li>
        </ul>
        <!-- Contenu des onglets -->
        <div id="tabpanel-dep-panel" class="fr-tabs__panel fr-tabs__panel--selected" role="tabpanel" aria-labelledby="tabpanel-dep" tabindex="0">
          <MapBox
            :data="dataDep"
            geolevel="dep"
            :valueNat="valueNat"
          >
          </MapBox>
        </div>
        <div id="tabpanel-reg-panel" class="fr-tabs__panel" role="tabpanel" aria-labelledby="tabpanel-reg" tabindex="0">
          <MapBox
            :data="dataReg"
            geolevel="reg"
            :valueNat="valueNat"
          >
          </MapBox>
        </div>
        <div id="tabpanel-inter-panel" class="fr-tabs__panel" role="tabpanel" aria-labelledby="tabpanel-inter" tabindex="0">
          <!-- Contenu -->
          <MapWorldChart
            :dataCountry= dataCountry
          ></MapWorldChart>
        </div>
      </div>
      <section class="fr-accordion">
        <h3 class="fr-accordion__title">
          <button class="fr-accordion__btn fr-text-action-high--blue-france fr-px-4w" aria-expanded="false"
            :aria-controls="'accordion_map'">En savoir plus sur l'indicateur</button>
        </h3>
        <div class="fr-collapse fr-px-4w" :id="'accordion_map'">
          <p class="fr-text--sm fr-mb-0">{{ descriptionCartes }}</p>
        </div>
      </section>
    </div>
    <div class="fr-card fr-card--no-icon fr-card--shadow" v-if="!querySuccess && !queryMapSucces && !charging">
      <h3>Aucune donnée ne correspond à ce site sur cette période</h3>
    </div>
    <br>
    <!-- Accès aux sites Pie-charts -->
    <h1 id="access-site" class="fr-mt-4w" v-if=queryPiechartSuccess>Accès aux sites</h1>
    <PieBox :serieObj=deviceObj v-if=queryPiechartSuccess></PieBox>
    <!-- Type de site -->
    <h1 id="type-site" class="fr-mt-4w" v-if="queryBarChartSuccess">Type de site</h1>
    <BarSeriesChart :serieObj=ministereObj v-if="queryBarChartSuccess"></BarSeriesChart>
  </div>
</template>

<script>
import axios from 'axios'
import MapBox from './MapBox.vue'
// import MobileSeriesChart from './MobileSeriesChart.vue'
import LineSeriesChart from './LineSeriesChart.vue'
import MapWorldChart from './MapWorldChart.vue'
import PieBox from './PieBox.vue'
import BarSeriesChart from './BarSeriesChart.vue'

export default {
  name: 'ChartVisits',
  components: {
    MapBox,
    LineSeriesChart,
    PieBox,
    BarSeriesChart,
    MapWorldChart
},
  data () {
    return {
      //series
      querySuccess: false,
      visiteObj: Object,
      vueObj: Object,
      durationObj: Object,
      //maps
      queryMapSucces: false,
      dataDep: '',
      dataReg: '',
      dataCountry: Object,
      valueNat: 0,
      descriptionCartes: '',
      //pie chart
      queryPiechartSuccess: false,
      deviceObj: Object,
      //bar chart
      queryBarChartSuccess: false,
      ministereObj: Object,
      //initial charging
      charging: true
    }
  },
  props:{
    query: Object
  },
  methods: {
    maps (params) {
      const urlApi = process.env.VUE_APP_API_URL + '/requests/visits_regions_departements'
      axios
        .post(urlApi, params)
        .then(response => {
          if (response.data.status) {
            this.queryMapSucces = true
            const data = response.data.data
            // console.log(data)
            this.valueNat = data.total_france
            this.dataDep = JSON.stringify(data.departement.series[0].serie_values.nb_visite)
            this.dataReg = JSON.stringify(data.region.series[0].serie_values.nb_visite)
            this.dataCountry = data.country.series[0].serie_values.nb_visite
            this.descriptionCartes = data.name
          } else {
            this.queryMapSucces = false
          }
        })
    },
    graphics (params) {
      const urlApi = process.env.VUE_APP_API_URL + '/requests/query_visite'
      axios
        .post(urlApi, params)
        .then(response => {
          if (response.data.status) {
            this.querySuccess = true
            // console.log('res --- ' + JSON.stringify(response.data))
            var data = response.data.data
            this.visiteObj = data.series[0]
            this.visiteObj.description = data.description + ' ' + data.name
            // console.log('res --- ' + JSON.stringify(this.visiteObj))
            this.vueObj = data.series[1]
            this.vueObj.description = data.description + ' ' + data.name
            this.durationObj = data.series[2]
            this.durationObj.description = data.description + ' ' + data.name
          } else {
            this.querySuccess = false
          }
        })
    },
    graphics_barChart (params) {
      const urlApi = process.env.VUE_APP_API_URL + '/requests/visits_ministere'
      axios
        .post(urlApi, params)
        .then(response => {
          if (response.data.status) {
            // console.log('res --- ' + JSON.stringify(response.data))
            var data = response.data.data
            this.ministereObj = data.series[0]
            this.queryBarChartSuccess = true
          } else {
            this.queryBarChartSuccess = false
          }
        })
    },
    pie_chart_data (params) {
      const urlApi = process.env.VUE_APP_API_URL + '/requests/visits_device'
      axios
        .post(urlApi, params)
        .then(response => {
          if (response.data.status) {
            this.deviceObj = response.data.data.series[0]
            // console.log(JSON.stringify(this.deviceObj))
            this.queryPiechartSuccess = true
          } else {
            this.queryPiechartSuccess = false
          }
        })
    }
  },
  watch: {
    query: function () {
      this.maps(this.query)
      this.graphics(this.query)
      this.pie_chart_data(this.query)
      this.graphics_barChart(this.query)
    }
  },
  mounted () {
    this.maps(this.query)
    this.graphics(this.query)
    this.pie_chart_data(this.query)
    this.graphics_barChart(this.query)
  }
}
</script>
<style scoped lang="scss">
#projects-overview {
  @media (min-width: 62em) {
    box-shadow: 0 1px 0 0 var(--border-default-grey);
  }
}
#explanation {
  font-size: small;
}
</style>
