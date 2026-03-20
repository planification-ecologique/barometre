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
            <span class="fr-breadcrumb__link" aria-current="page">{{ chantierTitle }}</span>
          </li>
        </ol>
      </nav>

      <section class="chantier-hero">
        <h1 class="fr-title chantier-title" :aria-label="chantierTitle">
          {{ chantierTitle }}
        </h1>

        <nav
          v-if="metadataTags.length > 0"
          class="chantier-metadata-tags"
          aria-label="Métadonnées du chantier"
        >
          <!-- Indicateurs -->
          <div v-if="indicateurTags.length > 0" class="chantier-tags-row">
            <span class="chantier-tags-row__label">Indicateurs</span>
              <a
                v-for="tag in indicateurTags"
                :key="'ind-' + tag.id"
                class="chantier-metadata-tag chantier-metadata-tag--indicateur"
                :href="tag.href"
              >
                <span class="ri-target-line chantier-metadata-tag__icon" aria-hidden="true"></span>
                <span class="chantier-metadata-tag__text">{{ tag.label }}</span>
              </a>
          </div>
          <!-- Leviers -->
          <div v-if="levierTags.length > 0" class="chantier-tags-row">
            <span class="chantier-tags-row__label">Leviers</span>
              <a
                v-for="tag in levierTags"
                :key="'lev-' + tag.id"
                class="chantier-metadata-tag chantier-metadata-tag--levier"
                :href="tag.href"
              >
                <span class="ri-wrench-line chantier-metadata-tag__icon" aria-hidden="true"></span>
                <span class="chantier-metadata-tag__text">{{ tag.label }}</span>
              </a>
          </div>
          <!-- Contribution à l'état de l'environnement -->
          <div v-if="contributionTags.length > 0" class="chantier-tags-row">
            <span class="chantier-tags-row__label">Contribution à l'état de l'environnement</span>
              <span
                v-for="tag in contributionTags"
                :key="'cont-' + tag.id"
                class="chantier-metadata-tag chantier-metadata-tag--contribution"
              >
                <span class="ri-tree-line chantier-metadata-tag__icon" aria-hidden="true"></span>
                <span class="chantier-metadata-tag__text">{{ tag.label }}</span>
              </span>
          </div>
        </nav>
      </section>

      <div v-if="loadError" class="chantier-state chantier-state--error">
        <p>{{ loadError }}</p>
      </div>

      <template v-else>
        <section
          :id="primarySectionId"
          class="chantier-summary"
        >
          <div class="chantier-summary__highlighted">
            <h2 class="fr-h4 chantier-section-title">Ce qu'il faut retenir</h2>
            <div
              class="chantier-summary-copy fr-text--md"
              v-html="summaryHtml"
            ></div>

            <div
              v-if="hasChantierIndicators"
              class="chantier-summary-charts"
            >
              <span class="section-chip section-chip--indicateur section-chip--standalone">Indicateur</span>
              <div class="chantier-summary-charts__grid fr-grid-row fr-grid-row--gutters">
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
            </div>

            <p v-else class="fr-text--md chantier-empty-state">
              Aucun indicateur n'est encore défini pour ce chantier.
            </p>
          </div>
        </section>

        <section
          v-for="(levierGroup, index) in otherLevierGroups"
          :key="levierGroup.name + '-' + index"
          :id="getSectionId(levierGroup.name)"
          class="chantier-section"
        >
          <h2 class="fr-h3 chantier-section-title levier-title section-title-with-chip">
            <span class="section-chip section-chip--levier section-chip--in-title">Levier</span>
            {{ levierGroup.name }}
          </h2>

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

          <p v-else class="fr-text--md chantier-empty-state">
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
    chantierTitle() {
      const raw = this.params.chantier_name || '';
      const withoutPrefix = raw.startsWith('Chantier : ') ? raw.slice(11).trim() : raw;
      const rest = withoutPrefix ? withoutPrefix.toLowerCase() : '';
      return rest ? `Chantier : ${rest}` : raw || 'Chantier';
    },
    indicateurTags() {
      const tags = [];
      if (this.hasChantierIndicators && this.primaryIndicatorGroup.chartData.length > 0) {
        tags.push({
          id: 'primary',
          label: this.primaryIndicatorGroup.chartData[0].label_indic || 'Indicateur du chantier',
          href: '#' + this.primarySectionId,
        });
        if (this.otherIndicatorCount > 0) {
          tags.push({
            id: 'others',
            label: `Autres indicateurs (${this.otherIndicatorCount})`,
            href: '#' + this.primarySectionId,
          });
        }
      }
      return tags;
    },
    levierTags() {
      return this.levierSectionLinks.map((link) => ({
        id: link.id,
        label: link.label,
        href: '#' + link.id,
      }));
    },
    contributionTags() {
      const seen = new Set();
      const tags = [];
      const allChartData = [
        ...(this.primaryIndicatorGroup.chartData || []),
        ...this.otherLevierGroups.flatMap((g) => g.chartData || []),
      ];
      allChartData.forEach((item) => {
        const raw = item.label_tags || '';
        raw.split(',').forEach((t) => {
          const trimmed = t.trim();
          if (trimmed && !seen.has(trimmed.toLowerCase())) {
            seen.add(trimmed.toLowerCase());
            tags.push({
              id: trimmed.toLowerCase().replace(/\s+/g, '-'),
              label: trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
            });
          }
        });
      });
      return tags;
    },
    metadataTags() {
      return [...this.indicateurTags, ...this.levierTags, ...this.contributionTags];
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

      return "Résumé de la situation des indicateurs";
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
  padding: 0 0 1rem;
}

