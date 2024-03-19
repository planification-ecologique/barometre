<!-- adaptiveDashboard.vue -->
<template>
  <div id="fr-container">
    <div class="fr-grid-row fr-grid-row--center" v-if="dashboardPage">
      <div class="fr-col-12" style="">
        <div>
          <EnvironnementImg height="100px" width="100px" v-if="params.label_theme === 'Transverse'"></EnvironnementImg>
          <BatimentImg height="100px" width="100px" v-if="params.label_theme === 'Bâtiments'"></BatimentImg>
          <TransportImg height="100px" width="100px" v-if="params.label_theme === 'Transports'"></TransportImg>
          <AgricultureImg height="120px" width="100px" v-if="params.label_theme === 'Agriculture-Alimentation'"></AgricultureImg>
          <EcosystemeImg height="120px" width="100px" v-if="params.label_theme === 'Ecosystèmes'"></EcosystemeImg>
          <EauImg height="120px" width="100px" v-if="params.label_theme === 'Eau'"></EauImg>
          <IndustrieImg height="120px" width="100px" v-if="params.label_theme === 'Industrie'"></IndustrieImg>
          <EconomieImg height="120px" width="100px" v-if="params.label_theme === 'Economie circulaire'"></EconomieImg>
          <EnergieImg height="120px" width="100px" v-if="params.label_theme === 'Energie'"></EnergieImg>
        </div>
        <div>
          <h1 class="fr-title" :aria-label="params.label_theme">{{ params.label_theme }}</h1>
          <h4 class="fr-subtitle">{{ params.label_levier }}</h4>
        </div>
      </div>
    </div>
    <div v-if="gridFormat.length > 0">
      <div v-for="(row, index) in gridFormat" :key="index" class="fr-grid-row fr-grid-row--gutters fr-mb-1w">
        <div v-for="(item, columnIndex) in row" :key="columnIndex" class="fr-col">
          <div v-if="!item"></div>
          <div v-else>
 <graph-box :dataObj="item" :idAccordion="'accordion-'+ index+columnIndex" :titre="item.label_indic"></graph-box>

          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <p>Pas de données en cours...</p>
    </div>
  </div>
</template>

<script>
import GraphBox from '../components/GraphBox.vue'
import EnvironnementImg from '../components/components_sgv/EnvironnementImg.vue'
import FranceImg from '../components/components_sgv/FranceImg.vue'
import BatimentImg from '../components/components_sgv/BatimentImg.vue'
import TransportImg from '../components/components_sgv/TransportImg.vue'
import AgricultureImg from '../components/components_sgv/AgricultureImg.vue'
import EcosystemeImg from '../components/components_sgv/EcosystemeImg.vue'
import EauImg from '../components/components_sgv/EauImg.vue'
import IndustrieImg from '../components/components_sgv/IndustrieImg.vue'
import EconomieImg from '../components/components_sgv/EconomieImg.vue'
import EnergieImg from '../components/components_sgv/EnergieImg.vue'

export default {
  name: 'AdaptiveDashboard',
  components: {
    GraphBox,
    EnvironnementImg,
    FranceImg,
    BatimentImg,
    TransportImg,
    AgricultureImg,
    EcosystemeImg,
    EauImg,
    IndustrieImg,
    EconomieImg,
    EnergieImg,
  },
  data() {
    return {
      gridFormat: [],
      link: `../images/${this.params.label_theme}.png`
    }
  },
  props: {
    inputData: {
      type: Array,
      required: true
    },
    params: {
      type: Object,
    },
    dashboardPage: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    grid(ls_indicateurs) {
      const numRows = Math.ceil(ls_indicateurs.length / 2) || 1;
      const numCols = 2;

      const grid = Array.from({ length: numRows }, () => Array(numCols).fill(null));

      ls_indicateurs.forEach((item, index) => {
        const row = Math.floor(index / numCols);
        const col = index % numCols;
        grid[row][col] = item
      });

      if (ls_indicateurs.length % 2 === 1) {
        const lastRowIndex = numRows - 1;
        grid[lastRowIndex][numCols - 1] = null;
      }

      return grid;
    },
  },
  watch: {
    inputData: {
      handler(API_data) {
        this.gridFormat = this.grid(API_data);
      },
      immediate: true // Call the handler immediately
    }
  },
}
</script>

<style scoped lang="scss">
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
