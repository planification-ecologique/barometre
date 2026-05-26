<!-- Composant graphique principale dans chaque indicateur -->

<template>
  <div
    :class="[
      'fr-card',
      'fr-card--no-icon',
      'fr-card--shadow',
      'adjust-height',
      'graph-box-card',
      { 'graph-box-card--compact': compact, 'graph-box-card--iframe': isIframe }
    ]"
    v-if="dataObj"
  >
    <div class="titleBox graph-box-header">
      <div class="fr-grid-row graph-box-title-row">
        <h2 class="cardTitle graph-box-title fr-col">{{ displayData.label_indic }}</h2>
        <button
          v-if="!isIframe"
          class="favori-btn"
          :class="{ 'favori-btn--active': estFavori }"
          :title="estFavori ? 'Retirer des favoris' : 'Ajouter aux favoris'"
          :aria-label="estFavori ? 'Retirer des favoris' : 'Ajouter aux favoris'"
          @click="onToggleFavori"
        >
          <span :class="estFavori ? 'fr-icon-bookmark-fill' : 'fr-icon-bookmark-line'" aria-hidden="true"></span>
        </button>
      </div>
      <!-- Région : dropdown (données Écolab) -->
      <div v-if="hasRegionalData" class="fr-select-group fr-mt-1w">
        <select
          :id="regionSelectId"
          class="fr-select fr-select--sm"
          :disabled="regionsList.length === 0 && !regionsError"
          v-model="selectedRegionCode"
          @change="onRegionChange"
        >
          <option value="">National</option>
          <option
            v-for="r in regionsList"
            :key="r.geocode_region"
            :value="r.geocode_region"
          >
            {{ r.libelle_region }}
          </option>
        </select>
        <p v-if="regionsError" class="fr-error-text fr-mt-1v">{{ regionsError }}</p>
        <p v-if="selectedRegionCode && regionalLoading" class="fr-text--sm fr-text--alt fr-mt-1v">Chargement des données...</p>
        <p v-else-if="selectedRegionCode && regionalError" class="fr-error-text fr-mt-1v">{{ regionalError }}</p>
      </div>
      <div v-if="hasRegionalData && regionExtraOptions.length > 0" class="fr-select-group fr-mt-1w">
        <label class="fr-label" :for="extraSelectId">{{ extraDimensionLabel }}</label>
        <select
          :id="extraSelectId"
          class="fr-select fr-select--sm"
          v-model="selectedExtraValue"
          @change="onExtraDimensionChange"
        >
          <option
            v-for="opt in regionExtraOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>

    <div class="graph-box-toolbar">
      <segmented-controls
        class="graph-box-toolbar__segmented"
        @chart-selected="handleChartSelected"
        :idcontrol="idAccordion + '1'"
      />
      <p class="graph-box-toolbar-unit fr-text--xs fr-text-mention--grey fr-mb-0">
        Unité : {{ displayData.label_unit }}
      </p>
    </div>
    <div v-if="displayData && (displayData.values || displayData.date)">
      <div class="cardData graph-box-data" v-if="this.displayChart">
        <!-- Affichage du graphique -->
        <div v-if="effectiveChartType === 'Barres simple'">
          <!-- Composant Histogramme sans sous-groupe / DSFR -->
          <bar-chart
            :x="JSON.stringify(chartValues.x)"
            :y="JSON.stringify(chartValues.y)"
            :name="JSON.stringify(chartValues.legend)"
            :horizontal="false"
            :stacked="true"
            :color="JSON.stringify(chartValues.colors || defaultBarColors)"
            :aspectratio="2"
            :pointopacity="regionalPointOpacity"
            :trendline="chartValues.trendLine ? JSON.stringify(chartValues.trendLine) : undefined"
            :target-trajectory="chartValues.targetTrajectory ? JSON.stringify(chartValues.targetTrajectory) : undefined"
            :unit="displayData.label_unit"
          >
          </bar-chart>
        </div>
        <div v-else-if="effectiveChartType === 'Barres empilées'">
          <!-- Composant Histogramme avec sous-groupe / DSFR (national ou régional multi-IRPE) -->
          <bar-chart
            :x="JSON.stringify(displayData.date)"
            :y="JSON.stringify(stackedBarChartSeriesForRender)"
            :aspectratio="2"
            :stacked="true"
            :name="JSON.stringify(displayData.label_sous_groupe)"
            :color="JSON.stringify(stackedBarColors)"
            :pointopacity="isRegionalStacked ? regionalPointOpacity : pointOpacityJson"
            :trendline="stackedTrendLine ? JSON.stringify(stackedTrendLine) : undefined"
            :target-trajectory="stackedTargetTrajectory ? JSON.stringify(stackedTargetTrajectory) : undefined"
            :unit="displayData.label_unit"
          >
          </bar-chart>
        </div>
        <div
          v-else-if="
            effectiveChartType === 'Courbes indépendantes' &&
            !selectedRegionCode &&
            displayData &&
            displayData.date &&
            displayData.values
          "
        >
          <!-- Composant Ligne / DSFR (national only) -->
          <multi-line-chart
            :x="JSON.stringify(displayData.date || [])"
            :y="JSON.stringify(displayData.values || [])"
            :aspectratio="2"
            :name="JSON.stringify(displayData.label_sous_groupe)"
            :color="JSON.stringify(lineChartColors)"
            :isSmall="true"
            :pointopacity="pointOpacityJson"
          >
          </multi-line-chart>
        </div>
      </div>
      <!-- Affichage du tableau -->
      <div v-else>
        <div v-if="displayData.label_sous_groupe == '' || (selectedRegionCode && !isRegionalStacked)">
          <!-- Tableau sans sous-groupe (ou données régionales simples) -->
          <table-component
            :captionTitle="displayData.label_indic"
            :annee="tableAnnee"
            :valeur="tableValeur"
            :type_mesure="tableTypeMesure"
          ></table-component>
        </div>
        <div v-else>
          <!-- Tableau avec sous-groupe -->
          <TableComponentVariant
            :annee="displayData.date[0]"
            :valeurCol="displayData.label_sous_groupe"
            :valeurValue="displayData.values"
          ></TableComponentVariant>
        </div>
      </div>
    </div>
    <!-- Commentaire section : tronqué par nombre de mots avec "Voir plus" -->
    <div
      v-if="!shouldHideDescription && dataObj.label_description && dataObj.label_description !== ''"
      class="graph-box-commentaire"
    >
      <div class="graph-box-commentaire__text fr-text--s">
        <template v-if="isCommentaireExpanded">
          <span v-html="dataObj.label_description"></span>
        </template>
        <template v-else>
          {{ truncatedDescription }}
          <button
            v-if="needsTruncation"
            type="button"
            class="fr-link graph-box-commentaire__voir-plus"
            @click="isCommentaireExpanded = true"
          >
            Voir plus
          </button>
        </template>
      </div>
      <button
        v-if="isCommentaireExpanded"
        type="button"
        class="fr-link graph-box-commentaire__voir-plus"
        @click="isCommentaireExpanded = false"
      >
        Voir moins
      </button>
    </div>
    <div class="graph-box-download-row">
      <button
        type="button"
        class="graph-box-download-btn"
        :id="downloadLinkId"
        @click="triggerDownload"
      >
        Télécharger les données
        <span class="fr-icon-download-line" aria-hidden="true"></span>
      </button>
    </div>
    <div class="graph-box-footer graph-box-resources">
      <div v-if="dataObj.lien_donnees_source">
        <p class="fr-text--xs fr-text-mention--grey textReference">
          Source :
          <a
            :href="dataObj.lien_donnees_source"
            target="_blank"
            rel="noopener external"
            >{{ dataObj.label_sources }}</a
          >
        </p>
      </div>
      <div v-else-if="dataObj.lien_site_source">
        <p class="fr-text--xs fr-text-mention--grey textReference">
          Source :
          <a
            :href="dataObj.lien_site_source"
            target="_blank"
            rel="noopener external"
            >{{ dataObj.label_sources }}</a
          >
        </p>
      </div>
      <div v-else>
        <p class="fr-text--xs fr-text-mention--grey textReference">
          Source : {{ dataObj.label_sources }}
        </p>
      </div>
      <div v-if="dataObj.label_sources_cible">
        <p class="fr-text--xs fr-text-mention--grey textReference" v-if="dataObj.lien_cible">
          Cible :
          <a
            :href="dataObj.lien_cible"
            target="_blank"
            rel="noopener external"
            >{{ dataObj.label_sources_cible }}</a
          >
        </p>
        <p v-else class="fr-text--xs fr-text-mention--grey textReference">
          Cible : {{ dataObj.label_sources_cible }}
        </p>
      </div>
      <p class="fr-text--xs fr-text-mention--grey textReference graph-box-footer-meta">
        Mise à jour : {{ formattedDateMaj
        }}<template v-if="dataObj.label_perimetre">
          <span class="graph-box-meta-sep"> — </span>Périmètre : {{ dataObj.label_perimetre }}
        </template>
      </p>
    </div>
    <!-- Métadonnées (tags secteur/axe) -->
    <div class="graph-box-metadata">
      <TaxonomyTagsCard :dataObj="dataObj" :useStaging="isStaging" />
    </div>

  </div>
