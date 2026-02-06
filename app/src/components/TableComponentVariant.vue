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
                <tr v-for="(row, index) in filteredRows" :key="index">
                    <td>{{ row.year }}</td>
                    <td
                      v-for="(value, indexValue) in row.values"
                      :key="indexValue"
                    >
                      {{ value }}
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
        },
        /**
         * Lignes filtrées : on enlève les années pour lesquelles
         * toutes les colonnes sont vides / null / NaN.
         */
        filteredRows () {
            if (!Array.isArray(this.annee) || this.annee.length === 0) {
                return []
            }
            const cols = this.sortedColumns
            const rowCount = this.annee.length
            const rows = []

            for (let i = 0; i < rowCount; i++) {
                const year = this.annee[i]
                const rowValues = cols.map(col => (Array.isArray(col.values) ? col.values[i] : undefined))

                // Teste si au moins une valeur est réellement renseignée
                const hasAnyValue = rowValues.some(v => {
                    if (v === null || v === undefined) return false
                    if (typeof v === 'number') return !isNaN(v)
                    const s = String(v).trim()
                    if (s === '' || s.toLowerCase() === 'null' || s.toLowerCase() === 'nan') return false
                    return true
                })

                if (hasAnyValue) {
                    rows.push({
                        year,
                        values: rowValues
                    })
                }
            }
            return rows
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
