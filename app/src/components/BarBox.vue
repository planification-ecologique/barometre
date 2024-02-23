<template>
<div class="fr-card fr-card--no-icon fr-card--shadow adjust-height">
    <div class="titleBox">
        <h6 class="cardTitle">{{ serieObj.title }}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.3333 9.99951H22.6666V13.9995H21.3333V11.3328H18.6666V9.99951H21.3333ZM10.6666 9.99951H13.3333V11.3328H10.6666V13.9995H9.33325V9.99951H10.6666ZM21.3333 20.6662V17.9995H22.6666V21.9995H18.6666V20.6662H21.3333ZM10.6666 20.6662H13.3333V21.9995H9.33325V17.9995H10.6666V20.6662Z" fill="#00008F"/>
                <rect x="0.5" y="0.499512" width="31" height="31" stroke="#DDDDDD"/>
            </svg>

        </h6>
        <p class="fr-text--xs cardDescription">{{ serieObj.description }}</p>
    </div>
    <div class="cardReference">

        <p class="fr-text--xs fr-text-mention--grey textReference">Mis à jour : {{ serieObj.update_date }}</p>
        <p class="fr-badge fr-badge--green-emeraude fr-badge--sm" v-if="serieObj.trendValue > 0">↗ {{ serieObj.trendValue }}%</p>
        <p class="fr-badge fr-badge--brown-caramel fr-badge--sm" v-else>↘ {{ serieObj.trendValue }}%</p>

    </div>
    <div class="part_container">
        <bar-chart
        :x=JSON.stringify(serieObj.serie_values.x)
        :y=JSON.stringify(serieObj.serie_values.y)
        :xparse=JSON.stringify(serieObj.serie_values.xparse)
        :name=JSON.stringify(serieObj.serie_values.name)
        :horizontal=serieObj.horizontal
        :stacked=serieObj.stacked
        :color= JSON.stringify(color) 
        >
        </bar-chart>
    </div>
    <div class="cardReference">
        <p class="fr-text--xs fr-text-mention--grey textReference">Source : {{ serieObj.source }}</p>
    </div>
    <div class="cardLegend">
        <div class="inline" v-for="index in serieObj.serie_values.y.length" :key="index">
            <div class="legend-box" :style="{ 'background-color': colors[index-1]}"> </div>
            <p class="fr-text--xs fr-text-mention--black textLegend"> 
                {{ serieObj.serie_values.name[index-1] }}
            </p>
        </div>
    </div>
    <!-- <div class="cardFooter">
            <svg width="34" height="32" viewBox="0 0 34 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 6.99951H10V8.99951H8V6.99951ZM12 6.99951H14V8.99951H12V6.99951ZM16 6.99951H18V8.99951H16V6.99951ZM20 6.99951H22V8.99951H20V6.99951ZM24 6.99951H26V8.99951H24V6.99951ZM24 10.9995H26V12.9995H24V10.9995ZM8 22.9995H10V24.9995H8V22.9995ZM8 18.9995H10V20.9995H8V18.9995ZM8 14.9995H10V16.9995H8V14.9995ZM8 10.9995H10V12.9995H8V10.9995ZM15.6667 14.9995L16.7031 13.4448C16.8886 13.1666 17.2008 12.9995 17.5352 12.9995H20.4648C20.7992 12.9995 21.1114 13.1666 21.2969 13.4448L22.3333 14.9995H25C25.5523 14.9995 26 15.4472 26 15.9995V23.9995C26 24.5518 25.5523 24.9995 25 24.9995H13C12.4477 24.9995 12 24.5518 12 23.9995V15.9995C12 15.4472 12.4477 14.9995 13 14.9995H15.6667ZM19 21.9995C20.1046 21.9995 21 21.1041 21 19.9995C21 18.8949 20.1046 17.9995 19 17.9995C17.8954 17.9995 17 18.8949 17 19.9995C17 21.1041 17.8954 21.9995 19 21.9995Z" fill="#00008F"/>
                <rect x="0.5" y="0.999512" width="33" height="30" stroke="#DDDDDD"/>
            </svg>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M10 20.6662H22V21.9995H10V20.6662ZM16.6667 16.7808L20.714 12.7328L21.6567 13.6755L16 19.3328L10.3433 13.6762L11.286 12.7328L15.3333 16.7795V9.33282H16.6667V16.7808Z" fill="#000091"/>
                <rect x="0.5" y="0.499512" width="31" height="31" stroke="#DDDDDD"/>
            </svg>
    </div> -->
</div>
</template>

<script>

import BarChart from './components_dsfr/BarChart.vue'
import { mixin } from '@/utils.js'

export default {
name: 'BarSeriesChart',
mixins: [mixin],
components: {
    BarChart
},
data () {
    return {
    widgetId: '',
    colors: []
    }
},
props:{
    serieObj:{
        type: Object,
        required: true
    },
    color: {
      type: [],
      default: undefined
    }
},
methods: {
    setWidgetId () {
    this.widgetId = this.serieObj.serie_name
    },
    get_colors () {
        var listColors = []
        if (this.color !== undefined) {
            listColors = this.color
        } else {
            listColors = this.getAllColors()
        }
        var size = this.serieObj.serie_values.y.length
        for (let i = 0; i < size; i++) {
            this.colors.push(this.getHexaFromName(listColors[i]))
        }
    }
},
mounted () {
    this.setWidgetId()
    this.get_colors()
},
watch: {
    serieObj: function () {
    this.setWidgetId()
    }
}, 
}
</script>

<style scoped>

.part_container {
    height: 100%;
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

.cardLegend {
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #DDDDDD;
    display: flex;
    justify-content: flex-start;
    column-gap: 1em;
    margin-bottom: 0rem !important;
}

.cardFooter {
    padding: 0.5rem 1rem;
    display: flex;
    justify-content: flex-end;
    column-gap: 1em;
}

p.cardDescription {
    font-size: 0.8rem;
    font-weight: bold;
    text-align: justify;
    text-justify: inter-word;
    margin-bottom: 1rem;
}

p.textLegend {
    margin: 0rem !important;
    font-size: 0.8rem;
    font-weight: bolder;
}

p.textReference {
    margin-bottom: 0rem;
    font-weight: bold;

}

.inline {
    display: flex;
    align-items: center;
}

.legend-box {
    float: left;
    height: 10px;
    width: 10px;
    margin-right: 5px;
}
</style>
  