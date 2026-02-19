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
      
      <div
        v-if="levierGroup.chartData && levierGroup.chartData.length > 0"
        class="fr-grid-row fr-grid-row--gutters"
      >
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
      <div
        v-else
        class="fr-mb-2w"
      >
        <p class="fr-text--sm fr-text--alt">
          Aucun indicateur n'est encore défini pour ce levier.
        </p>
      </div>
    </div>
    
    <!-- No data message -->
    <div v-if="hasNoLeviers && !isLoading">
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
  computed: {
    hasNoLeviers() {
      // True when we have no levier definition at all for this chantier
      return !this.displayLeviers || this.displayLeviers.length === 0;
    },
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
      const allGristIds = this.params.grist_ids || [];

      // Chantier sans aucun indicateur : on affiche quand même la liste des leviers
      // (issue de Liste_leviers) avec le message "Aucun indicateur n'est encore défini"
      if (allGristIds.length === 0) {
        this.allIndicatorsData = [];
        this.groupIndicatorsByLevier();
        return;
      }

      this.isLoading = true;

      try {
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
      
      const result = [];

      // When we have a levier structure, always create a group per levier,
      // even if no indicator currently exists for it.
      if (sortedLeviers.length > 0) {
        sortedLeviers.forEach(levierGroup => {
          const gristIds = (levierGroup.indicators || [])
            .map(item => item.gristId)
            .filter(id => id);

          const chartData = this.allIndicatorsData.filter(indicator =>
            gristIds.includes(indicator.id_indic)
          );

          result.push({
            name: levierGroup.name,
            sortOrder: levierGroup.sortOrder,
            chartData,
          });
        });
      } else if (this.allIndicatorsData.length > 0) {
        // Fallback: no explicit levier structure, keep previous behaviour
        result.push({
          name: "Indicateurs",
          sortOrder: 0,
          chartData: this.allIndicatorsData,
        });
      }

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
