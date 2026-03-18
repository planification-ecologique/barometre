<template>
  <div class="chantier-detail">
    <div v-if="isLoading" class="chantier-state">
      <p>Chargement des indicateurs...</p>
    </div>

    <template v-else>
      <div class="chantier-breadcrumb">
        Accueil / Baromètre / {{ params.sector || "Secteur" }} / Chantiers sectoriels
      </div>

      <section class="chantier-hero">
        <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle chantier-hero-row">
          <div class="fr-col-auto sector-logo-container">
            <SectorIcon
              :sector="params.sector"
              height="56px"
              width="56px"
            />
          </div>
          <div class="fr-col">
            <p class="chantier-eyebrow">
              {{ params.sector || "Secteur" }}
            </p>
            <h1 class="fr-title chantier-title" :aria-label="params.chantier_name">
              {{ params.chantier_name }}
            </h1>
          </div>
        </div>

        <nav
          v-if="sectionLinks.length > 0"
          class="chantier-anchor-nav"
          aria-label="Navigation dans la page"
        >
          <div class="chantier-anchor-group chantier-anchor-group--primary">
            <span class="chantier-anchor-label">Indicateur du chantier :</span>
            <a
              class="chantier-anchor-link"
              :href="'#' + primarySectionId"
            >
              Indicateur du chantier
            </a>
          </div>

          <div
            v-if="otherLevierGroups.length > 0"
            class="chantier-anchor-group chantier-anchor-group--leviers"
          >
            <span class="chantier-anchor-label">Leviers :</span>
            <a
              v-for="link in levierSectionLinks"
              :key="link.id"
              class="chantier-anchor-link"
              :href="'#' + link.id"
            >
              {{ link.label }}
            </a>
          </div>
        </nav>
      </section>

      <div v-if="loadError" class="chantier-state chantier-state--error">
        <p>{{ loadError }}</p>
      </div>

      <template v-else>
        <section class="chantier-summary">
          <p class="section-kicker">Synthèse</p>
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
          <p class="section-kicker">Indicateur clé</p>
          <h2 class="fr-h3 chantier-section-title">Indicateur du chantier</h2>

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
          <p class="section-kicker">Levier</p>
          <h2 class="fr-h3 chantier-section-title levier-title">
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

.chantier-breadcrumb {
  color: #666;
  font-size: 0.75rem;
  margin-bottom: -0.5rem;
}

.chantier-hero {
  background: transparent;
  border-bottom: 1px solid #d6d6d6;
  padding: 0 0 1rem;
}

.chantier-hero-row {
  margin-bottom: 0.75rem;
}

.sector-logo-container {
  flex-shrink: 0;
}

.chantier-eyebrow {
  color: #666;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
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
  background: #f6f6f6;
  border: 1px solid #d6d6d6;
  border-radius: 999px;
  color: #000091;
  font-size: 0.8125rem;
  line-height: 1.2;
  padding: 0.35rem 0.75rem;
  text-decoration: none;
}

.chantier-anchor-link:hover,
.chantier-anchor-link:focus {
  background: #ececfe;
  text-decoration: underline;
}

.chantier-summary,
.chantier-section {
  background: #fff;
  border: 1px solid #e5e5e5;
  padding: 1.25rem 1.5rem;
}

.chantier-summary {
  border-left: 4px solid #6a6af4;
}

.chantier-section {
  scroll-margin-top: 1.5rem;
}

.chantier-section--highlighted {
  border-top: 2px solid #000091;
}

.section-kicker {
  color: #666;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
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
