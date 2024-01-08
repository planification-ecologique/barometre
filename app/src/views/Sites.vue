<template>
  <div id="projects-overview" class="fr-grid-row">
    <h1 class="fr-mb-4w">Cartographie des sites internet de l'état</h1>
    <p>Le service d'information du gouvernement, placé sous l'autorité du premier ministre, est en charge de la mesure d'audience de tout les sites internet de l'état.</p>
    <p>La partie cartographie des sites internet de l'Etat concerne la vision globale de tous les sites internet de l'état, incluant ceux non tracké par la solution de mesure d'audience Eulerian, ainsi qu'une carte de tout. Ne possédant pas les données recueillis par les autres solution de trackin, nous parlerons dans cette partie de volume de site pour chacune des catégories.</p>
    <!-- <p> {{ get_all_data() }}</p> -->
    <div class="fr-container">
      <div class="fr-grid-row">
        <div class="fr-col-3">
          <button id="resetFilters" class="fr-btn fr-btn--sm fr-icon-close-circle-line fr-btn--icon-right fr-btn--tertiary fr-mb-3w fr-mt-0" @click="resetFilter()">
            Réinitialiser
          </button>
        </div>
        <div class="fr-col-4">
          <select class="fr-select" id="select-them" name="select-them" @change="changeDimension($event)">
            <option value="" selected disabled hidden>Regrouper les sites par</option>
            <option v-for="t in listDimension" :value="t['value']" :key="t['value']" :disabled="t['disabled']">{{t['label']}}</option>
          </select>
        </div>
        <div class="fr-col-1">&nbsp;</div>
        <div class="fr-col-2">
          <select class="fr-select" id="select-them" name="select-them" @change="changeColoriser($event)">
            <option value="" selected disabled hidden>Coloriser les sites par</option>
            <option v-for="t in listColoriser" :value="t['value']" :key="t['value']" :disabled="t['disabled']">{{t['label']}}</option>
          </select>
        </div>
      </div>
    </div>
    <div class="fr-grid-row" v-if="querySuccess">
      <div class="fr-pt-12w" style="overflow-x: auto;">
            <waffle-chart :x=this.firstDimension :y=this.secondDimension :z=this.thirdDimension>
            </waffle-chart>
      </div>
    </div>
    <!-- <AsyncComp></AsyncComp> -->
    <div class="fr-card fr-card--no-icon fr-card--shadow" v-if="!querySuccess">
      <h3>Aucune donnée ne correspond à cette requête</h3>
    </div>
  </div>
</template>

<script>

import axios from 'axios'
import WaffleChart from '../components/WaffleChart'

export default {
  name: 'Secret',
  components: {
    WaffleChart
    // AsyncComp
    //   DataWaffleChart
  },
  data () {
    return {
      listDimension: [],
      listColoriser: [],
      selectedDimension: 'id_ministere',
      selectedColoriser: 'id_solution_tracking',
      querySuccess: false,
      firstDimension: [],
      secondDimension: [],
      thirdDimension: [] 
    }
  },
  computed: {
  },
  methods: {
    setDimension () {
      this.listDimension = [{ label: 'Ministère de Tutelle', value: 'id_ministere', disabled: false }, { label: 'Solution de Tracking', value: 'id_solution_tracking', disabled: false }]
      this.listColoriser = [{ label: 'Ministère de Tutelle', value: 'id_ministere', disabled: true }, { label: 'Solution de Tracking', value: 'id_solution_tracking', disabled: true }]
    },
    changeDimension (event) {
      console.log('event ' + JSON.stringify(event.target.value))
      this.selectedDimension = event.target.value
      if (this.selectedColoriser === this.selectedDimension) this.selectedColoriser = undefined
      for (var val of this.listColoriser) {
        // console.log(JSON.stringify(val))
        if (val.value === event.target.value) {
          val.disabled = true
        } else {
          val.disabled = false
        }
        // console.log(JSON.stringify(val))
      }
      this.graphics()
    },
    changeColoriser (event) {
      this.selectedColoriser = event.target.value
      this.graphics()
    },
    graphics () {
        if (this.selectedDimension === undefined || this.selectedColoriser === undefined) {
          this.querySuccess = false
        } else {
          var params = { table_name: 'dim_site', first_dimension: this.selectedDimension, second_dimension: this.selectedColoriser }
          // console.log('partams ' + JSON.stringify(params))
          const urlApi = process.env.VUE_APP_API_URL + '/requests/waffle_chart_data'
          console.log(urlApi)
          axios
            .post(urlApi, params)
            .then(response => {
              if (response.data.status) {
                this.querySuccess = true
                // console.log('res --- ' + JSON.stringify(response.data))
                var data = response.data.data
                this.firstDimension = JSON.stringify(data.first_dimension)
                this.secondDimension = JSON.stringify(data.second_dimension)
                this.thirdDimension = JSON.stringify(data.third_dimension)
                this.newQuery = false
              } else {
                this.querySuccess = false
              }
            })
        }
      },
    resetFilter () {
      this.selectedDimension = undefined
      this.selectedColoriser = undefined
      this.graphics()
    }

  },
  mounted () {
    this.setDimension()
    this.graphics()
  }
}
</script>
  
  