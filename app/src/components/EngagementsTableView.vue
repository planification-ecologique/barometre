<template>
  <div>
    <!-- Header -->
    <div class="fr-grid-row">
      <article class="fr-col-12" style="display: flex; align-items: center">
        <div class="sector-logo-container">
          <EnvironnementImg
            height="100px"
            width="100px"
          ></EnvironnementImg>
        </div>
        <div>
          <h1 class="fr-title">Synthèse</h1>
        </div>
      </article>
    </div>
    
    <!-- Table: scroll region so wide tables work on narrow viewports -->
    <div
      class="dashboard-table-scroll"
      role="region"
      aria-label="Tableau des indicateurs d'impact"
      tabindex="0"
    >
    <div class="fr-table fr-table--bordered fr-mt-4w">
      <table>
        <thead>
          <tr>
            <th scope="col">Axe de la taxonomie verte</th>
            <th scope="col">Indicateur</th>
            <th scope="col">Dernière valeur</th>
            <th scope="col">Cible 2030</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in tableData" :key="index">
            <td>{{ row.engagement }}</td>
            <td>
              {{ row.indicateur }}
              <template v-if="row.indicateurUnite">
                <br><br>
                <em>Unité : {{ row.indicateurUnite }}</em>
              </template>
            </td>
            <td>{{ row.derniereValeur }}</td>
            <td>{{ row.cible2030 }}</td>
          </tr>
          <tr v-if="tableData.length === 0">
            <td colspan="4" class="no-data">Chargement des données...</td>
          </tr>
        </tbody>
      </table>
    </div>
    </div>
  </div>
</template>

<script>
import EnvironnementImg from "./components_sgv/EnvironnementImg.vue";

export default {
  name: "EngagementsTableView",
  components: {
    EnvironnementImg,
  },
  props: {
    params: {
      type: Object,
      required: true,
    },
    inputData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      tableData: [],
    };
  },
  watch: {
    inputData: {
      handler(newData) {
        if (newData && newData.length > 0) {
          this.buildTableData(newData);
        }
      },
      immediate: true,
    },
  },
  mounted() {
    if (this.inputData && this.inputData.length > 0) {
      this.buildTableData(this.inputData);
    }
  },
  methods: {
    buildTableData(data) {
      try {
        const rows = [];
        const seenRows = new Set();
        
        // Build table directement depuis les données - utiliser chantier_ou_impact comme nom d'engagement
        data.forEach(indicator => {
          const engagements = Array.isArray(indicator.chantier_ou_impact_list) && indicator.chantier_ou_impact_list.length
            ? indicator.chantier_ou_impact_list
            : [indicator.chantier_ou_impact || '-'];

          engagements.forEach(engagementName => {
            const key = `${engagementName || '-'}:::${indicator.label_indic || '-'}`;
            // Avoid duplicates (from multi-line charts or repeated mappings)
            if (seenRows.has(key)) {
              return;
            }
            seenRows.add(key);

            const indicLabel = indicator.label_indic || '-';
            rows.push({
              engagement: engagementName || '-',
              indicateur: indicLabel,
              indicateurUnite: indicator.unite || '',
              cible2030: this.formatValue(indicator.objectif_valeur_cible, indicator.unite),
              derniereValeur: this.formatLastValue(indicator),
            });
          });
        });

        // Tri des lignes du tableau de synthèse des impacts :
        // 1) par axe (engagement), 2) puis par indicateur, ordre alphabétique.
        rows.sort((a, b) => {
          const e = (a.engagement || '').localeCompare(b.engagement || '', 'fr', { sensitivity: 'base' });
          if (e !== 0) return e;
          return (a.indicateur || '').localeCompare(b.indicateur || '', 'fr', { sensitivity: 'base' });
        });

        this.tableData = rows;
      } catch (error) {
        console.error("Error building table data:", error);
        this.tableData = [];
      }
    },
    formatValue(value, unit) {
      if (value === null || value === undefined || value === '') {
        return '-';
      }
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return value;
      }
      // Format with appropriate decimal places
      const formatted = numValue.toLocaleString('fr-FR', {
        maximumFractionDigits: 2,
      });
      return unit ? `${formatted} ${unit}` : formatted;
    },
    formatLastValue(indicator) {
      // Find the most recent value
      if (indicator.valeur_actuelle !== null && indicator.valeur_actuelle !== undefined && indicator.valeur_actuelle !== '') {
        const year = indicator.date_valeur_actuelle ? new Date(indicator.date_valeur_actuelle).getFullYear() : '';
        const value = this.formatValue(indicator.valeur_actuelle, indicator.unite);
        return year ? `${value} (${year})` : value;
      }
      return '-';
    },
  },
};
</script>

<style scoped lang="scss">
.sector-logo-container {
  margin-right: 1.5rem;
  flex-shrink: 0;
}

.fr-title {
  margin-bottom: 0.625rem;
}

.fr-subtitle {
  font-weight: 400;
  color: #666;
}

.dashboard-table-scroll {
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
}

.fr-table {
  width: 100%;
}

.fr-table table {
  width: max-content;
  min-width: 100%;
  border-collapse: collapse;
}

.fr-table th,
.fr-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  vertical-align: top;
}

.fr-table th {
  background-color: #f5f5fe;
  font-weight: 700;
  white-space: nowrap;
}

.fr-table tbody tr:nth-child(even) {
  background-color: #f6f6f6;
}

.fr-table tbody tr:hover {
  background-color: #e3e3fd;
}

.no-data {
  text-align: center;
  color: #666;
  font-style: italic;
}

@media (max-width: 991px) {
  .fr-table th,
  .fr-table td {
    max-width: calc(100vw - 2.5rem);
    box-sizing: border-box;
  }
}

@media (min-width: 992px) {
  .dashboard-table-scroll {
    overflow-x: visible;
  }

  .fr-table table {
    width: 100%;
    min-width: 0;
    table-layout: fixed;
  }

  .fr-table th,
  .fr-table td {
    overflow-wrap: break-word;
    word-break: normal;
  }

  .fr-table th {
    white-space: normal;
  }
}
</style>
