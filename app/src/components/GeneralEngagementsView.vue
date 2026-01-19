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
          <h2 class="fr-subtitle">Indicateurs d'impact</h2>
        </div>
      </article>
    </div>
    
    <!-- Engagements grouped by taxonomy axis -->
    <div v-for="(engagements, axe) in engagementsByAxe" :key="axe" class="fr-mt-5w">
      <div class="section-header">
        <h2 class="fr-h3">{{ axe }}</h2>
      </div>
      <div class="fr-grid-row fr-grid-row--gutters fr-mb-5w">
        <div
          v-for="(item, index) in engagements"
          :key="index"
          class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12"
        >
          <article>
            <graph-box
              :dataObj="item"
              :idAccordion="'engagement-accordion-' + axe + '-' + index"
              :titre="item.label_indic"
              :key="item.label_indic + '-' + axe + '-' + index"
            ></graph-box>
          </article>
        </div>
      </div>
    </div>
    
    <!-- No data message -->
    <div v-if="Object.keys(engagementsByAxe).length === 0" class="fr-mt-5w">
      <p>Pas de données disponibles pour les engagements.</p>
    </div>
  </div>
</template>

<script>
import GraphBox from "./GraphBox.vue";
import EnvironnementImg from "./components_sgv/EnvironnementImg.vue";
import { getIndicators } from "@/services/csvDataService.js";
import planifecoMapping from "@/utils/planifeco_mapping.js";

export default {
  name: "GeneralEngagementsView",
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
      engagementsByAxe: {},
    };
  },
  watch: {
    inputData: {
      handler(newData) {
        if (newData && newData.length > 0) {
          this.groupEngagementsByAxe(newData);
        }
      },
      immediate: true,
    },
  },
  mounted() {
    if (this.inputData && this.inputData.length > 0) {
      this.groupEngagementsByAxe(this.inputData);
    }
  },
  methods: {
    async groupEngagementsByAxe(data) {
      try {
        const mapping = planifecoMapping;
        if (!mapping || !mapping.engagements) {
          return;
        }
        
        // Group engagements by taxonomy axis
        const axeGroups = {};
        
        // Get all Synthèse engagements with their axes
        Object.values(mapping.engagements)
          .filter(eng => eng.sector === 'Synthèse')
          .forEach(eng => {
            const axe = eng.taxonomy_axe || 'Autre';
            if (!axeGroups[axe]) {
              axeGroups[axe] = [];
            }
            // Find matching indicators in data
            if (eng.grist_ids) {
              eng.grist_ids.forEach(gristId => {
                const indicator = data.find(item => item.id_indic === gristId);
                if (indicator && !axeGroups[axe].find(e => e.id_indic === indicator.id_indic)) {
                  axeGroups[axe].push(indicator);
                }
              });
            }
          });
        
        this.engagementsByAxe = axeGroups;
      } catch (error) {
        console.error("Error grouping engagements by axe:", error);
        this.engagementsByAxe = {};
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
  margin-bottom: 0.5rem;
}
</style>
