<template>
<!-- <fieldset class="fr-segmented fr-segmented--no-legend">
    <legend class="fr-segmented__legend">
        Légende
    </legend>
    <div class="fr-segmented__elements">
        <div class="fr-segmented__element">
            <input value="Graphique" type="button" id="segmented-2230-1" name="segmented-2230">
            <label class="fr-label" for="segmented-2230-1">
                Libellé
            </label>
        </div>
        <div class="fr-segmented__element">
            <input value="Table" checked type="button" id="segmented-2230-2" name="segmented-2230">
            <label class="fr-label" for="segmented-2230-2">
                Libellé
            </label>
        </div>
     
    </div>
</fieldset> -->
<fieldset class="fr-segmented fr-segmented--sm">
 
    <div class="fr-segmented__elements">
        <div class="fr-segmented__element">
            <input value="Graphique" type="button" id="segmented-2218-1" name="segmented-2218">
      
        </div>
        <div class="fr-segmented__element">
            <input value="Table" checked type="button" id="segmented-2218-2" name="segmented-2218">
          
        </div>
    
    </div>
</fieldset>
</template>
<script>
export default {
    data() {
        
    },
}
</script>
<style>
.fr-segmented__element {
    display: inline-block;
}
</style>