<template>
    <div class="fr-table fr-table--layout-fixed fr-tab-data fr-ml-1w fr-mr-1w fr-mt-1w fr-mb-2w">
        <table class="">          
            <caption class="sr-only">{{ captionTitle }} </caption> <!-- Ajout de la classe sr-only -->
            <thead>
                <tr>
                    <th scope="col">Année</th>
                    <th scope="col">Valeur</th>
                    <th v-if="type_mesure.length > 0" scope="col">Type de mesure</th> 
                </tr>
            </thead>
            <tbody>
                <tr v-for="(index) in annee.length" :key="index">
                    <td>{{ annee[index-1] }}</td>
                    <td>{{ valeur[index-1] }}</td>
                    <td v-if="type_mesure.length > 0">{{ type_mesure[index-1] }}</td> 
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
export default {
    name: 'TableComponent',
    props: {
        captionTitle: {
            type: String,
            required: true,
            default: ''
        },
        annee: {
            type: Array,
            required: true,
            default: () => ['2017']
        },
        valeur: {
            type: Array,
            required: true,
            default: () => ['Non défini']
        },
        type_mesure: {
            type: Array,
            default: () => []
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
    overflow-x: auto;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
}

.fr-tab-data tbody tr:hover {
    background-color: #e3e3fd;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
