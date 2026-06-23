<template>
  <div>
    <!-- Sector title and image -->
    <div class="fr-grid-row">
      <article class="fr-col-12" style="display: flex; align-items: center">
        <div class="sector-logo-container">
          <!-- Use sector icon when a specific sector is selected -->
          <SectorIcon
            v-if="params.sectorFilter"
            :sector="params.sectorFilter"
            height="100px"
            width="100px"
          />
          <!-- Use default Environnement image when showing all sectors -->
          <EnvironnementImg
            v-else
            height="100px"
            width="100px"
          ></EnvironnementImg>
        </div>
        <div>
          <h1 class="fr-title">Synthèse</h1>
          <h2 class="fr-subtitle">{{ sectorFilterLabel }}</h2>
        </div>
      </article>
    </div>
    
    <!-- Chantiers grouped by sector -->
    <div v-for="(sectorData, sector) in filteredChantiersBySector" :key="sector" class="fr-mt-5w">
      <div class="section-header" v-if="!params.sectorFilter">
        <h2 class="fr-h3">{{ sectorNomMieux(sector) }}</h2>
      </div>
      
      <!-- Chantiers for this sector -->
      <div v-for="chantier in sectorData" :key="chantier.name" class="fr-mb-5w">
        <h3 class="fr-h4 chantier-title">{{ chantier.name }}</h3>
        
        <div v-if="chantier.indicators.length > 0" class="fr-grid-row fr-grid-row--gutters">
          <div
            v-for="(item, index) in chantier.indicators"
            :key="index"
            class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12"
          >
            <article>
              <graph-box
                :dataObj="item"
                :idAccordion="'chantier-accordion-' + chantier.name + '-' + index"
                :titre="item.label_indic"
                :key="item.label_indic + '-' + chantier.name + '-' + index"
              ></graph-box>
            </article>
          </div>
        </div>
        
        <div v-else class="fr-mb-2w">
          <p class="fr-text--sm fr-text--alt">Ce chantier n'a pas d'indicateurs propres.</p>
        </div>
      </div>
    </div>
    
    <!-- No data message -->
    <div v-if="Object.keys(filteredChantiersBySector).length === 0" class="fr-mt-5w">
      <p>Pas de données disponibles pour les chantiers.</p>
    </div>
  </div>
</template>

<script>
import GraphBox from "./GraphBox.vue";
import EnvironnementImg from "./components_sgv/EnvironnementImg.vue";
import SectorIcon from "./SectorIcon.vue";
import { chantierSectorNomMieux as sectorNomMieux } from '@/config/sectorMieuxLabels.js';
import {
  isImpactAxe,
  compareChantierNamesByListeOrder,
  getChantierListeOrderIndexMap,
} from "@/services/csvDataService.js";

export default {
  name: "GeneralChantiersView",
  components: {
    GraphBox,
    EnvironnementImg,
    SectorIcon,
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
    useStaging: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      chantiersBySector: {},
      chantierListeOrderMap: new Map(),
    };
  },
  created() {
    getChantierListeOrderIndexMap().then((m) => {
      this.chantierListeOrderMap = m;
      if (this.inputData && this.inputData.length > 0) {
        this.groupChantiersBySector(this.inputData);
      }
    });
  },
  computed: {
    sectorFilterLabel() {
      if (this.params.sectorFilter) return sectorNomMieux(this.params.sectorFilter);
      return 'Chantiers sectoriels';
    },
    filteredChantiersBySector() {
      // Filter by selected sector if specified, and remove empty sections
      const result = {};
      Object.entries(this.chantiersBySector).forEach(([sector, chantiers]) => {
        // If a sectorFilter is selected in params, only show that sector
        if (this.params.sectorFilter && sector !== this.params.sectorFilter) {
          return;
        }
        // Only include sections that have chantiers with indicators
        const nonEmptyChantiers = chantiers.filter(ch => 
          ch.indicators && ch.indicators.length > 0
        );
        if (nonEmptyChantiers.length > 0) {
          result[sector] = nonEmptyChantiers;
        }
      });
      return result;
    },
  },
  watch: {
    inputData: {
      handler(newData) {
        if (newData && newData.length > 0) {
          this.groupChantiersBySector(newData);
        }
      },
      immediate: true,
    },
  },
  mounted() {
    if (this.inputData && this.inputData.length > 0) {
      this.groupChantiersBySector(this.inputData);
    }
  },
  methods: {
    sectorNomMieux,
    groupChantiersBySector(data) {
      const orderMap = this.chantierListeOrderMap;
      try {
        // Group indicators by sector, then by chantier_ou_impact
        // Include all indicators rattachés à un chantier (pas seulement "Indicateur de chantier")
        const sectorGroups = {};
        const seenKeys = new Set();
        
        data.forEach(indicator => {
          // Support multiple sectors / chantiers per indicator when provided
          const sectors = Array.isArray(indicator.sector_list) && indicator.sector_list.length
            ? indicator.sector_list
            : [indicator.sector || 'Autre'];
          const chantiers = Array.isArray(indicator.chantier_ou_impact_list) && indicator.chantier_ou_impact_list.length
            ? indicator.chantier_ou_impact_list
            : [indicator.chantier_ou_impact || 'Autres'];

          sectors.forEach(sector => {
            // Skip "Synthèse" sector
            if (sector === 'Synthèse') {
              return;
            }

            // Initialize sector group
            if (!sectorGroups[sector]) {
              sectorGroups[sector] = {};
            }

            chantiers.forEach(chantierName => {
              const name = chantierName || 'Autres';

              // Filter out indicators where chantierOuImpact is an impact (from IMPACT_AXES)
              if (isImpactAxe(name)) {
                return;
              }

              // Avoid displaying the same indicator twice in the same chantier of a sector
              const uniqueId = indicator.id_indic || indicator.label_indic || '';
              const key = `${sector}:::${name}:::${uniqueId}`;
              if (seenKeys.has(key)) {
                return;
              }
              seenKeys.add(key);

              // Initialize chantier within sector
              if (!sectorGroups[sector][name]) {
                sectorGroups[sector][name] = {
                  name,
                  indicators: []
                };
              }

              sectorGroups[sector][name].indicators.push(indicator);
            });
          });
        });
        
        // Convert to sorted arrays for display
        const result = {};
        Object.entries(sectorGroups).forEach(([sector, chantiers]) => {
          result[sector] = Object.values(chantiers)
            .filter((chantier) => chantier.indicators.length > 0)
            .sort((a, b) =>
              compareChantierNamesByListeOrder(a.name, b.name, orderMap)
            );
        });
        
        this.chantiersBySector = result;
      } catch (error) {
        console.error("Error grouping chantiers by sector:", error);
        this.chantiersBySector = {};
      }
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

.section-header {
  margin-bottom: 1.5rem;
}

.fr-h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.fr-h4 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.chantier-title {
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e5e5;
}
</style>
