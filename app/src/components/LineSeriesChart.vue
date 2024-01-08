<template>
  <div class="fr-card fr-card--no-icon fr-card--shadow">
    <div class="fr-px-4w fr-pt-3w">
      <h3 class="fr-h6 fr-mb-0">{{ serieObj.nameX }}</h3>
      <div class="fr-px-4w fr-pt-3w">
        <div class="fr-grid-row">
          <div class="fr-col-12 fr-col-md-3">
              <p class="fr-text--xs fr-text-mention--grey fr-mb-3v">Mise à jour : {{ serieObj.update_date }}</p>
              <p class="fr-text--sm fr-text--bold fr-mb-3v">{{ serieObj.total_study }}</p>
              <p class="fr-text--sm fr-text--bold fr-mb-3v">{{ serieObj.mean_study }}</p>
              <p class="fr-badge" v-bind:class="{'fr-badge--down':isDown, 'fr-badge--error': isRed, 'fr-badge--success': isGreen, 'fr-badge--info': isBlue}">{{ serieObj.evol_percentage}}</p>
          </div>
          <div class="fr-col-9 fr-col-lg">
              <line-chart                
                :x=JSON.stringify(serieObj.serie_values.x)
                :y=JSON.stringify(serieObj.serie_values.y)
                :name=JSON.stringify(serieObj.legend)                
                >
              </line-chart>
          </div>
        </div>
      </div>
    </div>
    <br><br>
    <section class="fr-accordion">
      <h3 class="fr-accordion__title">
        <button class="fr-accordion__btn fr-text-action-high--blue-france fr-px-4w" aria-expanded="false"
          :aria-controls="'accordion' + widgetId">En savoir plus sur l'indicateur</button>
      </h3>
      <div class="fr-collapse fr-px-4w" :id="'accordion' + widgetId">
        <p class="fr-text--sm fr-mb-0">{{ serieObj.description }}</p>
      </div>
    </section>
  </div>  
</template>

<script>
// import '../../dsfr-chart/Charts/dsfr-chart.umd.js'
import LineChart from './components_dsfr/LineChart.vue'

export default {
  name: 'LineSeriesChart',
  components: {
    LineChart
  },
  data () {
    return {
      // percentage box
      widgetId: '',
      isDown: false,
      isGreen: true,
      isRed: false,
      isBlue: false,
    }
  },
  props:{
    serieObj: Object
  },
  methods: {
    setEvolStyle () {
      this.isGreen = true
      this.isDown = false
      this.isRed = false
      if ( this.serieObj.type_evol === 'baisse') {
        this.isDown = true
        this.isRed = true
        this.isGreen = false
      }
    },
    setWidgetId () {
      this.widgetId = this.serieObj.serie_name
    }
  },
  mounted () {
    this.setEvolStyle()
    this.setWidgetId()
  },
  watch: {
    serieObj: function () {
      this.setEvolStyle()
      this.setWidgetId()
    }
  }, 
}
</script>
<style scoped lang="scss">
.fr-badge.fr-badge--success::before, .fr-badge.fr-badge--error::before {
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' data-v-07a0cb32='' width='16' height='16' viewBox='0 0 24 24' class='trend_ico'%3E%3Cpath data-v-07a0cb32='' d='M19.071 4.929c3.903 3.903 3.903 10.239 0 14.142-3.903 3.903-10.239 3.903-14.142 0-3.903-3.903-3.903-10.239 0-14.142 3.903-3.903 10.239-3.903 14.142 0zm-2.828 2.828H7.757l3.182 3.182-4.242 4.243 2.121 2.121 4.243-4.242 3.182 3.182V7.757z' transform='translate(-902 -5664) translate(902 5664)'%3E%3C/path%3E%3C!----%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' data-v-07a0cb32='' width='16' height='16' viewBox='0 0 24 24' class='trend_ico'%3E%3Cpath data-v-07a0cb32='' d='M19.071 4.929c3.903 3.903 3.903 10.239 0 14.142-3.903 3.903-10.239 3.903-14.142 0-3.903-3.903-3.903-10.239 0-14.142 3.903-3.903 10.239-3.903 14.142 0zm-2.828 2.828H7.757l3.182 3.182-4.242 4.243 2.121 2.121 4.243-4.242 3.182 3.182V7.757z' transform='translate(-902 -5664) translate(902 5664)'%3E%3C/path%3E%3C!----%3E%3C/svg%3E");
}
.fr-badge.fr-badge--down::before {
  transform: rotate(90deg)
}
.fr-badge.fr-badge--info::before {
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' data-v-07a0cb32='' width='16' height='16' viewBox='0 0 24 24' class='trend_ico'%3E%3Cpath data-v-07a0cb32='' d='M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm4 11H8v2h8v-2zm0-4H8v2h8V9z' transform='translate(-902 -5664) translate(902 5664)'%3E%3C/path%3E%3C/svg%3E");
  mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' data-v-07a0cb32='' width='16' height='16' viewBox='0 0 24 24' class='trend_ico'%3E%3Cpath data-v-07a0cb32='' d='M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm4 11H8v2h8v-2zm0-4H8v2h8V9z' transform='translate(-902 -5664) translate(902 5664)'%3E%3C/path%3E%3C/svg%3E");
}
</style>
