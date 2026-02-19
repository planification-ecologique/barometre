<template>
  <div>
    <!-- Sector title and image -->
    <div class="fr-grid-row">
      <article class="fr-col-12" style="display: flex; align-items: center">
        <div class="sector-logo-container">
          <SectorIcon
            :sector="sector"
            height="100px"
            width="100px"
          />
        </div>
        <div>
          <h1 class="fr-title">{{ sector }}</h1>
          <h2 class="fr-subtitle">Indicateurs d'impact</h2>
        </div>
      </article>
    </div>
    
    <!-- Engagements grouped by taxonomy axis (sorted alphabetically, above "others") -->
    <div v-for="entry in sortedAxesEntries" :key="'axe-' + entry.axe" class="fr-mt-5w">
      <div class="section-header">
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
      <p>Pas de données disponibles pour les engagements de ce secteur.</p>
    </div>
  </div>
</template>

<script>
import GraphBox from "./GraphBox.vue";
import SectorIcon from "./SectorIcon.vue";
export default {
  name: "SectorialEngagementsView",
  components: {
    GraphBox,
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
      engagementsByAxe: {},
      engagementsByChantierAutres: {},
      sector: 'Synthèse',
    };
  },
  computed: {
    // Axes sorted alphabetically (normal indicators, shown first)
    sortedAxesEntries() {
      return Object.entries(this.engagementsByAxe)
        .filter(([, engagements]) => engagements && engagements.length > 0)
        .map(([axe, engagements]) => ({ axe, engagements }))
        .sort((a, b) => a.axe.localeCompare(b.axe, 'fr'));
    },
    // Chantier "autres" sections sorted alphabetically (shown below normal indicators)
    sortedChantierAutresEntries() {
      return Object.entries(this.engagementsByChantierAutres)
        .filter(([, engagements]) => engagements && engagements.length > 0)
        .map(([chantierName, engagements]) => ({ chantierName, engagements }))
        .sort((a, b) => a.chantierName.localeCompare(b.chantierName, 'fr'));
    },
  },
  watch: {
    inputData: {
      handler(newData) {
        if (newData && newData.length > 0) {
          this.groupEngagements(newData);
        } else {
          this.engagementsByAxe = {};
          this.engagementsByChantierAutres = {};
        }
      },
      immediate: true,
    },
    params: {
      handler(newParams) {
        if (newParams && newParams.sector) {
          this.sector = newParams.sector;
        }
      },
      immediate: true,
    },
  },
  methods: {
    groupEngagements(data) {
      try {
        const axeGroups = {};
        const chantierAutresGroups = {};
        const seenByAxe = new Set();
        const seenByChantierAutres = new Set();
        data.forEach(indicator => {
          const levier = indicator.levier || '';
          const chantierOuImpact = indicator.chantier_ou_impact || 'Autre';
          // "Indicateur d'impact - autres" can appear in a composite levier string,
          // so we check using includes instead of strict equality.
          if (levier && levier.includes("Indicateur d'impact - autres")) {
            if (!seenByChantierAutres.has(indicator.label_indic)) {
              seenByChantierAutres.add(indicator.label_indic);
              if (!chantierAutresGroups[chantierOuImpact]) chantierAutresGroups[chantierOuImpact] = [];
              chantierAutresGroups[chantierOuImpact].push(indicator);
            }
          } else {
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
        console.error("Error grouping engagements:", error);
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
  color: var(--text-title-grey, #161616);
}

.fr-subtitle {
  font-weight: 400;
  color: var(--text-default-grey, #3a3a3a);
}

.section-header {
  margin-bottom: 1.5rem;
}

.fr-h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: var(--text-title-grey, #161616);
}
</style>
