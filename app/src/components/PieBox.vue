<template>
  <div class="fr-card fr-card--no-icon fr-card--shadow">
    <div class="fr-px-4w fr-pt-3w">
      <h3 class="fr-h6 fr-mb-0">{{ serieObj.title }}</h3>
      <br>
      <pie-chart
        :x=JSON.stringify(serieObj.serie_values.x)
        :y=JSON.stringify(serieObj.serie_values.y)
        :name=JSON.stringify(serieObj.serie_values.legend_names)
        :date=serieObj.update_date :fill=true> </pie-chart>
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
  import PieChart from './components_dsfr/PieChart.vue'
  export default {
    components: {
    PieChart
    },
    name: 'PieBox',
    data () {
      return {
        widgetId: '',
      }
    },
    props:{
    serieObj: Object
    },
    methods: {
      setWidgetId () {
      this.widgetId = this.serieObj.serie_name
      }
    },
    mounted () {
    this.setWidgetId()
    },
    watch: {
      serieObj: function () {
        this.setWidgetId()
      }
    }
  }
</script>