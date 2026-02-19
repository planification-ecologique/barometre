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
          <h1 class="fr-title" :aria-label="sector">
            {{ sector }}
          </h1>
          <h2 class="fr-subtitle">Synthèse</h2>
        </div>
      </article>
    </div>
    <!-- Engagements section -->
    <div v-if="engagementsData.length > 0" class="fr-mt-5w">
      <div class="section-header">
        <h2 class="fr-h3">Engagements</h2>
        <p class="fr-text--sm section-description">
          Les engagements représentent les objectifs environnementaux concrets associés à des références légales ou réglementaires.
        </p>
      </div>
      <div class="fr-grid-row fr-grid-row--gutters fr-mb-5w">
        <div
          v-for="(item, index) in engagementsData"
          :key="index"
          class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12"
        >
          <article>
            <graph-box
              :dataObj="item"
              :idAccordion="'engagement-accordion-' + index"
              :titre="item.label_indic"
              :key="item.label_indic + '-' + index"
            ></graph-box>
          </article>
        </div>
      </div>
    </div>
    
    <!-- Chantiers section -->
    <div v-if="chantiersData.length > 0" class="fr-mt-5w">
      <div class="section-header">
        <h2 class="fr-h3">Chantiers</h2>
        <p class="fr-text--sm section-description">
          Les chantiers regroupent les transformations tangibles nécessaires pour respecter les engagements, organisées en leviers opérationnels.
        </p>
      </div>
      <div class="fr-grid-row fr-grid-row--gutters">
        <div
          v-for="(item, index) in chantiersData"
          :key="index"
          class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12"
        >
          <article>
            <graph-box
              :dataObj="item"
              :idAccordion="'chantier-accordion-' + index"
              :titre="item.label_indic"
              :key="item.label_indic + '-' + index"
            ></graph-box>
          </article>
        </div>
      </div>
    </div>
    
    <!-- No data message -->
    <div v-if="engagementsData.length === 0 && chantiersData.length === 0" class="fr-mt-5w">
      <p>Pas de données disponibles pour ce secteur.</p>
    </div>
  </div>
</template>

<script>
import GraphBox from "./GraphBox.vue";
import SectorIcon from "./SectorIcon.vue";
export default {
  name: "SynthesisView",
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
      engagementsData: [],
      chantiersData: [],
      sector: 'Synthèse',
    };
  },
  watch: {
    inputData: {
      handler(newData) {
        this.separateEngagementsAndChantiers(newData);
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
    separateEngagementsAndChantiers(data) {
      if (!data || data.length === 0) {
        this.engagementsData = [];
        this.chantiersData = [];
        return;
      }
      
      // Separate indicators into engagements (Indicateurs d'impact) and chantiers
      // "Indicateur d'impact" and "Indicateur d'impact - autres" go in Indicateurs d'impact
      const engagements = [];
      const chantiers = [];
      const seenEngagements = new Set();
      const seenChantiers = new Set();
      const impactLeviers = ["Indicateur d'impact", "Indicateur d'impact - autres"];
      
      data.forEach(indicator => {
        if (impactLeviers.includes(indicator.levier)) {
          if (!seenEngagements.has(indicator.label_indic)) {
            seenEngagements.add(indicator.label_indic);
            engagements.push(indicator);
          }
        } else {
          if (!seenChantiers.has(indicator.label_indic)) {
            seenChantiers.add(indicator.label_indic);
            chantiers.push(indicator);
          }
        }
      });
      
      this.engagementsData = engagements;
      this.chantiersData = chantiers;
    },
  },
  mounted() {
    if (this.inputData && this.inputData.length > 0) {
      this.separateEngagementsAndChantiers(this.inputData);
    }
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

.section-description {
  color: var(--text-default-grey, #3a3a3a);
  margin-top: 0.5rem;
  margin-bottom: 0;
}

.fr-h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: var(--text-title-grey, #161616);
}
</style>
