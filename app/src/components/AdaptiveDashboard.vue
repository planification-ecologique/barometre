<template>
    <div v-if="hasData">
        <div v-for="(row, index) in grid" :key="index" class="fr-grid-row fr-grid-row fr-grid-row--gutters fr-mb-1w">
            <div v-for="(item, columnIndex) in row" :key="columnIndex" class="fr-col">

               <graph-box :dataObj="item" :idAccordion="'accordion-'+ index+columnIndex" :color="colors" :displayChart="displayChart" :name=axesNames></graph-box>
            </div>
        </div>
    </div>
    <div v-else>
        <p>Pas de données en cours...</p>
    </div>
</template>
    
<script>

import GraphBox from '../components/GraphBox.vue'


export default {
    name: 'AdaptiveDashboard',
    components: {
        GraphBox
    },
    data() {
        return {
            widgetId: '',
            colors:  ['beige-gris-galet','brown-caramel','green-bourgeon','green-menthe'],
            displayChart: true,
            axesNames: ['Historique', 'Année en cours', 'Projection', 'Cible'],
        }
    },
    computed: {

        hasData() {
            return this.inputData && this.inputData.length > 0;
        },

        grid() {
            const numRows = Math.ceil(this.inputData.length / 2);
            const numCols = 2;

            const grid = Array.from({ length: numRows }, () => Array(numCols).fill(null));

            // create the grid with the data using a nested loop
            this.inputData.forEach((item, index) => {
                const row = Math.floor(index / numCols); // integer division
                const col = index % numCols; // remainder of division
                grid[row][col] = item
            });
            const lastRow = grid[numRows - 1];
            const lastRowNumCols = lastRow.filter(item => item !== null).length;

            // Adjust the number of columns for the last row
            if (lastRowNumCols === 1) {
                grid[numRows - 1] = lastRow.slice(0, -1); // Remove the last element
            }

            return grid;

        }
    },
    props: {
        inputData: {
            type: Array,
            required: true
        }
    }
}
</script>

