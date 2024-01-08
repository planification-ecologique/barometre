<template>
  <div class="widget_container fr-grid-row" :id="widgetId" @wheel = "handleMouseWheel" @mousedown="startMapDrag" @mouseup="endMapDrag" @mousemove="dragMap">
    <!-- <div class="fr-grid-row"> -->
    <div class="fr-col-12 fr-col-sm-3">
              <p class="fr-text--xs fr-text-mention--grey fr-mb-3v">Localisation</p>
              <p class="fr-text--sm fr-text--bold fr-mb-3v"> {{ pays }} </p>
              <p class="fr-text--xs fr-text-mention--grey fr-mb-3v">Mise à jour : 20/11/2023</p>
              <p class="fr-text--sm fr-text--bold fr-mb-3v"> Nombre de visites </p>
              <p class="fr-text--sm fr-text--bold fr-mb-3v"> {{ visits }} </p>
    </div>
  <!-- </div> -->
    <div class="fr-col-12 fr-col-lg">
    <WorldMap :props="{
     viewBox: this.mapDragOffsetX +' '+ this.mapDragOffsetY +' '+ (1900 * zoomScale) + ' ' + (1000 * zoomScale),
     fill: '#aeaef9'
   }" :onenter="showCountryTooltip" :onleave="hideCountryTooltip"></WorldMap>
   </div>
  <div class="tooltip" ref="tooltip"></div>
</div>
</template>

<script>
import WorldMap from '@/components/maps/World'
export default {
  name: 'MapWorldChart',
  components: {
    WorldMap
  },
  data () {
    return {
      WorldProps: {
        viewBox: '0 0 1900 1000',
        fill: '#aeaef9'
      },
      selected: null,
      zoomScale: 1,
      mapDragging: false, // Indicateur de glissement de carte
      mapDragStartX: 0, // Position de départ X du glissement
      mapDragStartY: 0, // Position de départ Y du glissement
      mapDragOffsetX: 0, // Offset X du glissement
      mapDragOffsetY: 0,
      pays: '',
      visits: '',
    }
  },
  props: {
    dataCountry: {
      type: Object,
      required: true
    }
  },
  methods: {
    showCountryTooltip (event) {
      // console.log(JSON.stringify(this.dataCountry))
      const countryName = event.target.getAttribute('name')
      const countryId = event.target.getAttribute('id')
      this.pays = countryName
      this.visits = this.dataCountry[countryId]
      // console.log('countryName ' + countryName)
      // console.log('countryId ' + countryId)
      // console.log('countryId ' + this.visits)
      const path = document.getElementById(countryId)
      path.setAttribute('fill', '#9898f8')
      const tooltip = this.$refs.tooltip
      tooltip.textContent = countryName
      tooltip.style.display = 'block'
      tooltip.style.left = event.pageX + 'px'
      tooltip.style.top = event.pageY + 'px'
    },
    hideCountryTooltip () {
      const countryId = event.target.getAttribute('id')
      const path = document.getElementById(countryId)
      path.setAttribute('fill', '#aeaef9')
      const tooltip = this.$refs.tooltip
      tooltip.style.display = 'none'
    },
    handleMouseWheel (event) {
      event.preventDefault()
      const delta = event.deltaY

      if (delta > 0) {
        // Défilement vers le bas (dézoom)
        this.zoomOut()
      } else {
        // Défilement vers le haut (zoom)
        this.zoomIn()
      }
    },
    zoomIn () {
      this.zoomScale /= 1.02
    },
    zoomOut () {
      this.zoomScale *= 1.02
    },

    // Fonction pour commencer le glissement de la carte
    startMapDrag (event) {
      this.mapDragging = true
      this.mapDragStartX = event.clientX
      this.mapDragStartY = event.clientY
    },

    // Fonction pour mettre à jour la position de la carte en fonction du glissement
    dragMap (event) {
      if (this.mapDragging) {
        const offsetX = event.clientX - this.mapDragStartX
        const offsetY = event.clientY - this.mapDragStartY
        const minX = -1500 // Limite minimale en X
        const minY = -1500 // Limite minimale en Y
        const maxX = 1500 // Limite maximale en X
        const maxY = 1500 // Limite maximale en Y
        this.mapDragOffsetX = Math.min(Math.max(this.mapDragOffsetX / 2 - offsetX / 2, minX), maxX / 2)
        this.mapDragOffsetY = Math.min(Math.max(this.mapDragOffsetY / 2 - offsetY / 2, minY), maxY / 2)
        // console.log(this.mapDragOffsetX)
        // console.log(this.mapDragOffsetY)
      }
    },
    // Fonction pour arrêter le glissement de la carte
    endMapDrag () {
      this.mapDragging = false
    },
  },
  created () {
    this.chartId = 'myChart' + Math.floor(Math.random() * (1000))
    this.widgetId = 'widget' + Math.floor(Math.random() * (1000))
  }
}
</script>
<style>
.tooltip {
 display: none;
 position: absolute;
 background-color: white;
 border: 1px solid #ccc;
 padding: 5px;
 z-index: 999;
}
</style>
