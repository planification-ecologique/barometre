<template>
    <div class="fr-table fr-table--layout-fixed fr-tab-data fr-ml-1w fr-mr-1w fr-mt-1w fr-mb-2w">
        <table class="">            
            <thead>
                <tr>
                    <th scope="col">Année</th>
                    <th class="valueCol"  :aria-describedby="'tooltip-'+index" v-for="(index) in valeurCol.length" :key="index" scope="col">{{ valeurCol[index-1] }}
                    <span class="fr-tooltip fr-placement" :id="'tooltip-'+index" role="tooltip" aria-hidden="true">{{ valeurCol[index-1] }}</span>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(index) in annee.length" :key="index">
                    <td>{{ annee[index-1] }}</td>
                    <td v-for="(indexValue) in valeurCol.length" :key="indexValue">{{ valeurValue[indexValue-1][index-1] }}
                    </td>
                    <!-- <td>{{ valeur[index-1] }}</td> -->
                    
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
export default {
    name: 'TableComponentVariant',
    components: {
    },
    props: {
        annee: {
            type: [],
            required: true,
            default: ['2017']
        },
        valeurCol: {
            type: [],
            required: true,
            default: ['Valeur']
        },
        valeurValue: {
            type: [],
            required: true,
            default: ['Non défini']
        }
    }
}
</script>

<style scoped>
.fr-tab-data {
    padding-top: 0rem !important;
    margin-bottom: 0rem !important;
    height: fit-content !important;
    max-height: 40vh;
    overflow-y: scroll;
}

.valueCol {
    white-space: normal !important;
    /* overflow-x: auto !important; */
}
.fr-tab-data tbody tr:hover {
    box-shadow: 0 16px 16px rgba(18, 14, 153, 0.6); /* Augmentez l'intensité de l'ombre */
}
</style>
