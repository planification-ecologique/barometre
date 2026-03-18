<template>
  <div :class="isAxeDetailView ? 'axe-detail' : 'engagements-overview'">
    <!-- Axe detail view: same look and feel as ChantierDetail -->
    <template v-if="isAxeDetailView">
      <nav class="fr-breadcrumb" aria-label="vous êtes ici :">
        <ol class="fr-breadcrumb__list">
          <li>
            <a class="fr-breadcrumb__link" href="#" @click.prevent="goAccueil">Accueil</a>
          </li>
          <li>
            <a class="fr-breadcrumb__link" href="#" @click.prevent="goEtatEnvironnement">Etat de l'environnement</a>
          </li>
          <li>
            <span class="fr-breadcrumb__link" aria-current="page">{{ params.axe }}</span>
          </li>
        </ol>
      </nav>

      <section class="axe-hero">
        <h1 class="fr-title axe-title" :aria-label="params.axe">{{ params.axe }}</h1>
        <nav v-if="axeSectionLinks.length > 0" class="axe-anchor-nav" aria-label="Navigation dans la page">
          <div class="axe-anchor-group">
            <span class="axe-anchor-label">Indicateurs</span>
            <a v-for="link in axeSectionLinks" :key="link.id" class="axe-anchor-link" :href="'#' + link.id">→ {{ link.label }}</a>
          </div>
        </nav>
      </section>

      <section class="axe-summary">
        <h2 class="fr-h4 axe-section-title">Ce qu'il faut retenir</h2>
        <div class="axe-summary-copy fr-text--md" v-html="axeSummaryHtml"></div>
      </section>

      <section v-if="currentAxeEntry" :id="sectionIndicateurImpactId" class="axe-section axe-section--highlighted">
        <h2 class="fr-h3 axe-section-title">
          <span class="section-kicker-badge">Indicateur</span>
          Indicateurs d'impact
        </h2>
        <div v-if="currentAxeEntry.impactIndicators && currentAxeEntry.impactIndicators.length > 0" class="fr-grid-row fr-grid-row--gutters">
          <div v-for="(item, itemIndex) in currentAxeEntry.impactIndicators" :key="item.label_indic + '-impact-' + itemIndex" class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12">
            <article>
              <graph-box :dataObj="item" :compact="true" :idAccordion="'axe-accordion-impact-' + itemIndex" :titre="item.label_indic" />
            </article>
          </div>
        </div>
        <p v-else class="fr-text--sm fr-text--alt axe-empty-state">Aucun indicateur d'impact n'est encore défini pour cet axe.</p>
      </section>

      <section v-if="currentAxeEntry && currentAxeEntry.autresIndicators && currentAxeEntry.autresIndicators.length > 0" :id="sectionAutresIndicateursId" class="axe-section">
        <h2 class="fr-h3 axe-section-title levier-title">
          <span class="section-kicker-badge section-kicker-badge--levier">Levier</span>
          Autres indicateurs
        </h2>
        <div class="fr-grid-row fr-grid-row--gutters">
          <div v-for="(item, itemIndex) in currentAxeEntry.autresIndicators" :key="item.label_indic + '-autres-' + itemIndex" class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12">
            <article>
              <graph-box :dataObj="item" :compact="true" :idAccordion="'axe-accordion-autres-' + itemIndex" :titre="item.label_indic" />
            </article>
          </div>
        </div>
      </section>

      <div v-if="axeDetailEmpty" class="axe-state">
        <p v-if="params.axe === 'Adaptation climat'">
          Bien que la France soit dotée d'un Plan national d'adaptation au changement climatique (
          <a href="https://www.ecologie.gouv.fr/sites/default/files/documents/PNACC3.pdf" target="_blank" rel="noopener noreferrer">PNACC3</a>,
          publié en mars 2025), les méthodes d'évaluation quantitative qui en découlent font défaut, d'où l'absence d'indicateurs dans ce baromètre à date. Cela tient tant à la difficulté d'élaborer des projections des conséquences du changement climatique qu'au caractère systémique des politiques d'adaptation, celles-ci portant sur des enjeux physiques et organisationnels. A ce stade, le pilotage de la politique d'adaptation repose essentiellement sur l'observation de l'évolution de la sinistralité et des moyens déployés en matière de prévention.
        </p>
        <p v-else>Pas de données disponibles pour cet axe.</p>
      </div>
    </template>

    <!-- Overview: all axes (no axe filter) -->
    <template v-else>
      <div class="fr-grid-row">
        <article class="fr-col-12" style="display: flex; align-items: center">
          <div class="sector-logo-container">
            <EnvironnementImg height="100px" width="100px" />
          </div>
          <div>
            <h1 class="fr-title">Synthèse</h1>
            <h2 class="fr-subtitle">Indicateurs d'impact</h2>
          </div>
        </article>
      </div>

      <div v-for="entry in sortedAxesEntries" :key="'axe-' + entry.axe" class="fr-mt-5w">
        <div class="section-header">
          <h2 class="fr-h3">{{ entry.axe }}</h2>
        </div>
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
              />
            </article>
          </div>
        </div>
      </div>
    
      <div v-if="sortedAxesEntries.length === 0 && sortedChantierAutresEntries.length === 0" class="fr-mt-5w">
        <p v-if="params.axe === 'Adaptation climat'">
        Bien que la France soit dotée d’un Plan national d’adaptation au changement climatique (
        <a href="https://www.ecologie.gouv.fr/sites/default/files/documents/PNACC3.pdf" target="_blank" rel="noopener noreferrer">PNACC3</a>,
        publié en mars 2025), les méthodes d’évaluation quantitative qui en découlent font défaut, d’où l’absence d’indicateurs dans ce baromètre à date. Cela tient tant à la difficulté d’élaborer des projections des conséquences du changement climatique qu’au caractère systémique des politiques d’adaptation, celles-ci portant sur des enjeux physiques et organisationnels. A ce stade, le pilotage de la politique d’adaptation repose essentiellement sur l’observation de l’évolution de la sinistralité et des moyens déployés en matière de prévention.
      </p>
      <p v-else>Pas de données disponibles pour les engagements.</p>
    </div>
    </template>
  </div>