</template>

<script>
import BarChart from "./components_dsfr/BarChart.vue";
import MultiLineChart from "./components_dsfr/MultiLineChart.vue";
import LineChart from "./components_dsfr/LineChart.vue";
import SegmentedControls from "./SegmentedControls.vue";
import TaxonomyTagsCard from "./TaxonomyTagsCard.vue";
import TableComponent from "./TableComponent.vue";
import TableComponentVariant from "./TableComponentVariant.vue";
import { loadAllRegionsDataForIndicator } from "@/services/ecolabApiService.js";
import {
  extractRegionsAndExtra,
  buildStackedRegionalSeries,
} from "@/services/ecolabRegionHelpers.js";
import { isFavori, toggleFavori } from "@/services/favorisService.js";
import { TREND_LINE_END_YEAR } from "@/services/csvDataService.js";
import {
  chartColorTestState,
  resolvePrimaryBarToken,
  resolveExtrapolationToken,
  resolveStackedSeriesToken,
  resolveLineSeriesToken,
  getFallbackPrimaryBarToken,
  getFallbackExtrapolationBarToken,
} from "@/services/chartColorTestOverrides.js";
import { getAllColors, stackedBarSeriesValuesWithoutCibleYears } from "@/utils.js";

export default {
  name: "GraphBox",
  components: {
    BarChart,
    SegmentedControls,
    TaxonomyTagsCard,
    TableComponent,
    TableComponentVariant,
    MultiLineChart,
    LineChart,
  },
  props: {
    dataObj: {
      type: Object,
      required: true,
    },
    idAccordion: {
      type: String,
      required: true,
    },
    compact: {
      type: Boolean,
      default: false,
    },
    isIframe: {
      type: Boolean,
      default: false
    },
    hideDescription: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      displayChart: false,
      isCommentaireExpanded: false,
      regionsList: [],
      selectedRegionCode: "",
      regionalChartData: null,
      regionalLoading: false,
      regionalError: null,
      regionsError: null,
      regionAllDataList: [],
      regionExtraDimension: null,
      regionExtraOptions: [],
      selectedExtraValue: "",
      estFavori: false,
    };
  },
  watch: {
    dataObj: function () {
      this.selectedRegionCode = "";
      this.regionalChartData = null;
      this.regionalError = null;
      this.clearRegionalState();
      if (this.hasRegionalData) this.loadRegions();
      // Mettre à jour l'état favori
      if (this.dataObj && this.dataObj.label_indic) {
        this.estFavori = isFavori(this.dataObj.label_indic);
      }
    },
  },
  computed: {
    isStaging() {
      return this.$route?.path?.includes('/staging') ?? false;
    },
    hasRegionalData() {
      return this.regionalIndicatorIds.length > 0;
    },
    shouldHideDescription() {
      // Hide Grist description only when user is in "région" mode.
      // Back to "National" => show description again.
      return Boolean(this.hideDescription || (this.hasRegionalData && this.selectedRegionCode));
    },
    regionalIndicatorIds() {
      const ids = this.dataObj?.irpe_ids;
      if (!Array.isArray(ids)) return [];
      return ids.map((id) => String(id).trim()).filter(Boolean);
    },
    primaryRegionData() {
      return this.regionAllDataList[0]?.data || null;
    },
    isRegionalStacked() {
      return Boolean(
        this.selectedRegionCode &&
        Array.isArray(this.regionalChartData?.y) &&
        this.regionalChartData.y.length > 1
      );
    },
    /** Data to display: national (dataObj) or overridden by regional API data */
    displayData() {
      if (this.selectedRegionCode && this.regionalChartData) {
        const v = this.regionalChartData;
        const metaUnit = this.primaryRegionData?.measureMeta?.unite || this.dataObj.label_unit;
        if (this.isRegionalStacked) {
          return {
            ...this.dataObj,
            date: [v.x],
            values: v.y,
            label_sous_groupe: v.legend,
            label_unit: metaUnit,
          };
        }
        const metaLabel =
          this.primaryRegionData?.measureMeta?.libelle_indicateur || this.dataObj.label_indic;
        return {
          ...this.dataObj,
          values: {
            x: [v.x],
            y: v.y,
            legend: v.legend,
            ytab: (v.y && v.y[0]) ? v.y[0] : [],
          },
          label_unit: metaUnit,
          label_indic: metaLabel,
          label_sous_groupe: "",
        };
      }
      return this.dataObj;
    },
    /** Values object for the chart (bar simple: x, y, legend; regional overrides). BarChart expects x[0] = array of labels. */
    /** Couleurs par série pour barres empilées (sous-groupes), alignées sur la palette DSFR en rotation + overrides test. */
    /** Séries barres sans les années « cible » (évite une barre au point objectif, ex. 2030). */
    stackedBarChartSeriesForRender() {
      const series = this.displayData?.values;
      if (this.effectiveChartType !== "Barres empilées" || !Array.isArray(series)) {
        return series;
      }
      if (this.selectedRegionCode) {
        return series;
      }
      const years = this.getStackedYears();
      const lv = this.displayData?.label_value;
      return stackedBarSeriesValuesWithoutCibleYears(
        series,
        Array.isArray(lv) ? lv : [],
        years
      );
    },
    stackedBarColors() {
      chartColorTestState.seriesByIndex;
      chartColorTestState.activePresetId;
      const vals = this.displayData?.values;
      if (!Array.isArray(vals) || vals.length === 0) return [];
      const palette = getAllColors();
      return vals.map((_, i) =>
        resolveStackedSeriesToken(i, palette[i % palette.length])
      );
    },
    /** Couleurs par série pour courbes indépendantes. */
    lineChartColors() {
      chartColorTestState.seriesByIndex;
      chartColorTestState.activePresetId;
      const vals = this.displayData?.values;
      if (!Array.isArray(vals) || vals.length === 0) return [];
      const palette = getAllColors();
      return vals.map((_, i) =>
        resolveLineSeriesToken(i, palette[i % palette.length])
      );
    },
    chartValues() {
      chartColorTestState.seriesByIndex;
      chartColorTestState.activePresetId;
      chartColorTestState.targetToken;
      if (this.selectedRegionCode && this.regionalChartData) {
        const v = this.regionalChartData;
        return {
          x: [v.x],
          y: v.y,
          legend: v.legend,
          colors: [resolvePrimaryBarToken(getFallbackPrimaryBarToken())],
        };
      }
      const vals = this.displayData.values || null;
      if (!vals) return null;
      const out = { ...vals };
      if (Array.isArray(vals.colors) && vals.colors.length > 0) {
        out.colors = [...vals.colors];
        out.colors[0] = resolvePrimaryBarToken(getFallbackPrimaryBarToken());
        if (out.colors.length > 1) {
          out.colors[1] = resolveExtrapolationToken(getFallbackExtrapolationBarToken());
        }
      }
      return out;
    },
    effectiveChartType() {
      if (this.selectedRegionCode && this.regionalChartData) {
        return this.isRegionalStacked ? "Barres empilées" : "Barres simple";
      }
      return this.getChartType;
    },
    tableAnnee() {
      const d = this.displayData;
      if (d.tableAnnee && d.tableAnnee.length > 0) return d.tableAnnee;
      const v = d.values;
      if (!v) return [];
      return (v.x && v.x[0]) ? v.x[0] : (v.x || []);
    },
    tableValeur() {
      const d = this.displayData;
      if (d.tableValeur && d.tableValeur.length > 0) return d.tableValeur;
      const v = d.values;
      if (!v) return [];
      return v.ytab || (v.y && v.y[0]) || [];
    },
    tableTypeMesure() {
      const d = this.displayData;
      if (d.tableTypeMesure && d.tableTypeMesure.length > 0) return d.tableTypeMesure;
      return d.label_value || [];
    },
    defaultBarColors() {
      return this.chartValues?.legend?.map(() => "#000091") || [];
    },
    regionalPointOpacity() {
      if (this.selectedRegionCode && this.regionalChartData?.y) {
        const perSeries = this.regionalChartData.y.map((row) =>
          Array(Array.isArray(row) ? row.length : 0).fill(1)
        );
        return JSON.stringify(perSeries);
      }
      return this.pointOpacityJson;
    },
    extraDimensionLabel() {
      if (!this.regionExtraDimension) return "Dimension";
      const short = this.regionExtraDimension.split(".").pop() || "";
      const lower = short.toLowerCase();
      if (lower.includes("energie")) return "Énergie";
      return short.charAt(0).toUpperCase() + short.slice(1);
    },
    regionSelectId() {
      return `${this.idAccordion}-region-select`;
    },
    extraSelectId() {
      return `${this.idAccordion}-extra-select`;
    },
    downloadLinkId() {
      return `${this.idAccordion}-download`;
    },
    formattedDateMaj() {
      if (this.dataObj.date_maj) {
        return this.dataObj.date_maj.split(" ")[0];
      }

      return "Date non disponible";
    },
    /** Texte brut sans balises, en conservant les sauts de ligne (\\n, <br>, fins de paragraphe) */
    plainDescription() {
      const html = this.dataObj?.label_description || "";
      if (!html) return "";
      let text = html
        .replace(/\r\n/g, "\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<\/div>/gi, "\n")
        .replace(/<[^>]+>/g, " ");
      text = text
        .split("\n")
        .map((line) => line.replace(/[ \t\u00a0]+/g, " ").trimEnd())
        .join("\n");
      return text.replace(/\n{3,}/g, "\n\n").trim();
    },
    /** Texte tronqué aux N premiers mots (~3-4 lignes), sans aplatir les retours à la ligne */
    truncatedDescription() {
      const limit = 40;
      const plain = this.plainDescription;
      const words = plain.split(/\s+/).filter(Boolean);
      if (words.length <= limit) return plain;
      const re = /\S+/g;
      let count = 0;
      let end = 0;
      let m;
      while ((m = re.exec(plain)) !== null) {
        count += 1;
        if (count === limit) {
          end = m.index + m[0].length;
          break;
        }
      }
      return plain.slice(0, end) + "…";
    },
    /** True si le texte dépasse la limite de mots */
    needsTruncation() {
      const limit = 40;
      const plain = this.plainDescription;
      const words = plain.split(/\s+/).filter(Boolean);
      return words.length > limit;
    },
    downloadUrl() {
      let csvContent = "";
      const d = this.displayData;

      try {
        csvContent = "\uFEFF";

        if (!Array.isArray(d.label_sous_groupe) || d.label_sous_groupe === "") {
          const headers = [
            "Année",
            `Valeur - ${d.label_unit}`,
            "Type",
          ];
          csvContent = headers.join(";") + "\n";

          const xValues = this.tableAnnee;
          const ytab = this.tableValeur;
          const typeLabels = this.tableTypeMesure;
          if (xValues.length && ytab.length) {
            for (let i = 0; i < xValues.length; i++) {
              let row = [xValues[i]];
              row.push(ytab[i]);
              row.push(typeLabels[i] || "Mesuré");
              csvContent += row.join(";") + "\n";
            }
          }
        } else {
          // Pour les données avec sous-groupe
          const headers = [
            "Année",
            ...d.label_sous_groupe.map(
              (groupe) => `${groupe} - ${d.label_unit}`
            ),
          ];
          csvContent += headers.join(";") + "\n";

          if (d.date && d.values) {
            for (let i = 0; i < d.date[0].length; i++) {
              let row = [d.date[0][i]];
              for (let j = 0; j < d.values.length; j++) {
                row.push(d.values[j][i]);
              }
              csvContent += row.join(";") + "\n";
            }
          }
        }

        return "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
      } catch (error) {
        console.error(
          "Erreur lors de la création de l'URL de téléchargement:",
          error
        );
        return "#";
      }
    },
    getChartType() {
      try {
        // Check if type_de_graphique is explicitly set
        if (this.dataObj.type_de_graphique) {
          return this.dataObj.type_de_graphique;
        } else {
          // Default to simple bar chart
          return "Barres simple";
        }
      } catch (error) {
        console.error(
          "Erreur dans la détermination du type de graphique:",
          error
        );
        return "Barres simple"; // Default fallback
      }
    },
    pointOpacityJson() {
      try {
        // Build per-point opacity from label_value
        // If label_value is array per point: map to 1 for 'mesuré', else 0.6
        const lv = this.displayData && this.displayData.label_value
        const values = this.displayData && this.displayData.values
        if (!values) return undefined

        // Multi-series case (grouped indicator: values is an array of arrays)
        if (Array.isArray(values) && Array.isArray(values[0])) {
          const years = Array.isArray(this.displayData?.date?.[0]) ? this.displayData.date[0] : []
          const yearCount = years.length
          const baseOpacity = this.buildOpacityArray(lv, yearCount, years)
          const perSeries = values.map(series => (
            Array.isArray(series)
              ? series.map((_, index) => (baseOpacity[index] !== undefined ? baseOpacity[index] : 1))
              : []
          ))
          return JSON.stringify(perSeries)
        }

        const length = Array.isArray(values?.x) ? (values.x[0]?.length || 0) : (values?.[0]?.length || 0)
        if (Array.isArray(lv)) {
          const arr = this.buildOpacityArray(lv, length)
          return JSON.stringify(arr)
        }
        // Else single scalar -> same opacity for all points
        const alpha = this.isMeasuredValue(lv) ? 1 : 0.6
        return JSON.stringify(Array(length).fill(alpha))
      } catch (e) {
        return undefined
      }
    },
    stackedTrendLine() {
      if (this.effectiveChartType !== "Barres empilées" || this.selectedRegionCode) return null;
      if (!this.stackedTargetTrajectory) return null;
      const years = this.getStackedYears();
      const totals = this.getStackedTotals();
      const statuses = Array.isArray(this.displayData?.label_value) ? this.displayData.label_value : [];
      return this.computeTrendSeries(years, totals, statuses);
    },
    stackedTargetTrajectory() {
      if (this.effectiveChartType !== "Barres empilées" || this.selectedRegionCode) return null;
      const years = this.getStackedYears();
      const totals = this.getStackedTotals();
      const statuses = Array.isArray(this.displayData?.label_value) ? this.displayData.label_value : [];
      return this.computeTargetTrajectory(years, totals, statuses);
    }
  },

  methods: {
    clearRegionalState() {
      this.regionAllDataList = [];
      this.regionExtraDimension = null;
      this.regionExtraOptions = [];
      this.selectedExtraValue = "";
    },
    getPointStatus(value, fallbackYear = "") {
      const normalized = String(value ?? "").trim().toLowerCase();
      if (/^cible_\d{4}$/.test(normalized) || normalized === "cible") return "cible";
      if (normalized === "projection") return "projection";
      if (normalized === "mesuré" || /^\d{4}$/.test(normalized)) return "mesuré";
      if (normalized !== "") return "mesuré";
      return String(fallbackYear ?? "").trim() === "2030" ? "cible" : "mesuré";
    },
    isMeasuredValue(value, fallbackYear = "") {
      return this.getPointStatus(value, fallbackYear) === "mesuré";
    },
    buildOpacityArray(labelValues, length, years = []) {
      const opacities = [];
      for (let index = 0; index < length; index += 1) {
        opacities.push(this.isMeasuredValue(labelValues?.[index], years[index]) ? 1 : 0.6);
      }
      return opacities;
    },
    getStackedYears() {
      return Array.isArray(this.displayData?.date?.[0]) ? this.displayData.date[0] : [];
    },
    getStackedTotals() {
      const years = this.getStackedYears();
      const series = Array.isArray(this.displayData?.values) ? this.displayData.values : [];
      return years.map((_, index) => {
        let total = 0;
        let hasValue = false;
        series.forEach((currentSeries) => {
          const rawValue = currentSeries?.[index];
          if (rawValue === null || rawValue === undefined || rawValue === "") return;
          const numericValue = Number(rawValue);
          if (Number.isNaN(numericValue)) return;
          hasValue = true;
          total += numericValue;
        });
        return hasValue ? total : null;
      });
    },
    computeLinearRegression(xValues, yValues) {
      if (!Array.isArray(xValues) || !Array.isArray(yValues) || xValues.length !== yValues.length || xValues.length < 2) {
        return null;
      }
      const n = xValues.length;
      const sumX = xValues.reduce((sum, value) => sum + value, 0);
      const sumY = yValues.reduce((sum, value) => sum + value, 0);
      const sumXY = xValues.reduce((sum, value, index) => sum + value * yValues[index], 0);
      const sumXX = xValues.reduce((sum, value) => sum + value * value, 0);
      const denominator = (n * sumXX) - (sumX * sumX);
      if (denominator === 0) return null;
      const slope = ((n * sumXY) - (sumX * sumY)) / denominator;
      const intercept = (sumY - (slope * sumX)) / n;
      return { slope, intercept };
    },
    computeTrendSeries(years, values, statuses, numYears = 3) {
      if (!Array.isArray(years) || !Array.isArray(values) || years.length !== values.length) return null;
      const measured = [];
      for (let index = 0; index < years.length; index += 1) {
        if (values[index] === null || values[index] === undefined || values[index] === "") continue;
        const numericValue = Number(values[index]);
        if (this.isMeasuredValue(statuses[index], years[index]) && !Number.isNaN(numericValue)) {
          measured.push({
            index,
            year: Number(years[index]),
            value: numericValue,
          });
        }
      }
      if (measured.length < 2) return null;
      const lastMeasured = measured.slice(-numYears);
      const regression = this.computeLinearRegression(
        lastMeasured.map((point) => point.year),
        lastMeasured.map((point) => point.value)
      );
      if (!regression) return null;
      const firstIndex = lastMeasured[0].index;
      return years.map((year, index) => {
        if (index < firstIndex) return null;
        const numericYear = Number(year);
        if (Number.isNaN(numericYear)) return null;
        if (numericYear > TREND_LINE_END_YEAR) return null;
        return regression.slope * numericYear + regression.intercept;
      });
    },
    computeTargetTrajectory(years, values, statuses) {
      if (!Array.isArray(years) || !Array.isArray(values) || years.length !== values.length) return null;
      const explicitReferenceYear = this.displayData?.reference_year_for_target_trajectory;
      let lastMeasuredPoint = null;
      let referencePoint = null;
      const targetPoints = [];

      for (let index = 0; index < years.length; index += 1) {
        if (values[index] === null || values[index] === undefined || values[index] === "") continue;
        const numericValue = Number(values[index]);
        if (Number.isNaN(numericValue)) continue;

        if (this.isMeasuredValue(statuses[index], years[index])) {
          const measuredPoint = {
            year: String(years[index]),
            value: numericValue,
            isTarget: false,
          };
          lastMeasuredPoint = measuredPoint;
          if (explicitReferenceYear && String(years[index]) === String(explicitReferenceYear)) {
            referencePoint = measuredPoint;
          }
          continue;
        }

        targetPoints.push({
          year: String(years[index]),
          value: numericValue,
          isTarget: true,
        });
      }

      const startPoint = referencePoint || lastMeasuredPoint;
      if (!startPoint || targetPoints.length === 0) return null;
      return {
        points: [startPoint, ...targetPoints],
      };
    },
    async loadRegions() {
      const indicatorIds = this.regionalIndicatorIds;
      if (!this.hasRegionalData || indicatorIds.length === 0) return;
      this.regionsError = null;
      this.clearRegionalState();
      try {
        const settled = await Promise.allSettled(
          indicatorIds.map(async (indicatorId) => {
            const data = await loadAllRegionsDataForIndicator(indicatorId);
            return { indicatorId, data };
          })
        );
        const loaded = settled
          .filter((result) => result.status === 'fulfilled')
          .map((result) => result.value);
        const failed = settled.filter((result) => result.status === 'rejected');
        if (!loaded.length) {
          const reason = failed[0]?.reason;
          throw reason instanceof Error
            ? reason
            : new Error('Impossible de charger les données régionales.');
        }
        if (failed.length) {
          console.warn('[GraphBox] Some IRPE indicator loads failed:', failed);
        }
        this.regionAllDataList = loaded;

        const {
          regionsList,
          extraDimension,
          extraOptions,
          defaultExtraValue,
        } = extractRegionsAndExtra(this.primaryRegionData);

        this.regionsList = regionsList;
        this.regionExtraDimension = extraDimension;
        this.regionExtraOptions = extraOptions;
        this.selectedExtraValue = defaultExtraValue;
      } catch (e) {
        this.regionsError = e.message || "Impossible de charger la liste des régions.";
        this.regionsList = [];
        this.clearRegionalState();
      }
    },
    onRegionChange() {
      this.regionalError = null;
      this.regionalChartData = null;
      if (!this.selectedRegionCode) return;
      if (!this.regionAllDataList.length) return;
      this.regionalLoading = true;
      this.updateRegionalChartData();
      this.regionalLoading = false;
    },
    onExtraDimensionChange() {
      if (!this.selectedRegionCode || !this.regionAllDataList.length) return;
      this.updateRegionalChartData();
    },
    updateRegionalChartData() {
      if (!this.regionAllDataList.length || !this.selectedRegionCode) return;
      const sources = this.regionAllDataList.map(({ data }) => ({ regionAllData: data }));
      this.regionalChartData = buildStackedRegionalSeries(
        sources,
        this.selectedRegionCode,
        this.selectedExtraValue
      );
    },
    onToggleFavori() {
      if (this.dataObj && this.dataObj.label_indic) {
        this.estFavori = toggleFavori(this.dataObj.label_indic);
        this.$emit('favori-changed', {
          labelIndic: this.dataObj.label_indic,
          estFavori: this.estFavori,
        });
      }
    },
    // Fonction pour afficher le graphique ou le tableau
    handleChartSelected(type) {
      this.displayChart = type === "graphique" ? true : false;
    },
    getFilename() {
      const safe = (this.dataObj.label_indic || "indicateur")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/gi, "")
        .replace(/\s+/g, "_")
        .trim() || "indicateur";
      return `${safe}_data.csv`;
    },
    triggerDownload() {
      const csv = this.downloadCsvContent();
      if (!csv) return;
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = this.getFilename();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    downloadCsvContent() {
      const d = this.displayData;
      try {
        if (!Array.isArray(d.label_sous_groupe) || d.label_sous_groupe === "") {
          const headers = ["Année", `Valeur - ${d.label_unit}`, "Type"];
          let csv = headers.join(";") + "\n";
          const xValues = this.tableAnnee;
          const ytab = this.tableValeur;
          const typeLabels = this.tableTypeMesure;
          if (xValues.length && ytab.length) {
            for (let i = 0; i < xValues.length; i++) {
              csv += [xValues[i], ytab[i], typeLabels[i] || "Mesuré"].join(";") + "\n";
            }
          }
          return csv;
        }
        const headers = ["Année", ...d.label_sous_groupe.map((g) => `${g} - ${d.label_unit}`)];
        let csv = headers.join(";") + "\n";
        if (d.date && d.values) {
          for (let i = 0; i < d.date[0].length; i++) {
            csv += [d.date[0][i], ...d.values.map((col) => col[i])].join(";") + "\n";
          }
        }
        return csv;
      } catch (e) {
        console.error("Erreur création CSV:", e);
        return null;
      }
    },

  },
  mounted() {
    if (this.hasRegionalData) this.loadRegions();
    // Initialiser l'état favori
    if (this.dataObj && this.dataObj.label_indic) {
      this.estFavori = isFavori(this.dataObj.label_indic);
    }
  },
};
</script>

