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
      
      <!-- "Indicateur d'impact" indicators first -->
      <div v-if="entry.impactIndicators && entry.impactIndicators.length > 0" class="fr-grid-row fr-grid-row--gutters fr-mb-5w">
        <div
          v-for="(item, index) in entry.impactIndicators"
          :key="'impact-' + index"
          class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12"
        >
          <article>
            <graph-box
              :dataObj="item"
              :idAccordion="'engagement-accordion-' + entry.axe + '-impact-' + index"
              :titre="item.label_indic"
              :key="item.label_indic + '-' + entry.axe + '-impact-' + index"
            ></graph-box>
          </article>
        </div>
      </div>
      
      <!-- Separator: "Autres indicateurs" -->
      <div v-if="entry.autresIndicators && entry.autresIndicators.length > 0" class="fr-mt-5w">
        <div class="section-header">
          <h3 class="fr-h4">Autres indicateurs</h3>
        </div>
        <div class="fr-grid-row fr-grid-row--gutters fr-mb-5w">
          <div
            v-for="(item, index) in entry.autresIndicators"
            :key="'autres-' + index"
            class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12"
          >
            <article>
              <graph-box
                :dataObj="item"
                :idAccordion="'engagement-accordion-' + entry.axe + '-autres-' + index"
                :titre="item.label_indic"
                :key="item.label_indic + '-' + entry.axe + '-autres-' + index"
              ></graph-box>
            </article>
          </div>
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
      <p v-if="params.axe === 'Adaptation climat'">
        Bien que la France soit dotée d’un plan national d’adaptation au changement climatique, les méthodologies de mesure du niveau de résilience restent à définir.
        Nous disposons à ce stade de peu d’indicateurs permettant de piloter nos efforts d’adaptation, puisque les données quantifiables concernent davantage les dommages qui seraient engendrés par une adaptation tardive voire inexistante au changement climatique.
      </p>
      <p v-else>Pas de données disponibles pour les engagements.</p>
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
    // Split each axe's engagements into "Indicateur d'impact" and "Autres indicateurs"
    sortedAxesEntries() {
      return Object.entries(this.filteredEngagementsByAxe)
        .map(([axe, engagements]) => {
          const impactIndicators = [];
          const autresIndicators = [];
          
          engagements.forEach(item => {
            const levier = (item.levier || '').toString();
            // Check if this is "Autres indicateurs" (but not "Indicateur d'impact - autres")
            // "Autres indicateurs" should appear in the "Autres indicateurs" section
            if (levier.includes("Autres indicateurs") && !levier.includes("Indicateur d'impact - autres")) {
              autresIndicators.push(item);
            } else {
              // "Indicateur d'impact" (and anything else) goes in the main section
              impactIndicators.push(item);
            }
          });
          
          return {
            axe,
            impactIndicators,
            autresIndicators,
            engagements // Keep for backward compatibility if needed
          };
        })
        .filter(entry => entry.impactIndicators.length > 0 || entry.autresIndicators.length > 0)
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
          const axes = Array.isArray(indicator.chantier_ou_impact_list) && indicator.chantier_ou_impact_list.length
            ? indicator.chantier_ou_impact_list
            : [indicator.chantier_ou_impact || 'Autre'];
          
          axes.forEach(chantierOuImpact => {
            const axeName = chantierOuImpact || 'Autre';

            // "Indicateur d'impact - autres" can appear in a composite levier string,
            // so we check using includes instead of strict equality.
            if (levier && levier.includes("Indicateur d'impact - autres")) {
              // Group by chantier name (chantier_ou_impact); displayed under chantier title, no submenu
              const key = `${axeName}:::${indicator.label_indic}`;
              if (!seenByChantierAutres.has(key)) {
                seenByChantierAutres.add(key);
                if (!chantierAutresGroups[axeName]) chantierAutresGroups[axeName] = [];
                chantierAutresGroups[axeName].push(indicator);
              }
            } else {
              // Group by taxonomy axe (chantier_ou_impact)
              // This includes both "Indicateur d'impact" and "Autres indicateurs"
              const key = `${axeName}:::${indicator.label_indic}`;
              if (!seenByAxe.has(key)) {
                seenByAxe.add(key);
                if (!axeGroups[axeName]) axeGroups[axeName] = [];
                axeGroups[axeName].push(indicator);
              }
            }
          });
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

.fr-h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}
</style>