</template>

<script>
import GraphBox from "./GraphBox.vue";
import EnvironnementImg from "./components_sgv/EnvironnementImg.vue";

const AXE_DESCRIPTIONS = {
  'Atténuation climat': "Les indicateurs d'atténuation suivent la réduction des émissions de gaz à effet de serre et la transition vers une économie bas-carbone.",
  'Adaptation climat': "Les indicateurs d'adaptation mesurent la capacité de la société et des territoires à faire face aux effets du changement climatique.",
  'Biodiversité': "Les indicateurs de biodiversité suivent l'état des écosystèmes, des espèces et des habitats naturels.",
  'Eau': "Les indicateurs liés à l'eau suivent la qualité et la gestion durable des ressources en eau.",
  'Pollution': "Les indicateurs de pollution mesurent la qualité de l'air, des sols et l'exposition aux substances nocives.",
  'Economie circulaire': "Les indicateurs d'économie circulaire suivent la réduction des déchets, le recyclage et la sobriété des ressources.",
  'Économie circulaire': "Les indicateurs d'économie circulaire suivent la réduction des déchets, le recyclage et la sobriété des ressources.",
};

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
    isAxeDetailView() {
      return !!this.params.axe;
    },
    currentAxeEntry() {
      if (!this.params.axe) return null;
      return this.sortedAxesEntries.find(e => e.axe === this.params.axe) || null;
    },
    axeSectionLinks() {
      const links = [];
      if (this.currentAxeEntry && (this.currentAxeEntry.impactIndicators?.length > 0 || this.currentAxeEntry.autresIndicators?.length > 0)) {
        links.push({ id: this.sectionIndicateurImpactId, label: "Indicateurs d'impact" });
        if (this.currentAxeEntry.autresIndicators?.length > 0) {
          links.push({ id: this.sectionAutresIndicateursId, label: "Autres indicateurs" });
        }
      }
      return links;
    },
    sectionIndicateurImpactId() {
      return 'section-indicateurs-impact';
    },
    sectionAutresIndicateursId() {
      return 'section-autres-indicateurs';
    },
    axeSummaryHtml() {
      const desc = AXE_DESCRIPTIONS[this.params.axe];
      return desc || "Retrouvez sur cette page les principaux indicateurs d'impact et les autres indicateurs associes a cet axe.";
    },
    axeDetailEmpty() {
      return this.isAxeDetailView && !this.currentAxeEntry;
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
    goAccueil() {
      const routeName = window.location.pathname.includes('/staging') ? 'staging-dashboard' : 'dashboard';
      this.$router.push({ name: routeName, query: { sector: 'Synthèse', view: 'about' } }).catch(() => {});
    },
    goEtatEnvironnement() {
      const routeName = window.location.pathname.includes('/staging') ? 'staging-dashboard' : 'dashboard';
      this.$router.push({ name: routeName, query: { sector: 'Synthèse', view: 'etat-environnement' } }).catch(() => {});
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

/* Axe detail view: same look and feel as ChantierDetail */
.axe-detail a {
  background-image: none;
}

.axe-detail .fr-breadcrumb {
  margin-bottom: 0;
}

.axe-detail .fr-breadcrumb__list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.75rem;
  color: #666;
}

.axe-detail .fr-breadcrumb__list li::before {
  content: '>';
  margin-right: 0.5rem;
}

.axe-detail .fr-breadcrumb__list li:first-child::before {
  content: '';
  margin-right: 0;
}

.axe-detail .fr-breadcrumb__link {
  color: #000091;
  text-decoration: underline;
  text-underline-offset: 2px;
  font-size: 0.75rem;
}

.axe-detail .fr-breadcrumb__link[aria-current] {
  color: #3a3a3a;
  text-decoration: none;
}

.axe-hero {
  background: transparent;
  border-bottom: 1px solid #d6d6d6;
  padding: 0 0 1rem;
}

.axe-title {
  margin-bottom: 0.75rem;
  max-width: 54rem;
}

.axe-anchor-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.axe-anchor-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.axe-anchor-label {
  color: #3a3a3a;
  font-size: 0.875rem;
  font-weight: 700;
}

.axe-anchor-link {
  background: #e3e3fd;
  border: none;
  border-radius: 999px;
  color: #000091;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.3;
  padding: 0.3rem 0.875rem;
  text-decoration: none;
  transition: background-color 0.15s, color 0.15s;
}

.axe-anchor-link:hover,
.axe-anchor-link:focus {
  background: #000091;
  color: #fff;
  text-decoration: none;
}

.axe-summary {
  background: #f6f6f6;
  border-left: 4px solid #6a6af4;
  padding: 1.25rem 1.5rem;
}

.axe-section {
  padding: 1.25rem 0;
  scroll-margin-top: 1.5rem;
}

.axe-section--highlighted {
  border-top: none;
}

.axe-section-title {
  margin-top: 0;
  margin-bottom: 0.75rem;
}

.section-kicker-badge {
  display: inline-block;
  background: #e3e3fd;
  color: #000091;
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.2rem 0.75rem;
  border-radius: 999px;
  margin-right: 0.5rem;
  vertical-align: middle;
  position: relative;
  top: -2px;
}

.section-kicker-badge--levier {
  background: #e3e3fd;
  color: #000091;
}

.axe-summary-copy {
  color: #3a3a3a;
  margin-bottom: 0;
}

.levier-title {
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #d6d6d6;
}

.axe-empty-state,
.axe-state p {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .axe-summary,
  .axe-section {
    padding: 1rem;
  }

  .axe-anchor-nav {
    gap: 0.375rem;
  }

  .axe-anchor-group {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.375rem;
  }

  .axe-anchor-link {
    font-size: 0.75rem;
    padding: 0.3rem 0.625rem;
  }
}
</style>