<style scoped>
.favori-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  margin-left: 0.5rem;
  color: var(--text-mention-grey, #666);
  transition: color 0.2s ease;
  flex-shrink: 0;
  line-height: 1;
}
.favori-btn:hover {
  color: var(--text-action-high-blue-france, #000091);
}
.favori-btn--active {
  color: #e1000f;
}
.favori-btn--active:hover {
  color: #c00;
}
.fontSizeDescription {
  font-size: 12px;
}
.accordion-box {
  padding-bottom: 1rem !important;
}
.adjust-height {
  height: auto !important;
  z-index: inherit;
}
.graph-box-card--iframe {
  padding: 0 !important;
}
.graph-box-card--compact {
  border: 1px solid #d6d6d6;
  box-shadow: 0 8px 24px rgba(0, 0, 145, 0.08);
  overflow: hidden;
}
/* Commentaire : tronqué par nombre de mots avec Voir plus */
.graph-box-commentaire {
  padding: 0.5rem 1rem;
}
.graph-box-commentaire__text {
  line-height: 1.4;
  white-space: pre-line;
}
.graph-box-commentaire__voir-plus {
  font-size: inherit;
  padding: 0;
  margin-left: 0.25em;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-action-high-blue-france, #000091);
  text-decoration: underline;
}
.graph-box-commentaire__voir-plus:hover {
  color: var(--text-action-high-blue-france-hover, #1212ff);
}
.graph-box-metadata {
  padding: 0 1rem 0.75rem;
}
.graph-box-metadata :deep(.taxonomy-tags-card) {
  margin: 0;
}
.graph-box-metadata :deep(.fr-tags-group) {
  margin: 0;
}
.graph-box-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem 1rem;
  padding: 0.375rem 1rem;
}
.graph-box-toolbar__segmented {
  flex-shrink: 0;
}
.graph-box-toolbar-unit {
  margin-bottom: 0;
  text-align: right;
  flex: 1 1 auto;
  min-width: 12rem;
}
.graph-box-download-row {
  padding: 0.5rem 1rem;
}
.graph-box-footer {
  padding: 0.375rem 1rem 0.5rem;
}
.graph-box-footer-meta {
  margin-bottom: 0;
}
.titleBox {
  padding: 0.375rem 1rem 0.25rem;
  margin-top: 0.25rem;
}
.graph-box-title-row {
  align-items: flex-start;
}
.graph-box-title-row .favori-btn {
  margin-top: -2px;
}
.cardTitle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bolder;
  margin-bottom: 0.35rem;
  font-size: 1.25rem;
  line-height: 1.3;
}
/* Mobile-specific adjustments */
@media (max-width: 768px) {
  .cardTitle {
    font-size: 1.2rem;
    line-height: 1.22;
  }
}

