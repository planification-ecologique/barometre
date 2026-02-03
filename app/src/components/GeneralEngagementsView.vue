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
          <h2 class="fr-subtitle">{{ params.axe || 'Indicateurs d\'impact' }}</h2>
        </div>
      </article>
    </div>
    
    <!-- Engagements grouped by taxonomy axis (sorted alphabetically, above "others") -->
    <div v-for="entry in sortedAxesEntries" :key="'axe-' + entry.axe" class="fr-mt-5w">
      <div class="section-header" v-if="!params.axe">
        <h2 class="fr-h3">{{ entry.axe }}</h2>
      </div>
      <div class="fr-grid-row fr-grid-row--gutters fr-mb-5w">
        <div
          v-for="(item, index) in entry.engagements"
          :key="index"
          class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12"
        >
          <article>
            <graph-box
              :dataObj="item"
              :idAccordion="'engagement-accordion-' + entry.axe + '-' + index"
              :titre="item.label_indic"
              :key="item.label_indic + '-' + entry.axe + '-' + index"
            ></graph-box>
          </article>
        </div>
      </div>
    </div>
    
    <!-- Indicateur d'impact - autres: under chantier name (no submenu), sorted alphabetically, below normal indicators -->
    <div v-for="entry in sortedChantierAutresEntries" :key="'chantier-' + entry.chantierName" class="fr-mt-5w">
      <div class="section-header">
        <h2 class="fr-h3">{{ entry.chantierName }} - autres</h2>
      </div>
      <div class="fr-grid-row fr-grid-row--gutters fr-mb-5w">
        <div
          v-for="(item, index) in entry.engagements"
          :key="index"
          class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12"
        >
          <article>
            <graph-box
              :dataObj="item"
              :idAccordion="'engagement-accordion-autres-' + entry.chantierName + '-' + index"
              :titre="item.label_indic"
              :key="item.label_indic + '-' + entry.chantierName + '-' + index"
            ></graph-box>
          </article>
        </div>
      </div>
    </div>
    
    <!-- No data message -->
    <div v-if="sortedAxesEntries.length === 0 && sortedChantierAutresEntries.length === 0" class="fr-mt-5w">
      <p>Pas de données disponibles pour les engagements.</p>
    </div>
  </div>
</template>

<script>
import GraphBox from "./GraphBox.vue";
import EnvironnementImg from "./components_sgv/EnvironnementImg.vue";

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
      engagementsByChantierAutres: {},  // "Indicateur d'impact - autres" grouped by chantier name
    };
  },
  computed: {
    filteredEngagementsByAxe() {
      const result = {};
      Object.entries(this.engagementsByAxe).forEach(([axe, engagements]) => {
        if (this.params.axe && axe !== this.params.axe) return;
        if (engagements && engagements.length > 0) result[axe] = engagements;
      });
      return result;
    },
    // "Indicateur d'impact - autres" by chantier; only shown when no axe filter (no submenu)
    filteredEngagementsByChantierAutres() {
      if (this.params.axe) return {};
      const result = {};
      Object.entries(this.engagementsByChantierAutres).forEach(([chantierName, engagements]) => {
        if (engagements && engagements.length > 0) result[chantierName] = engagements;
      });
      return result;
    },
    // Axes sorted alphabetically (normal indicators, shown first)
    sortedAxesEntries() {
      return Object.entries(this.filteredEngagementsByAxe)
        .map(([axe, engagements]) => ({ axe, engagements }))
        .sort((a, b) => a.axe.localeCompare(b.axe, 'fr'));
    },
    // Chantier "autres" sections sorted alphabetically (shown below normal indicators)
    sortedChantierAutresEntries() {
      return Object.entries(this.filteredEngagementsByChantierAutres)
        .map(([chantierName, engagements]) => ({ chantierName, engagements }))
        .sort((a, b) => a.chantierName.localeCompare(b.chantierName, 'fr'));
    },
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
    groupEngagementsByAxe(data) {
      try {
        const axeGroups = {};
        const chantierAutresGroups = {};
        const seenByAxe = new Set();
        const seenByChantierAutres = new Set();
        
        data.forEach(indicator => {
          const levier = indicator.levier || '';
          const chantierOuImpact = indicator.chantier_ou_impact || 'Autre';
          
          if (levier === "Indicateur d'impact - autres") {
            // Group by chantier name (chantier_ou_impact); displayed under chantier title, no submenu
            if (!seenByChantierAutres.has(indicator.label_indic)) {
              seenByChantierAutres.add(indicator.label_indic);
              if (!chantierAutresGroups[chantierOuImpact]) chantierAutresGroups[chantierOuImpact] = [];
              chantierAutresGroups[chantierOuImpact].push(indicator);
            }
          } else {
            // "Indicateur d'impact": group by taxonomy axe (chantier_ou_impact)
            if (!seenByAxe.has(indicator.label_indic)) {
              seenByAxe.add(indicator.label_indic);
              if (!axeGroups[chantierOuImpact]) axeGroups[chantierOuImpact] = [];
              axeGroups[chantierOuImpact].push(indicator);
            }
          }
        });
        
        this.engagementsByAxe = axeGroups;
        this.engagementsByChantierAutres = chantierAutresGroups;
      } catch (error) {
        console.error("Error grouping engagements by axe:", error);
        this.engagementsByAxe = {};
        this.engagementsByChantierAutres = {};
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
