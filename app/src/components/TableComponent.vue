<template>
    <div class="fr-table fr-table--layout-fixed fr-tab-data fr-ml-1w fr-mr-1w fr-mt-1w fr-mb-2w">
        <table class="">          
            <caption class="sr-only">{{ captionTitle }}</caption> <!-- Ajout de la classe sr-only -->
            <thead>
                <tr>
                    <th scope="col">Année</th>
                    <th scope="col">Valeur</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(index) in annee.length" :key="index">
                    <td>{{ annee[index-1] }}</td>
                    <td>{{ valeur[index-1] }}</td>
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

.fr-tab-data tbody tr:hover {
    box-shadow: 0 16px 16px rgba(18, 14, 153, 0.6); /* Augmentez l'intensité de l'ombre */
}

/* Ajout de la classe sr-only */
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
