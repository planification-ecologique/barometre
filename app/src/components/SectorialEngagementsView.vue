<template>
  <div>
    <!-- Sector title and image -->
    <div class="fr-grid-row">
      <article class="fr-col-12" style="display: flex; align-items: center">
        <div class="sector-logo-container">
          <EnvironnementImg
            height="100px"
            width="100px"
            v-if="sector === 'Général' || sector === 'Transverse'"
          ></EnvironnementImg>
          <BatimentImg
            height="100px"
            width="100px"
            v-if="sector === 'Bâtiment'"
          ></BatimentImg>
          <TransportImg
            height="100px"
            width="100px"
            v-if="sector === 'Transports'"
          ></TransportImg>
          <AgricultureImg
            height="120px"
            width="100px"
            v-if="sector === 'Agriculture - Alimentation'"
          ></AgricultureImg>
          <IndustrieImg
            height="120px"
            width="100px"
            v-if="sector === 'Industrie'"
          ></IndustrieImg>
          <EnergieImg
            height="120px"
            width="100px"
            v-if="sector === 'Énergie' || sector === 'Energie'"
          ></EnergieImg>
          <EconomieImg
            height="120px"
            width="100px"
            v-if="sector === 'Déchets' || sector === 'Economie Circulaire'"
          ></EconomieImg>
          <EcosystemeImg
            height="120px"
            width="100px"
            v-if="sector === 'Terres & forêts'"
          ></EcosystemeImg>
        </div>
        <div>
          <h1 class="fr-title">{{ sector }}</h1>
          <h2 class="fr-subtitle">Nos Engagements</h2>
        </div>
      </article>
    </div>
    
    <!-- Engagements for this sector -->
    <div v-if="engagementsData.length > 0" class="fr-mt-5w">
      <div class="fr-grid-row fr-grid-row--gutters">
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
    
    <!-- No data message -->
    <div v-if="engagementsData.length === 0" class="fr-mt-5w">
      <p>Pas de données disponibles pour les engagements de ce secteur.</p>
    </div>
  </div>
</template>

<script>
import GraphBox from "./GraphBox.vue";
import TransportImg from "./components_sgv/TransportImg.vue";
import BatimentImg from "./components_sgv/BatimentImg.vue";
import AgricultureImg from "./components_sgv/AgricultureImg.vue";
import IndustrieImg from "./components_sgv/IndustrieImg.vue";
import EnergieImg from "./components_sgv/EnergieImg.vue";
import EconomieImg from "./components_sgv/EconomieImg.vue";
import EnvironnementImg from "./components_sgv/EnvironnementImg.vue";
import EcosystemeImg from "./components_sgv/EcosystemeImg.vue";

export default {
  name: "SectorialEngagementsView",
  components: {
    GraphBox,
    TransportImg,
    BatimentImg,
    AgricultureImg,
    IndustrieImg,
    EnergieImg,
    EconomieImg,
    EnvironnementImg,
    EcosystemeImg,
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
      sector: 'Général',
    };
  },
  watch: {
    inputData: {
      handler(newData) {
        this.engagementsData = newData || [];
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
</style>
