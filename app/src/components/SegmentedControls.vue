<template>
  <!-- <fieldset class="fr-segmented fr-segmented--sm">
    <div class="fr-segmented__elements">
      <div class="fr-segmented__element">
        <input value="Graphique" type="button" id="segmented-2218-1" name="segmented-2218" @click="emitChartSelected('graphique')">
      </div>
      <div class="fr-segmented__element">
        <input value="Table" type="button" id="segmented-2218-2" name="segmented-2219" @click="emitChartSelected('table')">
      </div>
    </div>
  </fieldset> -->

  <fieldset class="fr-segmented fr-segmented--no-legend">
    <!-- <legend class="fr-segmented__legend">Légende</legend> -->
    <div class="fr-segmented__elements">
      <div class="fr-segmented__element">
        <input
          value="1"
          type="button"
          id="segmented-2230-1"
          name="segmented-2230"
          @click="emitChartSelected('graphique')"
          :checked="defaultChart === 'graphique'"
          
        />
        <label class="fr-label" for="segmented-2230-1"> Graphique </label>
      </div>
      <div class="fr-segmented__element">
        <input
          value="2"
          checked
          type="button"
          id="segmented-2230-2"
          name="segmented-2230"
          @click="emitChartSelected('table')"
        />
        <label class="fr-label" for="segmented-2230-2"> Table </label>
      </div>
  
    </div>
  </fieldset>
</template>

<script>
export default {
  data() {
    return {
      defaultChart: 'graphique' // Set the default chart type here
    };
  },
  mounted() {
    // Emit the default chart type when the component is mounted
    this.emitChartSelected(this.defaultChart);
  },
  methods: {
    emitChartSelected(type) {
      this.$emit("chart-selected", type);
    },
  },
};
</script>

<style>
/* .fr-segmented__element {
    display: inline-block;
}
.fr-segmented {
    border: none;
}
*/
.fr-segmented__element input[type="button"] {
    border: 1px solid #000091; 
    border-radius: 4px;
    padding: 8px 12px;
    background-color: transparent; 
    cursor: pointer; 
   
} 

</style>
