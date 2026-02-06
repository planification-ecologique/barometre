<template>
    <div class="fr-table fr-table--layout-fixed fr-tab-data fr-ml-1w fr-mr-1w fr-mt-1w fr-mb-2w">
        <table class="">  
            <!-- <caption >{{ dataObj.label_indic }} </caption>            -->
            <thead>
                <tr>
                    <th scope="col">Année</th>
                    <th
                      class="valueCol"
                      v-for="(col, index) in sortedColumns"
                      :key="index"
                      :aria-describedby="'tooltip-' + index"
                      scope="col"
                    >
                      {{ col.label }}
                      <span
                        class="fr-tooltip fr-placement"
                        :id="'tooltip-' + index"
                        role="tooltip"
                        aria-hidden="true"
                      >
                        {{ col.label }}
                      </span>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(index) in annee.length" :key="index">
                    <td>{{ annee[index-1] }}</td>
                    <td
                      v-for="(col, indexValue) in sortedColumns"
                      :key="indexValue"
                    >
                      {{ col.values[index-1] }}
                    </td>
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
    },
    computed: {
        /**
         * Colonnes triées alphabétiquement de gauche à droite
         * en gardant l'alignement des valeurs par colonne.
         */
        sortedColumns () {
            // Sécurise les cas où les props ne sont pas encore correctement peuplées
            if (!Array.isArray(this.valeurCol) || !Array.isArray(this.valeurValue)) {
                return []
            }
            const pairs = this.valeurCol.map((label, idx) => ({
                label: label,
                values: Array.isArray(this.valeurValue[idx]) ? this.valeurValue[idx] : []
            }))
            return pairs.sort((a, b) => {
                const la = (a.label || '').toString()
                const lb = (b.label || '').toString()
                return la.localeCompare(lb, 'fr', { sensitivity: 'base' })
            })
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
