<!-- Composant graphique principale dans chaque indicateur -->

<template>
  <div
    :class="[
      'fr-card',
      'fr-card--no-icon',
      'fr-card--shadow',
      'adjust-height',
      'graph-box-card',
      { 'graph-box-card--compact': compact }
    ]"
    v-if="dataObj"
  >
    <div class="titleBox graph-box-header">
      <div class="fr-grid-row fr-grid-row--middle">
        <h2 class="cardTitle graph-box-title fr-col">{{ displayData.label_indic }}</h2>
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
      <!-- <TableComponent :captionTitle="dataObj.label_indic" /> -->
      <div class="fr-text--xs fr-text--bold cardObjectif" v-if="cible && !selectedRegionCode">
        <p class="fr-text--xs fr-text--regular fr-unit">Cible :</p>
        <p
          class="fr-badge fr-badge-sm fr-badge--green-emeraude fr-badge--no-icon fr-pr-1w"
        >
          {{ cible }}
        </p>
        <p class="fr-text--xs fr-text--regular fr-unit">
          {{ displayData.label_unit }}
        </p>
      </div>
      <div v-else>
        <p class="fr-text--xs fr-text--regular fr-unit">
          Unité : {{ displayData.label_unit }}
        </p>
      </div>
    </div>

    <div class="cardReference graph-box-controls">
      <!-- Sélection du type de graphique (Graphique ou Tableau) -->
      <segmented-controls
        @chart-selected="handleChartSelected"
        :idcontrol="idAccordion + '1'"
      ></segmented-controls>
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
          >
          </bar-chart>
        </div>
        <div v-else-if="effectiveChartType === 'Barres empilées' && !selectedRegionCode">
          <!-- Composant Histogramme avec sous-groupe / DSFR (national only) -->
          <bar-chart
            :x="JSON.stringify(displayData.date)"
            :y="JSON.stringify(displayData.values)"
            :aspectratio="2"
            :stacked="true"
            :name="JSON.stringify(displayData.label_sous_groupe)"
            :pointopacity="pointOpacityJson"
            :trendline="stackedTrendLine ? JSON.stringify(stackedTrendLine) : undefined"
            :target-trajectory="stackedTargetTrajectory ? JSON.stringify(stackedTargetTrajectory) : undefined"
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
            :isSmall="true"
            :pointopacity="pointOpacityJson"
          >
          </multi-line-chart>
        </div>
      </div>
      <!-- Affichage du tableau -->
      <div v-else>
        <div v-if="displayData.label_sous_groupe == '' || selectedRegionCode">
          <!-- Tableau sans sous-groupe (ou données régionales) -->
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
    <!-- Affichage des informations complémentaires sous le graphique -->
    <div class="beneathGraph graph-box-resources fr-grid-row">
      <!-- Split la carte en deux colonnes"> -->
      <div class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12">
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
        <p v-if="dataObj.label_perimetre" class="fr-text--xs fr-text-mention--grey textReference">
          Périmètre : {{ dataObj.label_perimetre }}
        </p>
      </div>
      <div class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12">
        <a
          class="fr-link fr-link--download fr-link--download-text"
          :id="downloadLinkId"
          :href="downloadUrl"
          :download="getFilename()"
        >
          Télécharger les données
          <span class="fr-link__detail">CSV – 1 ko</span>
        </a>
      </div>
    </div>
    <!-- Gestion du dropdown description -->
    <div class="fr-accordion graph-box-comments">
      <h3 class="fr-accordion__title">
        <button
          class="fr-accordion__btn fr-text--xs"
          :aria-expanded="isAccordionOpen ? 'true' : 'false'"
          :aria-controls="idAccordion"
          title="Commentaires sur l'indicateur"
        >
          Commentaires sur l'indicateur
        </button>
      </h3>
      <div
        class="fr-collapse accordion-box"
        :id="idAccordion"
        :class="{ 'fr-collapse--expanded': isAccordionOpen }"
      >
        <p
          v-if="dataObj.label_description && dataObj.label_description !== ''"
          class="fr-text--s cardDescription fr-ml-1w fr-mr-1w fontSizeDescription"
          v-html="dataObj.label_description"
        ></p>
        <p class="fr-text--xs cardDescription fr-ml-1w fr-mr-1w fontSizeDescription">
          <i>Dernière mise à jour de l'indicateur : {{ formattedDateMaj }}</i>
        </p>

        <div class="fr-ml-1w" v-if="dataObj.label_tags">
          <tags-card :tagsIndicateurs="dataObj.label_tags"></tags-card>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import BarChart from "./components_dsfr/BarChart.vue";
