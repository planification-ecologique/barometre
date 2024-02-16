<template>
  <fieldset class="fr-segmented fr-segmented--sm">
    <div class="fr-segmented__elements">
      <div class="fr-segmented__element">
        <input value="Graphique" type="button" id="segmented-2218-1" name="segmented-2218" @click="emitChartSelected('graphique')">
      </div>
      <div class="fr-segmented__element">
        <input value="Table" type="button" id="segmented-2218-2" name="segmented-2219" @click="emitChartSelected('table')">
      </div>
    </div>
  </fieldset>
</template>

<script>
export default {
  methods: {
    emitChartSelected(type) {
      this.$emit('chart-selected', type);
    }
  }
}
</script>

<style>
.fr-segmented__element {
    display: inline-block;
}
.fr-segmented {
    border: none;
}
.fr-segmented__element input[type="button"] {
    border: 1px solid #0074d9; 
    border-radius: 4px;
    padding: 8px 12px;
    background-color: transparent; 
    cursor: pointer; 
   
}
</style>