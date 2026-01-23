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
    
    <!-- Table -->
    <div class="fr-table fr-table--bordered fr-mt-4w">
      <table>
        <thead>
          <tr>
            <th scope="col">Chantier</th>
            <th scope="col">Indicateur</th>
            <th scope="col">Cible 2030</th>
            <th scope="col">Dernière valeur</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in tableData" :key="index">
            <td>{{ row.chantier }}</td>
            <td>{{ row.indicateur }}</td>
            <td>{{ row.cible2030 }}</td>
            <td>{{ row.derniereValeur }}</td>
          </tr>
          <tr v-if="tableData.length === 0">
            <td colspan="4" class="no-data">Chargement des données...</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import EnvironnementImg from "./components_sgv/EnvironnementImg.vue";

export default {
  name: "ChantiersTableView",
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
        const seenIndicators = new Set();
        
        // Build table directly from data - use chantier_ou_impact as the "chantier" name
        data.forEach(indicator => {
          // Avoid duplicates (from multi-line charts)
          if (seenIndicators.has(indicator.label_indic)) {
            return;
          }
          seenIndicators.add(indicator.label_indic);
          
          rows.push({
            chantier: indicator.chantier_ou_impact || '-',
            indicateur: indicator.label_indic || '-',
            cible2030: this.formatValue(indicator.objectif_valeur_cible, indicator.unite),
            derniereValeur: this.formatLastValue(indicator),
          });
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

.fr-table {
  width: 100%;
  overflow-x: auto;
}

.fr-table table {
  width: 100%;
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
</style>
