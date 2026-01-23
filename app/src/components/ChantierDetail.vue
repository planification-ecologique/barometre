<template>
  <div>
    <!-- Chantier title and image -->
    <div class="fr-grid-row">
      <article class="fr-col-12" style="display: flex; align-items: center">
        <div class="sector-logo-container">
          <SectorIcon
            :sector="params.sector"
            height="100px"
            width="100px"
          />
        </div>
        <div>
          <h1 class="fr-title" :aria-label="params.chantier_name">
            {{ params.chantier_name }}
          </h1>
        </div>
      </article>
    </div>
    
    <!-- Leviers grouped and sorted -->
    <div v-for="(levierGroup, index) in displayLeviers" :key="index" class="fr-mt-5w">
      <!-- Show title only if it's not "Indicateur de chantier" (which is displayed differently) -->
      <h2 v-if="levierGroup.name !== 'Indicateur de chantier'" class="fr-h3 levier-title">
        {{ levierGroup.name }}
      </h2>
      <h2 v-else class="fr-h3">Indicateur du chantier</h2>
      
      <div class="fr-grid-row fr-grid-row--gutters">
        <div
          v-for="(item, itemIndex) in levierGroup.chartData"
          :key="itemIndex"
          class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12"
        >
          <article>
            <graph-box
              :dataObj="item"
              :idAccordion="'levier-accordion-' + index + '-' + itemIndex"
              :titre="item.label_indic"
              :key="item.label_indic + '-' + index + '-' + itemIndex"
            ></graph-box>
          </article>
        </div>
      </div>
    </div>
    
    <!-- No data message -->
    <div v-if="displayLeviers.length === 0 && !isLoading">
      <p>Pas de données disponibles pour ce chantier.</p>
    </div>
    
    <!-- Loading message -->
    <div v-if="isLoading">
      <p>Chargement des indicateurs...</p>
    </div>
  </div>
</template>

<script>
import GraphBox from "./GraphBox.vue";
import SectorIcon from "./SectorIcon.vue";
import { getIndicators } from "@/services/csvDataService.js";

export default {
  name: "ChantierDetail",
  components: {
    GraphBox,
    SectorIcon,
  },
  props: {
    params: {
      type: Object,
      required: true,
    },
    chantierData: {
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
      allIndicatorsData: [],
      displayLeviers: [],
      isLoading: false,
    };
  },
  watch: {
    params: {
      handler() {
        this.loadAllData();
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    async loadAllData() {
      // Get all grist IDs from the chantier
      const allGristIds = this.params.grist_ids || [];
      
      if (allGristIds.length === 0) {
        this.displayLeviers = [];
        return;
      }
      
      this.isLoading = true;
      
      try {
        // Fetch all indicators for this chantier
        const query = {
          filter_by: [
            { field: "grist_ids", values: allGristIds },
          ],
          time_period: {
            date_start: "2015-01-01",
            date_end: "2031-01-01",
          },
        };
        
        const response = await getIndicators(query, this.useStaging ? 'staging' : 'production');
        this.allIndicatorsData = response.results || [];
        
        // Group indicators by levier using the sortedLeviers from params
        this.groupIndicatorsByLevier();
      } catch (error) {
        console.error("Error loading chantier data:", error);
        this.displayLeviers = [];
      } finally {
        this.isLoading = false;
      }
    },
    groupIndicatorsByLevier() {
      const sortedLeviers = this.params.sortedLeviers || [];
      
      if (sortedLeviers.length === 0) {
        // Fallback: just display all indicators without grouping
        if (this.allIndicatorsData.length > 0) {
          this.displayLeviers = [{
            name: 'Indicateurs',
            chartData: this.allIndicatorsData
          }];
        } else {
          this.displayLeviers = [];
        }
        return;
      }
      
      // Build display groups from sortedLeviers
      const result = [];
      
      sortedLeviers.forEach(levierGroup => {
        // Get the grist IDs for this levier group
        const gristIds = levierGroup.indicators.map(item => item.gristId).filter(id => id);
        
        // Find matching chart data
        const chartData = this.allIndicatorsData.filter(indicator => 
          gristIds.includes(indicator.id_indic)
        );
        
        // Only add group if it has data
        if (chartData.length > 0) {
          result.push({
            name: levierGroup.name,
            sortOrder: levierGroup.sortOrder,
            chartData: chartData
          });
        }
      });
      
      this.displayLeviers = result;
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

.fr-h3 {
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.levier-title {
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e5e5;
}
</style>
