<template>
  <div>
    <!-- Sector title and image -->
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
          <h2 class="fr-subtitle">{{ params.sectorFilter || 'Chantiers' }}</h2>
        </div>
      </article>
    </div>
    
    <!-- Chantiers grouped by sector -->
    <div v-for="(chantiers, sector) in filteredChantiersBySector" :key="sector" class="fr-mt-5w">
      <div class="section-header" v-if="!params.sectorFilter">
        <h2 class="fr-h3">{{ sector }}</h2>
      </div>
      
      <!-- Chantiers for this sector -->
      <div v-for="chantier in chantiers" :key="chantier.id" class="fr-mb-5w">
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
                :idAccordion="'chantier-accordion-' + chantier.id + '-' + index"
                :titre="item.label_indic"
                :key="item.label_indic + '-' + chantier.id + '-' + index"
              ></graph-box>
            </article>
          </div>
        </div>
        <div v-else class="fr-mb-2w">
          <p class="fr-text--sm fr-text--alt">Ce chantier n'a pas d'indicateurs propres. Consultez ses leviers pour voir les indicateurs associés.</p>
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
import planifecoMapping from "@/utils/planifeco_mapping.js";

export default {
  name: "GeneralChantiersView",
  components: {
    GraphBox,
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
    useStaging: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      chantiersBySector: {},
    };
  },
  computed: {
    filteredChantiersBySector() {
      // Filter by selected sector if specified, and remove empty sections
      const result = {};
      Object.entries(this.chantiersBySector).forEach(([sector, chantiers]) => {
        // If a sectorFilter is selected in params, only show that sector
        if (this.params.sectorFilter && sector !== this.params.sectorFilter) {
          return;
        }
        // Only include sections that have chantiers
        if (chantiers && chantiers.length > 0) {
          result[sector] = chantiers;
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
    groupChantiersBySector(data) {
      try {
        const mapping = planifecoMapping;
        if (!mapping || !mapping.chantiers) {
          console.warn("GeneralChantiersView: No mapping or chantiers available");
          return;
        }
        
        console.log(`GeneralChantiersView: Processing ${data.length} indicators for ${Object.keys(mapping.chantiers).length} chantiers`);
        
        // Group chantiers by sector
        const sectorGroups = {};
        
        // Create a map of grist_id -> indicator for faster lookup
        const indicatorMap = new Map();
        data.forEach(item => {
          if (item.id_indic) {
            // If multiple items have the same id_indic, keep the first one
            if (!indicatorMap.has(item.id_indic)) {
              indicatorMap.set(item.id_indic, item);
            }
          }
        });
        
        console.log(`GeneralChantiersView: Created indicator map with ${indicatorMap.size} unique indicators`);
        
        Object.values(mapping.chantiers).forEach(chantier => {
          const sector = chantier.sector || 'Autre';
          // Skip "Synthèse" sector chantiers - they shouldn't appear in "Chantiers"
          if (sector === 'Synthèse') {
            return;
          }
          
          if (!sectorGroups[sector]) {
            sectorGroups[sector] = [];
          }
          
          // Find matching indicators for this chantier
          // Only include indicators that match this chantier's grist_ids exactly
          const indicators = [];
          if (chantier.grist_ids && chantier.grist_ids.length > 0) {
            const chantierGristIds = new Set(chantier.grist_ids);
            console.log(`GeneralChantiersView: Chantier "${chantier.name}" - grist_ids:`, chantier.grist_ids);
            chantier.grist_ids.forEach(gristId => {
              const indicator = indicatorMap.get(gristId);
              // Double-check that this indicator's ID matches the grist_id
              // and that it belongs to this chantier's grist_ids set
              if (indicator && indicator.id_indic === gristId && chantierGristIds.has(indicator.id_indic)) {
                // Check if we already added this indicator (avoid duplicates)
                if (!indicators.find(e => e.id_indic === indicator.id_indic)) {
                  console.log(`GeneralChantiersView: Adding indicator "${indicator.label_indic}" (ID: ${indicator.id_indic}) to chantier "${chantier.name}"`);
                  indicators.push(indicator);
                }
              } else if (indicator) {
                console.warn(`GeneralChantiersView: Skipping indicator "${indicator.label_indic}" (ID: ${indicator.id_indic}) - doesn't match grist_id ${gristId} or not in chantier's grist_ids`);
              }
            });
            console.log(`GeneralChantiersView: Chantier "${chantier.name}" - ${indicators.length} indicators found`);
          }
          
          // Include chantier even if it has no indicators (will show empty, but title will be visible)
          // This allows showing chantiers that only have levier indicators
          sectorGroups[sector].push({
            id: chantier.id,
            name: chantier.name,
            sector: sector,
            indicators: indicators
          });
        });
        
        // Log summary
        Object.keys(sectorGroups).forEach(sector => {
          const totalIndicators = sectorGroups[sector].reduce((sum, ch) => sum + ch.indicators.length, 0);
          console.log(`GeneralChantiersView: ${sector}: ${sectorGroups[sector].length} chantiers, ${totalIndicators} indicateurs`);
        });
        
        this.chantiersBySector = sectorGroups;
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