import MultiLineChart from "./components_dsfr/MultiLineChart.vue";
import LineChart from "./components_dsfr/LineChart.vue";
import SegmentedControls from "./SegmentedControls.vue";
import tagsCard from "./TagsCard.vue";
import TableComponent from "./TableComponent.vue";
import TableComponentVariant from "./TableComponentVariant.vue";
import { loadAllRegionsDataForIndicator } from "@/services/ecolabApiService.js";
import {
  extractRegionsAndExtra,
  buildRegionalSeries,
} from "@/services/ecolabRegionHelpers.js";

export default {
  name: "GraphBox",
  components: {
    BarChart,
    SegmentedControls,
    tagsCard,
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
    }
  },
  data() {
    return {
      displayChart: false,
      isAccordionOpen: false,
      cible: undefined,
      regionsList: [],
      selectedRegionCode: "",
      regionalChartData: null,
      regionalLoading: false,
      regionalError: null,
      regionsError: null,
      regionAllData: null,
      regionExtraDimension: null,
      regionExtraOptions: [],
      selectedExtraValue: "",
    };
  },
  watch: {
    dataObj: function () {
      this.set_goal();
      this.selectedRegionCode = "";
      this.regionalChartData = null;
      this.regionalError = null;
      this.regionAllData = null;
      this.regionExtraDimension = null;
      this.regionExtraOptions = [];
      this.selectedExtraValue = "";
      if (this.hasRegionalData) this.loadRegions();
    },
  },
  computed: {
    hasRegionalData() {
      const ids = this.dataObj?.irpe_ids;
      return Array.isArray(ids) && ids.length > 0 && ids.some(id => id && String(id).trim() !== '');
    },
    regionalIndicatorId() {
      const ids = this.dataObj?.irpe_ids;
      if (!Array.isArray(ids) || ids.length === 0) return '';
      return String(ids[0]).trim();
    },
    /** Data to display: national (dataObj) or overridden by regional API data */
    displayData() {
      if (this.selectedRegionCode && this.regionalChartData) {
        const v = this.regionalChartData;
        const metaUnit = this.regionAllData?.measureMeta?.unite || this.dataObj.label_unit;
        const metaLabel =
          this.regionAllData?.measureMeta?.libelle_indicateur || this.dataObj.label_indic;
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
    chartValues() {
      if (this.selectedRegionCode && this.regionalChartData) {
        const v = this.regionalChartData;
        return {
          x: [v.x],
          y: v.y,
          legend: v.legend,
          colors: ['brown-cafe-creme']
        };
      }
      return this.displayData.values || null;
    },
    effectiveChartType() {
      if (this.selectedRegionCode && this.regionalChartData) return "Barres simple";
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
      if (this.selectedRegionCode && this.regionalChartData) {
        const len = this.regionalChartData.y?.[0]?.length || 0;
        return JSON.stringify(Array(len).fill(1));
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
      if (!this.hasRegionalData || !this.regionalIndicatorId) return;
      this.regionsError = null;
      this.regionAllData = null;
      this.regionExtraDimension = null;
      this.regionExtraOptions = [];
      this.selectedExtraValue = "";
      try {
        const result = await loadAllRegionsDataForIndicator(
          this.regionalIndicatorId
        );
        this.regionAllData = result;

        const {
          regionsList,
          extraDimension,
          extraOptions,
          defaultExtraValue,
        } = extractRegionsAndExtra(result);

        this.regionsList = regionsList;
        this.regionExtraDimension = extraDimension;
        this.regionExtraOptions = extraOptions;
        this.selectedExtraValue = defaultExtraValue;
      } catch (e) {
        this.regionsError = e.message || "Impossible de charger la liste des régions.";
        this.regionsList = [];
        this.regionAllData = null;
        this.regionExtraDimension = null;
        this.regionExtraOptions = [];
        this.selectedExtraValue = "";
      }
    },
    onRegionChange() {
      this.regionalError = null;
      this.regionalChartData = null;
      if (!this.selectedRegionCode) return;
      if (!this.regionAllData) return;
      this.regionalLoading = true;
      try {
        this.updateRegionalChartData();
      } catch (e) {
        this.regionalError = e.message || "Impossible de charger les données régionales.";
      } finally {
        this.regionalLoading = false;
      }
    },
    onExtraDimensionChange() {
      if (!this.selectedRegionCode || !this.regionAllData) return;
      this.updateRegionalChartData();
    },
    updateRegionalChartData() {
      if (!this.regionAllData || !this.selectedRegionCode) return;
      const series = buildRegionalSeries(
        this.regionAllData,
        this.selectedRegionCode,
        this.selectedExtraValue
      );
      this.regionalChartData = series;
    },
    // Fonction pour afficher le graphique ou le tableau
    handleChartSelected(type) {
      this.displayChart = type === "graphique" ? true : false;
    },
    getFilename() {
      return `${this.dataObj.label_indic.replace(/[^\w\s]/gi, "")}_data.csv`;
    },

    set_goal() {
      try {
        // Calcul de la cible
        if (
          this.dataObj.label_sous_groupe == undefined ||
          this.dataObj.label_sous_groupe == ""
        ) {
          let index = this.dataObj.values.legend.indexOf("Cible");
          index != -1
            ? (this.cible =
                this.dataObj.values.y[index][
                  this.dataObj.values.y[index].length - 1
                ])
            : (this.cible = undefined);
        } else {
          this.cible = undefined;
        }
      } catch (error) {
        console.log("Erreur dans la cible", error);
      }
    },
  },
  mounted() {
    this.set_goal();
    if (this.hasRegionalData) this.loadRegions();
    // Set accordion to closed by default in iframe mode
    if (this.isIframe) {
      this.isAccordionOpen = false;
    }
  },
};
</script>

<style scoped>
.fontSizeDescription {
  font-size: 12px;
}
.fr-unit {
  margin-bottom: 0rem !important;
}
.accordion-box {
  padding-bottom: 1rem !important;
}
.adjust-height {
  height: auto !important;
  z-index: inherit;
}
.graph-box-card--compact {
  border: 1px solid #d6d6d6;
  box-shadow: 0 8px 24px rgba(0, 0, 145, 0.08);
  overflow: hidden;
}
.beneathGraph {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #dddddd;
  border-top: 1px solid #dddddd;
  /* display: block; */
  justify-content: space-around;
}
.cardReference {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #dddddd;
  border-top: 1px solid #dddddd;
  display: flex;
  justify-content: space-between;
}
.titleBox {
  padding: 0.5rem 1rem;
  margin-top: 0.5rem;
}
.cardTitle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bolder;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}
/* Mobile-specific adjustments */
@media (max-width: 768px) {
  .cardTitle {
    font-size: 1.2rem;
    line-height: 1.1;
  }
}

.cardData {
  padding-top: 1.5rem;
  padding-left: 0.75rem;
  padding-right: 1.5rem;
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
.cardObjectif {
  display: flex;
  justify-content: flex-start;
  font-size: 0.75rem;
  align-items: center;
  column-gap: 0.5rem;
  margin-bottom: 0rem;
}
p.textReference {
  margin-bottom: 0rem;
  font-weight: 400;
}
.fr-link--download-text {
  font-size: small !important;
  /* align-items: flex-end !important; */
}
.graph-box-card--compact .beneathGraph {
  padding: 0.75rem 1rem;
}
.graph-box-card--compact .cardReference {
  padding: 0.5rem 1rem 0.375rem;
}
.graph-box-card--compact .titleBox {
  padding: 1rem 1rem 0.75rem;
  margin-top: 0;
}
.graph-box-card--compact .cardTitle {
  margin-bottom: 0.25rem;
  font-size: 1.125rem;
  line-height: 1.4;
}
.graph-box-card--compact .cardData {
  padding-top: 1rem;
  padding-right: 1rem;
}
.graph-box-card--compact .cardObjectif {
  flex-wrap: wrap;
}
.graph-box-card--compact .fr-link--download-text {
  font-size: 0.875rem !important;
}
.fr-collapse {
  height: 0rem !important;
}
/* Add iframe-specific styles */
:deep(.fr-card) {
  padding: v-bind('isIframe ? "0" : "1rem"') !important;
}
:deep(.cardData) {
  padding: v-bind('isIframe ? "0" : "1.5rem 0.75rem 0 1.5rem"') !important;
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
