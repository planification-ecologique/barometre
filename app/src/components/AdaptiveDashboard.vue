<!-- adaptiveDashboard.vue -->
<!-- This component is used to display the dashboard of the application. It is used in the DashboardPage.vue component. -->
<template>
  <div>
    <div class="fr-grid-row" v-if="dashboardPage">
      <article class="fr-col-12" style="display: flex; align-items: center">
        <!-- Affichage de l'image en fonction du thème ou secteur -->
        <div class="sector-logo-container">
          <!-- Use SectorIcon if sector is available, otherwise fallback to legacy theme-based logic -->
          <SectorIcon
            v-if="params.sector"
            :sector="params.sector"
            height="100px"
            width="100px"
          />
          <!-- Legacy theme-based icons for backward compatibility -->
          <template v-else>
            <EnvironnementImg
              height="100px"
              width="100px"
              v-if="params.label_theme === 'Transverse'"
            ></EnvironnementImg>
            <EauImg
              height="120px"
              width="100px"
              v-if="params.label_theme === 'Eau'"
            ></EauImg>
          </template>
        </div>
        <!-- Titre : thème et Sous-titre : levier -->
        <div>
          <h1 class="fr-title" :aria-label="pageTitle">
            {{ pageTitle }}
          </h1>
          <h4 class="fr-subtitle" v-if="params.label_levier">{{ params.label_levier }}</h4>
        </div>
      </article>
    </div>
    <!-- Affichage en tableau des indicateurs -->
    <div v-if="gridFormat.length > 0">
      <!-- Itération sur chaque ligne pour ajouter le/les indicateurs -->
      <div
        v-for="(row, index) in gridFormat"
        :key="index"
        class="fr-grid-row fr-grid-row--gutters fr-mb-1w"
      >
        <!-- Itération sur chaque colonne pour ajouter le/les indicateurs -->
        <div
          v-for="(item, columnIndex) in row"
          :key="columnIndex"
          class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12"
        >
          <!-- Affichage de l'indicateur -->
          <article>
            <div v-if="!item"></div>
            <div v-else>
              <graph-box
                :dataObj="item"
                :idAccordion="'accordion-' + index + columnIndex"
                :titre="item.label_indic"
                :key="item.label_indic + '-' + index + columnIndex"
              ></graph-box>
            </div>
          </article>
        </div>
      </div>
    </div>
    <!-- Affichage si pas de données -> taille du tableau égale à 0 -->
    <div v-else>
      <p>Pas de données en cours...</p>
    </div>
  </div>
</template>

<script>
import GraphBox from "../components/GraphBox.vue";
import SectorIcon from "./SectorIcon.vue";
import EnvironnementImg from "../components/components_sgv/EnvironnementImg.vue";
import FranceImg from "../components/components_sgv/FranceImg.vue";
import EauImg from "../components/components_sgv/EauImg.vue";
export default {
  name: "AdaptiveDashboard",
  components: {
    GraphBox,
    SectorIcon,
    EnvironnementImg,
    FranceImg,
    EauImg,
  },
  computed: {
    pageTitle() {
      const p = this.params || {};
      return p.label || p.label_theme || p.sector || '';
    },
  },
  data() {
    return {
      gridFormat: [],
      link: `../images/${this.params.label_theme}.png`,
    };
  },
  props: {
    inputData: {
      type: Array,
      required: true,
    },
    params: {
      type: Object,
    },
    dashboardPage: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    // Fonction pour formater les indicateurs en grille
    grid(ls_indicateurs) {
      const numRows = Math.ceil(ls_indicateurs.length / 2) || 1;
      const numCols = 2;

      const grid = Array.from({ length: numRows }, () =>
        Array(numCols).fill(null)
      );

      ls_indicateurs.forEach((item, index) => {
        const row = Math.floor(index / numCols);
        const col = index % numCols;
        grid[row][col] = item;
      });

      if (ls_indicateurs.length % 2 === 1) {
        const lastRowIndex = numRows - 1;
        grid[lastRowIndex][numCols - 1] = null;
      }

      return grid;
    },
  },
  watch: {
    // Watcher pour mettre à jour la grille d'indicateurs
    inputData: {
      handler(API_data) {
        this.gridFormat = this.grid(API_data);
      },
      immediate: true, // Call the handler immediately
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
}
.img {
  width: 5%;
  height: 5%;
}
</style>
