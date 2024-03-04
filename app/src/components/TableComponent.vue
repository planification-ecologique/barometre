<template>
    <div class="fr-table fr-table--layout-fixed fr-tab-data fr-ml-1w fr-mr-3w">
        <table class="">            
            <thead>
                <tr>
                    <th scope="col">Année</th>
                    <th scope="col">Valeur</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(index) in annee.length" :key="index">
                    <td>{{ annee[index] }}</td>
                    <td>{{ valeur[index] }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
export default {
    name: 'TableComponent',
    components: {
    },
    props: {
        annee: {
            type: [],
            required: true,
            default: ['2017']
        },
        valeur: {
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
</style>