.cardData {
  padding-top: 1rem;
  padding-left: 0.5rem;
  padding-right: 1.5rem;
  padding-bottom: 0.375rem;
  max-width: 100%;
}
.cardFooter {
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
}
.cardFooter > .cardFooter-button {
  display: flex;
  justify-content: flex-end;
  column-gap: 0.5rem;
}
.cardFooter > .cardFooter-tags {
  display: flex;
  justify-content: flex-start;
  column-gap: 1em;
}
p.cardDescription {
  font-size: 1rem;
  line-height: 1.25rem;
  font-weight: 400;
  text-align: justify;
  text-justify: inter-word;
  white-space: pre-line;
  margin-bottom: 1rem;
  color: black;
}

.unit-short {
  margin-bottom: 0rem !important;
}
p.textReference {
  margin-bottom: 0rem;
  font-weight: 400;
}
.graph-box-card--compact .graph-box-footer {
  padding: 0.5rem 1rem;
}
.graph-box-card--compact .graph-box-toolbar {
  padding: 0.375rem 1rem 0.25rem;
}
.graph-box-card--compact .graph-box-download-row {
  padding: 0.45rem 1rem;
}
.graph-box-card--compact .titleBox {
  padding: 0.75rem 1rem 0.5rem;
  margin-top: 0;
}
.graph-box-card--compact .cardTitle {
  margin-bottom: 0.2rem;
  font-size: 1.125rem;
  line-height: 1.5;
}
.graph-box-card--compact .cardData {
  padding-top: 0.75rem;
  padding-right: 1rem;
  padding-bottom: 0.35rem;
}
.graph-box-download-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: none;
  padding: 0;
  margin-right: 0;
  font-size: 0.75rem;
  font-family: inherit;
  color: var(--text-action-high-blue-france, #000091);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.graph-box-download-btn:hover {
  color: var(--text-action-high-blue-france-hover, #1212ff);
}

.graph-box-download-btn .fr-icon-download-line {
  display: inline-block;
  margin: 0;
  padding: 0;
  margin-right: -0.25rem;
  transform: scale(0.7);
  transform-origin: center center;
}

.graph-box-card--compact .graph-box-download-btn {
  font-size: 0.75rem;
}
.fr-collapse {
  height: 0rem !important;
}
/* Add iframe-specific styles */
:deep(.cardData) {
  padding: v-bind('isIframe ? "0" : "1rem 0.75rem 0.375rem 0.5rem"') !important;
}

/* Accordion collapse height fix */
:deep(.fr-collapse:not(.fr-collapse--expanded)) {
  padding: 0 !important;
}

:deep(.fr-collapse.fr-collapse--expanded) {
  height: auto !important;
  overflow: visible !important;
}
</style>
