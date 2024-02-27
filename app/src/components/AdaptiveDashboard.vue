<template>
    <div>
        <div class="fr-grid-row" v-if="dashboardPage">
            <div class="fr-col-12">
                <h1 class="fr-title">{{ this.params.label_theme }}</h1>
                <h4 class="fr-subtitle">{{ this.params.label_levier }}</h4>
            </div>
        </div>
        <div v-if="gridFormat.length > 0">
            <div v-for="(row, index) in gridFormat" :key="index" class="fr-grid-row fr-grid-row fr-grid-row--gutters fr-mb-1w">
                <div v-for="(item, columnIndex) in row" :key="columnIndex" class="fr-col">
                    <div v-if="!item">
                        Pas d'items
                    </div>
                    <div v-else>
                        <graph-box :dataObj="item" :idAccordion="'accordion-'+ index+columnIndex"></graph-box>
                    </div>
                </div>
            </div>
        </div>
        <div v-else>
            <p>Pas de données en cours...</p>
        </div>        
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
            gridFormat: []
        }
    },
    props: {
        inputData: {
            type: Array,
            required: true
        },
        params: {
            type: Object,
        },
        dashboardPage: {
            type: Boolean,
            default: true
        }
    },
    methods: {
        grid(ls_indicateurs) {
            const numRows = Math.ceil(ls_indicateurs.length / 2);
            const numCols = 2;

            const grid = Array.from({ length: numRows }, () => Array(numCols).fill(null));

            // create the grid with the data using a nested loop
            ls_indicateurs.forEach((item, index) => {
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
    watch: {
        inputData: {
            handler(API_data) {
                this.gridFormat = this.grid(API_data);
            },
            immediate: true // Call the handler immediately
        }
    },
}



</script>

<style scoped lang="scss">
    .fr-title {
    margin-bottom: 0.625rem;
    }
    .fr-subtitle {
    font-weight: 400;
    }
</style>

