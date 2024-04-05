<template>
  <fieldset class="fr-segmented fr-segmented--no-legend fr-segmented--sm">
    <div class="fr-segmented__elements">
      <div class="fr-segmented__element">
        <input
          value="1"
          type="radio"
          :id="idcontrol + '-1'"
          :name="idcontrol + 'segmented-2230'"
          @click="emitChartSelected('graphique')"
          checked
        />
        <label class="fr-label" :for="idcontrol + '-1'" title="Graphique">
          Graphique
        </label>
      </div>
      <div class="fr-segmented__element">
        <input
          value="2"
          type="radio"
          :id="idcontrol + '-2'"
          :name="idcontrol + 'segmented-2230'"
          @click="emitChartSelected('table')"
        />
        <label class="fr-label" :for="idcontrol + '-2'" title="Table">
          Table
        </label>
      </div>
    </div>
  </fieldset>
</template>

<script>
export default {
  data() {
    return {
      defaultChart: "graphique", // Set the default chart type here
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
      this.$emit("chart-selected", type);
    },
  },
};
</script>