.chantier-title {
  margin-bottom: 0.75rem;
  max-width: 100%;
}

.chantier-metadata-tags {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  margin-top: 0.75rem;
}

.chantier-tags-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.25rem 0.5rem;
}

.chantier-tags-row__label {
  color: #3a3a3a;
  font-size: 0.75rem;
  font-weight: 400;
  flex-shrink: 0;
}

.chantier-tags-row__tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
}

.chantier-metadata-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  border-radius: 999px;
  font-size: 0.5625rem;
  font-weight: 400;
  line-height: 1.3;
  padding: 0.15rem 0.4rem;
  text-decoration: none;
  transition: background-color 0.15s, color 0.15s;
}

.chantier-metadata-tag__icon {
  font-size: 0.75rem;
  flex-shrink: 0;
}

/* Indicateurs - light cyan */
.chantier-metadata-tag--indicateur {
  background: #c7f6fc;
  color: #000091;
}

.chantier-metadata-tag--indicateur .chantier-metadata-tag__icon {
  color: #000091;
}

.chantier-metadata-tag--indicateur:hover,
.chantier-metadata-tag--indicateur:focus {
  background: #000091;
  color: #fff;
}

.chantier-metadata-tag--indicateur:hover .chantier-metadata-tag__icon,
.chantier-metadata-tag--indicateur:focus .chantier-metadata-tag__icon {
  color: inherit;
}

/* Leviers - light purple */
.chantier-metadata-tag--levier {
  background: #e8e0f7;
  color: #000091;
}

.chantier-metadata-tag--levier .chantier-metadata-tag__icon {
  color: #000091;
}

.chantier-metadata-tag--levier:hover,
.chantier-metadata-tag--levier:focus {
  background: #000091;
  color: #fff;
}

.chantier-metadata-tag--levier:hover .chantier-metadata-tag__icon,
.chantier-metadata-tag--levier:focus .chantier-metadata-tag__icon {
  color: inherit;
}

/* Contribution à l'état de l'environnement - light mint green */
.chantier-metadata-tag--contribution {
  background: #d8f3e0;
  color: #18753c;
}

.chantier-metadata-tag--contribution .chantier-metadata-tag__icon {
  color: #18753c;
}

.chantier-summary {
  padding: 0;
}

.chantier-summary__highlighted {
  background: #f6f6f6;
  border-left: 4px solid #6a6af4;
  padding: 1.25rem 1.5rem;
}

.chantier-summary-charts {
  margin-top: 1.25rem;
}

.chantier-summary-charts__grid {
  margin-top: 0;
}

.chantier-section {
  padding: 1.25rem 0;
  scroll-margin-top: 1.5rem;
}

.chantier-section--highlighted {
  border-top: none;
}

.chantier-section-title {
  margin-top: 0;
  margin-bottom: 0.75rem;
}

.chantier-summary-copy,
.chantier-levier-intro,
.chantier-empty-state {
  color: #3a3a3a;
}
.chantier-summary-copy,
.chantier-levier-intro {
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

  .chantier-metadata-tags {
    gap: 0.625rem;
  }

  .chantier-tags-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .chantier-tags-row__label {
    font-size: 0.6875rem;
  }

  .chantier-metadata-tag {
    font-size: 0.5rem;
    padding: 0.15rem 0.4rem;
  }
}
</style>
