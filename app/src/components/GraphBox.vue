<template>
    <div class="fr-card fr-card--no-icon fr-card--shadow adjust-height" v-if="dataObj">
        <div class="titleBox">
            <h2 class="cardTitle">{{ dataObj.label_indic }}
            </h2>
            <div class="fr-text--xs fr-text--bold cardObjectif" v-if="cible">
                <p class="fr-text--xs fr-text--regular fr-unit"> Cible :</p>
                <p class="fr-badge fr-badge-sm fr-badge--green-emeraude fr-badge--no-icon fr-pr-1w"> {{ cible}} </p>
                <p class="fr-text--xs fr-text--regular fr-unit">{{ dataObj.label_unit }}</p>
            </div>
            <div v-else>
              <p class="fr-text--xs fr-text--regular fr-unit">Unité : {{ dataObj.label_unit }}</p>
            </div>
        </div>
        
        <div class="cardReference">
            <segmented-controls @chart-selected="handleChartSelected" :idcontrol="idAccordion+'1'"></segmented-controls>
        </div>
        <div v-if="dataObj.values"> 
          <div class="cardData" v-if="this.displayChart">
            <div v-if="dataObj.label_sous_groupe == ''">
            <bar-chart
                  :x=JSON.stringify(dataObj.values.x)
                  :y=JSON.stringify(dataObj.values.y)
                  :name=JSON.stringify(dataObj.values.legend)
                  :horizontal=false
                  :stacked=true
                  :color= JSON.stringify(dataObj.values.colors) 
                  :aspectratio = 2
                  >
              </bar-chart>
            </div>
            <div v-else>
              <bar-chart
                  :x=JSON.stringify(dataObj.date)
                  :y=JSON.stringify(dataObj.values)
                  :aspectratio = 2
                  :stacked=true
                  :name=JSON.stringify(dataObj.label_sous_groupe)
                  >
              </bar-chart>
            </div>
          </div>
          <div v-else>  
            <div v-if="dataObj.label_sous_groupe == ''">
              <table-component  :annee="dataObj.values.x[0]" :valeur="dataObj.values.ytab"></table-component>        
            </div>
            <div v-else>
              <TableComponentVariant :annee="dataObj.date[0]" :valeurCol="dataObj.label_sous_groupe" :valeurValue="dataObj.values"></TableComponentVariant>
            </div>
          </div>
        </div>
        <div class="beneathGraph">
          <p class="fr-text--xs fr-text-mention--grey textReference">Source : {{ dataObj.label_sources }}</p>
          <p class="fr-text--xs fr-text-mention--grey textReference">Périmètre : {{ dataObj.label_perimetre}}</p>
        </div>
        <section class="fr-accordion">
          <h3 class="fr-accordion__title">
            <button class="fr-accordion__btn fr-text--xs " :aria-expanded="isAccordionOpen ? 'true' : 'false'" :aria-controls="idAccordion">Description de l'indicateur</button>
          </h3>
          <div class="fr-collapse accordion-box" :id="idAccordion" :class="{ 'fr-collapse--expanded': isAccordionOpen }">
            <p class="fr-text--s cardDescription fr-ml-1w fr-mr-1w fontSizeDescription">{{ dataObj.label_description }}</p>
            <div class="fr-ml-1w" v-if="dataObj.label_tags">
              <tags-card :tagsIndicateurs="dataObj.label_tags"></tags-card>
            </div>
          </div>
        </section>
    </div>

</template>

<script>
import BarChart from './components_dsfr/BarChart.vue'
import MultiLineChart from './components_dsfr/MultiLineChart.vue'
import SegmentedControls from './SegmentedControls.vue'
import tagsCard from './TagsCard.vue'
import TableComponent from './TableComponent.vue'
import TableComponentVariant from './TableComponentVariant.vue'

export default {
  name: 'GraphBox',
  components: {
      BarChart,
      SegmentedControls,
      tagsCard,
      TableComponent,
      TableComponentVariant,
      MultiLineChart
  },
  props: {
      dataObj:{
          type: Object,
          required: true
      },
      idAccordion: {
        type: String,
        required: true
      }
  },
  data() {
      return {
          displayChart: false,
          isAccordionOpen: true,
          cible: undefined
      }
  },
  methods: {
      handleChartSelected(type) {
        this.displayChart = (type === 'graphique') ? true : false;
    }
  },
  mounted () {
    // console.log(this.dataObj)

    try {
      if (this.dataObj.label_sous_groupe == undefined || this.dataObj.label_sous_groupe =="") {
        let index = this.dataObj.values.legend.indexOf("Cible");
        index != -1 ? this.cible = this.dataObj.values.y[index][this.dataObj.values.y[index].length - 1] : this.cible = undefined
      } else {
          this.cible = undefined

        // let sum = 0
        // this.dataObj.values[this.dataObj.values.length - 1].forEach( value => {
        // sum += value
        // })
        // this.cible = sum
      }
    } catch (error) {
      console.log("Erreur dans la cible",error)
    }
    
        
  }
}
</script>

<style scoped>
.fontSizeDescription{
  font-size: 12px;
}
.fr-unit {
  margin-bottom: 0rem !important;
}
.accordion-box {
  padding-bottom: 1rem !important;
}
.adjust-height {
  height: auto !important;
  z-index: inherit;
}   
.beneathGraph {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #DDDDDD;
  border-top: 1px solid #DDDDDD;
  display: block;
  justify-content: space-between;
}
.cardReference {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #DDDDDD;
  border-top: 1px solid #DDDDDD;
  display: flex;
  justify-content: space-between;
}
.titleBox {
  padding: 0.5rem 1rem;
  margin-top: 0.5rem;
}
.cardTitle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bolder;
  margin-bottom: 0.5rem;
}
.cardData {
  padding-top: 1.5rem;
  padding-left: 0.75rem;
  padding-right: 1.5rem;
  max-width: 100%;
}
.cardFooter {
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
}
.cardFooter > .cardFooter-button {
  display: flex;
  justify-content: flex-end;
  column-gap: 0.5rem;
}
.cardFooter > .cardFooter-tags {
  display: flex;
  justify-content: flex-start;
  column-gap: 1em;
}
p.cardDescription {
  font-size: 1rem;
  line-height: 1.25rem;
  font-weight: 400;
  text-align: justify;
  text-justify: inter-word;
  margin-bottom: 1rem;
 color: black;
}

.unit-short {
  margin-bottom: 0rem !important;
}
.cardObjectif {
  display: flex;
  justify-content: flex-start;
  font-size: 0.75rem;
  align-items: center;
  column-gap: 0.5rem;
  margin-bottom: 0rem;
}
p.textReference {
  margin-bottom: 0rem;
  font-weight: 400;
}
</style>