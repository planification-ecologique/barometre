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
    
    <div
      class="dashboard-table-scroll"
      role="region"
      aria-label="Tableau des chantiers et indicateurs"
      tabindex="0"
    >
    <div class="fr-table fr-table--bordered fr-mt-4w">
      <table>
        <thead>
          <tr>
            <th scope="col">Chantier</th>
            <th scope="col">Indicateur</th>
            <th scope="col">Dernière valeur</th>
            <th scope="col">Cible 2030</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in tableData" :key="index">
            <td>{{ row.chantier }}</td>
            <td>
              {{ row.indicateur }}
              <template v-if="row.indicateurUnite">
                <br><br>
                <em>Unité : {{ row.indicateurUnite }}</em>
              </template>
              <template v-if="row.indicateurSourceLabel">
                <br><br>
                <em>
                  Source : {{ row.indicateurSourceLabel }}
                  <a
                    v-if="row.indicateurSourceUrl"
                    class="source-link-icon"
                    :href="row.indicateurSourceUrl"
                    target="_blank"
                    rel="noopener external"
                    aria-label="Ouvrir la source (nouvel onglet)"
                    @click.stop
                    @mousedown.stop
                  >
                  </a>
                </em>
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
import {
  isImpactAxe,
  compareChantierNamesByListeOrder,
  getChantierListeOrderIndexMap,
} from "@/services/csvDataService.js";

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
      chantierListeOrderMap: new Map(),
    };
  },
  created() {
    getChantierListeOrderIndexMap().then((m) => {
      this.chantierListeOrderMap = m;
      if (this.inputData && this.inputData.length > 0) {
        this.buildTableData(this.inputData);
      }
    });
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
    pickSourceMeta(indicator) {
      const s = (v) => (v == null ? "" : String(v)).trim();
      const label = s(indicator?.label_sources);
      const cleanLabel = label && label.toLowerCase() !== "nan" ? label : "";
      const url = s(indicator?.lien_donnees_source) || s(indicator?.lien_site_source);
      return {
        label: cleanLabel,
        url,
      };
    },
    buildTableData(data) {
      const orderMap = this.chantierListeOrderMap;
      try {
        const rows = [];
        const seenRows = new Set();
        
        // Build table directly from data - use chantier_ou_impact as the "chantier" name
        data.forEach(indicator => {
          const sectors = Array.isArray(indicator.sector_list) && indicator.sector_list.length
            ? indicator.sector_list
            : [indicator.sector || '-'];
          const chantiers = Array.isArray(indicator.chantier_ou_impact_list) && indicator.chantier_ou_impact_list.length
            ? indicator.chantier_ou_impact_list
            : [indicator.chantier_ou_impact || '-'];

          chantiers.forEach(chantierName => {
            // Filter out entries where chantierOuImpact is an impact axe (IMPACT_AXES)
            if (isImpactAxe(chantierName)) {
              return;
            }

            // Ne pas afficher de ligne "sans chantier" dans le tableau de synthèse des secteurs
            if (!chantierName || chantierName === '-') {
              return;
            }

            sectors.forEach(sectorName => {
              const key = `${sectorName || '-'}:::${chantierName || '-'}:::${indicator.label_indic || '-'}`;
              // Avoid duplicates (from multi-line charts or repeated mappings)
              if (seenRows.has(key)) {
                return;
              }
              seenRows.add(key);

              const indicLabel = indicator.label_indic || '-';
              const sourceMeta = this.pickSourceMeta(indicator);
              rows.push({
                // Le secteur n'est pas affiché mais sert à l'ordre de tri
                sector: sectorName || '-',
                chantier: chantierName || '-',
                indicateur: indicLabel,
                indicateurSourceLabel: sourceMeta.label,
                indicateurSourceUrl: sourceMeta.url,
                indicateurUnite: indicator.unite || '',
                cible2030: this.formatValue(indicator.objectif_valeur_cible, indicator.unite),
                derniereValeur: this.formatLastValue(indicator),
              });
            });
          });
        });

        // Tri : secteur, puis ordre Liste_chantiers, puis indicateur
        rows.sort((a, b) => {
          const s = (a.sector || '').localeCompare(b.sector || '', 'fr', { sensitivity: 'base' });
          if (s !== 0) return s;
          const c = compareChantierNamesByListeOrder(
            a.chantier,
            b.chantier,
            orderMap
          );
          if (c !== 0) return c;
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

.source-link-icon {
  background-image: none;
}

@media (max-width: 991px) {
  .fr-table th,
  .fr-table td {
    /* Avoid `100vw` (includes scrollbar in Edge) -> tiny overflow -> horizontal page pan */
    max-width: calc(100% - 2.5rem);
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
