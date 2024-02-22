<template>
  <fieldset class="fr-segmented fr-segmented--no-legend fr-segmented--sm">
    <!-- <legend class="fr-segmented__legend">Légende</legend> -->
    <div class="fr-segmented__elements">
      <div class="fr-segmented__element">
        <input
          value="1"
          type="radio"
          :id="idcontrol+'-1'"
          name="segmented-2230"
          @click="emitChartSelected('graphique')"          
        />
        <label class="fr-label" :for="idcontrol+'-1'"> Graphique </label>
      </div>
      <div class="fr-segmented__element">
        <input
          value="2"
          type="radio"
          :id="idcontrol+'-2'"
          name="segmented-2230"
          @click="emitChartSelected('table')"
        />
        <label class="fr-label" :for="idcontrol+'-2'"> Table </label>
      </div>
  
    </div>
  </fieldset>
</template>

<script>
export default {
  data() {
    return {
      defaultChart: 'graphique', // Set the default chart type here
      // valueGraph: true,
      // valueTable: false,
    };
  },
  props: {
    idcontrol: {
      type: String,
      required: true,
    },
  },
  mounted() {
    // Emit the default chart type when the component is mounted
    this.emitChartSelected(this.defaultChart);
  },
  methods: {
    emitChartSelected(type) {
      
      // if (type === 'graphique') {
      //   this.valueGraph = true;
      //   this.valueTable = false;
      // } else {
      //   this.valueGraph = false;
      //   this.valueTable = true;
      // }

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
