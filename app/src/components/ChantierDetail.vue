<template>
  <div class="chantier-detail">
    <div v-if="isLoading" class="chantier-state">
      <p>Chargement des indicateurs...</p>
    </div>

    <template v-else>
      <nav class="fr-breadcrumb" aria-label="vous êtes ici :">
        <ol class="fr-breadcrumb__list">
          <li>
            <a class="fr-breadcrumb__link" href="#" @click.prevent="goAccueil">Accueil</a>
          </li>
          <li>
            <a class="fr-breadcrumb__link" href="#" @click.prevent="goChantiersSectoriels">Chantiers sectoriels</a>
          </li>
          <li>
            <a class="fr-breadcrumb__link" href="#" @click.prevent="goSector">{{ displaySector }}</a>
          </li>
          <li>
            <span class="fr-breadcrumb__link" aria-current="page">{{ params.chantier_name }}</span>
          </li>
        </ol>
      </nav>

      <section class="chantier-hero">
        <h1 class="fr-title chantier-title" :aria-label="params.chantier_name">
          {{ params.chantier_name }}
        </h1>

        <nav
          v-if="sectionLinks.length > 0"
          class="chantier-anchor-nav"
          aria-label="Navigation dans la page"
        >
          <div class="chantier-anchor-group">
            <span class="chantier-anchor-label">Indicateurs</span>
            <a
              class="chantier-anchor-link"
              :href="'#' + primarySectionId"
            >
              → {{ primaryIndicatorLabel }}
            </a>
            <a
              v-if="otherIndicatorCount > 0"
              class="chantier-anchor-link"
              :href="'#' + primarySectionId"
            >
              → Autres indicateurs ({{ otherIndicatorCount }})
            </a>
          </div>

          <div
            v-if="otherLevierGroups.length > 0"
            class="chantier-anchor-group"
          >
            <span class="chantier-anchor-label">Leviers</span>
            <a
              v-for="link in levierSectionLinks"
              :key="link.id"
              class="chantier-anchor-link"
              :href="'#' + link.id"
            >
              → {{ link.label }}
            </a>
          </div>
        </nav>
      </section>

      <div v-if="loadError" class="chantier-state chantier-state--error">
        <p>{{ loadError }}</p>
      </div>

      <template v-else>
        <section class="chantier-summary">
          <h2 class="fr-h4 chantier-section-title">Ce qu'il faut retenir</h2>
          <div
            class="chantier-summary-copy fr-text--md"
            v-html="summaryHtml"
          ></div>
        </section>

        <section
          :id="primarySectionId"
          class="chantier-section chantier-section--highlighted"
        >
          <h2 class="fr-h3 chantier-section-title">
            <span class="section-kicker-badge">Indicateur</span>
            Indicateur du chantier
          </h2>

          <div
            v-if="hasChantierIndicators"
            class="fr-grid-row fr-grid-row--gutters"
          >
            <div
              v-for="(item, itemIndex) in primaryIndicatorGroup.chartData"
              :key="item.label_indic + '-chantier-' + itemIndex"
              class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12"
            >
              <article>
                <graph-box
                  :dataObj="item"
                  :compact="true"
                  :idAccordion="'levier-accordion-chantier-' + itemIndex"
                  :titre="item.label_indic"
                  :key="item.label_indic + '-chantier-' + itemIndex"
                ></graph-box>
              </article>
            </div>
          </div>

          <p v-else class="fr-text--sm fr-text--alt chantier-empty-state">
            Aucun indicateur n'est encore défini pour ce chantier.
          </p>
        </section>

        <section
          v-for="(levierGroup, index) in otherLevierGroups"
          :key="levierGroup.name + '-' + index"
          :id="getSectionId(levierGroup.name)"
          class="chantier-section"
        >
          <h2 class="fr-h3 chantier-section-title levier-title">
            <span class="section-kicker-badge section-kicker-badge--levier">Levier</span>
            {{ levierGroup.name }}
          </h2>
          <p
            v-if="getLevierIntro(levierGroup)"
            class="fr-text--md chantier-levier-intro"
          >
            {{ getLevierIntro(levierGroup) }}
          </p>

          <div
            v-if="levierGroup.chartData && levierGroup.chartData.length > 0"
            class="fr-grid-row fr-grid-row--gutters"
          >
            <div
              v-for="(item, itemIndex) in levierGroup.chartData"
              :key="item.label_indic + '-' + index + '-' + itemIndex"
              class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12"
            >
              <article>
                <graph-box
                  :dataObj="item"
                  :compact="true"
                  :idAccordion="'levier-accordion-' + index + '-' + itemIndex"
                  :titre="item.label_indic"
                  :key="item.label_indic + '-' + index + '-' + itemIndex"
                ></graph-box>
              </article>
            </div>
          </div>

          <p v-else class="fr-text--sm fr-text--alt chantier-empty-state">
            Aucun indicateur n'est encore défini pour ce levier.
          </p>
        </section>

        <div v-if="hasNoLeviers" class="chantier-state">
          <p>Pas de données disponibles pour ce chantier.</p>
        </div>
      </template>
    </template>
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
      loadError: null,
    };
  },
  computed: {
    hasNoLeviers() {
      // True when we have no levier definition at all for this chantier
      return !this.displayLeviers || this.displayLeviers.length === 0;
    },
    explicitChantierGroup() {
      return this.displayLeviers.find(
        (levierGroup) => levierGroup.name === "Indicateur de chantier"
      );
    },
    fallbackIndicatorGroup() {
      return this.displayLeviers.find(
        (levierGroup) =>
          levierGroup.name === "Indicateurs" &&
          Array.isArray(levierGroup.chartData) &&
          levierGroup.chartData.length > 0
      );
    },
    primaryIndicatorGroup() {
      if (this.explicitChantierGroup) {
        return this.explicitChantierGroup;
      }

      return this.fallbackIndicatorGroup || {
        name: "Indicateur de chantier",
        chartData: [],
      };
    },
    otherLevierGroups() {
      return this.displayLeviers.filter(
        (levierGroup) =>
          levierGroup !== this.primaryIndicatorGroup &&
          levierGroup.name !== "Indicateur de chantier"
      );
    },
    hasChantierIndicators() {
      return (
        Array.isArray(this.primaryIndicatorGroup.chartData) &&
        this.primaryIndicatorGroup.chartData.length > 0
      );
    },
    primarySectionId() {
      return this.getSectionId("Indicateur du chantier");
    },
    sectionLinks() {
      return [
        {
          id: this.primarySectionId,
          label: "Indicateur du chantier",
        },
        ...this.levierSectionLinks,
      ];
    },
    levierSectionLinks() {
      return this.otherLevierGroups
        .filter((levierGroup) => levierGroup.name)
        .map((levierGroup) => ({
          id: this.getSectionId(levierGroup.name),
          label: levierGroup.name,
        }));
    },
    displaySector() {
      // Use chantier_sector (real sector) if available, otherwise fall back to sector
      return this.params.chantier_sector || this.params.sector || 'Secteur';
    },
    primaryIndicatorLabel() {
      if (this.hasChantierIndicators && this.primaryIndicatorGroup.chartData.length > 0) {
        return this.primaryIndicatorGroup.chartData[0].label_indic || 'Indicateur du chantier';
      }
      return 'Indicateur du chantier';
    },
    otherIndicatorCount() {
      if (!this.hasChantierIndicators) return 0;
      return Math.max(0, this.primaryIndicatorGroup.chartData.length - 1);
    },
    summaryHtml() {
      const chantierDescription = this.getDescriptionHtml(
        this.primaryIndicatorGroup.chartData
      );

      if (chantierDescription) {
        return chantierDescription;
      }

      return "Retrouvez sur cette page les principaux indicateurs de suivi du chantier et les leviers associes a sa mise en oeuvre.";
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
      this.loadError = null;

      // Chantier sans aucun indicateur : on affiche quand même la liste des leviers
      // (issue de Liste_leviers) avec le message "Aucun indicateur n'est encore défini"
      if (allGristIds.length === 0) {
        this.isLoading = false;
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
        this.loadError = "Impossible de charger les indicateurs du chantier.";
        this.allIndicatorsData = [];
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
    getDescriptionHtml(chartData) {
      const itemWithDescription = (chartData || []).find(
        (item) => item.label_description && item.label_description.trim() !== ""
      );

      return itemWithDescription ? itemWithDescription.label_description : "";
    },
    getLevierIntro(levierGroup) {
      const descriptionHtml = this.getDescriptionHtml(levierGroup.chartData);

      if (!descriptionHtml) {
        return "";
      }

      return descriptionHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    },
    goAccueil() {
      const routeName = window.location.pathname.includes('/staging') ? 'staging-dashboard' : 'dashboard';
      this.$router.push({ name: routeName, query: { sector: 'Synthèse', view: 'about' } }).catch(() => {});
    },
    goChantiersSectoriels() {
      const routeName = window.location.pathname.includes('/staging') ? 'staging-dashboard' : 'dashboard';
      this.$router.push({ name: routeName, query: { sector: 'Synthèse', view: 'chantiers-sectoriels' } }).catch(() => {});
    },
    goSector() {
      // Navigate back to synthèse, scrolled to the relevant sector section
      const routeName = window.location.pathname.includes('/staging') ? 'staging-dashboard' : 'dashboard';
      this.$router.push({ name: routeName, query: { sector: 'Synthèse', view: 'chantiers-sectoriels' } }).catch(() => {});
    },
    getSectionId(label) {
      const normalized = String(label || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      return `section-${normalized || "chantier"}`;
    },
  },
};
</script>

<style scoped lang="scss">
.chantier-detail {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Override DSFR default link styling to avoid double underlines */
.chantier-detail a {
  background-image: none;
}

/* Breadcrumb */
.fr-breadcrumb {
  margin-bottom: 0;
}

.fr-breadcrumb__list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.75rem;
  color: #666;
}

.fr-breadcrumb__list li::before {
  content: '>';
  margin-right: 0.5rem;
}

.fr-breadcrumb__list li:first-child::before {
  content: '';
  margin-right: 0;
}

.fr-breadcrumb__link {
  color: #000091;
  text-decoration: underline;
  text-underline-offset: 2px;
  font-size: 0.75rem;
}

.fr-breadcrumb__link[aria-current] {
  color: #3a3a3a;
  text-decoration: none;
}

.chantier-hero {
  background: transparent;
  border-bottom: 1px solid #d6d6d6;
  padding: 0 0 1rem;
}

.chantier-title {
  margin-bottom: 0.75rem;
  max-width: 54rem;
}

.chantier-anchor-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chantier-anchor-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.chantier-anchor-label {
  color: #3a3a3a;
  font-size: 0.875rem;
  font-weight: 700;
}

.chantier-anchor-link {
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

.chantier-anchor-link:hover,
.chantier-anchor-link:focus {
  background: #000091;
  color: #fff;
  text-decoration: none;
}

.chantier-summary {
  background: #f6f6f6;
  border-left: 4px solid #6a6af4;
  padding: 1.25rem 1.5rem;
}

.chantier-section {
  padding: 1.25rem 0;
  scroll-margin-top: 1.5rem;
}

.chantier-section--highlighted {
  border-top: none;
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

.chantier-section-title {
  margin-top: 0;
  margin-bottom: 0.75rem;
}

.chantier-summary-copy,
.chantier-levier-intro {
  color: #3a3a3a;
  margin-bottom: 1rem;
}

.levier-title {
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #d6d6d6;
}

.chantier-empty-state,
.chantier-state p {
  margin-bottom: 0;
}

.chantier-state--error {
  background: #fff5f5;
  border-left: 4px solid #ce0500;
  padding: 1rem 1.25rem;
}

@media (max-width: 768px) {
  .chantier-summary,
  .chantier-section {
    padding: 1rem;
  }

  .chantier-anchor-nav {
    gap: 0.375rem;
  }

  .chantier-anchor-group {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.375rem;
  }

  .chantier-anchor-link {
    font-size: 0.75rem;
    padding: 0.3rem 0.625rem;
  }
}
</style>
